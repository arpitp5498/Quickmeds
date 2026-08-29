const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Delivery step advancement (Customer, Delivery Partner, Pharmacy, Admin)
router.post('/simulation/step', deliveryController.simulateDeliveryStep);

router.use(authorize('DELIVERY_PARTNER', 'ADMIN'));

router.get('/active', deliveryController.getActiveDelivery);
router.post('/status', deliveryController.updateDeliveryTaskStatus);
router.put('/availability', deliveryController.toggleAvailability);
router.post('/location', deliveryController.updateDriverLocation);
router.get('/history', deliveryController.getDeliveryHistory);

module.exports = router;
