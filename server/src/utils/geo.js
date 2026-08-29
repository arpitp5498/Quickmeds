/**
 * Calculate distance between two coordinates in kilometers using Haversine formula
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return 0;
  }
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // Round to 1 decimal place (e.g. 2.4 km)
};

/**
 * Estimate delivery time based on distance (km) and base preparation buffer
 */
const estimateDeliveryTime = (distanceKm) => {
  const prepTimeMinutes = 10; // 10 mins packaging & verification
  const avgSpeedKmh = 25; // 25 km/h urban two-wheeler delivery
  const travelTimeMinutes = Math.ceil((distanceKm / avgSpeedKmh) * 60);
  const totalMinutes = prepTimeMinutes + travelTimeMinutes;
  return {
    prepTimeMinutes,
    travelTimeMinutes,
    totalMinutes: Math.max(15, totalMinutes),
    displayText: `${Math.max(15, totalMinutes)} mins`
  };
};

/**
 * Calculate dynamic delivery fee based on distance
 */
const calculateDeliveryFee = (distanceKm) => {
  const baseFee = 25; // Base fee for up to 3km
  if (distanceKm <= 3) return baseFee;
  const extraKm = distanceKm - 3;
  const extraFee = Math.ceil(extraKm * 8); // ₹8 per extra km
  return Math.min(120, baseFee + extraFee);
};

module.exports = {
  calculateDistance,
  estimateDeliveryTime,
  calculateDeliveryFee
};
