// Vercel Serverless Function Entry Point
// Wraps the Express app for Vercel's serverless execution model
const { app } = require('../server/src/index');

module.exports = app;
