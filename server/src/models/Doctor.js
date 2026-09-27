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
        'Neurology'
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
    languages: [String]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Doctor', doctorSchema);
