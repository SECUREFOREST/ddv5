import React from 'react';
import Card from './Card';

function DifficultyBadge({ level }) {
  let badgeClass = 'bg-neutral-700 text-neutral-100';
  if (level === 'easy') badgeClass = 'bg-success text-success-contrast';
  else if (level === 'medium') badgeClass = 'bg-warning text-warning-contrast';
  else if (level === 'hard') badgeClass = 'bg-danger text-danger-contrast';
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold mr-2 ${badgeClass}`}>{level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Unknown'}</span>
  );
}

function StatusBadge({ status }) {
  let badgeClass = 'bg-neutral-700 text-neutral-100';
  let text = 'Unknown';
  switch (status) {
    case 'pending':
    case 'soliciting':
      badgeClass = 'bg-warning text-warning-contrast';
      text = 'Awaiting participants';
      break;
    case 'in_progress':
      badgeClass = 'bg-info text-info-contrast';
      text = 'Awaiting pic';
      break;
    case 'completed':
      badgeClass = 'bg-success text-success-contrast';
      text = 'Completed';
      break;
    case 'rejected':
      badgeClass = 'bg-danger text-danger-contrast';
      text = 'Rejected';
      break;
    case 'graded':
      badgeClass = 'bg-info text-info-contrast';
      text = 'Graded';
      break;
    case 'approved':
      badgeClass = 'bg-success text-success-contrast';
      text = 'Approved';
      break;
    case 'cancelled':
      badgeClass = 'bg-neutral-700 text-neutral-100';
      text = 'Cancelled';
      break;
    case 'user_deleted':
      badgeClass = 'bg-neutral-700 text-neutral-100';
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
    <span className="bg-primary text-primary-contrast px-2 py-1 rounded text-xs font-semibold mr-2">{tag}</span>
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
    <div className={`bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5 ${className}`.trim()} {...props}>
      <div className="flex items-center justify-between bg-[#3c3c3c] text-[#888] border-b border-[#282828] px-[15px] py-[10px] -mx-[15px] mt-[-15px] mb-4 rounded-t-none">
        <h3 className="text-lg font-semibold truncate w-4/5" title={title}>{title}</h3>
        <div className="flex items-center">
          <DifficultyBadge level={difficulty} />
          <StatusBadge status={status} />
        </div>
      </div>
      <div className="mb-2 text-[#eee] text-sm">
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
          <span className="text-[#eee] text-sm font-medium">{user?.username}</span>
        </div>
        <div>{actions}</div>
      </div>
    </div>
  );
} 