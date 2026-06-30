const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Set a timeout to prevent long hangs if connection string is invalid/unreachable
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/talentcrm', {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.isMockDB = false;
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    console.warn(`⚠️ Warning: MongoDB server selection failed. Falling back to in-memory Mock DB store for this session!`);
    global.isMockDB = true;
  }
};

module.exports = connectDB;

