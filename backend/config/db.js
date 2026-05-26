const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the URI from environment variables.
 * Exits process on failure to prevent app from running without DB.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    console.error("Make sure MongoDB is running on 127.0.0.1:27017 or update MONGO_URI in backend/.env.");
    process.exit(1); // Exit with failure code
  }
};

module.exports = connectDB;
