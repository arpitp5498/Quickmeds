const PharmacyInventory = require('../models/PharmacyInventory');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// Helper to get pharmacy ID for current user
const getPharmacyIdForUser = async (user) => {
  if (user.pharmacyId) return user.pharmacyId;
  const p = await Pharmacy.findOne({ userId: user._id });
  if (!p) throw ApiError.notFound('Pharmacy account not found.');
  return p._id;
};

// @desc    Get pharmacy's full inventory
// @route   GET /api/inventory
// @access  Private (PHARMACY)
const getMyInventory = async (req, res, next) => {
  try {
    const pharmacyId = await getPharmacyIdForUser(req.user);
    const { search, category, lowStockOnly, page = 1, limit = 50 } = req.query;

    const query = { pharmacyId };

    if (lowStockOnly === 'true') {
      query.$expr = { $lte: ['$stockQuantity', '$lowStockThreshold'] };
    }

    const inventoryItems = await PharmacyInventory.find(query)
      .populate('medicineId')
      .sort({ updatedAt: -1 });

    // Client-side search/category filter on populated medicine if provided
    let filtered = inventoryItems.filter((item) => item.medicineId);

    if (category && category !== 'All') {
      filtered = filtered.filter((item) => item.medicineId.category === category);
    }

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.medicineId.name.toLowerCase().includes(s) ||
          item.medicineId.genericName.toLowerCase().includes(s) ||
          item.medicineId.brand.toLowerCase().includes(s)
      );
    }

    return ApiResponse.success(res, {
      inventory: filtered,
      total: filtered.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a medicine to pharmacy inventory
// @route   POST /api/inventory
// @access  Private (PHARMACY)
const addInventoryItem = async (req, res, next) => {
  try {
    const pharmacyId = await getPharmacyIdForUser(req.user);
    const {
      medicineId,
      stockQuantity,
      price,
      discountPercentage,
      lowStockThreshold,
      batchNumber,
      expiryDate,
      isAvailable
    } = req.body;

    // Check if medicine exists
    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      throw ApiError.notFound('Medicine not found in master catalog.');
    }

    // Check if already in inventory
    const existing = await PharmacyInventory.findOne({ pharmacyId, medicineId });
    if (existing) {
      existing.stockQuantity += parseInt(stockQuantity, 10) || 0;
      if (price) existing.price = price;
      if (isAvailable !== undefined) existing.isAvailable = isAvailable;
      await existing.save();
      const populated = await PharmacyInventory.findById(existing._id).populate('medicineId');
      return ApiResponse.success(res, { item: populated }, 'Inventory stock updated');
    }

    const newItem = await PharmacyInventory.create({
      pharmacyId,
      medicineId,
      stockQuantity: stockQuantity || 10,
      price: price || medicine.mrp,
      discountPercentage: discountPercentage || 0,
      lowStockThreshold: lowStockThreshold || 5,
      batchNumber: batchNumber || `BATCH-${Date.now().toString().slice(-6)}`,
      expiryDate: expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });

    const populated = await PharmacyInventory.findById(newItem._id).populate('medicineId');
    return ApiResponse.created(res, { item: populated }, 'Medicine added to pharmacy inventory');
  } catch (error) {
    next(error);
  }
};

// @desc    Update an inventory item
// @route   PUT /api/inventory/:id
// @access  Private (PHARMACY)
const updateInventoryItem = async (req, res, next) => {
  try {
    const pharmacyId = await getPharmacyIdForUser(req.user);
    const item = await PharmacyInventory.findOne({ _id: req.params.id, pharmacyId });

    if (!item) {
      throw ApiError.notFound('Inventory item not found');
    }

    const { stockQuantity, price, discountPercentage, isAvailable, lowStockThreshold } = req.body;

    if (stockQuantity !== undefined) {
      item.stockQuantity = stockQuantity;
      item.isAvailable = stockQuantity > 0;
    }
    if (price !== undefined) item.price = price;
    if (discountPercentage !== undefined) item.discountPercentage = discountPercentage;
    if (isAvailable !== undefined) item.isAvailable = isAvailable;
    if (lowStockThreshold !== undefined) item.lowStockThreshold = lowStockThreshold;

    await item.save();
    const populated = await PharmacyInventory.findById(item._id).populate('medicineId');
    return ApiResponse.success(res, { item: populated }, 'Inventory updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Remove an inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (PHARMACY)
const deleteInventoryItem = async (req, res, next) => {
  try {
    const pharmacyId = await getPharmacyIdForUser(req.user);
    const item = await PharmacyInventory.findOneAndDelete({ _id: req.params.id, pharmacyId });

    if (!item) {
      throw ApiError.notFound('Inventory item not found');
    }

    return ApiResponse.success(res, null, 'Item removed from inventory');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem
};
