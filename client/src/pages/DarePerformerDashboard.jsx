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
import Search from '../components/Search';

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

// Micro-Interaction Button with Haptic Feedback
const MicroInteractionButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  className = '',
  disabled = false,
  loading = false
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const timeoutRef = useRef(null);
  
  const handlePress = async (e) => {
    if (disabled || loading) return;
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 30, 30]);
    }
    
    // Visual feedback
    setIsPressed(true);
    setFeedback('success');
    
    // Execute action
    if (onClick) {
      await onClick(e);
    }
    
    // Memory-safe timeout for button reset
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsPressed(false);
      setFeedback(null);
    }, 300);
  };
  
  const baseClasses = `
    relative overflow-hidden
    font-semibold
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm rounded-xl',
    md: 'px-6 py-3 text-base rounded-xl',
    lg: 'px-8 py-4 text-lg rounded-2xl'
  };
  
  const variantClasses = {
    primary: `
      bg-gradient-to-r from-indigo-500 to-purple-600
      hover:from-indigo-600 hover:to-purple-700
      text-white
      shadow-lg hover:shadow-xl
    `,
    secondary: `
      bg-neutral-800/80 backdrop-blur-xl
      border border-white/20
      text-white
      hover:bg-neutral-700/90
    `,
    success: `
      bg-gradient-to-r from-green-500 to-emerald-600
      hover:from-green-600 hover:to-emerald-700
      text-white
      shadow-lg hover:shadow-xl
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-pink-600
      hover:from-red-600 hover:to-pink-700
      text-white
      shadow-lg hover:shadow-xl
    `,
    warning: `
      bg-gradient-to-r from-yellow-500 to-amber-600
      hover:from-yellow-600 hover:to-amber-700
      text-white
      shadow-lg hover:shadow-xl
    `
  };
  
  const pressedClasses = isPressed ? 'scale-95 shadow-inner' : '';
  const feedbackClasses = feedback ? 'animate-pulse' : '';
  
  return (
    <button
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${pressedClasses}
        ${feedbackClasses}
        ${className}
      `}
      onClick={handlePress}
      disabled={disabled || loading}
      aria-label={typeof children === 'string' ? children : undefined}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

