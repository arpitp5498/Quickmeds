const mongoose = require('mongoose');

const deliveryPartnerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    vehicleType: {
      type: String,
      enum: ['Bike', 'Scooter', 'EV Scooter', 'Bicycle'],
      default: 'Bike'
    },
    vehicleNumber: {
      type: String,
      required: true,
      trim: true
    },
    drivingLicenseNumber: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'BUSY', 'OFFLINE'],
      default: 'AVAILABLE',
      index: true
    },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [77.209, 28.6139],
        index: '2dsphere'
      }
    },
    activeOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null
    },
    completedDeliveriesCount: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

deliveryPartnerSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('DeliveryPartner', deliveryPartnerSchema);
