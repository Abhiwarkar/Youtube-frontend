// API service for YouTube Clone Application
// This file handles all API communications with the backend server

import axios from 'axios';

// API base URL -  connecting to real backend

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// The rest of your API configuration remains the same
// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API calls
export const authAPI = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      const { token, user } = response.data;
      
      // Store token and user data
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } catch (error) {
      // Still remove local data even if API call fails
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get profile');
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }
};

// Video API calls
export const videoAPI = {
  // Get all videos with optional filters
  getVideos: async (params = {}) => {
    try {
      const response = await api.get('/videos', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch videos');
    }
  },

  // Get single video by ID
  getVideoById: async (videoId) => {
    try {
      const response = await api.get(`/videos/${videoId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch video');
    }
  },

  // Search videos by title or content
  searchVideos: async (query, filters = {}) => {
    try {
      const response = await api.get('/videos/search', {
        params: { q: query, ...filters }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Search failed');
    }
  },

  // Get videos by category
  getVideosByCategory: async (category) => {
    try {
      const response = await api.get(`/videos/category/${category}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch videos by category');
    }
  },

  // Get trending videos
  getTrendingVideos: async () => {
    try {
      const response = await api.get('/videos/trending');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch trending videos');
    }
  },

  // Upload new video (metadata only - file upload handled separately)
  uploadVideo: async (videoData) => {
    try {
      const response = await api.post('/videos', videoData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload video');
    }
  },

  // Update video details
  updateVideo: async (videoId, videoData) => {
    try {
      const response = await api.put(`/videos/${videoId}`, videoData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update video');
    }
  },

  // Delete video
  deleteVideo: async (videoId) => {
    try {
      const response = await api.delete(`/videos/${videoId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete video');
    }
  },

  // Like video
  likeVideo: async (videoId) => {
    try {
      const response = await api.post(`/videos/${videoId}/like`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to like video');
    }
  },

  // Dislike video
  dislikeVideo: async (videoId) => {
    try {
      const response = await api.post(`/videos/${videoId}/dislike`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to dislike video');
    }
  },

  // Get video statistics
  getVideoStats: async (videoId) => {
    try {
      const response = await api.get(`/videos/${videoId}/stats`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch video stats');
    }
  }
};

// Channel API calls
export const channelAPI = {
  // Get all channels
  getChannels: async () => {
    try {
      const response = await api.get('/channels');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch channels');
    }
  },

  // Get channel by ID
  getChannelById: async (channelId) => {
    try {
      const response = await api.get(`/channels/${channelId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch channel');
    }
  },

  // Get user's channels
  getUserChannels: async () => {
    try {
      const response = await api.get('/channels/my-channels');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user channels');
    }
  },

  // Create new channel
  createChannel: async (channelData) => {
    try {
      const response = await api.post('/channels', channelData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create channel');
    }
  },

  // Update channel
  updateChannel: async (channelId, channelData) => {
    try {
      const response = await api.put(`/channels/${channelId}`, channelData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update channel');
    }
  },

  // Delete channel
  deleteChannel: async (channelId) => {
    try {
      const response = await api.delete(`/channels/${channelId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete channel');
    }
  },

  // Subscribe to channel
  subscribeToChannel: async (channelId) => {
    try {
      const response = await api.post(`/channels/${channelId}/subscribe`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to subscribe');
    }
  },

  // Unsubscribe from channel
  unsubscribeFromChannel: async (channelId) => {
    try {
      const response = await api.delete(`/channels/${channelId}/subscribe`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to unsubscribe');
    }
  },

  // Get channel videos
  getChannelVideos: async (channelId) => {
    try {
      const response = await api.get(`/channels/${channelId}/videos`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch channel videos');
    }
  }
};

// Comments API calls
export const commentAPI = {
  // Get comments for a video
  getVideoComments: async (videoId) => {
    try {
      const response = await api.get(`/videos/${videoId}/comments`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch comments');
    }
  },

  // Add new comment
  addComment: async (videoId, commentData) => {
    try {
      const response = await api.post(`/videos/${videoId}/comments`, commentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add comment');
    }
  },

  // Update comment
  updateComment: async (commentId, commentData) => {
    try {
      const response = await api.put(`/comments/${commentId}`, commentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update comment');
    }
  },

  // Delete comment
  deleteComment: async (commentId) => {
    try {
      const response = await api.delete(`/comments/${commentId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete comment');
    }
  },

  // Like comment
  likeComment: async (commentId) => {
    try {
      const response = await api.post(`/comments/${commentId}/like`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to like comment');
    }
  },

  // Reply to comment
  replyToComment: async (commentId, replyData) => {
    try {
      const response = await api.post(`/comments/${commentId}/reply`, replyData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reply to comment');
    }
  }
};

// File upload utility
export const uploadAPI = {
  // Upload video file
  uploadVideoFile: async (file, onProgress) => {
    try {
      const formData = new FormData();
      formData.append('video', file);

      const response = await api.post('/upload/video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          if (onProgress) onProgress(percentCompleted);
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload video');
    }
  },

  // Upload thumbnail image
  uploadThumbnail: async (file) => {
    try {
      const formData = new FormData();
      formData.append('thumbnail', file);

      const response = await api.post('/upload/thumbnail', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload thumbnail');
    }
  }
};

// Analytics API calls (for future implementation)
export const analyticsAPI = {
  // Get video analytics
  getVideoAnalytics: async (videoId, timeRange = '7d') => {
    try {
      const response = await api.get(`/analytics/video/${videoId}`, {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics');
    }
  },

  // Get channel analytics
  getChannelAnalytics: async (channelId, timeRange = '7d') => {
    try {
      const response = await api.get(`/analytics/channel/${channelId}`, {
        params: { timeRange }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch channel analytics');
    }
  }
};

// Export default API instance for custom calls
export default api;