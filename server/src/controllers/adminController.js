const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const Order = require('../models/Order');
const Prescription = require('../models/Prescription');
const DeliveryPartner = require('../models/DeliveryPartner');
const AuditLog = require('../models/AuditLog');
const { getDashboardStats } = require('../services/adminService');
const { sendNotification } = require('../services/notificationService');
const { logAction } = require('../services/auditService');
const { getIO } = require('../config/socket');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// @desc    Get admin dashboard metrics & charts
// @route   GET /api/admin/dashboard
// @access  Private (ADMIN)
const getDashboard = async (req, res, next) => {
  try {
    const data = await getDashboardStats();
    return ApiResponse.success(res, data);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with search and role filters
// @route   GET /api/admin/users
// @access  Private (ADMIN)
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role && role !== 'ALL') {
      query.role = role;
    }

    if (status) {
      query.isActive = status === 'active';
    }

    if (search) {
      const s = new RegExp(search.trim(), 'i');
      query.$or = [{ name: s }, { email: s }, { phone: s }];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .populate('pharmacyId', 'name verificationStatus')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return ApiResponse.success(res, {
      users,
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

// @desc    Suspend or Reactivate a user account
// @route   PATCH /api/admin/users/:id/status
// @access  Private (ADMIN)
const toggleUserStatus = async (req, res, next) => {
  try {
    const { isActive, reason = '' } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (user.role === 'ADMIN' && req.user._id.toString() === user._id.toString()) {
      throw ApiError.badRequest('You cannot deactivate your own admin account.');
    }

    user.isActive = isActive;
    await user.save();

    await logAction({
      actorId: req.user._id,
      actorRole: 'ADMIN',
      action: isActive ? 'USER_REACTIVATED' : 'USER_SUSPENDED',
      entity: 'USER',
      entityId: user._id.toString(),
      description: `Admin ${isActive ? 'reactivated' : 'suspended'} user ${user.email}. Reason: ${reason}`
    });

    return ApiResponse.success(
      res,
      { user },
      `User account ${isActive ? 'activated' : 'suspended'} successfully`
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get all pharmacies with verification status filter
// @route   GET /api/admin/pharmacies
// @access  Private (ADMIN)
const getAllPharmacies = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.verificationStatus = status;
    }

    if (search) {
      const s = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: s },
        { licenseNumber: s },
        { 'address.city': s },
        { email: s }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Pharmacy.countDocuments(query);
    const pharmacies = await Pharmacy.find(query)
      .populate('userId', 'name email phone isActive')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return ApiResponse.success(res, {
      pharmacies,
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

// @desc    Verify, Reject, or Suspend a pharmacy partner
// @route   PATCH /api/admin/pharmacies/:id/verify
// @access  Private (ADMIN)
const verifyPharmacy = async (req, res, next) => {
  try {
    const { status, notes = '' } = req.body;

    if (!['VERIFIED', 'REJECTED', 'SUSPENDED', 'PENDING'].includes(status)) {
      throw ApiError.badRequest('Invalid verification status');
    }

    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) {
      throw ApiError.notFound('Pharmacy not found');
    }

    pharmacy.verificationStatus = status;
    pharmacy.verificationNotes = notes;
    if (status === 'VERIFIED') {
      pharmacy.verifiedAt = new Date();
      pharmacy.verifiedBy = req.user._id;
    }
    await pharmacy.save();

    // Send Real-time notification to Pharmacy owner
    await sendNotification({
      userId: pharmacy.userId,
      type: status === 'VERIFIED' ? 'PHARMACY_VERIFIED' : 'PHARMACY_REJECTED',
      title:
        status === 'VERIFIED'
          ? 'Pharmacy Verified! 🎉'
          : `Pharmacy Application Status: ${status}`,
      message:
        status === 'VERIFIED'
          ? 'Your pharmacy license has been verified. You can now receive online customer orders on QuickMeds!'
          : `Pharmacy status updated to ${status}. Note: ${notes}`,
      link: `/pharmacy`
    });

    await logAction({
      actorId: req.user._id,
      actorRole: 'ADMIN',
      action: `PHARMACY_${status}`,
      entity: 'PHARMACY',
      entityId: pharmacy._id.toString(),
      description: `Admin verified pharmacy "${pharmacy.name}" as ${status}`
    });

    return ApiResponse.success(
      res,
      { pharmacy },
      `Pharmacy status successfully updated to ${status}`
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders across the entire platform
// @route   GET /api/admin/orders
// @access  Private (ADMIN)
const getAllOrders = async (req, res, next) => {
  try {
    const { status, pharmacyId, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.orderStatus = status;
    }

    if (pharmacyId) {
      query.pharmacyId = pharmacyId;
    }

    if (search) {
      query.orderId = new RegExp(search.trim(), 'i');
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('customerId', 'name email phone')
      .populate('pharmacyId', 'name phone address')
      .populate('deliveryPartnerId', 'name phone')
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

// @desc    Get all prescriptions across the platform
// @route   GET /api/admin/prescriptions
// @access  Private (ADMIN)
const getAllPrescriptions = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Prescription.countDocuments(query);
    const prescriptions = await Prescription.find(query)
      .populate('customerId', 'name email phone')
      .populate('pharmacyId', 'name')
      .populate('orderId', 'orderId total')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return ApiResponse.success(res, {
      prescriptions,
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

// @desc    Get platform audit logs
// @route   GET /api/admin/audit-logs
// @access  Private (ADMIN)
const getAuditLogs = async (req, res, next) => {
  try {
    const { entity, page = 1, limit = 50 } = req.query;
    const query = {};

    if (entity && entity !== 'ALL') {
      query.entity = entity;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('actorId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return ApiResponse.success(res, {
      logs,
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

// @desc    Admin manually assigns a delivery partner to an order
// @route   POST /api/admin/orders/:id/assign-delivery
// @access  Private (ADMIN)
const assignDeliveryPartnerManual = async (req, res, next) => {
  try {
    const { deliveryPartnerUserId } = req.body;
    const order = await Order.findById(req.params.id).populate('pharmacyId customerId');

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    const partner = await DeliveryPartner.findOne({ userId: deliveryPartnerUserId }).populate(
      'userId',
      'name phone'
    );
    if (!partner) {
      throw ApiError.notFound('Delivery partner not found');
    }

    partner.status = 'BUSY';
    partner.activeOrderId = order._id;
    await partner.save();

    order.deliveryPartnerId = partner.userId._id;
    order.orderStatus = 'DELIVERY_ASSIGNED';
    order.statusHistory.push({
      status: 'DELIVERY_ASSIGNED',
      timestamp: new Date(),
      note: `Manually assigned to delivery partner ${partner.userId.name} by Admin`,
      updatedBy: req.user._id
    });
    await order.save();

    const io = getIO();
    io.to(`order:${order._id}`).emit('order_status_changed', {
      orderId: order._id,
      orderNumber: order.orderId,
      status: 'DELIVERY_ASSIGNED',
      deliveryPartner: {
        name: partner.userId.name,
        phone: partner.userId.phone,
        vehicleType: partner.vehicleType,
        vehicleNumber: partner.vehicleNumber
      }
    });

    await sendNotification({
      userId: order.customerId._id,
      type: 'DELIVERY_ASSIGNED',
      title: 'Delivery Partner Assigned!',
      message: `${partner.userId.name} (${partner.vehicleNumber}) has been assigned to deliver your order ${order.orderId}.`,
      link: `/orders/${order._id}`
    });

    return ApiResponse.success(res, { order }, 'Delivery partner assigned successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getAllUsers,
  toggleUserStatus,
  getAllPharmacies,
  verifyPharmacy,
  getAllOrders,
  getAllPrescriptions,
  getAuditLogs,
  assignDeliveryPartnerManual
};
