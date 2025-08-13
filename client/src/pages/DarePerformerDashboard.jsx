import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axios';
import { validateApiResponse } from '../utils/apiValidation';
import { API_RESPONSE_TYPES, ERROR_MESSAGES } from '../constants.jsx';
import { handleApiError } from '../utils/errorHandler';
import { Pagination } from '../utils/pagination';
import { 
  ChartBarIcon, 
  ClockIcon, 
  TrophyIcon, 
  FireIcon, 
  SparklesIcon,
  PlusIcon,
  PlayIcon,
  DocumentPlusIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowPathIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  StarIcon,
  BoltIcon,
  ShieldCheckIcon,
  CogIcon,
  BellIcon,
  UserIcon,
  HomeIcon,
  SwatchIcon,
  SparklesIcon as SparklesIconSolid,
  PuzzlePieceIcon
} from '@heroicons/react/24/outline';
import { DIFFICULTY_OPTIONS } from '../constants.jsx';
import { 
  SparklesIcon as SparklesIconFilled,
  FireIcon as FireIconFilled,
  TrophyIcon as TrophyIconFilled,
  ClockIcon as ClockIconFilled
} from '@heroicons/react/24/solid';
import Tabs from '../components/Tabs';
import LoadingSpinner from '../components/LoadingSpinner';
import DareCard from '../components/DareCard';
import SwitchGameCard from '../components/SwitchGameCard';
import RecentActivityWidget from '../components/RecentActivityWidget';
import DashboardChart from '../components/DashboardChart';
import Accordion from '../components/Accordion';
import Modal from '../components/Modal';
import Avatar from '../components/Avatar';
import TagsInput from '../components/TagsInput';
import { MainContent, ContentContainer } from '../components/Layout';

import { FormSelect } from '../components/Form';
import ErrorBoundary from '../components/ErrorBoundary';

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

      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};


  






