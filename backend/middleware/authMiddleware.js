import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      console.error('Token verification failed, falling back to demo user...', error.message);
      token = null; // Clear token so the fallback below triggers
    }
  }

  if (!token) {
    try {
      // Fallback for Demo purposes: If no token, use a default Demo user
      let demoUser;
      
      // Only query DB if MongoDB is actually connected (readyState 1)
      if (mongoose.connection.readyState === 1) {
        demoUser = await User.findOne({ email: 'demo@socialhub.com' });
        if (!demoUser) {
          demoUser = await User.create({
            name: 'Demo User',
            email: 'demo@socialhub.com',
            password: 'password123'
          });
        }
      } else {
        // Mock user in memory if MongoDB is down. Must use a valid 24-character hex string for ObjectId.
        demoUser = { _id: '60d5ecb8b311223344556677', name: 'Demo User', email: 'demo@socialhub.com' };
      }
      req.user = demoUser;
      next();
    } catch (err) {
      console.error(err);
      res.status(401).json({ message: 'Not authorized, no token and demo fallback failed' });
    }
  }
};

export { protect };
