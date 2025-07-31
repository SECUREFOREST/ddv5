import React, { useState, useEffect } from 'react';
import { formatRelativeTime } from '../utils/dateUtils';
import { ChatBubbleLeftIcon, CheckCircleIcon, StarIcon, EllipsisHorizontalIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import api from '../api/axios';

function timeAgo(date) {
  return formatRelativeTime(date);
}

const ICONS = {
  comment: <ChatBubbleLeftIcon className="w-4 h-4 text-blue-400 mr-2" />,
  dare: <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />,
  grade: <StarIcon className="w-4 h-4 text-yellow-400 mr-2" />,
  default: <EllipsisHorizontalIcon className="w-4 h-4 text-gray-400 mr-2" />,
};

// Comprehensive activity message generator
function getActivityMessage(a) {
  const actorName = a.actor?.fullName || a.actor?.username || 'Someone';
  switch (a.type) {
    case 'dare_created':
      return `${actorName} created a new dare.`;
    case 'grade_given':
      return `${actorName} graded a dare: ${a.details?.grade ?? ''}`;
    case 'comment_added':
      return `${actorName} commented on a dare.`;
    case 'dare_completed':
      return `${actorName} completed a dare.`;
    case 'switch_game_joined':
      return `${actorName} joined a switch game.`;
    case 'switch_game_created':
      return `${actorName} created a switch game.`;
    default:
      return a.message || a.type || 'Activity';
  }
}

export default function RecentActivityWidget({ userId, activities = [], loading = false, title = 'Recent Activity', onRefresh }) {
  const [localActivities, setLocalActivities] = useState(activities);
  const [localLoading, setLocalLoading] = useState(loading);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch activities if userId is provided
  const fetchActivities = async () => {
    if (!userId) return;
    
    try {
      setLocalLoading(true);
      setError(null);
      const response = await api.get(`/activity-feed?userId=${userId}&limit=10`);
      setLocalActivities(response.data || []);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
      setError('Failed to load recent activity');
      setLocalActivities([]);
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchActivities();
    } else if (activities.length > 0) {
      setLocalActivities(activities);
    }
  }, [userId]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    } else if (userId) {
      await fetchActivities();
    }
    setRefreshing(false);
  };

  const displayActivities = userId ? localActivities : activities;
  const displayLoading = userId ? localLoading : loading;

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/30 rounded-lg p-3">
          {error}
        </div>
      )}
      
      {displayLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-white/20 rounded mr-2"></div>
                <div className="flex-1">
                  <div className="h-4 bg-white/20 rounded mb-1"></div>
                  <div className="h-3 bg-white/10 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : displayActivities.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <EllipsisHorizontalIcon className="w-6 h-6 text-white/50" />
          </div>
          <p className="text-white/70 text-sm">No recent activity</p>
          <p className="text-white/50 text-xs mt-1">Your activity will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayActivities.map((activity, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
              {ICONS[activity.type] || ICONS.default}
              <div className="flex-1">
                <div className="text-sm text-white">{getActivityMessage(activity)}</div>
                <div className="text-xs text-white/60">
                  <time dateTime={activity.createdAt}>{timeAgo(activity.createdAt)}</time>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {(userId || onRefresh) && (
        <div className="flex justify-center pt-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="text-sm">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      )}
    </div>
  );
} 