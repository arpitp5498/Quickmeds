const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { authenticate, authorize } = require('../middleware/auth');

// All promotion management routes require ADMIN auth
router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/', promotionController.getPromotions);
router.get('/:id', promotionController.getPromotionById);
router.post('/', promotionController.createPromotion);
router.put('/:id', promotionController.updatePromotion);
router.patch('/:id/toggle', promotionController.togglePromotion);
router.delete('/:id', promotionController.deletePromotion);

module.exports = router;
