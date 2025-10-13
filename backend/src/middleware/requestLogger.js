const morgan = require('morgan');
const logger = require('../utils/logger');

// Create a stream object with a 'write' function that will be used by morgan
const stream = {
  write: (message) => {
    logger.http(message.trim());
  }
};

// Skip logging for health check endpoints in production
const skip = (req) => {
  if (process.env.NODE_ENV === 'production') {
    return req.url === '/health' || req.url === '/api/health';
  }
  return false;
};

// Morgan format
const format = process.env.NODE_ENV === 'production'
  ? 'combined'
  : ':method :url :status :res[content-length] - :response-time ms';

// Morgan middleware
const requestLogger = morgan(format, { stream, skip });

module.exports = requestLogger;

