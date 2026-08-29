const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  name: { type: String, required: true },
  strength: { type: String, default: '' },
  dosageForm: { type: String, default: 'Tablet' },
  image: { type: String, default: '' },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  requiresPrescription: { type: Boolean, default: false }
});

const cartSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      default: null
    },
    items: [cartItemSchema],
    totalItems: {
      type: Number,
      default: 0
    },
    subtotal: {
      type: Number,
      default: 0
    },
    hasPrescriptionRequiredItems: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Recalculate totals helper
cartSchema.methods.calculateTotals = function () {
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.subtotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  this.hasPrescriptionRequiredItems = this.items.some((item) => item.requiresPrescription);
};

module.exports = mongoose.model('Cart', cartSchema);
