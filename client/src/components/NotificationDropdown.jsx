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
  const dropdownRef = useRef(null);

  // Calculate unseenCount
  const unseenCount = notifications.filter(n => !n.read).length;

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
        className="relative p-2 text-white hover:text-primary transition-colors duration-200 rounded-lg hover:bg-neutral-700/50"
        aria-label={`Notifications (${unseenCount} unread)`}
      >
        <BellIcon className="w-6 h-6" />
        {unseenCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
            {unseenCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown - Matching v2 Design */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-neutral-800 rounded-xl border border-neutral-700/50 shadow-xl z-50">
          <div className="p-4 border-b border-neutral-700/50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
              {unseenCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markingAll}
                  className="text-sm text-primary hover:text-primary-dark transition-colors duration-200 disabled:opacity-50"
                >
                  {markingAll ? 'Marking...' : 'Mark all as read'}
                </button>
              )}
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-neutral-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                Loading notifications...
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <div className="text-red-400 mb-2">{error}</div>
                <button
                  onClick={handleRefresh}
                  className="text-primary hover:text-primary-dark transition-colors duration-200"
                >
                  Try again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-neutral-400">
                No notifications
              </div>
            ) : (
              <>
                {markError && (
                  <div className="p-3 bg-red-500/10 border-l-4 border-red-500 text-red-400 text-sm">
                    {markError}
                  </div>
                )}
                {markAllError && (
                  <div className="p-3 bg-red-500/10 border-l-4 border-red-500 text-red-400 text-sm">
                    {markAllError}
                  </div>
                )}
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`p-4 border-b border-neutral-700/50 hover:bg-neutral-700/30 transition-colors duration-200 cursor-pointer ${
                      !notification.read ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => handleMarkAsRead(notification._id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-neutral-600 rounded-full flex items-center justify-center flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm">
                          {getNotificationMessage(notification)}
                        </p>
                        <p className="text-neutral-500 text-xs mt-2">{timeAgo(notification.createdAt)}</p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 