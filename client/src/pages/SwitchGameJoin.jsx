import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { ListSkeleton } from '../components/Skeleton';
import { MainContent, ContentContainer } from '../components/Layout';
import { FireIcon, GlobeAltIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import { usePagination, Pagination } from '../utils/pagination.jsx';
import { retryApiCall } from '../utils/retry';
import Search from '../components/Search';
import { DifficultyBadge } from '../components/Badge';
import { ERROR_MESSAGES, API_RESPONSE_TYPES } from '../constants.jsx';
import { validateApiResponse } from '../utils/apiValidation';
import { handleApiError } from '../utils/errorHandler';
import SwitchGameCard from '../components/SwitchGameCard';

// 2025 Design System - Neumorphism 2.0
const NeumorphicCard = ({ children, className = '', variant = 'default', interactive = false, onClick }) => {
  const baseClasses = `
    relative overflow-hidden
    bg-neutral-900/80 backdrop-blur-xl
    border border-white/10
    rounded-2xl
    transition-all duration-300 ease-out
  `;
  
  const variantClasses = {
    default: 'shadow-[0_8px_32px_rgba(0,0,0,0.12)]',
    elevated: 'shadow-[0_12px_40px_rgba(0,0,0,0.15)]',
    pressed: 'shadow-[inset_0_4px_16px_rgba(0,0,0,0.2)]',
    glass: 'bg-neutral-800/90 backdrop-blur-2xl border-white/20'
  };
  
  const interactiveClasses = interactive ? `
    hover:shadow-[0_16px_48px_rgba(0,0,0,0.2)]
    hover:scale-[1.02]
    active:scale-[0.98]
    active:shadow-[inset_0_4px_16px_rgba(0,0,0,0.2)]
    cursor-pointer
  ` : '';
  
  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${interactiveClasses} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e);
        }
      } : undefined}
    >
      {children}
    </div>
  );
};

// Micro Interaction Button Component
const MicroInteractionButton = ({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'md',
  disabled = false,
  className = '',
  icon: Icon
}) => {
  const baseClasses = `
    inline-flex items-center gap-2
    font-semibold rounded-xl
    transition-all duration-300 ease-out
    transform hover:scale-105 active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900
  `;
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 focus:ring-purple-500',
    secondary: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 focus:ring-purple-500',
    success: 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 focus:ring-green-500',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500',
    default: 'bg-gradient-to-r from-neutral-600 to-neutral-700 text-white hover:from-neutral-700 hover:to-neutral-800 focus:ring-neutral-500'
  };
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  );
};

