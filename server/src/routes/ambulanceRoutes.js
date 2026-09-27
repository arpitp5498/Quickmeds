const express = require('express');
const router = express.Router();
const ambulanceController = require('../controllers/ambulanceController');
const { authenticate } = require('../middleware/auth');

// Public endpoints
router.get('/helplines', ambulanceController.getHelplines);

// Protected endpoints
router.use(authenticate);
router.post('/request', ambulanceController.requestAmbulance);

module.exports = router;
