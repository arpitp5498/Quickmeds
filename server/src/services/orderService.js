const PharmacyInventory = require('../models/PharmacyInventory');
const Order = require('../models/Order');
const Pharmacy = require('../models/Pharmacy');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');
const { optimizeFulfilmentPlan } = require('./smartRoutingService');
const { getIO } = require('../config/socket');
const { sendNotification } = require('./notificationService');
const { logAction } = require('./auditService');

// Valid state machine transitions map
const VALID_TRANSITIONS = {
  PLACED: ['PHARMACY_REVIEW', 'ACCEPTED', 'REJECTED', 'CANCELLED'],
  PHARMACY_REVIEW: ['ACCEPTED', 'REJECTED', 'CANCELLED'],
  ACCEPTED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY_FOR_PICKUP', 'CANCELLED'],
  READY_FOR_PICKUP: ['DELIVERY_ASSIGNED', 'OUT_FOR_DELIVERY', 'CANCELLED'],
  DELIVERY_ASSIGNED: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [], // Final
  REJECTED: [], // Final
  CANCELLED: [] // Final
};

/**
 * Validate order status transition
 */
const validateStatusTransition = (currentStatus, newStatus) => {
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    throw ApiError.badRequest(
      `Invalid order state transition from '${currentStatus}' to '${newStatus}'.`
    );
  }
  return true;
};

/**
 * Validate and decrement stock for all items in an order
 */
const decrementInventory = async (pharmacyId, items) => {
  for (const item of items) {
    const medId = item.medicineId?._id || item.medicineId;
    const inventory = await PharmacyInventory.findOne({
      pharmacyId,
      medicineId: medId
    });

    if (!inventory || (inventory.stockQuantity !== undefined ? inventory.stockQuantity : inventory.stock || 0) < item.quantity) {
      throw ApiError.badRequest(
        `Insufficient stock for "${item.name || 'item'}". Only ${inventory ? (inventory.stockQuantity !== undefined ? inventory.stockQuantity : inventory.stock || 0) : 0} units available at this pharmacy.`
      );
    }

    if (inventory.stockQuantity !== undefined) {
      inventory.stockQuantity -= item.quantity;
      if (inventory.stockQuantity === 0) {
        inventory.isAvailable = false;
      }
    } else if (inventory.stock !== undefined) {
      inventory.stock -= item.quantity;
      if (inventory.stock === 0) {
        inventory.isAvailable = false;
      }
    }
    await inventory.save();
  }
};

/**
 * Restore stock if order is cancelled, rejected, or reassigned
 */
const restoreInventory = async (pharmacyId, items) => {
  for (const item of items) {
    const medId = item.medicineId?._id || item.medicineId;
    const inventory = await PharmacyInventory.findOne({
      pharmacyId,
      medicineId: medId
    });

    if (inventory) {
      if (inventory.stockQuantity !== undefined) {
        inventory.stockQuantity += item.quantity;
        if (inventory.stockQuantity > 0) {
          inventory.isAvailable = true;
        }
      } else if (inventory.stock !== undefined) {
        inventory.stock += item.quantity;
        if (inventory.stock > 0) {
          inventory.isAvailable = true;
        }
      }
      await inventory.save();
    }
  }
};

/**
 * Execute Order Fallback Routing
 * Reassigns order to the next best candidate pharmacy when previous pharmacy times out or is unable to fulfill.
 *
 * @param {string} orderId - Mongo ID of order
 * @param {string} reason - Reassignment reason
 * @returns {Promise<Object>} Updated Order
 */
