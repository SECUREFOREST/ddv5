import React from 'react';
import Card from './Card';

function DifficultyBadge({ level }) {
  let labelClass = 'label label-default';
  if (level === 'easy') labelClass = 'label label-success';
  else if (level === 'medium') labelClass = 'label label-warning';
  else if (level === 'hard') labelClass = 'label label-danger';
  return (
    <span className={labelClass} style={{ marginRight: 4 }}>
      {level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Unknown'}
    </span>
  );
}

function StatusBadge({ status }) {
  let labelClass = 'label label-default';
  let text = 'Unknown';
  switch (status) {
    case 'pending':
    case 'soliciting':
      labelClass = 'label label-warning';
      text = 'Awaiting participants';
      break;
    case 'in_progress':
      labelClass = 'label label-info';
      text = 'Awaiting pic';
      break;
    case 'completed':
      labelClass = 'label label-success';
      text = 'Completed';
      break;
    case 'rejected':
      labelClass = 'label label-danger';
      text = 'Rejected';
      break;
    case 'graded':
      labelClass = 'label label-primary';
      text = 'Graded';
      break;
    case 'approved':
      labelClass = 'label label-success';
      text = 'Approved';
      break;
    case 'cancelled':
      labelClass = 'label label-default';
      text = 'Cancelled';
      break;
    case 'user_deleted':
      labelClass = 'label label-default';
      text = 'User deleted';
      break;
    default:
      text = status ? status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown';
  }
  return (
    <span className={labelClass} style={{ marginLeft: 4 }}>{text}</span>
  );
}

function Tag({ tag }) {
  return (
    <span className="label label-primary" style={{ marginRight: 4 }}>{tag}</span>
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
    <div className={`panel panel-default ${className}`.trim()} {...props}>
      <div className="panel-heading">
        <h3 className="panel-title" title={title} style={{ display: 'inline-block', width: '80%' }}>{title}</h3>
        <span style={{ float: 'right' }}>
          <DifficultyBadge level={difficulty} />
          <StatusBadge status={status} />
        </span>
      </div>
      <div className="panel-body">
        <div style={{ color: '#AAAAAA', fontSize: 14, marginBottom: 8 }}>
        {shownDescription}
        {isLong && (
          <button
              className="btn btn-link btn-xs"
              style={{ marginLeft: 8 }}
            onClick={() => setExpanded(e => !e)}
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
        <div style={{ marginBottom: 8 }}>
        {tags.map(tag => <Tag key={tag} tag={tag} />)}
      </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
          {user?.avatar && (
              <img src={user.avatar} alt="avatar" className="img-circle" style={{ width: 28, height: 28, marginRight: 8 }} />
          )}
            <span style={{ fontSize: 14, color: '#EEEEEE' }}>{user?.username}</span>
        </div>
          <div>{actions}</div>
        </div>
      </div>
    </div>
  );
} 