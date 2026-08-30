/**
 * Pharmacy Rejection → Automatic Fallback Routing Test Suite
 * File: server/tests/rejectionFallback.test.js
 *
 * Tests the critical fix: when a pharmacy rejects an order,
 * executeFallbackReassignment is triggered instead of finalizing as REJECTED.
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

describe('Pharmacy Rejection → Automatic Fallback Routing', () => {
  let customerUser;
  let testMedicine;
  let pharmacies = [];
  let pharmacyUsers = [];
  const initialStock = 100;

  beforeAll(async () => {
    await connectDB();

    // Clean test artifacts
    await Order.deleteMany({ orderId: { $regex: /^TEST-REJECT-/ } });
    await Pharmacy.deleteMany({ name: { $regex: /^Rejection Test Pharmacy / } });
    await Medicine.deleteMany({ name: { $regex: /^Rejection Test Med/ } });
    await User.deleteMany({ email: { $regex: /@rejection-test\.com$/ } });

    // Create customer
    customerUser = await User.create({
      name: 'Rejection Test Customer',
      email: `customer-${Date.now()}@rejection-test.com`,
      password: 'Password123!',
      phone: '9876543210',
      role: 'CUSTOMER'
    });

    // Create test medicine
    testMedicine = await Medicine.create({
      name: `Rejection Test Med ${Date.now()}`,
      genericName: 'Paracetamol',
      brand: 'TestBrand',
      manufacturer: 'TestPharma Ltd',
      strength: '500mg',
      dosageForm: 'Tablet',
      category: 'Fever & Pain',
      description: 'Test medication for rejection fallback.',
      usageInstructions: 'Test only.',
      storage: 'Room temperature.',
      sideEffects: 'N/A',
      disclaimer: 'Test product.',
      image: '/test.png',
      mrp: 50,
      requiresPrescription: false,
      prescriptionSchedule: 'OTC',
      active: true
    });

    // Create 4 pharmacies near Connaught Place with stock
    const locations = [
      { name: 'Rejection Test Pharmacy A', coords: [77.2195, 28.6328] },
      { name: 'Rejection Test Pharmacy B', coords: [77.2250, 28.6350] },
      { name: 'Rejection Test Pharmacy C', coords: [77.2180, 28.6310] },
      { name: 'Rejection Test Pharmacy D', coords: [77.2300, 28.6380] }
    ];

    for (const loc of locations) {
      const pharmacyUser = await User.create({
        name: loc.name,
        email: `${loc.name.toLowerCase().replace(/ /g, '-')}-${Date.now()}@rejection-test.com`,
        password: 'Password123!',
        phone: '9876500000',
        role: 'PHARMACY'
      });
      pharmacyUsers.push(pharmacyUser);

      const pharmacy = await Pharmacy.create({
        userId: pharmacyUser._id,
        name: loc.name,
        phone: '011-2300000',
        email: `${loc.name.toLowerCase().replace(/ /g, '-')}-${Date.now()}@rejection-test.com`,
        licenseNumber: `DL-PH-REJ-${Date.now()}-${pharmacies.length}`,
        gstin: `07AABCP${Date.now().toString().slice(-4)}A1Z5`,
        address: {
          street: '1 Test Street',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110001',
          fullAddress: `${loc.name}, Connaught Place, New Delhi`
        },
        location: { type: 'Point', coordinates: loc.coords },
        operatingHours: { open: '08:00', close: '22:00' },
        verificationStatus: 'VERIFIED',
        isOpen: true,
        rating: 4.5
      });
      pharmacies.push(pharmacy);

      await PharmacyInventory.create({
        pharmacyId: pharmacy._id,
        medicineId: testMedicine._id,
        batchNumber: `BATCH-REJ-${Date.now()}-${pharmacies.length}`,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        stockQuantity: initialStock,
        price: 50,
        isAvailable: true
      });
    }
  });

  afterAll(async () => {
    await Order.deleteMany({ orderId: { $regex: /^TEST-REJECT-/ } });
    await Pharmacy.deleteMany({ name: { $regex: /^Rejection Test Pharmacy / } });
    await PharmacyInventory.deleteMany({ pharmacyId: { $in: pharmacies.map(p => p._id) } });
    await Medicine.deleteMany({ _id: testMedicine._id });
    await User.deleteMany({ email: { $regex: /@rejection-test\.com$/ } });
    await mongoose.connection.close();
  });

  // Helper: create a test order assigned to a specific pharmacy
  const createTestOrder = async (pharmacy, orderSuffix = '') => {
    const orderId = `TEST-REJECT-${Date.now()}${orderSuffix}`;
    await decrementInventory(pharmacy._id, [{
      medicineId: testMedicine._id,
      name: testMedicine.name,
      quantity: 1,
      price: 50
    }]);

    return Order.create({
      orderId,
      customerId: customerUser._id,
      pharmacyId: pharmacy._id,
      items: [{
        medicineId: testMedicine._id,
        name: testMedicine.name,
        strength: '500mg',
        dosageForm: 'Tablet',
        price: 50,
        quantity: 1,
        requiresPrescription: false
      }],
      subtotal: 50,
      deliveryFee: 25,
      total: 75,
      deliveryAddress: {
        street: '1 Connaught Place',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        fullAddress: '1 Connaught Place, New Delhi 110001',
        coordinates: [77.2090, 28.6139]
      },
      orderStatus: 'PHARMACY_REVIEW',
      statusHistory: [{ status: 'PLACED', note: 'Order placed' }, { status: 'PHARMACY_REVIEW', note: 'Sent to pharmacy' }]
    });
  };

  // ──────────────────────────────────────────────────────
  // TEST 1: Pharmacy rejects → order does NOT become final REJECTED → fallback triggers
  // ──────────────────────────────────────────────────────
  test('T1: Pharmacy rejection triggers fallback, order does not become REJECTED', async () => {
    const order = await createTestOrder(pharmacies[0], '-T1');

    // Simulate rejection by triggering fallback (as the controller now does)
    order.rejectionReason = 'Stock unavailable';
    order.statusHistory.push({
      status: 'PHARMACY_REJECTED',
      timestamp: new Date(),
      note: `${pharmacies[0].name} rejected this order: Stock unavailable`
    });
    await order.save();

    const updatedOrder = await executeFallbackReassignment(order._id, 'PHARMACY_REJECTED');

    expect(updatedOrder).toBeDefined();
    expect(updatedOrder.orderStatus).not.toBe('REJECTED');
    expect(['PLACED', 'PHARMACY_REVIEW']).toContain(updatedOrder.orderStatus);
    expect(updatedOrder.fallbackTriggered).toBe(true);
  });

  // ──────────────────────────────────────────────────────
  // TEST 2: Fallback selects next eligible pharmacy
  // ──────────────────────────────────────────────────────
  test('T2: Fallback selects a different pharmacy than the rejected one', async () => {
    const order = await createTestOrder(pharmacies[0], '-T2');
    const updatedOrder = await executeFallbackReassignment(order._id, 'PHARMACY_REJECTED');

    const newPharmacyId = (updatedOrder.pharmacyId?._id || updatedOrder.pharmacyId).toString();
    expect(newPharmacyId).not.toBe(pharmacies[0]._id.toString());
  });

  // ──────────────────────────────────────────────────────
  // TEST 3: Rejected pharmacy is excluded from next routing attempt
  // ──────────────────────────────────────────────────────
  test('T3: Rejected pharmacy is recorded in previousPharmacyIds', async () => {
    const order = await createTestOrder(pharmacies[0], '-T3');
    const updatedOrder = await executeFallbackReassignment(order._id, 'PHARMACY_REJECTED');

    const previousIds = (updatedOrder.previousPharmacyIds || []).map(id => (id?._id || id).toString());
    expect(previousIds).toContain(pharmacies[0]._id.toString());
  });

  // ──────────────────────────────────────────────────────
  // TEST 4: Second pharmacy rejects → fallback triggers again
  // ──────────────────────────────────────────────────────
  test('T4: Multiple consecutive rejections trigger multiple fallbacks', async () => {
    const order = await createTestOrder(pharmacies[0], '-T4');

    // First fallback
    const after1 = await executeFallbackReassignment(order._id, 'PHARMACY_REJECTED');
    expect(after1.fallbackAttempt).toBe(1);

    // Second fallback
    const after2 = await executeFallbackReassignment(after1._id, 'PHARMACY_REJECTED');
    expect(after2.fallbackAttempt).toBe(2);

    const previousIds = (after2.previousPharmacyIds || []).map(id => (id?._id || id).toString());
    expect(previousIds.length).toBeGreaterThanOrEqual(2);
  });

  // ──────────────────────────────────────────────────────
  // TEST 5: Order eventually assigned to pharmacy that can fulfil
  // ──────────────────────────────────────────────────────
  test('T5: After fallback, order is assigned to an eligible pharmacy', async () => {
    const order = await createTestOrder(pharmacies[0], '-T5');
    const updatedOrder = await executeFallbackReassignment(order._id, 'PHARMACY_REJECTED');

    const newPharmacy = await Pharmacy.findById(updatedOrder.pharmacyId);
    expect(newPharmacy).toBeDefined();
    expect(newPharmacy.verificationStatus).toBe('VERIFIED');
    expect(newPharmacy.isOpen).toBe(true);
  });

  // ──────────────────────────────────────────────────────
  // TEST 7: Old pharmacy stock is restored exactly once
  // ──────────────────────────────────────────────────────
  test('T7: Old pharmacy inventory is restored after fallback', async () => {
    const beforeInv = await PharmacyInventory.findOne({
      pharmacyId: pharmacies[0]._id,
      medicineId: testMedicine._id
    });
    const stockBefore = beforeInv?.stockQuantity || 0;

    const order = await createTestOrder(pharmacies[0], '-T7');

    // Stock should be decremented by 1 from createTestOrder
    const afterDecrement = await PharmacyInventory.findOne({
      pharmacyId: pharmacies[0]._id,
      medicineId: testMedicine._id
    });
    expect(afterDecrement.stockQuantity).toBe(stockBefore - 1);

    // Run fallback — should restore old pharmacy stock
    await executeFallbackReassignment(order._id, 'PHARMACY_REJECTED');

    const afterFallback = await PharmacyInventory.findOne({
      pharmacyId: pharmacies[0]._id,
      medicineId: testMedicine._id
    });
    expect(afterFallback.stockQuantity).toBe(stockBefore);
  });

  // ──────────────────────────────────────────────────────
  // TEST 8: New pharmacy stock is reserved exactly once
  // ──────────────────────────────────────────────────────
  test('T8: New pharmacy inventory is decremented after fallback', async () => {
    const order = await createTestOrder(pharmacies[0], '-T8');
    const updatedOrder = await executeFallbackReassignment(order._id, 'PHARMACY_REJECTED');

    const newPharmacyId = (updatedOrder.pharmacyId?._id || updatedOrder.pharmacyId).toString();
    const newInv = await PharmacyInventory.findOne({
      pharmacyId: newPharmacyId,
      medicineId: testMedicine._id
    });
    expect(newInv).toBeDefined();
    // Stock should have been decremented (exact value depends on prior tests, just check it's less than initial)
    expect(newInv.stockQuantity).toBeLessThan(initialStock);
  });

  // ──────────────────────────────────────────────────────
  // TEST 13: Order ID unchanged across fallback
  // ──────────────────────────────────────────────────────
  test('T13: Order ID and _id remain unchanged after fallback', async () => {
    const order = await createTestOrder(pharmacies[0], '-T13');
    const originalId = order._id.toString();
    const originalOrderId = order.orderId;

    const updatedOrder = await executeFallbackReassignment(order._id, 'PHARMACY_REJECTED');

    expect(updatedOrder._id.toString()).toBe(originalId);
    expect(updatedOrder.orderId).toBe(originalOrderId);
  });

  // ──────────────────────────────────────────────────────
  // TEST 14: Prescription order still requires pharmacist verification
  // ──────────────────────────────────────────────────────
  test('T14: Prescription status preserved across fallback', async () => {
    const order = await createTestOrder(pharmacies[0], '-T14');
    order.prescriptionStatus = 'PENDING_REVIEW';
    await order.save();

    const updatedOrder = await executeFallbackReassignment(order._id, 'PHARMACY_REJECTED');

    expect(updatedOrder.prescriptionStatus).toBe('PENDING_REVIEW');
  });

  // ──────────────────────────────────────────────────────
  // TEST 15: Simultaneous rejection + timeout doesn't double-assign
  // ──────────────────────────────────────────────────────
  test('T15: Concurrent fallback attempts are blocked by fallbackLock', async () => {
    const order = await createTestOrder(pharmacies[0], '-T15');

    // Launch two concurrent fallback attempts
    const results = await Promise.allSettled([
      executeFallbackReassignment(order._id, 'PHARMACY_REJECTED'),
      executeFallbackReassignment(order._id, 'PHARMACY_CONFIRMATION_TIMEOUT')
    ]);

    const successes = results.filter(r => r.status === 'fulfilled');
    const failures = results.filter(r => r.status === 'rejected');

    // Exactly one should succeed, one should fail
    expect(successes.length).toBe(1);
    expect(failures.length).toBe(1);
  });

  // ──────────────────────────────────────────────────────
  // TEST 16: Previously attempted pharmacies are excluded
  // ──────────────────────────────────────────────────────
  test('T16: Previously attempted pharmacies are never re-selected', async () => {
    const order = await createTestOrder(pharmacies[0], '-T16');

    const after1 = await executeFallbackReassignment(order._id, 'PHARMACY_REJECTED');
    const pharmacy1 = (after1.pharmacyId?._id || after1.pharmacyId).toString();

    const after2 = await executeFallbackReassignment(after1._id, 'PHARMACY_REJECTED');
    const pharmacy2 = (after2.pharmacyId?._id || after2.pharmacyId).toString();

    // All three (original + two fallbacks) should be different
    const allIds = [pharmacies[0]._id.toString(), pharmacy1, pharmacy2];
    const uniqueIds = [...new Set(allIds)];
    expect(uniqueIds.length).toBe(3);
  });

  // ──────────────────────────────────────────────────────
  // TEST 12: Audit trail / status history records rejection and reassignment
  // ──────────────────────────────────────────────────────
  test('T12: Status history records both rejection event and fallback reassignment', async () => {
    const order = await createTestOrder(pharmacies[0], '-T12');

    // Simulate recording rejection event (as controller does before calling fallback)
    order.statusHistory.push({
      status: 'PHARMACY_REJECTED',
      timestamp: new Date(),
      note: `${pharmacies[0].name} rejected this order: Out of stock`
    });
    await order.save();

    const updatedOrder = await executeFallbackReassignment(order._id, 'PHARMACY_REJECTED');

    const historyStatuses = updatedOrder.statusHistory.map(h => h.status);
    expect(historyStatuses).toContain('PHARMACY_REJECTED');
    // Fallback engine also adds a status history entry
    const fallbackEntry = updatedOrder.statusHistory.find(h =>
      h.note && h.note.includes('Fallback Triggered')
    );
    expect(fallbackEntry).toBeDefined();
  });

  // ──────────────────────────────────────────────────────
  // TEST: State machine allows FULFILMENT_UNAVAILABLE from PLACED/PHARMACY_REVIEW
  // ──────────────────────────────────────────────────────
  test('State machine allows FULFILMENT_UNAVAILABLE from PLACED and PHARMACY_REVIEW', () => {
    expect(() => validateStatusTransition('PLACED', 'FULFILMENT_UNAVAILABLE')).not.toThrow();
    expect(() => validateStatusTransition('PHARMACY_REVIEW', 'FULFILMENT_UNAVAILABLE')).not.toThrow();
  });

  test('FULFILMENT_UNAVAILABLE is a terminal state', () => {
    expect(() => validateStatusTransition('FULFILMENT_UNAVAILABLE', 'PLACED')).toThrow();
    expect(() => validateStatusTransition('FULFILMENT_UNAVAILABLE', 'ACCEPTED')).toThrow();
  });

  // ──────────────────────────────────────────────────────
  // TEST: Customer cancellation still works separately
  // ──────────────────────────────────────────────────────
  test('Customer cancellation (CANCELLED) still works from PLACED', () => {
    expect(() => validateStatusTransition('PLACED', 'CANCELLED')).not.toThrow();
    expect(() => validateStatusTransition('PHARMACY_REVIEW', 'CANCELLED')).not.toThrow();
  });

  // ──────────────────────────────────────────────────────
  // TEST: Timeout fallback still works
  // ──────────────────────────────────────────────────────
  test('Timeout fallback still works alongside rejection fallback', async () => {
    const order = await createTestOrder(pharmacies[0], '-TIMEOUT');
    const updatedOrder = await executeFallbackReassignment(order._id, 'PHARMACY_CONFIRMATION_TIMEOUT');

    expect(updatedOrder).toBeDefined();
    expect(updatedOrder.fallbackTriggered).toBe(true);
    expect(updatedOrder.fallbackReason).toBe('PHARMACY_CONFIRMATION_TIMEOUT');
  });
});
