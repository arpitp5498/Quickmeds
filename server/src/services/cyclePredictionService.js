/**
 * Cycle Prediction Service
 * Calculates predicted future periods based on logged cycle history
 */

/**
 * Calculate predictions for the next N months based on cycle history
 * @param {Array} cycles - Array of logged cycle entries sorted by startDate ascending
 * @param {number} averageCycleLength - Running average cycle length
 * @param {number} averagePeriodLength - Running average period length
 * @param {number} monthsAhead - How many future cycles to predict (default: 6)
 * @returns {Array} predictions
 */
const generatePredictions = (cycles, averageCycleLength = 28, averagePeriodLength = 5, monthsAhead = 6) => {
  if (!cycles || cycles.length === 0) {
    return [];
  }

  // Sort cycles by start date descending to get the most recent
  const sorted = [...cycles].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  const lastCycle = sorted[0];
  const lastStart = new Date(lastCycle.startDate);

  const predictions = [];

  for (let i = 1; i <= monthsAhead; i++) {
    const predictedStart = new Date(lastStart);
    predictedStart.setDate(predictedStart.getDate() + (averageCycleLength * i));

    const predictedEnd = new Date(predictedStart);
    predictedEnd.setDate(predictedEnd.getDate() + averagePeriodLength);

    // Fertility window: approximately days 10-16 of the cycle (ovulation ~day 14)
    const ovulationDay = new Date(predictedStart);
    ovulationDay.setDate(ovulationDay.getDate() + Math.round(averageCycleLength / 2) - 1);

    const fertilityStart = new Date(ovulationDay);
    fertilityStart.setDate(fertilityStart.getDate() - 4);

    const fertilityEnd = new Date(ovulationDay);
    fertilityEnd.setDate(fertilityEnd.getDate() + 2);

    predictions.push({
      predictedStart,
      predictedEnd,
      cycleDay: i,
      fertility: {
        start: fertilityStart,
        end: fertilityEnd,
        ovulationDay
      }
    });
  }

  return predictions;
};

/**
 * Recalculate averages from cycle history
 * @param {Array} cycles - All logged cycles
 * @returns {{ averageCycleLength: number, averagePeriodLength: number }}
 */
const recalculateAverages = (cycles) => {
  if (!cycles || cycles.length === 0) {
    return { averageCycleLength: 28, averagePeriodLength: 5 };
  }

  // Average period length
  const periodLengths = cycles
    .filter(c => c.periodLength > 0)
    .map(c => c.periodLength);

  const averagePeriodLength = periodLengths.length > 0
    ? Math.round(periodLengths.reduce((sum, l) => sum + l, 0) / periodLengths.length)
    : 5;

  // Average cycle length: difference between consecutive cycle start dates
  if (cycles.length < 2) {
    return { averageCycleLength: 28, averagePeriodLength };
  }

  const sorted = [...cycles].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  const cycleLengths = [];

  for (let i = 1; i < sorted.length; i++) {
    const diffMs = new Date(sorted[i].startDate) - new Date(sorted[i - 1].startDate);
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays > 15 && diffDays < 60) {
      // Only count reasonable cycle lengths (15-60 days)
      cycleLengths.push(diffDays);
    }
  }

  const averageCycleLength = cycleLengths.length > 0
    ? Math.round(cycleLengths.reduce((sum, l) => sum + l, 0) / cycleLengths.length)
    : 28;

  return { averageCycleLength, averagePeriodLength };
};

module.exports = {
  generatePredictions,
  recalculateAverages
};
