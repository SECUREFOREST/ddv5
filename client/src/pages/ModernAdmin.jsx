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
  ExclamationTriangleIcon as ExclamationTriangleIconSolid
} from '@heroicons/react/24/outline';

const ModernAdmin = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [systemStats, setSystemStats] = useState({});
  const [recentReports, setRecentReports] = useState([]);
  const [userActivity, setUserActivity] = useState([]);
  const [moderationQueue, setModerationQueue] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockSystemStats = {
          totalUsers: 1247,
          activeUsers: 892,
          totalTasks: 5678,
          completedTasks: 4892,
          pendingReports: 23,
          systemHealth: 'excellent',
          uptime: '99.9%',
          lastBackup: '2024-01-15T10:00:00Z'
        };

        const mockRecentReports = [
          {
            id: 'report_001',
            type: 'inappropriate_content',
            severity: 'high',
            reporter: 'User123',
            reportedUser: 'User456',
            content: 'Inappropriate task description',
            status: 'pending',
            createdAt: '2024-01-15T14:30:00Z',
            priority: 'urgent'
          },
          {
            id: 'report_002',
            type: 'harassment',
            severity: 'medium',
            reporter: 'User789',
            reportedUser: 'User101',
            content: 'Unwanted messages',
            status: 'investigating',
            createdAt: '2024-01-15T13:15:00Z',
            priority: 'high'
          }
        ];

        const mockUserActivity = [
          {
            id: 'activity_001',
            user: 'User123',
            action: 'created_task',
            details: 'Created new demand task',
            timestamp: '2024-01-15T15:00:00Z',
            impact: 'low'
          },
          {
            id: 'activity_002',
            user: 'User456',
            action: 'completed_task',
            details: 'Completed evening challenge',
            timestamp: '2024-01-15T14:45:00Z',
            impact: 'medium'
          }
        ];

        const mockModerationQueue = [
          {
            id: 'mod_001',
            type: 'task_review',
            content: 'Weekend challenge task',
            user: 'User789',
            priority: 'medium',
            waitingTime: '2 hours',
            autoFlagged: false
          },
          {
            id: 'mod_002',
            type: 'user_review',
            content: 'New user registration',
            user: 'NewUser123',
            priority: 'low',
            waitingTime: '1 hour',
            autoFlagged: true
          }
        ];

        setSystemStats(mockSystemStats);
        setRecentReports(mockRecentReports);
        setUserActivity(mockUserActivity);
        setModerationQueue(mockModerationQueue);
        
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

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
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm font-medium">System Online</span>
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
                              <UserIcon className="w-4 h-4 text-neutral-400" />
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
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-neutral-600/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-neutral-600 rounded-full flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-neutral-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">User123</p>
                          <p className="text-neutral-400 text-sm">user123@example.com</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-lg">
                          View
                        </button>
                        <button className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm rounded-lg">
                          Edit
                        </button>
                        <button className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-lg">
                          Suspend
                        </button>
                      </div>
                    </div>
                  </div>
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
                          <button className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-lg">
                            Approve
                          </button>
                          <button className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-lg">
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
                          <button className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-lg">
                            Investigate
                          </button>
                          <button className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-lg">
                            Resolve
                          </button>
                          <button className="px-3 py-1 bg-gray-500/20 text-gray-400 text-sm rounded-lg">
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
                    </div>
                  </div>
                  
                  <div className="bg-neutral-700/30 rounded-lg p-6">
                    <h4 className="text-white font-medium mb-4">System Maintenance</h4>
                    <div className="space-y-3">
                      <button className="px-4 py-2 bg-blue-500/20 text-blue-400 text-sm rounded-lg">
                        Run System Backup
                      </button>
                      <button className="px-4 py-2 bg-yellow-500/20 text-yellow-400 text-sm rounded-lg">
                        Clear Cache
                      </button>
                      <button className="px-4 py-2 bg-red-500/20 text-red-400 text-sm rounded-lg">
                        Emergency Shutdown
                      </button>
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