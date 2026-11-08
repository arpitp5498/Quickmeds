const { findPurchasableInventory } = require('./purchasableInventory');
const { optimizeFulfilmentPlan } = require('./smartRoutingService');
const { getPromotionForMedicine, resolveEffectivePrice } = require('./discountService');
const ApiError = require('../utils/ApiError');

async function routedPlan(items, coordinates) {
  const result = await optimizeFulfilmentPlan(items, coordinates);
  if (result.recommended?.type !== 'SINGLE_STORE' || result.recommended.basketCoverage !== 1) {
    throw ApiError.conflict('No nearby pharmacy can fulfil the requested quantities');
  }
  return result;
}

async function quoteItem(medicine, quantity, coordinates) {
  let pharmacyId;
  if (coordinates !== undefined) {
    const plan = await routedPlan([{ medicineId: medicine._id, quantity }], coordinates);
    pharmacyId = plan.recommended.pharmacies[0]._id;
  }
  const [inventory] = await findPurchasableInventory(medicine._id, quantity, pharmacyId);
  if (!inventory) throw ApiError.conflict('Selected quantity unavailable');
  const promo = await getPromotionForMedicine(medicine._id, medicine.category);
  const price = resolveEffectivePrice(inventory.price, medicine.mrp, promo);
  return { pharmacyId: inventory.pharmacyId._id, pharmacyName: inventory.pharmacyId.name,
    price: price.effectivePrice, promotionId: price.promotionId || null };
}

module.exports = { routedPlan, quoteItem };
