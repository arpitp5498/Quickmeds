const Address = require('../models/Address');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// @desc    Get user's saved addresses
// @route   GET /api/users/addresses
// @access  Private (CUSTOMER)
const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ userId: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    return ApiResponse.success(res, { addresses });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new address
// @route   POST /api/users/addresses
// @access  Private (CUSTOMER)
const addAddress = async (req, res, next) => {
  try {
    const { label, recipientName, phone, street, city, state, pincode, landmark, fullAddress, coordinates, isDefault } = req.body;

    if (isDefault) {
      // Unset previous defaults
      await Address.updateMany({ userId: req.user._id }, { isDefault: false });
    }

    const address = await Address.create({
      userId: req.user._id,
      label: label || 'Home',
      recipientName: recipientName || req.user.name,
      phone: phone || req.user.phone,
      street,
      city,
      state,
      pincode,
      landmark: landmark || '',
      fullAddress: fullAddress || `${street}, ${city}, ${state} ${pincode}`,
      coordinates: coordinates || [77.209, 28.6139],
      isDefault: isDefault || false
    });

    return ApiResponse.created(res, { address }, 'Address saved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update an address
// @route   PUT /api/users/addresses/:id
// @access  Private (CUSTOMER)
const updateAddress = async (req, res, next) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, userId: req.user._id });
    if (!address) {
      throw ApiError.notFound('Address not found');
    }

    if (req.body.isDefault) {
      await Address.updateMany({ userId: req.user._id }, { isDefault: false });
    }

    Object.assign(address, req.body);
    await address.save();

    return ApiResponse.success(res, { address }, 'Address updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an address
// @route   DELETE /api/users/addresses/:id
// @access  Private (CUSTOMER)
const deleteAddress = async (req, res, next) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!address) {
      throw ApiError.notFound('Address not found');
    }
    return ApiResponse.success(res, null, 'Address deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress
};
