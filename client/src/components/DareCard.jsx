import React from 'react';
import Card from './Card';
import { Link } from 'react-router-dom';
import Avatar from './Avatar';

function DifficultyBadge({ level }) {
  let badgeClass = 'bg-neutral-700 text-neutral-100 rounded-none';
  let label = '';
  switch (level) {
    case 'titillating':
      badgeClass = 'bg-pink-600 text-white rounded-none';
      label = 'Titillating';
      break;
    case 'arousing':
      badgeClass = 'bg-purple-700 text-white rounded-none';
      label = 'Arousing';
      break;
    case 'explicit':
      badgeClass = 'bg-red-700 text-white rounded-none';
      label = 'Explicit';
      break;
    case 'edgy':
      badgeClass = 'bg-yellow-700 text-white rounded-none';
      label = 'Edgy';
      break;
    case 'hardcore':
      badgeClass = 'bg-black text-white rounded-none border border-red-700';
      label = 'Hardcore';
      break;
    default:
      label = level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Unknown';
  }
  return (
    <span className={`px-2 py-1 rounded-none text-xs font-semibold mr-2 ${badgeClass}`}>{label}</span>
  );
}

function StatusBadge({ status }) {
  let badgeClass = 'bg-neutral-700 text-neutral-100 rounded-none';
  let text = 'Unknown';
  switch (status) {
    case 'waiting_for_participant':
      badgeClass = 'bg-success text-success-contrast rounded-none';
      text = 'Waiting for Participant';
      break;
    case 'pending':
    case 'soliciting':
      badgeClass = 'bg-warning text-warning-contrast rounded-none';
      text = 'Awaiting Approval';
      break;
    case 'in_progress':
      badgeClass = 'bg-info text-info-contrast rounded-none';
      text = 'Awaiting pic';
      break;
    case 'completed':
      badgeClass = 'bg-success text-success-contrast rounded-none';
      text = 'Completed';
      break;
    case 'rejected':
      badgeClass = 'bg-danger text-danger-contrast rounded-none';
      text = 'Rejected';
      break;
    case 'graded':
      badgeClass = 'bg-info text-info-contrast rounded-none';
      text = 'Graded';
      break;
    case 'approved':
      badgeClass = 'bg-success text-success-contrast rounded-none';
      text = 'Approved';
      break;
    case 'cancelled':
      badgeClass = 'bg-neutral-700 text-neutral-100 rounded-none';
      text = 'Cancelled';
      break;
    case 'user_deleted':
      badgeClass = 'bg-neutral-700 text-neutral-100 rounded-none';
      text = 'User deleted';
      break;
    default:
      text = status ? status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown';
  }
  return (
    <span className={`px-2 py-1 rounded-none text-xs font-semibold ml-2 ${badgeClass}`}>{text}</span>
  );
}

function Tag({ tag }) {
  return (
    <span className="bg-primary text-primary-contrast px-2 py-1 rounded-none text-xs font-semibold mr-2">{tag}</span>
  );
}

