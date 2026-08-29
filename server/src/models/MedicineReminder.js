const mongoose = require('mongoose');

const reminderTimeSchema = new mongoose.Schema({
  time: {
    type: String,
    required: true,
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:MM format']
  },
  label: {
    type: String,
    enum: ['Morning', 'Afternoon', 'Evening', 'Night', 'Custom'],
    default: 'Custom'
  }
}, { _id: false });

const medicineReminderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    medicineName: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true
    },
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      default: null
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required (e.g. "1 tablet", "5ml")'],
      trim: true
    },
    frequency: {
      type: Number,
      required: true,
      min: [1, 'Minimum 1 time per day'],
      max: [6, 'Maximum 6 times per day']
    },
    timings: {
      type: [reminderTimeSchema],
      validate: {
        validator: function (v) {
          return v.length > 0 && v.length <= 6;
        },
        message: 'At least 1 and at most 6 timings required'
      }
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now
    },
    endDate: {
      type: Date,
      default: null
    },
    daysOfWeek: {
      type: [Number],
      default: [0, 1, 2, 3, 4, 5, 6],
      validate: {
        validator: function (v) {
          return v.every(d => d >= 0 && d <= 6);
        },
        message: 'Days must be 0 (Sunday) to 6 (Saturday)'
      }
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    notificationPreference: {
      browser: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true }
    }
  },
  {
    timestamps: true
  }
);

medicineReminderSchema.index({ userId: 1, isActive: 1 });
medicineReminderSchema.index({ isActive: 1, 'timings.time': 1 });

module.exports = mongoose.model('MedicineReminder', medicineReminderSchema);
