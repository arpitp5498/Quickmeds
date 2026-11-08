const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidator, loginValidator } = require('../validators/authValidator');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, registerValidator, validate, authController.register);
router.post('/login', authLimiter, loginValidator, validate, authController.login);
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    await require('../models/User').updateOne({ _id: req.user._id }, { $inc: { tokenVersion: 1 } });
    res.sendStatus(204);
  } catch (err) { next(err); }
});
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, authController.updateProfile);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);

module.exports = router;
