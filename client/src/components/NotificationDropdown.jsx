import React, { useState, useEffect, useRef, useCallback } from 'react';
import Dropdown from './Dropdown';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { io } from 'socket.io-client';
import { formatRelativeTime } from '../utils/dateUtils';
import { BellIcon } from '@heroicons/react/24/outline';
import { ERROR_MESSAGES, API_RESPONSE_TYPES } from '../constants.jsx';
import { validateApiResponse } from '../utils/apiValidation';
import { handleApiError } from '../utils/errorHandler';

function timeAgo(date) {
  return formatRelativeTime(date);
}

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
    items = [<li key="loading"><span className="text-neutral-400">Loading...</span></li>];
  } else if (error) {
    items = [<li key="error"><span className="text-red-400">{error}</span></li>];
  } else if (notifications.length === 0) {
    items = [<li key="none" className="mb-2 text-neutral-400">No notifications</li>];
  } else {
    items = [];
    items.push(
      <li key="refresh">
        <button
          className="w-full text-left py-2 px-0 text-white hover:bg-neutral-700/50 focus:bg-neutral-700/50 transition-colors cursor-pointer rounded-lg px-2"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </li>
    );
    if (unseenCount > 0) {
      items.push(
        <li key="mark-all">
          <button
            className="w-full text-left py-2 px-0 text-white hover:bg-neutral-700/50 focus:bg-neutral-700/50 transition-colors cursor-pointer rounded-lg px-2"
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
          >
            {markingAll ? 'Marking all...' : 'Mark all as read'}
          </button>
        </li>
      );
      items.push(<li key="divider" className="border-b border-neutral-700/50 my-2" />);
    }
    if (markError) {
      items.push(<li key="mark-error"><span className="text-red-400">{markError}</span></li>);
    }
    if (markAllError) {
      items.push(<li key="mark-all-error"><span className="text-red-400">{markAllError}</span></li>);
    }
    items = items.concat(
      notifications.map((n, idx) => (
        <li
          key={n._id}
          className={`${n.read ? 'opacity-60' : ''} ${idx !== notifications.length - 1 ? 'border-b border-neutral-700/50' : ''}`}
          role="menuitem"
        >
          <button
            onClick={e => { e.preventDefault(); handleMarkAsRead(n._id); }}
            className="w-full text-left py-2 px-2 focus:outline-none hover:bg-neutral-700/50 focus:bg-neutral-700/50 transition-colors cursor-pointer rounded-lg"
            aria-haspopup="true"
            aria-expanded={open}
            role="button"
          >
            <span className="block">
              <span className="description font-medium text-white">{getNotificationMessage(n)}</span>
              <span className="age ml-2 text-xs text-neutral-400">{timeAgo(n.createdAt)}</span>
            </span>
          </button>
        </li>
      ))
    );
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <span className="relative inline-block">
        <span
          ref={dropdownRef}
          className="cursor-pointer select-none"
          onClick={() => setOpen(v => !v)}
          tabIndex={0}
          aria-haspopup="true"
          aria-expanded={open}
          role="button"
        >
          <BellIcon className="h-6 w-6 text-white hover:text-primary transition-colors" />
          {unseenCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center" aria-label={`${unseenCount} unread notifications`}>{unseenCount}</span>
          )}
        </span>
      </span>
      {open && (
        <ul className="absolute right-0 mt-2 min-w-[300px] max-h-[400px] overflow-y-auto bg-neutral-800 border border-neutral-700/50 rounded-xl shadow-xl z-50 p-4 text-white" role="menu">
          {items}
        </ul>
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