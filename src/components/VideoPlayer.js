
// Main video player with controls, video information, and interaction buttons
// Responsive design with like/dislike, subscribe, and share functionality

import React, { useState, useRef, useEffect } from 'react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Share, 
  Download, 
  Save, 
  MoreHorizontal,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Settings,
  Clock,
  Bell,
  BellOff
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { formatViews, formatDate, formatSubscribers } from '../utils/helpers';

/**
 * VideoPlayer Component
 * @param {Object} props - Component props
 * @param {Object} props.video - Video data object
 * @param {Function} props.onLike - Like handler
 * @param {Function} props.onDislike - Dislike handler
 * @param {Function} props.onSubscribe - Subscribe handler
 * @param {Function} props.onShare - Share handler
 * @param {boolean} props.autoplay - Auto-play video
 */
const VideoPlayer = ({ 
  video, 
  onLike, 
  onDislike, 
  onSubscribe, 
  onShare,
  autoplay = false 
}) => {
  // Authentication context
  const { isAuthenticated, user } = useAuth();

  // Component state
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [loading, setLoading] = useState(false);

  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Refs
  const videoRef = useRef(null);
  const playerRef = useRef(null);

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
      setLiked(false); // Revert on error
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
      setDisliked(false); // Revert on error
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
      
      if (onSubscribe) {
        await onSubscribe(video.channelId);
      }
    } catch (error) {
      console.error('Failed to subscribe:', error);
      setSubscribed(false); // Revert on error
    } finally {
      setLoading(false);
    }
  };

  // Handle save action
  const handleSave = () => {
    if (!isAuthenticated) return;
    setSaved(!saved);
    // TODO: Implement save to watch later or playlist
  };

  // Handle share action
  const handleShare = () => {
    if (onShare) {
      onShare(video);
    } else {
      // Default share behavior
      if (navigator.share) {
        navigator.share({
          title: video.title,
          text: video.description,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(window.location.href);
        // TODO: Show toast notification
      }
    }
  };

  // Video player controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Format time for display
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Video event handlers
  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

  return (
    <div className="w-full">
      {/* Video Player Container */}
      <div 
        ref={playerRef}
        className="relative aspect-video bg-black rounded-lg overflow-hidden group"
      >
        {/* Video Element */}
        <iframe
          ref={videoRef}
          src={`${video.videoUrl}${autoplay ? '?autoplay=1' : ''}`}
          title={video.title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={handleLoadedMetadata}
        />

        {/* Custom Video Controls Overlay (for future custom player) */}
        {false && ( // Disabled for iframe player
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {/* Play/Pause Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={togglePlay}
                className="bg-black/60 text-white p-4 rounded-full hover:bg-black/80 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8" />
                )}
              </button>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              {/* Progress Bar */}
              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max={duration}
                  value={currentTime}
                  onChange={(e) => {
                    const time = parseFloat(e.target.value);
                    setCurrentTime(time);
                    if (videoRef.current) {
                      videoRef.current.currentTime = time;
                    }
                  }}
                  className="w-full h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Control Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button onClick={togglePlay} className="text-white hover:text-gray-300">
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <button onClick={toggleMute} className="text-white hover:text-gray-300">
                      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  <span className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="text-white hover:text-gray-300">
                    <Settings className="h-5 w-5" />
                  </button>
                  <button onClick={toggleFullscreen} className="text-white hover:text-gray-300">
                    <Maximize className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Information */}
      <div className="mt-4 space-y-4">
        {/* Video Title */}
        <h1 className="text-xl font-bold text-gray-900 leading-tight">
          {video.title}
        </h1>

        {/* Video Stats and Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          {/* Channel Info and Subscribe */}
          <div className="flex items-center space-x-4">
            <img
              src={video.uploaderAvatar}
              alt={video.uploader}
              className="h-10 w-10 rounded-full object-cover"
              onError={(e) => {
                e.target.src = '/placeholder-avatar.jpg';
              }}
            />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{video.uploader}</p>
              <p className="text-sm text-gray-600">
                {formatSubscribers(52000)} subscribers
              </p>
            </div>
            
            {/* Subscribe Button */}
            {isAuthenticated && (
              <button
                onClick={handleSubscribe}
                disabled={loading}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  subscribed
                    ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                {subscribed ? (
                  <>
                    <BellOff className="h-4 w-4" />
                    <span>Subscribed</span>
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4" />
                    <span>Subscribe</span>
                  </>
                )}
              </button>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Like/Dislike */}
            <div className="flex items-center bg-gray-100 rounded-full">
              <button
                onClick={handleLike}
                disabled={!isAuthenticated || loading}
                className={`flex items-center space-x-2 px-4 py-2 rounded-l-full transition-colors ${
                  liked 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-700 hover:bg-gray-200'
                } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ThumbsUp className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">
                  {(video.likes + (liked ? 1 : 0)).toLocaleString()}
                </span>
              </button>
              
              <div className="w-px h-6 bg-gray-300" />
              
              <button
                onClick={handleDislike}
                disabled={!isAuthenticated || loading}
                className={`flex items-center space-x-2 px-4 py-2 rounded-r-full transition-colors ${
                  disliked 
                    ? 'text-red-600 bg-red-50' 
                    : 'text-gray-700 hover:bg-gray-200'
                } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ThumbsDown className={`h-5 w-5 ${disliked ? 'fill-current' : ''}`} />
              </button>
            </div>
            
            {/* Share Button */}
            <button
              onClick={handleShare}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
            >
              <Share className="h-5 w-5" />
              <span className="text-sm font-medium">Share</span>
            </button>
            
            {/* Download Button */}
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
              <Download className="h-5 w-5" />
              <span className="text-sm font-medium hidden sm:inline">Download</span>
            </button>
            
            {/* Save Button */}
            {isAuthenticated && (
              <button
                onClick={handleSave}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                  saved
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Save className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} />
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
                <MoreHorizontal className="h-5 w-5" />
              </button>
              
              {showMoreActions && (
                <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-48">
                  <div className="py-1">
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                      Add to queue
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                      Report
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                      Transcript
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Video Metadata */}
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="flex items-center space-x-4 text-sm font-medium text-gray-900 mb-2">
            <span>{formatViews(video.views)}</span>
            <span>•</span>
            <span>{formatDate(video.uploadDate)}</span>
            <span>•</span>
            <span className="bg-gray-200 px-2 py-1 rounded-full text-xs">
              {video.category}
            </span>
          </div>
          
          {/* Description */}
          <div>
            <p className={`text-sm text-gray-700 ${showDescription ? '' : 'line-clamp-3'}`}>
              {video.description}
            </p>
            
            {video.description && video.description.length > 150 && (
              <button
                onClick={() => setShowDescription(!showDescription)}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 mt-2"
              >
                {showDescription ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;