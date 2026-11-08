const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

const logAction = async ({
  actorId,
  actorRole,
  action,
  entity,
  entityId = '',
  description,
  ipAddress = '',
  metadata = {}
}) => {
  try {
    const logEntry = await AuditLog.create({
      actorId,
      actorRole,
      action,
      entity,
      entityId,
      description,
      ipAddress,
      metadata
    });
    return logEntry;
  } catch (error) {
    logger.error(`Error logging audit action: ${error.message}`);
    if (require('mongoose').transactionAsyncLocalStorage?.getStore()?.session) throw error;
    return null;
  }
};

module.exports = {
  logAction
};
