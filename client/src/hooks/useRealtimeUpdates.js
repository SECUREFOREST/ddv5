import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { REALTIME_EVENTS } from '../utils/realtime';

/**
 * Hook for real-time dashboard updates
 * @param {Object} options - Configuration options
 * @param {boolean} options.enableDareUpdates - Enable dare-related updates
 * @param {boolean} options.enableSwitchGameUpdates - Enable switch game updates
 * @param {boolean} options.enableActivityUpdates - Enable activity updates
 * @param {Function} options.onDareUpdate - Callback for dare updates
 * @param {Function} options.onSwitchGameUpdate - Callback for switch game updates
 * @param {Function} options.onActivityUpdate - Callback for activity updates
 * @param {Function} options.onNotificationUpdate - Callback for notification updates
 * @returns {Object} - Real-time update methods and status
 */
export const useDashboardRealtimeUpdates = (options = {}) => {
  const { user, accessToken } = useAuth();
  const { showToast } = useToast();
  const socketRef = useRef(null);
  const callbacksRef = useRef({});
  const [isConnected, setIsConnected] = useState(false);

  const {
    enableDareUpdates = true,
    enableSwitchGameUpdates = true,
    enableActivityUpdates = true,
    onDareUpdate,
    onSwitchGameUpdate,
    onActivityUpdate,
    onNotificationUpdate
  } = options;

  // Store callbacks in ref to avoid dependency issues
  useEffect(() => {
    callbacksRef.current = {
      onDareUpdate,
      onSwitchGameUpdate,
      onActivityUpdate,
      onNotificationUpdate
    };
  }, [onDareUpdate, onSwitchGameUpdate, onActivityUpdate, onNotificationUpdate]);

  // Initialize real-time connection
  const initializeRealtime = useCallback(async () => {
    if (!user?._id || !accessToken) {
      setIsConnected(false);
      return;
    }

    try {
      // For now, we'll use a simple polling approach instead of WebSocket
      // This ensures the dashboard works even without WebSocket support
      console.log('Initializing dashboard real-time updates with polling fallback');
      
      // Set up polling for updates every 30 seconds
      const pollInterval = setInterval(() => {
        // Trigger refresh callbacks
        callbacksRef.current.onDareUpdate?.('refresh');
        callbacksRef.current.onSwitchGameUpdate?.('refresh');
        callbacksRef.current.onActivityUpdate?.('refresh');
      }, 30000);

      // Store the interval for cleanup
      socketRef.current = { pollInterval, isPolling: true };
      setIsConnected(true);

      // TODO: Implement actual WebSocket connection when available
      // const { default: RealtimeManager } = await import('../utils/realtime');
      // const manager = new RealtimeManager();
      // await manager.connect(accessToken);
      // socketRef.current = manager;

    } catch (error) {
      console.error('Failed to initialize real-time updates:', error);
      setIsConnected(false);
      
      // Fallback to polling
      const pollInterval = setInterval(() => {
        callbacksRef.current.onDareUpdate?.('refresh');
        callbacksRef.current.onSwitchGameUpdate?.('refresh');
        callbacksRef.current.onActivityUpdate?.('refresh');
      }, 30000);
      
      socketRef.current = { pollInterval, isPolling: true };
      setIsConnected(true);
    }
  }, [user?._id, accessToken]);

  // Cleanup real-time connection
  const cleanupRealtime = useCallback(() => {
    if (socketRef.current) {
      if (socketRef.current.pollInterval) {
        clearInterval(socketRef.current.pollInterval);
      }
      if (socketRef.current.disconnect) {
        socketRef.current.disconnect();
      }
      socketRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeRealtime();
    return cleanupRealtime;
  }, [initializeRealtime, cleanupRealtime]);

  // Manual refresh methods
  const refreshDares = useCallback(() => {
    callbacksRef.current.onDareUpdate?.('refresh');
  }, []);

  const refreshSwitchGames = useCallback(() => {
    callbacksRef.current.onSwitchGameUpdate?.('refresh');
  }, []);

  const refreshActivities = useCallback(() => {
    callbacksRef.current.onActivityUpdate?.('refresh');
  }, []);

  return {
    isConnected,
    refreshDares,
    refreshSwitchGames,
    refreshActivities,
    cleanup: cleanupRealtime
  };
}; 