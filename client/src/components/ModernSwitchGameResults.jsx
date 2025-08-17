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
  TrophyIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  ChartBarIcon,
  PhotoIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  PaperAirplaneIcon,
  CameraIcon,
  DocumentIcon
} from '@heroicons/react/24/solid';
import { DIFFICULTY_OPTIONS } from '../constants';

const ModernSwitchGameResults = () => {
  const [game, setGame] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [winners, setWinners] = useState([]);
  const [losers, setLosers] = useState([]);
  const [activeTab, setActiveTab] = useState('results');
  const [showProofModal, setShowProofModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedLoser, setSelectedLoser] = useState(null);
  const [isCreator, setIsCreator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGameResults = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockGame = {
          id: 'game_001',
          title: 'Weekend Role Switch Challenge',
          difficulty: 'explicit',
          status: 'completed',
          startDate: '2024-01-20T00:00:00Z',
          endDate: '2024-01-23T00:00:00Z',
          creator: {
            id: 'user_123',
            username: 'GameMaster',
            avatar: '/api/avatars/user_123.jpg'
          },
          finalResults: {
            totalPoints: 1247,
            averageScore: 8.7,
            totalTasks: 48,
            completedTasks: 42
          }
        };

        const mockParticipants = [
          {
            id: 'user_123',
            username: 'GameMaster',
            avatar: '/api/avatars/user_123.jpg',
            role: 'switch',
            finalScore: 298,
            rank: 1,
            status: 'winner',
            proofRequired: false,
            proofSubmitted: null,
            proofVerified: null
          },
          {
            id: 'user_456',
            username: 'PlayerOne',
            avatar: '/api/avatars/user_456.jpg',
            role: 'dom',
            finalScore: 287,
            rank: 2,
            status: 'winner',
            proofRequired: true,
            proofSubmitted: {
              type: 'photo',
              url: '/api/proofs/user_456_001.jpg',
              timestamp: '2024-01-22T18:30:00Z'
            },
            proofVerified: true
          },
          {
            id: 'user_789',
            username: 'PlayerTwo',
            avatar: '/api/avatars/user_789.jpg',
            role: 'sub',
            finalScore: 275,
            rank: 3,
            status: 'winner',
            proofRequired: true,
            proofSubmitted: {
              type: 'video',
              url: '/api/proofs/user_789_001.mp4',
              timestamp: '2024-01-22T19:15:00Z'
            },
            proofVerified: true
          },
          {
            id: 'user_101',
            username: 'PlayerThree',
            avatar: '/api/avatars/user_101.jpg',
            role: 'switch',
            finalScore: 267,
            rank: 4,
            status: 'winner',
            proofRequired: true,
            proofSubmitted: {
              type: 'text',
              content: 'Completed all weekend challenges successfully',
              timestamp: '2024-01-22T20:00:00Z'
            },
            proofVerified: true
          },
          {
            id: 'user_202',
            username: 'PlayerFour',
            avatar: '/api/avatars/user_202.jpg',
            role: 'dom',
            finalScore: 0,
            rank: 5,
            status: 'loser',
            proofRequired: true,
            proofSubmitted: null,
            proofVerified: null,
            punishment: 'Must complete 3 additional tasks next week'
          }
        ];

        setGame(mockGame);
        setParticipants(mockParticipants);
        setWinners(mockParticipants.filter(p => p.status === 'winner'));
        setLosers(mockParticipants.filter(p => p.status === 'loser'));
        setIsCreator(true); // Mock: current user is creator
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching game results:', error);
        setIsLoading(false);
      }
    };

    fetchGameResults();
  }, []);

  const getDifficultyColor = (difficulty) => {
    const colors = {
      titillating: 'from-pink-400 to-pink-600',
      arousing: 'from-purple-500 to-purple-700',
      explicit: 'from-red-500 to-red-700',
      edgy: 'from-yellow-400 to-yellow-600',
      hardcore: 'from-gray-700 to-gray-900'
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
    return icons[role] || <UserGroupIcon className="w-4 h-4" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProofIcon = (type) => {
    const icons = {
      photo: <PhotoIcon className="w-8 h-8 text-neutral-400 mx-auto mb-2" />,
      video: <VideoCameraIcon className="w-8 h-8 text-neutral-400 mx-auto mb-2" />,
      text: <DocumentTextIcon className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
    };
    return icons[type] || <DocumentIcon className="w-8 h-8 text-neutral-400 mx-auto mb-2" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-8">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <div className="text-white/80 text-lg font-medium">Loading game results...</div>
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
            <div className="w-24 h-24 bg-neutral-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <DocumentIcon className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Game Results Found</h3>
            <p className="text-neutral-400 mb-6">
              The game results you're looking for don't exist or haven't been published yet.
            </p>
            <button className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors duration-200">
              Browse Available Games
            </button>
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
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={() => window.history.back()}
              className="p-2 bg-neutral-800/50 hover:bg-neutral-700/50 text-white rounded-lg transition-colors duration-200"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Game Results</h1>
              <p className="text-neutral-400">Final outcomes and rankings</p>
            </div>
          </div>

          {/* Game Info Card */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${getDifficultyColor(game.difficulty)} flex items-center justify-center text-white`}>
                  {getDifficultyIcon(game.difficulty)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{game.title}</h2>
                  <div className="flex items-center space-x-4 text-sm text-neutral-400">
                    <span className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{formatDate(game.startDate)} - {formatDate(game.endDate)}</span>
                    </span>
                    <span className="flex items-center space-x-2">
                      <UserGroupIcon className="w-4 h-4" />
                      <span>{participants.length} participants</span>
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">{game.finalResults.totalPoints}</div>
                <div className="text-sm text-neutral-400">Total Points</div>
              </div>
            </div>

            {/* Game Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-neutral-700/50">
              <div className="text-center">
                <div className="text-xl font-bold text-white">{game.finalResults.averageScore}</div>
                <div className="text-sm text-neutral-400">Average Score</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{game.finalResults.totalTasks}</div>
                <div className="text-sm text-neutral-400">Total Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{game.finalResults.completedTasks}</div>
                <div className="text-sm text-neutral-400">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{winners.length}</div>
                <div className="text-sm text-neutral-400">Winners</div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-neutral-800/50 backdrop-blur-sm rounded-lg p-1 mb-8">
          {[
            { id: 'results', label: 'Final Rankings', icon: <TrophyIcon className="w-4 h-4" /> },
            { id: 'winners', label: 'Winners', icon: <StarIcon className="w-4 h-4" /> },
            { id: 'losers', label: 'Losers', icon: <XCircleIcon className="w-4 h-4" /> },
            { id: 'proofs', label: 'Proof Verification', icon: <CheckCircleIcon className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-700/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Based on Active Tab */}
        {activeTab === 'results' && (
          <div className="space-y-6">
            {/* Final Rankings */}
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 overflow-hidden">
              <div className="p-6 border-b border-neutral-700/50">
                <h3 className="text-xl font-semibold text-white">Final Rankings</h3>
                <p className="text-neutral-400 text-sm mt-1">Complete participant standings</p>
              </div>
              <div className="divide-y divide-neutral-700/50">
                {participants.map((participant, index) => (
                  <div key={participant.id} className="p-6 hover:bg-neutral-700/30 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-700/50 text-white font-bold text-sm">
                          {participant.rank}
                        </div>
                        <img
                          src={participant.avatar}
                          alt={participant.username}
                          className="w-12 h-12 rounded-full border-2 border-neutral-600"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-lg font-semibold text-white">{participant.username}</h4>
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getRoleColor(participant.role)} text-white`}>
                              {getRoleIcon(participant.role)}
                              <span className="ml-1 capitalize">{participant.role}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-neutral-400 mt-1">
                            <span>Score: {participant.finalScore}</span>
                            {participant.status === 'winner' && (
                              <span className="flex items-center space-x-1 text-green-400">
                                <CheckCircleIcon className="w-4 h-4" />
                                <span>Winner</span>
                              </span>
                            )}
                            {participant.status === 'loser' && (
                              <span className="flex items-center space-x-1 text-red-400">
                                <XCircleIcon className="w-4 h-4" />
                                <span>Loser</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {participant.rank === 1 && (
                          <div className="flex items-center space-x-2 text-yellow-400">
                            <TrophyIcon className="w-6 h-6" />
                            <span className="font-semibold">1st Place</span>
                          </div>
                        )}
                        {participant.rank === 2 && (
                          <div className="flex items-center space-x-2 text-gray-300">
                            <TrophyIcon className="w-6 h-6" />
                            <span className="font-semibold">2nd Place</span>
                          </div>
                        )}
                        {participant.rank === 3 && (
                          <div className="flex items-center space-x-2 text-amber-600">
                            <TrophyIcon className="w-6 h-6" />
                            <span className="font-semibold">3rd Place</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'winners' && (
          <div className="space-y-6">
            {/* Winners Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {winners.map((winner, index) => (
                <div key={winner.id} className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6 hover:border-primary/50 transition-all duration-200">
                  <div className="text-center mb-4">
                    <div className="relative inline-block">
                      <img
                        src={winner.avatar}
                        alt={winner.username}
                        className="w-20 h-20 rounded-full border-4 border-primary mx-auto mb-3"
                      />
                      {winner.rank === 1 && (
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                          <TrophyIcon className="w-5 h-5 text-yellow-900" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-1">{winner.username}</h3>
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getRoleColor(winner.role)} text-white`}>
                        {getRoleIcon(winner.role)}
                        <span className="ml-1 capitalize">{winner.role}</span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-primary mb-1">{winner.finalScore}</div>
                    <div className="text-sm text-neutral-400">Final Score</div>
                  </div>
                  
                  {winner.proofRequired && winner.proofSubmitted && (
                    <div className="border-t border-neutral-700/50 pt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-neutral-400">Proof Status:</span>
                        <span className="flex items-center space-x-1 text-green-400">
                          <CheckCircleIcon className="w-4 h-4" />
                          <span>Verified</span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'losers' && (
          <div className="space-y-6">
            {/* Losers List */}
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 overflow-hidden">
              <div className="p-6 border-b border-neutral-700/50">
                <h3 className="text-xl font-semibold text-white">Game Losers</h3>
                <p className="text-neutral-400 text-sm mt-1">Participants who didn't complete the challenge</p>
              </div>
              <div className="divide-y divide-neutral-700/50">
                {losers.map((loser) => (
                  <div key={loser.id} className="p-6 hover:bg-neutral-700/30 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={loser.avatar}
                          alt={loser.username}
                          className="w-12 h-12 rounded-full border-2 border-red-500/50"
                        />
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-1">{loser.username}</h4>
                          <div className="flex items-center space-x-2 mb-2">
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getRoleColor(loser.role)} text-white`}>
                              {getRoleIcon(loser.role)}
                              <span className="ml-1 capitalize">{loser.role}</span>
                            </div>
                          </div>
                          {loser.punishment && (
                            <div className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">
                              <span className="font-medium">Punishment:</span> {loser.punishment}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-400 mb-1">{loser.finalScore}</div>
                        <div className="text-sm text-neutral-400">Final Score</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'proofs' && (
          <div className="space-y-6">
            {/* Proof Verification Status */}
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 overflow-hidden">
              <div className="p-6 border-b border-neutral-700/50">
                <h3 className="text-xl font-semibold text-white">Proof Verification</h3>
                <p className="text-neutral-400 text-sm mt-1">Status of all submitted proofs</p>
              </div>
              <div className="divide-y divide-neutral-700/50">
                {participants.filter(p => p.proofRequired).map((participant) => (
                  <div key={participant.id} className="p-6 hover:bg-neutral-700/30 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={participant.avatar}
                          alt={participant.username}
                          className="w-12 h-12 rounded-full border-2 border-neutral-600"
                        />
                        <div>
                          <h4 className="text-lg font-semibold text-white mb-1">{participant.username}</h4>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-neutral-400">Proof Type:</span>
                            <span className="text-sm text-white capitalize">{participant.proofSubmitted?.type || 'Not submitted'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {participant.proofSubmitted ? (
                          <div className="flex items-center space-x-2">
                            {participant.proofVerified ? (
                              <span className="flex items-center space-x-1 text-green-400">
                                <CheckCircleIcon className="w-5 h-5" />
                                <span className="text-sm">Verified</span>
                              </span>
                            ) : (
                              <span className="flex items-center space-x-1 text-yellow-400">
                                <ClockIcon className="w-5 h-5" />
                                <span className="text-sm">Pending</span>
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="flex items-center space-x-1 text-red-400">
                            <XCircleIcon className="w-5 h-5" />
                            <span className="text-sm">Missing</span>
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {participant.proofSubmitted && (
                      <div className="mt-4 p-4 bg-neutral-700/30 rounded-lg">
                        <div className="flex items-center space-x-4">
                          {getProofIcon(participant.proofSubmitted.type)}
                          <div className="flex-1">
                            <div className="text-sm text-neutral-400 mb-1">
                              Submitted: {formatDate(participant.proofSubmitted.timestamp)}
                            </div>
                            {participant.proofSubmitted.type === 'text' && (
                              <p className="text-white">{participant.proofSubmitted.content}</p>
                            )}
                            {(participant.proofSubmitted.type === 'photo' || participant.proofSubmitted.type === 'video') && (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-neutral-400">File:</span>
                                <span className="text-sm text-white">{participant.proofSubmitted.url.split('/').pop()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {isCreator && (
          <div className="mt-8 flex flex-wrap gap-4">
            <button className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2">
              <ShareIcon className="w-5 h-5" />
              <span>Share Results</span>
            </button>
            <button className="px-6 py-3 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2">
              <ChartBarIcon className="w-5 h-5" />
              <span>Export Data</span>
            </button>
            <button className="px-6 py-3 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2">
              <CogIcon className="w-5 h-5" />
              <span>Game Settings</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernSwitchGameResults; 