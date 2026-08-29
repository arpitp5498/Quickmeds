const express = require('express');
const router = express.Router();
const medicineController = require('../controllers/medicineController');
const { medicineValidator, medicineSearchValidator } = require('../validators/medicineValidator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', medicineSearchValidator, validate, medicineController.searchMedicines);
router.get('/categories', medicineController.getCategories);
router.get('/popular', medicineController.getPopularMedicines);
router.get('/:id', medicineController.getMedicineById);

// Admin-only catalog modifications
router.post('/', authenticate, authorize('ADMIN'), medicineValidator, validate, medicineController.createMedicine);
router.put('/:id', authenticate, authorize('ADMIN'), medicineController.updateMedicine);

module.exports = router;
