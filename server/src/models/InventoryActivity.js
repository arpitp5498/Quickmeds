const mongoose = require('mongoose');

const inventoryActivitySchema = new mongoose.Schema(
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
      default: null,
      index: true
    },
    medicineName: {
      type: String,
      required: true,
      trim: true
    },
    changeType: {
      type: String,
      enum: [
        'STOCK_ADDED',
        'STOCK_DEDUCTED',
        'STOCK_SET',
        'PRICE_UPDATED',
        'ITEM_REMOVED',
        'BULK_IMPORT',
        'BILLING_SALE',
        'OCR_INGEST'
      ],
      required: true,
      index: true
    },
    previousStock: {
      type: Number,
      default: 0
    },
    newStock: {
      type: Number,
      default: 0
    },
    quantityDelta: {
      type: Number,
      default: 0
    },
    source: {
      type: String,
      enum: [
        'MANUAL',
        'CSV_IMPORT',
        'MASTER_CATALOG',
        'INVOICE_OCR',
        'BILLING_SYNC',
        'ORDER_FULFILMENT',
        'ORDER_RESTORE'
      ],
      default: 'MANUAL',
      index: true
    },
    batchNumber: {
      type: String,
      default: ''
    },
    referenceId: {
      type: String,
      default: ''
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    description: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

inventoryActivitySchema.index({ pharmacyId: 1, createdAt: -1 });

module.exports = mongoose.model('InventoryActivity', inventoryActivitySchema);
