const DeliveryPartner = require('../models/DeliveryPartner');
const Order = require('../models/Order');
const Pharmacy = require('../models/Pharmacy');
const { autoAssignDeliveryPartner } = require('../services/deliveryService');
const { getIO } = require('../config/socket');
const { sendNotification } = require('../services/notificationService');
const { logAction } = require('../services/auditService');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// @desc    Get delivery partner dashboard and active deliveries
// @route   GET /api/delivery/active
// @access  Private (DELIVERY_PARTNER)
const getActiveDelivery = async (req, res, next) => {
  try {
    const partner = await DeliveryPartner.findOne({ userId: req.user._id });
    if (!partner) {
      throw ApiError.notFound('Delivery partner profile not found.');
    }

    let activeOrder = null;
    if (partner.activeOrderId) {
      activeOrder = await Order.findById(partner.activeOrderId)
        .populate('customerId', 'name phone')
        .populate('pharmacyId');
    }

    // Also look for any assigned order if activeOrderId is unset
    if (!activeOrder) {
      activeOrder = await Order.findOne({
        deliveryPartnerId: req.user._id,
        orderStatus: { $in: ['DELIVERY_ASSIGNED', 'OUT_FOR_DELIVERY'] }
      })
        .populate('customerId', 'name phone')
        .populate('pharmacyId');
    }

    return ApiResponse.success(res, {
      partner,
      activeOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update status of active delivery (e.g. Out for delivery, Delivered)
// @route   POST /api/delivery/status
// @access  Private (DELIVERY_PARTNER)
const updateDeliveryTaskStatus = async (req, res, next) => {
  try {
    const { orderId, status, note } = req.body;

    const order = await Order.findById(orderId)
      .populate('customerId')
      .populate('pharmacyId');

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if (
      !order.deliveryPartnerId ||
      order.deliveryPartnerId.toString() !== req.user._id.toString()
    ) {
      throw ApiError.forbidden('You are not assigned to this delivery.');
    }

    if (!['OUT_FOR_DELIVERY', 'DELIVERED'].includes(status)) {
      throw ApiError.badRequest('Invalid status for delivery partner update.');
    }

    order.orderStatus = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Driver updated delivery state to ${status}`,
      updatedBy: req.user._id
    });
    await order.save();

    const partner = await DeliveryPartner.findOne({ userId: req.user._id });

    if (status === 'DELIVERED') {
      if (partner) {
        partner.status = 'AVAILABLE';
        partner.activeOrderId = null;
        partner.completedDeliveriesCount += 1;
        partner.totalEarnings += 40;
        await partner.save();
      }
    } else if (status === 'OUT_FOR_DELIVERY') {
      if (partner) {
        partner.status = 'BUSY';
        partner.activeOrderId = order._id;
        await partner.save();
      }
    }

    const io = getIO();
    io.to(`order:${order._id}`).emit('order_status_changed', {
      orderId: order._id,
      orderNumber: order.orderId,
      status,
      note
    });

    // Send customer notification
    await sendNotification({
      userId: order.customerId._id,
      type: `ORDER_${status}`,
      title:
        status === 'OUT_FOR_DELIVERY'
          ? 'Medicines Out for Delivery!'
          : 'Order Delivered Successfully',
      message:
        status === 'OUT_FOR_DELIVERY'
          ? 'Your delivery partner has picked up your medicine and is on the way.'
          : 'Your order has been delivered. Thank you for choosing QuickMeds!',
      link: `/orders/${order._id}`
    });

    return ApiResponse.success(res, { order, partner }, `Delivery marked as ${status}`);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle driver availability (AVAILABLE vs OFFLINE)
// @route   PUT /api/delivery/availability
// @access  Private (DELIVERY_PARTNER)
const toggleAvailability = async (req, res, next) => {
  try {
    const partner = await DeliveryPartner.findOne({ userId: req.user._id });
    if (!partner) {
      throw ApiError.notFound('Delivery profile not found');
    }

    partner.status = partner.status === 'OFFLINE' ? 'AVAILABLE' : 'OFFLINE';
    await partner.save();

    return ApiResponse.success(
      res,
      { partner },
      `Status changed to ${partner.status}`
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Update driver current GPS coordinates
// @route   POST /api/delivery/location
// @access  Private (DELIVERY_PARTNER)
const updateDriverLocation = async (req, res, next) => {
  try {
    const { coordinates, orderId } = req.body; // [lng, lat]
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      throw ApiError.badRequest('Valid coordinates [lng, lat] required');
    }

    const partner = await DeliveryPartner.findOne({ userId: req.user._id });
    if (partner) {
      partner.currentLocation = {
        type: 'Point',
        coordinates
      };
      await partner.save();
    }

    if (orderId) {
      const io = getIO();
      io.to(`order:${orderId}`).emit('driver_moved', {
        orderId,
        coordinates,
        timestamp: new Date().toISOString()
      });
    }

    return ApiResponse.success(res, { coordinates }, 'Location updated');
  } catch (error) {
    next(error);
  }
};

// @desc    Get delivery partner history and stats
// @route   GET /api/delivery/history
// @access  Private (DELIVERY_PARTNER)
const getDeliveryHistory = async (req, res, next) => {
  try {
    const orders = await Order.find({
      deliveryPartnerId: req.user._id,
      orderStatus: 'DELIVERED'
    })
      .populate('pharmacyId', 'name address')
      .populate('customerId', 'name phone')
      .sort({ updatedAt: -1 })
      .limit(30);

    const partner = await DeliveryPartner.findOne({ userId: req.user._id });

    return ApiResponse.success(res, {
      orders,
      stats: {
        completedCount: partner ? partner.completedDeliveriesCount : orders.length,
        totalEarnings: partner ? partner.totalEarnings : orders.length * 40,
        rating: partner ? partner.rating : 4.8
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Simulate next step in 8-state order delivery lifecycle with GPS waypoint progression
// @route   POST /api/delivery/simulation/step
// @access  Private (CUSTOMER, PHARMACY, DELIVERY_PARTNER, ADMIN)
const simulateDeliveryStep = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      throw ApiError.badRequest('orderId is required in request body');
    }

    const order = await Order.findById(orderId)
      .populate('customerId', 'name email phone')
      .populate('pharmacyId')
      .populate('deliveryPartnerId', 'name phone email')
      .populate('prescriptionId');

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    // Full 8-state delivery progression:
    // PLACED -> PHARMACY_REVIEW -> ACCEPTED -> PREPARING -> READY_FOR_PICKUP -> DELIVERY_ASSIGNED -> OUT_FOR_DELIVERY -> DELIVERED
    const ORDER_LIFECYCLE = [
      'PLACED',
      'PHARMACY_REVIEW',
      'ACCEPTED',
      'PREPARING',
      'READY_FOR_PICKUP',
      'DELIVERY_ASSIGNED',
      'OUT_FOR_DELIVERY',
      'DELIVERED'
    ];

    const currentStatus = order.orderStatus;
    if (['DELIVERED', 'REJECTED', 'CANCELLED'].includes(currentStatus)) {
      return ApiResponse.success(res, {
        order,
        nextStatus: currentStatus,
        isCompleted: true,
        message: `Order is already in final state: ${currentStatus}`
      });
    }

    let currentIndex = ORDER_LIFECYCLE.indexOf(currentStatus);
    let nextIndex = currentIndex === -1 ? 1 : currentIndex + 1;
    if (nextIndex >= ORDER_LIFECYCLE.length) {
      nextIndex = ORDER_LIFECYCLE.length - 1;
    }

    const nextStatus = ORDER_LIFECYCLE[nextIndex];

    const STEP_NOTES = {
      PHARMACY_REVIEW: 'Pharmacist received prescription & is validating batch availability.',
      ACCEPTED: 'Order confirmed and registered by pharmacy. Dispensation approved.',
      PREPARING: 'Pharmacist is assembling and packing medicines in a tamper-evident insulated package.',
      READY_FOR_PICKUP: 'Medicines packaged, sealed and waiting for delivery partner pickup.',
      DELIVERY_ASSIGNED: 'Nearest delivery partner assigned and dispatched to pickup location.',
      OUT_FOR_DELIVERY: 'Delivery partner picked up parcel and is navigating to delivery destination.',
      DELIVERED: 'Order successfully delivered to customer with digital handover verification.'
    };

    order.orderStatus = nextStatus;
    if (nextStatus === 'PHARMACY_REVIEW' && order.prescriptionId) {
      order.prescriptionStatus = 'PENDING_REVIEW';
    } else if (nextStatus === 'ACCEPTED') {
      if (order.prescriptionId) order.prescriptionStatus = 'APPROVED';
    }

    // Auto assign delivery partner if reaching READY_FOR_PICKUP or DELIVERY_ASSIGNED and none assigned yet
    let partner = null;
    if (['DELIVERY_ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(nextStatus)) {
      if (!order.deliveryPartnerId) {
        partner = await autoAssignDeliveryPartner(order._id);
        if (partner && partner.userId) {
          order.deliveryPartnerId = partner.userId._id;
        }
      }
    }

    if (!partner && order.deliveryPartnerId) {
      partner = await DeliveryPartner.findOne({
        userId: order.deliveryPartnerId._id || order.deliveryPartnerId
      }).populate('userId');
    }

    // Fallback: If no partner exists in DB, find any partner or assign one
    if (!partner && ['DELIVERY_ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(nextStatus)) {
      partner = await DeliveryPartner.findOne().populate('userId');
      if (partner) {
        order.deliveryPartnerId = partner.userId?._id || partner.userId;
        partner.status = nextStatus === 'DELIVERED' ? 'AVAILABLE' : 'BUSY';
        partner.activeOrderId = nextStatus === 'DELIVERED' ? null : order._id;
        await partner.save();
      }
    }

    // Compute simulated GPS coordinates along route
    const pCoords = order.pharmacyId?.location?.coordinates || [77.2195, 28.6328]; // [lng, lat]
    const cCoords = order.deliveryAddress?.coordinates || [77.214, 28.629]; // [lng, lat]

    let simulatedCoords = pCoords;
    if (nextStatus === 'DELIVERY_ASSIGNED') {
      // Driver near pharmacy
      simulatedCoords = [
        pCoords[0] + (Math.random() - 0.5) * 0.002,
        pCoords[1] + (Math.random() - 0.5) * 0.002
      ];
    } else if (nextStatus === 'OUT_FOR_DELIVERY') {
      // Driver midway between pharmacy and customer
      simulatedCoords = [
        (pCoords[0] + cCoords[0]) / 2 + 0.001,
        (pCoords[1] + cCoords[1]) / 2 + 0.001
      ];
    } else if (nextStatus === 'DELIVERED') {
      // Driver at customer location
      simulatedCoords = [cCoords[0], cCoords[1]];
    }

    if (partner) {
      partner.currentLocation = {
        type: 'Point',
        coordinates: simulatedCoords
      };
      if (nextStatus === 'DELIVERED') {
        partner.status = 'AVAILABLE';
        partner.activeOrderId = null;
        partner.completedDeliveriesCount = (partner.completedDeliveriesCount || 0) + 1;
        partner.totalEarnings = (partner.totalEarnings || 0) + 40;
      } else if (nextStatus === 'OUT_FOR_DELIVERY' || nextStatus === 'DELIVERY_ASSIGNED') {
        partner.status = 'BUSY';
        partner.activeOrderId = order._id;
      }
      await partner.save();
    }

    if (nextStatus === 'DELIVERED') {
      if (order.pharmacyId?._id) {
        await Pharmacy.findByIdAndUpdate(order.pharmacyId._id, {
          $inc: { totalOrdersCompleted: 1 }
        });
      }
    }

    order.statusHistory.push({
      status: nextStatus,
      timestamp: new Date(),
      note: STEP_NOTES[nextStatus] || `Order state advanced to ${nextStatus}`,
      updatedBy: req.user._id
    });

    await order.save();

    // Broadcast Socket.io events
    const io = getIO();
    io.to(`order:${order._id}`).emit('order_status_changed', {
      orderId: order._id,
      orderNumber: order.orderId,
      status: nextStatus,
      note: STEP_NOTES[nextStatus],
      deliveryPartner: partner
        ? {
            name: partner.userId?.name || 'QuickMeds Rider',
            phone: partner.userId?.phone || '+91 98765 43210',
            vehicleType: partner.vehicleType || 'Electric Scooter',
            vehicleNumber: partner.vehicleNumber || 'DL 01 QM 8822',
            currentLocation: simulatedCoords,
            rating: partner.rating || 4.9
          }
        : null
    });

    if (simulatedCoords) {
      io.to(`order:${order._id}`).emit('driver_moved', {
        orderId: order._id,
        coordinates: simulatedCoords,
        timestamp: new Date().toISOString()
      });
    }

    // Send notifications
    await sendNotification({
      userId: order.customerId._id || order.customerId,
      type: `ORDER_${nextStatus}`,
      title: `Order Update: ${nextStatus.replace(/_/g, ' ')}`,
      message: STEP_NOTES[nextStatus] || `Your order status is now ${nextStatus.replace(/_/g, ' ')}`,
      link: `/orders/${order._id}`
    });

    await logAction({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: `SIMULATION_STEP_${nextStatus}`,
      entity: 'ORDER',
      entityId: order._id.toString(),
      description: `Fast-forward simulated order ${order.orderId} to ${nextStatus}`
    });

    return ApiResponse.success(
      res,
      {
        order,
        nextStatus,
        previousStatus: currentStatus,
        isDelivered: nextStatus === 'DELIVERED',
        deliveryPartner: partner
          ? {
              name: partner.userId?.name || 'QuickMeds Rider',
              phone: partner.userId?.phone || '+91 98765 43210',
              vehicleType: partner.vehicleType || 'Electric Scooter',
              vehicleNumber: partner.vehicleNumber || 'DL 01 QM 8822',
              currentLocation: simulatedCoords,
              rating: partner.rating || 4.9
            }
          : null
      },
      `Simulated order step: ${nextStatus.replace(/_/g, ' ')}`
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveDelivery,
  updateDeliveryTaskStatus,
  toggleAvailability,
  updateDriverLocation,
  getDeliveryHistory,
  simulateDeliveryStep
};
