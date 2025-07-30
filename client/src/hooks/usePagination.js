import { useState, useCallback, useEffect } from 'react';
import { PAGINATION } from '../constants';
import { validatePaginationParams } from '../utils/apiUtils';

/**
 * Custom hook for managing pagination
 * @param {Object} options - Pagination options
 * @param {Function} options.fetchFunction - Function to fetch data
 * @param {number} options.initialPage - Initial page number
 * @param {number} options.initialLimit - Initial page size
 * @param {boolean} options.autoFetch - Whether to fetch on mount
 * @returns {Object} - Pagination state and controls
 */
export function usePagination({
  fetchFunction,
  initialPage = 1,
  initialLimit = PAGINATION.DEFAULT_PAGE_SIZE,
  autoFetch = true
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  // Fetch data with pagination
  const fetchData = useCallback(async (page = pagination.page, limit = pagination.limit) => {
    if (!fetchFunction) return;

    setLoading(true);
    setError(null);

    try {
      const validatedParams = validatePaginationParams({ page, limit });
      const response = await fetchFunction(validatedParams);
      
      // Handle different response formats
      let responseData = [];
      let responsePagination = {};

      if (Array.isArray(response)) {
        responseData = response;
      } else if (response && typeof response === 'object') {
        responseData = response.data || response.items || [];
        responsePagination = response.pagination || response.meta || {};
      }

      setData(responseData);
      setPagination(prev => ({
        ...prev,
        page: validatedParams.page,
        limit: validatedParams.limit,
        total: responsePagination.total || responseData.length,
        totalPages: responsePagination.totalPages || Math.ceil((responsePagination.total || responseData.length) / validatedParams.limit),
        hasNext: responsePagination.hasNext || validatedParams.page < (responsePagination.totalPages || Math.ceil((responsePagination.total || responseData.length) / validatedParams.limit)),
        hasPrev: responsePagination.hasPrev || validatedParams.page > 1
      }));
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      console.error('Pagination fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, pagination.page, pagination.limit]);

  // Go to specific page
  const goToPage = useCallback((page) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchData(page, pagination.limit);
  }, [fetchData, pagination.totalPages, pagination.limit]);

  // Go to next page
  const nextPage = useCallback(() => {
    if (pagination.hasNext) {
      fetchData(pagination.page + 1, pagination.limit);
    }
  }, [fetchData, pagination.page, pagination.limit, pagination.hasNext]);

  // Go to previous page
  const prevPage = useCallback(() => {
    if (pagination.hasPrev) {
      fetchData(pagination.page - 1, pagination.limit);
    }
  }, [fetchData, pagination.page, pagination.limit, pagination.hasPrev]);

  // Change page size
  const changePageSize = useCallback((newLimit) => {
    const validatedLimit = Math.min(PAGINATION.MAX_PAGE_SIZE, Math.max(PAGINATION.MIN_PAGE_SIZE, newLimit));
    fetchData(1, validatedLimit);
  }, [fetchData]);

  // Refresh current page
  const refresh = useCallback(() => {
    fetchData(pagination.page, pagination.limit);
  }, [fetchData, pagination.page, pagination.limit]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && fetchFunction) {
      fetchData();
    }
  }, [autoFetch, fetchFunction]);

  return {
    data,
    loading,
    error,
    pagination,
    goToPage,
    nextPage,
    prevPage,
    changePageSize,
    refresh,
    fetchData
  };
}

/**
 * Hook for infinite scroll pagination
 * @param {Object} options - Infinite scroll options
 * @param {Function} options.fetchFunction - Function to fetch data
 * @param {number} options.initialLimit - Initial page size
 * @param {boolean} options.autoFetch - Whether to fetch on mount
 * @returns {Object} - Infinite scroll state and controls
 */
export function useInfiniteScroll({
  fetchFunction,
  initialLimit = PAGINATION.DEFAULT_PAGE_SIZE,
  autoFetch = true
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(initialLimit);

  // Fetch next page
  const fetchNext = useCallback(async () => {
    if (!fetchFunction || loading || !hasMore) return;

    setLoading(true);
    setError(null);

    try {
      const validatedParams = validatePaginationParams({ page, limit });
      const response = await fetchFunction(validatedParams);
      
      let responseData = [];
      let responseHasMore = false;

      if (Array.isArray(response)) {
        responseData = response;
        responseHasMore = response.length === limit;
      } else if (response && typeof response === 'object') {
        responseData = response.data || response.items || [];
        responseHasMore = response.hasMore || response.pagination?.hasNext || responseData.length === limit;
      }

      setData(prev => page === 1 ? responseData : [...prev, ...responseData]);
      setHasMore(responseHasMore);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      console.error('Infinite scroll fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, loading, hasMore, page, limit]);

  // Reset to first page
  const reset = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  // Refresh all data
  const refresh = useCallback(() => {
    reset();
    fetchNext();
  }, [reset, fetchNext]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && fetchFunction) {
      fetchNext();
    }
  }, [autoFetch, fetchFunction]);

  return {
    data,
    loading,
    error,
    hasMore,
    fetchNext,
    reset,
    refresh
  };
} 