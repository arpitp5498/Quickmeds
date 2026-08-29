/**
 * Routing Controller
 * File: server/src/controllers/routingController.js
 */

const { optimizeFulfilmentPlan } = require('../services/smartRoutingService');
const Pharmacy = require('../models/Pharmacy');
const Cart = require('../models/Cart');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Optimize medicine basket fulfilment plan
 * @route   POST /api/routing/optimize or GET /api/routing/optimize
 * @access  Public / Optional Auth
 */
const optimizeBasket = async (req, res, next) => {
  try {
    let items = req.body?.items || [];
    let coordinates = req.body?.coordinates;
    const maxDistanceKm = req.body?.maxDistanceKm ? Number(req.body.maxDistanceKm) : 15;

    // Handle GET query parameters / direct URL testing
    if (req.method === 'GET') {
      const { lat, lng, medicines } = req.query;
      if (lat && lng) {
        coordinates = [parseFloat(lng), parseFloat(lat)];
      }
      if (medicines) {
        // e.g. medicines=medId1:qty1,medId2:qty2
        items = medicines.split(',').map(pair => {
          const [medicineId, quantity] = pair.split(':');
          return { medicineId, quantity: quantity ? parseInt(quantity, 10) : 1 };
        });
      }
    }

    // If user is authenticated and no items provided, load from active cart
    if ((!items || items.length === 0) && req.user?._id) {
      const cart = await Cart.findOne({ customerId: req.user._id });
      if (cart && cart.items && cart.items.length > 0) {
        items = cart.items;
      }
    }

    if (!items || items.length === 0) {
      throw ApiError.badRequest('Please provide at least one medicine item in the basket.');
    }

    const optimizationResult = await optimizeFulfilmentPlan(items, coordinates, { maxDistanceKm });

    return ApiResponse.success(
      res,
      optimizationResult,
      'Smart fulfilment routing plan computed successfully (pricing).'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get pharmacy network scoring data for interactive map
 * @route   GET /api/routing/pharmacies-map
 * @access  Public
 */
const getPharmacyNetworkMap = async (req, res, next) => {
  try {
    const { lat = 28.6139, lng = 77.2090, radius = 15 } = req.query;
    const coordinates = [parseFloat(lng), parseFloat(lat)];
    const parsedRadius = parseFloat(radius) || 15;

    let pharmacies = [];
    try {
      pharmacies = await Pharmacy.find({
        verificationStatus: 'VERIFIED',
        location: {
          $nearSphere: {
            $geometry: { type: 'Point', coordinates },
            $maxDistance: parsedRadius * 1000
          }
        }
      }).select('name address location rating isOpen serviceRadiusKm totalOrdersCompleted');
    } catch (geoErr) {
      pharmacies = await Pharmacy.find({
        verificationStatus: 'VERIFIED'
      }).select('name address location rating isOpen serviceRadiusKm totalOrdersCompleted');
    }

    return ApiResponse.success(res, {
      patientCoordinates: coordinates,
      radiusKm: parsedRadius,
      pharmacies: pharmacies.map(p => ({
        _id: p._id,
        name: p.name,
        address: p.address?.fullAddress || p.address?.street || p.address || 'Address',
        coordinates: p.location?.coordinates || [77.2090, 28.6139],
        rating: p.rating || 4.5,
        isOpen: p.isOpen !== false,
        serviceRadiusKm: p.serviceRadiusKm || 10,
        totalOrders: p.totalOrdersCompleted || 0
      }))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  optimizeBasket,
  getPharmacyNetworkMap
};
