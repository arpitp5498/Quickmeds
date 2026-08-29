const express = require('express');
const router = express.Router();
const prescriptionController = require('../controllers/prescriptionController');
const upload = require('../middleware/upload');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Customer upload
router.post('/upload', upload.single('prescription'), prescriptionController.uploadPrescription);
router.get('/', prescriptionController.getMyPrescriptions);

// Pharmacy verification queue
router.get('/pharmacy/queue', authorize('PHARMACY', 'ADMIN'), prescriptionController.getPharmacyPrescriptionsQueue);
router.put('/:id/review', authorize('PHARMACY', 'ADMIN'), prescriptionController.reviewPrescription);

// Get single prescription (IDOR protected)
router.get('/:id', prescriptionController.getPrescriptionById);

module.exports = router;
