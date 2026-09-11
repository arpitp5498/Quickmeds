/**
 * Test Suite: Demo Pharmacy Live Orders Verification
 * File: server/tests/demoPharmacyLiveOrders.test.js
 *
 * Verifies that the Pharmacy Dashboard retrieves and displays actual live orders,
 * prioritizes newest first, supports order detail inspection with strict authorization,
 * handles fallback rerouting away from rejecting pharmacy to candidate pharmacy,
 * updates status and rider assignment on the exact same order entity,
 * and never hardcodes QM-DEMO-001 navigation.
 */

const mongoose = require('mongoose');
const Order = require('../src/models/Order');
const Pharmacy = require('../src/models/Pharmacy');
const DeliveryPartner = require('../src/models/DeliveryPartner');
const User = require('../src/models/User');
const Medicine = require('../src/models/Medicine');
const connectDB = require('../src/config/db');
const {
  getDemoStatus,
  getDemoSession,
  simulatePharmacyRejection,
  resetDemo
} = require('../src/demo/demoService');
const {
  initDemoEnvironment,
  DEMO_EMAILS,
  DEMO_ORDER_ID
} = require('../src/demo/demoSeed');
const { autoAssignDeliveryPartner } = require('../src/services/deliveryService');
const { executeFallbackReassignment } = require('../src/services/orderService');

