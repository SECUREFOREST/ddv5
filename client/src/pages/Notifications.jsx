import React, { useEffect, useState, useContext, useRef } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Banner } from '../components/Modal';
import Avatar from '../components/Avatar';
import { io } from 'socket.io-client';
import { BellIcon } from '@heroicons/react/24/solid';

export default function Notifications() {
  const { user, accessToken } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [toast, setToast] = useState('');
  const toastTimeout = useRef(null);

  const fetchNotifications = () => {
    setLoading(true);
    setGeneralError('');
    api.get('/notifications')
      .then(res => setNotifications(Array.isArray(res.data) ? res.data : []))
      .catch(() => { setNotifications([]); setGeneralError('Failed to load notifications.'); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    let socket;
    if (accessToken) {
      socket = io('/', {
        auth: { token: accessToken },
        autoConnect: true,
        transports: ['websocket'],
      });
      socket.on('notification', (notif) => {
        setNotifications((prev) => [notif, ...prev]);
        setToast('New notification received!');
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        toastTimeout.current = setTimeout(() => setToast(''), 3000);
      });
    }
    return () => {
      if (socket) socket.disconnect();
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    };
  }, [accessToken]);

  const handleMarkRead = async (id) => {
    setActionLoading(true);
    setGeneralError('');
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      setGeneralError(err.response?.data?.error || 'Failed to mark notification as read.');
    }
    setActionLoading(false);
  };

  // Replace legacy notification message generator with the new one
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
        return n.message || n.type || 'Notification';
    }
  }

  function getNotificationAction(n) {
    // Returns { label, to } or null
    switch (n.type) {
      case 'dare_created':
      case 'dare_graded':
      case 'dare_approved':
      case 'dare_rejected':
      case 'dare_completed':
      case 'dare_claimed':
      case 'dare_fulfilled':
      case 'dare_withdrawn':
      case 'dare_switch':
        if (n.dareId || n.dare?._id) {
          return { label: 'Go to Dare', to: `/dare/${n.dareId || n.dare._id}` };
        }
        break;
      case 'proof_submitted':
        if (n.dareId || n.dare?._id) {
          return { label: 'View Proof', to: `/dare/${n.dareId || n.dare._id}/perform` };
        }
        break;
      case 'comment_reply':
        if (n.dareId || n.dare?._id) {
          return { label: 'Reply', to: `/dare/${n.dareId || n.dare._id}` };
        }
        break;
      default:
        return null;
    }
    return null;
  }

  function batchNotifications(notifications) {
    // Group by type and message
    const batches = {};
    notifications.forEach(n => {
      const key = n.type + '|' + (n.description || n.message || '');
      if (!batches[key]) batches[key] = [];
      batches[key].push(n);
    });
    return Object.values(batches);
  }

  if (!user) {
    return <div className="text-center mt-12 text-[#888]">Please log in to view notifications.</div>;
  }

  return (
    <div className="max-w-md sm:max-w-xl lg:max-w-2xl w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-6 mb-8 overflow-hidden">
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-center h-16 mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight flex items-center gap-2">
          <BellIcon className="w-7 h-7 text-primary" aria-hidden="true" /> Notifications
        </h1>
      </div>
      {/* Visually distinct status badge below header */}
      <div className="flex justify-center mb-4">
        <span className="inline-flex items-center gap-2 bg-primary/90 border border-primary text-primary-contrast rounded-full px-5 py-2 font-bold shadow-lg text-lg animate-fade-in">
          <BellIcon className="w-6 h-6" /> Notifications
        </span>
      </div>
      <div className="border-t border-neutral-800 my-4" />
      {toast && (
        <div className="mb-4 bg-info text-info-contrast px-4 py-2 rounded font-semibold text-center animate-pulse">{toast}</div>
      )}
      <Banner type={generalError ? 'error' : 'info'} message={generalError} onClose={() => setGeneralError('')} />
      {loading ? (
        <div className="flex flex-col gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse h-20 bg-neutral-900/90 border border-neutral-800 rounded-xl mb-4" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center text-neutral-400">No notifications.</div>
      ) : (
        <ul className="divide-y divide-neutral-900 overflow-x-auto">
          {batchNotifications(notifications).map((batch, i) => {
            const n = batch[0];
            const count = batch.length;
            return (
              <li
                key={n._id + '-' + count}
                className={`py-4 flex items-start gap-3 ${n.read ? 'bg-neutral-800' : 'bg-info bg-opacity-10'}`}
              >
                {n.sender && <Avatar user={n.sender} size={32} />}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-primary">
                    {count > 1 ? `${count} ${getNotificationMessage(n).replace(/^Your /, '').replace(/^You have /, '')}` : getNotificationMessage(n)}
                  </div>
                  <div className="text-neutral-400 text-sm">{n.body}</div>
                  <div className="text-xs text-neutral-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
                  {/* Action button */}
                  {getNotificationAction(n) && (
                    <a
                      href={getNotificationAction(n).to}
                      className="inline-block mt-2 bg-primary text-primary-contrast rounded px-3 py-1 text-xs font-semibold hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {getNotificationAction(n).label}
                    </a>
                  )}
                </div>
                {!n.read && (
                  <button
                    className="ml-2 bg-primary text-primary-contrast rounded px-3 py-1 text-xs font-semibold hover:bg-primary-dark"
                    onClick={() => handleMarkRead(n._id)}
                  >
                    Mark as read
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
} 