import React, { useEffect, useState } from 'react';
import api from '../api/axios';

import Avatar from '../components/Avatar';
import { Link } from 'react-router-dom';
import { MagnifyingGlassIcon, ChartBarIcon } from '@heroicons/react/24/solid';
import { useToast } from '../components/Toast';
import { ListSkeleton } from '../components/Skeleton';
import { formatRelativeTimeWithTooltip } from '../utils/dateUtils';

const LAST_SEEN_KEY = 'activityFeedLastSeen';

export default function ActivityFeed() {
  const { showSuccess, showError } = useToast();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastSeen, setLastSeen] = useState(() => {
    const stored = localStorage.getItem(LAST_SEEN_KEY);
    return stored ? new Date(stored) : null;
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/activity-feed?limit=30')
      .then(res => {
        setActivities(Array.isArray(res.data) ? res.data : []);
        showSuccess('Activity feed loaded successfully!');
      })
      .catch((error) => {
        showError('Failed to load activity feed. Please try again.');
        console.error('Activity feed loading error:', error);
      })
      .finally(() => setLoading(false));
  }, [showSuccess, showError]);

  useEffect(() => {
    // On mount, update last seen to now
    const now = new Date();
    localStorage.setItem(LAST_SEEN_KEY, now.toISOString());
    setLastSeen(now);
  }, []);

  // Filter activities by search
  const filteredActivities = activities.filter(a => {
    if (!search) return true;
    const user = a.user?.fullName?.toLowerCase() || a.user?.username?.toLowerCase() || '';
    const desc = a.dare?.description?.toLowerCase() || '';
    const type = a.type?.toLowerCase() || '';
    return user.includes(search.toLowerCase()) || desc.includes(search.toLowerCase()) || type.includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <ListSkeleton count={10} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <main id="main-content" tabIndex="-1" role="main" className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-primary to-primary-dark p-4 rounded-2xl shadow-2xl shadow-primary/25">
                <ChartBarIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Activity Feed</h1>
            <p className="text-xl sm:text-2xl text-neutral-300">
              See what's happening in the community
            </p>
          </div>

          {/* Search Bar */}
          <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                placeholder="Search activity, user, or type..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search activity feed"
              />
            </div>
          </div>

          {/* Activity List */}
          <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-neutral-400 text-xl mb-4">No activities found</div>
                <p className="text-neutral-500 text-sm">
                  {search ? 'Try adjusting your search terms.' : 'No recent activity in the community.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredActivities.map((activity, index) => (
                  <div key={activity._id || index} className="flex items-start gap-4 p-4 bg-neutral-800/30 rounded-lg border border-neutral-700/30 hover:bg-neutral-800/50 transition-colors">
                    <Avatar user={activity.user} size={40} />
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-white mb-1">
                            {activity.user?.fullName || activity.user?.username || 'Unknown User'}
                          </div>
                          <div className="text-sm text-neutral-300 mb-2">
                            {renderActivityText(activity)}
                          </div>
                          {activity.createdAt && (
                            <div className="text-xs text-neutral-400">
                              <span
                                className="cursor-help"
                                title={formatRelativeTimeWithTooltip(activity.createdAt).tooltip}
                              >
                                {formatRelativeTimeWithTooltip(activity.createdAt).display}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {activity.dare && (
                          <Link
                            to={`/dares/${activity.dare._id}`}
                            className="text-primary hover:text-primary-light text-sm font-medium transition-colors"
                          >
                            View Dare
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Last Updated */}
          {lastSeen && (
            <div className="text-center text-neutral-500 text-sm">
              Last updated: {formatRelativeTimeWithTooltip(lastSeen).display}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function renderActivityText(activity) {
  const userName = activity.user?.fullName || activity.user?.username || 'Unknown';
  
  switch (activity.type) {
    case 'dare_created':
      return `${userName} created a new dare`;
    case 'dare_accepted':
      return `${userName} accepted a dare`;
    case 'dare_completed':
      return `${userName} completed a dare`;
    case 'dare_graded':
      return `${userName} graded a dare`;
    case 'proof_submitted':
      return `${userName} submitted proof for a dare`;
    case 'comment_added':
      return `${userName} commented on a dare`;
    case 'switch_game_created':
      return `${userName} created a switch game`;
    case 'switch_game_joined':
      return `${userName} joined a switch game`;
    case 'switch_game_completed':
      return `${userName} completed a switch game`;
    default:
      return `${userName} performed an action`;
  }
} 