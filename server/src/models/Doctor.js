const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    specialty: {
      type: String,
      required: true,
      enum: [
        'General Medicine',
        'Dermatology',
        'Gynecology',
        'Pediatrics',
        'Cardiology',
        'Orthopedics',
        'ENT',
        'Ophthalmology',
        'Psychiatry',
        'Neurology',
        'Gastroenterology',
        'Pulmonology',
        'Endocrinology',
        'Urology',
        'General Surgery'
      ]
    },
    qualification: { type: String, required: true },
    registrationNumber: { type: String, required: true, unique: true },
    fee: { type: Number, required: true },
    phone: { type: String },
    availableSlots: [
      {
        day: String,
        startTime: String,
        endTime: String
      }
    ],
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    isAvailable: { type: Boolean, default: true },
    profileImage: String,
    experience: { type: Number, default: 0 },
    languages: [String],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      sparse: true
    },
    email: { type: String, trim: true, lowercase: true },
    about: { type: String, default: '' },
    clinicAddress: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
      coordinates: { type: [Number], default: [77.209, 28.6139] }
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'],
      default: 'PENDING'
    },
    verifiedAt: { type: Date },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verificationNotes: { type: String, default: '' },
    consultationCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

doctorSchema.index({ userId: 1 });
doctorSchema.index({ specialty: 1, verificationStatus: 1 });
doctorSchema.index({ isAvailable: 1, isActive: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
