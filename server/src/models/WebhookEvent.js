const mongoose = require('mongoose');

const webhookEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true,
      index: true
    },
    eventType: {
      type: String,
      enum: [
        'inventory.created',
        'inventory.updated',
        'inventory.sold',
        'inventory.adjusted',
        'inventory.returned',
        'billing.sync'
      ],
      required: true
    },
    payloadHash: {
      type: String,
      default: ''
    },
    itemsCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['PROCESSED', 'FAILED', 'DUPLICATE'],
      default: 'PROCESSED',
      index: true
    },
    responseSummary: {
      type: String,
      default: ''
    },
    processedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Expire old webhook idempotency records after 30 days
webhookEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('WebhookEvent', webhookEventSchema);
