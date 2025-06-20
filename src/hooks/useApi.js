// Custom API Hook for YouTube Clone Application
// Provides reusable API functionality with loading states and error handling

import { useState, useEffect, useCallback } from 'react';
import { videoAPI, channelAPI, commentAPI } from '../services/api';

/**
 * Generic API hook for handling async operations
 * @param {Function} apiFunction - The API function to call
 * @param {*} dependencies - Dependencies to trigger re-fetch
 * @returns {Object} API state and methods
 */
export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  useEffect(() => {
    if (dependencies.length > 0) {
      execute();
    }
  }, dependencies);

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return {
    data,
    loading,
    error,
    execute,
    reset
  };
};

/**
 * Hook for fetching videos with search and filter capabilities
 * @returns {Object} Videos data and methods
 */
export const useVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchVideos = useCallback(async (params = {}, reset = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentPage = reset ? 1 : page;
      const response = await videoAPI.getVideos({ ...params, page: currentPage });
      
      if (reset) {
        setVideos(response.videos || []);
        setPage(1);
      } else {
        setVideos(prev => [...prev, ...(response.videos || [])]);
      }
      
      setHasMore(response.hasMore || false);
      if (!reset) setPage(prev => prev + 1);
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [page]);

  const searchVideos = useCallback(async (query, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await videoAPI.searchVideos(query, filters);
      setVideos(response.videos || []);
      setHasMore(false);
      setPage(1);
      
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      fetchVideos();
    }
  }, [hasMore, loading, fetchVideos]);

  const reset = () => {
    setVideos([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  };

  return {
    videos,
    loading,
    error,
    hasMore,
    fetchVideos,
    searchVideos,
    loadMore,
    reset
  };
};

/**
 * Hook for managing video interactions (like, dislike, etc.)
 * @param {string} videoId - Video ID
 * @returns {Object} Video interaction methods
 */
export const useVideoInteractions = (videoId) => {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [loading, setLoading] = useState(false);

  const likeVideo = useCallback(async () => {
    try {
      setLoading(true);
      await videoAPI.likeVideo(videoId);
      setLiked(true);
      setDisliked(false);
    } catch (error) {
      console.error('Failed to like video:', error);
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  const dislikeVideo = useCallback(async () => {
    try {
      setLoading(true);
      await videoAPI.dislikeVideo(videoId);
      setDisliked(true);
      setLiked(false);
    } catch (error) {
      console.error('Failed to dislike video:', error);
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  return {
    liked,
    disliked,
    loading,
    likeVideo,
    dislikeVideo
  };
};

/**
 * Hook for managing comments
 * @param {string} videoId - Video ID
 * @returns {Object} Comments data and methods
 */
export const useComments = (videoId) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await commentAPI.getVideoComments(videoId);
      setComments(response.comments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  const addComment = useCallback(async (commentText) => {
    try {
      const response = await commentAPI.addComment(videoId, { text: commentText });
      setComments(prev => [response.comment, ...prev]);
      return response.comment;
    } catch (error) {
      throw error;
    }
  }, [videoId]);

  const updateComment = useCallback(async (commentId, newText) => {
    try {
      const response = await commentAPI.updateComment(commentId, { text: newText });
      setComments(prev => 
        prev.map(comment => 
          comment.commentId === commentId 
            ? { ...comment, text: newText }
            : comment
        )
      );
      return response.comment;
    } catch (error) {
      throw error;
    }
  }, []);

  const deleteComment = useCallback(async (commentId) => {
    try {
      await commentAPI.deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment.commentId !== commentId));
    } catch (error) {
      throw error;
    }
  }, []);

  useEffect(() => {
    if (videoId) {
      fetchComments();
    }
  }, [videoId, fetchComments]);

  return {
    comments,
    loading,
    error,
    addComment,
    updateComment,
    deleteComment,
    refetch: fetchComments
  };
};

/**
 * Hook for managing channels
 * @returns {Object} Channel data and methods
 */
export const useChannels = () => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchChannels = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await channelAPI.getChannels();
      setChannels(response.channels || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createChannel = useCallback(async (channelData) => {
    try {
      const response = await channelAPI.createChannel(channelData);
      setChannels(prev => [...prev, response.channel]);
      return response.channel;
    } catch (error) {
      throw error;
    }
  }, []);

  const updateChannel = useCallback(async (channelId, channelData) => {
    try {
      const response = await channelAPI.updateChannel(channelId, channelData);
      setChannels(prev => 
        prev.map(channel => 
          channel.channelId === channelId 
            ? { ...channel, ...response.channel }
            : channel
        )
      );
      return response.channel;
    } catch (error) {
      throw error;
    }
  }, []);

  const deleteChannel = useCallback(async (channelId) => {
    try {
      await channelAPI.deleteChannel(channelId);
      setChannels(prev => prev.filter(channel => channel.channelId !== channelId));
    } catch (error) {
      throw error;
    }
  }, []);

  return {
    channels,
    loading,
    error,
    fetchChannels,
    createChannel,
    updateChannel,
    deleteChannel
  };
};

/**
 * Hook for debounced search
 * @param {string} value - Search value
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {string} Debounced value
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for local storage with JSON serialization
 * @param {string} key - Storage key
 * @param {*} initialValue - Initial value
 * @returns {Array} [value, setValue] tuple
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

export default useApi;