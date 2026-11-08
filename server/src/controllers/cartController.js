const { routedPlan, quoteItem } = require('../services/cartQuote');
const Cart = require('../models/Cart');
const { findPurchasableInventory } = require('../services/purchasableInventory');
const Medicine = require('../models/Medicine');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { getPromotionForMedicine, resolveEffectivePrice } = require('../services/discountService');

// Helper to get or create cart
const getOrCreateCart = async (userId) => {
  const cart = await Cart.findOneAndUpdate({ customerId: userId }, { $setOnInsert: { customerId: userId } },
    { new: true, upsert: true, setDefaultsOnInsert: true }).populate('pharmacyId');
  return cart;
};

// @desc    Get user's current shopping cart with live price/stock validation
// @route   GET /api/cart
// @access  Private (CUSTOMER)
const getCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);

    const stockWarnings = [];
    for (const item of cart.items) {
      const pharmacyId = item.pharmacyId || cart.pharmacyId?._id;
      const offers = pharmacyId && await findPurchasableInventory(item.medicineId, item.quantity, pharmacyId);
      if (!offers?.length) stockWarnings.push(`"${item.name}" is unavailable in the selected quantity.`);
    }

    return ApiResponse.success(res, { cart, stockWarnings });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart (with pharmacy exclusivity handling)
// @route   POST /api/cart/items
// @access  Private (CUSTOMER)
const addToCart = async (req, res, next) => {
  try {
    let { medicineId, quantity = 1 } = req.body;

    let medicine = await Medicine.findById(medicineId);
    if (!medicine) throw ApiError.notFound('Medicine not found');

    // Seamlessly forward merged duplicates to canonical record
    if (medicine.isMerged && medicine.canonicalMedicineId) {
      const canonical = await Medicine.findById(medicine.canonicalMedicineId);
      if (canonical) {
        medicine = canonical;
        medicineId = canonical._id;
      }
    }

    if (!medicine.active || medicine.isMerged || medicine.verificationStatus === 'MERGED') throw ApiError.notFound('Medicine not found');
    if (!Number.isSafeInteger(quantity) || quantity < 1) throw ApiError.badRequest('Invalid quantity');
    const cart = await getOrCreateCart(req.user._id);
    const existingIndex = cart.items.findIndex(item => item.medicineId.equals(medicineId));
    const totalQuantity = (cart.items[existingIndex]?.quantity || 0) + quantity;
    if (totalQuantity > 100) throw ApiError.badRequest('Maximum quantity per medicine is 100');
    const { pharmacyId: resolvedPharmacyId, pharmacyName: resolvedPharmacyName, price: finalPrice, promotionId } =
      await quoteItem(medicine, totalQuantity, req.body.coordinates);
    if (!cart.pharmacyId || existingIndex === 0) cart.pharmacyId = resolvedPharmacyId;

    if (existingIndex > -1) {
      Object.assign(cart.items[existingIndex], {
        quantity: totalQuantity, price: finalPrice, promotionId,
        pharmacyId: resolvedPharmacyId, pharmacyName: resolvedPharmacyName
      });
    } else {
      cart.items.push({
        medicineId: medicine._id,
        name: medicine.name,
        strength: medicine.strength,
        dosageForm: medicine.dosageForm,
        image: medicine.image,
        price: finalPrice,
        mrp: medicine.mrp,
        quantity,
        requiresPrescription: medicine.requiresPrescription,
        pharmacyId: resolvedPharmacyId,
        pharmacyName: resolvedPharmacyName,
        promotionId: promotionId
      });
    }

    cart.calculateTotals();
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('pharmacyId');
    return ApiResponse.success(res, { cart: populatedCart }, 'Item added to cart');
  } catch (error) {
    next(error);
  }
};

// @desc    Update quantity of a cart item
// @route   PUT /api/cart/items/:medicineId
// @access  Private (CUSTOMER)
const updateCartItemQuantity = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const { medicineId } = req.params;

    const cart = await getOrCreateCart(req.user._id);
    const itemIndex = cart.items.findIndex(
      (item) => item.medicineId.toString() === medicineId.toString()
    );

    if (itemIndex === -1) {
      throw ApiError.notFound('Item not found in cart');
    }

    const item = cart.items[itemIndex];
    if (!Number.isSafeInteger(quantity) || quantity < 1) throw ApiError.badRequest('Invalid quantity');
    const medicine = await Medicine.findById(medicineId);
    if (!medicine?.active || medicine.isMerged) throw ApiError.conflict('Medicine unavailable');
    Object.assign(item, await quoteItem(medicine, quantity, req.body.coordinates));
    if (itemIndex === 0) cart.pharmacyId = item.pharmacyId;
    item.quantity = quantity;

    cart.calculateTotals();
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('pharmacyId');
    return ApiResponse.success(res, { cart: populatedCart }, 'Cart updated');
  } catch (error) {
    next(error);
  }
};

// @desc    Remove an item from cart
// @route   DELETE /api/cart/items/:medicineId
// @access  Private (CUSTOMER)
const removeFromCart = async (req, res, next) => {
  try {
    const { medicineId } = req.params;
    const cart = await getOrCreateCart(req.user._id);

    cart.items = cart.items.filter(
      (item) => item.medicineId.toString() !== medicineId.toString()
    );

    if (cart.items.length === 0) {
      cart.pharmacyId = null;
    }

    cart.calculateTotals();
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('pharmacyId');
    return ApiResponse.success(res, { cart: populatedCart }, 'Item removed from cart');
  } catch (error) {
    next(error);
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private (CUSTOMER)
const clearCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    cart.pharmacyId = null;
    cart.calculateTotals();
    await cart.save();

    return ApiResponse.success(res, { cart }, 'Cart cleared');
  } catch (error) {
    next(error);
  }
};

// Quote the complete basket for the delivery address without modifying the cart.
async function quoteCheckout(req, res, next) {
  try {
    const cart = await Cart.findOne({ customerId: req.user._id }).lean();
    if (!cart?.items.length) throw ApiError.badRequest('Your cart is empty');
    const plan = await routedPlan(cart.items, req.body.coordinates);
    const route = plan.recommended;
    const lines = route.pharmacies[0].itemsFulfilled;
    const medicines = await Medicine.find({ _id: { $in: lines.map(line => line.medicineId) }, active: true, isMerged: { $ne: true } });
    for (const line of lines) {
      const med = medicines.find(m => m._id.equals(line.medicineId));
      if (!med) throw ApiError.conflict('Medicine unavailable');
      const promo = await getPromotionForMedicine(med._id, med.category);
      line.unitPrice = resolveEffectivePrice(line.unitPrice, med.mrp, promo).effectivePrice;
      line.totalPrice = line.unitPrice * line.requestedQty;
    }
    const subtotal = lines.reduce((sum, line) => sum + line.totalPrice, 0);
    route.priceBreakdown.itemsSubtotal = subtotal;
    route.totalOrderValue = subtotal + route.priceBreakdown.deliveryFee + route.priceBreakdown.platformFee;
    route.priceBreakdown.totalOrderValue = route.totalOrderValue;
    return ApiResponse.success(res, plan);
  } catch (error) { next(error); }
}

module.exports = {
  quoteCheckout,
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart
};
