const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const DeliveryPartner = require('../models/DeliveryPartner');
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
      { user: userObj, token },
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
      .populate('pharmacyId deliveryPartnerId');

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
      'pharmacyId deliveryPartnerId'
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

// @desc    Forgot password handler (demo simulation)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Return success to avoid email enumeration
      return ApiResponse.success(
        res,
        null,
        'If an account with that email exists, a password reset link has been dispatched.'
      );
    }

    return ApiResponse.success(
      res,
      { resetToken: 'demo-reset-token-2026' },
      'Password reset instructions dispatched.'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password handler
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw ApiError.notFound('Account not found.');
    }

    user.password = password;
    await user.save();

    return ApiResponse.success(res, null, 'Password has been reset successfully. You may now log in.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword
};
