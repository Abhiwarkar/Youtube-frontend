// HOMEPAGE - Welcome to YouTube section removed

import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Clock, Flame, Star, Grid, List, Filter, SortAsc } from 'lucide-react';
import VideoCard, { VideoCardSkeleton } from '../components/VideoCard';
import { mockVideos, categories } from '../data/mockData';
import { useDebounce } from '../hooks/useApi';
import { formatViews } from '../utils/helpers';

const HomePage = ({ onVideoClick, searchQuery, sidebarOpen }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [visibleVideos, setVisibleVideos] = useState(12);
  const [hasMore, setHasMore] = useState(true);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filteredAndSortedVideos = useMemo(() => {
    let filtered = [...mockVideos];

    if (debouncedSearchQuery) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        video.uploader.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        video.category.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
    }

    if (activeCategory !== 'All') {
      filtered = filtered.filter(video => video.category === activeCategory);
    }

    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.uploadDate) - new Date(b.uploadDate));
        break;
      default:
        break;
    }

    return filtered;
  }, [debouncedSearchQuery, activeCategory, sortBy]);

  const displayedVideos = filteredAndSortedVideos.slice(0, visibleVideos);

  const loadMore = () => {
    const newVisible = visibleVideos + 12;
    setVisibleVideos(newVisible);
    if (newVisible >= filteredAndSortedVideos.length) {
      setHasMore(false);
    }
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setVisibleVideos(12);
    setHasMore(true);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setShowSortMenu(false);
    setVisibleVideos(12);
    setHasMore(true);
  };

  return (
    <main className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-60' : 'ml-0'} bg-white min-h-screen`}>
      {/* Categories Section */}
      <div className="sticky top-14 bg-white border-b border-gray-200 z-30">
        <div className="max-w-full overflow-x-auto">
          <div className="flex items-center space-x-3 px-4 py-3 min-w-max">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  activeCategory === category
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-full px-4 py-6">
        {/* Controls Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 font-medium">
              {filteredAndSortedVideos.length} videos found
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span className="text-sm">Sort by</span>
                <SortAsc className="h-4 w-4" />
              </button>
              
              {showSortMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  <div className="py-2">
                    <button
                      onClick={() => handleSortChange('newest')}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${sortBy === 'newest' ? 'text-blue-600 font-medium' : ''}`}
                    >
                      Upload date (newest)
                    </button>
                    <button
                      onClick={() => handleSortChange('oldest')}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${sortBy === 'oldest' ? 'text-blue-600 font-medium' : ''}`}
                    >
                      Upload date (oldest)
                    </button>
                    <button
                      onClick={() => handleSortChange('popular')}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${sortBy === 'popular' ? 'text-blue-600 font-medium' : ''}`}
                    >
                      View count
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Videos Grid */}
        {loading ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {[...Array(12)].map((_, index) => (
              <VideoCardSkeleton key={index} />
            ))}
          </div>
        ) : displayedVideos.length > 0 ? (
          <>
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {displayedVideos.map((video) => (
                <VideoCard
                  key={video.videoId}
                  video={video}
                  onClick={() => onVideoClick(video)}
                  viewMode={viewMode}
                />
              ))}
            </div>
            
            {/* Load More Button */}
            {hasMore && filteredAndSortedVideos.length > visibleVideos && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Load More Videos
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="text-gray-400 mb-4">
                <Clock className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {debouncedSearchQuery ? 'No videos found' : 'No videos available'}
              </h3>
              <p className="text-gray-600">
                {debouncedSearchQuery 
                  ? `No videos match "${debouncedSearchQuery}". Try different keywords.`
                  : 'Check back later for new content!'
                }
              </p>
              {debouncedSearchQuery && (
                <button
                  onClick={() => {
                    setActiveCategory('All');
                    // Clear search if possible
                  }}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Show All Videos
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default HomePage;