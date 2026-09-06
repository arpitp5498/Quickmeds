// SIH DEMO MODE ONLY - REMOVE AFTER SIH
/**
 * Automated Test Suite for Temporary SIH Demo Mode
 * File: server/tests/demoWorkflow.test.js
 */

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const env = require('../src/config/env');
const connectDB = require('../src/config/db');
const Order = require('../src/models/Order');
const User = require('../src/models/User');
const Pharmacy = require('../src/models/Pharmacy');
const DeliveryPartner = require('../src/models/DeliveryPartner');
const PharmacyInventory = require('../src/models/PharmacyInventory');
const { requireDemoMode } = require('../src/demo/demoMiddleware');
const {
  initDemoEnvironment,
  DEMO_EMAILS,
  DEMO_ORDER_ID
} = require('../src/demo/demoSeed');
const {
  getDemoStatus,
  getDemoSession,
  simulatePharmacyRejection,
  resetDemo
} = require('../src/demo/demoService');

jest.setTimeout(30000);

describe('SIH Demo Mode & Multi-Role Isolation Test Suite', () => {
  beforeAll(async () => {
    await connectDB();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('1. Environment Protection & Middleware Guards', () => {
    test('blocks access when ENABLE_DEMO_MODE is false', () => {
      const originalEnv = env.ENABLE_DEMO_MODE;
      env.ENABLE_DEMO_MODE = false;

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      requireDemoMode(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: expect.stringContaining('Demo Mode is disabled')
        })
      );

      env.ENABLE_DEMO_MODE = originalEnv;
    });

    test('allows access through middleware when ENABLE_DEMO_MODE is true', () => {
      const originalEnv = env.ENABLE_DEMO_MODE;
      env.ENABLE_DEMO_MODE = true;

      const req = {};
      const res = {};
      const next = jest.fn();

      requireDemoMode(req, res, next);

      expect(next).toHaveBeenCalled();

      env.ENABLE_DEMO_MODE = originalEnv;
    });
  });

  describe('2. Demo Entities Initialization & Isolation', () => {
    test('initializes all 4 isolated demo entities and shared order QM-DEMO-001', async () => {
      const { customer, pharmacyA, pharmacyB, rider, demoOrder } = await initDemoEnvironment();

      expect(customer).toBeDefined();
      expect(customer.email).toBe(DEMO_EMAILS.CUSTOMER);
      expect(customer.role).toBe('CUSTOMER');

      expect(pharmacyA).toBeDefined();
      expect(pharmacyA.name).toBe('QuickMeds Demo Pharmacy 1');

      expect(pharmacyB).toBeDefined();
      expect(pharmacyB.name).toContain('QuickMeds Demo Pharmacy 2');

      expect(rider).toBeDefined();
      expect(rider.status).toBe('AVAILABLE');

      expect(demoOrder).toBeDefined();
      expect(demoOrder.orderId).toBe(DEMO_ORDER_ID);
      expect(demoOrder.isDemo).toBe(true);
    });
  });

  describe('3. Multi-Role Scoped JWT Generation (No Multiple Logins)', () => {
    test('generates valid scoped JWT for Demo Customer', async () => {
      const session = await getDemoSession('CUSTOMER');
      expect(session.token).toBeDefined();
      expect(session.user.role).toBe('CUSTOMER');
      expect(session.user.email).toBe(DEMO_EMAILS.CUSTOMER);

      const decoded = jwt.verify(session.token, env.JWT_SECRET);
      expect(decoded.role).toBe('CUSTOMER');
      expect(decoded.id).toBe(session.user._id.toString());
    });

    test('generates valid scoped JWT for Demo Pharmacy A and Pharmacy B', async () => {
      const sessionA = await getDemoSession('PHARMACY_A');
      expect(sessionA.user.role).toBe('PHARMACY');
      expect(sessionA.user.email).toBe(DEMO_EMAILS.PHARMACY_A);

      const sessionB = await getDemoSession('PHARMACY_B');
      expect(sessionB.user.role).toBe('PHARMACY');
      expect(sessionB.user.email).toBe(DEMO_EMAILS.PHARMACY_B);
    });

    test('generates valid scoped JWT for Demo Rider', async () => {
      const session = await getDemoSession('RIDER');
      expect(session.user.role).toBe('DELIVERY_PARTNER');
      expect(session.user.email).toBe(DEMO_EMAILS.RIDER);
    });
  });

  describe('4. Realtime Fallback Rerouting & Baseline Reset', () => {
    test('simulates pharmacy rejection and triggers Smart Fallback Rerouting', async () => {
      // Ensure order is at Pharmacy A
      await resetDemo();

      const rerouteResult = await simulatePharmacyRejection();
      expect(rerouteResult.triggered).toBe(true);
      expect(rerouteResult.newPharmacy).toBeDefined();
      expect(rerouteResult.newPharmacy).not.toContain('Demo Pharmacy 1');

      const updatedOrder = await Order.findOne({ orderId: DEMO_ORDER_ID });
      expect(updatedOrder.fallbackTriggered).toBe(true);
      expect(updatedOrder.fallbackAttempt).toBe(1);
      // Confirms rider assignment was safely cleared on store transfer
      expect(updatedOrder.deliveryPartnerId).toBeNull();
    });

    test('resetDemo restores order to PLACED at Pharmacy A with baseline stock', async () => {
      const resetResult = await resetDemo();
      expect(resetResult.success).toBe(true);

      const status = await getDemoStatus();
      expect(status.order.orderStatus).toBe('PLACED');
      expect(status.order.pharmacyId.name).toContain('Pharmacy 1');
      expect(status.order.deliveryPartnerId).toBeNull();
      expect(status.inventory.pharmacyAStock).toBe(10);
      expect(status.inventory.pharmacyBStock).toBe(20);
    });
  });

  describe('5. Production Analytics Isolation', () => {
    test('admin analytics filter { isDemo: { $ne: true } } isolates demo orders from real metrics', async () => {
      const demoCount = await Order.countDocuments({ isDemo: true });
      expect(demoCount).toBeGreaterThanOrEqual(1);

      const realOrders = await Order.find({ isDemo: { $ne: true } });
      expect(realOrders.some(o => o.isDemo === true)).toBe(false);
    });
  });
});
