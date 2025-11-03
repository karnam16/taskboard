import mongoose from 'mongoose';
import { config } from './env.js';
import { logger } from './logger.js';

export const connectDatabase = async () => {
  try {
    await mongoose.connect(config.mongodb.uri);
    logger.info('MongoDB connected successfully');

    mongoose.connection.on('error', err => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
};
