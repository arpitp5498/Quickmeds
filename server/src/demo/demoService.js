// SIH DEMO MODE ONLY - REMOVE AFTER SIH
/**
 * QuickMeds Isolated Demo Business Logic Service
 * File: server/src/demo/demoService.js
 */

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const DeliveryPartner = require('../models/DeliveryPartner');
const Order = require('../models/Order');
const PharmacyInventory = require('../models/PharmacyInventory');
const { executeFallbackReassignment } = require('../services/orderService');
const { getIO } = require('../config/socket');
const logger = require('../utils/logger');
const {
  initDemoEnvironment,
  DEMO_EMAILS,
  DEMO_ORDER_ID
} = require('./demoSeed');

/**
 * Fetch current state of the demo ecosystem
 */
const getDemoStatus = async () => {
  await initDemoEnvironment();

  const order = await Order.findOne({ orderId: DEMO_ORDER_ID })
    .populate('customerId', 'name email phone')
    .populate('pharmacyId', 'name address phone location rating')
    .populate({
      path: 'deliveryPartnerId',
      select: 'name phone',
      populate: {
        path: 'deliveryPartnerId',
        select: 'vehicleType vehicleNumber status currentLocation rating'
      }
    });

  const pharmacyUserA = await User.findOne({ email: DEMO_EMAILS.PHARMACY_A });
  const pharmacyA = pharmacyUserA ? await Pharmacy.findOne({ userId: pharmacyUserA._id }) : null;

  const pharmacyUserB = await User.findOne({ email: DEMO_EMAILS.PHARMACY_B });
  const pharmacyB = pharmacyUserB ? await Pharmacy.findOne({ userId: pharmacyUserB._id }) : null;

  const riderUser = await User.findOne({ email: DEMO_EMAILS.RIDER });
  const rider = riderUser ? await DeliveryPartner.findOne({ userId: riderUser._id }) : null;

  let inventoryA = null;
  let inventoryB = null;
  if (pharmacyA && order?.items?.[0]?.medicineId) {
    inventoryA = await PharmacyInventory.findOne({
      pharmacyId: pharmacyA._id,
      medicineId: order.items[0].medicineId
    });
  }
  if (pharmacyB && order?.items?.[0]?.medicineId) {
    inventoryB = await PharmacyInventory.findOne({
      pharmacyId: pharmacyB._id,
      medicineId: order.items[0].medicineId
    });
  }

  return {
    enabled: true,
    order,
    pharmacyA: pharmacyA ? { _id: pharmacyA._id, name: pharmacyA.name, address: pharmacyA.address } : null,
    pharmacyB: pharmacyB ? { _id: pharmacyB._id, name: pharmacyB.name, address: pharmacyB.address } : null,
    rider: rider ? { _id: rider._id, name: riderUser.name, vehicle: rider.vehicleType, status: rider.status } : null,
    inventory: {
      pharmacyAStock: inventoryA?.stockQuantity ?? 10,
      pharmacyBStock: inventoryB?.stockQuantity ?? 20
    }
  };
};

/**
 * Generate a scoped JWT for a specific demo role to allow opening tabs without logging in
 */
const getDemoSession = async (role) => {
  await initDemoEnvironment();

  let targetEmail = '';
  switch (role) {
    case 'CUSTOMER':
      targetEmail = DEMO_EMAILS.CUSTOMER;
      break;
    case 'PHARMACY':
    case 'PHARMACY_A':
      targetEmail = DEMO_EMAILS.PHARMACY_A;
      break;
    case 'PHARMACY_B':
      targetEmail = DEMO_EMAILS.PHARMACY_B;
      break;
    case 'DELIVERY_PARTNER':
    case 'RIDER':
      targetEmail = DEMO_EMAILS.RIDER;
      break;
    default:
      throw new Error(`Invalid demo role requested: ${role}`);
  }

  const user = await User.findOne({ email: targetEmail });
  if (!user) {
    throw new Error(`Demo user not found for role ${role}`);
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: '12h' }
  );

  const order = await Order.findOne({ orderId: DEMO_ORDER_ID });

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      pharmacyId: user.pharmacyId || null,
      deliveryPartnerId: user.deliveryPartnerId || null
    },
    token,
    demoOrderId: order?._id?.toString() || '',
    demoOrderNumber: DEMO_ORDER_ID
  };
};

