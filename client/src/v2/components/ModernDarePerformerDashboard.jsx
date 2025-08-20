import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { fetchDashboardData, fetchQuickStats, fetchDashboardActivityFeed, likeDare, unlikeDare } from '../../utils/dashboardApi';
import { handleApiError } from '../../utils/errorHandler';
import { useDashboardRealtimeUpdates } from '../../hooks/useRealtimeUpdates';
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
  PuzzlePieceIcon,
  ArrowPathIcon,
  WifiIcon
} from '@heroicons/react/24/solid';
import { DIFFICULTY_OPTIONS, DARE_TYPE_OPTIONS, STATUS_OPTIONS } from '../../constants';
import LoadingSpinner from '../../components/LoadingSpinner';

const ModernDarePerformerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dares, setDares] = useState([]);
  const [switchGames, setSwitchGames] = useState([]);
  const [publicDares, setPublicDares] = useState([]);
  const [publicSwitchGames, setPublicSwitchGames] = useState([]);
  const [summary, setSummary] = useState({
    totalActiveDares: 0,
    totalCompletedDares: 0,
    totalSwitchGames: 0,
    totalPublicDares: 0,
    totalPublicSwitchGames: 0
  });
  const [pagination, setPagination] = useState({
    activeDares: { page: 1, limit: 8, total: 0, pages: 1 },
    completedDares: { page: 1, limit: 8, total: 0, pages: 1 },
    switchGames: { page: 1, limit: 8, total: 0, pages: 1 },
    publicDares: { page: 1, limit: 8, total: 0, pages: 1 },
    publicSwitchGames: { page: 1, limit: 8, total: 0, pages: 1 }
  });

  const [filters, setFilters] = useState({
    search: '',
    difficulties: [],
    types: [],
    status: '',
    publicOnly: false,
    myDares: false,
    mySwitchGames: false
  });

  const [sortBy, setSortBy] = useState('deadline');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentPage, setCurrentPage] = useState(1);

  // Real-time updates
  const { isConnected, refreshDares, refreshSwitchGames, refreshActivities } = useDashboardRealtimeUpdates({
    enableDareUpdates: true,
    enableSwitchGameUpdates: true,
    enableActivityUpdates: true,
    onDareUpdate: (type, data) => {
      if (type === 'refresh') {
        fetchData(currentPage, filters);
      } else {
        // Handle specific update types
        console.log('Dare update:', type, data);
        // Optionally refresh specific data or show notifications
      }
    },
    onSwitchGameUpdate: (type, data) => {
      if (type === 'refresh') {
        fetchData(currentPage, filters);
      } else {
        console.log('Switch game update:', type, data);
      }
    },
    onActivityUpdate: (data) => {
      if (data === 'refresh') {
        fetchActivityFeed();
      } else {
        console.log('Activity update:', data);
      }
    },
    onNotificationUpdate: (data) => {
      console.log('Notification update:', data);
    }
  });

  // Activity feed state
  const [activityFeed, setActivityFeed] = useState([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);

  // Fetch activity feed
  const fetchActivityFeed = useCallback(async () => {
    if (!user?._id) return;

    try {
      setIsLoadingActivity(true);
      const feedData = await fetchDashboardActivityFeed({ limit: 10 });
      setActivityFeed(feedData.activities || []);
    } catch (err) {
      console.error('Failed to fetch activity feed:', err);
    } finally {
      setIsLoadingActivity(false);
    }
  }, [user?._id]);

  // Fetch dashboard data
  const fetchData = useCallback(async (page = 1, customFilters = null) => {
    if (!user?._id) return;

    try {
      setIsLoading(true);
      setError(null);

      const filtersToUse = customFilters || filters;
      
      console.log('Fetching dashboard data with filters:', filtersToUse);
      
      const dashboardData = await fetchDashboardData({
        page,
        limit: 8,
        dareFilters: {
          difficulty: filtersToUse.difficulties.length > 0 ? filtersToUse.difficulties[0] : '',
          status: filtersToUse.status || ''
        },
        switchGameFilters: {
          difficulty: filtersToUse.difficulties.length > 0 ? filtersToUse.difficulties[0] : '',
          status: filtersToUse.status || ''
        },
        publicFilters: {
          difficulty: filtersToUse.difficulties.length > 0 ? filtersToUse.difficulties[0] : '',
          dareType: filtersToUse.types.length > 0 ? filtersToUse.types[0] : ''
        },
        publicSwitchFilters: {
          difficulty: filtersToUse.difficulties.length > 0 ? filtersToUse.difficulties[0] : ''
        }
      });

      console.log('Received dashboard data:', dashboardData);

      // Update state with real data
      setDares([
        ...(dashboardData.data?.activeDares || []),
        ...(dashboardData.data?.completedDares || [])
      ]);
      setSwitchGames(dashboardData.data?.switchGames || []);
      setPublicDares(dashboardData.data?.publicDares || []);
      setPublicSwitchGames(dashboardData.data?.publicSwitchGames || []);
      setSummary(dashboardData.summary || {});
      setPagination(dashboardData.pagination || {});

    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      const errorMessage = handleApiError(err, 'dashboard');
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user?._id, filters, showError]);

  // Initial data fetch
  useEffect(() => {
    if (user?._id) {
      fetchData(1);
      fetchActivityFeed();
    }
  }, [user?._id, fetchData, fetchActivityFeed]);

  // Handle filter changes
  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Apply filters and refetch data
  useEffect(() => {
    if (user?._id) {
      const timeoutId = setTimeout(() => {
        fetchData(1, filters);
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [filters, user?._id, fetchData]);

  // Handle page changes
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    fetchData(newPage, filters);
  }, [fetchData, filters]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      difficulties: [],
      types: [],
      status: '',
      publicOnly: false,
      myDares: false,
      mySwitchGames: false
    });
    setCurrentPage(1);
  }, []);

  // Filter and sort data based on current tab and filters
  const getFilteredData = useCallback(() => {
    let data = [];
    
    try {
      switch (activeTab) {
        case 'dares':
          data = dares || [];
          break;
        case 'switch-games':
          data = switchGames || [];
          break;
        case 'public':
          data = [...(publicDares || []), ...(publicSwitchGames || [])];
          break;
        default:
          data = [...(dares || []), ...(switchGames || [])];
      }

      // Apply search filter
      if (filters.search && data.length > 0) {
        data = data.filter(item => 
          item && (
            (item.title?.toLowerCase().includes(filters.search.toLowerCase())) ||
            (item.description?.toLowerCase().includes(filters.search.toLowerCase())) ||
            (item.creatorDare?.description?.toLowerCase().includes(filters.search.toLowerCase()))
          )
        );
      }

      // Apply difficulty filter
      if (filters.difficulties.length > 0 && data.length > 0) {
        data = data.filter(item => item && filters.difficulties.includes(item.difficulty));
      }

      // Apply type filter (for dares)
      if (filters.types.length > 0 && data.length > 0) {
        data = data.filter(item => 
          item && (item.dareType ? filters.types.includes(item.dareType) : true)
        );
      }

      // Apply status filter
      if (filters.status && data.length > 0) {
        data = data.filter(item => item && item.status === filters.status);
      }

      // Apply public only filter
      if (filters.publicOnly && data.length > 0) {
        data = data.filter(item => item && item.public === true);
      }

      // Apply my dares filter
      if (filters.myDares && data.length > 0) {
        data = data.filter(item => 
          item && (item.creator?._id === user?._id || item.performer?._id === user?._id)
        );
      }

      // Apply my switch games filter
      if (filters.mySwitchGames && data.length > 0) {
        data = data.filter(item => 
          item && (item.creator?._id === user?._id || item.participant?._id === user?._id)
        );
      }

      return data;
    } catch (error) {
      console.error('Error filtering data:', error);
      return [];
    }
  }, [activeTab, dares, switchGames, publicDares, publicSwitchGames, filters, user?._id]);

  // Sort filtered data
  const getSortedData = useCallback(() => {
    const filteredData = getFilteredData();
    
    return [...filteredData].sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          if (a.deadline && b.deadline) {
            return new Date(a.deadline) - new Date(b.deadline);
          }
          return 0;
        case 'newest':
          return new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt);
        case 'oldest':
          return new Date(a.createdAt || a.updatedAt) - new Date(b.createdAt || b.updatedAt);
        case 'difficulty':
          const difficultyOrder = { titillating: 1, arousing: 2, explicit: 3, edgy: 4, hardcore: 5 };
          return (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0);
        case 'progress':
          return (b.progress || 0) - (a.progress || 0);
        default:
          return 0;
      }
    });
  }, [getFilteredData, sortBy]);

  // Handle like/unlike
  const handleLikeToggle = useCallback(async (itemId, itemType) => {
    if (!user?._id) {
      showError('You must be logged in to like items');
      return;
    }

    try {
      let response;
      if (itemType === 'dare') {
        // Check if already liked
        const dare = dares.find(d => d._id === itemId);
        const isCurrentlyLiked = dare?.likes?.includes(user._id);
        
        if (isCurrentlyLiked) {
          response = await unlikeDare(itemId);
        } else {
          response = await likeDare(itemId);
        }

        // Update local state immediately for better UX
        setDares(prev => prev.map(dare => {
          if (dare._id === itemId) {
            return {
              ...dare,
              likes: response.isLiked 
                ? [...(dare.likes || []), user._id]
                : (dare.likes || []).filter(id => id !== user._id)
            };
          }
          return dare;
        }));

        // Also update public dares if this item is there
        setPublicDares(prev => prev.map(dare => {
          if (dare._id === itemId) {
            return {
              ...dare,
              likes: response.isLiked 
                ? [...(dare.likes || []), user._id]
                : (dare.likes || []).filter(id => id !== user._id)
            };
          }
          return dare;
        }));

      } else if (itemType === 'game') {
        // Switch game like functionality can be added later
        showError('Like functionality for switch games coming soon');
        return;
      }

      showSuccess(response.message);
    } catch (err) {
      console.error('Like toggle error:', err);
      const errorMessage = handleApiError(err, 'like');
      showError(errorMessage);
      
      // Revert optimistic update on error
      // This would require more complex state management
    }
  }, [user?._id, dares, showSuccess, showError]);

  // Loading state for like operations
  const [likeLoading, setLikeLoading] = useState(new Set());

  // Enhanced like handler with loading state
  const handleLikeToggleWithLoading = useCallback(async (itemId, itemType) => {
    if (likeLoading.has(itemId)) return;
    
    setLikeLoading(prev => new Set(prev).add(itemId));
    
    try {
      await handleLikeToggle(itemId, itemType);
    } finally {
      setLikeLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  }, [handleLikeToggle, likeLoading]);

  // Safe data access helper
  const getSafeData = useCallback(() => {
    try {
      // Use mock data in test mode
      if (testMode) {
        return [...mockData.dares, ...mockData.switchGames];
      }
      return getSortedData();
    } catch (error) {
      console.error('Error processing data:', error);
      return testMode ? [...mockData.dares, ...mockData.switchGames] : [];
    }
  }, [getSortedData, testMode, mockData]);

  const sortedData = getSafeData();

  // Ensure we always have valid data structures
  const safeSummary = testMode ? {
    totalActiveDares: 1,
    totalCompletedDares: 0,
    totalSwitchGames: 1,
    totalPublicDares: 1,
    totalPublicSwitchGames: 1
  } : (summary || {
    totalActiveDares: 0,
    totalCompletedDares: 0,
    totalSwitchGames: 0,
    totalPublicDares: 0,
    totalPublicSwitchGames: 0
  });

  const safeDares = testMode ? mockData.dares : (dares || []);
  const safeSwitchGames = testMode ? mockData.switchGames : (switchGames || []);
  const safePublicDares = testMode ? mockData.dares.filter(d => d.public) : (publicDares || []);
  const safePublicSwitchGames = testMode ? mockData.switchGames.filter(g => g.public) : (publicSwitchGames || []);

  // Debug logging
  useEffect(() => {
    console.log('Dashboard state:', {
      user: user?._id,
      daresCount: safeDares.length || 0,
      switchGamesCount: safeSwitchGames.length || 0,
      publicDaresCount: safePublicDares.length || 0,
      publicSwitchGamesCount: safePublicSwitchGames.length || 0,
      summary: safeSummary,
      filters,
      activeTab,
      sortedDataCount: sortedData?.length || 0
    });
  }, [user?._id, safeDares, safeSwitchGames, safePublicDares, safePublicSwitchGames, safeSummary, filters, activeTab, sortedData]);

  // Test mode for debugging
  const [testMode, setTestMode] = useState(false);
  
  // Toggle test mode
  const toggleTestMode = useCallback(() => {
    setTestMode(prev => !prev);
    if (!testMode) {
      console.log('Test mode enabled - showing mock data');
    }
  }, [testMode]);

  // Mock data for testing
  const mockData = {
    dares: [
      {
        _id: 'mock-dare-1',
        description: 'This is a test dare for debugging purposes. It should display correctly in the dashboard.',
        difficulty: 'arousing',
        status: 'waiting_for_participant',
        creator: { _id: 'mock-user-1', username: 'TestUser', fullName: 'Test User' },
        performer: null,
        public: true,
        dareType: 'submission',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: []
      },
      {
        _id: 'mock-dare-2',
        description: 'Another test dare to verify the dashboard functionality works correctly.',
        difficulty: 'explicit',
        status: 'in_progress',
        creator: { _id: 'mock-user-2', username: 'TestCreator', fullName: 'Test Creator' },
        performer: { _id: 'mock-user-1', username: 'TestUser', fullName: 'Test User' },
        public: false,
        dareType: 'domination',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        likes: ['mock-user-1']
      }
    ],
    switchGames: [
      {
        _id: 'mock-game-1',
        status: 'waiting_for_participant',
        creator: { _id: 'mock-user-1', username: 'TestUser', fullName: 'Test User' },
        participant: null,
        creatorDare: {
          description: 'Test switch game challenge for debugging',
          difficulty: 'edgy',
          move: 'rock'
        },
        public: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        likes: []
      }
    ]
  };

  // Quick action handlers
  const handleQuickAction = useCallback((action) => {
    switch (action) {
      case 'createDare':
        navigate('/dom-demand/create');
        break;
      case 'performDare':
        navigate('/dare/select');
        break;
      case 'createSwitch':
        navigate('/switches/create');
        break;
      case 'joinGame':
        navigate('/switches');
        break;
      default:
        console.warn('Unknown action:', action);
        break;
    }
  }, [navigate]);

  // Utility functions
  const getDifficultyColor = useCallback((difficulty) => {
    const colors = {
      titillating: 'from-pink-400 to-pink-600',
      arousing: 'from-purple-500 to-purple-700',
      explicit: 'from-red-500 to-red-700',
      edgy: 'from-yellow-400 to-yellow-600',
      hardcore: 'from-gray-800 to-black'
    };
    return colors[difficulty] || 'from-gray-500 to-gray-700';
  }, []);

  const getDifficultyIcon = useCallback((difficulty) => {
    const icons = {
      titillating: <SparklesIcon className="w-5 h-5" />,
      arousing: <FireIcon className="w-5 h-5" />,
      explicit: <EyeDropperIcon className="w-5 h-5" />,
      edgy: <ExclamationTriangleIcon className="w-5 h-5" />,
      hardcore: <RocketLaunchIcon className="w-5 h-5" />
    };
    return icons[difficulty] || <SparklesIcon className="w-5 h-5" />;
  }, []);

  const getStatusColor = useCallback((status) => {
    const colors = {
      waiting_for_participant: 'bg-info/20 text-info',
      in_progress: 'bg-warning/20 text-warning',
      completed: 'bg-success/20 text-success',
      rejected: 'bg-danger/20 text-danger',
      cancelled: 'bg-neutral-600/20 text-neutral-400',
      approved: 'bg-blue-500/20 text-blue-400'
    };
    return colors[status] || 'bg-neutral-600/20 text-neutral-400';
  }, []);

  const getStatusIcon = useCallback((status) => {
    const icons = {
      waiting_for_participant: <EyeIcon className="w-4 h-4" />,
      in_progress: <ClockIcon className="w-4 h-4" />,
      completed: <CheckCircleIcon className="w-4 h-4" />,
      rejected: <XCircleIcon className="w-4 h-4" />,
      cancelled: <XCircleIcon className="w-4 h-4" />,
      approved: <CheckCircleIcon className="w-4 h-4" />
    };
    return icons[status] || <EyeIcon className="w-4 h-4" />;
  }, []);

  // Loading state
  if (isLoading && safeDares.length === 0 && safeSwitchGames.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-8">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center py-16">
            <LoadingSpinner size="lg" />
            <h2 className="text-2xl font-bold text-white mt-4">Loading Dashboard</h2>
            <p className="text-white/70">Please wait while we load your data...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && safeDares.length === 0 && safeSwitchGames.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-8">
        <div className="max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ExclamationTriangleIcon className="w-12 h-12 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Failed to Load Dashboard</h2>
            <p className="text-white/70 mb-6">{error}</p>
            <button
              onClick={() => fetchData(1)}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg px-6 py-3 text-base font-semibold shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <ArrowPathIcon className="w-6 h-6" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-8">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Dare Performer Dashboard</h1>
          <p className="text-neutral-400 text-lg">Manage your dares and switch games, track your performance</p>
          
          {/* Connection Status and Refresh */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              isConnected 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {isConnected ? (
                <>
                  <WifiIcon className="w-4 h-4" />
                  <span>Live Updates</span>
                </>
              ) : (
                <>
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span>Offline</span>
                </>
              )}
            </div>
            
            <button
              onClick={() => {
                fetchData(currentPage, filters);
                fetchActivityFeed();
              }}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-lg text-sm font-medium hover:bg-primary/30 transition-colors disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>

            {/* Test Mode Toggle */}
            <button
              onClick={toggleTestMode}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                testMode 
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' 
                  : 'bg-neutral-500/20 text-neutral-400 border border-neutral-500/30'
              }`}
            >
              <span>{testMode ? 'Test Mode ON' : 'Test Mode'}</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">{safeSummary.totalActiveDares + safeSummary.totalSwitchGames}</div>
                <div className="text-sm text-neutral-400">Active</div>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400">
                <ClockIcon className="w-6 h-6" />
              </div>
            </div>
          </div>
          
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-white mb-1">{safeSummary.totalCompletedDares + safeSummary.totalSwitchGames}</div>
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
                <div className="text-3xl font-bold text-white mb-1">{safeSummary.totalPublicDares + safeSummary.totalPublicSwitchGames}</div>
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
                <div className="text-3xl font-bold text-white mb-1">{safeSummary.totalActiveDares + safeSummary.totalCompletedDares + safeSummary.totalSwitchGames}</div>
                <div className="text-sm text-neutral-400">Total</div>
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
            <button 
              onClick={() => handleQuickAction('createDare')}
              className="h-20 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              <div className="flex flex-col items-center gap-2">
                <PlusIcon className="w-8 h-8" />
                <span className="text-sm">Create Dare</span>
              </div>
            </button>
            
            <button 
              onClick={() => handleQuickAction('performDare')}
              className="h-20 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              <div className="flex flex-col items-center gap-2">
                <PlayIcon className="w-8 h-8" />
                <span className="text-sm">Perform Dare</span>
              </div>
            </button>
            
            <button 
              onClick={() => handleQuickAction('createSwitch')}
              className="h-20 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              <div className="flex flex-col items-center gap-2">
                <PuzzlePieceIcon className="w-8 h-8" />
                <span className="text-sm">Create Switch Game</span>
              </div>
            </button>
            
            <button 
              onClick={() => handleQuickAction('joinGame')}
              className="h-20 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
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
              { key: 'dares', label: 'My Dares', icon: ClockIcon },
              { key: 'switch-games', label: 'Switch Games', icon: FireIcon },
              { key: 'public', label: 'Public', icon: SparklesIcon }
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
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-neutral-700/30 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-3">Dares Summary</h4>
                  <div className="space-y-2 text-sm text-neutral-300">
                    <div>Active: {safeSummary.totalActiveDares}</div>
                    <div>Completed: {safeSummary.totalCompletedDares}</div>
                    <div>Available: {safeSummary.totalPublicDares}</div>
                  </div>
                </div>
                
                <div className="bg-neutral-700/30 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-3">Switch Games Summary</h4>
                  <div className="space-y-2 text-sm text-neutral-300">
                    <div>Active: {safeSummary.totalSwitchGames}</div>
                    <div>Available: {safeSummary.totalPublicSwitchGames}</div>
                  </div>
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="bg-neutral-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-white">Recent Activity</h4>
                  <button
                    onClick={fetchActivityFeed}
                    disabled={isLoadingActivity}
                    className="flex items-center gap-2 px-3 py-1 bg-primary/20 text-primary rounded-lg text-sm hover:bg-primary/30 transition-colors disabled:opacity-50"
                  >
                    <ArrowPathIcon className={`w-4 h-4 ${isLoadingActivity ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
                
                {isLoadingActivity ? (
                  <div className="text-center py-8">
                    <LoadingSpinner size="md" />
                    <p className="text-neutral-400 mt-2">Loading activity...</p>
                  </div>
                ) : activityFeed.length > 0 ? (
                  <div className="space-y-3">
                    {activityFeed.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-neutral-600/20 rounded-lg">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-neutral-400">
                            {activity.user && (
                              <span className="flex items-center gap-1">
                                <UserIcon className="w-3 h-3" />
                                {activity.user.fullName || activity.user.username}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" />
                              {new Date(activity.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-400">
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
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
                      placeholder="Search dares and games..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
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
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleFilterChange('difficulties', [...filters.difficulties, difficulty.value]);
                                } else {
                                  handleFilterChange('difficulties', filters.difficulties.filter(d => d !== difficulty.value));
                                }
                              }}
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
                              onChange={(e) => {
                                if (e.target.checked) {
                                  handleFilterChange('types', [...filters.types, type.value]);
                                } else {
                                  handleFilterChange('types', filters.types.filter(t => t !== type.value));
                                }
                              }}
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
                        onChange={(e) => handleFilterChange('status', e.target.value)}
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
                            onChange={(e) => handleFilterChange('publicOnly', e.target.checked)}
                            className="w-4 h-4 text-primary focus:ring-primary border-neutral-600 bg-neutral-700 rounded"
                          />
                          <span className="text-neutral-300 text-sm">Public Only</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.myDares}
                            onChange={(e) => handleFilterChange('myDares', e.target.checked)}
                            className="w-4 h-4 text-primary focus:ring-primary border-neutral-600 bg-neutral-700 rounded"
                          />
                          <span className="text-neutral-300 text-sm">My Dares Only</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.mySwitchGames}
                            onChange={(e) => handleFilterChange('mySwitchGames', e.target.checked)}
                            className="w-4 h-4 text-primary focus:ring-primary border-neutral-600 bg-neutral-700 rounded"
                          />
                          <span className="text-neutral-300 text-sm">My Games Only</span>
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
                  Showing {sortedData.length} items
                </p>
                {filters.difficulties.length > 0 || filters.types.length > 0 || filters.status || filters.publicOnly || filters.myDares || filters.mySwitchGames ? (
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
                    {filters.mySwitchGames && (
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium">
                        My Games Only
                      </span>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Content Grid/List */}
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedData.map((item) => {
                    if (activeTab === 'dares' || (activeTab === 'public' && item.dareType)) {
                      return <DareCard key={item._id} dare={item} onLikeToggle={handleLikeToggleWithLoading} />;
                    } else {
                      return <SwitchGameCard key={item._id} game={item} onLikeToggle={handleLikeToggleWithLoading} />;
                    }
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedData.map((item) => {
                    if (activeTab === 'dares' || (activeTab === 'public' && item.dareType)) {
                      return <DareListItem key={item._id} dare={item} onLikeToggle={handleLikeToggleWithLoading} />;
                    } else {
                      return <SwitchGameListItem key={item._id} game={item} onLikeToggle={handleLikeToggleWithLoading} />;
                    }
                  })}
                </div>
              )}

              {sortedData.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-neutral-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MagnifyingGlassIcon className="w-12 h-12 text-neutral-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No items found</h3>
                  <p className="text-neutral-400">Try adjusting your filters or search terms</p>
                </div>
              )}

              {/* Pagination */}
              {pagination[activeTab === 'dares' ? 'activeDares' : 
                         activeTab === 'switch-games' ? 'switchGames' : 
                         'publicDares']?.pages > 1 && (
                <div className="mt-6 flex justify-center">
                  <div className="flex gap-2">
                    {Array.from({ length: pagination[activeTab === 'dares' ? 'activeDares' : 
                                                   activeTab === 'switch-games' ? 'switchGames' : 
                                                   'publicDares']?.pages || 1 }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                          currentPage === page
                            ? 'bg-primary text-white'
                            : 'bg-neutral-700/50 text-neutral-300 hover:bg-neutral-600/50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLiking, setIsLiking] = useState(false);
  
  // Safety check
  if (!dare) {
    return (
      <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
        <div className="text-center text-neutral-400">Invalid dare data</div>
      </div>
    );
  }
  
  const handleLikeClick = async () => {
    if (isLiking || !dare._id) return;
    setIsLiking(true);
    try {
      await onLikeToggle(dare._id, 'dare');
    } finally {
      setIsLiking(false);
    }
  };

  // Navigation handlers
  const handleViewDetails = () => {
    navigate(`/dare/${dare._id}`);
  };

  const handleClaimDare = () => {
    navigate(`/dare/claim/${dare._id}`);
  };

  const handleSubmitProof = () => {
    navigate(`/dare/proof/${dare._id}`);
  };

  const handleEditDare = () => {
    navigate(`/dare/edit/${dare._id}`);
  };

  const handleViewCreatorProfile = () => {
    navigate(`/profile/${dare.creator?._id}`);
  };

  const handleViewPerformerProfile = () => {
    navigate(`/profile/${dare.performer?._id}`);
  };

  // Determine user's relationship to the dare
  const isCreator = user?._id === dare.creator?._id;
  const isPerformer = user?._id === dare.performer?._id;
  const canClaim = !isCreator && !isPerformer && dare.status === 'waiting_for_participant';
  const canSubmitProof = isPerformer && dare.status === 'in_progress';
  const canEdit = isCreator && ['waiting_for_participant', 'approved'].includes(dare.status);
  const canViewCreatorProfile = !isCreator && dare.creator?._id;
  const canViewPerformerProfile = !isPerformer && dare.performer?._id;

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
              {dare.description ? dare.description.substring(0, 50) + (dare.description.length > 50 ? '...' : '') : 'Untitled Dare'}
            </h3>
            <p className="text-neutral-400 text-sm line-clamp-2">{dare.description || 'No description available'}</p>
          </div>
          <button
            onClick={handleLikeClick}
            className={`p-2 rounded-lg transition-all duration-200 text-neutral-400 hover:text-neutral-300 ${dare.likes?.includes(user?._id) ? 'text-red-400' : ''} ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLiking}
          >
            <HeartIcon className={`w-5 h-5 ${dare.likes?.includes(user?._id) ? 'fill-red-400' : ''}`} />
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
            <span>{dare.creator?.username || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-2 text-neutral-400">
            <ClockIcon className="w-4 h-4" />
            <span>{dare.updatedAt ? new Date(dare.updatedAt).toLocaleDateString() : 'No date'}</span>
          </div>
          {dare.performer && (
            <div className="flex items-center space-x-2 text-neutral-400">
              <UserIcon className="w-4 h-4" />
              <span>Performer: {dare.performer?.username || 'N/A'}</span>
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
            {dare.public ? 'Public' : 'Private'}
          </span>
          <div className="flex gap-2">
            <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200" onClick={handleViewDetails}>
              View Details
            </button>
            {canClaim && (
              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200" onClick={handleClaimDare}>
                Claim
              </button>
            )}
            {canSubmitProof && (
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200" onClick={handleSubmitProof}>
                Submit Proof
              </button>
            )}
            {canEdit && (
              <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200" onClick={handleEditDare}>
                Edit
              </button>
            )}
            {canViewCreatorProfile && (
              <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200" onClick={handleViewCreatorProfile}>
                View Creator Profile
              </button>
            )}
            {canViewPerformerProfile && (
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200" onClick={handleViewPerformerProfile}>
                View Performer Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SwitchGameCard = ({ game, onLikeToggle }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Safety check
  if (!game) {
    return (
      <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
        <div className="text-center text-neutral-400">Invalid switch game data</div>
      </div>
    );
  }

  // Navigation handlers
  const handleViewDetails = () => {
    navigate(`/switch-game/${game._id}`);
  };

  const handleJoinGame = () => {
    navigate(`/switch-game/join/${game._id}`);
  };

  const handleSubmitProof = () => {
    navigate(`/switch-game/proof/${game._id}`);
  };

  const handleEditGame = () => {
    navigate(`/switch-game/edit/${game._id}`);
  };

  const handleViewCreatorProfile = () => {
    navigate(`/profile/${game.creator?._id}`);
  };

  const handleViewParticipantProfile = () => {
    navigate(`/profile/${game.participant?._id}`);
  };

  // Determine user's relationship to the game
  const isCreator = user?._id === game.creator?._id;
  const isParticipant = user?._id === game.participant?._id;
  const canJoin = !isCreator && !isParticipant && game.status === 'waiting_for_participant';
  const canSubmitProof = (isCreator || isParticipant) && game.status === 'in_progress';
  const canEdit = isCreator && game.status === 'waiting_for_participant';
  const canViewCreatorProfile = !isCreator && game.creator?._id;
  const canViewParticipantProfile = !isParticipant && game.participant?._id;

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
              {game.creatorDare?.description ? game.creatorDare.description.substring(0, 50) + (game.creatorDare.description.length > 50 ? '...' : '') : 'Switch Game'}
            </h3>
            <p className="text-neutral-400 text-sm line-clamp-2">{game.creatorDare?.description || 'No description available'}</p>
          </div>
          <button
            onClick={() => onLikeToggle(game._id, 'game')}
            className={`p-2 rounded-lg transition-all duration-200 text-neutral-400 hover:text-neutral-300 ${game.likes?.includes(user?._id) ? 'text-red-400' : ''}`}
          >
            <HeartIcon className={`w-5 h-5 ${game.likes?.includes(user?._id) ? 'fill-red-400' : ''}`} />
          </button>
        </div>

        {/* Difficulty and Status Badges */}
        <div className="flex items-center space-x-2 mb-4">
          <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getDifficultyColor(game.difficulty)} text-white`}>
            {getDifficultyIcon(game.difficulty)}
            <span className="capitalize">{game.difficulty}</span>
          </span>
          <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(game.status)}`}>
            {getStatusIcon(game.status)}
            <span className="capitalize">{game.status.replace('_', ' ')}</span>
          </span>
        </div>

        {/* Progress Bar for Active Games */}
        {game.status === 'in_progress' && game.progress > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-neutral-400 mb-1">
              <span>Progress</span>
              <span>{game.progress}%</span>
            </div>
            <div className="w-full bg-neutral-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${game.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Game Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-neutral-400">
            <UserIcon className="w-4 h-4" />
            <span>{game.creator?.username || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-2 text-neutral-400">
            <UserGroupIcon className="w-4 h-4" />
            <span>{game.participant ? '2 Players' : '1 Player'}</span>
          </div>
          <div className="flex items-center space-x-2 text-neutral-400">
            <ClockIcon className="w-4 h-4" />
            <span>{game.updatedAt ? new Date(game.updatedAt).toLocaleDateString() : 'No date'}</span>
          </div>
          {game.creatorDare?.difficulty && (
            <div className="flex items-center space-x-2 text-neutral-400">
              <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getDifficultyColor(game.creatorDare.difficulty)} text-white`}>
                {getDifficultyIcon(game.creatorDare.difficulty)}
                <span className="capitalize">{game.creatorDare.difficulty}</span>
              </span>
            </div>
          )}
        </div>

        {/* Winner for Completed Games */}
        {game.status === 'completed' && game.winner && (
          <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center justify-center space-x-2">
              <TrophyIcon className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-semibold">Winner: {game.winner?.username || 'N/A'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-neutral-700/30 border-t border-neutral-700/50">
        <div className="flex items-center justify-between">
          <span className="text-xs text-neutral-500">
            {game.public ? 'Public' : 'Private'}
          </span>
          <div className="flex gap-2">
            <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200" onClick={handleViewDetails}>
              View Details
            </button>
            {canJoin && (
              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200" onClick={handleJoinGame}>
                Join Game
              </button>
            )}
            {canSubmitProof && (
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200" onClick={handleSubmitProof}>
                Submit Proof
              </button>
            )}
            {canEdit && (
              <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200" onClick={handleEditGame}>
                Edit
              </button>
            )}
            {canViewCreatorProfile && (
              <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200" onClick={handleViewCreatorProfile}>
                View Creator Profile
              </button>
            )}
            {canViewParticipantProfile && (
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200" onClick={handleViewParticipantProfile}>
                View Participant Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DareListItem = ({ dare, onLikeToggle }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Safety check
  if (!dare) {
    return (
      <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
        <div className="text-center text-neutral-400">Invalid dare data</div>
      </div>
    );
  }

  // Navigation handlers
  const handleViewDetails = () => {
    navigate(`/dare/${dare._id}`);
  };

  const handleClaimDare = () => {
    navigate(`/dare/claim/${dare._id}`);
  };

  const handleSubmitProof = () => {
    navigate(`/dare/proof/${dare._id}`);
  };

  const handleEditDare = () => {
    navigate(`/dare/edit/${dare._id}`);
  };

  const handleViewCreatorProfile = () => {
    navigate(`/profile/${dare.creator?._id}`);
  };

  const handleViewPerformerProfile = () => {
    navigate(`/profile/${dare.performer?._id}`);
  };

  // Determine user's relationship to the dare
  const isCreator = user?._id === dare.creator?._id;
  const isPerformer = user?._id === dare.performer?._id;
  const canClaim = !isCreator && !isPerformer && dare.status === 'waiting_for_participant';
  const canSubmitProof = isPerformer && dare.status === 'in_progress';
  const canEdit = isCreator && ['waiting_for_participant', 'approved'].includes(dare.status);
  const canViewCreatorProfile = !isCreator && dare.creator?._id;
  const canViewPerformerProfile = !isPerformer && dare.performer?._id;

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
            <h3 className="text-lg font-semibold text-white truncate">
              {dare.description ? dare.description.substring(0, 50) + (dare.description.length > 50 ? '...' : '') : 'Untitled Dare'}
            </h3>
            <button
              onClick={() => onLikeToggle(dare._id, 'dare')}
              className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 text-neutral-400 hover:text-neutral-300 ${dare.likes?.includes(user?._id) ? 'text-red-400' : ''}`}
            >
              <HeartIcon className={`w-5 h-5 ${dare.likes?.includes(user?._id) ? 'fill-red-400' : ''}`} />
            </button>
          </div>
          <p className="text-neutral-400 text-sm mb-3">{dare.description}</p>
          
          <div className="flex items-center space-x-6 text-sm text-neutral-400">
            <span className="flex items-center space-x-1">
              <UserIcon className="w-4 h-4" />
              <span>{dare.creator?.username || 'N/A'}</span>
            </span>
            <span className="flex items-center space-x-1">
              <ClockIcon className="w-4 h-4" />
              <span>{dare.updatedAt ? new Date(dare.updatedAt).toLocaleDateString() : 'No date'}</span>
            </span>
            {dare.performer && (
              <span className="flex items-center space-x-1">
                <UserIcon className="w-4 h-4" />
                <span>Performer: {dare.performer?.username || 'N/A'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 flex gap-2">
          <button 
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            onClick={handleViewDetails}
          >
            View Details
          </button>
          {canClaim && (
            <button 
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              onClick={handleClaimDare}
            >
              Claim
            </button>
          )}
          {canSubmitProof && (
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              onClick={handleSubmitProof}
            >
              Submit Proof
            </button>
          )}
          {canEdit && (
            <button 
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              onClick={handleEditDare}
            >
              Edit
            </button>
          )}
          {canViewCreatorProfile && (
            <button 
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              onClick={handleViewCreatorProfile}
            >
              View Creator Profile
            </button>
          )}
          {canViewPerformerProfile && (
            <button 
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              onClick={handleViewPerformerProfile}
            >
              View Performer Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const SwitchGameListItem = ({ game, onLikeToggle }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Safety check
  if (!game) {
    return (
      <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
        <div className="text-center text-neutral-400">Invalid switch game data</div>
      </div>
    );
  }

  // Navigation handlers
  const handleViewDetails = () => {
    navigate(`/switch-game/${game._id}`);
  };

  const handleJoinGame = () => {
    navigate(`/switch-game/join/${game._id}`);
  };

  const handleSubmitProof = () => {
    navigate(`/switch-game/proof/${game._id}`);
  };

  const handleEditGame = () => {
    navigate(`/switch-game/edit/${game._id}`);
  };

  const handleViewCreatorProfile = () => {
    navigate(`/profile/${game.creator?._id}`);
  };

  const handleViewParticipantProfile = () => {
    navigate(`/profile/${game.participant?._id}`);
  };

  // Determine user's relationship to the game
  const isCreator = user?._id === game.creator?._id;
  const isParticipant = user?._id === game.participant?._id;
  const canJoin = !isCreator && !isParticipant && game.status === 'waiting_for_participant';
  const canSubmitProof = (isCreator || isParticipant) && game.status === 'in_progress';
  const canEdit = isCreator && game.status === 'waiting_for_participant';
  const canViewCreatorProfile = !isCreator && game.creator?._id;
  const canViewParticipantProfile = !isParticipant && game.participant?._id;

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
          <span className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r ${getDifficultyColor(game.difficulty)} text-white`}>
            {getDifficultyIcon(game.difficulty)}
            <span className="capitalize">{game.difficulty}</span>
          </span>
        </div>

        {/* Game Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-white truncate">
              {game.creatorDare?.description ? game.creatorDare.description.substring(0, 50) + (game.creatorDare.description.length > 50 ? '...' : '') : 'Switch Game'}
            </h3>
            <button
              onClick={() => onLikeToggle(game._id, 'game')}
              className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 text-neutral-400 hover:text-neutral-300 ${game.likes?.includes(user?._id) ? 'text-red-400' : ''}`}
            >
              <HeartIcon className={`w-5 h-5 ${game.likes?.includes(user?._id) ? 'fill-red-400' : ''}`} />
            </button>
          </div>
          <p className="text-neutral-400 text-sm mb-3">{game.creatorDare?.description || 'No description available'}</p>
          
          <div className="flex items-center space-x-6 text-sm text-neutral-400">
            <span className="flex items-center space-x-1">
              <UserIcon className="w-4 h-4" />
              <span>{game.creator?.username || 'N/A'}</span>
            </span>
            <span className="flex items-center space-x-1">
              <UserGroupIcon className="w-4 h-4" />
              <span>{game.participant ? '2 Players' : '1 Player'}</span>
            </span>
            <span className="flex items-center space-x-1">
              <ClockIcon className="w-4 h-4" />
              <span>{game.updatedAt ? new Date(game.updatedAt).toLocaleDateString() : 'No date'}</span>
            </span>
            {game.creatorDare?.difficulty && (
              <div className="flex-shrink-0">
                <span className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r ${getDifficultyColor(game.creatorDare.difficulty)} text-white`}>
                  {getDifficultyIcon(game.creatorDare.difficulty)}
                  <span className="capitalize">{game.creatorDare.difficulty}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 flex gap-2">
          <button 
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            onClick={handleViewDetails}
          >
            View Details
          </button>
          {canJoin && (
            <button 
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              onClick={handleJoinGame}
            >
              Join Game
            </button>
          )}
          {canSubmitProof && (
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              onClick={handleSubmitProof}
            >
              Submit Proof
            </button>
          )}
          {canEdit && (
            <button 
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              onClick={handleEditGame}
            >
              Edit
            </button>
          )}
          {canViewCreatorProfile && (
            <button 
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              onClick={handleViewCreatorProfile}
            >
              View Creator Profile
            </button>
          )}
          {canViewParticipantProfile && (
            <button 
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              onClick={handleViewParticipantProfile}
            >
              View Participant Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernDarePerformerDashboard;
