import React, { useRef, useEffect, memo } from 'react';
import Card from './Card';
import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import { FireIcon, ClockIcon, CheckCircleIcon, XMarkIcon, UserIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';

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
      badgeClass = 'bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-full shadow-lg shadow-pink-500/25';
      label = 'Titillating';
      break;
    case 'arousing':
      badgeClass = 'bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-full shadow-lg shadow-purple-500/25';
      label = 'Arousing';
      break;
    case 'explicit':
      badgeClass = 'bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full shadow-lg shadow-red-500/25';
      label = 'Explicit';
      break;
    case 'edgy':
      badgeClass = 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white rounded-full shadow-lg shadow-yellow-500/25';
      label = 'Edgy';
      break;
    case 'hardcore':
      badgeClass = 'bg-gradient-to-r from-black to-gray-900 text-white rounded-full border border-red-600 shadow-lg shadow-red-500/25';
      label = 'Hardcore';
      break;
    default:
      label = level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Unknown';
  }
  const ref = useRef(null);
  useFadeIn(ref, [level]);
  return (
    <span ref={ref} className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold mr-2 ${badgeClass} transition-all duration-300 animate-badge-fade hover:scale-105`}>
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
      badgeClass = 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full shadow-lg shadow-blue-500/25';
      text = 'Waiting for Participant';
      break;
    case 'pending':
    case 'soliciting':
      badgeClass = 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-full shadow-lg shadow-yellow-500/25';
      text = 'Awaiting Approval';
      break;
    case 'in_progress':
      badgeClass = 'bg-gradient-to-r from-info to-info-dark text-info-contrast rounded-full shadow-lg shadow-info/25';
      text = 'Awaiting pic';
      break;
    case 'completed':
      badgeClass = 'bg-gradient-to-r from-green-600 to-green-700 text-white rounded-full shadow-lg shadow-green-500/25';
      text = 'Completed';
      break;
    case 'rejected':
      badgeClass = 'bg-gradient-to-r from-danger to-danger-dark text-danger-contrast rounded-full shadow-lg shadow-danger/25';
      text = 'Rejected';
      break;
    case 'graded':
      badgeClass = 'bg-gradient-to-r from-info to-info-dark text-info-contrast rounded-full shadow-lg shadow-info/25';
      text = 'Graded';
      break;
    case 'approved':
      badgeClass = 'bg-gradient-to-r from-success to-success-dark text-success-contrast rounded-full shadow-lg shadow-success/25';
      text = 'Approved';
      break;
    case 'forfeited':
      badgeClass = 'bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full shadow-lg shadow-red-500/25';
      text = 'Forfeited';
      break;
    case 'expired':
      badgeClass = 'bg-gradient-to-r from-neutral-600 to-neutral-700 text-white rounded-full shadow-lg shadow-neutral-500/25';
      text = 'Expired';
      break;
    default:
      text = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
  }
  const ref = useRef(null);
  useFadeIn(ref, [status]);
  return (
    <span ref={ref} className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold ${badgeClass} transition-all duration-300 animate-badge-fade hover:scale-105`}>
      {icon}{text}
    </span>
  );
}

function Tag({ tag }) {
  return (
    <span className="inline-block bg-gradient-to-r from-primary to-primary-dark text-primary-contrast rounded-full px-2 py-1 text-xs font-semibold mr-1 mb-1 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
      {tag}
    </span>
  );
}

