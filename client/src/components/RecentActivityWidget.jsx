import React from 'react';
import { formatRelativeTime } from '../utils/dateUtils';

function timeAgo(date) {
  return formatRelativeTime(date);
}

const ICONS = {
  comment: <i className="fas fa-comment text-blue-400 mr-2" />,
  dare: <i className="fas fa-check-circle text-green-500 mr-2" />,
  grade: <i className="fas fa-star text-yellow-400 mr-2" />,
  default: <i className="fas fa-circle text-gray-400 mr-2" />,
};

// Comprehensive activity message generator
function getActivityMessage(a) {
  const actorName = a.actor?.fullName || a.actor?.username || 'Someone';
  switch (a.type) {
    case 'dare_created':
      return `${actorName} created a new dare.`;
    case 'grade_given':
      return `${actorName} graded a dare: ${a.details?.grade ?? ''}`;
    case 'comment_added':
      return `${actorName} commented on a dare.`;
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
    <div className="bg-[#222] border border-[#282828] rounded-none p-[15px] mb-5">
      <div className="bg-[#3c3c3c] text-[#888] border-b border-[#282828] px-[15px] py-[10px] -mx-[15px] mt-[-15px] mb-4 rounded-t-none flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        {onRefresh && (
          <button className="text-primary text-xs underline hover:text-primary-dark shadow-lg" onClick={handleRefresh} disabled={refreshing}>
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
          <ul className="divide-y divide-[#282828] text-[#fff]" role="list">
            {activities.map((a, i) => (
              <li key={i} className="flex items-center gap-3 py-3" role="listitem">
                {ICONS[a.type] || ICONS.default}
                <div className="flex-1">
                  <div className="text-sm">{getActivityMessage(a)}</div>
                  <div className="text-xs text-[#888]">
                    <time dateTime={a.createdAt}>{timeAgo(a.createdAt)}</time>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 