// SIH DEMO MODE ONLY - REMOVE AFTER SIH
/**
 * Demo Mode Guard Middleware
 * Ensures demo APIs are strictly inaccessible when ENABLE_DEMO_MODE=false.
 */
const env = require('../config/env');
const ApiResponse = require('../utils/ApiResponse');

const requireDemoMode = (req, res, next) => {
  if (!env.ENABLE_DEMO_MODE) {
    return res.status(404).json({
      success: false,
      message: 'Demo Mode is disabled in this environment. Access denied.'
    });
  }
  next();
};

module.exports = {
  requireDemoMode
};
