import React from 'react';
import Card from './Card';

function DifficultyBadge({ level }) {
  let badgeClass = 'bg-gray-400 text-white';
  if (level === 'easy') badgeClass = 'bg-green-500 text-white';
  else if (level === 'medium') badgeClass = 'bg-yellow-500 text-white';
  else if (level === 'hard') badgeClass = 'bg-red-500 text-white';
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold mr-2 ${badgeClass}`}>{level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Unknown'}</span>
  );
}

function StatusBadge({ status }) {
  let badgeClass = 'bg-gray-400 text-white';
  let text = 'Unknown';
  switch (status) {
    case 'pending':
    case 'soliciting':
      badgeClass = 'bg-yellow-500 text-white';
      text = 'Awaiting participants';
      break;
    case 'in_progress':
      badgeClass = 'bg-blue-400 text-white';
      text = 'Awaiting pic';
      break;
    case 'completed':
      badgeClass = 'bg-green-500 text-white';
      text = 'Completed';
      break;
    case 'rejected':
      badgeClass = 'bg-red-500 text-white';
      text = 'Rejected';
      break;
    case 'graded':
      badgeClass = 'bg-blue-600 text-white';
      text = 'Graded';
      break;
    case 'approved':
      badgeClass = 'bg-green-600 text-white';
      text = 'Approved';
      break;
    case 'cancelled':
      badgeClass = 'bg-gray-400 text-white';
      text = 'Cancelled';
      break;
    case 'user_deleted':
      badgeClass = 'bg-gray-400 text-white';
      text = 'User deleted';
      break;
    default:
      text = status ? status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown';
  }
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ml-2 ${badgeClass}`}>{text}</span>
  );
}

function Tag({ tag }) {
  return (
    <span className="bg-primary text-white px-2 py-1 rounded text-xs font-semibold mr-2">{tag}</span>
  );
}

export default function ActCard({
  title,
  description,
  difficulty,
  tags = [],
  status,
  user,
  actions,
  className = '',
  ...props
}) {
  const [expanded, setExpanded] = React.useState(false);
  const isLong = description && description.length > 120;
  const shownDescription = !isLong || expanded ? description : description.slice(0, 120) + '...';
  return (
    <div className={`bg-white dark:bg-surface-dark rounded-lg shadow p-4 mb-4 ${className}`.trim()} {...props}>
      <div className="flex items-center justify-between border-b pb-2 mb-2">
        <h3 className="text-lg font-semibold truncate w-4/5" title={title}>{title}</h3>
        <div className="flex items-center">
          <DifficultyBadge level={difficulty} />
          <StatusBadge status={status} />
        </div>
      </div>
      <div className="mb-2 text-gray-700 dark:text-gray-300 text-sm">
        {shownDescription}
        {isLong && (
          <button
            className="ml-2 text-primary underline text-xs focus:outline-none"
            onClick={() => setExpanded(e => !e)}
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
      <div className="mb-2 flex flex-wrap">
        {tags.map(tag => <Tag key={tag} tag={tag} />)}
      </div>
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center">
          {user?.avatar && (
            <img src={user.avatar} alt="avatar" className="w-7 h-7 rounded-full object-cover mr-2" />
          )}
          <span className="text-gray-800 dark:text-gray-200 text-sm font-medium">{user?.username}</span>
        </div>
        <div>{actions}</div>
      </div>
    </div>
  );
} 