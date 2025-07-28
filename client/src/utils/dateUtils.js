// Utility functions for consistent date formatting across the application

/**
 * Format a date as a friendly relative time (e.g., "2 minutes ago")
 * @param {Date|string} date - The date to format
 * @param {boolean} showSeconds - Whether to show seconds for very recent times
 * @returns {string} - Friendly relative time string
 */
export function formatRelativeTime(date, showSeconds = false) {
  const now = new Date();
  const targetDate = new Date(date);
  const diffMs = now - targetDate;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) {
    return showSeconds ? `${diffSeconds} second${diffSeconds !== 1 ? 's' : ''} ago` : 'Just now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  }
  if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  }
  if (diffWeeks < 4) {
    return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} ago`;
  }
  if (diffMonths < 12) {
    return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ago`;
  }
  return `${diffYears} year${diffYears !== 1 ? 's' : ''} ago`;
}

/**
 * Format a date as a friendly relative time with tooltip for full timestamp
 * @param {Date|string} date - The date to format
 * @param {boolean} showSeconds - Whether to show seconds for very recent times
 * @returns {object} - Object with display text and full timestamp
 */
export function formatRelativeTimeWithTooltip(date, showSeconds = false) {
  const fullTimestamp = new Date(date).toLocaleString();
  const relativeTime = formatRelativeTime(date, showSeconds);
  
  return {
    display: relativeTime,
    tooltip: fullTimestamp,
    fullTimestamp
  };
}

/**
 * Format duration in a friendly way (e.g., "2h 30m 15s")
 * @param {number} milliseconds - Duration in milliseconds
 * @returns {string} - Formatted duration
 */
export function formatDuration(milliseconds) {
  if (milliseconds <= 0) return '0s';
  
  const seconds = Math.floor(milliseconds / 1000) % 60;
  const minutes = Math.floor(milliseconds / 60000) % 60;
  const hours = Math.floor(milliseconds / 3600000) % 24;
  const days = Math.floor(milliseconds / 86400000);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);
  
  return parts.join(' ');
}

/**
 * Check if a date is recent (within last 24 hours)
 * @param {Date|string} date - The date to check
 * @returns {boolean} - True if date is within last 24 hours
 */
export function isRecent(date) {
  const now = new Date();
  const targetDate = new Date(date);
  const diffHours = (now - targetDate) / (1000 * 60 * 60);
  return diffHours < 24;
} 