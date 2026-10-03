const Doctor = require('../models/Doctor');
const Consultation = require('../models/Consultation');
const Prescription = require('../models/Prescription');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const { sendNotification } = require('../services/notificationService');
const { getIO } = require('../config/socket');

// @desc    Get doctors list with search, filter, pagination
// @route   GET /api/consultations/doctors
// @access  Public
exports.getDoctors = async (req, res, next) => {
  try {
    const { specialty, search, language, minFee, maxFee, page = 1, limit = 20 } = req.query;

    // Records created before isActive existed have no such field; treat them as active.
    // Only verified doctors (or legacy records predating the verification field) are listed.
    const conditions = [
      { isActive: { $ne: false } },
      { $or: [{ verificationStatus: 'VERIFIED' }, { verificationStatus: { $exists: false } }] }
    ];

    if (specialty) {
      conditions.push({ specialty });
    }
    if (search) {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const s = new RegExp(escaped, 'i');
      conditions.push({ $or: [{ name: s }, { specialty: s }, { qualification: s }] });
    }
    if (language) {
      const escapedLang = language.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      conditions.push({ languages: { $in: [new RegExp(escapedLang, 'i')] } });
    }
    if (minFee || maxFee) {
      const fee = {};
      if (minFee) fee.$gte = Number(minFee);
      if (maxFee) fee.$lte = Number(maxFee);
      conditions.push({ fee });
    }

    const query = { $and: conditions };

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Doctor.countDocuments(query);
    const doctors = await Doctor.find(query)
      .sort({ rating: -1, experience: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return ApiResponse.success(res, {
      doctors,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor by ID
// @route   GET /api/consultations/doctors/:id
// @access  Public
exports.getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      throw ApiError.notFound('Doctor not found');
    }
    return ApiResponse.success(res, doctor);
  } catch (error) {
    next(error);
  }
};

// @desc    Request a consultation (instant or scheduled)
// @route   POST /api/consultations/request
// @access  Private (CUSTOMER)
exports.requestConsultation = async (req, res, next) => {
  try {
    const { doctorId, type, scheduledTime, symptoms } = req.body;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw ApiError.notFound('Doctor not found');
    }

    // Check for slot conflicts (within 30-min window for scheduled)
    if (type === 'SCHEDULED' && scheduledTime) {
      const slotStart = new Date(new Date(scheduledTime).getTime() - 15 * 60000);
      const slotEnd = new Date(new Date(scheduledTime).getTime() + 15 * 60000);
      const conflict = await Consultation.findOne({
        doctorId,
        status: { $in: ['CONFIRMED', 'IN_PROGRESS'] },
        scheduledTime: { $gte: slotStart, $lte: slotEnd }
      });
      if (conflict) {
        throw ApiError.badRequest('Doctor has a conflicting appointment at this time. Please choose a different slot.');
      }
    }

    const consultation = await Consultation.create({
      patientId: req.user._id,
      doctorId,
      type,
      scheduledTime: type === 'SCHEDULED' ? scheduledTime : new Date(),
      symptoms,
      fee: doctor.fee,
      statusHistory: [
        {
          status: 'REQUESTED',
          timestamp: new Date(),
          note: 'Consultation requested by patient',
          updatedBy: req.user._id
        }
      ]
    });

    // Notify doctor if they have a userId
    if (doctor.userId) {
      await sendNotification({
        userId: doctor.userId,
        type: 'CONSULTATION_REQUESTED',
        title: 'New Consultation Request',
        message: `${req.user.name} has requested a ${type.toLowerCase()} consultation for: ${symptoms || 'General consultation'}`,
        link: `/doctor/appointments/${consultation._id}`
      });

      const io = getIO();
      io.to(`doctor:${doctor._id}`).emit('consultation_status_changed', {
        consultationId: consultation._id,
        status: 'REQUESTED',
        patientName: req.user.name
      });
    }

    return ApiResponse.created(res, consultation, 'Consultation requested successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get my consultations (patient)
// @route   GET /api/consultations/my
// @access  Private (CUSTOMER)
exports.getMyConsultations = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { patientId: req.user._id };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Consultation.countDocuments(query);
    const consultations = await Consultation.find(query)
      .populate('doctorId')
      .populate('prescriptionId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return ApiResponse.success(res, {
      consultations,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update consultation status
// @route   PUT /api/consultations/:id/status
// @access  Private (ADMIN, DOCTOR)
exports.updateConsultationStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const consultation = await Consultation.findById(req.params.id).populate('doctorId');

    if (!consultation) {
      throw ApiError.notFound('Consultation not found');
    }

    // If DOCTOR role, verify they own this consultation
    if (req.user.role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor || doctor._id.toString() !== consultation.doctorId._id.toString()) {
        throw ApiError.forbidden('You can only update your own consultations');
      }
    }

    consultation.status = status;
    if (notes) {
      consultation.notes = notes;
    }
    consultation.statusHistory.push({
      status,
      timestamp: new Date(),
      note: notes || `Status updated to ${status}`,
      updatedBy: req.user._id
    });
    await consultation.save();

    // Notify patient
    const notifTypeMap = {
      CONFIRMED: 'CONSULTATION_CONFIRMED',
      COMPLETED: 'CONSULTATION_COMPLETED',
      CANCELLED: 'CONSULTATION_CANCELLED'
    };
    const notifTitleMap = {
      CONFIRMED: 'Consultation Confirmed! ✅',
      COMPLETED: 'Consultation Completed',
      CANCELLED: 'Consultation Cancelled',
      IN_PROGRESS: 'Consultation Started'
    };

    if (notifTypeMap[status] || status === 'IN_PROGRESS') {
      await sendNotification({
        userId: consultation.patientId,
        type: notifTypeMap[status] || 'SYSTEM_ALERT',
        title: notifTitleMap[status] || `Consultation ${status}`,
        message: `Your consultation with Dr. ${consultation.doctorId.name} has been ${status.toLowerCase().replace('_', ' ')}.`,
        link: `/doctors`
      });
    }

    const io = getIO();
    io.to(`user:${consultation.patientId}`).emit('consultation_status_changed', {
      consultationId: consultation._id,
      status,
      doctorName: consultation.doctorId.name
    });

    return ApiResponse.success(res, consultation, 'Consultation status updated');
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor's own appointments
// @route   GET /api/consultations/doctor/appointments
// @access  Private (DOCTOR)
exports.getDoctorAppointments = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      throw ApiError.notFound('Doctor profile not found. Please complete your registration.');
    }

    const { status, page = 1, limit = 20 } = req.query;
    const query = { doctorId: doctor._id };
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Consultation.countDocuments(query);
    const consultations = await Consultation.find(query)
      .populate('patientId', 'name email phone avatar')
      .populate('prescriptionId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return ApiResponse.success(res, {
      consultations,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10))
      },
      doctorId: doctor._id
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update consultation notes/diagnosis (doctor only)
// @route   PUT /api/consultations/:id/notes
// @access  Private (DOCTOR)
exports.updateConsultationNotes = async (req, res, next) => {
  try {
    const { diagnosis, notes, followUpDate, recommendedTests } = req.body;
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      throw ApiError.notFound('Doctor profile not found');
    }

    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      throw ApiError.notFound('Consultation not found');
    }
    if (consultation.doctorId.toString() !== doctor._id.toString()) {
      throw ApiError.forbidden('You can only update your own consultations');
    }

    if (diagnosis !== undefined) consultation.diagnosis = diagnosis;
    if (notes !== undefined) consultation.notes = notes;
    if (followUpDate) consultation.followUpDate = followUpDate;
    if (recommendedTests) consultation.recommendedTests = recommendedTests;

    consultation.statusHistory.push({
      status: consultation.status,
      timestamp: new Date(),
      note: 'Consultation notes updated by doctor',
      updatedBy: req.user._id
    });

    await consultation.save();
    return ApiResponse.success(res, consultation, 'Consultation notes updated');
  } catch (error) {
    next(error);
  }
};

