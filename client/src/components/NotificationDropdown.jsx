import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { io } from 'socket.io-client';
import { formatRelativeTime } from '../utils/dateUtils';
import { 
  BellIcon, 
  CheckCircleIcon, 
  StarIcon, 
  PlusIcon,
  FireIcon,
  UserIcon,
  ShieldCheckIcon,
  ChatBubbleLeftIcon,
  ExclamationTriangleIcon,
  BoltIcon,
  ClockIcon,
  EyeIcon,
  TrashIcon,
  CogIcon,
  ArrowPathIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { ERROR_MESSAGES, API_RESPONSE_TYPES } from '../constants.jsx';
import { validateApiResponse } from '../utils/apiValidation';
import { handleApiError } from '../utils/errorHandler';

function timeAgo(date) {
  return formatRelativeTime(date);
}

// Enhanced notification message generator with better formatting
function getNotificationMessage(n) {
  const actor = n.sender?.fullName || n.sender?.username || n.actor?.fullName || n.actor?.username || n.actorName || 'Someone';
  const dare = n.dareTitle || n.dare?.title || n.targetTitle || '';
  
  switch (n.type) {
    case 'dare_created':
      return `${actor} created a new dare${dare ? ': ' + dare : ''}`;
    case 'dare_graded':
      return `${actor} graded your dare${dare ? ': ' + dare : ''}`;
    case 'proof_submitted':
      return n.message || 'Proof has been submitted for your dare';
    case 'dare_approved':
      return `Your dare${dare ? ' ' + dare : ''} has been approved!`;
    case 'dare_rejected':
      return `Your dare${dare ? ' ' + dare : ''} was rejected`;
    case 'role_change':
      return n.message || `${actor} changed your role`;
    case 'user_blocked':
      return `You have been blocked by ${actor}`;
    case 'user_banned':
      return 'Your account has been banned by an admin';
    case 'comment_reply':
      return n.message || `${actor} replied to your comment`;
    case 'comment_moderated':
      return `Your comment${dare ? ' on ' + dare : ''} was moderated/hidden`;
    case 'dare_fulfilled':
      return `${actor} fulfilled your demand${dare ? ': ' + dare : ''}`;
    case 'dare_claimed':
      return `${actor} claimed your dare${dare ? ': ' + dare : ''}`;
    case 'dare_completed':
      return `${actor} completed your dare${dare ? ': ' + dare : ''}`;
    case 'dare_withdrawn':
      return `${actor} withdrew from your dare${dare ? ': ' + dare : ''}`;
    case 'dare_switch':
      return `${actor} invited you to a switch game${dare ? ': ' + dare : ''}`;
    case 'admin_message':
      return n.message || 'Admin message';
    case 'dare_assigned':
      return n.message || 'You have been assigned a new dare';
    case 'dare_deleted':
      return n.message || 'A dare you were involved in has been deleted';
    case 'dare_chickened_out':
      return n.message || 'A dare was chickened out of';
    default:
      if (process.env.NODE_ENV === 'development') {
        console.warn('Unknown notification type:', n.type, n);
      }
      return n.message || n.type || 'Notification';
  }
}

// Enhanced notification icon mapping with better visual hierarchy
const getNotificationIcon = (type) => {
  const icons = {
    dare_created: <PlusIcon className="w-5 h-5 text-blue-400" />,
    dare_graded: <StarIcon className="w-5 h-5 text-yellow-400" />,
    proof_submitted: <EyeIcon className="w-5 h-5 text-green-400" />,
    dare_approved: <CheckCircleIcon className="w-5 h-5 text-green-400" />,
    dare_rejected: <XMarkIcon className="w-5 h-5 text-red-400" />,
    dare_fulfilled: <CheckCircleIcon className="w-5 h-5 text-green-400" />,
    dare_claimed: <BoltIcon className="w-5 h-5 text-purple-400" />,
    dare_completed: <CheckCircleIcon className="w-5 h-5 text-green-400" />,
    dare_withdrawn: <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />,
    dare_switch: <FireIcon className="w-5 h-5 text-orange-400" />,
    admin_message: <ShieldCheckIcon className="w-5 h-5 text-blue-400" />,
    dare_assigned: <UserIcon className="w-5 h-5 text-blue-400" />,
    dare_deleted: <TrashIcon className="w-5 h-5 text-red-400" />,
    dare_chickened_out: <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />,
    role_change: <UserIcon className="w-5 h-5 text-blue-400" />,
    user_blocked: <XMarkIcon className="w-5 h-5 text-red-400" />,
    user_banned: <ShieldCheckIcon className="w-5 h-5 text-red-400" />,
    comment_reply: <ChatBubbleLeftIcon className="w-5 h-5 text-blue-400" />,
    comment_moderated: <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
  };
  return icons[type] || <BellIcon className="w-5 h-5 text-neutral-400" />;
};

// Get notification priority for better sorting
const getNotificationPriority = (type) => {
  const priorities = {
    user_banned: 1,
    user_blocked: 2,
    dare_rejected: 3,
    dare_approved: 4,
    proof_submitted: 5,
    dare_graded: 6,
    dare_created: 7,
    dare_fulfilled: 8,
    dare_claimed: 9,
    dare_completed: 10,
    dare_withdrawn: 11,
    dare_switch: 12,
    admin_message: 13,
    dare_assigned: 14,
    dare_deleted: 15,
    dare_chickened_out: 16,
    role_change: 17,
    comment_reply: 18,
    comment_moderated: 19
  };
  return priorities[type] || 20;
};

export default function NotificationDropdown() {
  const { accessToken } = useAuth();
  const { showSuccess, showError } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [markError, setMarkError] = useState(null);
  const [markAllError, setMarkAllError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const dropdownRef = useRef(null);

  // Calculate unseenCount
  const unseenCount = notifications.filter(n => !n.read).length;

  // Sort notifications by priority and date
  const sortedNotifications = React.useMemo(() => {
    return [...notifications].sort((a, b) => {
      const priorityDiff = getNotificationPriority(a.type) - getNotificationPriority(b.type);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [notifications]);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setMarkAllError(null);
      
      const response = await api.get('/notifications');
      
      if (response.data) {
        const notificationsData = validateApiResponse(response.data, API_RESPONSE_TYPES.ACTIVITY_ARRAY);
        setNotifications(notificationsData);
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      const errorMessage = handleApiError(error, 'notifications');
      setError(errorMessage);
      setNotifications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchNotifications();
    
    // Real-time notifications
    let socket;
    if (accessToken) {
      socket = io('/', {
        auth: { token: accessToken },
        autoConnect: true,
        transports: ['websocket'],
      });
      socket.on('notification', (notif) => {
        setNotifications((prev) => [notif, ...prev]);
      });
    }
    
    return () => {
      mounted = false;
      if (socket) socket.disconnect();
    };
  }, [accessToken, fetchNotifications]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Mark all as read when dropdown is opened
  useEffect(() => {
    if (open && unseenCount > 0) {
      handleMarkAllAsRead();
    }
  }, [open, unseenCount]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.post('/notifications/read', { ids: [id] });
      setNotifications(notifications =>
        notifications.map(n => n._id === id ? { ...n, read: true } : n)
      );
      setMarkError(null);
      showSuccess('Notification marked as read');
    } catch (e) {
      const errorMessage = 'Failed to mark notification as read.';
      setMarkError(errorMessage);
      showError(errorMessage);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    setMarkAllError(null);
    try {
      await api.post('/notifications/read', { all: true });
      setNotifications(notifications => notifications.map(n => ({ ...n, read: true })));
      showSuccess('All notifications marked as read');
    } catch (e) {
      const errorMessage = 'Failed to mark all as read. Please try again.';
      setMarkAllError(errorMessage);
      showError(errorMessage);
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Notification Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 text-white hover:text-primary transition-all duration-200 rounded-lg hover:bg-neutral-700/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-neutral-800"
        aria-label={`Notifications (${unseenCount} unread)`}
      >
        <BellIcon className="w-6 h-6" />
        {unseenCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full flex items-center justify-center font-medium shadow-lg animate-pulse">
            {unseenCount > 99 ? '99+' : unseenCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {open && (
        <div className="absolute right-0 mt-3 w-96 bg-neutral-800/95 backdrop-blur-xl rounded-2xl border border-neutral-700/50 shadow-2xl z-50 transform transition-all duration-200 ease-out">
          {/* Header */}
          <div className="p-5 border-b border-neutral-700/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-dark rounded-lg flex items-center justify-center">
                  <BellIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Notifications</h3>
                  <p className="text-sm text-neutral-400">
                    {unseenCount > 0 ? `${unseenCount} unread` : 'All caught up!'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700/50 rounded-lg transition-colors duration-200"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700/50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              
              {unseenCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markingAll}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-primary hover:text-primary-dark hover:bg-primary/10 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>{markingAll ? 'Marking...' : 'Mark all read'}</span>
                </button>
              )}
              
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-700/50 rounded-lg transition-all duration-200 ml-auto"
              >
                <CogIcon className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                <p className="text-neutral-400 text-sm">Loading notifications...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <ExclamationTriangleIcon className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-red-400 mb-3">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200"
                >
                  Try again
                </button>
              </div>
            ) : sortedNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <BellIcon className="w-12 h-12 text-neutral-500 mx-auto mb-3" />
                <p className="text-neutral-400 text-sm">No notifications yet</p>
                <p className="text-neutral-500 text-xs">We'll notify you when something happens</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-700/50">
                {markError && (
                  <div className="p-4 bg-red-500/10 border-l-4 border-red-500">
                    <p className="text-red-400 text-sm">{markError}</p>
                  </div>
                )}
                {markAllError && (
                  <div className="p-4 bg-red-500/10 border-l-4 border-red-500">
                    <p className="text-red-400 text-sm">{markAllError}</p>
                  </div>
                )}
                
                {sortedNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 hover:bg-neutral-700/30 transition-all duration-200 cursor-pointer group ${
                      !notification.read ? 'bg-primary/5 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'
                    }`}
                    onClick={() => handleMarkAsRead(notification._id)}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className="w-10 h-10 bg-neutral-700/50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-neutral-600/50 transition-colors duration-200">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm leading-relaxed font-medium">
                          {getNotificationMessage(notification)}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <ClockIcon className="w-3 h-3 text-neutral-500" />
                          <p className="text-neutral-500 text-xs">{timeAgo(notification.createdAt)}</p>
                        </div>
                      </div>
                      
                      {/* Status Indicator */}
                      {!notification.read && (
                        <div className="w-3 h-3 bg-gradient-to-r from-primary to-primary-dark rounded-full flex-shrink-0 animate-pulse"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-800/95 backdrop-blur-xl border border-neutral-700/50 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Notification Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-700/50 rounded-lg transition-colors duration-200"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-neutral-700/30 rounded-lg">
                <p className="text-neutral-300 text-sm">
                  Notification preferences and settings will be available soon. 
                  You can currently manage notifications through the main settings page.
                </p>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors duration-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowSettings(false);
                    // Navigate to settings page
                    window.location.href = '/settings';
                  }}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200"
                >
                  Go to Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 