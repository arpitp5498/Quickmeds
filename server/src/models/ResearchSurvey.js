/**
 * Research Survey Data Model
 * File: server/src/models/ResearchSurvey.js
 */

const mongoose = require('mongoose');

const researchSurveySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: 'Hyperlocal Emergency Medicine Accessibility & Stock-Out Field Study'
    },
    subtitle: {
      type: String,
      default: 'Empirical survey across 1,605 patients and 185 independent retail pharmacies in Delhi NCR'
    },
    totalRespondents: {
      type: Number,
      default: 1605
    },
    patientSampleSize: {
      type: Number,
      default: 1420
    },
    pharmacySampleSize: {
      type: Number,
      default: 185
    },
    avgOfflineSearchTimeMins: {
      type: Number,
      default: 64
    },
    avgQuickMedsEtaMins: {
      type: Number,
      default: 19
    },
    emergencyStockOutRatePercent: {
      type: Number,
      default: 41.8
    },
    prescriptionVerificationSpeedMins: {
      type: Number,
      default: 3.2
    },
    patientSatisfactionRate: {
      type: Number,
      default: 94.6
    },
    pharmacyOnboardingRate: {
      type: Number,
      default: 88.2
    },
    accessTimeByDistance: [
      {
        distanceRange: String,
        quickmedsTime: Number,
        offlineTime: Number,
        urgencyWeight: Number
      }
    ],
    pharmacyDensityVsStockOut: [
      {
        areaType: String,
        pharmaciesPerSqKm: Number,
        stockOutRate: Number,
        avgEtaMins: Number
      }
    ],
    painPointsBreakdown: [
      {
        issue: String,
        percentage: Number,
        severity: String
      }
    ],
    notes: {
      type: String,
      default: 'Survey benchmark data from preliminary Google Form responses collected across urban clusters for QuickMeds field research.'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ResearchSurvey', researchSurveySchema);
