import React, { useRef, useEffect, memo } from 'react';
import Card from './Card';
import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import { FireIcon, ClockIcon, CheckCircleIcon, XMarkIcon, UserIcon, ChevronDownIcon, ChevronUpIcon, EyeIcon } from '@heroicons/react/24/solid';
import { DIFFICULTY_ICONS } from '../constants.jsx';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';

// Utility for fade-in animation
function useFadeIn(ref, deps = []) {
  useEffect(() => {
    let timeoutId;
    
    const addClass = () => {
      if (ref.current && ref.current.classList) {
        ref.current.classList.add('animate-fade-in');
        // Memory-safe timeout for animation cleanup
        timeoutId = setTimeout(() => {
          if (ref.current && ref.current.classList) {
            ref.current.classList.remove('animate-fade-in');
          }
        }, 600);
      }
    };
    
    const rafId = requestAnimationFrame(addClass);
    
    return () => {
      cancelAnimationFrame(rafId);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, deps);
}

// Enhanced badge system with better visual hierarchy
const DIFFICULTY_CONFIG = {
  titillating: {
    label: 'Titillating',
    color: 'from-pink-400 to-pink-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
            icon: DIFFICULTY_ICONS.titillating
  },
  arousing: {
    label: 'Arousing',
    color: 'from-purple-400 to-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
            icon: DIFFICULTY_ICONS.arousing
  },
  explicit: {
    label: 'Explicit',
    color: 'from-orange-400 to-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
            icon: DIFFICULTY_ICONS.explicit
  },
  edgy: {
    label: 'Edgy',
    color: 'from-yellow-400 to-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
            icon: DIFFICULTY_ICONS.edgy
  },
  hardcore: {
    label: 'Hardcore',
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
            icon: DIFFICULTY_ICONS.hardcore
  }
};

const STATUS_CONFIG = {
  waiting_for_participant: {
    label: 'Available',
    color: 'from-blue-400 to-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    icon: <ClockIcon className="w-3 h-3" />
  },
  in_progress: {
    label: 'In Progress',
    color: 'from-green-400 to-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    icon: <CheckCircleIcon className="w-3 h-3" />
  },
  completed: {
    label: 'Completed',
    color: 'from-emerald-400 to-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    icon: <CheckCircleIcon className="w-3 h-3" />
  },
  rejected: {
    label: 'Rejected',
    color: 'from-red-400 to-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    icon: <XMarkIcon className="w-3 h-3" />
  }
};

function DifficultyBadge({ level }) {
  const config = DIFFICULTY_CONFIG[level] || DIFFICULTY_CONFIG.titillating;
  const ref = useRef(null);
  useFadeIn(ref, [level]);
  
  return (
    <span 
      ref={ref} 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${config.bgColor} ${config.borderColor} text-white transition-all duration-200 hover:scale-105`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.waiting_for_participant;
  const ref = useRef(null);
  useFadeIn(ref, [status]);
  
  return (
    <span 
      ref={ref} 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${config.bgColor} ${config.borderColor} text-white transition-all duration-200 hover:scale-105`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

function Tag({ tag }) {
  return (
    <span className="inline-flex items-center px-2 py-1 bg-neutral-800/50 border border-neutral-700/50 text-neutral-300 rounded-full text-xs font-medium hover:bg-neutral-700/50 transition-all duration-200">
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
  onChickenOut,
  loading = false,
  ...props
}) {
  const [expanded, setExpanded] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const isLong = description && description.length > 100;
  const shownDescription = !isLong || expanded ? description : description.slice(0, 100) + '...';

  const cardRef = useRef(null);
  useFadeIn(cardRef, []);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-6 border border-neutral-700/50 shadow-lg animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-neutral-700 rounded-full"></div>
            <div className="h-6 w-20 bg-neutral-700 rounded-full"></div>
          </div>
        </div>
        <div className="h-4 bg-neutral-700 rounded w-3/4 mb-4"></div>
        <div className="flex gap-2 mb-4">
          <div className="h-5 w-12 bg-neutral-700 rounded-full"></div>
          <div className="h-5 w-16 bg-neutral-700 rounded-full"></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-neutral-700 rounded-full"></div>
          <div className="h-4 bg-neutral-700 rounded w-32"></div>
        </div>
      </div>
    );
  }

  const userProfileLink = (user) => {
    if (!user) return '#';
    return user._id === currentUserId ? '/profile' : `/profile/${user._id}`;
  };

  const creatorRef = useRef(null);
  const performerRef = useRef(null);
  useFadeIn(creatorRef, [creator?.avatar]);
  useFadeIn(performerRef, [performer?.avatar]);

  return (
    <div 
      className={`group relative bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl border border-neutral-700/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      ref={cardRef}
    >
      {/* Hover effect overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r from-primary/5 to-primary-dark/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}></div>
      
      <div className="relative p-6">
        {/* Header with improved visual hierarchy */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <DifficultyBadge level={difficulty} />
            <StatusBadge status={status} />
          </div>
          
          {/* Tags with better spacing */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 max-w-[40%]">
              {tags.slice(0, 2).map(tag => <Tag key={tag} tag={tag} />)}
              {tags.length > 2 && (
                <span className="inline-flex items-center px-2 py-1 bg-neutral-800/50 border border-neutral-700/50 text-neutral-400 rounded-full text-xs font-medium">
                  +{tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Main content area */}
        <div className="space-y-4">
          {/* Description with improved typography */}
          <div className="mb-4">
            <p className="text-neutral-100 text-sm leading-relaxed font-medium">
              {shownDescription}
              {isLong && (
                <button
                  className="ml-2 text-primary underline text-xs focus:outline-none hover:text-primary-dark transition-colors font-medium"
                  onClick={() => setExpanded(e => !e)}
                >
                  {expanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </p>
          </div>

          {/* User information with better layout */}
          <div className="space-y-3">
            {/* Creator */}
            <Link
              to={userProfileLink(creator)}
              className="flex items-center group/user hover:bg-neutral-800/30 rounded-xl px-3 py-2.5 transition-all duration-200 hover:scale-[1.02]"
              style={{ textDecoration: 'none' }}
            >
              <div className="flex items-center gap-3 flex-1">
                <span ref={creatorRef}>
                  <Avatar user={creator} size={36} border={true} shadow={true} alt={creator?.fullName || creator?.username || 'Creator avatar'} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-neutral-400 text-xs font-medium">Creator</div>
                  <div className="text-neutral-100 text-sm font-semibold truncate group-hover/user:text-primary transition-colors">
                    {creator?.fullName || creator?.username || 'Anonymous'}
                  </div>
                </div>
              </div>
            </Link>
            
            {/* Performer */}
            {performer && (
              <Link
                to={userProfileLink(performer)}
                className="flex items-center group/user hover:bg-neutral-800/30 rounded-xl px-3 py-2.5 transition-all duration-200 hover:scale-[1.02]"
                style={{ textDecoration: 'none' }}
              >
                <div className="flex items-center gap-3 flex-1">
                  <span ref={performerRef}>
                    <Avatar user={performer} size={36} border={true} shadow={true} alt={performer?.fullName || performer?.username || 'Performer avatar'} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-neutral-400 text-xs font-medium">Performer</div>
                    <div className="text-neutral-100 text-sm font-semibold truncate group-hover/user:text-primary transition-colors">
                      {performer?.fullName || performer?.username || 'Anonymous'}
                    </div>
                  </div>
                </div>
              </Link>
            )}
            
            {/* Assigned Switch */}
            {assignedSwitch && (
              <Link
                to={userProfileLink(assignedSwitch)}
                className="flex items-center group/user hover:bg-neutral-800/30 rounded-xl px-3 py-2.5 transition-all duration-200 hover:scale-[1.02]"
                style={{ textDecoration: 'none' }}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Avatar user={assignedSwitch} size={36} border={true} shadow={true} alt={assignedSwitch?.fullName || assignedSwitch?.username || 'Switch avatar'} />
                  <div className="flex-1 min-w-0">
                    <div className="text-neutral-400 text-xs font-medium">Switch</div>
                    <div className="text-neutral-100 text-sm font-semibold truncate group-hover/user:text-primary transition-colors">
                      {assignedSwitch?.fullName || assignedSwitch?.username || 'Anonymous'}
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </div>

          {/* Expandable details with better UX */}
          {isLong && (
            <div className="border-t border-neutral-700/30 pt-4">
              <button
                className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/10 to-primary-dark/10 border border-primary/20 text-primary rounded-xl font-medium text-sm hover:from-primary/20 hover:to-primary-dark/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 group"
                onClick={() => setExpanded(e => !e)}
                aria-expanded={expanded}
              >
                <span className="flex items-center gap-2">
                  {expanded ? <ChevronUpIcon className="w-4 h-4 group-hover:scale-110 transition-transform" /> : <ChevronDownIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                  {expanded ? 'Hide Full Description' : 'Show Full Description'}
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded ? 'max-h-96 py-4' : 'max-h-0 py-0'}`}
                aria-hidden={!expanded}
              >
                <div className="text-neutral-100 text-sm leading-relaxed bg-neutral-800/30 rounded-xl p-4 border border-neutral-700/30">
                  {description}
                </div>
              </div>
            </div>
          )}

          {/* Metadata with better organization */}
          <div className="space-y-2">
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
        </div>

        {/* Actions with improved layout */}
        {(onSubmitProof || onReviewProof || onGrade || onChickenOut || actions) && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-700/30 mt-6">
            {onSubmitProof && (
              <button 
                className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg px-4 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:from-primary-dark hover:to-primary transition-all duration-200 hover:scale-105 active:scale-95" 
                onClick={onSubmitProof}
              >
                <CheckCircleIcon className="w-4 h-4" />
                Submit Proof
              </button>
            )}
            {onReviewProof && (
              <button 
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg px-4 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-105 active:scale-95" 
                onClick={onReviewProof}
              >
                <EyeIcon className="w-4 h-4" />
                Review Proof
              </button>
            )}
            {onGrade && (
              <button 
                className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg px-4 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:from-green-600 hover:to-green-700 transition-all duration-200 hover:scale-105 active:scale-95" 
                onClick={onGrade}
              >
                <StarIcon className="w-4 h-4" />
                Grade
              </button>
            )}
            {onChickenOut && (
              <button 
                className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg px-4 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:from-red-600 hover:to-red-700 transition-all duration-200 hover:scale-105 active:scale-95" 
                onClick={onChickenOut}
              >
                <XMarkIcon className="w-4 h-4" />
                Chicken Out
              </button>
            )}
            {actions}
          </div>
        )}
      </div>
    </div>
  );
});

export default DareCard;
export { StatusBadge }; 