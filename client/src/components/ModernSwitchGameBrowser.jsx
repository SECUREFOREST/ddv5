import React, { useState, useEffect } from 'react';
import { 
  FireIcon, 
  SparklesIcon, 
  EyeDropperIcon, 
  ExclamationTriangleIcon, 
  RocketLaunchIcon,
  UserGroupIcon,
  ClockIcon,
  CalendarIcon,
  EyeIcon,
  HeartIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  GlobeAltIcon,
  LockClosedIcon,
  UserGroupIcon,
  StarIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/solid';
import { DIFFICULTY_OPTIONS } from '../constants';

const ModernSwitchGameBrowser = () => {
  const [switchGames, setSwitchGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    difficulty: 'all',
    privacy: 'all',
    participants: 'all'
  });
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const mockSwitchGames = [
      {
        id: 'game_001',
        title: 'Weekend Role Switch Challenge',
        description: 'A weekend-long challenge where participants switch between dominant and submissive roles every 12 hours. Complete tasks, earn points, and compete for the top spot!',
        difficulty: 'explicit',
        status: 'recruiting',
        privacy: 'public',
        currentParticipants: 3,
        maxParticipants: 6,
        minParticipants: 4,
        duration: 3, // days
        allowRoleSwitching: true,
        requireApproval: false,
        creator: {
          id: 'user_123',
          username: 'GameMaster',
          avatar: '/api/avatars/user_123.jpg',
          role: 'switch'
        },
        participants: [
          { id: 'user_123', username: 'GameMaster', role: 'switch', avatar: '/api/avatars/user_123.jpg' },
          { id: 'user_456', username: 'PlayerOne', role: 'dom', avatar: '/api/avatars/user_456.jpg' },
          { id: 'user_789', username: 'PlayerTwo', role: 'sub', avatar: '/api/avatars/user_789.jpg' }
        ],
        tags: ['weekend', 'role-switch', 'challenge', 'competitive'],
        rules: 'Participants must complete assigned tasks within time limits. Role switching occurs every 12 hours. Points awarded for task completion and creativity.',
        rewards: 'Top 3 players receive achievement badges and bonus points. All participants get completion certificates.',
        startDate: '2024-01-20T00:00:00Z',
        endDate: '2024-01-23T00:00:00Z',
        createdAt: '2024-01-15T10:00:00Z',
        views: 45,
        likes: 12,
        applications: 2
      },
      {
        id: 'game_002',
        title: 'Monthly Switch Tournament',
        description: 'Monthly tournament with elimination rounds. Players compete in pairs, switching roles each round. Last pair standing wins!',
        difficulty: 'edgy',
        status: 'in_progress',
        privacy: 'friends',
        currentParticipants: 8,
        maxParticipants: 8,
        minParticipants: 8,
        duration: 30,
        allowRoleSwitching: true,
        requireApproval: true,
        creator: {
          id: 'user_456',
          username: 'TournamentHost',
          avatar: '/api/avatars/user_456.jpg',
          role: 'dom'
        },
        participants: [
          { id: 'user_456', username: 'TournamentHost', role: 'dom', avatar: '/api/avatars/user_456.jpg' },
          { id: 'user_101', username: 'Contestant1', role: 'sub', avatar: '/api/avatars/user_101.jpg' },
          { id: 'user_102', username: 'Contestant2', role: 'switch', avatar: '/api/avatars/user_102.jpg' },
          { id: 'user_103', username: 'Contestant3', role: 'dom', avatar: '/api/avatars/user_103.jpg' },
          { id: 'user_104', username: 'Contestant4', role: 'sub', avatar: '/api/avatars/user_104.jpg' },
          { id: 'user_105', username: 'Contestant5', role: 'switch', avatar: '/api/avatars/user_105.jpg' },
          { id: 'user_106', username: 'Contestant6', role: 'dom', avatar: '/api/avatars/user_106.jpg' },
          { id: 'user_107', username: 'Contestant7', role: 'sub', avatar: '/api/avatars/user_107.jpg' }
        ],
        tags: ['tournament', 'elimination', 'monthly', 'competitive'],
        rules: 'Elimination tournament with role switching. Each round, pairs compete and losers are eliminated. Final pair wins the tournament.',
        rewards: 'Champions receive exclusive badges and recognition. Runner-ups get achievement points.',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T00:00:00Z',
        createdAt: '2023-12-25T15:00:00Z',
        views: 89,
        likes: 23,
        applications: 0
      },
      {
        id: 'game_003',
        title: 'Beginner Switch Experience',
        description: 'Perfect for newcomers to switch games. Learn the basics of role switching in a supportive, non-competitive environment.',
        difficulty: 'titillating',
        status: 'recruiting',
        privacy: 'public',
        currentParticipants: 2,
        maxParticipants: 5,
        minParticipants: 3,
        duration: 7,
        allowRoleSwitching: true,
        requireApproval: false,
        creator: {
          id: 'user_789',
          username: 'SwitchMentor',
          avatar: '/api/avatars/user_789.jpg',
          role: 'switch'
        },
        participants: [
          { id: 'user_789', username: 'SwitchMentor', role: 'switch', avatar: '/api/avatars/user_789.jpg' },
          { id: 'user_201', username: 'Newbie1', role: 'sub', avatar: '/api/avatars/user_201.jpg' }
        ],
        tags: ['beginner', 'learning', 'supportive', 'non-competitive'],
        rules: 'Gentle introduction to switch games. Focus on learning and exploration rather than competition. All experience levels welcome.',
        rewards: 'Completion certificate and mentor guidance. Build confidence for future switch games.',
        startDate: '2024-01-25T00:00:00Z',
        endDate: '2024-02-01T00:00:00Z',
        createdAt: '2024-01-16T14:00:00Z',
        views: 23,
        likes: 8,
        applications: 1
      }
    ];

    setSwitchGames(mockSwitchGames);
    setFilteredGames(mockSwitchGames);
  }, []);

  // Filter and sort games
  useEffect(() => {
    let filtered = [...switchGames];

    // Apply filters
    if (filters.status !== 'all') {
      filtered = filtered.filter(game => game.status === filters.status);
    }
    if (filters.difficulty !== 'all') {
      filtered = filtered.filter(game => game.difficulty === filters.difficulty);
    }
    if (filters.privacy !== 'all') {
      filtered = filtered.filter(game => game.privacy === filters.privacy);
    }
    if (filters.participants !== 'all') {
      filtered = filtered.filter(game => {
        if (filters.participants === 'available') return game.currentParticipants < game.maxParticipants;
        if (filters.participants === 'full') return game.currentParticipants >= game.maxParticipants;
        return true;
      });
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(game => 
        game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        game.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'popularity':
          return b.views - a.views;
        case 'participants':
          return b.currentParticipants - a.currentParticipants;
        case 'duration':
          return a.duration - b.duration;
        default:
          return 0;
      }
    });

    setFilteredGames(filtered);
  }, [switchGames, filters, searchQuery, sortBy]);

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
      recruiting: 'bg-green-500',
      'in_progress': 'bg-blue-500',
      completed: 'bg-gray-500',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusIcon = (status) => {
    const icons = {
      recruiting: <UserGroupIcon className="w-4 h-4" />,
      'in_progress': <PlayIcon className="w-4 h-4" />,
      completed: <CheckCircleIcon className="w-4 h-4" />,
      cancelled: <XCircleIcon className="w-4 h-4" />
    };
    return icons[status] || <UserGroupIcon className="w-4 h-4" />;
  };

  const getPrivacyIcon = (privacy) => {
    const icons = {
      public: <GlobeAltIcon className="w-4 h-4" />,
      private: <LockClosedIcon className="w-4 h-4" />,
      friends: <UserGroupIcon className="w-4 h-4" />
    };
    return icons[privacy] || <GlobeAltIcon className="w-4 h-4" />;
  };

  const formatTimeRemaining = (endDate) => {
    const remaining = new Date(endDate) - new Date();
    if (remaining <= 0) return 'Ended';
    
    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor((remaining % 86400000) / 3600000);
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    }
    return `${hours}h remaining`;
  };

  const handleJoinGame = (gameId) => {
    console.log(`Joining game ${gameId}`);
    // Implement join game logic
  };

  const handleViewGame = (gameId) => {
    console.log(`Viewing game ${gameId}`);
    // Implement view game logic
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-8">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Switch Games</h1>
              <p className="text-neutral-400">
                Discover and join multi-participant games with role switching
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2">
                <PlusIcon className="w-5 h-5" />
                <span>Create Game</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search switch games..."
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">All Statuses</option>
                    <option value="recruiting">Recruiting</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
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
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Privacy</label>
                  <select
                    value={filters.privacy}
                    onChange={(e) => setFilters({ ...filters, privacy: e.target.value })}
                    className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">All Privacy</option>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="friends">Friends Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Participants</label>
                  <select
                    value={filters.participants}
                    onChange={(e) => setFilters({ ...filters, participants: e.target.value })}
                    className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">All Games</option>
                    <option value="available">Available Spots</option>
                    <option value="full">Full Games</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="popularity">Most Popular</option>
                    <option value="participants">Most Participants</option>
                    <option value="duration">Shortest Duration</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Games Grid */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <SwitchGameCard
                key={game.id}
                game={game}
                onJoin={handleJoinGame}
                onView={handleViewGame}
                getDifficultyColor={getDifficultyColor}
                getDifficultyIcon={getDifficultyIcon}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
                getPrivacyIcon={getPrivacyIcon}
                formatTimeRemaining={formatTimeRemaining}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGames.map((game) => (
              <SwitchGameListItem
                key={game.id}
                game={game}
                onJoin={handleJoinGame}
                onView={handleViewGame}
                getDifficultyColor={getDifficultyColor}
                getDifficultyIcon={getDifficultyIcon}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
                getPrivacyIcon={getPrivacyIcon}
                formatTimeRemaining={formatTimeRemaining}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-neutral-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                              <UserGroupIcon className="w-12 h-12 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Switch Games Found</h3>
            <p className="text-neutral-400 mb-6">
              {switchGames.length === 0 
                ? "There are no switch games available yet. Be the first to create one!"
                : "No games match your current filters. Try adjusting your search criteria."
              }
            </p>
            {switchGames.length === 0 && (
              <button className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors duration-200">
                Create First Game
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Switch Game Card Component
const SwitchGameCard = ({ game, onJoin, onView, getDifficultyColor, getDifficultyIcon, getStatusColor, getStatusIcon, getPrivacyIcon, formatTimeRemaining }) => {
  return (
    <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 overflow-hidden hover:border-neutral-600/50 transition-all duration-200">
      {/* Game Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getDifficultyColor(game.difficulty)} flex items-center justify-center text-white`}>
              {getDifficultyIcon(game.difficulty)}
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(game.status)} text-white`}>
                {getStatusIcon(game.status)}
                <span className="ml-1 capitalize">{game.status.replace('_', ' ')}</span>
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                game.privacy === 'public' ? 'bg-blue-500/20 text-blue-400' : 
                game.privacy === 'private' ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-400'
              }`}>
                {getPrivacyIcon(game.privacy)}
                <span className="ml-1 capitalize">{game.privacy}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Game Title & Description */}
        <h3 className="text-lg font-semibold text-white mb-2">{game.title}</h3>
        <p className="text-neutral-400 text-sm mb-4 line-clamp-3">{game.description}</p>

        {/* Creator Info */}
        <div className="flex items-center space-x-3 mb-4">
          <img 
            src={game.creator.avatar} 
            alt={game.creator.username}
            className="w-8 h-8 rounded-full border-2 border-neutral-600"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-white font-medium">{game.creator.username}</span>
              <span className="text-xs text-neutral-400 capitalize">({game.creator.role})</span>
            </div>
            <span className="text-xs text-neutral-400">
              {new Date(game.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div className="text-center">
            <span className="text-neutral-400 block">Participants</span>
            <span className="text-white font-medium">{game.currentParticipants}/{game.maxParticipants}</span>
          </div>
          <div className="text-center">
            <span className="text-neutral-400 block">Duration</span>
            <span className="text-white font-medium">{game.duration} days</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {game.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-neutral-700/50 text-neutral-300 text-xs rounded-lg">
              #{tag}
            </span>
          ))}
          {game.tags.length > 3 && (
            <span className="px-2 py-1 bg-neutral-700/50 text-neutral-400 text-xs rounded-lg">
              +{game.tags.length - 3} more
            </span>
          )}
        </div>

        {/* Time Remaining */}
        <div className="text-center mb-4">
          <span className={`text-sm font-medium ${
            new Date(game.endDate) - new Date() < 86400000 ? 'text-red-400' : 'text-green-400'
          }`}>
            {formatTimeRemaining(game.endDate)}
          </span>
        </div>
      </div>

      {/* Game Actions */}
      <div className="px-6 py-4 bg-neutral-700/30 border-t border-neutral-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {game.status === 'recruiting' && game.currentParticipants < game.maxParticipants ? (
              <button
                onClick={() => onJoin(game.id)}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm rounded-lg transition-colors duration-200"
              >
                Join Game
              </button>
            ) : (
              <button
                onClick={() => onView(game.id)}
                className="px-4 py-2 bg-neutral-600 hover:bg-neutral-500 text-white text-sm rounded-lg transition-colors duration-200"
              >
                View Details
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-neutral-400 hover:text-white transition-colors duration-200">
              <HeartIcon className="w-4 h-4" />
            </button>
            <button className="p-2 text-neutral-400 hover:text-white transition-colors duration-200">
              <EyeIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Switch Game List Item Component
const SwitchGameListItem = ({ game, onJoin, onView, getDifficultyColor, getDifficultyIcon, getStatusColor, getStatusIcon, getPrivacyIcon, formatTimeRemaining }) => {
  return (
    <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6 hover:border-neutral-600/50 transition-all duration-200">
      <div className="flex items-center space-x-6">
        {/* Game Icon & Status */}
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${getDifficultyColor(game.difficulty)} flex items-center justify-center text-white`}>
            {getDifficultyIcon(game.difficulty)}
          </div>
          <div className="text-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(game.status)} text-white`}>
              {getStatusIcon(game.status)}
              <span className="ml-1 capitalize">{game.status.replace('_', ' ')}</span>
            </span>
          </div>
        </div>

        {/* Game Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white truncate">{game.title}</h3>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                game.privacy === 'public' ? 'bg-blue-500/20 text-blue-400' : 
                game.privacy === 'private' ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-400'
              }`}>
                {getPrivacyIcon(game.privacy)}
                <span className="ml-1 capitalize">{game.privacy}</span>
              </span>
            </div>
          </div>
          <p className="text-neutral-400 text-sm mb-3 line-clamp-2">{game.description}</p>
          
          {/* Game Info */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-neutral-400">Participants:</span>
              <span className="text-white font-medium">{game.currentParticipants}/{game.maxParticipants}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-neutral-400">Duration:</span>
              <span className="text-white font-medium">{game.duration} days</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-neutral-400">Role Switching:</span>
              <span className={`text-sm font-medium ${game.allowRoleSwitching ? 'text-green-400' : 'text-red-400'}`}>
                {game.allowRoleSwitching ? 'Allowed' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side Info */}
        <div className="text-right">
          <div className="mb-2">
            <span className={`text-sm font-medium ${
              new Date(game.endDate) - new Date() < 86400000 ? 'text-red-400' : 'text-green-400'
            }`}>
              {formatTimeRemaining(game.endDate)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <img 
              src={game.creator.avatar} 
              alt={game.creator.username}
              className="w-8 h-8 rounded-full border-2 border-neutral-600"
            />
            <span className="text-sm text-neutral-300">{game.creator.username}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {game.status === 'recruiting' && game.currentParticipants < game.maxParticipants ? (
            <button
              onClick={() => onJoin(game.id)}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm rounded-lg transition-colors duration-200"
            >
              Join Game
            </button>
          ) : (
            <button
              onClick={() => onView(game.id)}
              className="px-4 py-2 bg-neutral-600 hover:bg-neutral-500 text-white text-sm rounded-lg transition-colors duration-200"
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernSwitchGameBrowser; 