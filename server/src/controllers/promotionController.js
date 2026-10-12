const Promotion = require('../models/Promotion');
const Medicine = require('../models/Medicine');
const { logAction } = require('../services/auditService');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// @desc    Get all promotions with filters
// @route   GET /api/promotions
// @access  Private (ADMIN)
const getPromotions = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status === 'active') {
      const now = new Date();
      query.isActive = true;
      query.validFrom = { $lte: now };
      query.validTo = { $gte: now };
    } else if (status === 'inactive') {
      query.isActive = false;
    } else if (status === 'expired') {
      query.validTo = { $lt: new Date() };
    } else if (status === 'scheduled') {
      query.isActive = true;
      query.validFrom = { $gt: new Date() };
    }

    if (search) {
      query.name = new RegExp(search.trim(), 'i');
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Promotion.countDocuments(query);
    const promotions = await Promotion.find(query)
      .populate('medicineIds', 'name mrp category strength dosageForm')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return ApiResponse.success(res, {
      promotions,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single promotion by ID
// @route   GET /api/promotions/:id
// @access  Private (ADMIN)
const getPromotionById = async (req, res, next) => {
  try {
    const promotion = await Promotion.findById(req.params.id)
      .populate('medicineIds', 'name mrp category strength dosageForm image')
      .populate('createdBy', 'name email');

    if (!promotion) {
      throw ApiError.notFound('Promotion not found');
    }

    return ApiResponse.success(res, { promotion });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new promotion
// @route   POST /api/promotions
// @access  Private (ADMIN)
const createPromotion = async (req, res, next) => {
  try {
    const {
      name, description, discountType, discountValue, maxDiscountAmount,
      applicableTo, medicineIds, categories, validFrom, validTo, priority
    } = req.body;

    // Validation
    if (!name || !discountType || !discountValue || !validFrom || !validTo) {
      throw ApiError.badRequest('Missing required fields: name, discountType, discountValue, validFrom, validTo');
    }

    if (new Date(validTo) <= new Date(validFrom)) {
      throw ApiError.badRequest('End date must be after start date');
    }

    if (discountType === 'PERCENTAGE' && discountValue > 50) {
      throw ApiError.badRequest('Percentage discount cannot exceed 50% for pharmaceutical products.');
    }

    if (applicableTo === 'SPECIFIC_MEDICINES' && (!medicineIds || medicineIds.length === 0)) {
      throw ApiError.badRequest('At least one medicine must be selected for SPECIFIC_MEDICINES promotions.');
    }

    if (applicableTo === 'CATEGORY' && (!categories || categories.length === 0)) {
      throw ApiError.badRequest('At least one category must be selected for CATEGORY promotions.');
    }

    // Validate medicine IDs exist
    if (medicineIds && medicineIds.length > 0) {
      const validCount = await Medicine.countDocuments({ _id: { $in: medicineIds }, active: true });
      if (validCount !== medicineIds.length) {
        throw ApiError.badRequest(`Some medicine IDs are invalid. Found ${validCount} of ${medicineIds.length}.`);
      }
    }

    const promotion = await Promotion.create({
      name,
      description: description || '',
      discountType,
      discountValue,
      maxDiscountAmount: maxDiscountAmount || null,
      applicableTo: applicableTo || 'SPECIFIC_MEDICINES',
      medicineIds: medicineIds || [],
      categories: categories || [],
      validFrom: new Date(validFrom),
      validTo: new Date(validTo),
      isActive: true,
      priority: priority || 0,
      createdBy: req.user._id
    });

    await logAction({
      actorId: req.user._id,
      actorRole: 'ADMIN',
      action: 'PROMOTION_CREATED',
      entity: 'PROMOTION',
      entityId: promotion._id.toString(),
      description: `Admin created promotion "${name}" (${discountType}: ${discountValue})`
    });

    const populated = await Promotion.findById(promotion._id)
      .populate('medicineIds', 'name mrp category')
      .populate('createdBy', 'name email');

    return ApiResponse.created(res, { promotion: populated }, 'Promotion created successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update a promotion
// @route   PUT /api/promotions/:id
// @access  Private (ADMIN)
const updatePromotion = async (req, res, next) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      throw ApiError.notFound('Promotion not found');
    }

    const {
      name, description, discountType, discountValue, maxDiscountAmount,
      applicableTo, medicineIds, categories, validFrom, validTo, isActive, priority
    } = req.body;

    if (discountType === 'PERCENTAGE' && discountValue > 50) {
      throw ApiError.badRequest('Percentage discount cannot exceed 50% for pharmaceutical products.');
    }

    if (validFrom && validTo && new Date(validTo) <= new Date(validFrom)) {
      throw ApiError.badRequest('End date must be after start date');
    }

    // Update fields
    if (name !== undefined) promotion.name = name;
    if (description !== undefined) promotion.description = description;
    if (discountType !== undefined) promotion.discountType = discountType;
    if (discountValue !== undefined) promotion.discountValue = discountValue;
    if (maxDiscountAmount !== undefined) promotion.maxDiscountAmount = maxDiscountAmount;
    if (applicableTo !== undefined) promotion.applicableTo = applicableTo;
    if (medicineIds !== undefined) promotion.medicineIds = medicineIds;
    if (categories !== undefined) promotion.categories = categories;
    if (validFrom !== undefined) promotion.validFrom = new Date(validFrom);
    if (validTo !== undefined) promotion.validTo = new Date(validTo);
    if (isActive !== undefined) promotion.isActive = isActive;
    if (priority !== undefined) promotion.priority = priority;
    promotion.updatedBy = req.user._id;

    await promotion.save();

    await logAction({
      actorId: req.user._id,
      actorRole: 'ADMIN',
      action: 'PROMOTION_UPDATED',
      entity: 'PROMOTION',
      entityId: promotion._id.toString(),
      description: `Admin updated promotion "${promotion.name}"`
    });

    const populated = await Promotion.findById(promotion._id)
      .populate('medicineIds', 'name mrp category')
      .populate('createdBy', 'name email');

    return ApiResponse.success(res, { promotion: populated }, 'Promotion updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle promotion active status
// @route   PATCH /api/promotions/:id/toggle
// @access  Private (ADMIN)
const togglePromotion = async (req, res, next) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      throw ApiError.notFound('Promotion not found');
    }

    promotion.isActive = !promotion.isActive;
    promotion.updatedBy = req.user._id;
    await promotion.save();

    await logAction({
      actorId: req.user._id,
      actorRole: 'ADMIN',
      action: promotion.isActive ? 'PROMOTION_ACTIVATED' : 'PROMOTION_DEACTIVATED',
      entity: 'PROMOTION',
      entityId: promotion._id.toString(),
      description: `Admin ${promotion.isActive ? 'activated' : 'deactivated'} promotion "${promotion.name}"`
    });

    return ApiResponse.success(
      res,
      { promotion },
      `Promotion ${promotion.isActive ? 'activated' : 'deactivated'} successfully`
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a promotion (soft: just deactivate)
// @route   DELETE /api/promotions/:id
// @access  Private (ADMIN)
const deletePromotion = async (req, res, next) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      throw ApiError.notFound('Promotion not found');
    }

    promotion.isActive = false;
    promotion.updatedBy = req.user._id;
    await promotion.save();

    await logAction({
      actorId: req.user._id,
      actorRole: 'ADMIN',
      action: 'PROMOTION_DELETED',
      entity: 'PROMOTION',
      entityId: promotion._id.toString(),
      description: `Admin soft-deleted promotion "${promotion.name}"`
    });

    return ApiResponse.success(res, null, 'Promotion deactivated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  togglePromotion,
  deletePromotion
};
