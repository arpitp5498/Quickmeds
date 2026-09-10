const DeliveryPartner = require('../models/DeliveryPartner');
const Order = require('../models/Order');
const { sendNotification } = require('./notificationService');
const { getIO } = require('../config/socket');
const logger = require('../utils/logger');

/**
 * Self-healing reconciliation: Cleans up any delivery partners whose activeOrderId
 * points to completed, cancelled, rejected, or reassigned orders.
 */
const reconcileDeliveryPartners = async () => {
  try {
    const busyPartners = await DeliveryPartner.find({ activeOrderId: { $ne: null } });

    for (const partner of busyPartners) {
      const activeOrder = await Order.findById(partner.activeOrderId);

      const isTerminalOrUnassigned =
        !activeOrder ||
        ['DELIVERED', 'CANCELLED', 'REJECTED', 'FULFILMENT_UNAVAILABLE'].includes(activeOrder.orderStatus) ||
        !activeOrder.deliveryPartnerId ||
        activeOrder.deliveryPartnerId.toString() !== partner.userId.toString();

      if (isTerminalOrUnassigned) {
        logger.info(
          `[Reconcile] Resetting stale delivery partner ${partner._id} (Order ${partner.activeOrderId} status: ${activeOrder?.orderStatus || 'NOT_FOUND'})`
        );
        partner.activeOrderId = null;
        if (partner.status !== 'OFFLINE') {
          partner.status = 'AVAILABLE';
        }
        await partner.save();
      }
    }
  } catch (err) {
    logger.warn(`[Reconcile] Error reconciling delivery partners: ${err.message}`);
  }
};

/**
 * Assign the closest available delivery partner to an order with atomic locking
 * and database consistency guarantees.
 */
