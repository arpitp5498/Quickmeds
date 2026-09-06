// SIH DEMO MODE ONLY - REMOVE AFTER SIH
/**
 * QuickMeds Demo API Controller
 * File: server/src/demo/demoController.js
 */

const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const demoService = require('./demoService');

// @desc    Get current demo ecosystem status
// @route   GET /api/demo/status
// @access  Public (Protected by demoMiddleware)
const getStatus = async (req, res, next) => {
  try {
    const data = await demoService.getDemoStatus();
    return ApiResponse.success(res, data);
  } catch (error) {
    next(error);
  }
};

// @desc    Obtain a scoped demo role JWT session
// @route   POST /api/demo/session
// @access  Public (Protected by demoMiddleware)
const createDemoSession = async (req, res, next) => {
  try {
    const { role = 'CUSTOMER' } = req.body;
    const session = await demoService.getDemoSession(role);
    return ApiResponse.success(res, session, 'Demo session initialized');
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger simulated pharmacy rejection & smart fallback rerouting
// @route   POST /api/demo/reject-and-reroute
// @access  Public (Protected by demoMiddleware)
const triggerRejection = async (req, res, next) => {
  try {
    const result = await demoService.simulatePharmacyRejection();
    return ApiResponse.success(
      res,
      result,
      '⚡ Pharmacy A rejected order. Smart Fallback Routing reassigned order to Pharmacy B!'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Reset demo order and baseline inventory
// @route   POST /api/demo/reset
// @access  Public (Protected by demoMiddleware)
const reset = async (req, res, next) => {
  try {
    const result = await demoService.resetDemo();
    return ApiResponse.success(res, result, 'Demo successfully reset.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStatus,
  createDemoSession,
  triggerRejection,
  reset
};
