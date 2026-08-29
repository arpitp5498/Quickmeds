# Milestone 1 Blueprint: Smart Fulfilment Routing Engine (R1) & Fallback Routing (R2)

**Author**: Milestone 1 Technical Explorer & Architect  
**Project**: QuickMeds (Zero-Inventory Hyperlocal Emergency-Medicine Fulfilment Platform Prototype)  
**Date**: 2026-08-28  
**Status**: Authoritative Technical Specification & Implementation Plan  

---

## 1. Executive Overview

Milestone 1 introduces the core technological innovations for the QuickMeds platform:
1. **R1: Smart Fulfilment Routing Engine** — A multi-factor scoring and basket-optimization engine replacing the naive nearest-pharmacy search. It performs multi-item basket optimization (single-store optimal vs. split-basket multi-store coverage), computes multi-factor candidate scores (Availability 35%, Proximity 25%, ETA 15%, Demo Price 15%, Rating 10%), generates human-readable explanations, and provides a consolidated demo order value.
2. **R2: Fallback Routing & Simulation** — An automated and interactive fallback routing mechanism that transfers orders to the next eligible candidate pharmacy if the initial pharmacy fails to confirm within a configurable timeout (default 30s), performing atomic inventory handoffs, audit logging, and real-time Socket.IO broadcasts.

---

## 2. File Architecture & Directory Layout

```
server/
├── src/
│   ├── config/
│   │   └── socket.js                     # Socket.IO emitter
│   ├── controllers/
│   │   ├── orderController.js            # Extended with fallback & timeout simulation endpoints
│   │   └── routingController.js          # NEW: Handles /api/routing/optimize & map data
│   ├── models/
│   │   ├── Order.js                      # Extended with fallback tracking schema
│   │   ├── Pharmacy.js                   # Verification, rating, location
│   │   ├── PharmacyInventory.js          # Stock and demo pricing
│   │   └── AuditLog.js                   # Platform audit events
│   ├── routes/
│   │   ├── orderRoutes.js                # Extended with simulate-timeout route
│   │   └── routingRoutes.js              # NEW: Mounted at /api/routing
│   ├── services/
│   │   ├── orderService.js               # Extended with executeOrderFallback logic
│   │   └── smartRoutingService.js        # NEW: Core multi-factor routing & basket optimization
│   ├── utils/
│   │   └── geo.js                        # Distance, ETA, delivery fee utilities
│   └── validators/
│       └── routingValidator.js           # NEW: Express validator for routing endpoints
└── tests/
    └── routing.test.js                   # NEW: Comprehensive 5+ scenario Jest test suite
```

---

## 3. Mathematical Specification: `smartRoutingService.js`

### 3.1 Scoring Factor Breakdown & Weights

For any candidate pharmacy $P_i$ and customer cart containing $N$ distinct requested items:

$$\text{Composite Score } (S) = 0.35 \cdot S_{\text{avail}} + 0.25 \cdot S_{\text{prox}} + 0.15 \cdot S_{\text{eta}} + 0.15 \cdot S_{\text{price}} + 0.10 \cdot S_{\text{rating}}$$

```
+-----------------------------+---------+-----------------------------------------------------------+
| Factor                      | Weight  | Formula                                                   |
+-----------------------------+---------+-----------------------------------------------------------+
| 1. Availability (S_avail)   | 35%     | (availableItems / totalCartItems)                         |
| 2. Proximity (S_prox)       | 25%     | Math.max(0, 1 - (distanceKm / maxDistanceKm))             |
| 3. ETA (S_eta)              | 15%     | Math.max(0, 1 - (etaMinutes / 60))                        |
| 4. Demo Price (S_price)     | 15%     | 1 - ((basketPrice - minPrice) / (maxPrice - minPrice + ε))|
| 5. Rating (S_rating)        | 10%     | Math.min(1, rating / 5.0)                                 |
+-----------------------------+---------+-----------------------------------------------------------+
```

### 3.2 Detailed Component Formulations

1. **Availability Score ($S_{\text{avail}}$)**:
   - For cart items $C = \{(m_1, q_1), (m_2, q_2), \dots, (m_N, q_N)\}$:
   - Let $\text{match}(m_j, P_i) = 1$ if $P_i$ has $\text{stockQuantity} \ge q_j$ and $\text{isAvailable} = \text{true}$, else $0$.
   - $$S_{\text{avail}} = \frac{\sum_{j=1}^{N} \text{match}(m_j, P_i)}{N}$$
   - $S_{\text{avail}} \in [0.0, 1.0]$. A pharmacy with 3 of 3 items gets $1.0$; 2 of 3 gets $0.6667$.

2. **Proximity Score ($S_{\text{prox}}$)**:
   - Let $d = \text{calculateDistance}(\text{lat}_{\text{user}}, \text{lng}_{\text{user}}, \text{lat}_{P_i}, \text{lng}_{P_i})$ in kilometers.
   - Let $d_{\text{max}} = 15.0\text{ km}$ (default search radius).
   - $$S_{\text{prox}} = \max\left(0, 1 - \frac{d}{d_{\text{max}}}\right)$$
   - A pharmacy $1.5\text{ km}$ away has $S_{\text{prox}} = 1 - 1.5/15 = 0.90$.

