import React, { useState, useEffect, useRef, useCallback } from 'react';
import Dropdown from './Dropdown';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { io } from 'socket.io-client';
import { formatRelativeTime } from '../utils/dateUtils';
import { BellIcon, PlusIcon } from '@heroicons/react/24/outline';
import { ERROR_MESSAGES, API_RESPONSE_TYPES } from '../constants.jsx';
import { validateApiResponse } from '../utils/apiValidation';
import { handleApiError } from '../utils/errorHandler';

// Missing icon components (from v2)
const CheckCircleIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const StarIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

function timeAgo(date) {
  return formatRelativeTime(date);
}

// Get notification icon (from v2)
const getNotificationIcon = (type) => {
  const icons = {
    submission: <PlusIcon className="w-5 h-5 text-info" />,
    fulfillment: <CheckCircleIcon className="w-5 h-5 text-success" />,
    grading: <StarIcon className="w-5 h-5 text-warning" />
  };
  return icons[type] || <BellIcon className="w-5 h-5 text-neutral-400" />;
};

// Comprehensive notification message generator
function getNotificationMessage(n) {
  // Try to extract actor, target, dare, etc.
  const actor = n.sender?.fullName || n.sender?.username || n.actor?.fullName || n.actor?.username || n.actorName || 'Someone';
  const dare = n.dareTitle || n.dare?.title || n.targetTitle || '';
  switch (n.type) {
    case 'dare_created':
      return `${actor} created a new dare${dare ? ': ' + dare : ''}.`;
    case 'dare_graded':
      return `${actor} graded your dare${dare ? ': ' + dare : ''}.`;
    case 'proof_submitted':
      return n.message || 'Proof has been submitted for your dare.';
    case 'dare_approved':
      return `Your dare${dare ? ' ' + dare : ''} has been approved!`;
    case 'dare_rejected':
      return `Your dare${dare ? ' ' + dare : ''} was rejected.`;
    case 'role_change':
      return n.message || `${actor} changed your role.`;
    case 'user_blocked':
      return `You have been blocked by ${actor}.`;
    case 'user_banned':
      return 'Your account has been banned by an admin.';
    case 'comment_reply':
      return n.message || `${actor} replied to your comment.`;
    case 'comment_moderated':
      return `Your comment${dare ? ' on ' + dare : ''} was moderated/hidden.`;
    case 'dare_fulfilled':
      return `${actor} fulfilled your demand${dare ? ': ' + dare : ''}.`;
    case 'dare_claimed':
      return `${actor} claimed your dare${dare ? ': ' + dare : ''}.`;
    case 'dare_completed':
      return `${actor} completed your dare${dare ? ': ' + dare : ''}.`;
    case 'dare_withdrawn':
      return `${actor} withdrew from your dare${dare ? ': ' + dare : ''}.`;
    case 'dare_switch':
      return `${actor} invited you to a switch game${dare ? ': ' + dare : ''}.`;
    case 'admin_message':
      return n.message || 'Admin message.';
    case 'dare_assigned':
      return n.message || 'You have been assigned a new dare.';
    case 'dare_deleted':
      return n.message || 'A dare you were involved in has been deleted.';
            case 'dare_chickened_out':
          return n.message || 'A dare was chickened out of.';
    // Add more legacy types/verbs as needed
    default:
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.warn('Unknown notification type:', n.type, n);
      }
      return n.message || n.type || 'Notification';
  }
}

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
  // Add state for settings modal
  const [showSettings, setShowSettings] = useState(false);

  // Calculate unseenCount
  const unseenCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setMarkAllError(null);
      
      const response = await api.get('/notifications');
      
      if (response.data) {
        // Notifications API returns data directly, not wrapped in a notifications property
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
    // eslint-disable-next-line
  }, [open]);

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

  let items;
  if (loading) {
    items = [<div key="loading" className="p-4 text-center text-neutral-400">Loading...</div>];
  } else if (error) {
    items = [<div key="error" className="p-4 text-center text-red-400">{error}</div>];
  } else if (notifications.length === 0) {
    items = [<div key="none" className="p-4 text-center text-neutral-400">No notifications</div>];
  } else {
    items = notifications.map((n) => {
      // Extract user and action from notification message for v2 compatibility
      const message = getNotificationMessage(n);
      const user = n.sender?.fullName || n.sender?.username || 'Someone';
      const action = message.replace(user, '').trim();
      
      return (
        <div
          key={n._id}
          className={`p-4 border-b border-neutral-700/50 hover:bg-neutral-700/30 transition-colors duration-200 cursor-pointer ${
            !n.read ? 'bg-primary/5' : ''
          }`}
          onClick={() => handleMarkAsRead(n._id)}
        >
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-neutral-600 rounded-full flex items-center justify-center flex-shrink-0">
              {getNotificationIcon(n.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm">
                <span className="font-medium text-primary">{user}</span>{' '}
                {action}
              </p>
              <p className="text-neutral-400 text-sm mt-1">{n.dareTitle || n.task || 'Task'}</p>
              <p className="text-neutral-500 text-xs mt-2">{timeAgo(n.createdAt)}</p>
            </div>
            {!n.read && (
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
            )}
          </div>
        </div>
      );
    });
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 text-white hover:text-primary transition-colors duration-200 rounded-lg hover:bg-neutral-700/50"
        aria-haspopup="true"
        aria-expanded={open}
        role="button"
      >
        <BellIcon className="h-6 w-6" />
        {unseenCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center" aria-label={`${unseenCount} unread notifications`}>
            {unseenCount > 99 ? '99+' : unseenCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-neutral-800 rounded-xl border border-neutral-700/50 shadow-xl z-50">
          <div className="p-4 border-b border-neutral-700/50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Notifications</h3>
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-primary hover:text-primary-dark transition-colors duration-200"
              >
                Mark all as read
              </button>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items}
          </div>
        </div>
      )}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-neutral-800 border border-neutral-700/50 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-white">Notification Settings</h2>
            <div className="text-neutral-300 mb-4">(Settings coming soon...)</div>
            <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg shadow-lg transition-colors" onClick={() => setShowSettings(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
} 