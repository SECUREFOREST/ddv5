import React, { useRef, useEffect } from 'react';
import Card from './Card';
import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import { FireIcon, ClockIcon, CheckCircleIcon, XMarkIcon, UserIcon } from '@heroicons/react/24/solid';

// Utility for fade-in animation
function useFadeIn(ref, deps = []) {
  useEffect(() => {
    if (ref.current) {
      ref.current.classList.add('animate-fade-in');
      setTimeout(() => ref.current.classList.remove('animate-fade-in'), 600);
    }
    // eslint-disable-next-line
  }, deps);
}

// Badge icon map
const BADGE_ICONS = {
  titillating: <FireIcon className="w-4 h-4 mr-1 text-white" />, // flame
  arousing: <UserIcon className="w-4 h-4 mr-1 text-white" />, // user
  explicit: <XMarkIcon className="w-4 h-4 mr-1 text-white" />, // x
  edgy: <CheckCircleIcon className="w-4 h-4 mr-1 text-white" />, // check
  hardcore: <FireIcon className="w-4 h-4 mr-1 text-white animate-pulse" />, // animated flame
  waiting_for_participant: <ClockIcon className="w-4 h-4 mr-1 text-white" />, // clock
  in_progress: <ClockIcon className="w-4 h-4 mr-1 text-white" />, // clock
  completed: <CheckCircleIcon className="w-4 h-4 mr-1 text-white" />, // check
};

function DifficultyBadge({ level }) {
  let badgeClass = 'bg-neutral-700 text-neutral-100 rounded-full shadow-sm';
  let label = '';
  let icon = BADGE_ICONS[level];
  switch (level) {
    case 'titillating':
      badgeClass = 'bg-pink-600 text-white rounded-full shadow-pink-400/40 shadow-md';
      label = 'Titillating';
      break;
    case 'arousing':
      badgeClass = 'bg-purple-700 text-white rounded-full shadow-purple-400/40 shadow-md';
      label = 'Arousing';
      break;
    case 'explicit':
      badgeClass = 'bg-red-700 text-white rounded-full shadow-red-400/40 shadow-md';
      label = 'Explicit';
      break;
    case 'edgy':
      badgeClass = 'bg-yellow-700 text-white rounded-full shadow-yellow-400/40 shadow-md';
      label = 'Edgy';
      break;
    case 'hardcore':
      badgeClass = 'bg-black text-white rounded-full border border-red-700 shadow-red-400/40 shadow-md';
      label = 'Hardcore';
      break;
    default:
      label = level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Unknown';
  }
  const ref = useRef();
  useFadeIn(ref, [level]);
  return (
    <span ref={ref} className={`inline-flex items-center px-3 py-1 text-xs font-semibold mr-2 ${badgeClass} transition-all duration-300 animate-badge-fade`}>
      {icon}{label}
    </span>
  );
}

function StatusBadge({ status }) {
  let badgeClass = 'bg-neutral-700 text-neutral-100 rounded-full shadow-sm';
  let text = 'Unknown';
  let icon = BADGE_ICONS[status];
  switch (status) {
    case 'waiting_for_participant':
      badgeClass = 'bg-blue-700 text-white rounded-full shadow-blue-400/40 shadow-md';
      text = 'Waiting for Participant';
      break;
    case 'pending':
    case 'soliciting':
      badgeClass = 'bg-yellow-600 text-white rounded-full shadow-yellow-400/40 shadow-md';
      text = 'Awaiting Approval';
      break;
    case 'in_progress':
      badgeClass = 'bg-info text-info-contrast rounded-full shadow-info/40 shadow-md';
      text = 'Awaiting pic';
      break;
    case 'completed':
      badgeClass = 'bg-green-700 text-white rounded-full shadow-green-400/40 shadow-md';
      text = 'Completed';
      break;
    case 'rejected':
      badgeClass = 'bg-danger text-danger-contrast rounded-full shadow-danger/40 shadow-md';
      text = 'Rejected';
      break;
    case 'graded':
      badgeClass = 'bg-info text-info-contrast rounded-full shadow-info/40 shadow-md';
      text = 'Graded';
      break;
    case 'approved':
      badgeClass = 'bg-success text-success-contrast rounded-full shadow-success/40 shadow-md';
      text = 'Approved';
      break;
    case 'cancelled':
      badgeClass = 'bg-neutral-700 text-neutral-100 rounded-full';
      text = 'Cancelled';
      break;
    case 'user_deleted':
      badgeClass = 'bg-neutral-700 text-neutral-100 rounded-full';
      text = 'User deleted';
      break;
    default:
      text = status ? status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Unknown';
  }
  const ref = useRef();
  useFadeIn(ref, [status]);
  return (
    <span ref={ref} className={`inline-flex items-center px-3 py-1 text-xs font-semibold ml-2 ${badgeClass} transition-all duration-300 animate-badge-fade`}>
      {icon}{text}
    </span>
  );
}

