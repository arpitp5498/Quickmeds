const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  logPeriod,
  getCycleData,
  updateCycle,
  deleteCycle,
  updateNotificationSettings,
  getSOSProducts
} = require('../controllers/cycleController');

router.use(authenticate);
router.use(authorize('CUSTOMER', 'ADMIN'));

router.post('/log', logPeriod);
router.get('/', getCycleData);
router.put('/notifications', updateNotificationSettings);
router.get('/sos-products', getSOSProducts);
router.put('/:cycleId', updateCycle);
router.delete('/:cycleId', deleteCycle);

module.exports = router;
