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
  ChartBarIcon,
  TrophyIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  PlusIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import SwitchGameCard from '../components/SwitchGameCard';
import LoadingSpinner from '../components/LoadingSpinner';
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

const ITEMS_PER_PAGE = 10;

export default function SwitchGameHistory() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  
  // State for switch games
  const [allSwitchGames, setAllSwitchGames] = useState([]);
  const [activeSwitchGames, setActiveSwitchGames] = useState([]);
  const [completedSwitchGames, setCompletedSwitchGames] = useState([]);
  const [historySwitchGames, setHistorySwitchGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  
  // Pagination state
  const [activePage, setActivePage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [activeTotalPages, setActiveTotalPages] = useState(1);
  const [completedTotalPages, setCompletedTotalPages] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [activeTotalItems, setActiveTotalItems] = useState(0);
  const [completedTotalItems, setCompletedTotalItems] = useState(0);
  const [historyTotalItems, setHistoryTotalItems] = useState(0);

  const currentUserId = user?._id || user?.id;

  // Fetch all switch games for the user
  const fetchAllSwitchGames = useCallback(async () => {
    if (!currentUserId) return;
    
    try {
      setDataLoading(true);
      const response = await retryApiCall(() => 
        api.get(`/switches/performer?limit=1000`) // Get all games for stats
      );
      
      if (response && response.data) {
        const responseData = response.data;
        const games = responseData.games || responseData;
        const validatedData = validateApiResponse(games, API_RESPONSE_TYPES.SWITCH_GAME_ARRAY);
        
        setAllSwitchGames(validatedData);
        
        // Categorize games
        const active = validatedData.filter(game => 
          ['waiting_for_participant', 'in_progress', 'awaiting_proof', 'proof_submitted'].includes(game.status)
        );
        const completed = validatedData.filter(game => game.status === 'completed');
        const history = validatedData.filter(game => 
          ['completed', 'chickened_out'].includes(game.status)
        );
        
        setActiveSwitchGames(active);
        setCompletedSwitchGames(completed);
        setHistorySwitchGames(history);
        
        // Set pagination totals
        setActiveTotalItems(active.length);
        setCompletedTotalItems(completed.length);
        setHistoryTotalItems(history.length);
        setActiveTotalPages(Math.ceil(active.length / ITEMS_PER_PAGE));
        setCompletedTotalPages(Math.ceil(completed.length / ITEMS_PER_PAGE));
        setHistoryTotalPages(Math.ceil(history.length / ITEMS_PER_PAGE));
      }
    } catch (error) {
      console.error('Failed to fetch switch games:', error);
      showError('Failed to load switch games');
    } finally {
      setDataLoading(false);
      setLoading(false);
    }
  }, [currentUserId, showError]);

  // Calculate statistics
  const stats = {
    total: allSwitchGames.length,
    active: activeSwitchGames.length,
    completed: completedSwitchGames.length,
    chickenedOut: allSwitchGames.filter(game => game.status === 'chickened_out').length,
    winRate: allSwitchGames.length > 0 ? 
      (allSwitchGames.filter(game => game.winner && game.winner.toString() === currentUserId).length / allSwitchGames.length * 100).toFixed(1) : 0,
    completionRate: allSwitchGames.length > 0 ? 
      (completedSwitchGames.length / allSwitchGames.length * 100).toFixed(1) : 0
  };

  // Get paginated data
  const getPaginatedData = (data, page, itemsPerPage) => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return data.slice(start, end);
  };

  // Handle page changes
  const handleActivePageChange = (newPage) => {
    setActivePage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompletedPageChange = (newPage) => {
    setCompletedPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHistoryPageChange = (newPage) => {
    setHistoryPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      case 'manage-games':
        navigate('/switches/lobby');
        break;
      default:
        break;
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchAllSwitchGames();
  }, [fetchAllSwitchGames]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <ContentContainer>
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="text-center py-16">
              <LoadingSpinner size="lg" />
              <p className="text-white/70 mt-4">Loading your switch game history...</p>
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
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-2xl shadow-2xl shadow-green-500/25">
                <TrophyIcon className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Switch Game History</h1>
            <p className="text-xl sm:text-2xl text-neutral-300">
              Track your performance and review completed games
            </p>
          </div>

          {/* Performance Statistics */}
          <NeumorphicCard variant="glass" className="p-6">
            <h3 className="text-xl font-bold text-white mb-6 text-center flex items-center justify-center gap-3">
              <ChartBarIcon className="w-6 h-6 text-green-400" />
              Performance Overview
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">{stats.total}</div>
                <div className="text-white/70 text-sm">Total Games</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">{stats.active}</div>
                <div className="text-white/70 text-sm">Active</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">{stats.completed}</div>
                <div className="text-white/70 text-sm">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">{stats.winRate}%</div>
                <div className="text-white/70 text-sm">Win Rate</div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-2">{stats.completionRate}%</div>
                <div className="text-white/70 text-sm">Completion Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400 mb-2">{stats.chickenedOut}</div>
                <div className="text-white/70 text-sm">Chickened Out</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-400 mb-2">
                  {allSwitchGames.filter(game => game.grades && game.grades.length > 0).length}
                </div>
                <div className="text-white/70 text-sm">Graded Games</div>
              </div>
            </div>
          </NeumorphicCard>

          {/* Quick Actions */}
          <NeumorphicCard variant="glass" className="p-6">
            <div className="flex flex-wrap gap-4 justify-center">
              <MicroInteractionButton
                onClick={() => handleQuickAction('create-switch')}
                variant="primary"
                icon={PlusIcon}
              >
                Create New Game
              </MicroInteractionButton>
              <MicroInteractionButton
                onClick={() => handleQuickAction('find-games')}
                variant="secondary"
                icon={PlayIcon}
              >
                Find Games to Join
              </MicroInteractionButton>
              <MicroInteractionButton
                onClick={() => handleQuickAction('manage-games')}
                variant="success"
                icon={FireIcon}
              >
                Manage Active Games
              </MicroInteractionButton>
            </div>
          </NeumorphicCard>

          {/* Active Games */}
          <NeumorphicCard variant="glass" className="p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <ClockIcon className="w-6 h-6 text-blue-400" />
              Active Switch Games ({activeTotalItems})
            </h3>
            
            {activeSwitchGames.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-white/60">No active switch games.</div>
              </div>
            ) : (
              <div className="space-y-4">
                {getPaginatedData(activeSwitchGames, activePage, ITEMS_PER_PAGE).map(game => (
                  <SwitchGameCard
                    key={game._id}
                    game={game}
                    currentUserId={currentUserId}
                    onSubmitProof={() => navigate(`/switches/${game._id}`)}
                    onChickenOut={() => navigate(`/switches/${game._id}`)}
                  />
                ))}
                
                {/* Active Games Pagination */}
                {activeTotalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={activePage}
                      totalPages={activeTotalPages}
                      onPageChange={handleActivePageChange}
                      totalItems={activeTotalItems}
                      pageSize={ITEMS_PER_PAGE}
                    />
                  </div>
                )}
              </div>
            )}
          </NeumorphicCard>

          {/* Completed Games */}
          <NeumorphicCard variant="glass" className="p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <CheckCircleIcon className="w-6 h-6 text-green-400" />
              Completed Switch Games ({completedTotalItems})
            </h3>
            
            {completedSwitchGames.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-white/60">No completed switch games yet.</div>
              </div>
            ) : (
              <div className="space-y-4">
                {getPaginatedData(completedSwitchGames, completedPage, ITEMS_PER_PAGE).map(game => (
                  <SwitchGameCard
                    key={game._id}
                    game={game}
                    currentUserId={currentUserId}
                    onSubmitProof={() => navigate(`/switches/${game._id}`)}
                    onChickenOut={() => navigate(`/switches/${game._id}`)}
                  />
                ))}
                
                {/* Completed Games Pagination */}
                {completedTotalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={completedPage}
                      totalPages={completedTotalPages}
                      onPageChange={handleCompletedPageChange}
                      totalItems={completedTotalItems}
                      pageSize={ITEMS_PER_PAGE}
                    />
                  </div>
                )}
              </div>
            )}
          </NeumorphicCard>

          {/* Historical Games */}
          <NeumorphicCard variant="glass" className="p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <TrophyIcon className="w-6 h-6 text-yellow-400" />
              Game History ({historyTotalItems})
            </h3>
            
            {historySwitchGames.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-white/60">No switch game history available.</div>
              </div>
            ) : (
              <div className="space-y-4">
                {getPaginatedData(historySwitchGames, historyPage, ITEMS_PER_PAGE).map(game => (
                  <SwitchGameCard
                    key={game._id}
                    game={game}
                    currentUserId={currentUserId}
                    onSubmitProof={() => navigate(`/switches/${game._id}`)}
                    onChickenOut={() => navigate(`/switches/${game._id}`)}
                  />
                ))}
                
                {/* History Pagination */}
                {historyTotalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={historyPage}
                      totalPages={historyTotalPages}
                      onPageChange={handleHistoryPageChange}
                      totalItems={historyTotalItems}
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