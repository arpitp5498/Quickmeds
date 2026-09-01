const fs = require('fs');
const PharmacyInventory = require('../models/PharmacyInventory');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const InventoryActivity = require('../models/InventoryActivity');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const {
  syncSingleItem,
  bulkSyncInventory,
  parseAndMatchSpreadsheet,
  parseInvoiceOCR,
  getInventoryStats
} = require('../services/inventorySyncService');

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
    const { search, category, status, source, page = 1, limit = 100 } = req.query;

    const query = { pharmacyId };

    if (source && source !== 'ALL') {
      query.source = source;
    }

    const inventoryItems = await PharmacyInventory.find(query)
      .populate('medicineId')
      .sort({ updatedAt: -1 });

    const now = new Date();
    const sixtyDaysAhead = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

    // Client-side search/category filter on populated medicine if provided
    let filtered = inventoryItems.filter((item) => item.medicineId);

    if (category && category !== 'All') {
      filtered = filtered.filter((item) => item.medicineId.category === category);
    }

    if (status && status !== 'ALL') {
      if (status === 'IN_STOCK') {
        filtered = filtered.filter(i => i.stockQuantity > (i.lowStockThreshold || 5));
      } else if (status === 'LOW_STOCK') {
        filtered = filtered.filter(i => i.stockQuantity > 0 && i.stockQuantity <= (i.lowStockThreshold || 5));
      } else if (status === 'OUT_OF_STOCK') {
        filtered = filtered.filter(i => i.stockQuantity === 0);
      } else if (status === 'EXPIRING_SOON') {
        filtered = filtered.filter(i => i.expiryDate && new Date(i.expiryDate) > now && new Date(i.expiryDate) <= sixtyDaysAhead);
      } else if (status === 'EXPIRED') {
        filtered = filtered.filter(i => i.expiryDate && new Date(i.expiryDate) <= now);
      }
    }

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.medicineId.name.toLowerCase().includes(s) ||
          item.medicineId.genericName.toLowerCase().includes(s) ||
          item.medicineId.brand.toLowerCase().includes(s) ||
          (item.batchNumber && item.batchNumber.toLowerCase().includes(s)) ||
          (item.sku && item.sku.toLowerCase().includes(s))
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

// @desc    Get pharmacy inventory summary statistics
// @route   GET /api/inventory/stats
// @access  Private (PHARMACY)
const getInventoryStatsEndpoint = async (req, res, next) => {
  try {
    const pharmacyId = await getPharmacyIdForUser(req.user);
    const stats = await getInventoryStats(pharmacyId);
    return ApiResponse.success(res, stats);
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
      source = 'MASTER_CATALOG',
      sku,
      manufacturer,
      mrp
    } = req.body;

    const populated = await syncSingleItem({
      pharmacyId,
      medicineId,
      quantity: stockQuantity,
      price,
      discountPercentage,
      lowStockThreshold,
      batchNumber,
      expiryDate,
      source,
      operationType: 'ADD',
      sku,
      manufacturer,
      mrp,
      userId: req.user._id,
      description: `Added medicine from ${source}`
    });

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

    const { stockQuantity, price, discountPercentage, isAvailable, lowStockThreshold, batchNumber, expiryDate, sku } = req.body;

    const populated = await syncSingleItem({
      pharmacyId,
      medicineId: item.medicineId,
      quantity: stockQuantity !== undefined ? stockQuantity : item.stockQuantity,
      price: price !== undefined ? price : item.price,
      discountPercentage: discountPercentage !== undefined ? discountPercentage : item.discountPercentage,
      lowStockThreshold: lowStockThreshold !== undefined ? lowStockThreshold : item.lowStockThreshold,
      batchNumber: batchNumber || item.batchNumber,
      expiryDate: expiryDate || item.expiryDate,
      source: 'MANUAL',
      operationType: stockQuantity !== undefined ? 'SET' : 'ADD',
      sku: sku !== undefined ? sku : item.sku,
      userId: req.user._id,
      description: 'Manual stock update via dashboard'
    });

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
    const item = await PharmacyInventory.findOneAndDelete({ _id: req.params.id, pharmacyId }).populate('medicineId');

    if (!item) {
      throw ApiError.notFound('Inventory item not found');
    }

    await InventoryActivity.create({
      pharmacyId,
      medicineId: item.medicineId?._id,
      medicineName: item.medicineId?.name || 'Unknown',
      changeType: 'ITEM_REMOVED',
      previousStock: item.stockQuantity,
      newStock: 0,
      quantityDelta: -item.stockQuantity,
      source: 'MANUAL',
      batchNumber: item.batchNumber,
      actorId: req.user._id,
      description: `Item '${item.medicineId?.name}' removed from inventory.`
    });

    return ApiResponse.success(res, null, 'Item removed from inventory');
  } catch (error) {
    next(error);
  }
};

