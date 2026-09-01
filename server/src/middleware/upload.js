const multer = require('multer');
const path = require('path');
const ApiError = require('../utils/ApiError');

/**
 * In-Memory Multer Storage Engine
 * Stores uploaded files directly in memory as a Buffer (req.file.buffer).
 * Eliminates all local filesystem dependencies, making uploads 100% compatible
 * with Vercel serverless functions, AWS Lambda, and read-only container runtimes (preventing EROFS).
 */
const storage = multer.memoryStorage();

// File filter: JPG, JPEG, PNG, PDF, WEBP, CSV, XLSX, XLS
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'application/pdf',
    'text/csv',
    'text/plain',
    'text/comma-separated-values',
    'application/csv',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/msexcel',
    'application/x-msexcel',
    'application/x-ms-excel',
    'application/x-excel',
    'application/x-dos_ms_excel',
    'application/xls',
    'application/x-xls',
    'application/octet-stream' // generic fallback for some browser spreadsheet uploads
  ];

  const ext = path.extname(file.originalname || '').toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.csv', '.xlsx', '.xls'];

  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(
        'Invalid file format. Supported formats: CSV, XLSX, XLS, JPG, PNG, WEBP, and PDF.'
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB max file size
  }
});

module.exports = upload;
