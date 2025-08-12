// Centralized constants for difficulties, statuses, and types

import { SparklesIcon, FireIcon, EyeDropperIcon, ExclamationTriangleIcon, RocketLaunchIcon } from '@heroicons/react/24/solid';

// Centralized difficulty icons configuration
export const DIFFICULTY_ICONS = {
  titillating: <SparklesIcon className="w-10 h-10 text-pink-400 flex-shrink-0" style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px' }} aria-hidden="true" />,
  arousing: <FireIcon className="w-10 h-10 text-purple-500 flex-shrink-0" style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px' }} aria-hidden="true" />,
  explicit: <EyeDropperIcon className="w-10 h-10 text-red-500 flex-shrink-0" style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px' }} aria-hidden="true" />,
  edgy: <ExclamationTriangleIcon className="w-10 h-10 text-yellow-400 flex-shrink-0" style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px' }} aria-hidden="true" />,
  hardcore: <RocketLaunchIcon className="w-10 h-10 text-black dark:text-white flex-shrink-0" style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px' }} aria-hidden="true" />,
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
    longDesc: 'Directly sexual content and activities. Explicit language, nudity, and sexual dares. For experienced users who are comfortable with adult content.',
    examples: 'Nude photos, sexual dares, or explicit roleplay scenarios'
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

  { value: 'completed', label: 'Completed' },
  { value: 'chickened_out', label: 'Chickened Out' }, // 'chickened_out' is the database status value

  { value: 'waiting_for_participant', label: 'Waiting For Participant' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'graded', label: 'Graded' },
  { value: 'approved', label: 'Approved' },
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
  chickened_out: { // 'chickened_out' is the database status value
    label: 'Chickened Out', 
    color: 'bg-red-600/20 border border-red-500/50 text-red-300',
    icon: '🏳️'
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
  // Network errors
  NETWORK_ERROR: 'Network error. Please check your internet connection and try again.',
  SERVER_ERROR: 'Server error. Our team has been notified. Please try again in a few minutes.',
  AUTHENTICATION_FAILED: 'Your session has expired. Please log in again to continue.',
  PERMISSION_DENIED: 'You do not have permission to perform this action. Please contact support if you believe this is an error.',
  NOT_FOUND: 'The requested resource was not found. It may have been moved or deleted.',
  RATE_LIMITED: 'Too many requests. Please wait a moment before trying again.',
  TIMEOUT: 'Request timed out. Please check your connection and try again.',
  VALIDATION_ERROR: 'Please check your input and try again. Make sure all required fields are filled correctly.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
  
  // Specific error messages
  DARE_NOT_FOUND: 'This dare could not be found. It may have been deleted or is no longer available.',
  USER_NOT_FOUND: 'User not found. The profile may have been deleted or is private.',
  ASSOCIATES_LOAD_FAILED: 'Failed to load associates. Please try again.',
  ONGOING_DARES_LOAD_FAILED: 'Failed to load active dares. Please try again.',
  COMPLETED_DARES_LOAD_FAILED: 'Failed to load completed dares. Please try again.',
  SWITCH_GAMES_LOAD_FAILED: 'Failed to load switch games. Please try again.',
  PUBLIC_DARES_LOAD_FAILED: 'Failed to load public dares. Please try again.',
  PUBLIC_SWITCH_GAMES_LOAD_FAILED: 'Failed to load public switch games. Please try again.',
  DASHBOARD_LOAD_FAILED: 'Failed to load dashboard data. Please try again.',
  DARE_LOAD_FAILED: 'Failed to load dare. Please try again.',
  DARE_DETAILS_LOAD_FAILED: 'Failed to load dare details. Please try again.',
  SWITCH_GAME_DETAILS_LOAD_FAILED: 'Failed to load switch game details. Please try again.',
  PROFILE_LOAD_FAILED: 'Failed to load profile. Please try again.',
  ACTIVITY_LOAD_FAILED: 'Failed to load activity. Please try again.',
  ACTIVITY_FEED_LOAD_FAILED: 'Failed to load activity feed. Please try again.',
  NOTIFICATIONS_LOAD_FAILED: 'Failed to load notifications. Please try again.',
  LEADERBOARD_LOAD_FAILED: 'Failed to load leaderboard. Please try again.',
  BLOCKED_USERS_LOAD_FAILED: 'Failed to load blocked users information. Please try again.',
  RECENT_ACTIVITY_LOAD_FAILED: 'Failed to load recent activity. Please try again.',
  SLOT_PRIVACY_LOAD_FAILED: 'Failed to load slot or privacy info. Please try again.',
  PUBLIC_CONTENT_LOAD_FAILED: 'Failed to load public dares or switch games. Please try again.',
  USER_PROFILE_LOAD_FAILED: 'Login succeeded but failed to load user profile. Please try again.',
  FILE_TOO_LARGE: 'File is too large. Please choose a smaller file (max 5MB).',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload an image (JPG, PNG, GIF).',
  PASSWORD_TOO_WEAK: 'Password is too weak. Please choose a stronger password.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists. Please use a different email or try logging in.',
  USERNAME_ALREADY_EXISTS: 'This username is already taken. Please choose a different username.',
  INVALID_CREDENTIALS: 'Invalid username or password. Please check your credentials and try again.',
  ACCOUNT_LOCKED: 'Your account has been temporarily locked due to multiple failed login attempts. Please try again later.',
  EMAIL_NOT_VERIFIED: 'Please verify your email address before continuing.',
  TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  TOKEN_INVALID: 'Invalid session. Please log in again.',
  
  // Form validation errors
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_USERNAME: 'Username must be 3-20 characters and contain only letters, numbers, and underscores.',
  PASSWORD_MISMATCH: 'Passwords do not match. Please try again.',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters long.',
  INVALID_DATE: 'Please enter a valid date.',
  INVALID_AGE: 'You must be at least 18 years old to use this service.',
  
  // Upload errors
  UPLOAD_FAILED: 'File upload failed. Please try again.',
  UPLOAD_CANCELLED: 'File upload was cancelled.',
  UPLOAD_PROGRESS: 'Uploading... Please wait.',
  
  // Action errors
  ACTION_FAILED: 'Action failed. Please try again.',
  ACTION_CANCELLED: 'Action was cancelled.',
  ACTION_TIMEOUT: 'Action timed out. Please try again.',
  
  // Real-time errors
  WEBSOCKET_CONNECTION_FAILED: 'Real-time connection failed. Some features may not work properly.',
  WEBSOCKET_DISCONNECTED: 'Connection lost. Attempting to reconnect...',
  
  // Cache errors
  CACHE_ERROR: 'Failed to load cached data. Loading fresh data...',
  
  // Bulk action errors
  BULK_ACTION_FAILED: 'Some items could not be processed. Please try again.',
  BULK_ACTION_PARTIAL: 'Some items were processed successfully, but others failed.',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please wait before trying again.',
  TOO_MANY_REQUESTS: 'Too many requests. Please slow down and try again.',
  
  // Maintenance
  MAINTENANCE_MODE: 'The service is currently under maintenance. Please try again later.',
  SERVICE_UNAVAILABLE: 'Service is temporarily unavailable. Please try again later.'
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

};

// Add more as needed (e.g., DARE_TYPE_OPTIONS, ROLE_OPTIONS, etc.) 