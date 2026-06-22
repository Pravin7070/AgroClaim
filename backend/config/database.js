const mongoose = require('mongoose');
const logger = require('../utils/logger');

let isConnecting = false;

const connectDB = async () => {
  if (isConnecting) return;
  isConnecting = true;

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`MongoDB Connected: ${mongoose.connection.host}`);
    isConnecting = false;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    isConnecting = false;
    setTimeout(connectDB, 5000);
  }
};

mongoose.connection.on('connected', () => {
  logger.info('MongoDB connection established');
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected. Reconnecting...');
  if (!isConnecting) {
    setTimeout(connectDB, 5000);
  }
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed through app termination');
  process.exit(0);
});

module.exports = connectDB;
