import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import { useToast } from '../context/ToastContext';
import { ListSkeleton } from '../components/Skeleton';
import { MainContent, ContentContainer } from '../components/Layout';
import { ClockIcon, GlobeAltIcon } from '@heroicons/react/24/solid';
import { usePagination, Pagination } from '../utils/pagination.jsx';
import { retryApiCall } from '../utils/retry';
import Search from '../components/Search';
import { DifficultyBadge } from '../components/Badge';
import { ERROR_MESSAGES } from '../constants.jsx';



function Tag({ tag }) {
  return (
    <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-semibold mr-2">{tag}</span>
  );
}

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'dares', label: 'Dares' },
  { key: 'switches', label: 'Switch Games' },
];

export default function PublicDares() {
  const [dares, setDares] = useState([]);
  const [switchGames, setSwitchGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [daresLoading, setDaresLoading] = useState(false);
  const [switchesLoading, setSwitchesLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const { showSuccess, showError } = useToast();
  
  // Activate pagination for public dares
  const {
    currentPage,
    totalPages,
    pageSize,
    setCurrentPage,
    setPageSize,
    paginatedData,
    totalItems,
    setTotalItems
  } = usePagination(1, 15); // 15 items per page

  useEffect(() => {
    setLoading(true);
    setDaresLoading(true);
    setSwitchesLoading(true);
    setError('');
    
    Promise.allSettled([
      retryApiCall(() => api.get('/dares', { params: { public: true, status: 'waiting_for_participant' } })),
      retryApiCall(() => api.get('/switches', { params: { public: true, status: 'waiting_for_participant' } }))
    ])
      .then(([daresRes, switchesRes]) => {
        // Handle dares response
        if (daresRes.status === 'fulfilled') {
          const daresData = daresRes.value.data?.dares || [];
          setDares(daresData);

        } else {
          console.error('Failed to load public dares:', daresRes.reason);
          setDares([]);
        }
        
        // Handle switches response
        if (switchesRes.status === 'fulfilled') {
          const switchesData = switchesRes.value.data?.switches || [];
          setSwitchGames(switchesData);

        } else {
          console.error('Failed to load public switches:', switchesRes.reason);
          setSwitchGames([]);
        }
        
        // Update total items for pagination
        const allItems = [...(daresRes.status === 'fulfilled' ? (daresRes.value.data?.dares || []) : []), 
                          ...(switchesRes.status === 'fulfilled' ? (switchesRes.value.data?.switches || []) : [])];
        setTotalItems(allItems.length);
      })
      .catch((err) => {
        const errorMessage = ERROR_MESSAGES.PUBLIC_CONTENT_LOAD_FAILED;
        setError(errorMessage);
        showError(errorMessage);
        console.error('Public dares loading error:', err);
      })
      .finally(() => {
        setLoading(false);
        setDaresLoading(false);
        setSwitchesLoading(false);
      });
  }, [showError]);

  // Filter and search logic
  const filterAndSearch = (items, type) => {
    return items.filter(item => {
      if (search) {
        const creatorName = item.creator?.fullName || item.creator?.username || '';
        const tags = item.tags?.join(' ') || '';
        if (!creatorName.toLowerCase().includes(search.toLowerCase()) && !tags.toLowerCase().includes(search.toLowerCase())) {
          return false;
        }
      }
      if (filter === 'all') return true;
      if (filter === 'dares') return type === 'dare';
      if (filter === 'switches') return type === 'switch';
      return true;
    });
  };

  const filteredDares = filterAndSearch(dares, 'dare');
  const filteredSwitchGames = filterAndSearch(switchGames, 'switch');
  
  // Update total items when filtered data changes
  useEffect(() => {
    const allItems = [...filteredDares, ...filteredSwitchGames];
    setTotalItems(allItems.length);
  }, [filteredDares, filteredSwitchGames, setTotalItems]);

  // Apply pagination to filtered items
  const allItems = [...filteredDares, ...filteredSwitchGames];
  const paginatedItems = paginatedData(allItems);
  
  const showDares = filter === 'all' || filter === 'dares';
  const showSwitches = filter === 'all' || filter === 'switches';
  
  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search, setCurrentPage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <ContentContainer>
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-purple-600 text-white px-4 py-2 rounded z-50">Skip to main content</a>
        <MainContent className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <GlobeAltIcon className="w-12 h-12 text-white mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">Public Dares & Switch Games</h1>
            </div>
            <p className="text-xl text-white/80">Join fun challenges created by the community!</p>
          </div>

          {/* Onboarding/Intro Banner */}
          <div className="mb-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
            <div className="flex items-center gap-4">
              <span className="text-3xl">🌎</span>
              <div>
                <div className="font-bold text-xl text-white mb-2">Participate in Public Dares & Switch Games</div>
                <div className="text-white/70">Use the filters or search to find something that excites you. Click <b>Participate</b> to get started.</div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="mb-8 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {FILTERS.map(f => (
                  <button
                    key={f.key}
                    className={`px-6 py-3 rounded-xl font-semibold text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 min-h-[44px] ${
                      filter === f.key 
                        ? 'bg-purple-600 text-white border-purple-500 shadow-lg' 
                        : 'bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/30'
                    }`}
                    onClick={() => setFilter(f.key)}
                    aria-pressed={filter === f.key}
                    aria-label={`Filter by ${f.label.toLowerCase()}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <Search
                placeholder="Search by creator or tag..."
                onSearch={setSearch}
                className="w-full lg:w-80"
              />
            </div>
          </div>

          {error && (
            <div className="mb-8 bg-red-500/10 backdrop-blur-lg rounded-2xl border border-red-500/20 p-6 shadow-2xl">
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
                    aria-label="Retry loading public dares"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <ListSkeleton />
          ) : (
            <>
              {showDares && (
                <section className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-6">Public Dares</h2>
                  {daresLoading ? (
                    <div className="grid gap-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 animate-pulse">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-20 h-6 bg-white/20 rounded-full"></div>
                              <div className="flex items-center gap-3">
                                <div className="w-16 h-4 bg-white/20 rounded"></div>
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-10 bg-white/20 rounded-full"></div>
                                  <div className="w-24 h-4 bg-white/20 rounded"></div>
                                </div>
                              </div>
                            </div>
                            <div className="w-24 h-10 bg-white/20 rounded-xl"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredDares.length === 0 ? (
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 text-center" role="status" aria-live="polite">
                      <div className="text-white/60 text-lg">
                        {search ? 'No public dares match your search.' : 'No public dares available.'}
                      </div>
                      {search && (
                        <button 
                          onClick={() => setSearch('')}
                          className="mt-3 text-purple-300 hover:text-purple-200 underline"
                          aria-label="Clear search and show all dares"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {paginatedItems.filter(item => item.type === 'dare').map(dare => (
                        <div key={dare._id} className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02] group" role="article" aria-labelledby={`dare-title-${dare._id}`}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                              <DifficultyBadge level={dare.difficulty} />
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                <span className="text-white/60 text-sm">Created by</span>
                                <Link to={`/profile/${dare.creator?._id || dare.creator?.id}`} className="flex items-center gap-2 group-hover:underline" aria-label={`View profile of ${dare.creator?.fullName || 'User'}`}>
                                  <Avatar user={dare.creator} size={40} />
                                  <span className="font-bold text-white">{dare.creator?.fullName || 'User'}</span>
                                </Link>
                              </div>
                            </div>
                            <Link to={`/dare/consent/${dare._id}`}>
                              <button 
                                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-6 py-3 font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:from-purple-700 hover:to-pink-700" 
                                aria-label={`Participate in dare by ${dare.creator?.fullName || 'User'}`}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    window.location.href = `/dare/consent/${dare._id}`;
                                  }
                                }}
                              >
                                Participate
                              </button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {showSwitches && (
                <section>
                  <h2 className="text-2xl font-bold text-white mb-6">Public Switch Games</h2>
                  {switchesLoading ? (
                    <div className="grid gap-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 animate-pulse">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-20 h-6 bg-white/20 rounded-full"></div>
                              <div className="flex items-center gap-3">
                                <div className="w-16 h-4 bg-white/20 rounded"></div>
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-10 bg-white/20 rounded-full"></div>
                                  <div className="w-24 h-4 bg-white/20 rounded"></div>
                                </div>
                              </div>
                            </div>
                            <div className="w-24 h-10 bg-white/20 rounded-xl"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredSwitchGames.length === 0 ? (
                    <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 text-center" role="status" aria-live="polite">
                      <div className="text-white/60 text-lg">
                        {search ? 'No public switch games match your search.' : 'No public switch games available.'}
                      </div>
                      {search && (
                        <button 
                          onClick={() => setSearch('')}
                          className="mt-3 text-purple-300 hover:text-purple-200 underline"
                          aria-label="Clear search and show all switch games"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {paginatedItems.filter(item => item.type === 'switch').map(game => (
                        <div key={game._id} className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02] group" role="article" aria-labelledby={`switch-title-${game._id}`}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                              <DifficultyBadge level={game.creatorDare?.difficulty} />
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                <span className="text-white/60 text-sm">Created by</span>
                                <Link to={`/profile/${game.creator?._id || game.creator?.id}`} className="flex items-center gap-2 group-hover:underline" aria-label={`View profile of ${game.creator?.fullName || 'User'}`}>
                                  <Avatar user={game.creator} size={40} />
                                  <span className="font-bold text-white">{game.creator?.fullName || 'User'}</span>
                                </Link>
                              </div>
                            </div>
                            <Link to={`/switches/consent/${game._id}`}>
                              <button 
                                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-6 py-3 font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:from-purple-700 hover:to-pink-700" 
                                aria-label={`Participate in switch game by ${game.creator?.fullName || 'User'}`}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    window.location.href = `/switches/consent/${game._id}`;
                                  }
                                }}
                              >
                                Participate
                              </button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Pagination Controls */}
              {!loading && allItems.length > 0 && totalPages > 1 && (
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

              {/* Empty state if both are empty after filtering */}
              {filteredDares.length === 0 && filteredSwitchGames.length === 0 && !loading && (
                <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 text-center" role="status" aria-live="polite">
                  <div className="text-white/60 text-lg mb-2">No public dares or switch games match your search or filters.</div>
                  <div className="text-white/40 text-sm mb-4">Try adjusting your search or check back later!</div>
                  <button 
                    onClick={() => {
                      setSearch('');
                      setFilter('all');
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                    aria-label="Reset all filters and search"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </>
          )}
        </MainContent>
      </ContentContainer>
    </div>
  );
} 