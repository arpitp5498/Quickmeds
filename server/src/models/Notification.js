const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: [
        'ORDER_PLACED',
        'ORDER_ACCEPTED',
        'ORDER_REJECTED',
        'ORDER_REASSIGNED',
        'ORDER_FALLBACK_REASSIGNED',
        'PRESCRIPTION_APPROVED',
        'PRESCRIPTION_REJECTED',
        'ORDER_PREPARING',
        'ORDER_READY',
        'DELIVERY_ASSIGNED',
        'OUT_FOR_DELIVERY',
        'ORDER_DELIVERED',
        'ORDER_CANCELLED',
        'PHARMACY_VERIFIED',
        'PHARMACY_REJECTED',
        'SYSTEM_ALERT',
        'CONSULTATION_REQUESTED',
        'CONSULTATION_CONFIRMED',
        'CONSULTATION_COMPLETED',
        'CONSULTATION_CANCELLED',
        'PRESCRIPTION_ISSUED',
        'LAB_BOOKED',
        'LAB_SAMPLE_COLLECTED',
        'LAB_REPORT_READY',
        'LAB_CANCELLED',
        'DOCTOR_VERIFIED',
        'DOCTOR_REJECTED'
      ],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    link: {
      type: String,
      default: ''
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
