// Video player page with full functionality, comments, and related videos
// ✅ FIXED: Complete working VideoPage with proper JSX structure

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Share, Download, Save, MoreHorizontal, 
  ThumbsUp, ThumbsDown, Bell, BellOff, Flag, 
  Clock, Eye, Calendar, ChevronDown, ChevronUp,
  Play, Pause, Volume2, VolumeX, Maximize, Settings
} from 'lucide-react';
import VideoPlayer from '../components/VideoPlayer';
import CommentSection from '../components/CommentSection';
import VideoCard from '../components/VideoCard';
import { mockVideos } from '../data/mockData';
import { formatViews, formatDate, formatSubscribers } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';

const VideoPage = ({ 
  video, 
  onBack, 
  onLike, 
  onDislike, 
  onAddComment, 
  onEditComment, 
  onDeleteComment, 
  sidebarOpen,
  onVideoClick 
}) => {
  const { isAuthenticated, user } = useAuth();
  
  // Component state
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [loading, setLoading] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [relatedVideosCount, setRelatedVideosCount] = useState(10);

  // ✅ SAFE: Helper functions to extract data from potentially nested objects
  const getUploaderName = () => {
    if (!video.uploader) return 'Unknown Channel';
    
    if (typeof video.uploader === 'object' && video.uploader) {
      return video.uploader.username || video.uploader.name || 'Unknown Channel';
    }
    
    if (typeof video.uploader === 'string') {
      return video.uploader;
    }
    
    return 'Unknown Channel';
  };

  const getUploaderAvatar = () => {
    if (!video.uploader) return video.uploaderAvatar || null;
    
    if (typeof video.uploader === 'object' && video.uploader) {
      return video.uploader.avatar || video.uploaderAvatar || null;
    }
    
    return video.uploaderAvatar || null;
  };

  const getVideoTitle = () => {
    if (typeof video.title === 'string') return video.title;
    if (video.title && typeof video.title === 'object') return video.title.toString();
    return 'Untitled Video';
  };

  const getVideoDescription = () => {
    if (typeof video.description === 'string') return video.description;
    if (video.description && typeof video.description === 'object') return video.description.toString();
    return 'No description available.';
  };

  const getRelatedVideoUploader = (relatedVideo) => {
    if (!relatedVideo.uploader) return 'Unknown';
    
    if (typeof relatedVideo.uploader === 'object' && relatedVideo.uploader) {
      return relatedVideo.uploader.username || relatedVideo.uploader.name || 'Unknown';
    }
    
    if (typeof relatedVideo.uploader === 'string') {
      return relatedVideo.uploader;
    }
    
    return 'Unknown';
  };

  // Get related videos (excluding current video)
  const relatedVideos = mockVideos
    .filter(v => v.videoId !== video.videoId)
    .sort((a, b) => {
      // Prioritize same category videos
      if (a.category === video.category && b.category !== video.category) return -1;
      if (b.category === video.category && a.category !== video.category) return 1;
      // Then sort by popularity
      return b.views - a.views;
    })
    .slice(0, relatedVideosCount);

  // Handle like action
  const handleLike = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      setLiked(!liked);
      if (disliked) setDisliked(false);
      
      if (onLike) {
        await onLike(video.videoId);
      }
    } catch (error) {
      console.error('Failed to like video:', error);
      setLiked(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle dislike action
  const handleDislike = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      setDisliked(!disliked);
      if (liked) setLiked(false);
      
      if (onDislike) {
        await onDislike(video.videoId);
      }
    } catch (error) {
      console.error('Failed to dislike video:', error);
      setDisliked(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle subscribe action
  const handleSubscribe = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      setSubscribed(!subscribed);
    } catch (error) {
      console.error('Failed to subscribe:', error);
      setSubscribed(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle save action
  const handleSave = () => {
    if (!isAuthenticated) return;
    setSaved(!saved);
  };

  // Handle share action
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: getVideoTitle(),
        text: getVideoDescription(),
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Load more related videos
  const loadMoreRelated = () => {
    setRelatedVideosCount(prev => prev + 10);
  };

  // Auto-scroll to top when video changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [video.videoId]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch (e.key.toLowerCase()) {
        case 'l':
          if (isAuthenticated) handleLike();
          break;
        case 's':
          if (isAuthenticated) handleSubscribe();
          break;
        case 'escape':
          if (onBack) onBack();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isAuthenticated, liked, subscribed]);

  return (
    <div className="min-h-screen bg-white">
      
      {/* ✅ FIXED: Mobile Back Button with proper spacing */}
      <div className="lg:hidden sticky top-14 bg-white border-b border-gray-200 p-3 z-40">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-700 hover:text-black transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
      </div>

      {/* ✅ FIXED: Main Container with proper spacing and responsive layout */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}`}>
        <div className="flex flex-col xl:flex-row gap-0 xl:gap-6">
          
          {/* ✅ FIXED: Main Video Section with proper sizing */}
          <div className="flex-1 min-w-0">
            <div className="p-4 space-y-4">
            
              {/* ✅ FIXED: Video Player - Full width, proper aspect ratio */}
              <div className="w-full">
                <div className="relative w-full aspect-video bg-black overflow-hidden">
                  <iframe
                    src={`${video.videoUrl}${autoplay ? '?autoplay=1' : ''}`}
                    title={getVideoTitle()}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      border: 'none',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* ✅ FIXED: Video Title - Clear and prominent */}
              <div className="space-y-3">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-snug break-words">
                  {getVideoTitle()}
                </h1>

                {/* ✅ FIXED: Video Metadata - Clean layout */}
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{formatViews(video.views || 0)} views</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(video.uploadDate || video.createdAt)}</span>
                  </div>
                  <span>•</span>
                  <span className="bg-gray-100 px-2 py-1 rounded-full text-xs font-medium">
                    {video.category || 'General'}
                  </span>
                </div>
              </div>

              {/* ✅ FIXED: Channel Info and Actions - Better mobile layout */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                
                {/* Channel Info */}
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <img
                    src={getUploaderAvatar() || '/placeholder-avatar.jpg'}
                    alt={getUploaderName()}
                    className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover flex-shrink-0"
                    onError={(e) => {
                      e.target.src = '/placeholder-avatar.jpg';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{getUploaderName()}</h3>
                    <p className="text-sm text-gray-600 truncate">
                      {formatSubscribers(52000)} subscribers
                    </p>
                  </div>
                  
                  {/* Subscribe Button */}
                  {isAuthenticated && (
                    <button
                      onClick={handleSubscribe}
                      disabled={loading}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all flex-shrink-0 ${
                        subscribed
                          ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          : 'bg-black text-white hover:bg-gray-800'
                      }`}
                    >
                      {subscribed ? (
                        <>
                          <BellOff className="h-4 w-4" />
                          <span className="hidden sm:inline">Subscribed</span>
                        </>
                      ) : (
                        <>
                          <Bell className="h-4 w-4" />
                          <span className="hidden sm:inline">Subscribe</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  
                  {/* Like/Dislike */}
                  <div className="flex items-center bg-gray-100 rounded-full overflow-hidden">
                    <button
                      onClick={handleLike}
                      disabled={!isAuthenticated || loading}
                      className={`flex items-center space-x-2 px-3 sm:px-4 py-2 transition-colors ${
                        liked 
                          ? 'text-blue-600 bg-blue-50' 
                          : 'text-gray-700 hover:bg-gray-200'
                      } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <ThumbsUp className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                      <span className="text-sm font-medium">
                        {((video.likes || 0) + (liked ? 1 : 0)).toLocaleString()}
                      </span>
                    </button>
                    
                    <div className="w-px h-6 bg-gray-300" />
                    
                    <button
                      onClick={handleDislike}
                      disabled={!isAuthenticated || loading}
                      className={`flex items-center px-3 sm:px-4 py-2 transition-colors ${
                        disliked 
                          ? 'text-red-600 bg-red-50' 
                          : 'text-gray-700 hover:bg-gray-200'
                      } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <ThumbsDown className={`h-4 w-4 ${disliked ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                  
                  {/* Share Button */}
                  <button
                    onClick={handleShare}
                    className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    <Share className="h-4 w-4" />
                    <span className="text-sm font-medium hidden sm:inline">Share</span>
                  </button>
                  
                  {/* Save Button */}
                  {isAuthenticated && (
                    <button
                      onClick={handleSave}
                      className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-full transition-colors ${
                        saved
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      <Save className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
                      <span className="text-sm font-medium hidden sm:inline">
                        {saved ? 'Saved' : 'Save'}
                      </span>
                    </button>
                  )}
                  
                  {/* More Actions */}
                  <div className="relative">
                    <button
                      onClick={() => setShowMoreActions(!showMoreActions)}
                      className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    
                    {showMoreActions && (
                      <>
                        <div 
                          className="fixed inset-0 z-40"
                          onClick={() => setShowMoreActions(false)}
                        />
                        <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-48 py-1">
                          <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2">
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </button>
                          <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2">
                            <Flag className="h-4 w-4" />
                            <span>Report</span>
                          </button>
                          <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>Save to Watch Later</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* ✅ FIXED: Video Description */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4 text-sm font-medium text-gray-900">
                    <span>{formatViews(video.views || 0)} views</span>
                    <span>•</span>
                    <span>{formatDate(video.uploadDate || video.createdAt)}</span>
                  </div>
                  
                  <button
                    onClick={() => setShowDescription(!showDescription)}
                    className="flex items-center space-x-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <span>{showDescription ? 'Show less' : 'Show more'}</span>
                    {showDescription ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
                
                <div className={showDescription ? '' : 'line-clamp-3'}>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {getVideoDescription()}
                  </p>
                  
                  {showDescription && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-900">Category:</span>
                          <span className="ml-2 text-gray-600">{video.category || 'General'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Duration:</span>
                          <span className="ml-2 text-gray-600">{video.duration || '0:00'}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Likes:</span>
                          <span className="ml-2 text-gray-600">{(video.likes || 0).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Comments:</span>
                          <span className="ml-2 text-gray-600">{video.comments?.length || 0}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Comments Section */}
              <CommentSection
                video={video}
                onAddComment={onAddComment}
                onEditComment={onEditComment}
                onDeleteComment={onDeleteComment}
              />
              
            </div>
          </div>

          {/* ✅ FIXED: Related Videos Sidebar - Proper sizing */}
          <div className="xl:w-[400px] xl:flex-shrink-0 border-t xl:border-t-0 xl:border-l border-gray-200">
            <div className="p-4 space-y-4">
              
              {/* Autoplay Toggle */}
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-lg">Related Videos</h3>
                <button
                  onClick={() => setAutoplay(!autoplay)}
                  className={`text-sm px-3 py-1 rounded-full transition-colors ${
                    autoplay ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Autoplay {autoplay ? 'ON' : 'OFF'}
                </button>
              </div>
              
              {/* Related Videos List */}
              <div className="space-y-3">
                {relatedVideos.map((relatedVideo, index) => (
                  <div 
                    key={relatedVideo.videoId} 
                    onClick={() => onVideoClick(relatedVideo)}
                    className="flex space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="relative flex-shrink-0 w-40 h-24">
                      <img
                        src={relatedVideo.thumbnailUrl || relatedVideo.thumbnail}
                        alt={relatedVideo.title || 'Video'}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/160x90?text=Video';
                        }}
                      />
                      <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 py-0.5 rounded">
                        {relatedVideo.duration || '0:00'}
                      </div>
                    </div>
                    
                    {/* Video Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="text-sm font-medium line-clamp-2 leading-snug">
                        {relatedVideo.title || 'Untitled Video'}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {getRelatedVideoUploader(relatedVideo)}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 space-x-1">
                        <span>{formatViews(relatedVideo.views || 0)}</span>
                        <span>•</span>
                        <span>{formatDate(relatedVideo.uploadDate || relatedVideo.createdAt)}</span>
                      </div>
                      {relatedVideo.category === video.category && (
                        <span className="inline-block bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                          Same category
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Load More Button */}
                {relatedVideosCount < mockVideos.length - 1 && (
                  <button
                    onClick={loadMoreRelated}
                    className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 font-medium hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Show more videos
                  </button>
                )}
              </div>
              
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default VideoPage;