const CycleTracker = require('../models/CycleTracker');
const Medicine = require('../models/Medicine');
const { generatePredictions, recalculateAverages } = require('../services/cyclePredictionService');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// @desc    Log a new period
// @route   POST /api/cycle/log
// @access  Private (CUSTOMER)
const logPeriod = async (req, res, next) => {
  try {
    const { startDate, endDate, symptoms, flowIntensity, notes } = req.body;

    if (!startDate || !endDate) {
      throw ApiError.badRequest('Both start date and end date are required.');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      throw ApiError.badRequest('End date must be after start date.');
    }

    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (diffDays > 15) {
      throw ApiError.badRequest('Period length seems unusually long (>15 days). Please check dates.');
    }

    // Find or create tracker for this user
    let tracker = await CycleTracker.findOne({ userId: req.user._id });

    if (!tracker) {
      tracker = new CycleTracker({ userId: req.user._id, cycles: [] });
    }

    // Add the new cycle entry
    tracker.cycles.push({
      startDate: start,
      endDate: end,
      periodLength: diffDays,
      symptoms: symptoms || [],
      flowIntensity: flowIntensity || 'Medium',
      notes: notes || ''
    });

    // Sort cycles by date
    tracker.cycles.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    // Recalculate averages
    const { averageCycleLength, averagePeriodLength } = recalculateAverages(tracker.cycles);
    tracker.averageCycleLength = averageCycleLength;
    tracker.averagePeriodLength = averagePeriodLength;

    // Regenerate predictions
    tracker.predictions = generatePredictions(
      tracker.cycles,
      averageCycleLength,
      averagePeriodLength,
      6
    );

    await tracker.save();

    return ApiResponse.created(res, {
      tracker: {
        cycles: tracker.cycles,
        averageCycleLength: tracker.averageCycleLength,
        averagePeriodLength: tracker.averagePeriodLength,
        predictions: tracker.predictions,
        notificationSettings: tracker.notificationSettings
      }
    }, 'Period logged successfully! Predictions updated.');
  } catch (error) {
    next(error);
  }
};

// @desc    Get full cycle data (history + predictions + calendar)
// @route   GET /api/cycle
// @access  Private (CUSTOMER)
const getCycleData = async (req, res, next) => {
  try {
    let tracker = await CycleTracker.findOne({ userId: req.user._id });

    if (!tracker) {
      tracker = { cycles: [], predictions: [], averageCycleLength: 28, averagePeriodLength: 5, notificationSettings: { enabled: true, daysBefore: 2 } };
    }

    // Build calendar events for the frontend
    const calendarEvents = [];

    // Past periods (confirmed)
    for (const cycle of (tracker.cycles || [])) {
      const start = new Date(cycle.startDate);
      const end = new Date(cycle.endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        calendarEvents.push({
          date: new Date(d).toISOString().split('T')[0],
          type: 'period',
          label: 'Period Day'
        });
      }
    }

    // Predicted periods
    for (const pred of (tracker.predictions || [])) {
      const start = new Date(pred.predictedStart);
      const end = new Date(pred.predictedEnd);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        calendarEvents.push({
          date: new Date(d).toISOString().split('T')[0],
          type: 'predicted',
          label: 'Predicted Period'
        });
      }

      // Fertility window
      if (pred.fertility) {
        const fStart = new Date(pred.fertility.start);
        const fEnd = new Date(pred.fertility.end);
        for (let d = new Date(fStart); d <= fEnd; d.setDate(d.getDate() + 1)) {
          calendarEvents.push({
            date: new Date(d).toISOString().split('T')[0],
            type: 'fertile',
            label: 'Fertile Window'
          });
        }
      }
    }

    // Next predicted period info
    const now = new Date();
    const nextPeriod = (tracker.predictions || []).find(p => new Date(p.predictedStart) > now);
    let daysUntilNext = null;
    if (nextPeriod) {
      daysUntilNext = Math.ceil((new Date(nextPeriod.predictedStart) - now) / (1000 * 60 * 60 * 24));
    }

    return ApiResponse.success(res, {
      cycles: tracker.cycles || [],
      predictions: tracker.predictions || [],
      averageCycleLength: tracker.averageCycleLength || 28,
      averagePeriodLength: tracker.averagePeriodLength || 5,
      notificationSettings: tracker.notificationSettings || { enabled: true, daysBefore: 2 },
      calendarEvents,
      nextPeriod: nextPeriod || null,
      daysUntilNext
    }, 'Cycle data fetched successfully.');
  } catch (error) {
    next(error);
  }
};

