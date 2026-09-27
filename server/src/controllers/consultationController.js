const Doctor = require('../models/Doctor');
const Consultation = require('../models/Consultation');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

exports.getDoctors = async (req, res, next) => {
  try {
    const { specialty } = req.query;
    const query = { isAvailable: true };
    if (specialty) {
      query.specialty = specialty;
    }
    const doctors = await Doctor.find(query);
    return ApiResponse.success(res, doctors);
  } catch (error) {
    next(error);
  }
};

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

exports.requestConsultation = async (req, res, next) => {
  try {
    const { doctorId, type, scheduledTime, symptoms } = req.body;
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw ApiError.notFound('Doctor not found');
    }

    const consultation = await Consultation.create({
      patientId: req.user._id,
      doctorId,
      type,
      scheduledTime: type === 'SCHEDULED' ? scheduledTime : new Date(),
      symptoms,
      fee: doctor.fee
    });

    return ApiResponse.created(res, consultation, 'Consultation requested successfully');
  } catch (error) {
    next(error);
  }
};

exports.getMyConsultations = async (req, res, next) => {
  try {
    const consultations = await Consultation.find({ patientId: req.user._id })
      .populate('doctorId')
      .sort({ createdAt: -1 });
    return ApiResponse.success(res, consultations);
  } catch (error) {
    next(error);
  }
};

exports.updateConsultationStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const consultation = await Consultation.findById(req.params.id);
    
    if (!consultation) {
      throw ApiError.notFound('Consultation not found');
    }

    consultation.status = status;
    if (notes) {
      consultation.notes = notes;
    }
    await consultation.save();

    return ApiResponse.success(res, consultation, 'Consultation status updated');
  } catch (error) {
    next(error);
  }
};
