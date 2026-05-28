import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret123', {
    expiresIn: '30d',
  });
};

/**
 * @desc    Auth user & get token (Login)
 * @route   POST /api/auth/login
 * @access  Public
 */
export const authUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
      socialAccounts: user.socialAccounts
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

/**
 * @desc    Handle OAuth Callback for Meta (Facebook/Instagram)
 * @route   POST /api/auth/meta/callback
 * @access  Private
 */
export const connectMetaAccount = async (req, res) => {
  try {
    const { accessToken, profileId, username } = req.body;
    
    // In a real app, you would exchange the short-lived token for a long-lived token via Meta API here.
    
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.socialAccounts.meta = {
      accessToken,
      profileId,
      username,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days approx
    };

    await user.save();
    res.json({ message: 'Meta account connected successfully', socialAccounts: user.socialAccounts });
  } catch (error) {
    res.status(500).json({ message: 'Failed to connect Meta account', error: error.message });
  }
};
