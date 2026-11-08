const { transactional } = require('../middleware/transactional');
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { createOrderValidator, updateOrderStatusValidator } = require('../validators/orderValidator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Customer endpoints
router.post('/', authorize('CUSTOMER'), createOrderValidator, validate, transactional(orderController.createOrder));
router.get('/', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);
router.post('/:id/cancel', transactional(orderController.cancelOrder));

// Pharmacy endpoints
router.get('/pharmacy/list', authorize('PHARMACY', 'ADMIN'), orderController.getPharmacyOrders);
router.post('/:id/assign-rider', authorize('PHARMACY', 'ADMIN'), transactional(orderController.assignRiderToOrder));




// State transition updates (Pharmacy, Delivery Partner, Admin)
router.patch(
  '/:id/status',
  authorize('PHARMACY', 'DELIVERY_PARTNER', 'ADMIN'),
  updateOrderStatusValidator,
  validate,
  transactional(orderController.updateOrderStatus)
);

module.exports = router;
