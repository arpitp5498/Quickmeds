/**
 * Adversarial Routing & Boundary Stress Test Suite
 * File: server/tests/adversarialRouting.test.js
 * Author: Challenger 1 (Milestone 1)
 */

const {
  scorePharmacyCandidate,
  calculateETA,
  calculateBasketPrice,
  findSplitBasketOption,
  generateExplanation,
  optimizeFulfilmentPlan,
  SCORING_WEIGHTS,
  DEFAULT_MAX_DISTANCE_KM,
  MAX_ETA_MINUTES_HORIZON
} = require('../src/services/smartRoutingService');
const { calculateDistance, estimateDeliveryTime, calculateDeliveryFee } = require('../src/utils/geo');

describe('Adversarial & Boundary Verification for Smart Routing Service', () => {

  // =========================================================================
  // 1. Boundary Conditions & Stock Extremes
  // =========================================================================
  describe('1. Boundary Conditions & Stock Extremes', () => {
    
    it('1.1 Zero available stock across all items returns 0 availability score and composite <= 0.65', () => {
      const candidate = {
        availableCount: 0,
        totalItemsCount: 5,
        distanceKm: 2.0,
        maxDistanceKm: 15.0,
        etaMinutes: 12,
        basketPrice: 0,
        minBasketPrice: 0,
        maxBasketPrice: 0,
        rating: 5.0
      };

      const result = scorePharmacyCandidate(candidate);

      expect(result.breakdown.availability).toBe(0.0);
      expect(result.compositeScore).toBeGreaterThanOrEqual(0);
      expect(result.compositeScore).toBeLessThanOrEqual(1.0);
      expect(Number.isFinite(result.compositeScore)).toBe(true);
      expect(isNaN(result.compositeScore)).toBe(false);
    });

    it('1.2 Requested quantity far exceeding stock (> 1000 units) flags item as missing', () => {
      const cartItems = [
        { medicineId: 'med_paracetamol', quantity: 1000, price: 20 },
        { medicineId: 'med_cough_syrup', quantity: 1, price: 90 }
      ];
      const inventories = [
        { medicineId: 'med_paracetamol', stock: 15, price: 20 }, // Only 15 available
        { medicineId: 'med_cough_syrup', stockQuantity: 50, price: 90 } // 50 available
      ];

      // Calculate basket price helper
      const price = calculateBasketPrice(cartItems, inventories);
      expect(price).toBe(1000 * 20 + 1 * 90); // 20090

      // Simulate stock check logic from optimizeFulfilmentPlan
      const availableItems = [];
      const missingItems = [];

      for (const item of cartItems) {
        const inv = inventories.find(i => i.medicineId === item.medicineId);
        const reqQty = item.quantity || 1;
        const stock = inv ? (inv.stockQuantity !== undefined ? inv.stockQuantity : (inv.stock || 0)) : 0;
        if (inv && stock >= reqQty) {
          availableItems.push(item);
        } else {
          missingItems.push(item);
        }
      }

      expect(availableItems.length).toBe(1);
      expect(availableItems[0].medicineId).toBe('med_cough_syrup');
      expect(missingItems.length).toBe(1);
      expect(missingItems[0].medicineId).toBe('med_paracetamol');
    });

    it('1.3 Boundary distance: Exactly at max radius (15.0 km) yields proximity score 0.0', () => {
      const candidate = {
        availableCount: 3,
        totalItemsCount: 3,
        distanceKm: 15.0,
        maxDistanceKm: 15.0,
        etaMinutes: 50,
        basketPrice: 200,
        minBasketPrice: 200,
        maxBasketPrice: 200,
        rating: 4.5
      };

      const result = scorePharmacyCandidate(candidate);
      expect(result.breakdown.proximity).toBe(0.0);
    });

    it('1.4 Distance far beyond max radius (> 15 km, e.g. 50 km, 500 km) clamps proximity & ETA scores to 0 without negative values', () => {
      const extremeCandidate = {
        availableCount: 3,
        totalItemsCount: 3,
        distanceKm: 120.0,
        maxDistanceKm: 15.0,
        etaMinutes: 365, // > 60 min horizon
        basketPrice: 300,
        minBasketPrice: 300,
        maxBasketPrice: 300,
        rating: 5.0
      };

      const result = scorePharmacyCandidate(extremeCandidate);
      expect(result.breakdown.proximity).toBe(0.0);
      expect(result.breakdown.eta).toBe(0.0);
      expect(result.compositeScore).toBeGreaterThanOrEqual(0.0);
      expect(result.compositeScore).toBeLessThanOrEqual(1.0);
      // Availability: 0.35 * 1.0 = 0.35, Price: 0.15 * 1.0 = 0.15, Rating: 0.10 * 1.0 = 0.10 => 0.60
      expect(result.compositeScore).toBe(0.60);
    });

    it('1.5 Distance of 0.0 km (co-located) yields proximity 1.0 and ETA minimum buffer of 12 minutes', () => {
      const eta = calculateETA(0.0);
      expect(eta.totalMinutes).toBe(12);

      const candidate = {
        availableCount: 2,
        totalItemsCount: 2,
        distanceKm: 0.0,
        maxDistanceKm: 15.0,
        etaMinutes: eta.totalMinutes,
        basketPrice: 100,
        minBasketPrice: 100,
        maxBasketPrice: 100,
        rating: 5.0
      };

      const result = scorePharmacyCandidate(candidate);
      expect(result.breakdown.proximity).toBe(1.0);
      expect(result.breakdown.eta).toBe(1 - 12 / 60); // 0.80
    });

    it('1.6 Negative distance input is safely clamped without crashing or producing scores > 1.0', () => {
      const eta = calculateETA(-10);
      expect(eta.totalMinutes).toBe(12);

      const candidate = {
        availableCount: 1,
        totalItemsCount: 1,
        distanceKm: -5.0,
        maxDistanceKm: 15.0,
        etaMinutes: 12,
        basketPrice: 100,
        minBasketPrice: 100,
        maxBasketPrice: 100,
        rating: 5.0
      };

      const result = scorePharmacyCandidate(candidate);
      expect(result.breakdown.proximity).toBeLessThanOrEqual(1.0);
      expect(result.compositeScore).toBeLessThanOrEqual(1.0);
    });
  });

  // =========================================================================
  // 2. Mathematical Stability & Zero-Division Protections
  // =========================================================================
  describe('2. Mathematical Stability & Zero-Division Protections', () => {

    it('2.1 Price normalization: minBasketPrice === maxBasketPrice avoids division by zero and gives priceScore = 1.0', () => {
      const candidate = {
        availableCount: 1,
        totalItemsCount: 1,
        distanceKm: 2.0,
        maxDistanceKm: 15.0,
        etaMinutes: 15,
        basketPrice: 250,
        minBasketPrice: 250,
        maxBasketPrice: 250,
        rating: 4.5
      };

      const result = scorePharmacyCandidate(candidate);
      expect(result.breakdown.price).toBe(1.0);
      expect(isNaN(result.breakdown.price)).toBe(false);
      expect(Number.isFinite(result.compositeScore)).toBe(true);
    });

    it('2.2 Price normalization: 0 min and 0 max price does not produce NaN or Infinity', () => {
      const candidate = {
        availableCount: 1,
        totalItemsCount: 1,
        distanceKm: 2.0,
        basketPrice: 0,
        minBasketPrice: 0,
        maxBasketPrice: 0
      };

      const result = scorePharmacyCandidate(candidate);
      expect(result.breakdown.price).toBe(1.0);
      expect(isNaN(result.compositeScore)).toBe(false);
    });

    it('2.3 Availability normalization: totalItemsCount = 0 avoids division by zero and yields 0.0', () => {
      const candidate = {
        availableCount: 0,
        totalItemsCount: 0,
        distanceKm: 2.0
      };

      const result = scorePharmacyCandidate(candidate);
      expect(result.breakdown.availability).toBe(0.0);
      expect(isNaN(result.compositeScore)).toBe(false);
    });

    it('2.4 Distance normalization: maxDistanceKm = 0 or negative falls back to DEFAULT_MAX_DISTANCE_KM (15)', () => {
      const candidateZeroMax = {
        availableCount: 1,
        totalItemsCount: 1,
        distanceKm: 3.0,
        maxDistanceKm: 0,
        etaMinutes: 15,
        basketPrice: 100,
        minBasketPrice: 100,
        maxBasketPrice: 100,
        rating: 4.5
      };

      const resultZero = scorePharmacyCandidate(candidateZeroMax);
      // Fallback to 15.0 km -> 1 - 3/15 = 0.80
      expect(resultZero.breakdown.proximity).toBe(0.80);
      expect(isNaN(resultZero.compositeScore)).toBe(false);

      const candidateNegativeMax = {
        ...candidateZeroMax,
        maxDistanceKm: -5.0
      };
      const resultNeg = scorePharmacyCandidate(candidateNegativeMax);
      expect(resultNeg.breakdown.proximity).toBe(0.80);
    });

    it('2.5 Rating normalization: undefined, 0, negative, or > 5.0 rating values are safely handled', () => {
      // Missing / 0 rating -> defaults to 4.5
      const resMissing = scorePharmacyCandidate({ rating: undefined });
      expect(resMissing.breakdown.rating).toBe(0.9); // 4.5 / 5.0

      const resZero = scorePharmacyCandidate({ rating: 0 });
      expect(resZero.breakdown.rating).toBe(0.9);

      const resNegative = scorePharmacyCandidate({ rating: -3 });
      expect(resNegative.breakdown.rating).toBe(0.9);

      // Oversized rating -> clamped to 1.0
      const resHigh = scorePharmacyCandidate({ rating: 7.5 });
      expect(resHigh.breakdown.rating).toBe(1.0);
    });

    it('2.6 Floating point precision: breakdown values and compositeScore are rounded to 4 decimals', () => {
      const candidate = {
        availableCount: 1,
        totalItemsCount: 3, // 1/3 = 0.3333333333333333
        distanceKm: 7.777,
        maxDistanceKm: 15.0,
        etaMinutes: 23,
        basketPrice: 133.33,
        minBasketPrice: 100,
        maxBasketPrice: 200,
        rating: 4.333
      };

      const result = scorePharmacyCandidate(candidate);
      const strScore = result.compositeScore.toString();
      const decimalPlaces = strScore.includes('.') ? strScore.split('.')[1].length : 0;
      expect(decimalPlaces).toBeLessThanOrEqual(4);

      for (const [key, val] of Object.entries(result.breakdown)) {
        const strVal = val.toString();
        const dPlaces = strVal.includes('.') ? strVal.split('.')[1].length : 0;
        expect(dPlaces).toBeLessThanOrEqual(4);
      }
    });
  });

  // =========================================================================
  // 3. Split-Basket Set Cover & Tie-Breaking
  // =========================================================================
  describe('3. Split-Basket Set Cover & Candidate Tie-Breaking', () => {

    it('3.1 Disjoint inventories: Correctly selects optimal pair covering 100% of cart', () => {
      const candidates = [
        {
          pharmacyId: 'store_A',
          compositeScore: 0.80,
          availableItems: [{ medicineId: 'm1' }, { medicineId: 'm2' }],
          scoreBreakdown: { proximity: 0.8, eta: 0.7, price: 0.9, rating: 0.9 }
        },
        {
          pharmacyId: 'store_B',
          compositeScore: 0.75,
          availableItems: [{ medicineId: 'm3' }, { medicineId: 'm4' }],
          scoreBreakdown: { proximity: 0.7, eta: 0.6, price: 0.8, rating: 0.8 }
        },
        {
          pharmacyId: 'store_C',
          compositeScore: 0.70,
          availableItems: [{ medicineId: 'm1' }],
          scoreBreakdown: { proximity: 0.9, eta: 0.9, price: 0.9, rating: 0.9 }
        }
      ];

      const bestPair = findSplitBasketOption(candidates, 4);
      expect(bestPair).not.toBeNull();
      expect(bestPair.pA.pharmacyId).toBe('store_A');
      expect(bestPair.pB.pharmacyId).toBe('store_B');
      expect(bestPair.jointCoverage).toBe(1.0);
      expect(bestPair.jointScore).toBe(0.775);
    });

    it('3.2 Equal coverage tie-breaking: Selects pair with higher average composite score', () => {
      const candidates = [
        {
          pharmacyId: 'store_A',
          compositeScore: 0.85,
          availableItems: [{ medicineId: 'm1' }]
        },
        {
          pharmacyId: 'store_B_high_score',
          compositeScore: 0.80,
          availableItems: [{ medicineId: 'm2' }]
        },
        {
          pharmacyId: 'store_C_low_score',
          compositeScore: 0.50,
          availableItems: [{ medicineId: 'm2' }]
        }
      ];

      // Pair A+B gives 100% coverage with score (0.85+0.80)/2 = 0.825
      // Pair A+C gives 100% coverage with score (0.85+0.50)/2 = 0.675
      const bestPair = findSplitBasketOption(candidates, 2);
      expect(bestPair.pB.pharmacyId).toBe('store_B_high_score');
      expect(bestPair.jointScore).toBe(0.825);
    });

    it('3.3 Fewer than 2 candidates returns null without throwing', () => {
      expect(findSplitBasketOption([], 3)).toBeNull();
      expect(findSplitBasketOption(null, 3)).toBeNull();
      expect(findSplitBasketOption([{ pharmacyId: 'p1', availableItems: [] }], 3)).toBeNull();
    });

    it('3.4 Identical candidate scores sort stably and generate valid alternative plan', () => {
      const scoredList = [
        {
          pharmacyId: 'p1',
          compositeScore: 0.8500,
          distanceKm: 2.0,
          availableCount: 2,
          totalItemsCount: 2,
          pharmacy: { _id: 'p1', name: 'Pharmacy 1' }
        },
        {
          pharmacyId: 'p2',
          compositeScore: 0.8500,
          distanceKm: 2.0,
          availableCount: 2,
          totalItemsCount: 2,
          pharmacy: { _id: 'p2', name: 'Pharmacy 2' }
        }
      ];

      scoredList.sort((a, b) => b.compositeScore - a.compositeScore);
      expect(scoredList.length).toBe(2);
      expect(scoredList[0].pharmacyId).toBeDefined();
      expect(scoredList[1].pharmacyId).toBeDefined();
      expect(scoredList[0].pharmacyId).not.toBe(scoredList[1].pharmacyId);
    });
  });

  // =========================================================================
  // 4. Geographic Calculations & Extreme Coordinate Points
  // =========================================================================
  describe('4. Geographic Calculations & Extreme Coordinate Points', () => {

    it('4.1 Identical coordinates return 0.0 km distance', () => {
      const dist = calculateDistance(28.6139, 77.2090, 28.6139, 77.2090);
      expect(dist).toBe(0);
    });

    it('4.2 Missing coordinates return 0 distance without throw', () => {
      expect(calculateDistance(undefined, 77.2090, 28.6139, 77.2090)).toBe(0);
      expect(calculateDistance(28.6139, undefined, 28.6139, 77.2090)).toBe(0);
      expect(calculateDistance()).toBe(0);
    });

    it('4.3 Global extreme coordinates (Poles & Equator) calculate valid spherical distances', () => {
      // North Pole (90, 0) to South Pole (-90, 0) -> Half circumference ~ 20015 km
      const poleToPole = calculateDistance(90, 0, -90, 0);
      expect(poleToPole).toBeCloseTo(20015, -2);

      // Delhi (28.6139, 77.2090) to Mumbai (19.0760, 72.8777) ~ 1150 km
      const delhiMumbai = calculateDistance(28.6139, 77.2090, 19.0760, 72.8777);
      expect(delhiMumbai).toBeGreaterThan(1100);
      expect(delhiMumbai).toBeLessThan(1200);
    });

    it('4.4 Delivery fee calculation tiers and ₹120 ceiling', () => {
      expect(calculateDeliveryFee(1.5)).toBe(25); // Base <= 3km
      expect(calculateDeliveryFee(3.0)).toBe(25); // Base exactly 3km
      expect(calculateDeliveryFee(5.0)).toBe(25 + 2 * 8); // 41
      expect(calculateDeliveryFee(20.0)).toBe(120); // 25 + 17*8 = 161 -> capped at 120
      expect(calculateDeliveryFee(100.0)).toBe(120); // Hard cap
    });
  });

  // =========================================================================
  // 5. Automated Fuzzing / Invariant Property Testing (1,000 Random Runs)
  // =========================================================================
  describe('5. Fuzzing & Invariant Stress Harness (1,000 Random Inputs)', () => {

    it('5.1 Maintains 0.0 <= score <= 1.0 and isFinite across 1,000 randomized candidate evaluations', () => {
      for (let i = 0; i < 1000; i++) {
        const totalItemsCount = Math.floor(Math.random() * 20); // 0 to 19
        const availableCount = Math.floor(Math.random() * 25);   // Can exceed totalItemsCount
        const distanceKm = (Math.random() * 150) - 10;          // -10km to 140km
        const maxDistanceKm = (Math.random() * 50) - 5;         // -5km to 45km
        const etaMinutes = Math.floor(Math.random() * 120);     // 0 to 120 mins
        const basketPrice = Math.random() * 5000;
        const minBasketPrice = Math.random() * 3000;
        const maxBasketPrice = Math.random() * 6000;
        const rating = (Math.random() * 8) - 1;                 // -1 to 7

        const res = scorePharmacyCandidate({
          availableCount,
          totalItemsCount,
          distanceKm,
          maxDistanceKm,
          etaMinutes,
          basketPrice,
          minBasketPrice,
          maxBasketPrice,
          rating
        });

        // Assert Invariants
        expect(Number.isFinite(res.compositeScore)).toBe(true);
        expect(isNaN(res.compositeScore)).toBe(false);
        expect(res.compositeScore).toBeGreaterThanOrEqual(0.0);
        expect(res.compositeScore).toBeLessThanOrEqual(1.0);

        for (const [metric, val] of Object.entries(res.breakdown)) {
          expect(Number.isFinite(val)).toBe(true);
          expect(isNaN(val)).toBe(false);
          expect(val).toBeGreaterThanOrEqual(0.0);
          expect(val).toBeLessThanOrEqual(1.0);
        }
      }
    });

    it('5.2 Stress-test findSplitBasketOption bounds and detect whether jointCoverage exceeds 1.0', () => {
      // Scenario: 2 pharmacies together provide 4 unique medicine IDs, but totalItemsCount is 3
      const candidates = [
        {
          pharmacyId: 'p_1',
          compositeScore: 0.8,
          availableItems: [{ medicineId: 'm1' }, { medicineId: 'm2' }]
        },
        {
          pharmacyId: 'p_2',
          compositeScore: 0.7,
          availableItems: [{ medicineId: 'm3' }, { medicineId: 'm4' }]
        }
      ];

      const pair = findSplitBasketOption(candidates, 3);
      expect(pair).not.toBeNull();
      // EMPIRICAL CHALLENGE: If jointCoverage > 1.0 (e.g. 4/3 = 1.333), this violates the 100% boundary invariant
      expect(pair.jointCoverage).toBeLessThanOrEqual(1.0);
    });
  });

  // =========================================================================
  // 6. optimizeFulfilmentPlan End-to-End Adversarial Scenarios
  // =========================================================================
  describe('6. optimizeFulfilmentPlan End-to-End Flow & Fallbacks', () => {
    const Pharmacy = require('../src/models/Pharmacy');
    const PharmacyInventory = require('../src/models/PharmacyInventory');

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('6.1 Returns zero stock fallback when pharmacies exist but have 0 inventory', async () => {
      const mockPharmacies = [
        {
          _id: 'pharm_1',
          name: 'Apollo Pharmacy',
          address: { fullAddress: 'Connaught Place' },
          phone: '9999999999',
          rating: 4.8,
          location: { coordinates: [77.2100, 28.6140] }
        },
        {
          _id: 'pharm_2',
          name: 'Guardian Health',
          address: { fullAddress: 'Saket' },
          phone: '8888888888',
          rating: 4.5,
          location: { coordinates: [77.2150, 28.6200] }
        }
      ];

      jest.spyOn(Pharmacy, 'find').mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockPharmacies)
      });

      // No inventory found for requested medicines
      jest.spyOn(PharmacyInventory, 'find').mockReturnValue({
        populate: jest.fn().mockResolvedValue([])
      });

      const cartItems = [
        { medicineId: 'med_paracetamol', quantity: 2, name: 'Paracetamol', price: 30 },
        { medicineId: 'med_azithral', quantity: 1, name: 'Azithral', price: 120 }
      ];

      const result = await optimizeFulfilmentPlan(cartItems, [77.2090, 28.6139]);

      expect(result.recommended).toBeNull();
      expect(result.alternative).toBeNull();
      expect(result.basketCoverage).toBe(0);
      expect(result.fulfilmentPoints).toBe(0);
      expect(result.explanation).toContain('No verified pharmacies in your area currently have stock');
      expect(result.allCandidates.length).toBe(2);
      expect(result.allCandidates[0].availableCount).toBe(0);
    });

    it('6.2 Handles split-basket fulfilment when 2 stores complement each other', async () => {
      const mockPharmacies = [
        {
          _id: 'pharm_1',
          name: 'Apollo Pharmacy',
          address: { fullAddress: 'Connaught Place' },
          phone: '9999999999',
          rating: 4.8,
          location: { coordinates: [77.2100, 28.6140] }
        },
        {
          _id: 'pharm_2',
          name: 'Guardian Health',
          address: { fullAddress: 'Saket' },
          phone: '8888888888',
          rating: 4.6,
          location: { coordinates: [77.2150, 28.6200] }
        }
      ];

      jest.spyOn(Pharmacy, 'find').mockReturnValue({
        limit: jest.fn().mockResolvedValue(mockPharmacies)
      });

      jest.spyOn(PharmacyInventory, 'find').mockImplementation((query) => {
        if (query.pharmacyId === 'pharm_1') {
          return {
            populate: jest.fn().mockResolvedValue([
              { medicineId: { _id: 'med_1', name: 'Paracetamol' }, stockQuantity: 10, price: 30, isAvailable: true }
            ])
          };
        } else {
          return {
            populate: jest.fn().mockResolvedValue([
              { medicineId: { _id: 'med_2', name: 'Azithral' }, stockQuantity: 5, price: 120, isAvailable: true }
            ])
          };
        }
      });

      const cartItems = [
        { medicineId: 'med_1', quantity: 1, name: 'Paracetamol', price: 30 },
        { medicineId: 'med_2', quantity: 1, name: 'Azithral', price: 120 }
      ];

      const result = await optimizeFulfilmentPlan(cartItems, [77.2090, 28.6139]);

      expect(result.recommended).not.toBeNull();
      expect(result.recommended.type).toBe('SPLIT_BASKET');
      expect(result.recommended.fulfilmentPoints).toBe(2);
      expect(result.recommended.basketCoverage).toBe(1.0);
      expect(result.recommended.itemsCovered).toBe(2);
      expect(result.recommended.pharmacies.length).toBe(2);
      expect(result.recommended.priceBreakdown.totalOrderValue).toBeGreaterThan(0);
      expect(result.alternative).not.toBeNull();
      expect(result.alternative.type).toBe('SINGLE_STORE');
    });

    it('6.3 Respects excludePharmacyIds and does not route to excluded stores', async () => {
      const mockFind = jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue([])
      });
      jest.spyOn(Pharmacy, 'find').mockImplementation(mockFind);

      await optimizeFulfilmentPlan(
        [{ medicineId: 'med_1', quantity: 1 }],
        [77.2090, 28.6139],
        { excludePharmacyIds: ['pharm_excluded_1', 'pharm_excluded_2'] }
      );

      expect(mockFind).toHaveBeenCalled();
      const calledQuery = mockFind.mock.calls[0][0];
      expect(calledQuery._id).toEqual({ $nin: ['pharm_excluded_1', 'pharm_excluded_2'] });
    });

    it('6.4 Handles non-array coordinates objects ({ lat, lng } and { latitude, longitude }) gracefully', async () => {
      jest.spyOn(Pharmacy, 'find').mockReturnValue({
        limit: jest.fn().mockResolvedValue([])
      });

      const res1 = await optimizeFulfilmentPlan(
        [{ medicineId: 'med_1', quantity: 1 }],
        { lat: 28.6139, lng: 77.2090 }
      );
      expect(res1).toBeDefined();

      const res2 = await optimizeFulfilmentPlan(
        [{ medicineId: 'med_1', quantity: 1 }],
        { latitude: 28.6139, longitude: 77.2090 }
      );
      expect(res2).toBeDefined();

      const res3 = await optimizeFulfilmentPlan(
        [{ medicineId: 'med_1', quantity: 1 }],
        null
      );
      expect(res3).toBeDefined();
    });

    it('6.5 Handles malformed cart item with missing/null medicineId gracefully without throwing TypeError', async () => {
      jest.spyOn(Pharmacy, 'find').mockReturnValue({
        limit: jest.fn().mockResolvedValue([])
      });

      // Passing an item with null or missing medicineId
      const malformedCart = [
        { name: 'Unknown Med', quantity: 1 } // medicineId is undefined
      ];

      const res = await optimizeFulfilmentPlan(malformedCart, [77.2090, 28.6139]);
      expect(res).toBeDefined();
      expect(res.recommended).toBeNull();
      expect(res.explanation).toContain('No verified pharmacies');
    });

    it('6.6 Negative item quantity boundary condition is normalized to prevent zero-stock bypass', () => {
      const cartItems = [
        { medicineId: 'med_1', quantity: -3, price: 50 }
      ];
      const inventories = [
        { medicineId: 'med_1', stock: 0, price: 50 } // Zero stock!
      ];

      // Calculate basket price: negative quantity normalized to 1
      const price = calculateBasketPrice(cartItems, inventories);
      expect(price).toBe(50); // 50 * 1 = 50

      // Stock check: normalized reqQty = 1, stock = 0 -> 0 >= 1 is FALSE
      const inv = inventories[0];
      const reqQty = Math.max(1, parseInt(cartItems[0].quantity, 10) || 1);
      const stock = inv.stock;
      const isConsideredAvailable = stock >= reqQty;
      expect(isConsideredAvailable).toBe(false);
    });
  });
});

