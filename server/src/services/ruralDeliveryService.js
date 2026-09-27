/**
 * Rural Delivery Service
 * Extended delivery zone calculator for areas beyond the standard 15km hyperlocal radius.
 * File: server/src/services/ruralDeliveryService.js
 */

const URBAN_RADIUS_KM = 15;
const SUBURBAN_RADIUS_KM = 50;
const RURAL_RADIUS_KM = 200;

/**
 * Determine if delivery is to a rural/extended area
 * @param {number} distanceKm - Distance from nearest pharmacy
 * @returns {Object} { isRural, zone, estimatedDays, deliveryFee, description }
 */
const classifyDeliveryZone = (distanceKm) => {
  if (distanceKm <= URBAN_RADIUS_KM) {
    return {
      isRural: false,
      zone: 'URBAN',
      estimatedDays: 0,
      estimatedMinutes: Math.max(15, Math.ceil(10 + (distanceKm / 25) * 60)),
      deliveryFee: calculateUrbanDeliveryFee(distanceKm),
      description: 'Standard hyperlocal delivery'
    };
  }

  if (distanceKm <= SUBURBAN_RADIUS_KM) {
    return {
      isRural: true,
      zone: 'SUBURBAN',
      estimatedDays: 1,
      estimatedMinutes: null,
      deliveryFee: 49,
      description: 'Same-day or next-day delivery via partner courier'
    };
  }

  if (distanceKm <= RURAL_RADIUS_KM) {
    return {
      isRural: true,
      zone: 'RURAL',
      estimatedDays: 2,
      estimatedMinutes: null,
      deliveryFee: 79,
      description: 'Delivery in 1-2 business days via India Post / courier network'
    };
  }

  return {
    isRural: true,
    zone: 'REMOTE',
    estimatedDays: 4,
    estimatedMinutes: null,
    deliveryFee: 99,
    description: 'Delivery in 3-5 business days via India Post Speed Post'
  };
};

/**
 * Calculate urban delivery fee based on distance
 * @param {number} distanceKm
 * @returns {number} Fee in INR
 */
const calculateUrbanDeliveryFee = (distanceKm) => {
  if (distanceKm <= 2) return 15;
  if (distanceKm <= 5) return 25;
  if (distanceKm <= 10) return 35;
  return 45;
};

/**
 * Get community drop points for rural areas
 * @param {string} pincode
 * @returns {Array} Available drop points
 */
const getCommunityDropPoints = (pincode) => {
  // In production, this would query a database of registered community health centers,
  // Gram Panchayat offices, India Post offices, and Jan Aushadhi Kendras
  return [
    {
      type: 'PHC',
      name: 'Primary Health Centre',
      description: 'Government Primary Health Centre — medicines can be collected during working hours',
      icon: '🏥'
    },
    {
      type: 'POST_OFFICE',
      name: 'India Post Office',
      description: 'Nearest post office — Speed Post delivery with SMS notification',
      icon: '📮'
    },
    {
      type: 'JAN_AUSHADHI',
      name: 'Jan Aushadhi Kendra',
      description: 'Government generic medicine store — affordable alternatives available',
      icon: '💊'
    }
  ];
};

/**
 * Check if 30-minute rush delivery is eligible
 * @param {number} distanceKm
 * @param {Object} pharmacy - Pharmacy document
 * @returns {Object} { eligible, reason }
 */
const check30MinEligibility = (distanceKm, pharmacy) => {
  if (distanceKm > 3.5) {
    return { eligible: false, reason: 'Distance exceeds 3.5 km limit for rush delivery' };
  }
  if (!pharmacy?.operatingHours?.is24x7) {
    const now = new Date();
    const hour = now.getHours();
    if (hour < 8 || hour > 22) {
      return { eligible: false, reason: 'Pharmacy is not open 24x7 for late-night rush delivery' };
    }
  }
  return { eligible: true, reason: '⚡ 30-Min Rush Delivery Eligible' };
};

module.exports = {
  classifyDeliveryZone,
  calculateUrbanDeliveryFee,
  getCommunityDropPoints,
  check30MinEligibility,
  URBAN_RADIUS_KM,
  SUBURBAN_RADIUS_KM,
  RURAL_RADIUS_KM
};
