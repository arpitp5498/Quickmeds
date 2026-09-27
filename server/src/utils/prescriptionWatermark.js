/**
 * Prescription Watermark Utility
 * Applies dynamic watermarks to prescription images to prevent reuse.
 * File: server/src/utils/prescriptionWatermark.js
 */

/**
 * Generate watermark text for a dispensed prescription
 * @param {Object} options
 * @param {string} options.pharmacyName - Name of dispensing pharmacy
 * @param {string} options.orderId - Order ID
 * @param {Date} options.dispensedDate - Date of dispensation
 * @returns {string} Watermark text
 */
const generateWatermarkText = ({ pharmacyName, orderId, dispensedDate }) => {
  const dateStr = new Date(dispensedDate || Date.now()).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
  return `DISPENSED BY QUICKMEDS | ${pharmacyName?.toUpperCase() || 'VERIFIED PHARMACY'} | ORDER: ${orderId} | ${dateStr} | INVALID FOR REUSE`;
};

/**
 * Apply watermark metadata to a prescription record.
 * In production, this would use a Canvas/Sharp library to stamp images.
 * Currently marks the prescription record with watermark metadata.
 * @param {Object} prescription - Mongoose prescription document
 * @param {Object} context - { pharmacyName, orderId }
 * @returns {Object} Updated prescription with watermark info
 */
const applyWatermark = async (prescription, context) => {
  const watermarkText = generateWatermarkText({
    pharmacyName: context.pharmacyName,
    orderId: context.orderId,
    dispensedDate: new Date()
  });

  prescription.watermark = {
    text: watermarkText,
    appliedAt: new Date(),
    appliedBy: context.pharmacyName
  };

  if (prescription.save) {
    await prescription.save();
  }

  return prescription;
};

/**
 * Check if a prescription has been watermarked (already dispensed)
 * @param {Object} prescription
 * @returns {boolean}
 */
const isWatermarked = (prescription) => {
  return Boolean(prescription?.watermark?.appliedAt);
};

module.exports = {
  generateWatermarkText,
  applyWatermark,
  isWatermarked
};
