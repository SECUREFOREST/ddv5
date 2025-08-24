import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
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
  TagIcon
} from '@heroicons/react/24/outline';
import { useToast } from '../../context/ToastContext';
import { ListSkeleton } from '../../components/Skeleton';
import { usePagination, Pagination } from '../../utils/pagination.jsx';
import { retryApiCall } from '../../utils/retry';
import { ERROR_MESSAGES, API_RESPONSE_TYPES } from '../../constants.jsx';
import { validateApiResponse } from '../../utils/apiValidation';
import { handleApiError } from '../../utils/errorHandler';
import api from '../../api/axios';

const FILTERS = [
  { key: 'all', label: 'All', icon: GlobeAltIcon, color: 'from-blue-500 to-blue-600' },
  { key: 'dares', label: 'Dares', icon: FireIcon, color: 'from-red-500 to-red-600' },
  { key: 'switches', label: 'Switch Games', icon: PlayIcon, color: 'from-green-500 to-green-600' },
];

const DIFFICULTY_COLORS = {
  titillating: 'from-pink-400 to-pink-600',
  arousing: 'from-purple-500 to-purple-700',
  explicit: 'from-red-500 to-red-700',
  edgy: 'from-yellow-400 to-yellow-600',
  hardcore: 'from-gray-800 to-black'
};

const DIFFICULTY_ICONS = {
  titillating: HeartIcon,
  arousing: SparklesIcon,
  explicit: FireIcon,
  edgy: ExclamationTriangleIcon,
  hardcore: ShieldCheckIcon
};

