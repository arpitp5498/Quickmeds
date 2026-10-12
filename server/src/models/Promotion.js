const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Promotion name is required'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    discountType: {
      type: String,
      enum: ['PERCENTAGE', 'FIXED_AMOUNT'],
      required: [true, 'Discount type is required']
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0.01, 'Discount value must be positive']
    },
    maxDiscountAmount: {
      type: Number,
      default: null
    },
    applicableTo: {
      type: String,
      enum: ['SPECIFIC_MEDICINES', 'CATEGORY'],
      default: 'SPECIFIC_MEDICINES'
    },
    medicineIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine'
    }],
    categories: [{
      type: String
    }],
    validFrom: {
      type: Date,
      required: [true, 'Start date is required']
    },
    validTo: {
      type: Date,
      required: [true, 'End date is required']
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    priority: {
      type: Number,
      default: 0
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

promotionSchema.index({ isActive: 1, validFrom: 1, validTo: 1 });
promotionSchema.index({ medicineIds: 1 });
promotionSchema.index({ categories: 1 });

module.exports = mongoose.model('Promotion', promotionSchema);