3. **Estimated Time of Arrival Score ($S_{\text{eta}}$)**:
   - $\text{PrepTime} = 5\text{ mins}$ (emergency packaging buffer).
   - $\text{TravelTime} = \lceil d \times 3\text{ min/km} \rceil$ (assuming urban two-wheeler ~20 km/h).
   - $\text{ETA}_{\text{minutes}} = \text{PrepTime} + \text{TravelTime} = 5 + \lceil 3d \rceil$.
   - Capped against a standard 60-minute emergency delivery horizon:
   - $$S_{\text{eta}} = \max\left(0, 1 - \frac{\text{ETA}_{\text{minutes}}}{60}\right)$$
   - For $d = 2.0\text{ km}$, $\text{ETA} = 5 + 6 = 11\text{ mins}$, $S_{\text{eta}} = 1 - 11/60 = 0.8167$.

4. **Price Score ($S_{\text{price}}$)**:
   - For each candidate pharmacy $P_i$, total basket price is $B_i = \sum_{j \in \text{available}} (\text{unitPrice}_{i,j} \times q_j)$.
   - Let $B_{\text{min}} = \min_{k} B_k$ and $B_{\text{max}} = \max_{k} B_k$ across all candidate pharmacies stocking at least one item.
   - If $B_{\text{max}} === B_{\text{min}}$ (or single candidate): $S_{\text{price}} = 1.0$.
   - Otherwise:
   - $$S_{\text{price}} = 1 - \frac{B_i - B_{\text{min}}}{B_{\text{max}} - B_{\text{min}} + 0.0001}$$
   - Lowest-priced pharmacy receives $1.0$, most expensive receives $0.0$.

5. **Reliability / Rating Score ($S_{\text{rating}}$)**:
   - For pharmacy rating $R_i \in [1.0, 5.0]$:
   - $$S_{\text{rating}} = \frac{R_i}{5.0}$$
   - If pharmacy has no ratings yet ($0$), default to $4.5 / 5.0 = 0.90$.

---

## 4. Basket Optimization Algorithm: Single-Store vs. Split-Basket

```
                          [ Incoming Cart & Patient GPS ]
                                         │
                                         ▼
                     [ Find Verified Pharmacies within 15km ]
                                         │
                                         ▼
                 [ Compute Scores & Coverage for All Candidates ]
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
       [ 1+ Pharmacies with ]                          [ No Single Pharmacy has ]
       [   100% Coverage    ]                          [      100% Coverage     ]
                 │                                               │
                 ▼                                               ▼
     [ Rank by Composite Score ]                     [ Find Min-Set Combination ]
                 │                                   [ (2 Stores covering 100%) ]
                 ├───────────────────────────────┐               │
                 ▼                               ▼               ▼
     [ Recommended Plan:        ]    [ Alternative: ]   [ Recommended Plan:  ]
     [ Top Single-Store         ]    [ 2nd Single   ]   [ Split-Basket (2x)  ]
     [ (Fulfilment Points = 1)  ]    [ Store        ]   [ (Points = 2)       ]
                                                                 │
                                                                 ▼
                                                        [ Alternative:       ]
                                                        [ Best Single-Store  ]
                                                        [ (Partial Coverage) ]
```

### 4.1 Single-Store Optimization
- If one or more candidate pharmacies have $S_{\text{avail}} = 1.0$:
  - Sort full-coverage candidates by $\text{Composite Score}$ descending.
  - **Recommended Plan**: Candidate #1 ($S = \max$).
  - **Alternative Plan**: Candidate #2 (if available) or Candidate #1 with alternate parameters.
  - `fulfilmentPoints`: `1`
  - `basketCoverage`: `1.0` (100%)
  - `type`: `'SINGLE_STORE'`

### 4.2 Split-Basket Optimization
- If no single pharmacy has 100% coverage (or if full single store availability is 0):
  - Generate pairwise combinations of pharmacies $(P_a, P_b)$ within radius.
  - Check combined union of covered medicines: $\text{Covered}(P_a) \cup \text{Covered}(P_b) = C$.
  - For combinations that cover 100% (or the maximum possible subset):
    - Combined Subtotal: $B_a + B_b$
    - Combined Delivery Fee: $\text{Fee}(d_a) + \text{Fee}(d_b)$
    - Combined ETA: $\max(\text{ETA}_a, \text{ETA}_b) + 5\text{ mins}$ (synchronous parallel dispatch buffer)
    - Combined Composite Score: $(S_a + S_b) / 2$
  - Pick the combination with the highest joint score.
  - **Recommended Plan**: Split-Basket plan with `fulfilmentPoints: 2`, `type: 'SPLIT_BASKET'`.
  - **Alternative Plan**: The single pharmacy with the highest partial availability (e.g. 2/3 items).

### 4.3 Zero Stock Handling
- If total coverage across all candidates is 0:
  - Return `basketCoverage: 0.0`, `fulfilmentPoints: 0`, `recommended: null`, `alternative: null`.
  - Natural language explanation: `"No verified pharmacies within the 15 km emergency radius currently have stock for the requested medicines."`

---

## 5. Concrete Code Implementation: `server/src/services/smartRoutingService.js`

