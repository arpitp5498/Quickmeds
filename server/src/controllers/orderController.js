const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Pharmacy = require('../models/Pharmacy');
const Prescription = require('../models/Prescription');
const DeliveryPartner = require('../models/DeliveryPartner');
const generateOrderId = require('../utils/generateOrderId');
const { calculateDistance, calculateDeliveryFee, estimateDeliveryTime } = require('../utils/geo');
const {
  validateStatusTransition,
  decrementInventory,
  restoreInventory,
  executeFallbackReassignment
} = require('../services/orderService');
const { autoAssignDeliveryPartner } = require('../services/deliveryService');
const { sendNotification, notifyAdmins } = require('../services/notificationService');
const { logAction } = require('../services/auditService');
const { findNearestPharmacyWithStock } = require('../services/pharmacyMatchService');
const { optimizeFulfilmentPlan } = require('../services/smartRoutingService');
const { getIO } = require('../config/socket');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// @desc    Create a new order from cart / checkout
// @route   POST /api/orders
// @access  Private (CUSTOMER)
const createOrder = async (req, res, next) => {
  try {
    const {
      pharmacyId,
      deliveryAddress,
      prescriptionId,
      paymentMethod = 'COD',
      customerNotes
    } = req.body;

    const cart = await Cart.findOne({ customerId: req.user._id });
    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest('Your cart is empty. Please add items before checking out.');
    }

    // Automatically determine optimal pharmacy via QuickMeds Smart Fulfilment Engine
    const customerCoords = deliveryAddress?.coordinates || null;
    const optimization = await optimizeFulfilmentPlan(cart.items, customerCoords);

    let orderPharmacyId = null;
    let pharmacy = null;
    let routingExplanation = 'QuickMeds Smart Fulfilment Engine automatically selected the optimal licensed pharmacy.';

    if (optimization?.recommended?.pharmacies?.length > 0) {
      const recPharm = optimization.recommended.pharmacies[0];
      orderPharmacyId = recPharm._id || recPharm.pharmacyId;
      pharmacy = await Pharmacy.findById(orderPharmacyId);
      routingExplanation = optimization.recommended.explanation || optimization.explanation || routingExplanation;
    } else if (pharmacyId || cart.pharmacyId) {
      orderPharmacyId = pharmacyId || cart.pharmacyId;
      pharmacy = await Pharmacy.findById(orderPharmacyId);
    } else {
      pharmacy = await findNearestPharmacyWithStock(cart.items, customerCoords);
      if (pharmacy) orderPharmacyId = pharmacy._id;
    }

    if (!pharmacy || pharmacy.verificationStatus !== 'VERIFIED') {
      throw ApiError.badRequest('No nearby verified pharmacy currently has stock to fulfil your complete order. Please try again shortly.');
    }

    // Check if any item in cart requires prescription
    const hasRxItem = cart.items.some((i) => i.requiresPrescription);
    if (hasRxItem && !prescriptionId) {
      throw ApiError.badRequest(
        'One or more items in your order require a valid prescription. Please upload or attach a prescription.'
      );
    }

    // Calculate distance & delivery fee
    let distanceKm = 2.5;
    if (deliveryAddress.coordinates && pharmacy.location) {
      const [uLng, uLat] = deliveryAddress.coordinates;
      const [pLng, pLat] = pharmacy.location.coordinates;
      distanceKm = calculateDistance(uLat, uLng, pLat, pLng);
    }

    const deliveryFee = calculateDeliveryFee(distanceKm);
    const eta = estimateDeliveryTime(distanceKm);
    const platformFee = 5; // Safety & Packaging charge
    const subtotal = cart.subtotal;
    const total = subtotal + deliveryFee + platformFee;

    // Validate and atomically decrement inventory stock
    await decrementInventory(orderPharmacyId, cart.items);

    const orderNumber = generateOrderId();
    const initialStatus = hasRxItem ? 'PHARMACY_REVIEW' : 'PLACED';
    const rxStatus = hasRxItem ? 'PENDING_REVIEW' : 'NOT_REQUIRED';

    const order = await Order.create({
      orderId: orderNumber,
      customerId: req.user._id,
      pharmacyId: orderPharmacyId,
      items: cart.items,
      subtotal,
      deliveryFee,
      platformFee,
      total,
      deliveryAddress,
      prescriptionId: prescriptionId || null,
      prescriptionStatus: rxStatus,
      paymentMethod,
      paymentStatus: paymentMethod === 'ONLINE' ? 'PAID' : 'PENDING',
      orderStatus: initialStatus,
      distanceKm,
      estimatedDeliveryMinutes: eta.totalMinutes,
      statusHistory: [
        {
          status: initialStatus,
          timestamp: new Date(),
          note: hasRxItem
            ? 'Order placed. Awaiting pharmacist prescription verification.'
            : 'Order placed successfully.',
          updatedBy: req.user._id
        }
      ]
    });

    // If prescription exists, link order to it
    if (prescriptionId) {
      await Prescription.findByIdAndUpdate(prescriptionId, {
        orderId: order._id,
        pharmacyId: orderPharmacyId,
        status: 'UNDER_REVIEW'
      });
    }

    // Clear cart after order placement
    cart.items = [];
    cart.pharmacyId = null;
    cart.calculateTotals();
    await cart.save();

    // Socket.IO Notifications
    const io = getIO();

    // Notify Pharmacy
    io.to(`pharmacy:${orderPharmacyId}`).emit('new_order_received', {
      orderId: order._id,
      orderNumber: order.orderId,
      total: order.total,
      hasPrescription: hasRxItem
    });

    await sendNotification({
      userId: pharmacy.userId,
      type: 'ORDER_PLACED',
      title: `New Order Received (${order.orderId})`,
      message: `You have received a new order for ₹${order.total}. Please review and prepare.`,
      link: `/pharmacy/orders/${order._id}`
    });

    // Notify Admin
    notifyAdmins({
      type: 'NEW_ORDER',
      title: 'New Order Placed on QuickMeds',
      message: `Order ${order.orderId} placed for pharmacy ${pharmacy.name} (₹${order.total}).`,
      link: `/admin/orders`
    });

    await logAction({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: 'ORDER_CREATED',
      entity: 'ORDER',
      entityId: order._id.toString(),
      description: `Customer placed order ${order.orderId} for ₹${order.total}`
    });

    return ApiResponse.created(
      res,
      { order },
      'Order placed successfully! The pharmacy has been notified.'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer's orders history
// @route   GET /api/orders
// @access  Private (CUSTOMER)
const getMyOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { customerId: req.user._id };

    if (status && status !== 'ALL') {
      query.orderStatus = status;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('pharmacyId', 'name address phone rating logo')
      .populate('deliveryPartnerId', 'name phone')
      .populate('prescriptionId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return ApiResponse.success(res, {
      orders,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complete order details by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email phone avatar')
      .populate('pharmacyId')
      .populate('deliveryPartnerId', 'name phone')
      .populate('prescriptionId')
      .populate('statusHistory.updatedBy', 'name role');

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    // Role-based authorization check
    const isCustomer = order.customerId._id.toString() === req.user._id.toString();
    const isPharmacy =
      req.user.pharmacyId &&
      order.pharmacyId &&
      order.pharmacyId._id.toString() === req.user.pharmacyId.toString();
    const isDelivery =
      order.deliveryPartnerId &&
      order.deliveryPartnerId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isCustomer && !isPharmacy && !isDelivery && !isAdmin) {
      throw ApiError.forbidden('You are not authorized to view this order.');
    }

    // Fetch delivery partner location if in transit
    let deliveryPartnerDetails = null;
    if (order.deliveryPartnerId) {
      const partner = await DeliveryPartner.findOne({
        userId: order.deliveryPartnerId._id
      }).populate('userId', 'name phone');

      if (partner) {
        deliveryPartnerDetails = {
          name: partner.userId.name,
          phone: partner.userId.phone,
          vehicleType: partner.vehicleType,
          vehicleNumber: partner.vehicleNumber,
          currentLocation: partner.currentLocation.coordinates,
          rating: partner.rating
        };
      }
    }

    return ApiResponse.success(res, {
      order,
      deliveryPartner: deliveryPartnerDetails
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pharmacy's assigned incoming orders
// @route   GET /api/orders/pharmacy/list
// @access  Private (PHARMACY)
const getPharmacyOrders = async (req, res, next) => {
  try {
    let pharmacy = await Pharmacy.findOne({ userId: req.user._id });
    const pharmacyId = pharmacy ? pharmacy._id : req.user.pharmacyId;

    if (!pharmacyId) {
      throw ApiError.notFound('Pharmacy account not found.');
    }

    const { status, page = 1, limit = 50 } = req.query;
    const query = { pharmacyId };

    if (status && status !== 'ALL') {
      if (status === 'ACTIVE') {
        query.orderStatus = {
          $in: ['PLACED', 'PHARMACY_REVIEW', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP']
        };
      } else {
        query.orderStatus = status;
      }
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('customerId', 'name phone email')
      .populate('deliveryPartnerId', 'name phone')
      .populate('prescriptionId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return ApiResponse.success(res, {
      orders,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status in state machine
// @route   PATCH /api/orders/:id/status
// @access  Private (PHARMACY, DELIVERY_PARTNER, ADMIN)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note = '', rejectionReason = '' } = req.body;
    const order = await Order.findById(req.params.id)
      .populate('customerId')
      .populate('pharmacyId');

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    // ─── PHARMACY REJECTION → AUTOMATIC FALLBACK REROUTING ───
    // When a pharmacy rejects, DO NOT finalize the order as REJECTED.
    // Instead, record the rejection event and trigger fallback routing.
    if (status === 'REJECTED') {
      // Validate the transition is allowed from current state
      validateStatusTransition(order.orderStatus, status);

      // Authorization: verify the rejecting user is linked to the assigned pharmacy
      if (req.user.role === 'PHARMACY') {
        const assignedPharmacyId = (order.pharmacyId?._id || order.pharmacyId).toString();
        const userPharmacy = await Pharmacy.findOne({ userId: req.user._id });
        if (!userPharmacy || userPharmacy._id.toString() !== assignedPharmacyId) {
          throw ApiError.forbidden('You can only reject orders assigned to your pharmacy.');
        }
      }

      const rejectingPharmacyName = order.pharmacyId?.name || 'Pharmacy';
      const rejectingPharmacyId = order.pharmacyId?._id || order.pharmacyId;
      const reason = rejectionReason || 'Rejected by pharmacy';

      // Record the rejection as a STATUS HISTORY EVENT (not a final orderStatus change)
      order.rejectionReason = reason;
      order.statusHistory.push({
        status: 'PHARMACY_REJECTED',
        timestamp: new Date(),
        note: `${rejectingPharmacyName} rejected this order: ${reason}`,
        updatedBy: req.user._id
      });
      await order.save();

      // Log the rejection in audit trail
      await logAction({
        actorId: req.user._id,
        actorRole: req.user.role,
        action: 'PHARMACY_REJECTED',
        entity: 'ORDER',
        entityId: order._id.toString(),
        description: `${rejectingPharmacyName} rejected order ${order.orderId}: ${reason}`,
        metadata: {
          rejectedPharmacyId: rejectingPharmacyId.toString(),
          rejectedPharmacyName: rejectingPharmacyName,
          rejectionReason: reason
        }
      });

      // Attempt fallback rerouting using the EXISTING engine
      try {
        const updatedOrder = await executeFallbackReassignment(order._id, 'PHARMACY_REJECTED');

        // Fallback succeeded — order has been reassigned to a new pharmacy
        const newPharmacy = await Pharmacy.findById(updatedOrder.pharmacyId);
        const newPharmacyName = newPharmacy?.name || 'Next Pharmacy';

        return ApiResponse.success(
          res,
          {
            order: updatedOrder,
            fallback: {
              triggered: true,
              previousPharmacy: rejectingPharmacyName,
              previousPharmacyId: rejectingPharmacyId,
              newPharmacy: newPharmacyName,
              newPharmacyId: updatedOrder.pharmacyId,
              attempt: updatedOrder.fallbackAttempt,
              reason: 'PHARMACY_REJECTED'
            }
          },
          `Pharmacy rejected the order. QuickMeds automatically reassigned it to ${newPharmacyName}.`
        );
      } catch (fallbackErr) {
        // Fallback FAILED — no eligible pharmacy available
        // NOW restore inventory for the rejecting pharmacy and finalize the order
        await restoreInventory(rejectingPharmacyId, order.items);

        // Reload the order (fallback may have partially modified it)
        const failedOrder = await Order.findById(order._id)
          .populate('customerId')
          .populate('pharmacyId');

        failedOrder.orderStatus = 'FULFILMENT_UNAVAILABLE';
        failedOrder.statusHistory.push({
          status: 'FULFILMENT_UNAVAILABLE',
          timestamp: new Date(),
          note: `No eligible pharmacy could fulfil this order after ${failedOrder.fallbackAttempt || 0} fallback attempt(s). Last rejection by ${rejectingPharmacyName}.`,
          updatedBy: req.user._id
        });
        failedOrder.fallbackLock = false;
        await failedOrder.save();

        // Emit socket event for customer
        try {
          const io = getIO();
          io.to(`order:${failedOrder._id}`).emit('order_status_changed', {
            orderId: failedOrder._id,
            orderNumber: failedOrder.orderId,
            status: 'FULFILMENT_UNAVAILABLE',
            note: 'No eligible pharmacy could fulfil this order.'
          });
        } catch (socketErr) { /* non-critical */ }

        // Notify customer
        try {
          await sendNotification({
            userId: failedOrder.customerId?._id || failedOrder.customerId,
            type: 'ORDER_FULFILMENT_UNAVAILABLE',
            title: `Order ${failedOrder.orderId} — Fulfilment Unavailable`,
            message: `We were unable to find an eligible pharmacy to fulfil your order. Please try again or contact support.`,
            link: `/orders/${failedOrder._id}`
          });
        } catch (notifErr) { /* non-critical */ }

        // Audit log
        await logAction({
          actorId: req.user._id,
          actorRole: 'SYSTEM',
          action: 'ORDER_FULFILMENT_UNAVAILABLE',
          entity: 'ORDER',
          entityId: failedOrder._id.toString(),
          description: `Order ${failedOrder.orderId} marked FULFILMENT_UNAVAILABLE after all fallback attempts exhausted.`
        });

        return ApiResponse.success(
          res,
          {
            order: failedOrder,
            fallback: {
              triggered: true,
              exhausted: true,
              previousPharmacy: rejectingPharmacyName,
              reason: 'NO_ELIGIBLE_PHARMACY'
            }
          },
          `Pharmacy rejected. No other eligible pharmacy available. Order marked as fulfilment unavailable.`
        );
      }
    }
    // ─── END PHARMACY REJECTION FALLBACK FLOW ───

    // ─── ALL OTHER STATUS TRANSITIONS (ACCEPTED, PREPARING, etc.) ───
    validateStatusTransition(order.orderStatus, status);

    const prevStatus = order.orderStatus;
    order.orderStatus = status;

    if (status === 'CANCELLED') {
      order.cancellationReason = note || 'Cancelled';
      await restoreInventory(order.pharmacyId._id, order.items);
    }

    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated from ${prevStatus} to ${status}`,
      updatedBy: req.user._id
    });

    await order.save();

    const io = getIO();

    const statusPayload = {
      orderId: order._id,
      orderNumber: order.orderId,
      status,
      previousStatus: prevStatus,
      note: note || `Status updated from ${prevStatus} to ${status}`
    };

    // Broadcast status change across all relevant channels
    io.to(`order:${order._id}`).emit('order_status_changed', statusPayload);
    io.to(`pharmacy:${order.pharmacyId._id}`).emit('order_status_changed', statusPayload);
    io.to(`user:${order.customerId._id}`).emit('order_status_changed', statusPayload);
    if (order.deliveryPartnerId) {
      io.to(`user:${order.deliveryPartnerId}`).emit('order_status_changed', statusPayload);
    }
    io.to('admin:room').emit('order_status_changed', statusPayload);

    // If order is marked READY_FOR_PICKUP or ACCEPTED, auto-assign delivery partner
    if (status === 'READY_FOR_PICKUP' || (status === 'ACCEPTED' && !order.deliveryPartnerId)) {
      await autoAssignDeliveryPartner(order._id);
    }

    // If marked DELIVERED, update pharmacy completed orders & delivery partner status
    if (status === 'DELIVERED') {
      await Pharmacy.findByIdAndUpdate(order.pharmacyId._id, {
        $inc: { totalOrdersCompleted: 1 }
      });

      if (order.deliveryPartnerId) {
        await DeliveryPartner.findOneAndUpdate(
          { userId: order.deliveryPartnerId },
          {
            status: 'AVAILABLE',
            activeOrderId: null,
            $inc: { completedDeliveriesCount: 1, totalEarnings: 40 }
          }
        );
      }
    }

    // Notify Customer
    const statusMessages = {
      ACCEPTED: 'Your order has been accepted and is confirmed by the pharmacy!',
      PREPARING: 'The pharmacist is now preparing and packaging your medicines.',
      READY_FOR_PICKUP: 'Your medicines are packaged and ready for pickup by the delivery agent.',
      OUT_FOR_DELIVERY: 'Your order is out for delivery! The delivery partner is on the way.',
      DELIVERED: 'Your order has been successfully delivered. Please take medicines as directed.'
    };

    if (statusMessages[status]) {
      await sendNotification({
        userId: order.customerId._id,
        type: `ORDER_${status}`,
        title: `Order Update (${order.orderId})`,
        message: statusMessages[status],
        link: `/orders/${order._id}`
      });
    }

    await logAction({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: `ORDER_${status}`,
      entity: 'ORDER',
      entityId: order._id.toString(),
      description: `Order ${order.orderId} transitioned to ${status}`
    });

    return ApiResponse.success(res, { order }, `Order status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

// @desc    Customer cancels an order
// @route   POST /api/orders/:id/cancel
// @access  Private (CUSTOMER)
const cancelOrder = async (req, res, next) => {
  try {
    const { reason = 'Customer requested cancellation' } = req.body;
    const order = await Order.findOne({
      _id: req.params.id,
      customerId: req.user._id
    }).populate('pharmacyId');

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if (!['PLACED', 'PHARMACY_REVIEW'].includes(order.orderStatus)) {
      throw ApiError.badRequest(
        'Order cannot be cancelled once accepted or being prepared by the pharmacy. Please contact support.'
      );
    }

    order.orderStatus = 'CANCELLED';
    order.cancellationReason = reason;
    order.statusHistory.push({
      status: 'CANCELLED',
      timestamp: new Date(),
      note: `Cancelled by customer: ${reason}`,
      updatedBy: req.user._id
    });
    await order.save();

    // Restore inventory stock
    await restoreInventory(order.pharmacyId._id, order.items);

    const io = getIO();
    io.to(`order:${order._id}`).emit('order_status_changed', {
      orderId: order._id,
      orderNumber: order.orderId,
      status: 'CANCELLED',
      reason
    });

    // Notify Pharmacy
    await sendNotification({
      userId: order.pharmacyId.userId,
      type: 'ORDER_CANCELLED',
      title: `Order Cancelled (${order.orderId})`,
      message: `Customer cancelled order ${order.orderId}. Reserved stock has been restored.`,
      link: `/pharmacy/orders/${order._id}`
    });

    return ApiResponse.success(res, { order }, 'Order cancelled successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Simulate pharmacy confirmation timeout and trigger fallback
// @route   POST /api/orders/:id/simulate-timeout or POST /api/orders/:id/fallback-timeout
// @access  Private (CUSTOMER, PHARMACY, ADMIN)
const simulateTimeout = async (req, res, next) => {
  try {
    const { reason = 'PHARMACY_CONFIRMATION_TIMEOUT' } = req.body || {};
    const updatedOrder = await executeFallbackReassignment(req.params.id, reason);
    return ApiResponse.success(
      res,
      { order: updatedOrder },
      'Fallback routing executed successfully. Order reassigned to candidate pharmacy.'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getPharmacyOrders,
  updateOrderStatus,
  cancelOrder,
  simulateTimeout
};
