// Pagination utilities for handling large datasets

import React from 'react';

/**
 * Pagination configuration
 */
export const PAGINATION_CONFIG = {
  defaultPageSize: 20,
  maxPageSize: 100,
  pageSizeOptions: [10, 20, 50, 100],
  maxVisiblePages: 5
};

/**
 * Pagination state management
 */
export function usePagination(initialPage = 1, initialPageSize = PAGINATION_CONFIG.defaultPageSize, options = {}) {
  const { 
    onPageChange, 
    onPageSizeChange, 
    serverSide = false 
  } = options;
  
  const [currentPage, setCurrentPage] = React.useState(initialPage);
  const [pageSize, setPageSize] = React.useState(initialPageSize);
  const [totalItems, setTotalItems] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  
  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;
  
  // Enhanced setCurrentPage that triggers onPageChange callback
  const enhancedSetCurrentPage = React.useCallback((page) => {
    const validPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(validPage);
    
    // Trigger server-side callback if provided
    if (serverSide && onPageChange) {
      onPageChange(validPage);
    }
  }, [totalPages, serverSide, onPageChange]);
  
  // Enhanced setPageSize that triggers onPageSizeChange callback
  const enhancedSetPageSize = React.useCallback((newPageSize) => {
    const validPageSize = Math.min(Math.max(1, newPageSize), PAGINATION_CONFIG.maxPageSize);
    setPageSize(validPageSize);
    
    // Reset to first page when changing page size
    setCurrentPage(1);
    
    // Trigger server-side callback if provided
    if (serverSide && onPageSizeChange) {
      onPageSizeChange(validPageSize);
    }
  }, [serverSide, onPageSizeChange]);
  
  const goToPage = React.useCallback((page) => {
    enhancedSetCurrentPage(page);
  }, [enhancedSetCurrentPage]);
  
  const nextPage = React.useCallback(() => {
    if (hasNextPage) {
      enhancedSetCurrentPage(currentPage + 1);
    }
  }, [hasNextPage, currentPage, enhancedSetCurrentPage]);
  
  const prevPage = React.useCallback(() => {
    if (hasPrevPage) {
      enhancedSetCurrentPage(currentPage - 1);
    }
  }, [hasPrevPage, currentPage, enhancedSetCurrentPage]);
  
  const reset = React.useCallback(() => {
    setCurrentPage(1);
    setPageSize(initialPageSize);
    setTotalItems(0);
  }, [initialPageSize]);
  
  // Paginate data function (for client-side pagination)
  const paginatedData = React.useCallback((data) => {
    if (!Array.isArray(data)) return [];
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return data.slice(startIndex, endIndex);
  }, [currentPage, pageSize]);

  return {
    // State
    currentPage,
    pageSize,
    totalItems,
    loading,
    totalPages,
    hasNextPage,
    hasPrevPage,
    
    // Actions
    setCurrentPage: enhancedSetCurrentPage,
    setPageSize: enhancedSetPageSize,
    setTotalItems,
    setLoading,
    goToPage,
    nextPage,
    prevPage,
    reset,
    paginatedData
  };
}

/**
 * Pagination component
 */
export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className = '',
  showPageSize = true,
  pageSize,
  onPageSizeChange = () => {},
  totalItems
}) {
  if (totalPages <= 0) return null;
  
  const getVisiblePages = () => {
    const maxVisible = PAGINATION_CONFIG.maxVisiblePages;
    const pages = [];
    
    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show subset of pages
      const halfVisible = Math.floor(maxVisible / 2);
      
      if (currentPage <= halfVisible + 1) {
        // Near start
        for (let i = 1; i <= maxVisible - 1; i++) {
          pages.push(i);
        }
        pages.push(totalPages);
      } else if (currentPage >= totalPages - halfVisible) {
        // Near end
        pages.push(1);
        for (let i = totalPages - maxVisible + 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Middle
        pages.push(1);
        for (let i = currentPage - halfVisible + 1; i <= currentPage + halfVisible - 1; i++) {
          pages.push(i);
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };
  
  const visiblePages = getVisiblePages();
  
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Page size selector */}
      {showPageSize && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-neutral-400">Show:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm text-white"
          >
            {PAGINATION_CONFIG.pageSizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span className="text-sm text-neutral-400">per page</span>
        </div>
      )}
      
      {/* Page info */}
      <div className="text-sm text-neutral-400">
        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} items
      </div>
      
      {/* Page navigation */}
      <div className="flex items-center space-x-1">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded border border-neutral-700 text-neutral-400 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        {/* Page numbers */}
        {visiblePages.map((page, index) => {
          const isCurrent = page === currentPage;
          const isEllipsis = index > 0 && page - visiblePages[index - 1] > 1;
          
          if (isEllipsis) {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-neutral-400">
                ...
              </span>
            );
          }
          
          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-3 py-1 rounded border ${
                isCurrent 
                  ? 'bg-primary border-primary text-white' 
                  : 'border-neutral-700 text-neutral-400 hover:bg-neutral-800'
              }`}
            >
              {page}
            </button>
          );
        })}
        
        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded border border-neutral-700 text-neutral-400 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}

/**
 * Infinite scroll pagination hook
 */
export function useInfiniteScroll(fetcher, options = {}) {
  const {
    pageSize = PAGINATION_CONFIG.defaultPageSize,
    threshold = 100, // pixels from bottom to trigger load
    enabled = true
  } = options;
  
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [hasMore, setHasMore] = React.useState(true);
  const [page, setPage] = React.useState(1);
  
  const loadMore = React.useCallback(async () => {
    if (loading || !hasMore || !enabled) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetcher(page, pageSize);
      const newData = Array.isArray(result) ? result : result.data || [];
      
      setData(prev => page === 1 ? newData : [...prev, ...newData]);
      setHasMore(newData.length === pageSize);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetcher, page, pageSize, loading, hasMore, enabled]);
  
  const reset = React.useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, []);
  
  // Intersection observer for infinite scroll
  const observerRef = React.useRef();
  const lastElementRef = React.useCallback(node => {
    if (loading) return;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    }, {
      rootMargin: `${threshold}px`
    });
    
    if (node) {
      observerRef.current.observe(node);
    }
  }, [loading, hasMore, loadMore, threshold]);
  
  // Initial load
  React.useEffect(() => {
    if (enabled && data.length === 0) {
      loadMore();
    }
  }, [enabled, loadMore, data.length]);
  
  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
    lastElementRef
  };
}

/**
 * Pagination utilities
 */
export const paginationUtils = {
  /**
   * Calculate pagination info
   */
  getPaginationInfo(currentPage, pageSize, totalItems) {
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    
    return {
      currentPage,
      pageSize,
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  },
  
  /**
   * Validate pagination parameters
   */
  validateParams(page, pageSize, totalItems) {
    const maxPageSize = PAGINATION_CONFIG.maxPageSize;
    const validPageSize = Math.min(Math.max(1, pageSize), maxPageSize);
    const totalPages = Math.ceil(totalItems / validPageSize);
    const validPage = Math.min(Math.max(1, page), totalPages);
    
    return {
      page: validPage,
      pageSize: validPageSize,
      totalPages
    };
  },
  
  /**
   * Generate pagination query parameters
   */
  toQueryParams(page, pageSize) {
    return {
      page: page.toString(),
      limit: pageSize.toString()
    };
  },
  
  /**
   * Parse pagination from query parameters
   */
  fromQueryParams(params) {
    const page = parseInt(params.page) || 1;
    const pageSize = parseInt(params.limit) || PAGINATION_CONFIG.defaultPageSize;
    
    return { page, pageSize };
  }
}; 