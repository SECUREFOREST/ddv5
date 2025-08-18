import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  FireIcon,
  UserIcon,
  HeartIcon,
  TrophyIcon,
  CheckCircleIcon,
  ChatBubbleLeftIcon,
  PlayIcon,
  ClockIcon,
  EyeIcon,
  FunnelIcon,
  BellIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  BoltIcon,
  StarIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../../context/ToastContext';
import { ListSkeleton } from '../../components/Skeleton';
import { formatRelativeTimeWithTooltip } from '../../utils/dateUtils';
import { useRealtimeActivitySubscription } from '../../utils/realtime';
import { retryApiCall } from '../../utils/retry';
import { ERROR_MESSAGES, API_RESPONSE_TYPES } from '../../constants.jsx';
import { validateApiResponse } from '../../utils/apiValidation';
import { handleApiError } from '../../utils/errorHandler';
import { usePagination, Pagination } from '../../utils/pagination.jsx';
import api from '../../api/axios';

const LAST_SEEN_KEY = 'activityFeedLastSeen';

const ACTIVITY_TYPES = {
  dare_created: {
    label: 'Dare Created',
    icon: FireIcon,
    color: 'from-red-500 to-red-600',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/30'
  },
  dare_accepted: {
    label: 'Dare Accepted',
    icon: CheckCircleIcon,
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/30'
  },
  dare_completed: {
    label: 'Dare Completed',
    icon: TrophyIcon,
    color: 'from-yellow-500 to-yellow-600',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/30'
  },
  dare_graded: {
    label: 'Dare Graded',
    icon: StarIcon,
    color: 'from-purple-500 to-purple-600',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30'
  },
  proof_submitted: {
    label: 'Proof Submitted',
    icon: ShieldCheckIcon,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30'
  },
  comment_added: {
    label: 'Comment Added',
    icon: ChatBubbleLeftIcon,
    color: 'from-indigo-500 to-indigo-600',
    bgColor: 'bg-indigo-500/20',
    borderColor: 'border-indigo-500/30'
  },
  switch_game_created: {
    label: 'Switch Game Created',
    icon: PlayIcon,
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/30'
  },
  switch_game_joined: {
    label: 'Switch Game Joined',
    icon: UserIcon,
    color: 'from-pink-500 to-pink-600',
    bgColor: 'bg-pink-500/20',
    borderColor: 'border-pink-500/30'
  },
  switch_game_completed: {
    label: 'Switch Game Completed',
    icon: BoltIcon,
    color: 'from-orange-500 to-orange-600',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30'
  }
};

