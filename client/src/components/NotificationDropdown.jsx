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

// Legacy-style notification message generator
function getLegacyNotificationMessage(n) {
  // Example mapping based on type and params
  if (n.type === 'fulfill') {
    return `${n.actor?.username || 'Someone'} fulfilled your demand`;
  }
  if (n.type === 'grade') {
    return `${n.actor?.username || 'Someone'} graded your task: ${n.grade}`;
  }
  if (n.type === 'reject') {
    const reasonMap = {
      chicken: "chickened out",
      impossible: "think it's not possible or safe for anyone to do",
      incomprehensible: "couldn't understand what was being demanded",
      abuse: "have reported the demand as abuse"
    };
    const reason = reasonMap[n.reason] || 'rejected it';
    return `${n.actor?.username || 'Someone'} rejected your demand because they ${reason}.`;
  }
  // Fallback
  return n.message || n.type || 'Notification';
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
        <button className="btn btn-link btn-xs" onClick={handleRefresh} disabled={refreshing} style={{ width: '100%', textAlign: 'left' }}>
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </li>
    );
    if (unseenCount > 0) {
      items.push(
        <li key="mark-all">
          <button
            className="btn btn-link btn-xs"
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
            style={{ width: '100%', textAlign: 'left' }}
          >
            {markingAll ? 'Marking all...' : 'Mark all as read'}
          </button>
        </li>
      );
      items.push(<li key="divider" className="divider" />);
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
          className={`${n.read ? 'opacity-60' : ''} ${idx !== notifications.length - 1 ? 'border-b border-[#282828]' : ''} mb-2`}
        >
          <button
            onClick={e => { e.preventDefault(); handleMarkAsRead(n._id); }}
            className="w-full text-left focus:outline-none"
          >
            <span className="block">
              <span className="description font-medium">{getLegacyNotificationMessage(n)}</span>
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
        className="cursor-pointer relative focus:outline-none transition-colors"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        tabIndex={0}
      >
        <i className={`fa fa-bell text-xl ${unseenCount > 0 ? 'text-primary' : 'text-neutral-100'}`} />
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