const mongoose = require('mongoose');

const labBookingSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tests: [
      {
        testId: { type: mongoose.Schema.Types.ObjectId, ref: 'LabTest' },
        name: String,
        price: Number
      }
    ],
    scheduledDate: { type: Date, required: true },
    scheduledSlot: { type: String, required: true },
    address: {
      label: String,
      street: String,
      city: String,
      pincode: String,
      coordinates: [Number]
    },
    status: {
      type: String,
      enum: ['BOOKED', 'SAMPLE_COLLECTED', 'PROCESSING', 'REPORT_READY', 'CANCELLED'],
      default: 'BOOKED'
    },
    totalAmount: Number,
    reportUrl: String,
    phlebotomistName: String,
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'REFUNDED'],
      default: 'PENDING'
    },
    bookingNumber: { type: String, unique: true, sparse: true },
    collectionOTP: String,
    labPartner: { type: String, default: '' },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: { type: String, default: '' },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      }
    ],
    referredBy: {
      doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
      consultationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation' }
    },
    patientDetails: {
      name: String,
      age: Number,
      gender: { type: String, enum: ['Male', 'Female', 'Other', ''], default: '' }
    },
    cancellationReason: { type: String, default: '' }
  },
  {
    timestamps: true
  }
);

// Auto-generate bookingNumber before save
labBookingSchema.pre('save', function (next) {
  if (!this.bookingNumber) {
    this.bookingNumber =
      'LB-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
  }
  next();
});

labBookingSchema.index({ customerId: 1, createdAt: -1 });
labBookingSchema.index({ status: 1 });

module.exports = mongoose.model('LabBooking', labBookingSchema);
