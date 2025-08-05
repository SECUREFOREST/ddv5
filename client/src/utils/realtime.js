// Real-time updates utility using WebSocket

import React from 'react';

/**
 * Real-time event types
 */
export const REALTIME_EVENTS = {
  // Dare events
  DARE_CREATED: 'dare_created',
  DARE_UPDATED: 'dare_updated',
  DARE_COMPLETED: 'dare_completed',
  DARE_ACCEPTED: 'dare_accepted',
  DARE_REJECTED: 'dare_rejected',
  
  // User events
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  USER_UPDATED: 'user_updated',
  
  // Notification events
  NOTIFICATION_CREATED: 'notification_created',
  NOTIFICATION_READ: 'notification_read',
  
  // Activity events
  ACTIVITY_CREATED: 'activity_created',
  
  // Chat events
  MESSAGE_SENT: 'message_sent',
  MESSAGE_READ: 'message_read',
  
  // System events
  SYSTEM_MAINTENANCE: 'system_maintenance',
  SYSTEM_UPDATE: 'system_update'
};

/**
 * Real-time connection manager
 */
class RealtimeManager {
  constructor() {
    this.socket = null;
    this.eventListeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.isConnecting = false;
    this.isConnected = false;
  }
  
  /**
   * Connect to WebSocket server
   */
  connect(token) {
    if (this.isConnecting || this.isConnected) return;
    
    // Check if WebSocket is enabled via environment variable
    if (window.location.protocol === 'https:' && !import.meta.env.VITE_WS_URL) {
      console.log('WebSocket disabled - set VITE_WS_URL to enable real-time features');
      return;
    }
    
    this.isConnecting = true;
    
    try {
      // Use secure WebSocket in production, fallback to localhost for development
      const isProduction = window.location.protocol === 'https:';
      const wsUrl = import.meta.env.VITE_WS_URL || 
                   (isProduction ? 'wss://www.deviantdare.com' : 'ws://localhost:5000');
      this.socket = new WebSocket(`${wsUrl}?token=${token}`);
      
      this.socket.onopen = () => {

        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit('connected');
      };
      
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      this.socket.onclose = (event) => {

        this.isConnected = false;
        this.isConnecting = false;
        this.emit('disconnected', event);
        
        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++;
            this.connect(token);
          }, this.reconnectDelay * this.reconnectAttempts);
        }
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnecting = false;
      };
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.isConnecting = false;
    }
  }
  
  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.isConnected = false;
    this.isConnecting = false;
  }
  
  /**
   * Send message to WebSocket server
   */
  send(event, data = {}) {
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify({ event, data }));
    }
  }
  
  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(data) {
    const { event, payload } = data;
    
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(payload);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
  
  /**
   * Subscribe to real-time events
   */
  subscribe(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event).add(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.eventListeners.delete(event);
        }
      }
    };
  }
  
  /**
   * Emit event to local listeners
   */
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
  
  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Global real-time manager instance
export const realtimeManager = new RealtimeManager();

/**
 * React hook for real-time events
 */
export function useRealtime(event, callback, dependencies = []) {
  React.useEffect(() => {
    const unsubscribe = realtimeManager.subscribe(event, callback);
    return unsubscribe;
  }, [event, ...dependencies]);
}

/**
 * React hook for real-time connection status
 */
export function useRealtimeStatus() {
  const [status, setStatus] = React.useState(realtimeManager.getStatus());
  
  React.useEffect(() => {
    const updateStatus = () => {
      setStatus(realtimeManager.getStatus());
    };
    
    // Subscribe to connection events
    const unsubscribeConnected = realtimeManager.subscribe('connected', updateStatus);
    const unsubscribeDisconnected = realtimeManager.subscribe('disconnected', updateStatus);
    
    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
    };
  }, []);
  
  return status;
}

/**
 * Real-time data hook for specific data types
 */
