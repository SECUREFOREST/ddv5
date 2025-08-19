import React, { useState, useEffect } from 'react';
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
  StarIcon
} from '@heroicons/react/24/solid';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DIFFICULTY_OPTIONS } from '../../constants';

const ModernNavigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'submission',
      user: 'Alex',
      action: 'submitted to your demand',
      task: 'Sensual massage challenge',
      time: '2 hours ago',
      read: false
    },
    {
      id: 2,
      type: 'fulfillment',
      user: 'Jordan',
      action: 'fulfilled your demand',
      task: 'Photo challenge',
      time: '1 day ago',
      read: false
    },
    {
      id: 3,
      type: 'grading',
      user: 'Sam',
      action: 'graded your task',
      task: 'Dance performance',
      time: '3 days ago',
      read: true
    }
  ]);

  // Use real user data from AuthContext
  const currentUser = user || {
    username: 'Guest',
    fullName: 'Guest User',
    avatar: null,
    role: 'guest',
    unreadNotifications: 0
  };

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

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const getNotificationIcon = (type) => {
    const icons = {
      submission: <PlusIcon className="w-5 h-5 text-info" />,
      fulfillment: <CheckCircleIcon className="w-5 h-5 text-success" />,
      grading: <StarIcon className="w-5 h-5 text-warning" />
    };
    return icons[type] || <BellIcon className="w-5 h-5 text-neutral-400" />;
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
                <span className="text-xl font-bold text-white">OSA</span>
              </div>

              {/* Main Navigation */}
              <div className="flex items-center space-x-1">
                <button onClick={() => handleNavigation('/dashboard')} className="flex items-center space-x-2 px-4 py-2 text-white hover:text-primary transition-colors duration-200 rounded-lg hover:bg-neutral-700/50">
                  <HomeIcon className="w-5 h-5" />
                  <span>Dashboard</span>
                </button>
                <button onClick={() => handleNavigation('/public-dares')} className="flex items-center space-x-2 px-4 py-2 text-white hover:text-primary transition-colors duration-200 rounded-lg hover:bg-neutral-700/50">
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  <span>Browse</span>
                </button>
                <button onClick={() => handleNavigation('/dom-demand/create')} className="flex items-center space-x-2 px-4 py-2 text-white hover:text-primary transition-colors duration-200 rounded-lg hover:bg-neutral-700/50">
                  <PlusIcon className="w-5 h-5" />
                  <span>Create</span>
                </button>
                <button onClick={() => handleNavigation('/leaderboard')} className="flex items-center space-x-2 px-4 py-2 text-white hover:text-primary transition-colors duration-200 rounded-lg hover:bg-neutral-700/50">
                  <ChartBarIcon className="w-5 h-5" />
                  <span>Leaderboard</span>
                </button>
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
                    {currentUser.unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                        {currentUser.unreadNotifications}
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
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-neutral-700/50 hover:bg-neutral-700/30 transition-colors duration-200 ${
                                !notification.read ? 'bg-primary/5' : ''
                              }`}
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="w-8 h-8 bg-neutral-600 rounded-full flex items-center justify-center flex-shrink-0">
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-white text-sm">
                                    <span className="font-medium text-primary">{notification.user}</span>{' '}
                                    {notification.action}
                                  </p>
                                  <p className="text-neutral-400 text-sm mt-1">{notification.task}</p>
                                  <p className="text-neutral-500 text-xs mt-2">{notification.time}</p>
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
                  <div className="w-8 h-8 bg-neutral-600 rounded-full flex items-center justify-center">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.fullName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <UserIcon className="w-5 h-5" />
                    )}
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
                        <div className="w-12 h-12 bg-neutral-600 rounded-full flex items-center justify-center">
                          {currentUser.avatar ? (
                            <img src={currentUser.avatar} alt={currentUser.fullName} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <UserIcon className="w-6 h-6" />
                          )}
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
              <span className="text-lg font-bold text-white">OSA</span>
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
                onClick={() => handleNavigation('/public-dares')}
                className="flex items-center space-x-3 px-3 py-2 text-white hover:bg-neutral-700/50 rounded-lg transition-colors duration-200 w-full"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
                <span>Browse</span>
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