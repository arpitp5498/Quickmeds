const Medicine = require('../models/Medicine');
const PharmacyInventory = require('../models/PharmacyInventory');
const Pharmacy = require('../models/Pharmacy');
const { calculateDistance } = require('../utils/geo');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// @desc    Search medicines with filters, pagination, and stock checks
// @route   GET /api/medicines
// @access  Public
const searchMedicines = async (req, res, next) => {
  try {
    const {
      q,
      category,
      requiresPrescription,
      page = 1,
      limit = 20,
      sort = 'popular',
      lat,
      lng
    } = req.query;

    const query = { active: true };

    if (q) {
      const searchRegex = new RegExp(q.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { genericName: searchRegex },
        { brand: searchRegex },
        { category: searchRegex }
      ];
    }

    if (category && category !== 'All') {
      const catTrimmed = category.trim();
      if (catTrimmed === 'Fever & Pain' || catTrimmed === 'Pain Relief') {
        query.category = { $in: ['Fever & Pain', 'Pain Relief', 'Pediatric'] };
      } else if (catTrimmed === 'Cold & Cough' || catTrimmed === 'Respiratory') {
        query.category = { $in: ['Cold & Cough', 'Respiratory'] };
      } else if (catTrimmed === 'Cardiac & Diabetes' || catTrimmed === 'Cardiac' || catTrimmed === 'Diabetes') {
        query.category = { $in: ['Cardiac & Diabetes', 'Cardiac', 'Diabetes'] };
      } else if (catTrimmed === 'Antibiotics & Anti-infectives' || catTrimmed === 'Antibiotics') {
        query.category = { $in: ['Antibiotics & Anti-infectives', 'Antibiotics'] };
      } else if (catTrimmed === 'Digestive Care') {
        query.category = { $in: ['Digestive Care'] };
      } else if (catTrimmed === 'Vitamins & Supplements' || catTrimmed === 'Vitamins') {
        query.category = { $in: ['Vitamins & Supplements', 'Vitamins'] };
      } else if (catTrimmed === 'First Aid & Surgical' || catTrimmed === 'First Aid') {
        query.category = { $in: ['First Aid & Surgical', 'First Aid'] };
      } else if (catTrimmed === 'Women Care & Hygiene' || catTrimmed === 'Women Care' || catTrimmed === 'Skin & Personal Care') {
        query.category = { $in: ['Women Care & Hygiene', 'Women Care', 'Skin & Personal Care'] };
      } else {
        query.category = new RegExp(`^${catTrimmed}$`, 'i');
      }
    }

    if (requiresPrescription !== undefined) {
      query.requiresPrescription = requiresPrescription === 'true';
    }

    let sortOptions = { name: 1 };
    if (sort === 'price_asc') sortOptions = { mrp: 1 };
    if (sort === 'price_desc') sortOptions = { mrp: -1 };
    if (sort === 'popular') sortOptions = { createdAt: -1 };

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Medicine.countDocuments(query);
    const medicines = await Medicine.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit, 10));

    // Category counts for quick discovery navigation
    const categoryCountsAgg = await Medicine.aggregate([
      { $match: { active: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const categoryCounts = {};
    categoryCountsAgg.forEach((c) => {
      if (c._id) categoryCounts[c._id] = c.count;
    });

    // Check available pharmacies count for each medicine
    const medicineIds = medicines.map((m) => m._id);
    const inventories = await PharmacyInventory.find({
      medicineId: { $in: medicineIds },
      isAvailable: true,
      stockQuantity: { $gt: 0 }
    }).populate({
      path: 'pharmacyId',
      match: { verificationStatus: 'VERIFIED' }
    });

    const userLat = lat ? parseFloat(lat) : null;
    const userLng = lng ? parseFloat(lng) : null;

    const results = medicines.map((med) => {
      const medObj = med.toObject();
      const matchingInventories = inventories.filter(
        (inv) => inv.medicineId.toString() === med._id.toString() && inv.pharmacyId
      );

      medObj.availablePharmaciesCount = matchingInventories.length;
      medObj.isAvailableNearby = matchingInventories.length > 0;

      if (matchingInventories.length > 0) {
        // Find best price among verified pharmacies
        const prices = matchingInventories.map((i) => i.price);
        medObj.lowestPrice = Math.min(...prices);

        if (userLat !== null && userLng !== null) {
          const distances = matchingInventories.map((i) => {
            const [pLng, pLat] = i.pharmacyId.location.coordinates;
            return calculateDistance(userLat, userLng, pLat, pLng);
          });
          medObj.nearestDistanceKm = Math.min(...distances);
        }
      }

      return medObj;
    });

    return ApiResponse.success(res, {
      medicines: results,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / limit)
      },
      categoryCounts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get medicine details and available pharmacies stocking it
// @route   GET /api/medicines/:id
// @access  Public
const getMedicineById = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      throw ApiError.notFound('Medicine not found');
    }

    // Find all verified pharmacies stocking this medicine
    const inventoryList = await PharmacyInventory.find({
      medicineId: medicine._id,
      isAvailable: true,
      stockQuantity: { $gt: 0 }
    }).populate({
      path: 'pharmacyId',
      match: { verificationStatus: 'VERIFIED' }
    });

    const userLat = lat ? parseFloat(lat) : null;
    const userLng = lng ? parseFloat(lng) : null;

    const pharmaciesWithStock = inventoryList
      .filter((item) => item.pharmacyId)
      .map((item) => {
        const pharmacy = item.pharmacyId;
        let distanceKm = 2.5; // default estimate
        if (userLat !== null && userLng !== null && pharmacy.location) {
          const [pLng, pLat] = pharmacy.location.coordinates;
          distanceKm = calculateDistance(userLat, userLng, pLat, pLng);
        }

        return {
          pharmacyId: pharmacy._id,
          name: pharmacy.name,
          address: pharmacy.address,
          phone: pharmacy.phone,
          rating: pharmacy.rating,
          totalRatings: pharmacy.totalRatings,
          isOpen: pharmacy.isOpen,
          price: item.price,
          mrp: medicine.mrp,
          discountPercentage: item.discountPercentage,
          stockQuantity: item.stockQuantity,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
          distanceKm,
          estimatedMinutes: Math.round(15 + distanceKm * 3)
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return ApiResponse.success(res, {
      medicine,
      pharmacies: pharmaciesWithStock
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all medicine categories
// @route   GET /api/medicines/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categories = await Medicine.aggregate([
      { $match: { active: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const formatted = categories.map((c) => ({
      name: c._id,
      count: c.count
    }));

    return ApiResponse.success(res, { categories: formatted });
  } catch (error) {
    next(error);
  }
};

// @desc    Get popular / emergency essential medicines
// @route   GET /api/medicines/popular
// @access  Public
const getPopularMedicines = async (req, res, next) => {
  try {
    const medicines = await Medicine.find({ active: true })
      .limit(8)
      .sort({ createdAt: 1 });
    return ApiResponse.success(res, { medicines });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Create new medicine catalog entry
// @route   POST /api/medicines
// @access  Private (ADMIN)
const createMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.create(req.body);
    return ApiResponse.created(res, { medicine }, 'Medicine created in catalog');
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update medicine
// @route   PUT /api/medicines/:id
// @access  Private (ADMIN)
const updateMedicine = async (req, res, next) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!medicine) {
      throw ApiError.notFound('Medicine not found');
    }
    return ApiResponse.success(res, { medicine }, 'Medicine updated');
  } catch (error) {
    next(error);
  }
};

// @desc    Get curated SOS / Emergency Essentials catalog
// @route   GET /api/medicines/emergency-essentials
// @access  Public
const getEmergencyEssentials = async (req, res, next) => {
  try {
    const { category } = req.query;

    const emergencyMedicineNames = [
      'Dolo 650mg Tablet',
      'Crocin 500 Advance Tablet',
      'Combiflam Tablet',
      'Volini Pain Relief Gel (50g)',
      'Asthalin 100mcg Inhaler',
      'Otrivin Oxy Fast Relief Nasal Spray (10ml)',
      'Benadryl Cough Formula Syrup (150ml)',
      'Electral ORS Powder (21.8g Sachet)',
      'Digene Acidity Relief Gel Mint (200ml)',
      'Betadine 10% Microbicidal Ointment (20g)',
      'Dettol Antiseptic Liquid (250ml)',
      'Hansaplast Regular Bandage Strips (Pack of 20)',
      'Saridon Headache Relief Tablet',
      'Meftal Spas Tablet'
    ];

    let query = {
      active: true,
      name: { $in: emergencyMedicineNames }
    };

    if (category && category !== 'All') {
      if (category === 'Fever & Pain') {
        query.name = {
          $in: [
            'Dolo 650mg Tablet',
            'Crocin 500 Advance Tablet',
            'Combiflam Tablet',
            'Volini Pain Relief Gel (50g)',
            'Saridon Headache Relief Tablet',
            'Meftal Spas Tablet'
          ]
        };
      } else if (category === 'Cold & Cough') {
        query.name = {
          $in: [
            'Benadryl Cough Formula Syrup (150ml)',
            'Otrivin Oxy Fast Relief Nasal Spray (10ml)',
            'Asthalin 100mcg Inhaler'
          ]
        };
      } else if (category === 'First Aid') {
        query.name = {
          $in: [
            'Betadine 10% Microbicidal Ointment (20g)',
            'Dettol Antiseptic Liquid (250ml)',
            'Hansaplast Regular Bandage Strips (Pack of 20)'
          ]
        };
      } else if (category === 'Hydration & Digestion' || category === 'Hydration') {
        query.name = {
          $in: [
            'Electral ORS Powder (21.8g Sachet)',
            'Digene Acidity Relief Gel Mint (200ml)'
          ]
        };
      } else if (category === 'Respiratory') {
        query.name = {
          $in: [
            'Asthalin 100mcg Inhaler',
            'Otrivin Oxy Fast Relief Nasal Spray (10ml)'
          ]
        };
      }
    }

    const medicines = await Medicine.find(query);

    const tagMap = {
      'Dolo 650mg Tablet': { emergencyCategory: 'Fever & Pain', priority: 1 },
      'Crocin 500 Advance Tablet': { emergencyCategory: 'Fever & Pain', priority: 2 },
      'Combiflam Tablet': { emergencyCategory: 'Fever & Pain', priority: 3 },
      'Volini Pain Relief Gel (50g)': { emergencyCategory: 'Fever & Pain', priority: 4 },
      'Asthalin 100mcg Inhaler': { emergencyCategory: 'Respiratory', priority: 5 },
      'Otrivin Oxy Fast Relief Nasal Spray (10ml)': { emergencyCategory: 'Cold & Cough', priority: 6 },
      'Benadryl Cough Formula Syrup (150ml)': { emergencyCategory: 'Cold & Cough', priority: 7 },
      'Electral ORS Powder (21.8g Sachet)': { emergencyCategory: 'Hydration & Digestion', priority: 8 },
      'Digene Acidity Relief Gel Mint (200ml)': { emergencyCategory: 'Hydration & Digestion', priority: 9 },
      'Betadine 10% Microbicidal Ointment (20g)': { emergencyCategory: 'First Aid', priority: 10 },
      'Dettol Antiseptic Liquid (250ml)': { emergencyCategory: 'First Aid', priority: 11 },
      'Hansaplast Regular Bandage Strips (Pack of 20)': { emergencyCategory: 'First Aid', priority: 12 },
      'Saridon Headache Relief Tablet': { emergencyCategory: 'Fever & Pain', priority: 13 },
      'Meftal Spas Tablet': { emergencyCategory: 'Fever & Pain', priority: 14 }
    };

    const formatted = medicines
      .map((m) => {
        const obj = m.toObject();
        const meta = tagMap[m.name] || { emergencyCategory: m.category, priority: 99 };
        return {
          ...obj,
          emergencyCategory: meta.emergencyCategory,
          priority: meta.priority,
          availabilityStatus: 'Available at nearby verified pharmacies'
        };
      })
      .sort((a, b) => a.priority - b.priority);

    return ApiResponse.success(
      res,
      { medicines: formatted, totalCount: formatted.length },
      'Emergency essentials fetched successfully'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  searchMedicines,
  getMedicineById,
  getCategories,
  getPopularMedicines,
  getEmergencyEssentials,
  createMedicine,
  updateMedicine
};
