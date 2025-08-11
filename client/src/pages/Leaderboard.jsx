import React, { useEffect, useState, Suspense, useCallback, useRef } from 'react';
import api from '../api/axios';
import Avatar from '../components/Avatar';
import Search from '../components/Search';
import { MagnifyingGlassIcon, TrophyIcon, FireIcon, HeartIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { ListSkeleton } from '../components/Skeleton';
import { usePagination, Pagination } from '../utils/pagination.jsx';
import { retryApiCall } from '../utils/retry';
import { MainContent, ContentContainer } from '../components/Layout';
import { ERROR_MESSAGES, API_RESPONSE_TYPES } from '../constants.jsx';
import { validateApiResponse } from '../utils/apiValidation';
import { handleApiError } from '../utils/errorHandler';

const LeaderboardWidget = React.lazy(() => import('../components/LeaderboardWidget'));

const LEADERBOARD_TABS = [
  { key: 'all', label: 'All Users', icon: TrophyIcon },
  { key: 'subs', label: 'Subs Leaderboard', icon: HeartIcon },
  { key: 'doms', label: 'Doms Leaderboard', icon: SparklesIcon },
];

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [hasFetched, setHasFetched] = useState(false); // Add flag to prevent refetching
  const [renderKey, setRenderKey] = useState(0); // Force re-render when data loads
  const { showSuccess, showError } = useToast();
  const { user, loading: authLoading } = useAuth();
  

  
  // Activate pagination for leaderboard
  const {
    currentPage,
    totalPages,
    pageSize,
    setCurrentPage,
    setPageSize,
    paginatedData,
    totalItems,
    setTotalItems
  } = usePagination(1, 20); // 20 items per page

  const fetchLeaderboard = useCallback(async () => {
    // Check if user is authenticated
    if (!user) {
      setError('Please log in to view the leaderboard.');
      setLoading(false);
      return;
    }
    
    // Prevent multiple simultaneous requests
    if (loading) {
      console.log('Already loading, skipping duplicate request');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching leaderboard data...');
      
      // Use retry mechanism for leaderboard fetch with timeout
      const response = await Promise.race([
        retryApiCall(() => api.get('/stats/leaderboard', { timeout: 15000 })),
        new Promise((_, reject) => {
          // Memory-safe timeout for request timeout
          const timeout = setTimeout(() => reject(new Error('Request timeout')), 20000);
          return () => clearTimeout(timeout);
        })
      ]);
      
      console.log('Leaderboard response received:', response);
      
      if (response && response.data) {
        const usersData = validateApiResponse(response, API_RESPONSE_TYPES.USER_ARRAY);
        console.log('Validated leaderboard data:', usersData);
        setUsers(usersData);
        setTotalItems(usersData.length);
        // Force a re-render to ensure the UI updates
        setRenderKey(prev => prev + 1);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      });
      
      let errorMessage = 'Failed to load leaderboard.';
      
      if (error.response?.status === 500) {
        errorMessage = 'Server error occurred while loading leaderboard. Please try again later.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Please log in to view the leaderboard.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied to leaderboard.';
      } else if (error.message === 'Request timeout') {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      const finalErrorMessage = handleApiError(error, 'leaderboard') || errorMessage;
      setError(finalErrorMessage);
      showError(finalErrorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
      // Force a re-render after loading completes
      setTimeout(() => {
        setRenderKey(prev => prev + 1);
      }, 100);
    }
  }, [user, loading]); // Simplified dependencies

  useEffect(() => {
    if (authLoading) return;
    
    if (user && !hasFetched) {
      console.log('User authenticated, fetching leaderboard for the first time...');
      setHasFetched(true);
      // Add a small delay to ensure proper state initialization
      setTimeout(() => {
        fetchLeaderboard();
      }, 100);
    }
  }, [user, authLoading, hasFetched, fetchLeaderboard]);
  
  // Reset fetch flag when user changes
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
        // Filter for submissive users (completed dares as performer)
        return u.daresCompletedAsPerformer > 0;
      case 'doms':
        // Filter for dominant users (created dares)
        return u.daresCreated > 0;
      default:
        return true; // Show all users
    }
  }).sort((a, b) => {
    // Sort by the relevant metric for each tab
    switch (activeTab) {
      case 'subs':
        return b.daresCompletedAsPerformer - a.daresCompletedAsPerformer;
      case 'doms':
        return b.daresCreated - a.daresCreated;
      default:
        return b.daresCount - a.daresCount;
    }
  });

  // Determine if we should show loading
  const shouldShowLoading = loading && users.length === 0;

  // Debug logging for state
  console.log('Leaderboard state:', {
    loading,
    error,
    usersCount: users.length,
    filteredUsersCount: filteredUsers.length,
    activeTab,
    search,
    hasFetched
  });

  // Debug render decision
  console.log('Render decision:', {
    shouldShowLoading,
    hasData: users.length > 0,
    hasError: !!error,
    willShowSkeleton: shouldShowLoading,
    willShowData: !shouldShowLoading && users.length > 0
  });

  // Update total items when filtered users change
  useEffect(() => {
    setTotalItems(filteredUsers.length);
  }, [filteredUsers, setTotalItems]);

  // Apply pagination to filtered users
  const paginatedUsers = paginatedData(filteredUsers);

  const getTabIcon = (tab) => {
    const TabIcon = tab.icon;
    return <TabIcon className="w-5 h-5" />;
  };

  return (
    <div key={`leaderboard-${renderKey}`} className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
      <ContentContainer>
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-primary text-primary-contrast px-4 py-2 rounded z-50">Skip to main content</a>
        
        <MainContent className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-primary to-primary-dark p-3 rounded-2xl shadow-2xl shadow-primary/25">
                <TrophyIcon className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Leaderboards</h1>
            <p className="text-xl sm:text-2xl text-neutral-300">
              Track the top performers in each role
            </p>
            <button 
              onClick={() => {
                console.log('Manual refresh clicked');
                setLoading(true);
                setError('');
                setUsers([]);
                setHasFetched(false); // Reset the flag to allow refetching
                fetchLeaderboard();
              }}
              className="mt-4 px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
            >
              Refresh Data
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap justify-center border-b border-neutral-700 mb-8">
            {LEADERBOARD_TABS.map(tab => (
              <button
                key={tab.key}
                className={`flex items-center gap-3 px-6 py-4 font-semibold transition-all duration-200 border-b-2 ${
                  activeTab === tab.key 
                    ? 'border-primary text-primary bg-primary/10' 
                    : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {getTabIcon(tab)}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
            <Search
              placeholder="Search by username or name..."
              onSearch={setSearch}
              className="w-full"
              aria-label="Search leaderboard"
            />
          </div>

          {/* Leaderboard Content */}
          <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 rounded-2xl p-6 border border-neutral-700/50 shadow-xl">
            {authLoading ? (
              <div className="text-center py-12">
                <div className="text-neutral-400 text-xl mb-4">Loading authentication...</div>
                <p className="text-neutral-500 text-sm">Please wait while we verify your login status.</p>
                <div className="mt-4">
                  <ListSkeleton count={3} />
                </div>
              </div>
            ) : !user ? (
              <div className="text-center py-12">
                <div className="text-neutral-400 text-xl mb-4">Authentication Required</div>
                <p className="text-neutral-500 text-sm">Please log in to view the leaderboard.</p>
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Go to Login
                </button>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-400 text-xl mb-4">Error Loading Leaderboard</div>
                <p className="text-neutral-500 text-sm mb-4">{error}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button 
                    onClick={fetchLeaderboard}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Try Again
                  </button>
                  <button 
                    onClick={() => {
                      console.log('Current error state:', error);
                      console.log('Current users state:', users);
                      console.log('Current loading state:', loading);
                    }}
                    className="px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
                  >
                    Debug Info
                  </button>
                </div>
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 p-3 bg-neutral-800 rounded-lg text-left">
                    <p className="text-xs text-neutral-400 mb-2">Debug Info (Development Only):</p>
                    <pre className="text-xs text-neutral-300 overflow-auto">
                      {JSON.stringify({ error, users: users.length, loading }, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : shouldShowLoading ? (
              <div className="text-center py-12">
                <div className="text-neutral-400 text-xl mb-4">Loading leaderboard...</div>
                <p className="text-neutral-500 text-sm">Please wait while we fetch the latest data.</p>
                <div className="mt-4">
                  <ListSkeleton count={5} />
                </div>
                {/* Debug info for loading state */}
                <div className="mt-4 p-3 bg-red-800 rounded-lg text-left">
                  <p className="text-xs text-white mb-2">DEBUG: Showing Loading State</p>
                  <pre className="text-xs text-white overflow-auto">
                    {JSON.stringify({ 
                      shouldShowLoading, 
                      loading, 
                      usersLength: users.length,
                      hasFetched,
                      error 
                    }, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Debug info for data state */}
                <div className="mb-4 p-3 bg-green-800 rounded-lg text-left">
                  <p className="text-xs text-white mb-2">DEBUG: Showing Data State</p>
                  <pre className="text-xs text-white overflow-auto">
                    {JSON.stringify({ 
                      shouldShowLoading, 
                      loading, 
                      usersLength: users.length,
                      hasFetched,
                      error,
                      filteredUsersLength: filteredUsers.length
                    }, null, 2)}
                  </pre>
                </div>
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/20 rounded-lg">
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
                    <div className="text-neutral-400 text-xl mb-4">No Data Available</div>
                    <p className="text-neutral-500 text-sm">
                      {activeTab === 'subs' ? 'No submissive users found.' :
                       activeTab === 'doms' ? 'No dominant users found.' :
                       'No leaderboard data available.'}
                    </p>
                  </div>
                ) : (
                  <div>
                    {/* Debug display */}
                    <div className="mb-4 p-4 bg-neutral-800 rounded-lg">
                      <h3 className="text-white font-bold mb-2">Debug Info:</h3>
                      <p className="text-neutral-300">Users count: {users.length}</p>
                      <p className="text-neutral-300">Filtered count: {filteredUsers.length}</p>
                      <p className="text-neutral-300">Paginated count: {paginatedUsers.length}</p>
                      <p className="text-neutral-300">Loading: {loading.toString()}</p>
                      <p className="text-neutral-300">Error: {error || 'none'}</p>
                    </div>
                    
                    {/* Simple data display for testing */}
                    <div className="mb-4">
                      <h3 className="text-white font-bold mb-2">Raw Data (First 3 users):</h3>
                      {users.slice(0, 3).map((user, index) => (
                        <div key={index} className="p-2 bg-neutral-700 rounded mb-2">
                          <p className="text-white">Username: {user.user?.username}</p>
                          <p className="text-neutral-300">Dares Created: {user.daresCreated}</p>
                          <p className="text-neutral-300">Dares Completed: {user.daresCompletedAsPerformer}</p>
                        </div>
                      ))}
                    </div>
                    
                    <Suspense fallback={<ListSkeleton count={5} />}>
                      <LeaderboardWidget 
                        leaders={paginatedUsers.map(u => {
                          const mappedUser = {
                            id: u.user?.id,
                            username: u.user?.username,
                            fullName: u.user?.fullName,
                            avatar: u.user?.avatar,
                            daresCount: activeTab === 'subs' ? u.daresCompletedAsPerformer : 
                                        activeTab === 'doms' ? u.daresCreated : 
                                        u.daresCount,
                            role: u.user?.roles?.[0] || 'user'
                          };
                          console.log('Mapped user for LeaderboardWidget:', mappedUser);
                          return mappedUser;
                        })} 
                        loading={loading} 
                        title={activeTab === 'subs' ? 'Subs Leaderboard' : 
                               activeTab === 'doms' ? 'Doms Leaderboard' : 
                               'Overall Leaderboard'}
                      />
                    </Suspense>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stats Summary */}
          {!loading && !error && filteredUsers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-primary/20 to-primary-dark/20 rounded-xl p-6 border border-primary/30 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {filteredUsers.length}
                </div>
                <div className="text-sm text-primary-300">
                  {activeTab === 'subs' ? 'Top Submissives' : 
                   activeTab === 'doms' ? 'Top Dominants' : 
                   'Total Participants'}
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-600/20 to-green-700/20 rounded-xl p-6 border border-green-600/30 text-center">
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
              
              <div className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 rounded-xl p-6 border border-blue-600/30 text-center">
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

          {/* Pagination Controls */}
          {!loading && !error && filteredUsers.length > 0 && totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                totalItems={totalItems}
                className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4"
              />
            </div>
          )}
        </MainContent>
      </ContentContainer>
    </div>
  );
} 