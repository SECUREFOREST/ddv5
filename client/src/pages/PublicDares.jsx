import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import { useToast } from '../components/Toast';
import { ListSkeleton } from '../components/Skeleton';
import { ClockIcon, GlobeAltIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';

// Difficulty badge (reuse from DareCard)
function DifficultyBadge({ level }) {
  let badgeClass = 'bg-neutral-600/20 border border-neutral-500/50 text-neutral-300';
  let label = '';
  switch (level) {
    case 'titillating':
      badgeClass = 'bg-pink-600/20 border border-pink-500/50 text-pink-300';
      label = 'Titillating';
      break;
    case 'arousing':
      badgeClass = 'bg-purple-600/20 border border-purple-500/50 text-purple-300';
      label = 'Arousing';
      break;
    case 'explicit':
      badgeClass = 'bg-red-600/20 border border-red-500/50 text-red-300';
      label = 'Explicit';
      break;
    case 'edgy':
      badgeClass = 'bg-yellow-600/20 border border-yellow-500/50 text-yellow-300';
      label = 'Edgy';
      break;
    case 'hardcore':
      badgeClass = 'bg-black/20 border border-white/50 text-white';
      label = 'Hardcore';
      break;
    default:
      label = level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Unknown';
  }
  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badgeClass}`}>{label}</span>
  );
}

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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    setLoading(true);
    setDaresLoading(true);
    setSwitchesLoading(true);
    setError('');
    
    Promise.allSettled([
      api.get('/dares', { params: { public: true, status: 'waiting_for_participant' } }),
      api.get('/switches', { params: { public: true, status: 'waiting_for_participant' } })
    ])
      .then(([daresRes, switchesRes]) => {
        // Handle dares response
        if (daresRes.status === 'fulfilled') {
          const daresData = Array.isArray(daresRes.value.data) ? daresRes.value.data : [];
          setDares(daresData);
          console.log('Public dares loaded:', daresData.length);
        } else {
          console.error('Failed to load public dares:', daresRes.reason);
          setDares([]);
        }
        
        // Handle switches response
        if (switchesRes.status === 'fulfilled') {
          const switchesData = Array.isArray(switchesRes.value.data) ? switchesRes.value.data : [];
          setSwitchGames(switchesData);
          console.log('Public switches loaded:', switchesData.length);
        } else {
          console.error('Failed to load public switches:', switchesRes.reason);
          setSwitchGames([]);
        }
      })
      .catch((err) => {
        const errorMessage = 'Failed to load public dares or switch games.';
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

  // Pagination logic
  const ITEMS_PER_PAGE = 10;
  const paginateItems = (items) => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return items.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const filteredDares = filterAndSearch(dares, 'dare');
  const filteredSwitchGames = filterAndSearch(switchGames, 'switch');
  const paginatedDares = paginateItems(filteredDares);
  const paginatedSwitchGames = paginateItems(filteredSwitchGames);
  const showDares = filter === 'all' || filter === 'dares';
  const showSwitches = filter === 'all' || filter === 'switches';
  
  // Reset page when filter or search changes
  useEffect(() => {
    setPage(1);
  }, [filter, search]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-purple-600 text-white px-4 py-2 rounded z-50">Skip to main content</a>
      <main id="main-content" tabIndex="-1" role="main">
        <div className="max-w-6xl mx-auto px-4 py-8">
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
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="text"
                  className="w-full lg:w-80 rounded-xl border border-white/20 px-4 py-3 pl-10 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 placeholder-white/50"
                  placeholder="Search by creator or tag..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  aria-label="Search public dares and switch games"
                  aria-describedby="search-description"
                />
                <div id="search-description" className="sr-only">Search through available public dares and switch games by creator name or tags</div>
              </div>
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
                      {paginatedDares.map(dare => (
                        <div key={dare._id} className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02] group" role="article" aria-labelledby={`dare-title-${dare._id}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <DifficultyBadge level={dare.difficulty} />
                              <div className="flex items-center gap-3">
                                <span className="text-white/60 text-sm">Created by</span>
                                <Link to={`/profile/${dare.creator?._id || dare.creator?.id}`} className="flex items-center gap-2 group-hover:underline" aria-label={`View profile of ${dare.creator?.fullName || 'User'}`}>
                                  <Avatar user={dare.creator} size={40} />
                                  <span className="font-bold text-white">{dare.creator?.fullName || 'User'}</span>
                                </Link>
                              </div>
                            </div>
                            <Link to={`/dare/consent/${dare._id}`}>
                              <button 
                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-6 py-3 font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:from-purple-700 hover:to-pink-700" 
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
                      {paginatedSwitchGames.map(game => (
                        <div key={game._id} className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02] group" role="article" aria-labelledby={`switch-title-${game._id}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <DifficultyBadge level={game.creatorDare?.difficulty} />
                              <div className="flex items-center gap-3">
                                <span className="text-white/60 text-sm">Created by</span>
                                <Link to={`/profile/${game.creator?._id || game.creator?.id}`} className="flex items-center gap-2 group-hover:underline" aria-label={`View profile of ${game.creator?.fullName || 'User'}`}>
                                  <Avatar user={game.creator} size={40} />
                                  <span className="font-bold text-white">{game.creator?.fullName || 'User'}</span>
                                </Link>
                              </div>
                            </div>
                            <Link to={`/switches/consent/${game._id}`}>
                              <button 
                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-6 py-3 font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:from-purple-700 hover:to-pink-700" 
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
              {(filteredDares.length > ITEMS_PER_PAGE || filteredSwitchGames.length > ITEMS_PER_PAGE) && (
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors duration-200"
                      aria-label="Previous page"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-white">
                      Page {page} of {Math.ceil(Math.max(filteredDares.length, filteredSwitchGames.length) / ITEMS_PER_PAGE)}
                    </span>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page >= Math.ceil(Math.max(filteredDares.length, filteredSwitchGames.length) / ITEMS_PER_PAGE)}
                      className="px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors duration-200"
                      aria-label="Next page"
                    >
                      Next
                    </button>
                  </div>
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
        </div>
      </main>
    </div>
  );
} 