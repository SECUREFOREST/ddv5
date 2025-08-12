import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import { validateApiResponse } from '../utils/apiValidation';
import { API_RESPONSE_TYPES } from '../constants.jsx';
import { Pagination } from '../utils/pagination';
import { 
  FireIcon, 
  PlusIcon,
  PlayIcon,
  EyeIcon,
  CheckCircleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import SwitchGameCard from '../components/SwitchGameCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Search from '../components/Search';
import { MainContent, ContentContainer } from '../components/Layout';
import { retryApiCall } from '../utils/retry';

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
    secondary: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 focus:ring-blue-500',
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

const ITEMS_PER_PAGE = 10;

export default function SwitchGameLobby() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  
  // State for switch games
  const [mySwitchGames, setMySwitchGames] = useState([]);
  const [switchPage, setSwitchPage] = useState(1);
  const [switchTotalPages, setSwitchTotalPages] = useState(1);
  const [switchTotalItems, setSwitchTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  
  // State for filters
  const [filters, setFilters] = useState({
    status: '',
    difficulty: '',
    search: ''
  });

  const currentUserId = user?._id || user?.id;

  // Fetch user's switch games
  const fetchMySwitchGames = useCallback(async () => {
    if (!currentUserId) return;
    
    try {
      setDataLoading(true);
      const response = await retryApiCall(() => 
        api.get(`/switches/performer?page=${switchPage}&limit=${ITEMS_PER_PAGE}`)
      );
      
      if (response && response.data) {
        const responseData = response.data;
        const games = responseData.games || responseData;
        const validatedData = validateApiResponse(games, API_RESPONSE_TYPES.SWITCH_GAME_ARRAY);
        
        // Handle pagination
        let totalPages = 1;
        if (responseData.pagination) {
          totalPages = responseData.pagination.pages || 1;
          setSwitchTotalItems(responseData.pagination.total || validatedData.length);
        } else {
          setSwitchTotalItems(validatedData.length);
        }
        
        setSwitchTotalPages(totalPages);
        setMySwitchGames(Array.isArray(validatedData) ? validatedData : []);
      } else {
        setMySwitchGames([]);
        setSwitchTotalItems(0);
        setSwitchTotalPages(1);
      }
    } catch (error) {
      console.error('Failed to fetch switch games:', error);
      showError('Failed to load switch games');
      setMySwitchGames([]);
    } finally {
      setDataLoading(false);
      setLoading(false);
    }
  }, [currentUserId, switchPage, showError]);

  // Handle page change
  const handleSwitchPageChange = (newPage) => {
    setSwitchPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle filters
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setSwitchPage(1); // Reset to first page when filters change
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: '',
      difficulty: '',
      search: ''
    });
    setSwitchPage(1);
  };

  // Refresh data
  const refreshData = () => {
    fetchMySwitchGames();
  };

  // Quick actions
  const handleQuickAction = (action) => {
    switch (action) {
      case 'create-switch':
        navigate('/switches/create');
        break;
      case 'find-games':
        navigate('/switches/join');
        break;
      default:
        break;
    }
  };

  // Load data on mount and when dependencies change
  useEffect(() => {
    fetchMySwitchGames();
  }, [fetchMySwitchGames]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <ContentContainer>
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="text-center py-16">
              <LoadingSpinner size="lg" />
              <p className="text-white/70 mt-4">Loading your switch games...</p>
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
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-2xl shadow-2xl shadow-purple-500/25">
                <FireIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Switch Games Lobby</h1>
            <p className="text-xl sm:text-2xl text-neutral-300">
              Manage your active switch games and track your progress
            </p>
          </div>

          {/* Stats Overview */}
          <NeumorphicCard variant="glass" className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">{mySwitchGames.length}</div>
                <div className="text-white/70 text-sm">Total Games</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {mySwitchGames.filter(game => game.status === 'in_progress').length}
                </div>
                <div className="text-white/70 text-sm">Active</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {mySwitchGames.filter(game => game.status === 'awaiting_proof').length}
                </div>
                <div className="text-white/70 text-sm">Awaiting Proof</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {mySwitchGames.filter(game => game.status === 'completed').length}
                </div>
                <div className="text-white/70 text-sm">Completed</div>
              </div>
            </div>
          </NeumorphicCard>

          {/* Filters and Search */}
          <NeumorphicCard variant="glass" className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <FunnelIcon className="w-6 h-6 text-blue-400" />
                Filters & Search
                {dataLoading && (
                  <div className="flex items-center gap-2 text-sm text-blue-400">
                    <LoadingSpinner size="sm" />
                    Loading...
                  </div>
                )}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={refreshData}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2"
                  disabled={dataLoading}
                >
                  <ArrowPathIcon className={`w-4 h-4 ${dataLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={clearFilters}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200"
                  disabled={dataLoading}
                >
                  Clear Filters
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                >
                  <option value="">All Statuses</option>
                  <option value="waiting_for_participant">Waiting for Participant</option>
                  <option value="in_progress">In Progress</option>
                  <option value="awaiting_proof">Awaiting Proof</option>
                  <option value="proof_submitted">Proof Submitted</option>
                  <option value="completed">Completed</option>
                  <option value="chickened_out">Chickened Out</option>
                </select>
              </div>

              {/* Difficulty Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Difficulty</label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-700 rounded-xl text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                >
                  <option value="">All Difficulties</option>
                  <option value="titillating">Titillating</option>
                  <option value="arousing">Arousing</option>
                  <option value="explicit">Explicit</option>
                  <option value="edgy">Edgy</option>
                  <option value="hardcore">Hardcore</option>
                </select>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Search</label>
                <Search
                  placeholder="Search games..."
                  onSearch={(query) => handleFilterChange('search', query)}
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
                Your Switch Games ({switchTotalItems})
              </h3>
              <div className="flex gap-3">
                <MicroInteractionButton
                  onClick={() => handleQuickAction('create-switch')}
                  variant="primary"
                  size="sm"
                  icon={PlusIcon}
                >
                  Create Game
                </MicroInteractionButton>
                <MicroInteractionButton
                  onClick={() => handleQuickAction('find-games')}
                  variant="secondary"
                  size="sm"
                  icon={PlayIcon}
                >
                  Find Games
                </MicroInteractionButton>
              </div>
            </div>

            {mySwitchGames.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FireIcon className="w-8 h-8 text-purple-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">No Switch Games</h4>
                <p className="text-white/70 mb-6">Create or join switch games to get started!</p>
                <div className="flex gap-4 justify-center">
                  <MicroInteractionButton
                    onClick={() => handleQuickAction('create-switch')}
                    variant="primary"
                  >
                    Create Game
                  </MicroInteractionButton>
                  <MicroInteractionButton
                    onClick={() => handleQuickAction('find-games')}
                    variant="secondary"
                  >
                    Find Games
                  </MicroInteractionButton>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.isArray(mySwitchGames) && mySwitchGames.map((game) => (
                  <SwitchGameCard 
                    key={game._id} 
                    game={game}
                    currentUserId={currentUserId}
                    onSubmitProof={async (formData) => {
                      try {
                        await api.post(`/switches/${game._id}/proof`, formData, {
                          headers: { 'Content-Type': 'multipart/form-data' },
                        });
                        showSuccess('Proof submitted successfully!');
                        // Refresh the data
                        fetchMySwitchGames();
                      } catch (error) {
                        const errorMessage = error.response?.data?.error || 'Failed to submit proof.';
                        showError(errorMessage);
                        throw error; // Re-throw so the component can handle it
                      }
                    }}
                    actions={
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/switches/${game._id}`)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          <EyeIcon className="w-4 h-4" />
                          View Details
                        </button>
                        {game.status === 'in_progress' && (
                          <button
                            onClick={() => navigate(`/switches/${game._id}`)}
                            className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:from-green-600 hover:to-green-700 transition-all duration-200 hover:scale-105 active:scale-95"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            Submit Move
                          </button>
                        )}
                      </div>
                    }
                  />
                ))}
                
                {/* Pagination */}
                {switchTotalPages > 1 && switchTotalItems > 0 && 
                 Number.isInteger(switchPage) && Number.isInteger(switchTotalPages) && Number.isInteger(switchTotalItems) && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={switchPage}
                      totalPages={switchTotalPages}
                      onPageChange={handleSwitchPageChange}
                      totalItems={switchTotalItems}
                      pageSize={ITEMS_PER_PAGE}
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