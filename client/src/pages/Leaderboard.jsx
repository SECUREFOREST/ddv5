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
import { ERROR_MESSAGES } from '../constants.jsx';

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
  const { showSuccess, showError } = useToast();
  const { user, loading: authLoading } = useAuth();
  const hasFetchedRef = useRef(false);
  

  
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
      return;
    }
    
    // Add a ref to track if we've already fetched data
    if (users.length > 0) {
      return; // Don't refetch if we already have data
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Use retry mechanism for leaderboard fetch with timeout
      const response = await Promise.race([
        retryApiCall(() => api.get('/stats/leaderboard', { timeout: 15000 })),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 20000)
        )
      ]);
      
      if (response && response.data) {
        const usersData = Array.isArray(response.data) ? response.data : [];
        setUsers(usersData);
        setTotalItems(usersData.length);
        showSuccess('Leaderboard loaded successfully!');
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || ERROR_MESSAGES.LEADERBOARD_LOAD_FAILED;
      setError(errorMessage);
      showError(errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [showSuccess, showError, setTotalItems, user, loading, users.length]);

  useEffect(() => {
    if (authLoading) return;
    
    if (user && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchLeaderboard();
    }
  }, [user, authLoading, fetchLeaderboard]);
  
  // Reset fetch flag when user changes
  useEffect(() => {
    hasFetchedRef.current = false;
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

  // Update total items when filtered users change
  React.useEffect(() => {
    setTotalItems(filteredUsers.length);
  }, [filteredUsers, setTotalItems]);

  // Apply pagination to filtered users
  const paginatedUsers = paginatedData(filteredUsers);

  const getTabIcon = (tab) => {
    const TabIcon = tab.icon;
    return <TabIcon className="w-5 h-5" />;
  };

  return (
    <div key="leaderboard" className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800">
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
                <p className="text-neutral-500 text-sm">{error}</p>
                <button 
                  onClick={fetchLeaderboard}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : loading ? (
              <div className="text-center py-12">
                <div className="text-neutral-400 text-xl mb-4">Loading leaderboard...</div>
                <p className="text-neutral-500 text-sm">Please wait while we fetch the latest data.</p>
                <div className="mt-4">
                  <ListSkeleton count={5} />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <FireIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {activeTab === 'subs' ? 'Top Submissives' : 
                       activeTab === 'doms' ? 'Top Dominants' : 
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
                  <Suspense fallback={<ListSkeleton count={5} />}>
                    <LeaderboardWidget 
                      leaders={paginatedUsers.map(u => ({
                        id: u.user?.id,
                        username: u.user?.username,
                        fullName: u.user?.fullName,
                        avatar: u.user?.avatar,
                        daresCount: activeTab === 'subs' ? u.daresCompletedAsPerformer : 
                                    activeTab === 'doms' ? u.daresCreated : 
                                    u.daresCount,
                        role: u.user?.roles?.[0] || 'user'
                      }))} 
                      loading={loading} 
                      title={activeTab === 'subs' ? 'Subs Leaderboard' : 
                             activeTab === 'doms' ? 'Doms Leaderboard' : 
                             'Overall Leaderboard'}
                    />
                  </Suspense>
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