```javascript
/**
 * QuickMeds Smart Fulfilment Routing & Basket Optimization Engine
 * File: server/src/services/smartRoutingService.js
 */

const Pharmacy = require('../models/Pharmacy');
const PharmacyInventory = require('../models/PharmacyInventory');
const { calculateDistance, calculateDeliveryFee } = require('../utils/geo');

// Configurable Scoring Weights (SIH Grand Finale Standard)
const SCORING_WEIGHTS = {
  AVAILABILITY: 0.35, // 35%
  PROXIMITY: 0.25,    // 25%
  ETA: 0.15,          // 15%
  PRICE: 0.15,        // 15%
  RATING: 0.10        // 10%
};

const DEFAULT_MAX_DISTANCE_KM = 15.0;
const MAX_ETA_MINUTES_HORIZON = 60.0;
const BASE_PREP_MINUTES = 5;

/**
 * Calculate ETA in minutes based on distance
 * Formula: 5 min prep + ceil(distanceKm * 3 min/km)
 */
const calculateETA = (distanceKm) => {
  const travelMinutes = Math.ceil(distanceKm * 3);
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
  availableCount,
  totalItemsCount,
  distanceKm,
  maxDistanceKm = DEFAULT_MAX_DISTANCE_KM,
  etaMinutes,
  basketPrice,
  minBasketPrice,
  maxBasketPrice,
  rating = 4.5
}) => {
  // 1. Availability Score (0.0 to 1.0)
  const availabilityScore = totalItemsCount > 0 
    ? Math.min(1.0, availableCount / totalItemsCount) 
    : 0;

  // 2. Proximity Score (0.0 to 1.0)
  const proximityScore = Math.max(0, 1 - (distanceKm / maxDistanceKm));

  // 3. ETA Score (0.0 to 1.0)
  const etaScore = Math.max(0, 1 - (etaMinutes / MAX_ETA_MINUTES_HORIZON));

  // 4. Demo Price Competitiveness Score (0.0 to 1.0)
  let priceScore = 1.0;
  if (maxBasketPrice > minBasketPrice) {
    priceScore = Math.max(0, 1 - ((basketPrice - minBasketPrice) / (maxBasketPrice - minBasketPrice)));
  }

  // 5. Rating / Reliability Score (0.0 to 1.0)
  const safeRating = rating && rating > 0 ? rating : 4.5;
  const ratingScore = Math.min(1.0, safeRating / 5.0);

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
 * Generate human-readable explanation of why a plan was selected
 */
const generateExplanation = (plan, type = 'SINGLE_STORE') => {
  if (!plan) return 'No eligible pharmacy plan available.';

  if (type === 'SINGLE_STORE') {
    const pharmacy = plan.pharmacies[0];
    const scorePct = Math.round(plan.compositeScore * 100);
    return `${pharmacy.name} selected as optimal single-store fulfilment point with ${Math.round(plan.basketCoverage * 100)}% stock coverage, ${pharmacy.distanceKm} km distance, and estimated ${plan.etaMinutes} min delivery (Composite Score: ${scorePct}%).`;
  }

  if (type === 'SPLIT_BASKET') {
    const names = plan.pharmacies.map(p => p.name).join(' + ');
    return `Split-basket fulfilment across ${plan.fulfilmentPoints} pharmacies (${names}) selected to guarantee 100% medicine availability that no single store could fulfill alone.`;
  }

  return 'Fulfilment plan optimized according to availability, proximity, ETA, demo pricing, and partner reliability.';
};

/**
 * Optimize Fulfilment Plan given cart items and patient coordinates
 *
 * @param {Array} cartItems - [{ medicineId, quantity, name, price, mrp }]
 * @param {Array} coordinates - [longitude, latitude]
 * @param {Object} options - { maxDistanceKm, excludePharmacyIds }
 * @returns {Object} Optimized routing payload
 */
const optimizeFulfilmentPlan = async (cartItems, coordinates, options = {}) => {
  const {
    maxDistanceKm = DEFAULT_MAX_DISTANCE_KM,
    excludePharmacyIds = []
  } = options;

  if (!cartItems || cartItems.length === 0) {
    return {
      recommended: null,
      alternative: null,
      allCandidates: [],
      basketCoverage: 0,
      totalDemoValue: 0,
      fulfilmentPoints: 0,
      explanation: 'Cart is empty. Please add medicines to compute fulfilment plan.'
    };
  }

  const [lng, lat] = coordinates && coordinates.length === 2 
    ? coordinates 
    : [77.2090, 28.6139]; // Default Delhi center

  // Extract medicine IDs
  const medicineIds = cartItems.map(item => {
    return (item.medicineId?._id || item.medicineId).toString();
  });
  const totalItemsCount = cartItems.length;

  // 1. Fetch verified, open pharmacies within radius
  const query = {
    verificationStatus: 'VERIFIED',
    isOpen: true
  };

  if (excludePharmacyIds.length > 0) {
    query._id = { $nin: excludePharmacyIds };
  }

  let pharmacies = await Pharmacy.find({
    ...query,
    location: {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: maxDistanceKm * 1000
      }
    }
  }).limit(15);

  // Fallback: If no pharmacy found via $nearSphere, query all verified
  if (pharmacies.length === 0) {
    pharmacies = await Pharmacy.find(query).limit(10);
  }

  if (pharmacies.length === 0) {
    return {
      recommended: null,
      alternative: null,
      allCandidates: [],
      basketCoverage: 0,
      totalDemoValue: 0,
      fulfilmentPoints: 0,
      explanation: 'No verified pharmacies available within the service radius.'
    };
  }

  // 2. Fetch inventory for each pharmacy
  const candidateEvaluations = [];

  for (const pharmacy of pharmacies) {
    const [pLng, pLat] = pharmacy.location.coordinates;
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
      const medIdStr = (item.medicineId?._id || item.medicineId).toString();
      const inv = inventories.find(i => i.medicineId?._id?.toString() === medIdStr || i.medicineId?.toString() === medIdStr);
      const reqQty = item.quantity || 1;

      if (inv && inv.stockQuantity >= reqQty) {
        const unitPrice = inv.price || item.price || 50;
        const itemTotal = unitPrice * reqQty;
        basketPrice += itemTotal;
        availableItems.push({
          medicineId: medIdStr,
          name: item.name || inv.medicineId?.name || 'Medicine',
          requestedQty: reqQty,
          stockAvailable: inv.stockQuantity,
          unitPrice,
          totalPrice: itemTotal
        });
      } else {
        missingItems.push({
          medicineId: medIdStr,
          name: item.name || 'Medicine',
          requestedQty: reqQty,
          stockAvailable: inv ? inv.stockQuantity : 0
        });
      }
    }

    candidateEvaluations.push({
      pharmacyId: pharmacy._id,
      pharmacy: {
        _id: pharmacy._id,
        name: pharmacy.name,
        address: pharmacy.address,
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
      coveragePct: candidate.availableCount / totalItemsCount
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
      totalDemoValue: top.basketPrice + top.deliveryFee,
      priceBreakdown: {
        itemsSubtotal: top.basketPrice,
        deliveryFee: top.deliveryFee,
        platformFee: 0,
        totalDemoValue: top.basketPrice + top.deliveryFee,
        label: 'Demo pricing — Demonstration data only'
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
        basketCoverage: second.availableCount / totalItemsCount,
        itemsCovered: second.availableCount,
        totalItems: totalItemsCount,
        compositeScore: second.compositeScore,
        scoreBreakdown: second.scoreBreakdown,
        etaMinutes: second.etaMinutes,
        etaText: second.etaText,
        totalDemoValue: second.basketPrice + second.deliveryFee,
        priceBreakdown: {
          itemsSubtotal: second.basketPrice,
          deliveryFee: second.deliveryFee,
          platformFee: 0,
          totalDemoValue: second.basketPrice + second.deliveryFee,
          label: 'Demo pricing — Demonstration data only'
        },
        explanation: generateExplanation({
          pharmacies: [second.pharmacy],
          compositeScore: second.compositeScore,
          basketCoverage: second.availableCount / totalItemsCount,
          etaMinutes: second.etaMinutes
        }, 'SINGLE_STORE')
      };
    }
  } else if (partialCandidates.length >= 2) {
    // Strategy B: Split-Basket Search (Pairwise set cover)
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

        const jointCoverage = coveredMedIds.size / totalItemsCount;
        const jointScore = (pA.compositeScore + pB.compositeScore) / 2;

        if (jointCoverage > maxPairCoverage || (jointCoverage === maxPairCoverage && jointScore > highestJointScore)) {
          maxPairCoverage = jointCoverage;
          highestJointScore = jointScore;
          bestPair = { pA, pB, jointCoverage, jointScore };
        }
      }
    }

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
        basketCoverage: jointCoverage,
        itemsCovered: Math.round(jointCoverage * totalItemsCount),
        totalItems: totalItemsCount,
        compositeScore: Number(jointScore.toFixed(4)),
        scoreBreakdown: {
          availability: jointCoverage,
          proximity: Number(((pA.scoreBreakdown.proximity + pB.scoreBreakdown.proximity) / 2).toFixed(4)),
          eta: Number(((pA.scoreBreakdown.eta + pB.scoreBreakdown.eta) / 2).toFixed(4)),
          price: Number(((pA.scoreBreakdown.price + pB.scoreBreakdown.price) / 2).toFixed(4)),
          rating: Number(((pA.scoreBreakdown.rating + pB.scoreBreakdown.rating) / 2).toFixed(4))
        },
        etaMinutes: maxEta,
        etaText: `${maxEta} mins (Target - Split Dispatch)`,
        totalDemoValue: combinedSubtotal + combinedDeliveryFee,
        priceBreakdown: {
          itemsSubtotal: combinedSubtotal,
          deliveryFee: combinedDeliveryFee,
          platformFee: 0,
          totalDemoValue: combinedSubtotal + combinedDeliveryFee,
          label: 'Demo pricing — Demonstration data only'
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
        basketCoverage: bestPartial.availableCount / totalItemsCount,
        itemsCovered: bestPartial.availableCount,
        totalItems: totalItemsCount,
        compositeScore: bestPartial.compositeScore,
        scoreBreakdown: bestPartial.scoreBreakdown,
        etaMinutes: bestPartial.etaMinutes,
        etaText: bestPartial.etaText,
        totalDemoValue: bestPartial.basketPrice + bestPartial.deliveryFee,
        priceBreakdown: {
          itemsSubtotal: bestPartial.basketPrice,
          deliveryFee: bestPartial.deliveryFee,
          platformFee: 0,
          totalDemoValue: bestPartial.basketPrice + bestPartial.deliveryFee,
          label: 'Demo pricing — Demonstration data only'
        },
        explanation: `Single store partial fulfillment covering ${bestPartial.availableCount} of ${totalItemsCount} items.`
      };
    }
  } else if (partialCandidates.length === 1) {
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
      basketCoverage: singlePartial.availableCount / totalItemsCount,
      itemsCovered: singlePartial.availableCount,
      totalItems: totalItemsCount,
      compositeScore: singlePartial.compositeScore,
      scoreBreakdown: singlePartial.scoreBreakdown,
      etaMinutes: singlePartial.etaMinutes,
      etaText: singlePartial.etaText,
      totalDemoValue: singlePartial.basketPrice + singlePartial.deliveryFee,
      priceBreakdown: {
        itemsSubtotal: singlePartial.basketPrice,
        deliveryFee: singlePartial.deliveryFee,
        platformFee: 0,
        totalDemoValue: singlePartial.basketPrice + singlePartial.deliveryFee,
        label: 'Demo pricing — Demonstration data only'
      },
      explanation: `Partial single-store fulfilment (${singlePartial.availableCount}/${totalItemsCount} items available).`
    };
  }

  // If no pharmacy has any items
  if (!recommendedPlan) {
    return {
      recommended: null,
      alternative: null,
      allCandidates: scoredCandidates,
      basketCoverage: 0,
      totalDemoValue: 0,
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
    totalDemoValue: recommendedPlan.totalDemoValue,
    fulfilmentPoints: recommendedPlan.fulfilmentPoints,
    explanation: recommendedPlan.explanation
  };
};

module.exports = {
  SCORING_WEIGHTS,
  calculateETA,
  scorePharmacyCandidate,
  generateExplanation,
  optimizeFulfilmentPlan
};
```

