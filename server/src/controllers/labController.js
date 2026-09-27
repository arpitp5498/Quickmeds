const LabTest = require('../models/LabTest');
const LabBooking = require('../models/LabBooking');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

exports.getLabTests = async (req, res, next) => {
  try {
    const { category, popular } = req.query;
    const query = { isActive: true };
    if (category) {
      query.category = category;
    }
    if (popular === 'true') {
      query.isPopular = true;
    }
    const tests = await LabTest.find(query);
    return ApiResponse.success(res, tests);
  } catch (error) {
    next(error);
  }
};

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

exports.createLabBooking = async (req, res, next) => {
  try {
    const { tests, scheduledDate, scheduledSlot, address } = req.body;
    
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

    const booking = await LabBooking.create({
      customerId: req.user._id,
      tests: testDetails,
      scheduledDate,
      scheduledSlot,
      address,
      totalAmount
    });

    return ApiResponse.created(res, booking, 'Lab test booked successfully');
  } catch (error) {
    next(error);
  }
};

exports.getMyLabBookings = async (req, res, next) => {
  try {
    const bookings = await LabBooking.find({ customerId: req.user._id })
      .populate('tests.testId')
      .sort({ createdAt: -1 });
    return ApiResponse.success(res, bookings);
  } catch (error) {
    next(error);
  }
};

exports.updateLabBookingStatus = async (req, res, next) => {
  try {
    const { status, reportUrl } = req.body;
    const booking = await LabBooking.findById(req.params.id);
    
    if (!booking) {
      throw ApiError.notFound('Booking not found');
    }

    booking.status = status;
    if (reportUrl) {
      booking.reportUrl = reportUrl;
    }
    
    await booking.save();

    return ApiResponse.success(res, booking, 'Lab booking status updated');
  } catch (error) {
    next(error);
  }
};
