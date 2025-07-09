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
    return <div className="text-center" style={{ marginTop: 32 }}>Please log in to view notifications.</div>;
  }

  return (
    <div className="panel panel-default">
      <div className="panel-heading">
        <h1 className="panel-title">Notifications</h1>
      </div>
      <div className="panel-body">
      {loading ? (
        <div>Loading notifications...</div>
      ) : notifications.length === 0 ? (
          <div className="text-muted">No notifications.</div>
      ) : (
          <ul className="list-group">
          {notifications.map((n) => (
              <li
                key={n._id}
                className={`list-group-item${n.read ? '' : ' active'}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
              <div>
                  <div style={{ fontWeight: 500 }}>{getLegacyNotificationMessage(n)}</div>
                  <div className="text-muted" style={{ fontSize: 12 }}>{n.type} &middot; {new Date(n.createdAt).toLocaleString()}</div>
              </div>
              {!n.read && (
                <button
                    className="btn btn-primary btn-xs"
                  onClick={() => handleMarkRead(n._id)}
                  disabled={actionLoading}
                >
                  Mark as read
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      </div>
    </div>
  );
} 