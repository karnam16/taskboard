import { createClient } from 'redis';
import { config } from './env.js';
import { logger } from './logger.js';

let redisClient = null;

export const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: config.redis.url,
    });

    redisClient.on('error', err => {
      logger.error('Redis error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
};

export const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return redisClient;
};

export const disconnectRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
};
