const Promotion = require('../models/Promotion');

/**
 * Get all active promotions matching a set of medicine IDs and/or categories.
 * Returns a Map<medicineId_string, bestPromotion> for SPECIFIC_MEDICINES,
 * and includes category-based promotions matched by the caller's medicine categories.
 */
async function getActivePromotionsMap(medicineIds = [], categories = []) {
  const now = new Date();
  const conditions = [];

  if (medicineIds.length > 0) {
    conditions.push({ applicableTo: 'SPECIFIC_MEDICINES', medicineIds: { $in: medicineIds } });
  }
  if (categories.length > 0) {
    conditions.push({ applicableTo: 'CATEGORY', categories: { $in: categories } });
  }

  if (conditions.length === 0) return new Map();

  const promotions = await Promotion.find({
    isActive: true,
    validFrom: { $lte: now },
    validTo: { $gte: now },
    $or: conditions
  }).sort({ priority: -1 });

  // Build map: medicineId string -> best (highest priority) promotion
  const promoMap = new Map();

  for (const promo of promotions) {
    if (promo.applicableTo === 'SPECIFIC_MEDICINES') {
      for (const medId of promo.medicineIds) {
        const key = medId.toString();
        if (!promoMap.has(key)) {
          promoMap.set(key, promo);
        }
      }
    }
    // Category promotions are stored with key `cat:<categoryName>` so callers
    // can check if a medicine's category has a promotion
    if (promo.applicableTo === 'CATEGORY') {
      for (const cat of promo.categories) {
        const catKey = `cat:${cat}`;
        if (!promoMap.has(catKey)) {
          promoMap.set(catKey, promo);
        }
      }
    }
  }

  return promoMap;
}

/**
 * Get the single best active promotion for one medicine.
 */
async function getPromotionForMedicine(medicineId, category) {
  const now = new Date();
  const orConditions = [
    { applicableTo: 'SPECIFIC_MEDICINES', medicineIds: medicineId }
  ];
  if (category) {
    orConditions.push({ applicableTo: 'CATEGORY', categories: category });
  }

  return Promotion.findOne({
    isActive: true,
    validFrom: { $lte: now },
    validTo: { $gte: now },
    $or: orConditions
  }).sort({ priority: -1 });
}

/**
 * Calculate promotional price given MRP and a promotion.
 * Returns null if no valid discount can be calculated.
 */
function calculatePromotionalPrice(mrp, promotion) {
  if (!promotion || !mrp || mrp <= 0) return null;

  let discountAmount = 0;

  if (promotion.discountType === 'PERCENTAGE') {
    discountAmount = Math.round((mrp * promotion.discountValue) / 100);
    if (promotion.maxDiscountAmount && promotion.maxDiscountAmount > 0 && discountAmount > promotion.maxDiscountAmount) {
      discountAmount = promotion.maxDiscountAmount;
    }
  } else if (promotion.discountType === 'FIXED_AMOUNT') {
    discountAmount = Math.min(promotion.discountValue, mrp - 1);
  }

  if (discountAmount <= 0) return null;

  const promotionalPrice = Math.max(1, Math.round(mrp - discountAmount));
  const pct = mrp > 0 ? Math.round((discountAmount / mrp) * 100) : 0;

  return {
    promotionalPrice,
    discountAmount,
    discountPercentage: pct,
    promotionId: promotion._id.toString(),
    promotionName: promotion.name
  };
}

/**
 * Resolve the best effective price for a medicine considering both the
 * pharmacy inventory price and any active platform promotion.
 *
 * @param {number} pharmacyPrice - The pharmacy's selling price (from PharmacyInventory.price)
 * @param {number} mrp - The medicine MRP
 * @param {object|null} promotion - Active Promotion document (or null)
 * @returns {{ effectivePrice, discountAmount, discountPercentage, source, promotionId?, promotionName? }}
 */
function resolveEffectivePrice(pharmacyPrice, mrp, promotion) {
  const promoResult = calculatePromotionalPrice(mrp, promotion);
  const safePharmacyPrice = (pharmacyPrice && pharmacyPrice > 0) ? pharmacyPrice : mrp;

  if (!promoResult) {
    // No active promotion — use pharmacy price
    const disc = mrp - safePharmacyPrice;
    return {
      effectivePrice: safePharmacyPrice,
      discountAmount: disc > 0 ? disc : 0,
      discountPercentage: disc > 0 ? Math.round((disc / mrp) * 100) : 0,
      source: disc > 0 ? 'PHARMACY' : 'MRP'
    };
  }

  // Use the better deal for the customer
  if (safePharmacyPrice <= promoResult.promotionalPrice) {
    // Pharmacy already offers a better or equal price
    const disc = mrp - safePharmacyPrice;
    return {
      effectivePrice: safePharmacyPrice,
      discountAmount: disc > 0 ? disc : 0,
      discountPercentage: disc > 0 ? Math.round((disc / mrp) * 100) : 0,
      source: 'PHARMACY'
    };
  }

  // Promotion offers a better price
  return {
    effectivePrice: promoResult.promotionalPrice,
    discountAmount: promoResult.discountAmount,
    discountPercentage: promoResult.discountPercentage,
    source: 'PROMOTION',
    promotionId: promoResult.promotionId,
    promotionName: promoResult.promotionName
  };
}

/**
 * Look up the best promotion for a medicine ID string, checking both
 * direct medicine ID match and category match from a pre-built promotionMap.
 */
function findPromotionInMap(promoMap, medicineIdStr, category) {
  if (!promoMap || promoMap.size === 0) return null;
  // Direct medicine match takes priority
  const direct = promoMap.get(medicineIdStr);
  if (direct) return direct;
  // Fallback to category match
  if (category) {
    const catPromo = promoMap.get(`cat:${category}`);
    if (catPromo) return catPromo;
  }
  return null;
}

module.exports = {
  getActivePromotionsMap,
  getPromotionForMedicine,
  calculatePromotionalPrice,
  resolveEffectivePrice,
  findPromotionInMap
};
