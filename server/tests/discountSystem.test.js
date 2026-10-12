/**
 * QuickMeds Production Discount & Promotion System Test Suite
 * File: server/tests/discountSystem.test.js
 */

const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../src/index');
const Promotion = require('../src/models/Promotion');
const Medicine = require('../src/models/Medicine');
const User = require('../src/models/User');
const Cart = require('../src/models/Cart');
const { generateToken } = require('../src/services/authService');
const {
  calculatePromotionalPrice,
  resolveEffectivePrice,
  findPromotionInMap,
  getActivePromotionsMap,
  getPromotionForMedicine
} = require('../src/services/discountService');

describe('Production Discount & Promotion System Test Suite', () => {

  // =========================================================================
  // 1. UNIT TESTS: discountService.js Pure Logic
  // =========================================================================
  describe('Unit Tests: discountService calculations', () => {

    describe('calculatePromotionalPrice', () => {
      it('should calculate accurate percentage discount', () => {
        const promo = {
          _id: new mongoose.Types.ObjectId(),
          name: '10% Summer Health Discount',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          maxDiscountAmount: null
        };
        const result = calculatePromotionalPrice(100, promo);

        expect(result).not.toBeNull();
        expect(result.discountAmount).toBe(10);
        expect(result.promotionalPrice).toBe(90);
        expect(result.discountPercentage).toBe(10);
        expect(result.promotionName).toBe('10% Summer Health Discount');
      });

      it('should respect maxDiscountAmount cap on percentage discounts', () => {
        const promo = {
          _id: new mongoose.Types.ObjectId(),
          name: '20% Mega Off (Capped at 50)',
          discountType: 'PERCENTAGE',
          discountValue: 20,
          maxDiscountAmount: 50 // 20% of 1000 is 200, but cap is 50
        };
        const result = calculatePromotionalPrice(1000, promo);

        expect(result).not.toBeNull();
        expect(result.discountAmount).toBe(50);
        expect(result.promotionalPrice).toBe(950);
        expect(result.discountPercentage).toBe(5); // 50 / 1000 = 5%
      });

      it('should calculate accurate fixed amount discount', () => {
        const promo = {
          _id: new mongoose.Types.ObjectId(),
          name: 'Flat Rs 25 Off',
          discountType: 'FIXED_AMOUNT',
          discountValue: 25
        };
        const result = calculatePromotionalPrice(200, promo);

        expect(result).not.toBeNull();
        expect(result.discountAmount).toBe(25);
        expect(result.promotionalPrice).toBe(175);
        expect(result.discountPercentage).toBe(13); // 25 / 200 = 12.5% -> round 13
      });

      it('should cap fixed amount discount so selling price is at least Re 1', () => {
        const promo = {
          _id: new mongoose.Types.ObjectId(),
          name: 'Excessive Flat Discount',
          discountType: 'FIXED_AMOUNT',
          discountValue: 300 // Discount exceeds MRP of 100
        };
        const result = calculatePromotionalPrice(100, promo);

        expect(result).not.toBeNull();
        expect(result.promotionalPrice).toBe(1);
        expect(result.discountAmount).toBe(99);
      });

      it('should return null for invalid or zero MRP', () => {
        const promo = {
          _id: new mongoose.Types.ObjectId(),
          name: 'Zero Test',
          discountType: 'PERCENTAGE',
          discountValue: 10
        };
        expect(calculatePromotionalPrice(0, promo)).toBeNull();
        expect(calculatePromotionalPrice(-50, promo)).toBeNull();
        expect(calculatePromotionalPrice(null, promo)).toBeNull();
      });

      it('should return null when promotion is null or undefined', () => {
        expect(calculatePromotionalPrice(100, null)).toBeNull();
        expect(calculatePromotionalPrice(100, undefined)).toBeNull();
      });
    });

    describe('resolveEffectivePrice', () => {
      it('should pick pharmacy price when pharmacy price is cheaper than promotion', () => {
        const mrp = 100;
        const pharmacyPrice = 80; // Pharmacy sells at 20% discount already
        const promo = {
          _id: new mongoose.Types.ObjectId(),
          name: '10% Platform Promo',
          discountType: 'PERCENTAGE',
          discountValue: 10 // Promo gives 90
        };

        const resolved = resolveEffectivePrice(pharmacyPrice, mrp, promo);

        expect(resolved.effectivePrice).toBe(80);
        expect(resolved.discountAmount).toBe(20);
        expect(resolved.discountPercentage).toBe(20);
        expect(resolved.source).toBe('PHARMACY');
      });

      it('should pick promotional price when promotion offers a better deal than pharmacy price', () => {
        const mrp = 100;
        const pharmacyPrice = 95; // Pharmacy offers only 5% off
        const promo = {
          _id: new mongoose.Types.ObjectId(),
          name: '15% Seasonal Promo',
          discountType: 'PERCENTAGE',
          discountValue: 15 // Promo gives 85
        };

        const resolved = resolveEffectivePrice(pharmacyPrice, mrp, promo);

        expect(resolved.effectivePrice).toBe(85);
        expect(resolved.discountAmount).toBe(15);
        expect(resolved.discountPercentage).toBe(15);
        expect(resolved.source).toBe('PROMOTION');
        expect(resolved.promotionName).toBe('15% Seasonal Promo');
      });

      it('should use pharmacy price or MRP when no promotion exists', () => {
        const mrp = 120;
        const pharmacyPrice = 110;

        const resolved = resolveEffectivePrice(pharmacyPrice, mrp, null);

        expect(resolved.effectivePrice).toBe(110);
        expect(resolved.discountAmount).toBe(10);
        expect(resolved.discountPercentage).toBe(8);
        expect(resolved.source).toBe('PHARMACY');
      });

      it('should fallback cleanly to MRP when pharmacy price is missing and no promotion', () => {
        const mrp = 150;
        const resolved = resolveEffectivePrice(null, mrp, null);

        expect(resolved.effectivePrice).toBe(150);
        expect(resolved.discountAmount).toBe(0);
        expect(resolved.discountPercentage).toBe(0);
        expect(resolved.source).toBe('MRP');
      });
    });

    describe('findPromotionInMap', () => {
      it('should prioritize direct medicine ID match over category match', () => {
        const medId = new mongoose.Types.ObjectId().toString();
        const directPromo = { name: 'Direct Med Promo', priority: 1 };
        const catPromo = { name: 'Category Promo', priority: 2 };

        const map = new Map();
        map.set(medId, directPromo);
        map.set('cat:Pain & Fever', catPromo);

        const found = findPromotionInMap(map, medId, 'Pain & Fever');
        expect(found).toBe(directPromo);
      });

      it('should fallback to category promotion when no direct match exists', () => {
        const otherMedId = new mongoose.Types.ObjectId().toString();
        const catPromo = { name: 'Category Promo' };

        const map = new Map();
        map.set('cat:Pain & Fever', catPromo);

        const found = findPromotionInMap(map, otherMedId, 'Pain & Fever');
        expect(found).toBe(catPromo);
      });

      it('should return null when neither medicine ID nor category matches', () => {
        const medId = new mongoose.Types.ObjectId().toString();
        const map = new Map();
        map.set('cat:Diabetes Care', { name: 'Diabetes Promo' });

        const found = findPromotionInMap(map, medId, 'Pain & Fever');
        expect(found).toBeNull();
      });
    });
  });

  // =========================================================================
  // 2. END-TO-END / ROUTE VALIDATION TESTS (supertest)
  // =========================================================================
  describe('Promotion Admin API Endpoints', () => {
    let adminToken;
    let customerToken;
    let adminUser;
    let customerUser;
    let testMedicine;

    beforeAll(async () => {
      // Create admin user directly in DB
      adminUser = await User.create({
        name: 'Promo Admin',
        email: `admin-promo-${Date.now()}@quickmeds.test`,
        password: 'Password@123',
        phone: `98${Math.floor(10000000 + Math.random() * 90000000)}`,
        role: 'ADMIN'
      });
      adminToken = generateToken(adminUser);

      // Create regular customer user directly in DB
      customerUser = await User.create({
        name: 'Regular Customer',
        email: `customer-promo-${Date.now()}@quickmeds.test`,
        password: 'Password@123',
        phone: `99${Math.floor(10000000 + Math.random() * 90000000)}`,
        role: 'CUSTOMER'
      });
      customerToken = generateToken(customerUser);

      // Create test medicine
      testMedicine = await Medicine.create({
        name: `Test Dolo Promo ${Date.now()}`,
        genericName: 'Paracetamol',
        brand: 'Micro Labs',
        manufacturer: 'Micro Labs Ltd',
        strength: '650mg',
        dosageForm: 'Tablet',
        category: 'Pain & Fever',
        description: 'Test medicine for promotions',
        mrp: 100,
        active: true
      });
    });

    afterAll(async () => {
      if (testMedicine?._id) {
        await Medicine.findByIdAndDelete(testMedicine._id);
      }
      if (adminUser?._id) {
        await User.findByIdAndDelete(adminUser._id);
      }
      if (customerUser?._id) {
        await User.findByIdAndDelete(customerUser._id);
      }
      await Promotion.deleteMany({ name: /Test Promo/ });
    });

    it('should reject unauthorized request without token with 401', async () => {
      const res = await request(app).get('/api/promotions');
      expect(res.status).toBe(401);
    });

    it('should reject non-admin users with 403 Forbidden', async () => {
      const res = await request(app)
        .get('/api/promotions')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
    });

    it('should reject promotion with discount percentage > 50% for compliance', async () => {
      const res = await request(app)
        .post('/api/promotions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Promo Illegal 70%',
          discountType: 'PERCENTAGE',
          discountValue: 70, // Exceeds 50% cap
          applicableTo: 'SPECIFIC_MEDICINES',
          medicineIds: [testMedicine._id],
          validFrom: new Date(),
          validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/cannot exceed 50%/i);
    });

    it('should reject promotion with end date before start date', async () => {
      const res = await request(app)
        .post('/api/promotions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Promo Inverted Dates',
          discountType: 'PERCENTAGE',
          discountValue: 10,
          applicableTo: 'SPECIFIC_MEDICINES',
          medicineIds: [testMedicine._id],
          validFrom: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          validTo: new Date() // Past end date
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/after start date/i);
    });

    it('should create a valid modest promotion (15% off) successfully', async () => {
      const res = await request(app)
        .post('/api/promotions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Promo 15% On Paracetamol',
          description: 'Modest promotion for pain & fever essentials',
          discountType: 'PERCENTAGE',
          discountValue: 15,
          maxDiscountAmount: 30,
          applicableTo: 'SPECIFIC_MEDICINES',
          medicineIds: [testMedicine._id],
          validFrom: new Date(Date.now() - 24 * 60 * 60 * 1000), // Started yesterday
          validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Valid for 7 days
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.promotion).toBeDefined();
      expect(res.body.data.promotion.name).toBe('Test Promo 15% On Paracetamol');
      expect(res.body.data.promotion.discountValue).toBe(15);
      expect(res.body.data.promotion.isActive).toBe(true);

      const promoId = res.body.data.promotion._id;

      // Verify list endpoint returns this promotion
      const listRes = await request(app)
        .get('/api/promotions?status=active')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data.promotions.some(p => p._id.toString() === promoId)).toBe(true);

      // Verify toggle status endpoint
      const toggleRes = await request(app)
        .patch(`/api/promotions/${promoId}/toggle`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(toggleRes.status).toBe(200);
      expect(toggleRes.body.data.promotion.isActive).toBe(false);

      // Toggle back on
      await request(app)
        .patch(`/api/promotions/${promoId}/toggle`)
        .set('Authorization', `Bearer ${adminToken}`);

      // Verify medicine detail endpoint now includes the promotion
      const medRes = await request(app).get(`/api/medicines/${testMedicine._id}`);
      expect(medRes.status).toBe(200);
      expect(medRes.body.data.promotion).toBeDefined();
      expect(medRes.body.data.promotion.discountPercentage).toBe(15);
      expect(medRes.body.data.promotion.promotionalPrice).toBe(85); // 100 - 15 = 85
    });

    it('should NOT apply an expired promotion', async () => {
      // Create an expired promotion
      const expiredPromo = await Promotion.create({
        name: 'Test Promo Expired Last Week',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        applicableTo: 'SPECIFIC_MEDICINES',
        medicineIds: [testMedicine._id],
        validFrom: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        validTo: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Expired 7 days ago
        isActive: true,
        createdBy: new mongoose.Types.ObjectId()
      });

      // Query getPromotionForMedicine
      const promoFound = await getPromotionForMedicine(testMedicine._id, testMedicine.category);

      // Should not find the expired promotion (might find active one created in prior test or null)
      if (promoFound) {
        expect(promoFound._id.toString()).not.toBe(expiredPromo._id.toString());
      }

      await Promotion.findByIdAndDelete(expiredPromo._id);
    });

    it('should securely apply promotional price in cart and ignore client price manipulation', async () => {
      // Active 15% promotion is active on testMedicine (MRP = 100, promotionalPrice = 85)
      // Client maliciously tries to send price: 10 or price: 999
      const res = await request(app)
        .post('/api/cart/items')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          medicineId: testMedicine._id,
          quantity: 2,
          price: 999 // Manipulated price from client
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const cart = res.body.data.cart;
      expect(cart.items.length).toBe(1);
      
      const item = cart.items[0];
      // Backend must have applied the real resolved effective price (85), not the client's 999
      expect(item.price).toBe(85);
      expect(item.mrp).toBe(100);
      expect(cart.subtotal).toBe(170); // 85 * 2 = 170

      // Clear cart after test
      await request(app)
        .delete('/api/cart')
        .set('Authorization', `Bearer ${customerToken}`);
    });
  });
});
