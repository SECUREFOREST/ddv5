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
  ExclamationCircleIcon
} from '@heroicons/react/24/solid';
import { DIFFICULTY_OPTIONS } from '../constants';

const ModernSwitchGameDetails = () => {
  const [game, setGame] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);

  useEffect(() => {
    // Simulate API call to fetch game details
    const fetchGameDetails = async () => {
      setIsLoading(true);
      try {
        // Mock game data - in real app, this would come from API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockGame = {
          id: 'game_001',
          title: 'Weekend Role Switch Challenge',
          description: 'A weekend-long challenge where participants switch between dominant and submissive roles every 12 hours. Complete tasks, earn points, and compete for the top spot! This game is designed to test your adaptability and creativity in both roles.',
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
            role: 'switch',
            joinDate: '2023-01-15',
            totalGames: 24,
            successRate: 87
          },
          participants: [
            { 
              id: 'user_123', 
              username: 'GameMaster', 
              role: 'switch', 
              avatar: '/api/avatars/user_123.jpg',
              joinDate: '2024-01-15T10:00:00Z',
              isCreator: true,
              currentRole: 'switch'
            },
            { 
              id: 'user_456', 
              username: 'PlayerOne', 
              role: 'dom', 
              avatar: '/api/avatars/user_456.jpg',
              joinDate: '2024-01-15T11:00:00Z',
              isCreator: false,
              currentRole: 'dom'
            },
            { 
              id: 'user_789', 
              username: 'PlayerTwo', 
              role: 'sub', 
              avatar: '/api/avatars/user_789.jpg',
              joinDate: '2024-01-15T12:00:00Z',
              isCreator: false,
              currentRole: 'sub'
            }
          ],
          tags: ['weekend', 'role-switch', 'challenge', 'competitive', 'creative', 'adaptation'],
          rules: `1. **Role Switching Schedule**: Participants switch between dominant and submissive roles every 12 hours at 6 AM and 6 PM.

2. **Task Completion**: Each role period requires completion of assigned tasks within the time limit.

3. **Point System**: 
   - Task completion: 10 points
   - Creativity bonus: Up to 5 points
   - Role adaptation: Up to 3 points
   - Timeliness: Up to 2 points

4. **Communication**: Participants must communicate their current role and task progress in the game chat.

5. **Evidence**: Photo or video evidence required for task completion.

6. **Fair Play**: No harassment, coercion, or unsafe practices allowed.

7. **Dispute Resolution**: Game creator has final say on rule interpretations.`,
          rewards: `🏆 **Championship Rewards**
- 1st Place: Exclusive "Role Master" badge + 100 achievement points
- 2nd Place: "Adaptive Player" badge + 75 achievement points  
- 3rd Place: "Versatile Performer" badge + 50 achievement points

🎯 **Participation Rewards**
- All participants receive "Weekend Warrior" completion certificate
- Role switching completion bonus: 25 points
- Perfect attendance bonus: 15 points

💎 **Special Recognition**
- Most creative task completion: "Innovation Master" title
- Best role adaptation: "Chameleon" achievement
- Most helpful participant: "Team Player" recognition`,
          startDate: '2024-01-20T00:00:00Z',
          endDate: '2024-01-23T00:00:00Z',
          createdAt: '2024-01-15T10:00:00Z',
          views: 45,
          likes: 12,
          applications: 2,
          currentPhase: 'recruitment',
          nextRoleSwitch: '2024-01-20T06:00:00Z',
          gameProgress: {
            totalTasks: 12,
            completedTasks: 0,
            averageScore: 0,
            leaderboard: []
          },
          announcements: [
            {
              id: 'ann_001',
              message: 'Game starts in 5 days! Get ready for an exciting weekend of role switching challenges.',
              timestamp: '2024-01-15T10:00:00Z',
              type: 'info'
            },
            {
              id: 'ann_002', 
              message: 'First role switch will occur at 6 AM on Saturday. Prepare your first tasks!',
              timestamp: '2024-01-15T14:00:00Z',
              type: 'reminder'
            }
          ]
        };

        setGame(mockGame);
        
        // Check if current user is creator or participant
        const currentUserId = 'current_user'; // In real app, get from auth context
        setIsCreator(mockGame.creator.id === currentUserId);
        setIsParticipant(mockGame.participants.some(p => p.id === currentUserId));
        
      } catch (error) {
        console.error('Error fetching game details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameDetails();
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
      recruiting: <UserGroupIcon className="w-5 h-5" />,
      'in_progress': <PlayIcon className="w-5 h-5" />,
      completed: <CheckCircleIcon className="w-5 h-5" />,
      cancelled: <XCircleIcon className="w-5 h-5" />
    };
    return icons[status] || <UserGroupIcon className="w-5 h-5" />;
  };

  const getPrivacyIcon = (privacy) => {
    const icons = {
      public: <GlobeAltIcon className="w-5 h-5" />,
      private: <LockClosedIcon className="w-5 h-5" />,
      friends: <UserGroupIcon className="w-5 h-5" />
    };
    return icons[privacy] || <GlobeAltIcon className="w-5 h-5" />;
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleJoinGame = () => {
    setShowJoinModal(true);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // In real app, make API call to like/unlike
  };

  const handleReport = () => {
    setShowReportModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-8">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-neutral-400">Loading game details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-8">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center py-12">
            <ExclamationCircleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Game Not Found</h2>
            <p className="text-neutral-400">The requested game could not be found or has been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-8">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header with Back Button */}
        <div className="mb-8">
          <button className="flex items-center space-x-2 text-neutral-400 hover:text-white transition-colors duration-200 mb-4">
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Switch Games</span>
          </button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${getDifficultyColor(game.difficulty)} flex items-center justify-center text-white`}>
                  {getDifficultyIcon(game.difficulty)}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{game.title}</h1>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(game.status)} text-white`}>
                      {getStatusIcon(game.status)}
                      <span className="ml-2 capitalize">{game.status.replace('_', ' ')}</span>
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      game.privacy === 'public' ? 'bg-blue-500/20 text-blue-400' : 
                      game.privacy === 'private' ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {getPrivacyIcon(game.privacy)}
                      <span className="ml-2 capitalize">{game.privacy}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleLike}
                className={`p-3 rounded-lg transition-colors duration-200 ${
                  isLiked ? 'bg-red-500/20 text-red-400' : 'bg-neutral-700/50 text-neutral-400 hover:text-white'
                }`}
              >
                <HeartIcon className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
              </button>
              <button className="p-3 bg-neutral-700/50 text-neutral-400 hover:text-white rounded-lg transition-colors duration-200">
                <ShareIcon className="w-6 h-6" />
              </button>
              <button
                onClick={handleReport}
                className="p-3 bg-neutral-700/50 text-neutral-400 hover:text-red-400 rounded-lg transition-colors duration-200"
              >
                <FlagIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Game Stats Bar */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-white mb-1">{game.currentParticipants}/{game.maxParticipants}</div>
              <div className="text-sm text-neutral-400">Participants</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white mb-1">{game.duration}</div>
              <div className="text-sm text-neutral-400">Days</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white mb-1">{game.views}</div>
              <div className="text-sm text-neutral-400">Views</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white mb-1">{game.likes}</div>
              <div className="text-sm text-neutral-400">Likes</div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-neutral-700/50">
            <nav className="flex space-x-8 px-6">
              {['overview', 'participants', 'rules', 'rewards', 'announcements'].map((tab) => (
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
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                  <p className="text-neutral-300 leading-relaxed">{game.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Game Details</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Start Date:</span>
                        <span className="text-white">{formatDate(game.startDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">End Date:</span>
                        <span className="text-white">{formatDate(game.endDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Time Remaining:</span>
                        <span className="text-green-400 font-medium">{formatTimeRemaining(game.endDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Role Switching:</span>
                        <span className={`font-medium ${game.allowRoleSwitching ? 'text-green-400' : 'text-red-400'}`}>
                          {game.allowRoleSwitching ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Approval Required:</span>
                        <span className={`font-medium ${game.requireApproval ? 'text-yellow-400' : 'text-green-400'}`}>
                          {game.requireApproval ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Creator Information</h3>
                    <div className="flex items-center space-x-4 p-4 bg-neutral-700/30 rounded-lg">
                      <img 
                        src={game.creator.avatar} 
                        alt={game.creator.username}
                        className="w-16 h-16 rounded-full border-2 border-neutral-600"
                      />
                      <div>
                        <div className="text-white font-semibold text-lg">{game.creator.username}</div>
                        <div className="text-neutral-400 capitalize">{game.creator.role}</div>
                        <div className="text-sm text-neutral-500">
                          {game.creator.totalGames} games • {game.creator.successRate}% success rate
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {game.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Participants Tab */}
            {activeTab === 'participants' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Participants ({game.currentParticipants}/{game.maxParticipants})</h3>
                  {game.status === 'recruiting' && game.currentParticipants < game.maxParticipants && !isParticipant && (
                    <button
                      onClick={handleJoinGame}
                      className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                    >
                      <UserPlusIcon className="w-5 h-5" />
                      <span>Join Game</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {game.participants.map((participant) => (
                    <div key={participant.id} className="bg-neutral-700/30 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <img 
                          src={participant.avatar} 
                          alt={participant.username}
                          className="w-12 h-12 rounded-full border-2 border-neutral-600"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-medium">{participant.username}</span>
                            {participant.isCreator && (
                              <CrownIcon className="w-4 h-4 text-yellow-400" />
                            )}
                          </div>
                          <div className="text-sm text-neutral-400 capitalize">
                            {participant.currentRole} • Joined {new Date(participant.joinDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-400">Role:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          participant.currentRole === 'dom' ? 'bg-red-500/20 text-red-400' :
                          participant.currentRole === 'sub' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {participant.currentRole}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {game.status === 'recruiting' && game.currentParticipants < game.maxParticipants && (
                  <div className="text-center py-8 border-2 border-dashed border-neutral-600 rounded-lg">
                    <UserGroupIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-white mb-2">Open Spots Available</h4>
                    <p className="text-neutral-400 mb-4">
                      {game.maxParticipants - game.currentParticipants} more participants can join this game
                    </p>
                    {!isParticipant && (
                      <button
                        onClick={handleJoinGame}
                        className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors duration-200"
                      >
                        Join Game
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Rules Tab */}
            {activeTab === 'rules' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Game Rules</h3>
                  <div className="prose prose-invert max-w-none">
                    <div className="bg-neutral-700/30 rounded-lg p-6">
                      <div className="whitespace-pre-line text-neutral-300 leading-relaxed">
                        {game.rules}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rewards Tab */}
            {activeTab === 'rewards' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Rewards & Recognition</h3>
                  <div className="prose prose-invert max-w-none">
                    <div className="bg-neutral-700/30 rounded-lg p-6">
                      <div className="whitespace-pre-line text-neutral-300 leading-relaxed">
                        {game.rewards}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Announcements Tab */}
            {activeTab === 'announcements' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Game Announcements</h3>
                  {isCreator && (
                    <button className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2">
                      <PlusIcon className="w-5 h-5" />
                      <span>New Announcement</span>
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {game.announcements.map((announcement) => (
                    <div key={announcement.id} className="bg-neutral-700/30 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`w-3 h-3 rounded-full mt-2 ${
                          announcement.type === 'info' ? 'bg-blue-400' :
                          announcement.type === 'reminder' ? 'bg-yellow-400' :
                          'bg-green-400'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-neutral-300 mb-2">{announcement.message}</p>
                          <div className="text-sm text-neutral-500">
                            {formatDate(announcement.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {game.announcements.length === 0 && (
                  <div className="text-center py-8 text-neutral-400">
                    <ChatBubbleLeftIcon className="w-12 h-12 mx-auto mb-4" />
                    <p>No announcements yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Join Game Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-800 rounded-xl border border-neutral-700 max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Join Game</h3>
              <p className="text-neutral-400 mb-6">
                Are you sure you want to join "{game.title}"? You'll be able to participate in all game activities and role switching.
              </p>
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
                  }}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors duration-200"
                >
                  Join Game
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-800 rounded-xl border border-neutral-700 max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Report Game</h3>
              <p className="text-neutral-400 mb-6">
                If you believe this game violates our community guidelines, please report it. Our moderation team will review your report.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle report logic
                    setShowReportModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200"
                >
                  Report Game
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernSwitchGameDetails; 