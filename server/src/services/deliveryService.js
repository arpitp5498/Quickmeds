const DeliveryPartner = require('../models/DeliveryPartner');
const Order = require('../models/Order');
const { sendNotification } = require('./notificationService');
const { getIO } = require('../config/socket');
const logger = require('../utils/logger');

/**
 * Assign the closest available delivery partner to an order
 */
const autoAssignDeliveryPartner = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate('pharmacyId customerId');
    if (!order) return null;

    // Find available delivery partner
    let partner = await DeliveryPartner.findOne({
      status: 'AVAILABLE',
      activeOrderId: null
    }).populate('userId');

    // Fallback: If no partner is strictly marked AVAILABLE, find any non-busy partner
    if (!partner) {
      partner = await DeliveryPartner.findOne({
        activeOrderId: null
      }).populate('userId');
    }

    if (!partner) {
      logger.warn(`No delivery partner available for order ${order.orderId}`);
      return null;
    }

    // Update partner status
    partner.status = 'BUSY';
    partner.activeOrderId = order._id;
    await partner.save();

    // Update order
    order.deliveryPartnerId = partner.userId._id;
    order.orderStatus = 'DELIVERY_ASSIGNED';
    order.statusHistory.push({
      status: 'DELIVERY_ASSIGNED',
      timestamp: new Date(),
      note: `Assigned to delivery partner ${partner.userId.name}`
    });
    await order.save();

    const io = getIO();

    const partnerPayload = {
      name: partner.userId.name,
      phone: partner.userId.phone,
      vehicleType: partner.vehicleType,
      vehicleNumber: partner.vehicleNumber,
      rating: partner.rating || 4.8,
      currentLocation: partner.currentLocation?.coordinates || [77.209, 28.6139]
    };

    // Broadcast to order tracking room, pharmacy room, and delivery user
    io.to(`order:${order._id}`).emit('order_status_changed', {
      orderId: order._id,
      orderNumber: order.orderId,
      status: 'DELIVERY_ASSIGNED',
      note: `Assigned to delivery partner ${partner.userId.name}`,
      deliveryPartner: partnerPayload
    });

    const pharmId = order.pharmacyId?._id || order.pharmacyId;
    if (pharmId) {
      io.to(`pharmacy:${pharmId}`).emit('order_status_changed', {
        orderId: order._id,
        orderNumber: order.orderId,
        status: 'DELIVERY_ASSIGNED',
        note: `Assigned to delivery partner ${partner.userId.name}`,
        deliveryPartner: partnerPayload
      });
    }

    io.to(`user:${partner.userId._id}`).emit('new_delivery_assigned', {
      orderId: order._id,
      orderNumber: order.orderId,
      pharmacyName: order.pharmacyId?.name || 'Pharmacy',
      deliveryAddress: order.deliveryAddress?.fullAddress || ''
    });

    // Notify Customer
    await sendNotification({
      userId: order.customerId._id,
      type: 'DELIVERY_ASSIGNED',
      title: 'Delivery Partner Assigned!',
      message: `${partner.userId.name} (${partner.vehicleNumber}) has been assigned to deliver your order ${order.orderId}.`,
      link: `/orders/${order._id}`
    });

    // Notify Delivery Partner
    await sendNotification({
      userId: partner.userId._id,
      type: 'DELIVERY_ASSIGNED',
      title: 'New Delivery Task Assigned',
      message: `Pickup from ${order.pharmacyId.name} and deliver to ${order.deliveryAddress.fullAddress}.`,
      link: `/delivery/active`
    });

    logger.info(
      `Delivery partner ${partner.userId.name} assigned to order ${order.orderId}`
    );
    return partner;
  } catch (error) {
    logger.error(`Error in autoAssignDeliveryPartner: ${error.message}`);
    return null;
  }
};

module.exports = {
  autoAssignDeliveryPartner
};
