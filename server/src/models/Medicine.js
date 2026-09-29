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
    composition: {
      type: String,
      default: '',
      trim: true,
      index: true
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
        'Cream',
        'Gel',
        'Lotion',
        'Drops',
        'Spray',
        'Solution',
        'Inhaler',
        'Powder',
        'Granules',
        'Effervescent Granules',
        'Strip',
        'Bottle',
        'Device',
        'Pads',
        'Tampon',
        'Cup',
        'Patch',
        'Wipes',
        'Tissues',
        'Bags',
        'Wash',
        'Pack',
        'Sachet'
      ],
      required: true
    },
    routeOfAdministration: {
      type: String,
      enum: [
        'Oral',
        'Topical',
        'Inhalation',
        'Ophthalmic',
        'Otic',
        'Nasal',
        'Sublingual',
        'Parenteral',
        'Rectal',
        'Transdermal',
        'Other'
      ],
      default: 'Oral'
    },
    packSize: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      enum: [
        // 17 Comprehensive Therapeutic Categories (India CDSCO/NLEM standard)
        'Pain & Fever',
        'Oral Rehydration & Electrolytes',
        'Gastrointestinal Care',
        'Acidity & Reflux',
        'Constipation & Diarrhoea',
        'Allergy & Antihistamines',
        'Respiratory & Asthma',
        'Diabetes Care',
        'Cardiovascular Care',
        'Dermatological & Skin Care',
        'Wound Care & Antiseptics',
        'Eye, Ear & Nasal Care',
        'Vitamins & Mineral Supplements',
        'Bone & Nutritional Support',
        'Women Health & Hygiene',
        'Pediatric Care',
        'Essential Outpatient Medicines',
        // Legacy category mappings preserved for backward compatibility
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
        'General Health',
        'Menstrual Care',
        'Comfort & Relief',
        'Hygiene Essentials'
      ],
      required: true,
      index: true
    },
    sosEligible: {
      type: Boolean,
      default: false,
      index: true
    },
    sosCategory: {
      type: String,
      enum: ['MENSTRUAL_CARE', 'COMFORT_RELIEF', 'HYGIENE_ESSENTIALS', ''],
      default: '',
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
    regulatoryClass: {
      type: String,
      enum: ['OTC', 'Schedule H', 'Schedule H1', 'Schedule X', 'Schedule G', 'Not Classified'],
      default: 'OTC'
    },
    sourceOfInformation: {
      type: String,
      default: 'CDSCO Approved Drugs / NLEM 2022'
    },
    gtin: {
      type: String,
      trim: true,
      default: ''
    },
    verificationStatus: {
      type: String,
      enum: ['VERIFIED', 'NEEDS_REVIEW', 'DISCONTINUED', 'MERGED'],
      default: 'VERIFIED'
    },
    isMerged: {
      type: Boolean,
      default: false,
      index: true
    },
    canonicalMedicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      default: null,
      index: true
    },
    mergeReason: {
      type: String,
      default: ''
    },
    flaggedForReview: {
      type: Boolean,
      default: false,
      index: true
    },
    reviewNotes: {
      type: String,
      default: ''
    },
    lastVerificationDate: {
      type: Date,
      default: Date.now
    },
    aliases: [{
      type: String,
      trim: true
    }],
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
  composition: 'text',
  category: 'text'
});

module.exports = mongoose.model('Medicine', medicineSchema);
