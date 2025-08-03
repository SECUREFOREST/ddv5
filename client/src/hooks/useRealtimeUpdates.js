import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { REALTIME_INTERVALS } from '../constants.jsx';

/**
 * Custom hook for managing real-time updates
 * @param {Object} options - Configuration options
 * @param {string} options.endpoint - WebSocket endpoint
 * @param {Object} options.events - Event handlers
 * @param {number} options.interval - Polling interval for fallback
 * @param {boolean} options.enabled - Whether real-time updates are enabled
 * @returns {Object} - Real-time update state and controls
 */
export function useRealtimeUpdates({
  endpoint = '/',
  events = {},
  interval = REALTIME_INTERVALS.PUBLIC_DARES,
  enabled = true
}) {
  const socketRef = useRef(null);
  const intervalRef = useRef(null);
  const isConnected = useRef(false);

  // Initialize WebSocket connection
  const connectSocket = useCallback(() => {
    if (!enabled || socketRef.current) return;

    try {
      // Get authentication token
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        console.log('No access token found, skipping WebSocket connection');
        return;
      }

      socketRef.current = io(endpoint, {
        autoConnect: true,
        transports: ['websocket', 'polling'],
        timeout: 5000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        auth: {
          token: accessToken
        }
      });

      // Set up event listeners
      Object.entries(events).forEach(([event, handler]) => {
        socketRef.current.on(event, handler);
      });

      // Connection status handlers
      socketRef.current.on('connect', () => {
        console.log('WebSocket connected');
        isConnected.current = true;
      });

      socketRef.current.on('disconnect', () => {
        console.log('WebSocket disconnected');
        isConnected.current = false;
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        isConnected.current = false;
      });

    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }, [endpoint, events, enabled]);

  // Set up polling fallback
  const startPolling = useCallback((pollFunction) => {
    if (!enabled || intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      if (!isConnected.current && pollFunction) {
        pollFunction();
      }
    }, interval);
  }, [enabled, interval]);

  // Clean up connections
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    isConnected.current = false;
  }, []);

  // Emit event to server
  const emit = useCallback((event, data) => {
    if (socketRef.current && isConnected.current) {
      socketRef.current.emit(event, data);
    }
  }, []);

  // Set up connection on mount
  useEffect(() => {
    connectSocket();
    
    return () => {
      disconnect();
    };
  }, [connectSocket, disconnect]);

  return {
    isConnected: isConnected.current,
    connect: connectSocket,
    disconnect,
    emit
  };
}

/**
 * Hook for specific real-time updates (dares, switch games, etc.)
 * @param {string} type - Type of updates to listen for
 * @param {Function} onUpdate - Callback for updates
 * @param {Object} options - Additional options
 * @returns {Object} - Real-time update state
 */
export function useSpecificRealtimeUpdates(type, onUpdate, options = {}) {
  const { enabled = true, endpoint = '/' } = options;
  
  const events = {
    [`${type}_created`]: onUpdate,
    [`${type}_updated`]: onUpdate,
    [`${type}_deleted`]: onUpdate,
    [`public_${type}_publish`]: onUpdate,
    [`public_${type}_unpublish`]: onUpdate
  };

  return useRealtimeUpdates({
    endpoint,
    events,
    enabled,
    interval: REALTIME_INTERVALS.PUBLIC_DARES
  });
}

/**
 * Hook for activity feed real-time updates
 * @param {Function} onActivityUpdate - Callback for activity updates
 * @param {Object} options - Additional options
 * @returns {Object} - Real-time update state
 */
export function useActivityRealtimeUpdates(onActivityUpdate, options = {}) {
  const { enabled = true, endpoint = '/' } = options;
  
  const events = {
    'activity_created': onActivityUpdate,
    'dare_completed': onActivityUpdate,
    'switch_game_completed': onActivityUpdate,
    'user_joined': onActivityUpdate
  };

  return useRealtimeUpdates({
    endpoint,
    events,
    enabled,
    interval: REALTIME_INTERVALS.ACTIVITY_FEED
  });
}

/**
 * Hook for notification real-time updates
 * @param {Function} onNotificationUpdate - Callback for notification updates
 * @param {Object} options - Additional options
 * @returns {Object} - Real-time update state
 */
export function useNotificationRealtimeUpdates(onNotificationUpdate, options = {}) {
  const { enabled = true, endpoint = '/' } = options;
  
  const events = {
    'notification_created': onNotificationUpdate,
    'notification_read': onNotificationUpdate,
    'notification_deleted': onNotificationUpdate
  };

  return useRealtimeUpdates({
    endpoint,
    events,
    enabled,
    interval: REALTIME_INTERVALS.NOTIFICATIONS
  });
} 