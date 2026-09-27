const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

exports.requestAmbulance = async (req, res, next) => {
  try {
    const { location, vehicleType, emergencyDescription } = req.body;
    
    if (!location) {
      throw ApiError.badRequest('Location is required for ambulance request');
    }

    // In a real system, this would create an AmbulanceRequest model and dispatch to nearest drivers
    logger.info(`Ambulance requested by user ${req.user._id}: ${vehicleType}, ${emergencyDescription}`);

    return ApiResponse.created(res, {
      requestId: 'AMB-' + Date.now(),
      status: 'DISPATCHING',
      eta: '5-10 mins',
      contact: '911'
    }, 'Ambulance requested successfully. Help is on the way.');
  } catch (error) {
    next(error);
  }
};

exports.getHelplines = async (req, res, next) => {
  try {
    const helplines = [
      { name: 'National Emergency Number', number: '112' },
      { name: 'Ambulance', number: '102' },
      { name: 'Police', number: '100' },
      { name: 'Fire', number: '101' },
      { name: 'Women Helpline', number: '1091' }
    ];
    return ApiResponse.success(res, helplines);
  } catch (error) {
    next(error);
  }
};
