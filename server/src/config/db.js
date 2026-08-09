const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB Atlas
 * Implements retry logic with exponential backoff
 */
const connectDB = async () => {
  // Reuse existing connection (important for serverless warm starts)
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const MAX_RETRIES = 3;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      logger.info(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      retries += 1;
      logger.error(`MongoDB connection attempt ${retries} failed: ${error.message}`);

      if (retries === MAX_RETRIES) {
        // Throw instead of process.exit() — safe for serverless
        throw new Error(`MongoDB connection failed after ${MAX_RETRIES} attempts: ${error.message}`);
      }

      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, retries), 10000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

module.exports = connectDB;