const ModernPublicDares = () => {
  const navigate = useNavigate();
  const [dares, setDares] = useState([]);
  const [switchGames, setSwitchGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [daresLoading, setDaresLoading] = useState(false);
  const [switchesLoading, setSwitchesLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');
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
  } = usePagination(1, 20); // 20 items per page

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
          const responseData = daresRes.value.data;
          const dares = responseData.dares || responseData;
          const daresData = validateApiResponse(dares, API_RESPONSE_TYPES.DARE_ARRAY);
          setDares(daresData);
        } else {
          console.error('Failed to load public dares:', daresRes.reason);
          setDares([]);
        }
        
        // Handle switches response
        if (switchesRes.status === 'fulfilled') {
          const responseData = switchesRes.value.data;
          const games = responseData.games || responseData;
          const switchesData = validateApiResponse(games, API_RESPONSE_TYPES.SWITCH_GAME_ARRAY);
          setSwitchGames(switchesData);
        } else {
          console.error('Failed to load public switches:', switchesRes.reason);
          setSwitchGames([]);
        }
        
        // Update total items for pagination
        const allItems = [...(daresRes.status === 'fulfilled' ? (() => {
          const responseData = daresRes.value.data;
          const dares = responseData.dares || responseData;
          return validateApiResponse(dares, API_RESPONSE_TYPES.DARE_ARRAY);
        })() : []), 
                          ...(switchesRes.status === 'fulfilled' ? (() => {
          const responseData = switchesRes.value.data;
          const games = responseData.games || responseData;
          return validateApiResponse(games, API_RESPONSE_TYPES.SWITCH_GAME_ARRAY);
        })() : [])];
        setTotalItems(allItems.length);
      })
      .catch((err) => {
        const errorMessage = handleApiError(err, 'public content');
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
        const description = item.description || '';
        if (!creatorName.toLowerCase().includes(search.toLowerCase()) && 
            !tags.toLowerCase().includes(search.toLowerCase()) &&
            !description.toLowerCase().includes(search.toLowerCase())) {
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
  
  // Sort items
  const sortItems = (items) => {
    return items.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'difficulty') {
        const difficultyOrder = { titillating: 1, arousing: 2, explicit: 3, edgy: 4, hardcore: 5 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
      } else if (sortBy === 'creator') {
        const creatorA = a.creator?.fullName || a.creator?.username || '';
        const creatorB = b.creator?.fullName || b.creator?.username || '';
        return creatorA.localeCompare(creatorB);
      }
      return 0;
    });
  };

  const sortedDares = sortItems(filteredDares);
  const sortedSwitchGames = sortItems(filteredSwitchGames);
  
  // Update total items when filtered data changes
  useEffect(() => {
    const allItems = [...filteredDares, ...filteredSwitchGames];
    setTotalItems(allItems.length);
  }, [filteredDares, filteredSwitchGames, setTotalItems]);

  // Apply pagination to filtered items
  const allItems = [...sortedDares, ...sortedSwitchGames];
  const paginatedItems = paginatedData(allItems);
  
  const showDares = filter === 'all' || filter === 'dares';
  const showSwitches = filter === 'all' || filter === 'switches';
  
  // Reset page when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, search, setCurrentPage]);

  const getDifficultyInfo = (difficulty) => {
    const Icon = DIFFICULTY_ICONS[difficulty] || StarIcon;
    const color = DIFFICULTY_COLORS[difficulty] || 'from-neutral-500 to-neutral-600';
    
    return { Icon, color };
  };

  const renderTags = (tags) => {
    if (!tags || tags.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {tags.slice(0, 3).map((tag, index) => (
          <span key={index} className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-600/50 text-neutral-300 border border-neutral-500/30 rounded-lg text-xs">
            <TagIcon className="w-3 h-3" />
            {tag}
          </span>
        ))}
        {tags.length > 3 && (
          <span className="px-2 py-1 bg-neutral-600/50 text-neutral-400 border border-neutral-500/30 rounded-lg text-xs">
            +{tags.length - 3} more
          </span>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="space-y-8">
            <ListSkeleton count={10} />
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
                <h1 className="text-2xl font-bold text-white">Public Dares & Switch Games</h1>
                <p className="text-neutral-400 text-sm">Community challenges and games</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium">
                <div className="flex items-center space-x-1">
                  <GlobeAltIcon className="w-4 h-4" />
                  <span>Public</span>
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
              <GlobeAltIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white">Public Dares & Switch Games</h2>
              <p className="text-xl sm:text-2xl text-neutral-300 mt-2">
                Join fun challenges created by the community!
              </p>
            </div>
          </div>
          <p className="text-neutral-400 text-lg max-w-3xl mx-auto">
            Discover exciting challenges and games from other users. Use filters and search to find something that excites you!
          </p>
        </div>

        {/* Onboarding Banner */}
        <div className="bg-gradient-to-r from-primary/20 to-primary-dark/20 backdrop-blur-sm rounded-2xl border border-primary/30 p-6 shadow-xl mb-8">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🌎</div>
            <div>
              <div className="font-bold text-xl text-white mb-2">Participate in Public Dares & Switch Games</div>
              <div className="text-neutral-300">Use the filters or search to find something that excites you. Click <b>Participate</b> to get started.</div>
            </div>
          </div>
        </div>

        {/* Filters, Search, and Sort */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            {/* Search Bar */}
            <div className="lg:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-neutral-300 mb-2">
                Search Content
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  id="search"
                  type="text"
                  placeholder="Search by creator, tags, or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
                />
              </div>
            </div>

            {/* Content Type Filter */}
            <div>
              <label htmlFor="type-filter" className="block text-sm font-medium text-neutral-300 mb-2">
                Content Type
              </label>
              <select
                id="type-filter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
              >
                {FILTERS.map(f => (
                  <option key={f.key} value={f.key}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label htmlFor="sort-filter" className="block text-sm font-medium text-neutral-300 mb-2">
                Sort By
              </label>
              <select
                id="sort-filter"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="difficulty">Difficulty</option>
                <option value="creator">Creator Name</option>
              </select>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3">
            {FILTERS.map(f => {
              const FilterIcon = f.icon;
              return (
                <button
                  key={f.key}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm border transition-all duration-200 ${
                    filter === f.key 
                      ? `bg-gradient-to-r ${f.color} text-white border-transparent shadow-lg` 
                      : 'bg-neutral-700/50 text-neutral-300 border-neutral-600/50 hover:bg-neutral-600/50'
                  }`}
                  onClick={() => setFilter(f.key)}
                  aria-pressed={filter === f.key}
                >
                  <FilterIcon className="w-4 h-4" />
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 backdrop-blur-sm rounded-2xl border border-red-500/30 p-6 shadow-xl mb-8">
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

        {/* Content Sections */}
        {showDares && (
          <section className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <FireIcon className="w-6 h-6 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Public Dares</h2>
              <span className="px-3 py-1 bg-neutral-600/50 text-neutral-300 rounded-full text-sm">
                {filteredDares.length} available
              </span>
            </div>
            
            {daresLoading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-neutral-700/50 backdrop-blur-sm rounded-xl border border-neutral-600/30 p-6 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-6 bg-neutral-600 rounded-full"></div>
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-4 bg-neutral-600 rounded"></div>
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-neutral-600 rounded-full"></div>
                            <div className="w-24 h-4 bg-neutral-600 rounded"></div>
                          </div>
                        </div>
                      </div>
                      <div className="w-24 h-10 bg-neutral-600 rounded-xl"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredDares.length === 0 ? (
              <div className="bg-neutral-700/50 backdrop-blur-sm rounded-xl border border-neutral-600/30 p-8 text-center">
                <div className="text-neutral-400 text-lg mb-2">
                  {search ? 'No public dares match your search.' : 'No public dares available.'}
                </div>
                {search && (
                  <button 
                    onClick={() => setSearch('')}
                    className="mt-3 text-primary hover:text-primary-light underline"
                    aria-label="Clear search and show all dares"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {paginatedItems.filter(item => item.type === 'dare').map(dare => {
                  const { Icon: DifficultyIcon, color } = getDifficultyInfo(dare.difficulty);
                  
                  return (
                    <div key={dare._id} className="bg-neutral-700/50 backdrop-blur-sm rounded-xl border border-neutral-600/30 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] group">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                          {/* Difficulty Badge */}
                          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r ${color} text-white text-sm font-semibold`}>
                            <DifficultyIcon className="w-4 h-4" />
                            {dare.difficulty}
                          </div>
                          
                          {/* Creator Info */}
                          <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3">
                            <span className="text-neutral-400 text-sm">Created by</span>
                            <Link 
                              to={`/modern/profile/${dare.creator?._id || dare.creator?.id}`} 
                              className="flex items-center gap-2 group-hover:underline"
                              aria-label={`View profile of ${dare.creator?.fullName || 'User'}`}
                            >
                              <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center">
                                <UserIcon className="w-5 h-5 text-white" />
                              </div>
                              <span className="font-bold text-white">{dare.creator?.fullName || 'User'}</span>
                            </Link>
                          </div>
                        </div>
                        
                        {/* Action Button */}
                        <Link to={dare.claimToken ? `/modern/claim/${dare.claimToken}` : `/modern/dares/${dare._id}/consent`}>
                          <button 
                            className="w-full lg:w-auto bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl px-6 py-3 font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 justify-center" 
                            aria-label={`Participate in dare by ${dare.creator?.fullName || 'User'}`}
                          >
                            {dare.claimToken ? (
                              <>
                                <CheckCircleIcon className="w-5 h-5" />
                                Claim & Perform
                              </>
                            ) : (
                              <>
                                <PlayIcon className="w-5 h-5" />
                                Participate
                              </>
                            )}
                          </button>
                        </Link>
                      </div>
                      
                      {/* Tags */}
                      {renderTags(dare.tags)}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {showSwitches && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <PlayIcon className="w-6 h-6 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Public Switch Games</h2>
              <span className="px-3 py-1 bg-neutral-600/50 text-neutral-300 rounded-full text-sm">
                {filteredSwitchGames.length} available
              </span>
            </div>
            
            {switchesLoading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-neutral-700/50 backdrop-blur-sm rounded-xl border border-neutral-600/30 p-6 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-6 bg-neutral-600 rounded-full"></div>
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-4 bg-neutral-600 rounded"></div>
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-neutral-600 rounded-full"></div>
                            <div className="w-24 h-4 bg-neutral-600 rounded"></div>
                          </div>
                        </div>
                      </div>
                      <div className="w-24 h-10 bg-neutral-600 rounded-xl"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredSwitchGames.length === 0 ? (
              <div className="bg-neutral-700/50 backdrop-blur-sm rounded-xl border border-neutral-600/30 p-8 text-center">
                <div className="text-neutral-400 text-lg mb-2">
                  {search ? 'No public switch games match your search.' : 'No public switch games available.'}
                </div>
                {search && (
                  <button 
                    onClick={() => setSearch('')}
                    className="mt-3 text-primary hover:text-primary-light underline"
                    aria-label="Clear search and show all switch games"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {paginatedItems.filter(item => item.type === 'switch').map(game => {
                  const { Icon: DifficultyIcon, color } = getDifficultyInfo(game.creatorDare?.difficulty);
                  
                  return (
                    <div key={game._id} className="bg-neutral-700/50 backdrop-blur-sm rounded-xl border border-neutral-600/30 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] group">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                          {/* Difficulty Badge */}
                          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r ${color} text-white text-sm font-semibold`}>
                            <DifficultyIcon className="w-4 h-4" />
                            {game.creatorDare?.difficulty || 'Unknown'}
                          </div>
                          
                          {/* Creator Info */}
                          <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3">
                            <span className="text-neutral-400 text-sm">Created by</span>
                            <Link 
                              to={`/modern/profile/${game.creator?._id || game.creator?.id}`} 
                              className="flex items-center gap-2 group-hover:underline"
                              aria-label={`View profile of ${game.creator?.fullName || 'User'}`}
                            >
                              <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center">
                                <UserIcon className="w-5 h-5 text-white" />
                              </div>
                              <span className="font-bold text-white">{game.creator?.fullName || 'User'}</span>
                            </Link>
                          </div>
                        </div>
                        
                        {/* Action Button */}
                        <Link to={`/modern/switches/claim/${game._id}`}>
                          <button 
                            className="w-full lg:w-auto bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl px-6 py-3 font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 justify-center" 
                            aria-label={`Join switch game by ${game.creator?.fullName || 'User'}`}
                          >
                            <UsersIcon className="w-5 h-5" />
                            Join Game
                          </button>
                        </Link>
                      </div>
                      
                      {/* Tags */}
                      {renderTags(game.tags)}
                    </div>
                  );
                })}
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
              className="bg-neutral-700/50 backdrop-blur-sm rounded-xl border border-neutral-600/30 p-4"
            />
          </div>
        )}

        {/* Empty state if both are empty after filtering */}
        {filteredDares.length === 0 && filteredSwitchGames.length === 0 && !loading && (
          <div className="bg-neutral-700/50 backdrop-blur-sm rounded-xl border border-neutral-600/30 p-8 text-center">
            <div className="text-neutral-400 text-lg mb-2">No public dares or switch games match your search or filters.</div>
            <div className="text-neutral-500 text-sm mb-4">Try adjusting your search or check back later!</div>
            <button 
              onClick={() => {
                setSearch('');
                setFilter('all');
              }}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition-colors duration-200"
              aria-label="Reset all filters and search"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernPublicDares; 