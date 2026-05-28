import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// GET /api/posts -> Fetch all feed posts (with author details and like flags)
router.get('/', async (req, res) => {
  try {
    // 1. Fetch posts joined with user details
    const [rows] = await pool.query(`
      SELECT 
        p.id, p.content, p.image, p.tags, p.likesCount, p.commentsCount, p.timestamp, p.createdAt,
        u.id as authorId, u.username as authorUsername, u.fullName as authorFullName, u.avatar as authorAvatar
      FROM posts p
      JOIN users u ON p.userId = u.id
      ORDER BY p.createdAt DESC
    `);

    // 2. Fetch posts liked by current user
    const [likesRows] = await pool.query(
      'SELECT postId FROM likes WHERE userId = ?',
      ['current_user_1']
    );
    const likedPostIds = new Set(likesRows.map(row => row.postId));

    // 3. Format response to match frontend expectations
    const posts = rows.map(row => ({
      id: row.id,
      content: row.content,
      image: row.image,
      tags: row.tags ? JSON.parse(row.tags) : [],
      likesCount: row.likesCount,
      commentsCount: row.commentsCount,
      timestamp: row.timestamp,
      isLiked: likedPostIds.has(row.id),
      author: {
        id: row.authorId,
        username: row.authorUsername,
        fullName: row.authorFullName,
        avatar: row.authorAvatar
      }
    }));

    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts feed:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/posts -> Create a new post
router.post('/', async (req, res) => {
  const { content, image, tags } = req.body;
  if (!content && !image) {
    return res.status(400).json({ error: 'Content or image is required' });
  }

  const postId = `post-${Date.now()}`;
  const userId = 'current_user_1';
  const tagsJson = JSON.stringify(tags || []);

  try {
    // 1. Insert new post
    await pool.query(
      'INSERT INTO posts (id, userId, content, image, tags, likesCount, commentsCount, timestamp) VALUES (?, ?, ?, ?, ?, 0, 0, ?)',
      [postId, userId, content || '', image || null, tagsJson, 'Just now']
    );

    // 2. Increment user's posts count
    await pool.query(
      'UPDATE users SET postsCount = postsCount + 1 WHERE id = ?',
      [userId]
    );

    // 3. Retrieve user profile info to attach to new post
    const [userRows] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    const author = userRows[0];

    const newPost = {
      id: postId,
      content,
      image,
      tags: tags || [],
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      timestamp: 'Just now',
      author: {
        id: author.id,
        username: author.username,
        fullName: author.fullName,
        avatar: author.avatar
      }
    };

    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/posts/:id/like -> Toggle like status of a post
router.post('/:id/like', async (req, res) => {
  const postId = req.params.id;
  const userId = 'current_user_1';

  try {
    // 1. Check if like already exists
    const [rows] = await pool.query(
      'SELECT id FROM likes WHERE userId = ? AND postId = ?',
      [userId, postId]
    );

    let isLikedNow = false;

    if (rows.length > 0) {
      // 2a. Delete like
      await pool.query('DELETE FROM likes WHERE userId = ? AND postId = ?', [userId, postId]);
      // 2b. Decrement likes count
      await pool.query('UPDATE posts SET likesCount = GREATEST(likesCount - 1, 0) WHERE id = ?', [postId]);
      isLikedNow = false;
    } else {
      // 3a. Add like
      await pool.query('INSERT INTO likes (userId, postId) VALUES (?, ?)', [userId, postId]);
      // 3b. Increment likes count
      await pool.query('UPDATE posts SET likesCount = likesCount + 1 WHERE id = ?', [postId]);
      isLikedNow = true;
    }

    // 4. Refetch the updated post
    const [postRows] = await pool.query(`
      SELECT 
        p.id, p.content, p.image, p.tags, p.likesCount, p.commentsCount, p.timestamp,
        u.id as authorId, u.username as authorUsername, u.fullName as authorFullName, u.avatar as authorAvatar
      FROM posts p
      JOIN users u ON p.userId = u.id
      WHERE p.id = ?
    `, [postId]);

    if (postRows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const row = postRows[0];
    const updatedPost = {
      id: row.id,
      content: row.content,
      image: row.image,
      tags: row.tags ? JSON.parse(row.tags) : [],
      likesCount: row.likesCount,
      commentsCount: row.commentsCount,
      timestamp: row.timestamp,
      isLiked: isLikedNow,
      author: {
        id: row.authorId,
        username: row.authorUsername,
        fullName: row.authorFullName,
        avatar: row.authorAvatar
      }
    };

    res.json(updatedPost);
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
