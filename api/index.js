// Export the HTTP server so the same function handles API requests and socket upgrades.
const { httpServer } = require('../server/src/index');
module.exports = httpServer;
