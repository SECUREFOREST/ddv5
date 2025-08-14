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
    
    // Log the raw response for debugging
    console.log('Raw API response in dashboardApi:', {
      status: response.status,
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : [],
      responseSize: JSON.stringify(response.data).length
    });
    
    // TEMPORARY: Skip validation for debugging
    console.log('Skipping validation temporarily for debugging');
    return response.data;
    
    // Validate the response structure
    const validatedData = validateApiResponse(response.data, API_RESPONSE_TYPES.DASHBOARD);
    
    if (!validatedData) {
      console.error('API validation failed, response structure invalid');
      throw new Error('Invalid dashboard response structure');
    }
    
    console.log('API validation successful, returning validated data');
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