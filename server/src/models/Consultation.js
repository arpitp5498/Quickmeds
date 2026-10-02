const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true
    },
    type: {
      type: String,
      enum: ['INSTANT', 'SCHEDULED'],
      required: true
    },
    status: {
      type: String,
      enum: ['REQUESTED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'REQUESTED'
    },
    scheduledTime: Date,
    symptoms: String,
    notes: String,
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prescription'
    },
    fee: Number,
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'REFUNDED'],
      default: 'PENDING'
    },
    consultationNumber: { type: String, unique: true, sparse: true },
    meetingLink: { type: String, default: '' },
    duration: { type: Number, default: 0 },
    diagnosis: { type: String, default: '' },
    followUpDate: Date,
    attachments: [
      {
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      }
    ],
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancellationReason: { type: String, default: '' },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      }
    ],
    recommendedTests: [
      {
        testId: { type: mongoose.Schema.Types.ObjectId, ref: 'LabTest' },
        name: String
      }
    ]
  },
  {
    timestamps: true
  }
);

// Auto-generate consultationNumber before save
consultationSchema.pre('save', function (next) {
  if (!this.consultationNumber) {
    this.consultationNumber =
      'QC-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

consultationSchema.index({ patientId: 1, createdAt: -1 });
consultationSchema.index({ doctorId: 1, createdAt: -1 });
consultationSchema.index({ status: 1 });

module.exports = mongoose.model('Consultation', consultationSchema);
