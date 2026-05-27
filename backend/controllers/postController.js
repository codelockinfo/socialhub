import Post from '../models/Post.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import { publishInstagramReel } from '../services/metaService.js';
import { publishYouTubeVideo } from '../services/youtubeService.js';
import { publishLinkedInPost } from '../services/linkedinService.js';
import streamifier from 'streamifier';

/**
 * @desc    Upload media and publish to selected platforms
 * @route   POST /api/publish
 * @access  Private
 */
export const createAndPublishPost = async (req, res) => {
  try {
    const { content, platforms } = req.body;
    let mediaUrl = null;
    let mediaType = 'image';

    // 1. Upload Media to Cloudinary if file exists
    if (req.file) {
      mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
      
      const uploadFromBuffer = (req) => {
        return new Promise((resolve, reject) => {
          const cld_upload_stream = cloudinary.uploader.upload_stream(
            { resource_type: mediaType === 'video' ? 'video' : 'image', folder: 'socialhub' },
            (error, result) => {
              if (result) {
                resolve(result);
              } else {
                reject(error);
              }
            }
          );
          streamifier.createReadStream(req.file.buffer).pipe(cld_upload_stream);
        });
      };

      const result = await uploadFromBuffer(req);
      mediaUrl = result.secure_url;
    }

    // 2. Fetch User and Tokens
    const user = await User.findById(req.user._id);
    const selectedPlatforms = JSON.parse(platforms || '[]');
    
    // 3. Create Draft Post in DB
    const post = await Post.create({
      user: user._id,
      content,
      mediaUrl,
      mediaType,
      platforms: selectedPlatforms,
      status: 'published' // assuming instant publish for this example
    });

    const responses = {};

    // 4. Publish to selected platforms
    for (const platform of selectedPlatforms) {
      try {
        if (platform === 'meta' && user.socialAccounts.meta?.accessToken) {
          if (mediaType === 'video') {
            const igRes = await publishInstagramReel(
              user.socialAccounts.meta.profileId, 
              mediaUrl, 
              content, 
              user.socialAccounts.meta.accessToken
            );
            responses.metaId = igRes.id;
          }
        }
        
        if (platform === 'youtube' && user.socialAccounts.youtube?.accessToken && mediaType === 'video') {
          const ytRes = await publishYouTubeVideo(
            mediaUrl,
            'New Short via SocialHub',
            content,
            user.socialAccounts.youtube.accessToken
          );
          responses.youtubeId = ytRes.id;
        }

        if (platform === 'linkedin' && user.socialAccounts.linkedin?.accessToken) {
          const liRes = await publishLinkedInPost(
            user.socialAccounts.linkedin.profileId,
            content,
            user.socialAccounts.linkedin.accessToken
          );
          responses.linkedinId = liRes.id; // Corrected from liRes.data.id to liRes.id based on standard response
        }
      } catch (platformError) {
        console.error(`Failed to publish to ${platform}:`, platformError.message);
        // In a real app, update post status to 'failed' for this specific platform
      }
    }

    // 5. Update Post with Platform IDs
    post.platformResponses = responses;
    await post.save();

    res.status(201).json({ message: 'Post published successfully', post });
  } catch (error) {
    console.error('Publish Error:', error);
    res.status(500).json({ message: 'Server Error during publishing' });
  }
};
