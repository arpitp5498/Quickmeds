const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const DeliveryPartner = require('../models/DeliveryPartner');
const Doctor = require('../models/Doctor');
const { generateToken } = require('../services/authService');
const { logAction } = require('../services/auditService');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Register a new user (Customer, Pharmacy, or Delivery Partner)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role = 'CUSTOMER',
      pharmacyDetails,
      deliveryDetails
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw ApiError.conflict('An account with this email address already exists.');
    }

    // Pre-validate Doctor specific fields before user creation
    if (role === 'DOCTOR') {
      const { registrationNumber, specialty, qualification, fee } = req.body;
      if (!registrationNumber || !specialty || !qualification || !fee) {
        throw ApiError.badRequest('Registration number, specialty, qualification, and consultation fee are required for doctors.');
      }
      const Doctor = require('../models/Doctor');
      const existingDoc = await Doctor.findOne({ registrationNumber: registrationNumber.trim() });
      if (existingDoc) {
        throw ApiError.conflict('A doctor with this medical registration number is already registered.');
      }
    }

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role
    });

    // If registering as a Pharmacy partner, create linked pharmacy entity
    if (role === 'PHARMACY') {
      const pharmacy = await Pharmacy.create({
        userId: user._id,
        name: (pharmacyDetails && pharmacyDetails.name) || `${name}'s Pharmacy`,
        phone: (pharmacyDetails && pharmacyDetails.phone) || phone,
        email: email.toLowerCase(),
        licenseNumber:
          (pharmacyDetails && pharmacyDetails.licenseNumber) ||
          `DL-${Date.now().toString().slice(-6)}`,
        address: (pharmacyDetails && pharmacyDetails.address) || {
          street: 'Main Market Road',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110001',
          fullAddress: 'Main Market Road, New Delhi, Delhi 110001'
        },
        location: {
          type: 'Point',
          coordinates:
            (pharmacyDetails && pharmacyDetails.coordinates) || [77.209, 28.6139]
        },
        verificationStatus: 'PENDING'
      });
      user.pharmacyId = pharmacy._id;
      await user.save();
    }

    // If registering as a Delivery Partner, create linked delivery partner entity
    if (role === 'DELIVERY_PARTNER') {
      const partner = await DeliveryPartner.create({
        userId: user._id,
        vehicleType: (deliveryDetails && deliveryDetails.vehicleType) || 'Bike',
        vehicleNumber:
          (deliveryDetails && deliveryDetails.vehicleNumber) ||
          `DL-01-AB-${Math.floor(1000 + Math.random() * 9000)}`,
        drivingLicenseNumber:
          (deliveryDetails && deliveryDetails.drivingLicenseNumber) ||
          `DL-IN-${Date.now().toString().slice(-6)}`,
        status: 'AVAILABLE'
      });
      user.deliveryPartnerId = partner._id;
      await user.save();
    }

    // If registering as a Doctor
    let doctorObj = null;
    if (role === 'DOCTOR') {
      const { registrationNumber, specialty, qualification, fee, experience } = req.body;
      const Doctor = require('../models/Doctor');
      const doctor = await Doctor.create({
        name,
        specialty,
        qualification: qualification.trim(),
        registrationNumber: registrationNumber.trim(),
        fee: Number(fee),
        experience: experience ? Number(experience) : 0,
        phone,
        userId: user._id,
        email: email.toLowerCase(),
        verificationStatus: 'PENDING'
      });
      user.doctorId = doctor._id;
      await user.save();
      doctorObj = doctor.toObject();
    }

    const token = generateToken(user);

    const userObj = user.toObject();
    delete userObj.password;

    await logAction({
      actorId: user._id,
      actorRole: user.role,
      action: 'USER_REGISTER',
      entity: 'USER',
      entityId: user._id.toString(),
      description: `New user registered with role ${user.role} (${user.email})`
    });

    return ApiResponse.created(
      res,
      { user: userObj, token, ...(doctorObj && { doctor: doctorObj }) },
      'Account created successfully!'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Login user & return JWT token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user with password field included
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('pharmacyId deliveryPartnerId doctorId');

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password.');
    }

    if (!user.isActive) {
      throw ApiError.forbidden(
        'Your account has been deactivated. Please contact customer support.'
      );
    }

    const token = generateToken(user);

    const userObj = user.toObject();
    delete userObj.password;

    await logAction({
      actorId: user._id,
      actorRole: user.role,
      action: 'USER_LOGIN',
      entity: 'USER',
      entityId: user._id.toString(),
      description: `User logged in (${user.email})`
    });

    return ApiResponse.success(res, { user: userObj, token }, 'Logged in successfully!');
  } catch (error) {
    next(error);
  }
};

// @desc    Get current authenticated user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate(
      'pharmacyId deliveryPartnerId doctorId'
    );
    return ApiResponse.success(res, { user }, 'User profile retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    return ApiResponse.success(res, { user }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password handler
// @route   POST /api/auth/forgot-password
// @access  Public
const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const digest = value => crypto.createHash('sha256').update(value).digest('hex');

async function forgotPassword(req, res, next) {
  try {
    const { RESEND_API_KEY, RESET_EMAIL_FROM, CLIENT_URL } = process.env;
    if (!RESEND_API_KEY || !RESET_EMAIL_FROM || !CLIENT_URL) throw new ApiError(503, 'Recovery email unavailable');
    if (typeof req.body.email !== 'string') throw ApiError.badRequest('Valid email required');
    const token = crypto.randomBytes(32).toString('hex');
    const user = await User.findOneAndUpdate({ email: req.body.email.trim().toLowerCase(), isActive: true }, {
      $set: { resetPasswordToken: digest(token), resetPasswordExpire: new Date(Date.now() + 15 * 60000) }
    });
    if (user) {
      const link = new URL('/reset-password', CLIENT_URL);
      link.hash = 'token=' + token;
      try {
        const receipt = await fetch('https://api.resend.com/emails', {
          method: 'POST', signal: AbortSignal.timeout(5000),
          headers: { Authorization: 'Bearer ' + RESEND_API_KEY, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: RESET_EMAIL_FROM, to: user.email, subject: 'Reset your QuickMeds password',
            text: 'Use this link within 15 minutes to reset your password: ' + link.href })
        });
        if (!receipt.ok) throw new Error('Delivery failed');
      } catch {
        await User.updateOne({ _id: user._id, resetPasswordToken: digest(token) }, { $unset: { resetPasswordToken: 1, resetPasswordExpire: 1 } });
        console.error('Password recovery delivery failed');
      }
    }
    return ApiResponse.success(res, null, 'If the account exists, check your email.');
  } catch (error) { return next(error); }
}

async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    if (typeof token !== 'string' || !/^[0-9a-f]{64}$/.test(token)) throw ApiError.badRequest('Invalid reset link');
    if (typeof newPassword !== 'string' || newPassword.length < 10 || Buffer.byteLength(newPassword) > 72)
      throw ApiError.badRequest('Use at least 10 characters and at most 72 bytes');
    const password = await bcrypt.hash(newPassword, 12);
    const result = await User.updateOne({ resetPasswordToken: digest(token), resetPasswordExpire: { $gt: new Date() }, isActive: true },
      { $set: { password }, $inc: { tokenVersion: 1 }, $unset: { resetPasswordToken: 1, resetPasswordExpire: 1 } });
    if (!result.modifiedCount) throw ApiError.badRequest('Invalid or expired reset link');
    return ApiResponse.success(res, null, 'Password reset successfully');
  } catch (error) { return next(error); }
}

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword
};