export function useRealtimeData(dataType, initialData = []) {
  const [data, setData] = React.useState(initialData);
  
  React.useEffect(() => {
    const handleUpdate = (update) => {
      setData(prevData => {
        switch (update.action) {
          case 'create':
            return [...prevData, update.item];
          case 'update':
            return prevData.map(item => 
              item.id === update.item.id ? update.item : item
            );
          case 'delete':
            return prevData.filter(item => item.id !== update.item.id);
          case 'replace':
            return update.items || [];
          default:
            return prevData;
        }
      });
    };
    
    const unsubscribe = realtimeManager.subscribe(`${dataType}_updated`, handleUpdate);
    return unsubscribe;
  }, [dataType]);
  
  return data;
}

/**
 * Real-time notification hook
 */
export function useRealtimeNotifications() {
  const [notifications, setNotifications] = React.useState([]);
  
  React.useEffect(() => {
    const handleNotification = (notification) => {
      setNotifications(prev => [notification, ...prev]);
    };
    
    const unsubscribe = realtimeManager.subscribe(REALTIME_EVENTS.NOTIFICATION_CREATED, handleNotification);
    return unsubscribe;
  }, []);
  
  return notifications;
}

/**
 * Real-time notification subscription hook
 */
export function useRealtimeNotificationSubscription() {
  const subscribeToNotifications = React.useCallback((callback) => {
    return realtimeManager.subscribe(REALTIME_EVENTS.NOTIFICATION_CREATED, callback);
  }, []);
  
  return {
    subscribeToNotifications
  };
}

/**
 * Real-time activity hook
 */
export function useRealtimeActivity() {
  const [activities, setActivities] = React.useState([]);
  
  React.useEffect(() => {
    const handleActivity = (activity) => {
      setActivities(prev => [activity, ...prev.slice(0, 49)]); // Keep last 50 activities
    };
    
    const unsubscribe = realtimeManager.subscribe(REALTIME_EVENTS.ACTIVITY_CREATED, handleActivity);
    return unsubscribe;
  }, []);
  
  return activities;
}

/**
 * Real-time activity subscription hook
 */
export function useRealtimeActivitySubscription() {
  const subscribeToActivity = React.useCallback((callback) => {
    return realtimeManager.subscribe(REALTIME_EVENTS.ACTIVITY_CREATED, callback);
  }, []);
  
  return {
    subscribeToActivity
  };
}

/**
 * Real-time user status hook
 */
export function useRealtimeUserStatus(userId) {
  const [status, setStatus] = React.useState('offline');
  
  React.useEffect(() => {
    const handleUserOnline = (data) => {
      if (data.userId === userId) {
        setStatus('online');
      }
    };
    
    const handleUserOffline = (data) => {
      if (data.userId === userId) {
        setStatus('offline');
      }
    };
    
    const unsubscribeOnline = realtimeManager.subscribe(REALTIME_EVENTS.USER_ONLINE, handleUserOnline);
    const unsubscribeOffline = realtimeManager.subscribe(REALTIME_EVENTS.USER_OFFLINE, handleUserOffline);
    
    return () => {
      unsubscribeOnline();
      unsubscribeOffline();
    };
  }, [userId]);
  
  return status;
}

/**
 * Real-time events hook for subscribing to multiple events
 */
export function useRealtimeEvents() {
  const subscribeToEvents = React.useCallback((events, callback) => {
    const unsubscribers = events.map(event => 
      realtimeManager.subscribe(event, callback)
    );
    
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, []);
  
  return {
    subscribeToEvents
  };
}

/**
 * Real-time utilities
 */
export const realtimeUtils = {
  /**
   * Initialize real-time connection
   */
  init(token) {
    realtimeManager.connect(token);
  },
  
  /**
   * Disconnect real-time connection
   */
  disconnect() {
    realtimeManager.disconnect();
  },
  
  /**
   * Send real-time event
   */
  send(event, data) {
    realtimeManager.send(event, data);
  },
  
  /**
   * Subscribe to real-time events
   */
  subscribe(event, callback) {
    return realtimeManager.subscribe(event, callback);
  },
  
  /**
   * Get connection status
   */
  getStatus() {
    return realtimeManager.getStatus();
  }
}; 