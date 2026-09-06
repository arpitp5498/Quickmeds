const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null
    },
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      default: null
    },
    fileUrl: {
      type: String,
      required: [true, 'Prescription file URL is required']
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['UPLOADED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'EXPIRED'],
      default: 'UPLOADED',
      index: true
    },
    patientName: {
      type: String,
      default: ''
    },
    doctorName: {
      type: String,
      default: ''
    },
    customerNotes: {
      type: String,
      default: ''
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    reviewNotes: {
      type: String,
      default: ''
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    reviewedAt: Date,
    // AI-Generated Image Authenticity & Fraud Risk Screening
    authenticityCheck: {
      riskLevel: {
        type: String,
        enum: ['LOW RISK', 'MEDIUM RISK', 'HIGH RISK', 'PENDING'],
        default: 'PENDING'
      },
      signals: [
        {
          name: String,
          category: String,
          status: String,
          evidence: String
        }
      ],
      evaluatedAt: Date,
      summary: { type: String, default: '' },
      recommendation: { type: String, default: '' },
      disclaimer: { type: String, default: '' }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Prescription', prescriptionSchema);
