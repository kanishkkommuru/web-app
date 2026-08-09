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

// Routes
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

// Basic health-check route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Task Manager API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Connect to MongoDB (non-blocking at module load — safe for serverless)
if (process.env.MONGODB_URI) {
  connectDB().catch((err) => logger.error('MongoDB connection error:', err));
} else {
  logger.warn('MONGODB_URI is not defined. Running without database connection.');
}

// For local development, start an HTTP server
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    logger.info(`Server running locally on port ${PORT}`);
  });
}

// Export the app for Vercel serverless runtime
module.exports = app;
