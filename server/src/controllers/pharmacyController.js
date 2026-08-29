const Pharmacy = require('../models/Pharmacy');
const PharmacyInventory = require('../models/PharmacyInventory');
const Review = require('../models/Review');
const { calculateDistance, estimateDeliveryTime } = require('../utils/geo');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// @desc    Discover nearby verified pharmacies based on coordinates
// @route   GET /api/pharmacies/nearby
// @access  Public
const getNearbyPharmacies = async (req, res, next) => {
  try {
    const {
      lat = 28.6139,
      lng = 77.209,
      maxDistanceKm = 15,
      search,
      isOpenOnly,
      inStockOnly,
      is24x7,
      sort = 'nearest'
    } = req.query;

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    const filter = {
      verificationStatus: 'VERIFIED'
    };

    if (isOpenOnly === 'true') {
      filter.isOpen = true;
    }

    if (is24x7 === 'true') {
      filter['operatingHours.is24x7'] = true;
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { 'address.city': searchRegex },
        { 'address.street': searchRegex }
      ];
    }

    const pharmacies = await Pharmacy.find(filter);

    // Compute live available inventory count per pharmacy
    const inventoryCounts = await PharmacyInventory.aggregate([
      { $match: { isAvailable: true, stockQuantity: { $gt: 0 } } },
      {
        $group: {
          _id: '$pharmacyId',
          totalItems: { $sum: 1 },
          totalStock: { $sum: '$stockQuantity' }
        }
      }
    ]);

    const inventoryMap = {};
    inventoryCounts.forEach((inv) => {
      inventoryMap[inv._id.toString()] = {
        totalItems: inv.totalItems,
        totalStock: inv.totalStock
      };
    });

    // Calculate real distance and enrich with inventory for each pharmacy
    let pharmaciesWithDistance = pharmacies.map((pharmacy) => {
      const pObj = pharmacy.toObject();
      let distanceKm = 2.0;

      if (pharmacy.location && pharmacy.location.coordinates) {
        const [pLng, pLat] = pharmacy.location.coordinates;
        distanceKm = calculateDistance(userLat, userLng, pLat, pLng);
      }

      const eta = estimateDeliveryTime(distanceKm);
      const invData = inventoryMap[pharmacy._id.toString()] || {
        totalItems: 0,
        totalStock: 0
      };

      return {
        ...pObj,
        distanceKm: parseFloat(distanceKm.toFixed(2)),
        etaMinutes: eta.totalMinutes,
        etaText: eta.displayText,
        availableInventoryCount: invData.totalItems,
        totalStockUnits: invData.totalStock
      };
    });

    // Stock availability filter
    if (inStockOnly === 'true') {
      pharmaciesWithDistance = pharmaciesWithDistance.filter(
        (p) => p.availableInventoryCount > 0
      );
    }

    // Filter within service radius
    const radiusLimit = parseFloat(maxDistanceKm) || 15;
    const withinRadius = pharmaciesWithDistance.filter(
      (p) => p.distanceKm <= radiusLimit
    );

    // Sort
    if (sort === 'nearest') {
      withinRadius.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sort === 'rating') {
      withinRadius.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'orders') {
      withinRadius.sort(
        (a, b) => (b.totalOrdersCompleted || 0) - (a.totalOrdersCompleted || 0)
      );
    } else if (sort === 'inventory') {
      withinRadius.sort(
        (a, b) => (b.availableInventoryCount || 0) - (a.availableInventoryCount || 0)
      );
    }

    return ApiResponse.success(res, {
      pharmacies: withinRadius,
      count: withinRadius.length,
      userLocation: { lat: userLat, lng: userLng },
      radiusKm: radiusLimit
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pharmacy details with its active inventory and reviews
// @route   GET /api/pharmacies/:id
// @access  Public
const getPharmacyById = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    const pharmacy = await Pharmacy.findById(req.params.id);

    if (!pharmacy) {
      throw ApiError.notFound('Pharmacy not found');
    }

    // Fetch active inventory for this pharmacy
    const inventory = await PharmacyInventory.find({
      pharmacyId: pharmacy._id,
      isAvailable: true
    }).populate('medicineId');

    // Fetch recent reviews
    const reviews = await Review.find({ pharmacyId: pharmacy._id })
      .populate('customerId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    const pObj = pharmacy.toObject();
    if (lat && lng && pharmacy.location) {
      const [pLng, pLat] = pharmacy.location.coordinates;
      const distanceKm = calculateDistance(parseFloat(lat), parseFloat(lng), pLat, pLng);
      const eta = estimateDeliveryTime(distanceKm);
      pObj.distanceKm = distanceKm;
      pObj.etaMinutes = eta.totalMinutes;
      pObj.etaText = eta.displayText;
    }

    return ApiResponse.success(res, {
      pharmacy: pObj,
      inventory,
      reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in pharmacy profile
// @route   GET /api/pharmacies/profile/me
// @access  Private (PHARMACY)
const getMyPharmacyProfile = async (req, res, next) => {
  try {
    let pharmacy = null;
    if (req.user.pharmacyId) {
      pharmacy = await Pharmacy.findById(req.user.pharmacyId);
    } else {
      pharmacy = await Pharmacy.findOne({ userId: req.user._id });
    }

    if (!pharmacy) {
      throw ApiError.notFound('Pharmacy record not found for this account.');
    }

    return ApiResponse.success(res, { pharmacy });
  } catch (error) {
    next(error);
  }
};

// @desc    Update pharmacy details
// @route   PUT /api/pharmacies/profile/me
// @access  Private (PHARMACY)
const updateMyPharmacyProfile = async (req, res, next) => {
  try {
    const pharmacy = await Pharmacy.findOne({ userId: req.user._id });
    if (!pharmacy) {
      throw ApiError.notFound('Pharmacy not found');
    }

    const {
      name,
      tagline,
      phone,
      email,
      address,
      operatingHours,
      serviceRadiusKm,
      deliveryAvailable,
      isOpen,
      coordinates
    } = req.body;

    if (name) pharmacy.name = name;
    if (tagline !== undefined) pharmacy.tagline = tagline;
    if (phone) pharmacy.phone = phone;
    if (email) pharmacy.email = email;
    if (address) pharmacy.address = { ...pharmacy.address, ...address };
    if (operatingHours) pharmacy.operatingHours = { ...pharmacy.operatingHours, ...operatingHours };
    if (serviceRadiusKm) pharmacy.serviceRadiusKm = serviceRadiusKm;
    if (deliveryAvailable !== undefined) pharmacy.deliveryAvailable = deliveryAvailable;
    if (isOpen !== undefined) pharmacy.isOpen = isOpen;

    if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
      pharmacy.location = {
        type: 'Point',
        coordinates
      };
    }

    await pharmacy.save();
    return ApiResponse.success(res, { pharmacy }, 'Pharmacy profile updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNearbyPharmacies,
  getPharmacyById,
  getMyPharmacyProfile,
  updateMyPharmacyProfile
};