const DareCard = memo(function DareCard({
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
  const cardRef = useRef(null);
  useFadeIn(cardRef, []);

  // Responsive stacking
  const cardBase = 'bg-[#222] border border-[#282828] rounded-xl shadow transition-all duration-300 p-4 mb-5 flex flex-col gap-2 hover:shadow-2xl hover:scale-[1.015] active:scale-[0.98] focus-within:shadow-2xl';
  const cardMobile = 'sm:flex-row sm:items-center';

  if (loading) {
    return (
      <div className="bg-neutral-900/60 rounded-xl p-6 border border-neutral-800/50 shadow-lg animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-neutral-700 rounded w-24"></div>
          <div className="h-6 bg-neutral-700 rounded w-20"></div>
        </div>
        <div className="h-4 bg-neutral-700 rounded w-3/4 mb-4"></div>
        <div className="flex gap-2 mb-4">
          <div className="h-6 bg-neutral-700 rounded w-16"></div>
          <div className="h-6 bg-neutral-700 rounded w-20"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 bg-neutral-700 rounded-full"></div>
          <div className="h-4 bg-neutral-700 rounded w-32"></div>
        </div>
      </div>
    );
  }

  const userProfileLink = (user) => {
    if (!user) return '#';
    return user._id === currentUserId ? '/profile' : `/profile/${user._id}`;
  };

  // Animate badge/avatar changes for new participants (simple fade-in)
  const creatorRef = useRef(null);
  const performerRef = useRef(null);
  useFadeIn(creatorRef, [creator?.avatar]);
  useFadeIn(performerRef, [performer?.avatar]);

  return (
    <div className={`bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-xl p-6 border border-neutral-700/50 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}>
      {/* Header with badges */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <DifficultyBadge level={difficulty} />
          <StatusBadge status={status} />
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {tags.slice(0, 3).map(tag => <Tag key={tag} tag={tag} />)}
            {tags.length > 3 && (
              <span className="inline-block bg-neutral-700 text-neutral-300 rounded-full px-2 py-1 text-xs font-semibold">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="text-neutral-100 text-sm leading-relaxed">
          {shownDescription}
          {isLong && (
            <button
              className="ml-2 text-primary underline text-xs focus:outline-none hover:text-primary-dark transition-colors"
              onClick={() => setExpanded(e => !e)}
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </p>
      </div>

      {/* User Information */}
      <div className="space-y-3 mb-4">
        <Link
          to={userProfileLink(creator)}
          className="flex items-center group hover:bg-neutral-800/50 rounded-lg px-3 py-2 transition-all duration-200 hover:scale-[1.02]"
          style={{ textDecoration: 'none' }}
        >
          <span className="text-neutral-400 text-xs mr-3 font-medium">Creator:</span>
          <span ref={creatorRef} className="mr-2">
            <Avatar user={creator} size={32} border={true} shadow={true} alt={creator?.fullName || creator?.username || 'Creator avatar'} />
          </span>
          <span className="text-neutral-100 text-sm font-medium group-hover:text-primary transition-colors">
            {creator?.fullName || creator?.username || 'Anonymous'}
          </span>
        </Link>
        
        {performer && (
          <Link
            to={userProfileLink(performer)}
            className="flex items-center group hover:bg-neutral-800/50 rounded-lg px-3 py-2 transition-all duration-200 hover:scale-[1.02]"
            style={{ textDecoration: 'none' }}
          >
            <span className="text-neutral-400 text-xs mr-3 font-medium">Performer:</span>
            <span ref={performerRef} className="mr-2">
              <Avatar user={performer} size={32} border={true} shadow={true} alt={performer?.fullName || performer?.username || 'Performer avatar'} />
            </span>
            <span className="text-neutral-100 text-sm font-medium group-hover:text-primary transition-colors">
              {performer?.fullName || performer?.username || 'Anonymous'}
            </span>
          </Link>
        )}
        
        {assignedSwitch && (
          <Link
            to={userProfileLink(assignedSwitch)}
            className="flex items-center group hover:bg-neutral-800/50 rounded-lg px-3 py-2 transition-all duration-200 hover:scale-[1.02]"
            style={{ textDecoration: 'none' }}
          >
            <span className="text-neutral-400 text-xs mr-3 font-medium">Switch:</span>
            <Avatar user={assignedSwitch} size={32} border={true} shadow={true} alt={assignedSwitch?.fullName || assignedSwitch?.username || 'Switch avatar'} />
            <span className="text-neutral-100 text-sm font-medium group-hover:text-primary transition-colors">
              {assignedSwitch?.fullName || assignedSwitch?.username || 'Anonymous'}
            </span>
          </Link>
        )}
      </div>

      {/* Expandable Description Section */}
      <div className="mb-4">
        <button
          className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary to-primary-dark text-primary-contrast rounded-xl font-semibold text-sm shadow-lg hover:from-primary-dark hover:to-primary focus:outline-none focus:ring-2 focus:ring-primary-contrast transition-all duration-300 group"
          onClick={() => setExpanded(e => !e)}
          aria-expanded={expanded}
        >
          <span className="flex items-center gap-2">
            {expanded ? <ChevronUpIcon className="w-4 h-4 group-hover:scale-110 transition-transform" /> : <ChevronDownIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />}
            {expanded ? 'Hide Description' : 'Show Description'}
          </span>
        </button>
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? 'max-h-96 py-4' : 'max-h-0 py-0'}`}
          aria-hidden={!expanded}
        >
          <div className="text-neutral-100 text-sm leading-relaxed bg-neutral-800/30 rounded-lg p-4 border border-neutral-700/30">
            {description}
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="space-y-2 mb-4">
        {proof && (
          <div className="text-xs text-neutral-400 bg-neutral-800/30 rounded-lg p-3 border border-neutral-700/30">
            <span className="font-medium">Proof:</span> {proof.submitted ? 'Submitted' : 'Not submitted'}{proof.reviewed ? ' (Reviewed)' : ''}
          </div>
        )}
        {grades && grades.length > 0 && (
          <div className="text-xs text-neutral-400 bg-neutral-800/30 rounded-lg p-3 border border-neutral-700/30">
            <span className="font-medium">Grade:</span> {grades.map(g => g.grade).join(', ')}{feedback && ` | Feedback: ${feedback}`}
          </div>
        )}
        {/* Add friendly timestamp with tooltip */}
        {props.updatedAt && (
          <div className="text-xs text-neutral-500 bg-neutral-800/20 rounded-lg p-2 border border-neutral-700/20">
            <span 
              className="cursor-help hover:text-neutral-400 transition-colors" 
              title={formatRelativeTimeWithTooltip(props.updatedAt).tooltip}
            >
              Updated {formatRelativeTimeWithTooltip(props.updatedAt).display}
            </span>
          </div>
        )}
      </div>

      {/* Actions Section */}
      {(onSubmitProof || onReviewProof || onGrade || onForfeit || actions) && (
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-700/30">
          {onSubmitProof && (
            <button 
              className="bg-gradient-to-r from-primary to-primary-dark text-primary-contrast rounded-lg px-4 py-2 text-xs font-semibold shadow-lg flex items-center gap-2 hover:from-primary-dark hover:to-primary transition-all duration-200 hover:scale-105" 
              onClick={onSubmitProof}
            >
              <CheckCircleIcon className="w-4 h-4" />
              Submit Proof
            </button>
          )}
          {onReviewProof && (
            <button 
              className="bg-gradient-to-r from-info to-info-dark text-info-contrast rounded-lg px-4 py-2 text-xs font-semibold shadow-lg flex items-center gap-2 hover:from-info-dark hover:to-info transition-all duration-200 hover:scale-105" 
              onClick={onReviewProof}
            >
              <CheckCircleIcon className="w-4 h-4" />
              Review Proof
            </button>
          )}
          {onGrade && (
            <button 
              className="bg-gradient-to-r from-success to-success-dark text-success-contrast rounded-lg px-4 py-2 text-xs font-semibold shadow-lg flex items-center gap-2 hover:from-success-dark hover:to-success transition-all duration-200 hover:scale-105" 
              onClick={onGrade}
            >
              <CheckCircleIcon className="w-4 h-4" />
              Grade
            </button>
          )}
          {onForfeit && (
            <button 
              className="bg-gradient-to-r from-danger to-danger-dark text-danger-contrast rounded-lg px-4 py-2 text-xs font-semibold shadow-lg flex items-center gap-2 hover:from-danger-dark hover:to-danger transition-all duration-200 hover:scale-105" 
              onClick={onForfeit}
            >
              <XMarkIcon className="w-4 h-4" />
              Forfeit
            </button>
          )}
          {actions}
        </div>
      )}
    </div>
  );
});

export default DareCard; 