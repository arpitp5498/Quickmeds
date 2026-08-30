const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  name: { type: String, required: true },
  strength: { type: String, default: '' },
  dosageForm: { type: String, default: 'Tablet' },
  image: { type: String, default: '' },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  requiresPrescription: { type: Boolean, default: false }
});

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  note: {
    type: String,
    default: ''
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true,
      index: true
    },
    deliveryPartnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    deliveryFee: {
      type: Number,
      default: 25,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    deliveryAddress: {
      label: { type: String, default: 'Home' },
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      landmark: { type: String, default: '' },
      fullAddress: { type: String, required: true },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [77.209, 28.6139]
      }
    },
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription',
      default: null
    },
    prescriptionStatus: {
      type: String,
      enum: ['NOT_REQUIRED', 'PENDING_REVIEW', 'APPROVED', 'REJECTED'],
      default: 'NOT_REQUIRED'
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'ONLINE'],
      default: 'COD'
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING'
    },
    orderStatus: {
      type: String,
      enum: [
        'PLACED',
        'PHARMACY_REVIEW',
        'ACCEPTED',
        'PREPARING',
        'READY_FOR_PICKUP',
        'DELIVERY_ASSIGNED',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'REJECTED',
        'CANCELLED',
        'FULFILMENT_UNAVAILABLE'
      ],
      default: 'PLACED',
      index: true
    },
    statusHistory: [statusHistorySchema],
    distanceKm: {
      type: Number,
      default: 2.5
    },
    estimatedDeliveryMinutes: {
      type: Number,
      default: 30
    },
    estimatedDeliveryTime: Date,
    cancellationReason: {
      type: String,
      default: ''
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    isReviewed: {
      type: Boolean,
      default: false
    },
    // Fallback Routing Fields
    fallbackTriggered: {
      type: Boolean,
      default: false,
      index: true
    },
    fallbackAttempt: {
      type: Number,
      default: 0
    },
    fallbackReason: {
      type: String,
      default: ''
    },
    previousPharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      default: null
    },
    previousPharmacyIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pharmacy'
      }
    ],
    routingMetadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    fallbackLock: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ pharmacyId: 1, orderStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
