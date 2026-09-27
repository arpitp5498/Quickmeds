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
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('LabBooking', labBookingSchema);
