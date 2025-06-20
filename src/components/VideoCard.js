// VideoCard Component - Fixed YouTube-style structure
// FIXED: Proper layout with title, channel, views, and time info

import React from 'react';
import { formatViews } from '../utils/helpers';

// Helper function to format time ago
const formatTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffInSeconds / 31536000);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
};

const VideoCard = ({ video, onClick, size = "medium", showChannel = true }) => {
  const handleClick = () => {
    if (onClick && typeof onClick === 'function') {
      onClick(video);
    }
  };

  if (!video) {
    return <VideoCardSkeleton size={size} />;
  }

  return (
    <div 
      className="cursor-pointer group transition-all duration-200 hover:scale-[1.02]"
      onClick={handleClick}
    >
      {/* Thumbnail Container */}
      <div className="relative">
        {/* Thumbnail */}
        <div className="w-full aspect-video bg-gray-300 rounded-xl overflow-hidden relative">
          {video.thumbnailUrl ? (
            <img 
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          
          {/* Fallback when image fails or no URL */}
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{ display: video.thumbnailUrl ? 'none' : 'flex' }}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <p className="text-sm text-gray-600 px-2">Video</p>
            </div>
          </div>
          
          {/* Duration Badge */}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
            {video.duration || '10:30'}
          </div>
          
          {/* Hover Play Button */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
            <div className="w-12 h-12 bg-white bg-opacity-0 group-hover:bg-opacity-90 rounded-full flex items-center justify-center transition-all duration-200">
              <svg className="w-6 h-6 text-black opacity-0 group-hover:opacity-100 transition-opacity ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className="mt-3">
        <div className="flex space-x-3">
          {/* Channel Avatar */}
          {showChannel && (
            <div className="flex-shrink-0">
              {video.uploaderAvatar ? (
                <img
                  src={video.uploaderAvatar}
                  alt={video.uploader}
                  className="w-9 h-9 rounded-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center text-white text-sm font-bold"
                style={{ display: video.uploaderAvatar ? 'none' : 'flex' }}
              >
                {video.uploader?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          )}
          
          {/* Video Details */}
          <div className="flex-1 min-w-0">
            {/* Video Title */}
            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-5 mb-1 group-hover:text-blue-600 transition-colors">
              {video.title}
            </h3>
            
            {/* Channel Name */}
            {showChannel && (
              <p className="text-sm text-gray-600 hover:text-gray-900 transition-colors truncate mb-1">
                {video.uploader}
              </p>
            )}
            
            {/* Video Stats */}
            <div className="flex items-center text-sm text-gray-600 space-x-1">
              <span>{formatViews(video.views)}</span>
              <span>•</span>
              <span>{formatTimeAgo(video.uploadDate)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton loader component
export const VideoCardSkeleton = ({ size = "medium" }) => {
  return (
    <div className="animate-pulse">
      {/* Thumbnail Skeleton */}
      <div className="w-full aspect-video bg-gray-300 rounded-xl"></div>
      
      {/* Info Skeleton */}
      <div className="mt-3">
        <div className="flex space-x-3">
          {/* Avatar Skeleton */}
          <div className="w-9 h-9 bg-gray-300 rounded-full flex-shrink-0"></div>
          
          {/* Text Skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-full"></div>
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;