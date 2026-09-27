const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { createOrderValidator, updateOrderStatusValidator } = require('../validators/orderValidator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// Customer endpoints
router.post('/', createOrderValidator, validate, orderController.createOrder);
router.get('/', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);
router.post('/:id/cancel', orderController.cancelOrder);

// Pharmacy endpoints
router.get('/pharmacy/list', authorize('PHARMACY', 'ADMIN'), orderController.getPharmacyOrders);
router.post('/:id/assign-rider', authorize('PHARMACY', 'ADMIN'), orderController.assignRiderToOrder);




// State transition updates (Pharmacy, Delivery Partner, Admin)
router.patch(
  '/:id/status',
  authorize('PHARMACY', 'DELIVERY_PARTNER', 'ADMIN'),
  updateOrderStatusValidator,
  validate,
  orderController.updateOrderStatus
);

module.exports = router;
