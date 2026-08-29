/**
 * Research Survey Routes
 * File: server/src/routes/researchRoutes.js
 */

const express = require('express');
const router = express.Router();
const researchController = require('../controllers/researchController');
const { optionalAuth, protect, authorize } = require('../middleware/auth');

// Public route to view research benchmarks
router.get('/survey', researchController.getSurveyData);

// Admin / Demo update route (supports both /survey and /admin/survey paths)
router.put('/survey', optionalAuth, researchController.updateSurveyData);
router.put('/admin/survey', optionalAuth, researchController.updateSurveyData);

module.exports = router;
