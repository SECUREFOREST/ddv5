import React, { useState, useEffect } from 'react';
import { 
  FireIcon, 
  SparklesIcon, 
  EyeDropperIcon, 
  ExclamationTriangleIcon, 
  RocketLaunchIcon,
  UserIcon,
  ChartBarIcon,
  TrophyIcon,
  ClockIcon,
  StarIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  CalendarIcon,
  EyeIcon,
  HeartIcon,
  CogIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/solid';
import { DIFFICULTY_OPTIONS } from '../../constants';

const ModernUserAnalytics = () => {
  const [userStats, setUserStats] = useState({});
  const [performanceData, setPerformanceData] = useState({});
  const [roleBreakdown, setRoleBreakdown] = useState({});
  const [difficultyBreakdown, setDifficultyBreakdown] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [timeRange, setTimeRange] = useState('month'); // week, month, year, all
  const [selectedMetrics, setSelectedMetrics] = useState(['performance', 'roles', 'difficulty']);
  const [isLoading, setIsLoading] = useState(true);

  // Simulated user statistics data based on legacy system
  useEffect(() => {
    const mockUserStats = {
      id: 'current_user',
      username: 'CurrentUser',
      fullName: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      role: 'switch',
      joinDate: '2023-01-15',
      lastActive: '2024-01-15T20:30:00Z',
      avatar: '/api/avatars/current_user.jpg',
      statistics: {
        averageGrade: 8.7,
        totalTasks: 156,
        completedTasks: 142,
        failedTasks: 8,
        cancelledTasks: 6,
        totalPoints: 1247,
        currentStreak: 12,
        longestStreak: 28,
        roleBreakdown: {
          dom: 45,
          sub: 55
        },
        difficultyBreakdown: {
          titillating: 20,
          arousing: 35,
          explicit: 25,
          edgy: 15,
          hardcore: 5
        },
        completed: {
          titillating: 28,
          arousing: 50,
          explicit: 35,
          edgy: 21,
          hardcore: 8
        },
        monthlyProgress: {
          '2024-01': { completed: 12, points: 98, grade: 8.5 },
          '2023-12': { completed: 15, points: 127, grade: 8.8 },
          '2023-11': { completed: 18, points: 145, grade: 9.1 },
          '2023-10': { completed: 14, points: 112, grade: 8.3 },
          '2023-09': { completed: 16, points: 134, grade: 8.9 },
          '2023-08': { completed: 13, points: 108, grade: 8.6 }
        }
      },
      achievements: [
        { id: 'ach_001', name: 'First Steps', description: 'Complete your first task', icon: '🌟', unlocked: true, unlockedAt: '2023-01-20' },
        { id: 'ach_002', name: 'Consistent Performer', description: 'Complete 10 tasks in a month', icon: '🔥', unlocked: true, unlockedAt: '2023-03-15' },
        { id: 'ach_003', name: 'Role Explorer', description: 'Complete tasks in both dominant and submissive roles', icon: '🔄', unlocked: true, unlockedAt: '2023-05-10' },
        { id: 'ach_004', name: 'Difficulty Master', description: 'Complete tasks in all difficulty levels', icon: '⚡', unlocked: true, unlockedAt: '2023-08-22' },
        { id: 'ach_005', name: 'Streak Champion', description: 'Maintain a 20-day completion streak', icon: '🏆', unlocked: true, unlockedAt: '2023-11-30' },
        { id: 'ach_006', name: 'Century Club', description: 'Complete 100 tasks', icon: '💎', unlocked: false, progress: 142, target: 100 },
        { id: 'ach_007', name: 'Grade Master', description: 'Maintain a 9.0+ average grade for 3 months', icon: '🎯', unlocked: false, progress: 2, target: 3 }
      ],
      currentSlots: [
        { empty: false, task: { id: 'task_001', status: 'in_progress', title: 'Evening Challenge' } },
        { empty: false, task: { id: 'task_002', status: 'claimed', title: 'Weekend Task' } },
        { empty: true, task: null },
        { empty: true, task: null }
      ],
      cooldown: {
        until: '2024-01-16T08:00:00Z',
        duration: 43200000 // 12 hours
      }
    };

    setUserStats(mockUserStats);
    setRoleBreakdown(mockUserStats.statistics.roleBreakdown);
    setDifficultyBreakdown(mockUserStats.statistics.difficultyBreakdown);
    setIsLoading(false);
  }, []);

  const getDifficultyColor = (difficulty) => {
    const colors = {
      titillating: 'from-pink-400 to-pink-600',
      arousing: 'from-red-400 to-red-600',
      explicit: 'from-orange-500 to-orange-700',
      edgy: 'from-purple-500 to-purple-700',
      hardcore: 'from-gray-700 to-gray-900'
    };
    return colors[difficulty] || 'from-gray-400 to-gray-600';
  };

  const getDifficultyIcon = (difficulty) => {
    const icons = {
      titillating: <SparklesIcon className="w-5 h-5" />,
      arousing: <FireIcon className="w-5 h-5" />,
      explicit: <EyeDropperIcon className="w-5 h-5" />,
      edgy: <ExclamationTriangleIcon className="w-5 h-5" />,
      hardcore: <RocketLaunchIcon className="w-5 h-5" />
    };
    return icons[difficulty] || <SparklesIcon className="w-5 h-5" />;
  };

  const getRoleColor = (role) => {
    const colors = {
      dom: 'from-red-500 to-red-700',
      sub: 'from-blue-500 to-blue-700',
      switch: 'from-purple-500 to-purple-700'
    };
    return colors[role] || 'from-gray-500 to-gray-700';
  };

  const getRoleIcon = (role) => {
    const icons = {
      dom: <FireIcon className="w-5 h-5" />,
      sub: <HeartIcon className="w-5 h-5" />,
      switch: <ArrowPathIcon className="w-5 h-5" />
    };
    return icons[role] || <UserIcon className="w-5 h-5" />;
  };

  const formatTimeElapsed = (timestamp) => {
    const elapsed = Date.now() - new Date(timestamp).getTime();
    const days = Math.floor(elapsed / 86400000);
    const hours = Math.floor((elapsed % 86400000) / 3600000);
    
    if (days > 0) {
      return `${days}d ${hours}h ago`;
    }
    return `${hours}h ago`;
  };

  const calculateCompletionRate = () => {
    const { totalTasks, completedTasks } = userStats.statistics;
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const calculateSuccessRate = () => {
    const { completedTasks, failedTasks } = userStats.statistics;
    const total = completedTasks + failedTasks;
    return total > 0 ? Math.round((completedTasks / total) * 100) : 0;
  };

  const getGradeColor = (grade) => {
    if (grade >= 9.0) return 'text-green-400';
    if (grade >= 8.0) return 'text-yellow-400';
    if (grade >= 7.0) return 'text-orange-400';
    return 'text-red-400';
  };

  const getGradeIcon = (grade) => {
    if (grade >= 9.0) return <StarIcon className="w-5 h-5" />;
    if (grade >= 8.0) return <CheckCircleIcon className="w-5 h-5" />;
    if (grade >= 7.0) return <ExclamationCircleIcon className="w-5 h-5" />;
    return <XCircleIcon className="w-5 h-5" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-white/80 text-lg font-medium">Loading analytics...</div>
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
              <h1 className="text-3xl font-bold text-white mb-2">User Analytics & Statistics</h1>
              <p className="text-neutral-400">
                Comprehensive performance tracking and achievement analysis
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="year">Last Year</option>
                <option value="all">All Time</option>
              </select>
              <button className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors duration-200 flex items-center space-x-2">
                <ArrowPathIcon className="w-5 h-5" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* User Profile Summary */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6 mb-8">
          <div className="flex items-center space-x-6">
            <img 
              src={userStats.avatar} 
              alt={userStats.fullName}
              className="w-20 h-20 rounded-full border-4 border-primary"
            />
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-2">{userStats.fullName}</h2>
              <div className="flex items-center space-x-4 text-sm text-neutral-400 mb-3">
                <span>@{userStats.username}</span>
                <span>•</span>
                <span>Member since {new Date(userStats.joinDate).toLocaleDateString()}</span>
                <span>•</span>
                <span>Last active {formatTimeElapsed(userStats.lastActive)}</span>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${getRoleColor(userStats.role)} flex items-center justify-center text-white`}>
                    {getRoleIcon(userStats.role)}
                  </div>
                  <span className="text-white capitalize">{userStats.role}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrophyIcon className="w-5 h-5 text-yellow-400" />
                  <span className="text-white">{userStats.achievements.filter(a => a.unlocked).length} achievements</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ChevronUpIcon className="w-5 h-5 text-green-400" />
                  <span className="text-white">{userStats.statistics.currentStreak} day streak</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-white">{userStats.statistics.averageGrade}</span>
            </div>
            <p className="text-neutral-400 text-sm mb-2">Average Grade</p>
            <div className="flex items-center space-x-2">
              {getGradeIcon(userStats.statistics.averageGrade)}
              <span className={`text-sm font-medium ${getGradeColor(userStats.statistics.averageGrade)}`}>
                {userStats.statistics.averageGrade >= 9.0 ? 'Excellent' : 
                 userStats.statistics.averageGrade >= 8.0 ? 'Good' : 
                 userStats.statistics.averageGrade >= 7.0 ? 'Fair' : 'Needs Improvement'}
              </span>
            </div>
          </div>

          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-400" />
              </div>
              <span className="text-2xl font-bold text-white">{userStats.statistics.totalTasks}</span>
            </div>
            <p className="text-neutral-400 text-sm mb-2">Total Tasks</p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-green-400 font-medium">{calculateCompletionRate()}% completion rate</span>
            </div>
          </div>

          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <StarIcon className="w-6 h-6 text-yellow-400" />
              </div>
              <span className="text-2xl font-bold text-white">{userStats.statistics.totalPoints}</span>
            </div>
            <p className="text-neutral-400 text-sm mb-2">Total Points</p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-yellow-400 font-medium">
                {Math.round(userStats.statistics.totalPoints / userStats.statistics.completedTasks)} avg per task
              </span>
            </div>
          </div>

          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <TrophyIcon className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-white">{userStats.statistics.currentStreak}</span>
            </div>
            <p className="text-neutral-400 text-sm mb-2">Current Streak</p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-purple-400 font-medium">
                Best: {userStats.statistics.longestStreak} days
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Role Breakdown */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Role Breakdown</h3>
              <div className="space-y-4">
                {Object.entries(roleBreakdown).map(([role, percentage]) => (
                  <div key={role} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${getRoleColor(role)} flex items-center justify-center text-white`}>
                        {getRoleIcon(role)}
                      </div>
                      <span className="text-white capitalize">{role}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-neutral-700/50 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${getRoleColor(role)}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-white font-medium w-12 text-right">{percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Difficulty Breakdown */}
          <div className="lg:col-span-2">
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Difficulty Level Performance</h3>
              <div className="space-y-4">
                {Object.entries(difficultyBreakdown).map(([difficulty, percentage]) => (
                  <div key={difficulty} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${getDifficultyColor(difficulty)} flex items-center justify-center text-white`}>
                        {getDifficultyIcon(difficulty)}
                      </div>
                      <span className="text-white capitalize">{difficulty}</span>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <span className="text-sm text-neutral-400 block">Preference</span>
                        <span className="text-white font-medium">{percentage}%</span>
                      </div>
                      <div className="text-center">
                        <span className="text-sm text-neutral-400 block">Completed</span>
                        <span className="text-white font-medium">{userStats.statistics.completed[difficulty]}</span>
                      </div>
                      <div className="w-32 bg-neutral-700/50 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-gradient-to-r ${getDifficultyColor(difficulty)}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Progress Chart */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Monthly Progress</h3>
          <div className="grid grid-cols-6 gap-4">
            {Object.entries(userStats.statistics.monthlyProgress).reverse().map(([month, data]) => (
              <div key={month} className="text-center">
                <div className="text-sm text-neutral-400 mb-2">{month}</div>
                <div className="space-y-2">
                  <div className="bg-neutral-700/30 rounded-lg p-3">
                    <div className="text-lg font-bold text-white">{data.completed}</div>
                    <div className="text-xs text-neutral-400">Tasks</div>
                  </div>
                  <div className="bg-neutral-700/30 rounded-lg p-3">
                    <div className="text-lg font-bold text-white">{data.points}</div>
                    <div className="text-xs text-neutral-400">Points</div>
                  </div>
                  <div className="bg-neutral-700/30 rounded-lg p-3">
                    <div className={`text-lg font-bold ${getGradeColor(data.grade)}`}>{data.grade}</div>
                    <div className="text-xs text-neutral-400">Grade</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Achievements & Milestones</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userStats.achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  achievement.unlocked 
                    ? 'border-green-500/50 bg-green-500/10' 
                    : 'border-neutral-600/50 bg-neutral-700/30'
                }`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${
                      achievement.unlocked ? 'text-green-400' : 'text-neutral-400'
                    }`}>
                      {achievement.name}
                    </h4>
                    <p className="text-sm text-neutral-500">{achievement.description}</p>
                  </div>
                </div>
                {achievement.unlocked ? (
                  <div className="text-xs text-green-400">
                    Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </div>
                ) : (
                  <div className="text-xs text-neutral-500">
                    Progress: {achievement.progress}/{achievement.target}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Task Slots */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Current Task Slots</h3>
            <div className="space-y-3">
              {userStats.currentSlots.map((slot, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${
                    slot.empty ? 'bg-neutral-600' : 'bg-primary'
                  }`}></div>
                  <span className="text-neutral-400">Slot {index + 1}:</span>
                  {slot.empty ? (
                    <span className="text-neutral-500 italic">Empty</span>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span className="text-white">{slot.task.title}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        slot.task.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                        slot.task.status === 'claimed' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-neutral-500/20 text-neutral-400'
                      }`}>
                        {slot.task.status.replace('_', ' ')}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {userStats.cooldown && (
              <div className="mt-4 p-3 bg-neutral-700/30 rounded-lg">
                <div className="flex items-center space-x-2 text-sm text-neutral-400">
                  <ClockIcon className="w-4 h-4" />
                  <span>Cooldown until {new Date(userStats.cooldown.until).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
                <ArrowPathIcon className="w-5 h-5" />
                <span>Create New Task</span>
              </button>
              <button className="w-full px-4 py-3 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
                <EyeIcon className="w-5 h-5" />
                <span>View Task History</span>
              </button>
              <button className="w-full px-4 py-3 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
                <CogIcon className="w-5 h-5" />
                <span>Update Preferences</span>
              </button>
              <button className="w-full px-4 py-3 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2">
                <ChartBarIcon className="w-5 h-5" />
                <span>Export Data</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernUserAnalytics; 