// ✅ CommentSection with Database Integration
// Saves comments to database and displays properly

import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  ThumbsUp, 
  ThumbsDown, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Flag, 
  Heart,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Filter,
  Send
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../utils/helpers';

// API functions for comments
const commentAPI = {
  // Get comments for a video
  getVideoComments: async (videoId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/comments/video/${videoId}`);
      if (!response.ok) throw new Error('Failed to fetch comments');
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  },

  // Add new comment
  addComment: async (videoId, commentData) => {
    try {
      const token = localStorage.getItem('authToken');
      
      console.log('Adding comment with data:', { videoId, text: commentData.text });
      console.log('Auth token exists:', !!token);
      
      const response = await fetch('http://localhost:5000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          videoId: videoId,
          text: commentData.text
        })
      });

      console.log('Response status:', response.status);
      
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (e) {
          errorData = { message: responseText };
        }
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to add comment`);
      }

      const data = JSON.parse(responseText);
      console.log('Parsed response data:', data);
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },

  // Update comment
  updateComment: async (commentId, newText) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: newText })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update comment');
      }

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  },

  // Delete comment
  deleteComment: async (commentId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete comment');
      }

      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  },

  // Like comment
  likeComment: async (commentId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to like comment');
      }

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Error liking comment:', error);
      throw error;
    }
  }
};

