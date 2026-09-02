const mongoose = require('mongoose');
const Order = require('../src/models/Order');
const Pharmacy = require('../src/models/Pharmacy');
const DeliveryPartner = require('../src/models/DeliveryPartner');
const User = require('../src/models/User');
const Medicine = require('../src/models/Medicine');
const PharmacyInventory = require('../src/models/PharmacyInventory');
const {
  validateStatusTransition,
  decrementInventory,
  restoreInventory,
  executeFallbackReassignment
} = require('../src/services/orderService');
const { autoAssignDeliveryPartner } = require('../src/services/deliveryService');
const connectDB = require('../src/config/db');

jest.setTimeout(30000);

describe('Three-Sided Delivery Tracking & State Machine Tests', () => {
  let customerUser;
  let pharmacyUser;
  let pharmacy;
  let riderUser;
  let rider;
  let medicine;

  beforeAll(async () => {
    await connectDB();

    const timestamp = Date.now();

    // 1. Create test customer
    customerUser = await User.create({
      name: `Test Customer ${timestamp}`,
      email: `test_customer_${timestamp}@quickmeds.com`,
      password: 'password123',
      phone: `98765${String(timestamp).slice(-5)}`,
      role: 'CUSTOMER'
    });

    // 2. Create test pharmacy user & pharmacy
    pharmacyUser = await User.create({
      name: `Test Pharmacist ${timestamp}`,
      email: `test_pharmacist_${timestamp}@quickmeds.com`,
      password: 'password123',
      phone: `98764${String(timestamp).slice(-5)}`,
      role: 'PHARMACY'
    });

    pharmacy = await Pharmacy.create({
      userId: pharmacyUser._id,
      name: `Apollo 24x7 Test Chemist ${timestamp}`,
      licenseNumber: `DL-PH-TEST-${timestamp}`,
      phone: pharmacyUser.phone,
      email: pharmacyUser.email,
      address: {
        street: 'Connaught Place',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        fullAddress: 'Connaught Place, New Delhi, Delhi 110001'
      },
      location: {
        type: 'Point',
        coordinates: [77.2195, 28.6328]
      },
      verificationStatus: 'VERIFIED',
      isActive: true,
      operatingHours: { open: '00:00', close: '23:59', is24x7: true }
    });

    // 3. Create test rider user & delivery partner
    riderUser = await User.create({
      name: `Test Rider ${timestamp}`,
      email: `test_rider_${timestamp}@quickmeds.com`,
      password: 'password123',
      phone: `98763${String(timestamp).slice(-5)}`,
      role: 'DELIVERY_PARTNER'
    });

    rider = await DeliveryPartner.create({
      userId: riderUser._id,
      vehicleType: 'Bike',
      vehicleNumber: `DL 01 QM ${String(timestamp).slice(-4)}`,
      drivingLicenseNumber: `DL-DL-${timestamp}`,
      status: 'AVAILABLE',
      currentLocation: {
        type: 'Point',
        coordinates: [77.218, 28.632]
      }
    });

    // 4. Create test medicine & inventory
    medicine = await Medicine.findOne({ name: 'Dolo 650mg Tablet' });
    if (!medicine) {
      medicine = await Medicine.create({
        name: 'Dolo 650mg Tablet',
        genericName: 'Paracetamol 650mg',
        brand: 'Micro Labs',
        manufacturer: 'Micro Labs Ltd',
        strength: '650mg',
        dosageForm: 'Tablet',
        category: 'Pain Relief',
        description: 'Fast pain relief and fever reducing paracetamol',
        price: 30.5,
        mrp: 35.0,
        requiresPrescription: false,
        active: true
      });
    }

    await PharmacyInventory.create({
      pharmacyId: pharmacy._id,
      medicineId: medicine._id,
      stockQuantity: 100,
      price: 30.5,
      mrp: 35.0,
      isAvailable: true
    });
  });

  afterAll(async () => {
    // Cleanup test records
    if (customerUser) await User.deleteMany({ _id: { $in: [customerUser._id, pharmacyUser._id, riderUser._id] } });
    if (pharmacy) await Pharmacy.deleteOne({ _id: pharmacy._id });
    if (rider) await DeliveryPartner.deleteOne({ _id: rider._id });
    await Order.deleteMany({ customerId: customerUser?._id });
    await mongoose.connection.close();
  });

  describe('1. State Machine Guard Validations', () => {
    test('allows valid 10-state linear progression', () => {
      expect(validateStatusTransition('PLACED', 'ACCEPTED')).toBe(true);
      expect(validateStatusTransition('ACCEPTED', 'PREPARING')).toBe(true);
      expect(validateStatusTransition('PREPARING', 'READY_FOR_PICKUP')).toBe(true);
      expect(validateStatusTransition('READY_FOR_PICKUP', 'DELIVERY_ASSIGNED')).toBe(true);
      expect(validateStatusTransition('DELIVERY_ASSIGNED', 'ARRIVED_AT_PHARMACY')).toBe(true);
      expect(validateStatusTransition('ARRIVED_AT_PHARMACY', 'OUT_FOR_DELIVERY')).toBe(true);
      expect(validateStatusTransition('OUT_FOR_DELIVERY', 'ARRIVED_NEAR_CUSTOMER')).toBe(true);
      expect(validateStatusTransition('ARRIVED_NEAR_CUSTOMER', 'DELIVERED')).toBe(true);
    });

    test('rejects invalid backwards or contradictory transitions', () => {
      expect(() => validateStatusTransition('DELIVERED', 'PREPARING')).toThrow();
      expect(() => validateStatusTransition('CANCELLED', 'OUT_FOR_DELIVERY')).toThrow();
      expect(() => validateStatusTransition('PLACED', 'DELIVERED')).toThrow();
      expect(() => validateStatusTransition('PREPARING', 'DELIVERED')).toThrow();
    });
  });

  describe('2. End-to-End Order Delivery Lifecycle Execution', () => {
    let testOrder;

    test('creates order in PLACED state and assigns to pharmacy', async () => {
      const itemPrice = medicine.price || medicine.mrp || 30.5;
      testOrder = await Order.create({
        orderId: `ORD-TEST-${Date.now()}`,
        customerId: customerUser._id,
        pharmacyId: pharmacy._id,
        items: [
          {
            medicineId: medicine._id,
            name: medicine.name,
            price: itemPrice,
            quantity: 2
          }
        ],
        subtotal: itemPrice * 2,
        deliveryFee: 25,
        platformFee: 5,
        total: itemPrice * 2 + 30,
        deliveryAddress: {
          street: 'Barakhamba Road',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110001',
          fullAddress: 'Barakhamba Road, New Delhi 110001',
          coordinates: [77.225, 28.629]
        },
        orderStatus: 'PLACED'
      });

      expect(testOrder).toBeDefined();
      expect(testOrder.orderStatus).toBe('PLACED');
    });

    test('pharmacy accepts order and transitions to ACCEPTED ➔ PREPARING ➔ READY_FOR_PICKUP', async () => {
      testOrder.orderStatus = 'ACCEPTED';
      await testOrder.save();
      expect(testOrder.orderStatus).toBe('ACCEPTED');

      testOrder.orderStatus = 'PREPARING';
      await testOrder.save();
      expect(testOrder.orderStatus).toBe('PREPARING');

      testOrder.orderStatus = 'READY_FOR_PICKUP';
      await testOrder.save();
      expect(testOrder.orderStatus).toBe('READY_FOR_PICKUP');
    });

    test('autoAssignDeliveryPartner assigns available rider to order', async () => {
      const assignedPartner = await autoAssignDeliveryPartner(testOrder._id);
      expect(assignedPartner).toBeDefined();
      expect(assignedPartner.status).toBe('BUSY');

      const refreshedOrder = await Order.findById(testOrder._id);
      expect(refreshedOrder.orderStatus).toBe('DELIVERY_ASSIGNED');
      expect(refreshedOrder.deliveryPartnerId.toString()).toBe(assignedPartner.userId._id.toString());
    });

    test('rider progresses through ARRIVED_AT_PHARMACY ➔ OUT_FOR_DELIVERY ➔ ARRIVED_NEAR_CUSTOMER ➔ DELIVERED', async () => {
      const order = await Order.findById(testOrder._id);

      // 1. Rider arrives at pharmacy
      validateStatusTransition(order.orderStatus, 'ARRIVED_AT_PHARMACY');
      order.orderStatus = 'ARRIVED_AT_PHARMACY';
      await order.save();
      expect(order.orderStatus).toBe('ARRIVED_AT_PHARMACY');

      // 2. Rider picks up package
      validateStatusTransition(order.orderStatus, 'OUT_FOR_DELIVERY');
      order.orderStatus = 'OUT_FOR_DELIVERY';
      await order.save();
      expect(order.orderStatus).toBe('OUT_FOR_DELIVERY');

      // 3. Rider arrives near customer
      validateStatusTransition(order.orderStatus, 'ARRIVED_NEAR_CUSTOMER');
      order.orderStatus = 'ARRIVED_NEAR_CUSTOMER';
      await order.save();
      expect(order.orderStatus).toBe('ARRIVED_NEAR_CUSTOMER');

      // 4. Rider marks delivered
      validateStatusTransition(order.orderStatus, 'DELIVERED');
      order.orderStatus = 'DELIVERED';
      await order.save();
      expect(order.orderStatus).toBe('DELIVERED');
    });
  });

  describe('3. Fallback Rerouting and Rider Reset Safety', () => {
    test('creates order with rider and confirms baseline', async () => {
      const itemPrice = medicine.price || medicine.mrp || 30.5;
      const order = await Order.create({
        orderId: `ORD-FALLBACK-${Date.now()}`,
        customerId: customerUser._id,
        pharmacyId: pharmacy._id,
        deliveryPartnerId: riderUser._id,
        items: [
          {
            medicineId: medicine._id,
            name: medicine.name,
            price: itemPrice,
            quantity: 1
          }
        ],
        subtotal: itemPrice,
        deliveryFee: 25,
        platformFee: 5,
        total: itemPrice + 30,
        deliveryAddress: {
          street: 'CP',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110001',
          fullAddress: 'CP, New Delhi',
          coordinates: [77.219, 28.632]
        },
        orderStatus: 'PLACED'
      });

      expect(order.deliveryPartnerId).toBeDefined();
    });
  });
});
