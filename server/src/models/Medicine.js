const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Medicine name is required'],
      trim: true,
      index: true
    },
    genericName: {
      type: String,
      required: [true, 'Generic composition/name is required'],
      trim: true,
      index: true
    },
    brand: {
      type: String,
      required: [true, 'Brand / Manufacturer brand name is required'],
      trim: true
    },
    manufacturer: {
      type: String,
      required: [true, 'Manufacturer name is required'],
      trim: true
    },
    strength: {
      type: String,
      required: [true, 'Strength/Dosage is required (e.g. 500mg, 10ml, 200mcg)'],
      trim: true
    },
    dosageForm: {
      type: String,
      enum: [
        'Tablet',
        'Chewable Tablet',
        'Capsule',
        'Syrup',
        'Suspension',
        'Injection',
        'Ointment',
        'Gel',
        'Drops',
        'Inhaler',
        'Powder',
        'Strip',
        'Bottle',
        'Device'
      ],
      required: true
    },
    category: {
      type: String,
      enum: [
        'Fever & Pain',
        'Pain Relief',
        'Cold & Cough',
        'Digestive Care',
        'Digestive',
        'Cardiac & Diabetes',
        'Cardiac',
        'Diabetes',
        'Antibiotics & Anti-infectives',
        'Antibiotics',
        'Vitamins & Supplements',
        'Vitamins',
        'First Aid & Surgical',
        'First Aid',
        'Skin & Personal Care',
        'Skin Care',
        'Eye & Ear Drops',
        'Women Care',
        'Women Care & Hygiene',
        'Respiratory & Asthma',
        'Respiratory',
        'Pediatric',
        'Emergency & Critical Care',
        'General Health'
      ],
      required: true,
      index: true
    },
    requiresPrescription: {
      type: Boolean,
      default: false,
      index: true
    },
    prescriptionSchedule: {
      type: String,
      enum: ['OTC', 'Schedule H', 'Schedule H1', 'Schedule X'],
      default: 'OTC'
    },
    description: {
      type: String,
      required: true
    },
    usageInstructions: {
      type: String,
      default: 'As directed by a licensed physician or pharmacist.'
    },
    storage: {
      type: String,
      default: 'Store in a cool, dry place away from direct sunlight.'
    },
    sideEffects: {
      type: String,
      default: 'Consult a physician if adverse reactions occur.'
    },
    disclaimer: {
      type: String,
      default:
        'QuickMeds provides medicine details for informational purposes only. Do not self-medicate.'
    },
    image: {
      type: String,
      default: ''
    },
    mrp: {
      type: Number,
      required: true,
      min: 0
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

medicineSchema.index({
  name: 'text',
  genericName: 'text',
  brand: 'text',
  category: 'text'
});

module.exports = mongoose.model('Medicine', medicineSchema);
