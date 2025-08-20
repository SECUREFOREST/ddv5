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
  XCircleIcon,
  TrophyIcon,
  PlayIcon,
  PlusIcon,
  DocumentPlusIcon,
  UserGroupIcon,
  BoltIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  PuzzlePieceIcon
} from '@heroicons/react/24/solid';
import { DIFFICULTY_OPTIONS, DARE_TYPE_OPTIONS, STATUS_OPTIONS } from '../../constants';

const ModernDarePerformerDashboard = () => {
  const [dares, setDares] = useState([
    {
      id: 1,
      title: 'Sensual Massage Challenge',
      description: 'Perform a sensual massage for your partner with specific techniques and timing requirements.',
      difficulty: 'arousing',
      type: 'submission',
      status: 'in_progress',
      creator: 'Alex',
      performer: 'Jordan',
      participants: 1,
      maxParticipants: 1,
      timeLimit: 48,
      createdAt: '2 hours ago',
      isLiked: false,
      isPublic: true,
      progress: 65,
      deadline: '2024-01-15T18:00:00Z'
    },
    {
      id: 2,
      title: 'Photo Challenge: Artistic Nude',
      description: 'Create artistic nude photography that showcases beauty and creativity.',
      difficulty: 'explicit',
      type: 'submission',
      status: 'waiting_for_participant',
      creator: 'Sam',
      performer: null,
      participants: 0,
      maxParticipants: 1,
      timeLimit: 72,
      createdAt: '1 day ago',
      isLiked: true,
      isPublic: true,
      progress: 0,
      deadline: '2024-01-17T12:00:00Z'
    },
    {
      id: 3,
      title: 'BDSM Roleplay Scenario',
      description: 'Complete a detailed BDSM roleplay scenario with specific power dynamics.',
      difficulty: 'edgy',
      type: 'switch',
      status: 'completed',
      creator: 'Taylor',
      performer: 'Jordan',
      participants: 2,
      maxParticipants: 2,
      timeLimit: 24,
      createdAt: '3 days ago',
      isLiked: false,
      isPublic: false,
      progress: 100,
      deadline: '2024-01-12T20:00:00Z',
      completedAt: '2024-01-12T18:30:00Z',
      grade: 'A+'
    },
    {
      id: 4,
      title: 'Public Exposure Dare',
      description: 'Complete a public exposure challenge with specific safety guidelines.',
      difficulty: 'hardcore',
      type: 'submission',
      status: 'waiting_for_participant',
      creator: 'Jordan',
      performer: null,
      participants: 0,
      maxParticipants: 1,
      timeLimit: 12,
      createdAt: '5 days ago',
      isLiked: false,
      isPublic: true,
      progress: 0,
      deadline: '2024-01-14T06:00:00Z'
    }
  ]);

  const [filters, setFilters] = useState({
    search: '',
    difficulties: [],
    types: [],
    status: '',
    publicOnly: false,
    myDares: false
  });

  const [sortBy, setSortBy] = useState('deadline');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'active', 'completed', 'available'

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
      waiting_for_participant: 'bg-info/20 text-info',
      in_progress: 'bg-warning/20 text-warning',
      completed: 'bg-success/20 text-success',
      rejected: 'bg-danger/20 text-danger',
      cancelled: 'bg-neutral-600/20 text-neutral-400',
      approved: 'bg-blue-500/20 text-blue-400'
    };
    return colors[status] || 'bg-neutral-600/20 text-neutral-400';
  };

  const getStatusIcon = (status) => {
    const icons = {
      waiting_for_participant: <EyeIcon className="w-4 h-4" />,
      in_progress: <ClockIcon className="w-4 h-4" />,
      completed: <CheckCircleIcon className="w-4 h-4" />,
      rejected: <XCircleIcon className="w-4 h-4" />,
      cancelled: <XCircleIcon className="w-4 h-4" />,
      approved: <CheckCircleIcon className="w-4 h-4" />
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

  const toggleLike = (dareId) => {
    setDares(prev => prev.map(dare => 
      dare.id === dareId ? { ...dare, isLiked: !dare.isLiked } : dare
    ));
  };

  const filteredDares = dares.filter(dare => {
    // Search filter
    if (filters.search && !dare.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Difficulty filter
    if (filters.difficulties.length > 0 && !filters.difficulties.includes(dare.difficulty)) {
      return false;
    }
    
    // Type filter
    if (filters.types.length > 0 && !filters.types.includes(dare.type)) {
      return false;
    }
    
    // Status filter
    if (filters.status && dare.status !== filters.status) {
      return false;
    }
    
    // Public only filter
    if (filters.publicOnly && !dare.isPublic) {
      return false;
    }

    // My dares filter
    if (filters.myDares && !dare.performer) {
      return false;
    }
    
    return true;
  });

  const sortedDares = [...filteredDares].sort((a, b) => {
    switch (sortBy) {
      case 'deadline':
        return new Date(a.deadline) - new Date(b.deadline);
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'difficulty':
        const difficultyOrder = { titillating: 1, arousing: 2, explicit: 3, edgy: 4, hardcore: 5 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      case 'progress':
        return b.progress - a.progress;
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
      publicOnly: false,
      myDares: false
    });
  };

  const getTabDares = () => {
    switch (activeTab) {
      case 'active':
        return sortedDares.filter(dare => dare.status === 'in_progress' || dare.status === 'approved');
      case 'completed':
        return sortedDares.filter(dare => dare.status === 'completed');
      case 'available':
        return sortedDares.filter(dare => dare.status === 'waiting_for_participant');
      default:
        return sortedDares;
    }
  };

  const tabDares = getTabDares();

  const getStats = () => {
    const active = dares.filter(d => d.status === 'in_progress' || d.status === 'approved').length;
    const completed = dares.filter(d => d.status === 'completed').length;
    const available = dares.filter(d => d.status === 'waiting_for_participant').length;
    const total = dares.length;
    
    return { active, completed, available, total };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-8">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Dare Performer Dashboard</h1>
          <p className="text-neutral-400 text-lg">Manage your dares and track your performance</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">{stats.active}</div>
                <div className="text-sm text-neutral-400">Active Dares</div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400">
                <ClockIcon className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">{stats.completed}</div>
                <div className="text-sm text-neutral-400">Completed</div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30 text-green-400">
                <TrophyIcon className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">{stats.available}</div>
                <div className="text-sm text-neutral-400">Available</div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400">
                <SparklesIcon className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">{stats.total}</div>
                <div className="text-sm text-neutral-400">Total Dares</div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400">
                <ChartBarIcon className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50 mb-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
            <BoltIcon className="w-6 h-6 text-yellow-400" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="h-20 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
              <div className="flex flex-col items-center gap-2">
                <PlusIcon className="w-8 h-8" />
                <span className="text-sm">Create Dare</span>
              </div>
            </button>
            
            <button className="h-20 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
              <div className="flex flex-col items-center gap-2">
                <PlayIcon className="w-8 h-8" />
                <span className="text-sm">Perform Dare</span>
              </div>
            </button>
            
            <button className="h-20 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
              <div className="flex flex-col items-center gap-2">
                <DocumentPlusIcon className="w-8 h-8" />
                <span className="text-sm">Submit Proof</span>
              </div>
            </button>
            
            <button className="h-20 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl">
              <div className="flex flex-col items-center gap-2">
                <PuzzlePieceIcon className="w-8 h-8" />
                <span className="text-sm">Join Game</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50 mb-8">
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { key: 'overview', label: 'Overview', icon: ChartBarIcon },
              { key: 'active', label: 'Active Dares', icon: ClockIcon },
              { key: 'completed', label: 'Completed', icon: TrophyIcon },
              { key: 'available', label: 'Available', icon: SparklesIcon }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === tab.key
                    ? 'bg-primary text-white'
                    : 'bg-neutral-700/50 text-neutral-300 hover:bg-neutral-600/50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white">Dashboard Overview</h3>
              <p className="text-neutral-400">Welcome to your dare performer dashboard. Use the tabs above to navigate between different views.</p>
            </div>
          )}

          {activeTab !== 'overview' && (
            <>
              {/* Search and Filters */}
              <div className="flex flex-col lg:flex-row gap-6 mb-6">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search dares..."
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
                  <option value="deadline">By Deadline</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="difficulty">By Difficulty</option>
                  <option value="progress">By Progress</option>
                </select>
              </div>

              {/* Expanded Filters */}
              {showFilters && (
                <div className="mb-6 pt-6 border-t border-neutral-700/50">
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

                    {/* Additional Filters */}
                    <div>
                      <h3 className="text-white font-medium mb-3">Options</h3>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.publicOnly}
                            onChange={(e) => setFilters(prev => ({ ...prev, publicOnly: e.target.checked }))}
                            className="w-4 h-4 text-primary focus:ring-primary border-neutral-600 bg-neutral-700 rounded"
                          />
                          <span className="text-neutral-300 text-sm">Public Only</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.myDares}
                            onChange={(e) => setFilters(prev => ({ ...prev, myDares: e.target.checked }))}
                            className="w-4 h-4 text-primary focus:ring-primary border-neutral-600 bg-neutral-700 rounded"
                          />
                          <span className="text-neutral-300 text-sm">My Dares Only</span>
                        </label>
                      </div>
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

              {/* Results Count */}
              <div className="flex justify-between items-center mb-6">
                <p className="text-neutral-400">
                  Showing {tabDares.length} of {dares.length} dares
                </p>
                {filters.difficulties.length > 0 || filters.types.length > 0 || filters.status || filters.publicOnly || filters.myDares ? (
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
                    {filters.myDares && (
                      <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
                        My Dares Only
                      </span>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Dares Grid/List */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tabDares.map((dare) => (
                    <DareCard key={dare.id} dare={dare} onLikeToggle={toggleLike} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {tabDares.map((dare) => (
                    <DareListItem key={dare.id} dare={dare} onLikeToggle={toggleLike} />
                  ))}
                </div>
              )}

              {tabDares.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-neutral-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MagnifyingGlassIcon className="w-12 h-12 text-neutral-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No dares found</h3>
                  <p className="text-neutral-400">Try adjusting your filters or search terms</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const DareCard = ({ dare, onLikeToggle }) => {
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
      waiting_for_participant: 'bg-info/20 text-info',
      in_progress: 'bg-warning/20 text-warning',
      completed: 'bg-success/20 text-success',
      rejected: 'bg-danger/20 text-danger',
      cancelled: 'bg-neutral-600/20 text-neutral-400',
      approved: 'bg-blue-500/20 text-blue-400'
    };
    return colors[status] || 'bg-neutral-600/20 text-neutral-400';
  };

  const getStatusIcon = (status) => {
    const icons = {
      waiting_for_participant: <EyeIcon className="w-4 h-4" />,
      in_progress: <ClockIcon className="w-4 h-4" />,
      completed: <CheckCircleIcon className="w-4 h-4" />,
      rejected: <XCircleIcon className="w-4 h-4" />,
      cancelled: <XCircleIcon className="w-4 h-4" />,
      approved: <CheckCircleIcon className="w-4 h-4" />
    };
    return icons[status] || <EyeIcon className="w-4 h-4" />;
  };

  const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  return (
    <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 overflow-hidden hover:border-neutral-600/50 transition-all duration-200 group">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-primary transition-colors duration-200">
              {dare.title}
            </h3>
            <p className="text-neutral-400 text-sm line-clamp-2">{dare.description}</p>
          </div>
          <button
            onClick={() => onLikeToggle(dare.id)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              dare.isLiked
                ? 'text-primary hover:text-primary-dark'
                : 'text-neutral-400 hover:text-neutral-300'
            }`}
          >
            <HeartIcon className={`w-5 h-5 ${dare.isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Difficulty and Status Badges */}
        <div className="flex items-center space-x-2 mb-4">
          <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getDifficultyColor(dare.difficulty)} text-white`}>
            {getDifficultyIcon(dare.difficulty)}
            <span className="capitalize">{dare.difficulty}</span>
          </span>
          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(dare.status)}`}>
            {getStatusIcon(dare.status)}
            <span className="capitalize">{dare.status.replace('_', ' ')}</span>
          </span>
        </div>

        {/* Progress Bar for Active Dares */}
        {dare.status === 'in_progress' && dare.progress > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-neutral-400 mb-1">
              <span>Progress</span>
              <span>{dare.progress}%</span>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${dare.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Dare Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-neutral-400">
            <UserIcon className="w-4 h-4" />
            <span>{dare.creator}</span>
          </div>
          <div className="flex items-center space-x-2 text-neutral-400">
            <ClockIcon className="w-4 h-4" />
            <span>{dare.timeLimit}h</span>
          </div>
          {dare.performer && (
            <div className="flex items-center space-x-2 text-neutral-400">
              <UserIcon className="w-4 h-4" />
              <span>Performer: {dare.performer}</span>
            </div>
          )}
          <div className="flex items-center space-x-2 text-neutral-400">
            <ClockIcon className="w-4 h-4" />
            <span>{formatDeadline(dare.deadline)}</span>
          </div>
        </div>

        {/* Grade for Completed Dares */}
        {dare.status === 'completed' && dare.grade && (
          <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center justify-center space-x-2">
              <TrophyIcon className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold">Grade: {dare.grade}</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-neutral-700/30 border-t border-neutral-700/50">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500">
            {dare.isPublic ? 'Public' : 'Private'}
          </span>
          <div className="flex gap-2">
            <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
              View Details
            </button>
            {dare.status === 'waiting_for_participant' && (
              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                Claim
              </button>
            )}
            {dare.status === 'in_progress' && (
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                Submit Proof
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DareListItem = ({ dare, onLikeToggle }) => {
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

  const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  return (
    <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6 hover:border-neutral-600/50 transition-all duration-200">
      <div className="flex items-center space-x-6">
        {/* Difficulty Badge */}
        <div className="flex-shrink-0">
          <span className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r ${getDifficultyColor(dare.difficulty)} text-white`}>
            {getDifficultyIcon(dare.difficulty)}
            <span className="capitalize">{dare.difficulty}</span>
          </span>
        </div>

        {/* Dare Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-white truncate">{dare.title}</h3>
            <button
              onClick={() => onLikeToggle(dare.id)}
              className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${
                dare.isLiked
                  ? 'text-primary hover:text-primary-dark'
                  : 'text-neutral-400 hover:text-neutral-300'
              }`}
            >
              <HeartIcon className={`w-5 h-5 ${dare.isLiked ? 'fill-current' : ''}`} />
            </button>
          </div>
          <p className="text-neutral-400 text-sm mb-3">{dare.description}</p>
          
          <div className="flex items-center space-x-6 text-sm text-neutral-400">
            <span className="flex items-center space-x-1">
              <UserIcon className="w-4 h-4" />
              <span>{dare.creator}</span>
            </span>
            <span className="flex items-center space-x-1">
              <ClockIcon className="w-4 h-4" />
              <span>{dare.timeLimit}h limit</span>
            </span>
            {dare.performer && (
              <span className="flex items-center space-x-1">
                <UserIcon className="w-4 h-4" />
                <span>Performer: {dare.performer}</span>
              </span>
            )}
            <span className="flex items-center space-x-1">
              <ClockIcon className="w-4 h-4" />
              <span>{formatDeadline(dare.deadline)}</span>
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 flex gap-2">
          <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
            View Details
          </button>
          {dare.status === 'waiting_for_participant' && (
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
              Claim
            </button>
          )}
          {dare.status === 'in_progress' && (
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
              Submit Proof
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernDarePerformerDashboard;
