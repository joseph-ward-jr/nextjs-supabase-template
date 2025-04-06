/**
 * Redis client utility
 * Provides a singleton Redis client instance for the application
 */
import Redis from 'ioredis';

let redisClient: Redis | null = null;

/**
 * Get the Redis client instance
 * Creates a new instance if one doesn't exist
 * @returns Redis client instance
 */
export function getRedisClient(): Redis {
  if (redisClient) {
    return redisClient;
  }

  // Check if environment variables are set
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    throw new Error('Missing env.REDIS_URL');
  }

  // Create a new Redis client
  redisClient = new Redis(redisUrl);

  // Handle Redis connection errors
  redisClient.on('error', (error) => {
    console.error('Redis connection error:', error);
  });

  return redisClient;
}

/**
 * Close the Redis client connection
 * Useful for cleanup during application shutdown
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
