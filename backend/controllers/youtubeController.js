import { google } from 'googleapis';
import fs from 'fs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import YoutubeVideo from '../models/YoutubeVideo.js';

// In-memory fallback database when MongoDB is offline
const memoryDb = {
  users: {},
  videos: []
};

// Setup OAuth2 Client
const getOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

// @desc    Generate Google Auth URL
// @route   GET /api/youtube/auth
export const getAuthUrl = (req, res) => {
  const oauth2Client = getOAuth2Client();
  
  // Scopes needed for uploading and reading youtube data
  const scopes = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/userinfo.profile',
  ];

  const userId = req.user?._id ? req.user._id.toString() : '60d5ecb8b311223344556677';

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // ensures we get a refresh token
    scope: scopes,
    prompt: 'consent', // force prompt to ensure refresh token is always returned
    state: userId // pass user ID in state
  });

  res.json({ url });
};

// @desc    Handle Google Auth Callback
// @route   GET /api/youtube/auth/callback
export const handleAuthCallback = async (req, res) => {
  try {
    const { code, state } = req.query; // state contains user ID
    
    if (!code || !state) {
      return res.status(400).send('Missing code or state parameter');
    }

    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user profile info to save username
    const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
    const userInfo = await oauth2.userinfo.get();

    const youtubeData = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: new Date(tokens.expiry_date),
      profileId: userInfo.data.id,
      username: userInfo.data.name || 'YouTube Account'
    };

    // Find the user and update their socialAccounts
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(state);
      if (!user) {
        return res.status(404).send('User not found');
      }

      user.socialAccounts.youtube = {
        accessToken: youtubeData.accessToken,
        refreshToken: youtubeData.refreshToken || user.socialAccounts.youtube?.refreshToken,
        expiresAt: youtubeData.expiresAt,
        profileId: youtubeData.profileId,
        username: youtubeData.username
      };

      await user.save();
    } else {
      console.log(`[YouTube Auth Fallback] Saving token in memory for user ${state}`);
      const user = memoryDb.users[state] || { _id: state, socialAccounts: { youtube: {} } };
      user.socialAccounts.youtube = {
        accessToken: youtubeData.accessToken,
        refreshToken: youtubeData.refreshToken || user.socialAccounts.youtube?.refreshToken,
        expiresAt: youtubeData.expiresAt,
        profileId: youtubeData.profileId,
        username: youtubeData.username
      };
      memoryDb.users[state] = user;
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    // Redirect to frontend success page
    res.redirect(`${frontendUrl}/youtube/integrations?success=true`);
  } catch (error) {
    console.error('YouTube Auth Error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/youtube/integrations?error=auth_failed`);
  }
};

// @desc    Upload Video to YouTube
// @route   POST /api/youtube/upload
export const uploadVideo = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    let user;

    if (mongoose.connection.readyState === 1) {
      user = await User.findById(userId);
    } else {
      user = memoryDb.users[userId];
    }

    if (!user || !user.socialAccounts?.youtube?.accessToken) {
      return res.status(401).json({ message: 'YouTube account not connected' });
    }

    const { title, description, tags, privacyStatus } = req.body;
    const videoFile = req.files['video'] ? req.files['video'][0] : null;
    const thumbnailFile = req.files['thumbnail'] ? req.files['thumbnail'][0] : null;

    if (!videoFile) {
      return res.status(400).json({ message: 'Video file is required' });
    }

    const oauth2Client = getOAuth2Client();
    
    // Set credentials. If access token is expired, oauth2Client will use refresh_token automatically
    oauth2Client.setCredentials({
      access_token: user.socialAccounts.youtube.accessToken,
      refresh_token: user.socialAccounts.youtube.refreshToken,
      expiry_date: user.socialAccounts.youtube.expiresAt ? new Date(user.socialAccounts.youtube.expiresAt).getTime() : null
    });

    // Check if we got a newly refreshed token during the request
    oauth2Client.on('tokens', async (tokens) => {
      if (tokens.refresh_token) {
        user.socialAccounts.youtube.refreshToken = tokens.refresh_token;
      }
      user.socialAccounts.youtube.accessToken = tokens.access_token;
      user.socialAccounts.youtube.expiresAt = new Date(tokens.expiry_date);
      
      if (mongoose.connection.readyState === 1) {
        await user.save();
      } else {
        memoryDb.users[userId] = user;
      }
    });

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

    // Upload Video
    const videoSize = fs.statSync(videoFile.path).size;
    const uploadRes = await youtube.videos.insert({
      part: 'snippet,status',
      requestBody: {
        snippet: {
          title: title || 'Untitled Video',
          description: description || '',
          tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        },
        status: {
          privacyStatus: privacyStatus || 'private', // public, private, unlisted
        },
      },
      media: {
        body: fs.createReadStream(videoFile.path),
      },
    }, {
      // Monitor Progress (Not easily piped to client in real-time here without websockets, but we track server-side)
      onUploadProgress: evt => {
        const progress = (evt.bytesRead / videoSize) * 100;
        console.log(`[YouTube Upload] ${Math.round(progress)}% complete`);
      },
    });

    const videoId = uploadRes.data.id;

    // Upload Thumbnail if provided
    let thumbnailUrl = null;
    if (thumbnailFile) {
      try {
        const thumbRes = await youtube.thumbnails.set({
          videoId: videoId,
          media: {
            body: fs.createReadStream(thumbnailFile.path),
          },
        });
        thumbnailUrl = thumbRes.data.items[0]?.url || null;
      } catch (thumbErr) {
        console.error('Failed to set YouTube video thumbnail:', thumbErr);
      }
    }

    // Cleanup local files
    try {
      fs.unlinkSync(videoFile.path);
      if (thumbnailFile) {
        fs.unlinkSync(thumbnailFile.path);
      }
    } catch (cleanupErr) {
      console.error('Failed to cleanup temp upload files:', cleanupErr);
    }

    // Save to Database
    const videoData = {
      user: req.user._id,
      videoId: videoId,
      title: title || 'Untitled Video',
      description: description,
      tags: tags ? tags.split(',') : [],
      privacyStatus: privacyStatus || 'private',
      thumbnailUrl: thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      uploadDate: new Date()
    };

    if (mongoose.connection.readyState === 1) {
      const youtubeVideo = await YoutubeVideo.create(videoData);
      res.status(201).json(youtubeVideo);
    } else {
      const mockVideo = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...videoData
      };
      memoryDb.videos.push(mockVideo);
      res.status(201).json(mockVideo);
    }
  } catch (error) {
    console.error('YouTube Upload Error:', error);
    if (error.response && error.response.data) {
      console.error('YouTube API Response Error:', JSON.stringify(error.response.data, null, 2));
    }
    // Cleanup files on error
    if (req.files['video'] && fs.existsSync(req.files['video'][0].path)) {
      try { fs.unlinkSync(req.files['video'][0].path); } catch (e) {}
    }
    if (req.files['thumbnail'] && fs.existsSync(req.files['thumbnail'][0].path)) {
      try { fs.unlinkSync(req.files['thumbnail'][0].path); } catch (e) {}
    }
    res.status(500).json({ message: error.message || 'Failed to upload video' });
  }
};

// @desc    Get Uploaded Videos
// @route   GET /api/youtube/videos
export const getVideos = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    let videos = [];

    if (mongoose.connection.readyState === 1) {
      videos = await YoutubeVideo.find({ user: req.user._id }).sort({ uploadDate: -1 });
    } else {
      videos = memoryDb.videos
        .filter(v => v.user.toString() === userId)
        .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
    }
    res.json(videos);
  } catch (error) {
    console.error('Get YouTube Videos Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
