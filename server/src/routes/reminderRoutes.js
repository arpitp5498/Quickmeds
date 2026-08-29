const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  createReminder,
  getMyReminders,
  updateReminder,
  toggleReminder,
  deleteReminder
} = require('../controllers/reminderController');

router.use(authenticate);
router.use(authorize('CUSTOMER', 'ADMIN'));

router.route('/')
  .post(createReminder)
  .get(getMyReminders);

router.route('/:id')
  .put(updateReminder)
  .delete(deleteReminder);

router.patch('/:id/toggle', toggleReminder);

module.exports = router;
