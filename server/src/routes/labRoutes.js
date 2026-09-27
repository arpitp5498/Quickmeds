const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');
const { authenticate, authorize } = require('../middleware/auth');

// Public endpoints
router.get('/', labController.getLabTests);
router.get('/:id', labController.getLabTestById);

// Protected endpoints
router.use(authenticate);
router.post('/bookings', authorize('CUSTOMER'), labController.createLabBooking);
router.get('/bookings/my', authorize('CUSTOMER'), labController.getMyLabBookings);

// Admin endpoints
router.put('/bookings/:id/status', authorize('ADMIN'), labController.updateLabBookingStatus);

module.exports = router;
