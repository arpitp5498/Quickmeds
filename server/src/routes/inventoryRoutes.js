const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { inventoryItemValidator } = require('../validators/pharmacyValidator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('PHARMACY'));

router.get('/', inventoryController.getMyInventory);
router.post('/', inventoryItemValidator, validate, inventoryController.addInventoryItem);
router.put('/:id', inventoryController.updateInventoryItem);
router.delete('/:id', inventoryController.deleteInventoryItem);

module.exports = router;
