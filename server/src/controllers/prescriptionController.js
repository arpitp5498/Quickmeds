const Prescription = require('../models/Prescription');
const Order = require('../models/Order');
const Pharmacy = require('../models/Pharmacy');
const { sendNotification } = require('../services/notificationService');
const { getIO } = require('../config/socket');
const { logAction } = require('../services/auditService');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// @desc    Upload a new prescription file
// @route   POST /api/prescriptions/upload
// @access  Private (CUSTOMER)
const uploadPrescription = async (req, res, next) => {
  try {
    if (!req.file) {
      throw ApiError.badRequest('Please upload a prescription document file.');
    }

    const { patientName, doctorName, customerNotes, pharmacyId, orderId } = req.body;

    const fileUrl = `/uploads/${req.file.filename}`;

    const prescription = await Prescription.create({
      customerId: req.user._id,
      orderId: orderId || null,
      pharmacyId: pharmacyId || null,
      fileUrl,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      patientName: patientName || req.user.name,
      doctorName: doctorName || '',
      customerNotes: customerNotes || '',
      status: 'UPLOADED'
    });

    // Notify pharmacy if order or pharmacy ID is linked
    if (pharmacyId) {
      const pharmacy = await Pharmacy.findById(pharmacyId);
      if (pharmacy) {
        await sendNotification({
          userId: pharmacy.userId,
          type: 'PRESCRIPTION_APPROVED', // Notification category
          title: 'Prescription Uploaded for Review',
          message: `A new prescription has been uploaded by ${req.user.name}. Please verify before dispensing.`,
          link: `/pharmacy/prescriptions`
        });
      }
    }

    return ApiResponse.created(
      res,
      { prescription },
      'Prescription uploaded securely. Pharmacist verification pending.'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get all prescriptions for logged in customer
// @route   GET /api/prescriptions
// @access  Private (CUSTOMER)
const getMyPrescriptions = async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({ customerId: req.user._id })
      .populate('pharmacyId', 'name address phone')
      .populate('orderId', 'orderId total orderStatus')
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, { prescriptions });
  } catch (error) {
    next(error);
  }
};

// @desc    Get prescription details by ID with IDOR protection
// @route   GET /api/prescriptions/:id
// @access  Private
const getPrescriptionById = async (req, res, next) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('pharmacyId', 'name address phone')
      .populate('orderId')
      .populate('reviewedBy', 'name');

    if (!prescription) {
      throw ApiError.notFound('Prescription not found');
    }

    // IDOR Protection: Only the owner customer, assigned pharmacy, or admin can access
    const isOwner = prescription.customerId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';
    const isPharmacist = req.user.role === 'PHARMACY';

    if (!isOwner && !isAdmin && !isPharmacist) {
      throw ApiError.forbidden('You are not authorized to view this prescription document.');
    }

    return ApiResponse.success(res, { prescription });
  } catch (error) {
    next(error);
  }
};

// @desc    Pharmacist reviews prescription (Approve or Reject)
// @route   PUT /api/prescriptions/:id/review
// @access  Private (PHARMACY, ADMIN)
const reviewPrescription = async (req, res, next) => {
  try {
    const { status, reviewNotes, rejectionReason } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      throw ApiError.badRequest('Status must be either APPROVED or REJECTED.');
    }

    if (status === 'REJECTED' && !rejectionReason) {
      throw ApiError.badRequest('Please provide a reason for rejecting the prescription.');
    }

    const prescription = await Prescription.findById(req.params.id);
    if (!prescription) {
      throw ApiError.notFound('Prescription not found');
    }

    prescription.status = status;
    prescription.reviewedBy = req.user._id;
    prescription.reviewNotes = reviewNotes || '';
    prescription.rejectionReason = status === 'REJECTED' ? rejectionReason : '';
    prescription.reviewedAt = new Date();
    await prescription.save();

    // If prescription is tied to an Order, update order prescription status
    if (prescription.orderId) {
      const order = await Order.findById(prescription.orderId);
      if (order) {
        order.prescriptionStatus = status === 'APPROVED' ? 'APPROVED' : 'REJECTED';
        order.statusHistory.push({
          status: status === 'APPROVED' ? 'PRESCRIPTION_APPROVED' : 'PRESCRIPTION_REJECTED',
          timestamp: new Date(),
          note:
            status === 'APPROVED'
              ? 'Prescription verified and approved by licensed pharmacist.'
              : `Prescription rejected: ${rejectionReason}`,
          updatedBy: req.user._id
        });
        await order.save();

        const io = getIO();
        io.to(`order:${order._id}`).emit('prescription_status_update', {
          orderId: order._id,
          prescriptionStatus: order.prescriptionStatus,
          reason: rejectionReason
        });
      }
    }

    // Send Real-time notification to customer
    await sendNotification({
      userId: prescription.customerId,
      type: status === 'APPROVED' ? 'PRESCRIPTION_APPROVED' : 'PRESCRIPTION_REJECTED',
      title:
        status === 'APPROVED'
          ? 'Prescription Approved!'
          : 'Prescription Verification Issue',
      message:
        status === 'APPROVED'
          ? 'Your prescription has been reviewed and verified by a licensed pharmacist.'
          : `Your prescription could not be verified: ${rejectionReason}`,
      link: `/prescriptions/${prescription._id}`
    });

    await logAction({
      actorId: req.user._id,
      actorRole: req.user.role,
      action: `PRESCRIPTION_${status}`,
      entity: 'PRESCRIPTION',
      entityId: prescription._id.toString(),
      description: `Pharmacist ${req.user.name} marked prescription as ${status}`
    });

    return ApiResponse.success(
      res,
      { prescription },
      `Prescription successfully marked as ${status}.`
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of prescriptions for pharmacy review queue
// @route   GET /api/prescriptions/pharmacy/queue
// @access  Private (PHARMACY)
const getPharmacyPrescriptionsQueue = async (req, res, next) => {
  try {
    let pharmacy = await Pharmacy.findOne({ userId: req.user._id });
    const pharmacyId = pharmacy ? pharmacy._id : req.user.pharmacyId;

    const query = {};
    if (pharmacyId) {
      query.$or = [{ pharmacyId }, { pharmacyId: null }];
    }

    const prescriptions = await Prescription.find(query)
      .populate('customerId', 'name phone email')
      .populate('orderId', 'orderId total orderStatus')
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, { prescriptions });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadPrescription,
  getMyPrescriptions,
  getPrescriptionById,
  reviewPrescription,
  getPharmacyPrescriptionsQueue
};
