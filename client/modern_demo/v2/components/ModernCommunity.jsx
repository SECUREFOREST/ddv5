import React, { useState, useEffect } from 'react';
import { 
  FireIcon, 
  SparklesIcon, 
  EyeDropperIcon, 
  ExclamationTriangleIcon, 
  RocketLaunchIcon,
  UserIcon,
  HeartIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  FlagIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  GlobeAltIcon,
  LockClosedIcon,
  UserGroupIcon,
  StarIcon
} from '@heroicons/react/24/solid';
import { DIFFICULTY_OPTIONS } from '../../constants';

const ModernCommunity = () => {
  const [publicActs, setPublicActs] = useState([]);
  const [filters, setFilters] = useState({
    type: 'all',
    difficulty: 'all',
    status: 'all'
  });
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const mockPublicActs = [
      {
        id: 'act_001',
        title: 'Evening Submission Challenge',
        description: 'Complete evening routine tasks with photographic evidence',
        type: 'demand',
        difficulty: 'arousing',
        status: 'soliciting',
        creator: {
          id: 'user_123',
          username: 'DomMaster',
          avatar: '/api/avatars/user_123.jpg',
          role: 'dom'
        },
        participants: 3,
        views: 45,
        likes: 12,
        createdAt: '2024-01-15T18:00:00Z',
        expiresAt: '2024-01-20T18:00:00Z',
        tags: ['evening', 'routine', 'photographic']
      },
      {
        id: 'act_002',
        title: 'Weekend Performance Opportunity',
        description: 'Weekend challenge with video documentation',
        type: 'perform',
        difficulty: 'explicit',
        status: 'soliciting',
        creator: {
          id: 'user_456',
          username: 'TaskCreator',
          avatar: '/api/avatars/user_456.jpg',
          role: 'sub'
        },
        participants: 1,
        views: 28,
        likes: 8,
        createdAt: '2024-01-15T12:00:00Z',
        expiresAt: '2024-01-18T12:00:00Z',
        tags: ['weekend', 'video', 'challenge']
      }
    ];
    setPublicActs(mockPublicActs);
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
      titillating: <SparklesIcon className="w-4 h-4" />,
      arousing: <FireIcon className="w-4 h-4" />,
      explicit: <EyeDropperIcon className="w-4 h-4" />,
      edgy: <ExclamationTriangleIcon className="w-4 h-4" />,
      hardcore: <RocketLaunchIcon className="w-4 h-4" />
    };
    return icons[difficulty] || <SparklesIcon className="w-4 h-4" />;
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
      dom: <FireIcon className="w-4 h-4" />,
      sub: <HeartIcon className="w-4 h-4" />,
      switch: <ArrowPathIcon className="w-4 h-4" />
    };
    return icons[role] || <UserIcon className="w-4 h-4" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-8">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Community</h1>
          <p className="text-neutral-400">Discover public acts and connect with the community</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search public acts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <FunnelIcon className="w-5 h-5" />
                <span>Filters</span>
              </button>
              <div className="flex items-center space-x-2 bg-neutral-700/50 rounded-lg p-1">
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

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-neutral-700/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="demand">Demands</option>
                    <option value="perform">Performances</option>
                  </select>
                </div>
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
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">All Statuses</option>
                    <option value="soliciting">Soliciting</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Public Acts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publicActs.map((act) => (
            <div key={act.id} className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 overflow-hidden hover:border-neutral-600/50 transition-all duration-200">
              {/* Act Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getDifficultyColor(act.difficulty)} flex items-center justify-center text-white`}>
                      {getDifficultyIcon(act.difficulty)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        act.type === 'demand' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {act.type === 'demand' ? <GlobeAltIcon className="w-3 h-3 mr-1" /> : <LockClosedIcon className="w-3 h-3 mr-1" />}
                        {act.type === 'demand' ? 'Public' : 'Private'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Act Title & Description */}
                <h3 className="text-lg font-semibold text-white mb-2">{act.title}</h3>
                <p className="text-neutral-400 text-sm mb-4 line-clamp-3">{act.description}</p>

                {/* Creator Info */}
                <div className="flex items-center space-x-3 mb-4">
                  <img 
                    src={act.creator.avatar} 
                    alt={act.creator.username}
                    className="w-8 h-8 rounded-full border-2 border-neutral-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-white font-medium">{act.creator.username}</span>
                      <div className={`w-6 h-6 rounded-lg bg-gradient-to-r ${getRoleColor(act.creator.role)} flex items-center justify-center text-white`}>
                        {getRoleIcon(act.creator.role)}
                      </div>
                    </div>
                    <span className="text-xs text-neutral-400">
                      {new Date(act.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {act.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-neutral-700/50 text-neutral-300 text-xs rounded-lg">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-neutral-400">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1">
                      <UserGroupIcon className="w-4 h-4" />
                      <span>{act.participants}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <EyeIcon className="w-4 h-4" />
                      <span>{act.views}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <HeartIcon className="w-4 h-4" />
                      <span>{act.likes}</span>
                    </span>
                  </div>
                  <span className="text-xs">
                    Expires {new Date(act.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Act Actions */}
              <div className="px-6 py-4 bg-neutral-700/30 border-t border-neutral-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-xs rounded-lg transition-colors duration-200">
                      {act.type === 'demand' ? 'Accept' : 'Apply'}
                    </button>
                    <button className="px-3 py-1.5 bg-neutral-600 hover:bg-neutral-500 text-white text-xs rounded-lg transition-colors duration-200">
                      View Details
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-neutral-400 hover:text-white transition-colors duration-200">
                      <HeartIcon className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-neutral-400 hover:text-white transition-colors duration-200">
                      <ShareIcon className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-neutral-400 hover:text-red-400 transition-colors duration-200">
                      <FlagIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {publicActs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-neutral-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                              <UserGroupIcon className="w-12 h-12 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Public Acts Available</h3>
            <p className="text-neutral-400 mb-6">
              There are currently no public acts matching your criteria. Check back later or adjust your filters.
            </p>
            <button className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors duration-200">
              Create Public Act
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernCommunity; 