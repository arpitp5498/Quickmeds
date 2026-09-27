const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');
const { authenticate, authorize } = require('../middleware/auth');

// Public endpoints
router.get('/doctors', consultationController.getDoctors);
router.get('/doctors/:id', consultationController.getDoctorById);

// Protected endpoints
router.use(authenticate);
router.post('/request', authorize('CUSTOMER'), consultationController.requestConsultation);
router.get('/my', authorize('CUSTOMER'), consultationController.getMyConsultations);

// Admin endpoints
router.put('/:id/status', authorize('ADMIN'), consultationController.updateConsultationStatus);

module.exports = router;