const CommentSection = ({ video }) => {
  const { isAuthenticated, user } = useAuth();

  // Component state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  const [showMenu, setShowMenu] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Refs
  const commentInputRef = useRef(null);
  const editInputRef = useRef(null);

  // Load comments on component mount
  useEffect(() => {
    const loadComments = async () => {
      if (!video?.videoId && !video?._id) return;
      
      setLoading(true);
      try {
        const videoId = video.videoId || video._id;
        console.log('=== LOADING COMMENTS ===');
        console.log('Video ID:', videoId);
        
        const fetchedComments = await commentAPI.getVideoComments(videoId);
        console.log('✅ Fetched comments from backend:', fetchedComments);
        
        setComments(fetchedComments || []);
        console.log('✅ Comments set in state:', fetchedComments?.length || 0);
      } catch (error) {
        console.error('Failed to load comments:', error);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

    loadComments();
  }, [video?.videoId, video?._id]);

  // ✅ FORCE REFRESH: Reload comments every 10 seconds for testing
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!video?.videoId && !video?._id) return;
      
      try {
        const videoId = video.videoId || video._id;
        const fetchedComments = await commentAPI.getVideoComments(videoId);
        console.log('🔄 Auto-refresh: Found', fetchedComments?.length || 0, 'comments');
        setComments(fetchedComments || []);
      } catch (error) {
        console.log('Auto-refresh failed:', error.message);
      }
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, [video?.videoId, video?._id]);

  // Sort comments based on selected criteria
  const sortComments = (comments) => {
    if (!Array.isArray(comments)) return [];
    
    return [...comments].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt || a.timestamp) - new Date(b.createdAt || b.timestamp);
        case 'popular':
          return (b.likeCount || b.likes || 0) - (a.likeCount || a.likes || 0);
        case 'newest':
        default:
          return new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp);
      }
    });
  };

  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!newComment.trim() || !isAuthenticated || submitting) return;

    setSubmitting(true);
    try {
      const videoId = video.videoId || video._id;
      console.log('=== SUBMIT COMMENT ===');
      console.log('Video ID:', videoId);
      console.log('Comment text:', newComment.trim());
      
      const addedComment = await commentAPI.addComment(videoId, {
        text: newComment.trim()
      });

      console.log('✅ Comment added to backend:', addedComment);

      if (addedComment) {
        // Add the new comment to local state immediately
        setComments(prev => {
          console.log('Previous comments:', prev.length);
          const newComments = [addedComment, ...prev];
          console.log('New comments array:', newComments.length);
          return newComments;
        });
        
        setNewComment('');
        commentInputRef.current?.blur();
        
        console.log('✅ Comment added to UI state');
      } else {
        console.log('❌ No comment returned from API');
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit comment
  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return;

    try {
      console.log('=== HANDLE EDIT COMMENT ===');
      console.log('Comment ID:', commentId);
      console.log('Edit text:', editText.trim());
      
      const updatedComment = await commentAPI.updateComment(commentId, editText.trim());
      
      if (updatedComment) {
        console.log('✅ Comment updated successfully:', updatedComment);
        
        // Update local state
        setComments(prev => prev.map(comment => 
          comment._id === commentId 
            ? { ...comment, text: editText.trim(), isEdited: true }
            : comment
        ));
        
        setEditingComment(null);
        setEditText('');
        
        // Show success message
        alert('✅ Comment updated successfully!');
      }
    } catch (error) {
      console.error('Failed to edit comment:', error);
      alert(`Failed to edit comment: ${error.message}`);
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      console.log('=== HANDLE DELETE COMMENT ===');
      console.log('Comment ID:', commentId);
      
      await commentAPI.deleteComment(commentId);
      
      console.log('✅ Comment deleted successfully');
      
      // Remove from local state
      setComments(prev => prev.filter(comment => comment._id !== commentId));
      setShowMenu(null);
      
      // Show success message
      alert('🗑️ Comment deleted successfully!');
    } catch (error) {
      console.error('Failed to delete comment:', error);
      alert(`Failed to delete comment: ${error.message}`);
    }
  };

  // Handle like comment
  const handleLikeComment = async (commentId) => {
    if (!isAuthenticated) return;

    try {
      const result = await commentAPI.likeComment(commentId);
      
      if (result) {
        // Update local state
        setComments(prev => prev.map(comment => 
          comment._id === commentId 
            ? { 
                ...comment, 
                likeCount: result.likeCount,
                isLiked: result.isLiked 
              }
            : comment
        ));
      }
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  // Start editing comment
  const startEditing = (comment) => {
    setEditingComment(comment._id);
    setEditText(comment.text);
    setShowMenu(null);
    setTimeout(() => editInputRef.current?.focus(), 100);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingComment(null);
    setEditText('');
  };

  // Get user name from comment
  const getUserName = (comment) => {
    if (comment.author && typeof comment.author === 'object') {
      return comment.author.username || comment.author.name || 'Anonymous';
    }
    return comment.username || comment.author || 'Anonymous';
  };

  // Get user avatar from comment
  const getUserAvatar = (comment) => {
    if (comment.author && typeof comment.author === 'object') {
      return comment.author.avatar;
    }
    return comment.avatar || comment.userAvatar;
  };

  // Check if user can edit/delete comment
  const canModifyComment = (comment) => {
    if (!isAuthenticated || !user) return false;
    
    const commentUserId = comment.author?._id || comment.author?.id || comment.userId || comment.author;
    const currentUserId = user.id || user.userId || user._id;
    
    return commentUserId === currentUserId;
  };

  const sortedComments = sortComments(comments);

  // ✅ FORCE RELOAD COMMENTS
  const forceReloadComments = async () => {
    try {
      const videoId = video.videoId || video._id;
      console.log('🔄 Force reloading comments for video:', videoId);
      
      const fetchedComments = await commentAPI.getVideoComments(videoId);
      console.log('🔄 Fetched comments:', fetchedComments?.length || 0);
      
      setComments(fetchedComments || []);
      alert(`✅ Refreshed! Found ${fetchedComments?.length || 0} comments`);
    } catch (error) {
      console.error('Failed to reload comments:', error);
      alert('Failed to refresh comments');
    }
  };

  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest first' },
    { value: 'popular', label: 'Most popular' },
    { value: 'oldest', label: 'Oldest first' }
  ];

  return (
    <div className="mt-6">
      {/* Comments Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium">
          {comments.length} Comments
        </h3>

        <div className="flex items-center space-x-2">
          {/* ✅ REFRESH BUTTON */}
          <button
            onClick={forceReloadComments}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            🔄 Refresh
          </button>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Sort by</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {showSortMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setShowSortMenu(false)}
                />
                <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-48">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value);
                        setShowSortMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                        sortBy === option.value ? 'bg-gray-50 font-medium' : ''
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add Comment Form */}
      {isAuthenticated ? (
        <div className="mb-8">
          <div className="flex items-start space-x-3">
            <img
              src={user?.avatar || '/placeholder-avatar.jpg'}
              alt={user?.username || 'User'}
              className="h-10 w-10 rounded-full object-cover flex-shrink-0"
              onError={(e) => {
                e.target.src = '/placeholder-avatar.jpg';
              }}
            />
            <div className="flex-1">
              <textarea
                ref={commentInputRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                rows="3"
                maxLength="1000"
              />
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-500">
                  {newComment.length}/1000 characters
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setNewComment('')}
                    disabled={!newComment.trim()}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || submitting}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {submitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    <span>{submitting ? 'Posting...' : 'Comment'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600 mb-2">Sign in to join the discussion</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Sign In
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-2" />
          <p className="text-gray-600">Loading comments...</p>
        </div>
      )}

      {/* Comments List */}
      {!loading && (
        <div className="space-y-6">
          {sortedComments.length > 0 ? (
            sortedComments.map((comment) => (
              <div key={comment._id} className="flex items-start space-x-3">
                {/* Comment Avatar */}
                <img
                  src={getUserAvatar(comment) || '/placeholder-avatar.jpg'}
                  alt={getUserName(comment)}
                  className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                  onError={(e) => {
                    e.target.src = '/placeholder-avatar.jpg';
                  }}
                />

                {/* Comment Content */}
                <div className="flex-1 min-w-0">
                  {/* Comment Header */}
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-sm text-gray-900">
                      {getUserName(comment)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.createdAt || comment.timestamp)}
                    </span>
                  </div>

                  {/* Comment Text */}
                  {editingComment === comment._id ? (
                    <div className="space-y-2">
                      <textarea
                        ref={editInputRef}
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                        rows="2"
                        maxLength="1000"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={cancelEditing}
                          className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleEditComment(comment._id)}
                          disabled={!editText.trim()}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 mb-2 break-words">
                      {comment.text}
                    </p>
                  )}

                  {/* Comment Actions */}
                  <div className="flex items-center space-x-4">
                    {/* Like Button */}
                    <button
                      onClick={() => handleLikeComment(comment._id)}
                      disabled={!isAuthenticated}
                      className={`flex items-center space-x-1 text-sm transition-colors ${
                        comment.isLiked
                          ? 'text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <ThumbsUp className={`h-4 w-4 ${comment.isLiked ? 'fill-current' : ''}`} />
                      <span>{comment.likeCount || 0}</span>
                    </button>

                    {/* Dislike Button */}
                    <button
                      disabled={!isAuthenticated}
                      className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ThumbsDown className="h-4 w-4" />
                    </button>

                    {/* Reply Button (for future implementation) */}
                    <button
                      disabled={!isAuthenticated}
                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Reply
                    </button>
                  </div>
                </div>

                {/* Comment Menu */}
                {canModifyComment(comment) && (
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(showMenu === comment._id ? null : comment._id)}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {showMenu === comment._id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10"
                          onClick={() => setShowMenu(null)}
                        />
                        <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-32">
                          <button
                            onClick={() => startEditing(comment)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center space-x-2"
                          >
                            <Edit className="h-3 w-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center space-x-2 text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No comments yet</h3>
              <p className="text-gray-600">
                {isAuthenticated ? "Be the first to comment!" : "Sign in to start the discussion"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentSection;