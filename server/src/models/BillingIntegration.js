const mongoose = require('mongoose');

const billingIntegrationSchema = new mongoose.Schema(
  {
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true,
      unique: true,
      index: true
    },
    provider: {
      type: String,
      enum: ['Marg ERP 9+', 'Busy Accounting', 'Vyapar POS', 'Custom REST API', 'Generic Webhook'],
      default: 'Marg ERP 9+'
    },
    merchantId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    apiKey: {
      type: String,
      required: true,
      trim: true
    },
    webhookSecret: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['CONNECTED', 'DISCONNECTED', 'ERROR'],
      default: 'DISCONNECTED',
      index: true
    },
    autoSyncEnabled: {
      type: Boolean,
      default: true
    },
    lastSyncAt: {
      type: Date,
      default: null
    },
    productsSyncedCount: {
      type: Number,
      default: 0
    },
    lastErrorMessage: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('BillingIntegration', billingIntegrationSchema);