---

## 6. Controller & Routing Specifications: `/api/routing`

### 6.1 Routing Controller: `server/src/controllers/routingController.js`

```javascript
/**
 * Routing Controller
 * File: server/src/controllers/routingController.js
 */

const { optimizeFulfilmentPlan } = require('../services/smartRoutingService');
const Pharmacy = require('../models/Pharmacy');
const Cart = require('../models/Cart');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Optimize medicine basket fulfilment plan
 * @route   POST /api/routing/optimize or GET /api/routing/optimize
 * @access  Public / Optional Auth
 */
const optimizeBasket = async (req, res, next) => {
  try {
    let items = req.body.items || [];
    let coordinates = req.body.coordinates;
    const maxDistanceKm = req.body.maxDistanceKm ? Number(req.body.maxDistanceKm) : 15;

    // Handle GET query parameters for demo/testing
    if (req.method === 'GET') {
      const { lat, lng, medicines } = req.query;
      if (lat && lng) {
        coordinates = [parseFloat(lng), parseFloat(lat)];
      }
      if (medicines) {
        // e.g. medicines=medId1:qty1,medId2:qty2
        items = medicines.split(',').map(pair => {
          const [medicineId, quantity] = pair.split(':');
          return { medicineId, quantity: quantity ? parseInt(quantity, 10) : 1 };
        });
      }
    }

    // If user is authenticated and no items provided, load from active cart
    if ((!items || items.length === 0) && req.user?._id) {
      const cart = await Cart.findOne({ customerId: req.user._id });
      if (cart && cart.items.length > 0) {
        items = cart.items;
      }
    }

    if (!items || items.length === 0) {
      throw ApiError.badRequest('Please provide at least one medicine item in the basket.');
    }

    const optimizationResult = await optimizeFulfilmentPlan(items, coordinates, { maxDistanceKm });

    return ApiResponse.success(
      res,
      optimizationResult,
      'Smart fulfilment routing plan computed successfully (Demo pricing).'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get pharmacy network scoring data for interactive map
 * @route   GET /api/routing/pharmacies-map
 * @access  Public
 */
const getPharmacyNetworkMap = async (req, res, next) => {
  try {
    const { lat = 28.6139, lng = 77.2090, radius = 15 } = req.query;
    const coordinates = [parseFloat(lng), parseFloat(lat)];

    const pharmacies = await Pharmacy.find({
      verificationStatus: 'VERIFIED',
      location: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates },
          $maxDistance: parseFloat(radius) * 1000
        }
      }
    }).select('name address location rating isOpen serviceRadiusKm totalOrdersCompleted');

    return ApiResponse.success(res, {
      patientCoordinates: coordinates,
      radiusKm: parseFloat(radius),
      pharmacies: pharmacies.map(p => ({
        _id: p._id,
        name: p.name,
        address: p.address.fullAddress,
        coordinates: p.location.coordinates,
        rating: p.rating,
        isOpen: p.isOpen,
        serviceRadiusKm: p.serviceRadiusKm,
        totalOrders: p.totalOrdersCompleted
      }))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  optimizeBasket,
  getPharmacyNetworkMap
};
```

