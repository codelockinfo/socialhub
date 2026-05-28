import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import postsRouter from './routes/posts.js';
import usersRouter from './routes/users.js';
import schedulerRouter from './routes/scheduler.js';
import authRoutes from './routes/authRoutes.js';
import publishRoutes from './routes/publishRoutes.js';
import pool from './config/db.js';
import { setupDb } from './config/setupDb.js';
import connectDB from './config/mongoDb.js'; // MongoDB connection

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend cross-origin requests
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Express JSON body parsing middleware
app.use(express.json());

// API Routes mounting
app.use('/api/posts', postsRouter);
app.use('/api', usersRouter); // Mounts /me, /me (PUT), and /trends
app.use('/api/scheduler', schedulerRouter);

// New MongoDB / OAuth Routes
app.use('/api/auth', authRoutes);
app.use('/api/publish', publishRoutes);

// Root Health Check Endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Welcome to the SocialHub API server',
    version: '1.0.0'
  });
});

// Background Publisher Cron Job (Runs every 10 seconds)
setInterval(async () => {
  try {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const [duePosts] = await pool.query(
      'SELECT * FROM scheduler_posts WHERE status = "queued" AND scheduledTime <= ?',
      [now]
    );

    if (duePosts.length > 0) {
      console.log(`[Scheduler] Found ${duePosts.length} due posts to publish.`);

      for (const post of duePosts) {
        // Generate simulated analytics
        const reach = Math.floor(Math.random() * 2000) + 150;
        const likes = Math.floor(reach * (0.05 + Math.random() * 0.1));
        const comments = Math.floor(likes * (0.1 + Math.random() * 0.2));
        const shares = Math.floor(likes * (0.02 + Math.random() * 0.05));
        const publishTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

        await pool.query(
          'UPDATE scheduler_posts SET status = "sent", scheduledTime = ?, likesCount = ?, commentsCount = ?, sharesCount = ?, reachCount = ? WHERE id = ?',
          [publishTime, likes, comments, shares, reach, post.id]
        );

        console.log(`[Scheduler] Automatically published post "${post.id}" to platforms: ${post.platforms} 🎉`);
      }
    }
  } catch (error) {
    console.error('[Scheduler Error] Error running background publisher:', error);
  }
}, 10000);

// Auto-initialize database tables before server starts
try {
  console.log('🔄 Checking and initializing MySQL database tables...');
  await setupDb();
  
  // Connect to MongoDB
  if (process.env.MONGO_URI) {
    await connectDB();
  } else {
    console.warn('⚠️ MONGO_URI not found in .env. Skipping MongoDB connection.');
  }
} catch (error) {
  console.error('❌ Failed to auto-setup database on start:', error);
}

// Start listening on configured PORT
app.listen(PORT, () => {
  console.log(`⚡ SocialHub API Server is running on http://localhost:${PORT}`);
});