// Main Dashboard Component with 2025 Design
export default function DarePerformerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { userId } = useParams();
  const { showSuccess, showError } = useToast();
  
  // Use the logged-in user's ID instead of URL params
  const currentUserId = user?._id || user?.id;
  

  
  // State management with 2025 patterns
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const [activeTab, setActiveTab] = useState('overview');
  const [dataLoading, setDataLoading] = useState({
    ongoing: true,
    completed: true,
    switchGames: true,
    public: true,
    publicSwitch: true,
    
  });
  
  // 2025: Smart state consolidation
  const [filters, setFilters] = useState({
    status: 'all',
    difficulty: 'all',
    type: 'all',
    keyword: '',
    creator: '',
    tags: []
  });
  
  const [demandState, setDemandState] = useState({
    slots: [],
    selectedDifficulties: [],
    selectedTypes: [],
    keywordFilter: '',
    creatorFilter: '',
    publicDares: [],
    loading: false,
    error: null,
    expandedIdx: null,
    completed: [],
    total: 0
  });
  
  const [switchState, setSwitchState] = useState({
    statusFilter: 'all',
    difficultyFilter: 'all',
    participantFilter: 'all',
    sort: 'newest',
    activityFeed: [],
    activityLoading: false
  });
  

  
  // Data state
  const [ongoing, setOngoing] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [mySwitchGames, setMySwitchGames] = useState([]);
  const [publicDares, setPublicDares] = useState([]);
  const [publicSwitchGames, setPublicSwitchGames] = useState([]);

  const [errors, setErrors] = useState({});
  
  // Pagination state for active and completed dares (server-side)
  const [activePage, setActivePage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const [activeTotalPages, setActiveTotalPages] = useState(1);
  const [completedTotalPages, setCompletedTotalPages] = useState(1);
  const [activeTotalItems, setActiveTotalItems] = useState(0);
  const [completedTotalItems, setCompletedTotalItems] = useState(0);
  
  // Pagination state for switch games (server-side)
  const [switchPage, setSwitchPage] = useState(1);
  const [switchTotalPages, setSwitchTotalPages] = useState(1);
  const [switchTotalItems, setSwitchTotalItems] = useState(0);
  
  // Pagination state for public dares and switch games (server-side)
  const [publicDarePage, setPublicDarePage] = useState(1);
  const [publicSwitchPage, setPublicSwitchPage] = useState(1);
  const [publicDareTotalPages, setPublicDareTotalPages] = useState(1);
  const [publicSwitchTotalPages, setPublicSwitchTotalPages] = useState(1);
  const [publicDareTotalItems, setPublicDareTotalItems] = useState(0);
  const [publicSwitchTotalItems, setPublicSwitchTotalItems] = useState(0);
  
  // Filter state for public content
  const [publicFilters, setPublicFilters] = useState({
    difficulty: '',
    dareType: ''
  });
  
  // Filter state for public switch games
  const [publicSwitchFilters, setPublicSwitchFilters] = useState({
    difficulty: ''
  });
  
  // Filter state for personal dares
  const [dareFilters, setDareFilters] = useState({
    difficulty: '',
    status: ''
  });
  
  // Filter state for personal switch games
  const [switchGameFilters, setSwitchGameFilters] = useState({
    difficulty: '',
    status: ''
  });
  
  const ITEMS_PER_PAGE = 8;
  
  // Ensure arrays are always valid arrays to prevent .map() errors
  const safePublicDares = Array.isArray(publicDares) ? publicDares : [];
  const safePublicSwitchGames = Array.isArray(publicSwitchGames) ? publicSwitchGames : [];
  const safeOngoing = Array.isArray(ongoing) ? ongoing : [];
  const safeCompleted = Array.isArray(completed) ? completed : [];
  const safeMySwitchGames = Array.isArray(mySwitchGames) ? mySwitchGames : [];
  
  // All filtering and pagination is handled server-side
  // These variables represent the data returned from the server
  const filteredOngoing = safeOngoing;
  const filteredMySwitchGames = safeMySwitchGames;

  
  // 2025: Smart notifications
  const notificationTimeoutRef = useRef(null);
  const isFetchingRef = useRef(false); // Track if we're currently fetching to prevent loops
  
  const showNotification = (msg, type = 'info') => {
    setNotification({ message: msg, type });
    // Clear existing timeout
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    // Set new timeout for auto-dismiss
    notificationTimeoutRef.current = setTimeout(() => setNotification(null), 5000);
  };
  
  // Calculate trend percentage using localStorage for historical data
  const calculateTrend = (current, key) => {
    const previous = parseInt(localStorage.getItem(`dashboard_${key}`) || '0');
    const trend = previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100;
    
    // Store current value for next calculation
    localStorage.setItem(`dashboard_${key}`, current.toString());
    
    return Math.round(trend * 10) / 10; // Round to 1 decimal place
  };
  

  
  // Handle filter changes
  const handleDareFilterChange = (filterType, value) => {
    console.log(`Dare filter changed: ${filterType} = ${value}`);
    console.log('Previous dare filters:', dareFilters);
    
    // Only update if the value actually changed to prevent unnecessary re-renders
    if (dareFilters[filterType] !== value) {
      setDareFilters(prev => {
        const newFilters = { ...prev, [filterType]: value };
        console.log('New dare filters:', newFilters);
        return newFilters;
      });
    }
  };
  
  const handleSwitchGameFilterChange = (filterType, value) => {
    console.log(`Switch game filter changed: ${filterType} = ${value}`);
    console.log('Previous switch game filters:', switchGameFilters);
    
    // Only update if the value actually changed to prevent unnecessary re-renders
    if (switchGameFilters[filterType] !== value) {
      console.log('Updating switch game filters state');
      setSwitchGameFilters(prev => {
        const newFilters = { ...prev, [filterType]: value };
        console.log('New switch game filters:', newFilters);
        return newFilters;
      });
    } else {
      console.log('Filter value unchanged, not updating state');
    }
  };
  
  // Refetch data when personal filters change - with debouncing to prevent loops
  useEffect(() => {
    console.log('Personal filter effect triggered:', { dareFilters, switchGameFilters, currentUserId });
    
    if (currentUserId) {
      // Reset pagination when filters change
      setActivePage(1);
      setSwitchPage(1);
      
      // Use a longer delay and only fetch if filters actually have values
      const hasActiveFilters = dareFilters.difficulty || dareFilters.status || switchGameFilters.difficulty || switchGameFilters.status;
      
      console.log('Has active filters:', hasActiveFilters, { dareFilters, switchGameFilters });
      
      if (hasActiveFilters) {
        console.log('Triggering fetchData due to active filters');
        const timeoutId = setTimeout(() => {
          if (typeof fetchData === 'function') {
            console.log('Calling fetchData from filter effect with current filters');
            // Pass the current filter values directly to avoid timing issues
            fetchData({ dareFilters, switchGameFilters });
          } else {
            console.warn('fetchData is not a function yet');
          }
        }, 100); // Reduced delay since we're fixing the timing issue
        return () => clearTimeout(timeoutId);
      } else {
        console.log('No active filters, not fetching');
      }
    }
  }, [dareFilters.difficulty, dareFilters.status, switchGameFilters.difficulty, switchGameFilters.status, currentUserId]);
  
  // Refetch public data when filters change - with debouncing to prevent loops
  useEffect(() => {
    if (currentUserId) {
      // Reset pagination when filters change
      setPublicDarePage(1);
      setPublicSwitchPage(1);
      
      // Use a longer delay and only fetch if filters actually have values
      const hasActiveFilters = publicFilters.difficulty || publicFilters.dareType || publicSwitchFilters.difficulty;
      
      if (hasActiveFilters) {
        const timeoutId = setTimeout(() => {
          if (typeof fetchPublicDataWithFilters === 'function') {
            fetchPublicDataWithFilters();
          }
        }, 300); // Increased delay to prevent rapid successive calls
        return () => clearTimeout(timeoutId);
      }
    }
  }, [publicFilters.difficulty, publicFilters.dareType, publicSwitchFilters.difficulty, currentUserId]);
  
  // Add a separate effect to handle clearing filters and fetching default data
  useEffect(() => {
    if (currentUserId) {
      // Check if all filters are cleared (empty strings)
      const allPersonalFiltersCleared = !dareFilters.difficulty && !dareFilters.status && 
                                       !switchGameFilters.difficulty && !switchGameFilters.status;
      const allPublicFiltersCleared = !publicFilters.difficulty && !publicFilters.dareType && 
                                     !publicSwitchFilters.difficulty;
      
      // If all filters are cleared, fetch default data after a delay
      if (allPersonalFiltersCleared && allPublicFiltersCleared) {
        const timeoutId = setTimeout(() => {
          if (typeof fetchData === 'function') {
            fetchData();
          }
        }, 500); // Longer delay for clearing filters
        return () => clearTimeout(timeoutId);
      }
    }
  }, [dareFilters.difficulty, dareFilters.status, switchGameFilters.difficulty, switchGameFilters.status, 
      publicFilters.difficulty, publicFilters.dareType, publicSwitchFilters.difficulty, currentUserId]);

  // Handle public pagination changes - only when page > 1 to avoid loops
  useEffect(() => {
    if (currentUserId && (publicDarePage > 1 || publicSwitchPage > 1)) {
      const timeoutId = setTimeout(() => {
        if (typeof fetchPublicDataWithFilters === 'function') {
          fetchPublicDataWithFilters();
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [publicDarePage, publicSwitchPage, currentUserId]);

  // Debug logging for data changes
  useEffect(() => {
    console.log('Data updated:', {
      ongoing: ongoing.length,
      completed: completed.length,
      mySwitchGames: mySwitchGames.length,
      publicDares: publicDares.length,
      publicSwitchGames: publicSwitchGames.length,
      dareFilters,
      switchGameFilters,
      publicFilters,
      publicSwitchFilters
    });
  }, [ongoing, completed, mySwitchGames, publicDares, publicSwitchGames, dareFilters, switchGameFilters, publicFilters, publicSwitchFilters]);

  // Debug logging for filter state changes
  useEffect(() => {
    console.log('Filter state changed:', {
      dareFilters,
      switchGameFilters,
      publicFilters,
      publicSwitchFilters
    });
    
    // Log which specific filter changed
    if (dareFilters.difficulty || dareFilters.status) {
      console.log('Dare filters changed:', dareFilters);
    }
    if (switchGameFilters.difficulty || switchGameFilters.status) {
      console.log('Switch game filters changed:', switchGameFilters);
    }
    if (publicFilters.difficulty || publicFilters.dareType) {
      console.log('Public filters changed:', publicFilters);
    }
    if (publicSwitchFilters.difficulty) {
      console.log('Public switch filters changed:', publicSwitchFilters);
    }
  }, [dareFilters, switchGameFilters, publicFilters, publicSwitchFilters]);

  // 2025: Enhanced data fetching with server-side filtering and pagination
  // All filtering and pagination is handled by the server APIs
  // Client only merges results from multiple endpoints when necessary
  const fetchData = useCallback(async (overrideFilters = null) => {
    // Use override filters if provided, otherwise use current state
    const filtersToUse = overrideFilters || { dareFilters, switchGameFilters };
    console.log('fetchData function called with filters:', filtersToUse);
    
    if (!currentUserId) return;
    
    // Prevent multiple simultaneous requests
    if (isFetchingRef.current) {
      console.log('Already fetching data, skipping request');
      return;
    }
    
    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);
      
      // Get total counts first for proper pagination
      // Build filter query parameters for active dares
      const activeDareFilters = [];
      if (filtersToUse.dareFilters.difficulty) activeDareFilters.push(`difficulty=${filtersToUse.dareFilters.difficulty}`);
      if (filtersToUse.dareFilters.status) activeDareFilters.push(`status=${filtersToUse.dareFilters.status}`);
      const activeDareQueryString = activeDareFilters.length > 0 ? `&${activeDareFilters.join('&')}` : '';
      
      console.log('Active dare filters being applied:', { dareFilters: filtersToUse.dareFilters, activeDareQueryString });
      
      // Build filter query parameters for switch games
      const switchGameQueryParams = [];
      if (filtersToUse.switchGameFilters.difficulty) switchGameQueryParams.push(`difficulty=${filtersToUse.switchGameFilters.difficulty}`);
      if (filtersToUse.switchGameFilters.status) switchGameQueryParams.push(`status=${filtersToUse.switchGameFilters.status}`);
      const switchGameQueryString = switchGameQueryParams.length > 0 ? `&${switchGameQueryParams.join('&')}` : '';
      
      console.log('Switch game filters being applied:', { switchGameFilters: filtersToUse.switchGameFilters, switchGameQueryString });
            
            const [activeCounts, completedCounts, switchCounts] = await Promise.allSettled([
              // Get total counts for active dares (both as creator and participant) with filters
              Promise.all([
                        api.get(`/dares?creator=${currentUserId}&status=in_progress,approved,waiting_for_participant&limit=1${activeDareQueryString}`),
        api.get(`/dares?participant=${currentUserId}&status=in_progress,approved,waiting_for_participant&limit=1${activeDareQueryString}`)
              ]),
              // Get total counts for completed dares (both as creator and participant)
              Promise.all([
                        api.get(`/dares?creator=${currentUserId}&status=completed,graded,chickened_out,rejected,cancelled&limit=1`),
        api.get(`/dares?participant=${currentUserId}&status=completed,graded,chickened_out,rejected,cancelled&limit=1`)
              ]),
              // Get total count for switch games using the performer endpoint with filters
              api.get(`/switches/performer?limit=1${switchGameQueryString}`)
            ]);

            // Parallel data fetching with server-side filtering and pagination
            const [ongoingData, completedData, switchData, publicData, publicSwitchData] = await Promise.allSettled([
              // Active dares: both as creator and participant with server-side pagination and filters
              Promise.all([
                        api.get(`/dares?creator=${currentUserId}&status=in_progress,approved,waiting_for_participant&page=${activePage}&limit=${ITEMS_PER_PAGE}${activeDareQueryString}`),
        api.get(`/dares?participant=${currentUserId}&status=in_progress,approved,waiting_for_participant&page=${activePage}&limit=${ITEMS_PER_PAGE}${activeDareQueryString}`)
              ]),
              // Completed dares: both as creator and participant with server-side pagination
              Promise.all([
                        api.get(`/dares?creator=${currentUserId}&status=completed,graded,chickened_out,rejected,cancelled&page=${completedPage}&limit=${ITEMS_PER_PAGE}`),
        api.get(`/dares?participant=${currentUserId}&status=completed,graded,chickened_out,rejected,cancelled&page=${completedPage}&limit=${ITEMS_PER_PAGE}`)
              ]),
              // Switch games: using performer endpoint with server-side pagination and filters
              api.get(`/switches/performer?page=${switchPage}&limit=${ITEMS_PER_PAGE}${switchGameQueryString}`),
              // Public dares with server-side filtering and pagination
              api.get(`/dares?public=true&page=${publicDarePage}&limit=${ITEMS_PER_PAGE}&difficulty=${publicFilters?.difficulty || ''}&dareType=${publicFilters?.dareType || ''}`),
              // Public switch games with server-side filtering and pagination
              api.get(`/switches?public=true&status=waiting_for_participant&page=${publicSwitchPage}&limit=${ITEMS_PER_PAGE}&difficulty=${publicSwitchFilters?.difficulty || ''}`),

            ]);
            
            // Debug: Log all API calls being made
            console.log('API calls made:', {
              activeDares: `/dares?creator=${currentUserId}&status=in_progress,approved,waiting_for_participant&page=${activePage}&limit=${ITEMS_PER_PAGE}${activeDareQueryString}`,
              switchGames: `/switches/performer?page=${switchPage}&limit=${ITEMS_PER_PAGE}${switchGameQueryString}`,
              publicDares: `/dares?public=true&page=${publicDarePage}&limit=${ITEMS_PER_PAGE}&difficulty=${publicFilters?.difficulty || ''}&dareType=${publicFilters?.dareType || ''}`,
              publicSwitchGames: `/switches?public=true&status=waiting_for_participant&page=${publicSwitchPage}&limit=${ITEMS_PER_PAGE}&difficulty=${publicSwitchFilters?.difficulty || ''}`
            });
      
                  // Handle successful responses
            if (ongoingData && ongoingData.status === 'fulfilled') {
              // Merge dares from both creator and participant responses
              const allActiveDares = [];
              let creatorTotal = 0;
              let participantTotal = 0;
              
              if (ongoingData.value && Array.isArray(ongoingData.value)) {
                ongoingData.value.forEach((response, index) => {
                  if (response && response.status === 200) {
                    const responseData = response.data;
                    if (responseData) {
                      const dares = responseData.dares || responseData;
                      const validatedData = validateApiResponse(dares, API_RESPONSE_TYPES.DARE_ARRAY);
                      if (Array.isArray(validatedData)) {
                        allActiveDares.push(...validatedData);
                      }
                      
                      // Extract pagination metadata for each response
                      if (responseData.pagination) {
                        if (index === 0) {
                          // First response is creator dares
                          creatorTotal = responseData.pagination.total || 0;
                        } else if (index === 1) {
                          // Second response is participant dares
                          participantTotal = responseData.pagination.total || 0;
                        }
                      }
                    }
                  }
                });
              }
              
              // Merge results from creator and participant endpoints (necessary due to dual API calls)
              // Server-side filtering and pagination is applied to each endpoint separately
              const uniqueActiveDares = allActiveDares.filter((dare, index, self) => 
                index === self.findIndex(d => d._id === dare._id)
              );
              
              // Calculate total items from the count API calls
              let totalActiveItems = 0;
              if (activeCounts && activeCounts.status === 'fulfilled') {
                if (activeCounts.value && Array.isArray(activeCounts.value)) {
                  activeCounts.value.forEach((response, index) => {
                    if (response && response.status === 200 && response.data && response.data.pagination) {
                      if (index === 0) {
                        // Creator dares total
                        totalActiveItems += response.data.pagination.total || 0;
                      } else if (index === 1) {
                        // Participant dares total
                        totalActiveItems += response.data.pagination.total || 0;
                      }
                    }
                  });
                }
              }
              
              // Fallback to actual unique dares if count API fails
              if (totalActiveItems === 0) {
                totalActiveItems = uniqueActiveDares.length;
              }
              
              // Calculate total pages based on total items
              const totalActivePages = Math.max(1, Math.ceil(totalActiveItems / ITEMS_PER_PAGE));
              
              // Update pagination state
              setActiveTotalItems(totalActiveItems);
              setActiveTotalPages(totalActivePages);
              

              
              setOngoing(uniqueActiveDares);
            }
      
      if (completedData && completedData.status === 'fulfilled') {
        // Merge dares from both creator and participant responses
        const allCompletedDares = [];
        let creatorTotal = 0;
        let participantTotal = 0;
        
        if (completedData.value && Array.isArray(completedData.value)) {
          completedData.value.forEach((response, index) => {
            if (response && response.status === 200) {
              const responseData = response.data;
              if (responseData) {
                const dares = responseData.dares || responseData;
                const validatedData = validateApiResponse(dares, API_RESPONSE_TYPES.DARE_ARRAY);
                if (Array.isArray(validatedData)) {
                  allCompletedDares.push(...validatedData);
                }
                
                // Extract pagination metadata for each response
                if (responseData.pagination) {
                  if (index === 0) {
                    // First response is creator dares
                    creatorTotal = responseData.pagination.total || 0;
                  } else if (index === 1) {
                    // Second response is participant dares
                    participantTotal = responseData.pagination.total || 0;
                  }
                }
              }
            }
          });
        }
        
        // Merge results from creator and participant endpoints (necessary due to dual API calls)
        // Server-side filtering and pagination is applied to each endpoint separately
        const uniqueCompletedDares = allCompletedDares.filter((dare, index, self) => 
          index === self.findIndex(d => d._id === dare._id)
        );
        
        // Calculate total items from the count API calls
        let totalCompletedItems = 0;
        if (completedCounts && completedCounts.status === 'fulfilled') {
          if (completedCounts.value && Array.isArray(completedCounts.value)) {
            completedCounts.value.forEach((response, index) => {
              if (response && response.status === 200 && response.data && response.data.pagination) {
                if (index === 0) {
                  // Creator dares total
                  totalCompletedItems += response.data.pagination.total || 0;
                } else if (index === 1) {
                  // Participant dares total
                  totalCompletedItems += response.data.pagination.total || 0;
                }
              }
            });
          }
        }
        
        // Fallback to actual unique dares if count API fails
        if (totalCompletedItems === 0) {
          totalCompletedItems = uniqueCompletedDares.length;
        }
        
        // Calculate total pages based on total items
        const totalCompletedPages = Math.max(1, Math.ceil(totalCompletedItems / ITEMS_PER_PAGE));
        
        // Update pagination state
        setCompletedTotalItems(totalCompletedItems);
        setCompletedTotalPages(totalCompletedPages);



        setCompleted(uniqueCompletedDares);
      }
      
      if (switchData && switchData.status === 'fulfilled') {
        // Handle switch games response with pagination
        const responseData = switchData.value?.data;
        if (responseData) {
          const games = responseData.games || responseData;
          const validatedData = validateApiResponse(games, API_RESPONSE_TYPES.SWITCH_GAME_ARRAY);
          
          // Debug logging for switch games data
          console.log('Switch games response data:', responseData);
          console.log('Validated switch games data:', validatedData);
          
          // Filter out games with missing required fields to prevent "Game data is incomplete" warnings
          // For personal switch games, we only require creator and status - participant is optional
          const filteredGames = Array.isArray(validatedData) ? validatedData.filter(game => {
            const hasRequiredFields = game && game.creator && game.status;
            
            if (!hasRequiredFields) {
              console.warn('Filtering out personal switch game with missing required fields:', {
                gameId: game?._id,
                hasCreator: !!game?.creator,
                hasParticipant: !!game?.participant,
                hasStatus: !!game?.status,
                status: game?.status,
                gameData: game
              });
            }
            return hasRequiredFields;
          }) : [];
          
          // Log summary of filtering
          if (validatedData.length !== filteredGames.length) {
            console.warn(`Filtered out ${validatedData.length - filteredGames.length} switch games due to missing required fields. Original: ${validatedData.length}, Filtered: ${filteredGames.length}`);
          }
          
          console.log('Filtered switch games:', filteredGames);
          
          // Extract pagination metadata
          let totalSwitchItems = 0;
          let totalSwitchPages = 1;
          
          if (responseData.pagination) {
            totalSwitchItems = responseData.pagination.total || 0;
            totalSwitchPages = responseData.pagination.pages || 1;
          }
          
          // Fallback to actual games if pagination metadata is missing
          if (totalSwitchItems === 0) {
            totalSwitchItems = filteredGames.length;
          }
          
          // Update pagination state
          setSwitchTotalItems(totalSwitchItems);
          setSwitchTotalPages(totalSwitchPages);
          
          setMySwitchGames(filteredGames);
        }
      } else if (switchData && switchData.status === 'rejected') {
        console.error('Switch games data fetch failed:', switchData.reason);
      }
      
      if (publicData && publicData.status === 'fulfilled') {
        // Extract dares from the response structure
        const responseData = publicData.value?.data;
        if (responseData) {
          const dares = responseData?.dares || responseData || [];
          
          const validatedData = validateApiResponse(dares, API_RESPONSE_TYPES.DARE_ARRAY);

          setPublicDares(Array.isArray(validatedData) ? validatedData : []);
          
          // Extract pagination metadata
          if (responseData.pagination) {
            setPublicDareTotalItems(responseData.pagination.total || 0);
            setPublicDareTotalPages(responseData.pagination.pages || 1);
          }
        }
      }
      
      if (publicSwitchData && publicSwitchData.status === 'fulfilled') {
        const responseData = publicSwitchData.value?.data;
        if (responseData) {
          const games = responseData?.switchGames || responseData || [];
          
          const validatedData = validateApiResponse(games, API_RESPONSE_TYPES.SWITCH_GAME_ARRAY);

          // Filter out games with missing required fields to prevent "Game data is incomplete" warnings
          const filteredPublicSwitchGames = Array.isArray(validatedData) ? validatedData.filter(game => {
            // For public switch games, participant is only required if the game has been joined
            // Games waiting for participants are valid without a participant
            const hasRequiredFields = game && game.creator && game.status;
            const hasParticipantIfNeeded = game.status === 'waiting_for_participant' || game.participant;
            
            if (!hasRequiredFields || !hasParticipantIfNeeded) {
              console.warn('Filtering out public switch game with missing required fields:', {
                gameId: game?._id,
                hasCreator: !!game?.creator,
                hasParticipant: !!game?.participant,
                hasStatus: !!game?.status,
                status: game?.status,
                gameData: game
              });
            }
            return hasRequiredFields && hasParticipantIfNeeded;
          }) : [];
          
          // Log summary of filtering
          if (validatedData.length !== filteredPublicSwitchGames.length) {
            console.warn(`Filtered out ${validatedData.length - filteredPublicSwitchGames.length} public switch games due to missing required fields. Original: ${validatedData.length}, Filtered: ${filteredPublicSwitchGames.length}`);
          }

          console.log('Main fetchData: Setting filtered public switch games:', filteredPublicSwitchGames);
          setPublicSwitchGames(filteredPublicSwitchGames);
          
          // Extract pagination metadata
          if (responseData.pagination) {
            setPublicSwitchTotalItems(responseData.pagination.total || 0);
            setPublicSwitchTotalPages(responseData.pagination.pages || 1);
          }
        }
      }
      

      
      // 2025: Smart error handling with detailed error messages
      const errors = {};
      if (ongoingData && ongoingData.status === 'rejected') {
        errors.ongoing = ongoingData.reason?.message || ERROR_MESSAGES.ONGOING_DARES_LOAD_FAILED;
      }
      if (completedData && completedData.status === 'rejected') {
        errors.completed = completedData.reason?.message || ERROR_MESSAGES.COMPLETED_DARES_LOAD_FAILED;
      }
      if (switchData && switchData.status === 'rejected') {
        errors.switchGames = switchData.reason?.message || ERROR_MESSAGES.SWITCH_GAMES_LOAD_FAILED;
      }
      if (publicData && publicData.status === 'rejected') {
        errors.public = publicData.reason?.message || ERROR_MESSAGES.PUBLIC_DARES_LOAD_FAILED;
      }
      if (publicSwitchData && publicSwitchData.status === 'rejected') {
        errors.publicSwitch = publicSwitchData.reason?.message || ERROR_MESSAGES.PUBLIC_SWITCH_GAMES_LOAD_FAILED;
      }

      
      setErrors(errors);
      
    } catch (err) {
      console.error('Failed to fetch dashboard data from API:', err);
      const errorMessage = handleApiError(err, 'dashboard');
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setDataLoading({
        ongoing: false,
        completed: false,
        switchGames: false,
        public: false,
        publicSwitch: false,
      });
      isFetchingRef.current = false; // Reset the fetching flag
    }
  }, [currentUserId, activePage, completedPage, switchPage, publicDarePage, publicSwitchPage]); // Removed filter dependencies to prevent function recreation
  

  
  // Handle public filter changes
  const handlePublicFilterChange = (filterType, value) => {
    console.log(`Public filter changed: ${filterType} = ${value}`);
    console.log('Previous public filters:', publicFilters);
    
    // Only update if the value actually changed to prevent unnecessary re-renders
    if (publicFilters[filterType] !== value) {
      setPublicFilters(prev => {
        const newFilters = { ...prev, [filterType]: value };
        console.log('New public filters:', newFilters);
        return newFilters;
      });
      
      // Also apply to switch games for unified filtering (except dareType which is dare-specific)
      if (filterType === 'difficulty') {
        console.log('Also updating public switch filters difficulty to:', value);
        setPublicSwitchFilters(prev => {
          const newSwitchFilters = { ...prev, [filterType]: value };
          console.log('New public switch filters:', newSwitchFilters);
          return newSwitchFilters;
        });
      }
    }
  };
  
  const clearPublicFilters = () => {
    console.log('Clearing public filters');
    setPublicFilters({
      difficulty: '',
      dareType: ''
    });
    setPublicSwitchFilters({
      difficulty: ''
    });
  };

  // Fetch public data with current filters - all filtering and pagination handled server-side
  const fetchPublicDataWithFilters = useCallback(async () => {
    if (!currentUserId) return;
    
    // Prevent multiple simultaneous requests
    if (isFetchingRef.current) {
      console.log('Already fetching public data, skipping request');
      return;
    }
    
    console.log('Fetching public data with filters:', { publicFilters, publicSwitchFilters });
    
    try {
      isFetchingRef.current = true;
      setDataLoading(prev => ({ ...prev, public: true, publicSwitch: true }));
      
      // Build server-side filter query parameters for public dares
      const publicDareQueryParams = [];
      if (publicFilters.difficulty) publicDareQueryParams.push(`difficulty=${publicFilters.difficulty}`);
      if (publicFilters.dareType) publicDareQueryParams.push(`dareType=${publicFilters.dareType}`);
      const publicDareQueryString = publicDareQueryParams.length > 0 ? `&${publicDareQueryParams.join('&')}` : '';
      
      // Build server-side filter query parameters for public switch games
      const publicSwitchQueryParams = [];
      if (publicSwitchFilters.difficulty) publicSwitchQueryParams.push(`difficulty=${publicSwitchFilters.difficulty}`);
      const publicSwitchQueryString = publicSwitchQueryParams.length > 0 ? `&${publicSwitchQueryParams.join('&')}` : '';
      
      console.log('Public filters being applied:', { publicFilters, publicSwitchFilters });
      console.log('Server-side query strings:', { publicDareQueryString, publicSwitchQueryString });
      
      // Fetch public data with server-side filtering and pagination
      const [publicData, publicSwitchData] = await Promise.allSettled([
        // Public dares with server-side filters and pagination
        api.get(`/dares?public=true&page=${publicDarePage}&limit=${ITEMS_PER_PAGE}${publicDareQueryString}`),
        // Public switch games with server-side filters and pagination
        api.get(`/switches?public=true&status=waiting_for_participant&page=${publicSwitchPage}&limit=${ITEMS_PER_PAGE}${publicSwitchQueryString}`)
      ]);
      
      // Debug: Log public API calls being made
      console.log('Public API calls made:', {
        publicDares: `/dares?public=true&page=${publicDarePage}&limit=${ITEMS_PER_PAGE}${publicDareQueryString}`,
        publicSwitchGames: `/switches?public=true&status=waiting_for_participant&page=${publicSwitchPage}&limit=${ITEMS_PER_PAGE}${publicSwitchQueryString}`
      });
      
      // Handle public dares response - data already filtered and paginated by server
      if (publicData && publicData.status === 'fulfilled') {
        const responseData = publicData.value?.data;
        if (responseData) {
          const dares = responseData?.dares || responseData || [];
          const validatedData = validateApiResponse(dares, API_RESPONSE_TYPES.DARE_ARRAY);
          setPublicDares(Array.isArray(validatedData) ? validatedData : []);
          
          // Extract server-side pagination metadata
          if (responseData.pagination) {
            setPublicDareTotalItems(responseData.pagination.total || 0);
            setPublicDareTotalPages(responseData.pagination.pages || 1);
          }
        }
      }
      
      // Handle public switch games response - data already filtered and paginated by server
      if (publicSwitchData && publicSwitchData.status === 'fulfilled') {
        const responseData = publicSwitchData.value?.data;
        if (responseData) {
          const games = responseData?.switchGames || responseData || [];
          const validatedData = validateApiResponse(games, API_RESPONSE_TYPES.SWITCH_GAME_ARRAY);
          
          // Only basic validation - no client-side filtering
          const validGames = Array.isArray(validatedData) ? validatedData.filter(game => {
            return game && game.creator && game.status;
          }) : [];
          
          setPublicSwitchGames(validGames);
          
          // Extract server-side pagination metadata
          if (responseData.pagination) {
            setPublicSwitchTotalItems(responseData.pagination.total || 0);
            setPublicSwitchTotalPages(responseData.pagination.pages || 1);
          }
        }
      }
      
      // Handle errors
      const errors = {};
      if (publicData && publicData.status === 'rejected') {
        errors.public = publicData.reason?.message || 'Failed to load public dares';
      }
      if (publicSwitchData && publicSwitchData.status === 'rejected') {
        errors.publicSwitch = publicSwitchData.reason?.message || 'Failed to load public switch games';
      }
      
      if (Object.keys(errors).length > 0) {
        setErrors(prev => ({ ...prev, ...errors }));
      }
      
    } catch (err) {
      console.error('Failed to fetch public data with filters:', err);
      const errorMessage = handleApiError(err, 'public data');
      setError(errorMessage);
    } finally {
      setDataLoading(prev => ({ ...prev, public: false, publicSwitch: false }));
      isFetchingRef.current = false; // Reset the fetching flag
    }
  }, [currentUserId, publicDarePage, publicSwitchPage]); // Removed filter dependencies to prevent function recreation
  
    

    
  // 2025: Smart actions with micro-interactions
  const handleQuickAction = async (action, params = {}) => {
    try {
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([30, 30, 30]);
      }
      
      switch (action) {
        case 'create-dare':
                          navigate('/dom-demand/create');
          break;
        case 'perform-dare':
          navigate('/dare/select');
          break;
        case 'submit-offer':
          navigate('/subs/new');
          break;
        case 'create-switch':
          navigate('/switches/create');
          break;
        case 'join-game':
          navigate('/switches');
          break;
        case 'view-profile':
          navigate(`/profile/${currentUserId}`);
          break;
        default:
          console.warn('Unknown action:', action);
      }
    } catch (err) {
      console.error('Failed to execute quick action:', err);
      showNotification('Action failed. Please try again.', 'error');
    }
  };
  

  
  // Effects
  useEffect(() => {
    let isMounted = true;
    
    if (user && currentUserId) {
      // Validate pagination state first
      validatePaginationState();
      
      fetchData().then(() => {
        // Only update state if component is still mounted
        if (isMounted) {
          console.log('Dashboard data fetched successfully');
        }
      }).catch((error) => {
        if (isMounted) {
          console.error('Failed to fetch dashboard data:', error);
        }
      });
    }
    
    return () => {
      isMounted = false;
    };
  }, [user, currentUserId]); // Removed fetchData from dependencies to prevent loops
  
  // Refetch data when pagination changes
  useEffect(() => {
    if (activePage > 1 || completedPage > 1 || switchPage > 1) {
      const timeoutId = setTimeout(() => {
        if (typeof fetchData === 'function') {
          fetchData();
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [activePage, completedPage, switchPage]); // Removed fetchData from dependencies to prevent loops
  

  
  useEffect(() => {
    // 2025: Auto-refresh on focus
    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        resetPagination();
        fetchData();
      }
    };
    
    // Event listener for visibility change
    document.addEventListener('visibilitychange', handleFocus);
    return () => document.removeEventListener('visibilitychange', handleFocus);
  }, [fetchData]);
  

  
  // Page change handlers for pagination
  const handleActivePageChange = (newPage) => {
    setActivePage(newPage);
  };
  
  const handleCompletedPageChange = (newPage) => {
    setCompletedPage(newPage);
  };
  
  const handleSwitchPageChange = (newPage) => {
    setSwitchPage(newPage);
  };
  
  // Reset pagination when switching tabs or refreshing
  const resetPagination = () => {
    setActivePage(1);
    setCompletedPage(1);
    setSwitchPage(1);
    setPublicDarePage(1);
    setPublicSwitchPage(1);
  };
  
  // Validate pagination state
  const validatePaginationState = () => {
    const issues = [];
    
    if (activePage < 1 || !Number.isInteger(activePage)) {
      issues.push('Active page invalid, resetting to 1');
      setActivePage(1);
    }
    if (completedPage < 1 || !Number.isInteger(completedPage)) {
      issues.push('Completed page invalid, resetting to 1');
      setCompletedPage(1);
    }
    if (switchPage < 1 || !Number.isInteger(switchPage)) {
      issues.push('Switch page invalid, resetting to 1');
      setSwitchPage(1);
    }
    if (publicDarePage < 1 || !Number.isInteger(publicDarePage)) {
      issues.push('Public dare page invalid, resetting to 1');
      setPublicDarePage(1);
    }
    if (publicSwitchPage < 1 || !Number.isInteger(publicSwitchPage)) {
      issues.push('Public switch page invalid, resetting to 1');
      setPublicSwitchPage(1);
    }
    
    if (issues.length > 0) {
      console.warn('Pagination validation issues found:', issues);
    }
  };
  
  // Debug logging for switch games data changes
  useEffect(() => {
    console.log('Switch games data changed:', {
      mySwitchGames: mySwitchGames.length,
      safeMySwitchGames: safeMySwitchGames.length,
      switchTotalItems,
      dataLoading: dataLoading.switchGames
    });
  }, [mySwitchGames, safeMySwitchGames, switchTotalItems, dataLoading.switchGames]);
  
  // Debug logging for active tab changes
  useEffect(() => {
    console.log('Active tab changed to:', activeTab);
    if (activeTab === 'switch-games') {
      console.log('Switch games tab selected. Current state:', {
        mySwitchGames: mySwitchGames.length,
        safeMySwitchGames: safeMySwitchGames.length,
        switchTotalItems,
        dataLoading: dataLoading.switchGames
      });
    }
  }, [activeTab, mySwitchGames, safeMySwitchGames, switchTotalItems, dataLoading.switchGames]);
  
  // Handle tab switching and ensure data is loaded - with loop prevention
  useEffect(() => {
    if (activeTab && !isLoading) {
      // Check if the current tab has data, if not, trigger a refresh
      const needsRefresh = (() => {
        switch (activeTab) {
          case 'dares':
            return (ongoing.length === 0 && completed.length === 0) && 
                   (!dataLoading.ongoing && !dataLoading.completed);
          case 'switch-games':
            // Don't auto-refresh switch games if filters are active (this is expected behavior)
            const hasActiveFilters = switchGameFilters.difficulty || switchGameFilters.status;
            if (hasActiveFilters) {
              console.log('Switch games tab has filters active, not auto-refreshing');
              return false;
            }
            return mySwitchGames.length === 0 && !dataLoading.switchGames;
          case 'public':
            return (safePublicDares.length === 0 && safePublicSwitchGames.length === 0) && 
                   (!dataLoading.public && !dataLoading.publicSwitch);
          default:
            return false;
        }
      })();
      
      if (needsRefresh) {
        console.log(`Tab ${activeTab} has no data, refreshing...`);
        // Set loading state for the specific tab before fetching
        setDataLoading(prev => ({
          ...prev,
          [activeTab === 'ongoing' ? 'ongoing' : 
           activeTab === 'completed' ? 'completed' : 
           activeTab === 'switch-games' ? 'switchGames' : 
           activeTab === 'public' ? 'public' : 
           'ongoing']: true
        }));
        
        // Use a small delay to prevent immediate re-triggering
        const timeoutId = setTimeout(() => {
          if (typeof fetchData === 'function') {
            fetchData();
          }
        }, 100);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [activeTab, isLoading, ongoing.length, completed.length, mySwitchGames.length, 
      safePublicDares.length, safePublicSwitchGames.length, 
      dataLoading.ongoing, dataLoading.completed, dataLoading.switchGames, 
      dataLoading.public, dataLoading.publicSwitch, switchGameFilters.difficulty, switchGameFilters.status]);
  
  // Add a guard to prevent infinite refresh loops
  useEffect(() => {
    if (activeTab === 'switch-games' && mySwitchGames.length === 0 && !dataLoading.switchGames && !isLoading) {
      console.log('Switch games tab has no data and no loading in progress - this is expected with filters');
    }
  }, [activeTab, mySwitchGames.length, dataLoading.switchGames, isLoading]);
  
  // 2025: Smart tabs with modern interactions
  const tabs = [
    {
      key: 'overview',
      label: 'Overview',
      icon: ChartBarIcon,
      content: (
        <div className="space-y-8">
          {/* Smart Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <NeumorphicCard 
              variant="elevated" 
              interactive 
              className="p-6 cursor-pointer"
              onClick={() => setActiveTab('dares')}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-3xl font-bold text-white mb-1">
                    {dataLoading.ongoing ? (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        ...
                      </div>
                    ) : activeTotalItems}
                  </div>
                  <div className="text-sm text-white/70 mb-2">Active Dares</div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400">
                  <ClockIconFilled className="w-6 h-6" />
                </div>
              </div>
            </NeumorphicCard>
            
            <NeumorphicCard 
              variant="elevated" 
              interactive 
              className="p-6 cursor-pointer"
              onClick={() => setActiveTab('dares')}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-3xl font-bold text-white mb-1">
                    {dataLoading.completed ? (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        ...
                      </div>
                    ) : completedTotalItems}
                  </div>
                  <div className="text-sm text-white/70 mb-2">Completed</div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30 text-green-400">
                  <TrophyIconFilled className="w-6 h-6" />
                </div>
              </div>
            </NeumorphicCard>
            
            <NeumorphicCard 
              variant="elevated" 
              interactive 
              className="p-6 cursor-pointer"
              onClick={() => setActiveTab('switch-games')}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-3xl font-bold text-white mb-1">
                    {dataLoading.switchGames ? (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        ...
                      </div>
                    ) : switchTotalItems}
                  </div>
                  <div className="text-sm text-white/70 mb-2">Switch Games</div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400">
                  <FireIconFilled className="w-6 h-6" />
                </div>
              </div>
            </NeumorphicCard>
            
            <NeumorphicCard 
              variant="elevated" 
              interactive 
              className="p-6 cursor-pointer"
              onClick={() => setActiveTab('public')}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-3xl font-bold text-white mb-1">
                    {dataLoading.public ? (
                      <div className="flex items-center gap-2">
                        <LoadingSpinner size="sm" />
                        ...
                      </div>
                    ) : (safePublicDares.length + safePublicSwitchGames.length)}
                  </div>
                  <div className="text-sm text-white/70 mb-2">Available</div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400">
                  <SparklesIconFilled className="w-6 h-6" />
                </div>
              </div>
            </NeumorphicCard>
          </div>
          


          {/* Quick Actions with 2025 Design */}
          <NeumorphicCard variant="glass" className="p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <BoltIcon className="w-6 h-6 text-yellow-400" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <button
                onClick={() => handleQuickAction('create-dare')}
                className="h-20 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <div className="flex flex-col items-center gap-2">
                  <PlusIcon className="w-8 h-8" />
                  <span className="text-sm">Create Dare</span>
                </div>
              </button>
              
              <button
                onClick={() => handleQuickAction('perform-dare')}
                className="h-20 bg-neutral-800/80 backdrop-blur-xl border border-white/20 text-white rounded-xl font-semibold transition-all duration-200 hover:bg-neutral-700/90 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500"
              >
                <div className="flex flex-col items-center gap-2">
                  <PlayIcon className="w-8 h-8" />
                  <span className="text-sm">Perform Dare</span>
                </div>
              </button>
              
              <button
                onClick={() => handleQuickAction('submit-offer')}
                className="h-20 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <div className="flex flex-col items-center gap-2">
                  <DocumentPlusIcon className="w-8 h-8" />
                  <span className="text-sm">Submit Offer</span>
                </div>
              </button>
              
              <button
                onClick={() => handleQuickAction('create-switch')}
                className="h-20 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <div className="flex flex-col items-center gap-2">
                  <PuzzlePieceIcon className="w-8 h-8" />
                  <span className="text-sm">Create Game</span>
                </div>
              </button>
              
              <button
                onClick={() => handleQuickAction('join-game')}
                className="h-20 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <div className="flex flex-col items-center gap-2">
                  <UserGroupIcon className="w-8 h-8" />
                  <span className="text-sm">Join Game</span>
                </div>
              </button>
            </div>
          </NeumorphicCard>
          
          {/* Recent Activity with 2025 Design */}
          <NeumorphicCard variant="glass" className="p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <SparklesIcon className="w-6 h-6 text-purple-400" />
              Recent Activity
            </h3>
            <RecentActivityWidget userId={currentUserId} />
          </NeumorphicCard>

          {/* Debug Controls */}
          <NeumorphicCard variant="glass" className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <CogIcon className="w-6 h-6 text-gray-400" />
              Debug Controls
            </h3>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  console.log('Manual refresh triggered');
                  fetchData();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-semibold"
              >
                Refresh All Data
              </button>
              <button
                onClick={() => {
                  console.log('Manual public refresh triggered');
                  fetchPublicDataWithFilters();
                }}
                className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 text-sm font-semibold"
              >
                Refresh Public Data
              </button>
              <button
                onClick={() => {
                  console.log('Current filter state:', { dareFilters, switchGameFilters, publicFilters, publicSwitchFilters });
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white rounded-lg px-4 py-2 text-sm font-semibold"
              >
                Log Filter State
              </button>
              <button
                onClick={() => {
                  console.log('Testing filter state update');
                  setDareFilters(prev => ({ ...prev, difficulty: 'easy' }));
                }}
                className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg px-4 py-2 text-sm font-semibold"
              >
                Test Filter Update
              </button>
              <button
                onClick={() => {
                  console.log('Testing public filter state update');
                  setPublicFilters(prev => ({ ...prev, difficulty: 'titillating' }));
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg px-4 py-2 text-sm font-semibold"
              >
                Test Public Filter
              </button>
            </div>
          </NeumorphicCard>
        </div>
      )
    },
    {
      key: 'dares',
      label: 'My Dares',
      icon: ClockIcon,
      content: (
        <div className="space-y-6">
          <NeumorphicCard variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <ClockIcon className="w-6 h-6 text-blue-400" />
                My Active Dares ({filteredOngoing.length})
                {dataLoading.ongoing && (
                  <div className="flex items-center gap-2 text-sm text-blue-400">
                    <LoadingSpinner size="sm" />
                    Loading...
                  </div>
                )}
              </h3>
              {/* Debug info */}
              <div className="text-xs text-white/50">
                Filters: {JSON.stringify(dareFilters)}
              </div>
              <div className="flex items-center gap-4">
                <FormSelect
                  label="Difficulty"
                  value={dareFilters.difficulty}
                  onChange={(e) => {
                    console.log('Dare difficulty FormSelect onChange triggered:', e.target.value);
                    handleDareFilterChange('difficulty', e.target.value);
                  }}
                  options={[
                    { value: '', label: 'All Difficulties' },
                    ...DIFFICULTY_OPTIONS.map(diff => ({ value: diff.value, label: diff.label }))
                  ]}
                  className="w-40"
                />
                <FormSelect
                  label="Status"
                  value={dareFilters.status}
                  onChange={(e) => {
                    console.log('Dare status FormSelect onChange triggered:', e.target.value);
                    handleDareFilterChange('status', e.target.value);
                  }}
                  options={[
                    { value: '', label: 'All Statuses' },
                    { value: 'waiting_for_participant', label: 'Waiting for Participant' },
                    { value: 'approved', label: 'Approved' },
                    { value: 'in_progress', label: 'In Progress' }
                  ]}
                  className="w-48"
                />
                
                {/* Manual refresh button for debugging */}
                <button
                  onClick={() => {
                    console.log('Manual refresh triggered for dares');
                    console.log('Current filters:', dareFilters);
                    console.log('Current state:', { ongoing: ongoing.length, completed: completed.length, dataLoading: dataLoading.ongoing });
                    fetchData();
                  }}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-200"
                  disabled={dataLoading.ongoing || dataLoading.completed}
                >
                  <ArrowPathIcon className={`w-4 h-4 ${(dataLoading.ongoing || dataLoading.completed) ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
            
            {/* Show loading state */}
            {dataLoading.ongoing ? (
              <div className="text-center py-12">
                <LoadingSpinner size="lg" />
                <p className="text-white/70 mt-4">Loading active dares...</p>
              </div>
            ) : errors.ongoing ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Failed to Load Active Dares</h4>
                <p className="text-white/70 mb-6">{errors.ongoing}</p>
                <button
                  onClick={fetchData}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg px-4 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Retry
                </button>
              </div>
            ) : filteredOngoing.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClockIcon className="w-8 h-8 text-blue-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">No Active Dares</h4>
                <p className="text-white/70 mb-6">You don't have any active dares matching the selected filters.</p>
                <button
                  onClick={() => {
                    setDareFilters({ difficulty: '', status: '' });
                  }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg px-4 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Clear Filters
                </button>
            </div>
          ) : (
            <div className="space-y-4">
                {filteredOngoing.length > 0 && filteredOngoing.map((dare) => (
                  <DareCard 
                    key={dare._id} 
                    creator={dare.creator}
                    performer={dare.performer}
                    assignedSwitch={dare.assignedSwitch}
                    description={dare.description}
                    difficulty={dare.difficulty}
                    status={dare.status}
                    tags={dare.tags}
                    proof={dare.proof}
                    grades={dare.grades}
                    currentUserId={currentUserId}
                    claimable={dare.claimable}
                    claimToken={dare.claimToken}
                    actions={
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/dare/${dare._id}`)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          <EyeIcon className="w-4 h-4" />
                          View Details
                        </button>
                        {dare.status === 'in_progress' && (
                          <button
                            onClick={() => navigate(`/dare/${dare._id}/participate`)}
                            className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:from-green-600 hover:to-green-700 transition-all duration-200 hover:scale-105 active:scale-95"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                            Submit Proof
                          </button>
                        )}
                      </div>
                    }
                  />
                ))}
                
                {/* Active Dares Pagination */}
                {activeTotalPages > 1 && activeTotalItems > 0 && (
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

          {/* Completed Dares Section */}
          <NeumorphicCard variant="glass" className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <TrophyIcon className="w-6 h-6 text-green-400" />
              Completed Dares ({completedTotalItems})
              {dataLoading.completed && (
                <div className="flex items-center gap-2 text-sm text-blue-400">
                  <LoadingSpinner size="sm" />
                  Loading...
                </div>
              )}
            </h3>
            
            {/* Show loading state */}
            {dataLoading.completed ? (
              <div className="text-center py-12">
                <LoadingSpinner size="lg" />
                <p className="text-white/70 mt-4">Loading completed dares...</p>
              </div>
            ) : errors.completed ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Failed to Load Completed Dares</h4>
                <p className="text-white/70 mb-6">{errors.completed}</p>
                <button
                  onClick={fetchData}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Retry
                </button>
              </div>
            ) : completed.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center gap-2 mx-auto mb-4">
                  <TrophyIcon className="w-8 h-8 text-green-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">No Completed Dares</h4>
                <p className="text-white/70 mb-6">Complete your first dare to see it here!</p>
                <button
                  onClick={() => handleQuickAction('perform-dare')}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Start Performing Dares
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {safeCompleted.length > 0 && safeCompleted.map((dare) => (
                  <DareCard 
                    key={dare._id} 
                    creator={dare.creator}
                    performer={dare.performer}
                    assignedSwitch={dare.assignedSwitch}
                    description={dare.description}
                    difficulty={dare.difficulty}
                    status={dare.status}
                    tags={dare.tags}
                    proof={dare.proof}
                    grades={dare.grades}
                    currentUserId={currentUserId}
                    claimable={dare.claimable}
                    claimToken={dare.claimToken}
                    actions={
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/dare/${dare._id}`)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          <EyeIcon className="w-4 h-4" />
                          View Details
                        </button>
                        {dare.proof && !dare.proof.reviewed && dare.creator?._id === currentUserId && (
                          <button
                            onClick={() => navigate(`/dare/${dare._id}`)}
                            className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:from-green-600 hover:to-green-700 transition-all duration-200 hover:scale-105 active:scale-95"
                          >
                            <StarIcon className="w-4 h-4" />
                            Grade
                          </button>
                        )}
                      </div>
                    }
                  />
                ))}
                
                {/* Completed Dares Pagination */}
                {completedTotalPages > 1 && completedTotalItems > 0 && (
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
        </div>
      )
    },
    {
      key: 'switch-games',
      label: 'My Switch Games',
      icon: FireIcon,
      content: (
        <div className="space-y-6">
          <NeumorphicCard variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <FireIcon className="w-6 h-6 text-purple-400" />
                  My Switch Games ({filteredMySwitchGames.length})
                {dataLoading.switchGames && (
                  <div className="flex items-center gap-2 text-sm text-blue-400">
                    <LoadingSpinner size="sm" />
                    Loading...
                  </div>
                )}
              </h3>
              {/* Debug info */}
              <div className="text-xs text-white/50">
                Filters: {JSON.stringify(switchGameFilters)}
              </div>
              <div className="flex items-center gap-4">
                <FormSelect
                  label="Difficulty"
                  value={switchGameFilters.difficulty}
                  onChange={(e) => {
                    console.log('Switch game difficulty FormSelect onChange triggered:', e.target.value);
                    handleSwitchGameFilterChange('difficulty', e.target.value);
                  }}
                  options={[
                    { value: '', label: 'All Difficulties' },
                    ...DIFFICULTY_OPTIONS.map(diff => ({ value: diff.value, label: diff.label }))
                  ]}
                  className="w-40"
                />
                <FormSelect
                  label="Status"
                  value={switchGameFilters.status}
                  onChange={(e) => {
                    console.log('Switch game status FormSelect onChange triggered:', e.target.value);
                    handleSwitchGameFilterChange('status', e.target.value);
                  }}
                  options={[
                    { value: '', label: 'All Statuses' },
                    { value: 'waiting_for_participant', label: 'Waiting for Participant' },
                    { value: 'in_progress', label: 'In Progress' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'awaiting_proof', label: 'Awaiting Proof' },
                    { value: 'proof_submitted', label: 'Proof Submitted' },
                    { value: 'chickened_out', label: 'Chickened Out' }
                  ]}
                  className="w-48"
                />
                
                {/* Manual refresh button for debugging */}
                <button
                  onClick={() => {
                    console.log('Manual refresh triggered for switch games');
                    console.log('Current filters:', switchGameFilters);
                    console.log('Current state:', { mySwitchGames: mySwitchGames.length, dataLoading: dataLoading.switchGames });
                    fetchData();
                  }}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-200"
                  disabled={dataLoading.switchGames}
                >
                  <ArrowPathIcon className={`w-4 h-4 ${dataLoading.switchGames ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
            
            {/* Show info about filtered games if any were removed due to incomplete data */}
            {mySwitchGames.length !== safeMySwitchGames.length && (
              <div className="mb-4 p-3 bg-amber-900/20 border border-amber-700/50 rounded text-sm">
                <div className="text-amber-400">
                  <strong>Note:</strong> Some games were filtered out due to incomplete data. This is usually a temporary issue.
                </div>
                <div className="text-amber-300 text-xs mt-1">
                  Showing {safeMySwitchGames.length} of {mySwitchGames.length} games. Try refreshing the page.
                </div>
              </div>
            )}
            
            {/* Show loading state */}
            {dataLoading.switchGames ? (
              <div className="text-center py-12">
                <LoadingSpinner size="lg" />
                <p className="text-white/70 mt-4">Loading switch games...</p>
              </div>
            ) : errors.switchGames ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Failed to Load Switch Games</h4>
                <p className="text-white/70 mb-6">{errors.switchGames}</p>
                <button
                  onClick={fetchData}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg px-4 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Retry
                </button>
              </div>
            ) : filteredMySwitchGames.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FireIcon className="w-8 h-8 text-purple-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">No Switch Games</h4>
                <p className="text-white/70 mb-6">No switch games match the selected filters.</p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => {
                      setSwitchGameFilters({ difficulty: '', status: '' });
                    }}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg px-4 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => setActiveTab('public')}
                    className="bg-neutral-800/80 backdrop-blur-xl border border-white/20 text-white rounded-lg px-4 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:bg-neutral-700/90 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500"
                  >
                    Find Games
                  </button>
                </div>
              </div>
            ) : (
            <div className="space-y-4">
                {filteredMySwitchGames.length > 0 && filteredMySwitchGames.map((game) => (
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
                        fetchData();
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
                      </div>
                    }
                  />
                ))}
              
              {/* Switch Games Pagination */}
              {switchTotalPages > 1 && switchTotalItems > 0 && (
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

          {/* Completed Switch Games Section */}
          <NeumorphicCard variant="glass" className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <TrophyIcon className="w-6 h-6 text-green-400" />
              Completed Switch Games ({switchTotalItems})
              {dataLoading.switchGames && (
                <div className="flex items-center gap-2 text-sm text-blue-400">
                  <LoadingSpinner size="sm" />
                  Loading...
                </div>
              )}
            </h3>
            
            {/* Show loading state */}
            {dataLoading.switchGames ? (
              <div className="text-center py-12">
                <LoadingSpinner size="lg" />
                <p className="text-white/70 mt-4">Loading completed switch games...</p>
              </div>
            ) : errors.switchGames ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Failed to Load Completed Switch Games</h4>
                <p className="text-white/70 mb-6">{errors.switchGames}</p>
                <button
                  onClick={fetchData}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg px-4 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Retry
                </button>
              </div>
            ) : safeMySwitchGames.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center gap-2 mx-auto mb-4">
                  <TrophyIcon className="w-8 h-8 text-green-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">No Completed Switch Games</h4>
                <p className="text-white/70 mb-6">Complete your first switch game to see it here!</p>
                <button
                  onClick={() => setActiveTab('public')}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg px-4 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Find Games to Join
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {safeMySwitchGames.length > 0 && safeMySwitchGames.map((game) => (
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
                        fetchData();
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
                      </div>
                    }
                  />
                ))}
                
                {/* Completed Switch Games Pagination */}
                {switchTotalPages > 1 && switchTotalItems > 0 && (
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
        </div>
      )
    },
    {
      key: 'public',
      label: 'Public',
      icon: SparklesIcon,
      content: (
        <div className="space-y-6">          
          {/* Public Dares Section */}
          <NeumorphicCard variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <SparklesIcon className="w-6 h-6 text-orange-400" />
                Public Dares ({publicDareTotalItems})
                {(dataLoading.public || dataLoading.publicSwitch) && (
                  <div className="flex items-center gap-2 text-sm text-blue-400">
                    <LoadingSpinner size="sm" />
                    Applying filters...
                  </div>
                )}
              </h3>
              
              {/* Claim system info */}
              <div className="text-xs text-white/60 max-w-xs">
                💡 <strong>Consent First:</strong> Both buttons lead through the consent and claim process for safety
              </div>
              {/* Debug info */}
              <div className="text-xs text-white/50">
                Filters: {JSON.stringify(publicFilters)}
              </div>
              <div className="flex items-center gap-4">
                {/* Difficulty Filter */}
                <FormSelect
                  label="Difficulty"
                  value={publicFilters.difficulty}
                  onChange={(e) => {
                    console.log('Public difficulty FormSelect onChange triggered:', e.target.value);
                    handlePublicFilterChange('difficulty', e.target.value);
                  }}
                  options={[
                    { value: '', label: 'All Difficulties' },
                    ...DIFFICULTY_OPTIONS.map(diff => ({ value: diff.value, label: diff.label }))
                  ]}
                  className="w-40"
                />
                
                {/* Dare Type Filter */}
                <FormSelect
                  label="Dare Type"
                  value={publicFilters.dareType}
                  onChange={(e) => {
                    console.log('Public dare type FormSelect onChange triggered:', e.target.value);
                    handlePublicFilterChange('dareType', e.target.value);
                  }}
                  options={[
                    { value: '', label: 'All Types' },
                    { value: 'submission', label: 'Submission' },
                    { value: 'domination', label: 'Domination' },
                    { value: 'switch', label: 'Switch' }
                  ]}
                  className="w-40"
                />
              </div>
            </div>
            {dataLoading.public ? (
              <div className="text-center py-8">
                <LoadingSpinner size="lg" />
                <p className="text-white/70 mt-4">Loading public dares...</p>
              </div>
            ) : publicDares.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <SparklesIcon className="w-6 h-6 text-orange-400" />
                </div>
                <h4 className="text-md font-semibold text-white mb-2">No Public Dares</h4>
                <p className="text-white/70 mb-4 text-sm">No public dares are available at the moment.</p>
                <button
                  onClick={() => handleQuickAction('create-dare')}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create a Dare
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {safePublicDares.length > 0 && safePublicDares.map((dare) => {
                  // Debug logging for claim tokens
                  console.log(`Dare ${dare._id} claim info:`, {
                    hasClaimToken: !!dare.claimToken,
                    claimToken: dare.claimToken,
                    claimable: dare.claimable,
                    status: dare.status,
                    isPublic: dare.status === 'waiting_for_participant' || !dare.performer
                  });
                  
                  // Ensure public dares always go through consent flow
                  if (!dare.claimToken && (dare.status === 'waiting_for_participant' || !dare.performer)) {
                    console.warn(`Public dare ${dare._id} is missing claim token - this may cause issues`);
                  }
                  
                  return (
                    <DareCard 
                      key={dare._id} 
                      creator={dare.creator}
                      performer={dare.performer}
                      assignedSwitch={dare.assignedSwitch}
                      description={dare.description}
                      difficulty={dare.difficulty}
                      status={dare.status}
                      tags={dare.tags}
                      proof={dare.proof}
                      grades={dare.grades}
                      currentUserId={currentUserId}
                      claimable={dare.claimable}
                      claimToken={dare.claimToken}
                      actions={
                        <div className="flex gap-2">
                                                  <button
                          onClick={() => {
                            if (dare.claimToken) {
                              navigate(`/claim/${dare.claimToken}`);
                            } else {
                              // If no claim token, this might be an error - log it
                              console.warn('Public dare missing claim token:', dare._id);
                              // Still try to use claim URL with dare ID as fallback
                              navigate(`/claim/${dare._id}`);
                            }
                          }}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-105 active:scale-95"
                          title="Start the consent and claim process to perform this dare"
                        >
                          <PlayIcon className="w-4 h-4" />
                          Claim & Perform
                        </button>
                                                  <button
                          onClick={() => {
                            if (dare.claimToken) {
                              // Always use claim URL for public dares to ensure consent flow
                              navigate(`/claim/${dare.claimToken}`);
                            } else {
                              // If no claim token, this might be an error - log it
                              console.warn('Public dare missing claim token:', dare._id);
                              // Still try to use claim URL with dare ID as fallback
                              navigate(`/claim/${dare._id}`);
                            }
                          }}
                          className="bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:from-gray-600 hover:to-gray-700 transition-all duration-200 hover:scale-105 active:scale-95"
                          title="View dare details through consent and claim process"
                        >
                          <EyeIcon className="w-4 h-4" />
                          View Details
                        </button>
                        </div>
                      }
                    />
                  );
                })}
                
                {/* Show message if no dares */}
                {safePublicDares.length === 0 && !dataLoading.public && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <SparklesIcon className="w-6 h-6 text-orange-400" />
                    </div>
                    <h4 className="text-md font-semibold text-white mb-2">No Public Dares Found</h4>
                    <p className="text-white/70 mb-4 text-sm">Try adjusting your filters or search terms.</p>
                  </div>
                )}
                
                {/* Public Dares Pagination */}
                {publicDareTotalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={publicDarePage}
                      totalPages={publicDareTotalPages}
                      onPageChange={setPublicDarePage}
                      totalItems={publicDareTotalItems}
                      itemsPerPage={ITEMS_PER_PAGE}
                    />
                  </div>
                )}
              </div>
            )}
          </NeumorphicCard>

          {/* Public Switch Games Section */}
          <NeumorphicCard variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <FireIcon className="w-6 h-6 text-purple-400" />
                Public Switch Games ({publicSwitchTotalItems})
                {(dataLoading.public || dataLoading.publicSwitch) && (
                  <div className="flex items-center gap-2 text-sm text-blue-400">
                    <LoadingSpinner size="sm" />
                    Applying filters...
                  </div>
                )}
              </h3>
              {/* Debug info */}
              <div className="text-xs text-white/50">
                Filters: {JSON.stringify(publicSwitchFilters)}
              </div>
              <div className="flex items-center gap-4">
                {/* Difficulty Filter */}
                <FormSelect
                  label="Difficulty"
                  value={publicSwitchFilters.difficulty}
                  onChange={(e) => {
                    console.log('Public switch difficulty FormSelect onChange triggered:', e.target.value);
                    handlePublicFilterChange('difficulty', e.target.value);
                  }}
                  options={[
                    { value: '', label: 'All Difficulties' },
                    ...DIFFICULTY_OPTIONS.map(diff => ({ value: diff.value, label: diff.label }))
                  ]}
                  className="w-40"
                />
                
                <button
                  onClick={fetchPublicDataWithFilters}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2"
                  disabled={dataLoading.public || dataLoading.publicSwitch}
                >
                  <ArrowPathIcon className={`w-4 h-4 ${(dataLoading.public || dataLoading.publicSwitch) ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={clearPublicFilters}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200"
                  disabled={dataLoading.public || dataLoading.publicSwitch}
                >
                  Clear All Filters
                </button>
              </div>
            </div>
            
            {/* Show info about filtered games if any were removed due to incomplete data */}
            {publicSwitchGames.length !== safePublicSwitchGames.length && (
              <div className="mb-4 p-3 bg-amber-900/20 border border-amber-700/50 rounded text-sm">
                <div className="text-amber-400">
                  <strong>Note:</strong> Some public switch games were filtered out due to incomplete data. This is usually a temporary issue.
                </div>
                <div className="text-amber-300 text-xs mt-1">
                  Showing {safePublicSwitchGames.length} of {publicSwitchGames.length} games. Try refreshing the page.
                </div>
              </div>
            )}
            {dataLoading.publicSwitch ? (
              <div className="text-center py-8">
                <LoadingSpinner size="lg" />
                <p className="text-white/70 mt-4">Loading public switch games...</p>
              </div>
            ) : safePublicSwitchGames.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FireIcon className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="text-md font-semibold text-white mb-2">No Public Switch Games</h4>
                <p className="text-white/70 mb-4 text-sm">No public switch games are available at the moment.</p>
                <button
                  onClick={() => handleQuickAction('create-switch')}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create a Game
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {safePublicSwitchGames.length > 0 && safePublicSwitchGames.map((game) => (
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
                        fetchPublicDataWithFilters();
                      } catch (error) {
                        const errorMessage = error.response?.data?.error || 'Failed to submit proof.';
                        showError(errorMessage);
                        throw error; // Re-throw so the component can handle it
                      }
                    }}
                    actions={
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/switches/claim/${game._id}`)}
                          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:from-purple-600 hover:to-purple-700 transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          <UserGroupIcon className="w-4 h-4" />
                          Join Game
                        </button>
                        <button
                          onClick={() => navigate(`/switches/${game._id}`)}
                          className="bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:from-gray-600 hover:to-gray-700 transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          <EyeIcon className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    }
                  />
                ))}
                
                {/* Show message if no switch games */}
                {safePublicSwitchGames.length === 0 && !dataLoading.publicSwitch && (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FireIcon className="w-6 h-6 text-purple-400" />
                    </div>
                    <h4 className="text-md font-semibold text-white mb-2">No Public Switch Games Found</h4>
                    <p className="text-white/70 mb-4 text-sm">Try adjusting your filters or search terms.</p>
                  </div>
                )}
                
                {/* Public Switch Games Pagination */}
                {publicSwitchTotalPages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={publicSwitchPage}
                      totalPages={publicSwitchTotalPages}
                      onPageChange={setPublicSwitchPage}
                      totalItems={publicSwitchTotalItems}
                      itemsPerPage={ITEMS_PER_PAGE}
                    />
                  </div>
                )}
              </div>
            )}
          </NeumorphicCard>
        </div>
      )
    }
  ];

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <NeumorphicCard variant="glass" className="p-8">
              <h2 className="text-2xl font-bold text-red-400 mb-4">Authentication Required</h2>
              <p className="text-red-300 mb-6">
                Please log in to access the performer dashboard.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-lg px-6 py-3 text-base font-semibold shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Go to Login
              </button>
            </NeumorphicCard>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <LoadingSpinner size="lg" color="primary" />
            <h2 className="text-2xl font-bold text-white mt-4">Loading Dashboard</h2>
            <p className="text-white/70">Please wait while we load your data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <ContentContainer>
        <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-purple-600 text-white px-4 py-2 rounded z-50">
          Skip to main content
        </a>
        
        <MainContent className="max-w-6xl mx-auto px-4 py-8">
          {/* 2025 Header Design */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 rounded-2xl bg-neutral-800/80 backdrop-blur-xl border border-white/20 mr-6">
                <UserIcon className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white">Performer Dashboard</h1>
            </div>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-6">
              Manage your dares and track your progress with intelligent insights
            </p>

          </div>

          {/* 2025 Error Display */}
          {error && (
            <NeumorphicCard variant="pressed" className="mb-8 p-6 border-red-500/30">
              <div className="flex items-center justify-center gap-3 text-red-300" role="alert" aria-live="assertive">
                <ExclamationTriangleIcon className="w-6 h-6" />
                <span className="font-semibold">{error}</span>
            </div>
            </NeumorphicCard>
          )}
          
          {/* 2025 Individual Section Errors */}
          {Object.entries(errors).map(([section, errorMsg]) => errorMsg && (
            <NeumorphicCard key={section} variant="pressed" className="mb-6 p-4 border-orange-500/30" role="alert" aria-live="polite">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-orange-300">
                  <ExclamationTriangleIcon className="w-5 h-5" />
                  <span className="capitalize font-medium">{section}: {errorMsg}</span>
                </div>
                <button
                  onClick={fetchData}
                  className="bg-neutral-800/80 backdrop-blur-xl border border-white/20 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:bg-neutral-700/90 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Retry
                </button>
              </div>
            </NeumorphicCard>
          ))}
          
          {/* 2025 Smart Tabs */}
          <ErrorBoundary>
            <Tabs
              tabs={tabs}
              value={tabs.findIndex(t => t.key === activeTab)}
              onChange={idx => setActiveTab(tabs[idx].key)}
              className="mb-8"
            />
          </ErrorBoundary>
          
          {/* Show loading state for overview tab */}
          {activeTab === 'overview' && isLoading && (
            <NeumorphicCard variant="glass" className="p-6 text-center">
              <LoadingSpinner size="lg" />
              <p className="text-white/70 mt-4">Loading dashboard data...</p>
            </NeumorphicCard>
          )}

          {/* 2025 Empty State - Show when all sections are empty */}
          {!isLoading && 
           safeOngoing.length === 0 && 
           safeCompleted.length === 0 && 
           safeMySwitchGames.length === 0 && 
           safePublicDares.length === 0 && 
           safePublicSwitchGames.length === 0 && (
            <NeumorphicCard variant="glass" className="p-12 text-center">
              <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <SparklesIcon className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Welcome to Your Dashboard!</h3>
              <p className="text-white/70 mb-8 max-w-md mx-auto">
                It looks like you're just getting started. Create your first dare or join a switch game to begin your journey!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => handleQuickAction('create-dare')}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg px-6 py-3 text-base font-semibold shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PlusIcon className="w-6 h-6" />
                  Create Your First Dare
                </button>
                <button
                  onClick={() => handleQuickAction('create-switch')}
                  className="bg-neutral-800/80 backdrop-blur-xl border border-white/20 text-white rounded-lg px-6 py-3 text-base font-semibold shadow-lg flex items-center gap-2 hover:bg-neutral-700/90 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500"
                >
                  <PuzzlePieceIcon className="w-6 h-6" />
                  Create a Switch Game
                </button>
              </div>
            </NeumorphicCard>
          )}

          {/* 2025 Smart Notifications */}
          {notification && (
            <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl text-white backdrop-blur-xl ${
              notification.type === 'error' ? 'bg-red-600/90 border border-red-500/50' : 
              notification.type === 'success' ? 'bg-green-600/90 border border-green-500/50' : 
              'bg-blue-600/90 border border-blue-500/50'
            }`} role="alert" aria-live="assertive" aria-atomic="true">
              <div className="flex items-center gap-3">
                {notification.type === 'error' && <ExclamationTriangleIcon className="w-5 h-5" />}
                {notification.type === 'success' && <CheckCircleIcon className="w-5 h-5" />}
                <span className="font-medium">{notification.message}</span>
              </div>
            </div>
          )}
        </MainContent>
      </ContentContainer>
    </div>
  );
}

// Utility function for debouncing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