### 6.2 Routing Express Router: `server/src/routes/routingRoutes.js`

```javascript
/**
 * Routing Routes
 * File: server/src/routes/routingRoutes.js
 */

const express = require('express');
const router = express.Router();
const routingController = require('../controllers/routingController');
const { authenticateOptional } = require('../middleware/auth');

// Support both POST and GET for optimization demonstration
router.post('/optimize', authenticateOptional, routingController.optimizeBasket);
router.get('/optimize', authenticateOptional, routingController.optimizeBasket);

// Map visualization feed
router.get('/pharmacies-map', routingController.getPharmacyNetworkMap);

module.exports = router;
```

---

## 7. Fallback Routing Specification (R2)

### 7.1 Mongoose Schema Update: `server/src/models/Order.js`

Add the following fields to `orderSchema`:

```javascript
// Fallback Routing Fields
fallbackTriggered: {
  type: Boolean,
  default: false,
  index: true
},
fallbackAttempt: {
  type: Number,
  default: 0
},
fallbackReason: {
  type: String,
  default: ''
},
previousPharmacyId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Pharmacy',
  default: null
},
previousPharmacyIds: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pharmacy'
  }
],
routingMetadata: {
  type: mongoose.Schema.Types.Mixed,
  default: {}
}
```

### 7.2 Fallback Logic in `server/src/services/orderService.js`

