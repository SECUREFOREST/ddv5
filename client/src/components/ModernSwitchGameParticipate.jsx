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
  ArrowLeftIcon,
  UserPlusIcon,
  CrownIcon,
  TrophyIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  ClockIcon as ClockIconSolid
} from '@heroicons/react/24/outline';
import { DIFFICULTY_OPTIONS } from '../constants';

const ModernSwitchGameParticipate = () => {
  const [myGames, setMyGames] = useState([]);
  const [availableGames, setAvailableGames] = useState([]);
  const [activeTab, setActiveTab] = useState('my-games');
  const [isLoading, setIsLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    difficulty: 'all',
    privacy: 'all'
  });

  useEffect(() => {
    const fetchGameData = async () => {
      setIsLoading(true);
      try {
        // Simulate API calls
        await Promise.all([
          new Promise(resolve => setTimeout(resolve, 1000)),
          new Promise(resolve => setTimeout(resolve, 1200))
        ]);

        // Mock my games data
        const mockMyGames = [
          {
            id: 'game_001',
            title: 'Weekend Role Switch Challenge',
            difficulty: 'explicit',
            status: 'in_progress',
            privacy: 'public',
            currentParticipants: 4,
            maxParticipants: 6,
            myRole: 'sub',
            nextRoleSwitch: '2024-01-20T18:00:00Z',
            currentPhase: 'submission',
            timeRemaining: 7200000, // 2 hours
            progress: 65,
            currentTask: {
              id: 'task_001',
              title: 'Evening Submission Task',
              description: 'Complete evening routine with photographic evidence',
              dueAt: '2024-01-20T18:00:00Z',
              points: 10
            },
            gameStats: {
              completedTasks: 3,
              totalTasks: 12,
              currentScore: 28,
              rank: 2
            },
            creator: {
              username: 'GameMaster',
              avatar: '/api/avatars/user_123.jpg'
            }
          },
          {
            id: 'game_002',
            title: 'Monthly Switch Tournament',
            difficulty: 'edgy',
            status: 'recruiting',
            privacy: 'friends',
            currentParticipants: 6,
            maxParticipants: 8,
            myRole: 'switch',
            nextRoleSwitch: null,
            currentPhase: 'waiting',
            timeRemaining: 86400000, // 24 hours
            progress: 0,
            currentTask: null,
            gameStats: {
              completedTasks: 0,
              totalTasks: 0,
              currentScore: 0,
              rank: null
            },
            creator: {
              username: 'TournamentHost',
              avatar: '/api/avatars/user_456.jpg'
            }
          }
        ];

        // Mock available games data
        const mockAvailableGames = [
          {
            id: 'game_003',
            title: 'Beginner Switch Experience',
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
              username: 'SwitchMentor',
              avatar: '/api/avatars/user_789.jpg',
              role: 'switch',
              totalGames: 15,
              successRate: 92
            },
            tags: ['beginner', 'learning', 'supportive'],
            startDate: '2024-01-25T00:00:00Z',
            endDate: '2024-02-01T00:00:00Z',
            views: 23,
            likes: 8,
            applications: 1
          },
          {
            id: 'game_004',
            title: 'Advanced Role Mastery',
            difficulty: 'hardcore',
            status: 'recruiting',
            privacy: 'private',
            currentParticipants: 3,
            maxParticipants: 4,
            minParticipants: 4,
            duration: 14,
            allowRoleSwitching: true,
            requireApproval: true,
            creator: {
              username: 'RoleMaster',
              avatar: '/api/avatars/user_101.jpg',
              role: 'dom',
              totalGames: 42,
              successRate: 89
            },
            tags: ['advanced', 'intense', 'competitive'],
            startDate: '2024-01-28T00:00:00Z',
            endDate: '2024-02-11T00:00:00Z',
            views: 67,
            likes: 19,
            applications: 2
          }
        ];

        setMyGames(mockMyGames);
        setAvailableGames(mockAvailableGames);
      } catch (error) {
        console.error('Error fetching game data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameData();
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

  const getRoleColor = (role) => {
    const colors = {
      dom: 'bg-red-500/20 text-red-400',
      sub: 'bg-blue-500/20 text-blue-400',
      switch: 'bg-purple-500/20 text-purple-400'
    };
    return colors[role] || 'bg-gray-500/20 text-gray-400';
  };

  const formatTimeRemaining = (timeMs) => {
    if (!timeMs) return 'No time limit';
    
    const hours = Math.floor(timeMs / 3600000);
    const minutes = Math.floor((timeMs % 3600000) / 60000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    return `${minutes}m remaining`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleJoinGame = (game) => {
    setSelectedGame(game);
    setShowJoinModal(true);
  };

  const handleLeaveGame = (gameId) => {
    if (window.confirm('Are you sure you want to leave this game? This action cannot be undone.')) {
      setMyGames(prev => prev.filter(game => game.id !== gameId));
      // In real app, make API call to leave game
    }
  };

  const handleSubmitTask = (gameId) => {
    console.log(`Submitting task for game ${gameId}`);
    // Implement task submission logic
  };

  const handleRoleSwitch = (gameId) => {
    console.log(`Switching role in game ${gameId}`);
    // Implement role switching logic
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-8">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-neutral-400">Loading your games...</p>
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
              <h1 className="text-3xl font-bold text-white mb-2">Game Participation</h1>
              <p className="text-neutral-400">
                Manage your active games and discover new opportunities
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

        {/* Tab Navigation */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6 mb-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('my-games')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'my-games'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-neutral-400 hover:text-neutral-300'
              }`}
            >
              My Games ({myGames.length})
            </button>
            <button
              onClick={() => setActiveTab('available')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'available'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-neutral-400 hover:text-neutral-300'
              }`}
            >
              Available Games ({availableGames.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'my-games' && (
          <div className="space-y-6">
            {myGames.length === 0 ? (
              <div className="text-center py-12">
                <UsersIcon className="w-24 h-24 text-neutral-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-white mb-2">No Active Games</h3>
                <p className="text-neutral-400 mb-6">
                  You're not participating in any games yet. Discover and join exciting switch games!
                </p>
                <button
                  onClick={() => setActiveTab('available')}
                  className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Browse Available Games
                </button>
              </div>
            ) : (
              myGames.map((game) => (
                <MyGameCard
                  key={game.id}
                  game={game}
                  onLeave={handleLeaveGame}
                  onSubmitTask={handleSubmitTask}
                  onRoleSwitch={handleRoleSwitch}
                  getDifficultyColor={getDifficultyColor}
                  getDifficultyIcon={getDifficultyIcon}
                  getStatusColor={getStatusColor}
                  getStatusIcon={getStatusIcon}
                  getRoleColor={getRoleColor}
                  formatTimeRemaining={formatTimeRemaining}
                  formatDate={formatDate}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'available' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Duration</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">Any Duration</option>
                    <option value="short">Short (1-7 days)</option>
                    <option value="medium">Medium (8-14 days)</option>
                    <option value="long">Long (15+ days)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Available Games */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableGames.map((game) => (
                <AvailableGameCard
                  key={game.id}
                  game={game}
                  onJoin={handleJoinGame}
                  getDifficultyColor={getDifficultyColor}
                  getDifficultyIcon={getDifficultyIcon}
                  getStatusColor={getStatusColor}
                  getStatusIcon={getStatusIcon}
                  formatDate={formatDate}
                />
              ))}
            </div>

            {availableGames.length === 0 && (
              <div className="text-center py-12">
                <UsersIcon className="w-24 h-24 text-neutral-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-white mb-2">No Games Available</h3>
                <p className="text-neutral-400 mb-6">
                  There are currently no games matching your criteria. Check back later or create your own game!
                </p>
                <button className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors duration-200">
                  Create New Game
                </button>
              </div>
            )}
          </div>
        )}

        {/* Join Game Modal */}
        {showJoinModal && selectedGame && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-800 rounded-xl border border-neutral-700 max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Join Game</h3>
              <div className="mb-6">
                <h4 className="text-lg font-medium text-white mb-2">{selectedGame.title}</h4>
                <div className="space-y-2 text-sm text-neutral-400">
                  <div className="flex justify-between">
                    <span>Difficulty:</span>
                    <span className="text-white capitalize">{selectedGame.difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="text-white">{selectedGame.duration} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Participants:</span>
                    <span className="text-white">{selectedGame.currentParticipants}/{selectedGame.maxParticipants}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Role Switching:</span>
                    <span className={`${selectedGame.allowRoleSwitching ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedGame.allowRoleSwitching ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-300 mb-2">Preferred Starting Role</label>
                <select className="w-full bg-neutral-700/50 border border-neutral-600/50 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent">
                  <option value="switch">Switch (Flexible)</option>
                  <option value="dom">Dominant</option>
                  <option value="sub">Submissive</option>
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle join game logic
                    setShowJoinModal(false);
                    // Add game to my games
                    setMyGames(prev => [...prev, { ...selectedGame, myRole: 'switch', status: 'recruiting' }]);
                    // Remove from available games
                    setAvailableGames(prev => prev.filter(g => g.id !== selectedGame.id));
                  }}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors duration-200"
                >
                  Join Game
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// My Game Card Component
const MyGameCard = ({ game, onLeave, onSubmitTask, onRoleSwitch, getDifficultyColor, getDifficultyIcon, getStatusColor, getStatusIcon, getRoleColor, formatTimeRemaining, formatDate }) => {
  return (
    <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 overflow-hidden">
      {/* Game Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getDifficultyColor(game.difficulty)} flex items-center justify-center text-white`}>
              {getDifficultyIcon(game.difficulty)}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white mb-1">{game.title}</h3>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(game.status)} text-white`}>
                  {getStatusIcon(game.status)}
                  <span className="ml-1 capitalize">{game.status.replace('_', ' ')}</span>
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(game.myRole)}`}>
                  {game.myRole.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-neutral-400 mb-1">Created by</div>
            <div className="flex items-center space-x-2">
              <img 
                src={game.creator.avatar} 
                alt={game.creator.username}
                className="w-6 h-6 rounded-full border border-neutral-600"
              />
              <span className="text-white text-sm">{game.creator.username}</span>
            </div>
          </div>
        </div>

        {/* Game Progress */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">{game.gameStats.currentScore}</div>
            <div className="text-sm text-neutral-400">Current Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">{game.gameStats.rank || 'N/A'}</div>
            <div className="text-sm text-neutral-400">Current Rank</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">{game.gameStats.completedTasks}/{game.gameStats.totalTasks}</div>
            <div className="text-sm text-neutral-400">Tasks Completed</div>
          </div>
        </div>

        {/* Current Task */}
        {game.currentTask && (
          <div className="bg-neutral-700/30 rounded-lg p-4 mb-6">
            <h4 className="text-lg font-medium text-white mb-3">Current Task</h4>
            <div className="space-y-3">
              <div>
                <div className="text-white font-medium">{game.currentTask.title}</div>
                <div className="text-neutral-400 text-sm">{game.currentTask.description}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm text-neutral-400">
                    Due: {formatDate(game.currentTask.dueAt)}
                  </span>
                </div>
                <div className="text-sm text-neutral-400">
                  {game.currentTask.points} points
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-neutral-400">
                  {formatTimeRemaining(game.timeRemaining)}
                </div>
                <button
                  onClick={() => onSubmitTask(game.id)}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm rounded-lg transition-colors duration-200"
                >
                  Submit Task
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Next Role Switch */}
        {game.nextRoleSwitch && (
          <div className="bg-neutral-700/30 rounded-lg p-4 mb-6">
            <h4 className="text-lg font-medium text-white mb-3">Next Role Switch</h4>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ArrowPathIcon className="w-5 h-5 text-neutral-400" />
                <span className="text-neutral-300">
                  Your role will change at {formatDate(game.nextRoleSwitch)}
                </span>
              </div>
              <button
                onClick={() => onRoleSwitch(game.id)}
                className="px-4 py-2 bg-neutral-600 hover:bg-neutral-500 text-white text-sm rounded-lg transition-colors duration-200"
              >
                Switch Now
              </button>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-neutral-400 mb-2">
            <span>Game Progress</span>
            <span>{game.progress}%</span>
          </div>
          <div className="w-full bg-neutral-700 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${game.progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Game Actions */}
      <div className="px-6 py-4 bg-neutral-700/30 border-t border-neutral-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onLeave(game.id)}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg transition-colors duration-200"
            >
              Leave Game
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 bg-neutral-600 hover:bg-neutral-500 text-white text-sm rounded-lg transition-colors duration-200">
              View Details
            </button>
            <button className="px-4 py-2 bg-neutral-600 hover:bg-neutral-500 text-white text-sm rounded-lg transition-colors duration-200">
              Game Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Available Game Card Component
const AvailableGameCard = ({ game, onJoin, getDifficultyColor, getDifficultyIcon, getStatusColor, getStatusIcon, formatDate }) => {
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
            </div>
          </div>
        </div>

        {/* Game Title & Description */}
        <h3 className="text-lg font-semibold text-white mb-2">{game.title}</h3>
        <p className="text-neutral-400 text-sm mb-4 line-clamp-3">
          A {game.difficulty} level game lasting {game.duration} days with role switching {game.allowRoleSwitching ? 'enabled' : 'disabled'}.
        </p>

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
              {game.creator.totalGames} games • {game.creator.successRate}% success
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

        {/* Start Date */}
        <div className="text-center mb-4">
          <span className="text-sm text-neutral-400">
            Starts {formatDate(game.startDate)}
          </span>
        </div>
      </div>

      {/* Game Actions */}
      <div className="px-6 py-4 bg-neutral-700/30 border-t border-neutral-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onJoin(game)}
              className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm rounded-lg transition-colors duration-200"
            >
              Join Game
            </button>
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

export default ModernSwitchGameParticipate; 