function Tag({ tag }) {
  return (
    <span className="bg-primary text-primary-contrast px-2 py-1 rounded-full text-xs font-semibold mr-2 shadow shadow-primary/30">{tag}</span>
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
  loading = false, // new prop for skeleton state
  ...props
}) {
  const [expanded, setExpanded] = React.useState(false);
  const isLong = description && description.length > 120;
  const shownDescription = !isLong || expanded ? description : description.slice(0, 120) + '...';

  // Animate card on mount/hover
  const cardRef = useRef();
  useFadeIn(cardRef, []);

  // Responsive stacking
  const cardBase = 'bg-[#222] border border-[#282828] rounded-xl shadow transition-all duration-300 p-4 mb-5 flex flex-col gap-2 hover:shadow-2xl hover:scale-[1.015] active:scale-[0.98] focus-within:shadow-2xl';
  const cardMobile = 'sm:flex-row sm:items-center';

  if (loading) {
    // Placeholder for skeleton loader integration
    return (
      <div className={`${cardBase} animate-pulse`} ref={cardRef}>
        <div className="h-6 w-1/3 bg-neutral-700 rounded mb-2" />
        <div className="flex gap-2 mb-2">
          <div className="h-8 w-8 bg-neutral-700 rounded-full" />
          <div className="h-4 w-1/4 bg-neutral-700 rounded" />
        </div>
        <div className="h-4 w-2/3 bg-neutral-700 rounded mb-2" />
        <div className="h-8 w-full bg-neutral-800 rounded" />
      </div>
    );
  }

  const userProfileLink = (user) => {
    if (!user) return '#';
    return user._id === currentUserId ? '/profile' : `/profile/${user._id}`;
  };

  // Animate badge/avatar changes for new participants (simple fade-in)
  const creatorRef = useRef();
  const performerRef = useRef();
  useFadeIn(creatorRef, [creator?.avatar]);
  useFadeIn(performerRef, [performer?.avatar]);

  return (
    <div
      ref={cardRef}
      className={`${cardBase} ${cardMobile} ${className}`.trim()}
      tabIndex={0}
      {...props}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-2">
        <div className="flex items-center gap-2">
          <DifficultyBadge level={difficulty} />
          <StatusBadge status={status} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {tags.map(tag => <Tag key={tag} tag={tag} />)}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 items-center w-full">
        <Link
          to={userProfileLink(creator)}
          className="flex items-center group hover:bg-neutral-800 rounded px-1 py-1 transition-colors"
          style={{ textDecoration: 'none' }}
        >
          <span className="text-neutral-400 text-xs mr-2">Creator:</span>
          <span ref={creatorRef}><Avatar user={creator} size={28} border={true} shadow={false} alt={creator?.fullName || creator?.username || 'Creator avatar'} /></span>
          <span className="text-[#eee] text-sm font-medium group-hover:text-primary transition-colors">{creator?.fullName || creator?.username || 'Anonymous'}</span>
        </Link>
        {performer && (
          <Link
            to={userProfileLink(performer)}
            className="flex items-center group hover:bg-neutral-800 rounded px-1 py-1 transition-colors"
            style={{ textDecoration: 'none' }}
          >
            <span className="text-neutral-400 text-xs mr-2">Performer:</span>
            <span ref={performerRef}><Avatar user={performer} size={28} border={true} shadow={false} alt={performer?.fullName || performer?.username || 'Performer avatar'} /></span>
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
      <div className="w-full">
        <button
          className="w-full flex items-center justify-between px-4 py-2 bg-primary text-primary-contrast rounded-full font-bold text-base shadow-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-contrast transition-all duration-200 mt-2 mb-2"
          onClick={() => setExpanded(e => !e)}
          aria-expanded={expanded}
        >
          <span className="flex items-center gap-2">
            <span className="text-lg">{expanded ? <XMarkIcon className="w-5 h-5" /> : <ClockIcon className="w-5 h-5" />}</span>
            {expanded ? 'Hide Description' : 'Show Description'}
          </span>
          <span className={`transform transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>▼</span>
        </button>
        <div
          className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-96 py-2 px-4' : 'max-h-0 py-0 px-4'}`}
          aria-hidden={!expanded}
        >
          <div className="text-neutral-100 text-sm">
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
        </div>
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
        {onSubmitProof && <button className="bg-primary text-primary-contrast rounded-full px-4 py-2 text-xs font-semibold shadow-lg flex items-center gap-2 hover:bg-primary-dark transition-all duration-200" onClick={onSubmitProof}><CheckCircleIcon className="w-4 h-4" />Submit Proof</button>}
        {onReviewProof && <button className="bg-info text-info-contrast rounded-full px-4 py-2 text-xs font-semibold shadow-lg flex items-center gap-2 hover:bg-info-dark transition-all duration-200" onClick={onReviewProof}><CheckCircleIcon className="w-4 h-4" />Review Proof</button>}
        {onGrade && <button className="bg-success text-success-contrast rounded-full px-4 py-2 text-xs font-semibold shadow-lg flex items-center gap-2 hover:bg-success-dark transition-all duration-200" onClick={onGrade}><CheckCircleIcon className="w-4 h-4" />Grade</button>}
        {onForfeit && <button className="bg-danger text-danger-contrast rounded-full px-4 py-2 text-xs font-semibold shadow-lg flex items-center gap-2 hover:bg-danger-dark transition-all duration-200" onClick={onForfeit}><XMarkIcon className="w-4 h-4" />Forfeit</button>}
        {actions}
      </div>
    </div>
  );
} 