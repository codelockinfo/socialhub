import axios from 'axios';

const LINKEDIN_API_URL = 'https://api.linkedin.com/v2';

/**
 * Publish a video or image post to LinkedIn
 * @param {string} authorUrn - LinkedIn User URN (e.g., urn:li:person:12345)
 * @param {string} text - Post text/caption
 * @param {string} accessToken - User's LinkedIn access token
 */
export const publishLinkedInPost = async (authorUrn, text, accessToken) => {
  try {
    const postData = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: text
          },
          shareMediaCategory: 'NONE' // Change to VIDEO or IMAGE if media is provided
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    };

    const res = await axios.post(`${LINKEDIN_API_URL}/ugcPosts`, postData, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
        'Content-Type': 'application/json'
      }
    });

    return res.data;
  } catch (error) {
    console.error('LinkedIn API Error:', error.response?.data || error.message);
    throw new Error('Failed to publish LinkedIn Post');
  }
};