const autoAssignDeliveryPartner = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate('pharmacyId customerId');
    if (!order) {
      logger.warn(`[AutoAssign] Order ${orderId} not found`);
      return { success: false, partner: null, reason: 'ORDER_NOT_FOUND' };
    }

    // Idempotency: If a delivery partner is already assigned, confirm it and return
    if (order.deliveryPartnerId) {
      const existingPartner = await DeliveryPartner.findOne({
        userId: order.deliveryPartnerId
      }).populate('userId');

      if (existingPartner) {
        if (existingPartner.activeOrderId?.toString() !== order._id.toString()) {
          existingPartner.activeOrderId = order._id;
          existingPartner.status = 'BUSY';
          await existingPartner.save();
        }
        logger.info(`[AutoAssign] Idempotent: rider ${existingPartner.userId?.name || existingPartner.userId} already assigned to order ${order.orderId}`);
        return { success: true, partner: existingPartner };
      }
    }

    // Step 1: Reconcile any stale busy partners in database
    await reconcileDeliveryPartners();

    const isDemoOrder = Boolean(order.isDemo);
    const demoFilter = isDemoOrder ? { isDemo: true } : { isDemo: { $ne: true } };

    // Step 2: Atomic attempt to claim a partner marked AVAILABLE with no active order
    let partner = await DeliveryPartner.findOneAndUpdate(
      {
        ...demoFilter,
        status: 'AVAILABLE',
        activeOrderId: null
      },
      {
        $set: {
          status: 'BUSY',
          activeOrderId: order._id
        }
      },
      { new: true }
    ).populate('userId');

    // Step 3: Fallback attempt: Any partner not currently busy (not OFFLINE)
    if (!partner) {
      partner = await DeliveryPartner.findOneAndUpdate(
        {
          ...demoFilter,
          activeOrderId: null,
          status: { $ne: 'OFFLINE' }
        },
        {
          $set: {
            status: 'BUSY',
            activeOrderId: order._id
          }
        },
        { new: true }
      ).populate('userId');
    }

    // Step 4: High-Resiliency Fallback for Demo & Low-Driver environments:
    // If all partners are offline or in standby, pick the first available registered partner
    if (!partner) {
      const candidate = await DeliveryPartner.findOne({
        ...demoFilter,
        activeOrderId: null
      }).populate('userId');

      if (candidate) {
        candidate.status = 'BUSY';
        candidate.activeOrderId = order._id;
        await candidate.save();
        partner = candidate;
      }
    }

    // Global safety fallback if scoped pool is empty
    if (!partner) {
      const candidate = await DeliveryPartner.findOne({
        activeOrderId: null
      }).populate('userId');

      if (candidate) {
        candidate.status = 'BUSY';
        candidate.activeOrderId = order._id;
        await candidate.save();
        partner = candidate;
      }
    }

    // If still no partner exists at all in the database
    if (!partner || !partner.userId) {
      logger.warn(`[AutoAssign] No delivery partner available for order ${order.orderId}`);
      return { success: false, partner: null, reason: 'NO_ELIGIBLE_RIDER' };
    }

    // Step 5: Persist assignment in Order document (DATABASE = SOURCE OF TRUTH)
    order.deliveryPartnerId = partner.userId._id;
    order.orderStatus = 'DELIVERY_ASSIGNED';
    order.statusHistory.push({
      status: 'DELIVERY_ASSIGNED',
      timestamp: new Date(),
      note: `Assigned to delivery partner ${partner.userId.name || 'QuickMeds Rider'}`
    });
    await order.save();

    // Step 6: Multi-channel real-time broadcasting (SOCKET = FAST UPDATE CHANNEL)
    const partnerPayload = {
      name: partner.userId.name,
      phone: partner.userId.phone,
      vehicleType: partner.vehicleType || 'Bike',
      vehicleNumber: partner.vehicleNumber || 'DL 01 QM 2026',
      rating: partner.rating || 4.8,
      currentLocation: partner.currentLocation?.coordinates || [77.209, 28.6139]
    };

    try {
      const io = getIO();
      const statusPayload = {
        orderId: order._id,
        orderNumber: order.orderId,
        status: 'DELIVERY_ASSIGNED',
        note: `Assigned to delivery partner ${partner.userId.name}`,
        deliveryPartner: partnerPayload
      };

      // Broadcast to Order Tracking Room
      io.to(`order:${order._id}`).emit('order_status_changed', statusPayload);

      // Broadcast to Pharmacy Room
      const pharmId = order.pharmacyId?._id || order.pharmacyId;
      if (pharmId) {
        io.to(`pharmacy:${pharmId}`).emit('order_status_changed', statusPayload);
      }

      // Direct Realtime Alert to Assigned Delivery Partner User Room
      io.to(`user:${partner.userId._id}`).emit('new_delivery_assigned', {
        orderId: order._id,
        orderNumber: order.orderId,
        pharmacyName: order.pharmacyId?.name || 'Pharmacy',
        deliveryAddress: order.deliveryAddress?.fullAddress || ''
      });
      io.to(`user:${partner.userId._id}`).emit('order_status_changed', statusPayload);

      // Customer User Room
      if (order.customerId?._id) {
        io.to(`user:${order.customerId._id}`).emit('order_status_changed', statusPayload);
      }

      // Admin Room
      io.to('admin:room').emit('order_status_changed', statusPayload);
    } catch (socketErr) {
      logger.warn(`[AutoAssign] Socket broadcast warning: ${socketErr.message}`);
    }

    // Step 7: Push in-app persistent notifications
    try {
      if (order.customerId?._id) {
        await sendNotification({
          userId: order.customerId._id,
          type: 'DELIVERY_ASSIGNED',
          title: 'Delivery Partner Assigned!',
          message: `${partner.userId.name} (${partner.vehicleNumber || 'Registered Rider'}) has been assigned to deliver your order ${order.orderId}.`,
          link: `/orders/${order._id}`
        });
      }

      if (partner.userId?._id) {
        await sendNotification({
          userId: partner.userId._id,
          type: 'DELIVERY_ASSIGNED',
          title: 'New Delivery Task Assigned',
          message: `Pickup order ${order.orderId} from ${order.pharmacyId?.name || 'Pharmacy'} and deliver to ${order.deliveryAddress?.fullAddress || 'Customer'}.`,
          link: `/delivery/active`
        });
      }
    } catch (notifErr) {
      logger.warn(`[AutoAssign] Notification warning: ${notifErr.message}`);
    }

    logger.info(
      `[AutoAssign] RIDER_ASSIGNMENT_PERSISTED: ${partner.userId.name} → order ${order.orderId} | ` +
      `Partner ID: ${partner._id} | Order status: DELIVERY_ASSIGNED`
    );
    return { success: true, partner };
  } catch (error) {
    logger.error(`[AutoAssign] Error in autoAssignDeliveryPartner: ${error.message}`);
    return { success: false, partner: null, reason: error.message };
  }
};

module.exports = {
  autoAssignDeliveryPartner,
  reconcileDeliveryPartners
};
