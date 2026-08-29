const { calculateDistance, calculateDeliveryFee, estimateDeliveryTime } = require('../src/utils/geo');
const generateOrderId = require('../src/utils/generateOrderId');
const ApiError = require('../src/utils/ApiError');

describe('Utility Function Unit Tests', () => {
  describe('Geo & Distance Utils', () => {
    it('should calculate accurate Haversine distance between two coordinates', () => {
      // Connaught Place to Saket (~13 km in Delhi)
      const dist = calculateDistance(28.6328, 77.2195, 28.5244, 77.2066);
      expect(dist).toBeGreaterThan(10);
      expect(dist).toBeLessThan(15);
    });

    it('should calculate zero distance for identical coordinates', () => {
      const dist = calculateDistance(28.6328, 77.2195, 28.6328, 77.2195);
      expect(dist).toBe(0);
    });

    it('should compute base delivery fee for nearby distances', () => {
      const fee = calculateDeliveryFee(1.5);
      expect(fee).toBe(25); // Base fee
    });

    it('should compute tiered delivery fee for distances > 3km', () => {
      const fee = calculateDeliveryFee(5.0);
      expect(fee).toBeGreaterThan(25);
    });

    it('should estimate delivery time in minutes', () => {
      const eta = estimateDeliveryTime(2.0);
      expect(eta.totalMinutes).toBeGreaterThanOrEqual(15);
      expect(eta.displayText).toBeDefined();
    });
  });

  describe('Order ID Generator', () => {
    it('should generate formatted Medirush Order ID', () => {
      const orderId = generateOrderId();
      const currentYear = new Date().getFullYear();
      expect(orderId).toMatch(new RegExp(`^MR-${currentYear}-[A-Z0-9]{6}$`));
    });
  });

  describe('ApiError Class', () => {
    it('should correctly instantiate ApiError with status and message', () => {
      const err = ApiError.notFound('Pharmacy not found');
      expect(err.statusCode).toBe(404);
      expect(err.message).toBe('Pharmacy not found');
      expect(err.success).toBe(false);
    });
  });
});
