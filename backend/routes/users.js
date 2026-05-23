import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// GET /api/users/me -> Retrieve current user
router.get('/me', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', ['current_user_1']);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/users/me -> Update user profile details
router.put('/me', async (req, res) => {
  const { fullName, bio } = req.body;
  if (!fullName) {
    return res.status(400).json({ error: 'Full Name is required' });
  }

  try {
    await pool.query(
      'UPDATE users SET fullName = ?, bio = ? WHERE id = ?',
      [fullName, bio || '', 'current_user_1']
    );
    
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', ['current_user_1']);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/users/trends -> Get trending topics
router.get('/trends', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM trends');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching trends:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