/**
 * Simulate Pharmacy A rejection and trigger real Smart Fallback Rerouting to Pharmacy B
 */
const simulatePharmacyRejection = async () => {
  await initDemoEnvironment();

  const order = await Order.findOne({ orderId: DEMO_ORDER_ID });
  if (!order) {
    throw new Error('Demo order QM-DEMO-001 not found.');
  }

  // Trigger real fallback reassignment service with order._id
  const fallbackResult = await executeFallbackReassignment(
    order._id,
    'PHARMACY_REJECTED',
    'Simulated Chemist Rejection for SIH Demonstration'
  );

  const populated = await Order.findById(fallbackResult._id).populate('pharmacyId', 'name');

  return {
    triggered: true,
    order: populated,
    newPharmacy: populated?.pharmacyId?.name || 'QuickMeds Demo Pharmacy 2 (Fallback Store)',
    attempt: populated?.fallbackAttempt || 1
  };
};

/**
 * Reset Demo: Restores QM-DEMO-001, restores inventories, and sets rider available
 */
const resetDemo = async () => {
  const { pharmacyA, pharmacyB, doloMed } = await initDemoEnvironment();

  const order = await Order.findOne({ orderId: DEMO_ORDER_ID });
  if (order) {
    order.orderStatus = 'PLACED';
    order.pharmacyId = pharmacyA._id;
    order.deliveryPartnerId = null;
    order.fallbackTriggered = false;
    order.fallbackAttempt = 0;
    order.fallbackReason = '';
    order.previousPharmacyId = null;
    order.previousPharmacyIds = [];
    order.deliveryOtp = '4829';
    order.deliveryOtpVerified = false;
    order.statusHistory = [
      {
        status: 'PLACED',
        note: 'Demo reset to initial baseline state',
        timestamp: new Date()
      }
    ];
    await order.save();
  }

  // Reset inventory baselines for all active medicines
  const Medicine = require('../models/Medicine');
  const allMeds = await Medicine.find({ active: true });
  const bulkOps = [];
  for (const med of allMeds) {
    const isDolo = /dolo/i.test(med.name) || (doloMed && med._id.toString() === doloMed._id.toString());
    const stockA = isDolo ? 10 : 50;
    const stockB = isDolo ? 20 : 50;
    bulkOps.push({
      updateOne: {
        filter: { pharmacyId: pharmacyA._id, medicineId: med._id },
        update: { $set: { stockQuantity: stockA, isAvailable: true } }
      }
    });
    bulkOps.push({
      updateOne: {
        filter: { pharmacyId: pharmacyB._id, medicineId: med._id },
        update: { $set: { stockQuantity: stockB, isAvailable: true } }
      }
    });
  }
  if (bulkOps.length > 0) {
    await PharmacyInventory.bulkWrite(bulkOps);
  }

  // Reset rider
  const riderUser = await User.findOne({ email: DEMO_EMAILS.RIDER });
  if (riderUser) {
    await DeliveryPartner.findOneAndUpdate(
      { userId: riderUser._id },
      { status: 'AVAILABLE', activeOrderId: null }
    );
  }

  // Notify connected sockets across all rooms
  const io = getIO();
  if (io && order) {
    io.to(`order:${order._id}`).emit('order_status_changed', {
      orderId: order._id.toString(),
      status: 'PLACED',
      note: 'Demo reset triggered',
      timestamp: new Date()
    });
    io.to(`pharmacy:${pharmacyA._id}`).emit('order_status_changed', {
      orderId: order._id.toString(),
      status: 'PLACED'
    });
  }

  logger.info('[Demo] QM-DEMO-001 and inventory reset successfully.');

  return {
    success: true,
    message: 'Demo state and inventory successfully reset to initial baseline.'
  };
};

module.exports = {
  getDemoStatus,
  getDemoSession,
  simulatePharmacyRejection,
  resetDemo
};
