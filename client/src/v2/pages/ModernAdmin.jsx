import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  ShieldCheckIcon,
  UsersIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CogIcon,
  FireIcon,
  GamepadIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DownloadIcon,
  ServerIcon,
  CpuChipIcon,
  DatabaseIcon,
  BellIcon,
  FlagIcon,
  SparklesIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import {
  fetchSiteStats,
  fetchUsers,
  updateUser,
  deleteUser,
  fetchReports,
  resolveReport,
  fetchModerationQueue,
  fetchSystemHealth,
  fetchAuditLogs,
  approveContent,
  rejectContent,
  runSystemCleanup,
  cleanupExpiredProofs,
  fetchDares,
  approveDare,
  rejectDare,
  deleteDare,
  updateDare,
  fetchSwitchGames,
  approveSwitchGame,
  rejectSwitchGame,
  deleteSwitchGame,
  updateSwitchGame,
  fixGameState,
  // Enhanced User Management
  updateUserRoles,
  suspendUser,
  activateUser,
  bulkUserAction,
  // Advanced Audit System
  logAdminAction,
  getAuditStatistics,
  // System Monitoring
  getApiStatus,
  getPerformanceMetrics,
  getDatabaseStats,
  getServerMetrics,
  // Export Functions
  exportDares,
  exportUsers,
  exportAuditLogsCsv
} from '../../utils/adminApi';

