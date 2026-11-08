const mongoose = require('mongoose');
// One collection team per configured postal zone by default.
module.exports = mongoose.model('CollectionSlot', new mongoose.Schema({
  _id: String, reserved: { type: Number, default: 0 }
}));
