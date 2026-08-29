const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacyController');
const { pharmacyProfileValidator } = require('../validators/pharmacyValidator');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/nearby', pharmacyController.getNearbyPharmacies);
router.get('/profile/me', authenticate, authorize('PHARMACY'), pharmacyController.getMyPharmacyProfile);
router.put('/profile/me', authenticate, authorize('PHARMACY'), pharmacyController.updateMyPharmacyProfile);
router.get('/:id', pharmacyController.getPharmacyById);

module.exports = router;
