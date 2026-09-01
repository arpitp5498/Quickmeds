/**
 * QuickMeds Smart Fulfilment Routing & Basket Optimization Engine
 * File: server/src/services/smartRoutingService.js
 */

const Pharmacy = require('../models/Pharmacy');
const PharmacyInventory = require('../models/PharmacyInventory');
const { calculateDistance, calculateDeliveryFee } = require('../utils/geo');

// Configurable Scoring Weights (QuickMeds Standard)
const SCORING_WEIGHTS = {
  AVAILABILITY: 0.35, // 35%
  PROXIMITY: 0.25,    // 25%
  ETA: 0.15,          // 15%
  PRICE: 0.15,        // 15%
  RATING: 0.10        // 10%
};

const DEFAULT_MAX_DISTANCE_KM = 15.0;
const MAX_ETA_MINUTES_HORIZON = 60.0;
const PLATFORM_FEE = 5; // Safety & Packaging charge
const BASE_PREP_MINUTES = 5;

/**
 * Calculate ETA in minutes based on distance
 * Formula: 5 min prep + ceil(distanceKm * 3 min/km)
 */
const calculateETA = (distanceKm) => {
  const safeDistance = Math.max(0, Number(distanceKm) || 0);
  const travelMinutes = Math.ceil(safeDistance * 3);
  const totalMinutes = BASE_PREP_MINUTES + travelMinutes;
  return {
    prepMinutes: BASE_PREP_MINUTES,
    travelMinutes,
    totalMinutes: Math.max(12, totalMinutes),
    displayText: `${Math.max(12, totalMinutes)} mins (Target)`
  };
};

/**
 * Calculate individual scores and composite score for a single candidate pharmacy
 */
const scorePharmacyCandidate = ({
  availableCount = 0,
  totalItemsCount = 1,
  distanceKm = 0,
  maxDistanceKm = DEFAULT_MAX_DISTANCE_KM,
  etaMinutes = 15,
  basketPrice = 0,
  minBasketPrice = 0,
  maxBasketPrice = 0,
  rating = 4.5
}) => {
  // 1. Availability Score (0.0 to 1.0)
  const availabilityScore = totalItemsCount > 0 
    ? Math.min(1.0, Math.max(0, availableCount / totalItemsCount)) 
    : 0;

  // 2. Proximity Score (0.0 to 1.0)
  const safeMaxDist = maxDistanceKm > 0 ? maxDistanceKm : DEFAULT_MAX_DISTANCE_KM;
  const proximityScore = Math.max(0, Math.min(1.0, 1 - (distanceKm / safeMaxDist)));

  // 3. ETA Score (0.0 to 1.0)
  const etaScore = Math.max(0, Math.min(1.0, 1 - (etaMinutes / MAX_ETA_MINUTES_HORIZON)));

  // 4. Demo Price Competitiveness Score (0.0 to 1.0)
  let priceScore = 1.0;
  if (maxBasketPrice > minBasketPrice) {
    priceScore = Math.max(0, Math.min(1.0, 1 - ((basketPrice - minBasketPrice) / (maxBasketPrice - minBasketPrice))));
  }

  // 5. Rating / Reliability Score (0.0 to 1.0)
  const safeRating = rating && rating > 0 ? rating : 4.5;
  const ratingScore = Math.min(1.0, Math.max(0, safeRating / 5.0));

  // Composite Weighted Score
  const compositeScore = (
    SCORING_WEIGHTS.AVAILABILITY * availabilityScore +
    SCORING_WEIGHTS.PROXIMITY * proximityScore +
    SCORING_WEIGHTS.ETA * etaScore +
    SCORING_WEIGHTS.PRICE * priceScore +
    SCORING_WEIGHTS.RATING * ratingScore
  );

  return {
    compositeScore: Number(compositeScore.toFixed(4)),
    breakdown: {
      availability: Number(availabilityScore.toFixed(4)),
      proximity: Number(proximityScore.toFixed(4)),
      eta: Number(etaScore.toFixed(4)),
      price: Number(priceScore.toFixed(4)),
      rating: Number(ratingScore.toFixed(4))
    }
  };
};

