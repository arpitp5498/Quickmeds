// SIH DEMO MODE ONLY - REMOVE AFTER SIH
/**
 * Demo Mode API Routes
 * File: server/src/routes/demoRoutes.js
 */

const express = require('express');
const router = express.Router();
const { requireDemoMode } = require('../demo/demoMiddleware');
const demoController = require('../demo/demoController');

// All demo routes strictly protected by environment check
router.use(requireDemoMode);

router.get('/status', demoController.getStatus);
router.post('/session', demoController.createDemoSession);
router.post('/reject-and-reroute', demoController.triggerRejection);
router.post('/reset', demoController.reset);

module.exports = router;
