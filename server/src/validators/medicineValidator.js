const { body, query } = require('express-validator');

const medicineValidator = [
  body('name').trim().notEmpty().withMessage('Medicine name is required'),
  body('genericName').trim().notEmpty().withMessage('Generic composition is required'),
  body('brand').trim().notEmpty().withMessage('Brand name is required'),
  body('manufacturer').trim().notEmpty().withMessage('Manufacturer name is required'),
  body('strength').trim().notEmpty().withMessage('Strength is required'),
  body('dosageForm').notEmpty().withMessage('Dosage form is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('mrp').isFloat({ min: 0 }).withMessage('Valid MRP is required')
];

const medicineSearchValidator = [
  query('q').optional().trim(),
  query('category').optional().trim(),
  query('requiresPrescription').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
];

module.exports = {
  medicineValidator,
  medicineSearchValidator
};