export default function DareCard({
  description,
  difficulty,
  tags = [],
  status,
  creator,
  performer,
  assignedSwitch,
  actions,
  className = '',
  currentUserId,
  proof,
  grades = [],
  feedback,
  onSubmitProof,
  onReviewProof,
  onGrade,
  onForfeit,
  ...props
}) {
  const [expanded, setExpanded] = React.useState(false);
  const isLong = description && description.length > 120;
  const shownDescription = !isLong || expanded ? description : description.slice(0, 120) + '...';

  const userProfileLink = (user) => {
    if (!user) return '#';
    return user._id === currentUserId ? '/profile' : `/profile/${user._id}`;
  };

  // Determine user role
  const isCreator = creator && (creator._id === currentUserId || creator.id === currentUserId);
  const isPerformer = performer && (performer._id === currentUserId || performer.id === currentUserId);

  // Determine available actions
  const canSubmitProof = isPerformer && status === 'in_progress' && (!proof || !proof.submitted);
  const canReviewProof = isCreator && status === 'in_progress' && proof && proof.submitted && !proof.reviewed;
  const canGrade = isCreator && status === 'completed' && grades && !grades.some(g => g.user === currentUserId);
  const canForfeit = isPerformer && status === 'in_progress';

  return (
    <div className={`bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5 ${className}`.trim()} {...props}>
      <div className="flex items-center justify-between bg-[#3c3c3c] text-[#888] border-b border-[#282828] px-[15px] py-[10px] -mx-[15px] mt-[-15px] mb-4 rounded-t-none">
        <h3 className="text-lg font-semibold truncate w-4/5" title={description}>{description}</h3>
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
      <div className="flex flex-col gap-2 mt-4">
        <Link
          to={userProfileLink(creator)}
          className="flex items-center group hover:bg-neutral-800 rounded px-1 py-1 transition-colors"
          style={{ textDecoration: 'none' }}
        >
          <span className="text-neutral-400 text-xs mr-2">Creator:</span>
          <Avatar user={creator} size={28} border={true} shadow={false} alt={creator?.fullName || creator?.username || 'Creator avatar'} />
          <span className="text-[#eee] text-sm font-medium group-hover:text-primary transition-colors">{creator?.fullName || creator?.username || 'Anonymous'}</span>
        </Link>
        {performer && (
          <Link
            to={userProfileLink(performer)}
            className="flex items-center group hover:bg-neutral-800 rounded px-1 py-1 transition-colors"
            style={{ textDecoration: 'none' }}
          >
            <span className="text-neutral-400 text-xs mr-2">Performer:</span>
            <Avatar user={performer} size={28} border={true} shadow={false} alt={performer?.fullName || performer?.username || 'Performer avatar'} />
            <span className="text-[#eee] text-sm font-medium group-hover:text-primary transition-colors">{performer?.fullName || performer?.username || 'Anonymous'}</span>
          </Link>
        )}
        {assignedSwitch && (
          <Link
            to={userProfileLink(assignedSwitch)}
            className="flex items-center group hover:bg-neutral-800 rounded px-1 py-1 transition-colors"
            style={{ textDecoration: 'none' }}
          >
            <span className="text-neutral-400 text-xs mr-2">Switch:</span>
            <Avatar user={assignedSwitch} size={28} border={true} shadow={false} alt={assignedSwitch?.fullName || assignedSwitch?.username || 'Switch avatar'} />
            <span className="text-[#eee] text-sm font-medium group-hover:text-primary transition-colors">{assignedSwitch?.fullName || assignedSwitch?.username || 'Anonymous'}</span>
          </Link>
        )}
      </div>
      {/* Details Section */}
      <div className="mt-2 text-xs text-neutral-400">
        {proof && (
          <div>Proof: {proof.submitted ? 'Submitted' : 'Not submitted'}{proof.reviewed ? ' (Reviewed)' : ''}</div>
        )}
        {grades && grades.length > 0 && (
          <div>Grade: {grades.map(g => g.grade).join(', ')}{feedback && ` | Feedback: ${feedback}`}</div>
        )}
      </div>
      {/* Actions Section */}
      <div className="flex items-center justify-end gap-2 mt-2">
        {canSubmitProof && <button className="bg-primary text-primary-contrast rounded px-2 py-1 text-xs font-semibold shadow-lg" onClick={onSubmitProof}>Submit Proof</button>}
        {canReviewProof && <button className="bg-info text-info-contrast rounded px-2 py-1 text-xs font-semibold shadow-lg" onClick={onReviewProof}>Review Proof</button>}
        {canGrade && <button className="bg-success text-success-contrast rounded px-2 py-1 text-xs font-semibold shadow-lg" onClick={onGrade}>Grade</button>}
        {canForfeit && <button className="bg-danger text-danger-contrast rounded px-2 py-1 text-xs font-semibold shadow-lg" onClick={onForfeit}>Forfeit</button>}
        {actions}
      </div>
    </div>
  );
} 