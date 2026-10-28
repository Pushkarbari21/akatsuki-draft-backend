import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import { pathToFileURL } from 'node:url';

// Route imports
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send("Akatsuki-draft backend in running")
});

// Routes
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/admin', adminRoutes);
app.use('/ai', aiRoutes);

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  connectDB()
    .then(() => {
      const port = process.env.PORT || 5000;
      app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
      });
    })
    .catch((error) => {
      console.error('Server startup failed:', error);
      process.exitCode = 1;
    });
}

export default app;
