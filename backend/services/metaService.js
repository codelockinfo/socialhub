import axios from 'axios';

/**
 * Service to handle Meta Graph API integrations for Facebook and Instagram
 */

const META_GRAPH_URL = 'https://graph.facebook.com/v19.0';

/**
 * Publish a Reel to Instagram
 * @param {string} igAccountId - Instagram Business Account ID
 * @param {string} videoUrl - Public URL of the video (e.g., Cloudinary)
 * @param {string} caption - Post caption
 * @param {string} accessToken - User's Meta access token
 */
export const publishInstagramReel = async (igAccountId, videoUrl, caption, accessToken) => {
  try {
    // Step 1: Create a media container for the Reel
    const containerRes = await axios.post(`${META_GRAPH_URL}/${igAccountId}/media`, {
      media_type: 'REELS',
      video_url: videoUrl,
      caption: caption,
      access_token: accessToken,
    });
    
    const creationId = containerRes.data.id;

    // Wait for Meta to process the video (simplified for example, usually requires polling)
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Step 2: Publish the container
    const publishRes = await axios.post(`${META_GRAPH_URL}/${igAccountId}/media_publish`, {
      creation_id: creationId,
      access_token: accessToken,
    });

    return publishRes.data; // { id: "instagram_post_id" }
  } catch (error) {
    console.error('Meta API Error:', error.response?.data || error.message);
    throw new Error('Failed to publish Instagram Reel');
  }
};

/**
 * Publish a video to a Facebook Page
 */
export const publishFacebookVideo = async (pageId, videoUrl, description, accessToken) => {
  try {
    const res = await axios.post(`${META_GRAPH_URL}/${pageId}/videos`, {
      file_url: videoUrl,
      description: description,
      access_token: accessToken,
    });
    return res.data;
  } catch (error) {
    console.error('Facebook API Error:', error.response?.data || error.message);
    throw new Error('Failed to publish Facebook Video');
  }
};