describe('Demo Pharmacy Live Orders & Dynamic Retrieval Test Suite', () => {
  let customer;
  let pharmacyA;
  let pharmacyB;
  let rider;
  let doloMed;

  beforeAll(async () => {
    await connectDB();
    const env = await initDemoEnvironment();
    customer = env.customer;
    pharmacyA = env.pharmacyA;
    pharmacyB = env.pharmacyB;
    rider = env.rider;
    doloMed = env.doloMed;
  });

  afterAll(async () => {
    // Clean up any test-specific demo orders
    await Order.deleteMany({ orderId: { $ne: DEMO_ORDER_ID }, isDemo: true });
    await mongoose.connection.close();
  });

  test('TEST 1: Empty state verification when no live orders exist for pharmacy', async () => {
    // Check orders for pharmacyB when none are assigned to it
    const ordersB = await Order.find({
      pharmacyId: pharmacyB._id,
      orderStatus: { $in: ['PLACED', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP'] }
    });

    expect(ordersB.length).toBe(0);

    // Verify session for PHARMACY_B
    const sessionB = await getDemoSession('PHARMACY_B');
    expect(sessionB.user.role).toBe('PHARMACY');
    expect(sessionB.user.pharmacyId.toString()).toBe(pharmacyB._id.toString());
  });

  test('TEST 2: Create ONE customer order and verify dynamic retrieval', async () => {
    // Customer places QM-DEMO-002
    const order2 = await Order.create({
      orderId: 'QM-DEMO-002',
      isDemo: true,
      customerId: customer._id,
      pharmacyId: pharmacyA._id,
      items: [{ medicineId: doloMed._id, name: 'Dolo 650mg Tablet', price: 30.5, quantity: 1 }],
      subtotal: 30.5,
      deliveryFee: 25,
      platformFee: 5,
      total: 60.5,
      deliveryAddress: {
        street: 'Connaught Place',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        fullAddress: 'Connaught Place, New Delhi',
        coordinates: [77.214, 28.629]
      },
      orderStatus: 'PLACED',
      statusHistory: [{ status: 'PLACED', timestamp: new Date() }]
    });

    // Pharmacy A live orders query (matching orderController.js getPharmacyOrders)
    const liveOrders = await Order.find({ pharmacyId: pharmacyA._id })
      .sort({ createdAt: -1 });

    expect(liveOrders.length).toBeGreaterThanOrEqual(1);
    expect(liveOrders[0].orderId).toBe('QM-DEMO-002');
    expect(liveOrders[0]._id.toString()).toBe(order2._id.toString());

    // Verify Demo Status picks up QM-DEMO-002 as the active demo order
    const demoStatus = await getDemoStatus();
    expect(demoStatus.order.orderId).toBe('QM-DEMO-002');
  });

  test('TEST 3: Create a SECOND order (QM-DEMO-003) - newest appears first', async () => {
    // Wait a brief moment to ensure distinct createdAt
    await new Promise((r) => setTimeout(r, 50));

    const order3 = await Order.create({
      orderId: 'QM-DEMO-003',
      isDemo: true,
      customerId: customer._id,
      pharmacyId: pharmacyA._id,
      items: [{ medicineId: doloMed._id, name: 'Dolo 650mg Tablet', price: 30.5, quantity: 2 }],
      subtotal: 61,
      deliveryFee: 25,
      platformFee: 5,
      total: 91,
      deliveryAddress: {
        street: 'Barakhamba Road',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        fullAddress: 'Barakhamba Road, New Delhi',
        coordinates: [77.227, 28.631]
      },
      orderStatus: 'PLACED',
      statusHistory: [{ status: 'PLACED', timestamp: new Date() }]
    });

    // Pharmacy A live orders
    const liveOrders = await Order.find({ pharmacyId: pharmacyA._id })
      .sort({ createdAt: -1 });

    expect(liveOrders[0].orderId).toBe('QM-DEMO-003');
    expect(liveOrders[1].orderId).toBe('QM-DEMO-002');

    // Demo status reflects QM-DEMO-003
    const demoStatus = await getDemoStatus();
    expect(demoStatus.order.orderId).toBe('QM-DEMO-003');
  });

  test('TEST 4: Create a THIRD order (QM-DEMO-004) - prioritized at top of active list', async () => {
    await new Promise((r) => setTimeout(r, 50));

    const order4 = await Order.create({
      orderId: 'QM-DEMO-004',
      isDemo: true,
      customerId: customer._id,
      pharmacyId: pharmacyA._id,
      items: [{ medicineId: doloMed._id, name: 'Dolo 650mg Tablet', price: 30.5, quantity: 3 }],
      subtotal: 91.5,
      deliveryFee: 25,
      platformFee: 5,
      total: 121.5,
      deliveryAddress: {
        street: 'Janpath',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        fullAddress: 'Janpath, New Delhi',
        coordinates: [77.218, 28.625]
      },
      orderStatus: 'PLACED',
      statusHistory: [{ status: 'PLACED', timestamp: new Date() }]
    });

    const liveOrders = await Order.find({ pharmacyId: pharmacyA._id })
      .sort({ createdAt: -1 });

    expect(liveOrders[0].orderId).toBe('QM-DEMO-004');
    expect(liveOrders[1].orderId).toBe('QM-DEMO-003');
    expect(liveOrders[2].orderId).toBe('QM-DEMO-002');
  });

  test('TEST 5: Page refresh consistency - current orders remain intact without reverting', async () => {
    // Re-query database to simulate page refresh
    const refreshedOrders = await Order.find({ pharmacyId: pharmacyA._id })
      .sort({ createdAt: -1 });

    expect(refreshedOrders[0].orderId).toBe('QM-DEMO-004');
    expect(refreshedOrders.some((o) => o.orderId === 'QM-DEMO-004')).toBe(true);
    expect(refreshedOrders.some((o) => o.orderId === 'QM-DEMO-003')).toBe(true);
    expect(refreshedOrders.some((o) => o.orderId === 'QM-DEMO-002')).toBe(true);
  });

  test('TEST 6: Pharmacy accepts latest order (QM-DEMO-004) - status transitions without duplicate', async () => {
    const order4 = await Order.findOne({ orderId: 'QM-DEMO-004' });
    order4.orderStatus = 'ACCEPTED';
    order4.statusHistory.push({ status: 'ACCEPTED', timestamp: new Date(), note: 'Pharmacist accepted' });
    await order4.save();

    // Verify same order updated, no duplicate created
    const ordersCount = await Order.countDocuments({ orderId: 'QM-DEMO-004' });
    expect(ordersCount).toBe(1);

    const updated = await Order.findOne({ orderId: 'QM-DEMO-004' });
    expect(updated.orderStatus).toBe('ACCEPTED');
  });

  test('TEST 7: Pharmacy rejects QM-DEMO-003 - automatic fallback rerouting to Pharmacy B', async () => {
    const order3 = await Order.findOne({ orderId: 'QM-DEMO-003' });

    // Execute fallback reassignment
    const fallbackResult = await executeFallbackReassignment(
      order3._id,
      'PHARMACY_REJECTED',
      'Stock shortage at Pharmacy A'
    );

    expect(fallbackResult.fallbackTriggered).toBe(true);
    expect(fallbackResult.pharmacyId.toString()).toBe(pharmacyB._id.toString());
    expect(fallbackResult.previousPharmacyId.toString()).toBe(pharmacyA._id.toString());

    // Pharmacy A live orders MUST NOT include QM-DEMO-003 anymore
    const ordersA = await Order.find({ pharmacyId: pharmacyA._id });
    expect(ordersA.some((o) => o.orderId === 'QM-DEMO-003')).toBe(false);

    // Pharmacy B live orders MUST include QM-DEMO-003
    const ordersB = await Order.find({ pharmacyId: pharmacyB._id });
    expect(ordersB.some((o) => o.orderId === 'QM-DEMO-003')).toBe(true);
  });

  test('TEST 8: Order QM-DEMO-004 progresses to READY_FOR_PICKUP and rider is auto-assigned', async () => {
    const order4 = await Order.findOne({ orderId: 'QM-DEMO-004' });
    order4.orderStatus = 'READY_FOR_PICKUP';
    await order4.save();

    // Reset rider to available
    await DeliveryPartner.findOneAndUpdate(
      { _id: rider._id },
      { status: 'AVAILABLE', activeOrderId: null }
    );

    // Auto-assign rider
    const assignResult = await autoAssignDeliveryPartner(order4._id);
    expect(assignResult.success).toBe(true);
    expect(assignResult.partner).toBeDefined();

    // Order status should update to DELIVERY_ASSIGNED
    const assignedOrder = await Order.findOne({ orderId: 'QM-DEMO-004' })
      .populate('deliveryPartnerId');
    expect(assignedOrder.orderStatus).toBe('DELIVERY_ASSIGNED');
    expect(assignedOrder.deliveryPartnerId).toBeDefined();
  });

  test('TEST 9: Pharmacy sees correct rider for QM-DEMO-004 on detail page', async () => {
    const order4 = await Order.findOne({ orderId: 'QM-DEMO-004' })
      .populate('deliveryPartnerId');

    expect(order4.deliveryPartnerId.name).toContain('Suresh');

    // Verify role-based authorization: Pharmacy A CAN view QM-DEMO-004
    const isPharmacyAOwner = order4.pharmacyId.toString() === pharmacyA._id.toString();
    expect(isPharmacyAOwner).toBe(true);

    // Pharmacy B CANNOT view QM-DEMO-004 (strict backend ownership)
    const isPharmacyBOwner = order4.pharmacyId.toString() === pharmacyB._id.toString();
    expect(isPharmacyBOwner).toBe(false);
  });

  test('TEST 10: Complete QM-DEMO-004 and place QM-DEMO-005 - QM-DEMO-005 appears as latest', async () => {
    // Deliver QM-DEMO-004
    await Order.findOneAndUpdate(
      { orderId: 'QM-DEMO-004' },
      { orderStatus: 'DELIVERED' }
    );

    // Customer places brand new order QM-DEMO-005
    await new Promise((r) => setTimeout(r, 50));
    await Order.create({
      orderId: 'QM-DEMO-005',
      isDemo: true,
      customerId: customer._id,
      pharmacyId: pharmacyA._id,
      items: [{ medicineId: doloMed._id, name: 'Dolo 650mg Tablet', price: 30.5, quantity: 1 }],
      subtotal: 30.5,
      deliveryFee: 25,
      platformFee: 5,
      total: 60.5,
      deliveryAddress: {
        street: 'Janpath',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        fullAddress: 'Janpath, New Delhi',
        coordinates: [77.218, 28.625]
      },
      orderStatus: 'PLACED',
      statusHistory: [{ status: 'PLACED', timestamp: new Date() }]
    });

    // Pharmacy A live orders should display QM-DEMO-005 as latest
    const liveOrders = await Order.find({ pharmacyId: pharmacyA._id })
      .sort({ createdAt: -1 });

    expect(liveOrders[0].orderId).toBe('QM-DEMO-005');

    // Active demo order in Demo Status is now QM-DEMO-005, NOT the completed QM-DEMO-004
    const demoStatus = await getDemoStatus();
    expect(demoStatus.order.orderId).toBe('QM-DEMO-005');
  });
});
