const crypto = require('crypto');
const BillingIntegration = require('../models/BillingIntegration');
const Pharmacy = require('../models/Pharmacy');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const {
  processBillingWebhook,
  simulateBillingSale
} = require('../services/inventorySyncService');

// Helper to get pharmacy ID for current user
const getPharmacyIdForUser = async (user) => {
  if (user.pharmacyId) return user.pharmacyId;
  const p = await Pharmacy.findOne({ userId: user._id });
  if (!p) throw ApiError.notFound('Pharmacy account not found.');
  return p._id;
};

// @desc    Public billing software webhook endpoint (Marg ERP, Busy, Vyapar, Custom)
// @route   POST /api/integrations/billing/webhook
// @access  Public (Protected via HMAC signature / apiKey)
const handleBillingWebhook = async (req, res, next) => {
  try {
    const result = await processBillingWebhook({
      headers: req.headers,
      body: req.body
    });

    return ApiResponse.success(res, result, 'Billing webhook processed successfully.');
  } catch (error) {
    next(error);
  }
};

// @desc    Get pharmacy's billing integration status
// @route   GET /api/integrations/billing/status
// @access  Private (PHARMACY)
const getBillingStatus = async (req, res, next) => {
  try {
    const pharmacyId = await getPharmacyIdForUser(req.user);
    let integration = await BillingIntegration.findOne({ pharmacyId });

    if (!integration) {
      // Auto-initialize demo default for easy testing
      const merchantId = `MERCHANT-${pharmacyId.toString().slice(-6).toUpperCase()}`;
      const apiKey = `qm_live_${crypto.randomBytes(16).toString('hex')}`;
      const webhookSecret = `whsec_${crypto.randomBytes(20).toString('hex')}`;

      integration = await BillingIntegration.create({
        pharmacyId,
        provider: 'Marg ERP 9+',
        merchantId,
        apiKey,
        webhookSecret,
        status: 'DISCONNECTED',
        autoSyncEnabled: true
      });
    }

    // Mask sensitive secrets for UI display
    const maskedSecret = integration.webhookSecret
      ? `${integration.webhookSecret.slice(0, 10)}...${integration.webhookSecret.slice(-4)}`
      : '';
    const maskedKey = integration.apiKey
      ? `${integration.apiKey.slice(0, 12)}...${integration.apiKey.slice(-4)}`
      : '';

    return ApiResponse.success(res, {
      integration: {
        _id: integration._id,
        pharmacyId: integration.pharmacyId,
        provider: integration.provider,
        merchantId: integration.merchantId,
        apiKeyMasked: maskedKey,
        webhookSecretMasked: maskedSecret,
        status: integration.status,
        autoSyncEnabled: integration.autoSyncEnabled,
        lastSyncAt: integration.lastSyncAt,
        productsSyncedCount: integration.productsSyncedCount
      },
      webhookEndpointUrl: `${req.protocol}://${req.get('host')}/api/integrations/billing/webhook`
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Connect or update billing software credentials
// @route   POST /api/integrations/billing/connect
// @access  Private (PHARMACY)
const connectBilling = async (req, res, next) => {
  try {
    const pharmacyId = await getPharmacyIdForUser(req.user);
    const { provider = 'Marg ERP 9+', merchantId, status = 'CONNECTED' } = req.body;

    let integration = await BillingIntegration.findOne({ pharmacyId });

    if (!integration) {
      const generatedApiKey = `qm_live_${crypto.randomBytes(16).toString('hex')}`;
      const generatedSecret = `whsec_${crypto.randomBytes(20).toString('hex')}`;

      integration = await BillingIntegration.create({
        pharmacyId,
        provider,
        merchantId: merchantId || `MERCHANT-${pharmacyId.toString().slice(-6).toUpperCase()}`,
        apiKey: generatedApiKey,
        webhookSecret: generatedSecret,
        status: 'CONNECTED',
        lastSyncAt: new Date()
      });
    } else {
      if (provider) integration.provider = provider;
      if (merchantId) integration.merchantId = merchantId;
      integration.status = status;
      integration.lastSyncAt = new Date();
      await integration.save();
    }

    return ApiResponse.success(
      res,
      { integration },
      'Billing software connected successfully. Live inventory synchronization enabled.'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Simulate a point-of-sale retail counter purchase event
// @route   POST /api/integrations/billing/simulate-sale
// @access  Private (PHARMACY)
const simulatePOSSale = async (req, res, next) => {
  try {
    const pharmacyId = await getPharmacyIdForUser(req.user);
    const { inventoryId, quantitySold = 1 } = req.body;

    if (!inventoryId) {
      throw ApiError.badRequest('Please specify the inventory item to simulate a sale for.');
    }

    const result = await simulateBillingSale({
      pharmacyId,
      inventoryId,
      quantitySold,
      userId: req.user._id
    });

    return ApiResponse.success(res, result, 'Simulated retail sale completed. Stock deducted via Billing Sync.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleBillingWebhook,
  getBillingStatus,
  connectBilling,
  simulatePOSSale
};
