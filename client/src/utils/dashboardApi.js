import api from '../api/axios';
import { validateApiResponse } from './apiValidation';
import { API_RESPONSE_TYPES } from '../constants.jsx';

/**
 * Fetches all dashboard data in a single API call
 * @param {Object} options - Dashboard fetch options
 * @param {number} options.page - Page number for pagination
 * @param {number} options.limit - Items per page
 * @param {Object} options.dareFilters - Filters for personal dares
 * @param {Object} options.switchGameFilters - Filters for personal switch games
 * @param {Object} options.publicFilters - Filters for public dares
 * @param {Object} options.publicSwitchFilters - Filters for public switch games
 * @returns {Promise<Object>} - Dashboard data with consistent structure
 */
export const fetchDashboardData = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 8,
      dareFilters = {},
      switchGameFilters = {},
      publicFilters = {},
      publicSwitchFilters = {}
    } = options;

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    // Add filters as JSON strings
    if (Object.keys(dareFilters).length > 0) {
      queryParams.append('dareFilters', JSON.stringify(dareFilters));
    }
    if (Object.keys(switchGameFilters).length > 0) {
      queryParams.append('switchGameFilters', JSON.stringify(switchGameFilters));
    }
    if (Object.keys(publicFilters).length > 0) {
      queryParams.append('publicFilters', JSON.stringify(publicFilters));
    }
    if (Object.keys(publicSwitchFilters).length > 0) {
      queryParams.append('publicSwitchFilters', JSON.stringify(publicSwitchFilters));
    }

    const response = await api.get(`/stats/dashboard?${queryParams.toString()}`);
    
    // Validate the response structure
    const validatedData = validateApiResponse(response.data, API_RESPONSE_TYPES.DASHBOARD);
    
    if (!validatedData) {
      console.error('API validation failed, response structure invalid');
      throw new Error('Invalid dashboard response structure');
    }
    
    return validatedData;

  } catch (error) {
    console.error('Dashboard API fetch failed:', error);
    
    // Return default structure on error
    return {
      data: {
        activeDares: [],
        completedDares: [],
        switchGames: [],
        publicDares: [],
        publicSwitchGames: []
      },
      pagination: {
        activeDares: { page: 1, limit: 8, total: 0, pages: 1 },
        completedDares: { page: 1, limit: 8, total: 0, pages: 1 },
        switchGames: { page: 1, limit: 8, total: 0, pages: 1 },
        publicDares: { page: 1, limit: 8, total: 0, pages: 1 },
        publicSwitchGames: { page: 1, limit: 8, total: 0, pages: 1 }
      },
      summary: {
        totalActiveDares: 0,
        totalCompletedDares: 0,
        totalSwitchGames: 0,
        totalPublicDares: 0,
        totalPublicSwitchGames: 0
      }
    };
  }
};

/**
 * Fetches dashboard data for a specific page
 * @param {string} dataType - Type of data to fetch page for
 * @param {number} page - Page number
 * @param {Object} options - Other options
 * @returns {Promise<Object>} - Dashboard data for the specific page
 */
export const fetchDashboardPage = async (dataType, page, options = {}) => {
  const { limit = 8, ...otherOptions } = options;
  
  return fetchDashboardData({
    page,
    limit,
    ...otherOptions
  });
};

/**
 * Refreshes dashboard data with current filters
 * @param {Object} currentFilters - Current filter state
 * @param {Object} options - Other options
 * @returns {Promise<Object>} - Fresh dashboard data
 */
export const refreshDashboardData = async (currentFilters = {}, options = {}) => {
  return fetchDashboardData({
    page: 1, // Reset to first page on refresh
    ...currentFilters,
    ...options
  });
};

/**
 * Fetches quick statistics for the dashboard
 * @returns {Promise<Object>} - Quick stats data
 */
export const fetchQuickStats = async () => {
  try {
    const response = await api.get('/stats/dashboard/quick-stats');
    return response.data;
  } catch (error) {
    console.error('Quick stats API fetch failed:', error);
    return {
      dares: { active: 0, pending: 0, completedToday: 0, totalCompleted: 0 },
      switchGames: { active: 0, pending: 0, totalCompleted: 0 },
      summary: { totalActive: 0, totalPending: 0, totalCompleted: 0 }
    };
  }
};

/**
 * Fetches personalized activity feed for the dashboard
 * @param {Object} options - Activity feed options
 * @param {number} options.limit - Number of activities to fetch
 * @returns {Promise<Object>} - Activity feed data
 */
export const fetchDashboardActivityFeed = async (options = {}) => {
  try {
    const { limit = 20 } = options;
    const response = await api.get(`/stats/dashboard/activity-feed?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Dashboard activity feed API fetch failed:', error);
    return {
      activities: [],
      total: 0
    };
  }
};

/**
 * Fetches comprehensive user statistics
 * @param {string} userId - User ID to fetch stats for
 * @returns {Promise<Object>} - User statistics data
 */
export const fetchUserStats = async (userId) => {
  try {
    const response = await api.get(`/stats/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('User stats API fetch failed:', error);
    return {
      user: userId,
      statistics: {
        dares: { created: 0, completed: 0, participated: 0, completionRate: 0 },
        switchGames: { created: 0, participated: 0 },
        performance: { averageGrade: null, totalCompleted: 0 }
      },
      recentActivity: []
    };
  }
};

/**
 * Fetches general site statistics (public)
 * @returns {Promise<Object>} - General site statistics
 */
export const fetchGeneralStats = async () => {
  try {
    const response = await api.get('/stats/general');
    return response.data;
  } catch (error) {
    console.error('General stats API fetch failed:', error);
    return {
      totalUsers: 0,
      totalDares: 0,
      totalSwitchGames: 0,
      totalComments: 0
    };
  }
};

/**
 * Likes a dare
 * @param {string} dareId - The dare ID to like
 * @returns {Promise<Object>} - Response with like status
 */
export const likeDare = async (dareId) => {
  try {
    const response = await api.post(`/dares/${dareId}/like`);
    return response.data;
  } catch (error) {
    console.error('Like dare API failed:', error);
    throw error;
  }
};

/**
 * Unlikes a dare
 * @param {string} dareId - The dare ID to unlike
 * @returns {Promise<Object>} - Response with like status
 */
export const unlikeDare = async (dareId) => {
  try {
    const response = await api.delete(`/dares/${dareId}/like`);
    return response.data;
  } catch (error) {
    console.error('Unlike dare API failed:', error);
    throw error;
  }
}; 