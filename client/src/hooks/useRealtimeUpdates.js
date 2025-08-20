import { useEffect, useRef, useCallback } from 'react';
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
  const { user } = useAuth();
  const { showToast } = useToast();
  const socketRef = useRef(null);
  const callbacksRef = useRef({});

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
    if (!user?._id) return;

    try {
      // Dynamic import to avoid SSR issues
      const { default: RealtimeManager } = await import('../utils/realtime');
      const manager = new RealtimeManager();
      
      // Connect to real-time service
      await manager.connect(user.token);
      socketRef.current = manager;

      // Set up event listeners
      if (enableDareUpdates) {
        manager.on(REALTIME_EVENTS.DARE_CREATED, (data) => {
          callbacksRef.current.onDareUpdate?.('created', data);
          showToast('New dare created!', 'info');
        });

        manager.on(REALTIME_EVENTS.DARE_UPDATED, (data) => {
          callbacksRef.current.onDareUpdate?.('updated', data);
        });

        manager.on(REALTIME_EVENTS.DARE_COMPLETED, (data) => {
          callbacksRef.current.onDareUpdate?.('completed', data);
          showToast('Dare completed!', 'success');
        });

        manager.on(REALTIME_EVENTS.DARE_ACCEPTED, (data) => {
          callbacksRef.current.onDareUpdate?.('accepted', data);
          showToast('Dare accepted!', 'success');
        });

        manager.on(REALTIME_EVENTS.DARE_REJECTED, (data) => {
          callbacksRef.current.onDareUpdate?.('rejected', data);
          showToast('Dare rejected', 'warning');
        });
      }

      if (enableSwitchGameUpdates) {
        // Add switch game events when they're implemented
        manager.on('switch_game_updated', (data) => {
          callbacksRef.current.onSwitchGameUpdate?.('updated', data);
        });

        manager.on('switch_game_completed', (data) => {
          callbacksRef.current.onSwitchGameUpdate?.('completed', data);
          showToast('Switch game completed!', 'success');
        });
      }

      if (enableActivityUpdates) {
        manager.on(REALTIME_EVENTS.ACTIVITY_CREATED, (data) => {
          callbacksRef.current.onActivityUpdate?.(data);
        });
      }

      // Notification updates
      manager.on(REALTIME_EVENTS.NOTIFICATION_CREATED, (data) => {
        callbacksRef.current.onNotificationUpdate?.(data);
        showToast('New notification!', 'info');
      });

      // Connection status
      manager.on('connected', () => {
        console.log('Dashboard real-time connected');
      });

      manager.on('disconnected', () => {
        console.log('Dashboard real-time disconnected');
      });

    } catch (error) {
      console.error('Failed to initialize real-time updates:', error);
    }
  }, [user?._id, user?.token, enableDareUpdates, enableSwitchGameUpdates, enableActivityUpdates, showToast]);

  // Cleanup real-time connection
  const cleanupRealtime = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
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
    isConnected: !!socketRef.current?.isConnected,
    refreshDares,
    refreshSwitchGames,
    refreshActivities,
    cleanup: cleanupRealtime
  };
}; 