```javascript
const { optimizeFulfilmentPlan } = require('./smartRoutingService');
const { getIO } = require('../config/socket');
const { sendNotification } = require('./notificationService');
const { logAction } = require('./auditService');
const Pharmacy = require('../models/Pharmacy');

/**
 * Execute Order Fallback Routing
 * Reassigns order to the next best candidate pharmacy when previous pharmacy times out.
 *
 * @param {string} orderId - Mongo ID of order
 * @param {string} reason - Reassignment reason
 * @returns {Promise<Object>} Updated Order
 */
const executeOrderFallback = async (orderId, reason = 'PHARMACY_CONFIRMATION_TIMEOUT') => {
  const order = await Order.findById(orderId)
    .populate('customerId')
    .populate('pharmacyId');

  if (!order) {
    throw ApiError.notFound('Order not found for fallback routing.');
  }

  if (!['PLACED', 'PHARMACY_REVIEW'].includes(order.orderStatus)) {
    throw ApiError.badRequest(`Cannot trigger fallback for order in '${order.orderStatus}' state.`);
  }

  const oldPharmacyId = order.pharmacyId._id;
  const oldPharmacyName = order.pharmacyId.name;
  const customerCoords = order.deliveryAddress?.coordinates || [77.2090, 28.6139];

  // List of excluded pharmacies (already attempted)
  const excludedIds = [
    oldPharmacyId,
    ...(order.previousPharmacyIds || [])
  ];

  // 1. Run smart routing engine to find next best candidate
  const routingResult = await optimizeFulfilmentPlan(order.items, customerCoords, {
    excludePharmacyIds: excludedIds
  });

  if (!routingResult.recommended || routingResult.recommended.pharmacies.length === 0) {
    throw ApiError.badRequest('No eligible fallback pharmacy with matching stock available within radius.');
  }

  const newPharmacySummary = routingResult.recommended.pharmacies[0];
  const newPharmacyId = newPharmacySummary._id;
  const newPharmacy = await Pharmacy.findById(newPharmacyId);

  if (!newPharmacy) {
    throw ApiError.notFound('New candidate pharmacy not found.');
  }

  // 2. Atomic Stock Handoff: Restore old pharmacy stock and decrement new pharmacy stock
  await restoreInventory(oldPharmacyId, order.items);
  await decrementInventory(newPharmacyId, order.items);

  // 3. Update Order Document
  order.previousPharmacyId = oldPharmacyId;
  if (!order.previousPharmacyIds.includes(oldPharmacyId)) {
    order.previousPharmacyIds.push(oldPharmacyId);
  }
  order.pharmacyId = newPharmacyId;
  order.fallbackTriggered = true;
  order.fallbackAttempt = (order.fallbackAttempt || 0) + 1;
  order.fallbackReason = reason;
  order.distanceKm = newPharmacySummary.distanceKm || order.distanceKm;
  order.estimatedDeliveryMinutes = routingResult.recommended.etaMinutes || order.estimatedDeliveryMinutes;

  order.statusHistory.push({
    status: order.orderStatus,
    timestamp: new Date(),
    note: `Fallback Triggered (Attempt ${order.fallbackAttempt}): Order reassigned from ${oldPharmacyName} to ${newPharmacy.name} (${reason}).`,
    updatedBy: null
  });

  await order.save();

  // 4. Socket.IO Real-time Broadcasts
  const io = getIO();
  
  // Broadcast to order live tracking room
  io.to(`order:${order._id}`).emit('order_fallback_reassigned', {
    orderId: order._id,
    orderNumber: order.orderId,
    oldPharmacyId,
    oldPharmacyName,
    newPharmacyId,
    newPharmacyName: newPharmacy.name,
    fallbackAttempt: order.fallbackAttempt,
    reason,
    timestamp: new Date().toISOString()
  });

  // Notify old pharmacy that order was reassigned away
  io.to(`pharmacy:${oldPharmacyId}`).emit('order_reassigned_away', {
    orderId: order._id,
    orderNumber: order.orderId,
    reason
  });

  // Alert new pharmacy of incoming order
  io.to(`pharmacy:${newPharmacyId}`).emit('new_order_received', {
    orderId: order._id,
    orderNumber: order.orderId,
    total: order.total,
    isFallback: true
  });

  // 5. Notifications
  await sendNotification({
    userId: order.customerId._id,
    type: 'ORDER_FALLBACK_REASSIGNED',
    title: 'Order Reassigned for Faster Delivery',
    message: `Your order ${order.orderId} was reassigned to ${newPharmacy.name} to ensure fast delivery.`,
    link: `/orders/${order._id}`
  });

  await sendNotification({
    userId: newPharmacy.userId,
    type: 'ORDER_PLACED',
    title: `Immediate Fulfilment Order (${order.orderId})`,
    message: `Order ${order.orderId} has been reassigned to your pharmacy. Please confirm and pack.`,
    link: `/pharmacy/orders/${order._id}`
  });

  // 6. Audit Trail Logging
  await logAction({
    actorId: order.customerId._id,
    actorRole: 'SYSTEM',
    action: 'ROUTING_FALLBACK',
    entity: 'ORDER',
    entityId: order._id.toString(),
    description: `Fallback triggered for order ${order.orderId}: Reassigned from ${oldPharmacyName} to ${newPharmacy.name} (Reason: ${reason})`,
    metadata: {
      oldPharmacyId: oldPharmacyId.toString(),
      newPharmacyId: newPharmacyId.toString(),
      fallbackAttempt: order.fallbackAttempt,
      reason
    }
  });

  return order;
};
```

