import React, { useState, useEffect } from 'react';
import { 
  FireIcon, 
  SparklesIcon, 
  EyeDropperIcon, 
  ExclamationTriangleIcon, 
  RocketLaunchIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  HeartIcon,
  EyeIcon,
  ClockIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { DIFFICULTY_OPTIONS, DARE_TYPE_OPTIONS, STATUS_OPTIONS } from '../constants';

const ModernTaskBrowser = () => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Sensual Massage Challenge',
      description: 'Perform a sensual massage for your partner with specific techniques and timing requirements.',
      difficulty: 'arousing',
      type: 'submission',
      status: 'soliciting',
      creator: 'Alex',
      participants: 3,
      maxParticipants: 5,
      timeLimit: 48,
      createdAt: '2 hours ago',
      isLiked: false,
      isPublic: true
    },
    {
      id: 2,
      title: 'Photo Challenge: Artistic Nude',
      description: 'Create artistic nude photography that showcases beauty and creativity.',
      difficulty: 'explicit',
      type: 'submission',
      status: 'soliciting',
      creator: 'Jordan',
      participants: 1,
      maxParticipants: 3,
      timeLimit: 72,
      createdAt: '1 day ago',
      isLiked: true,
      isPublic: true
    },
    {
      id: 3,
      title: 'BDSM Roleplay Scenario',
      description: 'Complete a detailed BDSM roleplay scenario with specific power dynamics.',
      difficulty: 'edgy',
      type: 'switch',
      status: 'soliciting',
      creator: 'Sam',
      participants: 2,
      maxParticipants: 4,
      timeLimit: 24,
      createdAt: '3 days ago',
      isLiked: false,
      isPublic: false
    },
    {
      id: 4,
      title: 'Public Exposure Dare',
      description: 'Complete a public exposure challenge with specific safety guidelines.',
      difficulty: 'hardcore',
      type: 'submission',
      status: 'soliciting',
      creator: 'Taylor',
      participants: 0,
      maxParticipants: 2,
      timeLimit: 12,
      createdAt: '5 days ago',
      isLiked: false,
      isPublic: true
    }
  ]);

  const [filters, setFilters] = useState({
    search: '',
    difficulties: [],
    types: [],
    status: '',
    publicOnly: false
  });

  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);

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

  const getStatusColor = (status) => {
    const colors = {
      soliciting: 'bg-info/20 text-info',
      in_progress: 'bg-warning/20 text-warning',
      completed: 'bg-success/20 text-success',
      rejected: 'bg-danger/20 text-danger',
      cancelled: 'bg-neutral-600/20 text-neutral-400'
    };
    return colors[status] || 'bg-neutral-600/20 text-neutral-400';
  };

  const getStatusIcon = (status) => {
    const icons = {
      soliciting: <EyeIcon className="w-4 h-4" />,
      in_progress: <ClockIcon className="w-4 h-4" />,
      completed: <CheckCircleIcon className="w-4 h-4" />,
      rejected: <XCircleIcon className="w-4 h-4" />,
      cancelled: <XCircleIcon className="w-4 h-4" />
    };
    return icons[status] || <EyeIcon className="w-4 h-4" />;
  };

  const toggleDifficulty = (difficulty) => {
    setFilters(prev => ({
      ...prev,
      difficulties: prev.difficulties.includes(difficulty)
        ? prev.difficulties.filter(d => d !== difficulty)
        : [...prev.difficulties, difficulty]
    }));
  };

  const toggleType = (type) => {
    setFilters(prev => ({
      ...prev,
      types: prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  };

  const toggleLike = (taskId) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, isLiked: !task.isLiked } : task
    ));
  };

  const filteredTasks = tasks.filter(task => {
    // Search filter
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Difficulty filter
    if (filters.difficulties.length > 0 && !filters.difficulties.includes(task.difficulty)) {
      return false;
    }
    
    // Type filter
    if (filters.types.length > 0 && !filters.types.includes(task.type)) {
      return false;
    }
    
    // Status filter
    if (filters.status && task.status !== filters.status) {
      return false;
    }
    
    // Public only filter
    if (filters.publicOnly && !task.isPublic) {
      return false;
    }
    
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'difficulty':
        const difficultyOrder = { titillating: 1, arousing: 2, explicit: 3, edgy: 4, hardcore: 5 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      case 'participants':
        return b.participants - a.participants;
      default:
        return 0;
    }
  });

  const clearFilters = () => {
    setFilters({
      search: '',
      difficulties: [],
      types: [],
      status: '',
      publicOnly: false
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-8">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Browse Tasks</h1>
          <p className="text-neutral-400 text-lg">Discover challenges that match your interests and abilities</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                showFilters
                  ? 'bg-primary text-white'
                  : 'bg-neutral-700/50 text-neutral-300 hover:bg-neutral-600/50'
              }`}
            >
              <FunnelIcon className="w-5 h-5" />
              <span>Filters</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex bg-neutral-700/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-primary text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-primary text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                List
              </button>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="difficulty">By Difficulty</option>
              <option value="participants">Most Popular</option>
            </select>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-neutral-700/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Difficulty Filter */}
                <div>
                  <h3 className="text-white font-medium mb-3">Difficulty</h3>
                  <div className="space-y-2">
                    {DIFFICULTY_OPTIONS.map((difficulty) => (
                      <label key={difficulty.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.difficulties.includes(difficulty.value)}
                          onChange={() => toggleDifficulty(difficulty.value)}
                          className="w-4 h-4 text-primary focus:ring-primary border-neutral-600 bg-neutral-700 rounded"
                        />
                        <span className="text-neutral-300 text-sm">{difficulty.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Type Filter */}
                <div>
                  <h3 className="text-white font-medium mb-3">Type</h3>
                  <div className="space-y-2">
                    {DARE_TYPE_OPTIONS.slice(1).map((type) => (
                      <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.types.includes(type.value)}
                          onChange={() => toggleType(type.value)}
                          className="w-4 h-4 text-primary focus:ring-primary border-neutral-600 bg-neutral-700 rounded"
                        />
                        <span className="text-neutral-300 text-sm">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <h3 className="text-white font-medium mb-3">Status</h3>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 bg-neutral-700/50 border border-neutral-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">All Statuses</option>
                    {STATUS_OPTIONS.slice(1).map((status) => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>

                {/* Public Only Filter */}
                <div>
                  <h3 className="text-white font-medium mb-3">Visibility</h3>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.publicOnly}
                      onChange={(e) => setFilters(prev => ({ ...prev, publicOnly: e.target.checked }))}
                      className="w-4 h-4 text-primary focus:ring-primary border-neutral-600 bg-neutral-700 rounded"
                    />
                    <span className="text-neutral-300 text-sm">Public Only</span>
                  </label>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-neutral-400 hover:text-white transition-colors duration-200"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-neutral-400">
            Showing {sortedTasks.length} of {tasks.length} tasks
          </p>
          {filters.difficulties.length > 0 || filters.types.length > 0 || filters.status || filters.publicOnly ? (
            <div className="flex flex-wrap gap-2">
              {filters.difficulties.map(difficulty => (
                <span
                  key={difficulty}
                  className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getDifficultyColor(difficulty)} text-white`}
                >
                  {getDifficultyIcon(difficulty)}
                  <span className="capitalize">{difficulty}</span>
                </span>
              ))}
              {filters.types.map(type => (
                <span key={type} className="px-2 py-1 bg-info/20 text-info rounded-full text-xs font-medium">
                  {type}
                </span>
              ))}
              {filters.status && (
                <span className="px-2 py-1 bg-warning/20 text-warning rounded-full text-xs font-medium">
                  {filters.status}
                </span>
              )}
              {filters.publicOnly && (
                <span className="px-2 py-1 bg-success/20 text-success rounded-full text-xs font-medium">
                  Public Only
                </span>
              )}
            </div>
          ) : null}
        </div>

        {/* Tasks Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTasks.map((task) => (
              <TaskCard key={task.id} task={task} onLikeToggle={toggleLike} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTasks.map((task) => (
              <TaskListItem key={task.id} task={task} onLikeToggle={toggleLike} />
            ))}
          </div>
        )}

        {sortedTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-neutral-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <MagnifyingGlassIcon className="w-12 h-12 text-neutral-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No tasks found</h3>
            <p className="text-neutral-400">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    </div>
  );
};

const TaskCard = ({ task, onLikeToggle }) => {
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

  const getStatusColor = (status) => {
    const colors = {
      soliciting: 'bg-info/20 text-info',
      in_progress: 'bg-warning/20 text-warning',
      completed: 'bg-success/20 text-success',
      rejected: 'bg-danger/20 text-danger',
      cancelled: 'bg-neutral-600/20 text-neutral-400'
    };
    return colors[status] || 'bg-neutral-600/20 text-neutral-400';
  };

  const getStatusIcon = (status) => {
    const icons = {
      soliciting: <EyeIcon className="w-4 h-4" />,
      in_progress: <ClockIcon className="w-4 h-4" />,
      completed: <CheckCircleIcon className="w-4 h-4" />,
      rejected: <XCircleIcon className="w-4 h-4" />,
      cancelled: <XCircleIcon className="w-4 h-4" />
    };
    return icons[status] || <EyeIcon className="w-4 h-4" />;
  };

  return (
    <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 overflow-hidden hover:border-neutral-600/50 transition-all duration-200 group">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary transition-colors duration-200">
              {task.title}
            </h3>
            <p className="text-neutral-400 text-sm line-clamp-2">{task.description}</p>
          </div>
          <button
            onClick={() => onLikeToggle(task.id)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              task.isLiked
                ? 'text-primary hover:text-primary-dark'
                : 'text-neutral-400 hover:text-neutral-300'
            }`}
          >
            <HeartIcon className={`w-5 h-5 ${task.isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Difficulty Badge */}
        <div className="flex items-center space-x-2 mb-4">
          <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getDifficultyColor(task.difficulty)} text-white`}>
            {getDifficultyIcon(task.difficulty)}
            <span className="capitalize">{task.difficulty}</span>
          </span>
          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
            {getStatusIcon(task.status)}
            <span className="capitalize">{task.status.replace('_', ' ')}</span>
          </span>
        </div>

        {/* Task Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-neutral-400">
            <UserIcon className="w-4 h-4" />
            <span>{task.creator}</span>
          </div>
          <div className="flex items-center space-x-2 text-neutral-400">
            <ClockIcon className="w-4 h-4" />
            <span>{task.timeLimit}h</span>
          </div>
          <div className="flex items-center space-x-2 text-neutral-400">
            <UserIcon className="w-4 h-4" />
            <span>{task.participants}/{task.maxParticipants}</span>
          </div>
          <div className="flex items-center space-x-2 text-neutral-400">
            <ClockIcon className="w-4 h-4" />
            <span>{task.createdAt}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-neutral-700/30 border-t border-neutral-700/50">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500">
            {task.isPublic ? 'Public' : 'Private'}
          </span>
          <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

const TaskListItem = ({ task, onLikeToggle }) => {
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

  return (
    <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6 hover:border-neutral-600/50 transition-all duration-200">
      <div className="flex items-center space-x-6">
        {/* Difficulty Badge */}
        <div className="flex-shrink-0">
          <span className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r ${getDifficultyColor(task.difficulty)} text-white`}>
            {getDifficultyIcon(task.difficulty)}
            <span className="capitalize">{task.difficulty}</span>
          </span>
        </div>

        {/* Task Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-white truncate">{task.title}</h3>
            <button
              onClick={() => onLikeToggle(task.id)}
              className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${
                task.isLiked
                  ? 'text-primary hover:text-primary-dark'
                  : 'text-neutral-400 hover:text-neutral-300'
              }`}
            >
              <HeartIcon className={`w-5 h-5 ${task.isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>
          <p className="text-neutral-400 text-sm mb-3">{task.description}</p>
          
          <div className="flex items-center space-x-6 text-sm text-neutral-400">
            <span className="flex items-center space-x-1">
              <UserIcon className="w-4 h-4" />
              <span>{task.creator}</span>
            </span>
            <span className="flex items-center space-x-1">
              <ClockIcon className="w-4 h-4" />
              <span>{task.timeLimit}h limit</span>
            </span>
            <span className="flex items-center space-x-1">
              <UserIcon className="w-4 h-4" />
              <span>{task.participants}/{task.maxParticipants} participants</span>
            </span>
            <span className="flex items-center space-x-1">
              <ClockIcon className="w-4 h-4" />
              <span>{task.createdAt}</span>
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex-shrink-0">
          <button className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModernTaskBrowser; 