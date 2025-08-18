import React, { useState, useEffect } from 'react';
import {
  FireIcon,
  UserGroupIcon,
  ClockIcon,
  CalendarIcon,
  EyeIcon,
  HeartIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  RocketLaunchIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  GlobeAltIcon,
  LockClosedIcon,
  PlayIcon,
  PauseIcon,
  CheckIcon,
  XMarkIcon,
  ArrowLeftIcon,
  UserPlusIcon,
  TrophyIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  PaperAirplaneIcon,
  CameraIcon,
  CogIcon,
  BellIcon,
  ShieldCheckIcon,
  UsersIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  ClockIcon as ClockIconSolid
} from '@heroicons/react/24/solid';
import { DIFFICULTY_OPTIONS, PRIVACY_OPTIONS } from '../../constants';

const ModernSwitchGameClaim = () => {
  // State management
  const [availableGames, setAvailableGames] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [activeTab, setActiveTab] = useState('available');
  const [filters, setFilters] = useState({
    difficulties: [],
    privacy: 'all',
    status: 'recruiting',
    search: ''
  });
  const [loading, setLoading] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showGameDetails, setShowGameDetails] = useState(false);
  const [claimModal, setClaimModal] = useState(false);
  const [invitationModal, setInvitationModal] = useState(false);
  const [claimForm, setClaimForm] = useState({
    role: '',
    commitment: '',
    notes: ''
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    fetchAvailableGames();
    fetchMyClaims();
    fetchPendingInvitations();
  }, []);

  const fetchAvailableGames = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setAvailableGames([
        {
          id: 'sg1',
          title: 'Weekend Role Reversal Challenge',
          description: 'A weekend-long adventure where participants switch between dominant and submissive roles every 12 hours.',
          difficulty: 'explicit',
          privacy: 'public',
          status: 'recruiting',
          creator: { username: 'GameMaster', avatar: null },
          participants: 3,
          maxParticipants: 6,
          startDate: '2024-01-20',
          duration: '72h',
          roles: ['dom', 'sub', 'switch'],
          tags: ['weekend', 'role-switching', 'intensive'],
          requirements: 'Must be available for full weekend, previous experience preferred',
          rewards: 'Enhanced role flexibility, community recognition',
          createdAt: '2024-01-15T10:00:00Z'
        },
        {
          id: 'sg2',
          title: 'Gentle Introduction to Switching',
          description: 'A beginner-friendly game for those new to role switching, with mentorship and guidance.',
          difficulty: 'titillating',
          privacy: 'public',
          status: 'recruiting',
          creator: { username: 'SwitchGuide', avatar: null },
          participants: 2,
          maxParticipants: 4,
          startDate: '2024-01-25',
          duration: '24h',
          roles: ['sub', 'switch'],
          tags: ['beginner', 'mentorship', 'gentle'],
          requirements: 'Open to learning, respectful attitude',
          rewards: 'Skill development, confidence building',
          createdAt: '2024-01-16T14:30:00Z'
        },
        {
          id: 'sg3',
          title: 'Advanced Power Exchange Marathon',
          description: 'An intense 48-hour power exchange experience for experienced players.',
          difficulty: 'hardcore',
          privacy: 'invite-only',
          status: 'recruiting',
          creator: { username: 'PowerMaster', avatar: null },
          participants: 1,
          maxParticipants: 3,
          startDate: '2024-01-30',
          duration: '48h',
          roles: ['dom', 'sub'],
          tags: ['advanced', 'intense', 'power-exchange'],
          requirements: 'Minimum 2 years experience, safety certification',
          rewards: 'Advanced techniques, exclusive community access',
          createdAt: '2024-01-17T09:15:00Z'
        }
      ]);
      setLoading(false);
    }, 1000);
  };

  const fetchMyClaims = async () => {
    // Simulate API call
    setTimeout(() => {
      setMyClaims([
        {
          id: 'claim1',
          gameId: 'sg1',
          gameTitle: 'Weekend Role Reversal Challenge',
          status: 'pending',
          role: 'switch',
          claimedAt: '2024-01-15T11:00:00Z',
          response: null,
          gameStatus: 'recruiting'
        },
        {
          id: 'claim2',
          gameId: 'sg2',
          gameTitle: 'Gentle Introduction to Switching',
          status: 'accepted',
          role: 'sub',
          claimedAt: '2024-01-16T15:00:00Z',
          response: 'Welcome aboard! Looking forward to guiding you.',
          gameStatus: 'in_progress'
        }
      ]);
    }, 500);
  };

  const fetchPendingInvitations = async () => {
    // Simulate API call
    setTimeout(() => {
      setPendingInvitations([
        {
          id: 'inv1',
          gameId: 'sg3',
          gameTitle: 'Advanced Power Exchange Marathon',
          inviter: 'PowerMaster',
          role: 'sub',
          message: 'I think you\'d be perfect for this challenge. Your experience level matches perfectly.',
          sentAt: '2024-01-17T10:00:00Z',
          expiresAt: '2024-01-20T10:00:00Z'
        }
      ]);
    }, 300);
  };

  // Filter and search functions
  const filteredGames = availableGames.filter(game => {
    if (filters.difficulties.length > 0 && !filters.difficulties.includes(game.difficulty)) {
      return false;
    }
    if (filters.privacy !== 'all' && game.privacy !== filters.privacy) {
      return false;
    }
    if (filters.status !== 'all' && game.status !== filters.status) {
      return false;
    }
    if (filters.search && !game.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !game.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Game actions
  const handleClaimGame = (game) => {
    setSelectedGame(game);
    setClaimModal(true);
  };

  const handleViewGame = (game) => {
    setSelectedGame(game);
    setShowGameDetails(true);
  };

  const handleAcceptInvitation = (invitation) => {
    setSelectedGame({ id: invitation.gameId, title: invitation.gameTitle });
    setInvitationModal(true);
  };

  const submitClaim = async () => {
    if (!claimForm.role || !claimForm.commitment) {
      return;
    }

    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      const newClaim = {
        id: `claim${Date.now()}`,
        gameId: selectedGame.id,
        gameTitle: selectedGame.title,
        status: 'pending',
        role: claimForm.role,
        claimedAt: new Date().toISOString(),
        response: null,
        gameStatus: 'recruiting'
      };

      setMyClaims(prev => [newClaim, ...prev]);
      setClaimModal(false);
      setClaimForm({ role: '', commitment: '', notes: '' });
      setLoading(false);
    }, 1000);
  };

  const submitInvitationResponse = async (accepted) => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      if (accepted) {
        const newClaim = {
          id: `claim${Date.now()}`,
          gameId: selectedGame.id,
          gameTitle: selectedGame.title,
          status: 'accepted',
          role: selectedGame.role,
          claimedAt: new Date().toISOString(),
          response: 'Invitation accepted!',
          gameStatus: 'in_progress'
        };
        setMyClaims(prev => [newClaim, ...prev]);
      }
      
      setPendingInvitations(prev => prev.filter(inv => inv.gameId !== selectedGame.id));
      setInvitationModal(false);
      setLoading(false);
    }, 1000);
  };

  // Utility functions
  const getDifficultyColor = (difficulty) => {
    const colors = {
      titillating: 'bg-red-400',
      arousing: 'bg-red-500',
      explicit: 'bg-red-600',
      edgy: 'bg-red-700',
      hardcore: 'bg-red-800'
    };
    return colors[difficulty] || 'bg-gray-500';
  };

  const getStatusColor = (status) => {
    const colors = {
      recruiting: 'bg-green-500',
      'in_progress': 'bg-blue-500',
      completed: 'bg-purple-500',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getClaimStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500',
      accepted: 'bg-green-500',
      rejected: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return formatDate(dateString);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white">
      {/* Header */}
      <div className="bg-neutral-800/50 backdrop-blur-sm border-b border-neutral-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-2xl flex items-center justify-center">
                <UserGroupIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Switch Game Claims</h1>
                <p className="text-neutral-400">Join exciting switch games and manage your participation</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.history.back()}
                className="flex items-center space-x-2 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Back</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 bg-neutral-800/50 rounded-xl p-1 mb-8">
          {[
            { id: 'available', label: 'Available Games', count: filteredGames.length },
            { id: 'my-claims', label: 'My Claims', count: myClaims.length },
            { id: 'invitations', label: 'Invitations', count: pendingInvitations.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-lg'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-700/50'
              }`}
            >
              <span>{tab.label}</span>
              <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Available Games Tab */}
        {activeTab === 'available' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-neutral-800/50 rounded-xl p-6 border border-neutral-700">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                    <input
                      type="text"
                      placeholder="Search games..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <select
                    value={filters.difficulty}
                    onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                    className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">All Difficulties</option>
                    {DIFFICULTY_OPTIONS.map(difficulty => (
                      <option key={difficulty.value} value={difficulty.value}>
                        {difficulty.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">All Statuses</option>
                    <option value="recruiting">Recruiting</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Games Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-neutral-400">Loading available games...</p>
              </div>
            ) : filteredGames.length === 0 ? (
              <div className="text-center py-12">
                <UserGroupIcon className="w-24 h-24 text-neutral-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-white mb-2">No Games Available</h3>
                <p className="text-neutral-400 mb-6">
                  There are currently no games matching your criteria. Check back later or adjust your filters.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredGames.map(game => (
                  <div key={game.id} className="bg-neutral-800/50 rounded-xl border border-neutral-700 overflow-hidden hover:border-neutral-600 transition-all hover:shadow-xl">
                    {/* Game Header */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-white mb-2">{game.title}</h3>
                          <p className="text-neutral-400 text-sm line-clamp-2">{game.description}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(game.difficulty)}`}>
                            {game.difficulty}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(game.status)}`}>
                            {game.status}
                          </span>
                        </div>
                      </div>

                      {/* Game Details */}
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-neutral-400">
                          <UserGroupIcon className="w-4 h-4" />
                          <span>{game.participants}/{game.maxParticipants} participants</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-neutral-400">
                          <CalendarIcon className="w-4 h-4" />
                          <span>Starts {formatDate(game.startDate)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-neutral-400">
                          <ClockIcon className="w-4 h-4" />
                          <span>Duration: {game.duration}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-neutral-400">
                          {game.privacy === 'public' ? (
                            <GlobeAltIcon className="w-4 h-4" />
                          ) : (
                            <LockClosedIcon className="w-4 h-4" />
                          )}
                          <span className="capitalize">{game.privacy}</span>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {game.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-neutral-700 rounded-md text-xs text-neutral-300">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleViewGame(game)}
                          className="flex-1 px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white transition-colors"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleClaimGame(game)}
                          className="flex-1 px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg text-white font-medium transition-colors"
                        >
                          Claim Game
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Claims Tab */}
        {activeTab === 'my-claims' && (
          <div className="space-y-6">
            {myClaims.length === 0 ? (
              <div className="text-center py-12">
                <UserGroupIcon className="w-24 h-24 text-neutral-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-white mb-2">No Claims Yet</h3>
                <p className="text-neutral-400 mb-6">
                  You haven't claimed any switch games yet. Browse available games to get started!
                </p>
                <button
                  onClick={() => setActiveTab('available')}
                  className="px-6 py-3 bg-primary hover:bg-primary-dark rounded-lg text-white font-medium transition-colors"
                >
                  Browse Games
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myClaims.map(claim => (
                  <div key={claim.id} className="bg-neutral-800/50 rounded-xl border border-neutral-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">{claim.gameTitle}</h3>
                        <div className="flex items-center space-x-4 text-sm text-neutral-400">
                          <span>Role: <span className="text-white capitalize">{claim.role}</span></span>
                          <span>Claimed: {formatTimeAgo(claim.claimedAt)}</span>
                          <span>Game Status: <span className="text-white capitalize">{claim.gameStatus}</span></span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getClaimStatusColor(claim.status)}`}>
                        {claim.status}
                      </span>
                    </div>
                    
                    {claim.response && (
                      <div className="bg-neutral-700/50 rounded-lg p-4 mb-4">
                        <p className="text-neutral-300 text-sm">
                          <strong>Creator Response:</strong> {claim.response}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex space-x-3">
                      <button className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white transition-colors">
                        View Game
                      </button>
                      {claim.status === 'pending' && (
                        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors">
                          Cancel Claim
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Invitations Tab */}
        {activeTab === 'invitations' && (
          <div className="space-y-6">
            {pendingInvitations.length === 0 ? (
              <div className="text-center py-12">
                <BellIcon className="w-24 h-24 text-neutral-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-white mb-2">No Pending Invitations</h3>
                <p className="text-neutral-400 mb-6">
                  You don't have any pending game invitations at the moment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingInvitations.map(invitation => (
                  <div key={invitation.id} className="bg-neutral-800/50 rounded-xl border border-neutral-700 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">{invitation.gameTitle}</h3>
                        <div className="flex items-center space-x-4 text-sm text-neutral-400 mb-3">
                          <span>Invited by: <span className="text-white">{invitation.inviter}</span></span>
                          <span>Role: <span className="text-white capitalize">{invitation.role}</span></span>
                          <span>Expires: {formatTimeAgo(invitation.expiresAt)}</span>
                        </div>
                        <div className="bg-neutral-700/50 rounded-lg p-4">
                          <p className="text-neutral-300 text-sm">
                            <strong>Message:</strong> {invitation.message}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleAcceptInvitation(invitation)}
                        className="px-6 py-2 bg-primary hover:bg-primary-dark rounded-lg text-white font-medium transition-colors"
                      >
                        Accept Invitation
                      </button>
                      <button className="px-6 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white transition-colors">
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Game Details Modal */}
      {showGameDetails && selectedGame && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{selectedGame.title}</h2>
                <button
                  onClick={() => setShowGameDetails(false)}
                  className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                  <p className="text-neutral-300 leading-relaxed">{selectedGame.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Game Details</h3>
                    <div className="space-y-2 text-sm text-neutral-400">
                      <div className="flex items-center space-x-2">
                        <span className="text-white">Difficulty:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(selectedGame.difficulty)}`}>
                          {selectedGame.difficulty}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white">Privacy:</span>
                        <span className="capitalize">{selectedGame.privacy}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedGame.status)}`}>
                          {selectedGame.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white">Participants:</span>
                        <span>{selectedGame.participants}/{selectedGame.maxParticipants}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white">Start Date:</span>
                        <span>{formatDate(selectedGame.startDate)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white">Duration:</span>
                        <span>{selectedGame.duration}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Requirements & Rewards</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-white mb-1">Requirements</h4>
                        <p className="text-sm text-neutral-400">{selectedGame.requirements}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-white mb-1">Rewards</h4>
                        <p className="text-sm text-neutral-400">{selectedGame.rewards}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Available Roles</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedGame.roles.map(role => (
                      <span key={role} className="px-3 py-1 bg-neutral-700 rounded-lg text-sm text-white capitalize">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => {
                      setShowGameDetails(false);
                      handleClaimGame(selectedGame);
                    }}
                    className="flex-1 px-6 py-3 bg-primary hover:bg-primary-dark rounded-lg text-white font-medium transition-colors"
                  >
                    Claim This Game
                  </button>
                  <button
                    onClick={() => setShowGameDetails(false)}
                    className="px-6 py-3 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Claim Game Modal */}
      {claimModal && selectedGame && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-800 rounded-2xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Claim Game</h2>
                <button
                  onClick={() => setClaimModal(false)}
                  className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">{selectedGame.title}</h3>
                <p className="text-neutral-400 text-sm">{selectedGame.description}</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Preferred Role</label>
                  <select
                    value={claimForm.role}
                    onChange={(e) => setClaimForm(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select a role</option>
                    {selectedGame.roles.map(role => (
                      <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Commitment Level</label>
                  <select
                    value={claimForm.commitment}
                    onChange={(e) => setClaimForm(prev => ({ ...prev, commitment: e.target.value }))}
                    className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select commitment level</option>
                    <option value="casual">Casual - I'll participate when I can</option>
                    <option value="moderate">Moderate - I'll make time for this</option>
                    <option value="dedicated">Dedicated - This is a priority for me</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Additional Notes (Optional)</label>
                  <textarea
                    value={claimForm.notes}
                    onChange={(e) => setClaimForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Tell the creator why you're interested in this game..."
                    rows={3}
                    className="w-full px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-6">
                <button
                  onClick={submitClaim}
                  disabled={loading || !claimForm.role || !claimForm.commitment}
                  className="flex-1 px-6 py-3 bg-primary hover:bg-primary-dark disabled:bg-neutral-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
                >
                  {loading ? 'Submitting...' : 'Submit Claim'}
                </button>
                <button
                  onClick={() => setClaimModal(false)}
                  className="px-6 py-3 bg-neutral-700 hover:bg-neutral-600 rounded-lg text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invitation Response Modal */}
      {invitationModal && selectedGame && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-800 rounded-2xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Game Invitation</h2>
                <button
                  onClick={() => setInvitationModal(false)}
                  className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-2">{selectedGame.title}</h3>
                <p className="text-neutral-400 text-sm">
                  You've been invited to join this switch game. Would you like to accept?
                </p>
              </div>
              
              <div className="flex space-x-3 pt-6">
                <button
                  onClick={() => submitInvitationResponse(true)}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-primary hover:bg-primary-dark disabled:bg-neutral-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
                >
                  {loading ? 'Accepting...' : 'Accept Invitation'}
                </button>
                <button
                  onClick={() => submitInvitationResponse(false)}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-neutral-700 hover:bg-neutral-600 disabled:bg-neutral-600 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
                >
                  {loading ? 'Declining...' : 'Decline'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernSwitchGameClaim; 