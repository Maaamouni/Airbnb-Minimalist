const mongoose = require('mongoose');

const MAX_MONGO_RETRIES = 10;
const RETRY_DELAY_MS = 5000;

/**
 * Connect to MongoDB using the URI from environment variables.
 * Retry during startup when MongoDB is not yet ready.
 */
const connectDB = async () => {
  for (let attempt = 1; attempt <= MAX_MONGO_RETRIES; attempt += 1) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt}/${MAX_MONGO_RETRIES} failed: ${error.message}`);
      if (attempt === MAX_MONGO_RETRIES) {
        console.error('Unable to connect to MongoDB after multiple attempts.');
        process.exit(1);
      }
      console.log(`Retrying MongoDB connection in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
};

module.exports = connectDB;
