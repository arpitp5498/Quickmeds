const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { inventoryItemValidator } = require('../validators/pharmacyValidator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(authenticate);
router.use(authorize('PHARMACY'));

// Standard Inventory CRUD
router.get('/', inventoryController.getMyInventory);
router.get('/stats', inventoryController.getInventoryStatsEndpoint);
router.get('/activities', inventoryController.getInventoryActivities);
router.post('/', inventoryItemValidator, validate, inventoryController.addInventoryItem);
router.put('/:id', inventoryController.updateInventoryItem);
router.delete('/:id', inventoryController.deleteInventoryItem);

// Bulk CSV/Excel Ingestion
router.post('/upload-csv', upload.single('file'), inventoryController.uploadAndPreviewCSV);
router.post('/confirm-csv-import', inventoryController.confirmCSVImport);

// Purchase Invoice AI/OCR Extraction
router.post('/ocr-invoice', upload.single('file'), inventoryController.uploadAndPreviewOCR);
router.post('/confirm-ocr-import', inventoryController.confirmOCRImport);

module.exports = router;
