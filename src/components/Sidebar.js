// Sidebar Component for YouTube Clone
// Updated version with sign-in section removed

import React, { useState } from 'react';
import {
  Home,
  PlayCircle,
  Users,
  User,
  History,
  ListVideo,
  Clock,
  ThumbsUp,
  Download,
  TrendingUp,
  Music,
  Gamepad2,
  FileText,
  Trophy,
  Lightbulb,
  Shirt,
  Podcast,
  Settings,
  Flag,
  HelpCircle,
  Send,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

const Sidebar = ({ 
  isOpen, 
  onNavigate, 
  currentPage, 
  isMobile = false,
  onClose 
}) => {
  const [showMoreSubs, setShowMoreSubs] = useState(false);
  
  // For now, using static auth - replace with real auth
  const isAuthenticated = false;

  const handleNavigation = (pageId) => {
    if (onNavigate) {
      onNavigate(pageId);
    }
    if (isMobile && onClose) {
      onClose();
    }
  };

  const subscriptions = [
    { id: 'channel01', name: 'MrBeast', isLive: false },
    { id: 'channel02', name: 'PewDiePie', isLive: false },
    { id: 'channel03', name: 'T-Series', isLive: true },
    { id: 'channel04', name: 'Dude Perfect', isLive: false },
    { id: 'channel05', name: 'Cocomelon', isLive: false },
    { id: 'channel06', name: 'SET India', isLive: false },
  ];

  // Collapsed sidebar (mini version)
  if (!isOpen && !isMobile) {
    return (
      <div className="fixed left-0 top-14 w-18 h-full bg-white border-r border-gray-200 z-40 overflow-y-auto">
        <div className="py-2">
          <SidebarItemMini 
            icon={Home} 
            label="Home" 
            active={currentPage === 'home'}
            onClick={() => handleNavigation('home')}
          />
          <SidebarItemMini 
            icon={PlayCircle} 
            label="Shorts" 
            active={currentPage === 'shorts'}
            onClick={() => handleNavigation('shorts')}
          />
          <SidebarItemMini 
            icon={Users} 
            label="Subscriptions" 
            active={currentPage === 'subscriptions'}
            onClick={() => handleNavigation('subscriptions')}
          />
          <SidebarItemMini 
            icon={User} 
            label="You" 
            active={currentPage === 'profile'}
            onClick={() => handleNavigation('profile')}
          />
        </div>
      </div>
    );
  }

  // Don't render anything if closed on mobile
  if (!isOpen && isMobile) {
    return null;
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div 
        className="fixed left-0 top-14 w-60 h-full bg-white border-r border-gray-200 z-50 overflow-y-auto"
        data-sidebar
      >
        <div className="py-2">
          {/* Main Navigation */}
          <div className="px-3 space-y-1">
            <SidebarItem 
              icon={Home} 
              label="Home" 
              active={currentPage === 'home'}
              onClick={() => handleNavigation('home')}
            />
            <SidebarItem 
              icon={PlayCircle} 
              label="Shorts" 
              active={currentPage === 'shorts'}
              onClick={() => handleNavigation('shorts')}
            />
            <SidebarItem 
              icon={Users} 
              label="Subscriptions" 
              active={currentPage === 'subscriptions'}
              onClick={() => handleNavigation('subscriptions')}
            />
          </div>

          <hr className="my-3 border-gray-200" />

          {/* You section - Only show if authenticated */}
          {isAuthenticated && (
            <>
              <div className="px-3">
                <div className="flex items-center space-x-4 py-2 text-sm font-medium">
                  <span>You</span>
                  <ChevronRight size={16} />
                </div>
                <div className="space-y-1">
                  <SidebarItem 
                    icon={User} 
                    label="Your channel" 
                    active={currentPage === 'channel'}
                    onClick={() => handleNavigation('channel')}
                  />
                  <SidebarItem 
                    icon={History} 
                    label="History" 
                    active={currentPage === 'history'}
                    onClick={() => handleNavigation('history')}
                  />
                  <SidebarItem 
                    icon={ListVideo} 
                    label="Playlists" 
                    active={currentPage === 'playlists'}
                    onClick={() => handleNavigation('playlists')}
                  />
                  <SidebarItem 
                    icon={ListVideo} 
                    label="Your videos" 
                    active={currentPage === 'your-videos'}
                    onClick={() => handleNavigation('your-videos')}
                  />
                  <SidebarItem 
                    icon={Clock} 
                    label="Watch Later" 
                    active={currentPage === 'watch-later'}
                    onClick={() => handleNavigation('watch-later')}
                  />
                  <SidebarItem 
                    icon={ThumbsUp} 
                    label="Liked videos" 
                    active={currentPage === 'liked-videos'}
                    onClick={() => handleNavigation('liked-videos')}
                  />
                  <SidebarItem 
                    icon={Download} 
                    label="Downloads" 
                    active={currentPage === 'downloads'}
                    onClick={() => handleNavigation('downloads')}
                  />
                </div>
              </div>

              <hr className="my-3 border-gray-200" />
            </>
          )}

          {/* Subscriptions - Only show if authenticated */}
          {isAuthenticated && subscriptions.length > 0 && (
            <div className="px-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium">Subscriptions</span>
              </div>
              <div className="space-y-1">
                {subscriptions.slice(0, showMoreSubs ? subscriptions.length : 7).map((sub) => (
                  <div 
                    key={sub.id} 
                    className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                    onClick={() => handleNavigation(`channel/${sub.id}`)}
                  >
                    <div className="relative">
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-600">
                          {sub.name.charAt(0)}
                        </span>
                      </div>
                      {sub.isLive && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-red-600 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <span className="text-sm text-gray-700 truncate flex-1">{sub.name}</span>
                  </div>
                ))}
                {subscriptions.length > 7 && (
                  <button
                    onClick={() => setShowMoreSubs(!showMoreSubs)}
                    className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer w-full"
                  >
                    <ChevronDown size={16} className={`transform transition-transform ${showMoreSubs ? 'rotate-180' : ''}`} />
                    <span className="text-sm text-gray-700">
                      {showMoreSubs ? 'Show fewer' : `Show ${subscriptions.length - 7} more`}
                    </span>
                  </button>
                )}
              </div>

              <hr className="my-3 border-gray-200" />
            </div>
          )}

          {/* Explore */}
          <div className="px-3">
            <div className="py-2">
              <span className="text-sm font-medium">Explore</span>
            </div>
            <div className="space-y-1">
              <SidebarItem 
                icon={TrendingUp} 
                label="Trending" 
                active={currentPage === 'trending'}
                onClick={() => handleNavigation('trending')}
              />
              <SidebarItem 
                icon={Music} 
                label="Music" 
                active={currentPage === 'music'}
                onClick={() => handleNavigation('music')}
              />
              <SidebarItem 
                icon={Gamepad2} 
                label="Gaming" 
                active={currentPage === 'gaming'}
                onClick={() => handleNavigation('gaming')}
              />
              <SidebarItem 
                icon={FileText} 
                label="News" 
                active={currentPage === 'news'}
                onClick={() => handleNavigation('news')}
              />
              <SidebarItem 
                icon={Trophy} 
                label="Sports" 
                active={currentPage === 'sports'}
                onClick={() => handleNavigation('sports')}
              />
              <SidebarItem 
                icon={Lightbulb} 
                label="Learning" 
                active={currentPage === 'learning'}
                onClick={() => handleNavigation('learning')}
              />
              <SidebarItem 
                icon={Shirt} 
                label="Fashion & Beauty" 
                active={currentPage === 'fashion'}
                onClick={() => handleNavigation('fashion')}
              />
              <SidebarItem 
                icon={Podcast} 
                label="Podcasts" 
                active={currentPage === 'podcasts'}
                onClick={() => handleNavigation('podcasts')}
              />
            </div>
          </div>

          <hr className="my-3 border-gray-200" />

          {/* More from YouTube */}
          <div className="px-3">
            <div className="py-2">
              <span className="text-sm font-medium">More from YouTube</span>
            </div>
            <div className="space-y-1">
              <SidebarItem 
                icon={PlayCircle} 
                label="YouTube Premium" 
                onClick={() => handleNavigation('premium')}
              />
              <SidebarItem 
                icon={Music} 
                label="YouTube Music" 
                onClick={() => handleNavigation('music-app')}
              />
              <SidebarItem 
                icon={Users} 
                label="YouTube Kids" 
                onClick={() => handleNavigation('kids')}
              />
            </div>
          </div>

          <hr className="my-3 border-gray-200" />

          {/* Settings and Help */}
          <div className="px-3 space-y-1">
            <SidebarItem 
              icon={Settings} 
              label="Settings" 
              active={currentPage === 'settings'}
              onClick={() => handleNavigation('settings')}
            />
            <SidebarItem 
              icon={Flag} 
              label="Report history" 
              onClick={() => handleNavigation('report')}
            />
            <SidebarItem 
              icon={HelpCircle} 
              label="Help" 
              active={currentPage === 'help'}
              onClick={() => handleNavigation('help')}
            />
            <SidebarItem 
              icon={Send} 
              label="Send feedback" 
              onClick={() => handleNavigation('feedback')}
            />
          </div>

          {/* Footer */}
          <div className="px-6 py-4 text-xs text-gray-500 space-y-2">
            <div className="space-y-1">
              <div>About Press Copyright</div>
              <div>Contact us Creators</div>
              <div>Advertise Developers</div>
            </div>
            <div className="space-y-1">
              <div>Terms Privacy Policy & Safety</div>
              <div>How YouTube works</div>
              <div>Test new features</div>
            </div>
            <div className="pt-2 text-gray-400">
              © 2024 YouTube Clone
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// Regular sidebar item
const SidebarItem = ({ icon: Icon, label, active = false, onClick }) => {
  return (
    <div 
      className={`flex items-center space-x-6 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        active ? 'bg-gray-100 font-medium' : 'hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      <Icon size={20} className={active ? 'text-red-600' : 'text-gray-700'} />
      <span className={`text-sm ${active ? 'font-medium' : ''}`}>{label}</span>
    </div>
  );
};

// Mini sidebar item (collapsed state)
const SidebarItemMini = ({ icon: Icon, label, active = false, onClick }) => {
  return (
    <div 
      className={`flex flex-col items-center py-4 px-1 cursor-pointer transition-colors ${
        active ? 'bg-gray-100' : 'hover:bg-gray-100'
      }`}
      onClick={onClick}
    >
      <Icon size={20} className={active ? 'text-red-600' : 'text-gray-700'} />
      <span className={`text-xs mt-1 text-center ${active ? 'font-medium' : ''}`} style={{ fontSize: '10px' }}>
        {label}
      </span>
    </div>
  );
};

export default Sidebar;