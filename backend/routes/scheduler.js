import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// GET /api/scheduler/channels -> Retrieve connected social accounts
router.get('/channels', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM channels ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching channels:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/scheduler/channels -> Connect a new simulated channel
router.post('/channels', async (req, res) => {
  const { platform, accountName, avatar, followersCount } = req.body;
  if (!platform || !accountName) {
    return res.status(400).json({ error: 'Platform and account name are required' });
  }

  const channelId = `chan-${Date.now()}`;
  const defaultAvatar = avatar || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80';
  const defaultFollowers = followersCount || Math.floor(Math.random() * 5000) + 100;

  try {
    await pool.query(
      'INSERT INTO channels (id, platform, accountName, avatar, followersCount, isConnected) VALUES (?, ?, ?, ?, ?, ?)',
      [channelId, platform, accountName, defaultAvatar, defaultFollowers, true]
    );

    const [rows] = await pool.query('SELECT * FROM channels WHERE id = ?', [channelId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error connecting channel:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/scheduler/channels/:id -> Disconnect a social channel
router.delete('/channels/:id', async (req, res) => {
  const channelId = req.params.id;
  try {
    const [result] = await pool.query('DELETE FROM channels WHERE id = ?', [channelId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Channel not found' });
    }
    res.json({ message: 'Channel disconnected successfully' });
  } catch (error) {
    console.error('Error disconnecting channel:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/scheduler/posts -> Retrieve all scheduled/published posts
router.get('/posts', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM scheduler_posts ORDER BY createdAt DESC');
    const posts = rows.map(row => ({
      ...row,
      platforms: JSON.parse(row.platforms)
    }));
    res.json(posts);
  } catch (error) {
    console.error('Error fetching scheduled posts:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/scheduler/posts -> Create or schedule a new post
router.post('/posts', async (req, res) => {
  const { content, mediaUrl, platforms, status, scheduledTime } = req.body;
  if (!content) {
    return res.status(400).json({ error: 'Content is required' });
  }
  if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
    return res.status(400).json({ error: 'At least one platform must be selected' });
  }

  const postId = `sched-${Date.now()}`;
  const platformsJson = JSON.stringify(platforms);
  const postStatus = status || 'queued';
  
  // Format scheduled time correctly (ISO string to MySQL format if provided, else null)
  let mysqlScheduledTime = null;
  if (scheduledTime && postStatus === 'queued') {
    mysqlScheduledTime = new Date(scheduledTime).toISOString().slice(0, 19).replace('T', ' ');
  }

  try {
    // If status is immediately published ('sent'), let's generate simulated analytics
    const reach = postStatus === 'sent' ? Math.floor(Math.random() * 2000) + 150 : 0;
    const likes = postStatus === 'sent' ? Math.floor(reach * (0.05 + Math.random() * 0.1)) : 0;
    const comments = postStatus === 'sent' ? Math.floor(likes * (0.1 + Math.random() * 0.2)) : 0;
    const shares = postStatus === 'sent' ? Math.floor(likes * (0.02 + Math.random() * 0.05)) : 0;

    await pool.query(
      'INSERT INTO scheduler_posts (id, content, mediaUrl, platforms, status, scheduledTime, likesCount, commentsCount, sharesCount, reachCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [postId, content, mediaUrl || null, platformsJson, postStatus, mysqlScheduledTime, likes, comments, shares, reach]
    );

    const [rows] = await pool.query('SELECT * FROM scheduler_posts WHERE id = ?', [postId]);
    const newPost = {
      ...rows[0],
      platforms: JSON.parse(rows[0].platforms)
    };
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating scheduled post:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/scheduler/posts/:id -> Delete a scheduled post or draft
router.delete('/posts/:id', async (req, res) => {
  const postId = req.params.id;
  try {
    const [result] = await pool.query('DELETE FROM scheduler_posts WHERE id = ?', [postId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/scheduler/posts/:id/publish -> Publish a queued post immediately
router.post('/posts/:id/publish', async (req, res) => {
  const postId = req.params.id;
  try {
    // Generate simulated analytics
    const reach = Math.floor(Math.random() * 2500) + 200;
    const likes = Math.floor(reach * (0.05 + Math.random() * 0.1));
    const comments = Math.floor(likes * (0.1 + Math.random() * 0.2));
    const shares = Math.floor(likes * (0.02 + Math.random() * 0.05));
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const [result] = await pool.query(
      'UPDATE scheduler_posts SET status = "sent", scheduledTime = ?, likesCount = ?, commentsCount = ?, sharesCount = ?, reachCount = ? WHERE id = ?',
      [now, likes, comments, shares, reach, postId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const [rows] = await pool.query('SELECT * FROM scheduler_posts WHERE id = ?', [postId]);
    const updatedPost = {
      ...rows[0],
      platforms: JSON.parse(rows[0].platforms)
    };
    res.json(updatedPost);
  } catch (error) {
    console.error('Error publishing post immediately:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
