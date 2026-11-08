const PharmacyInventory = require('../models/PharmacyInventory');

const eligiblePharmacy = { verificationStatus: 'VERIFIED', isOpen: true, isDemo: { $ne: true } };

function stockFilter(quantity = 1) {
  return {
    isAvailable: true,
    isPriceSuspicious: { $ne: true },
    expiryDate: { $gt: new Date() },
    stockQuantity: { $gte: quantity }
  };
}

async function findPurchasableInventory(medicineId, quantity = 1, pharmacyId) {
  const filter = { medicineId, ...stockFilter(quantity) };
  if (pharmacyId) filter.pharmacyId = pharmacyId;
  const offers = await PharmacyInventory.find(filter).populate({
    path: 'pharmacyId',
    match: eligiblePharmacy
  }).sort({ price: 1, _id: 1 });
  return offers.filter(offer => offer.pharmacyId);
}

module.exports = { findPurchasableInventory, eligiblePharmacy, stockFilter };