export default function SwitchGameJoin() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  const [switchGames, setSwitchGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [switchesLoading, setSwitchesLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [tagsFilter, setTagsFilter] = useState([]);
  
  // Activate pagination for public switch games
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

  const fetchPublicSwitchGames = async () => {
    try {
      setSwitchesLoading(true);
      setError('');
      
      const params = {
        public: true,
        status: 'waiting_for_participant',
        page: currentPage,
        limit: pageSize
      };
      
      if (difficultyFilter) params.difficulty = difficultyFilter;
      if (tagsFilter.length > 0) params.tags = tagsFilter.join(',');
      if (search) params.search = search;
      
      const response = await retryApiCall(() => api.get('/switches', { params }));
      
      if (response && response.data) {
        const responseData = response.data;
        const games = responseData.games || responseData;
        const switchesData = validateApiResponse(games, API_RESPONSE_TYPES.SWITCH_GAME_ARRAY);
        
        setSwitchGames(switchesData);
        
        // Update pagination
        if (responseData.pagination) {
          setTotalItems(responseData.pagination.total || switchesData.length);
          // Note: totalPages is handled by usePagination hook
        } else {
          setTotalItems(switchesData.length);
        }
      } else {
        setSwitchGames([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error('Failed to load public switch games:', error);
      const errorMessage = handleApiError(error, 'public switch games');
      setError(errorMessage);
      showError(errorMessage);
      setSwitchGames([]);
      setTotalItems(0);
    } finally {
      setSwitchesLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublicSwitchGames();
  }, [currentPage, pageSize, difficultyFilter, tagsFilter, search]);

  const handleSearch = (query) => {
    setSearch(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleDifficultyChange = (difficulty) => {
    setDifficultyFilter(difficulty);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleTagsChange = (tags) => {
    setTagsFilter(tags);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setSearch('');
    setDifficultyFilter('');
    setTagsFilter([]);
    setCurrentPage(1);
  };

  const handleJoinGame = (gameId) => {
    navigate(`/switches/participate/${gameId}`);
  };

  const handleViewGame = (gameId) => {
    navigate(`/switches/${gameId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <ContentContainer>
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="text-center py-16">
              <ListSkeleton />
            </div>
          </div>
        </ContentContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <ContentContainer>
        <MainContent className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-2xl shadow-2xl shadow-blue-500/25">
                <UserGroupIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Join Switch Games</h1>
            <p className="text-xl sm:text-2xl text-neutral-300">
              Discover and join public switch games from other players
            </p>
          </div>

          {/* Stats Overview */}
          <NeumorphicCard variant="glass" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">{totalItems}</div>
                <div className="text-white/70 text-sm">Available Games</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {switchGames.filter(game => game.creatorDare?.difficulty === 'titillating').length}
                </div>
                <div className="text-white/70 text-sm">Titillating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {switchGames.filter(game => game.creatorDare?.difficulty === 'hardcore').length}
                </div>
                <div className="text-white/70 text-sm">Hardcore</div>
              </div>
            </div>
          </NeumorphicCard>

          {/* Filters and Search */}
          <NeumorphicCard variant="glass" className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <GlobeAltIcon className="w-6 h-6 text-blue-400" />
                Filters & Search
                {switchesLoading && (
                  <div className="flex items-center gap-2 text-sm text-blue-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                    Loading...
                  </div>
                )}
              </h3>
              <button
                onClick={clearFilters}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200"
                disabled={switchesLoading}
              >
                Clear All Filters
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Difficulty Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Difficulty</label>
                <select
                  value={difficultyFilter}
                  onChange={(e) => handleDifficultyChange(e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="">All Difficulties</option>
                  <option value="titillating">Titillating</option>
                  <option value="arousing">Arousing</option>
                  <option value="explicit">Explicit</option>
                  <option value="edgy">Edgy</option>
                  <option value="hardcore">Hardcore</option>
                </select>
              </div>

              {/* Tags Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Tags</label>
                <input
                  type="text"
                  placeholder="Enter tags (comma separated)"
                  value={tagsFilter.join(', ')}
                  onChange={(e) => handleTagsChange(e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag))}
                  className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Search</label>
                <Search
                  placeholder="Search games..."
                  onSearch={handleSearch}
                  className="w-full"
                />
              </div>
            </div>
          </NeumorphicCard>

          {/* Switch Games List */}
          <NeumorphicCard variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <FireIcon className="w-6 h-6 text-purple-400" />
                Available Switch Games ({totalItems})
              </h3>
              <div className="flex gap-3">
                <MicroInteractionButton
                  onClick={() => navigate('/switches/create')}
                  variant="primary"
                  size="sm"
                >
                  Create Your Own
                </MicroInteractionButton>
              </div>
            </div>

            {error ? (
              <div className="text-center py-8">
                <div className="text-red-400 mb-4">{error}</div>
                <button
                  onClick={fetchPublicSwitchGames}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : switchGames.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FireIcon className="w-8 h-8 text-blue-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">No Games Available</h4>
                <p className="text-white/70 mb-6">No public switch games match your current filters.</p>
                <div className="flex gap-4 justify-center">
                  <MicroInteractionButton
                    onClick={clearFilters}
                    variant="secondary"
                  >
                    Clear Filters
                  </MicroInteractionButton>
                  <MicroInteractionButton
                    onClick={() => navigate('/switches/create')}
                    variant="primary"
                  >
                    Create Game
                  </MicroInteractionButton>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {switchGames.map((game) => (
                  <SwitchGameCard 
                    key={game._id} 
                    game={game}
                    currentUserId={null} // No current user for public browsing
                    actions={
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleJoinGame(game._id)}
                          className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:from-green-600 hover:to-green-700 transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          <UserGroupIcon className="w-4 h-4" />
                          Join Game
                        </button>
                        <button
                          onClick={() => handleViewGame(game._id)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          <ClockIcon className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    }
                  />
                ))}
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      totalItems={totalItems}
                      pageSize={pageSize}
                    />
                  </div>
                )}
              </div>
            )}
          </NeumorphicCard>
        </MainContent>
      </ContentContainer>
    </div>
  );
} 