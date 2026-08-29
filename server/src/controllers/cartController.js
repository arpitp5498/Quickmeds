const Cart = require('../models/Cart');
const PharmacyInventory = require('../models/PharmacyInventory');
const Medicine = require('../models/Medicine');
const Pharmacy = require('../models/Pharmacy');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// Helper to get or create cart
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ customerId: userId }).populate('pharmacyId');
  if (!cart) {
    cart = await Cart.create({
      customerId: userId,
      items: [],
      totalItems: 0,
      subtotal: 0
    });
  }
  return cart;
};

// @desc    Get user's current shopping cart with live price/stock validation
// @route   GET /api/cart
// @access  Private (CUSTOMER)
const getCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);

    // Validate item stock against pharmacy inventory if pharmacy is set
    let stockWarnings = [];
    if (cart.pharmacyId && cart.items.length > 0) {
      for (const item of cart.items) {
        const inventory = await PharmacyInventory.findOne({
          pharmacyId: cart.pharmacyId._id,
          medicineId: item.medicineId
        });

        if (!inventory || !inventory.isAvailable || inventory.stockQuantity < item.quantity) {
          stockWarnings.push(
            `"${item.name}" has only ${inventory ? inventory.stockQuantity : 0} units left in stock.`
          );
        }
      }
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
    let { pharmacyId, medicineId, quantity = 1, clearExisting = false } = req.body;

    const medicine = await Medicine.findById(medicineId);
    if (!medicine) throw ApiError.notFound('Medicine not found');

    let inventory = null;
    let pharmacy = null;

    if (pharmacyId) {
      pharmacy = await Pharmacy.findById(pharmacyId);
      inventory = await PharmacyInventory.findOne({ pharmacyId, medicineId, isAvailable: true });
    } else {
      // Auto-find first verified pharmacy with stock for this medicine
      const invMatch = await PharmacyInventory.findOne({
        medicineId,
        isAvailable: true,
        stockQuantity: { $gte: parseInt(quantity, 10) }
      }).populate('pharmacyId');

      if (invMatch && invMatch.pharmacyId && invMatch.pharmacyId.verificationStatus === 'VERIFIED') {
        inventory = invMatch;
        pharmacy = invMatch.pharmacyId;
        pharmacyId = pharmacy._id;
      } else {
        // Fallback to any verified open pharmacy
        pharmacy = await Pharmacy.findOne({ verificationStatus: 'VERIFIED', isOpen: true });
        if (pharmacy) {
          pharmacyId = pharmacy._id;
          inventory = { price: medicine.mrp, stockQuantity: 99 };
        }
      }
    }

    const itemPrice = inventory?.price || medicine.mrp;
    const availableStock = inventory?.stockQuantity || 50;

    let cart = await getOrCreateCart(req.user._id);

    if (pharmacyId && !cart.pharmacyId) {
      cart.pharmacyId = pharmacyId;
    }

    // Check if item is already in cart
    const existingIndex = cart.items.findIndex(
      (item) => item.medicineId.toString() === medicineId.toString()
    );

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + parseInt(quantity, 10);
      if (newQty > availableStock) {
        throw ApiError.badRequest(`Cannot add more. Max stock is ${availableStock}.`);
      }
      cart.items[existingIndex].quantity = newQty;
      cart.items[existingIndex].price = itemPrice;
    } else {
      cart.items.push({
        medicineId: medicine._id,
        name: medicine.name,
        strength: medicine.strength,
        dosageForm: medicine.dosageForm,
        image: medicine.image,
        price: itemPrice,
        mrp: medicine.mrp,
        quantity: parseInt(quantity, 10),
        requiresPrescription: medicine.requiresPrescription
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

    const qty = parseInt(quantity, 10);
    if (qty <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      if (cart.pharmacyId) {
        const inventory = await PharmacyInventory.findOne({
          pharmacyId: cart.pharmacyId,
          medicineId
        });
        if (inventory && qty > inventory.stockQuantity) {
          throw ApiError.badRequest(`Only ${inventory.stockQuantity} items in stock.`);
        }
      }
      cart.items[itemIndex].quantity = qty;
    }

    if (cart.items.length === 0) {
      cart.pharmacyId = null;
    }

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

module.exports = {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart
};