const ModernAdmin = () => {
  const { showSuccess, showError } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [systemStats, setSystemStats] = useState({});
  const [recentReports, setRecentReports] = useState([]);
  const [userActivity, setUserActivity] = useState([]);
  const [moderationQueue, setModerationQueue] = useState([]);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [dares, setDares] = useState([]);
  const [switchGames, setSwitchGames] = useState([]);
  const [dareFilters, setDareFilters] = useState({ status: '', difficulty: '', type: '' });
  const [switchGameFilters, setSwitchGameFilters] = useState({ status: '', type: '' });
  
  // Enhanced User Management State
  const [editUserModal, setEditUserModal] = useState(false);
  const [editUserData, setEditUserData] = useState({});
  const [editUserId, setEditUserId] = useState(null);
  const [editUserError, setEditUserError] = useState('');
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  
  // Advanced Audit System State
  const [auditFilters, setAuditFilters] = useState({ action: '', user: '', dateRange: '' });
  const [auditStats, setAuditStats] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);
  
  // System Monitoring State
  const [systemHealth, setSystemHealth] = useState(null);
  const [apiStatus, setApiStatus] = useState({
    users: 'unknown',
    dares: 'unknown',
    reports: 'unknown',
    auditLog: 'unknown',
    switchGames: 'unknown',
    siteStats: 'unknown'
  });
  const [performanceMetrics, setPerformanceMetrics] = useState(null);
  const [databaseStats, setDatabaseStats] = useState(null);
  const [serverMetrics, setServerMetrics] = useState(null);
  const [systemLoading, setSystemLoading] = useState(false);
  
  // Export State
  const [exportLoading, setExportLoading] = useState(false);

  // Fetch all admin data
  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      // Fetch all data in parallel
      const [
        siteStatsData,
        reportsData,
        moderationData,
        usersData,
        auditData,
        daresData,
        switchGamesData,
        healthData
      ] = await Promise.all([
        fetchSiteStats(),
        fetchReports(1, 20),
        fetchModerationQueue(),
        fetchUsers(1, 20),
        fetchAuditLogs(1, 20),
        fetchDares(1, 20),
        fetchSwitchGames(1, 20),
        getSystemHealth()
      ]);

      // Set system stats
      setSystemStats({
        totalUsers: siteStatsData.totalUsers || 0,
        totalDares: siteStatsData.totalDares || 0,
        activeDares: siteStatsData.activeDares || 0,
        completedTasks: siteStatsData.completedDares || 0,
        pendingReports: reportsData.pagination?.total || 0,
        systemHealth: healthData.status || 'unknown',
        uptime: healthData.uptime || 'unknown',
        lastBackup: new Date().toISOString()
      });

      setRecentReports(reportsData.reports || []);
      setModerationQueue(moderationData.reports || []);
      setUsers(usersData.users || []);
      setAuditLogs(auditData.logs || []);
      setDares(daresData.dares || []);
      setSwitchGames(switchGamesData.switchGames || []);
      setTotalPages(reportsData.pagination?.pages || 1);

      // Generate user activity from audit logs
      const activity = (auditData.logs || []).slice(0, 5).map(log => ({
        id: log._id,
        user: log.user?.username || 'System',
        action: log.action,
        details: log.details || log.action,
        timestamp: log.createdAt,
        impact: 'low'
      }));
      setUserActivity(activity);

      // Fetch additional system monitoring data
      fetchSystemData();

    } catch (error) {
      console.error('Error fetching admin data:', error);
      showError('Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Handle user actions
  const handleUserAction = async (userId, action, updates = {}) => {
    setIsActionLoading(true);
    try {
      switch (action) {
        case 'update':
          await updateUser(userId, updates);
          showSuccess('User updated successfully');
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            await deleteUser(userId);
            showSuccess('User deleted successfully');
          }
          break;
        case 'suspend':
          await updateUser(userId, { status: 'suspended' });
          showSuccess('User suspended successfully');
          break;
        case 'activate':
          await updateUser(userId, { status: 'active' });
          showSuccess('User activated successfully');
          break;
        default:
          break;
      }
      fetchAdminData(); // Refresh data
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
      showError(`Failed to ${action} user`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle report actions
  const handleReportAction = async (reportId, action, resolution = {}) => {
    setIsActionLoading(true);
    try {
      await resolveReport(reportId, { action, resolution });
      showSuccess(`Report ${action} successfully`);
      fetchAdminData(); // Refresh data
    } catch (error) {
      console.error(`Failed to ${action} report:`, error);
      showError(`Failed to ${action} report`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle content moderation
  const handleContentModeration = async (contentId, contentType, action, reason = '') => {
    setIsActionLoading(true);
    try {
      if (action === 'approve') {
        await approveContent(contentId, contentType);
        showSuccess('Content approved successfully');
      } else if (action === 'reject') {
        await rejectContent(contentId, contentType, reason);
        showSuccess('Content rejected successfully');
      }
      fetchAdminData(); // Refresh data
    } catch (error) {
      console.error(`Failed to ${action} content:`, error);
      showError(`Failed to ${action} content`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle system maintenance
  const handleSystemMaintenance = async (action) => {
    setIsActionLoading(true);
    try {
      switch (action) {
        case 'cleanup':
          await runSystemCleanup();
          showSuccess('System cleanup completed');
          break;
        case 'cleanup-proofs':
          await cleanupExpiredProofs();
          showSuccess('Expired proofs cleanup completed');
          break;
        default:
          break;
      }
      fetchAdminData(); // Refresh data
    } catch (error) {
      console.error(`Failed to run ${action}:`, error);
      showError(`Failed to run ${action}`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Search functionality
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    try {
      const results = await fetchUsers(1, 20, searchTerm);
      setUsers(results.users || []);
      setTotalPages(results.pagination?.pages || 1);
      setCurrentPage(1);
    } catch (error) {
      console.error('Search failed:', error);
      showError('Search failed');
    }
  };

  // Pagination
  const handlePageChange = async (page) => {
    setCurrentPage(page);
    try {
      const results = await fetchUsers(page, 20, searchTerm);
      setUsers(results.users || []);
    } catch (error) {
      console.error('Failed to fetch page:', error);
      showError('Failed to load page');
    }
  };

  // Dares Management
  const fetchDaresData = async () => {
    try {
      const results = await fetchDares(1, 20, dareFilters);
      setDares(results.dares || []);
    } catch (error) {
      console.error('Failed to fetch dares:', error);
      showError('Failed to load dares');
    }
  };

  const handleDareAction = async (dareId, action, reason = '') => {
    setIsActionLoading(true);
    try {
      switch (action) {
        case 'approve':
          await approveDare(dareId);
          showSuccess('Dare approved successfully');
          break;
        case 'reject':
          await rejectDare(dareId, reason);
          showSuccess('Dare rejected successfully');
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this dare? This action cannot be undone.')) {
            await deleteDare(dareId);
            showSuccess('Dare deleted successfully');
          }
          break;
        case 'edit':
          // TODO: Implement edit modal
          showSuccess('Edit functionality coming soon');
          break;
        default:
          break;
      }
      fetchDaresData(); // Refresh data
    } catch (error) {
      console.error(`Failed to ${action} dare:`, error);
      showError(`Failed to ${action} dare`);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Switch Games Management
  const fetchSwitchGamesData = async () => {
    try {
      const results = await fetchSwitchGames(1, 20, switchGameFilters);
      setSwitchGames(results.switchGames || []);
    } catch (error) {
      console.error('Failed to fetch switch games:', error);
      showError('Failed to load switch games');
    }
  };

  const handleSwitchGameAction = async (gameId, action, reason = '') => {
    setIsActionLoading(true);
    try {
      switch (action) {
        case 'approve':
          await approveSwitchGame(gameId);
          showSuccess('Switch game approved successfully');
          break;
        case 'reject':
          await rejectSwitchGame(gameId, reason);
          showSuccess('Switch game rejected successfully');
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this switch game? This action cannot be undone.')) {
            await deleteSwitchGame(gameId);
            showSuccess('Switch game deleted successfully');
          }
          break;
        case 'fix-state':
          await fixGameState(gameId);
          showSuccess('Game state fixed successfully');
          break;
        case 'edit':
          // TODO: Implement edit modal
          showSuccess('Edit functionality coming soon');
          break;
        default:
          break;
      }
      fetchSwitchGamesData(); // Refresh data
    } catch (error) {
      console.error(`Failed to ${action} switch game:`, error);
      showError(`Failed to ${action} switch game`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'bg-green-500',
      medium: 'bg-yellow-500',
      high: 'bg-orange-500',
      urgent: 'bg-red-500'
    };
    return colors[severity] || 'bg-gray-500';
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500',
      investigating: 'bg-blue-500',
      resolved: 'bg-green-500',
      dismissed: 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-green-400',
      medium: 'text-yellow-400',
      high: 'text-orange-400',
      urgent: 'text-red-400'
    };
    return colors[priority] || 'text-gray-400';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-8">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-neutral-400">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced User Management Functions
  const handleEditUser = (userId) => {
    const user = users.find(u => u._id === userId);
    if (user) {
      setEditUserId(userId);
      setEditUserData({
        username: user.username || '',
        email: user.email || '',
        roles: user.roles || [],
        fullName: user.fullName || ''
      });
      setEditUserError('');
      setEditUserModal(true);
    }
  };

  const closeEditUserModal = () => {
    setEditUserModal(false);
    setEditUserId(null);
    setEditUserData({ username: '', email: '', roles: [], fullName: '' });
    setEditUserError('');
  };

  const handleEditUserChange = (e) => {
    const { name, value } = e.target;
    if (name === 'roles') {
      const roles = value.split(',').map(r => r.trim()).filter(r => r);
      setEditUserData(prev => ({ ...prev, roles }));
    } else {
      setEditUserData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEditUserSave = async () => {
    if (!editUserId) return;

    setEditUserLoading(true);
    setEditUserError('');

    try {
      await updateUser(editUserId, editUserData);
      showSuccess('User updated successfully!');
      fetchUsers();
      closeEditUserModal();
    } catch (error) {
      setEditUserError(error.response?.data?.error || 'Failed to update user');
    } finally {
      setEditUserLoading(false);
    }
  };

  const handleUserRoleUpdate = async (userId, newRoles) => {
    try {
      await updateUserRoles(userId, newRoles);
      showSuccess('User roles updated successfully!');
      fetchUsers();
    } catch (error) {
      showError('Failed to update user roles');
    }
  };

  const handleSuspendUser = async (userId, reason) => {
    try {
      await suspendUser(userId, reason);
      showSuccess('User suspended successfully!');
      fetchUsers();
    } catch (error) {
      showError('Failed to suspend user');
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      await activateUser(userId);
      showSuccess('User activated successfully!');
      fetchUsers();
    } catch (error) {
      showError('Failed to activate user');
    }
  };

  const handleBulkUserAction = async (action, userIds) => {
    setBulkActionLoading(true);
    try {
      await bulkUserAction(action, userIds);
      showSuccess(`Bulk ${action} completed successfully!`);
      setSelectedUsers([]);
      fetchUsers();
    } catch (error) {
      showError(`Failed to perform bulk ${action}`);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    setSelectedUsers(users.map(u => u._id));
  };

  const clearUserSelection = () => {
    setSelectedUsers([]);
  };

  // Advanced Audit System Functions
  const fetchAuditData = async () => {
    setAuditLoading(true);
    try {
      const [logs, stats] = await Promise.all([
        fetchAuditLogs(1, 50, auditFilters),
        getAuditStatistics()
      ]);
      setAuditLogs(logs.logs || []);
      setAuditStats(stats);
    } catch (error) {
      console.error('Failed to fetch audit data:', error);
      showError('Failed to load audit data');
    } finally {
      setAuditLoading(false);
    }
  };

  const handleAuditFilterChange = (filterType, value) => {
    setAuditFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const exportAuditData = async () => {
    setExportLoading(true);
    try {
      await exportAuditLogsCsv(auditFilters);
      showSuccess('Audit logs exported successfully!');
    } catch (error) {
      console.error('Failed to export audit logs:', error);
      showError('Failed to export audit logs');
    } finally {
      setExportLoading(false);
    }
  };

  // System Monitoring Functions
  const fetchSystemData = async () => {
    setSystemLoading(true);
    try {
      const [health, api, performance, db, server] = await Promise.allSettled([
        getSystemHealth(),
        getApiStatus(),
        getPerformanceMetrics(),
        getDatabaseStats(),
        getServerMetrics()
      ]);

      if (health.status === 'fulfilled') setSystemHealth(health.value);
      if (api.status === 'fulfilled') setApiStatus(api.value);
      if (performance.status === 'fulfilled') setPerformanceMetrics(performance.value);
      if (db.status === 'fulfilled') setDatabaseStats(db.value);
      if (server.status === 'fulfilled') setServerMetrics(server.value);
    } catch (error) {
      console.error('Failed to fetch system data:', error);
    } finally {
      setSystemLoading(false);
    }
  };

  // Export Functions
  const handleExportDares = async () => {
    setExportLoading(true);
    try {
      await exportDares(dareFilters);
      showSuccess('Dares exported successfully!');
    } catch (error) {
      console.error('Failed to export dares:', error);
      showError('Failed to export dares');
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportUsers = async () => {
    setExportLoading(true);
    try {
      await exportUsers({ search: searchTerm });
      showSuccess('Users exported successfully!');
    } catch (error) {
      console.error('Failed to export users:', error);
      showError('Failed to export users');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-8">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
              <p className="text-neutral-400">System management and moderation tools</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchAdminData}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              
              {/* Admin Notifications */}
              <div className="relative">
                <button className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors duration-200">
                  <BellIcon className="w-4 h-4" />
                  <span>Alerts</span>
                  {systemStats.pendingReports > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                      {systemStats.pendingReports > 99 ? '99+' : systemStats.pendingReports}
                    </span>
                  )}
                </button>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">System Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{systemStats.totalUsers.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm">Active Users</p>
                <p className="text-2xl font-bold text-white">{systemStats.activeUsers.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm">Total Tasks</p>
                <p className="text-2xl font-bold text-white">{systemStats.totalTasks.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <TrophyIcon className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm">Pending Reports</p>
                <p className="text-2xl font-bold text-white">{systemStats.pendingReports}</p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <FlagIcon className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => handleSystemMaintenance('cleanup')}
              disabled={isActionLoading}
              className="flex items-center space-x-3 p-4 bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700/50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CogIcon className="w-6 h-6 text-blue-400" />
              <span className="text-white text-sm">System Cleanup</span>
            </button>
            
            <button
              onClick={() => handleSystemMaintenance('cleanup-proofs')}
              disabled={isActionLoading}
              className="flex items-center space-x-3 p-4 bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700/50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TrashIcon className="w-6 h-6 text-yellow-400" />
              <span className="text-white text-sm">Clean Expired Proofs</span>
            </button>
            
            <button
              onClick={() => setActiveTab('reports')}
              className="flex items-center space-x-3 p-4 bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700/50 rounded-lg transition-colors duration-200"
            >
              <FlagIcon className="w-6 h-6 text-red-400" />
              <span className="text-white text-sm">Review Reports</span>
            </button>
            
            <button
              onClick={() => setActiveTab('users')}
              className="flex items-center space-x-3 p-4 bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700/50 rounded-lg transition-colors duration-200"
            >
              <UsersIcon className="w-6 h-6 text-green-400" />
              <span className="text-white text-sm">Manage Users</span>
            </button>
            
            <button
              onClick={() => setActiveTab('dares')}
              className="flex items-center space-x-3 p-4 bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700/50 rounded-lg transition-colors duration-200"
            >
              <TrophyIcon className="w-6 h-6 text-purple-400" />
              <span className="text-white text-sm">Manage Dares</span>
            </button>
            
            <button
              onClick={() => setActiveTab('switchgames')}
              className="flex items-center space-x-3 p-4 bg-neutral-800/50 hover:bg-neutral-700/50 border border-neutral-700/50 rounded-lg transition-colors duration-200"
            >
              <SparklesIcon className="w-6 h-6 text-indigo-400" />
              <span className="text-white text-sm">Manage Switch Games</span>
            </button>
          </div>
        </div>

        {/* Admin Tabs */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-neutral-700/50">
            <nav className="flex space-x-8 px-6">
              {['overview', 'users', 'moderation', 'reports', 'dares', 'switchgames', 'analytics', 'system', 'settings', 'audit'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-neutral-400 hover:text-neutral-300'
                  }`}
                >
                  {tab === 'switchgames' ? 'Switch Games' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Reports */}
                  <div className="bg-neutral-700/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <FlagIcon className="w-5 h-5 text-red-400" />
                      <span>Recent Reports</span>
                    </h3>
                    <div className="space-y-3">
                      {recentReports.slice(0, 3).map((report) => (
                        <div key={report.id} className="flex items-center justify-between p-3 bg-neutral-600/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${getSeverityColor(report.severity)}`}></div>
                            <div>
                              <p className="text-white text-sm font-medium">{report.type.replace('_', ' ')}</p>
                              <p className="text-neutral-400 text-xs">by {report.reporter}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs font-medium ${getPriorityColor(report.priority)}`}>
                              {report.priority}
                            </span>
                            <p className="text-neutral-400 text-xs">{formatDate(report.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-4 px-4 py-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white text-sm rounded-lg transition-colors duration-200">
                      View All Reports
                    </button>
                  </div>

                  {/* User Activity */}
                  <div className="bg-neutral-700/30 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                      <ChartBarIcon className="w-5 h-5 text-blue-400" />
                      <span>Recent Activity</span>
                    </h3>
                    <div className="space-y-3">
                      {userActivity.slice(0, 3).map((activity) => (
                        <div key={activity.id} className="flex items-center justify-between p-3 bg-neutral-600/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-neutral-600 rounded-full flex items-center justify-center">
                              <UsersIcon className="w-4 h-4 text-neutral-400" />
                            </div>
                            <div>
                              <p className="text-white text-sm font-medium">{activity.user}</p>
                              <p className="text-neutral-400 text-xs">{activity.details}</p>
                            </div>
                          </div>
                          <span className="text-neutral-400 text-xs">{formatDate(activity.timestamp)}</span>
                        </div>
                      ))}
                    </div>
                    <button className="w-full mt-4 px-4 py-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white text-sm rounded-lg transition-colors duration-200">
                      View All Activity
                    </button>
                  </div>
                </div>

                {/* System Health */}
                <div className="bg-neutral-700/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <ShieldCheckIcon className="w-5 h-5 text-green-400" />
                    <span>System Health</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400 mb-1">{systemStats.uptime}</div>
                      <div className="text-neutral-400 text-sm">Uptime</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400 mb-1">{systemStats.systemHealth}</div>
                      <div className="text-neutral-400 text-sm">Status</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400 mb-1">
                        {formatDate(systemStats.lastBackup)}
                      </div>
                      <div className="text-neutral-400 text-sm">Last Backup</div>
                    </div>
                  </div>
                </div>

                {/* Moderation Queue Preview */}
                <div className="bg-neutral-700/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
                    <span>Moderation Queue</span>
                  </h3>
                  <div className="space-y-3">
                    {moderationQueue.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-neutral-600/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            item.priority === 'high' ? 'bg-red-500' :
                            item.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                          <div>
                            <p className="text-white text-sm font-medium">{item.content}</p>
                            <p className="text-neutral-400 text-xs">by {item.user}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-medium ${
                            item.priority === 'high' ? 'text-red-400' :
                            item.priority === 'medium' ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {item.priority}
                          </span>
                          <p className="text-neutral-400 text-xs">{item.waitingTime}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setActiveTab('moderation')}
                    className="w-full mt-4 px-4 py-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white text-sm rounded-lg transition-colors duration-200"
                  >
                    View Moderation Queue
                  </button>
                </div>

                {/* Real-time Activity Feed */}
                <div className="bg-neutral-700/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <BellIcon className="w-5 h-5 text-blue-400" />
                    <span>Real-time Activity</span>
                  </h3>
                  <div className="space-y-3">
                    {auditLogs.slice(0, 5).map((log) => (
                      <div key={log._id} className="flex items-center space-x-3 p-3 bg-neutral-600/30 rounded-lg">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                          <p className="text-white text-sm">
                            <span className="font-medium">{log.user?.username || 'System'}</span>
                            <span className="text-neutral-400"> {log.action}</span>
                          </p>
                          <p className="text-neutral-400 text-xs">{formatDate(log.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setActiveTab('analytics')}
                    className="w-full mt-4 px-4 py-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white text-sm rounded-lg transition-colors duration-200"
                  >
                    View Full Activity Log
                  </button>
                </div>

                {/* Recent Dares */}
                <div className="bg-neutral-700/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <TrophyIcon className="w-5 h-5 text-purple-400" />
                    <span>Recent Dares</span>
                  </h3>
                  <div className="space-y-3">
                    {dares.slice(0, 3).map((dare) => (
                      <div key={dare._id} className="flex items-center justify-between p-3 bg-neutral-600/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            dare.status === 'approved' ? 'bg-green-500' :
                            dare.status === 'rejected' ? 'bg-red-500' :
                            dare.status === 'pending' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}></div>
                          <div>
                            <p className="text-white text-sm font-medium">{dare.description?.substring(0, 50)}...</p>
                            <p className="text-neutral-400 text-xs">by {dare.creator?.username || 'Unknown'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs font-medium ${
                            dare.difficulty === 'hardcore' ? 'text-red-400' :
                            dare.difficulty === 'explicit' ? 'text-orange-400' :
                            dare.difficulty === 'edgy' ? 'text-yellow-400' :
                            dare.difficulty === 'arousing' ? 'text-purple-400' : 'text-pink-400'
                          }`}>
                            {dare.difficulty}
                          </span>
                          <p className="text-neutral-400 text-xs">{formatDate(dare.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setActiveTab('dares')}
                    className="w-full mt-4 px-4 py-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white text-sm rounded-lg transition-colors duration-200"
                  >
                    View All Dares
                  </button>
                </div>

                {/* Recent Switch Games */}
                <div className="bg-neutral-700/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <SparklesIcon className="w-5 h-5 text-indigo-400" />
                    <span>Recent Switch Games</span>
                  </h3>
                  <div className="space-y-3">
                    {switchGames.slice(0, 3).map((game) => (
                      <div key={game._id} className="flex items-center justify-between p-3 bg-neutral-600/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${
                            game.status === 'approved' ? 'bg-green-500' :
                            game.status === 'rejected' ? 'bg-red-500' :
                            game.status === 'pending' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}></div>
                          <div>
                            <p className="text-white text-sm font-medium">{game.title}</p>
                            <p className="text-neutral-400 text-xs">by {game.creator?.username || 'Unknown'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-medium text-indigo-400">
                            {game.type}
                          </span>
                          <p className="text-neutral-400 text-xs">{formatDate(game.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => setActiveTab('switchgames')}
                    className="w-full mt-4 px-4 py-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white text-sm rounded-lg transition-colors duration-200"
                  >
                    View All Switch Games
                  </button>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">User Management</h3>
                  <div className="flex items-center space-x-3">
                    {selectedUsers.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-neutral-400">
                          {selectedUsers.length} selected
                        </span>
                        <button
                          onClick={() => handleBulkUserAction('suspend', selectedUsers)}
                          disabled={bulkActionLoading}
                          className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-lg hover:bg-yellow-500/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Suspend Selected
                        </button>
                        <button
                          onClick={() => handleBulkUserAction('activate', selectedUsers)}
                          disabled={bulkActionLoading}
                          className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-lg hover:bg-green-500/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Activate Selected
                        </button>
                        <button
                          onClick={clearUserSelection}
                          className="px-3 py-1 bg-neutral-500/20 text-neutral-400 text-sm rounded-lg hover:bg-neutral-500/30 transition-colors duration-200"
                        >
                          Clear Selection
                        </button>
                      </div>
                    )}
                    <button
                      onClick={handleExportUsers}
                      disabled={exportLoading}
                      className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <DownloadIcon className="w-4 h-4 mr-2" />
                      Export Users
                    </button>
                  </div>
                </div>
                
                <div className="bg-neutral-700/30 rounded-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <MagnifyingGlassIcon className="w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSearch();
                        }
                      }}
                      className="flex-1 bg-neutral-600/50 border border-neutral-600/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button
                      onClick={handleSearch}
                      disabled={isActionLoading}
                      className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Search
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-neutral-700">
                      <thead className="bg-neutral-800/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                            <input
                              type="checkbox"
                              checked={selectedUsers.length === users.length && users.length > 0}
                              onChange={selectedUsers.length === users.length ? clearUserSelection : selectAllUsers}
                              className="w-4 h-4 text-primary bg-neutral-700 border-neutral-600 rounded focus:ring-primary focus:ring-2"
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                            Roles
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-neutral-800/30 divide-y divide-neutral-700">
                        {users.map((user) => (
                          <tr key={user._id} className="hover:bg-neutral-700/30">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedUsers.includes(user._id)}
                                onChange={() => toggleUserSelection(user._id)}
                                className="w-4 h-4 text-primary bg-neutral-700 border-neutral-600 rounded focus:ring-primary focus:ring-2"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-white">
                                  {user.fullName || user.username}
                                </div>
                                <div className="text-sm text-neutral-400">
                                  @{user.username}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <div className="flex flex-wrap gap-1">
                                {user.roles?.map((role) => (
                                  <span key={role} className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    role === 'admin' ? 'bg-red-500/20 text-red-400' :
                                    role === 'moderator' ? 'bg-blue-500/20 text-blue-400' :
                                    'bg-green-500/20 text-green-400'
                                  }`}>
                                    {role}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                user.status === 'suspended' ? 'bg-red-500/20 text-red-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {user.status || 'active'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleEditUser(user._id)}
                                  disabled={isActionLoading}
                                  className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-lg hover:bg-blue-500/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Edit User"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                
                                {user.status === 'suspended' ? (
                                  <button
                                    onClick={() => handleActivateUser(user._id)}
                                    disabled={isActionLoading}
                                    className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-lg hover:bg-green-500/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Activate User"
                                  >
                                    <CheckIcon className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleSuspendUser(user._id, 'Suspended by admin')}
                                    disabled={isActionLoading}
                                    className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-lg hover:bg-yellow-500/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Suspend User"
                                  >
                                    <XMarkIcon className="w-4 h-4" />
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => handleUserAction(user._id, 'delete')}
                                  disabled={isActionLoading}
                                  className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-lg hover:bg-red-500/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Delete User"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {totalPages > 1 && (
                    <div className="flex justify-center mt-4">
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-neutral-700/50 text-neutral-400 hover:bg-neutral-700/50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          Previous
                        </button>
                        <span className="relative inline-flex items-center px-4 py-2 border border-neutral-700/50 text-neutral-400">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-neutral-700/50 text-neutral-400 hover:bg-neutral-700/50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Moderation Tab */}
            {activeTab === 'moderation' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Content Moderation Queue</h3>
                
                <div className="space-y-4">
                  {moderationQueue.map((item) => (
                    <div key={item.id} className="bg-neutral-700/30 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-neutral-600 rounded-lg flex items-center justify-center">
                            <DocumentTextIcon className="w-6 h-6 text-neutral-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium">{item.content}</p>
                            <p className="text-neutral-400 text-sm">by {item.user}</p>
                            <p className="text-neutral-500 text-xs">Waiting: {item.waitingTime}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                            item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-green-500/20 text-green-400'
                          }`}>
                            {item.priority}
                          </span>
                          {item.autoFlagged && (
                            <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs">
                              Auto-flagged
                            </span>
                          )}
                          <button
                            onClick={() => handleContentModeration(item.id, item.type, 'approve')}
                            disabled={isActionLoading}
                            className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-lg hover:bg-green-500/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleContentModeration(item.id, item.type, 'reject', 'Rejected for inappropriate content')}
                            disabled={isActionLoading}
                            className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-lg hover:bg-red-500/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Report Management</h3>
                
                <div className="space-y-4">
                  {recentReports.map((report) => (
                    <div key={report.id} className="bg-neutral-700/30 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(report.severity)} text-white`}>
                              {report.severity}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)} text-white`}>
                              {report.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)} bg-neutral-700/50`}>
                              {report.priority}
                            </span>
                          </div>
                          <p className="text-white font-medium mb-2">{report.type.replace('_', ' ')}</p>
                          <p className="text-neutral-400 text-sm mb-2">{report.content}</p>
                          <div className="flex items-center space-x-4 text-sm text-neutral-500">
                            <span>Reporter: {report.reporter}</span>
                            <span>Reported: {report.reportedUser}</span>
                            <span>{formatDate(report.createdAt)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleReportAction(report.id, 'investigate', { status: 'investigating', assignedTo: 'AdminUser' })}
                            disabled={isActionLoading}
                            className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-lg hover:bg-blue-500/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Investigate
                          </button>
                          <button
                            onClick={() => handleReportAction(report.id, 'resolve', { status: 'resolved', resolution: 'Resolved by Admin' })}
                            disabled={isActionLoading}
                            className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-lg hover:bg-green-500/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => handleReportAction(report.id, 'dismiss', { status: 'dismissed', resolution: 'Dismissed by Admin' })}
                            disabled={isActionLoading}
                            className="px-3 py-1 bg-gray-500/20 text-gray-400 text-sm rounded-lg hover:bg-gray-500/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dares Tab */}
            {activeTab === 'dares' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Dare Management</h3>
                  <button className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors duration-200">
                    Create Dare
                  </button>
                </div>

                {/* Filters */}
                <div className="bg-neutral-700/30 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Status</label>
                      <select
                        value={dareFilters.status}
                        onChange={(e) => setDareFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full bg-neutral-600/50 border border-neutral-600/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Difficulty</label>
                      <select
                        value={dareFilters.difficulty}
                        onChange={(e) => setDareFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                        className="w-full bg-neutral-600/50 border border-neutral-600/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">All Difficulties</option>
                        <option value="titillating">Titillating</option>
                        <option value="arousing">Arousing</option>
                        <option value="explicit">Explicit</option>
                        <option value="edgy">Edgy</option>
                        <option value="hardcore">Hardcore</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Type</label>
                      <select
                        value={dareFilters.type}
                        onChange={(e) => setDareFilters(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full bg-neutral-600/50 border border-neutral-600/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">All Types</option>
                        <option value="submission">Submission</option>
                        <option value="domination">Domination</option>
                        <option value="switch">Switch</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Search</label>
                      <input
                        type="text"
                        placeholder="Search dares..."
                        value={dareFilters.search || ''}
                        onChange={(e) => setDareFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="w-full bg-neutral-600/50 border border-neutral-600/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => fetchDaresData()}
                      className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors duration-200"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>

                {/* Dares List */}
                <div className="bg-neutral-700/30 rounded-lg p-6">
                  <div className="space-y-4">
                    {dares.map((dare) => (
                      <div key={dare._id} className="flex items-center justify-between p-4 bg-neutral-600/30 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              dare.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                              dare.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                              dare.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {dare.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              dare.difficulty === 'hardcore' ? 'bg-red-500/20 text-red-400' :
                              dare.difficulty === 'explicit' ? 'bg-orange-500/20 text-orange-400' :
                              dare.difficulty === 'edgy' ? 'bg-yellow-500/20 text-yellow-400' :
                              dare.difficulty === 'arousing' ? 'bg-purple-500/20 text-purple-400' :
                              'bg-pink-500/20 text-pink-400'
                            }`}>
                              {dare.difficulty}
                            </span>
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                              {dare.dareType}
                            </span>
                          </div>
                          <p className="text-white font-medium mb-1">{dare.description}</p>
                          <p className="text-neutral-400 text-sm">by {dare.creator?.username || 'Unknown'}</p>
                          <p className="text-neutral-500 text-xs">{formatDate(dare.createdAt)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {dare.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleDareAction(dare._id, 'approve')}
                                disabled={isActionLoading}
                                className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-lg hover:bg-green-500/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleDareAction(dare._id, 'reject', 'Rejected by admin')}
                                disabled={isActionLoading}
                                className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-lg hover:bg-red-500/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDareAction(dare._id, 'edit')}
                            disabled={isActionLoading}
                            className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-lg hover:bg-blue-500/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <PencilIcon className="w-4 h-4 mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => handleDareAction(dare._id, 'delete')}
                            disabled={isActionLoading}
                            className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-lg hover:bg-red-500/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <TrashIcon className="w-4 h-4 mr-1" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Switch Games Tab */}
            {activeTab === 'switchgames' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Switch Game Management</h3>
                  <button className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors duration-200">
                    Create Switch Game
                  </button>
                </div>

                {/* Filters */}
                <div className="bg-neutral-700/30 rounded-lg p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Status</label>
                      <select
                        value={switchGameFilters.status}
                        onChange={(e) => setSwitchGameFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full bg-neutral-600/50 border border-neutral-600/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Type</label>
                      <select
                        value={switchGameFilters.type}
                        onChange={(e) => setSwitchGameFilters(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full bg-neutral-600/50 border border-neutral-600/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">All Types</option>
                        <option value="submission">Submission</option>
                        <option value="domination">Domination</option>
                        <option value="switch">Switch</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Search</label>
                      <input
                        type="text"
                        placeholder="Search switch games..."
                        value={switchGameFilters.search || ''}
                        onChange={(e) => setSwitchGameFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="w-full bg-neutral-600/50 border border-neutral-600/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => fetchSwitchGamesData()}
                      className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors duration-200"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>

                {/* Switch Games List */}
                <div className="bg-neutral-700/30 rounded-lg p-6">
                  <div className="space-y-4">
                    {switchGames.map((game) => (
                      <div key={game._id} className="flex items-center justify-between p-4 bg-neutral-600/30 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              game.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                              game.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                              game.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {game.status}
                            </span>
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                              {game.type}
                            </span>
                            {game.public && (
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                                Public
                              </span>
                            )}
                          </div>
                          <p className="text-white font-medium mb-1">{game.title}</p>
                          <p className="text-neutral-400 text-sm mb-1">{game.description}</p>
                          <p className="text-neutral-400 text-sm">by {game.creator?.username || 'Unknown'}</p>
                          <p className="text-neutral-500 text-xs">{formatDate(game.createdAt)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {game.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleSwitchGameAction(game._id, 'approve')}
                                disabled={isActionLoading}
                                className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-lg hover:bg-green-500/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleSwitchGameAction(game._id, 'reject', 'Rejected by admin')}
                                disabled={isActionLoading}
                                className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-lg hover:bg-red-500/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleSwitchGameAction(game._id, 'fix-state')}
                            disabled={isActionLoading}
                            className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-lg hover:bg-yellow-500/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <CogIcon className="w-4 h-4 mr-1" /> Fix State
                          </button>
                          <button
                            onClick={() => handleSwitchGameAction(game._id, 'edit')}
                            disabled={isActionLoading}
                            className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-lg hover:bg-blue-500/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <PencilIcon className="w-4 h-4 mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => handleSwitchGameAction(game._id, 'delete')}
                            disabled={isActionLoading}
                            className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-lg hover:bg-red-500/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <TrashIcon className="w-4 h-4 mr-1" /> Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">System Analytics</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-neutral-700/30 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-4">User Growth</h4>
                    <div className="h-32 bg-neutral-600/30 rounded-lg flex items-center justify-center">
                      <ChartBarIcon className="w-12 h-12 text-neutral-400" />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-green-400">{systemStats.totalUsers}</p>
                        <p className="text-neutral-400 text-sm">Total Users</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-blue-400">{systemStats.activeUsers}</p>
                        <p className="text-neutral-400 text-sm">Active Users</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-neutral-700/30 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-4">Task Completion</h4>
                    <div className="h-32 bg-neutral-600/30 rounded-lg flex items-center justify-center">
                      <ChartBarIcon className="w-12 h-12 text-neutral-400" />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-purple-400">{systemStats.totalTasks}</p>
                        <p className="text-neutral-400 text-sm">Total Tasks</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-400">{systemStats.completedTasks}</p>
                        <p className="text-neutral-400 text-sm">Completed</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-neutral-700/30 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-4">System Health</h4>
                    <div className="text-center">
                      <div className={`text-4xl font-bold mb-2 ${
                        systemStats.systemHealth === 'healthy' ? 'text-green-400' :
                        systemStats.systemHealth === 'warning' ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {systemStats.systemHealth === 'healthy' ? '✓' : 
                         systemStats.systemHealth === 'warning' ? '⚠' : '✗'}
                      </div>
                      <p className="text-neutral-400 text-sm capitalize">{systemStats.systemHealth}</p>
                    </div>
                  </div>

                  <div className="bg-neutral-700/30 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-4">Uptime</h4>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-400 mb-2">{systemStats.uptime}</div>
                      <p className="text-neutral-400 text-sm">System Uptime</p>
                    </div>
                  </div>

                  <div className="bg-neutral-700/30 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-4">Pending Reports</h4>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-red-400 mb-2">{systemStats.pendingReports}</div>
                      <p className="text-neutral-400 text-sm">Awaiting Review</p>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-700/30 rounded-lg p-6">
                  <h4 className="text-white font-medium mb-4">Recent Activity Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-neutral-600/30 rounded-lg">
                      <div className="text-2xl font-bold text-blue-400 mb-1">{userActivity.length}</div>
                      <p className="text-neutral-400 text-sm">Recent Actions</p>
                    </div>
                    <div className="text-center p-4 bg-neutral-600/30 rounded-lg">
                      <div className="text-2xl font-bold text-green-400 mb-1">{moderationQueue.length}</div>
                      <p className="text-neutral-400 text-sm">Moderation Items</p>
                    </div>
                    <div className="text-center p-4 bg-neutral-600/30 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-400 mb-1">{recentReports.length}</div>
                      <p className="text-neutral-400 text-sm">Active Reports</p>
                    </div>
                    <div className="text-center p-4 bg-neutral-600/30 rounded-lg">
                      <div className="text-2xl font-bold text-purple-400">{auditLogs.length}</div>
                      <p className="text-neutral-400 text-sm">Audit Logs</p>
                    </div>
                  </div>
                </div>

                {/* Content Statistics */}
                <div className="bg-neutral-700/30 rounded-lg p-6">
                  <h4 className="text-white font-medium mb-4">Content Statistics</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-neutral-600/30 rounded-lg">
                      <div className="text-2xl font-bold text-purple-400 mb-1">{dares.length}</div>
                      <p className="text-neutral-400 text-sm">Total Dares</p>
                    </div>
                    <div className="text-center p-4 bg-neutral-600/30 rounded-lg">
                      <div className="text-2xl font-bold text-indigo-400 mb-1">{switchGames.length}</div>
                      <p className="text-neutral-400 text-sm">Switch Games</p>
                    </div>
                    <div className="text-center p-4 bg-neutral-600/30 rounded-lg">
                      <div className="text-2xl font-bold text-green-400 mb-1">
                        {dares.filter(d => d.status === 'approved').length}
                      </div>
                      <p className="text-neutral-400 text-sm">Approved Dares</p>
                    </div>
                    <div className="text-center p-4 bg-neutral-600/30 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-400 mb-1">
                        {dares.filter(d => d.status === 'pending').length + switchGames.filter(g => g.status === 'pending').length}
                      </div>
                      <p className="text-neutral-400 text-sm">Pending Content</p>
                    </div>
                  </div>
                </div>

                {/* Content Type Breakdown */}
                <div className="bg-neutral-700/30 rounded-lg p-6">
                  <h4 className="text-white font-medium mb-4">Content Type Breakdown</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-neutral-300 font-medium mb-3">Dare Difficulties</h5>
                      <div className="space-y-2">
                        {['titillating', 'arousing', 'explicit', 'edgy', 'hardcore'].map(difficulty => {
                          const count = dares.filter(d => d.difficulty === difficulty).length;
                          return (
                            <div key={difficulty} className="flex items-center justify-between">
                              <span className="text-neutral-400 text-sm capitalize">{difficulty}</span>
                              <span className="text-white font-medium">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <h5 className="text-neutral-300 font-medium mb-3">Switch Game Types</h5>
                      <div className="space-y-2">
                        {['submission', 'domination', 'switch'].map(type => {
                          const count = switchGames.filter(g => g.type === type).length;
                          return (
                            <div key={type} className="flex items-center justify-between">
                              <span className="text-neutral-400 text-sm capitalize">{type}</span>
                              <span className="text-white font-medium">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Monitoring Tab */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">System Monitoring</h3>
                  <button
                    onClick={fetchSystemData}
                    disabled={systemLoading}
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ArrowPathIcon className={`w-4 h-4 mr-2 ${systemLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                {/* API Status Overview */}
                <div className="bg-neutral-700/30 rounded-lg p-6">
                  <h4 className="text-white font-medium mb-4 flex items-center space-x-2">
                    <ServerIcon className="w-5 h-5 text-blue-400" />
                    <span>API Status</span>
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {Object.entries(apiStatus).map(([key, status]) => (
                      <div key={key} className="text-center">
                        <div className={`w-3 h-3 mx-auto mb-2 rounded-full ${
                          status === 'success' ? 'bg-green-500' :
                          status === 'error' ? 'bg-red-500' :
                          status === 'loading' ? 'bg-yellow-500' :
                          'bg-gray-500'
                        }`}></div>
                        <div className="text-xs text-neutral-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
                        <div className={`text-sm font-medium ${
                          status === 'success' ? 'text-green-400' :
                          status === 'error' ? 'text-red-400' :
                          status === 'loading' ? 'text-yellow-400' :
                          'text-gray-400'
                        }`}>
                          {status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Health Metrics */}
                {systemHealth && (
                  <div className="bg-neutral-700/30 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-4 flex items-center space-x-2">
                      <ShieldCheckIcon className="w-5 h-5 text-green-400" />
                      <span>System Health</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-neutral-600/30 rounded-lg">
                        <div className="text-2xl font-bold text-green-400 mb-1">
                          {systemHealth.status || 'Unknown'}
                        </div>
                        <div className="text-neutral-400 text-sm">Overall Status</div>
                      </div>
                      <div className="text-center p-4 bg-neutral-600/30 rounded-lg">
                        <div className="text-2xl font-bold text-blue-400 mb-1">
                          {systemHealth.uptime || 'Unknown'}
                        </div>
                        <div className="text-neutral-400 text-sm">Uptime</div>
                      </div>
                      <div className="text-center p-4 bg-neutral-600/30 rounded-lg">
                        <div className="text-2xl font-bold text-purple-400 mb-1">
                          {systemHealth.version || 'Unknown'}
                        </div>
                        <div className="text-neutral-400 text-sm">Version</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Performance Metrics */}
                {performanceMetrics && (
                  <div className="bg-neutral-700/30 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-4 flex items-center space-x-2">
                      <CpuChipIcon className="w-5 h-5 text-yellow-400" />
                      <span>Performance Metrics</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-neutral-600/30 rounded-lg">
                        <div className="text-2xl font-bold text-blue-400 mb-1">
                          {performanceMetrics.responseTime || 'N/A'}ms
                        </div>
                        <div className="text-neutral-400 text-sm">Avg Response Time</div>
                      </div>
                      <div className="text-center p-4 bg-neutral-600/30 rounded-lg">
                        <div className="text-2xl font-bold text-green-400 mb-1">
                          {performanceMetrics.requestsPerSecond || 'N/A'}
                        </div>
                        <div className="text-neutral-400 text-sm">Requests/Second</div>
                      </div>
                      <div className="text-center p-4 bg-neutral-600/30 rounded-lg">
                        <div className="text-2xl font-bold text-purple-400 mb-1">
                          {performanceMetrics.errorRate || 'N/A'}%
                        </div>
                        <div className="text-neutral-400 text-sm">Error Rate</div>
                      </div>
                      <div className="text-center p-4 bg-neutral-600/30 rounded-lg">
                        <div className="text-2xl font-bold text-orange-400 mb-1">
                          {performanceMetrics.activeConnections || 'N/A'}
                        </div>
                        <div className="text-neutral-400 text-sm">Active Connections</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Database Statistics */}
                {databaseStats && (
                  <div className="bg-neutral-700/30 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-4 flex items-center space-x-2">
                      <DatabaseIcon className="w-5 h-5 text-indigo-400" />
                      <span>Database Statistics</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-neutral-600/30 rounded-lg">
                        <div className="text-2xl font-bold text-blue-400 mb-1">
                          {databaseStats.totalCollections || 'N/A'}
                        </div>
                        <div className="text-neutral-400 text-sm">Collections</div>
                      </div>
                      <div className="text-center p-4 bg-neutral-600/30 rounded-lg">
                        <div className="text-2xl font-bold text-green-400 mb-1">
                          {databaseStats.totalDocuments || 'N/A'}
                        </div>
                        <div className="text-neutral-400 text-sm">Documents</div>
                      </div>
                      <div className="text-center p-4 bg-neutral-600/30 rounded-lg">
                        <div className="text-2xl font-bold text-purple-400 mb-1">
                          {databaseStats.storageSize || 'N/A'}
                        </div>
                        <div className="text-neutral-400 text-sm">Storage Size</div>
                      </div>
                      <div className="text-center p-4 bg-neutral-600/30 rounded-lg">
                        <div className="text-2xl font-bold text-orange-400 mb-1">
                          {databaseStats.indexes || 'N/A'}
                        </div>
                        <div className="text-neutral-400 text-sm">Indexes</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Server Metrics */}
                {serverMetrics && (
                  <div className="bg-neutral-700/30 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-4 flex items-center space-x-2">
                      <ServerIcon className="w-5 h-5 text-red-400" />
                      <span>Server Metrics</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-neutral-600/30 rounded-lg">
                        <div className="text-2xl font-bold text-blue-400 mb-1">
                          {serverMetrics.cpuUsage || 'N/A'}%
                        </div>
                        <div className="text-neutral-400 text-sm">CPU Usage</div>
                      </div>
                      <div className="text-center p-4 bg-neutral-600/30 rounded-lg">
                        <div className="text-2xl font-bold text-green-400 mb-1">
                          {serverMetrics.memoryUsage || 'N/A'}%
                        </div>
                        <div className="text-neutral-400 text-sm">Memory Usage</div>
                      </div>
                      <div className="text-center p-4 bg-neutral-600/30 rounded-lg">
                        <div className="text-2xl font-bold text-purple-400 mb-1">
                          {serverMetrics.diskUsage || 'N/A'}%
                        </div>
                        <div className="text-neutral-400 text-sm">Disk Usage</div>
                      </div>
                      <div className="text-center p-4 bg-neutral-600/30 rounded-lg">
                        <div className="text-2xl font-bold text-orange-400 mb-1">
                          {serverMetrics.networkIO || 'N/A'}
                        </div>
                        <div className="text-neutral-400 text-sm">Network I/O</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* System Actions */}
                <div className="bg-neutral-700/30 rounded-lg p-6">
                  <h4 className="text-white font-medium mb-4">System Actions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => handleSystemMaintenance('cleanup')}
                      disabled={isActionLoading}
                      className="p-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold mb-2">🧹</div>
                        <div className="font-medium">System Cleanup</div>
                        <div className="text-sm text-blue-300">Clean temporary files</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handleSystemMaintenance('cleanup-proofs')}
                      disabled={isActionLoading}
                      className="p-4 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold mb-2">⏰</div>
                        <div className="font-medium">Clean Expired Proofs</div>
                        <div className="text-sm text-yellow-300">Remove old proof data</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handleSystemMaintenance('backup')}
                      disabled={isActionLoading}
                      className="p-4 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="text-center">
                        <div className="text-2xl font-bold mb-2">💾</div>
                        <div className="font-medium">Create Backup</div>
                        <div className="text-sm text-green-300">Backup system data</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">System Settings</h3>
                
                <div className="space-y-4">
                  <div className="bg-neutral-700/30 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-4">Content Moderation</h4>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 rounded focus:ring-primary focus:ring-2" />
                        <span className="text-neutral-300">Enable automatic content filtering</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 rounded focus:ring-primary focus:ring-2" />
                        <span className="text-neutral-300">Require manual review for new users</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 rounded focus:ring-primary focus:ring-2" />
                        <span className="text-neutral-300">Auto-flag suspicious content</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="bg-neutral-700/30 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-4">System Maintenance</h4>
                    <div className="space-y-3">
                      <button
                        onClick={() => handleSystemMaintenance('cleanup')}
                        disabled={isActionLoading}
                        className="px-4 py-2 bg-blue-500/20 text-blue-400 text-sm rounded-lg hover:bg-blue-500/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Run System Cleanup
                      </button>
                      <button
                        onClick={() => handleSystemMaintenance('cleanup-proofs')}
                        disabled={isActionLoading}
                        className="px-4 py-2 bg-yellow-500/20 text-yellow-400 text-sm rounded-lg hover:bg-yellow-500/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Clean Expired Proofs
                      </button>
                      <button
                        onClick={() => handleSystemMaintenance('backup')}
                        disabled={isActionLoading}
                        className="px-4 py-2 bg-green-500/20 text-green-400 text-sm rounded-lg hover:bg-green-500/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Create System Backup
                      </button>
                    </div>
                  </div>

                  <div className="bg-neutral-700/30 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-4">Notification Preferences</h4>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 rounded focus:ring-primary focus:ring-2" />
                        <span className="text-neutral-300">Email notifications for high-priority reports</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 rounded focus:ring-primary focus:ring-2" />
                        <span className="text-neutral-300">System health alerts</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 rounded focus:ring-primary focus:ring-2" />
                        <span className="text-neutral-300">User registration notifications</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 rounded focus:ring-primary focus:ring-2" />
                        <span className="text-neutral-300">Content moderation alerts</span>
                      </label>
                    </div>
                  </div>

                  <div className="bg-neutral-700/30 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-4">Security Settings</h4>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 rounded focus:ring-primary focus:ring-2" />
                        <span className="text-neutral-300">Require 2FA for admin accounts</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" defaultChecked className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 rounded focus:ring-primary focus:ring-2" />
                        <span className="text-neutral-300">Session timeout after 30 minutes</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input type="checkbox" className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 rounded focus:ring-primary focus:ring-2" />
                        <span className="text-neutral-300">Log all admin actions</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Audit System Tab */}
            {activeTab === 'audit' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Advanced Audit System</h3>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={fetchAuditData}
                      disabled={auditLoading}
                      className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowPathIcon className={`w-4 h-4 mr-2 ${auditLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                    <button
                      onClick={exportAuditData}
                      disabled={exportLoading}
                      className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <DownloadIcon className="w-4 h-4 mr-2" />
                      Export
                    </button>
                  </div>
                </div>

                {/* Audit Filters */}
                <div className="bg-neutral-700/30 rounded-lg p-6">
                  <h4 className="text-white font-medium mb-4">Audit Filters</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Action Type</label>
                      <select
                        value={auditFilters.action}
                        onChange={(e) => handleAuditFilterChange('action', e.target.value)}
                        className="w-full bg-neutral-600/50 border border-neutral-600/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">All Actions</option>
                        <option value="user_login">User Login</option>
                        <option value="user_logout">User Logout</option>
                        <option value="content_create">Content Created</option>
                        <option value="content_update">Content Updated</option>
                        <option value="content_delete">Content Deleted</option>
                        <option value="admin_action">Admin Action</option>
                        <option value="system_event">System Event</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">User</label>
                      <input
                        type="text"
                        placeholder="Filter by username..."
                        value={auditFilters.user}
                        onChange={(e) => handleAuditFilterChange('user', e.target.value)}
                        className="w-full bg-neutral-600/50 border border-neutral-600/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Date Range</label>
                      <select
                        value={auditFilters.dateRange}
                        onChange={(e) => handleAuditFilterChange('dateRange', e.target.value)}
                        className="w-full bg-neutral-600/50 border border-neutral-600/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="year">This Year</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Audit Statistics */}
                {auditStats && (
                  <div className="bg-neutral-700/30 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-4">Audit Statistics</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-neutral-600/30 rounded-lg">
                        <div className="text-2xl font-bold text-blue-400 mb-1">
                          {auditStats.totalLogs || 0}
                        </div>
                        <div className="text-neutral-400 text-sm">Total Logs</div>
                      </div>
                      <div className="text-center p-4 bg-neutral-600/30 rounded-lg">
                        <div className="text-2xl font-bold text-green-400 mb-1">
                          {auditStats.uniqueUsers || 0}
                        </div>
                        <div className="text-neutral-400 text-sm">Unique Users</div>
                      </div>
                      <div className="text-center p-4 bg-neutral-600/30 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-400 mb-1">
                          {auditStats.todayLogs || 0}
                        </div>
                        <div className="text-neutral-400 text-sm">Today's Logs</div>
                      </div>
                      <div className="text-center p-4 bg-neutral-600/30 rounded-lg">
                        <div className="text-2xl font-bold text-purple-400 mb-1">
                          {auditStats.avgLogsPerDay || 0}
                        </div>
                        <div className="text-neutral-400 text-sm">Avg/Day</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Audit Logs Table */}
                <div className="bg-neutral-700/30 rounded-lg p-6">
                  <h4 className="text-white font-medium mb-4">Audit Logs</h4>
                  {auditLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-neutral-400">Loading audit logs...</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-neutral-700">
                        <thead className="bg-neutral-800/50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                              Timestamp
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                              User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                              Action
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                              Target
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                              Details
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-neutral-800/30 divide-y divide-neutral-700">
                          {auditLogs.map((log) => (
                            <tr key={log._id} className="hover:bg-neutral-700/30">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                                {formatDate(log.createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className="text-white font-medium">
                                  {log.user?.username || 'System'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  log.action.includes('create') ? 'bg-green-500/20 text-green-400' :
                                  log.action.includes('update') ? 'bg-blue-500/20 text-blue-400' :
                                  log.action.includes('delete') ? 'bg-red-500/20 text-red-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {log.action.replace(/_/g, ' ')}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                                {log.target || 'N/A'}
                              </td>
                              <td className="px-6 py-4 text-sm text-neutral-400">
                                <div className="max-w-xs truncate">
                                  {typeof log.details === 'object' ? (
                                    <pre className="text-xs whitespace-pre-wrap">
                                      {JSON.stringify(log.details, null, 2)}
                                    </pre>
                                  ) : (
                                    log.details || 'No details'
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  {auditLogs.length === 0 && !auditLoading && (
                    <div className="text-center py-8">
                      <DocumentTextIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                      <p className="text-neutral-400">No audit logs found</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Edit Modal */}
      {editUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-neutral-800 border border-neutral-700 rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Edit User</h3>
              <button
                onClick={closeEditUserModal}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={editUserData.username}
                  onChange={handleEditUserChange}
                  className="w-full bg-neutral-700/50 border border-neutral-600/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={editUserData.fullName}
                  onChange={handleEditUserChange}
                  className="w-full bg-neutral-700/50 border border-neutral-600/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={editUserData.email}
                  onChange={handleEditUserChange}
                  className="w-full bg-neutral-700/50 border border-neutral-600/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Roles (comma-separated)
                </label>
                <input
                  type="text"
                  name="roles"
                  value={Array.isArray(editUserData.roles) ? editUserData.roles.join(', ') : ''}
                  onChange={handleEditUserChange}
                  placeholder="admin, moderator, user"
                  className="w-full bg-neutral-700/50 border border-neutral-600/50 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              
              {editUserError && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-sm">
                  {editUserError}
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={closeEditUserModal}
                  disabled={editUserLoading}
                  className="flex-1 bg-neutral-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 hover:bg-neutral-600 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditUserSave}
                  disabled={editUserLoading}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editUserLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernAdmin; 