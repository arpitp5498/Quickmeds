const mongoose = require('mongoose');

const pharmacyInventorySchema = new mongoose.Schema(
  {
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true,
      index: true
    },
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true,
      index: true
    },
    stockQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 5
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 90
    },
    batchNumber: {
      type: String,
      default: 'BATCH-DEFAULT'
    },
    expiryDate: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year default
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    source: {
      type: String,
      enum: ['MANUAL', 'CSV_IMPORT', 'MASTER_CATALOG', 'INVOICE_OCR', 'BILLING_SYNC'],
      default: 'MANUAL',
      index: true
    },
    sku: {
      type: String,
      default: ''
    },
    manufacturer: {
      type: String,
      default: ''
    },
    mrp: {
      type: Number,
      default: 0
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Compound index so a pharmacy cannot have duplicate entries for the same medicine
pharmacyInventorySchema.index({ pharmacyId: 1, medicineId: 1 }, { unique: true });

module.exports = mongoose.model('PharmacyInventory', pharmacyInventorySchema);