// @desc    Issue prescription from consultation
// @route   POST /api/consultations/:id/prescription
// @access  Private (DOCTOR)
exports.issueConsultationPrescription = async (req, res, next) => {
  try {
    const { medicines, instructions } = req.body;
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      throw ApiError.notFound('Doctor profile not found');
    }

    const consultation = await Consultation.findById(req.params.id);
    if (!consultation) {
      throw ApiError.notFound('Consultation not found');
    }
    if (consultation.doctorId.toString() !== doctor._id.toString()) {
      throw ApiError.forbidden('You can only issue prescriptions for your own consultations');
    }

    // Create digital prescription
    const prescription = await Prescription.create({
      customerId: consultation.patientId,
      type: 'DIGITAL',
      status: 'APPROVED',
      doctorName: doctor.name,
      doctorRegistration: doctor.registrationNumber,
      medicines: medicines || [],
      instructions: instructions || '',
      consultationId: consultation._id,
      reviewedBy: req.user._id,
      reviewedAt: new Date(),
      reviewNotes: `Digital prescription issued by Dr. ${doctor.name} during consultation ${consultation.consultationNumber}`
    });

    consultation.prescriptionId = prescription._id;
    consultation.status = 'COMPLETED';
    consultation.paymentStatus = 'PAID';
    consultation.statusHistory.push({
      status: 'COMPLETED',
      timestamp: new Date(),
      note: `Prescription issued by Dr. ${doctor.name}`,
      updatedBy: req.user._id
    });
    await consultation.save();

    // Update doctor consultation count
    await Doctor.findByIdAndUpdate(doctor._id, { $inc: { consultationCount: 1 } });

    await sendNotification({
      userId: consultation.patientId,
      type: 'PRESCRIPTION_ISSUED',
      title: 'Digital Prescription Issued',
      message: `Dr. ${doctor.name} has issued a prescription for your consultation. You can now order medicines.`,
      link: `/doctors`
    });

    return ApiResponse.created(res, { consultation, prescription }, 'Prescription issued successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel consultation
// @route   POST /api/consultations/:id/cancel
// @access  Private (CUSTOMER, DOCTOR)
exports.cancelConsultation = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const consultation = await Consultation.findById(req.params.id).populate('doctorId');
    if (!consultation) {
      throw ApiError.notFound('Consultation not found');
    }

    if (consultation.status === 'COMPLETED' || consultation.status === 'CANCELLED') {
      throw ApiError.badRequest(`Cannot cancel a ${consultation.status.toLowerCase()} consultation`);
    }

    // Verify ownership
    const isPatient = consultation.patientId.toString() === req.user._id.toString();
    let isDoctor = false;
    if (req.user.role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      isDoctor = doctor && doctor._id.toString() === consultation.doctorId._id.toString();
    }
    if (!isPatient && !isDoctor && req.user.role !== 'ADMIN') {
      throw ApiError.forbidden('You do not have permission to cancel this consultation');
    }

    consultation.status = 'CANCELLED';
    consultation.cancelledBy = req.user._id;
    consultation.cancellationReason = reason || 'No reason provided';
    if (consultation.paymentStatus === 'PAID') {
      consultation.paymentStatus = 'REFUNDED';
    }
    consultation.statusHistory.push({
      status: 'CANCELLED',
      timestamp: new Date(),
      note: `Cancelled by ${req.user.role}: ${reason || 'No reason provided'}`,
      updatedBy: req.user._id
    });
    await consultation.save();

    // Notify the other party
    const notifyUserId = isPatient ? consultation.doctorId.userId : consultation.patientId;
    if (notifyUserId) {
      await sendNotification({
        userId: notifyUserId,
        type: 'CONSULTATION_CANCELLED',
        title: 'Consultation Cancelled',
        message: `Consultation has been cancelled. Reason: ${reason || 'Not specified'}`,
        link: isPatient ? `/doctor/appointments` : `/doctors`
      });
    }

    return ApiResponse.success(res, consultation, 'Consultation cancelled successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single consultation detail
// @route   GET /api/consultations/:id
// @access  Private (CUSTOMER, DOCTOR, ADMIN)
exports.getConsultationById = async (req, res, next) => {
  try {
    const consultation = await Consultation.findById(req.params.id)
      .populate('doctorId')
      .populate('patientId', 'name email phone avatar')
      .populate('prescriptionId')
      .populate('recommendedTests.testId');

    if (!consultation) {
      throw ApiError.notFound('Consultation not found');
    }

    // Authorization check
    const isPatient = consultation.patientId._id.toString() === req.user._id.toString();
    let isDoctor = false;
    if (req.user.role === 'DOCTOR') {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      isDoctor = doctor && doctor._id.toString() === consultation.doctorId._id.toString();
    }
    if (!isPatient && !isDoctor && req.user.role !== 'ADMIN') {
      throw ApiError.forbidden('You do not have permission to view this consultation');
    }

    return ApiResponse.success(res, consultation);
  } catch (error) {
    next(error);
  }
};
