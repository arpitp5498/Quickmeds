const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Transform non-ApiError into ApiError
  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal Server Error';

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
      message = `Invalid ID format for resource: ${err.value}`;
      statusCode = 400;
    }

    // Mongoose duplicate key error (code 11000)
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue || {})[0] || 'field';
      message = `A record with this ${field} already exists.`;
      statusCode = 409;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map((el) => el.message);
      message = 'Validation failed';
      error = new ApiError(400, message, errors);
    }

    // Multer file upload errors
    if (err.name === 'MulterError') {
      if (err.code === 'LIMIT_FILE_SIZE') {
        message = 'File is too large. Please upload a file within the allowed size (max 15MB).';
      } else {
        message = `Upload error: ${err.message}`;
      }
      statusCode = 400;
    }

    // Filesystem / EROFS runtime error sanitization
    if (err.code === 'EROFS' || /read-only file system|var\/task/i.test(err.message || '')) {
      message = 'Unable to process this file on the server. Please try again or use a supported CSV/XLSX/XLS file.';
      statusCode = 400;
    }

    if (!(error instanceof ApiError)) {
      error = new ApiError(statusCode, message, [], err.stack);
    }
  }

  // Log error
  logger.error(error.message, {
    statusCode: error.statusCode,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  const response = {
    success: false,
    message: error.message,
    errors: error.errors || []
  };

  // Only attach stack in local development
  if (env.NODE_ENV === 'development' && error.statusCode >= 500) {
    response.stack = error.stack;
  }

  res.status(error.statusCode || 500).json(response);
};

module.exports = errorHandler;
