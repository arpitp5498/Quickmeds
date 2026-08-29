const mongoose = require('mongoose');

const pharmacySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Pharmacy name is required'],
      trim: true
    },
    tagline: {
      type: String,
      default: 'Licensed Hyperlocal Pharmacy Partner'
    },
    logo: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      required: [true, 'Pharmacy contact phone is required']
    },
    email: {
      type: String,
      required: [true, 'Pharmacy email is required'],
      lowercase: true
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      landmark: { type: String, default: '' },
      fullAddress: { type: String, required: true }
    },
    // GeoJSON Point for geospatial queries: [longitude, latitude]
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        index: '2dsphere'
      }
    },
    licenseNumber: {
      type: String,
      required: [true, 'Drug retail license number is required'],
      unique: true,
      trim: true
    },
    licenseDocument: {
      type: String,
      default: ''
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'],
      default: 'PENDING',
      index: true
    },
    verificationNotes: {
      type: String,
      default: ''
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    serviceRadiusKm: {
      type: Number,
      default: 10 // Service radius up to 10km
    },
    operatingHours: {
      open: { type: String, default: '08:00 AM' },
      close: { type: String, default: '11:00 PM' },
      is24x7: { type: Boolean, default: false },
      isOpenToday: { type: Boolean, default: true }
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    totalOrdersCompleted: {
      type: Number,
      default: 0
    },
    deliveryAvailable: {
      type: Boolean,
      default: true
    },
    isOpen: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

pharmacySchema.index({ location: '2dsphere' });
pharmacySchema.index({ name: 'text', 'address.city': 'text' });

module.exports = mongoose.model('Pharmacy', pharmacySchema);