// @desc    Upload CSV/Excel and return preview with catalog reconciliation
// @route   POST /api/inventory/upload-csv
// @access  Private (PHARMACY)
const uploadAndPreviewCSV = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      throw ApiError.badRequest('Please upload a valid CSV or Excel spreadsheet file.');
    }

    const fileBuffer = req.file.buffer;
    const result = await parseAndMatchSpreadsheet(fileBuffer, req.file.originalname);

    return ApiResponse.success(res, result, 'Spreadsheet parsed and reconciled with master catalog.');
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm bulk CSV import
// @route   POST /api/inventory/confirm-csv-import
// @access  Private (PHARMACY)
const confirmCSVImport = async (req, res, next) => {
  try {
    const pharmacyId = await getPharmacyIdForUser(req.user);
    const { items = [], referenceName = '' } = req.body;

    if (!items || items.length === 0) {
      throw ApiError.badRequest('No items provided for import.');
    }

    const validItems = items.filter(i => i.matchedMedicineId || i.medicineId).map(i => ({
      medicineId: i.matchedMedicineId || i.medicineId,
      quantity: i.quantity,
      price: i.price,
      mrp: i.mrp,
      batchNumber: i.batchNumber,
      expiryDate: i.expiryDate,
      sku: i.sku,
      manufacturer: i.manufacturer,
      operationType: 'ADD'
    }));

    const result = await bulkSyncInventory({
      pharmacyId,
      items: validItems,
      source: 'CSV_IMPORT',
      userId: req.user._id,
      referenceId: referenceName || `CSV-${Date.now().toString().slice(-6)}`
    });

    return ApiResponse.success(res, result, `Bulk import completed: ${result.successCount} medicines ingested.`);
  } catch (error) {
    next(error);
  }
};

// @desc    Upload purchase invoice and run OCR extraction with confidence rating
// @route   POST /api/inventory/ocr-invoice
// @access  Private (PHARMACY)
const uploadAndPreviewOCR = async (req, res, next) => {
  try {
    if (!req.file || !req.file.buffer) {
      throw ApiError.badRequest('Please upload a valid purchase invoice image (JPG, PNG) or PDF document.');
    }

    const fileBuffer = req.file.buffer;
    const result = await parseInvoiceOCR(fileBuffer, req.file.mimetype, req.file.originalname);

    return ApiResponse.success(res, result, 'Purchase invoice extracted successfully with AI/OCR.');
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm OCR invoice line items
// @route   POST /api/inventory/confirm-ocr-import
// @access  Private (PHARMACY)
const confirmOCRImport = async (req, res, next) => {
  try {
    const pharmacyId = await getPharmacyIdForUser(req.user);
    const { items = [], invoiceNumber = '', distributorName = '' } = req.body;

    if (!items || items.length === 0) {
      throw ApiError.badRequest('No line items provided for confirmation.');
    }

    const validItems = items.filter(i => i.matchedMedicineId || i.medicineId).map(i => ({
      medicineId: i.matchedMedicineId || i.medicineId,
      quantity: i.quantity,
      price: i.sellingPrice || i.purchasePrice,
      mrp: i.mrp,
      batchNumber: i.batchNumber,
      expiryDate: i.expiryDate,
      operationType: 'ADD'
    }));

    const result = await bulkSyncInventory({
      pharmacyId,
      items: validItems,
      source: 'INVOICE_OCR',
      userId: req.user._id,
      referenceId: invoiceNumber || `INV-${Date.now().toString().slice(-6)}`
    });

    return ApiResponse.success(res, result, `Purchase invoice committed: ${result.successCount} line items added to stock.`);
  } catch (error) {
    next(error);
  }
};

// @desc    Get pharmacy inventory activity log
// @route   GET /api/inventory/activities
// @access  Private (PHARMACY)
const getInventoryActivities = async (req, res, next) => {
  try {
    const pharmacyId = await getPharmacyIdForUser(req.user);
    const { limit = 50 } = req.query;

    const activities = await InventoryActivity.find({ pharmacyId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .populate('actorId', 'name email role');

    return ApiResponse.success(res, { activities, count: activities.length });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyInventory,
  getInventoryStatsEndpoint,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  uploadAndPreviewCSV,
  confirmCSVImport,
  uploadAndPreviewOCR,
  confirmOCRImport,
  getInventoryActivities
};
