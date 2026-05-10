const { createClient } = require('redis');

let redisClient = null;

/**
 * Initialize and connect to Redis.
 * Redis is used for caching GET /listings?city= queries.
 * If Redis fails, the app continues without cache (graceful degradation).
 */
const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis error:', err.message);
    });

    await redisClient.connect();
    console.log('✅ Redis connected');
  } catch (error) {
    console.error('⚠️  Redis connection failed (cache disabled):', error.message);
    redisClient = null; // Allow app to run without Redis
  }
};

/**
 * Returns the Redis client instance.
 * Returns null if Redis is not connected (cache disabled).
 */
const getRedisClient = () => redisClient;

module.exports = { connectRedis, getRedisClient };
