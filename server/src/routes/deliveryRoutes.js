const { transactional } = require('../middleware/transactional');
const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);




router.use(authorize('DELIVERY_PARTNER', 'ADMIN'));

router.get('/active', deliveryController.getActiveDelivery);
router.post('/status', transactional(deliveryController.updateDeliveryTaskStatus));
router.post('/verify-otp', transactional(deliveryController.verifyDeliveryOtp));
router.put('/availability', transactional(deliveryController.toggleAvailability));
router.post('/location', deliveryController.updateDriverLocation);
router.get('/history', deliveryController.getDeliveryHistory);

module.exports = router;
