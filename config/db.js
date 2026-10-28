import mongoose from 'mongoose';

// Connect to MongoDB and wait before starting the server
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); // Stop the server if DB connection fails
  }
};

export default connectDB;
