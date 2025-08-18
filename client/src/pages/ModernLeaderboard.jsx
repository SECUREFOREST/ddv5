import React, { useEffect, useState, Suspense, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  TrophyIcon, 
  FireIcon, 
  HeartIcon, 
  SparklesIcon,
  ArrowLeftIcon,
  UserIcon,
  StarIcon,
  BoltIcon,
  ChartBarIcon,
  ArrowTopRightOnSquareIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { retryApiCall } from '../utils/retry';
import { ERROR_MESSAGES, API_RESPONSE_TYPES } from '../constants.jsx';
import { validateApiResponse } from '../utils/apiValidation';
import { handleApiError } from '../utils/errorHandler';
import api from '../api/axios';

const LEADERBOARD_TABS = [
  { key: 'all', label: 'All Users', icon: TrophyIcon, color: 'from-yellow-500 to-yellow-600' },
  { key: 'subs', label: 'Subs Leaderboard', icon: HeartIcon, color: 'from-pink-500 to-pink-600' },
  { key: 'doms', label: 'Doms Leaderboard', icon: SparklesIcon, color: 'from-purple-500 to-purple-600' },
];

const ModernLeaderboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [hasFetched, setHasFetched] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { showSuccess, showError } = useToast();
  const { user, loading: authLoading } = useAuth();

  const fetchLeaderboard = useCallback(async () => {
    if (!user) {
      setError('Please log in to view the leaderboard.');
      setLoading(false);
      return;
    }
    
    if (loading) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await Promise.race([
        retryApiCall(() => api.get('/stats/leaderboard', { timeout: 15000 })),
        new Promise((_, reject) => {
          const timeout = setTimeout(() => reject(new Error('Request timeout')), 20000);
          return () => clearTimeout(timeout);
        })
      ]);
      
      if (response && response.data) {
        const usersData = validateApiResponse(response, API_RESPONSE_TYPES.USER_ARRAY);
        setUsers(usersData);
        setRenderKey(prev => prev + 1);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      const errorMessage = handleApiError(error, 'leaderboard');
      setError(errorMessage);
      showError(errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setRenderKey(prev => prev + 1);
      }, 100);
    }
  }, [user, loading, showError]);

  useEffect(() => {
    if (authLoading) return;
    
    if (user && !hasFetched) {
      setHasFetched(true);
      setTimeout(() => {
        fetchLeaderboard();
      }, 100);
    }
  }, [user, authLoading, hasFetched, fetchLeaderboard]);
  
  useEffect(() => {
    if (user) {
      setHasFetched(false);
    }
  }, [user]);

  // Filter users based on active tab and search
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
                         u.user?.fullName?.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    
    switch (activeTab) {
      case 'subs':
        return u.daresCompletedAsPerformer > 0;
      case 'doms':
        return u.daresCreated > 0;
      default:
        return true;
    }
  }).sort((a, b) => {
    switch (activeTab) {
      case 'subs':
        return b.daresCompletedAsPerformer - a.daresCompletedAsPerformer;
      case 'doms':
        return b.daresCreated - a.daresCreated;
      default:
        return b.daresCount - a.daresCount;
    }
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const shouldShowLoading = loading && users.length === 0;

  const getTabIcon = (tab) => {
    const TabIcon = tab.icon;
    return <TabIcon className="w-5 h-5" />;
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <StarIcon className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <StarIcon className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <StarIcon className="w-6 h-6 text-amber-600" />;
    return <StarIcon className="w-4 h-4 text-neutral-400" />;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600 to-amber-700';
    return 'bg-neutral-700/50';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading authentication...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-white/70 mb-6">Please log in to view the leaderboard.</p>
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div key={`leaderboard-${renderKey}`} className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
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
                <h1 className="text-2xl font-bold text-white">Leaderboards</h1>
                <p className="text-neutral-400 text-sm">Track the top performers in each role</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium">
                <div className="flex items-center space-x-1">
                  <TrophyIcon className="w-4 h-4" />
                  <span>Rankings Mode</span>
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
              <TrophyIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white">Leaderboards</h2>
              <p className="text-xl sm:text-2xl text-neutral-300 mt-2">
                Track the top performers in each role
              </p>
            </div>
          </div>
          <p className="text-neutral-400 text-lg max-w-3xl mx-auto">
            Discover the most active and successful users across different roles and categories
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center mb-8">
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-2">
            {LEADERBOARD_TABS.map(tab => (
              <button
                key={tab.key}
                className={`flex items-center gap-3 px-6 py-3 font-semibold rounded-xl transition-all duration-200 ${
                  activeTab === tab.key 
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg` 
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700/50'
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {getTabIcon(tab)}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Stats Summary */}
        {!loading && !error && filteredUsers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-primary/20 to-primary-dark/20 rounded-2xl p-6 border border-primary/30 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {filteredUsers.length}
              </div>
              <div className="text-sm text-primary-300">
                {activeTab === 'subs' ? 'Top Submissives' : 
                 activeTab === 'doms' ? 'Top Dominants' : 
                 'Total Participants'}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-600/20 to-green-700/20 rounded-2xl p-6 border border-green-600/30 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {filteredUsers.reduce((sum, u) => {
                  const count = activeTab === 'subs' ? u.daresCompletedAsPerformer : 
                               activeTab === 'doms' ? u.daresCreated : 
                               u.daresCount || 0;
                  return sum + count;
                }, 0)}
              </div>
              <div className="text-sm text-green-300">
                {activeTab === 'subs' ? 'Total Dares Completed' : 
                 activeTab === 'doms' ? 'Total Dares Created' : 
                 'Total Dares'}
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 rounded-2xl p-6 border border-blue-600/30 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {filteredUsers[0] ? 
                  (activeTab === 'subs' ? filteredUsers[0].daresCompletedAsPerformer : 
                   activeTab === 'doms' ? filteredUsers[0].daresCreated : 
                   filteredUsers[0].daresCount) || 0 : 0}
              </div>
              <div className="text-sm text-blue-300">Top Score</div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl p-6 border border-neutral-700/50 shadow-xl mb-8">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by username or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
              aria-label="Search leaderboard"
            />
          </div>
        </div>

        {/* Leaderboard Content */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 shadow-xl">
          {error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
              </div>
              <div className="text-red-400 text-xl mb-4">Error Loading Leaderboard</div>
              <p className="text-neutral-500 text-sm mb-6">{error}</p>
              <button 
                onClick={fetchLeaderboard}
                className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Try Again
              </button>
            </div>
          ) : shouldShowLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <div className="text-neutral-400 text-xl mb-4">Loading leaderboard...</div>
              <p className="text-neutral-500 text-sm">Please wait while we fetch the latest data.</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary/20 rounded-xl">
                  <FireIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {activeTab === 'subs' ? 'Subs Leaderboard' : 
                     activeTab === 'doms' ? 'Doms Leaderboard' : 
                     'Top Performers'}
                  </h2>
                  <p className="text-neutral-400">
                    {activeTab === 'subs' ? 'Ranked by completed dares' : 
                     activeTab === 'doms' ? 'Ranked by created dares' : 
                     'Ranked by overall performance'}
                  </p>
                </div>
              </div>
              
              {!loading && filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-neutral-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ChartBarIcon className="w-8 h-8 text-neutral-400" />
                  </div>
                  <div className="text-neutral-400 text-xl mb-4">No Data Available</div>
                  <p className="text-neutral-500 text-sm">
                    {activeTab === 'subs' ? 'No submissive users found.' :
                     activeTab === 'doms' ? 'No dominant users found.' :
                     'No leaderboard data available.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedUsers.map((user, index) => {
                    const rank = startIndex + index + 1;
                    const score = activeTab === 'subs' ? user.daresCompletedAsPerformer : 
                                 activeTab === 'doms' ? user.daresCreated : 
                                 user.daresCount;
                    
                    return (
                      <div
                        key={user.user?.id || index}
                        className={`${getRankColor(rank)} rounded-xl p-4 border border-neutral-600/50 transition-all duration-200 hover:scale-105 hover:shadow-lg`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 flex items-center justify-center">
                                {getRankIcon(rank)}
                              </div>
                              <span className="text-lg font-bold text-white">#{rank}</span>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-neutral-700/50 rounded-full flex items-center justify-center">
                                {user.user?.avatar ? (
                                  <img 
                                    src={user.user.avatar} 
                                    alt={user.user.fullName || user.user.username} 
                                    className="w-12 h-12 rounded-full object-cover"
                                  />
                                ) : (
                                  <UserIcon className="w-6 h-6 text-neutral-400" />
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-white">
                                  {user.user?.fullName || user.user?.username || 'Unknown User'}
                                </div>
                                <div className="text-sm text-neutral-300">
                                  @{user.user?.username || 'unknown'}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-2xl font-bold text-white">{score || 0}</div>
                              <div className="text-sm text-neutral-300">
                                {activeTab === 'subs' ? 'Dares Completed' : 
                                 activeTab === 'doms' ? 'Dares Created' : 
                                 'Total Dares'}
                              </div>
                            </div>
                            
                            <button
                              onClick={() => navigate(`/modern/users/${user.user?.id}`)}
                              className="p-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-neutral-300 hover:text-white rounded-lg transition-colors duration-200"
                              title="View Profile"
                            >
                              <ArrowTopRightOnSquareIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {!loading && !error && filteredUsers.length > 0 && totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                        currentPage === page
                          ? 'bg-primary text-white'
                          : 'bg-neutral-700/50 text-neutral-300 hover:bg-neutral-600/50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Next
                </button>
              </div>
              
              <div className="text-center mt-3 text-sm text-neutral-400">
                Page {currentPage} of {totalPages} • {filteredUsers.length} total users
              </div>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="text-center mt-8">
          <button
            onClick={fetchLeaderboard}
            className="px-8 py-3 bg-neutral-700/50 hover:bg-neutral-600/50 text-neutral-300 hover:text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 mx-auto"
            disabled={loading}
          >
            <BoltIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Leaderboard'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModernLeaderboard; 