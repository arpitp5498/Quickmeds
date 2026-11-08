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
    const query = { isActive: { $ne: false } };

    if (category) {
      query.category = category;
    }
    if (popular === 'true') {
      query.isPopular = true;
    }
    if (search) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const s = new RegExp(escaped, 'i');
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
      { $match: { isActive: { $ne: false } } },
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

    if (!Array.isArray(tests) || tests.length > 50 || !['6-8 AM','8-10 AM','10-12 PM'].includes(scheduledSlot) || !address?.street || !Number.isFinite(Date.parse(scheduledDate)) ||
        new Date(scheduledDate).getTime() < Date.now() - 86400000) throw ApiError.badRequest('Invalid collection details');
    const postalCode = String(address.pincode || '');
    if (!/^[1-9][0-9]{5}$/.test(postalCode) || !/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate)) throw ApiError.badRequest('Valid postal code and collection date required');
    const hours = { '6-8 AM': '06', '8-10 AM': '08', '10-12 PM': '10' };
    const startsAt = new Date(scheduledDate + 'T' + hours[scheduledSlot] + ':00:00+05:30');
    if (startsAt <= new Date()) throw ApiError.conflict('Collection slot has passed');
    const slotKey = [postalCode, scheduledDate, scheduledSlot].join('/');
    const Slot = require('../models/CollectionSlot');
    await Slot.updateOne({ _id: slotKey }, { $setOnInsert: { reserved: 0 } }, { upsert: true });
    const capacity = Number(process.env.LAB_SLOT_CAPACITY || 1);
    if (!Number.isSafeInteger(capacity) || capacity < 1) throw new Error('Invalid LAB_SLOT_CAPACITY');
    const held = await Slot.updateOne({ _id: slotKey, reserved: { $lt: capacity } }, { $inc: { reserved: 1 } });
    if (!held.modifiedCount) throw ApiError.conflict('Collection slot is full');
    const ids = [...new Set(tests.map(item => item.testId))];
    const records = await LabTest.find({ _id: { $in: ids }, isActive: { $ne: false } });
    if (records.length !== tests.length) throw ApiError.badRequest('Selected tests unavailable or duplicated');
    const testDetails = records.map(test => ({ testId: test._id, name: test.name, price: test.price }));
    const totalAmount = testDetails.reduce((sum, test) => sum + test.price, 0);

    const collectionOTP = Math.floor(1000 + Math.random() * 9000).toString();

    const booking = await LabBooking.create({
      customerId: req.user._id,
      tests: testDetails,
      scheduledDate,
      slotKey,
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

    const allowed = { BOOKED: ['SAMPLE_COLLECTED','CANCELLED'], SAMPLE_COLLECTED: ['PROCESSING'], PROCESSING: ['REPORT_READY'] };
    if (!allowed[booking.status]?.includes(status)) throw ApiError.conflict('Invalid booking transition');
    if (status === 'SAMPLE_COLLECTED' && (!booking.collectionOTP || booking.collectionOTP !== req.body.otp)) throw ApiError.badRequest('Collection code required');
    if (status === 'REPORT_READY' && !reportUrl?.startsWith('https://')) throw ApiError.badRequest('Secure report URL required');
    if (status === 'CANCELLED' && booking.slotKey) await require('../models/CollectionSlot').updateOne({ _id: booking.slotKey, reserved: { $gt: 0 } }, { $inc: { reserved: -1 } });
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
    if (booking.status !== 'BOOKED') {
      throw ApiError.badRequest(`Cannot cancel a booking with status: ${booking.status}`);
    }

    if (booking.slotKey) await require('../models/CollectionSlot').updateOne({ _id: booking.slotKey, reserved: { $gt: 0 } }, { $inc: { reserved: -1 } });
    booking.status = 'CANCELLED';
    booking.cancellationReason = reason || 'Cancelled by customer';

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
