import { logger } from '../config/logger.js';

export const errorHandler = (err, req, res, next) => {
  logger.error(err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors,
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format',
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      error: 'Duplicate key error',
      field: Object.keys(err.keyPattern)[0],
    });
  }

  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error',
  });
};

export const notFound = (req, res) => {
  res.status(404).json({ error: 'Route not found' });
};
