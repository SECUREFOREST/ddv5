import React from 'react';
import { DIFFICULTY_ICONS } from '../constants.jsx';
import { ShieldCheckIcon, UserIcon } from '@heroicons/react/24/solid';

/**
 * Unified Badge component for all badge types
 * @param {string} type - 'difficulty' | 'status' | 'role'
 * @param {string} value - The badge value (difficulty level, status, role)
 * @param {string} variant - 'default' | 'compact' | 'large'
 * @param {string} className - Additional CSS classes
 */
export default function Badge({ type, value, variant = 'default', className = '' }) {
  const getDifficultyBadgeStyle = (level) => {
    switch (level) {
      case 'titillating':
        return 'bg-pink-600/20 border-pink-600/30 text-pink-400';
      case 'arousing':
        return 'bg-purple-600/20 border-purple-600/30 text-purple-400';
      case 'explicit':
        return 'bg-red-600/20 border-red-600/30 text-red-400';
      case 'edgy':
        return 'bg-yellow-600/20 border-yellow-600/30 text-yellow-400';
      case 'hardcore':
        return 'bg-neutral-600/20 border-neutral-600/30 text-neutral-400';
      default:
        return 'bg-neutral-600/20 border-neutral-600/30 text-neutral-400';
    }
  };

  const getDifficultyLabel = (level) => {
    switch (level) {
      case 'titillating': return 'Titillating';
      case 'arousing': return 'Arousing';
      case 'explicit': return 'Explicit';
      case 'edgy': return 'Edgy';
      case 'hardcore': return 'Hardcore';
      default: return level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Unknown';
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {

      case 'in_progress':
        return 'bg-blue-600/20 border-blue-600/30 text-blue-400';
      case 'completed':
        return 'bg-green-600/20 border-green-600/30 text-green-400';
      case 'cancelled':
        return 'bg-red-600/20 border-red-600/30 text-red-400';

      default:
        return 'bg-neutral-600/20 border-neutral-600/30 text-neutral-400';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {

      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';

      default: return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
    }
  };

  const getRoleBadgeStyle = (roles) => {
    if (roles?.includes('admin')) {
      return 'bg-yellow-900/90 border-yellow-700 text-yellow-200';
    }
    return 'bg-blue-900/90 border-blue-700 text-blue-200';
  };

  const getRoleLabel = (roles) => {
    if (roles?.includes('admin')) {
      return 'Admin';
    }
    return 'User';
  };

  const getRoleIcon = (roles) => {
    if (roles?.includes('admin')) {
      return <ShieldCheckIcon className="w-4 h-4" />;
    }
    return <UserIcon className="w-4 h-4" />;
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return 'px-2 py-1 text-xs';
      case 'large':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  const renderBadge = () => {
    const baseClasses = `inline-flex items-center gap-2 rounded-lg border font-semibold ${getVariantClasses()} ${className}`;

    switch (type) {
      case 'difficulty':
        return (
          <span className={`${baseClasses} ${getDifficultyBadgeStyle(value)}`}>
            {DIFFICULTY_ICONS[value]}
            {getDifficultyLabel(value)}
          </span>
        );

      case 'status':
        return (
          <span className={`${baseClasses} ${getStatusBadgeStyle(value)}`}>
            {getStatusLabel(value)}
          </span>
        );

      case 'role':
        return (
          <span className={`${baseClasses} ${getRoleBadgeStyle(value)}`}>
            {getRoleIcon(value)}
            {getRoleLabel(value)}
          </span>
        );

      default:
        return null;
    }
  };

  return renderBadge();
}

// Convenience exports for specific badge types
export function DifficultyBadge({ level, variant, className }) {
  return <Badge type="difficulty" value={level} variant={variant} className={className} />;
}

export function StatusBadge({ status, variant, className }) {
  return <Badge type="status" value={status} variant={variant} className={className} />;
}

export function RoleBadge({ roles, variant, className }) {
  return <Badge type="role" value={roles} variant={variant} className={className} />;
} 