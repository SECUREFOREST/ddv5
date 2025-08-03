// Centralized constants for difficulties, statuses, and types

import { SparklesIcon, FireIcon, EyeDropperIcon, ExclamationTriangleIcon, RocketLaunchIcon } from '@heroicons/react/24/solid';

// Centralized difficulty icons configuration
export const DIFFICULTY_ICONS = {
  titillating: <SparklesIcon className="w-10 h-10 text-pink-400" aria-hidden="true" />,
  arousing: <FireIcon className="w-10 h-10 text-purple-500" aria-hidden="true" />,
  explicit: <EyeDropperIcon className="w-10 h-10 text-red-500" aria-hidden="true" />,
  edgy: <ExclamationTriangleIcon className="w-10 h-10 text-yellow-400" aria-hidden="true" />,
  hardcore: <RocketLaunchIcon className="w-10 h-10 text-black dark:text-white" aria-hidden="true" />,
};



export const DIFFICULTY_OPTIONS = [
  { 
    value: 'titillating', 
    label: 'Titillating', 
    desc: 'Fun, flirty, and easy. For beginners or light play.',
    longDesc: 'Perfect for those new to the scene. Light teasing, playful challenges, and gentle exploration. Think flirty photos, mild dares, or simple tasks that build confidence.',
    examples: 'Send a flirty selfie, wear something slightly revealing, or perform a simple dance'
  },
  { 
    value: 'arousing', 
    label: 'Arousing', 
    desc: 'A bit more daring, but still approachable.',
    longDesc: 'A step up from titillating. More sensual and intimate, but still within comfortable boundaries. Good for those with some experience who want to push their limits gently.',
    examples: 'Strip tease, sensual massage, or intimate photography'
  },
  { 
    value: 'explicit', 
    label: 'Explicit', 
    desc: 'Sexually explicit or more intense.',
    longDesc: 'Directly sexual content and activities. Explicit language, nudity, and sexual acts. For experienced users who are comfortable with adult content.',
    examples: 'Nude photos, sexual acts, or explicit roleplay scenarios'
  },
  { 
    value: 'edgy', 
    label: 'Edgy', 
    desc: 'Pushes boundaries, not for the faint of heart.',
    longDesc: 'Advanced content that may involve kink, BDSM elements, or taboo scenarios. Requires clear consent and understanding of limits. Not for everyone.',
    examples: 'BDSM activities, taboo scenarios, or extreme roleplay'
  },
  { 
    value: 'hardcore', 
    label: 'Hardcore', 
    desc: 'Extreme, risky, or very advanced.',
    longDesc: 'The most intense level. May involve extreme kinks, public elements, or very taboo content. Only for experienced users with explicit consent and understanding of risks.',
    examples: 'Extreme BDSM, public exposure, or very taboo scenarios'
  },
];

export const PRIVACY_OPTIONS = [
  { 
    value: 'delete_after_view', 
    label: 'Delete after viewing', 
    desc: 'Content is automatically deleted as soon as the recipient views it. Maximum privacy.',
    icon: '👁️'
  },
  { 
    value: 'delete_after_30_days', 
    label: 'Delete after 30 days', 
    desc: 'Content expires and is deleted 30 days after creation, whether viewed or not.',
    icon: '⏰'
  },
  { 
    value: 'never_delete', 
    label: 'Never delete (not recommended)', 
    desc: 'Content is kept permanently. Will be deleted if you don\'t log in for 2 months.',
    icon: '⚠️'
  },
];

export const DARE_TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'submission', label: 'Submission' },
  { value: 'domination', label: 'Domination' },
  { value: 'switch', label: 'Switch' },
];

export const ROLE_OPTIONS = [
  { value: 'dominant', label: 'Dominant' },
  { value: 'submissive', label: 'Submissive' },
  { value: 'switch', label: 'Switch' },
];

export const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'forfeited', label: 'Forfeited' },
  { value: 'expired', label: 'Expired' },
  { value: 'waiting_for_participant', label: 'Waiting For Participant' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'graded', label: 'Graded' },
  { value: 'approved', label: 'Approved' },
  { value: 'soliciting', label: 'Awaiting Approval' },
  { value: 'user_deleted', label: 'User deleted' },
];

