// Custom Hook for Authentication
// Provides easy access to authentication state and methods

import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

/**
 * Custom hook to access authentication context
 * @returns {Object} Authentication state and methods
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

/**
 * Custom hook for authentication with additional utilities
 * @returns {Object} Extended authentication functionality
 */
export const useAuthExtended = () => {
  const auth = useAuth();
  
  // Additional utility functions
  const utilities = {
    // Check if user is admin
    isAdmin: () => {
      return auth.user?.role === 'admin';
    },
    
    // Check if user is channel owner
    isChannelOwner: (channelId) => {
      return auth.user?.channels?.includes(channelId);
    },
    
    // Get user initials for avatar fallback
    getUserInitials: () => {
      if (!auth.user?.username) return 'U';
      return auth.user.username
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    },
    
    // Get user display name
    getDisplayName: () => {
      return auth.user?.displayName || auth.user?.username || 'User';
    },
    
    // Check if profile is complete
    isProfileComplete: () => {
      if (!auth.user) return false;
      const requiredFields = ['username', 'email'];
      return requiredFields.every(field => auth.user[field]);
    },
    
    // Format user info for display
    formatUserInfo: () => {
      if (!auth.user) return null;
      
      return {
        id: auth.user.userId,
        name: utilities.getDisplayName(),
        email: auth.user.email,
        avatar: auth.user.avatar,
        initials: utilities.getUserInitials(),
        channelCount: auth.user.channels?.length || 0,
        joinDate: auth.user.createdAt || new Date().toISOString()
      };
    }
  };
  
  return {
    ...auth,
    ...utilities
  };
};

export default useAuth;