/**
 * Calculate basket price for items given an array of inventory items
 */
const calculateBasketPrice = (cartItems = [], inventories = []) => {
  let subtotal = 0;
  for (const item of cartItems) {
    if (!item) continue;
    const medIdStr = item?.medicineId?._id 
      ? item.medicineId._id.toString() 
      : (item?.medicineId ? item.medicineId.toString() : '');
    const inv = medIdStr ? inventories.find(i => {
      const invMedId = (i.medicineId?._id || i.medicineId || '').toString();
      return invMedId && invMedId === medIdStr;
    }) : null;
    const reqQty = Math.max(1, parseInt(item?.quantity, 10) || 1);
    const unitPrice = inv?.price !== undefined ? inv.price : (item?.price || 50);
    subtotal += unitPrice * reqQty;
  }
  return subtotal;
};

/**
 * Pairwise set-cover search for split-basket fulfilment
 */
const findSplitBasketOption = (partialCandidates = [], totalItemsCount = 1) => {
  if (!partialCandidates || partialCandidates.length < 2) {
    return null;
  }

  let bestPair = null;
  let maxPairCoverage = 0;
  let highestJointScore = -1;

  for (let i = 0; i < partialCandidates.length; i++) {
    for (let j = i + 1; j < partialCandidates.length; j++) {
      const pA = partialCandidates[i];
      const pB = partialCandidates[j];

      const coveredMedIds = new Set([
        ...pA.availableItems.map(it => it.medicineId),
        ...pB.availableItems.map(it => it.medicineId)
      ]);

      const jointCoverage = totalItemsCount > 0 
        ? Math.min(1.0, Math.max(0, coveredMedIds.size / totalItemsCount)) 
        : 0;
      const jointScore = (pA.compositeScore + pB.compositeScore) / 2;

      if (jointCoverage > maxPairCoverage || (jointCoverage === maxPairCoverage && jointScore > highestJointScore)) {
        maxPairCoverage = jointCoverage;
        highestJointScore = jointScore;
        bestPair = { pA, pB, jointCoverage, jointScore };
      }
    }
  }

  return bestPair;
};

/**
 * Generate human-readable explanation of why a plan was selected
 */
const generateExplanation = (plan, type = 'SINGLE_STORE') => {
  if (!plan) return 'No eligible pharmacy plan available.';

  if (type === 'SINGLE_STORE') {
    const pharmacy = plan.pharmacies && plan.pharmacies[0] ? plan.pharmacies[0] : { name: 'Pharmacy', distanceKm: 0 };
    const scorePct = Math.round((plan.compositeScore || 0) * 100);
    const coveragePct = Math.round((plan.basketCoverage || 0) * 100);
    return `${pharmacy.name} selected as optimal single-store fulfilment point with ${coveragePct}% stock coverage, ${pharmacy.distanceKm || 0} km distance, and estimated ${plan.etaMinutes || 15} min delivery (Composite Score: ${scorePct}%).`;
  }

  if (type === 'SPLIT_BASKET') {
    const names = (plan.pharmacies || []).map(p => p.name).join(' + ');
    return `Split-basket fulfilment across ${plan.fulfilmentPoints || 2} pharmacies (${names}) selected to guarantee 100% medicine availability that no single store could fulfill alone.`;
  }

  return 'Fulfilment plan optimized according to availability, proximity, ETA, demo pricing, and partner reliability.';
};

/**
 * Optimize Fulfilment Plan given cart items and patient coordinates
 *
 * @param {Array} cartItems - [{ medicineId, quantity, name, price, mrp }]
 * @param {Array|Object} coordinates - [longitude, latitude] or { lat, lng }
 * @param {Object|number} options - { maxDistanceKm, excludePharmacyIds } or maxDistanceKm
 * @returns {Object} Optimized routing payload
 */
