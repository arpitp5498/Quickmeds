const { param, query } = require('express-validator');
const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const { medicineValidator, medicineSearchValidator } = require('../validators/medicineValidator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', medicineSearchValidator, validate, medicineController.searchMedicines);
router.get('/emergency-essentials', medicineController.getEmergencyEssentials);
router.get('/sos', medicineController.getEmergencyEssentials);
router.get('/categories', medicineController.getCategories);
router.get('/popular', medicineController.getPopularMedicines);
router.get('/:id/quote', param('id').isMongoId(),
  query('quantity').isInt({ min: 1, max: 100 }).toInt(),
  query('lng').isFloat({ min: -180, max: 180 }).toFloat(),
  query('lat').isFloat({ min: -90, max: 90 }).toFloat(),
  validate, medicineController.getItemQuote);
router.get('/:id', medicineController.getMedicineById);

// Admin-only catalog modifications
router.post('/', authenticate, authorize('ADMIN'), medicineValidator, validate, medicineController.createMedicine);
router.put('/:id', authenticate, authorize('ADMIN'), medicineController.updateMedicine);

module.exports = router;