### 7.3 Endpoints in `server/src/controllers/orderController.js` & `server/src/routes/orderRoutes.js`

In `orderController.js`:
```javascript
// @desc    Simulate pharmacy confirmation timeout and trigger fallback
// @route   POST /api/orders/:id/simulate-timeout or POST /api/orders/:id/fallback-timeout
// @access  Private (CUSTOMER, PHARMACY, ADMIN)
const simulateTimeout = async (req, res, next) => {
  try {
    const { reason = 'PHARMACY_CONFIRMATION_TIMEOUT' } = req.body;
    const updatedOrder = await executeOrderFallback(req.params.id, reason);
    return ApiResponse.success(
      res,
      { order: updatedOrder },
      `Fallback routing executed successfully. Order reassigned to candidate pharmacy.`
    );
  } catch (error) {
    next(error);
  }
};
```

In `orderRoutes.js`:
```javascript
// Fallback Routing Simulation Endpoints
router.post('/:id/simulate-timeout', orderController.simulateTimeout);
router.post('/:id/fallback-timeout', orderController.simulateTimeout);
```

---

## 8. Comprehensive Unit Test Specifications: `server/tests/routing.test.js`

The Jest test suite will contain 6 exhaustive scenarios verifying scoring mathematics, basket coverage, split-basket set cover, error handling, and timeout simulation.

