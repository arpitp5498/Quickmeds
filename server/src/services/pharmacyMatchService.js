const Pharmacy = require('../models/Pharmacy');
const PharmacyInventory = require('../models/PharmacyInventory');

/**
 * Find the nearest VERIFIED pharmacy that has ALL requested medicines in stock.
 * Uses MongoDB geospatial queries to sort by distance.
 *
 * @param {Array} cartItems - Array of { medicineId, quantity } objects
 * @param {Array} coordinates - [longitude, latitude] of the customer
 * @param {number} maxDistanceKm - Maximum search radius in km (default: 15)
 * @returns {Object|null} - Best matching pharmacy document or null
 */
const findNearestPharmacyWithStock = async (cartItems, coordinates, maxDistanceKm = 15) => {
  if (!coordinates || coordinates.length !== 2) {
    // Fallback: find any verified pharmacy
    const fallback = await Pharmacy.findOne({ verificationStatus: 'VERIFIED', isOpen: true })
      .sort({ rating: -1 });
    return fallback;
  }

  const [lng, lat] = coordinates;

  // Find all verified, open pharmacies within radius sorted by distance
  const nearbyPharmacies = await Pharmacy.find({
    verificationStatus: 'VERIFIED',
    isOpen: true,
    location: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        $maxDistance: maxDistanceKm * 1000 // Convert km to meters
      }
    }
  }).limit(20);

  if (nearbyPharmacies.length === 0) {
    return null;
  }

  // Extract medicine IDs from cart
  const medicineIds = cartItems.map(item => {
    // Handle both populated and unpopulated medicineId
    return item.medicineId?._id || item.medicineId;
  });

  // For each pharmacy (already sorted by distance), check if it has ALL medicines in stock
  for (const pharmacy of nearbyPharmacies) {
    const inventoryCount = await PharmacyInventory.countDocuments({
      pharmacyId: pharmacy._id,
      medicineId: { $in: medicineIds },
      stock: { $gt: 0 },
      isAvailable: true
    });

    // If this pharmacy has all the medicines in stock, it's our best match
    if (inventoryCount >= medicineIds.length) {
      return pharmacy;
    }
  }

  // If no single pharmacy has everything, return the nearest one anyway
  // (partial fulfillment is better than no fulfillment)
  return nearbyPharmacies[0];
};

module.exports = {
  findNearestPharmacyWithStock
};
