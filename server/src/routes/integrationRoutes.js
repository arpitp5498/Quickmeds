const express = require('express');
const router = express.Router();
const integrationController = require('../controllers/integrationController');
const { authenticate, authorize } = require('../middleware/auth');

// Public Webhook (Secured via HMAC signature and apiKey inside controller)
router.post('/billing/webhook', integrationController.handleBillingWebhook);

// Authenticated Pharmacy Endpoints
router.get('/billing/status', authenticate, authorize('PHARMACY'), integrationController.getBillingStatus);
router.post('/billing/connect', authenticate, authorize('PHARMACY'), integrationController.connectBilling);
router.post('/billing/simulate-sale', authenticate, authorize('PHARMACY'), integrationController.simulatePOSSale);

module.exports = router;
