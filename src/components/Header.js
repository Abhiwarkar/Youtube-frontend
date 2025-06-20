// FIXED HEADER WITH WORKING CREATE CHANNEL BUTTON

import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Menu, 
  User, 
  PlayCircle, 
  Bell, 
  Video, 
  Mic, 
  Upload,
  Settings,
  HelpCircle,
  LogOut,
  ArrowLeft,
  Plus
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Header = ({ 
  onToggleSidebar, 
  onSearch, 
  searchQuery, 
  onShowAuthModal,
  onNavigate,
  isMobile = false 
}) => {
  const { isAuthenticated, user, logout } = useAuth();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '');

  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);
  const searchInputRef = useRef(null);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (localSearchQuery.trim()) {
      if (onSearch) {
        onSearch(localSearchQuery.trim());
      }
      if (isMobile) {
        setShowMobileSearch(false);
      }
    }
  };

  const handleMobileSearchToggle = () => {
    setShowMobileSearch(!showMobileSearch);
    if (!showMobileSearch) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setShowUserMenu(false);
      if (onNavigate) {
        onNavigate('home');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // FIXED: Create Channel Handler
  const handleCreateChannel = () => {
    console.log('Create Channel clicked!'); // Debug log
    setShowUserMenu(false);
    if (onNavigate) {
      console.log('Navigating to create-channel'); // Debug log
      onNavigate('create-channel');
    }
  };

  // FIXED: Your Channel Handler  
  const handleYourChannel = () => {
    console.log('Your Channel clicked!'); // Debug log
    setShowUserMenu(false);
    if (onNavigate) {
      console.log('Navigating to channel'); // Debug log
      onNavigate('channel');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Mobile Search Overlay
  if (showMobileSearch) {
    return (
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="flex items-center px-4 py-3">
          <button
            onClick={handleMobileSearchToggle}
            className="p-2 hover:bg-gray-100 rounded-full mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <form onSubmit={handleSearchSubmit} className="flex-1 flex">
            <div className="flex-1 relative">
              <input
                ref={searchInputRef}
                type="text"
                value={localSearchQuery}
                onChange={handleSearchChange}
                placeholder="Search..."
                className="w-full px-4 py-2 border border-gray-300 rounded-l-full focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-full hover:bg-gray-100"
            >
              <Search className="h-5 w-5" />
            </button>
          </form>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div 
            className="flex items-center space-x-1 cursor-pointer"
            onClick={() => onNavigate && onNavigate('home')}
          >
            <PlayCircle className="h-8 w-8 text-red-600" />
            <span className="text-xl font-semibold hidden sm:inline">YouTube</span>
          </div>
        </div>

        {/* Center Section - Search (Desktop) */}
        {!isMobile && (
          <div className="flex-1 max-w-2xl mx-4">
            <form onSubmit={handleSearchSubmit} className="flex">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={localSearchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-l-full focus:outline-none focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-gray-50 border border-l-0 border-gray-300 rounded-r-full hover:bg-gray-100"
              >
                <Search className="h-5 w-5" />
              </button>
              <button
                type="button"
                className="ml-2 p-2 hover:bg-gray-100 rounded-full"
              >
                <Mic className="h-5 w-5" />
              </button>
            </form>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          
          {/* Mobile Search Button */}
          {isMobile && (
            <button
              onClick={handleMobileSearchToggle}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>
          )}

          {/* Create Button */}
          {isAuthenticated && (
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Video className="h-5 w-5" />
            </button>
          )}

          {/* Notifications */}
          {isAuthenticated && (
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-600 rounded-full"></span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="font-medium">Notifications</h3>
                  </div>
                  <div className="p-8 text-center text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>No new notifications</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Section */}
          {isAuthenticated ? (
            <div className="relative" ref={userMenuRef}>
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.username}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                {/* Show username on larger screens */}
                <span className="hidden lg:inline text-sm font-medium text-gray-700 max-w-32 truncate">
                  {user?.username || 'User'}
                </span>
              </button>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.username}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                          {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{user?.username || 'User'}</p>
                        <p className="text-sm text-gray-500 truncate">{user?.email || 'user@example.com'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    {/* FIXED: Your Channel Button */}
                    <button 
                      onClick={handleYourChannel}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center space-x-3"
                    >
                      <User className="h-4 w-4" />
                      <span>Your Channel</span>
                    </button>
                    
                    {/* FIXED: Create Channel Button */}
                    <button 
                      onClick={handleCreateChannel}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center space-x-3"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create Channel</span>
                    </button>
                    
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center space-x-3">
                      <Upload className="h-4 w-4" />
                      <span>Upload Video</span>
                    </button>
                    <hr className="my-2" />
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center space-x-3">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </button>
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center space-x-3">
                      <HelpCircle className="h-4 w-4" />
                      <span>Help</span>
                    </button>
                    <hr className="my-2" />
                    
                    {/* FIXED: Sign Out Button */}
                    <button 
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors flex items-center space-x-3"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={onShowAuthModal}
              className="flex items-center space-x-2 px-3 py-1.5 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
            >
              <User className="h-5 w-5" />
              <span className="text-sm font-medium hidden sm:inline">Sign in</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;