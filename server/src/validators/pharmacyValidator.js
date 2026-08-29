const { body } = require('express-validator');

const pharmacyProfileValidator = [
  body('name').trim().notEmpty().withMessage('Pharmacy name is required'),
  body('phone').trim().notEmpty().withMessage('Contact phone number is required'),
  body('email').isEmail().withMessage('Valid email address is required'),
  body('address.street').notEmpty().withMessage('Street address is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('address.pincode').notEmpty().withMessage('Pincode is required'),
  body('licenseNumber').trim().notEmpty().withMessage('Drug retail license number is required')
];

const inventoryItemValidator = [
  body('medicineId').isMongoId().withMessage('Valid medicine ID is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid selling price is required'),
  body('stockQuantity').isInt({ min: 0 }).withMessage('Valid stock quantity is required')
];

module.exports = {
  pharmacyProfileValidator,
  inventoryItemValidator
};
