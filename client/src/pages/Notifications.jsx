import React, { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { Banner } from '../components/Modal';
import Avatar from '../components/Avatar';

export default function Notifications() {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

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

  if (!user) {
    return <div className="text-center mt-12 text-[#888]">Please log in to view notifications.</div>;
  }

  return (
    <div className="max-w-lg mx-auto mt-12 p-8 bg-[#222] border border-[#282828] rounded shadow">
      <Banner type={generalError ? 'error' : 'info'} message={generalError} onClose={() => setGeneralError('')} />
      <div className="bg-[#3c3c3c] text-[#888] border-b border-[#282828] px-[15px] py-[10px] -mx-[15px] mt-[-15px] mb-4 rounded-t-none">
        <h1 className="text-2xl font-bold">Notifications</h1>
      </div>
      {loading ? (
        <div className="text-center text-neutral-400">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="text-center text-neutral-400">No notifications.</div>
      ) : (
        <ul className="divide-y divide-neutral-900">
          {notifications.map((n) => (
            <li
              key={n._id}
              className={`py-4 flex items-start gap-3 ${n.read ? 'bg-neutral-800' : 'bg-info bg-opacity-10'}`}
            >
              {n.sender && <Avatar user={n.sender} size={32} />}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-primary">{n.description}</div>
                <div className="text-neutral-400 text-sm">{n.body}</div>
                <div className="text-xs text-neutral-400 mt-1">{new Date(n.createdAt).toLocaleString()}</div>
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
          ))}
        </ul>
      )}
    </div>
  );
} 