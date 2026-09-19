const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    const rawConnStr = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cyberai';
    
    // Ensure database name is cyberai if connecting to default local URI
    let connStr = rawConnStr;
    if (connStr === 'mongodb://127.0.0.1:27017' || connStr === 'mongodb://localhost:27017') {
      connStr = 'mongodb://127.0.0.1:27017/cyberai';
    }

    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 3000
    });
    
    isConnected = true;
    console.log(`[MongoDB] Successfully connected to database: ${conn.connection.name || 'cyberai'} on ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB Warning] Direct MongoDB connection not established (${error.message}). Operating with memory-backed store fallback.`);
    isConnected = false;
  }
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, getIsConnected };
