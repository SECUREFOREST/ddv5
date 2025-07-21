import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import DareCard from '../components/DareCard';
import { DARE_DIFFICULTIES } from '../tailwindColors';
import { useRef } from 'react';
import Slot from '../components/Slot';
import Accordion from '../components/Accordion';
import DashboardChart from '../components/DashboardChart';
import { UserIcon } from '@heroicons/react/24/solid';
import { io } from 'socket.io-client';
import { Squares2X2Icon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import Tabs from '../components/Tabs';

/**
 * DarePerformerDashboard - Modern React/Tailwind implementation of the legacy performer dashboard.
 * Features: slots management, ongoing/completed dares, public dares browser, demand slots, cooldown, advanced filtering, accessibility.
 * All legacy flows and UI are preserved, with modern improvements and componentization.
 */
// Constants for slot limits and cooldown (stub values)
const MAX_SLOTS = 5;
const COOLDOWN_SECONDS = 60 * 5; // 5 minutes

// Helper for time ago/status
function timeAgoOrDuration(start, end, status) {
  const now = Date.now();
  if (status === 'in_progress' && start) {
    const diff = Math.floor((now - new Date(start).getTime()) / 1000);
    if (diff < 60) return `awaiting pic for ${diff}s`;
    if (diff < 3600) return `awaiting pic for ${Math.floor(diff / 60)}m ${diff % 60}s`;
    return `awaiting pic for ${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
  }
  if ((status === 'completed' || status === 'cancelled' || status === 'user_deleted') && end) {
    const diff = Math.floor((now - new Date(end).getTime()) / 1000);
    if (diff < 60) return `${status} ${diff}s ago`;
    if (diff < 3600) return `${status} ${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${status} ${Math.floor(diff / 3600)}h ago`;
    return `${status} ${Math.floor(diff / 86400)}d ago`;
  }
  return status;
}

// Helper for rare rejection reasons
function getRejectionExplanation(reason) {
  const map = {
    chicken: 'chickened out',
    impossible: 'think it\'s not possible or safe for anyone to do',
    incomprehensible: 'couldn\'t understand what was being demanded',
    abuse: 'have reported the demand as abuse',
  };
  return map[reason] || reason;
}

// Helper to deduplicate dares by user
function dedupeDaresByUser(dares) {
  const seen = new Set();
  return dares.filter(dare => {
    const id = dare.user?._id || dare.user?.id || dare.creator?._id || dare.creator?.id;
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

// Helper: difficulty badge (fix ReferenceError)
function difficultyBadge(level) {
  const found = DARE_DIFFICULTIES.find(d => d.value === level);
  const label = found ? found.label : (level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Unknown');
  let badgeClass = 'bg-neutral-700 text-neutral-100';
  switch (level) {
    case 'titillating': badgeClass = 'bg-pink-600 text-white'; break;
    case 'arousing': badgeClass = 'bg-purple-700 text-white'; break;
    case 'explicit': badgeClass = 'bg-red-700 text-white'; break;
    case 'edgy': badgeClass = 'bg-yellow-700 text-white'; break;
    case 'hardcore': badgeClass = 'bg-black text-white border border-red-700'; break;
    default: break;
  }
  return <span className={`inline-block rounded px-2 py-1 text-xs font-semibold ${badgeClass} ml-2`} title={label}>{label}</span>;
}

// Helper: status badge (fix ReferenceError)
function statusBadge(status) {
  const map = {
    waiting_for_participant: { label: 'Waiting', color: 'bg-blue-700 text-white' },
    in_progress: { label: 'In Progress', color: 'bg-info text-info-contrast' },
    completed: { label: 'Completed', color: 'bg-green-700 text-white' },
    forfeited: { label: 'Forfeited', color: 'bg-red-700 text-white' },
    expired: { label: 'Expired', color: 'bg-neutral-700 text-white' },
  };
  const s = map[status] || { label: status, color: 'bg-neutral-700 text-white' };
  return <span className={`inline-block rounded px-2 py-1 text-xs font-semibold ${s.color}`} title={status}>{s.label}</span>;
}

export default function DarePerformerDashboard() {
  const { user } = useAuth();
  // Notification system
  const [notification, setNotification] = useState(null);
  const notificationTimeout = useRef(null);
  const showNotification = (msg, type = 'info') => {
    setNotification({ msg, type });
    if (notificationTimeout.current) clearTimeout(notificationTimeout.current);
    notificationTimeout.current = setTimeout(() => setNotification(null), 4000);
  };
  // Loading states
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [completedLoading, setCompletedLoading] = useState(false);
  const [demandLoading, setDemandLoading] = useState(false);
  // Confirmation dialog for withdraw
  const [confirmWithdrawIdx, setConfirmWithdrawIdx] = useState(null);

  // Slots management
  const [slots, setSlots] = useState([]); // [{dare, status, ...}]
  const [cooldownUntil, setCooldownUntil] = useState(null);
  // Ongoing/completed dares
  const [ongoing, setOngoing] = useState([]);
  const [completed, setCompleted] = useState([]);
  // Public dares
  const [publicDares, setPublicDares] = useState([]);
  const [publicLoading, setPublicLoading] = useState(false);
  const [publicError, setPublicError] = useState('');
  // Add multi-select type filter state
  const TYPE_OPTIONS = [
    { value: 'text', label: 'Text' },
    { value: 'photo', label: 'Photo' },
    { value: 'video', label: 'Video' },
    { value: 'audio', label: 'Audio' },
  ];
  const [selectedTypes, setSelectedTypes] = useState([]);
  // Demand section filter and state variables
  const [selectedDemandDifficulties, setSelectedDemandDifficulties] = useState([]);
  const [selectedDemandTypes, setSelectedDemandTypes] = useState([]);
  const [demandKeywordFilter, setDemandKeywordFilter] = useState('');
  const [demandCreatorFilter, setDemandCreatorFilter] = useState('');
  const [publicDemandDares, setPublicDemandDares] = useState([]);
  const [publicDemandLoading, setPublicDemandLoading] = useState(false);
  const [publicDemandError, setPublicDemandError] = useState('');
  const [expandedPublicDemandIdx, setExpandedPublicDemandIdx] = useState(null);
  const [completedDemand, setCompletedDemand] = useState([]);
  // Dashboard settings modal state
  const [showDashboardSettings, setShowDashboardSettings] = useState(false);
  // UI state
  const [error, setError] = useState('');
  const [claiming, setClaiming] = useState(false);
  // Add demandSlots state
  const [demandSlots, setDemandSlots] = useState([]);
  const [tab, setTab] = useState(() => localStorage.getItem('performerDashboardTab') || 'perform');
  // Add Switch Game tab
  const TABS = [
    { key: 'all', label: 'All Dares' },
    { key: 'switch', label: 'Switch Games' },
  ];

  // Switch Games state
  const [mySwitchGames, setMySwitchGames] = useState([]);
  const [mySwitchGamesLoading, setMySwitchGamesLoading] = useState(false);
  const [switchGameHistory, setSwitchGameHistory] = useState([]);
  const [switchGameHistoryLoading, setSwitchGameHistoryLoading] = useState(false);
  const [switchGamesError, setSwitchGamesError] = useState('');
  const [publicSwitchDifficulty, setPublicSwitchDifficulty] = useState('');
  const [publicSwitchError, setPublicSwitchError] = useState('');
  const [publicSwitchLoading, setPublicSwitchLoading] = useState(false);
  const [publicSwitchDares, setPublicSwitchDares] = useState([]);
  const [allDaresStatus, setAllDaresStatus] = useState("");
  const [allDaresDifficulty, setAllDaresDifficulty] = useState("");
  const [allDaresParticipant, setAllDaresParticipant] = useState("");
  const [allDaresSort, setAllDaresSort] = useState("recent");
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  const [keywordFilter, setKeywordFilter] = useState('');
  const [creatorFilter, setCreatorFilter] = useState('');

  // Filtering and sorting logic for All Dares tab (must be inside component)
  function filterAndSortAllDares(dares) {
    let filtered = dares;
    if (allDaresStatus) filtered = filtered.filter(d => d.status === allDaresStatus);
    if (allDaresDifficulty) filtered = filtered.filter(d => d.difficulty === allDaresDifficulty);
    if (allDaresParticipant) filtered = filtered.filter(d =>
      (d.creator?.username && d.creator.username.toLowerCase().includes(allDaresParticipant.toLowerCase())) ||
      (d.performer?.username && d.performer.username.toLowerCase().includes(allDaresParticipant.toLowerCase()))
    );
    if (allDaresSort === 'recent') filtered = filtered.slice().sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    if (allDaresSort === 'oldest') filtered = filtered.slice().sort((a, b) => new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt));
    if (allDaresSort === 'status') filtered = filtered.slice().sort((a, b) => (a.status || '').localeCompare(b.status || ''));
    if (allDaresSort === 'difficulty') filtered = filtered.slice().sort((a, b) => (a.difficulty || '').localeCompare(b.difficulty || ''));
    return filtered;
  }

  // Derived arrays for All Dares tab (must be inside component)
  const allActiveDares = [
    ...ongoing.map(d => ({ ...d, _type: "perform" })),
    ...demandSlots.map(d => ({ ...d, _type: "demand" }))
  ].filter(dare => {
    const userId = user?._id || user?.id;
    return dare.creator?._id === userId || dare.creator?.id === userId || dare.performer?._id === userId || dare.performer?.id === userId || dare.participant?._id === userId || dare.participant?.id === userId;
  });
  const allCompletedDares = [
    ...completed.map(d => ({ ...d, _type: "perform" })),
    ...completedDemand.map(d => ({ ...d, _type: "demand" }))
  ];
  const navigate = useNavigate();
  const userId = user?._id || user?.id;
  const filteredMySwitchGames = mySwitchGames.filter(game =>
    game.creator?._id === userId || game.creator?.id === userId ||
    game.participant?._id === userId || game.participant?.id === userId
  );
  const filteredSwitchGameHistory = switchGameHistory.filter(game =>
    game.creator?._id === userId || game.creator?.id === userId ||
    game.participant?._id === userId || game.participant?.id === userId
  );

  // Advanced filter/sort state for Switch Games tab (fix ReferenceError)
  const [switchStatusFilter, setSwitchStatusFilter] = useState('');
  const [switchDifficultyFilter, setSwitchDifficultyFilter] = useState('');
  const [switchParticipantFilter, setSwitchParticipantFilter] = useState('');
  const [switchSort, setSwitchSort] = useState('recent');

  // Filtering and sorting logic for Switch Games tab (fix ReferenceError)
  function filterAndSortSwitchGames(games) {
    let filtered = games;
    if (switchStatusFilter) filtered = filtered.filter(g => g.status === switchStatusFilter);
    if (switchDifficultyFilter) filtered = filtered.filter(g => g.difficulty === switchDifficultyFilter || g.creatorDare?.difficulty === switchDifficultyFilter);
    if (switchParticipantFilter) filtered = filtered.filter(g =>
      (g.creator?.username && g.creator.username.toLowerCase().includes(switchParticipantFilter.toLowerCase())) ||
      (g.participant?.username && g.participant.username.toLowerCase().includes(switchParticipantFilter.toLowerCase()))
    );
    if (switchSort === 'recent') filtered = filtered.slice().sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    if (switchSort === 'oldest') filtered = filtered.slice().sort((a, b) => new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt));
    if (switchSort === 'status') filtered = filtered.slice().sort((a, b) => (a.status || '').localeCompare(b.status || ''));
    if (switchSort === 'difficulty') filtered = filtered.slice().sort((a, b) => (a.difficulty || a.creatorDare?.difficulty || '').localeCompare(b.difficulty || b.creatorDare?.difficulty || ''));
    return filtered;
  }

  useEffect(() => {
    if (tab !== 'switch' || !user) return;
    setMySwitchGamesLoading(true);
    setSwitchGamesError('');
    api.get('/switches/performer')
      .then(res => setMySwitchGames(Array.isArray(res.data) ? res.data : []))
      .catch(() => setSwitchGamesError('Failed to load your switch games.'))
      .finally(() => setMySwitchGamesLoading(false));
    setSwitchGameHistoryLoading(true);
    api.get('/switches/history')
      .then(res => setSwitchGameHistory(Array.isArray(res.data) ? res.data : []))
      .catch(() => setSwitchGamesError('Failed to load switch game history.'))
      .finally(() => setSwitchGameHistoryLoading(false));
  }, [tab, user]);
  // Add at the top, after other state:
  const [publicActCounts, setPublicActCounts] = useState({ total: 0, submission: 0, domination: 0, switch: 0 });
  // Add state for expanded details
  const [expandedOngoingIdx, setExpandedOngoingIdx] = useState(null);
  const [expandedPublicIdx, setExpandedPublicIdx] = useState(null);
  // Add state for expanded associate details
  const [expandedAssociateIdx, setExpandedAssociateIdx] = useState(null);
  // 2. Fetch associates from API
  const [associates, setAssociates] = useState([]);
  useEffect(() => {
    api.get('/users/associates')
      .then(res => setAssociates(Array.isArray(res.data) ? res.data : []))
      .catch(() => setAssociates([]));
  }, []);
  // Prepare associates in rows of 3 for display
  const associatesPerRow = 3;
  const associateRows = [];
  for (let i = 0; i < associates.length; i += associatesPerRow) {
    associateRows.push(associates.slice(i, i + associatesPerRow));
  }

  // Add new state for advanced filters
  const [statusFilter, setStatusFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');

  // At the top of the component, after other state:
  const [roleStats, setRoleStats] = useState(null);
  useEffect(() => {
    if (!user) return;
    api.get(`/stats/users/${user.id || user._id}`)
      .then(res => setRoleStats(res.data))
      .catch(() => setRoleStats(null));
  }, [user]);

  // On mount, fetch /user_settings for dashboard_tab
  useEffect(() => {
    let didSet = false;
    api.get('/user_settings')
      .then(res => {
        if (res.data && res.data.dashboard_tab) {
          setTab(res.data.dashboard_tab);
          didSet = true;
        }
      })
      .catch(() => { });
    // Fallback to localStorage if not set by API
    if (!didSet) {
      const saved = localStorage.getItem('performerDashboardTab');
      if (saved) setTab(saved);
    }
  }, []);
  // On tab change, persist to API and localStorage
  useEffect(() => {
    if (!tab) return;
    localStorage.setItem('performerDashboardTab', tab);
    api.post('/user_settings', { dashboard_tab: tab }).catch(() => { });
  }, [tab]);

  // Fetch slots, ongoing, completed, and cooldown from API
  useEffect(() => {
    if (!user) return;
    setError('');
    setSlotsLoading(true);
    setCompletedLoading(true);
    setDemandLoading(true);
    // Fetch perform slots (ongoing dares)
    api.get('/dares/performer?status=in_progress')
      .then(res => setSlots(res.data))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
    // Fetch completed dares
    api.get('/dares/performer?status=completed')
      .then(res => setCompleted(res.data))
      .catch(() => setCompleted([]))
      .finally(() => setCompletedLoading(false));
    // Fetch ongoing dares (alias for slots)
    api.get('/dares/performer?status=in_progress')
      .then(res => setOngoing(res.data))
      .catch(() => setOngoing([]));
    // Fetch demand slots (dares created by user, in progress)
    api.get(`/dares?creator=${user._id}&status=in_progress`)
      .then(res => setDemandSlots(res.data))
      .catch(() => setDemandSlots([]))
      .finally(() => setDemandLoading(false));
    // TODO: Fetch cooldown from user profile if available
  }, [user]);

  // 1. Remove fallback for public dare counts
  useEffect(() => {
    api.get('/stats/public-acts')
      .then(res => setPublicActCounts(res.data))
      .catch(() => setPublicActCounts({})); // Optionally show an error or leave empty
  }, []);

  // Persist public dares filter state
  useEffect(() => {
    const saved = localStorage.getItem('publicDaresFilters');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.selectedDifficulties) setSelectedDifficulties(parsed.selectedDifficulties);
        if (parsed.selectedTypes) setSelectedTypes(parsed.selectedTypes);
        if (parsed.keyword) setDemandKeywordFilter(parsed.keyword);
        if (parsed.creator) setDemandCreatorFilter(parsed.creator);
      } catch { }
    }
  }, []);
  useEffect(() => {
    localStorage.setItem('publicDaresFilters', JSON.stringify({ selectedDifficulties, selectedTypes, keywordFilter, creatorFilter }));
  }, [selectedDifficulties, selectedTypes, keywordFilter, creatorFilter]);

  // Fetch public dares
  useEffect(() => {
    setPublicLoading(true);
    setPublicError('');
    api.get('/dares', { params: { public: true, status: statusFilter, tag: tagFilter } })
      .then(res => setPublicDares(Array.isArray(res.data) ? res.data : []))
      .catch(() => setPublicError('Failed to load public dares.'))
      .finally(() => setPublicLoading(false));
  }, [selectedDifficulties, selectedTypes, keywordFilter, creatorFilter, statusFilter, tagFilter]);

  // Fetch public demand dares
  useEffect(() => {
    setPublicDemandLoading(true);
    setPublicDemandError('');
    // Use dareType: 'domination' as a valid backend value (update as needed)
    api.get('/dares', { params: { public: true, dareType: 'domination' } })
      .then(res => setPublicDemandDares(Array.isArray(res.data) ? res.data : []))
      .catch(() => setPublicDemandError('Failed to load public demand dares.'))
      .finally(() => setPublicDemandLoading(false));
  }, [selectedDemandDifficulties, selectedDemandTypes, demandKeywordFilter, demandCreatorFilter]);

  // Add real-time updates for public dares using socket.io-client
  useEffect(() => {
    const socket = io('https://www.deviantdare.com'); // Replace with your backend URL
    socket.on('public_dare_publish', dare => setPublicDares(prev => [dare, ...prev]));
    socket.on('public_dare_unpublish', dareId => setPublicDares(prev => prev.filter(d => d._id !== dareId)));
    return () => socket.disconnect();
  }, []);

  // Claim a public dare (if slots available and not in cooldown)
  const handleClaimDare = async (dare) => {
    if (slots.length >= MAX_SLOTS) {
      showNotification('You have reached your maximum number of perform slots. Complete or reject a dare to free up a slot.', 'error');
      return;
    }
    if (cooldownUntil && new Date() < new Date(cooldownUntil)) {
      showNotification('You are in cooldown. Please wait before claiming a new dare.', 'error');
      return;
    }
    setClaiming(true);
    setError('');
    try {
      // Use /dares/random to claim a dare (optionally pass difficulty)
      const res = await api.get(`/dares/random${dare.difficulty ? `?difficulty=${dare.difficulty}` : ''}`);
      // Add to slots and refresh
      setSlots(prev => [...prev, res.data]);
      setOngoing(prev => [...prev, res.data]);
      showNotification('Dare claimed successfully!', 'success');
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to claim dare.', 'error');
    } finally {
      setClaiming(false);
    }
  };

  // Complete or reject a dare (free up slot)
  // Performer: Complete a dare by submitting proof (even if just text)
  const handleCompleteDare = async (slotIdx) => {
    const dare = slots[slotIdx];
    try {
      // For now, submit minimal proof (could open a modal for real proof)
      await api.post(`/dares/${dare._id}/proof`, { text: 'Completed via dashboard quick-complete.' });
      setSlots(prev => prev.filter((_, i) => i !== slotIdx));
      setOngoing(prev => prev.filter((d, i) => i !== slotIdx));
      setCompleted(prev => [...prev, { ...dare, status: 'completed', completedAt: new Date() }]);
      showNotification('Dare marked as completed!', 'success');
    } catch (err) {
      showNotification('Failed to complete dare.', 'error');
    }
  };
  // Performer: Forfeit (reject) a dare
  const handleRejectDare = async (slotIdx) => {
    const dare = slots[slotIdx];
    try {
      await api.post(`/dares/${dare._id}/forfeit`);
      setSlots(prev => prev.filter((_, i) => i !== slotIdx));
      setOngoing(prev => prev.filter((d, i) => i !== slotIdx));
      // Start cooldown
      setCooldownUntil(new Date(Date.now() + COOLDOWN_SECONDS * 1000));
      showNotification('Dare rejected (forfeited). You are now in cooldown.', 'info');
    } catch (err) {
      showNotification('Failed to reject dare.', 'error');
    }
  };

  // Withdraw handler for demand slots
  const handleWithdrawDemand = async (slotIdx) => {
    const dare = demandSlots[slotIdx];
    try {
      // PATCH dare status to 'cancelled' (or DELETE if supported)
      await api.patch(`/dares/${dare._id}`, { status: 'cancelled' });
      setDemandSlots(prev => prev.filter((_, i) => i !== slotIdx));
      showNotification('Demand dare withdrawn.', 'success');
    } catch (err) {
      showNotification('Failed to withdraw demand dare.', 'error');
    }
  };

  // Filtering UI
  // Multi-select difficulty filter UI
  // Add icons for each difficulty (Heroicons)
  const DIFFICULTY_ICONS = {
    titillating: <svg className="w-5 h-5 text-pink-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-14a6 6 0 110 12A6 6 0 0110 4z" /></svg>,
    arousing: <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 018 8c0 3.866-3.134 7-7 7s-7-3.134-7-7a8 8 0 018-8zm0 2a6 6 0 100 12A6 6 0 0010 4z" /></svg>,
    explicit: <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-14a6 6 0 110 12A6 6 0 0110 4z" /></svg>,
    edgy: <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 018 8c0 3.866-3.134 7-7 7s-7-3.134-7-7a8 8 0 018-8zm0 2a6 6 0 100 12A6 6 0 0010 4z" /></svg>,
    hardcore: <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-14a6 6 0 110 12A6 6 0 0110 4z" /></svg>,
  };
  const renderDifficultyChips = () => (
    <div className="flex gap-2 mb-4" aria-label="Filter by difficulty">
      {DARE_DIFFICULTIES.map(d => (
        <button
          key={d.value}
          type="button"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-contrast
            ${selectedDifficulties.includes(d.value)
              ? 'border-primary bg-primary/10 text-primary scale-105 shadow-lg'
              : 'border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-primary hover:bg-neutral-800/60'}`}
          onClick={() => setSelectedDifficulties(selectedDifficulties.includes(d.value)
            ? selectedDifficulties.filter(d => d !== d.value)
            : [...selectedDifficulties, d.value])}
          aria-pressed={selectedDifficulties.includes(d.value)}
          aria-label={`Toggle difficulty: ${d.label}`}
        >
          {DIFFICULTY_ICONS[d.value]}
          <span>{d.label}</span>
        </button>
      ))}
    </div>
  );


  // Update renderFilters to use chips instead of dropdown for difficulty
  const renderFilters = () => (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      {renderDifficultyChips()}
    </div>
  );

  // Advanced filter stubs (below existing filters)
  const renderAdvancedFilters = () => (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary" aria-label="Filter by dare status">
        <option value="">All Statuses</option>
        <option value="completed">Completed</option>
        <option value="in_progress">In Progress</option>
        <option value="waiting_for_participant">Waiting for Participant</option>
        <option value="forfeited">Forfeited</option>
      </select>
      <input value={tagFilter} onChange={e => setTagFilter(e.target.value)} placeholder="Filter by tag" className="rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary" />
    </div>
  );

  // Slot status badge helper
  const renderStatusBadge = (status) => {
    let color = 'bg-gray-400';
    let label = status;
    if (status === 'in_progress') { color = 'bg-blue-500'; label = 'In Progress'; }
    if (status === 'awaiting_proof') { color = 'bg-yellow-500'; label = 'Awaiting Proof'; }
    if (status === 'completed') { color = 'bg-green-500'; label = 'Completed'; }
    if (status === 'rejected') { color = 'bg-red-500'; label = 'Rejected'; }
    if (status === 'cancelled') { color = 'bg-gray-500'; label = 'Cancelled'; }
    return <span className={`status-badge ${color} text-white text-xs px-2 py-1 rounded ml-2`} /* Tailwind: text-xs px-2 py-1 rounded ml-2 */>{label}</span>;
  };

  // Multi-select demand difficulty filter UI
  const renderDemandDifficultyChips = () => (
    <div className="flex gap-2 mb-4" aria-label="Filter demand by difficulty">
      {DARE_DIFFICULTIES.map(d => (
        <button
          key={d.value}
          type="button"
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-contrast
            ${selectedDemandDifficulties.includes(d.value)
              ? 'border-primary bg-primary/10 text-primary scale-105 shadow-lg'
              : 'border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-primary hover:bg-neutral-800/60'}`}
          onClick={() => setSelectedDemandDifficulties(selectedDemandDifficulties.includes(d.value)
            ? selectedDemandDifficulties.filter(d => d !== d.value)
            : [...selectedDemandDifficulties, d.value])}
          aria-pressed={selectedDemandDifficulties.includes(d.value)}
          aria-label={`Toggle demand difficulty: ${d.label}`}
        >
          {DIFFICULTY_ICONS[d.value]}
          <span>{d.label}</span>
        </button>
      ))}
    </div>
  );

  // Multi-select demand type filter UI
  const renderDemandTypeChips = () => (
    <div className="flex gap-2 mb-4" aria-label="Filter demand by type">
      {TYPE_OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          className={`px-3 py-1 rounded border text-sm font-medium transition ${selectedDemandTypes.includes(opt.value) ? 'bg-blue-500 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100'}`}
          onClick={() => setSelectedDemandTypes(selectedDemandTypes.includes(opt.value)
            ? selectedDemandTypes.filter(t => t !== opt.value)
            : [...selectedDemandTypes, opt.value])}
          aria-pressed={selectedDemandTypes.includes(opt.value)}
          aria-label={`Toggle demand type: ${opt.label}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  // Demand filters UI
  const renderDemandFilters = () => (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      {renderDemandDifficultyChips()}
      {renderDemandTypeChips()}
      <input
        type="text"
        className="rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary"
        placeholder="Search by keyword"
        value={demandKeywordFilter}
        onChange={e => setDemandKeywordFilter(e.target.value)}
        aria-label="Search for public demand offers by keyword"
      />
      <input
        type="text"
        className="rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary"
        placeholder="Filter by creator username"
        value={demandCreatorFilter}
        onChange={e => setDemandCreatorFilter(e.target.value)}
        aria-label="Filter public demand offers by creator username"
      />
    </div>
  );

  // Dashboard/overview UI
  const tabLabels = [
    'All Dares',
    'Perform Dare',
    'Demand Dare',
    'Switch Games'
  ];
  // ... existing code ...
  // (No need to render {tabContents[tabIdx]})
  // ... existing code ...

  return (
    <div className="max-w-md sm:max-w-2xl lg:max-w-4xl w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl p-0 sm:p-8 mb-8 overflow-hidden">
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 flex items-center justify-center h-16 mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight flex items-center gap-2">
          <UserIcon className="w-7 h-7 text-primary" aria-hidden="true" /> Performer Dashboard
        </h1>
      </div>
      {/* Tabs */}
      <Tabs
        tabs={[
          {
            label: 'All Dares',
            content: (
              <div>
                <h3 className="section-description text-xl font-bold mb-2" aria-label="All Dares">All Dares (Perform & Demand)</h3>
                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 justify-center items-center">
                  <button className="bg-primary text-primary-contrast rounded px-4 py-2 font-semibold hover:bg-primary-dark transition-colors shadow-lg" onClick={() => navigate('/subs/new')}>
                    Create Dare
                  </button>
                  <button className="bg-info text-info-contrast rounded px-4 py-2 font-semibold hover:bg-info-dark transition-colors shadow-lg" onClick={() => navigate('/subs/select')}>
                    Perform Dare
                  </button>
                  <a className="btn btn-primary px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition-colors" onClick={() => navigate('/subs/new')}>
                    Submit Dare
                  </a>
                </div>
                {/* Advanced Filters & Sorting */}
                <div className="flex flex-wrap gap-2 mb-4 items-center">
                  <select value={allDaresStatus} onChange={e => setAllDaresStatus(e.target.value)} className="rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary" aria-label="Filter by status">
                    <option value="">All Statuses</option>
                    <option value="waiting_for_participant">Waiting</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="forfeited">Forfeited</option>
                  </select>
                  <select value={allDaresDifficulty} onChange={e => setAllDaresDifficulty(e.target.value)} className="rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary" aria-label="Filter by difficulty">
                    <option value="">All Difficulties</option>
                    {DARE_DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                  <input type="text" value={allDaresParticipant} onChange={e => setAllDaresParticipant(e.target.value)} placeholder="Search by creator/performer" className="rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary" aria-label="Search by creator or performer username" />
                  <select value={allDaresSort} onChange={e => setAllDaresSort(e.target.value)} className="rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary" aria-label="Sort dares">
                    <option value="recent">Most Recent</option>
                    <option value="oldest">Oldest</option>
                    <option value="status">Status</option>
                    <option value="difficulty">Difficulty</option>
                  </select>
                </div>

                <h4 className="text-lg font-bold text-primary mb-2">Active Dares</h4>
                {filterAndSortAllDares(allActiveDares).length === 0 ? (
                  <div className="text-neutral-400 text-center py-4">No active dares. Claim or create a dare to get started!</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {filterAndSortAllDares(allActiveDares).map(dare => (
                      <div key={dare._id} className="flex flex-col h-full bg-neutral-900 border border-neutral-700 rounded-xl p-5 hover:transition-all duration-150 group" tabIndex={0} aria-label={`View dare ${dare.description || dare._id}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-2">
                            <div>{difficultyBadge(dare.difficulty)}</div>
                            <div>{statusBadge(dare.status)}</div>
                          </div>
                          <div className="text-sm text-neutral-300 truncate flex items-center gap-2">{statusBadge(dare.status)} <span className="ml-2">{dare.updatedAt ? new Date(dare.updatedAt).toLocaleString() : ''}</span></div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-neutral-400">Creator:</span>
                            <Avatar user={dare.creator} size={24} />
                            <span className="text-xs text-neutral-200">{dare.creator?.fullName || dare.creator?.username || 'Unknown'}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-neutral-400">Performer:</span>
                            <Avatar user={dare.performer} size={24} />
                            <span className="text-xs text-neutral-200">{dare.performer?.fullName || dare.performer?.username || '—'}</span>
                          </div>
                          <div className="text-xs text-neutral-500 mt-2 text-center">
                            Last updated: {dare.updatedAt ? new Date(dare.updatedAt).toLocaleString() : ''}
                          </div>
                        </div>
                        {/* Action buttons at the bottom */}
                        <div className="flex justify-center gap-2 mt-auto pt-2">
                          {dare._type === 'perform' && dare.status === 'in_progress' && (
                            <button className="px-3 py-1 rounded bg-green-700 text-white text-xs font-semibold hover:bg-green-800 transition shadow-lg" title="Complete" onClick={() => handleCompleteDare(slots.findIndex(d => d._id === dare._id))}>Complete</button>
                          )}
                          {dare._type === 'perform' && dare.status === 'in_progress' && (
                            <button className="px-3 py-1 rounded bg-red-700 text-white text-xs font-semibold hover:bg-red-800 transition shadow-lg" title="Reject" onClick={() => handleRejectDare(slots.findIndex(d => d._id === dare._id))}>Reject</button>
                          )}
                          {dare._type === 'demand' && dare.status === 'in_progress' && (
                            <button className="px-3 py-1 rounded bg-red-700 text-white text-xs font-semibold hover:bg-red-800 transition shadow-lg" title="Withdraw" onClick={() => setConfirmWithdrawIdx(demandSlots.findIndex(d => d._id === dare._id))}>Withdraw</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <h4 className="text-lg font-bold text-primary mb-2 mt-8">Completed Dares</h4>
                {filterAndSortAllDares(allCompletedDares).length === 0 ? (
                  <div className="text-neutral-400 text-center py-4">No completed dares yet.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {filterAndSortAllDares(allCompletedDares).map(dare => (
                      <div key={dare._id} className="flex items-center gap-4 bg-neutral-900 border border-neutral-700 rounded-xl p-5 hover:transition-all duration-150 group" tabIndex={0} aria-label={`View dare ${dare.description || dare._id}`}>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-primary truncate flex items-center">{difficultyBadge(dare.difficulty)}</div>
                          <div className="text-xs text-neutral-400">Creator: {dare.creator?.username || 'Unknown'} Performer: {dare.performer?.username || '—'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* Browse Public Deviant Dares (added to All Dares tab) */}
                <h3 className="section-description text-xl font-bold mb-2 mt-8" aria-label="Browse public dares">Browse Public Deviant Dares</h3>
                {/* Public dare counts summary */}
                <div className="flex flex-wrap gap-2 mb-4" aria-label="Public dare counts">
                  <span className="inline-block bg-primary text-primary-contrast rounded px-3 py-1 text-xs font-semibold">Total Public Dares: {publicActCounts.total}</span>
                  {publicActCounts.submission > 0 && (
                    <span className="inline-block bg-blue-600 text-white rounded px-2 py-1 text-xs font-semibold">Submission: {publicActCounts.submission}</span>
                  )}
                  {publicActCounts.domination > 0 && (
                    <span className="inline-block bg-red-600 text-white rounded px-2 py-1 text-xs font-semibold">Domination: {publicActCounts.domination}</span>
                  )}
                  {publicActCounts.switch > 0 && (
                    <span className="inline-block bg-green-600 text-white rounded px-2 py-1 text-xs font-semibold">Switch: {publicActCounts.switch}</span>
                  )}
                </div>
                {publicError && <div className="text-danger text-center mb-2">{publicError}</div>}
                <div className="public-dares-browser mb-8">
                  {renderFilters()}
                  {renderAdvancedFilters()}
                  {publicLoading ? (
                    <div className="text-center py-8 text-neutral-400">Loading public dares...</div>
                  ) : publicDares.length === 0 ? (
                    selectedDifficulties.length === 0 ? (
                      <div className="text-neutral-400">You need to select at least one difficulty level in order to see some offers.</div>
                    ) : (
                      <div className="text-neutral-400">No public dares found. Try adjusting your filters or check back later for new dares.</div>
                    )
                  ) : (
                    <div className="public-dares-list grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dedupeDaresByUser(publicDares)
                        .filter(dare => dare.dareType !== 'switch' && dare.type !== 'switch' && (!dare.tags || !dare.tags.includes('switch')))
                        .map((dare, idx) => (
                          <div key={dare._id || idx} className="flex items-center gap-4 bg-neutral-900 border border-neutral-700 rounded-xl p-5 mb-2 hover:transition-all duration-150">
                            <img src={dare.user?.avatar || dare.creator?.avatar || '/default-avatar.png'} alt="avatar" className="w-12 h-12 rounded-full object-cover border border-neutral-700" />
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-primary truncate">{dare.user?.username || dare.creator?.username || 'User'}</div>
                              <div className="text-sm text-neutral-300 truncate">{dare.title || dare.description || ''}</div>
                              {/* Add more details as needed */}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                {/* TODO: Public dares browser, advanced filtering, etc. */}
              </div>
            )
          },
          {
            label: 'Switch Games',
            content: (
              <div>
                <h3 className="section-description text-xl font-bold mb-2" aria-label="Switch Games">Switch Games</h3>
                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row gap-4 mb-6 justify-center items-center">
                  <button className="bg-primary text-primary-contrast rounded px-4 py-2 font-semibold hover:bg-primary-dark transition-colors shadow-lg" onClick={() => navigate('/switches/create')}>
                    Create Switch Game
                  </button>
                  <button className="bg-info text-info-contrast rounded px-4 py-2 font-semibold hover:bg-info-dark transition-colors shadow-lg" onClick={() => navigate('/switches/participate')}>
                    Join Switch Game
                  </button>
                </div>
                {/* Advanced Filters & Sorting for Switch Games */}
                <div className="flex flex-wrap gap-2 mb-4 items-center">
                  <select value={switchStatusFilter} onChange={e => setSwitchStatusFilter(e.target.value)} className="rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary" aria-label="Filter by status">
                    <option value="">All Statuses</option>
                    <option value="waiting_for_participant">Waiting</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="forfeited">Forfeited</option>
                    <option value="expired">Expired</option>
                  </select>
                  <select value={switchDifficultyFilter} onChange={e => setSwitchDifficultyFilter(e.target.value)} className="rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary" aria-label="Filter by difficulty">
                    <option value="">All Difficulties</option>
                    {DARE_DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                  <input type="text" value={switchParticipantFilter} onChange={e => setSwitchParticipantFilter(e.target.value)} placeholder="Search by participant" className="rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary" aria-label="Search by participant username" />
                  <select value={switchSort} onChange={e => setSwitchSort(e.target.value)} className="rounded border border-neutral-900 px-3 py-2 bg-[#1a1a1a] text-neutral-100 focus:outline-none focus:ring focus:border-primary" aria-label="Sort switch games">
                    <option value="recent">Most Recent</option>
                    <option value="oldest">Oldest</option>
                    <option value="status">Status</option>
                    <option value="difficulty">Difficulty</option>
                  </select>
                </div>

                <h4 className="text-lg font-bold text-primary mb-2">Your Switch Games</h4>
                {mySwitchGamesLoading ? (
                  <div className="text-neutral-400 text-center py-4">Loading your switch games...</div>
                ) : filterAndSortSwitchGames(filteredMySwitchGames).length === 0 ? (
                  <div className="text-neutral-400 text-center py-4">You have no active switch games. Create or join one to get started!</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {filterAndSortSwitchGames(filteredMySwitchGames).map(game => (
                      <div key={game._id} className="flex flex-col h-full bg-neutral-900 border border-neutral-700 rounded-xl p-5 hover:shadow-lg transition-all duration-150 cursor-pointer group" onClick={() => navigate(`/switches/${game._id}`)} tabIndex={0} aria-label={`View switch game ${game.description || game._id}`}>
                        <Avatar user={game.creator} size={40} alt={`Avatar for ${game.creator?.username || 'creator'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-2">
                            <div>{difficultyBadge(game.difficulty || game.creatorDare?.difficulty)}</div>
                            <div>{statusBadge(game.status)}</div>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-neutral-400">Creator:</span>
                            <Avatar user={game.creator} size={24} />
                            <span className="text-xs text-neutral-200">{game.creator?.fullName || game.creator?.username || 'User'}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-neutral-400">Performer:</span>
                            <Avatar user={game.participant} size={24} />
                            <span className="text-xs text-neutral-200">{game.participant ? game.participant.fullName || game.participant.username : '—'}</span>
                          </div>
                        </div>
                        {/* Action button at the bottom center */}
                        <div className="flex justify-center gap-2 mt-auto pt-2">
                          {game.status === 'in_progress' && (
                            <button className="px-3 py-1 rounded bg-green-700 text-white text-xs font-semibold hover:bg-green-800 transition shadow-lg" title="Complete" onClick={e => { e.stopPropagation(); /* handle complete */ }}>Complete</button>
                          )}
                          {game.status === 'in_progress' && (
                            <button className="px-3 py-1 rounded bg-red-700 text-white text-xs font-semibold hover:bg-red-800 transition shadow-lg" title="Reject" onClick={e => { e.stopPropagation(); /* handle reject */ }}>Reject</button>
                          )}
                          {game.status === 'in_progress' && (
                            <button className="px-3 py-1 rounded bg-green-700 text-white text-xs font-semibold hover:bg-green-800 transition shadow-lg" title="Participate" onClick={e => { e.stopPropagation(); navigate(`/switches/${game._id}`); }}>Participate</button>
                          )}
                          {game.status === 'in_progress' && (
                            <button className="px-3 py-1 rounded bg-red-700 text-white text-xs font-semibold hover:bg-red-800 transition shadow-lg" title="Withdraw" onClick={e => { e.stopPropagation(); handleWithdrawSwitchGame(game._id); }}>Withdraw</button>
                          )}
                          {/* Add more buttons as needed */}
                        </div>
                        <div className="text-xs text-neutral-500 mt-2 text-center">
                          Last updated: {game.updatedAt ? new Date(game.updatedAt).toLocaleString() : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <h4 className="text-lg font-bold text-primary mb-2 mt-8">Switch Game History</h4>
                {switchGameHistoryLoading ? (
                  <div className="text-neutral-400 text-center py-4">Loading switch game history...</div>
                ) : filterAndSortSwitchGames(filteredSwitchGameHistory).length === 0 ? (
                  <div className="text-neutral-400 text-center py-4">No completed or forfeited switch games yet.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {filterAndSortSwitchGames(filteredSwitchGameHistory).map(game => (
                      <div key={game._id} className="flex items-center gap-4 bg-neutral-900 border border-neutral-700 rounded-xl p-5 hover:transition-all duration-150 cursor-pointer group" onClick={() => navigate(`/switches/${game._id}`)} tabIndex={0} aria-label={`View switch game ${game.description || game._id}`}>
                        <Avatar user={game.creator} size={40} alt={`Avatar for ${game.creator?.username || 'creator'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-primary truncate flex items-center">{difficultyBadge(game.difficulty || game.creatorDare?.difficulty)}</div>
                          <div className="text-sm text-neutral-300 truncate flex items-center gap-2">{statusBadge(game.status)} <span className="ml-2">{game.updatedAt ? new Date(game.updatedAt).toLocaleString() : ''}</span></div>
                          <div className="text-xs text-neutral-400">Participants: {game.creator?.username} {game.participant ? `vs ${game.participant?.username}` : ''}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {switchGamesError && <div className="text-danger text-center mt-2">{switchGamesError}</div>}
                {/* Browse Public Deviant Dares (added to Switch Games tab) */}
                <h3 className="section-description text-xl font-bold mb-2 mt-8" aria-label="Browse public dares">Browse Public Deviant Dares</h3>
                {/* Public dare counts summary */}
                <div className="flex flex-wrap gap-2 mb-4" aria-label="Public dare counts">
                  <span className="inline-block bg-primary text-primary-contrast rounded px-3 py-1 text-xs font-semibold">Total Public Dares: {publicActCounts.total}</span>
                  {publicActCounts.submission > 0 && (
                    <span className="inline-block bg-blue-600 text-white rounded px-2 py-1 text-xs font-semibold">Submission: {publicActCounts.submission}</span>
                  )}
                  {publicActCounts.domination > 0 && (
                    <span className="inline-block bg-red-600 text-white rounded px-2 py-1 text-xs font-semibold">Domination: {publicActCounts.domination}</span>
                  )}
                  {publicActCounts.switch > 0 && (
                    <span className="inline-block bg-green-600 text-white rounded px-2 py-1 text-xs font-semibold">Switch: {publicActCounts.switch}</span>
                  )}
                </div>
                {publicError && <div className="text-danger text-center mb-2">{publicError}</div>}
                <div className="public-dares-browser mb-8">
                  {renderFilters()}
                  {renderAdvancedFilters()}
                  {publicLoading ? (
                    <div className="text-center py-8 text-neutral-400">Loading public dares...</div>
                  ) : publicDares.length === 0 ? (
                    selectedDifficulties.length === 0 ? (
                      <div className="text-neutral-400">You need to select at least one difficulty level in order to see some offers.</div>
                    ) : (
                      <div className="text-neutral-400">No public dares found. Try adjusting your filters or check back later for new dares.</div>
                    )
                  ) : (
                    <div className="public-dares-list grid grid-cols-1 md:grid-cols-2 gap-4">
                      {dedupeDaresByUser(publicDares)
                        .filter(dare => dare.dareType === 'switch' || dare.type === 'switch' || (dare.tags && dare.tags.includes('switch')))
                        .map((dare, idx) => (
                          <div key={dare._id || idx} className="flex items-center gap-4 bg-neutral-900 border border-neutral-700 rounded-xl p-5 mb-2 hover:transition-all duration-150">
                            <img src={dare.user?.avatar || dare.creator?.avatar || '/default-avatar.png'} alt="avatar" className="w-12 h-12 rounded-full object-cover border border-neutral-700" />
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-primary truncate">{dare.user?.username || dare.creator?.username || 'User'}</div>
                              <div className="text-sm text-neutral-300 truncate">{dare.title || dare.description || ''}</div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )
          }
        ]}
        value={TABS.findIndex(t => t.key === tab)}
        onChange={idx => setTab(TABS[idx].key)}
        className="mb-8"
      />
      {/* Notification/toast UI */}
      {notification && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white ${notification.type === 'error' ? 'bg-red-600' : notification.type === 'success' ? 'bg-green-600' : 'bg-blue-600'}`}
          role="alert" aria-live="assertive" aria-atomic="true">
          {notification.msg}
        </div>
      )}
      {/* Confirmation dialog for withdraw */}
      {confirmWithdrawIdx !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="withdraw-dialog-title">
          <div className="bg-white rounded p-6 max-w-sm w-full">
            <div className="text-lg font-bold mb-2" id="withdraw-dialog-title">Withdraw Demand Dare</div>
            <div className="mb-4">Are you sure you want to withdraw this dare? This action cannot be undone.</div>
            <div className="flex gap-2 justify-end">
              <button className="btn btn-secondary px-4 py-2 bg-gray-300 text-gray-800 rounded shadow-lg" onClick={() => setConfirmWithdrawIdx(null)} aria-label="Cancel withdraw">Cancel</button>
              <button className="btn btn-danger px-4 py-2 bg-red-600 text-white rounded shadow-lg" onClick={async () => { await handleWithdrawDemand(confirmWithdrawIdx); setConfirmWithdrawIdx(null); }} aria-label="Confirm withdraw">Withdraw</button>
            </div>
          </div>
        </div>
      )}
      {/* Associates Section (stub) */}
      <div className="associates-section mt-8">
        <h3 className="text-xl font-bold mb-2">Associates</h3>
        {associateRows.map((row, rowIdx) => {
          const startIdx = rowIdx * associatesPerRow;
          const expandedIdxInRow = row.findIndex((_, i) => expandedAssociateIdx === startIdx + i);
          return (
            <React.Fragment key={rowIdx}>
              <div className="flex flex-wrap gap-4 mb-2">
                {row.map((a, idx) => (
                  <div key={a.username} className="associate-avatar-link flex flex-col items-center cursor-pointer" onClick={() => setExpandedAssociateIdx(expandedAssociateIdx === startIdx + idx ? null : startIdx + idx)}>
                    <img src={a.avatar} alt={a.username} className="w-16 h-16 rounded-full border-2 border-neutral-700 mb-1" />
                    <span className="text-sm text-neutral-200">{a.username}</span>
                  </div>
                ))}
              </div>
              {expandedIdxInRow !== -1 && (
                <Accordion title="Details" defaultOpen={true} className="mt-2 w-64 mx-auto">
                  <div className="text-sm text-neutral-200">
                    <div><b>Dares together:</b> {row[expandedIdxInRow].daresTogether}</div>
                    <div><b>Last dare:</b> {row[expandedIdxInRow].lastDare}</div>
                  </div>
                </Accordion>
              )}
            </React.Fragment>
          );
        })}
      </div>
      <div className="role-breakdown-section mt-8">
        <h3 className="text-xl font-bold mb-2">Role Breakdown</h3>
        {/* 3. Fetch role breakdown stats for the chart */}
        {roleStats && <DashboardChart stats={roleStats} />}
      </div>
      {/* Add dashboard settings modal (stub) */}
      <button className="bg-primary text-primary-contrast px-4 py-2 rounded mb-4 shadow-lg" onClick={() => setShowDashboardSettings(true)}>Dashboard Settings</button>
      {showDashboardSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#222] border border-[#282828] rounded p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Dashboard Settings</h2>
            <div className="text-neutral-300 mb-4">(Settings coming soon...)</div>
            <button className="bg-primary text-primary-contrast px-4 py-2 rounded shadow-lg" onClick={() => setShowDashboardSettings(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}


// Derived arrays for All Dares tab (must be inside component)
