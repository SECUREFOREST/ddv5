import api from '../api/axios';

/**
 * Admin API utilities for the admin dashboard
 */

// Site Statistics
export const fetchSiteStats = async () => {
  try {
    const response = await api.get('/stats/site');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch site stats:', error);
    throw error;
  }
};

// User Management
export const fetchUsers = async (page = 1, limit = 20, search = '') => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    if (search) params.append('search', search);
    
    const response = await api.get(`/users?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw error;
  }
};

export const updateUser = async (userId, updates) => {
  try {
    const response = await api.patch(`/users/${userId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Failed to update user:', error);
    throw error;
  }
};

export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete user:', error);
    throw error;
  }
};

// Reports Management
export const fetchReports = async (page = 1, limit = 20, search = '') => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    if (search) params.append('search', search);
    
    const response = await api.get(`/reports?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch reports:', error);
    throw error;
  }
};

export const resolveReport = async (reportId, resolution) => {
  try {
    const response = await api.patch(`/reports/${reportId}`, resolution);
    return response.data;
  } catch (error) {
    console.error('Failed to resolve report:', error);
    throw error;
  }
};

// Moderation Queue
export const fetchModerationQueue = async () => {
  try {
    // This would need to be implemented on the backend
    // For now, we'll use a combination of reports and pending content
    const [reports, pendingDares] = await Promise.all([
      fetchReports(1, 10),
      api.get('/dares?status=pending&limit=10').then(res => res.data)
    ]);
    
    return {
      reports: reports.reports || [],
      pendingDares: pendingDares.dares || []
    };
  } catch (error) {
    console.error('Failed to fetch moderation queue:', error);
    throw error;
  }
};

// System Health
export const fetchSystemHealth = async () => {
  try {
    const response = await api.get('/stats/health');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch system health:', error);
    throw error;
  }
};

// Audit Logs
export const fetchAuditLogs = async (page = 1, limit = 20, userId = null) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    if (userId) params.append('userId', userId);
    
    const response = await api.get(`/audit-log?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    throw error;
  }
};

// Content Moderation
export const approveContent = async (contentId, contentType) => {
  try {
    const endpoint = contentType === 'dare' ? 'dares' : 'switches';
    const response = await api.post(`/${endpoint}/${contentId}/approve`);
    return response.data;
  } catch (error) {
    console.error('Failed to approve content:', error);
    throw error;
  }
};

export const rejectContent = async (contentId, contentType, reason) => {
  try {
    const endpoint = contentType === 'dare' ? 'dares' : 'switches';
    const response = await api.post(`/${endpoint}/${contentId}/reject`, { reason });
    return response.data;
  } catch (error) {
    console.error('Failed to reject content:', error);
    throw error;
  }
};

// Bulk Operations
export const bulkUpdateUsers = async (userIds, updates) => {
  try {
    const response = await api.post('/bulk/users', { userIds, updates });
    return response.data;
  } catch (error) {
    console.error('Failed to bulk update users:', error);
    throw error;
  }
};

export const bulkDeleteUsers = async (userIds) => {
  try {
    const response = await api.post('/bulk/users/delete', { userIds });
    return response.data;
  } catch (error) {
    console.error('Failed to bulk delete users:', error);
    throw error;
  }
};

// Analytics
export const fetchAnalytics = async (period = '7d') => {
  try {
    const response = await api.get(`/stats/analytics?period=${period}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    throw error;
  }
};

// System Maintenance
export const runSystemCleanup = async () => {
  try {
    const response = await api.post('/dares/cleanup');
    return response.data;
  } catch (error) {
    console.error('Failed to run system cleanup:', error);
    throw error;
  }
};

export const cleanupExpiredProofs = async () => {
  try {
    const response = await api.post('/dares/cleanup-expired');
    return response.data;
  } catch (error) {
    console.error('Failed to cleanup expired proofs:', error);
    throw error;
  }
};

// Dares Management
export const fetchDares = async (page = 1, limit = 20, filters = {}) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (filters.status) params.append('status', filters.status);
    if (filters.difficulty) params.append('difficulty', filters.difficulty);
    if (filters.type) params.append('dareType', filters.type);
    if (filters.search) params.append('search', filters.search);
    
    const response = await api.get(`/dares?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch dares:', error);
    throw error;
  }
};

export const approveDare = async (dareId) => {
  try {
    const response = await api.post(`/dares/${dareId}/approve`);
    return response.data;
  } catch (error) {
    console.error('Failed to approve dare:', error);
    throw error;
  }
};

export const rejectDare = async (dareId, reason) => {
  try {
    const response = await api.post(`/dares/${dareId}/reject`, { reason });
    return response.data;
  } catch (error) {
    console.error('Failed to reject dare:', error);
    throw error;
  }
};

export const deleteDare = async (dareId) => {
  try {
    const response = await api.delete(`/dares/${dareId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete dare:', error);
    throw error;
  }
};

export const updateDare = async (dareId, updates) => {
  try {
    const response = await api.patch(`/dares/${dareId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Failed to update dare:', error);
    throw error;
  }
};

// Switch Games Management
export const fetchSwitchGames = async (page = 1, limit = 20, filters = {}) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    if (filters.search) params.append('search', filters.search);
    
    const response = await api.get(`/switches?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch switch games:', error);
    throw error;
  }
};

export const approveSwitchGame = async (gameId) => {
  try {
    const response = await api.post(`/switches/${gameId}/approve`);
    return response.data;
  } catch (error) {
    console.error('Failed to approve switch game:', error);
    throw error;
  }
};

export const rejectSwitchGame = async (gameId, reason) => {
  try {
    const response = await api.post(`/switches/${gameId}/reject`, { reason });
    return response.data;
  } catch (error) {
    console.error('Failed to reject switch game:', error);
    throw error;
  }
};

export const deleteSwitchGame = async (gameId) => {
  try {
    const response = await api.delete(`/switches/${gameId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete switch game:', error);
    throw error;
  }
};

export const updateSwitchGame = async (gameId, updates) => {
  try {
    const response = await api.patch(`/switches/${gameId}`, updates);
    return response.data;
  } catch (error) {
    console.error('Failed to update switch game:', error);
    throw error;
  }
};

export const fixGameState = async (gameId) => {
  try {
    const response = await api.post(`/switches/${gameId}/fix-game-state`);
    return response.data;
  } catch (error) {
    console.error('Failed to fix game state:', error);
    throw error;
  }
};
