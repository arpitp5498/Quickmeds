const LabTest = require('../models/LabTest');
const LabBooking = require('../models/LabBooking');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { sendNotification } = require('../services/notificationService');

// @desc    Get lab tests with search, filter, pagination
// @route   GET /api/lab-tests
// @access  Public
exports.getLabTests = async (req, res, next) => {
  try {
    const { category, popular, search, sortBy, page = 1, limit = 20 } = req.query;
    const query = { isActive: true };

    if (category) {
      query.category = category;
    }
    if (popular === 'true') {
      query.isPopular = true;
    }
    if (search) {
      const s = new RegExp(search.trim(), 'i');
      query.$or = [{ name: s }, { description: s }, { category: s }];
    }

    let sortOption = { isPopular: -1, name: 1 };
    if (sortBy === 'price_asc') sortOption = { price: 1 };
    if (sortBy === 'price_desc') sortOption = { price: -1 };

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await LabTest.countDocuments(query);
    const tests = await LabTest.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit, 10));

    return ApiResponse.success(res, {
      tests,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get lab test categories with counts
// @route   GET /api/lab-tests/categories
// @access  Public
exports.getLabTestCategories = async (req, res, next) => {
  try {
    const categories = await LabTest.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    return ApiResponse.success(res, categories);
  } catch (error) {
    next(error);
  }
};

// @desc    Get lab test by ID
// @route   GET /api/lab-tests/:id
// @access  Public
exports.getLabTestById = async (req, res, next) => {
  try {
    const test = await LabTest.findById(req.params.id);
    if (!test) {
      throw ApiError.notFound('Lab test not found');
    }
    return ApiResponse.success(res, test);
  } catch (error) {
    next(error);
  }
};

// @desc    Create lab booking
// @route   POST /api/lab-tests/bookings
// @access  Private (CUSTOMER)
exports.createLabBooking = async (req, res, next) => {
  try {
    const { tests, scheduledDate, scheduledSlot, address, referredBy, patientDetails } = req.body;

    if (!tests || tests.length === 0) {
      throw ApiError.badRequest('No tests selected');
    }

    let totalAmount = 0;
    const testDetails = [];

    for (const item of tests) {
      const test = await LabTest.findById(item.testId);
      if (test) {
        testDetails.push({
          testId: test._id,
          name: test.name,
          price: test.price
        });
        totalAmount += test.price;
      }
    }

    if (testDetails.length === 0) {
      throw ApiError.badRequest('No valid tests found');
    }

    const collectionOTP = Math.floor(1000 + Math.random() * 9000).toString();

    const booking = await LabBooking.create({
      customerId: req.user._id,
      tests: testDetails,
      scheduledDate,
      scheduledSlot,
      address,
      totalAmount,
      collectionOTP,
      referredBy: referredBy || {},
      patientDetails: patientDetails || { name: req.user.name },
      statusHistory: [
        {
          status: 'BOOKED',
          timestamp: new Date(),
          note: 'Lab test booking created',
          updatedBy: req.user._id
        }
      ]
    });

    await sendNotification({
      userId: req.user._id,
      type: 'LAB_BOOKED',
      title: 'Lab Test Booked Successfully! 🧪',
      message: `Your ${testDetails.length} test(s) have been booked for ${new Date(scheduledDate).toLocaleDateString()} (${scheduledSlot}). Booking #${booking.bookingNumber}`,
      link: `/lab-tests`
    });

    return ApiResponse.created(res, booking, 'Lab test booked successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get my lab bookings
// @route   GET /api/lab-tests/bookings/my
// @access  Private (CUSTOMER)
exports.getMyLabBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { customerId: req.user._id };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await LabBooking.countDocuments(query);
    const bookings = await LabBooking.find(query)
      .populate('tests.testId')
      .populate('referredBy.doctorId', 'name specialty')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return ApiResponse.success(res, {
      bookings,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get lab booking by ID
// @route   GET /api/lab-tests/bookings/:id
// @access  Private (CUSTOMER, ADMIN)
exports.getLabBookingById = async (req, res, next) => {
  try {
    const booking = await LabBooking.findById(req.params.id)
      .populate('tests.testId')
      .populate('customerId', 'name email phone')
      .populate('referredBy.doctorId', 'name specialty');

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    // CUSTOMER can only see their own
    if (req.user.role === 'CUSTOMER' && booking.customerId._id.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('You can only view your own bookings');
    }

    return ApiResponse.success(res, booking);
  } catch (error) {
    next(error);
  }
};

// @desc    Update lab booking status
// @route   PUT /api/lab-tests/bookings/:id/status
// @access  Private (ADMIN)
exports.updateLabBookingStatus = async (req, res, next) => {
  try {
    const { status, reportUrl, phlebotomistName } = req.body;
    const booking = await LabBooking.findById(req.params.id);

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    booking.status = status;
    if (reportUrl) {
      booking.reportUrl = reportUrl;
    }
    if (phlebotomistName) {
      booking.phlebotomistName = phlebotomistName;
    }

    booking.statusHistory.push({
      status,
      timestamp: new Date(),
      note: `Status updated to ${status}`,
      updatedBy: req.user._id
    });

    await booking.save();

    // Send status-specific notifications
    const notifMap = {
      SAMPLE_COLLECTED: {
        type: 'LAB_SAMPLE_COLLECTED',
        title: 'Sample Collected ✅',
        message: `Your sample has been collected by ${phlebotomistName || 'our phlebotomist'}. It will now be processed.`
      },
      PROCESSING: {
        type: 'SYSTEM_ALERT',
        title: 'Sample Being Processed',
        message: 'Your lab sample is being analyzed. Report will be ready soon.'
      },
      REPORT_READY: {
        type: 'LAB_REPORT_READY',
        title: 'Lab Report Ready! 📋',
        message: `Your lab test report is ready. Booking #${booking.bookingNumber}`
      },
      CANCELLED: {
        type: 'LAB_CANCELLED',
        title: 'Lab Booking Cancelled',
        message: `Your lab booking #${booking.bookingNumber} has been cancelled.`
      }
    };

    if (notifMap[status]) {
      await sendNotification({
        userId: booking.customerId,
        ...notifMap[status],
        link: `/lab-tests`
      });
    }

    return ApiResponse.success(res, booking, 'Lab booking status updated');
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel lab booking
// @route   POST /api/lab-tests/bookings/:id/cancel
// @access  Private (CUSTOMER)
exports.cancelLabBooking = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const booking = await LabBooking.findById(req.params.id);

    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }
    if (booking.customerId.toString() !== req.user._id.toString()) {
      throw ApiError.forbidden('You can only cancel your own bookings');
    }
    if (booking.status === 'REPORT_READY' || booking.status === 'CANCELLED') {
      throw ApiError.badRequest(`Cannot cancel a booking with status: ${booking.status}`);
    }

    booking.status = 'CANCELLED';
    booking.cancellationReason = reason || 'Cancelled by customer';
    if (booking.paymentStatus === 'PAID') {
      booking.paymentStatus = 'REFUNDED';
    }
    booking.statusHistory.push({
      status: 'CANCELLED',
      timestamp: new Date(),
      note: `Cancelled by customer: ${reason || 'No reason provided'}`,
      updatedBy: req.user._id
    });
    await booking.save();

    await sendNotification({
      userId: req.user._id,
      type: 'LAB_CANCELLED',
      title: 'Lab Booking Cancelled',
      message: `Your lab booking #${booking.bookingNumber} has been cancelled.`,
      link: `/lab-tests`
    });

    return ApiResponse.success(res, booking, 'Lab booking cancelled successfully');
  } catch (error) {
    next(error);
  }
};
