import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Squares2X2Icon, 
  PlayIcon,
  ArrowLeftIcon,
  FireIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  TrophyIcon,
  BoltIcon,
  PlusIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { retryApiCall } from '../../utils/retry';
import { ERROR_MESSAGES, API_RESPONSE_TYPES } from '../../constants.jsx';
import { validateApiResponse } from '../../utils/apiValidation';
import { handleApiError } from '../../utils/errorHandler';
import api from '../../api/axios';

const ModernSwitchGames = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [userSwitchGames, setUserSwitchGames] = useState([]);
  const [generalError, setGeneralError] = useState('');
  const [generalInfo, setGeneralInfo] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchUserSwitchGames = async () => {
    try {
      setLoading(true);
      setGeneralError('');
      setGeneralInfo('');
      
      const response = await retryApiCall(() => api.get('/switches/performer'));
      
      if (response && response.data) {
        const responseData = response.data;
        const games = responseData.games || responseData;
        const switchGamesData = validateApiResponse(games, API_RESPONSE_TYPES.SWITCH_GAME_ARRAY);
        setUserSwitchGames(switchGamesData);
        
        if (switchGamesData.length > 0) {
          setGeneralInfo(`Found ${switchGamesData.length} switch game(s)!`);
        } else {
          setGeneralInfo('No switch games found. Create your first one!');
        }
      } else {
        setUserSwitchGames([]);
        setGeneralInfo('No switch games found. Create your first one!');
      }
    } catch (error) {
      console.error('Failed to load user switch games:', error);
      const errorMessage = handleApiError(error, 'switch games');
      setGeneralError(errorMessage);
      setUserSwitchGames([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserSwitchGames();
    
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setGeneralError('Request timed out. Please try again.');
      }
    }, 10000);

    return () => clearTimeout(timeoutId);
  }, []);

  // Calculate basic stats from user's switch games
  const stats = {
    total: userSwitchGames.length,
    active: userSwitchGames.filter(game => game.status === 'in_progress').length,
    completed: userSwitchGames.filter(game => game.status === 'completed').length,
    waiting: userSwitchGames.filter(game => game.status === 'waiting_for_participant').length
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'waiting_for_participant':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'in_progress':
        return <FireIcon className="w-4 h-4" />;
      case 'waiting_for_participant':
        return <ClockIcon className="w-4 h-4" />;
      default:
        return <ExclamationTriangleIcon className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading Switch Games</div>
          <p className="text-neutral-400 text-sm mt-2">Please wait while we load your games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Header */}
      <div className="bg-neutral-800/50 backdrop-blur-sm border-b border-neutral-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Switch Games</h1>
                <p className="text-neutral-400 text-sm">Create or participate in switch games</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium">
                <div className="flex items-center space-x-1">
                  <PlayIcon className="w-4 h-4" />
                  <span>Switch Mode</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Main Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-2xl flex items-center justify-center">
              <PlayIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white">Switch Games</h2>
              <p className="text-xl sm:text-2xl text-neutral-300 mt-2">
                Create or participate in switch games
              </p>
            </div>
          </div>
          <p className="text-neutral-400 text-lg max-w-3xl mx-auto">
            Engage in dynamic switch games where roles can change and challenges evolve
          </p>
        </div>

        {/* Stats Display */}
        {stats.total > 0 && (
          <div className="mb-12">
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl">
              <h3 className="text-2xl font-semibold text-white mb-6 text-center flex items-center justify-center gap-3">
                <TrophyIcon className="w-6 h-6 text-primary" />
                Your Switch Games Overview
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-neutral-700/50 rounded-xl p-6 border border-neutral-600/50 text-center">
                  <div className="text-3xl font-bold text-white mb-2">{stats.total}</div>
                  <div className="text-neutral-300 text-sm">Total Games</div>
                </div>
                <div className="bg-blue-500/20 rounded-xl p-6 border border-blue-500/30 text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">{stats.active}</div>
                  <div className="text-blue-300 text-sm">Active Games</div>
                </div>
                <div className="bg-green-500/20 rounded-xl p-6 border border-green-500/30 text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">{stats.completed}</div>
                  <div className="text-green-300 text-sm">Completed</div>
                </div>
                <div className="bg-yellow-500/20 rounded-xl p-6 border border-yellow-500/30 text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">{stats.waiting}</div>
                  <div className="text-yellow-300 text-sm">Waiting</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {generalError && (
          <div className="mb-8 bg-red-500/20 border border-red-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 text-red-400">
              <ExclamationTriangleIcon className="w-6 h-6" />
              <span className="font-medium">{generalError}</span>
            </div>
          </div>
        )}

        {/* Info Display */}
        {generalInfo && (
          <div className="mb-8 bg-blue-500/20 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 text-blue-400">
              <InformationCircleIcon className="w-6 h-6" />
              <span className="font-medium">{generalInfo}</span>
            </div>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {/* Create Game Card */}
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm rounded-2xl border border-purple-500/30 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Squares2X2Icon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Create a Switch Game</h3>
              <p className="text-neutral-300 mb-8 leading-relaxed">
                Start a new switch game and invite others to participate. Set the rules, challenges, and rewards.
              </p>
              <Link to="/modern/switches/create">
                <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl px-8 py-4 font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                  <PlusIcon className="w-5 h-5" />
                  Create Game
                </button>
              </Link>
            </div>
          </div>

          {/* Participate Card */}
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-2xl border border-blue-500/30 p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <PlayIcon className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Join a Switch Game</h3>
              <p className="text-neutral-300 mb-8 leading-relaxed">
                Find and join available switch games. Discover new challenges and meet other players.
              </p>
              <Link to="/modern/switches/participate">
                <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl px-8 py-4 font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
                  <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                  Join Game
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* User's Switch Games List */}
        {userSwitchGames.length > 0 && (
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl">
            <h3 className="text-2xl font-semibold text-white mb-8 text-center flex items-center justify-center gap-3">
              <UserGroupIcon className="w-6 h-6 text-primary" />
              Your Switch Games
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userSwitchGames.slice(0, 6).map((game) => (
                <div key={game._id} className="bg-neutral-700/50 backdrop-blur-sm rounded-xl border border-neutral-600/50 p-6 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(game.status)} flex items-center gap-2`}>
                      {getStatusIcon(game.status)}
                      {game.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  
                  <h4 className="text-white font-semibold mb-3 truncate text-lg">
                    {game.creatorDare?.description || 'Switch Game'}
                  </h4>
                  
                  <div className="flex items-center gap-2 mb-4 text-sm text-neutral-400">
                    <UserGroupIcon className="w-4 h-4" />
                    <span>Created by {game.creator?.fullName || game.creator?.username || 'Unknown'}</span>
                  </div>
                  
                  <Link to={`/modern/switches/${game._id}`}>
                    <button className="w-full bg-neutral-600/50 hover:bg-neutral-500/50 text-white rounded-lg px-4 py-3 font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
                      <EyeIcon className="w-4 h-4" />
                      View Details
                    </button>
                  </Link>
                </div>
              ))}
            </div>
            
            {userSwitchGames.length > 6 && (
              <div className="text-center mt-8">
                <Link to="/modern/switches">
                  <button className="bg-neutral-600/50 hover:bg-neutral-500/50 text-white rounded-xl px-8 py-3 font-medium transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto">
                    <BoltIcon className="w-5 h-5" />
                    View All Games ({userSwitchGames.length})
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-12 text-center">
          <button
            onClick={fetchUserSwitchGames}
            className="px-8 py-3 bg-neutral-700/50 hover:bg-neutral-600/50 text-neutral-300 hover:text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 mx-auto"
            disabled={loading}
          >
            <BoltIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Games'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModernSwitchGames; 