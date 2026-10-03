const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Blood Tests',
        'Diabetes',
        'Thyroid',
        'Liver',
        'Kidney',
        'Heart',
        'Vitamins',
        'Hormones',
        'Wellness Packages',
        'Infection'
      ]
    },
    description: String,
    price: { type: Number, required: true },
    preparationInstructions: String,
    reportTimeHours: { type: Number, default: 24 },
    sampleType: {
      type: String,
      enum: ['Blood', 'Urine', 'Stool', 'Swab', 'Saliva'],
      default: 'Blood'
    },
    parametersIncluded: [String],
    isPopular: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isTestData: { type: Boolean, default: false, index: true }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('LabTest', labTestSchema);
