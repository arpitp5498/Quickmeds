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

    const query = {
      active: true,
      isMerged: { $ne: true },
      verificationStatus: { $ne: 'MERGED' }
    };

    if (q) {
      const searchRegex = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { name: searchRegex },
        { genericName: searchRegex },
        { brand: searchRegex },
        { composition: searchRegex },
        { aliases: searchRegex },
        { manufacturer: searchRegex },
        { category: searchRegex }
      ];
    }

    if (category && category !== 'All') {
      const catTrimmed = category.trim();
      const catEscaped = catTrimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      if (catTrimmed === 'Pain & Fever' || catTrimmed === 'Fever & Pain' || catTrimmed === 'Pain Relief') {
        query.category = { $in: ['Pain & Fever', 'Fever & Pain', 'Pain Relief'] };
      } else if (catTrimmed === 'Oral Rehydration & Electrolytes') {
        query.category = { $in: ['Oral Rehydration & Electrolytes', 'Digestive Care'] };
      } else if (catTrimmed === 'Gastrointestinal Care' || catTrimmed === 'Digestive Care' || catTrimmed === 'Digestive') {
        query.category = { $in: ['Gastrointestinal Care', 'Digestive Care', 'Digestive'] };
      } else if (catTrimmed === 'Acidity & Reflux') {
        query.category = { $in: ['Acidity & Reflux', 'Digestive Care'] };
      } else if (catTrimmed === 'Constipation & Diarrhoea') {
        query.category = { $in: ['Constipation & Diarrhoea', 'Digestive Care'] };
      } else if (catTrimmed === 'Allergy & Antihistamines') {
        query.category = { $in: ['Allergy & Antihistamines', 'Cold & Cough'] };
      } else if (catTrimmed === 'Respiratory & Asthma' || catTrimmed === 'Cold & Cough' || catTrimmed === 'Respiratory') {
        query.category = { $in: ['Respiratory & Asthma', 'Cold & Cough', 'Respiratory'] };
      } else if (catTrimmed === 'Diabetes Care' || catTrimmed === 'Diabetes') {
        query.category = { $in: ['Diabetes Care', 'Diabetes', 'Cardiac & Diabetes'] };
      } else if (catTrimmed === 'Cardiovascular Care' || catTrimmed === 'Cardiac') {
        query.category = { $in: ['Cardiovascular Care', 'Cardiac', 'Cardiac & Diabetes'] };
      } else if (catTrimmed === 'Dermatological & Skin Care' || catTrimmed === 'Skin Care' || catTrimmed === 'Skin & Personal Care') {
        query.category = { $in: ['Dermatological & Skin Care', 'Skin Care', 'Skin & Personal Care'] };
      } else if (catTrimmed === 'Wound Care & Antiseptics' || catTrimmed === 'First Aid & Surgical' || catTrimmed === 'First Aid') {
        query.category = { $in: ['Wound Care & Antiseptics', 'First Aid & Surgical', 'First Aid'] };
      } else if (catTrimmed === 'Eye, Ear & Nasal Care' || catTrimmed === 'Eye & Ear Drops') {
        query.category = { $in: ['Eye, Ear & Nasal Care', 'Eye & Ear Drops'] };
      } else if (catTrimmed === 'Vitamins & Mineral Supplements' || catTrimmed === 'Vitamins & Supplements' || catTrimmed === 'Vitamins') {
        query.category = { $in: ['Vitamins & Mineral Supplements', 'Vitamins & Supplements', 'Vitamins'] };
      } else if (catTrimmed === 'Bone & Nutritional Support') {
        query.category = { $in: ['Bone & Nutritional Support', 'Vitamins & Supplements'] };
      } else if (catTrimmed === 'Women Health & Hygiene' || catTrimmed === 'Women Care & Hygiene' || catTrimmed === 'Women Care') {
        query.category = { $in: ['Women Health & Hygiene', 'Women Care & Hygiene', 'Women Care', 'Menstrual Care', 'Comfort & Relief', 'Hygiene Essentials'] };
      } else if (catTrimmed === 'Pediatric Care' || catTrimmed === 'Pediatric') {
        query.category = { $in: ['Pediatric Care', 'Pediatric'] };
      } else if (catTrimmed === 'Essential Outpatient Medicines' || catTrimmed === 'Antibiotics & Anti-infectives' || catTrimmed === 'Antibiotics') {
        query.category = { $in: ['Essential Outpatient Medicines', 'Antibiotics & Anti-infectives', 'Antibiotics'] };
      } else {
        query.category = new RegExp(`^${catEscaped}$`, 'i');
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

    // Category counts for quick discovery navigation (excluding merged duplicates)
    const categoryCountsAgg = await Medicine.aggregate([
      { $match: { active: true, isMerged: { $ne: true }, verificationStatus: { $ne: 'MERGED' } } },
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

      // Exclude demo stores and suspicious prices from lowestPrice and available count
      const verifiedInventories = inventories.filter(
        (inv) =>
          inv.medicineId.toString() === med._id.toString() &&
          inv.pharmacyId &&
          !inv.isPriceSuspicious &&
          !inv.pharmacyId.isDemo
      );

      const allInventories = inventories.filter(
        (inv) => inv.medicineId.toString() === med._id.toString() && inv.pharmacyId
      );

      const activeInventories = verifiedInventories.length > 0 ? verifiedInventories : allInventories;

      medObj.availablePharmaciesCount = activeInventories.length;
      medObj.isAvailableNearby = activeInventories.length > 0;

      if (activeInventories.length > 0) {
        // Find best price among verified authentic pharmacies
        const prices = activeInventories.map((i) => i.price);
        medObj.lowestPrice = Math.min(...prices);

        if (userLat !== null && userLng !== null) {
          const distances = activeInventories.map((i) => {
            const [pLng, pLat] = i.pharmacyId.location.coordinates;
            return calculateDistance(userLat, userLng, pLat, pLng);
          });
          medObj.nearestDistanceKm = Math.min(...distances);
        }
      } else {
        medObj.lowestPrice = med.mrp;
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
    let medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      throw ApiError.notFound('Medicine not found');
    }

    // Seamlessly forward merged duplicates to canonical record
    if (medicine.isMerged && medicine.canonicalMedicineId) {
      const canonical = await Medicine.findById(medicine.canonicalMedicineId);
      if (canonical) {
        medicine = canonical;
      }
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
        if (userLat !== null && userLng !== null && pharmacy.location && pharmacy.location.coordinates) {
          const [pLng, pLat] = pharmacy.location.coordinates;
          distanceKm = calculateDistance(userLat, userLng, pLat, pLng);
        }

        const discountPercentage =
          medicine.mrp > 0 && item.price < medicine.mrp
            ? Math.round(((medicine.mrp - item.price) / medicine.mrp) * 100)
            : (item.discountPercentage || 0);

        const isDemo = Boolean(pharmacy.isDemo);
        const isPriceSuspicious = Boolean(item.isPriceSuspicious);

        return {
          inventoryId: item._id,
          pharmacyId: pharmacy._id,
          name: pharmacy.name,
          address: pharmacy.address,
          phone: pharmacy.phone,
          rating: pharmacy.rating || 4.5,
          totalRatings: pharmacy.totalRatings || 0,
          isOpen: pharmacy.isOpen !== false,
          is24x7: Boolean(pharmacy.is24x7),
          price: item.price,
          mrp: medicine.mrp,
          discountPercentage,
          stockQuantity: item.stockQuantity,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
          distanceKm: parseFloat(distanceKm.toFixed(1)),
          estimatedMinutes: Math.round(15 + distanceKm * 3),
          isPriceSuspicious,
          isDemo,
          isRecommended: !isDemo && !isPriceSuspicious && (pharmacy.rating >= 4.5 || distanceKm < 3)
        };
      })
      .sort((a, b) => {
        // Genuine non-demo first
        if (a.isDemo !== b.isDemo) return a.isDemo ? 1 : -1;
        // Clean non-suspicious prices first
        if (a.isPriceSuspicious !== b.isPriceSuspicious) return a.isPriceSuspicious ? 1 : -1;
        // Lowest price first
        if (a.price !== b.price) return a.price - b.price;
        // Nearest distance
        return a.distanceKm - b.distanceKm;
      });

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
      { $match: { active: true, isMerged: { $ne: true }, verificationStatus: { $ne: 'MERGED' } } },
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
    const medicines = await Medicine.find({
      active: true,
      isMerged: { $ne: true },
      verificationStatus: { $ne: 'MERGED' }
    })
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
    const { lat, lng } = req.query;

    const query = {
      active: true,
      isMerged: { $ne: true },
      verificationStatus: { $ne: 'MERGED' },
      $or: [
        { sosEligible: true },
        {
          name: {
            $in: [
              'Sanitary Pads – Regular (Whisper Choice)',
              'Sanitary Pads – XL (Whisper Ultra Clean)',
              'Tampons (O.B. ProComfort Regular)',
              'Menstrual Cup (Sirona Reusable Medium)',
              'Heating Pad / Hot Water Bottle (Flamingo)',
              'Heat Patch (Nua Cramp Comfort 3 Patches)',
              'Electral ORS Powder (21.8g Sachet)',
              'Dolo 650mg Tablet',
              'Combiflam Tablet',
              'Unscented Wet Wipes (Himalaya Gentle 72s)',
              'Tissues (Paseo Soft Facial Tissue Box)',
              'Disposable Sanitary-Waste Bags (Sirona 15s)',
              'Hand Sanitizer (Dettol Instant 100ml)',
              'VWash Plus Intimate Hygiene Wash (200ml)'
            ]
          }
        }
      ]
    };

    const medicines = await Medicine.find(query);

    // Map each item to its SOS category
    const categoryMapping = {
      // 1. Menstrual Care
      'Sanitary Pads – Regular (Whisper Choice)': 'MENSTRUAL_CARE',
      'Sanitary Pads – XL (Whisper Ultra Clean)': 'MENSTRUAL_CARE',
      'Tampons (O.B. ProComfort Regular)': 'MENSTRUAL_CARE',
      'Menstrual Cup (Sirona Reusable Medium)': 'MENSTRUAL_CARE',
      // 2. Comfort & Relief
      'Heating Pad / Hot Water Bottle (Flamingo)': 'COMFORT_RELIEF',
      'Heat Patch (Nua Cramp Comfort 3 Patches)': 'COMFORT_RELIEF',
      'Electral ORS Powder (21.8g Sachet)': 'COMFORT_RELIEF',
      'Dolo 650mg Tablet': 'COMFORT_RELIEF',
      'Combiflam Tablet': 'COMFORT_RELIEF',
      // 3. Hygiene Essentials
      'Unscented Wet Wipes (Himalaya Gentle 72s)': 'HYGIENE_ESSENTIALS',
      'Tissues (Paseo Soft Facial Tissue Box)': 'HYGIENE_ESSENTIALS',
      'Disposable Sanitary-Waste Bags (Sirona 15s)': 'HYGIENE_ESSENTIALS',
      'Hand Sanitizer (Dettol Instant 100ml)': 'HYGIENE_ESSENTIALS',
      'VWash Plus Intimate Hygiene Wash (200ml)': 'HYGIENE_ESSENTIALS'
    };

    // Populate inventory lowest prices
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

    const formatted = medicines.map((m) => {
      const obj = m.toObject();
      const catKey = m.sosCategory || categoryMapping[m.name] || 'COMFORT_RELIEF';

      const verifiedInventories = inventories.filter(
        (inv) =>
          inv.medicineId.toString() === m._id.toString() &&
          inv.pharmacyId &&
          !inv.isPriceSuspicious &&
          !inv.pharmacyId.isDemo
      );

      const allInventories = inventories.filter(
        (inv) => inv.medicineId.toString() === m._id.toString() && inv.pharmacyId
      );

      const activeInventories = verifiedInventories.length > 0 ? verifiedInventories : allInventories;

      let lowestPrice = m.mrp;
      if (activeInventories.length > 0) {
        lowestPrice = Math.min(...activeInventories.map((i) => i.price));
      }

      return {
        ...obj,
        sosCategory: catKey,
        lowestPrice,
        availabilityStatus: 'Available at nearby verified pharmacies'
      };
    });

    const categories = {
      MENSTRUAL_CARE: formatted.filter((m) => m.sosCategory === 'MENSTRUAL_CARE'),
      COMFORT_RELIEF: formatted.filter((m) => m.sosCategory === 'COMFORT_RELIEF'),
      HYGIENE_ESSENTIALS: formatted.filter((m) => m.sosCategory === 'HYGIENE_ESSENTIALS')
    };

    return ApiResponse.success(
      res,
      {
        categories,
        medicines: formatted,
        totalCount: formatted.length
      },
      'Curated SOS Emergency Essentials fetched successfully'
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
