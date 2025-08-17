import React, { useState, useEffect } from 'react';
import { 
  FireIcon, 
  SparklesIcon, 
  EyeDropperIcon, 
  ExclamationTriangleIcon, 
  RocketLaunchIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  PauseIcon,
  PlayIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  FlagIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  CalendarIcon,
  UserIcon,
  ChartBarIcon
} from '@heroicons/react/24/solid';
import { DIFFICULTY_OPTIONS } from '../constants';

const ModernActiveTasks = () => {
  const [activeTasks, setActiveTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    difficulty: 'all',
    type: 'all',
    timeRemaining: 'all'
  });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('deadline');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Simulated active tasks data based on legacy system
  useEffect(() => {
    const mockActiveTasks = [
      {
        id: 'task_001',
        title: 'Evening Submission Challenge',
        description: 'Complete evening routine tasks with photographic evidence',
        type: 'demand',
        difficulty: 'arousing',
        status: 'in_progress',
        progress: 65,
        timeRemaining: 7200000, // 2 hours in ms
        deadline: '2024-01-15T22:00:00Z',
        creator: {
          id: 'user_123',
          username: 'DomMaster',
          avatar: '/api/avatars/user_123.jpg'
        },
        performer: {
          id: 'user_456',
          username: 'SubmissiveOne',
          avatar: '/api/avatars/user_456.jpg'
        },
        enteredStateAt: '2024-01-15T18:00:00Z',
        percentageTimeElapsed: 65,
        slots: [
          { empty: false, task: { id: 'task_001', status: 'in_progress' } },
          { empty: true, task: null }
        ],
        cooldown: {
          until: '2024-01-16T06:00:00Z',
          duration: 28800000 // 8 hours
        },
        evidence: [],
        feedback: [],
        grade: null
      },
      {
        id: 'task_002',
        title: 'Weekend Performance Task',
        description: 'Complete weekend challenge with video documentation',
        type: 'perform',
        difficulty: 'explicit',
        status: 'claimed',
        progress: 25,
        timeRemaining: 86400000, // 24 hours in ms
        deadline: '2024-01-16T18:00:00Z',
        creator: {
          id: 'user_789',
          username: 'TaskCreator',
          avatar: '/api/avatars/user_789.jpg'
        },
        performer: {
          id: 'current_user',
          username: 'CurrentUser',
          avatar: '/api/avatars/current_user.jpg'
        },
        enteredStateAt: '2024-01-15T12:00:00Z',
        percentageTimeElapsed: 25,
        slots: [
          { empty: false, task: { id: 'task_002', status: 'claimed' } }
        ],
        cooldown: null,
        evidence: [],
        feedback: [],
        grade: null
      },
      {
        id: 'task_003',
        title: 'Daily Discipline Routine',
        description: 'Maintain daily discipline with progress tracking',
        type: 'demand',
        difficulty: 'titillating',
        status: 'completed',
        progress: 100,
        timeRemaining: 0,
        deadline: '2024-01-15T20:00:00Z',
        creator: {
          id: 'current_user',
          username: 'CurrentUser',
          avatar: '/api/avatars/current_user.jpg'
        },
        performer: {
          id: 'user_101',
          username: 'SubUser',
          avatar: '/api/avatars/user_101.jpg'
        },
        enteredStateAt: '2024-01-15T20:00:00Z',
        percentageTimeElapsed: 100,
        slots: [
          { empty: false, task: { id: 'task_003', status: 'completed' } }
        ],
        cooldown: {
          until: '2024-01-16T08:00:00Z',
          duration: 43200000 // 12 hours
        },
        evidence: [
          { type: 'photo', url: '/api/evidence/task_003_1.jpg', timestamp: '2024-01-15T20:00:00Z' }
        ],
        feedback: [
          { from: 'user_101', message: 'Task completed successfully', timestamp: '2024-01-15T20:00:00Z' }
        ],
        grade: null
      }
    ];

    setActiveTasks(mockActiveTasks);
    setFilteredTasks(mockActiveTasks);
  }, []);

  // Filter and sort tasks
  useEffect(() => {
    let filtered = [...activeTasks];

    // Apply filters
    if (filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(task => task.difficulty === filters.difficulty);
    }
    if (filters.type !== 'all') {
      filtered = filtered.filter(task => task.type === filters.type);
    }
    if (filters.timeRemaining !== 'all') {
      filtered = filtered.filter(task => {
        if (filters.timeRemaining === 'urgent') return task.timeRemaining < 3600000; // < 1 hour
        if (filters.timeRemaining === 'soon') return task.timeRemaining < 86400000; // < 24 hours
        if (filters.timeRemaining === 'extended') return task.timeRemaining >= 86400000; // >= 24 hours
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          return new Date(a.deadline) - new Date(b.deadline);
        case 'progress':
          return b.progress - a.progress;
        case 'difficulty':
          const difficultyOrder = ['titillating', 'arousing', 'explicit', 'edgy', 'hardcore'];
          return difficultyOrder.indexOf(a.difficulty) - difficultyOrder.indexOf(b.difficulty);
        case 'status':
          const statusOrder = ['claimed', 'in_progress', 'completed', 'expired'];
          return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
        default:
          return 0;
      }
    });

    setFilteredTasks(filtered);
  }, [activeTasks, filters, sortBy]);

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
      titillating: <SparklesIcon className="w-4 h-4" />,
      arousing: <FireIcon className="w-4 h-4" />,
      explicit: <EyeDropperIcon className="w-4 h-4" />,
      edgy: <ExclamationTriangleIcon className="w-4 h-4" />,
      hardcore: <RocketLaunchIcon className="w-4 h-4" />
    };
    return icons[difficulty] || <SparklesIcon className="w-4 h-4" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      claimed: 'bg-blue-500',
      'in_progress': 'bg-yellow-500',
      completed: 'bg-green-500',
      expired: 'bg-red-500',
      cancelled: 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusIcon = (status) => {
    const icons = {
      claimed: <ClockIcon className="w-4 h-4" />,
      'in_progress': <PlayIcon className="w-4 h-4" />,
      completed: <CheckCircleIcon className="w-4 h-4" />,
      expired: <XCircleIcon className="w-4 h-4" />,
      cancelled: <PauseIcon className="w-4 h-4" />
    };
    return icons[status] || <ClockIcon className="w-4 h-4" />;
  };

  const formatTimeRemaining = (timeRemaining) => {
    if (timeRemaining <= 0) return 'Expired';
    
    const hours = Math.floor(timeRemaining / 3600000);
    const minutes = Math.floor((timeRemaining % 3600000) / 60000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  const formatTimeElapsed = (timestamp) => {
    const elapsed = Date.now() - new Date(timestamp).getTime();
    const hours = Math.floor(elapsed / 3600000);
    const minutes = Math.floor((elapsed % 3600000) / 60000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ago`;
    }
    return `${minutes}m ago`;
  };

  const handleTaskAction = (taskId, action) => {
    console.log(`Action ${action} on task ${taskId}`);
    // Implement task actions (start, pause, complete, etc.)
  };

  const openTaskModal = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setSelectedTask(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-8">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Active Tasks</h1>
              <p className="text-neutral-400">
                Manage your active tasks, track progress, and monitor deadlines
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <ChartBarIcon className="w-5 h-5" />
                <span>Filters</span>
              </button>
              <div className="flex items-center space-x-2 bg-neutral-800/50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === 'grid' ? 'bg-primary text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                    <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                    <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                    <div className="w-1.5 h-1.5 bg-current rounded-sm"></div>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors duration-200 ${
                    viewMode === 'list' ? 'bg-primary text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <div className="w-4 h-4 flex flex-col space-y-0.5">
                    <div className="w-full h-1 bg-current rounded-sm"></div>
                    <div className="w-full h-1 bg-current rounded-sm"></div>
                    <div className="w-full h-1 bg-current rounded-sm"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Filter & Sort Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="claimed">Claimed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="expired">Expired</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Difficulty</label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                  className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Difficulties</option>
                  {DIFFICULTY_OPTIONS.map(difficulty => (
                    <option key={difficulty.value} value={difficulty.value}>
                      {difficulty.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="demand">Demand</option>
                  <option value="perform">Perform</option>
                </select>
              </div>

              {/* Time Remaining Filter */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Time Remaining</label>
                <select
                  value={filters.timeRemaining}
                  onChange={(e) => setFilters({ ...filters, timeRemaining: e.target.value })}
                  className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Times</option>
                  <option value="urgent">Urgent (&lt; 1 hour)</option>
                  <option value="soon">Soon (&lt; 24 hours)</option>
                  <option value="extended">Extended (≥ 24 hours)</option>
                </select>
              </div>
            </div>

            {/* Sort Options */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-neutral-300 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="deadline">Deadline</option>
                <option value="progress">Progress</option>
                <option value="difficulty">Difficulty</option>
                <option value="status">Status</option>
              </select>
            </div>
          </div>
        )}

        {/* Task Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm">Total Active</p>
                <p className="text-2xl font-bold text-white">{filteredTasks.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm">In Progress</p>
                <p className="text-2xl font-bold text-white">
                  {filteredTasks.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <PlayIcon className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm">Completed</p>
                <p className="text-2xl font-bold text-white">
                  {filteredTasks.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm">Urgent</p>
                <p className="text-2xl font-bold text-white">
                  {filteredTasks.filter(t => t.timeRemaining < 3600000).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                <ExclamationCircleIcon className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onAction={handleTaskAction}
                onView={openTaskModal}
                getDifficultyColor={getDifficultyColor}
                getDifficultyIcon={getDifficultyIcon}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
                formatTimeRemaining={formatTimeRemaining}
                formatTimeElapsed={formatTimeElapsed}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <TaskListItem
                key={task.id}
                task={task}
                onAction={handleTaskAction}
                onView={openTaskModal}
                getDifficultyColor={getDifficultyColor}
                getDifficultyIcon={getDifficultyIcon}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
                formatTimeRemaining={formatTimeRemaining}
                formatTimeElapsed={formatTimeElapsed}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-neutral-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ClockIcon className="w-12 h-12 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Active Tasks</h3>
            <p className="text-neutral-400 mb-6">
              {activeTasks.length === 0 
                ? "You don't have any active tasks yet. Create a new task to get started!"
                : "No tasks match your current filters. Try adjusting your filter criteria."
              }
            </p>
            {activeTasks.length === 0 && (
              <button className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors duration-200">
                Create New Task
              </button>
            )}
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {showTaskModal && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={closeTaskModal}
          onAction={handleTaskAction}
          getDifficultyColor={getDifficultyColor}
          getDifficultyIcon={getDifficultyIcon}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
          formatTimeRemaining={formatTimeRemaining}
          formatTimeElapsed={formatTimeElapsed}
        />
      )}
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task, onAction, onView, getDifficultyColor, getDifficultyIcon, getStatusColor, getStatusIcon, formatTimeRemaining, formatTimeElapsed }) => {
  return (
    <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 overflow-hidden hover:border-neutral-600/50 transition-all duration-200">
      {/* Task Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getDifficultyColor(task.difficulty)} flex items-center justify-center text-white`}>
              {getDifficultyIcon(task.difficulty)}
            </div>
            <div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)} text-white`}>
                {getStatusIcon(task.status)}
                <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
              </span>
            </div>
          </div>
          <button
            onClick={() => onView(task)}
            className="text-neutral-400 hover:text-white transition-colors duration-200"
          >
            <EyeIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Task Title & Description */}
        <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{task.title}</h3>
        <p className="text-neutral-400 text-sm mb-4 line-clamp-3">{task.description}</p>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-neutral-400">Progress</span>
            <span className="text-white font-medium">{task.progress}%</span>
          </div>
          <div className="w-full bg-neutral-700/50 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                task.progress === 100 ? 'bg-green-500' : 'bg-primary'
              }`}
              style={{ width: `${task.progress}%` }}
            ></div>
          </div>
        </div>

        {/* Task Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Type</span>
            <span className="text-white capitalize">{task.type}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Time Remaining</span>
            <span className={`font-medium ${
              task.timeRemaining < 3600000 ? 'text-red-400' : 
              task.timeRemaining < 86400000 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {formatTimeRemaining(task.timeRemaining)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-400">Started</span>
            <span className="text-white">{formatTimeElapsed(task.enteredStateAt)}</span>
          </div>
        </div>
      </div>

      {/* Task Actions */}
      <div className="px-6 py-4 bg-neutral-700/30 border-t border-neutral-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img 
              src={task.performer.avatar} 
              alt={task.performer.username}
              className="w-8 h-8 rounded-full border-2 border-neutral-600"
            />
            <span className="text-sm text-neutral-300">{task.performer.username}</span>
          </div>
          <div className="flex items-center space-x-2">
            {task.status === 'claimed' && (
              <button
                onClick={() => onAction(task.id, 'start')}
                className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-xs rounded-lg transition-colors duration-200"
              >
                Start
              </button>
            )}
            {task.status === 'in_progress' && (
              <button
                onClick={() => onAction(task.id, 'pause')}
                className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded-lg transition-colors duration-200"
              >
                Pause
              </button>
            )}
            {task.status === 'in_progress' && (
              <button
                onClick={() => onAction(task.id, 'complete')}
                className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg transition-colors duration-200"
              >
                Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Task List Item Component
const TaskListItem = ({ task, onAction, onView, getDifficultyColor, getDifficultyIcon, getStatusColor, getStatusIcon, formatTimeRemaining, formatTimeElapsed }) => {
  return (
    <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6 hover:border-neutral-600/50 transition-all duration-200">
      <div className="flex items-center space-x-6">
        {/* Task Icon & Status */}
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getDifficultyColor(task.difficulty)} flex items-center justify-center text-white`}>
            {getDifficultyIcon(task.difficulty)}
          </div>
          <div className="text-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)} text-white`}>
              {getStatusIcon(task.status)}
              <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
            </span>
          </div>
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white truncate">{task.title}</h3>
            <button
              onClick={() => onView(task)}
              className="text-neutral-400 hover:text-white transition-colors duration-200 ml-4"
            >
              <EyeIcon className="w-5 h-5" />
            </button>
          </div>
          <p className="text-neutral-400 text-sm mb-3 line-clamp-2">{task.description}</p>
          
          {/* Progress & Info */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-neutral-400">Progress:</span>
              <span className="text-white font-medium">{task.progress}%</span>
              <div className="w-20 bg-neutral-700/50 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    task.progress === 100 ? 'bg-green-500' : 'bg-primary'
                  }`}
                  style={{ width: `${task.progress}%` }}
                ></div>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-neutral-400">Type: <span className="text-white capitalize">{task.type}</span></span>
              <span className="text-neutral-400">Started: <span className="text-white">{formatTimeElapsed(task.enteredStateAt)}</span></span>
            </div>
          </div>
        </div>

        {/* Right Side Info */}
        <div className="text-right">
          <div className="mb-2">
            <span className={`text-sm font-medium ${
              task.timeRemaining < 3600000 ? 'text-red-400' : 
              task.timeRemaining < 86400000 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {formatTimeRemaining(task.timeRemaining)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <img 
              src={task.performer.avatar} 
              alt={task.performer.username}
              className="w-8 h-8 rounded-full border-2 border-neutral-600"
            />
            <span className="text-sm text-neutral-300">{task.performer.username}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {task.status === 'claimed' && (
            <button
              onClick={() => onAction(task.id, 'start')}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm rounded-lg transition-colors duration-200"
            >
              Start
            </button>
          )}
          {task.status === 'in_progress' && (
            <>
              <button
                onClick={() => onAction(task.id, 'pause')}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-lg transition-colors duration-200"
              >
                Pause
              </button>
              <button
                onClick={() => onAction(task.id, 'complete')}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors duration-200"
              >
                Complete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Task Detail Modal Component
const TaskDetailModal = ({ task, onClose, onAction, getDifficultyColor, getDifficultyIcon, getStatusColor, getStatusIcon, formatTimeRemaining, formatTimeElapsed }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-800/90 backdrop-blur-md rounded-2xl border border-neutral-700/50 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="p-6 border-b border-neutral-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getDifficultyColor(task.difficulty)} flex items-center justify-center text-white`}>
                {getDifficultyIcon(task.difficulty)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{task.title}</h2>
                <div className="flex items-center space-x-3 mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)} text-white`}>
                    {getStatusIcon(task.status)}
                    <span className="ml-2 capitalize">{task.status.replace('_', ' ')}</span>
                  </span>
                  <span className="text-neutral-400">•</span>
                  <span className="text-neutral-400 capitalize">{task.type}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-400 hover:text-white transition-colors duration-200"
            >
              <XCircleIcon className="w-8 h-8" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                <p className="text-neutral-300 leading-relaxed">{task.description}</p>
              </div>

              {/* Progress Section */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Progress</h3>
                <div className="bg-neutral-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-neutral-400">Task Progress</span>
                    <span className="text-white font-medium">{task.progress}%</span>
                  </div>
                  <div className="w-full bg-neutral-600/50 rounded-full h-3 mb-4">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        task.progress === 100 ? 'bg-green-500' : 'bg-primary'
                      }`}
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-neutral-400">Started:</span>
                      <span className="text-white ml-2">{formatTimeElapsed(task.enteredStateAt)}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400">Time Remaining:</span>
                      <span className={`font-medium ml-2 ${
                        task.timeRemaining < 3600000 ? 'text-red-400' : 
                        task.timeRemaining < 86400000 ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {formatTimeRemaining(task.timeRemaining)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evidence & Feedback */}
              {(task.evidence.length > 0 || task.feedback.length > 0) && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Evidence & Feedback</h3>
                  <div className="space-y-4">
                    {task.evidence.map((evidence, index) => (
                      <div key={index} className="bg-neutral-700/30 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-sm text-neutral-400">Evidence {index + 1}</span>
                          <span className="text-xs text-neutral-500">{new Date(evidence.timestamp).toLocaleString()}</span>
                        </div>
                        {evidence.type === 'photo' && (
                          <img src={evidence.url} alt="Task evidence" className="w-full h-48 object-cover rounded-lg" />
                        )}
                      </div>
                    ))}
                    {task.feedback.map((feedback, index) => (
                      <div key={index} className="bg-neutral-700/30 rounded-lg p-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-sm text-neutral-400">Feedback from {feedback.from}</span>
                          <span className="text-xs text-neutral-500">{new Date(feedback.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-neutral-300">{feedback.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Task Details */}
              <div className="bg-neutral-700/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Task Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Difficulty:</span>
                    <span className="text-white capitalize">{task.difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Type:</span>
                    <span className="text-white capitalize">{task.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Status:</span>
                    <span className="text-white capitalize">{task.status.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Deadline:</span>
                    <span className="text-white">{new Date(task.deadline).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Participants */}
              <div className="bg-neutral-700/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Participants</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-neutral-400 block mb-2">Creator</span>
                    <div className="flex items-center space-x-3">
                      <img 
                        src={task.creator.avatar} 
                        alt={task.creator.username}
                        className="w-10 h-10 rounded-full border-2 border-neutral-600"
                      />
                      <span className="text-white font-medium">{task.creator.username}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-neutral-400 block mb-2">Performer</span>
                    <div className="flex items-center space-x-3">
                      <img 
                        src={task.performer.avatar} 
                        alt={task.performer.username}
                        className="w-10 h-10 rounded-full border-2 border-neutral-600"
                      />
                      <span className="text-white font-medium">{task.performer.username}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="bg-neutral-700/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Actions</h3>
                <div className="space-y-3">
                  {task.status === 'claimed' && (
                    <button
                      onClick={() => onAction(task.id, 'start')}
                      className="w-full px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors duration-200"
                    >
                      Start Task
                    </button>
                  )}
                  {task.status === 'in_progress' && (
                    <>
                      <button
                        onClick={() => onAction(task.id, 'pause')}
                        className="w-full px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors duration-200"
                      >
                        Pause Task
                      </button>
                      <button
                        onClick={() => onAction(task.id, 'complete')}
                        className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors duration-200"
                      >
                        Complete Task
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => onAction(task.id, 'message')}
                    className="w-full px-4 py-2 bg-neutral-600 hover:bg-neutral-500 text-white rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <ChatBubbleLeftIcon className="w-4 h-4" />
                    <span>Send Message</span>
                  </button>
                  <button
                    onClick={() => onAction(task.id, 'report')}
                    className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <FlagIcon className="w-4 h-4" />
                    <span>Report Issue</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernActiveTasks; 