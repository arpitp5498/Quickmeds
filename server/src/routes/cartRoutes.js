const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', cartController.getCart);
router.post('/items', cartController.addToCart);
router.put('/items/:medicineId', cartController.updateCartItemQuantity);
router.delete('/items/:medicineId', cartController.removeFromCart);
router.delete('/', cartController.clearCart);

module.exports = router;