const executeFallbackReassignment = async (orderId, reason = 'PHARMACY_CONFIRMATION_TIMEOUT') => {
  // 1. Initial state validation
  const initialCheck = await Order.findById(orderId);
  if (!initialCheck) {
    throw ApiError.notFound('Order not found for fallback routing.');
  }

  if (!['PLACED', 'PHARMACY_REVIEW'].includes(initialCheck.orderStatus)) {
    throw ApiError.badRequest(`Cannot trigger fallback for order in '${initialCheck.orderStatus}' state.`);
  }

  // 2. Concurrency Lock: Atomic Compare-And-Swap (CAS) to prevent race conditions
  const order = await Order.findOneAndUpdate(
    {
      _id: orderId,
      orderStatus: { $in: ['PLACED', 'PHARMACY_REVIEW'] },
      fallbackLock: { $ne: true }
    },
    { $set: { fallbackLock: true } },
    { new: true }
  )
    .populate('customerId')
    .populate('pharmacyId');

  if (!order) {
    const checkState = await Order.findById(orderId);
    if (!checkState) {
      throw ApiError.notFound('Order not found for fallback routing.');
    }
    if (!['PLACED', 'PHARMACY_REVIEW'].includes(checkState.orderStatus)) {
      throw ApiError.badRequest(`Cannot trigger fallback for order in '${checkState.orderStatus}' state.`);
    }
    throw ApiError.badRequest('Fallback reassignment already in progress for this order.');
  }

  let newPharmacyDecremented = false;
  let newPharmacyId = null;

  try {
    const oldPharmacyId = order.pharmacyId?._id || order.pharmacyId;
    const oldPharmacyName = order.pharmacyId?.name || 'Previous Pharmacy';
    const customerCoords = order.deliveryAddress?.coordinates || [77.2090, 28.6139];

    // List of excluded pharmacies (already attempted)
    const excludedIds = [
      oldPharmacyId.toString(),
      ...(order.previousPharmacyIds || []).map(id => (id?._id || id).toString())
    ];

    // 3. Run smart routing engine to find next best candidate
    const routingResult = await optimizeFulfilmentPlan(order.items, customerCoords, {
      excludePharmacyIds: excludedIds
    });

    if (!routingResult.recommended || !routingResult.recommended.pharmacies || routingResult.recommended.pharmacies.length === 0) {
      throw ApiError.badRequest('No eligible fallback pharmacy with matching stock available within radius.');
    }

    const newPharmacySummary = routingResult.recommended.pharmacies[0];
    newPharmacyId = newPharmacySummary._id;
    const newPharmacy = await Pharmacy.findById(newPharmacyId);

    if (!newPharmacy) {
      throw ApiError.notFound('New candidate pharmacy not found.');
    }

    // 4. Safe Inventory Handoff: Decrement new candidate pharmacy stock FIRST
    await decrementInventory(newPharmacyId, order.items);
    newPharmacyDecremented = true;

    // Only restore old pharmacy inventory once new decrement succeeds
    await restoreInventory(oldPharmacyId, order.items);

    // 5. Update Order Document & Release Lock
    order.previousPharmacyId = oldPharmacyId;
    if (!order.previousPharmacyIds) {
      order.previousPharmacyIds = [];
    }
    const oldPharmacyIdStr = oldPharmacyId.toString();
    if (!order.previousPharmacyIds.some(id => (id?._id || id).toString() === oldPharmacyIdStr)) {
      order.previousPharmacyIds.push(oldPharmacyId);
    }

    order.pharmacyId = newPharmacyId;
    order.fallbackTriggered = true;
    order.fallbackAttempt = (order.fallbackAttempt || 0) + 1;
    order.fallbackReason = reason;
    order.routingMetadata = routingResult;
    order.fallbackLock = false;
    if (newPharmacySummary.distanceKm !== undefined) {
      order.distanceKm = newPharmacySummary.distanceKm;
    }
    if (routingResult.recommended.etaMinutes !== undefined) {
      order.estimatedDeliveryMinutes = routingResult.recommended.etaMinutes;
    }

    order.statusHistory.push({
      status: order.orderStatus,
      timestamp: new Date(),
      note: `Fallback Triggered (Attempt ${order.fallbackAttempt}): Order reassigned from ${oldPharmacyName} to ${newPharmacy.name} (${reason}).`,
      updatedBy: null
    });

    if (order.customerId && order.customerId._id) {
      order.customerId = order.customerId._id;
    }

    await order.save();

    // 6. Socket.IO Real-time Broadcasts
    try {
      const io = getIO();
      if (io) {
        // Broadcast to order live tracking room
        io.to(`order:${order._id}`).emit('order_fallback_reassigned', {
          orderId: order._id,
          orderNumber: order.orderId,
          oldPharmacyId,
          oldPharmacyName,
          newPharmacyId,
          newPharmacyName: newPharmacy.name,
          fallbackAttempt: order.fallbackAttempt,
          reason,
          timestamp: new Date().toISOString()
        });

        // Notify old pharmacy that order was reassigned away
        io.to(`pharmacy:${oldPharmacyId}`).emit('order_reassigned_away', {
          orderId: order._id,
          orderNumber: order.orderId,
          reason
        });

        // Alert new pharmacy of incoming order
        io.to(`pharmacy:${newPharmacyId}`).emit('new_order_received', {
          orderId: order._id,
          orderNumber: order.orderId,
          total: order.total,
          isFallback: true
        });
      }
    } catch (socketErr) {
      logger.warn(`Socket.IO broadcast warning during fallback: ${socketErr.message}`);
    }

    // 7. Notifications
    try {
      if (order.customerId) {
        await sendNotification({
          userId: order.customerId._id || order.customerId,
          type: 'ORDER_FALLBACK_REASSIGNED',
          title: 'Order Reassigned for Faster Delivery',
          message: `Your order ${order.orderId} was reassigned to ${newPharmacy.name} to ensure fast delivery.`,
          link: `/orders/${order._id}`
        });
      }

      if (newPharmacy.userId) {
        await sendNotification({
          userId: newPharmacy.userId,
          type: 'ORDER_PLACED',
          title: `Immediate Fulfilment Order (${order.orderId})`,
          message: `Order ${order.orderId} has been reassigned to your pharmacy. Please confirm and pack.`,
          link: `/pharmacy/orders/${order._id}`
        });
      }
    } catch (notifErr) {
      logger.warn(`Notification error during fallback: ${notifErr.message}`);
    }

    // 8. Audit Trail Logging
    try {
      await logAction({
        actorId: order.customerId?._id || order.customerId,
        actorRole: 'SYSTEM',
        action: 'ROUTING_FALLBACK',
        entity: 'ORDER',
        entityId: order._id.toString(),
        description: `Fallback triggered for order ${order.orderId}: Reassigned from ${oldPharmacyName} to ${newPharmacy.name} (Reason: ${reason})`,
        metadata: {
          oldPharmacyId: oldPharmacyId.toString(),
          newPharmacyId: newPharmacyId.toString(),
          fallbackAttempt: order.fallbackAttempt,
          reason
        }
      });
    } catch (auditErr) {
      logger.warn(`Audit log error during fallback: ${auditErr.message}`);
    }

    return order;
  } catch (err) {
    // Rollback candidate inventory if decremented before subsequent error
    if (newPharmacyDecremented && newPharmacyId) {
      try {
        await restoreInventory(newPharmacyId, order.items);
      } catch (rbErr) {
        logger.error(`Error rolling back candidate pharmacy inventory: ${rbErr.message}`);
      }
    }

    // Release optimistic fallback lock
    try {
      await Order.findByIdAndUpdate(orderId, { $set: { fallbackLock: false } });
    } catch (unlockErr) {
      logger.error(`Error releasing fallbackLock: ${unlockErr.message}`);
    }

    throw err;
  }
};

module.exports = {
  validateStatusTransition,
  decrementInventory,
  restoreInventory,
  executeFallbackReassignment,
  executeOrderFallback: executeFallbackReassignment
};
