import 'dotenv/config';
import app from '../server.js';
import connectDB from '../config/db.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (error) {
    console.error('MongoDB connection error:', error);
    return res.status(500).json({ error: 'Database connection failed' });
  }

  return app(req, res);
}
