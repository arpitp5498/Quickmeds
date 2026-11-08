const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticate, authorize } = require('../middleware/auth');

const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
router.use(authenticate, authorize('CUSTOMER'));

router.get('/', cartController.getCart);
router.post('/items', body('medicineId').isMongoId(), body('quantity').optional().isInt({ min: 1, max: 100 }).toInt(), body('pharmacyId').optional().isMongoId(), validate, cartController.addToCart);
router.put('/items/:medicineId', param('medicineId').isMongoId(), body('quantity').isInt({ min: 0, max: 100 }).toInt(), validate, cartController.updateCartItemQuantity);
router.delete('/items/:medicineId', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

module.exports = router;
