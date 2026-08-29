const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/dashboard', adminController.getDashboard);
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/status', adminController.toggleUserStatus);
router.get('/pharmacies', adminController.getAllPharmacies);
router.patch('/pharmacies/:id/verify', adminController.verifyPharmacy);
router.get('/orders', adminController.getAllOrders);
router.post('/orders/:id/assign-delivery', adminController.assignDeliveryPartnerManual);
router.get('/prescriptions', adminController.getAllPrescriptions);
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
