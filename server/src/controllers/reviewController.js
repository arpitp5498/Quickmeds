const Review = require('../models/Review');
const Order = require('../models/Order');
const Pharmacy = require('../models/Pharmacy');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// @desc    Customer leaves a rating and review for a delivered order
// @route   POST /api/reviews
// @access  Private (CUSTOMER)
const createReview = async (req, res, next) => {
  try {
    const { orderId, rating, comment, deliveryRating, deliveryComment } = req.body;

    const order = await Order.findOne({ _id: orderId, customerId: req.user._id });
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if (order.orderStatus !== 'DELIVERED') {
      throw ApiError.badRequest('You can only review delivered orders.');
    }

    // Check for duplicate review
    const existingReview = await Review.findOne({ orderId });
    if (existingReview) {
      throw ApiError.badRequest('You have already submitted a review for this order.');
    }

    const review = await Review.create({
      customerId: req.user._id,
      pharmacyId: order.pharmacyId,
      orderId,
      rating: parseFloat(rating),
      comment: comment || '',
      deliveryRating: deliveryRating ? parseFloat(deliveryRating) : 5,
      deliveryComment: deliveryComment || ''
    });

    order.isReviewed = true;
    await order.save();

    // Recalculate pharmacy average rating
    const allPharmacyReviews = await Review.find({ pharmacyId: order.pharmacyId });
    const avgRating =
      allPharmacyReviews.reduce((sum, r) => sum + r.rating, 0) / allPharmacyReviews.length;

    await Pharmacy.findByIdAndUpdate(order.pharmacyId, {
      rating: Math.round(avgRating * 10) / 10,
      totalRatings: allPharmacyReviews.length
    });

    return ApiResponse.created(res, { review }, 'Thank you for your review!');
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a pharmacy
// @route   GET /api/reviews/pharmacy/:pharmacyId
// @access  Public
const getPharmacyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ pharmacyId: req.params.pharmacyId })
      .populate('customerId', 'name avatar')
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, { reviews });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getPharmacyReviews
};
