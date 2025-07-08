import React from 'react';

function timeAgo(date) {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const ICONS = {
  comment: <i className="fa fa-comment text-info" style={{ marginRight: 8 }} />,
  act: <i className="fa fa-check-circle text-success" style={{ marginRight: 8 }} />,
  grade: <i className="fa fa-star text-warning" style={{ marginRight: 8 }} />,
  default: <i className="fa fa-circle text-muted" style={{ marginRight: 8 }} />,
};

// Legacy-style activity message generator
function getLegacyActivityMessage(a) {
  if (a.type === 'fulfill') {
    return `${a.actor?.username || 'Someone'} fulfilled your demand`;
  }
  if (a.type === 'grade') {
    return `${a.actor?.username || 'Someone'} graded your task: ${a.grade}`;
  }
  if (a.type === 'reject') {
    const reasonMap = {
      chicken: "chickened out",
      impossible: "think it's not possible or safe for anyone to do",
      incomprehensible: "couldn't understand what was being demanded",
      abuse: "have reported the demand as abuse"
    };
    const reason = reasonMap[a.reason] || 'rejected it';
    return `${a.actor?.username || 'Someone'} rejected your demand because they ${reason}.`;
  }
  // Fallback
  return a.message || a.type || 'Activity';
}

export default function RecentActivityWidget({ activities = [], loading = false, title = 'Recent Activity' }) {
  return (
    <div className="panel panel-default">
      <div className="panel-heading">
        <h3 className="panel-title">{title}</h3>
      </div>
      <div className="panel-body" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: 15 }}>Loading activity...</div>
        ) : activities.length === 0 ? (
          <div className="text-muted" style={{ padding: 15 }}>No recent activity.</div>
        ) : (
          <ul className="list-group">
            {activities.map((a, i) => (
              <li key={i} className="list-group-item" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {ICONS[a.type] || ICONS.default}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: '#EEEEEE' }}>{getLegacyActivityMessage(a)}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{timeAgo(a.createdAt)}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 