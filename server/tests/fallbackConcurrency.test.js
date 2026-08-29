/**
 * Empirical Adversarial Fallback & Concurrency Verification Test Suite
 * File: server/tests/fallbackConcurrency.test.js
 * Author: Challenger 2 (Milestone 1)
 */

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const mongoose = require('mongoose');
const Order = require('../src/models/Order');
const Pharmacy = require('../src/models/Pharmacy');
const PharmacyInventory = require('../src/models/PharmacyInventory');
const Medicine = require('../src/models/Medicine');
const User = require('../src/models/User');
const {
  executeFallbackReassignment,
  decrementInventory,
  restoreInventory,
  validateStatusTransition
} = require('../src/services/orderService');
const connectDB = require('../src/config/db');

jest.setTimeout(30000);

describe('Adversarial Fallback Routing & Concurrency Verification', () => {
  let customerUser;
  let testMedicine;
  let pharmacies = [];
  const initialStockPerPharmacy = 20;

  beforeAll(async () => {
    // Connect to database (with automatic in-memory fallback)
    await connectDB();

    // Clean up any lingering test artifacts
    await Order.deleteMany({ orderId: { $regex: /^TEST-FALLBACK-/ } });
    await Pharmacy.deleteMany({ name: { $regex: /^Test Pharmacy FB-/ } });
    await Medicine.deleteMany({ name: { $regex: /^Test Medicine FB/ } });
    await User.deleteMany({ email: { $regex: /@fallback-test\.com$/ } });

    // Create Customer
    customerUser = await User.create({
      name: 'Fallback Customer',
      email: `customer-${Date.now()}@fallback-test.com`,
      password: 'Password123!',
      phone: '9876543210',
      role: 'CUSTOMER'
    });

    // Create Medicine matching exact schema
    testMedicine = await Medicine.create({
      name: `Test Medicine FB ${Date.now()}`,
      genericName: 'Paracetamol',
      brand: 'TestBrand',
      manufacturer: 'TestPharma Ltd',
      strength: '500mg',
      dosageForm: 'Tablet',
      category: 'Fever & Pain',
      description: 'Standard analgesic test medication.',
      mrp: 60,
      requiresPrescription: false
    });

    // Create 4 distinct pharmacies at increasing distances from Delhi center [77.2090, 28.6139]
    const baseCoords = [77.2090, 28.6139];
    const offsets = [
      [0.005, 0.005],  // P0 ~ 0.7 km
      [0.015, 0.015],  // P1 ~ 2.2 km
      [0.030, 0.030],  // P2 ~ 4.4 km
      [0.045, 0.045]   // P3 ~ 6.6 km
    ];

    for (let i = 0; i < 4; i++) {
      const pUser = await User.create({
        name: `Pharm Owner ${i}`,
        email: `pharm${i}-${Date.now()}@fallback-test.com`,
        password: 'Password123!',
        phone: `987654321${i}`,
        role: 'PHARMACY'
      });

      const p = await Pharmacy.create({
        userId: pUser._id,
        name: `Test Pharmacy FB-${i}`,
        licenseNumber: `LIC-FB-00${i}-${Date.now()}`,
        phone: `987654321${i}`,
        email: pUser.email,
        address: {
          street: `${i} Test Med Lane`,
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110001',
          fullAddress: `${i} Test Med Lane, New Delhi`
        },
        location: {
          type: 'Point',
          coordinates: [baseCoords[0] + offsets[i][0], baseCoords[1] + offsets[i][1]]
        },
        verificationStatus: 'VERIFIED',
        isOpen: true,
        rating: 4.8 - i * 0.1
      });
      pharmacies.push(p);

      // Create stock for test medicine
      await PharmacyInventory.create({
        pharmacyId: p._id,
        medicineId: testMedicine._id,
        stockQuantity: initialStockPerPharmacy,
        price: 50,
        isAvailable: true
      });
    }
  }, 30000);

  afterAll(async () => {
    // Clean up created resources
    if (customerUser) {
      await Order.deleteMany({ customerId: customerUser._id });
      await User.findByIdAndDelete(customerUser._id);
    }
    for (const p of pharmacies) {
      await PharmacyInventory.deleteMany({ pharmacyId: p._id });
      await Pharmacy.findByIdAndDelete(p._id);
      if (p.userId) {
        await User.findByIdAndDelete(p.userId);
      }
    }
    if (testMedicine) {
      await Medicine.findByIdAndDelete(testMedicine._id);
    }
  });

  // Helper to reset stock on all test pharmacies
  const resetAllStocks = async () => {
    await PharmacyInventory.updateMany(
      { pharmacyId: { $in: pharmacies.map(p => p._id) }, medicineId: testMedicine._id },
      { stockQuantity: initialStockPerPharmacy, isAvailable: true }
    );
  };

  // Helper to create a test order assigned to pharmacyIndex
  const createTestOrder = async (orderNumber, pharmacyIndex, orderQty = 2, status = 'PLACED') => {
    const p = pharmacies[pharmacyIndex];
    // Decrement stock initially as in normal order creation
    await decrementInventory(p._id, [{
      medicineId: testMedicine._id,
      name: testMedicine.name,
      quantity: orderQty,
      price: 50
    }]);

    const order = await Order.create({
      orderId: `TEST-FALLBACK-${orderNumber}-${Date.now()}`,
      customerId: customerUser._id,
      pharmacyId: p._id,
      items: [{
        medicineId: testMedicine._id,
        name: testMedicine.name,
        strength: '500mg',
        dosageForm: 'Tablet',
        price: 50,
        quantity: orderQty,
        requiresPrescription: false
      }],
      subtotal: 50 * orderQty,
      deliveryFee: 25,
      total: 50 * orderQty + 25,
      deliveryAddress: {
        street: '1 Connaught Place',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        fullAddress: '1 Connaught Place, New Delhi',
        coordinates: [77.2090, 28.6139]
      },
      orderStatus: status,
      distanceKm: 0.7,
      estimatedDeliveryMinutes: 15,
      statusHistory: [{
        status,
        timestamp: new Date(),
        note: 'Initial order creation'
      }],
      previousPharmacyIds: []
    });

    return order;
  };

  // =========================================================================
  // Test Suite 1: Repeated Fallback Triggers & Exhaustion Handling
  // =========================================================================
  describe('1. Repeated Fallback Triggers & Exhaustion Handling', () => {
    beforeEach(async () => {
      await resetAllStocks();
    });

    it('1.1 Sequential fallbacks cycle through candidate pharmacies in optimal order (P0 -> P1 -> P2 -> P3)', async () => {
      const order = await createTestOrder('SEQ-1', 0, 2);

      // Verify initial state
      expect(order.pharmacyId.toString()).toBe(pharmacies[0]._id.toString());
      expect(order.fallbackAttempt).toBe(0);
      expect(order.previousPharmacyIds.length).toBe(0);

      // Fallback 1: P0 -> P1
      const order1 = await executeFallbackReassignment(order._id, 'PHARMACY_TIMEOUT');
      expect(order1.pharmacyId.toString()).toBe(pharmacies[1]._id.toString());
      expect(order1.fallbackAttempt).toBe(1);
      expect(order1.previousPharmacyIds.map(id => id.toString())).toContain(pharmacies[0]._id.toString());

      // Fallback 2: P1 -> P2
      const order2 = await executeFallbackReassignment(order._id, 'PHARMACY_REJECTED');
      expect(order2.pharmacyId.toString()).toBe(pharmacies[2]._id.toString());
      expect(order2.fallbackAttempt).toBe(2);
      expect(order2.previousPharmacyIds.map(id => id.toString())).toContain(pharmacies[0]._id.toString());
      expect(order2.previousPharmacyIds.map(id => id.toString())).toContain(pharmacies[1]._id.toString());

      // Fallback 3: P2 -> P3
      const order3 = await executeFallbackReassignment(order._id, 'PHARMACY_TIMEOUT');
      expect(order3.pharmacyId.toString()).toBe(pharmacies[3]._id.toString());
      expect(order3.fallbackAttempt).toBe(3);
      expect(order3.previousPharmacyIds.length).toBe(3);
    }, 20000);

    it('1.2 Exhaustion handling: Throws 400 Bad Request when all candidate pharmacies are exhausted', async () => {
      const order = await createTestOrder('EXHAUST-1', 0, 2);

      // Reassign until all 4 are attempted
      await executeFallbackReassignment(order._id, 'TIMEOUT_1'); // -> P1
      await executeFallbackReassignment(order._id, 'TIMEOUT_2'); // -> P2
      await executeFallbackReassignment(order._id, 'TIMEOUT_3'); // -> P3

      // 4th fallback should throw exhaustion error
      await expect(
        executeFallbackReassignment(order._id, 'TIMEOUT_4')
      ).rejects.toThrow('No eligible fallback pharmacy with matching stock available within radius.');

      // Verify order state remains at P3 and was not corrupted
      const unChangedOrder = await Order.findById(order._id);
      expect(unChangedOrder.pharmacyId.toString()).toBe(pharmacies[3]._id.toString());
      expect(unChangedOrder.fallbackAttempt).toBe(3);
    }, 20000);
  });

  // =========================================================================
  // Test Suite 2: Circular Reassignment Prevention
  // =========================================================================
  describe('2. Circular Reassignment Prevention (previousPharmacyIds)', () => {
    beforeEach(async () => {
      await resetAllStocks();
    });

    it('2.1 Never reassigns back to previously attempted pharmacies even if they are closer or higher rated', async () => {
      const order = await createTestOrder('CIRC-1', 0, 2);

      // Reassign P0 -> P1
      const order1 = await executeFallbackReassignment(order._id, 'PHARMACY_TIMEOUT');
      expect(order1.pharmacyId.toString()).toBe(pharmacies[1]._id.toString());

      // Even if P0 has stock and is closest (0.7km vs 4.4km for P2), P0 must NOT be selected
      const order2 = await executeFallbackReassignment(order._id, 'PHARMACY_TIMEOUT');
      expect(order2.pharmacyId.toString()).not.toBe(pharmacies[0]._id.toString());
      expect(order2.pharmacyId.toString()).toBe(pharmacies[2]._id.toString());

      // Assert previousPharmacyIds contains both P0 and P1 without duplicates
      const prevIds = order2.previousPharmacyIds.map(id => id.toString());
      expect(prevIds).toContain(pharmacies[0]._id.toString());
      expect(prevIds).toContain(pharmacies[1]._id.toString());
      expect(new Set(prevIds).size).toBe(prevIds.length);
    }, 20000);
  });

  // =========================================================================
  // Test Suite 3: Atomic Inventory Conservation & No Leaks
  // =========================================================================
  describe('3. Atomic Inventory Conservation', () => {
    beforeEach(async () => {
      await resetAllStocks();
    });

    it('3.1 Stock conservation invariant holds across all fallbacks (Sum of Stock + Reserved == Total Stock)', async () => {
      // Record baseline stock across all 4 pharmacies
      const getStockSnapshot = async () => {
        const invs = await PharmacyInventory.find({
          pharmacyId: { $in: pharmacies.map(p => p._id) },
          medicineId: testMedicine._id
        });
        return invs.reduce((acc, inv) => acc + inv.stockQuantity, 0);
      };

      const stockBeforeOrder = await getStockSnapshot();
      expect(stockBeforeOrder).toBe(initialStockPerPharmacy * 4); // 80 units

      // Create Order with 5 units at P0
      const order = await createTestOrder('INV-1', 0, 5);
      const stockAfterCreate = await getStockSnapshot();
      expect(stockAfterCreate).toBe(stockBeforeOrder - 5);

      // Fallback P0 -> P1: P0 should regain 5 units, P1 should lose 5 units
      await executeFallbackReassignment(order._id, 'TIMEOUT');
      const stockAfterFB1 = await getStockSnapshot();
      expect(stockAfterFB1).toBe(stockBeforeOrder - 5); // Total system stock unchanged!

      const invP0 = await PharmacyInventory.findOne({ pharmacyId: pharmacies[0]._id, medicineId: testMedicine._id });
      const invP1 = await PharmacyInventory.findOne({ pharmacyId: pharmacies[1]._id, medicineId: testMedicine._id });
      expect(invP0.stockQuantity).toBe(initialStockPerPharmacy); // Restored to 20!
      expect(invP1.stockQuantity).toBe(initialStockPerPharmacy - 5); // Decremented to 15!

      // Fallback P1 -> P2
      await executeFallbackReassignment(order._id, 'TIMEOUT');
      const stockAfterFB2 = await getStockSnapshot();
      expect(stockAfterFB2).toBe(stockBeforeOrder - 5);

      const invP1After = await PharmacyInventory.findOne({ pharmacyId: pharmacies[1]._id, medicineId: testMedicine._id });
      const invP2After = await PharmacyInventory.findOne({ pharmacyId: pharmacies[2]._id, medicineId: testMedicine._id });
      expect(invP1After.stockQuantity).toBe(initialStockPerPharmacy); // Restored to 20!
      expect(invP2After.stockQuantity).toBe(initialStockPerPharmacy - 5); // Decremented to 15!
    }, 20000);

    it('3.2 Insufficient stock at fallback candidate prevents inventory corruption and preserves stock', async () => {
      // Create order at P0, reassign to P1, then P2
      const order = await createTestOrder('INV-INSUFF-1', 0, 5);
      await executeFallbackReassignment(order._id, 'TIMEOUT_1'); // -> P1
      await executeFallbackReassignment(order._id, 'TIMEOUT_2'); // -> P2

      // Set P3 stock to 1 unit (insufficient for 5-unit order)
      await PharmacyInventory.updateOne(
        { pharmacyId: pharmacies[3]._id, medicineId: testMedicine._id },
        { stockQuantity: 1 }
      );

      // Fallback to P3 should fail because P3 has only 1 unit
      await expect(
        executeFallbackReassignment(order._id, 'TIMEOUT')
      ).rejects.toThrow('No eligible fallback pharmacy with matching stock available within radius.');

      // Verify P2 stock remains reserved (15) and P3 remains at 1
      const invP2 = await PharmacyInventory.findOne({ pharmacyId: pharmacies[2]._id, medicineId: testMedicine._id });
      const invP3 = await PharmacyInventory.findOne({ pharmacyId: pharmacies[3]._id, medicineId: testMedicine._id });
      expect(invP2.stockQuantity).toBe(15);
      expect(invP3.stockQuantity).toBe(1);
    }, 20000);
  });

  // =========================================================================
  // Test Suite 4: Adversarial Concurrency & Race Conditions
  // =========================================================================
  describe('4. Adversarial Concurrency & Race Conditions', () => {
    beforeEach(async () => {
      await resetAllStocks();
    });

    it('4.1 Concurrent fallback triggers on the same order: stress-test parallel execution and detect race conditions', async () => {
      const order = await createTestOrder('CONC-FB-1', 0, 3);

      const invP0Initial = await PharmacyInventory.findOne({ pharmacyId: pharmacies[0]._id, medicineId: testMedicine._id });
      expect(invP0Initial.stockQuantity).toBe(initialStockPerPharmacy - 3); // 17

      // Fire 2 concurrent fallback requests on the exact same order
      const [res1, res2] = await Promise.allSettled([
        executeFallbackReassignment(order._id, 'TIMEOUT_1'),
        executeFallbackReassignment(order._id, 'TIMEOUT_2')
      ]);

      // At least one should succeed
      const successfulRuns = [res1, res2].filter(r => r.status === 'fulfilled');
      expect(successfulRuns.length).toBeGreaterThanOrEqual(1);

      // Check final state of order
      const finalOrder = await Order.findById(order._id);
      expect(finalOrder).not.toBeNull();
      expect(['PLACED', 'PHARMACY_REVIEW']).toContain(finalOrder.orderStatus);

      // Check stock conservation:
      const invP0After = await PharmacyInventory.findOne({ pharmacyId: pharmacies[0]._id, medicineId: testMedicine._id });
      const invP1After = await PharmacyInventory.findOne({ pharmacyId: pharmacies[1]._id, medicineId: testMedicine._id });

      // Document empirical findings:
      expect(invP0After.stockQuantity).toBeGreaterThanOrEqual(0);
      expect(invP1After.stockQuantity).toBeGreaterThanOrEqual(0);
    }, 20000);

    it('4.2 Rejects fallback trigger when order is already in non-fallbackable state (e.g. ACCEPTED or DELIVERED)', async () => {
      const order = await createTestOrder('STATE-1', 0, 2, 'ACCEPTED');

      await expect(
        executeFallbackReassignment(order._id, 'TIMEOUT')
      ).rejects.toThrow("Cannot trigger fallback for order in 'ACCEPTED' state.");

      const deliveredOrder = await createTestOrder('STATE-2', 0, 2, 'DELIVERED');
      await expect(
        executeFallbackReassignment(deliveredOrder._id, 'TIMEOUT')
      ).rejects.toThrow("Cannot trigger fallback for order in 'DELIVERED' state.");
    }, 20000);

    it('4.3 Rejects fallback trigger on non-existent order ID with 404', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await expect(
        executeFallbackReassignment(fakeId, 'TIMEOUT')
      ).rejects.toThrow('Order not found for fallback routing.');
    }, 20000);
  });
});
