const mongoose = require('mongoose');
const Order = require('../src/models/Order');
const Pharmacy = require('../src/models/Pharmacy');
const DeliveryPartner = require('../src/models/DeliveryPartner');
const User = require('../src/models/User');
const Medicine = require('../src/models/Medicine');
const PharmacyInventory = require('../src/models/PharmacyInventory');
const {
  validateStatusTransition
} = require('../src/services/orderService');
const {
  autoAssignDeliveryPartner,
  reconcileDeliveryPartners
} = require('../src/services/deliveryService');
const connectDB = require('../src/config/db');

jest.setTimeout(35000);

describe('End-to-End Order -> Pharmacy -> Rider -> Customer Pipeline Integration Tests', () => {
  let customerUser;
  let pharmacyUser;
  let pharmacy;
  let riderUser1;
  let riderUser2;
  let rider1;
  let rider2;
  let medicine;

  beforeAll(async () => {
    await connectDB();

    const timestamp = Date.now();

    customerUser = await User.create({
      name: 'E2E Customer ' + timestamp,
      email: 'e2e_customer_' + timestamp + '@quickmeds.com',
      password: 'password123',
      phone: '98111' + String(timestamp).slice(-5),
      role: 'CUSTOMER'
    });

    pharmacyUser = await User.create({
      name: 'E2E Pharmacist ' + timestamp,
      email: 'e2e_pharmacist_' + timestamp + '@quickmeds.com',
      password: 'password123',
      phone: '98222' + String(timestamp).slice(-5),
      role: 'PHARMACY'
    });

    pharmacy = await Pharmacy.create({
      userId: pharmacyUser._id,
      name: 'E2E Meds Chemist ' + timestamp,
      licenseNumber: 'DL-PH-E2E-' + timestamp,
      phone: pharmacyUser.phone,
      email: pharmacyUser.email,
      address: {
        street: 'Connaught Place',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        fullAddress: 'Connaught Place, New Delhi 110001'
      },
      location: {
        type: 'Point',
        coordinates: [77.2195, 28.6328]
      },
      verificationStatus: 'VERIFIED',
      isActive: true
    });

    riderUser1 = await User.create({
      name: 'E2E Rider One ' + timestamp,
      email: 'e2e_rider1_' + timestamp + '@quickmeds.com',
      password: 'password123',
      phone: '98333' + String(timestamp).slice(-5),
      role: 'DELIVERY_PARTNER'
    });

    rider1 = await DeliveryPartner.create({
      userId: riderUser1._id,
      vehicleType: 'Bike',
      vehicleNumber: 'DL-01-E2E-1',
      drivingLicenseNumber: 'DL-E2E-1',
      status: 'AVAILABLE',
      activeOrderId: null,
      currentLocation: {
        type: 'Point',
        coordinates: [77.218, 28.632]
      }
    });

    riderUser2 = await User.create({
      name: 'E2E Rider Two ' + timestamp,
      email: 'e2e_rider2_' + timestamp + '@quickmeds.com',
      password: 'password123',
      phone: '98444' + String(timestamp).slice(-5),
      role: 'DELIVERY_PARTNER'
    });

    rider2 = await DeliveryPartner.create({
      userId: riderUser2._id,
      vehicleType: 'EV Scooter',
      vehicleNumber: 'DL-02-E2E-2',
      drivingLicenseNumber: 'DL-E2E-2',
      status: 'AVAILABLE',
      activeOrderId: null,
      currentLocation: {
        type: 'Point',
        coordinates: [77.216, 28.634]
      }
    });

    medicine = await Medicine.findOne({ price: { $exists: true, $gt: 0 } });
    if (!medicine) {
      medicine = await Medicine.create({
        name: 'Azithral 500mg Tablet',
        genericName: 'Azithromycin 500mg',
        brand: 'Alembic',
        manufacturer: 'Alembic Pharmaceuticals',
        strength: '500mg',
        dosageForm: 'Tablet',
        category: 'Antibiotics',
        description: 'Antibiotic formulation for bacterial infections.',
        price: 120,
        mrp: 135,
        active: true
      });
    }

    const medPrice = medicine.price || 120;
    const medMrp = medicine.mrp || 135;

    await PharmacyInventory.create({
      pharmacyId: pharmacy._id,
      medicineId: medicine._id,
      stockQuantity: 50,
      price: medPrice,
      mrp: medMrp,
      isAvailable: true
    });
  });

  afterAll(async () => {
    if (customerUser) {
      await User.deleteMany({
        _id: { $in: [customerUser._id, pharmacyUser._id, riderUser1._id, riderUser2._id] }
      });
    }
    if (pharmacy) await Pharmacy.deleteOne({ _id: pharmacy._id });
    if (rider1) await DeliveryPartner.deleteOne({ _id: rider1._id });
    if (rider2) await DeliveryPartner.deleteOne({ _id: rider2._id });
    if (customerUser) await Order.deleteMany({ customerId: customerUser._id });
    await mongoose.connection.close();
  });

  test('Step 1: Order creation establishes PLACED state in database', async () => {
    const unitPrice = Number(medicine.price) || 120;
    const order = await Order.create({
      orderId: 'ORD-E2E-' + Date.now(),
      customerId: customerUser._id,
      pharmacyId: pharmacy._id,
      deliveryPartnerId: null,
      items: [
        {
          medicineId: medicine._id,
          name: medicine.name,
          price: unitPrice,
          quantity: 1
        }
      ],
      subtotal: unitPrice,
      deliveryFee: 25,
      platformFee: 5,
      total: unitPrice + 30,
      deliveryAddress: {
        street: 'Barakhamba Road',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        fullAddress: 'Barakhamba Road, New Delhi 110001',
        coordinates: [77.225, 28.629]
      },
      orderStatus: 'PLACED',
      statusHistory: [{ status: 'PLACED', timestamp: new Date(), note: 'Order created' }]
    });

    expect(order._id).toBeDefined();
    expect(order.orderStatus).toBe('PLACED');
    expect(order.deliveryPartnerId).toBeNull();
  });

  test('Step 2: Pharmacy transitions through ACCEPTED -> PREPARING -> READY_FOR_PICKUP', async () => {
    const order = await Order.findOne({ customerId: customerUser._id }).sort({ createdAt: -1 });
    expect(order).toBeDefined();

    validateStatusTransition(order.orderStatus, 'ACCEPTED');
    order.orderStatus = 'ACCEPTED';
    order.statusHistory.push({ status: 'ACCEPTED', timestamp: new Date() });
    await order.save();

    validateStatusTransition(order.orderStatus, 'PREPARING');
    order.orderStatus = 'PREPARING';
    order.statusHistory.push({ status: 'PREPARING', timestamp: new Date() });
    await order.save();

    validateStatusTransition(order.orderStatus, 'READY_FOR_PICKUP');
    order.orderStatus = 'READY_FOR_PICKUP';
    order.statusHistory.push({ status: 'READY_FOR_PICKUP', timestamp: new Date() });
    await order.save();

    const savedOrder = await Order.findById(order._id);
    expect(savedOrder.orderStatus).toBe('READY_FOR_PICKUP');
  });

  test('Step 3: autoAssignDeliveryPartner assigns available rider and sets status to DELIVERY_ASSIGNED', async () => {
    const order = await Order.findOne({ customerId: customerUser._id }).sort({ createdAt: -1 });

    const assignResult = await autoAssignDeliveryPartner(order._id);
    expect(assignResult.success).toBe(true);
    expect(assignResult.partner).toBeDefined();
    expect(assignResult.partner.status).toBe('BUSY');
    expect(assignResult.partner.activeOrderId.toString()).toBe(order._id.toString());

    const refreshedOrder = await Order.findById(order._id);
    expect(refreshedOrder.orderStatus).toBe('DELIVERY_ASSIGNED');
    expect(refreshedOrder.deliveryPartnerId.toString()).toBe(assignResult.partner.userId._id.toString());
  });

  test('Step 4: Atomic concurrency - second order claims second available rider without conflict', async () => {
    const unitPrice = Number(medicine.price) || 120;
    const order2 = await Order.create({
      orderId: 'ORD-E2E-2-' + Date.now(),
      customerId: customerUser._id,
      pharmacyId: pharmacy._id,
      items: [
        {
          medicineId: medicine._id,
          name: medicine.name,
          price: unitPrice,
          quantity: 1
        }
      ],
      subtotal: unitPrice,
      total: unitPrice + 30,
      deliveryAddress: {
        street: 'Janpath',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        fullAddress: 'Janpath, New Delhi 110001',
        coordinates: [77.218, 28.625]
      },
      orderStatus: 'READY_FOR_PICKUP'
    });

    const assignResult2 = await autoAssignDeliveryPartner(order2._id);
    expect(assignResult2.success).toBe(true);

    const firstOrder = await Order.findOne({ customerId: customerUser._id }).sort({ createdAt: 1 });
    expect(assignResult2.partner.userId._id.toString()).not.toBe(firstOrder.deliveryPartnerId.toString());
  });

  test('Step 5: Full Rider delivery lifecycle through ARRIVED_AT_PHARMACY -> OUT_FOR_DELIVERY -> ARRIVED_NEAR_CUSTOMER -> DELIVERED', async () => {
    const order = await Order.findOne({ customerId: customerUser._id }).sort({ createdAt: 1 });

    validateStatusTransition(order.orderStatus, 'ARRIVED_AT_PHARMACY');
    order.orderStatus = 'ARRIVED_AT_PHARMACY';
    await order.save();
    expect(order.orderStatus).toBe('ARRIVED_AT_PHARMACY');

    validateStatusTransition(order.orderStatus, 'OUT_FOR_DELIVERY');
    order.orderStatus = 'OUT_FOR_DELIVERY';
    await order.save();
    expect(order.orderStatus).toBe('OUT_FOR_DELIVERY');

    validateStatusTransition(order.orderStatus, 'ARRIVED_NEAR_CUSTOMER');
    order.orderStatus = 'ARRIVED_NEAR_CUSTOMER';
    await order.save();
    expect(order.orderStatus).toBe('ARRIVED_NEAR_CUSTOMER');

    validateStatusTransition(order.orderStatus, 'DELIVERED');
    order.orderStatus = 'DELIVERED';
    await order.save();
    expect(order.orderStatus).toBe('DELIVERED');
  });

  test('Step 6: reconcileDeliveryPartners self-heals rider after delivery completion', async () => {
    await reconcileDeliveryPartners();

    const freedPartner = await DeliveryPartner.findOne({ userId: riderUser1._id });
    expect(freedPartner.activeOrderId).toBeNull();
    expect(freedPartner.status).toBe('AVAILABLE');
  });
});
