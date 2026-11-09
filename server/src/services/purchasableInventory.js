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
    match: eligiblePharmacy,
    select: 'name address phone rating totalRatings isOpen is24x7 isDemo operatingHours location verificationStatus'
  }).sort({ price: 1, _id: 1 }).lean();
  return offers.filter(offer => offer.pharmacyId);
}

// An empty offer list alone cannot establish a zero balance. Read raw quantities
// so that Mongoose defaults never turn a missing historical field into a zero.
async function getCatalogInventory(medicineIds) {
  const [offers, balances] = await Promise.all([
    findPurchasableInventory({ $in: medicineIds }),
    PharmacyInventory.find({ medicineId: { $in: medicineIds } })
      .select('medicineId pharmacyId stockQuantity')
      .populate({ path: 'pharmacyId', select: '_id', match: eligiblePharmacy }).lean()
  ]);
  const allZero = new Map();
  for (const row of balances) {
    if (!row.pharmacyId) continue;
    const id = String(row.medicineId);
    allZero.set(id, allZero.get(id) !== false && row.stockQuantity === 0);
  }
  const stocked = new Set(offers.map(row => String(row.medicineId)));
  function stockStatus(id) {
    if (stocked.has(String(id))) return 'IN_STOCK';
    return allZero.get(String(id)) ? 'OUT_OF_STOCK' : 'UNKNOWN';
  }
  return { offers, stockStatus };
}

module.exports = { findPurchasableInventory, eligiblePharmacy, stockFilter, getCatalogInventory };
