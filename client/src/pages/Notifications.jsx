import React, { useEffect, useState, useContext } from 'react';
import api from '../api/axios';
import { AuthContext } from '../context/AuthContext';

export default function Notifications() {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchNotifications = () => {
    setLoading(true);
    api.get('/notifications')
      .then(res => setNotifications(Array.isArray(res.data) ? res.data : []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    setActionLoading(true);
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch {}
    setActionLoading(false);
  };

  // Legacy-style notification message generator
  function getLegacyNotificationMessage(n) {
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

  if (!user) {
    return <div className="text-center mt-12 text-[#888]">Please log in to view notifications.</div>;
  }

  return (
    <div className="max-w-2xl w-full mx-auto mt-16 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
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