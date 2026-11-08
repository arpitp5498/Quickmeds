const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  content: { type: Buffer, required: true, select: false },
  sha256: { type: String, required: true }
}, { timestamps: true });
module.exports = mongoose.model('PrescriptionFile', schema);
