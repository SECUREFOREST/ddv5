import React, { useState, useEffect } from 'react';
import { 
  UserIcon, 
  FireIcon, 
  SparklesIcon, 
  EyeDropperIcon, 
  ExclamationTriangleIcon, 
  RocketLaunchIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { DIFFICULTY_ICONS, DIFFICULTY_OPTIONS } from '../constants';

const ModernDashboard = () => {
  const [userStats, setUserStats] = useState({
    averageGrade: 8.5,
    totalTasks: 47,
    roleBreakdown: { dom: 65, sub: 35 },
    difficultyBreakdown: {
      titillating: 15,
      arousing: 25,
      explicit: 30,
      edgy: 20,
      hardcore: 10
    },
    completed: {
      titillating: 3,
      arousing: 5,
      explicit: 6,
      edgy: 4,
      hardcore: 2
    }
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'submission',
      user: 'Alex',
      action: 'submitted to your demand',
      task: 'Sensual massage challenge',
      difficulty: 'arousing',
      time: '2 hours ago',
      grade: null
    },
    {
      id: 2,
      type: 'fulfillment',
      user: 'Jordan',
      action: 'fulfilled your demand',
      task: 'Photo challenge',
      difficulty: 'titillating',
      time: '1 day ago',
      grade: 9
    },
    {
      id: 3,
      type: 'grading',
      user: 'Sam',
      action: 'graded your task',
      task: 'Dance performance',
      difficulty: 'explicit',
      time: '3 days ago',
      grade: 8
    }
  ]);

  const [activeSlots, setActiveSlots] = useState([
    { id: 1, empty: false, task: { id: 'task_123', status: 'in_progress', title: 'Sensual massage challenge' } },
    { id: 2, empty: true, task: null },
    { id: 3, empty: true, task: null }
  ]);

  const [cooldown, setCooldown] = useState({
    until: new Date(Date.now() + 3600000), // 1 hour from now
    duration: 3600000
  });

  const [selectedDifficulties, setSelectedDifficulties] = useState(['titillating', 'arousing']);

  const toggleDifficulty = (difficulty) => {
    setSelectedDifficulties(prev => 
      prev.includes(difficulty) 
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      titillating: 'from-pink-400 to-pink-600',
      arousing: 'from-purple-500 to-purple-700',
      explicit: 'from-red-500 to-red-700',
      edgy: 'from-yellow-400 to-yellow-600',
      hardcore: 'from-gray-800 to-black'
    };
    return colors[difficulty] || 'from-gray-500 to-gray-700';
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

  const formatTimeRemaining = () => {
    const now = new Date();
    const timeLeft = cooldown.until - now;
    
    if (timeLeft <= 0) return 'Ready for new tasks!';
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary-dark to-primary-darker">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-6 py-8 sm:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <UserIcon className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">Welcome back, User</h1>
                <p className="text-white/80 text-lg">Ready to explore new challenges?</p>
              </div>
              <div className="hidden sm:flex space-x-3">
                <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm">
                  <PlusIcon className="w-5 h-5 inline mr-2" />
                  Create Demand
                </button>
                <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm">
                  <MagnifyingGlassIcon className="w-5 h-5 inline mr-2" />
                  Browse Tasks
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 sm:px-8 lg:px-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm font-medium">Average Grade</p>
                <p className="text-3xl font-bold text-white">{userStats.averageGrade}</p>
              </div>
              <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-success" />
              </div>
            </div>
          </div>

          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm font-medium">Total Tasks</p>
                <p className="text-3xl font-bold text-white">{userStats.totalTasks}</p>
              </div>
              <div className="w-12 h-12 bg-info/20 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-info" />
              </div>
            </div>
          </div>

          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm font-medium">Active Slots</p>
                <p className="text-3xl font-bold text-white">
                  {activeSlots.filter(slot => !slot.empty).length}/{activeSlots.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-warning" />
              </div>
            </div>
          </div>

          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm font-medium">Role Balance</p>
                <p className="text-3xl font-bold text-white">{userStats.roleBreakdown.dom}%</p>
                <p className="text-sm text-neutral-400">Dominant</p>
              </div>
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Difficulty Filter */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Difficulty Preferences</h3>
          <div className="flex flex-wrap gap-3">
            {DIFFICULTY_OPTIONS.map((difficulty) => (
              <button
                key={difficulty.value}
                onClick={() => toggleDifficulty(difficulty.value)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedDifficulties.includes(difficulty.value)
                    ? `bg-gradient-to-r ${getDifficultyColor(difficulty.value)} text-white shadow-lg`
                    : 'bg-neutral-700/50 text-neutral-300 hover:bg-neutral-600/50'
                }`}
              >
                {getDifficultyIcon(difficulty.value)}
                <span>{difficulty.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Task Slots */}
          <div className="lg:col-span-2">
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Task Slots</h3>
                <div className="text-sm text-neutral-400">
                  {formatTimeRemaining()}
                </div>
              </div>
              
              <div className="space-y-4">
                {activeSlots.map((slot, index) => (
                  <div
                    key={slot.id}
                    className={`p-4 rounded-lg border-2 border-dashed transition-all duration-200 ${
                      slot.empty
                        ? 'border-neutral-600 bg-neutral-700/30 hover:border-neutral-500'
                        : 'border-success/50 bg-success/10'
                    }`}
                  >
                    {slot.empty ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-neutral-600/50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <PlusIcon className="w-8 h-8 text-neutral-400" />
                        </div>
                        <p className="text-neutral-400 font-medium">Empty Slot</p>
                        <p className="text-neutral-500 text-sm">Ready for new tasks</p>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center">
                          <CheckCircleIcon className="w-6 h-6 text-success" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-medium">{slot.task.title}</h4>
                          <p className="text-neutral-400 text-sm">In Progress</p>
                        </div>
                        <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                          View
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 bg-neutral-700/30 rounded-lg">
                    <div className="w-10 h-10 bg-neutral-600 rounded-full flex items-center justify-center flex-shrink-0">
                      {activity.type === 'submission' && <PlusIcon className="w-5 h-5 text-info" />}
                      {activity.type === 'fulfillment' && <CheckCircleIcon className="w-5 h-5 text-success" />}
                      {activity.type === 'grading' && <ChartBarIcon className="w-5 h-5 text-warning" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm">
                        <span className="font-medium text-primary">{activity.user}</span>{' '}
                        {activity.action}
                      </p>
                      <p className="text-neutral-400 text-sm mt-1">{activity.task}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getDifficultyColor(activity.difficulty)} text-white`}>
                          {getDifficultyIcon(activity.difficulty)}
                          <span className="ml-1">{activity.difficulty}</span>
                        </span>
                        <span className="text-neutral-500 text-xs">{activity.time}</span>
                        {activity.grade && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success">
                            Grade: {activity.grade}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Difficulty Breakdown Chart */}
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
              <h3 className="text-xl font-semibold text-white mb-4">Difficulty Breakdown</h3>
              <div className="space-y-4">
                {Object.entries(userStats.difficultyBreakdown).map(([difficulty, percentage]) => (
                  <div key={difficulty} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getDifficultyIcon(difficulty)}
                        <span className="text-white text-sm font-medium capitalize">{difficulty}</span>
                      </div>
                      <span className="text-neutral-400 text-sm">{percentage}%</span>
                    </div>
                    <div className="w-full bg-neutral-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${getDifficultyColor(difficulty)}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
              <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary-darker text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2">
                  <PlusIcon className="w-5 h-5" />
                  <span>Create Demand</span>
                </button>
                <button className="w-full bg-gradient-to-r from-info to-info-dark hover:from-info-dark hover:to-info-darker text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2">
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  <span>Browse Tasks</span>
                </button>
                <button className="w-full bg-gradient-to-r from-success to-success-dark hover:from-success-dark hover:to-success-darker text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2">
                  <UserIcon className="w-5 h-5" />
                  <span>View Profile</span>
                </button>
              </div>
            </div>

            {/* Cooldown Timer */}
            {cooldown.until > new Date() && (
              <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
                <h3 className="text-xl font-semibold text-white mb-4">Cooldown Timer</h3>
                <div className="text-center">
                  <div className="w-20 h-20 bg-warning/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ClockIcon className="w-10 h-10 text-warning" />
                  </div>
                  <p className="text-white text-lg font-medium mb-2">New actions unlocked in:</p>
                  <p className="text-warning text-2xl font-bold">{formatTimeRemaining()}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernDashboard; 