// UPDATED APP.JS - Auto-hide sidebar on video click (YouTube-like behavior)

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AuthModal from './components/AuthModal';
import HomePage from './pages/HomePage';
import VideoPage from './pages/VideoPage';
import ChannelPage from './pages/ChannelPage';
import ProfilePage from './pages/ProfilePage';
import { mockVideos } from './data/mockData';
import { getDeviceType } from './utils/helpers';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [videos, setVideos] = useState(mockVideos);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDeviceType = () => {
      const deviceType = getDeviceType();
      const mobile = deviceType === 'mobile';
      setIsMobile(mobile);
      
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  // Expose sidebar toggle function globally for components to use
  useEffect(() => {
    window.toggleSidebar = (state) => {
      if (typeof state === 'boolean') {
        setSidebarOpen(state);
      } else {
        setSidebarOpen(prev => !prev);
      }
    };
  }, []);

  const handleNavigation = (page) => {
    setCurrentPage(page);
    setSelectedVideo(null);
    
    // Auto-show sidebar when navigating back to home or other pages
    if (page === 'home' && !isMobile) {
      setSidebarOpen(true);
    } else if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // UPDATED: Auto-hide sidebar when video is clicked (YouTube behavior)
  const handleVideoClick = (video) => {
    setSelectedVideo(video);
    setCurrentPage('video');
    
    // ✅ AUTO-HIDE SIDEBAR ON VIDEO CLICK (like YouTube)
    setSidebarOpen(false);
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (currentPage !== 'home') {
      setCurrentPage('home');
    }
  };

  const handleShowAuthModal = () => {
    setShowAuthModal(true);
  };

  const handleLike = (videoId) => {
    setVideos(videos.map(video => 
      video.videoId === videoId 
        ? { ...video, likes: video.likes + 1 }
        : video
    ));
  };

  const handleDislike = (videoId) => {
    setVideos(videos.map(video => 
      video.videoId === videoId 
        ? { ...video, dislikes: video.dislikes + 1 }
        : video
    ));
  };

  const handleAddComment = (videoId, comment) => {
    setVideos(videos.map(video => 
      video.videoId === videoId 
        ? { ...video, comments: [...(video.comments || []), comment] }
        : video
    ));
  };

  const handleEditComment = (videoId, commentId, newText) => {
    setVideos(videos.map(video => 
      video.videoId === videoId 
        ? {
            ...video,
            comments: video.comments?.map(comment => 
              comment.commentId === commentId 
                ? { ...comment, text: newText }
                : comment
            ) || []
          }
        : video
    ));
  };

  const handleDeleteComment = (videoId, commentId) => {
    setVideos(videos.map(video => 
      video.videoId === videoId 
        ? {
            ...video,
            comments: video.comments?.filter(comment => 
              comment.commentId !== commentId
            ) || []
          }
        : video
    ));
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        onToggleSidebar={handleToggleSidebar}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        onShowAuthModal={handleShowAuthModal}
        onNavigate={handleNavigation}
        isMobile={isMobile}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onNavigate={handleNavigation}
        currentPage={currentPage}
        isMobile={isMobile}
        onClose={() => setSidebarOpen(false)}
      />

      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="pt-14">
        {currentPage === 'home' && (
          <HomePage 
            onVideoClick={handleVideoClick}
            searchQuery={searchQuery}
            sidebarOpen={sidebarOpen}
          />
        )}

        {currentPage === 'video' && selectedVideo && (
          <VideoPage
            video={selectedVideo}
            onBack={() => handleNavigation('home')}
            onLike={handleLike}
            onDislike={handleDislike}
            onAddComment={handleAddComment}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
            sidebarOpen={sidebarOpen}
            onVideoClick={handleVideoClick}
          />
        )}

        {(currentPage === 'channel' || currentPage === 'create-channel') && (
          <ChannelPage
            sidebarOpen={sidebarOpen}
            onVideoClick={handleVideoClick}
          />
        )}

        {currentPage === 'profile' && (
          <ProfilePage sidebarOpen={sidebarOpen} />
        )}

        {['trending', 'subscriptions', 'history', 'library', 'playlists', 
          'your-videos', 'watch-later', 'liked-videos', 'downloads',
          'music', 'gaming', 'news', 'sports', 'learning', 'fashion', 
          'podcasts', 'settings', 'help', 'feedback'].includes(currentPage) && (
          <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-60' : 'ml-0'} p-8`}>
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl font-bold mb-4 capitalize">
                {currentPage.replace('-', ' ')} Page
              </h2>
              <p className="text-gray-600">This page is under construction.</p>
            </div>
          </div>
        )}
      </main>

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
};

export default App;