import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import DareCard from '../components/DareCard';
import { DIFFICULTY_OPTIONS, TYPE_OPTIONS, STATUS_MAP, API_RESPONSE_TYPES, ERROR_MESSAGES, SUCCESS_MESSAGES, PAGINATION } from '../constants';
import { useRef } from 'react';
import Slot from '../components/Slot';
import Accordion from '../components/Accordion';
import DashboardChart from '../components/DashboardChart';
import { UserIcon, PlusIcon, PlayIcon, DocumentPlusIcon, SparklesIcon, CheckCircleIcon, ClockIcon, FireIcon, ChartBarIcon, TrophyIcon, ArrowRightIcon, MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import Tabs from '../components/Tabs';
import { useToast } from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { validateApiResponse, handleApiError, normalizeUserId, safeApiCall } from '../utils/apiUtils';
import { useRealtimeUpdates, useSpecificRealtimeUpdates, useActivityRealtimeUpdates } from '../hooks/useRealtimeUpdates';
import { usePagination } from '../hooks/usePagination';

/**
 * DarePerformerDashboard - Modern React/Tailwind implementation with improved UX
 * Features: Progressive disclosure, mobile-first design, reduced cognitive load, enhanced accessibility
 */
// Constants for slot limits and cooldown
const MAX_SLOTS = 5;
const COOLDOWN_SECONDS = 60 * 5; // 5 minutes
const PAGE_SIZE = 6;

// Helper for time ago/status
function timeAgoOrDuration(start, end, status) {
  const now = Date.now();
  const startTime = new Date(start).getTime();
  const endTime = end ? new Date(end).getTime() : null;
  
  if (status === 'completed' && endTime) {
    const duration = endTime - startTime;
    const minutes = Math.floor(duration / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  }
  
  const timeAgo = now - startTime;
  const minutes = Math.floor(timeAgo / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { label: status, color: 'bg-neutral-600/20 border border-neutral-500/50 text-neutral-300', icon: '❓' };
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${s.color}`} title={status}>
      <span className="mr-1">{s.icon}</span>
      {s.label}
    </span>
  );
}

export default function DarePerformerDashboard() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  
  // Normalize user ID for consistent usage
  const userId = normalizeUserId(user);
  
  // Core state with better organization
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Data states with proper validation
  const [ongoing, setOngoing] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [publicDares, setPublicDares] = useState([]);
  const [mySwitchGames, setMySwitchGames] = useState([]);
  const [switchGameHistory, setSwitchGameHistory] = useState([]);
  
  // Loading states with improved management
  const [dataLoading, setDataLoading] = useState({
    ongoing: true,
    completed: true,
    public: true,
    switchGames: true,
    associates: true,
    stats: true,
    activity: true
  });

  // Error states for better error handling
  const [errors, setErrors] = useState({
    ongoing: '',
    completed: '',
    public: '',
    switchGames: '',
    associates: '',
    stats: '',
    activity: ''
  });
  
  // Consolidated filter states
  const [filters, setFilters] = useState({
    status: '',
    difficulty: '',
    type: '',
    search: '',
    difficulties: [],
    types: [],
    keyword: '',
    creator: '',
    tag: ''
  });
  
  // Demand section states - consolidated
  const [demandState, setDemandState] = useState({
    slots: [],
    selectedDifficulties: [],
    selectedTypes: [],
    keywordFilter: '',
    creatorFilter: '',
    publicDares: [],
    loading: false,
    error: '',
    expandedIdx: null,
    completed: [],
    total: 0
  });
  
  // Switch Games states - consolidated
  const [switchState, setSwitchState] = useState({
    statusFilter: '',
    difficultyFilter: '',
    participantFilter: '',
    sort: 'recent',
    activityFeed: [],
    activityLoading: false
  });
  
  // Associates and stats states (restored)
  const [associates, setAssociates] = useState([]);
  const [expandedAssociateIdx, setExpandedAssociateIdx] = useState(null);
  const [roleStats, setRoleStats] = useState(null);
  const [publicActCounts, setPublicActCounts] = useState({ total: 0, submission: 0, domination: 0, switch: 0 });
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [expandedDare, setExpandedDare] = useState(null);
  const [notification, setNotification] = useState(null);
  const [expandedOngoingIdx, setExpandedOngoingIdx] = useState(null);
  const [expandedPublicIdx, setExpandedPublicIdx] = useState(null);
  const [showDashboardSettings, setShowDashboardSettings] = useState(false);
  const [confirmWithdrawIdx, setConfirmWithdrawIdx] = useState(null);
  
  // Notification system
  const notificationTimeout = useRef(null);
  const showNotification = (msg, type = 'info') => {
    setNotification({ message: msg, type });
    if (notificationTimeout.current) clearTimeout(notificationTimeout.current);
    notificationTimeout.current = setTimeout(() => setNotification(null), 5000);
    if (type === 'success') showSuccess(msg);
    if (type === 'error') showError(msg);
  };

  // Fetch data on mount with improved error handling
  useEffect(() => {
    if (!user || !userId) {
      console.log('No user or user ID found, skipping dashboard data fetch');
      return;
    }
    
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        console.log('Fetching dashboard data for user:', userId);
        
        // Use safeApiCall for consistent error handling
        const [
          { data: ongoingData, error: ongoingError },
          { data: completedData, error: completedError },
          { data: publicData, error: publicError },
          { data: switchData, error: switchError },
          { data: historyData, error: historyError }
        ] = await Promise.all([
          safeApiCall(
            () => api.get('/dares/mine?status=in_progress,waiting_for_participant'),
            'fetching ongoing dares',
            API_RESPONSE_TYPES.DARE_ARRAY
          ),
          safeApiCall(
            () => api.get('/dares/mine?status=completed'),
            'fetching completed dares',
            API_RESPONSE_TYPES.DARE_ARRAY
          ),
          safeApiCall(
            () => api.get('/dares?public=true&status=waiting_for_participant'),
            'fetching public dares',
            API_RESPONSE_TYPES.DARE_ARRAY
          ),
          safeApiCall(
            () => api.get('/switches/performer'),
            'fetching switch games',
            API_RESPONSE_TYPES.SWITCH_GAME_ARRAY
          ),
          safeApiCall(
            () => api.get('/switches/history'),
            'fetching switch game history',
            API_RESPONSE_TYPES.SWITCH_GAME_ARRAY
          )
        ]);
        
        // Handle individual errors with better error tracking
        const errorMap = {
          ongoing: ongoingError,
          completed: completedError,
          public: publicError,
          switchGames: switchError,
          history: historyError
        };
        
        const hasErrors = Object.values(errorMap).some(Boolean);
        if (hasErrors) {
          console.warn('Some API calls failed:', errorMap);
          setErrors(prev => ({
            ...prev,
            ...errorMap
          }));
        } else {
          setErrors({
            ongoing: '',
            completed: '',
            public: '',
            switchGames: '',
            associates: '',
            stats: '',
            activity: ''
          });
        }
        
        // Set data with validation
        setOngoing(ongoingData || []);
        setCompleted(completedData || []);
        setPublicDares(publicData || []);
        setMySwitchGames(switchData || []);
        setSwitchGameHistory(historyData || []);
        
        console.log('Dashboard data loaded successfully:', {
          ongoing: ongoingData?.length || 0,
          completed: completedData?.length || 0,
          public: publicData?.length || 0,
          switches: switchData?.length || 0,
          history: historyData?.length || 0
        });
        
        showNotification(SUCCESS_MESSAGES.DATA_LOADED, 'success');
      } catch (err) {
        const errorMessage = handleApiError(err, 'loading dashboard data');
        setError(errorMessage);
        showNotification(errorMessage, 'error');
      } finally {
        setIsLoading(false);
        setDataLoading({
          ongoing: false,
          completed: false,
          public: false,
          switchGames: false,
          associates: false,
          stats: false,
          activity: false
        });
      }
    };
    
    fetchData();
  }, [user, userId]);

  // Additional useEffect hooks for restored features with improved error handling
  useEffect(() => {
    if (!user || !userId) return;
    
    const fetchAdditionalData = async () => {
              setDataLoading(prev => ({ ...prev, associates: false, stats: true }));
      
      try {
        // Fetch associates with proper error handling - temporarily disabled due to 500 error
        // const { data: associatesData, error: associatesError } = await safeApiCall(
        //   () => api.get('/users/associates'),
        //   'fetching associates',
        //   API_RESPONSE_TYPES.USER_ARRAY
        // );
        
        // if (associatesError) {
        //   console.warn('Failed to fetch associates:', associatesError);
        // }
        // setAssociates(associatesData || []);
        
        // Re-enable associates functionality since API is working
        const { data: associatesData, error: associatesError } = await safeApiCall(
          () => api.get('/users/associates'),
          'fetching associates',
          API_RESPONSE_TYPES.USER_ARRAY
        );
        
        if (associatesError) {
          console.warn('Failed to fetch associates:', associatesError);
          setErrors(prev => ({ ...prev, associates: associatesError }));
        }
        setAssociates(associatesData || []);
        
        // Fetch role stats with proper error handling
        const { data: statsData, error: statsError } = await safeApiCall(
          () => api.get(`/stats/users/${userId}`),
          'fetching user stats',
          API_RESPONSE_TYPES.STATS
        );
        
        if (statsError) {
          console.warn('Failed to fetch user stats:', statsError);
        }
        setRoleStats(statsData);
        
        // Fetch public act counts with proper error handling
        const { data: actCountsData, error: actCountsError } = await safeApiCall(
          () => api.get('/stats/public-acts'),
          'fetching public act counts',
          API_RESPONSE_TYPES.STATS
        );
        
        if (actCountsError) {
          console.warn('Failed to fetch public act counts:', actCountsError);
        }
        setPublicActCounts(actCountsData || {});
        
      } catch (err) {
        console.error('Error fetching additional data:', err);
      } finally {
        setDataLoading(prev => ({ ...prev, associates: false, stats: false }));
      }
    };
    
    fetchAdditionalData();
  }, [user, userId]);

  // Fetch public demand dares
  useEffect(() => {
    setDemandState(prev => ({ ...prev, loading: true }));
    setDemandState(prev => ({ ...prev, error: '' }));
    api.get('/dares', { params: { public: true, dareType: 'domination' } })
      .then(res => setDemandState(prev => ({ ...prev, publicDares: Array.isArray(res.data) ? res.data : [] })))
      .catch(() => setDemandState(prev => ({ ...prev, error: 'Failed to load public demand dares.' })))
      .finally(() => setDemandState(prev => ({ ...prev, loading: false })));
  }, [demandState.selectedDifficulties, demandState.selectedTypes, demandState.keywordFilter, demandState.creatorFilter]);

  // Fetch user's demand slots (restored)
  useEffect(() => {
    if (!user) return;
    api.get('/dares', { params: { creator: user.id || user._id, dareType: 'domination' } })
      .then(res => setDemandSlots(Array.isArray(res.data) ? res.data : []))
      .catch(() => setDemandSlots([]));
  }, [user]);

  // Fetch switch game activity feed
  useEffect(() => {
    if (activeTab !== 'switch') return;
    setSwitchState(prev => ({ ...prev, activityLoading: true }));
    api.get('/activity-feed?limit=20')
      .then(res => {
        setSwitchState(prev => ({ ...prev, activityFeed: Array.isArray(res.data) ? res.data.filter(a => a.switchGame) : [] }));
      })
      .catch(() => setSwitchState(prev => ({ ...prev, activityFeed: [] })))
      .finally(() => setSwitchState(prev => ({ ...prev, activityLoading: false })));
  }, [activeTab]);

  // Real-time updates using custom hooks
  const publicDaresRealtime = useSpecificRealtimeUpdates('dare', (dare) => {
    setPublicDares(prev => [dare, ...prev]);
  }, { enabled: activeTab === 'public' });

  const activityRealtime = useActivityRealtimeUpdates((activity) => {
    setSwitchState(prev => ({ ...prev, activityFeed: [activity, ...prev.activityFeed.slice(0, 19)] })); // Keep only 20 items
  }, { enabled: activeTab === 'overview' });

  // Real-time updates for switch games
  const switchGamesRealtime = useSpecificRealtimeUpdates('switch_game', (game) => {
    setMySwitchGames(prev => {
      const existingIndex = prev.findIndex(g => g._id === game._id);
      if (existingIndex >= 0) {
        return prev.map((g, i) => i === existingIndex ? game : g);
      } else {
        return [game, ...prev];
      }
    });
  }, { enabled: activeTab === 'my-switch' });

  // Filter functions
  const filterDares = (dares) => {
    return dares.filter(dare => {
      if (filters.status && dare.status !== filters.status) return false;
      if (filters.difficulty && dare.difficulty !== filters.difficulty) return false;
      if (filters.type && dare.type !== filters.type) return false;
      if (filters.search) {
        const search = filters.search.toLowerCase();
        return dare.description?.toLowerCase().includes(search) ||
               dare.creator?.username?.toLowerCase().includes(search) ||
               dare.performer?.username?.toLowerCase().includes(search);
      }
      return true;
    });
  };

  // Advanced filtering functions (restored)
  const filterAndSortAllDares = (dares) => {
    let filtered = dares;
    if (filters.status) filtered = filtered.filter(d => d.status === filters.status);
    if (filters.difficulty && filters.difficulties.length > 0) filtered = filtered.filter(d => filters.difficulties.includes(d.difficulty));
    if (filters.keyword) filtered = filtered.filter(d =>
      d.description?.toLowerCase().includes(filters.keyword.toLowerCase()) ||
      d.creator?.username?.toLowerCase().includes(filters.keyword.toLowerCase())
    );
    if (filters.creator) filtered = filtered.filter(d =>
      d.creator?.username?.toLowerCase().includes(filters.creator.toLowerCase())
    );
    if (filters.tag && filters.tags.length > 0) filtered = filtered.filter(d =>
      d.tags?.some(tag => filters.tags.includes(tag))
    );
    return filtered;
  };

  const filterAndSortSwitchGames = (games) => {
    let filtered = games;
    if (switchState.statusFilter) filtered = filtered.filter(g => g.status === switchState.statusFilter);
    if (switchState.difficultyFilter) filtered = filtered.filter(g =>
      g.difficulty === switchState.difficultyFilter || g.creatorDare?.difficulty === switchState.difficultyFilter
    );
    if (switchState.participantFilter) filtered = filtered.filter(g =>
      (g.creator?.username && g.creator.username.toLowerCase().includes(switchState.participantFilter.toLowerCase())) ||
      (g.participant?.username && g.participant.username.toLowerCase().includes(switchState.participantFilter.toLowerCase()))
    );
    if (switchState.sort === 'recent') filtered = filtered.slice().sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    if (switchState.sort === 'oldest') filtered = filtered.slice().sort((a, b) => new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt));
    if (switchState.sort === 'status') filtered = filtered.slice().sort((a, b) => (a.status || '').localeCompare(b.status || ''));
    if (switchState.sort === 'difficulty') filtered = filtered.slice().sort((a, b) => (a.difficulty || a.creatorDare?.difficulty || '').localeCompare(b.difficulty || b.creatorDare?.difficulty || ''));
    return filtered;
  };

  // Helper functions (restored)
  const dedupeDaresByUser = (dares) => {
    const seen = new Set();
    return dares.filter(dare => {
      const id = dare.user?._id || dare.user?.id || dare.creator?._id || dare.creator?.id;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
  };

  const getRejectionExplanation = (reason) => {
    const map = {
      chicken: 'chickened out',
      impossible: 'think it\'s not possible or safe for anyone to do',
      incomprehensible: 'couldn\'t understand what was being demanded',
      abuse: 'have reported the demand as abuse',
    };
    return map[reason] || reason;
  };

  // Advanced filtering UI components (restored)
  const renderDifficultyChips = () => (
    <div className="flex gap-2 items-center flex-wrap gap-y-2" aria-label="Filter by difficulty">
      {DIFFICULTY_OPTIONS.map(d => (
        <button
          key={d.value}
          type="button"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-base font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
            ${filters.difficulties.includes(d.value)
              ? 'border-primary bg-primary/10 text-primary scale-105 shadow-lg'
              : 'border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-primary hover:bg-neutral-800/60'}`}
          onClick={() => setFilters(prev => ({ ...prev, difficulties: prev.difficulties.includes(d.value)
            ? prev.difficulties.filter(diff => diff !== d.value)
            : [...prev.difficulties, d.value]
          }))}
          aria-pressed={filters.difficulties.includes(d.value)}
          aria-label={`Toggle difficulty: ${d.label}`}
        >
          <span>{d.label}</span>
        </button>
      ))}
    </div>
  );

  const renderDemandDifficultyChips = () => (
    <div className="flex gap-2 mb-4" aria-label="Filter demand by difficulty">
      {DIFFICULTY_OPTIONS.map(d => (
        <button
          key={d.value}
          type="button"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary
            ${demandState.selectedDifficulties.includes(d.value)
              ? 'border-primary bg-primary/10 text-primary scale-105 shadow-lg'
              : 'border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-primary hover:bg-neutral-800/60'}`}
          onClick={() => setDemandState(prev => ({
            ...prev,
            selectedDifficulties: prev.selectedDifficulties.includes(d.value)
              ? prev.selectedDifficulties.filter(diff => diff !== d.value)
              : [...prev.selectedDifficulties, d.value]
          }))}
          aria-pressed={demandState.selectedDifficulties.includes(d.value)}
          aria-label={`Toggle demand difficulty: ${d.label}`}
        >
          <span>{d.label}</span>
        </button>
      ))}
    </div>
  );

  const renderDemandTypeChips = () => (
    <div className="flex gap-2 mb-4" aria-label="Filter demand by type">
      {TYPE_OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          className={`px-3 py-1 rounded border text-sm font-medium transition ${demandState.selectedTypes.includes(opt.value) ? 'bg-blue-500 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100'}`}
          onClick={() => setDemandState(prev => ({
            ...prev,
            selectedTypes: prev.selectedTypes.includes(opt.value)
              ? prev.selectedTypes.filter(t => t !== opt.value)
              : [...prev.selectedTypes, opt.value]
          }))}
          aria-pressed={demandState.selectedTypes.includes(opt.value)}
          aria-label={`Toggle demand type: ${opt.label}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  // Advanced filtering UI components (restored)
  const renderSwitchGameFilters = () => (
    <div className="space-y-4 mb-6">
      <div className="flex flex-wrap gap-4">
        <select
          value={switchState.statusFilter}
          onChange={(e) => setSwitchState(prev => ({ ...prev, statusFilter: e.target.value }))}
          className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Status</option>
          <option value="waiting_for_participant">Waiting</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="forfeited">Forfeited</option>
        </select>
        
        <select
          value={switchState.difficultyFilter}
          onChange={(e) => setSwitchState(prev => ({ ...prev, difficultyFilter: e.target.value }))}
          className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Difficulties</option>
          <option value="titillating">Titillating</option>
          <option value="arousing">Arousing</option>
          <option value="explicit">Explicit</option>
          <option value="edgy">Edgy</option>
          <option value="hardcore">Hardcore</option>
        </select>
        
        <select
          value={switchState.sort}
          onChange={(e) => setSwitchState(prev => ({ ...prev, sort: e.target.value }))}
          className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="recent">Most Recent</option>
          <option value="oldest">Oldest First</option>
          <option value="status">By Status</option>
          <option value="difficulty">By Difficulty</option>
        </select>
        
        <input
          type="text"
          placeholder="Search participants..."
          value={switchState.participantFilter}
          onChange={(e) => setSwitchState(prev => ({ ...prev, participantFilter: e.target.value }))}
          className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    </div>
  );

  const renderAdvancedFilters = () => (
    <div className="space-y-4 mb-6">
      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search by keyword..."
          value={filters.keyword}
          onChange={(e) => setFilters(prev => ({ ...prev, keyword: e.target.value }))}
          className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        
        <input
          type="text"
          placeholder="Filter by creator..."
          value={filters.creator}
          onChange={(e) => setFilters(prev => ({ ...prev, creator: e.target.value }))}
          className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Status</option>
          <option value="in_progress">In Progress</option>
          <option value="waiting_for_participant">Waiting</option>
          <option value="completed">Completed</option>
          <option value="forfeited">Forfeited</option>
        </select>
        
        <input
          type="text"
          placeholder="Filter by tags..."
          value={filters.tag}
          onChange={(e) => setFilters(prev => ({ ...prev, tag: e.target.value }))}
          className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      
      {renderDifficultyChips()}
    </div>
  );

  // Action handlers with improved error handling
  const handleClaimDare = async (dare) => {
    if (ongoing.length >= MAX_SLOTS) {
      showNotification('You have reached your maximum number of perform slots.', 'error');
      return;
    }
    
    try {
      const params = new URLSearchParams();
      if (dare.difficulty) {
        params.append('difficulty', dare.difficulty);
      }
      
      const { data: claimedDare, error } = await safeApiCall(
        () => api.get(`/dares/random?${params.toString()}`),
        'claiming dare',
        API_RESPONSE_TYPES.DARE
      );
      
      if (error) {
        showNotification(error, 'error');
        return;
      }
      
      if (claimedDare && Object.keys(claimedDare).length > 0) {
        setOngoing(prev => [...prev, claimedDare]);
        showNotification(SUCCESS_MESSAGES.DARE_CREATED, 'success');
      } else {
        showNotification('No available dares found with the specified criteria.', 'error');
      }
    } catch (err) {
      const errorMessage = handleApiError(err, 'claiming dare');
      showNotification(errorMessage, 'error');
    }
  };

  const handleCompleteDare = async (dareId) => {
    const dareIdx = ongoing.findIndex(d => d._id === dareId);
    if (dareIdx === -1) return;
    
    try {
      const { error } = await safeApiCall(
        () => api.post(`/dares/${ongoing[dareIdx]._id}/proof`, { text: 'Completed via dashboard.' }),
        'completing dare',
        API_RESPONSE_TYPES.DARE
      );
      
      if (error) {
        showNotification(error, 'error');
        return;
      }
      
      setOngoing(prev => prev.filter((_, i) => i !== dareIdx));
      setCompleted(prev => [...prev, { ...ongoing[dareIdx], status: 'completed', completedAt: new Date() }]);
      showNotification(SUCCESS_MESSAGES.DARE_COMPLETED, 'success');
    } catch (err) {
      const errorMessage = handleApiError(err, 'completing dare');
      showNotification(errorMessage, 'error');
    }
  };

  // Additional action handlers (restored)
  const handleRejectDare = async (dareId) => {
    const dareIdx = ongoing.findIndex(d => d._id === dareId);
    if (dareIdx === -1) return;
    const dare = ongoing[dareIdx];
    try {
      await api.post(`/dares/${dare._id}/forfeit`);
      setOngoing(prev => prev.filter((_, i) => i !== dareIdx));
      showNotification('Dare rejected (forfeited).', 'info');
    } catch (err) {
      showNotification('Failed to reject dare.', 'error');
    }
  };

  const handleWithdrawDemand = async (slotIdx) => {
    const dare = demandSlots[slotIdx];
    try {
      await api.patch(`/dares/${dare._id}`, { status: 'cancelled' });
      setDemandSlots(prev => prev.filter((_, i) => i !== slotIdx));
      showNotification('Demand dare withdrawn.', 'success');
    } catch (err) {
      showNotification('Failed to withdraw demand dare.', 'error');
    }
  };

  // Switch game action handlers (restored)
  const handleWithdrawSwitchGame = async (gameIdx) => {
    const game = mySwitchGames[gameIdx];
    try {
      await api.post(`/switches/${game._id}/forfeit`);
      setMySwitchGames(prev => prev.filter((_, i) => i !== gameIdx));
      showNotification('Switch game withdrawn.', 'success');
    } catch (err) {
      showNotification('Failed to withdraw switch game.', 'error');
    }
  };

  const handleJoinSwitchGame = async (gameId) => {
    try {
      const { error } = await safeApiCall(
        () => api.post(`/switches/${gameId}/join`, {
          difficulty: 'titillating',
          move: 'rock',
          consent: true
        }),
        'joining switch game',
        API_RESPONSE_TYPES.SWITCH_GAME
      );
      
      if (error) {
        showNotification(error, 'error');
        return;
      }
      
      showNotification(SUCCESS_MESSAGES.SWITCH_GAME_JOINED, 'success');
      
      // Refresh switch games with proper error handling
      const { data: updatedGames, error: refreshError } = await safeApiCall(
        () => api.get('/switches/performer'),
        'refreshing switch games',
        API_RESPONSE_TYPES.SWITCH_GAME_ARRAY
      );
      
      if (!refreshError) {
        setMySwitchGames(updatedGames || []);
      }
    } catch (err) {
      const errorMessage = handleApiError(err, 'joining switch game');
      showNotification(errorMessage, 'error');
    }
  };

  const handleSubmitSwitchProof = async (gameId, proofText) => {
    try {
      const { error } = await safeApiCall(
        () => api.post(`/switches/${gameId}/proof`, { text: proofText }),
        'submitting switch game proof',
        API_RESPONSE_TYPES.SWITCH_GAME
      );
      
      if (error) {
        showNotification(error, 'error');
        return;
      }
      
      showNotification(SUCCESS_MESSAGES.PROOF_SUBMITTED, 'success');
      
      // Refresh switch games with proper error handling
      const { data: updatedGames, error: refreshError } = await safeApiCall(
        () => api.get('/switches/performer'),
        'refreshing switch games after proof submission',
        API_RESPONSE_TYPES.SWITCH_GAME_ARRAY
      );
      
      if (!refreshError) {
        setMySwitchGames(updatedGames || []);
      }
    } catch (err) {
      const errorMessage = handleApiError(err, 'submitting switch game proof');
      showNotification(errorMessage, 'error');
    }
  };

  // Refactored tabs array to match requested structure
  const tabs = [
    {
      key: 'overview',
      label: 'Overview',
      icon: ChartBarIcon,
      content: (
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-600/20 to-blue-700/20 rounded-xl p-4 border border-blue-600/30">
              <div className="flex items-center justify-between">
                <div>
                  {dataLoading.ongoing ? (
                    <div className="animate-pulse">
                      <div className="h-8 bg-blue-400/20 rounded mb-2"></div>
                      <div className="h-4 bg-blue-300/20 rounded mb-1"></div>
                      <div className="h-3 bg-blue-400/20 rounded"></div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-blue-400">{ongoing.length}</div>
                      <div className="text-sm text-blue-300">Active Dares</div>
                      <div className="text-xs text-blue-400/70">{ongoing.length}/{MAX_SLOTS} slots used</div>
                    </>
                  )}
                </div>
                <ClockIcon className="w-8 h-8 text-blue-400" aria-hidden="true" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-600/20 to-green-700/20 rounded-xl p-4 border border-green-600/30">
              <div className="flex items-center justify-between">
                <div>
                  {dataLoading.completed ? (
                    <div className="animate-pulse">
                      <div className="h-8 bg-green-400/20 rounded mb-2"></div>
                      <div className="h-4 bg-green-300/20 rounded"></div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-green-400">{completed.length}</div>
                      <div className="text-sm text-green-300">Completed</div>
                    </>
                  )}
                </div>
                <TrophyIcon className="w-8 h-8 text-green-400" aria-hidden="true" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-600/20 to-purple-700/20 rounded-xl p-4 border border-purple-600/30">
              <div className="flex items-center justify-between">
                <div>
                  {dataLoading.switchGames ? (
                    <div className="animate-pulse">
                      <div className="h-8 bg-purple-400/20 rounded mb-2"></div>
                      <div className="h-4 bg-purple-300/20 rounded"></div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-purple-400">{mySwitchGames.length}</div>
                      <div className="text-sm text-purple-300">Switch Games</div>
                    </>
                  )}
                </div>
                <FireIcon className="w-8 h-8 text-purple-400" aria-hidden="true" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-600/20 to-orange-700/20 rounded-xl p-4 border border-orange-600/30">
              <div className="flex items-center justify-between">
                <div>
                  {dataLoading.public ? (
                    <div className="animate-pulse">
                      <div className="h-8 bg-orange-400/20 rounded mb-2"></div>
                      <div className="h-4 bg-orange-300/20 rounded"></div>
                    </div>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-orange-400">{publicDares.length}</div>
                      <div className="text-sm text-orange-300">Available</div>
                    </>
                  )}
                </div>
                <SparklesIcon className="w-8 h-8 text-orange-400" aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-neutral-900/60 rounded-xl p-6 border border-neutral-800/50">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              <button 
                onClick={() => navigate('/dare/create')}
                className="group bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl p-4 font-semibold hover:from-primary-dark hover:to-primary transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                aria-label="Create a new dare"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate('/dare/create');
                  }
                }}
              >
                <PlusIcon className="w-6 h-6 group-hover:scale-110 transition-transform" aria-hidden="true" />
                Create Dare
              </button>
              
              <button 
                onClick={() => navigate('/dare/select')}
                className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-4 font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                aria-label="Select and perform a dare"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate('/dare/select');
                  }
                }}
              >
                <PlayIcon className="w-6 h-6 group-hover:scale-110 transition-transform" aria-hidden="true" />
                Perform Dare
              </button>
              
              <button 
                onClick={() => navigate('/subs/new')}
                className="group bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-4 font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                aria-label="Submit a new offer"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate('/subs/new');
                  }
                }}
              >
                <DocumentPlusIcon className="w-6 h-6 group-hover:scale-110 transition-transform" aria-hidden="true" />
                Submit Offer
              </button>
              
              <button 
                onClick={() => navigate('/switches/create')}
                className="group bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl p-4 font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                aria-label="Create a new switch game"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate('/switches/create');
                  }
                }}
              >
                <FireIcon className="w-6 h-6 group-hover:scale-110 transition-transform" aria-hidden="true" />
                Create Switch Game
              </button>
              
              <button 
                onClick={() => navigate('/switches/participate')}
                className="group bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl p-4 font-semibold hover:from-orange-700 hover:to-orange-800 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                aria-label="Participate in an existing switch game"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate('/switches/participate');
                  }
                }}
              >
                <UserIcon className="w-6 h-6 group-hover:scale-110 transition-transform" aria-hidden="true" />
                Participate in Switch Game
              </button>
              
              <button 
                onClick={() => navigate('/public-dares')}
                className="group bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl p-4 font-semibold hover:from-pink-700 hover:to-pink-800 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                aria-label="Browse available public dares"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate('/public-dares');
                  }
                }}
              >
                <SparklesIcon className="w-6 h-6 group-hover:scale-110 transition-transform" aria-hidden="true" />
                Browse Public Dares
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-neutral-900/60 rounded-xl p-6 border border-neutral-800/50">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {switchState.activityFeed.length > 0 ? (
                switchState.activityFeed.slice(0, 5).map((activity, idx) => (
                  <div key={idx} className="p-3 bg-neutral-800/30 rounded-lg border border-neutral-700/30">
                    <div className="text-sm text-neutral-300">{activity.description}</div>
                    <div className="text-xs text-neutral-500 mt-1">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="text-neutral-400 text-lg mb-2">No recent activity</div>
                  <p className="text-neutral-500 text-sm">Complete dares to see activity here</p>
                </div>
              )}
            </div>
          </div>

          {/* Associates Section */}
          {associates.length > 0 && (
            <div className="bg-neutral-900/60 rounded-xl p-6 border border-neutral-800/50">
              <h3 className="text-lg font-semibold text-white mb-4" id="associates-section">Associates</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-labelledby="associates-section">
                {associates.slice(0, 6).map((associate, idx) => (
                  <div key={associate._id} className="p-4 bg-neutral-800/30 rounded-lg border border-neutral-700/30" role="listitem">
                    <div className="flex items-center gap-3">
                      <Avatar user={associate} size={32} />
                      <div className="flex-1">
                        <div className="font-semibold text-white text-sm">{associate.fullName || associate.username}</div>
                        <div className="text-xs text-neutral-400">@{associate.username}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {associates.length > 6 && (
                <div className="text-center mt-4">
                  <button 
                    onClick={() => setExpandedAssociateIdx(expandedAssociateIdx === null ? 0 : null)}
                    className="text-neutral-400 hover:text-neutral-300 text-sm"
                    aria-expanded={expandedAssociateIdx !== null}
                    aria-controls="associates-list"
                  >
                    {expandedAssociateIdx === null ? `Show ${associates.length - 6} more` : 'Show less'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Stats Dashboard */}
          {roleStats && (
            <div className="bg-neutral-900/60 rounded-xl p-6 border border-neutral-800/50">
              <h3 className="text-lg font-semibold text-white mb-4">Your Stats</h3>
              <DashboardChart stats={roleStats} />
            </div>
          )}

          {/* Public Act Counts */}
          {publicActCounts && Object.keys(publicActCounts).length > 0 && (
            <div className="bg-neutral-900/60 rounded-xl p-6 border border-neutral-800/50">
              <h3 className="text-lg font-semibold text-white mb-4">Public Act Statistics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{publicActCounts.total || 0}</div>
                  <div className="text-sm text-blue-300">Total Acts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{publicActCounts.submission || 0}</div>
                  <div className="text-sm text-green-300">Submissions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{publicActCounts.domination || 0}</div>
                  <div className="text-sm text-purple-300">Domination</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">{publicActCounts.switch || 0}</div>
                  <div className="text-sm text-orange-300">Switch Games</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'public',
      label: 'Public Dares',
      icon: SparklesIcon,
      content: (
        <div className="space-y-6">
          {/* Onboarding/Intro Banner */}
          <div className="bg-neutral-900/60 rounded-xl p-6 border border-neutral-800/50">
            <div className="flex items-center gap-4">
              <span className="text-3xl">🌎</span>
              <div>
                <div className="font-bold text-xl text-white mb-2">Participate in Public Dares & Switch Games</div>
                <div className="text-white/70">Use the filters or search to find something that excites you. Click <b>Participate</b> to get started.</div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-neutral-900/60 rounded-xl p-6 border border-neutral-800/50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'dares', label: 'Dares' },
                  { key: 'switches', label: 'Switch Games' },
                ].map(f => (
                  <button
                    key={f.key}
                    className={`px-6 py-3 rounded-xl font-semibold text-sm border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400 min-h-[44px] ${
                      (() => {
                        // This would need to be connected to a state variable
                        const currentFilter = 'all'; // Replace with actual state
                        return currentFilter === f.key 
                          ? 'bg-purple-600 text-white border-purple-500 shadow-lg' 
                          : 'bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/30'
                      })()
                    }`}
                    onClick={() => {
                      // This would need to be connected to a state setter
                      console.log(`Filter: ${f.key}`);
                    }}
                    aria-pressed={false}
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
                  aria-label="Search public dares and switch games"
                />
              </div>
            </div>
          </div>

          {/* Public Dares Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Public Dares</h2>
            {filterAndSortAllDares(dedupeDaresByUser(publicDares))
              .filter(dare => dare.creator?._id !== userId)
              .length === 0 ? (
              <div className="bg-neutral-900/40 rounded-xl p-8 border border-neutral-800/30 text-center">
                <div className="text-neutral-400 text-lg">No public dares available.</div>
              </div>
            ) : (
              <div className="grid gap-4">
                {filterAndSortAllDares(dedupeDaresByUser(publicDares))
                  .filter(dare => dare.creator?._id !== userId)
                  .map(dare => (
                    <div key={dare._id} className="bg-neutral-900/60 rounded-xl p-6 border border-neutral-800/50 hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02] group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <StatusBadge status={dare.difficulty} />
                          <div className="flex items-center gap-3">
                            <span className="text-neutral-400 text-sm">Created by</span>
                            <div className="flex items-center gap-2 group-hover:underline">
                              <Avatar user={dare.creator} size={40} />
                              <span className="font-bold text-white">{dare.creator?.fullName || dare.creator?.username || 'User'}</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => navigate(`/dare/consent/${dare._id}`)}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-6 py-3 font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:from-purple-700 hover:to-pink-700"
                          aria-label="Participate in this dare"
                        >
                          Participate
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>

          {/* Public Switch Games Section */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">Public Switch Games</h2>
            {mySwitchGames.filter(game => game.isPublic && game.status !== 'completed').length === 0 ? (
              <div className="bg-neutral-900/40 rounded-xl p-8 border border-neutral-800/30 text-center">
                <div className="text-neutral-400 text-lg">No public switch games available.</div>
              </div>
            ) : (
              <div className="grid gap-4">
                {filterAndSortSwitchGames(mySwitchGames.filter(game => game.isPublic && game.status !== 'completed'))
                  .map(game => (
                    <div key={game._id} className="bg-neutral-900/60 rounded-xl p-6 border border-neutral-800/50 hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02] group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <StatusBadge status={game.difficulty || game.creatorDare?.difficulty} />
                          <div className="flex items-center gap-3">
                            <span className="text-neutral-400 text-sm">Created by</span>
                            <div className="flex items-center gap-2 group-hover:underline">
                              <Avatar user={game.creator} size={40} />
                              <span className="font-bold text-white">{game.creator?.fullName || game.creator?.username || 'User'}</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => navigate(`/switches/consent/${game._id}`)}
                          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-6 py-3 font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:from-purple-700 hover:to-pink-700"
                          aria-label="Participate in this switch game"
                        >
                          Participate
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>
        </div>
      )
    },
    {
      key: 'active',
      label: 'My Active Dares',
      icon: ClockIcon,
      content: (
        <div className="space-y-6">
          {/* Slot Management & Filters */}
          <div className="bg-neutral-900/60 rounded-xl p-4 border border-neutral-800/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Active Dares</h3>
                <div className="text-sm text-neutral-400">
                  {ongoing.length}/{MAX_SLOTS} slots used • {MAX_SLOTS - ongoing.length} available
                </div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
              >
                <FunnelIcon className="w-4 h-4" />
                Filters
              </button>
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Status</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting_for_participant">Waiting</option>
                </select>
                
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Difficulties</option>
                  {DIFFICULTY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                
                <input
                  type="text"
                  placeholder="Search dares..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                
                <button
                  onClick={() => setFilters({ status: '', difficulty: '', type: '', search: '' })}
                  className="flex items-center justify-center gap-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg px-3 py-2 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => navigate('/dare/select')}
              className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-4 font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <PlayIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
              Perform New Dare
            </button>
            
            <button
              onClick={() => navigate('/dare/create')}
              className="group bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-4 font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <PlusIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
              Create Dare
            </button>
            
            <button
              onClick={() => navigate('/public-dares')}
              className="group bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl p-4 font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <SparklesIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
              Browse Public Dares
            </button>
          </div>

          {/* Dares List */}
          {dataLoading.ongoing ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-neutral-900/60 rounded-xl p-6 border border-neutral-800/50 animate-pulse">
                  <div className="h-4 bg-neutral-700 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-neutral-700 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-neutral-700 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filterDares(ongoing).map(dare => (
                <DareCard
                  key={dare._id}
                  description={dare.description}
                  difficulty={dare.difficulty}
                  tags={dare.tags}
                  status={dare.status}
                  creator={dare.creator}
                  performer={dare.performer}
                  assignedSwitch={dare.assignedSwitch}
                  timeInfo={dare.createdAt ? timeAgoOrDuration(dare.createdAt, dare.completedAt, dare.status) : null}
                  actions={[
                    <button
                      key="complete"
                      onClick={() => handleCompleteDare(dare._id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Complete
                    </button>
                  ]}
                  currentUserId={userId}
                />
              ))}
              
              {filterDares(ongoing).length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-neutral-900/40 rounded-xl p-8 border border-neutral-800/30">
                    <ClockIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <div className="text-neutral-400 text-lg mb-2">No active dares</div>
                    <p className="text-neutral-500 text-sm">Start by claiming a dare or creating a new one</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'completed',
      label: 'Completed Dares',
      icon: TrophyIcon,
      content: (
        <div className="space-y-6">
          <div className="bg-neutral-900/60 rounded-xl p-4 border border-neutral-800/50">
            <h3 className="text-lg font-semibold text-white mb-4">Completed Dares</h3>
            <div className="space-y-4">
              {filterDares(completed).map(dare => (
                <DareCard
                  key={dare._id}
                  description={dare.description}
                  difficulty={dare.difficulty}
                  tags={dare.tags}
                  status={dare.status}
                  creator={dare.creator}
                  performer={dare.performer}
                  assignedSwitch={dare.assignedSwitch}
                  currentUserId={userId}
                />
              ))}
              
              {filterDares(completed).length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-neutral-900/40 rounded-xl p-8 border border-neutral-800/30">
                    <TrophyIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <div className="text-neutral-400 text-lg mb-2">No completed dares yet</div>
                    <p className="text-neutral-500 text-sm">Complete your first dare to see it here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'my-switch',
      label: 'My Switch Games',
      icon: FireIcon,
      content: (
        <div className="space-y-6">
          {/* Slot Management & Filters */}
          <div className="bg-neutral-900/60 rounded-xl p-4 border border-neutral-800/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">My Switch Games</h3>
                <div className="text-sm text-neutral-400">
                  {mySwitchGames.filter(game => game.status === 'in_progress').length} active • {mySwitchGames.filter(game => game.status === 'waiting_for_participant').length} waiting
                </div>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
              >
                <FunnelIcon className="w-4 h-4" />
                Filters
              </button>
            </div>
            
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <select
                  value={switchState.statusFilter}
                  onChange={(e) => setSwitchState(prev => ({ ...prev, statusFilter: e.target.value }))}
                  className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Status</option>
                  <option value="waiting_for_participant">Waiting for Participant</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="forfeited">Forfeited</option>
                </select>
                
                <select
                  value={switchState.difficultyFilter}
                  onChange={(e) => setSwitchState(prev => ({ ...prev, difficultyFilter: e.target.value }))}
                  className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Difficulties</option>
                  {DIFFICULTY_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                
                <input
                  type="text"
                  placeholder="Search switch games..."
                  value={switchState.participantFilter}
                  onChange={(e) => setSwitchState(prev => ({ ...prev, participantFilter: e.target.value }))}
                  className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                
                <button
                  onClick={() => {
                    setSwitchState(prev => ({
                      ...prev,
                      statusFilter: '',
                      difficultyFilter: '',
                      participantFilter: ''
                    }));
                  }}
                  className="flex items-center justify-center gap-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg px-3 py-2 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => navigate('/switches/create')}
              className="group bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-4 font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <PlusIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
              Create Switch Game
            </button>
            
            <button
              onClick={() => navigate('/switches/join')}
              className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-4 font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <UserIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
              Join Switch Game
            </button>
          </div>

          {/* Switch Games List */}
          {dataLoading.switchGames ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-neutral-900/60 rounded-xl p-6 border border-neutral-800/50 animate-pulse">
                  <div className="h-4 bg-neutral-700 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-neutral-700 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-neutral-700 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filterAndSortSwitchGames(mySwitchGames.filter(game => game.status !== 'completed'))
                .map((game, idx) => (
                  <DareCard
                    key={game._id}
                    description={game.creatorDare?.description || ''}
                    difficulty={game.difficulty || game.creatorDare?.difficulty}
                    tags={game.tags}
                    status={game.status}
                    creator={game.creator}
                    performer={game.participant}
                    currentUserId={userId}
                    timeInfo={game.createdAt ? timeAgoOrDuration(game.createdAt, game.completedAt, game.status) : null}
                    actions={
                      <div className="flex items-center gap-2">
                        {game.status === 'waiting_for_participant' && game.creator?._id === userId && (
                          <button
                            onClick={() => navigate(`/switches/${game._id}/edit`)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                          >
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/switches/${game._id}`)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                        >
                          View Details
                        </button>
                        {game.status === 'waiting_for_participant' && game.creator?._id !== userId && (
                          <button
                            onClick={() => handleJoinSwitchGame(game._id)}
                            className="px-3 py-1 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 transition-colors"
                          >
                            Participate
                          </button>
                        )}
                        {game.status === 'in_progress' && game.participant?._id === userId && (
                          <button
                            onClick={() => navigate(`/switches/${game._id}/perform`)}
                            className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
                          >
                            Perform
                          </button>
                        )}
                        {game.status === 'completed' && (
                          <button
                            onClick={() => navigate(`/switches/${game._id}/results`)}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                          >
                            View Results
                          </button>
                        )}
                      </div>
                    }
                  />
                ))}
              {filterAndSortSwitchGames(mySwitchGames.filter(game => game.status !== 'completed')).length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-neutral-900/40 rounded-xl p-8 border border-neutral-800/30">
                    <FireIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <div className="text-neutral-400 text-lg mb-2">No switch games</div>
                    <p className="text-neutral-500 text-sm">Create or join a switch game to get started</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'completed-switch',
      label: 'Completed Switch Games',
      icon: TrophyIcon,
      content: (
        <div className="space-y-6">
          <div className="bg-neutral-900/60 rounded-xl p-4 border border-neutral-800/50">
            <h3 className="text-lg font-semibold text-white mb-4">Completed Switch Games</h3>
            <div className="space-y-4">
              {mySwitchGames.filter(game => game.status === 'completed').map(game => (
                <DareCard
                  key={game._id}
                  description={game.creatorDare?.description || ''}
                  difficulty={game.difficulty || game.creatorDare?.difficulty}
                  tags={game.tags}
                  status={game.status}
                  creator={game.creator}
                  performer={game.participant}
                  currentUserId={userId}
                  timeInfo={game.createdAt ? timeAgoOrDuration(game.createdAt, game.completedAt, game.status) : null}
                  actions={
                    <button
                      onClick={() => navigate(`/switches/${game._id}/results`)}
                      className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                    >
                      View Results
                    </button>
                  }
                />
              ))}
              {mySwitchGames.filter(game => game.status === 'completed').length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-neutral-900/40 rounded-xl p-8 border border-neutral-800/30">
                    <TrophyIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <div className="text-neutral-400 text-lg mb-2">No completed switch games</div>
                    <p className="text-neutral-500 text-sm">Complete switch games to see them here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }
  ];

  // Check if user is authenticated and has valid user ID
  if (!user || !userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-red-400 mb-4">Authentication Required</h2>
              <p className="text-red-300 mb-4">
                {!user ? 'Please log in to access the performer dashboard.' : 'User data is invalid. Please log in again.'}
              </p>
              <button
                onClick={() => navigate('/login')}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-purple-600 text-white px-4 py-2 rounded z-50">Skip to main content</a>
      
      <main id="main-content" tabIndex="-1" role="main">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <UserIcon className="w-12 h-12 text-white mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">Performer Dashboard</h1>
            </div>
            <p className="text-xl text-white/80">Manage your dares and track your progress</p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-4 text-red-300 text-center mb-6" role="alert" aria-live="assertive">
              <div className="flex items-center justify-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Individual Section Errors */}
          {Object.entries(errors).map(([section, errorMsg]) => errorMsg && (
            <div key={section} className="bg-orange-900/20 border border-orange-800/30 rounded-xl p-3 text-orange-300 text-sm mb-4" role="alert" aria-live="polite">
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="w-4 h-4" />
                <span className="capitalize">{section}: {errorMsg}</span>
              </div>
            </div>
          ))}

          {/* Tabs */}
          <Tabs
            tabs={tabs}
            value={tabs.findIndex(t => t.key === activeTab)}
            onChange={idx => setActiveTab(tabs[idx].key)}
            className="mb-8"
          />

          {/* Notification */}
          {notification && (
            <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg text-white ${
              notification.type === 'error' ? 'bg-red-600' : 
              notification.type === 'success' ? 'bg-green-600' : 'bg-blue-600'
            }`} role="alert" aria-live="assertive" aria-atomic="true">
              {notification.message}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
