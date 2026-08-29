const { body } = require('express-validator');

const createOrderValidator = [
  body('pharmacyId').isMongoId().withMessage('Valid pharmacy ID is required'),
  body('deliveryAddress').notEmpty().withMessage('Delivery address is required'),
  body('deliveryAddress.street').notEmpty().withMessage('Delivery street address is required'),
  body('deliveryAddress.city').notEmpty().withMessage('Delivery city is required'),
  body('deliveryAddress.pincode').notEmpty().withMessage('Delivery pincode is required'),
  body('paymentMethod').isIn(['COD', 'ONLINE']).withMessage('Payment method must be COD or ONLINE')
];

const updateOrderStatusValidator = [
  body('status')
    .isIn([
      'ACCEPTED',
      'PREPARING',
      'READY_FOR_PICKUP',
      'DELIVERY_ASSIGNED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'REJECTED',
      'CANCELLED'
    ])
    .withMessage('Invalid order status')
];

module.exports = {
  createOrderValidator,
  updateOrderStatusValidator
};
