// Complete Home Page Component for YouTube Clone
// Main landing page with video grid, filters, search, and responsive design

import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Clock, Flame, Star, Grid, List, Filter, SortAsc } from 'lucide-react';
import VideoCard, { VideoCardSkeleton } from '../components/VideoCard';
import { mockVideos, categories } from '../data/mockData';
import { useDebounce } from '../hooks/useApi';
import { formatViews } from '../utils/helpers';

const HomePage = ({ onVideoClick, searchQuery, sidebarOpen }) => {
  // State management
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // newest, popular, trending, oldest
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [visibleVideos, setVisibleVideos] = useState(12);
  const [hasMore, setHasMore] = useState(true);

  // Debounced search to prevent excessive filtering
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter and sort videos based on current criteria
  const filteredAndSortedVideos = useMemo(() => {
    let filtered = [...mockVideos];

    // Apply search filter
    if (debouncedSearchQuery) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        video.uploader.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        video.category.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (activeCategory !== 'All') {
      filtered = filtered.filter(video => video.category === activeCategory);
    }

    // Apply sorting
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'trending':
        filtered.sort((a, b) => (b.likes - b.dislikes) - (a.likes - a.dislikes));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        break;
    }

    return filtered;
  }, [debouncedSearchQuery, activeCategory, sortBy]);

  // Get videos to display based on pagination
  const displayedVideos = filteredAndSortedVideos.slice(0, visibleVideos);

  // Update hasMore based on available videos
  useEffect(() => {
    setHasMore(visibleVideos < filteredAndSortedVideos.length);
  }, [visibleVideos, filteredAndSortedVideos.length]);

  // Handle category change
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setVisibleVideos(12); // Reset pagination
    setLoading(true);
    
    // Simulate loading delay
    setTimeout(() => setLoading(false), 300);
  };

  // Handle sort change
  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setShowSortMenu(false);
    setVisibleVideos(12); // Reset pagination
  };

  // Load more videos
  const handleLoadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setVisibleVideos(prev => prev + 12);
      setLoading(false);
    }, 500);
  };

  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest first', icon: Clock },
    { value: 'popular', label: 'Most popular', icon: TrendingUp },
    { value: 'trending', label: 'Trending now', icon: Flame },
    { value: 'oldest', label: 'Oldest first', icon: Star }
  ];

  // Get trending videos for hero section
  const trendingVideos = useMemo(() => {
    return [...mockVideos]
      .sort((a, b) => (b.likes - b.dislikes) - (a.likes - a.dislikes))
      .slice(0, 3);
  }, []);

  return (
    <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-60' : 'ml-0'} min-h-screen bg-gray-50`}>
      
      {/* Hero Section - Only show when no search query */}
      {!debouncedSearchQuery && activeCategory === 'All' && (
        <div className="bg-gradient-to-r from-red-600 to-purple-600 text-white py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome to YouTube Clone</h1>
            <p className="text-lg opacity-90 mb-6">Discover amazing videos from creators around the world</p>
            
            {/* Trending Videos Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trendingVideos.map((video, index) => (
                <div 
                  key={video.videoId}
                  onClick={() => onVideoClick(video)}
                  className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 cursor-pointer hover:bg-opacity-20 transition-all"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Flame className="h-4 w-4 text-orange-400" />
                    <span className="text-sm font-medium">#{index + 1} Trending</span>
                  </div>
                  <h3 className="font-medium line-clamp-2 text-sm">{video.title}</h3>
                  <p className="text-xs opacity-75 mt-1">{formatViews(video.views)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Sort Controls */}
      <div className="sticky top-14 bg-white border-b border-gray-200 z-30">
        {/* Category Filter Buttons */}
        <div className="flex space-x-3 overflow-x-auto scrollbar-hide py-3 px-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeCategory === category
                  ? 'bg-black text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Sort and View Controls */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            {/* Results Count */}
            <span className="text-sm text-gray-600">
              {filteredAndSortedVideos.length} videos found
              {debouncedSearchQuery && (
                <span className="ml-1">for "{debouncedSearchQuery}"</span>
              )}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span>Sort by</span>
                <SortAsc className="h-4 w-4" />
              </button>

              {showSortMenu && (
                <div className="absolute right-0 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-48">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortChange(option.value)}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-100 transition-colors flex items-center space-x-2 ${
                        sortBy === option.value ? 'bg-gray-50 font-medium text-blue-600' : ''
                      }`}
                    >
                      <option.icon className="h-4 w-4" />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
                title="Grid view"
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
                }`}
                title="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4">
        {/* Loading State */}
        {loading && (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "space-y-4"
          }>
            {[...Array(8)].map((_, index) => (
              <VideoCardSkeleton key={index} size="medium" />
            ))}
          </div>
        )}

        {/* Video Grid/List */}
        {!loading && displayedVideos.length > 0 && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                {displayedVideos.map((video, index) => (
                  <div
                    key={video.videoId}
                    className="transform transition-all duration-200 hover:scale-105"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <VideoCard
                      video={video}
                      onClick={onVideoClick}
                      size="medium"
                      showChannel={true}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4 max-w-4xl">
                {displayedVideos.map((video, index) => (
                  <div
                    key={video.videoId}
                    onClick={() => onVideoClick(video)}
                    className="flex space-x-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-48 h-32 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium line-clamp-2 mb-2">{video.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{video.uploader}</p>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">{video.description}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span>{formatViews(video.views)}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(video.uploadDate).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">{video.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
                >
                  {loading ? 'Loading...' : 'Load More Videos'}
                </button>
              </div>
            )}
          </>
        )}

        {/* No Results State */}
        {!loading && filteredAndSortedVideos.length === 0 && (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="bg-gray-100 rounded-full p-8 mb-6 inline-flex">
                <TrendingUp className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No videos found</h3>
              <p className="text-gray-600 mb-6">
                {debouncedSearchQuery 
                  ? `No videos match your search for "${debouncedSearchQuery}"`
                  : `No videos found in the ${activeCategory} category`
                }
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Try:</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Different keywords</li>
                  <li>• Different category</li>
                  <li>• Checking your spelling</li>
                </ul>
              </div>
              <button
                onClick={() => {
                  setActiveCategory('All');
                  // Clear search would need to be handled by parent component
                }}
                className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View All Videos
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating scroll to top button */}
      {displayedVideos.length > 12 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 bg-black text-white p-3 rounded-full shadow-lg hover:bg-gray-800 transition-all z-50"
          title="Scroll to top"
        >
          <TrendingUp className="h-5 w-5 rotate-180" />
        </button>
      )}
    </div>
  );
};

export default HomePage;