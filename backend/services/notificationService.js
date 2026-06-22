const Notification = require('../models/Notification');
const logger = require('../utils/logger');

let io;

const initializeSocket = (socketIO) => {
  io = socketIO;
};

const userSockets = new Map();

const registerUser = (userId, socketId) => {
  userSockets.set(userId.toString(), socketId);
  logger.info(`User ${userId} registered with socket ${socketId}`);
};

const unregisterUser = (userId) => {
  userSockets.delete(userId.toString());
  logger.info(`User ${userId} unregistered`);
};

const createNotification = async (userId, userType, type, message, metadata = {}) => {
  try {
    const notification = await Notification.create({
      userId,
      userType,
      type,
      message,
      metadata
    });

    const socketId = userSockets.get(userId.toString());
    if (socketId && io) {
      io.to(socketId).emit('notification', {
        id: notification._id,
        type: notification.type,
        message: notification.message,
        metadata: notification.metadata,
        createdAt: notification.createdAt
      });
    }

    return notification;
  } catch (error) {
    logger.error(`Failed to create notification: ${error.message}`);
    throw error;
  }
};

module.exports = {
  initializeSocket,
  registerUser,
  unregisterUser,
  createNotification,
  userSockets
};
