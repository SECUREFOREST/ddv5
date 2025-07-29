import React, { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon, XMarkIcon, FunnelIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { useDebounce } from '../utils/dateUtils';

/**
 * Enhanced Search component with filters and modern UX
 * @param {string} placeholder - Search placeholder text
 * @param {function} onSearch - Search callback function
 * @param {array} filters - Available filter options
 * @param {array} sortOptions - Available sort options
 * @param {boolean} loading - Loading state
 * @param {string} className - Additional classes
 */
export default function Search({ 
  placeholder = "Search...", 
  onSearch, 
  filters = [],
  sortOptions = [],
  loading = false,
  className = '',
  ...props 
}) {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [sortBy, setSortBy] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const searchRef = useRef(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (onSearch) {
      onSearch({
        query: debouncedQuery,
        filters: selectedFilters,
        sortBy
      });
    }
  }, [debouncedQuery, selectedFilters, sortBy, onSearch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterChange = (filterKey, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({});
    setSortBy('');
  };

  const hasActiveFilters = Object.keys(selectedFilters).length > 0 || sortBy;

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Enhanced Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-neutral-400" />
        </div>
        <input
          type="text"
          className="w-full pl-12 pr-12 py-4 bg-neutral-800/50 border border-neutral-700 rounded-2xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-base"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          disabled={loading}
          {...props}
        />
        
        {/* Clear Button */}
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors p-2 rounded-lg hover:bg-neutral-700/50 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Clear search"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
        
        {/* Filter Toggle */}
        {(filters.length > 0 || sortOptions.length > 0) && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center ${
              hasActiveFilters 
                ? 'text-primary bg-primary/20' 
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700/50'
            }`}
            aria-label="Toggle filters"
          >
            <FunnelIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Enhanced Filters Panel */}
      {showFilters && (filters.length > 0 || sortOptions.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-neutral-900/95 backdrop-blur-lg border border-neutral-700/50 rounded-2xl shadow-2xl z-50 p-6">
          <div className="space-y-6">
            {/* Filters */}
            {filters.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-neutral-300 mb-4 flex items-center gap-2">
                  <AdjustmentsHorizontalIcon className="w-4 h-4" />
                  Filters
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filters.map((filter) => (
                    <div key={filter.key}>
                      <label className="block text-sm font-medium text-neutral-400 mb-2">
                        {filter.label}
                      </label>
                      {filter.type === 'select' ? (
                        <select
                          value={selectedFilters[filter.key] || ''}
                          onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                          className="w-full px-3 py-2 bg-neutral-800/50 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                        >
                          <option value="">All {filter.label}</option>
                          {filter.options.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : filter.type === 'checkbox' ? (
                        <div className="space-y-2">
                          {filter.options.map((option) => (
                            <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedFilters[filter.key]?.includes(option.value) || false}
                                onChange={(e) => {
                                  const currentValues = selectedFilters[filter.key] || [];
                                  const newValues = e.target.checked
                                    ? [...currentValues, option.value]
                                    : currentValues.filter(v => v !== option.value);
                                  handleFilterChange(filter.key, newValues);
                                }}
                                className="w-4 h-4 text-primary bg-neutral-800 border-neutral-700 rounded focus:ring-primary focus:ring-2"
                              />
                              <span className="text-sm text-neutral-300">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sort Options */}
            {sortOptions.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-neutral-300 mb-4">Sort By</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sortOptions.map((option) => (
                    <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="sortBy"
                        value={option.value}
                        checked={sortBy === option.value}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-4 h-4 text-primary bg-neutral-800 border-neutral-700 focus:ring-primary focus:ring-2"
                      />
                      <span className="text-sm text-neutral-300">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="flex justify-end pt-4 border-t border-neutral-700/50">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors duration-200"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact Search for mobile
 */
export function CompactSearch({ 
  placeholder = "Search...", 
  onSearch, 
  className = '',
  ...props 
}) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (onSearch) {
      onSearch(query);
    }
  }, [debouncedQuery, onSearch]);

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-4 w-4 text-neutral-400" />
        </div>
        <input
          type="text"
          className="w-full pl-10 pr-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 text-sm"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          {...props}
        />
      </div>
    </div>
  );
} 