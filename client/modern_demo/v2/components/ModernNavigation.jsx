import React, { useState, useEffect, useCallback } from 'react';
import { 
  FireIcon, 
  SparklesIcon, 
  EyeDropperIcon, 
  ExclamationTriangleIcon, 
  RocketLaunchIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  HomeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  HeartIcon,
  BellIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  StarIcon,
  PlayIcon,
  NewspaperIcon
} from '@heroicons/react/24/solid';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DIFFICULTY_OPTIONS } from '../../constants';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';

const ModernNavigation = () => {
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use real user data from AuthContext
  const currentUser = user || {
    username: 'Guest',
    fullName: 'Guest User',
    avatar: null,
    role: 'guest',
    unreadNotifications: 0
  };

  // Helper function to get avatar URL
  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    
    // If it's already a full URL, return as is
    if (avatar.startsWith('http')) {
      return avatar;
    }
    
    // Convert relative URL to full URL using API domain
    const baseUrl = import.meta.env.VITE_API_URL || 'https://api.deviantdare.com';
    return `${baseUrl.replace(/\/$/, '')}${avatar.startsWith('/') ? avatar : '/' + avatar}`;
  };

  // Helper function to get user initials
  const getUserInitials = (user) => {
    if (!user) return '?';
    const name = user.fullName || user.username || '';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';
  };

  // Helper function to get user color
  const getUserColor = (user) => {
    if (!user) return 'neutral-600';
    
    const id = user._id || user.id || user.username || '';
    const colors = [
      'red', 'blue', 'green', 'yellow', 'purple', 'pink', 
      'indigo', 'teal', 'orange', 'cyan', 'emerald', 'violet'
    ];
    
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length] + '-600';
  };

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/notifications');
      
      if (response.data) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setError('Failed to load notifications');
      showError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [user, showError]);

  // Load notifications when component mounts or user changes
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Real-time notifications via WebSocket (if available)
  useEffect(() => {
    if (!user) return;

    // Check if WebSocket is supported
    if (!('WebSocket' in window)) {
      console.log('WebSocket not supported, skipping real-time notifications');
      return;
    }

    let socket = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;

    const connectWebSocket = () => {
      try {
        // Set up WebSocket connection for real-time notifications
        socket = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`);
        
        socket.onopen = () => {
          console.log('WebSocket connected successfully');
          reconnectAttempts = 0;
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'notification') {
              setNotifications(prev => [data.notification, ...prev]);
              showSuccess('New notification received!');
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        socket.onerror = (error) => {
          console.warn('WebSocket connection error:', error);
        };

        socket.onclose = (event) => {
          console.log('WebSocket connection closed:', event.code, event.reason);
          
          // Attempt to reconnect if not a normal closure and under max attempts
          if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            console.log(`Attempting to reconnect WebSocket (${reconnectAttempts}/${maxReconnectAttempts})...`);
            setTimeout(connectWebSocket, 2000 * reconnectAttempts); // Exponential backoff
          }
        };
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
      }
    };

    connectWebSocket();

    return () => {
      if (socket) {
        socket.close(1000, 'Component unmounting');
      }
    };
  }, [user, showSuccess]);

  const getDifficultyColor = (difficulty) => {
    const colors = {
      titillating: 'from-pink-400 to-pink-600',
      arousing: 'from-purple-500 to-purple-700',
      explicit: 'from-red-500 to-red-700',
      edgy: 'from-yellow-400 to-yellow-600',
      hardcore: 'from-gray-800 to-black'
    };
    return colors[difficulty] || 'from-gray-500 to-gray-700';
  };

  const getDifficultyIcon = (difficulty) => {
    const icons = {
      titillating: <SparklesIcon className="w-5 h-5" />,
      arousing: <FireIcon className="w-5 h-5" />,
      explicit: <EyeDropperIcon className="w-5 h-5" />,
      edgy: <ExclamationTriangleIcon className="w-5 h-5" />,
      hardcore: <RocketLaunchIcon className="w-5 h-5" />
    };
    return icons[difficulty] || <SparklesIcon className="w-5 h-5" />;
  };

  const getRoleColor = (role) => {
    const colors = {
      dominant: 'from-primary to-primary-dark',
      submissive: 'from-info to-info-dark',
      switch: 'from-success to-success-dark',
      guest: 'from-neutral-600 to-neutral-700'
    };
    return colors[role] || 'from-neutral-600 to-neutral-700';
  };

  const getRoleIcon = (role) => {
    const icons = {
      dominant: <FireIcon className="w-5 h-5" />,
      submissive: <HeartIcon className="w-5 h-5" />,
      switch: <SparklesIcon className="w-5 h-5" />,
      guest: <UserIcon className="w-5 h-5" />
    };
    return icons[role] || <UserIcon className="w-5 h-5" />;
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      
      showSuccess('Notification marked as read');
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      showError('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read', { all: true });
      
      // Update local state
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      
      showSuccess('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      showError('Failed to mark all notifications as read');
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      submission: <PlusIcon className="w-5 h-5 text-info" />,
      fulfillment: <CheckCircleIcon className="w-5 h-5 text-success" />,
      grading: <StarIcon className="w-5 h-5 text-warning" />,
      dare_created: <PlusIcon className="w-5 h-5 text-primary" />,
      dare_completed: <CheckCircleIcon className="w-5 h-5 text-success" />,
      dare_assigned: <UserIcon className="w-5 h-5 text-info" />,
      dare_accepted: <CheckCircleIcon className="w-5 h-5 text-success" />,
      dare_rejected: <XMarkIcon className="w-5 h-5 text-danger" />,
      dare_claimed: <SparklesIcon className="w-5 h-5 text-primary" />,
      dare_performed: <PlayIcon className="w-5 h-5 text-warning" />,
      grade_given: <StarIcon className="w-5 h-5 text-warning" />,
      grade_received: <StarIcon className="w-5 h-5 text-warning" />,
      switch_game_joined: <CheckCircleIcon className="w-5 h-5 text-primary" />,
      switch_game_created: <PlusIcon className="w-5 h-5 text-primary" />,
      switch_game_completed: <CheckCircleIcon className="w-5 h-5 text-success" />,
      switch_game_started: <PlayIcon className="w-5 h-5 text-info" />,
      proof_submitted: <CheckCircleIcon className="w-5 h-5 text-warning" />,
      proof_approved: <CheckCircleIcon className="w-5 h-5 text-success" />,
      proof_rejected: <XMarkIcon className="w-5 h-5 text-danger" />,
      offer_submitted: <PlusIcon className="w-5 h-5 text-info" />,
      offer_accepted: <CheckCircleIcon className="w-5 h-5 text-success" />,
      offer_rejected: <XMarkIcon className="w-5 h-5 text-danger" />,
      profile_updated: <UserIcon className="w-5 h-5 text-info" />,
      avatar_uploaded: <UserIcon className="w-5 h-5 text-info" />,
      login: <CheckCircleIcon className="w-5 h-5 text-success" />,
      logout: <UserIcon className="w-5 h-5 text-neutral-400" />
    };
    return icons[type] || <BellIcon className="w-5 h-5 text-neutral-400" />;
  };

  const getNotificationMessage = (notification) => {
    // Use the notification message if available, otherwise generate one
    if (notification.message) {
      return notification.message;
    }

    // Generate message based on type and sender
    const senderName = notification.sender?.fullName || notification.sender?.username || 'Someone';
    
    switch (notification.type) {
      case 'submission':
        return `${senderName} submitted to your demand`;
      case 'fulfillment':
        return `${senderName} fulfilled your demand`;
      case 'grading':
        return `${senderName} graded your task`;
      case 'dare_created':
        return `${senderName} created a new dare`;
      case 'dare_completed':
        return `${senderName} completed a dare`;
      case 'dare_assigned':
        return `A dare has been assigned to you`;
      case 'dare_accepted':
        return `${senderName} accepted your dare`;
      case 'dare_rejected':
        return `${senderName} rejected your dare`;
      case 'dare_claimed':
        return `${senderName} claimed your dare`;
      case 'dare_performed':
        return `${senderName} performed a dare`;
      case 'grade_given':
        return `${senderName} gave you a grade`;
      case 'grade_received':
        return `You received a grade from ${senderName}`;
      case 'switch_game_joined':
        return `${senderName} joined your switch game`;
      case 'switch_game_created':
        return `${senderName} created a new switch game`;
      case 'switch_game_completed':
        return `Switch game completed`;
      case 'switch_game_started':
        return `Switch game started`;
      case 'proof_submitted':
        return `${senderName} submitted proof`;
      case 'proof_approved':
        return `Your proof was approved`;
      case 'proof_rejected':
        return `Your proof was rejected`;
      case 'offer_submitted':
        return `${senderName} submitted an offer`;
      case 'offer_accepted':
        return `Your offer was accepted`;
      case 'offer_rejected':
        return `Your offer was rejected`;
      case 'profile_updated':
        return `Profile updated`;
      case 'avatar_uploaded':
        return `Avatar uploaded`;
      case 'login':
        return `Login successful`;
      case 'logout':
        return `Logout successful`;
      default:
        return notification.type || 'New notification';
    }
  };

  const formatNotificationTime = (createdAt) => {
    const now = new Date();
    const notificationTime = new Date(createdAt);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return notificationTime.toLocaleDateString();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  // Don't render navigation for guest users on auth pages
  if (!user && ['/login', '/register', '/forgot-password', '/reset-password', '/'].includes(window.location.pathname)) {
    return null;
  }

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block bg-neutral-800/80 backdrop-blur-md border-b border-neutral-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-lg flex items-center justify-center">
                  <FireIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Deviant Dare</span>
              </div>

              {/* Main Navigation */}
              <div className="flex items-center space-x-1">
                <button onClick={() => handleNavigation('/dashboard')} className="flex items-center space-x-2 px-4 py-2 text-white hover:text-primary transition-colors duration-200 rounded-lg hover:bg-neutral-700/50">
                  <HomeIcon className="w-5 h-5" />
                  <span>Dashboard</span>
                </button>

                <button onClick={() => handleNavigation('/dom-demand/create')} className="flex items-center space-x-2 px-4 py-2 text-white hover:text-primary transition-colors duration-200 rounded-lg hover:bg-neutral-700/50">
                  <PlusIcon className="w-5 h-5" />
                  <span>Create</span>
                </button>
                <button onClick={() => handleNavigation('/leaderboard')} className="flex items-center space-x-2 px-4 py-2 text-white hover:text-primary transition-colors duration-200 rounded-lg hover:bg-neutral-700/50">
                  <ChartBarIcon className="w-5 h-5" />
                  <span>Leaderboard</span>
                </button>
                
                {/* Additional Navigation Links */}
                {user && (
                  <>
                    <div className="w-px h-6 bg-neutral-700 mx-2" />
                    <button onClick={() => handleNavigation('/dare/select')} className="flex items-center space-x-2 px-4 py-2 text-white hover:text-primary transition-colors duration-200 rounded-lg hover:bg-neutral-700/50">
                      <PlayIcon className="w-5 h-5" />
                      <span>Perform Dare</span>
                    </button>
                    <button onClick={() => handleNavigation('/switches')} className="flex items-center space-x-2 px-4 py-2 text-white hover:text-primary transition-colors duration-200 rounded-lg hover:bg-neutral-700/50">
                      <SparklesIcon className="w-5 h-5" />
                      <span>Switch Games</span>
                    </button>
                    <button onClick={() => handleNavigation('/user-activity')} className="flex items-center space-x-2 px-4 py-2 text-white hover:text-primary transition-colors duration-200 rounded-lg hover:bg-neutral-700/50">
                      <ChartBarIcon className="w-5 h-5" />
                      <span>Activity</span>
                    </button>
                    <button onClick={() => handleNavigation('/performer-dashboard')} className="flex items-center space-x-2 px-4 py-2 text-white hover:text-primary transition-colors duration-200 rounded-lg hover:bg-neutral-700/50">
                      <UserIcon className="w-5 h-5" />
                      <span>Performer Dashboard</span>
                    </button>
                    {user.roles?.includes('admin') && (
                      <button onClick={() => handleNavigation('/admin')} className="flex items-center space-x-2 px-4 py-2 text-white hover:text-primary transition-colors duration-200 rounded-lg hover:bg-neutral-700/50">
                        <CogIcon className="w-5 h-5" />
                        <span>Admin</span>
                      </button>
                    )}
                  </>
                )}
                
                <div className="w-px h-6 bg-neutral-700 mx-2" />
              </div>
            </div>

            {/* Right Side - User Menu */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              {user && (
                <div className="relative">
                  <button
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative p-2 text-white hover:text-primary transition-colors duration-200 rounded-lg hover:bg-neutral-700/50"
                  >
                    <BellIcon className="w-6 h-6" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-neutral-800 rounded-xl border border-neutral-700/50 shadow-xl z-50">
                      <div className="p-4 border-b border-neutral-700/50">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-white">Notifications</h3>
                          <button
                            onClick={markAllAsRead}
                            className="text-sm text-primary hover:text-primary-dark transition-colors duration-200"
                          >
                            Mark all as read
                          </button>
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                          <div className="p-4 text-center text-neutral-400">Loading notifications...</div>
                        ) : error ? (
                          <div className="p-4 text-center text-red-400">{error}</div>
                        ) : notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div
                              key={notification._id}
                              className={`p-4 border-b border-neutral-700/50 hover:bg-neutral-700/30 transition-colors duration-200 ${
                                !notification.read ? 'bg-primary/5' : ''
                              }`}
                              onClick={() => markNotificationAsRead(notification._id)}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-neutral-600 rounded-full flex items-center justify-center flex-shrink-0">
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm">
                                    <span className="font-medium text-primary">{notification.sender?.fullName || notification.sender?.username}</span>{' '}
                                    {getNotificationMessage(notification)}
                                  </p>
                                  <p className="text-neutral-400 text-sm mt-1">{notification.task}</p>
                                  <p className="text-neutral-500 text-xs mt-2">{formatNotificationTime(notification.createdAt)}</p>
                                </div>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-neutral-400">
                            No notifications
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center space-x-3 p-2 text-white hover:text-primary transition-colors duration-200 rounded-lg hover:bg-neutral-700/50"
                >
                  <div className="w-8 h-8 bg-neutral-600 rounded-full flex items-center justify-center overflow-hidden">
                    {currentUser.avatar ? (
                      <img 
                        src={getAvatarUrl(currentUser.avatar)} 
                        alt={currentUser.fullName} 
                        className="w-full h-full rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-full h-full rounded-full flex items-center justify-center text-xs font-semibold text-white ${getUserColor(currentUser)}`}
                      style={{ display: currentUser.avatar ? 'none' : 'flex' }}
                    >
                      {getUserInitials(currentUser)}
                    </div>
                  </div>
                  <span className="hidden xl:block">{currentUser.fullName}</span>
                  <span className={`hidden xl:inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getRoleColor(currentUser.role)} text-white`}>
                    {getRoleIcon(currentUser.role)}
                    <span className="capitalize">{currentUser.role}</span>
                  </span>
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-neutral-800 rounded-xl border border-neutral-700/50 shadow-xl z-50">
                    <div className="p-4 border-b border-neutral-700/50">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-neutral-600 rounded-full flex items-center justify-center overflow-hidden">
                          {currentUser.avatar ? (
                            <img 
                              src={getAvatarUrl(currentUser.avatar)} 
                              alt={currentUser.fullName} 
                              className="w-full h-full rounded-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div 
                            className={`w-full h-full rounded-full flex items-center justify-center text-sm font-semibold text-white ${getUserColor(currentUser)}`}
                            style={{ display: currentUser.avatar ? 'none' : 'flex' }}
                          >
                            {getUserInitials(currentUser)}
                          </div>
                        </div>
                        <div>
                          <p className="text-white font-medium">{currentUser.fullName}</p>
                          <p className="text-neutral-400 text-sm">@{currentUser.username}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => handleNavigation('/profile')}
                        className="flex items-center space-x-3 px-3 py-2 text-white hover:bg-neutral-700/50 rounded-lg transition-colors duration-200 w-full"
                      >
                        <UserIcon className="w-5 h-5" />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={() => handleNavigation('/settings')}
                        className="flex items-center space-x-3 px-3 py-2 text-white hover:bg-neutral-700/50 rounded-lg transition-colors duration-200 w-full"
                      >
                        <CogIcon className="w-5 h-5" />
                        <span>Settings</span>
                      </button>
                      <hr className="border-neutral-700/50 my-2" />
                      <button 
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200 w-full"
                      >
                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-neutral-800/80 backdrop-blur-md border-b border-neutral-700/50 sticky top-0 z-50">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-dark rounded-lg flex items-center justify-center">
                <FireIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Deviant Dare</span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white hover:text-primary transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-neutral-800 border-t border-neutral-700/50">
            <div className="px-4 py-2 space-y-1">
              <button
                onClick={() => handleNavigation('/dashboard')}
                className="flex items-center space-x-3 px-3 py-2 text-white hover:bg-neutral-700/50 rounded-lg transition-colors duration-200 w-full"
              >
                <HomeIcon className="w-5 h-5" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => handleNavigation('/dom-demand/create')}
                className="flex items-center space-x-3 px-3 py-2 text-white hover:bg-neutral-700/50 rounded-lg transition-colors duration-200 w-full"
              >
                <PlusIcon className="w-5 h-5" />
                <span>Create</span>
              </button>
              <button
                onClick={() => handleNavigation('/leaderboard')}
                className="flex items-center space-x-3 px-3 py-2 text-white hover:bg-neutral-700/50 rounded-lg transition-colors duration-200 w-full"
              >
                <ChartBarIcon className="w-5 h-5" />
                <span>Leaderboard</span>
              </button>
              
              {/* Additional Navigation Links for Mobile */}
              {user && (
                <>
                  <button
                    onClick={() => handleNavigation('/dare/select')}
                    className="flex items-center space-x-3 px-3 py-2 text-white hover:bg-neutral-700/50 rounded-lg transition-colors duration-200 w-full"
                  >
                    <PlayIcon className="w-5 h-5" />
                    <span>Perform Dare</span>
                  </button>
                  <button
                    onClick={() => handleNavigation('/switches')}
                    className="flex items-center space-x-3 px-3 py-2 text-white hover:bg-neutral-700/50 rounded-lg transition-colors duration-200 w-full"
                  >
                    <SparklesIcon className="w-5 h-5" />
                    <span>Switch Games</span>
                  </button>
                  <button
                    onClick={() => handleNavigation('/user-activity')}
                    className="flex items-center space-x-3 px-3 py-2 text-white hover:bg-neutral-700/50 rounded-lg transition-colors duration-200 w-full"
                  >
                    <ChartBarIcon className="w-5 h-5" />
                    <span>Activity</span>
                  </button>
                  <button
                    onClick={() => handleNavigation('/performer-dashboard')}
                    className="flex items-center space-x-3 px-3 py-2 text-white hover:bg-neutral-700/50 rounded-lg transition-colors duration-200 w-full"
                  >
                    <UserIcon className="w-5 h-5" />
                    <span>Performer Dashboard</span>
                  </button>
                  {user.roles?.includes('admin') && (
                    <button
                      onClick={() => handleNavigation('/admin')}
                      className="flex items-center space-x-3 px-3 py-2 text-white hover:bg-neutral-700/50 rounded-lg transition-colors duration-200 w-full"
                    >
                      <CogIcon className="w-5 h-5" />
                      <span>Admin</span>
                    </button>
                  )}
                </>
              )}
              
              {user && (
                <>
                  <button
                    onClick={() => handleNavigation('/profile')}
                    className="flex items-center space-x-3 px-3 py-2 text-white hover:bg-neutral-700/50 rounded-lg transition-colors duration-200 w-full"
                  >
                    <UserIcon className="w-5 h-5" />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => handleNavigation('/settings')}
                    className="flex items-center space-x-3 px-3 py-2 text-white hover:bg-neutral-700/50 rounded-lg transition-colors duration-200 w-full"
                  >
                    <CogIcon className="w-5 h-5" />
                    <span>Settings</span>
                  </button>
                  <hr className="border-neutral-700/50 my-2" />
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200 w-full"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Click outside handlers */}
      {isProfileDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileDropdownOpen(false)}
        />
      )}
      {isNotificationsOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsNotificationsOpen(false)}
        />
      )}
    </>
  );
};

export default ModernNavigation; 