/**
 * Smart Fulfilment Routing & Fallback Engine Unit Tests
 * File: server/tests/routing.test.js
 */

const request = require('supertest');
const { app } = require('../src/index');
const {
  scorePharmacyCandidate,
  calculateETA,
  generateExplanation,
  calculateBasketPrice,
  findSplitBasketOption,
  optimizeFulfilmentPlan,
  SCORING_WEIGHTS
} = require('../src/services/smartRoutingService');
const {
  validateStatusTransition
} = require('../src/services/orderService');
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
      expect(result.breakdown.eta).toBe(0.8);
      expect(result.breakdown.rating).toBe(0.96);
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

    it('should correctly determine optimal split basket pair using findSplitBasketOption', () => {
      const partialCandidates = [
        {
          pharmacyId: 'p1',
          compositeScore: 0.70,
          availableItems: [{ medicineId: 'm1' }, { medicineId: 'm2' }]
        },
        {
          pharmacyId: 'p2',
          compositeScore: 0.65,
          availableItems: [{ medicineId: 'm3' }]
        },
        {
          pharmacyId: 'p3',
          compositeScore: 0.50,
          availableItems: [{ medicineId: 'm1' }]
        }
      ];

      const bestPair = findSplitBasketOption(partialCandidates, 3);
      expect(bestPair).not.toBeNull();
      expect(bestPair.pA.pharmacyId).toBe('p1');
      expect(bestPair.pB.pharmacyId).toBe('p2');
      expect(bestPair.jointCoverage).toBe(1.0);
      expect(bestPair.jointScore).toBeCloseTo((0.70 + 0.65) / 2, 2);
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

    it('should handle single-store explanation generation correctly', () => {
      const singlePlan = {
        type: 'SINGLE_STORE',
        pharmacies: [{ name: 'MedPlus Saket', distanceKm: 2.3 }],
        fulfilmentPoints: 1,
        basketCoverage: 1.0,
        compositeScore: 0.92,
        etaMinutes: 12
      };
      const exp = generateExplanation(singlePlan, 'SINGLE_STORE');
      expect(exp).toContain('MedPlus Saket');
      expect(exp).toContain('100% stock coverage');
      expect(exp).toContain('12 min delivery');
    });

    it('should return zero coverage plan structure when cart is empty in optimizeFulfilmentPlan', async () => {
      const result = await optimizeFulfilmentPlan([], [77.2090, 28.6139]);
      expect(result.basketCoverage).toBe(0);
      expect(result.fulfilmentPoints).toBe(0);
      expect(result.recommended).toBeNull();
      expect(result.explanation).toContain('Cart is empty');
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

  describe('Scenario 7: Basket Price Calculation Helper', () => {
    it('should compute accurate subtotal across requested items and quantities', () => {
      const cartItems = [
        { medicineId: 'med_1', quantity: 2, price: 40 },
        { medicineId: 'med_2', quantity: 1, price: 100 }
      ];
      const inventories = [
        { medicineId: 'med_1', price: 45 },
        { medicineId: 'med_2', price: 95 }
      ];

      const price = calculateBasketPrice(cartItems, inventories);
      expect(price).toBe(45 * 2 + 95 * 1); // 90 + 95 = 185
    });
  });

  describe('Scenario 8: Order State Machine & Fallback Rules', () => {
    it('should validate legitimate order state transitions', () => {
      expect(validateStatusTransition('PLACED', 'PHARMACY_REVIEW')).toBe(true);
      expect(validateStatusTransition('PLACED', 'ACCEPTED')).toBe(true);
      expect(validateStatusTransition('ACCEPTED', 'PREPARING')).toBe(true);
      expect(validateStatusTransition('PREPARING', 'READY_FOR_PICKUP')).toBe(true);
      expect(validateStatusTransition('READY_FOR_PICKUP', 'DELIVERY_ASSIGNED')).toBe(true);
    });

    it('should reject illegal state transitions with ApiError', () => {
      expect(() => {
        validateStatusTransition('DELIVERED', 'PLACED');
      }).toThrow();

      expect(() => {
        validateStatusTransition('CANCELLED', 'ACCEPTED');
      }).toThrow();
    });
  });

  describe('Scenario 9: HTTP REST API Endpoints', () => {
    it('POST /api/routing/optimize should reject empty items with 400', async () => {
      const res = await request(app)
        .post('/api/routing/optimize')
        .send({ items: [] });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/routing/pharmacies-map should return pharmacy network map data', async () => {
      const res = await request(app)
        .get('/api/routing/pharmacies-map?lat=28.6139&lng=77.2090&radius=15');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('patientCoordinates');
      expect(res.body.data).toHaveProperty('pharmacies');
      expect(Array.isArray(res.body.data.pharmacies)).toBe(true);
    }, 20000);
  });
});
