import React from 'react';

// Caching utility for API responses and data

/**
 * Cache entry structure
 */
class CacheEntry {
  constructor(data, ttl = 5 * 60 * 1000) { // 5 minutes default
    this.data = data;
    this.timestamp = Date.now();
    this.ttl = ttl;
  }
  
  isExpired() {
    return Date.now() - this.timestamp > this.ttl;
  }
  
  getAge() {
    return Date.now() - this.timestamp;
  }
}

/**
 * Cache manager for API responses
 */
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.maxSize = 100; // Maximum number of cache entries
  }
  
  /**
   * Generate cache key from request parameters
   */
  generateKey(method, url, params = {}) {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${method}:${url}${paramString ? `?${paramString}` : ''}`;
  }
  
  /**
   * Get cached data
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (entry.isExpired()) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  /**
   * Set cached data
   */
  set(key, data, ttl = 5 * 60 * 1000) {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }
    
    this.cache.set(key, new CacheEntry(data, ttl));
  }
  
  /**
   * Remove cached data
   */
  delete(key) {
    this.cache.delete(key);
  }
  
  /**
   * Clear all cached data
   */
  clear() {
    this.cache.clear();
  }
  
  /**
   * Evict oldest cache entries
   */
  evictOldest() {
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest 20% of entries
    const toRemove = Math.ceil(this.maxSize * 0.2);
    entries.slice(0, toRemove).forEach(([key]) => {
      this.cache.delete(key);
    });
  }
  
  /**
   * Get cache statistics
   */
  getStats() {
    const entries = Array.from(this.cache.values());
    const expired = entries.filter(entry => entry.isExpired()).length;
    const valid = entries.length - expired;
    
    return {
      total: entries.length,
      valid,
      expired,
      maxSize: this.maxSize
    };
  }
  
  /**
   * Clean up expired entries
   */
  cleanup() {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.isExpired()) {
        this.cache.delete(key);
      }
    }
  }
}

// Global cache instance
export const cacheManager = new CacheManager();

// Clean up expired entries every minute
setInterval(() => {
  cacheManager.cleanup();
}, 60 * 1000);

/**
 * Cache configuration for different types of data
 */
export const CACHE_CONFIG = {
  // User data - cache for 10 minutes
  user: {
    ttl: 10 * 60 * 1000,
    key: (userId) => `user:${userId}`
  },
  
  // Dare data - cache for 5 minutes
  dare: {
    ttl: 5 * 60 * 1000,
    key: (dareId) => `dare:${dareId}`
  },
  
  // List data - cache for 2 minutes
  list: {
    ttl: 2 * 60 * 1000,
    key: (type, params) => `list:${type}:${JSON.stringify(params)}`
  },
  
  // Stats data - cache for 5 minutes
  stats: {
    ttl: 5 * 60 * 1000,
    key: (type) => `stats:${type}`
  },
  
  // Public data - cache for 1 minute
  public: {
    ttl: 1 * 60 * 1000,
    key: (type) => `public:${type}`
  }
};

/**
 * Cached API call wrapper
 */
export function cachedApiCall(apiCall, cacheConfig, keyGenerator) {
  return async (...args) => {
    const key = keyGenerator(...args);
    const cached = cacheManager.get(key);
    
    if (cached) {
      return cached;
    }
    
    try {
      const result = await apiCall(...args);
      cacheManager.set(key, result, cacheConfig.ttl);
      return result;
    } catch (error) {
      // Don't cache errors
      throw error;
    }
  };
}

/**
 * Cache hook for React components
 */
export function useCache(key, fetcher, ttl = 5 * 60 * 1000) {
  const [data, setData] = React.useState(() => cacheManager.get(key));
  const [loading, setLoading] = React.useState(!data);
  const [error, setError] = React.useState(null);
  
  React.useEffect(() => {
    if (data) return; // Already have cached data
    
    setLoading(true);
    setError(null);
    
    fetcher()
      .then(result => {
        cacheManager.set(key, result, ttl);
        setData(result);
      })
      .catch(err => {
        setError(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [key, fetcher, ttl, data]);
  
  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetcher();
      cacheManager.set(key, result, ttl);
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, ttl]);
  
  return { data, loading, error, refresh };
}

/**
 * Get cached data by key
 */
export function getCachedData(key) {
  return cacheManager.get(key);
}

/**
 * Set cached data with TTL
 */
export function setCachedData(key, data, ttl = 5 * 60 * 1000) {
  cacheManager.set(key, data, ttl);
}

/**
 * Simple cache utilities hook
 */
export function useCacheUtils() {
  return {
    getCachedData,
    setCachedData,
    invalidateCache
  };
}

/**
 * Invalidate cache entries by pattern
 */
export function invalidateCache(pattern) {
  for (const [key] of cacheManager.cache.entries()) {
    if (key.includes(pattern)) {
      cacheManager.delete(key);
    }
  }
}

/**
 * Preload data into cache
 */
export function preloadCache(key, data, ttl = 5 * 60 * 1000) {
  cacheManager.set(key, data, ttl);
}

/**
 * Cache utilities for common operations
 */
export const cacheUtils = {
  // Cache user data
  user: (userId) => ({
    key: CACHE_CONFIG.user.key(userId),
    ttl: CACHE_CONFIG.user.ttl
  }),
  
  // Cache dare data
  dare: (dareId) => ({
    key: CACHE_CONFIG.dare.key(dareId),
    ttl: CACHE_CONFIG.dare.ttl
  }),
  
  // Cache list data
  list: (type, params) => ({
    key: CACHE_CONFIG.list.key(type, params),
    ttl: CACHE_CONFIG.list.ttl
  }),
  
  // Cache stats data
  stats: (type) => ({
    key: CACHE_CONFIG.stats.key(type),
    ttl: CACHE_CONFIG.stats.ttl
  }),
  
  // Cache public data
  public: (type) => ({
    key: CACHE_CONFIG.public.key(type),
    ttl: CACHE_CONFIG.public.ttl
  })
}; 