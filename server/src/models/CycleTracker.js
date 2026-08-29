const mongoose = require('mongoose');

const cycleEntrySchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: [true, 'Period start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'Period end date is required']
  },
  periodLength: {
    type: Number,
    default: 0
  },
  symptoms: {
    type: [String],
    default: []
  },
  flowIntensity: {
    type: String,
    enum: ['Light', 'Medium', 'Heavy', 'Spotting'],
    default: 'Medium'
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, { timestamps: true });

cycleEntrySchema.pre('validate', function () {
  if (this.startDate && this.endDate) {
    const diffMs = this.endDate.getTime() - this.startDate.getTime();
    this.periodLength = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }
});

const predictionSchema = new mongoose.Schema({
  predictedStart: { type: Date, required: true },
  predictedEnd: { type: Date, required: true },
  cycleDay: { type: Number },
  fertility: {
    start: Date,
    end: Date,
    ovulationDay: Date
  }
}, { _id: false });

const cycleTrackerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    cycles: {
      type: [cycleEntrySchema],
      default: []
    },
    averageCycleLength: {
      type: Number,
      default: 28
    },
    averagePeriodLength: {
      type: Number,
      default: 5
    },
    predictions: {
      type: [predictionSchema],
      default: []
    },
    notificationSettings: {
      enabled: { type: Boolean, default: true },
      daysBefore: { type: Number, default: 2, min: 0, max: 7 }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('CycleTracker', cycleTrackerSchema);
