const { createClient } = require('redis');

let redisClient = null;
let redisReady = false;

const connectRedis = async () => {
  try {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
      socket: {
        connectTimeout: 1000,
        reconnectStrategy: false,
      },
    });

    redisClient.on('ready', () => {
      redisReady = true;
    });

    redisClient.on('end', () => {
      redisReady = false;
    });

    redisClient.on('error', (err) => {
      redisReady = false;
      console.error('Redis error:', err.message);
    });

    await redisClient.connect();
    redisReady = true;
    console.log('Redis connected');
  } catch (error) {
    console.error('Redis connection failed (cache disabled):', error.message);
    redisClient = null;
    redisReady = false;
  }
};

const getRedisClient = () => (redisReady ? redisClient : null);
const isRedisReady = () => redisReady;

const deleteByPattern = async (pattern) => {
  const redis = getRedisClient();
  if (!redis) return 0;

  const keys = [];
  for await (const item of redis.scanIterator({ MATCH: pattern, COUNT: 100 })) {
    // Some versions yield an array of keys per iteration, others yield individual strings
    if (Array.isArray(item)) {
      keys.push(...item);
    } else {
      keys.push(item);
    }
  }

  if (!keys.length) return 0;
  await redis.del(keys);
  return keys.length;
};

module.exports = { connectRedis, getRedisClient, isRedisReady, deleteByPattern };
