import api from '../api/axios';

/**
 * Admin API utilities for the admin dashboard
 */

// Enhanced User Management
export const updateUserRoles = async (userId, roles) => {
  try {
    const response = await api.patch(`/users/${userId}`, { roles });
    return response.data;
  } catch (error) {
    console.error('Failed to update user roles:', error);
    throw error;
  }
};

export const suspendUser = async (userId, reason) => {
  try {
    const response = await api.patch(`/users/${userId}/suspend`, { reason });
    return response.data;
  } catch (error) {
    console.error('Failed to suspend user:', error);
    throw error;
  }
};

export const activateUser = async (userId) => {
  try {
    const response = await api.patch(`/users/${userId}/activate`);
    return response.data;
  } catch (error) {
    console.error('Failed to activate user:', error);
    throw error;
  }
};

export const bulkUserAction = async (action, userIds, additionalData = {}) => {
  try {
    const response = await api.post('/bulk/users', {
      action,
      userIds,
      ...additionalData
    });
    return response.data;
  } catch (error) {
    console.error('Failed to perform bulk user action:', error);
    throw error;
  }
};

// Basic User Management
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

// Advanced Audit System
export const fetchAuditLogs = async (page = 1, limit = 20, filters = {}) => {
  try {
    const params = { page, limit, ...filters };
    const response = await api.get('/audit-log', { params });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    throw error;
  }
};

export const exportAuditLogs = async (filters = {}, format = 'csv') => {
  try {
    const params = { format, ...filters };
    const response = await api.get('/audit-log/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Failed to export audit logs:', error);
    throw error;
  }
};

export const logAdminAction = async (action, target, details = {}) => {
  try {
    const response = await api.post('/audit-log', {
      action,
      target,
      details,
      timestamp: new Date().toISOString()
    });
    return response.data;
  } catch (error) {
    console.error('Failed to log admin action:', error);
    throw error;
  }
};

export const getAuditStatistics = async () => {
  try {
    const response = await api.get('/audit-log/stats');
    return response.data;
  } catch (error) {
    console.error('Failed to get audit statistics:', error);
    throw error;
  }
};

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
    // Fetch reports and pending content
    const [reports, pendingDares] = await Promise.allSettled([
      fetchReports(1, 10),
      api.get('/dares?status=pending&limit=10').then(res => res.data)
    ]);
    
    // Extract data with fallbacks
    const reportsData = reports.status === 'fulfilled' ? reports.value : { reports: [] };
    const daresData = pendingDares.status === 'fulfilled' ? pendingDares.value : { dares: [] };
    
    return {
      reports: reportsData.reports || [],
      pendingDares: daresData.dares || []
    };
  } catch (error) {
    console.error('Failed to fetch moderation queue:', error);
    // Return empty arrays on error
    return {
      reports: [],
      pendingDares: []
    };
  }
};

// Content Moderation
export const approveContent = async (contentId, contentType) => {
  try {
    const response = await api.post(`/${contentType}/${contentId}/approve`);
    return response.data;
  } catch (error) {
    console.error('Failed to approve content:', error);
    throw error;
  }
};

export const rejectContent = async (contentId, contentType, reason) => {
  try {
    const response = await api.post(`/${contentType}/${contentId}/reject`, { reason });
    return response.data;
  } catch (error) {
    console.error('Failed to reject content:', error);
    throw error;
  }
};

// System Monitoring & Health
export const getSystemHealth = async () => {
  try {
    const response = await api.get('/stats/admin/system-health');
    return response.data;
  } catch (error) {
    console.error('Failed to get system health:', error);
    throw error;
  }
};

export const getApiStatus = async () => {
  try {
    const response = await api.get('/stats/admin/api-status');
    return response.data;
  } catch (error) {
    console.error('Failed to get API status:', error);
    throw error;
  }
};

export const getPerformanceMetrics = async () => {
  try {
    const response = await api.get('/stats/admin/performance');
    return response.data;
  } catch (error) {
    console.error('Failed to get performance metrics:', error);
    throw error;
  }
};

export const getDatabaseStats = async () => {
  try {
    const response = await api.get('/stats/admin/database-stats');
    return response.data;
  } catch (error) {
    console.error('Failed to get database stats:', error);
    throw error;
  }
};

export const getServerMetrics = async () => {
  try {
    const response = await api.get('/stats/admin/server-metrics');
    return response.data;
  } catch (error) {
    console.error('Failed to get server metrics:', error);
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
    if (filters.type) params.append('type', filters.type);
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
    const response = await api.post('/admin/system-cleanup');
    return response.data;
  } catch (error) {
    console.error('Failed to run system cleanup:', error);
    throw error;
  }
};

export const cleanupExpiredProofs = async () => {
  try {
    const response = await api.post('/admin/cleanup-expired-proofs');
    return response.data;
  } catch (error) {
    console.error('Failed to cleanup expired proofs:', error);
    throw error;
  }
};

// Content Export Functions
export const exportToCsv = (filename, data) => {
  if (!data || !data.length) return;
  
  const keys = Object.keys(data[0]);
  const csv = [
    keys.join(','),
    ...data.map(row => 
      keys.map(key => {
        const value = row[key];
        if (value === null || value === undefined) return '';
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportDares = async (filters = {}) => {
  try {
    const response = await api.get('/dares/export', { params: filters });
    const dares = response.data.dares || [];
    
    const exportData = dares.map(dare => ({
      ID: dare._id,
      Description: dare.description,
      Creator: dare.creator?.username || 'Unknown',
      Status: dare.status,
      Difficulty: dare.difficulty,
      Type: dare.dareType,
      Created: dare.createdAt ? new Date(dare.createdAt).toLocaleDateString() : 'Unknown',
      'Proof Expires': dare.proofExpiresAt ? new Date(dare.proofExpiresAt).toLocaleDateString() : 'N/A'
    }));
    
    exportToCsv(`dares-export-${new Date().toISOString().split('T')[0]}.csv`, exportData);
    return true;
  } catch (error) {
    throw error;
  }
};

export const exportUsers = async (filters = {}) => {
  try {
    const response = await api.get('/users/export', { params: filters });
    const users = response.data.users || [];
    
    const exportData = users.map(user => ({
      ID: user._id,
      Username: user.username,
      'Full Name': user.fullName || 'N/A',
      Email: user.email,
      Roles: user.roles?.join(', ') || 'user',
      'Created At': user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown',
      'Last Login': user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never',
      Status: user.status || 'active'
    }));
    
    exportToCsv(`users-export-${new Date().toISOString().split('T')[0]}.csv`, exportData);
    return true;
  } catch (error) {
    throw error;
  }
};

export const exportAuditLogsCsv = async (filters = {}) => {
  try {
    const response = await api.get('/audit-log', { params: { ...filters, limit: 1000 } });
    const logs = response.data.logs || [];
    
    const exportData = logs.map(log => ({
      ID: log._id,
      Action: log.action,
      User: log.user?.username || 'System',
      Target: log.target || 'N/A',
      Details: typeof log.details === 'object' ? JSON.stringify(log.details) : log.details || 'N/A',
      Timestamp: log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Unknown',
      IP: log.ip || 'N/A'
    }));
    
    exportToCsv(`audit-logs-export-${new Date().toISOString().split('T')[0]}.csv`, exportData);
    return true;
  } catch (error) {
    throw error;
  }
};
