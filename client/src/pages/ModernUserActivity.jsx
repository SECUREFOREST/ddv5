import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  ChartBarIcon,
  FireIcon,
  UserIcon,
  HeartIcon,
  TrophyIcon,
  CheckCircleIcon,
  PlayIcon,
  ClockIcon,
  EyeIcon,
  FunnelIcon,
  BellIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  BoltIcon,
  StarIcon,
  CogIcon,
  PlusIcon,
  UsersIcon,
  CalendarIcon,
  TagIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { retryApiCall } from '../utils/retry';
import { useCacheUtils } from '../utils/cache';
import { usePagination, Pagination } from '../utils/pagination.jsx';
import { ERROR_MESSAGES, API_RESPONSE_TYPES } from '../constants.jsx';
import { validateApiResponse } from '../utils/apiValidation';
import { handleApiError } from '../utils/errorHandler';
import api from '../api/axios';

const ModernUserActivity = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showError } = useToast();
  const [activeTab, setActiveTab] = useState('active');
  const [activeDares, setActiveDares] = useState([]);
  const [activeSwitchGames, setActiveSwitchGames] = useState([]);
  const [historyDares, setHistoryDares] = useState([]);
  const [historySwitchGames, setHistorySwitchGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);
  
  // Activate caching for user activity data
  const { getCachedData, setCachedData, invalidateCache } = useCacheUtils();

  // Add pagination for different sections
  const { currentPage: activePage, setCurrentPage: setActivePage, totalPages: activeTotalPages, paginatedData, setTotalItems: setActiveTotalItems } = usePagination(1, 8);
  const { currentPage: historyPage, setCurrentPage: setHistoryPage, totalPages: historyTotalPages, paginatedData: historyPaginatedData, setTotalItems: setHistoryTotalItems } = usePagination(1, 8);
  
  // Get paginated items
  const activePaginatedItems = paginatedData(activeDares || []);
  const historyPaginatedItems = historyPaginatedData(historyDares || []);
  
  // Update total items when data changes
  React.useEffect(() => {
    const total = Array.isArray(activeDares) ? activeDares.length : 0;
    setActiveTotalItems(total);
  }, [activeDares, setActiveTotalItems]);
  
  React.useEffect(() => {
    const total = Array.isArray(historyDares) ? historyDares.length : 0;
    setHistoryTotalItems(total);
  }, [historyDares, setHistoryTotalItems]);

  useEffect(() => {
    if (!user) return;
    const userId = user._id || user.id;
    if (!userId) return;
    
    // Check cache first
    const cacheKey = `user_activity_${userId}`;
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      setActiveDares(cachedData.activeDares || []);
      setActiveSwitchGames(cachedData.activeSwitchGames || []);
      setHistoryDares(cachedData.historyDares || []);
      setHistorySwitchGames(cachedData.historySwitchGames || []);
      setLoading(false);
      setDataLoaded(true);
      return;
    }
    
    // Reset data when user changes
    if (!dataLoaded) {
      setLoading(true);
      setError('');
    }
    
    // Fetch active dares (not completed/chickened out)
    const activeStatuses = ['in_progress', 'waiting_for_participant'];
    const historyStatuses = ['completed', 'chickened_out'];
    
    Promise.allSettled([
      retryApiCall(() => api.get('/dares', { params: { creator: userId, status: activeStatuses.join(',') } })),
      retryApiCall(() => api.get('/dares', { params: { participant: userId, status: activeStatuses.join(',') } })),
      retryApiCall(() => api.get('/dares', { params: { creator: userId, status: historyStatuses.join(',') } })),
      retryApiCall(() => api.get('/dares', { params: { participant: userId, status: historyStatuses.join(',') } })),
      retryApiCall(() => api.get('/switches/performer', { params: { status: activeStatuses.join(',') } })),
      retryApiCall(() => api.get('/switches/history'))
    ])
      .then(([
        createdActiveRes, performedActiveRes,
        createdHistoryRes, performedHistoryRes,
        activeSwitchRes, historySwitchRes
      ]) => {
        // Merge and deduplicate dares by _id
        const mergeDares = (...lists) => {
          const map = new Map();
          lists.flat().forEach(d => { if (d && d._id) map.set(d._id, d); });
          return Array.from(map.values());
        };
        
        const activeDaresData = [];
        const historyDaresData = [];
        
        // Handle active dares
        if (createdActiveRes.status === 'fulfilled') {
          const responseData = createdActiveRes.value.data;
          const dares = responseData.dares || responseData;
          const createdData = validateApiResponse(dares, API_RESPONSE_TYPES.DARE_ARRAY);
          activeDaresData.push(...createdData);
        }
        
        if (performedActiveRes.status === 'fulfilled') {
          const responseData = performedActiveRes.value.data;
          const dares = responseData.dares || responseData;
          const performedData = validateApiResponse(dares, API_RESPONSE_TYPES.DARE_ARRAY);
          activeDaresData.push(...performedData);
        }
        
        // Handle history dares
        if (createdHistoryRes.status === 'fulfilled') {
          const responseData = createdHistoryRes.value.data;
          const dares = responseData.dares || responseData;
          const createdHistoryData = validateApiResponse(dares, API_RESPONSE_TYPES.DARE_ARRAY);
          historyDaresData.push(...createdHistoryData);
        }
        
        if (performedHistoryRes.status === 'fulfilled') {
          const responseData = performedHistoryRes.value.data;
          const dares = responseData.dares || responseData;
          const performedHistoryData = validateApiResponse(dares, API_RESPONSE_TYPES.DARE_ARRAY);
          historyDaresData.push(...performedHistoryData);
        }
        
        const mergedActiveDares = mergeDares(activeDaresData);
        const mergedHistoryDares = mergeDares(historyDaresData);
        
        setActiveDares(mergedActiveDares);
        setHistoryDares(mergedHistoryDares);
        
        // Handle switch games
        let activeSwitchData = [];
        if (activeSwitchRes.status === 'fulfilled') {
          const responseData = activeSwitchRes.value.data;
          const games = responseData.games || responseData;
          activeSwitchData = validateApiResponse(games, API_RESPONSE_TYPES.SWITCH_GAME_ARRAY);
          setActiveSwitchGames(activeSwitchData);
        } else {
          setActiveSwitchGames([]);
        }
        
        let historySwitchData = [];
        if (historySwitchRes.status === 'fulfilled') {
          const responseData = historySwitchRes.value.data;
          const games = responseData.games || responseData;
          historySwitchData = validateApiResponse(games, API_RESPONSE_TYPES.SWITCH_GAME_ARRAY);
          setHistorySwitchGames(historySwitchData);
        } else {
          setHistorySwitchGames([]);
        }
        
        // Cache the successful data
        setCachedData(cacheKey, {
          activeDares: mergedActiveDares,
          historyDares: mergedHistoryDares,
          activeSwitchGames: activeSwitchData,
          historySwitchGames: historySwitchData
        }, 10 * 60 * 1000); // 10 minutes cache
        
        setDataLoaded(true);
      })
      .catch(err => {
        console.error('Failed to load user activity:', err);
        const errorMessage = handleApiError(err, 'user activity');
        setError(errorMessage);
        showError(errorMessage);
      })
      .finally(() => setLoading(false));
  }, [user, dataLoaded, showError, getCachedData, setCachedData]);

  // Reset dataLoaded when user changes
  useEffect(() => {
    setDataLoaded(false);
  }, [user]);

  // Compute stats from loaded data with memoization
  const stats = useMemo(() => {
    const dareTotal = (Array.isArray(activeDares) ? activeDares.length : 0) + (Array.isArray(historyDares) ? historyDares.length : 0);
    const dareCompleted = Array.isArray(historyDares) ? historyDares.filter(d => d.status === 'completed').length : 0;
    const dareChickenedOut = Array.isArray(historyDares) ? historyDares.filter(d => d.status === 'chickened_out').length : 0;

    const dareAvgGrade = (() => {
      const grades = Array.isArray(historyDares) ? historyDares.flatMap(d => (d.grades || []).map(g => g.grade)).filter(g => typeof g === 'number') : [];
      return grades.length ? (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(2) : 'N/A';
    })();
    const dareCompletionRate = dareTotal ? ((dareCompleted / dareTotal) * 100).toFixed(1) + '%' : 'N/A';

    const switchTotal = (Array.isArray(activeSwitchGames) ? activeSwitchGames.length : 0) + (Array.isArray(historySwitchGames) ? historySwitchGames.length : 0);
    const switchCompleted = Array.isArray(historySwitchGames) ? historySwitchGames.filter(g => g.status === 'completed').length : 0;
    const switchChickenedOut = Array.isArray(historySwitchGames) ? historySwitchGames.filter(g => g.status === 'chickened_out').length : 0;

    const switchWins = Array.isArray(historySwitchGames) ? historySwitchGames.filter(g => g.winner && (g.winner._id === (user?._id || user?.id))).length : 0;
    const switchLosses = Array.isArray(historySwitchGames) ? historySwitchGames.filter(g => g.loser && (g.loser._id === (user?._id || user?.id))).length : 0;
    const switchAvgGrade = (() => {
      const grades = Array.isArray(historySwitchGames) ? historySwitchGames.flatMap(g => (g.grades || []).map(gr => gr.grade)).filter(g => typeof g === 'number') : [];
      return grades.length ? (grades.reduce((a, b) => a + b, 0) / grades.length).toFixed(2) : 'N/A';
    })();
    const switchCompletionRate = switchTotal ? ((switchCompleted / switchTotal) * 100).toFixed(1) + '%' : 'N/A';

    return {
      dareTotal,
      dareCompleted,
      dareChickenedOut,
      dareAvgGrade,
      dareCompletionRate,
      switchTotal,
      switchCompleted,
      switchChickenedOut,
      switchWins,
      switchLosses,
      switchAvgGrade,
      switchCompletionRate
    };
  }, [activeDares, historyDares, activeSwitchGames, historySwitchGames, user]);

  const {
    dareTotal,
    dareCompleted,
    dareChickenedOut,
    dareAvgGrade,
    dareCompletionRate,
    switchTotal,
    switchCompleted,
    switchChickenedOut,
    switchWins,
    switchLosses,
    switchAvgGrade,
    switchCompletionRate
  } = stats;

  const renderDareCard = (dare) => {
    const getDifficultyColor = (difficulty) => {
      const colors = {
        titillating: 'from-pink-400 to-pink-600',
        arousing: 'from-purple-500 to-purple-700',
        explicit: 'from-red-500 to-red-700',
        edgy: 'from-yellow-400 to-yellow-600',
        hardcore: 'from-gray-800 to-black'
      };
      return colors[difficulty] || 'from-neutral-400 to-neutral-600';
    };

    const getDifficultyIcon = (difficulty) => {
      const icons = {
        titillating: HeartIcon,
        arousing: SparklesIcon,
        explicit: FireIcon,
        edgy: ExclamationTriangleIcon,
        hardcore: ShieldCheckIcon
      };
      return icons[difficulty] || StarIcon;
    };

    const DifficultyIcon = getDifficultyIcon(dare.difficulty);
    const difficultyColor = getDifficultyColor(dare.difficulty);

    return (
      <div key={dare._id} className="bg-neutral-700/50 backdrop-blur-sm rounded-xl border border-neutral-600/30 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r ${difficultyColor} text-white text-sm font-semibold`}>
                <DifficultyIcon className="w-4 h-4" />
                {dare.difficulty}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                dare.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                dare.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}>
                {dare.status.replace(/_/g, ' ')}
              </span>
            </div>
            
            <p className="text-neutral-200 mb-3 line-clamp-2">
              {dare.description || 'No description available'}
            </p>
            
            {dare.tags && dare.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {dare.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="bg-neutral-600/50 text-neutral-300 rounded-lg px-2 py-1 text-xs">
                    {tag}
                  </span>
                ))}
                {dare.tags.length > 3 && (
                  <span className="px-2 py-1 bg-neutral-600/50 text-neutral-400 rounded-lg text-xs">
                    +{dare.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
            
            <div className="flex items-center gap-4 text-sm text-neutral-400">
              {dare.creator && (
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span>Creator: {dare.creator?.fullName || dare.creator?.username}</span>
                </div>
              )}
              {dare.performer && (
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span>Performer: {dare.performer?.fullName || dare.performer?.username}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate(`/modern/dares/${dare._id}`)}
              className="px-4 py-2 bg-primary/20 text-primary border border-primary/30 rounded-lg hover:bg-primary/30 transition-all duration-200 text-sm font-medium"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSwitchGameCard = (game) => {
    return (
      <div key={game._id} className="bg-neutral-700/50 backdrop-blur-sm rounded-xl border border-neutral-600/30 p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-semibold">
                <PlayIcon className="w-4 h-4" />
                Switch Game
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                game.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                game.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}>
                {game.status.replace(/_/g, ' ')}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-2">{game.title || 'Untitled Game'}</h3>
            <p className="text-neutral-300 mb-3 line-clamp-2">
              {game.description || 'No description available'}
            </p>
            
            <div className="flex items-center gap-4 text-sm text-neutral-400">
              {game.creator && (
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  <span>Creator: {game.creator?.fullName || game.creator?.username}</span>
                </div>
              )}
              {game.participants && game.participants.length > 0 && (
                <div className="flex items-center gap-2">
                  <UsersIcon className="w-4 h-4" />
                  <span>{game.participants.length} participants</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <button
              onClick={() => navigate(`/modern/switches/${game._id}`)}
              className="px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-all duration-200 text-sm font-medium"
            >
              View Game
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="space-y-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-neutral-700 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map(i => (
                  <div key={i} className="h-32 bg-neutral-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Header */}
      <div className="bg-neutral-800/50 backdrop-blur-sm border-b border-neutral-700/50 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Your Activity</h1>
                <p className="text-neutral-400 text-sm">Track your performance and progress</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium">
                <div className="flex items-center space-x-1">
                  <ChartBarIcon className="w-4 h-4" />
                  <span>Analytics</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-2xl flex items-center justify-center">
              <ChartBarIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white">Your Activity</h2>
              <p className="text-xl sm:text-2xl text-neutral-300 mt-2">
                Track your dares and switch games performance
              </p>
            </div>
          </div>
          <p className="text-neutral-400 text-lg max-w-3xl mx-auto">
            Monitor your progress, completion rates, and performance across all your challenges
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Dares Stats */}
          <div className="bg-gradient-to-r from-purple-600/20 to-purple-700/20 backdrop-blur-sm rounded-2xl border border-purple-600/30 p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-600/20 rounded-xl">
                <FireIcon className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-purple-400">Dares</h3>
                <p className="text-neutral-400 text-sm">Your dare performance</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{dareTotal}</div>
                <div className="text-sm text-neutral-400">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{dareCompleted}</div>
                <div className="text-sm text-neutral-400">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{dareChickenedOut}</div>
                <div className="text-sm text-neutral-400">Chickened Out</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{dareCompletionRate}</div>
                <div className="text-sm text-neutral-400">Completion Rate</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-purple-600/30">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-400">Average Grade:</span>
                <span className="text-purple-400 font-semibold">{dareAvgGrade}</span>
              </div>
            </div>
          </div>

          {/* Switch Games Stats */}
          <div className="bg-gradient-to-r from-green-600/20 to-green-700/20 backdrop-blur-sm rounded-2xl border border-green-600/30 p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-600/20 rounded-xl">
                <PlayIcon className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-400">Switch Games</h3>
                <p className="text-neutral-400 text-sm">Your game performance</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{switchTotal}</div>
                <div className="text-sm text-neutral-400">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{switchCompleted}</div>
                <div className="text-sm text-neutral-400">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{switchChickenedOut}</div>
                <div className="text-sm text-neutral-400">Chickened Out</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{switchCompletionRate}</div>
                <div className="text-sm text-neutral-400">Completion Rate</div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-green-600/30">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{switchWins}</div>
                  <div className="text-neutral-400">Wins</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-400">{switchLosses}</div>
                  <div className="text-neutral-400">Losses</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">{switchAvgGrade}</div>
                  <div className="text-neutral-400">Avg Grade</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl mb-8">
          <div className="flex space-x-1 mb-6">
            {[
              { key: 'active', label: 'Active', icon: PlayIcon, color: 'from-blue-500 to-blue-600' },
              { key: 'history', label: 'History', icon: ClockIcon, color: 'from-purple-500 to-purple-600' }
            ].map(tab => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.key
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                      : 'bg-neutral-700/50 text-neutral-300 hover:bg-neutral-600/50'
                  }`}
                >
                  <TabIcon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          {activeTab === 'active' && (
            <div className="space-y-6">
              {/* Active Dares */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <FireIcon className="w-5 h-5 text-red-400" />
                  Active Dares
                </h3>
                {!Array.isArray(activeDares) || activeDares.length === 0 ? (
                  <div className="bg-neutral-700/50 backdrop-blur-sm rounded-xl border border-neutral-600/30 p-8 text-center">
                    <div className="text-neutral-400 text-lg">No active dares</div>
                    <p className="text-neutral-500 text-sm">Start participating in dares to see them here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activePaginatedItems.map(renderDareCard)}
                  </div>
                )}

                {/* Active Dares Pagination */}
                {activeTotalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={activePage}
                      totalPages={activeTotalPages}
                      onPageChange={setActivePage}
                      totalItems={activeDares?.length || 0}
                    />
                  </div>
                )}
              </div>

              {/* Active Switch Games */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <PlayIcon className="w-5 h-5 text-green-400" />
                  Active Switch Games
                </h3>
                {!Array.isArray(activeSwitchGames) || activeSwitchGames.length === 0 ? (
                  <div className="bg-neutral-700/50 backdrop-blur-sm rounded-xl border border-neutral-600/30 p-8 text-center">
                    <div className="text-neutral-400 text-lg">No active switch games</div>
                    <p className="text-neutral-500 text-sm">Join switch games to see them here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeSwitchGames.map(renderSwitchGameCard)}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-6">
              {/* Dare History */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <TrophyIcon className="w-5 h-5 text-yellow-400" />
                  Dare History
                </h3>
                {!Array.isArray(historyDares) || historyDares.length === 0 ? (
                  <div className="bg-neutral-700/50 backdrop-blur-sm rounded-xl border border-neutral-600/30 p-8 text-center">
                    <div className="text-neutral-400 text-lg">No dare history</div>
                    <p className="text-neutral-500 text-sm">Complete dares to see your history here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {historyPaginatedItems.map(renderDareCard)}
                  </div>
                )}

                {/* History Dares Pagination */}
                {historyTotalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={historyPage}
                      totalPages={historyTotalPages}
                      onPageChange={setHistoryPage}
                      totalItems={historyDares?.length || 0}
                    />
                  </div>
                )}
              </div>

              {/* Switch Game History */}
              <div>
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <StarIcon className="w-5 h-5 text-purple-400" />
                  Switch Game History
                </h3>
                {!Array.isArray(historySwitchGames) || historySwitchGames.length === 0 ? (
                  <div className="bg-neutral-700/50 backdrop-blur-sm rounded-xl border border-neutral-600/30 p-8 text-center">
                    <div className="text-neutral-400 text-lg">No switch game history</div>
                    <p className="text-neutral-500 text-sm">Complete switch games to see your history here</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {historySwitchGames.map(renderSwitchGameCard)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-500/20 backdrop-blur-sm rounded-2xl border border-red-500/30 p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">!</span>
              </div>
              <div>
                <div className="font-bold text-red-300 text-lg mb-1">Error Loading Data</div>
                <div className="text-red-200">{error}</div>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                  aria-label="Retry loading user activity"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernUserActivity; 