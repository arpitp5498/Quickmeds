const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');

router.get('/pharmacy/:pharmacyId', reviewController.getPharmacyReviews);
router.post('/', authenticate, reviewController.createReview);

module.exports = router;