// @desc    Update a cycle entry
// @route   PUT /api/cycle/:cycleId
// @access  Private (CUSTOMER)
const updateCycle = async (req, res, next) => {
  try {
    const tracker = await CycleTracker.findOne({ userId: req.user._id });
    if (!tracker) throw ApiError.notFound('No cycle data found.');

    const cycle = tracker.cycles.id(req.params.cycleId);
    if (!cycle) throw ApiError.notFound('Cycle entry not found.');

    const { startDate, endDate, symptoms, flowIntensity, notes } = req.body;
    if (startDate) cycle.startDate = new Date(startDate);
    if (endDate) cycle.endDate = new Date(endDate);
    if (symptoms) cycle.symptoms = symptoms;
    if (flowIntensity) cycle.flowIntensity = flowIntensity;
    if (notes !== undefined) cycle.notes = notes;

    if (cycle.startDate && cycle.endDate) {
      cycle.periodLength = Math.ceil((cycle.endDate - cycle.startDate) / (1000 * 60 * 60 * 24));
    }

    tracker.cycles.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    const { averageCycleLength, averagePeriodLength } = recalculateAverages(tracker.cycles);
    tracker.averageCycleLength = averageCycleLength;
    tracker.averagePeriodLength = averagePeriodLength;
    tracker.predictions = generatePredictions(tracker.cycles, averageCycleLength, averagePeriodLength, 6);

    await tracker.save();

    return ApiResponse.success(res, { tracker }, 'Cycle entry updated successfully.');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a cycle entry
// @route   DELETE /api/cycle/:cycleId
// @access  Private (CUSTOMER)
const deleteCycle = async (req, res, next) => {
  try {
    const tracker = await CycleTracker.findOne({ userId: req.user._id });
    if (!tracker) throw ApiError.notFound('No cycle data found.');

    const cycleIndex = tracker.cycles.findIndex(c => c._id.toString() === req.params.cycleId);
    if (cycleIndex === -1) throw ApiError.notFound('Cycle entry not found.');

    tracker.cycles.splice(cycleIndex, 1);

    const { averageCycleLength, averagePeriodLength } = recalculateAverages(tracker.cycles);
    tracker.averageCycleLength = averageCycleLength;
    tracker.averagePeriodLength = averagePeriodLength;
    tracker.predictions = tracker.cycles.length > 0
      ? generatePredictions(tracker.cycles, averageCycleLength, averagePeriodLength, 6)
      : [];

    await tracker.save();

    return ApiResponse.success(res, { tracker }, 'Cycle entry deleted. Predictions recalculated.');
  } catch (error) {
    next(error);
  }
};

// @desc    Update notification settings
// @route   PUT /api/cycle/notifications
// @access  Private (CUSTOMER)
const updateNotificationSettings = async (req, res, next) => {
  try {
    let tracker = await CycleTracker.findOne({ userId: req.user._id });
    if (!tracker) {
      tracker = new CycleTracker({ userId: req.user._id });
    }

    const { enabled, daysBefore } = req.body;
    if (enabled !== undefined) tracker.notificationSettings.enabled = enabled;
    if (daysBefore !== undefined) tracker.notificationSettings.daysBefore = daysBefore;

    await tracker.save();

    return ApiResponse.success(res, { notificationSettings: tracker.notificationSettings }, 'Notification settings updated.');
  } catch (error) {
    next(error);
  }
};

// @desc    Get SOS period products (pads, tampons, painkillers)
// @route   GET /api/cycle/sos-products
// @access  Private (CUSTOMER)
const getSOSProducts = async (req, res, next) => {
  try {
    // Find Women Care category products + pain relief medicines suitable for periods
    const sosProducts = await Medicine.find({
      active: true,
      $or: [
        { category: 'Women Care' },
        { name: { $regex: /meftal|ibuprofen|combiflam/i } },
        { genericName: { $regex: /mefenamic|dicyclomine/i } }
      ]
    }).sort({ category: 1, name: 1 });

    return ApiResponse.success(res, { products: sosProducts }, 'SOS products fetched.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  logPeriod,
  getCycleData,
  updateCycle,
  deleteCycle,
  updateNotificationSettings,
  getSOSProducts
};