export const TYPE_OPTIONS = [
  { value: 'text', label: 'Text' },
  { value: 'photo', label: 'Photo' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
];

// Comprehensive status mapping with consistent styling
export const STATUS_MAP = {
  waiting_for_participant: { 
    label: 'Waiting', 
    color: 'bg-blue-600/20 border border-blue-500/50 text-blue-300',
    icon: '⏳'
  },
  pending: { 
    label: 'Pending', 
    color: 'bg-yellow-600/20 border border-yellow-500/50 text-yellow-300',
    icon: '⏳'
  },
  soliciting: { 
    label: 'Soliciting', 
    color: 'bg-purple-600/20 border border-purple-500/50 text-purple-300',
    icon: '📝'
  },
  in_progress: { 
    label: 'In Progress', 
    color: 'bg-green-600/20 border border-green-500/50 text-green-300',
    icon: '▶️'
  },
  completed: { 
    label: 'Completed', 
    color: 'bg-emerald-600/20 border border-emerald-500/50 text-emerald-300',
    icon: '✅'
  },
  rejected: { 
    label: 'Rejected', 
    color: 'bg-red-600/20 border border-red-500/50 text-red-300',
    icon: '❌'
  },
  graded: { 
    label: 'Graded', 
    color: 'bg-indigo-600/20 border border-indigo-500/50 text-indigo-300',
    icon: '📊'
  },
  approved: { 
    label: 'Approved', 
    color: 'bg-green-600/20 border border-green-500/50 text-green-300',
    icon: '✅'
  },
  forfeited: { 
    label: 'Forfeited', 
    color: 'bg-red-600/20 border border-red-500/50 text-red-300',
    icon: '🏳️'
  },
  expired: { 
    label: 'Expired', 
    color: 'bg-neutral-600/20 border border-neutral-500/50 text-neutral-300',
    icon: '⏰'
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-neutral-600/20 border border-neutral-500/50 text-neutral-300',
    icon: '🚫'
  },
  user_deleted: { 
    label: 'User Deleted', 
    color: 'bg-neutral-600/20 border border-neutral-500/50 text-neutral-300',
    icon: '🗑️'
  },
};

// API Response types for better type safety
export const API_RESPONSE_TYPES = {
  DARE: 'dare',
  DARE_ARRAY: 'dare_array',
  SWITCH_GAME: 'switch_game',
  SWITCH_GAME_ARRAY: 'switch_game_array',
  USER: 'user',
  USER_ARRAY: 'user_array',
  STATS: 'stats',
  ACTIVITY: 'activity',
  ACTIVITY_ARRAY: 'activity_array'
};

// Pagination constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MIN_PAGE_SIZE: 5
};

// Real-time update intervals (in milliseconds)
export const REALTIME_INTERVALS = {
  PUBLIC_DARES: 30000, // 30 seconds
  ACTIVITY_FEED: 60000, // 1 minute
  NOTIFICATIONS: 15000, // 15 seconds
  DASHBOARD_STATS: 120000 // 2 minutes
};

// Error messages for consistent user feedback
export const ERROR_MESSAGES = {
  AUTHENTICATION_FAILED: 'Authentication failed. Please log in again.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  NOT_FOUND: 'The requested resource was not found.',
  RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
  TIMEOUT: 'Request timed out. Please try again.'
};

// Success messages for consistent user feedback
export const SUCCESS_MESSAGES = {
  DARE_CREATED: 'Dare created successfully!',
  DARE_UPDATED: 'Dare updated successfully!',
  DARE_COMPLETED: 'Dare completed successfully!',
  SWITCH_GAME_CREATED: 'Switch game created successfully!',
  SWITCH_GAME_JOINED: 'Successfully joined switch game!',
  PROOF_SUBMITTED: 'Proof submitted successfully!',
  SETTINGS_UPDATED: 'Settings updated successfully!',
  DATA_LOADED: 'Data loaded successfully!'
};

// Add more as needed (e.g., DARE_TYPE_OPTIONS, ROLE_OPTIONS, etc.) 