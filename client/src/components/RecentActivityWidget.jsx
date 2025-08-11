import React, { useState, useEffect, useCallback } from 'react';
import { formatRelativeTime } from '../utils/dateUtils';
import { ChatBubbleLeftIcon, CheckCircleIcon, StarIcon, EllipsisHorizontalIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import api from '../api/axios';
import { ERROR_MESSAGES, API_RESPONSE_TYPES } from '../constants.jsx';
import { validateApiResponse } from '../utils/apiValidation';
import { handleApiError } from '../utils/errorHandler';
import { usePagination, Pagination } from '../utils/pagination';

function timeAgo(date) {
  return formatRelativeTime(date);
}

const ICONS = {
  // Dare activities
  dare_created: <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />,
  dare_completed: <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />,
  dare_assigned: <CheckCircleIcon className="w-4 h-4 text-blue-500 mr-2" />,
  dare_accepted: <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />,
  dare_rejected: <CheckCircleIcon className="w-4 h-4 text-red-500 mr-2" />,
  dare_claimed: <CheckCircleIcon className="w-4 h-4 text-purple-500 mr-2" />,
  dare_performed: <CheckCircleIcon className="w-4 h-4 text-orange-500 mr-2" />,
  
  // Grade activities
  grade_given: <StarIcon className="w-4 h-4 text-yellow-400 mr-2" />,
  grade_received: <StarIcon className="w-4 h-4 text-yellow-400 mr-2" />,
  
  // Comment activities
  comment_added: <ChatBubbleLeftIcon className="w-4 h-4 text-blue-400 mr-2" />,
  comment_received: <ChatBubbleLeftIcon className="w-4 h-4 text-blue-400 mr-2" />,
  
  // Switch game activities
  switch_game_joined: <CheckCircleIcon className="w-4 h-4 text-purple-500 mr-2" />,
  switch_game_created: <CheckCircleIcon className="w-4 h-4 text-purple-500 mr-2" />,
  switch_game_completed: <CheckCircleIcon className="w-4 h-4 text-purple-500 mr-2" />,
  switch_game_started: <CheckCircleIcon className="w-4 h-4 text-purple-500 mr-2" />,
  
  // Proof activities
  proof_submitted: <CheckCircleIcon className="w-4 h-4 text-orange-500 mr-2" />,
  proof_approved: <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />,
  proof_rejected: <CheckCircleIcon className="w-4 h-4 text-red-500 mr-2" />,
  
  // Offer activities
  offer_submitted: <CheckCircleIcon className="w-4 h-4 text-indigo-500 mr-2" />,
  offer_accepted: <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />,
  offer_rejected: <CheckCircleIcon className="w-4 h-4 text-red-500 mr-2" />,
  
  // Profile activities
  profile_updated: <CheckCircleIcon className="w-4 h-4 text-blue-500 mr-2" />,
  avatar_uploaded: <CheckCircleIcon className="w-4 h-4 text-blue-500 mr-2" />,
  
  // Login activities
  login: <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2" />,
  logout: <CheckCircleIcon className="w-4 h-4 text-gray-500 mr-2" />,
  
  default: <EllipsisHorizontalIcon className="w-4 h-4 text-gray-400 mr-2" />,
};

// Comprehensive activity message generator
function getActivityMessage(activity, currentUserId) {
  const isCurrentUser = activity.user?._id === currentUserId;
  const actorName = isCurrentUser ? 'You' : (activity.user?.fullName || activity.user?.username || 'Someone');
  

  
  switch (activity.type) {
    case 'dare_created':
      return `${actorName} created a new dare`;
    case 'dare_completed':
      return `${actorName} completed a dare`;
    case 'dare_assigned':
      return `${actorName} was assigned a dare`;
    case 'dare_accepted':
      return `${actorName} accepted a dare`;
    case 'dare_rejected':
      return `${actorName} rejected a dare`;
    case 'dare_claimed':
      return `${actorName} claimed a dare`;
    case 'dare_performed':
      return `${actorName} performed a dare`;
    case 'grade_given':
      return `${actorName} received a grade: ${activity.details?.grade || 'N/A'}`;
    case 'grade_received':
      return `${actorName} received a grade: ${activity.details?.grade || 'N/A'}`;
    case 'comment_added':
      return `${actorName} commented on a dare`;
    case 'comment_received':
      return `${actorName} received a comment`;
    case 'switch_game_joined':
      return `${actorName} joined a switch game`;
    case 'switch_game_created':
      return `${actorName} created a switch game`;
    case 'switch_game_completed':
      return `${actorName} completed a switch game`;
    case 'switch_game_started':
      return `${actorName} started a switch game`;
    case 'proof_submitted':
      return `${actorName} submitted proof for a dare`;
    case 'proof_approved':
      return `${actorName} had proof approved`;
    case 'proof_rejected':
      return `${actorName} had proof rejected`;
    case 'offer_submitted':
      return `${actorName} submitted an offer`;
    case 'offer_accepted':
      return `${actorName} had an offer accepted`;
    case 'offer_rejected':
      return `${actorName} had an offer rejected`;
    case 'profile_updated':
      return `${actorName} updated their profile`;
    case 'avatar_uploaded':
      return `${actorName} uploaded a new avatar`;
    case 'login':
      return `${actorName} logged in`;
    case 'logout':
      return `${actorName} logged out`;
    default:
      return `${actorName} performed an action`;
  }
}

export default function RecentActivityWidget({ userId, activities = [], loading = false, title = 'Recent Activity', onRefresh }) {
  const [localActivities, setLocalActivities] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [totalActivities, setTotalActivities] = useState(0);

  // Initialize pagination
  const {
    currentPage,
    pageSize,
    totalPages,
    hasNextPage,
    hasPrevPage,
    setCurrentPage,
    setPageSize,
    setTotalItems,
    goToPage,
    nextPage,
    prevPage
  } = usePagination(1, 10, {
    serverSide: true,
    onPageChange: (page) => {
      if (userId) {
        fetchActivities(page, pageSize);
      }
    },
    onPageSizeChange: (newPageSize) => {
      if (userId) {
        fetchActivities(1, newPageSize);
      }
    }
  });

  // Update pagination total when activities change
  useEffect(() => {
    if (totalActivities > 0) {
      setTotalItems(totalActivities);
    }
  }, [totalActivities, setTotalItems]);

  // Fetch activities if userId is provided
  const fetchActivities = useCallback(async (page = 1, limit = 10) => {
    if (!userId) return;
    
    try {
      setLocalLoading(true);
      setError(null);
      
      // Use the activity feed endpoint with pagination
      const response = await api.get('/activity-feed', {
        params: {
          page,
          limit
        }
      });
      
      if (response.data) {
        // Handle new response format with pagination data
        let activitiesData, totalCount;
        
        if (response.data.activities && response.data.pagination) {
          // New format with pagination
          activitiesData = response.data.activities;
          totalCount = response.data.pagination.total;
        } else {
          // Fallback to old format
          activitiesData = response.data;
          totalCount = response.headers['x-total-count'] || activitiesData.length;
        }
        
        setLocalActivities(activitiesData);
        setTotalActivities(totalCount);
      } else {
        throw new Error('No data received from server');
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      const errorMessage = handleApiError(error, 'recent activities');
      setError(errorMessage);
      setLocalActivities([]);
    } finally {
      setLocalLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchActivities(currentPage, pageSize);
    } else if (activities.length > 0) {
      setLocalActivities(activities);
      setTotalActivities(activities.length);
    }
  }, [userId, currentPage, pageSize, fetchActivities]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    } else if (userId) {
      await fetchActivities(currentPage, pageSize);
    }
    setRefreshing(false);
  }, [onRefresh, userId, currentPage, pageSize, fetchActivities]);

  const displayActivities = userId ? localActivities : activities;
  const displayLoading = userId ? localLoading : loading;
  const showPagination = userId && totalActivities > pageSize;

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
                <div className="w-4 h-4 bg-neutral-700/60 rounded mr-2"></div>
                <div className="flex-1">
                  <div className="h-4 bg-neutral-700/60 rounded mb-1"></div>
                  <div className="h-3 bg-neutral-600/40 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : displayActivities.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-neutral-700/90 rounded-full flex items-center justify-center mx-auto mb-4 border border-neutral-600/30">
            <EllipsisHorizontalIcon className="w-6 h-6 text-white/50" />
          </div>
          <p className="text-white/70 text-sm">No recent activity</p>
          <p className="text-white/50 text-xs mt-1">Your activity will appear here</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {displayActivities.map((activity, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-neutral-700/90 hover:bg-neutral-600/90 transition-colors border border-neutral-600/30" style={{backgroundColor: 'rgb(64 64 64 / 0.9)'}}>
                {ICONS[activity.type] || ICONS.default}
                <div className="flex-1">
                  <div className="text-sm text-white">{getActivityMessage(activity, userId)}</div>
                  <div className="text-xs text-white/60">
                    <time dateTime={activity.createdAt}>{timeAgo(activity.createdAt)}</time>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {showPagination && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                totalItems={totalActivities}
                className="text-white"
              />
            </div>
          )}
        </>
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