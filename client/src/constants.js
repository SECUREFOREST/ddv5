// Centralized constants for difficulties, statuses, and types

import { SparklesIcon, FireIcon, EyeDropperIcon, ExclamationTriangleIcon, RocketLaunchIcon } from '@heroicons/react/24/solid';

export const DIFFICULTY_OPTIONS = [
  {
    value: 'titillating',
    label: 'Titillating',
    desc: 'Fun, flirty, and easy. For beginners or light play.',
    icon: <SparklesIcon className="w-6 h-6 text-pink-400" aria-hidden="true" />,
  },
  {
    value: 'arousing',
    label: 'Arousing',
    desc: 'A bit more daring, but still approachable.',
    icon: <FireIcon className="w-6 h-6 text-purple-500" aria-hidden="true" />,
  },
  {
    value: 'explicit',
    label: 'Explicit',
    desc: 'Sexually explicit or more intense.',
    icon: <EyeDropperIcon className="w-6 h-6 text-red-500" aria-hidden="true" />,
  },
  {
    value: 'edgy',
    label: 'Edgy',
    desc: 'Pushes boundaries, not for the faint of heart.',
    icon: <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" aria-hidden="true" />,
  },
  {
    value: 'hardcore',
    label: 'Hardcore',
    desc: 'Extreme, risky, or very advanced.',
    icon: <RocketLaunchIcon className="w-6 h-6 text-black dark:text-white" aria-hidden="true" />,
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

// Add more as needed (e.g., DARE_TYPE_OPTIONS, ROLE_OPTIONS, etc.) 