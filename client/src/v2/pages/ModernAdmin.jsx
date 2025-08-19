import React, { useState, useEffect } from 'react';
import { 
  FireIcon, 
  SparklesIcon, 
  EyeDropperIcon, 
  ExclamationTriangleIcon, 
  RocketLaunchIcon,
  UsersIcon,
  ClockIcon,
  CalendarIcon,
  EyeIcon,
  HeartIcon,
  PlusIcon,
  GlobeAltIcon,
  LockClosedIcon,
  UserGroupIcon,
  StarIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftIcon,
  FlagIcon,
  ShareIcon,
  CogIcon,
  ArrowRightIcon,
  UserPlusIcon,
  TrophyIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  PaperAirplaneIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ChartBarIcon as ChartBarIconSolid,
  UserMinusIcon,
  NoSymbolIcon,
  EyeSlashIcon,
  Cog6ToothIcon,
  BellIcon,
  ExclamationTriangleIcon as ExclamationTriangleIconSolid,
  MagnifyingGlassIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../../context/ToastContext';
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
  cleanupExpiredProofs
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

  // Fetch all admin data
  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [
        siteStats,
        reportsData,
        moderationData,
        usersData,
        auditData,
        healthData
      ] = await Promise.all([
        fetchSiteStats(),
        fetchReports(1, 10),
        fetchModerationQueue(),
        fetchUsers(1, 20),
        fetchAuditLogs(1, 20),
        fetchSystemHealth()
      ]);

      setSystemStats({
        totalUsers: siteStats.totalUsers || 0,
        activeUsers: siteStats.activeUsers || 0,
        totalTasks: (siteStats.totalDares || 0) + (siteStats.totalSwitchGames || 0),
        completedTasks: siteStats.completedDares || 0,
        pendingReports: reportsData.pagination?.total || 0,
        systemHealth: healthData.status || 'unknown',
        uptime: healthData.uptime || 'unknown',
        lastBackup: new Date().toISOString()
      });

      setRecentReports(reportsData.reports || []);
      setModerationQueue(moderationData.reports || []);
      setUsers(usersData.users || []);
      setAuditLogs(auditData.logs || []);
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
          </div>
        </div>

        {/* Admin Tabs */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-neutral-700/50">
            <nav className="flex space-x-8 px-6">
              {['overview', 'users', 'moderation', 'reports', 'analytics', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-neutral-400 hover:text-neutral-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">User Management</h3>
                  <button className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors duration-200">
                    Add User
                  </button>
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
                            Username
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                            Email
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
                          <tr key={user._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                              {user.username}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                user.status === 'suspended' ? 'bg-red-500/20 text-red-400' :
                                'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-400">
                              <button
                                onClick={() => handleUserAction(user._id, 'update', { username: 'NewUsername' })}
                                disabled={isActionLoading}
                                className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-lg hover:bg-blue-500/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <PencilIcon className="w-4 h-4 mr-1" /> Edit
                              </button>
                              <button
                                onClick={() => handleUserAction(user._id, 'delete')}
                                disabled={isActionLoading}
                                className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-lg hover:bg-red-500/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <TrashIcon className="w-4 h-4 mr-1" /> Delete
                              </button>
                              {user.status === 'suspended' && (
                                <button
                                  onClick={() => handleUserAction(user._id, 'activate')}
                                  disabled={isActionLoading}
                                  className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-lg hover:bg-green-500/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <PlayIcon className="w-4 h-4 mr-1" /> Activate
                                </button>
                              )}
                              {user.status === 'active' && (
                                <button
                                  onClick={() => handleUserAction(user._id, 'suspend')}
                                  disabled={isActionLoading}
                                  className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-lg hover:bg-red-500/30 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <PauseIcon className="w-4 h-4 mr-1" /> Suspend
                                </button>
                              )}
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
                  </div>
                  
                  <div className="bg-neutral-700/30 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-4">Task Completion</h4>
                    <div className="h-32 bg-neutral-600/30 rounded-lg flex items-center justify-center">
                      <ChartBarIcon className="w-12 h-12 text-neutral-400" />
                    </div>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernAdmin; 