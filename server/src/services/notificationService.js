const Notification = require('../models/Notification');
const { getIO } = require('../config/socket');
const logger = require('../utils/logger');

const sendNotification = async ({ userId, type, title, message, link = '', data = {} }) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      link,
      data
    });

    const io = getIO();
    // Emit to specific user channel
    io.to(`user:${userId}`).emit('notification', notification);

    logger.info(`Notification sent to user ${userId}: ${title}`);
    return notification;
  } catch (error) {
    logger.error(`Error sending notification: ${error.message}`);
    return null;
  }
};

const notifyAdmins = async ({ type, title, message, link = '', data = {} }) => {
  try {
    const io = getIO();
    io.to('admin:room').emit('admin_alert', {
      type,
      title,
      message,
      link,
      data,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Error sending admin alert: ${error.message}`);
  }
};

module.exports = {
  sendNotification,
  notifyAdmins
};
