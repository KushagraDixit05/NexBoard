const { NODE_ENV } = require('../config/env');

const errorHandler = (err, req, res, next) => {
  if (NODE_ENV !== 'test') {
    console.error('❌ Error:', err);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field:   e.path,
      message: e.message,
    }));
    return res.status(400).json({ error: 'Validation error', details: errors });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ error: `Duplicate value for '${field}'.` });
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Invalid ${err.path}: ${err.value}` });
  }

  // Custom app errors (from AppError utility)
  if (err.isOperational && err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // Default: Internal server error
  res.status(500).json({
    error: NODE_ENV === 'production' ? 'Internal server error.' : err.message,
  });
};

module.exports = errorHandler;
