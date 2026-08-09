const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const connectDB = require('./config/db');
const logger = require('./utils/logger');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Task Manager API is running' });
});

// Port configuration
const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    // Only connect to DB if URI is provided, to avoid crash on initial deploy without env vars
    if (process.env.MONGODB_URI) {
      await connectDB();
    } else {
      logger.warn('MONGODB_URI is not defined. Running without database connection.');
    }
    
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
