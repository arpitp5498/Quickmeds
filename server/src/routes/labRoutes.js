const { transactional } = require('../middleware/transactional');
const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');
const { authenticate, authorize } = require('../middleware/auth');

// Public endpoints
router.get('/', labController.getLabTests);
router.get('/categories', labController.getLabTestCategories);
router.get('/:id', labController.getLabTestById);

// Protected endpoints
router.use(authenticate);
router.post('/bookings', authorize('CUSTOMER'), transactional(labController.createLabBooking));
router.get('/bookings/my', authorize('CUSTOMER'), labController.getMyLabBookings);
router.get('/bookings/:id', authorize('CUSTOMER', 'ADMIN'), labController.getLabBookingById);
router.post('/bookings/:id/cancel', authorize('CUSTOMER'), transactional(labController.cancelLabBooking));

// Admin endpoints
router.put('/bookings/:id/status', authorize('ADMIN'), transactional(labController.updateLabBookingStatus));

module.exports = router;
