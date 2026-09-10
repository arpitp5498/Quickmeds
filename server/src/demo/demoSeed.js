// SIH DEMO MODE ONLY - REMOVE AFTER SIH
/**
 * QuickMeds Isolated Demo Entities & Seed Engine
 * File: server/src/demo/demoSeed.js
 */

const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const DeliveryPartner = require('../models/DeliveryPartner');
const Medicine = require('../models/Medicine');
const PharmacyInventory = require('../models/PharmacyInventory');
const Order = require('../models/Order');

const DEMO_CREDENTIALS = {
  PASSWORD: 'DemoPassword@2026'
};

const DEMO_EMAILS = {
  CUSTOMER: 'demo.customer@quickmeds.demo',
  PHARMACY_A: 'demo.pharmacy1@quickmeds.demo',
  PHARMACY_B: 'demo.pharmacy2@quickmeds.demo',
  RIDER: 'demo.rider@quickmeds.demo'
};

const DEMO_ORDER_ID = 'QM-DEMO-001';

/**
 * Ensures all isolated demo accounts and master demo order exist.
 */
const initDemoEnvironment = async () => {
  // 1. Demo Customer
  let customer = await User.findOne({ email: DEMO_EMAILS.CUSTOMER });
  if (!customer) {
    customer = await User.create({
      name: 'Demo Customer (Rahul)',
      email: DEMO_EMAILS.CUSTOMER,
      phone: '9800000001',
      password: DEMO_CREDENTIALS.PASSWORD,
      role: 'CUSTOMER',
      isDemo: true
    });
  } else if (!customer.isDemo) {
    customer.isDemo = true;
    await customer.save();
  }

  // 2. Demo Pharmacy A
  let pharmacyUserA = await User.findOne({ email: DEMO_EMAILS.PHARMACY_A });
  if (!pharmacyUserA) {
    pharmacyUserA = await User.create({
      name: 'QuickMeds Demo Pharmacy 1 Manager',
      email: DEMO_EMAILS.PHARMACY_A,
      phone: '9800000002',
      password: DEMO_CREDENTIALS.PASSWORD,
      role: 'PHARMACY',
      isDemo: true
    });
  } else if (!pharmacyUserA.isDemo) {
    pharmacyUserA.isDemo = true;
    await pharmacyUserA.save();
  }

  let pharmacyA = await Pharmacy.findOne({ userId: pharmacyUserA._id });
  if (!pharmacyA) {
    pharmacyA = await Pharmacy.create({
      userId: pharmacyUserA._id,
      name: 'QuickMeds Demo Pharmacy 1',
      licenseNumber: 'DL-PH-DEMO-001',
      phone: '9800000002',
      email: DEMO_EMAILS.PHARMACY_A,
      address: {
        street: 'Connaught Place Inner Circle',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        fullAddress: 'Connaught Place Inner Circle, New Delhi 110001'
      },
      location: {
        type: 'Point',
        coordinates: [77.214, 28.629]
      },
      verificationStatus: 'VERIFIED',
      isActive: true,
      isOpen: true,
      operatingHours: { open: '00:00', close: '23:59', is24x7: true },
      rating: 4.9,
      totalRatings: 500,
      totalOrdersCompleted: 1200,
      isDemo: true
    });
    pharmacyUserA.pharmacyId = pharmacyA._id;
    await pharmacyUserA.save();
  } else {
    // Update existing pharmacy to ensure isDemo, rating, and proximity are active
    pharmacyA.name = 'QuickMeds Demo Pharmacy 1';
    pharmacyA.isDemo = true;
    pharmacyA.rating = 4.9;
    pharmacyA.totalRatings = 500;
    pharmacyA.totalOrdersCompleted = 1200;
    pharmacyA.verificationStatus = 'VERIFIED';
    pharmacyA.isActive = true;
    pharmacyA.isOpen = true;
    pharmacyA.location = {
      type: 'Point',
      coordinates: [77.214, 28.629]
    };
    await pharmacyA.save();
    if (!pharmacyUserA.pharmacyId) {
      pharmacyUserA.pharmacyId = pharmacyA._id;
      await pharmacyUserA.save();
    }
  }

  // 3. Demo Pharmacy B (For Rerouting Demonstration)
  let pharmacyUserB = await User.findOne({ email: DEMO_EMAILS.PHARMACY_B });
  if (!pharmacyUserB) {
    pharmacyUserB = await User.create({
      name: 'QuickMeds Demo Pharmacy 2 Manager',
      email: DEMO_EMAILS.PHARMACY_B,
      phone: '9800000003',
      password: DEMO_CREDENTIALS.PASSWORD,
      role: 'PHARMACY',
      isDemo: true
    });
  } else if (!pharmacyUserB.isDemo) {
    pharmacyUserB.isDemo = true;
    await pharmacyUserB.save();
  }

  let pharmacyB = await Pharmacy.findOne({ userId: pharmacyUserB._id });
  if (!pharmacyB) {
    pharmacyB = await Pharmacy.create({
      userId: pharmacyUserB._id,
      name: 'QuickMeds Demo Pharmacy 2 (Fallback Store)',
      licenseNumber: 'DL-PH-DEMO-002',
      phone: '9800000003',
      email: DEMO_EMAILS.PHARMACY_B,
      address: {
        street: 'Barakhamba Road',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        fullAddress: 'Barakhamba Road, Connaught Place, New Delhi 110001'
      },
      location: {
        type: 'Point',
        coordinates: [77.227, 28.631]
      },
      verificationStatus: 'VERIFIED',
      isActive: true,
      isOpen: true,
      operatingHours: { open: '00:00', close: '23:59', is24x7: true },
      rating: 4.8,
      totalRatings: 350,
      totalOrdersCompleted: 800,
      isDemo: true
    });
    pharmacyUserB.pharmacyId = pharmacyB._id;
    await pharmacyUserB.save();
  } else {
    pharmacyB.name = 'QuickMeds Demo Pharmacy 2 (Fallback Store)';
    pharmacyB.isDemo = true;
    pharmacyB.rating = 4.8;
    pharmacyB.totalRatings = 350;
    pharmacyB.totalOrdersCompleted = 800;
    pharmacyB.verificationStatus = 'VERIFIED';
    pharmacyB.isActive = true;
    pharmacyB.isOpen = true;
    pharmacyB.location = {
      type: 'Point',
      coordinates: [77.227, 28.631]
    };
    await pharmacyB.save();
    if (!pharmacyUserB.pharmacyId) {
      pharmacyUserB.pharmacyId = pharmacyB._id;
      await pharmacyUserB.save();
    }
  }

  // 4. Demo Rider
  let riderUser = await User.findOne({ email: DEMO_EMAILS.RIDER });
  if (!riderUser) {
    riderUser = await User.create({
      name: 'Demo Rider (Suresh Kumar)',
      email: DEMO_EMAILS.RIDER,
      phone: '9800000004',
      password: DEMO_CREDENTIALS.PASSWORD,
      role: 'DELIVERY_PARTNER',
      isDemo: true
    });
  } else if (!riderUser.isDemo) {
    riderUser.isDemo = true;
    await riderUser.save();
  }

  let rider = await DeliveryPartner.findOne({ userId: riderUser._id });
  if (!rider) {
    rider = await DeliveryPartner.create({
      userId: riderUser._id,
      vehicleType: 'EV Scooter',
      vehicleNumber: 'DL 01 QM 2026',
      drivingLicenseNumber: 'DL-DEMO-2026-RIDER',
      status: 'AVAILABLE',
      currentLocation: {
        type: 'Point',
        coordinates: [77.218, 28.632]
      },
      rating: 4.9,
      isDemo: true
    });
    riderUser.deliveryPartnerId = rider._id;
    await riderUser.save();
  } else {
    rider.isDemo = true;
    rider.status = 'AVAILABLE';
    await rider.save();
    if (!riderUser.deliveryPartnerId) {
      riderUser.deliveryPartnerId = rider._id;
      await riderUser.save();
    }
  }

  // 5. Ensure Demo Medicines & Full Catalog Inventory in Pharmacy A & B
  let doloMed = await Medicine.findOne({ name: 'Dolo 650mg Tablet' });
  if (!doloMed) {
    doloMed = await Medicine.findOne({ name: /dolo/i });
  }
  if (!doloMed) {
    doloMed = await Medicine.create({
      name: 'Dolo 650mg Tablet',
      genericName: 'Paracetamol 650mg',
      brand: 'Micro Labs',
      manufacturer: 'Micro Labs Ltd',
      strength: '650mg',
      dosageForm: 'Tablet',
      category: 'Pain Relief',
      description: 'Rapid fever and mild to moderate pain relief formulation.',
      price: 30.5,
      mrp: 35.0,
      requiresPrescription: false,
      active: true
    });
  }

  // Seed inventory for ALL active master medicines in Pharmacy A & B
  const allMeds = await Medicine.find({ active: true });
  const bulkOps = [];
  for (const med of allMeds) {
    const isDolo = /dolo/i.test(med.name) || (doloMed && med._id.toString() === doloMed._id.toString());
    const stockA = isDolo ? 10 : 50;
    const stockB = isDolo ? 20 : 50;

    bulkOps.push({
      updateOne: {
        filter: { pharmacyId: pharmacyA._id, medicineId: med._id },
        update: {
          $set: {
            pharmacyId: pharmacyA._id,
            medicineId: med._id,
            stockQuantity: stockA,
            price: med.price || 30,
            mrp: med.mrp || 35,
            isAvailable: true
          }
        },
        upsert: true
      }
    });
    bulkOps.push({
      updateOne: {
        filter: { pharmacyId: pharmacyB._id, medicineId: med._id },
        update: {
          $set: {
            pharmacyId: pharmacyB._id,
            medicineId: med._id,
            stockQuantity: stockB,
            price: med.price || 30,
            mrp: med.mrp || 35,
            isAvailable: true
          }
        },
        upsert: true
      }
    });
  }
  if (bulkOps.length > 0) {
    await PharmacyInventory.bulkWrite(bulkOps);
  }

  // 6. Ensure Master Demo Order QM-DEMO-001 exists
  let demoOrder = await Order.findOne({ orderId: DEMO_ORDER_ID });
  if (!demoOrder) {
    demoOrder = await Order.create({
      orderId: DEMO_ORDER_ID,
      isDemo: true,
      customerId: customer._id,
      pharmacyId: pharmacyA._id,
      deliveryPartnerId: null,
      items: [
        {
          medicineId: doloMed._id,
          name: doloMed.name,
          price: 30.5,
          quantity: 2
        }
      ],
      subtotal: 61,
      deliveryFee: 25,
      platformFee: 5,
      total: 91,
      deliveryAddress: {
        street: 'Flat 402, Royal Residency, Connaught Place',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        fullAddress: 'Flat 402, Royal Residency, Connaught Place, New Delhi 110001',
        coordinates: [77.214, 28.629]
      },
      orderStatus: 'PLACED',
      deliveryOtp: '4829',
      deliveryOtpVerified: false,
      statusHistory: [
        {
          status: 'PLACED',
          note: 'Demo Order initiated',
          timestamp: new Date()
        }
      ]
    });
  } else {
    if (!demoOrder.isDemo || demoOrder.pharmacyId.toString() !== pharmacyA._id.toString()) {
      demoOrder.isDemo = true;
      demoOrder.pharmacyId = pharmacyA._id;
      await demoOrder.save();
    }
  }

  return {
    customer,
    pharmacyA,
    pharmacyB,
    rider,
    demoOrder,
    doloMed
  };
};

module.exports = {
  initDemoEnvironment,
  DEMO_EMAILS,
  DEMO_CREDENTIALS,
  DEMO_ORDER_ID
};