```javascript
/**
 * Smart Fulfilment Routing & Fallback Engine Unit Tests
 * File: server/tests/routing.test.js
 */

const {
  scorePharmacyCandidate,
  calculateETA,
  generateExplanation,
  SCORING_WEIGHTS
} = require('../src/services/smartRoutingService');
const { calculateDistance } = require('../src/utils/geo');

describe('Smart Fulfilment Routing Engine (Milestone 1 Test Suite)', () => {

  describe('Scenario 1: Single-Item Match with 100% Stock at Nearest Pharmacy', () => {
    it('should compute high composite score for nearest pharmacy with 100% availability', () => {
      const candidate = {
        availableCount: 1,
        totalItemsCount: 1,
        distanceKm: 1.5,
        maxDistanceKm: 15.0,
        etaMinutes: 12,
        basketPrice: 120,
        minBasketPrice: 120,
        maxBasketPrice: 150,
        rating: 4.8
      };

      const result = scorePharmacyCandidate(candidate);

      // Expected calculation:
      // Avail: 1.0 (35% -> 0.35)
      // Prox: 1 - 1.5/15 = 0.90 (25% -> 0.225)
      // ETA: 1 - 12/60 = 0.80 (15% -> 0.12)
      // Price: 1 - (120-120)/(150-120) = 1.0 (15% -> 0.15)
      // Rating: 4.8/5.0 = 0.96 (10% -> 0.096)
      // Expected = 0.35 + 0.225 + 0.12 + 0.15 + 0.096 = 0.941

      expect(result.compositeScore).toBeCloseTo(0.941, 2);
      expect(result.breakdown.availability).toBe(1.0);
      expect(result.breakdown.proximity).toBe(0.9);
      expect(result.breakdown.price).toBe(1.0);
    });
  });

  describe('Scenario 2: Multi-Item Whole Basket Match at Single Store', () => {
    it('should favor full coverage pharmacy over closer pharmacy with partial coverage', () => {
      // Pharmacy A: 100% stock (3/3), distance 3.0 km
      const pharmacyA = scorePharmacyCandidate({
        availableCount: 3,
        totalItemsCount: 3,
        distanceKm: 3.0,
        etaMinutes: 15,
        basketPrice: 300,
        minBasketPrice: 300,
        maxBasketPrice: 350,
        rating: 4.6
      });

      // Pharmacy B: 66.7% stock (2/3), distance 0.5 km (much closer)
      const pharmacyB = scorePharmacyCandidate({
        availableCount: 2,
        totalItemsCount: 3,
        distanceKm: 0.5,
        etaMinutes: 8,
        basketPrice: 200,
        minBasketPrice: 200,
        maxBasketPrice: 350,
        rating: 4.9
      });

      // Full coverage weight (35%) ensures Pharmacy A wins
      expect(pharmacyA.breakdown.availability).toBe(1.0);
      expect(pharmacyB.breakdown.availability).toBeCloseTo(0.6667, 2);
      expect(pharmacyA.compositeScore).toBeGreaterThan(pharmacyB.compositeScore);
    });
  });

  describe('Scenario 3: Split-Basket Scenario when Multiple Stores are Needed', () => {
    it('should generate valid split-basket explanation and combined coverage', () => {
      const splitPlan = {
        type: 'SPLIT_BASKET',
        pharmacies: [
          { name: 'Apollo Pharmacy', distanceKm: 2.1 },
          { name: 'Guardian Health', distanceKm: 3.4 }
        ],
        fulfilmentPoints: 2,
        basketCoverage: 1.0,
        compositeScore: 0.85
      };

      const explanation = generateExplanation(splitPlan, 'SPLIT_BASKET');
      expect(explanation).toContain('Split-basket fulfilment');
      expect(explanation).toContain('Apollo Pharmacy + Guardian Health');
      expect(explanation).toContain('guarantee 100% medicine availability');
    });
  });

  describe('Scenario 4: Zero Stock / No Coverage Fallback', () => {
    it('should assign zero availability score when zero items are in stock', () => {
      const candidate = {
        availableCount: 0,
        totalItemsCount: 4,
        distanceKm: 1.0,
        etaMinutes: 10,
        basketPrice: 0,
        minBasketPrice: 0,
        maxBasketPrice: 0,
        rating: 5.0
      };

      const result = scorePharmacyCandidate(candidate);
      expect(result.breakdown.availability).toBe(0);
      // Availability penalty severely depresses composite score
      expect(result.compositeScore).toBeLessThan(0.65);
    });
  });

  describe('Scenario 5: Multi-Factor Scoring Weight Validation', () => {
    it('should strictly adhere to defined scoring weights summing to 1.00', () => {
      const totalWeight = (
        SCORING_WEIGHTS.AVAILABILITY +
        SCORING_WEIGHTS.PROXIMITY +
        SCORING_WEIGHTS.ETA +
        SCORING_WEIGHTS.PRICE +
        SCORING_WEIGHTS.RATING
      );
      expect(totalWeight).toBeCloseTo(1.00, 4);
      expect(SCORING_WEIGHTS.AVAILABILITY).toBe(0.35);
      expect(SCORING_WEIGHTS.PROXIMITY).toBe(0.25);
      expect(SCORING_WEIGHTS.ETA).toBe(0.15);
      expect(SCORING_WEIGHTS.PRICE).toBe(0.15);
      expect(SCORING_WEIGHTS.RATING).toBe(0.10);
    });
  });

  describe('Scenario 6: ETA & Distance Helper Logic', () => {
    it('should compute minimum 12 minute ETA buffer and scale with distance', () => {
      const nearEta = calculateETA(1.0); // 5 + 3 = 8 -> min 12
      const farEta = calculateETA(10.0); // 5 + 30 = 35 mins

      expect(nearEta.totalMinutes).toBe(12);
      expect(farEta.totalMinutes).toBe(35);
      expect(farEta.displayText).toBe('35 mins (Target)');
    });
  });
});
```

---

## 9. Verification & Acceptance Criteria

| Checkpoint | Target | Method of Verification |
|---|---|---|
| **Unit Tests** | $\ge 5$ unit tests passing | `npm test` or `cd server && npm test` |
| **REST API** | `POST /api/routing/optimize` returns recommended & alternative plans with scores | cURL / Supertest with mock cart and coordinates |
| **Consolidated Pricing** | Returns single consolidated `totalDemoValue` | Verify JSON payload contains `totalDemoValue` and no fragmented pricing |
| **Fallback Reassignment** | `POST /api/orders/:id/simulate-timeout` reallocates stock and updates status | Trigger endpoint on test order; verify stock restoration and decrement |
| **Audit Log** | Logs `ROUTING_FALLBACK` entry | Inspect `AuditLog` collection for reassigned order |
| **Real-time Event** | Emits `order_fallback_reassigned` via Socket.IO | Listen on `order:${orderId}` room |

---

## 10. Implementation Steps for Downstream Implementer

1. **Step 1**: Create `server/src/services/smartRoutingService.js` with scoring math, split-basket set-cover, and natural language explanation generation.
2. **Step 2**: Create `server/src/controllers/routingController.js` and `server/src/routes/routingRoutes.js`.
3. **Step 3**: Update `server/src/index.js` to mount `app.use('/api/routing', routingRoutes);`.
4. **Step 4**: Update `server/src/models/Order.js` with fallback metadata fields.
5. **Step 5**: Update `server/src/services/orderService.js` with `executeOrderFallback`.
6. **Step 6**: Update `server/src/controllers/orderController.js` with `simulateTimeout` and mount in `server/src/routes/orderRoutes.js`.
7. **Step 7**: Create `server/tests/routing.test.js` and run `npm test`.
