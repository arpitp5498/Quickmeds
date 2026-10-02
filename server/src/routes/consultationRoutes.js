const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');
const { authenticate, authorize } = require('../middleware/auth');

// Public endpoints
router.get('/doctors', consultationController.getDoctors);
router.get('/doctors/:id', consultationController.getDoctorById);

// Protected endpoints
router.use(authenticate);

// Customer endpoints
router.post('/request', authorize('CUSTOMER'), consultationController.requestConsultation);
router.get('/my', authorize('CUSTOMER'), consultationController.getMyConsultations);

// Doctor endpoints
router.get('/doctor/appointments', authorize('DOCTOR'), consultationController.getDoctorAppointments);
router.put('/:id/notes', authorize('DOCTOR'), consultationController.updateConsultationNotes);
router.post('/:id/prescription', authorize('DOCTOR'), consultationController.issueConsultationPrescription);

// Shared endpoints (Customer, Doctor, Admin)
router.get('/:id', authorize('CUSTOMER', 'DOCTOR', 'ADMIN'), consultationController.getConsultationById);
router.post('/:id/cancel', authorize('CUSTOMER', 'DOCTOR'), consultationController.cancelConsultation);

// Admin or Doctor endpoints
router.put('/:id/status', authorize('ADMIN', 'DOCTOR'), consultationController.updateConsultationStatus);

module.exports = router;
