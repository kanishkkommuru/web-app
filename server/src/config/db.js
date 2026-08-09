const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB Atlas
 * Implements retry logic with exponential backoff
 */
const connectDB = async () => {
  const MAX_RETRIES = 5;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      logger.info(`MongoDB Connected: ${conn.connection.host}`);
      
      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected. Attempting reconnection...');
      });

      return conn;
    } catch (error) {
      retries += 1;
      logger.error(`MongoDB connection attempt ${retries} failed: ${error.message}`);
      
      if (retries === MAX_RETRIES) {
        logger.error('Max retries reached. Exiting...');
        process.exit(1);
      }

      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, retries), 30000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

module.exports = connectDB;
