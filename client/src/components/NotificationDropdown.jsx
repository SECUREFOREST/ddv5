import React, { useState, useEffect, useRef } from 'react';
import Dropdown from './Dropdown';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

function timeAgo(date) {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// Comprehensive notification message generator
function getNotificationMessage(n) {
  switch (n.type) {
    case 'dare_created':
      return 'Your dare has been created.';
    case 'dare_graded':
      return `Your dare has been graded.`;
    case 'proof_submitted':
      return 'Proof has been submitted for your dare.';
    case 'dare_approved':
      return 'Your dare has been approved!';
    case 'dare_rejected':
      return 'Your dare has been rejected.';
    case 'role_change':
      return n.message || 'Your role has changed.';
    case 'user_blocked':
      return 'You have been blocked by another user.';
    case 'user_banned':
      return 'Your account has been banned by an admin.';
    case 'comment_reply':
      return 'You have a new reply to your comment.';
    case 'comment_moderated':
      return 'Your comment has been moderated/hidden.';
    default:
      // Fallback to legacy handler or message
      return n.message || n.type || 'Notification';
  }
}

export default function NotificationDropdown() {
  const { accessToken } = useAuth();
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

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    setMarkAllError(null);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

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
  }, [accessToken]);

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
    } catch (e) {
      setMarkError('Failed to mark notification as read.');
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    setMarkAllError(null);
    try {
      await api.post('/notifications/read', { all: true });
      setNotifications(notifications => notifications.map(n => ({ ...n, read: true })));
    } catch (e) {
      setMarkAllError('Failed to mark all as read. Please try again.');
    } finally {
      setMarkingAll(false);
    }
  };

  let items;
  if (loading) {
    items = [<li key="loading"><span className="text-muted">Loading...</span></li>];
  } else if (error) {
    items = [<li key="error"><span className="label label-danger">{error}</span></li>];
  } else if (notifications.length === 0) {
    items = [<li key="none" className="mb-2 text-neutral-300">No notifications</li>];
  } else {
    items = [];
    items.push(
      <li key="refresh">
        <button
          className="w-full text-left py-2 px-0 text-neutral-100 hover:bg-neutral-800 focus:bg-neutral-800 transition-colors cursor-pointer"
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
            className="w-full text-left py-2 px-0 text-neutral-100 hover:bg-neutral-800 focus:bg-neutral-800 transition-colors cursor-pointer"
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
          >
            {markingAll ? 'Marking all...' : 'Mark all as read'}
          </button>
        </li>
      );
      items.push(<li key="divider" className="border-b border-[#282828] my-1" />);
    }
    if (markError) {
      items.push(<li key="mark-error"><span className="label label-danger">{markError}</span></li>);
    }
    if (markAllError) {
      items.push(<li key="mark-all-error"><span className="label label-danger">{markAllError}</span></li>);
    }
    items = items.concat(
      notifications.map((n, idx) => (
        <li
          key={n._id}
          className={`${n.read ? 'opacity-60' : ''} ${idx !== notifications.length - 1 ? 'border-b border-[#282828]' : ''}`}
        >
          <button
            onClick={e => { e.preventDefault(); handleMarkAsRead(n._id); }}
            className="w-full text-left py-2 px-0 focus:outline-none hover:bg-neutral-800 focus:bg-neutral-800 transition-colors cursor-pointer"
          >
            <span className="block">
              <span className="description font-medium">{getNotificationMessage(n)}</span>
              <span className="age ml-2 text-xs text-neutral-400">{timeAgo(n.createdAt)}</span>
            </span>
          </button>
        </li>
      ))
    );
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        className="cursor-pointer relative focus:outline-none transition-colors group"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        tabIndex={0}
      >
        <i className={`fas fa-bell text-xl transition-colors duration-150
          ${unseenCount > 0
            ? 'text-primary group-hover:text-primary-dark'
            : 'text-neutral-100 group-hover:text-neutral-400'}
        `} />
        {unseenCount > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-500 text-white rounded-full px-1.5 text-xs font-bold border border-[#060606]">{unseenCount}</span>
        )}
      </button>
      {open && (
        <ul className="absolute right-0 mt-2 min-w-[300px] max-h-[400px] overflow-y-auto bg-[#222] border border-[#282828] shadow-sm rounded-none z-50 p-[15px] text-neutral-100">
          {items}
        </ul>
      )}
    </div>
  );
} 