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
  comment: <i className="fas fa-comment text-blue-400 mr-2" />,
  dare: <i className="fas fa-check-circle text-green-500 mr-2" />,
  grade: <i className="fas fa-star text-yellow-400 mr-2" />,
  default: <i className="fas fa-circle text-gray-400 mr-2" />,
};

// Comprehensive activity message generator
function getActivityMessage(a) {
  switch (a.type) {
    case 'dare_created':
      return `${a.actor?.username || 'Someone'} created a new dare.`;
    case 'grade_given':
      return `${a.actor?.username || 'Someone'} graded a dare: ${a.details?.grade ?? ''}`;
    case 'comment_added':
      return `${a.actor?.username || 'Someone'} commented on a dare.`;
    default:
      return a.message || a.type || 'Activity';
  }
}

export default function RecentActivityWidget({ activities = [], loading = false, title = 'Recent Activity', onRefresh }) {
  const [refreshing, setRefreshing] = React.useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    if (onRefresh) await onRefresh();
    setRefreshing(false);
  };
  return (
    <div className="bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
      <div className="bg-[#3c3c3c] text-[#888] border-b border-[#282828] px-[15px] py-[10px] -mx-[15px] mt-[-15px] mb-4 rounded-t-none flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        {onRefresh && (
          <button className="text-primary text-xs underline hover:text-primary-dark" onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        )}
      </div>
      <div>
        {loading ? (
          <div className="text-[#888] py-4">Loading activity...</div>
        ) : activities.length === 0 ? (
          <div className="text-[#888] py-4">No recent activity.</div>
        ) : (
          <ul className="divide-y divide-[#282828] text-[#fff]">
            {activities.map((a, i) => (
              <li key={i} className="flex items-center gap-3 py-3">
                {ICONS[a.type] || ICONS.default}
                <div className="flex-1">
                  <div className="text-sm">{getActivityMessage(a)}</div>
                  <div className="text-xs text-[#888]">{timeAgo(a.createdAt)}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 