// Smart Stats Card with Micro-interactions
const SmartStatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'blue', 
  loading = false,
  trend = null,
  onClick = null 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30 text-red-400'
  };
  
  return (
    <NeumorphicCard 
      variant="elevated" 
      interactive={!!onClick}
      className={`p-6 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {loading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-8 bg-neutral-700/60 rounded" />
              <div className="h-4 bg-neutral-700/60 rounded w-3/4" />
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold mb-1">{value}</div>
              <div className="text-sm text-white/70 mb-2">{title}</div>
              {trend !== null && trend !== undefined && (
                <div className={`text-xs flex items-center gap-1 ${
                  trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-white/60'
                }`}>
                  {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'} {Math.abs(trend)}%
                </div>
              )}
            </>
          )}
        </div>
        <div className={`
          p-3 rounded-xl
          bg-gradient-to-br ${colorClasses[color]}
          transition-transform duration-200
          ${isHovered ? 'scale-110' : 'scale-100'}
        `}>
          <Icon className="w-6 h-6" aria-hidden="true" />
        </div>
      </div>
    </NeumorphicCard>
  );
};

// Gesture-Aware Container
const GestureContainer = ({ children, onSwipe, onPinch, className = '' }) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  const minSwipeDistance = 50;
  
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };
  
  const onTouchMove = (e) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };
  
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
    
    if (isHorizontalSwipe && Math.abs(distanceX) > minSwipeDistance) {
      if (distanceX > 0) {
        onSwipe?.('left');
      } else {
        onSwipe?.('right');
      }
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };
  
  return (
    <div
      className={`touch-pan-y ${className}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {children}
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
  
  // Debug: Log user and currentUserId
  console.log('User object:', user);
  console.log('Current user ID:', currentUserId);
  
  // State management with 2025 patterns
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [dataLoading, setDataLoading] = useState({
    ongoing: true,
    completed: true,
    switchGames: true,
    public: true,
    associates: true
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
  
  // 2025: Gesture and interaction state
  const [gestureMode, setGestureMode] = useState(false);
  const [lastGesture, setLastGesture] = useState(null);
  
  // Data state
  const [ongoing, setOngoing] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [mySwitchGames, setMySwitchGames] = useState([]);
  const [publicDares, setPublicDares] = useState([]);
  const [publicSwitchGames, setPublicSwitchGames] = useState([]);
  const [associates, setAssociates] = useState([]);
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
  
  const ITEMS_PER_PAGE = 8;
  

  
  // 2025: Smart notifications
  const notificationTimeoutRef = useRef(null);
  
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
  

  
  // 2025: Enhanced data fetching with smart loading
  const fetchData = useCallback(async () => {
    if (!currentUserId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Debug: Log the current user ID and API calls
      console.log('Fetching data for user:', currentUserId);
      console.log('API calls:', [
        `Active dares - Creator: /dares?creator=${currentUserId}&status=in_progress,pending,consented,approved,waiting_for_participant,soliciting`,
        `Active dares - Participant: /dares?participant=${currentUserId}&status=in_progress,pending,consented,approved,waiting_for_participant,soliciting`,
        `Completed dares - Creator: /dares?creator=${currentUserId}&status=completed,graded,forfeited,rejected,expired,cancelled`,
        `Completed dares - Participant: /dares?participant=${currentUserId}&status=completed,graded,forfeited,rejected,expired,cancelled`,
        '/switches/performer',
        '/dares?public=true&limit=10',
        '/switches?public=true&status=waiting_for_participant',
        '/users/associates'
      ]);
      
                              // Get total counts first for proper pagination
            const [activeCounts, completedCounts, switchCounts] = await Promise.allSettled([
              // Get total counts for active dares (both as creator and participant)
              Promise.all([
                api.get(`/dares?creator=${currentUserId}&status=in_progress,pending,consented,approved,waiting_for_participant,soliciting&limit=1`),
                api.get(`/dares?participant=${currentUserId}&status=in_progress,pending,consented,approved,waiting_for_participant,soliciting&limit=1`)
              ]),
              // Get total counts for completed dares (both as creator and participant)
              Promise.all([
                api.get(`/dares?creator=${currentUserId}&status=completed,graded,forfeited,rejected,expired,cancelled&limit=1`),
                api.get(`/dares?participant=${currentUserId}&status=completed,graded,forfeited,rejected,expired,cancelled&limit=1`)
              ]),
              // Get total count for switch games using the performer endpoint
              api.get(`/switches/performer?limit=1`)
            ]);

            // Parallel data fetching for better performance with server-side pagination
            const [ongoingData, completedData, switchData, publicData, publicSwitchData, associatesData] = await Promise.allSettled([
              // Active dares: both as creator and participant with pagination
              Promise.all([
                api.get(`/dares?creator=${currentUserId}&status=in_progress,pending,consented,approved,waiting_for_participant,soliciting&page=${activePage}&limit=${ITEMS_PER_PAGE}`),
                api.get(`/dares?participant=${currentUserId}&status=in_progress,pending,consented,approved,waiting_for_participant,soliciting&page=${activePage}&limit=${ITEMS_PER_PAGE}`)
              ]),
              // Completed dares: both as creator and participant with pagination
              Promise.all([
                api.get(`/dares?creator=${currentUserId}&status=completed,graded,forfeited,rejected,expired,cancelled&page=${completedPage}&limit=${ITEMS_PER_PAGE}`),
                api.get(`/dares?participant=${currentUserId}&status=completed,graded,forfeited,rejected,expired,cancelled&page=${completedPage}&limit=${ITEMS_PER_PAGE}`)
              ]),
              // Switch games: using performer endpoint with pagination
              api.get(`/switches/performer?page=${switchPage}&limit=${ITEMS_PER_PAGE}`),
              api.get('/dares?public=true&limit=10'),
              api.get('/switches?public=true&status=waiting_for_participant'),
              api.get('/users/associates')
            ]);
      
                  // Handle successful responses
            if (ongoingData.status === 'fulfilled') {
              // Merge dares from both creator and participant responses
              const allActiveDares = [];
              let creatorTotal = 0;
              let participantTotal = 0;
              
              ongoingData.value.forEach((response, index) => {
                if (response.status === 200) {
                  const responseData = response.data;
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
              });
              
              // Remove duplicates by _id
              const uniqueActiveDares = allActiveDares.filter((dare, index, self) => 
                index === self.findIndex(d => d._id === dare._id)
              );
              
              // Calculate total items from the count API calls
              let totalActiveItems = 0;
              if (activeCounts.status === 'fulfilled') {
                activeCounts.value.forEach((response, index) => {
                  if (response.status === 200 && response.data.pagination) {
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
              
              // Fallback to actual unique dares if count API fails
              if (totalActiveItems === 0) {
                totalActiveItems = uniqueActiveDares.length;
              }
              
              // Calculate total pages based on total items
              const totalActivePages = Math.max(1, Math.ceil(totalActiveItems / ITEMS_PER_PAGE));
              
              // Update pagination state
              setActiveTotalItems(totalActiveItems);
              setActiveTotalPages(totalActivePages);
              
              // Debug: Log the data structure
              console.log('Ongoing dares data:', {
                allActiveDares,
                uniqueActiveDares,
                count: uniqueActiveDares.length,
                activeCounts: activeCounts.status === 'fulfilled' ? activeCounts.value.map(r => r.data.pagination) : 'failed',
                totalItems: totalActiveItems,
                totalPages: totalActivePages,
                firstDare: uniqueActiveDares?.[0],
                creator: uniqueActiveDares?.[0]?.creator
              });
              
              setOngoing(uniqueActiveDares);
            }
      
      if (completedData.status === 'fulfilled') {
        // Merge dares from both creator and participant responses
        const allCompletedDares = [];
        let creatorTotal = 0;
        let participantTotal = 0;
        
        completedData.value.forEach((response, index) => {
          if (response.status === 200) {
            const responseData = response.data;
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
        });
        
        // Remove duplicates by _id
        const uniqueCompletedDares = allCompletedDares.filter((dare, index, self) => 
          index === self.findIndex(d => d._id === dare._id)
        );
        
        // Calculate total items from the count API calls
        let totalCompletedItems = 0;
        if (completedCounts.status === 'fulfilled') {
          completedCounts.value.forEach((response, index) => {
            if (response.status === 200 && response.data.pagination) {
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
        
        // Fallback to actual unique dares if count API fails
        if (totalCompletedItems === 0) {
          totalCompletedItems = uniqueCompletedDares.length;
        }
        
        // Calculate total pages based on total items
        const totalCompletedPages = Math.max(1, Math.ceil(totalCompletedItems / ITEMS_PER_PAGE));
        
        // Update pagination state
        setCompletedTotalItems(totalCompletedItems);
        setCompletedTotalPages(totalCompletedPages);

        // Debug: Log the completed dares data structure
        console.log('Completed dares data:', {
          allCompletedDares,
          uniqueCompletedDares,
          count: uniqueCompletedDares.length,
          completedCounts: completedCounts.status === 'fulfilled' ? completedCounts.value.map(r => r.data.pagination) : 'failed',
          totalItems: totalCompletedItems,
          totalPages: totalCompletedPages
        });

        setCompleted(uniqueCompletedDares);
      }
      
      if (switchData.status === 'fulfilled') {
        // Handle switch games response with pagination
        const responseData = switchData.value.data;
        const games = responseData.games || responseData;
        const validatedData = validateApiResponse(games, API_RESPONSE_TYPES.SWITCH_GAME_ARRAY);
        
        // Extract pagination metadata
        let totalSwitchItems = 0;
        let totalSwitchPages = 1;
        
        if (responseData.pagination) {
          totalSwitchItems = responseData.pagination.total || 0;
          totalSwitchPages = responseData.pagination.pages || 1;
        }
        
        // Fallback to actual games if pagination metadata is missing
        if (totalSwitchItems === 0) {
          totalSwitchItems = Array.isArray(validatedData) ? validatedData.length : 0;
        }
        
        // Update pagination state
        setSwitchTotalItems(totalSwitchItems);
        setSwitchTotalPages(totalSwitchPages);
        
        // Debug: Log the switch games data structure
        console.log('Switch games data:', {
          games: validatedData,
          count: Array.isArray(validatedData) ? validatedData.length : 0,
          switchCounts: switchCounts.status === 'fulfilled' ? switchCounts.value.data.pagination : 'failed',
          totalItems: totalSwitchItems,
          totalPages: totalSwitchPages
        });

        setMySwitchGames(Array.isArray(validatedData) ? validatedData : []);
      }
      
      if (publicData.status === 'fulfilled') {
        // Extract dares from the response structure
        const responseData = publicData.value.data;
        const dares = responseData.dares || responseData;
        
        const validatedData = validateApiResponse(dares, API_RESPONSE_TYPES.DARE_ARRAY);

        setPublicDares(Array.isArray(validatedData) ? validatedData : []);
      }
      
      if (publicSwitchData.status === 'fulfilled') {
        const validatedData = validateApiResponse(publicSwitchData.value.data, API_RESPONSE_TYPES.SWITCH_GAME_ARRAY);

        setPublicSwitchGames(Array.isArray(validatedData) ? validatedData : []);
      }
      
      if (associatesData.status === 'fulfilled') {

        const validatedData = validateApiResponse(associatesData.value.data, API_RESPONSE_TYPES.USER_ARRAY);

        setAssociates(Array.isArray(validatedData) ? validatedData : []);
      }
      
        // 2025: Smart error handling with detailed error messages
  const errors = {};
  if (ongoingData.status === 'rejected') {
    errors.ongoing = ongoingData.reason?.message || ERROR_MESSAGES.ONGOING_DARES_LOAD_FAILED;
  }
  if (completedData.status === 'rejected') {
    errors.completed = completedData.reason?.message || ERROR_MESSAGES.COMPLETED_DARES_LOAD_FAILED;
  }
  if (switchData.status === 'rejected') {
    errors.switchGames = switchData.reason?.message || ERROR_MESSAGES.SWITCH_GAMES_LOAD_FAILED;
  }
  if (publicData.status === 'rejected') {
    errors.public = publicData.reason?.message || ERROR_MESSAGES.PUBLIC_DARES_LOAD_FAILED;
  }
  if (publicSwitchData.status === 'rejected') {
    errors.publicSwitch = publicSwitchData.reason?.message || ERROR_MESSAGES.PUBLIC_SWITCH_GAMES_LOAD_FAILED;
  }
  if (associatesData.status === 'rejected') {
    console.error('Failed to load associates data from API:', associatesData.reason);
    errors.associates = handleApiError(associatesData.reason, 'associates');
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
        associates: false
      });
    }
  }, [currentUserId, activePage, completedPage, switchPage]);
  
  // 2025: Gesture handlers
  const handleSwipe = (direction) => {
    setLastGesture(direction);
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([20]);
    }
    
    // Navigate based on swipe
    if (direction === 'left') {
      // Next tab
      const tabs = ['overview', 'ongoing', 'completed', 'switch-games', 'public', 'associates'];
      const currentIndex = tabs.indexOf(activeTab);
      const nextIndex = (currentIndex + 1) % tabs.length;
      setActiveTab(tabs[nextIndex]);
    } else if (direction === 'right') {
      // Previous tab
      const tabs = ['overview', 'ongoing', 'completed', 'switch-games', 'public', 'associates'];
      const currentIndex = tabs.indexOf(activeTab);
      const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
      setActiveTab(tabs[prevIndex]);
    }
  };
  
  // 2025: Smart actions with micro-interactions
  const handleQuickAction = async (action, params = {}) => {
    try {
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate([30, 30, 30]);
      }
      
      switch (action) {
        case 'create-dare':
          navigate('/dare/create');
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
  
  // 2025: Smart filtering with debouncing
  const debouncedFilter = useCallback(
    debounce((newFilters) => {
      setFilters(newFilters);
    }, 300),
    []
  );
  
  // Effects
  useEffect(() => {
    if (user && currentUserId) {
      fetchData();
    }
  }, [user, currentUserId, fetchData]);
  
  // Refetch data when pagination changes
  useEffect(() => {
    if (activePage > 1 || completedPage > 1 || switchPage > 1) {
      fetchData();
    }
  }, [activePage, completedPage, switchPage, fetchData]);
  
  // Debug: Log pagination state changes
  useEffect(() => {
    console.log('Pagination State Changed:', {
      activePage,
      activeTotalPages,
      activeTotalItems,
      completedPage,
      completedTotalPages,
      completedTotalItems,
      switchPage,
      switchTotalPages,
      switchTotalItems,
      ITEMS_PER_PAGE
    });
  }, [activePage, activeTotalPages, activeTotalItems, completedPage, completedTotalPages, completedTotalItems, switchPage, switchTotalPages, switchTotalItems]);
  
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
  };
  
  // 2025: Smart tabs with modern interactions
  const tabs = [
    {
      key: 'overview',
      label: 'Overview',
      icon: ChartBarIcon,
      content: (
        <GestureContainer onSwipe={handleSwipe} className="space-y-8">
          {/* Smart Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <SmartStatsCard
              title="Active Dares"
              value={activeTotalItems}
              icon={ClockIconFilled}
              color="blue"
              loading={dataLoading.ongoing}
              trend={calculateTrend(ongoing.length, 'ongoing')}
              onClick={() => setActiveTab('ongoing')}
            />
            
            <SmartStatsCard
              title="Completed"
              value={completedTotalItems}
              icon={TrophyIconFilled}
              color="green"
              loading={dataLoading.completed}
              trend={calculateTrend(completed.length, 'completed')}
              onClick={() => setActiveTab('completed')}
            />
            
            <SmartStatsCard
              title="Switch Games"
              value={switchTotalItems}
              icon={FireIconFilled}
              color="purple"
              loading={dataLoading.switchGames}
              trend={calculateTrend(switchTotalItems, 'switchGames')}
              onClick={() => setActiveTab('switch-games')}
            />
            
            <SmartStatsCard
              title="Available"
              value={publicDares.length + publicSwitchGames.length}
              icon={SparklesIconFilled}
              color="orange"
              loading={dataLoading.public}
              trend={calculateTrend(publicDares.length + publicSwitchGames.length, 'public')}
              onClick={() => setActiveTab('public')}
            />
          </div>
          


          {/* Quick Actions with 2025 Design */}
          <NeumorphicCard variant="glass" className="p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <BoltIcon className="w-6 h-6 text-yellow-400" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <MicroInteractionButton
                onClick={() => handleQuickAction('create-dare')}
                variant="primary"
                size="lg"
                className="h-20"
              >
                <div className="flex flex-col items-center gap-2">
                  <PlusIcon className="w-8 h-8" />
                  <span className="text-sm">Create Dare</span>
                </div>
              </MicroInteractionButton>
              
              <MicroInteractionButton
                onClick={() => handleQuickAction('perform-dare')}
                variant="secondary"
                size="lg"
                className="h-20"
              >
                <div className="flex flex-col items-center gap-2">
                  <PlayIcon className="w-8 h-8" />
                  <span className="text-sm">Perform Dare</span>
                </div>
              </MicroInteractionButton>
              
              <MicroInteractionButton
                onClick={() => handleQuickAction('submit-offer')}
                variant="success"
                size="lg"
                className="h-20"
              >
                <div className="flex flex-col items-center gap-2">
                  <DocumentPlusIcon className="w-8 h-8" />
                  <span className="text-sm">Submit Offer</span>
                </div>
              </MicroInteractionButton>
              
              <MicroInteractionButton
                onClick={() => handleQuickAction('create-switch')}
                variant="primary"
                size="lg"
                className="h-20"
              >
                <div className="flex flex-col items-center gap-2">
                  <PuzzlePieceIcon className="w-8 h-8" />
                  <span className="text-sm">Create Game</span>
                </div>
              </MicroInteractionButton>
              
              <MicroInteractionButton
                onClick={() => handleQuickAction('join-game')}
                variant="warning"
                size="lg"
                className="h-20"
              >
                <div className="flex flex-col items-center gap-2">
                  <UserGroupIcon className="w-8 h-8" />
                  <span className="text-sm">Join Game</span>
                </div>
              </MicroInteractionButton>
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
        </GestureContainer>
      )
    },
    {
      key: 'ongoing',
      label: 'Active Dares',
      icon: ClockIcon,
      content: (
        <GestureContainer onSwipe={handleSwipe} className="space-y-6">
          <NeumorphicCard variant="glass" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <ClockIcon className="w-6 h-6 text-blue-400" />
                Active Dares ({activeTotalItems})
              </h3>
              <Search
                placeholder="Search active dares..."
                onSearch={setSearch}
                className="w-64"
              />
            </div>
            {ongoing.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClockIcon className="w-8 h-8 text-blue-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">No Active Dares</h4>
                <p className="text-white/70 mb-6">You don't have any active dares at the moment.</p>
                <MicroInteractionButton
                  onClick={() => handleQuickAction('perform-dare')}
                  variant="primary"
                >
                  Find Dares to Perform
                </MicroInteractionButton>
            </div>
          ) : (
            <div className="space-y-4">
                {Array.isArray(ongoing) && ongoing.map((dare) => (
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
                {activeTotalPages > 1 && activeTotalItems > 0 && 
                 Number.isInteger(activePage) && Number.isInteger(activeTotalPages) && Number.isInteger(activeTotalItems) && (
                  <div className="mt-6">
                    {/* Debug: Log pagination values */}
                    {console.log('Active Dares Pagination Props:', {
                      currentPage: activePage,
                      totalPages: activeTotalPages,
                      totalItems: activeTotalItems,
                      pageSize: ITEMS_PER_PAGE
                    })}
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
        </GestureContainer>
      )
    },
    {
      key: 'completed',
      label: 'Completed',
      icon: TrophyIcon,
      content: (
        <GestureContainer onSwipe={handleSwipe} className="space-y-6">
          <NeumorphicCard variant="glass" className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <TrophyIcon className="w-6 h-6 text-green-400" />
              Completed Dares ({completedTotalItems})
            </h3>
            {completed.length === 0 ? (
                <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrophyIcon className="w-8 h-8 text-green-400" />
                  </div>
                <h4 className="text-lg font-semibold text-white mb-2">No Completed Dares</h4>
                <p className="text-white/70 mb-6">Complete your first dare to see it here!</p>
                <MicroInteractionButton
                  onClick={() => handleQuickAction('perform-dare')}
                  variant="success"
                >
                  Start Performing Dares
                </MicroInteractionButton>
                </div>
            ) : (
              <div className="space-y-4">
                {Array.isArray(completed) && completed.map((dare) => (
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
                            className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 hover:scale-105 active:scale-95"
                          >
                            <StarIcon className="w-4 h-4" />
                            Review Proof
                          </button>
                        )}
                      </div>
                    }
                  />
                ))}
                
                {/* Completed Dares Pagination */}
                {completedTotalPages > 1 && completedTotalItems > 0 && 
                 Number.isInteger(completedPage) && Number.isInteger(completedTotalPages) && Number.isInteger(completedTotalItems) && (
                  <div className="mt-6">
                    {/* Debug: Log pagination values */}
                    {console.log('Completed Dares Pagination Props:', {
                      currentPage: completedPage,
                      totalPages: completedTotalPages,
                      totalItems: completedTotalItems,
                      pageSize: ITEMS_PER_PAGE
                    })}
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
        </GestureContainer>
      )
    },
    {
      key: 'switch-games',
      label: 'Switch Games',
      icon: FireIcon,
      content: (
        <GestureContainer onSwipe={handleSwipe} className="space-y-6">
          <NeumorphicCard variant="glass" className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <FireIcon className="w-6 h-6 text-purple-400" />
              Switch Games ({switchTotalItems})
            </h3>
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
                    onClick={() => setActiveTab('public')}
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
              
              {/* Switch Games Pagination */}
              {switchTotalPages > 1 && switchTotalItems > 0 && 
               Number.isInteger(switchPage) && Number.isInteger(switchTotalPages) && Number.isInteger(switchTotalItems) && (
                <div className="mt-6">
                  {/* Debug: Log pagination values */}
                  {console.log('Switch Games Pagination Props:', {
                    currentPage: switchPage,
                    totalPages: switchTotalPages,
                    totalItems: switchTotalItems,
                    pageSize: ITEMS_PER_PAGE
                  })}
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
        </GestureContainer>
      )
    },
    {
      key: 'public',
      label: 'Public',
      icon: SparklesIcon,
      content: (
        <GestureContainer onSwipe={handleSwipe} className="space-y-6">
          {/* Public Dares Section */}
          <NeumorphicCard variant="glass" className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <SparklesIcon className="w-6 h-6 text-orange-400" />
              Public Dares ({publicDares.length})
            </h3>
            {publicDares.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <SparklesIcon className="w-6 h-6 text-orange-400" />
                </div>
                <h4 className="text-md font-semibold text-white mb-2">No Public Dares</h4>
                <p className="text-white/70 mb-4 text-sm">No public dares are available at the moment.</p>
                <MicroInteractionButton
                  onClick={() => handleQuickAction('create-dare')}
                  variant="primary"
                  size="sm"
                >
                  Create a Dare
                </MicroInteractionButton>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.isArray(publicDares) && publicDares.map((dare) => (
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
                    actions={
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/dare/consent/${dare._id}`)}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          <PlayIcon className="w-4 h-4" />
                          Perform Dare
                        </button>
                        <button
                          onClick={() => navigate(`/dare/${dare._id}`)}
                          className="bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg flex items-center gap-2 hover:from-gray-600 hover:to-gray-700 transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          <EyeIcon className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    }
                  />
                ))}
              </div>
            )}
          </NeumorphicCard>

          {/* Public Switch Games Section */}
          <NeumorphicCard variant="glass" className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <FireIcon className="w-6 h-6 text-purple-400" />
              Public Switch Games ({publicSwitchGames.length})
            </h3>
            {publicSwitchGames.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FireIcon className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="text-md font-semibold text-white mb-2">No Public Switch Games</h4>
                <p className="text-white/70 mb-4 text-sm">No public switch games are available at the moment.</p>
                <MicroInteractionButton
                  onClick={() => handleQuickAction('create-switch')}
                  variant="primary"
                  size="sm"
                >
                  Create a Game
                </MicroInteractionButton>
              </div>
            ) : (
              <div className="space-y-4">
                {Array.isArray(publicSwitchGames) && publicSwitchGames.map((game) => (
                  <SwitchGameCard 
                    key={game._id} 
                    game={game}
                    currentUserId={currentUserId}
                    actions={
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/switches/participate/${game._id}`)}
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
              </div>
            )}
          </NeumorphicCard>
        </GestureContainer>
      )
    },
    {
      key: 'associates',
      label: 'Associates',
      icon: UserGroupIcon,
      content: (
        <GestureContainer onSwipe={handleSwipe} className="space-y-6">
          <NeumorphicCard variant="glass" className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <UserGroupIcon className="w-6 h-6 text-indigo-400" />
              Associates ({associates.length})
            </h3>
            {associates.length === 0 ? (
                <div className="text-center py-12">
                <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserGroupIcon className="w-8 h-8 text-indigo-400" />
                  </div>
                <h4 className="text-lg font-semibold text-white mb-2">No Associates</h4>
                <p className="text-white/70 mb-6">Connect with other users to see them here.</p>
                <MicroInteractionButton
                  onClick={() => navigate('/public-dares')}
                  variant="primary"
                >
                  Discover Users
                </MicroInteractionButton>
                </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.isArray(associates) && associates.map((associate) => (
                  <NeumorphicCard 
                    key={associate._id} 
                    variant="elevated" 
                    interactive 
                    className="p-4 cursor-pointer"
                    onClick={() => navigate(`/profile/${associate._id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar user={associate} size={40} />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white">{associate.fullName}</h4>
                        <p className="text-sm text-white/70">@{associate.username}</p>
                      </div>
                    </div>
                  </NeumorphicCard>
                ))}
              </div>
            )}
          </NeumorphicCard>
        </GestureContainer>
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
              <MicroInteractionButton
                onClick={() => navigate('/login')}
                variant="danger"
                size="lg"
              >
                Go to Login
              </MicroInteractionButton>
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
                <MicroInteractionButton
                  onClick={fetchData}
                  variant="secondary"
                  size="sm"
                >
                  <ArrowPathIcon className="w-4 h-4" />
                  Retry
                </MicroInteractionButton>
              </div>
            </NeumorphicCard>
          ))}
          
          {/* 2025 Smart Tabs */}
          <Tabs
            tabs={tabs}
            value={tabs.findIndex(t => t.key === activeTab)}
            onChange={idx => setActiveTab(tabs[idx].key)}
            className="mb-8"
          />

          {/* 2025 Empty State - Show when all sections are empty */}
          {!isLoading && 
           ongoing.length === 0 && 
           completed.length === 0 && 
           mySwitchGames.length === 0 && 
           publicDares.length === 0 && 
           publicSwitchGames.length === 0 && 
           associates.length === 0 && (
            <NeumorphicCard variant="glass" className="p-12 text-center">
              <div className="w-24 h-24 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <SparklesIcon className="w-12 h-12 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Welcome to Your Dashboard!</h3>
              <p className="text-white/70 mb-8 max-w-md mx-auto">
                It looks like you're just getting started. Create your first dare or join a switch game to begin your journey!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <MicroInteractionButton
                  onClick={() => handleQuickAction('create-dare')}
                  variant="primary"
                  size="lg"
                >
                  <PlusIcon className="w-6 h-6" />
                  Create Your First Dare
                </MicroInteractionButton>
                <MicroInteractionButton
                  onClick={() => handleQuickAction('create-switch')}
                  variant="secondary"
                  size="lg"
                >
                  <PuzzlePieceIcon className="w-6 h-6" />
                  Create a Switch Game
                </MicroInteractionButton>
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
