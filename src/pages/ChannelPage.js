import React, { useState, useEffect, useRef } from 'react';
import {
  User, Bell, BellOff, Upload, Edit, Trash2, Video, Settings, Plus, X, AlertCircle,
  PlayCircle, FileVideo, Image, Calendar, Eye, Clock, CheckCircle, AlertTriangle
} from 'lucide-react';

// This would come from your AuthContext in real app
const useAuth = () => {
  // Mock implementation - replace with your real AuthContext
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);

  return {
    user,
    isAuthenticated,
    login: (userData) => {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
    },
    logout: () => {
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      setUser(null);
      setIsAuthenticated(false);
    }
  };
};

// API calls to your backend
const channelAPI = {
  // Get user's channel using existing routes
  getUserChannel: async (userId) => {
    try {
      const token = localStorage.getItem('authToken');
      console.log('Fetching channel for userId:', userId);
      
      // Try multiple methods to get user's channel
      const response = await fetch(`http://localhost:5000/api/channels/my-channels`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const channels = data.success ? data.data : (Array.isArray(data) ? data : []);
        return channels.length > 0 ? channels[0] : null;
      }
      
      return null;
    } catch (error) {
      console.error('Error in getUserChannel:', error);
      return null;
    }
  },

  // Get channel videos
  getChannelVideos: async (channelId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/channels/${channelId}/videos`);
      if (!response.ok) return [];
      
      const data = await response.json();
      return data.success ? data.data : (Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching channel videos:', error);
      return [];
    }
  },

  // Create new channel
  createChannel: async (channelData) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found. Please sign in again.');
      }
      
      const response = await fetch('http://localhost:5000/api/channels', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(channelData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create channel');
      }

      const data = await response.json();
      return data.success ? data.data : data;
    } catch (error) {
      console.error('Error creating channel:', error);
      throw error;
    }
  },

  // NEW: Upload video functionality
  uploadVideo: async (videoData, file, thumbnailFile, onProgress) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found. Please sign in again.');
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', videoData.title);
      formData.append('description', videoData.description);
      formData.append('category', videoData.category);
      formData.append('channelId', videoData.channelId);
      formData.append('tags', JSON.stringify(videoData.tags || []));
      formData.append('isPrivate', videoData.isPrivate || false);
      
      if (file) {
        formData.append('video', file);
      }
      
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      // Upload with progress tracking
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable && onProgress) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(percentComplete);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response.success ? response.data : response);
            } catch (e) {
              reject(new Error('Invalid response format'));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.message || `Upload failed with status ${xhr.status}`));
            } catch (e) {
              reject(new Error(`Upload failed with status ${xhr.status}`));
            }
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });

        xhr.open('POST', 'http://localhost:5000/api/videos');
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });

    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  },

  // Update video
  updateVideo: async (videoId, updateData) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/videos/${videoId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update video');
      }

      const data = await response.json();
      return data.success ? data.data : data;
    } catch (error) {
      console.error('Error updating video:', error);
      throw error;
    }
  },

  // Delete video
  deleteVideo: async (videoId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/videos/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete video');
      }

      return true;
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  }
};

// Video Card Component
const VideoCard = ({ video, onClick, onEdit, onDelete, isOwner }) => {
  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return `${Math.floor(diffDays / 30)} months ago`;
    } catch (error) {
      return 'Unknown date';
    }
  };

  const getVideoTitle = () => {
    if (typeof video.title === 'string') return video.title;
    return 'Untitled Video';
  };

  const getUploaderName = () => {
    if (typeof video.uploader === 'object' && video.uploader) {
      return video.uploader.username || video.uploader.name || 'Unknown';
    }
    if (typeof video.uploader === 'string') return video.uploader;
    return 'Unknown';
  };

  const getThumbnail = () => {
    return video.thumbnailUrl || video.thumbnail || 'https://via.placeholder.com/320x180?text=Video+Thumbnail';
  };

  const getDuration = () => {
    if (typeof video.duration === 'string') return video.duration;
    if (typeof video.duration === 'number') return `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}`;
    return '0:00';
  };

  const getViews = () => {
    const views = video.views || 0;
    return typeof views === 'number' ? views : parseInt(views) || 0;
  };

  const getUploadDate = () => {
    return video.uploadDate || video.createdAt || new Date().toISOString();
  };

  return (
    <div className="group cursor-pointer">
      <div className="relative">
        <img
          src={getThumbnail()}
          alt={getVideoTitle()}
          className="w-full aspect-video object-cover rounded-lg bg-gray-200"
          onClick={() => onClick(video)}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/320x180?text=Video+Thumbnail';
          }}
        />
        
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
          {getDuration()}
        </div>
        
        {isOwner && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex space-x-1">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(video); }}
                className="p-2 bg-black bg-opacity-70 text-white rounded-full hover:bg-opacity-90"
                title="Edit video"
              >
                <Edit className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(video._id || video.videoId); }}
                className="p-2 bg-red-600 bg-opacity-70 text-white rounded-full hover:bg-opacity-90"
                title="Delete video"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-3" onClick={() => onClick(video)}>
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{getVideoTitle()}</h3>
        <p className="text-sm text-gray-600">
          {formatViews(getViews())} views • {formatDate(getUploadDate())}
        </p>
        <p className="text-sm text-gray-500 mt-1">{getUploaderName()}</p>
      </div>
    </div>
  );
};
// Video Upload Modal Component
const VideoUploadModal = ({ isOpen, onClose, channel, onUploadSuccess }) => {
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'Technology',
    tags: [],
    isPrivate: false
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState('details'); // 'details', 'uploading', 'success'
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');
  
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  const resetForm = () => {
    setUploadForm({
      title: '',
      description: '',
      category: 'Technology',
      tags: [],
      isPrivate: false
    });
    setSelectedFile(null);
    setSelectedThumbnail(null);
    setUploadProgress(0);
    setIsUploading(false);
    setUploadStep('details');
    setError('');
    setTagInput('');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/webm'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid video file (MP4, AVI, MOV, WMV, WebM)');
        return;
      }
      
      // Validate file size (500MB limit)
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (file.size > maxSize) {
        setError('File size must be less than 500MB');
        return;
      }
      
      setSelectedFile(file);
      setError('');
      
      // Auto-generate title from filename if empty
      if (!uploadForm.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        setUploadForm(prev => ({ ...prev, title: fileName }));
      }
    }
  };

  const handleThumbnailSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('Please select a valid image file (JPEG, JPG, PNG, GIF)');
        return;
      }
      
      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError('Thumbnail size must be less than 5MB');
        return;
      }
      
      setSelectedThumbnail(file);
      setError('');
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !uploadForm.tags.includes(tagInput.trim()) && uploadForm.tags.length < 10) {
      setUploadForm(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setUploadForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleUpload = async () => {
    if (!uploadForm.title.trim()) {
      setError('Video title is required');
      return;
    }
    
    if (!selectedFile) {
      setError('Please select a video file');
      return;
    }

    setIsUploading(true);
    setUploadStep('uploading');
    setError('');
    
    try {
      const videoData = {
        ...uploadForm,
        channelId: channel._id || channel.channelId
      };

      const result = await channelAPI.uploadVideo(
        videoData,
        selectedFile,
        selectedThumbnail,
        (progress) => setUploadProgress(progress)
      );

      console.log('Upload successful:', result);
      setUploadStep('success');
      
      // Call success callback after a delay
      setTimeout(() => {
        onUploadSuccess(result);
        onClose();
        resetForm();
      }, 2000);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setError(error.message || 'Upload failed');
      setUploadStep('details');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Upload Video</h2>
          <button 
            onClick={() => { onClose(); resetForm(); }}
            disabled={isUploading}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {uploadStep === 'details' && (
            <>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    {error}
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Video File *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    {selectedFile ? (
                      <div className="flex items-center justify-center space-x-3">
                        <FileVideo className="h-8 w-8 text-blue-500" />
                        <div>
                          <p className="font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg mb-2">Drag and drop video files to upload</p>
                        <p className="text-sm text-gray-500 mb-4">
                          Your videos will be private until you publish them.
                        </p>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                        >
                          SELECT FILES
                        </button>
                        <p className="text-xs text-gray-500 mt-2">
                          MP4, AVI, MOV, WMV, WebM • Max 500MB
                        </p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Video Details Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <input
                      type="text"
                      value={uploadForm.title}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Add a title that describes your video"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                      maxLength={100}
                    />
                    <p className="text-xs text-gray-500 mt-1">{uploadForm.title.length}/100</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Tell viewers about your video"
                      rows="4"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                      maxLength={5000}
                    />
                    <p className="text-xs text-gray-500 mt-1">{uploadForm.description.length}/5000</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={uploadForm.category}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="Technology">Technology</option>
                      <option value="Education">Education</option>
                      <option value="Entertainment">Entertainment</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Music">Music</option>
                      <option value="Sports">Sports</option>
                      <option value="Lifestyle">Lifestyle</option>
                      <option value="News">News</option>
                      <option value="Comedy">Comedy</option>
                      <option value="Travel">Travel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Visibility</label>
                    <select
                      value={uploadForm.isPrivate ? 'private' : 'public'}
                      onChange={(e) => setUploadForm(prev => ({ 
                        ...prev, 
                        isPrivate: e.target.value === 'private' 
                      }))}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-2">Tags (Optional)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {uploadForm.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add tags to help people discover your video"
                      className="flex-1 px-3 py-2 border rounded-l-lg focus:outline-none focus:border-blue-500"
                      maxLength={30}
                    />
                    <button
                      onClick={addTag}
                      disabled={!tagInput.trim() || uploadForm.tags.length >= 10}
                      className="px-4 py-2 bg-gray-100 border border-l-0 rounded-r-lg hover:bg-gray-200 disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{uploadForm.tags.length}/10 tags</p>
                </div>

                {/* Thumbnail Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Thumbnail (Optional)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {selectedThumbnail ? (
                      <div className="flex items-center space-x-3">
                        <img
                          src={URL.createObjectURL(selectedThumbnail)}
                          alt="Thumbnail preview"
                          className="w-16 h-9 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{selectedThumbnail.name}</p>
                          <p className="text-xs text-gray-500">
                            {(selectedThumbnail.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedThumbnail(null)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Upload a custom thumbnail</p>
                        <button
                          onClick={() => thumbnailInputRef.current?.click()}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Upload thumbnail
                        </button>
                        <p className="text-xs text-gray-500 mt-1">
                          JPG, PNG, GIF • Max 5MB • 16:9 recommended
                        </p>
                      </div>
                    )}
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailSelect}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Upload Button */}
              <div className="flex justify-end space-x-3 mt-8">
                <button
                  onClick={() => { onClose(); resetForm(); }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!uploadForm.title.trim() || !selectedFile}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload Video
                </button>
              </div>
            </>
          )}

          {uploadStep === 'uploading' && (
            <div className="text-center py-8">
              <div className="max-w-md mx-auto">
                <Upload className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Uploading your video</h3>
                <p className="text-gray-600 mb-6">
                  Please don't close this window while your video is uploading.
                </p>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600">
                  {uploadProgress.toFixed(1)}% complete
                </p>
                
                {selectedFile && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileVideo className="h-5 w-5 text-blue-500" />
                      <div className="text-left">
                        <p className="font-medium text-sm">{uploadForm.title}</p>
                        <p className="text-xs text-gray-500">{selectedFile.name}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {uploadStep === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Upload successful!</h3>
              <p className="text-gray-600 mb-4">
                Your video has been uploaded and is being processed.
              </p>
              <div className="p-4 bg-green-50 rounded-lg max-w-md mx-auto">
                <p className="text-sm text-green-800">
                  <strong>{uploadForm.title}</strong> is now available on your channel.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Channel Page Component
const ChannelPage = ({ sidebarOpen = false, onVideoClick = () => {} }) => {
  const { user, isAuthenticated } = useAuth();
  
  // States
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showEditVideo, setShowEditVideo] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Forms
  const [channelForm, setChannelForm] = useState({ 
    channelName: '', 
    description: '',
    category: 'Technology'
  });
  const [editForm, setEditForm] = useState({ 
    title: '', 
    description: '',
    category: 'Technology'
  });

  // Check if user owns the channel
  const isOwner = channel && user && (
    channel.owner === user.id || 
    channel.owner === user.userId ||
    channel.ownerId === user.id ||
    channel.ownerId === user.userId ||
    (typeof channel.owner === 'object' && channel.owner?._id === user.id) ||
    (typeof channel.owner === 'object' && channel.owner?._id === user.userId)
  );

  // Load user's channel and videos
  useEffect(() => {
    const loadChannelData = async () => {
      if (!isAuthenticated || !user) {
        setChannel(null);
        setVideos([]);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const userChannel = await channelAPI.getUserChannel(user.id || user.userId);
        
        if (userChannel) {
          setChannel(userChannel);
          const channelVideos = await channelAPI.getChannelVideos(userChannel._id || userChannel.channelId);
          setVideos(channelVideos);
        } else {
          setChannel(null);
          setVideos([]);
        }
      } catch (error) {
        console.error('Error loading channel data:', error);
        setError(`Failed to load channel: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadChannelData();
  }, [isAuthenticated, user]);

  // Handlers
  const handleCreateChannel = async () => {
    if (!channelForm.channelName.trim()) {
      setError('Channel name is required');
      return;
    }

    if (!user || !localStorage.getItem('authToken')) {
      setError('You must be signed in to create a channel');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const newChannel = await channelAPI.createChannel({
        channelName: channelForm.channelName,
        handle: `@${channelForm.channelName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}`,
        description: channelForm.description,
        category: channelForm.category
      });

      setChannel(newChannel);
      setVideos([]);
      setShowCreateChannel(false);
      setChannelForm({ channelName: '', description: '', category: 'Technology' });
      
      alert('🎉 Channel created successfully!');
    } catch (error) {
      console.error('Channel creation failed:', error);
      setError(error.message || 'Failed to create channel');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (newVideo) => {
    console.log('Video upload successful:', newVideo);
    setVideos(prev => [newVideo, ...prev]);
    alert('🎉 Video uploaded successfully!');
  };

  const handleEditVideo = async (videoId) => {
    if (!editForm.title.trim()) {
      setError('Video title is required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const updatedVideo = await channelAPI.updateVideo(videoId, {
        title: editForm.title,
        description: editForm.description,
        category: editForm.category
      });

      setVideos(prev => prev.map(video => 
        (video._id || video.videoId) === videoId 
          ? { ...video, ...updatedVideo }
          : video
      ));
      
      setShowEditVideo(null);
      setEditForm({ title: '', description: '', category: 'Technology' });
      alert('✅ Video updated successfully!');
    } catch (error) {
      setError(error.message || 'Failed to update video');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (!window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await channelAPI.deleteVideo(videoId);
      setVideos(prev => prev.filter(video => 
        (video._id || video.videoId) !== videoId
      ));
      alert('🗑️ Video deleted successfully!');
    } catch (error) {
      setError(error.message || 'Failed to delete video');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (video) => {
    setEditForm({ 
      title: video.title, 
      description: video.description || '',
      category: video.category || 'Technology'
    });
    setShowEditVideo(video._id || video.videoId);
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getChannelName = () => {
    if (!channel) return 'Channel';
    return channel.channelName || channel.name || 'Channel';
  };

  const getChannelDescription = () => {
    if (!channel) return '';
    return channel.description || '';
  };

  const getSubscriberCount = () => {
    if (!channel) return 0;
    const count = channel.subscribers || channel.subscriberCount || 0;
    return typeof count === 'number' ? count : parseInt(count) || 0;
  };

  const getChannelAvatar = () => {
    if (!channel) return null;
    return channel.avatar || null;
  };

  // Loading state
  if (loading && !channel) {
    return (
      <div className={`min-h-screen bg-gray-50 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading channel...</p>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen bg-gray-50 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
            <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Sign in Required</h2>
            <p className="text-gray-600 mb-6">Sign in to create and manage your channel</p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 font-medium"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No channel
  if (!channel) {
    return (
      <div className={`min-h-screen bg-gray-50 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
        <div className="max-w-4xl mx-auto py-12 px-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <Video className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Create Your Channel</h2>
            <p className="text-gray-600 mb-2">Welcome, {user?.username || user?.name || 'User'}!</p>
            <p className="text-gray-600 mb-6">Create a channel to upload and manage videos</p>
            
            <button
              onClick={() => setShowCreateChannel(true)}
              disabled={loading}
              className="bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              Create Channel
            </button>
          </div>
        </div>

        {/* Create Channel Modal */}
        {showCreateChannel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Create Channel</h3>
                <button onClick={() => setShowCreateChannel(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg mb-4 text-sm">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Channel Name *</label>
                  <input
                    type="text"
                    value={channelForm.channelName}
                    onChange={(e) => setChannelForm({...channelForm, channelName: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    placeholder="Enter channel name"
                    maxLength={50}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={channelForm.description}
                    onChange={(e) => setChannelForm({...channelForm, description: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    rows="3"
                    placeholder="Describe your channel"
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={channelForm.category}
                    onChange={(e) => setChannelForm({...channelForm, category: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  >
                    <option value="Technology">Technology</option>
                    <option value="Education">Education</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Gaming">Gaming</option>
                    <option value="Music">Music</option>
                    <option value="Sports">Sports</option>
                    <option value="Lifestyle">Lifestyle</option>
                  </select>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowCreateChannel(false)}
                    className="flex-1 py-2 px-4 border rounded-lg hover:bg-gray-50"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateChannel}
                    disabled={loading || !channelForm.channelName.trim()}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show channel with videos
  return (
    <div className={`min-h-screen bg-gray-50 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3">
          {error}
          <button onClick={() => setError('')} className="float-right">×</button>
        </div>
      )}

      {/* Channel Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto">
          {/* Banner */}
          <div className="h-40 bg-gradient-to-r from-blue-400 to-purple-500">
            {channel.banner && (
              <img 
                src={channel.banner} 
                alt="Channel banner" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
          </div>

          {/* Channel Info */}
          <div className="px-6 py-6">
            <div className="flex items-center space-x-6">
              {/* Avatar */}
              <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold -mt-12 border-4 border-white">
                {getChannelAvatar() ? (
                  <img 
                    src={getChannelAvatar()} 
                    alt={getChannelName()} 
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  getChannelName().charAt(0).toUpperCase()
                )}
              </div>

              {/* Details */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold">{getChannelName()}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600 my-2">
                  <span>{formatNumber(getSubscriberCount())} subscribers</span>
                  <span>•</span>
                  <span>{videos.length} videos</span>
                  {isOwner && <span className="text-green-600 font-medium">• Your Channel</span>}
                </div>
                {getChannelDescription() && <p className="text-gray-700 text-sm">{getChannelDescription()}</p>}
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                {isOwner ? (
                  <>
                    <button 
                      onClick={() => setShowUploadModal(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Upload</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                      <Settings className="h-4 w-4" />
                      <span>Manage</span>
                    </button>
                  </>
                ) : (
                  <button className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                    <Bell className="h-4 w-4" />
                    <span>Subscribe</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tabs */}
        <div className="border-b mb-6">
          <div className="flex space-x-8">
            <button className="pb-3 border-b-2 border-black font-medium">Videos</button>
            <button className="pb-3 text-gray-600">About</button>
          </div>
        </div>

        {/* Videos */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">{videos.length} videos</h2>
            {isOwner && (
              <button 
                onClick={() => setShowUploadModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Video</span>
              </button>
            )}
          </div>
          
          {videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <VideoCard
                  key={video._id || video.videoId}
                  video={video}
                  onClick={onVideoClick}
                  onEdit={isOwner ? handleEditClick : null}
                  onDelete={isOwner ? handleDeleteVideo : null}
                  isOwner={isOwner}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No videos yet</h3>
              <p className="text-gray-600 mb-4">
                {isOwner ? "Upload your first video!" : "No videos uploaded yet"}
              </p>
              {isOwner && (
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <Upload className="h-4 w-4 inline mr-2" />
                  Upload Video
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Video Upload Modal */}
      <VideoUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        channel={channel}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Edit Video Modal */}
      {showEditVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Edit Video</h3>
              <button onClick={() => setShowEditVideo(null)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  maxLength={100}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                  rows="3"
                  maxLength={500}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="Technology">Technology</option>
                  <option value="Education">Education</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Gaming">Gaming</option>
                  <option value="Music">Music</option>
                  <option value="Sports">Sports</option>
                  <option value="Lifestyle">Lifestyle</option>
                </select>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowEditVideo(null)}
                  className="flex-1 py-2 px-4 border rounded-lg hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleEditVideo(showEditVideo)}
                  disabled={loading || !editForm.title.trim()}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelPage;