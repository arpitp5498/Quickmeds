/**
 * Routing Routes
 * File: server/src/routes/routingRoutes.js
 */

const express = require('express');
const router = express.Router();
const routingController = require('../controllers/routingController');
const { optionalAuth } = require('../middleware/auth');

// Support both POST and GET for optimization demonstration
router.post('/optimize', optionalAuth, routingController.optimizeBasket);
router.get('/optimize', optionalAuth, routingController.optimizeBasket);

// Map visualization feed
router.get('/pharmacies-map', routingController.getPharmacyNetworkMap);

module.exports = router;