const ModernActivityFeed = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastSeen, setLastSeen] = useState(() => {
    const stored = localStorage.getItem(LAST_SEEN_KEY);
    return stored ? new Date(stored) : null;
  });
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  
  // Activate real-time activity updates
  const { subscribeToActivity } = useRealtimeActivitySubscription();

  const fetchActivityFeed = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use retry mechanism for activity feed fetch
      const response = await retryApiCall(() => api.get('/activity-feed?limit=50'));
      
      if (response.data) {
        const responseData = response.data;
        const activities = responseData.activities || responseData;
        const activitiesData = validateApiResponse(activities, API_RESPONSE_TYPES.ACTIVITY_ARRAY);
        setActivities(activitiesData);
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Activity feed loading error:', error);
      const errorMessage = handleApiError(error, 'activity feed');
      showError(errorMessage);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError]);

  useEffect(() => {
    fetchActivityFeed();
  }, [fetchActivityFeed]);

  // Subscribe to real-time activity updates
  useEffect(() => {
    const unsubscribe = subscribeToActivity((newActivity) => {
      // Add new activity to the top of the list
      setActivities(prevActivities => [newActivity, ...prevActivities.slice(0, 49)]); // Keep max 50 items
      showSuccess('New activity received!');
    });

    return () => {
      unsubscribe();
    };
  }, [subscribeToActivity, showSuccess]);

  useEffect(() => {
    // On mount, update last seen to now
    const now = new Date();
    localStorage.setItem(LAST_SEEN_KEY, now.toISOString());
    setLastSeen(now);
  }, []);

  // Filter and sort activities
  const filteredAndSortedActivities = activities
    .filter(activity => {
      if (!search && selectedType === 'all') return true;
      
      const matchesSearch = !search || (
        (activity.user?.fullName?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (activity.user?.username?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (activity.dare?.description?.toLowerCase() || '').includes(search.toLowerCase()) ||
        (activity.type?.toLowerCase() || '').includes(search.toLowerCase())
      );
      
      const matchesType = selectedType === 'all' || activity.type === selectedType;
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'user') {
        const userA = a.user?.fullName || a.user?.username || '';
        const userB = b.user?.fullName || b.user?.username || '';
        return userA.localeCompare(userB);
      }
      return 0;
    });

  // Add pagination
  const { currentPage, setCurrentPage, itemsPerPage, totalPages, paginatedData, setTotalItems } = usePagination(1, 20);
  
  // Get paginated items
  const paginatedItems = paginatedData(filteredAndSortedActivities || []);
  
  // Update total items when filtered activities change
  React.useEffect(() => {
    setTotalItems(Array.isArray(filteredAndSortedActivities) ? filteredAndSortedActivities.length : 0);
  }, [filteredAndSortedActivities, setTotalItems]);

  const renderActivityText = (activity) => {
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
  };

  const getActivityTypeInfo = (type) => {
    return ACTIVITY_TYPES[type] || {
      label: 'Activity',
      icon: SparklesIcon,
      color: 'from-neutral-500 to-neutral-600',
      bgColor: 'bg-neutral-500/20',
      borderColor: 'border-neutral-500/30'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="space-y-8">
            <ListSkeleton count={10} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Header */}
      <div className="bg-neutral-800/50 backdrop-blur-sm border-b border-neutral-700/50 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Activity Feed</h1>
                <p className="text-neutral-400 text-sm">Community activity and updates</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium">
                <div className="flex items-center space-x-1">
                  <BellIcon className="w-4 h-4" />
                  <span>Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-2xl flex items-center justify-center">
              <ChartBarIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white">Activity Feed</h2>
              <p className="text-xl sm:text-2xl text-neutral-300 mt-2">
                See what's happening in the community
              </p>
            </div>
          </div>
          <p className="text-neutral-400 text-lg max-w-3xl mx-auto">
            Stay updated with the latest dares, challenges, and community interactions
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Search Bar */}
            <div className="lg:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-neutral-300 mb-2">
                Search Activities
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  id="search"
                  type="text"
                  placeholder="Search by user, dare description, or activity type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                />
              </div>
            </div>

            {/* Activity Type Filter */}
            <div>
              <label htmlFor="type-filter" className="block text-sm font-medium text-neutral-300 mb-2">
                Activity Type
              </label>
              <select
                id="type-filter"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
              >
                <option value="all">All Activities</option>
                {Object.entries(ACTIVITY_TYPES).map(([type, info]) => (
                  <option key={type} value={type}>{info.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sort Options */}
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-neutral-300">Sort by:</label>
              <div className="flex space-x-2">
                {[
                  { value: 'recent', label: 'Most Recent', icon: ClockIcon },
                  { value: 'oldest', label: 'Oldest First', icon: ClockIcon },
                  { value: 'user', label: 'User Name', icon: UserIcon }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      sortBy === option.value
                        ? 'bg-primary text-white shadow-lg'
                        : 'bg-neutral-700/50 text-neutral-300 hover:bg-neutral-600/50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-sm text-neutral-400">
              {filteredAndSortedActivities.length} activities found
            </div>
          </div>
        </div>

        {/* Activity List */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl">
          {filteredAndSortedActivities.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-neutral-700/50 backdrop-blur-sm rounded-xl p-12 border border-neutral-600/30">
                <div className="text-neutral-400 text-xl mb-4">No activities found</div>
                <p className="text-neutral-500 text-sm">
                  {search || selectedType !== 'all' 
                    ? 'Try adjusting your search terms or filters.' 
                    : 'No recent activity in the community.'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedItems.map((activity, index) => {
                const typeInfo = getActivityTypeInfo(activity.type);
                const TypeIcon = typeInfo.icon;
                
                return (
                  <div 
                    key={activity._id || index} 
                    className="bg-neutral-700/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-600/30 hover:bg-neutral-700/70 transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <div className="flex items-start gap-4">
                      {/* Activity Type Icon */}
                      <div className={`p-3 rounded-xl ${typeInfo.bgColor} border ${typeInfo.borderColor}`}>
                        <TypeIcon className={`w-6 h-6 bg-gradient-to-r ${typeInfo.color} bg-clip-text text-transparent`} />
                      </div>
                      
                      {/* Activity Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="font-semibold text-white text-lg">
                                {activity.user?.fullName || activity.user?.username || 'Unknown User'}
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${typeInfo.color} text-white`}>
                                {typeInfo.label}
                              </span>
                            </div>
                            <div className="text-neutral-300 mb-3">
                              {renderActivityText(activity)}
                            </div>
                            {activity.dare?.description && (
                              <div className="bg-neutral-600/30 rounded-lg p-3 mb-3">
                                <p className="text-sm text-neutral-200 italic">
                                  "{activity.dare.description}"
                                </p>
                              </div>
                            )}
                            {activity.createdAt && (
                              <div className="text-xs text-neutral-400">
                                <span
                                  className="cursor-help hover:text-neutral-300 transition-colors"
                                  title={formatRelativeTimeWithTooltip(activity.createdAt).tooltip}
                                >
                                  {formatRelativeTimeWithTooltip(activity.createdAt).display}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            {activity.dare && (
                              <Link
                                to={`/modern/dares/${activity.dare._id}`}
                                className="inline-flex items-center gap-2 px-3 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary/30 transition-all duration-200 text-sm font-medium"
                              >
                                <EyeIcon className="w-4 h-4" />
                                View Dare
                              </Link>
                            )}
                            {activity.user && (
                              <Link
                                to={`/modern/profile/${activity.user._id || activity.user.username}`}
                                className="inline-flex items-center gap-2 px-3 py-2 bg-neutral-600/50 text-neutral-300 border border-neutral-500/30 rounded-lg hover:bg-neutral-500/50 transition-all duration-200 text-sm font-medium"
                              >
                                <UserIcon className="w-4 h-4" />
                                View Profile
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>

        {/* Last Updated */}
        {lastSeen && (
          <div className="text-center text-neutral-500 text-sm mt-8">
            <div className="flex items-center justify-center gap-2">
              <ClockIcon className="w-4 h-4" />
              Last updated: {formatRelativeTimeWithTooltip(lastSeen).display}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernActivityFeed; 