const optimizeFulfilmentPlan = async (cartItems, coordinates, options = {}) => {
  const opts = typeof options === 'number' ? { maxDistanceKm: options } : (options || {});
  const {
    maxDistanceKm = DEFAULT_MAX_DISTANCE_KM,
    excludePharmacyIds = []
  } = opts;

  if (!cartItems || cartItems.length === 0) {
    return {
      recommended: null,
      alternative: null,
      allCandidates: [],
      basketCoverage: 0,
      totalOrderValue: 0,
      fulfilmentPoints: 0,
      explanation: 'Cart is empty. Please add medicines to compute fulfilment plan.'
    };
  }

  let lng = 77.2090;
  let lat = 28.6139;
  if (Array.isArray(coordinates) && coordinates.length === 2) {
    lng = Number(coordinates[0]) || 77.2090;
    lat = Number(coordinates[1]) || 28.6139;
  } else if (coordinates && typeof coordinates === 'object') {
    lat = Number(coordinates.lat || coordinates.latitude || 28.6139);
    lng = Number(coordinates.lng || coordinates.longitude || 77.2090);
  }

  // Extract medicine IDs safely
  const medicineIds = cartItems
    .map(item => {
      if (!item) return null;
      if (item.medicineId?._id) return item.medicineId._id.toString();
      if (item.medicineId) return item.medicineId.toString();
      return null;
    })
    .filter(Boolean);
  const totalItemsCount = cartItems.length;

  // 1. Fetch verified, open pharmacies within radius
  const query = {
    verificationStatus: 'VERIFIED',
    isOpen: true
  };

  const formattedExcludeIds = excludePharmacyIds.map(id => id?.toString ? id.toString() : String(id));
  if (formattedExcludeIds.length > 0) {
    query._id = { $nin: formattedExcludeIds };
  }

  let pharmacies = [];
  try {
    pharmacies = await Pharmacy.find({
      ...query,
      location: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: maxDistanceKm * 1000
        }
      }
    }).limit(15);
  } catch (geoErr) {
    pharmacies = await Pharmacy.find(query).limit(15);
  }

  // Fallback: If no pharmacy found via $nearSphere, query all matching verified
  if (!pharmacies || pharmacies.length === 0) {
    pharmacies = await Pharmacy.find(query).limit(10);
  }

  if (!pharmacies || pharmacies.length === 0) {
    return {
      recommended: null,
      alternative: null,
      allCandidates: [],
      basketCoverage: 0,
      totalOrderValue: 0,
      fulfilmentPoints: 0,
      explanation: 'No verified pharmacies available within the service radius.'
    };
  }

  // 2. Fetch inventory for each pharmacy
  const candidateEvaluations = [];

  for (const pharmacy of pharmacies) {
    const coords = pharmacy.location?.coordinates || [77.2090, 28.6139];
    const [pLng, pLat] = coords;
    const distanceKm = calculateDistance(lat, lng, pLat, pLng);
    const etaObj = calculateETA(distanceKm);
    const deliveryFee = calculateDeliveryFee(distanceKm);

    // Query inventory items for this pharmacy
    const inventories = await PharmacyInventory.find({
      pharmacyId: pharmacy._id,
      medicineId: { $in: medicineIds },
      isAvailable: true
    }).populate('medicineId');

    const availableItems = [];
    const missingItems = [];
    let basketPrice = 0;

    for (const item of cartItems) {
      if (!item) continue;
      const medIdStr = item?.medicineId?._id 
        ? item.medicineId._id.toString() 
        : (item?.medicineId ? item.medicineId.toString() : '');
      const inv = medIdStr ? inventories.find(i => {
        const invMedId = (i.medicineId?._id || i.medicineId || '').toString();
        return invMedId && invMedId === medIdStr;
      }) : null;
      const reqQty = Math.max(1, parseInt(item?.quantity, 10) || 1);
      const stock = inv ? (inv.stockQuantity !== undefined ? inv.stockQuantity : (inv.stock || 0)) : 0;
      const isExpired = inv?.expiryDate ? new Date(inv.expiryDate) <= new Date() : false;

      if (medIdStr && inv && stock >= reqQty && !isExpired) {
        const unitPrice = (item.price !== undefined && item.price > 0) ? item.price : (inv.price !== undefined ? inv.price : 50);
        const itemTotal = unitPrice * reqQty;
        basketPrice += itemTotal;
        availableItems.push({
          medicineId: medIdStr,
          name: item.name || inv.medicineId?.name || 'Medicine',
          requestedQty: reqQty,
          stockAvailable: stock,
          unitPrice,
          totalPrice: itemTotal
        });
      } else {
        missingItems.push({
          medicineId: medIdStr || 'unknown',
          name: item.name || 'Medicine',
          requestedQty: reqQty,
          stockAvailable: stock,
          isExpired
        });
      }
    }

    candidateEvaluations.push({
      pharmacyId: pharmacy._id,
      pharmacy: {
        _id: pharmacy._id,
        name: pharmacy.name,
        address: pharmacy.address?.fullAddress || pharmacy.address || 'Local Pharmacy',
        phone: pharmacy.phone,
        rating: pharmacy.rating || 4.5,
        location: pharmacy.location,
        distanceKm
      },
      distanceKm,
      etaMinutes: etaObj.totalMinutes,
      etaText: etaObj.displayText,
      deliveryFee,
      availableItems,
      missingItems,
      availableCount: availableItems.length,
      totalItemsCount,
      basketPrice,
      rating: pharmacy.rating || 4.5
    });
  }

  // 3. Compute price ranges for score normalization
  const validBasketPrices = candidateEvaluations
    .filter(c => c.availableCount > 0)
    .map(c => c.basketPrice);
  const minBasketPrice = validBasketPrices.length > 0 ? Math.min(...validBasketPrices) : 0;
  const maxBasketPrice = validBasketPrices.length > 0 ? Math.max(...validBasketPrices) : 0;

  // 4. Calculate multi-factor scores for each candidate
  const scoredCandidates = candidateEvaluations.map(candidate => {
    const scores = scorePharmacyCandidate({
      availableCount: candidate.availableCount,
      totalItemsCount,
      distanceKm: candidate.distanceKm,
      maxDistanceKm,
      etaMinutes: candidate.etaMinutes,
      basketPrice: candidate.basketPrice,
      minBasketPrice,
      maxBasketPrice,
      rating: candidate.rating
    });

    return {
      ...candidate,
      compositeScore: scores.compositeScore,
      scoreBreakdown: scores.breakdown,
      coveragePct: totalItemsCount > 0 ? Math.min(1.0, Math.max(0, candidate.availableCount / totalItemsCount)) : 0
    };
  });

  // Sort candidates by composite score descending
  scoredCandidates.sort((a, b) => b.compositeScore - a.compositeScore);

  // 5. Partition candidates
  const fullCoverageCandidates = scoredCandidates.filter(c => c.availableCount === totalItemsCount);
  const partialCandidates = scoredCandidates.filter(c => c.availableCount > 0 && c.availableCount < totalItemsCount);

  let recommendedPlan = null;
  let alternativePlan = null;

  if (fullCoverageCandidates.length > 0) {
    // Strategy A: Single-Store Optimal
    const top = fullCoverageCandidates[0];
    recommendedPlan = {
      type: 'SINGLE_STORE',
      pharmacies: [{
        _id: top.pharmacy._id,
        name: top.pharmacy.name,
        address: top.pharmacy.address,
        distanceKm: top.distanceKm,
        itemsFulfilled: top.availableItems
      }],
      fulfilmentPoints: 1,
      basketCoverage: 1.0,
      itemsCovered: totalItemsCount,
      totalItems: totalItemsCount,
      compositeScore: top.compositeScore,
      scoreBreakdown: top.scoreBreakdown,
      etaMinutes: top.etaMinutes,
      etaText: top.etaText,
      totalOrderValue: top.basketPrice + top.deliveryFee + PLATFORM_FEE,
      priceBreakdown: {
        itemsSubtotal: top.basketPrice,
        deliveryFee: top.deliveryFee,
        platformFee: PLATFORM_FEE,
        totalOrderValue: top.basketPrice + top.deliveryFee + PLATFORM_FEE,
        label: 'Estimated pricing'
      },
      explanation: ''
    };
    recommendedPlan.explanation = generateExplanation(recommendedPlan, 'SINGLE_STORE');

    // Alternative: 2nd best candidate (or best partial)
    const second = fullCoverageCandidates[1] || partialCandidates[0];
    if (second) {
      alternativePlan = {
        type: 'SINGLE_STORE',
        pharmacies: [{
          _id: second.pharmacy._id,
          name: second.pharmacy.name,
          address: second.pharmacy.address,
          distanceKm: second.distanceKm,
          itemsFulfilled: second.availableItems
        }],
        fulfilmentPoints: 1,
        basketCoverage: totalItemsCount > 0 ? Math.min(1.0, Math.max(0, second.availableCount / totalItemsCount)) : 0,
        itemsCovered: Math.min(totalItemsCount, second.availableCount),
        totalItems: totalItemsCount,
        compositeScore: second.compositeScore,
        scoreBreakdown: second.scoreBreakdown,
        etaMinutes: second.etaMinutes,
        etaText: second.etaText,
        totalOrderValue: second.basketPrice + second.deliveryFee + PLATFORM_FEE,
        priceBreakdown: {
          itemsSubtotal: second.basketPrice,
          deliveryFee: second.deliveryFee,
          platformFee: PLATFORM_FEE,
          totalOrderValue: second.basketPrice + second.deliveryFee + PLATFORM_FEE,
          label: 'Estimated pricing'
        },
        explanation: generateExplanation({
          pharmacies: [second.pharmacy],
          compositeScore: second.compositeScore,
          basketCoverage: totalItemsCount > 0 ? Math.min(1.0, Math.max(0, second.availableCount / totalItemsCount)) : 0,
          etaMinutes: second.etaMinutes
        }, 'SINGLE_STORE')
      };
    }
  } else if (partialCandidates.length >= 2) {
    // Strategy B: Split-Basket Search (Pairwise set cover)
    const bestPair = findSplitBasketOption(partialCandidates, totalItemsCount);

    if (bestPair && bestPair.jointCoverage > (partialCandidates[0]?.availableCount / totalItemsCount)) {
      const { pA, pB, jointCoverage, jointScore } = bestPair;
      const combinedSubtotal = pA.basketPrice + pB.basketPrice;
      const combinedDeliveryFee = pA.deliveryFee + pB.deliveryFee;
      const maxEta = Math.max(pA.etaMinutes, pB.etaMinutes) + 3;

      recommendedPlan = {
        type: 'SPLIT_BASKET',
        pharmacies: [
          {
            _id: pA.pharmacy._id,
            name: pA.pharmacy.name,
            distanceKm: pA.distanceKm,
            itemsFulfilled: pA.availableItems
          },
          {
            _id: pB.pharmacy._id,
            name: pB.pharmacy.name,
            distanceKm: pB.distanceKm,
            itemsFulfilled: pB.availableItems.filter(
              item => !pA.availableItems.some(a => a.medicineId === item.medicineId)
            )
          }
        ],
        fulfilmentPoints: 2,
        basketCoverage: Math.min(1.0, Math.max(0, jointCoverage)),
        itemsCovered: Math.min(totalItemsCount, Math.round(jointCoverage * totalItemsCount)),
        totalItems: totalItemsCount,
        compositeScore: Number(jointScore.toFixed(4)),
        scoreBreakdown: {
          availability: Math.min(1.0, Math.max(0, jointCoverage)),
          proximity: Number(((pA.scoreBreakdown.proximity + pB.scoreBreakdown.proximity) / 2).toFixed(4)),
          eta: Number(((pA.scoreBreakdown.eta + pB.scoreBreakdown.eta) / 2).toFixed(4)),
          price: Number(((pA.scoreBreakdown.price + pB.scoreBreakdown.price) / 2).toFixed(4)),
          rating: Number(((pA.scoreBreakdown.rating + pB.scoreBreakdown.rating) / 2).toFixed(4))
        },
        etaMinutes: maxEta,
        etaText: `${maxEta} mins (Target - Split Dispatch)`,
        totalOrderValue: combinedSubtotal + combinedDeliveryFee + PLATFORM_FEE,
        priceBreakdown: {
          itemsSubtotal: combinedSubtotal,
          deliveryFee: combinedDeliveryFee,
          platformFee: PLATFORM_FEE,
          totalOrderValue: combinedSubtotal + combinedDeliveryFee + PLATFORM_FEE,
          label: 'Estimated pricing'
        },
        explanation: ''
      };
      recommendedPlan.explanation = generateExplanation(recommendedPlan, 'SPLIT_BASKET');

      // Alternative: Highest single partial store
      const bestPartial = partialCandidates[0];
      alternativePlan = {
        type: 'SINGLE_STORE',
        pharmacies: [{
          _id: bestPartial.pharmacy._id,
          name: bestPartial.pharmacy.name,
          distanceKm: bestPartial.distanceKm,
          itemsFulfilled: bestPartial.availableItems
        }],
        fulfilmentPoints: 1,
        basketCoverage: totalItemsCount > 0 ? Math.min(1.0, Math.max(0, bestPartial.availableCount / totalItemsCount)) : 0,
        itemsCovered: Math.min(totalItemsCount, bestPartial.availableCount),
        totalItems: totalItemsCount,
        compositeScore: bestPartial.compositeScore,
        scoreBreakdown: bestPartial.scoreBreakdown,
        etaMinutes: bestPartial.etaMinutes,
        etaText: bestPartial.etaText,
        totalOrderValue: bestPartial.basketPrice + bestPartial.deliveryFee + PLATFORM_FEE,
        priceBreakdown: {
          itemsSubtotal: bestPartial.basketPrice,
          deliveryFee: bestPartial.deliveryFee,
          platformFee: PLATFORM_FEE,
          totalOrderValue: bestPartial.basketPrice + bestPartial.deliveryFee + PLATFORM_FEE,
          label: 'Estimated pricing'
        },
        explanation: `Single store partial fulfillment covering ${bestPartial.availableCount} of ${totalItemsCount} items.`
      };
    }
  }

  // If still no recommended plan, but partial candidates exist
  if (!recommendedPlan && partialCandidates.length > 0) {
    const singlePartial = partialCandidates[0];
    recommendedPlan = {
      type: 'SINGLE_STORE',
      pharmacies: [{
        _id: singlePartial.pharmacy._id,
        name: singlePartial.pharmacy.name,
        distanceKm: singlePartial.distanceKm,
        itemsFulfilled: singlePartial.availableItems
      }],
      fulfilmentPoints: 1,
      basketCoverage: totalItemsCount > 0 ? Math.min(1.0, Math.max(0, singlePartial.availableCount / totalItemsCount)) : 0,
      itemsCovered: Math.min(totalItemsCount, singlePartial.availableCount),
      totalItems: totalItemsCount,
      compositeScore: singlePartial.compositeScore,
      scoreBreakdown: singlePartial.scoreBreakdown,
      etaMinutes: singlePartial.etaMinutes,
      etaText: singlePartial.etaText,
      totalOrderValue: singlePartial.basketPrice + singlePartial.deliveryFee + PLATFORM_FEE,
      priceBreakdown: {
        itemsSubtotal: singlePartial.basketPrice,
        deliveryFee: singlePartial.deliveryFee,
        platformFee: PLATFORM_FEE,
        totalOrderValue: singlePartial.basketPrice + singlePartial.deliveryFee + PLATFORM_FEE,
        label: 'Estimated pricing'
      },
      explanation: `Partial single-store fulfilment (${singlePartial.availableCount}/${totalItemsCount} items available).`
    };

    if (partialCandidates.length > 1) {
      const secondPartial = partialCandidates[1];
      alternativePlan = {
        type: 'SINGLE_STORE',
        pharmacies: [{
          _id: secondPartial.pharmacy._id,
          name: secondPartial.pharmacy.name,
          distanceKm: secondPartial.distanceKm,
          itemsFulfilled: secondPartial.availableItems
        }],
        fulfilmentPoints: 1,
        basketCoverage: totalItemsCount > 0 ? Math.min(1.0, Math.max(0, secondPartial.availableCount / totalItemsCount)) : 0,
        itemsCovered: Math.min(totalItemsCount, secondPartial.availableCount),
        totalItems: totalItemsCount,
        compositeScore: secondPartial.compositeScore,
        scoreBreakdown: secondPartial.scoreBreakdown,
        etaMinutes: secondPartial.etaMinutes,
        etaText: secondPartial.etaText,
        totalOrderValue: secondPartial.basketPrice + secondPartial.deliveryFee + PLATFORM_FEE,
        priceBreakdown: {
          itemsSubtotal: secondPartial.basketPrice,
          deliveryFee: secondPartial.deliveryFee,
          platformFee: PLATFORM_FEE,
          totalOrderValue: secondPartial.basketPrice + secondPartial.deliveryFee + PLATFORM_FEE,
          label: 'Estimated pricing'
        },
        explanation: `Alternative partial fulfilment (${secondPartial.availableCount}/${totalItemsCount} items).`
      };
    }
  }

  // If no pharmacy has any items
  if (!recommendedPlan) {
    return {
      recommended: null,
      alternative: null,
      allCandidates: scoredCandidates.map(c => ({
        pharmacyId: c.pharmacy._id,
        name: c.pharmacy.name,
        distanceKm: c.distanceKm,
        compositeScore: c.compositeScore,
        scoreBreakdown: c.scoreBreakdown,
        availableCount: c.availableCount,
        totalItemsCount: c.totalItemsCount,
        etaMinutes: c.etaMinutes,
        basketPrice: c.basketPrice
      })),
      basketCoverage: 0,
      totalOrderValue: 0,
      fulfilmentPoints: 0,
      explanation: 'No verified pharmacies in your area currently have stock for the requested medicines.'
    };
  }

  return {
    recommended: recommendedPlan,
    alternative: alternativePlan,
    allCandidates: scoredCandidates.map(c => ({
      pharmacyId: c.pharmacy._id,
      name: c.pharmacy.name,
      distanceKm: c.distanceKm,
      compositeScore: c.compositeScore,
      scoreBreakdown: c.scoreBreakdown,
      availableCount: c.availableCount,
      totalItemsCount: c.totalItemsCount,
      etaMinutes: c.etaMinutes,
      basketPrice: c.basketPrice
    })),
    basketCoverage: recommendedPlan.basketCoverage,
    totalOrderValue: recommendedPlan.totalOrderValue,
    fulfilmentPoints: recommendedPlan.fulfilmentPoints,
    explanation: recommendedPlan.explanation
  };
};

module.exports = {
  SCORING_WEIGHTS,
  DEFAULT_MAX_DISTANCE_KM,
  MAX_ETA_MINUTES_HORIZON,
  BASE_PREP_MINUTES,
  calculateETA,
  scorePharmacyCandidate,
  calculateBasketPrice,
  findSplitBasketOption,
  generateExplanation,
  optimizeFulfilmentPlan
};
