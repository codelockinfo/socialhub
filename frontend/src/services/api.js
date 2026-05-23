import axios from 'axios';

// Create a pre-configured Axios instance pointing to the Express server
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request Interceptor: Attach authentication token if available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('socialhub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global error logging or redirection
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export const postService = {
  // Fetch home feed posts
  getFeed: async () => {
    const response = await apiClient.get('/posts');
    return response.data;
  },

  // Create a new post
  createPost: async (content, image = null, tags = []) => {
    const response = await apiClient.post('/posts', { content, image, tags });
    return response.data;
  },

  // Toggle like status on a post
  toggleLike: async (postId) => {
    const response = await apiClient.post(`/posts/${postId}/like`);
    return response.data;
  }
};

export const userService = {
  // Get current user profile info
  getCurrentUser: async () => {
    const response = await apiClient.get('/me');
    return response.data;
  },

  // Update current user profile info
  updateProfile: async (fullName, bio) => {
    const response = await apiClient.put('/me', { fullName, bio });
    return response.data;
  },

  // Get trends / hot topics
  getTrendingTopics: async () => {
    const response = await apiClient.get('/trends');
    return response.data;
  }
};

export const schedulerService = {
  // Fetch connected channels
  getChannels: async () => {
    const response = await apiClient.get('/scheduler/channels');
    return response.data;
  },

  // Connect a new channel
  connectChannel: async (platform, accountName, avatar = null, followersCount = null) => {
    const response = await apiClient.post('/scheduler/channels', { platform, accountName, avatar, followersCount });
    return response.data;
  },

  // Disconnect a channel
  disconnectChannel: async (id) => {
    const response = await apiClient.delete(`/scheduler/channels/${id}`);
    return response.data;
  },

  // Fetch all scheduled posts
  getScheduledPosts: async () => {
    const response = await apiClient.get('/scheduler/posts');
    return response.data;
  },

  // Create or schedule a post
  createScheduledPost: async (content, mediaUrl = null, platforms = [], status = 'queued', scheduledTime = null) => {
    const response = await apiClient.post('/scheduler/posts', { content, mediaUrl, platforms, status, scheduledTime });
    return response.data;
  },

  // Delete a scheduled post or draft
  deleteScheduledPost: async (id) => {
    const response = await apiClient.delete(`/scheduler/posts/${id}`);
    return response.data;
  },

  // Publish a queued post immediately
  publishImmediately: async (id) => {
    const response = await apiClient.post(`/scheduler/posts/${id}/publish`);
    return response.data;
  }
};

export default apiClient;
