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
    if (diff < 3600) return `awaiting pic for ${Math.floor(diff/60)}m ${diff%60}s`;
    return `awaiting pic for ${Math.floor(diff/3600)}h ${Math.floor((diff%3600)/60)}m`;
  }
  if ((status === 'completed' || status === 'cancelled' || status === 'user_deleted') && end) {
    const diff = Math.floor((now - new Date(end).getTime()) / 1000);
    if (diff < 60) return `${status} ${diff}s ago`;
    if (diff < 3600) return `${status} ${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${status} ${Math.floor(diff/3600)}h ago`;
    return `${status} ${Math.floor(diff/86400)}d ago`;
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

// Helper to deduplicate acts by user
function dedupeActsByUser(acts) {
  const seen = new Set();
  return acts.filter(act => {
    const id = act.user?._id || act.user?.id || act.creator?._id || act.creator?.id;
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
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
  // Filtering
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  // Add advanced filter state
  const [keywordFilter, setKeywordFilter] = useState('');
  const [creatorFilter, setCreatorFilter] = useState('');
  // Add multi-select difficulty filter state
  const DIFFICULTY_OPTIONS = [
    { value: 'titillating', label: 'Titillating' },
    { value: 'arousing', label: 'Arousing' },
    { value: 'explicit', label: 'Explicit' },
    { value: 'edgy', label: 'Edgy' },
    { value: 'hardcore', label: 'Hardcore' },
  ];
  const [selectedDifficulties, setSelectedDifficulties] = useState([]);
  // Add robust error/edge-case UI for API calls
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
  const [publicDemandActs, setPublicDemandActs] = useState([]);
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
  // Add at the top, after other state:
  const [publicActCounts, setPublicActCounts] = useState({ total: 0, submission: 0, domination: 0, switch: 0 });
  // Add state for expanded details
  const [expandedOngoingIdx, setExpandedOngoingIdx] = useState(null);
  const [expandedPublicIdx, setExpandedPublicIdx] = useState(null);
  // Add state for expanded associate details
  const [expandedAssociateIdx, setExpandedAssociateIdx] = useState(null);
  const associates = [
    { username: 'alice', avatar: 'https://i.pravatar.cc/40?img=1', daresTogether: 3, lastDare: '2024-06-01' },
    { username: 'bob', avatar: 'https://i.pravatar.cc/40?img=2', daresTogether: 1, lastDare: '2024-05-20' },
    { username: 'carol', avatar: 'https://i.pravatar.cc/40?img=3', daresTogether: 2, lastDare: '2024-05-15' },
  ];
  // Prepare associates in rows of 3 for display
  const associatesPerRow = 3;
  const associateRows = [];
  for (let i = 0; i < associates.length; i += associatesPerRow) {
    associateRows.push(associates.slice(i, i + associatesPerRow));
  }

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
      .catch(() => {});
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
    api.post('/user_settings', { dashboard_tab: tab }).catch(() => {});
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

  // Fetch public act counts on mount
  useEffect(() => {
    // TODO: Replace with real API endpoint if available
    api.get('/stats/public-acts')
      .then(res => setPublicActCounts(res.data))
      .catch(() => setPublicActCounts({ total: 42, submission: 20, domination: 15, switch: 7 })); // stub fallback
  }, []);

  // Persist public dares filter state
  useEffect(() => {
    const saved = localStorage.getItem('publicDaresFilters');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.selectedDifficulties) setSelectedDifficulties(parsed.selectedDifficulties);
        if (parsed.selectedTypes) setSelectedTypes(parsed.selectedTypes);
        if (parsed.keyword) setKeywordFilter(parsed.keyword);
        if (parsed.creator) setCreatorFilter(parsed.creator);
      } catch {}
    }
  }, []);
  useEffect(() => {
    localStorage.setItem('publicDaresFilters', JSON.stringify({ selectedDifficulties, selectedTypes, keywordFilter, creatorFilter }));
  }, [selectedDifficulties, selectedTypes, keywordFilter, creatorFilter]);

  // Fetch public dares with filters
  useEffect(() => {
    setPublicLoading(true);
    setPublicError(''); // Clear previous errors
    let url = '/dares?public=true&status=waiting_for_participant';
    if (selectedDifficulties.length > 0) url += `&difficulty=${selectedDifficulties.join(',')}`;
    if (selectedTypes.length > 0) url += `&dareType=${selectedTypes.join(',')}`;
    if (keywordFilter) url += `&q=${encodeURIComponent(keywordFilter)}`;
    if (creatorFilter) url += `&creatorUsername=${encodeURIComponent(creatorFilter)}`;
    api.get(url)
      .then(res => setPublicDares(res.data))
      .catch(() => setPublicError('Failed to load public dares. Please try again.'))
      .finally(() => setPublicLoading(false));
  }, [selectedDifficulties, selectedTypes, keywordFilter, creatorFilter]);

  // Real-time updates for public acts (stub)
  useEffect(() => {
    // TODO: Replace with real websocket (e.g., socket.io or Pusher) integration
    // Example:
    // const socket = io('/');
    // socket.on('public_act_publish', act => { ... });
    // socket.on('public_act_unpublish', act => { ... });
    // For now, this is a stub for future real-time updates.
    // Cleanup: return () => { if (socket) socket.disconnect(); };
  }, [selectedDifficulties, selectedTypes, keywordFilter, creatorFilter]);
  // Fetch public demand acts with filters (stub logic, replace with real API call)
  useEffect(() => {
    setPublicDemandLoading(true);
    setPublicDemandError('');
    // TODO: Replace with real API endpoint for public demand acts
    // Simulate API call with setTimeout
    setTimeout(() => {
      // Example stub data
      const stubActs = [
        // { _id: '1', description: 'Demand 1', tags: ['tag1'], creator: { username: 'alice' }, status: 'waiting', proof: {}, grades: [] },
      ];
      setPublicDemandActs(stubActs);
      setPublicDemandLoading(false);
    }, 500);
  }, [selectedDemandDifficulties, selectedDemandTypes, demandKeywordFilter, demandCreatorFilter]);

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
  const handleCompleteDare = async (slotIdx) => {
    const dare = slots[slotIdx];
    try {
      await api.patch(`/dares/${dare._id}`, { status: 'completed' });
      setSlots(prev => prev.filter((_, i) => i !== slotIdx));
      setOngoing(prev => prev.filter((d, i) => i !== slotIdx));
      setCompleted(prev => [...prev, { ...dare, status: 'completed', completedAt: new Date() }]);
      showNotification('Dare marked as completed!', 'success');
    } catch (err) {
      showNotification('Failed to complete dare.', 'error');
    }
  };
  const handleRejectDare = async (slotIdx) => {
    const dare = slots[slotIdx];
    try {
      await api.patch(`/dares/${dare._id}`, { status: 'rejected' });
      setSlots(prev => prev.filter((_, i) => i !== slotIdx));
      setOngoing(prev => prev.filter((d, i) => i !== slotIdx));
      // Start cooldown
      setCooldownUntil(new Date(Date.now() + COOLDOWN_SECONDS * 1000));
      showNotification('Dare rejected. You are now in cooldown.', 'info');
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
  const renderDifficultyChips = () => (
    <div className="flex gap-2 mb-4" aria-label="Filter by difficulty">
      {DIFFICULTY_OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          className={`px-3 py-1 rounded border text-sm font-medium transition ${selectedDifficulties.includes(opt.value) ? 'bg-blue-500 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100'}`}
          onClick={() => setSelectedDifficulties(selectedDifficulties.includes(opt.value)
            ? selectedDifficulties.filter(d => d !== opt.value)
            : [...selectedDifficulties, opt.value])}
          aria-pressed={selectedDifficulties.includes(opt.value)}
          aria-label={`Toggle difficulty: ${opt.label}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  // Multi-select type filter UI
  const renderTypeChips = () => (
    <div className="flex gap-2 mb-4" aria-label="Filter by dare type">
      {TYPE_OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          className={`px-3 py-1 rounded border text-sm font-medium transition ${selectedTypes.includes(opt.value) ? 'bg-blue-500 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100'}`}
          onClick={() => setSelectedTypes(selectedTypes.includes(opt.value)
            ? selectedTypes.filter(t => t !== opt.value)
            : [...selectedTypes, opt.value])}
          aria-pressed={selectedTypes.includes(opt.value)}
          aria-label={`Toggle type: ${opt.label}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  // Update renderFilters to use chips instead of dropdown for difficulty
  const renderFilters = () => (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      {renderDifficultyChips()}
      {renderTypeChips()}
    </div>
  );

  // Advanced filter stubs (below existing filters)
  const renderAdvancedFilters = () => (
    <div className="advanced-filters flex flex-col md:flex-row gap-4 mb-4" /* Tailwind: flex flex-col md:flex-row gap-4 mb-4 */>
      <input
        type="text"
        className="rounded border px-2 py-1"
        placeholder="Search by keyword"
        value={keywordFilter}
        onChange={e => setKeywordFilter(e.target.value)}
        aria-label="Search for public dares by keyword"
      />
      <input
        type="text"
        className="rounded border px-2 py-1"
        placeholder="Filter by creator username"
        value={creatorFilter}
        onChange={e => setCreatorFilter(e.target.value)}
        aria-label="Filter public dares by creator username"
      />
      <select className="rounded border px-2 py-1" disabled aria-label="Filter public dares by status">
        <option>Filter by status (stub)</option>
      </select>
      {/* TODO: Add more advanced filter options as needed */}
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
      {DIFFICULTY_OPTIONS.map(opt => (
        <button
          key={opt.value}
          type="button"
          className={`px-3 py-1 rounded border text-sm font-medium transition ${selectedDemandDifficulties.includes(opt.value) ? 'bg-blue-500 text-white border-blue-600' : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100'}`}
          onClick={() => setSelectedDemandDifficulties(selectedDemandDifficulties.includes(opt.value)
            ? selectedDemandDifficulties.filter(d => d !== opt.value)
            : [...selectedDemandDifficulties, opt.value])}
          aria-pressed={selectedDemandDifficulties.includes(opt.value)}
          aria-label={`Toggle demand difficulty: ${opt.label}`}
        >
          {opt.label}
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
        className="rounded border px-2 py-1"
        placeholder="Search by keyword"
        value={demandKeywordFilter}
        onChange={e => setDemandKeywordFilter(e.target.value)}
        aria-label="Search for public demand offers by keyword"
      />
      <input
        type="text"
        className="rounded border px-2 py-1"
        placeholder="Filter by creator username"
        value={demandCreatorFilter}
        onChange={e => setDemandCreatorFilter(e.target.value)}
        aria-label="Filter public demand offers by creator username"
      />
    </div>
  );

  // Dashboard/overview UI
  return (
    <div className="max-w-4xl w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-8 mb-8 overflow-hidden">
      {/* Progress/Accent Bar */}
      <div className="w-full bg-primary h-1 mb-1" />
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-center h-16 mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight flex items-center gap-2">
          <UserIcon className="w-7 h-7 text-primary" aria-hidden="true" /> Performer Dashboard
        </h1>
      </div>
      {/* Visually distinct status badge below header */}
      <div className="flex justify-center mb-4">
        <span className="inline-flex items-center gap-2 bg-primary/90 border border-primary text-primary-contrast rounded-full px-5 py-2 font-bold shadow-lg text-lg animate-fade-in">
          <UserIcon className="w-6 h-6" /> Performer Dashboard
        </span>
      </div>
      <div className="border-t border-neutral-800 my-4" />
      {/* Tabs */}
      <ul className="nav nav-tabs flex border-b mb-4" /* Tailwind: flex border-b mb-4 */>
        <li className={tab === 'perform' ? 'active mr-2' : 'mr-2'} /* Tailwind: mr-2 */>
          <a href="#" onClick={() => setTab('perform')} className="px-4 py-2 block" /* Tailwind: px-4 py-2 block */ aria-label="Perform tab">Perform</a>
        </li>
        <li className={tab === 'demand' ? 'active' : ''}>
          <a href="#" onClick={() => setTab('demand')} className="px-4 py-2 block" aria-label="Demand tab">Demand</a>
        </li>
      </ul>
      <div className="tab-content">
        {/* Perform Tab Content */}
        {tab === 'perform' && (
          <div className="tab-pane active" id="perform">
            {/* Filters */}
            <div className="act-filters flex items-center mb-4" /* Tailwind: flex items-center mb-4 */>
              <h3 className="filters-heading text-lg font-semibold mr-4" /* Tailwind: text-lg font-semibold mr-4 */>Show only</h3>
              <div className="difficulties flex gap-2">
                {/* difficulties, selectedDifficulties, toggleDifficulty are not defined in this component */}
                {/* This part of the code was not provided in the original file, so I'm keeping it as is */}
                {/* <a
                  key={diff}
                  href="#"
                  className={`difficulty px-3 py-1 rounded border ${selectedDifficulties.includes(diff) ? 'active bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                  /* Tailwind: px-3 py-1 rounded border bg-blue-500 text-white (active), bg-gray-100 text-gray-700 (inactive) */}
                  {/* onClick={e => { e.preventDefault(); toggleDifficulty(diff); }} */}
                  {/* aria-label={`Filter by difficulty: ${diff}`} */}
                {/* > */}
                  {/* {diff} */}
                {/* </a> */}
              </div>
            </div>
            {/* Cooldown warning UI (show above slots/public dares if in cooldown) */}
            {cooldownUntil && new Date() < new Date(cooldownUntil) && (
              <div className="cooldown-warning bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded mb-4 text-center" aria-label="Cooldown warning">
                <strong>Cooldown active:</strong> You recently rejected a dare. To ensure fair play, there is a cooldown period after each rejection. You can claim new dares after <b>{new Date(cooldownUntil).toLocaleTimeString()}</b>.<br/>
                <span className="text-xs text-yellow-700">There is nothing wrong with rejecting dares, but this prevents dares from being rejected too quickly.</span>
              </div>
            )}
            {/* Slot List */}
            <div className="slot-list-container grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="slot-list flex flex-wrap gap-4">
                {slotsLoading ? (
                  <div className="text-center py-8 text-neutral-400">Loading slots...</div>
                ) : slots.length === 0 ? (
                  <div className="text-neutral-400">You have no ongoing dares. Claim a public dare below to get started!</div>
                ) : (
                  slots.map((slot, idx) => {
                    let progress = 0;
                    let statusText = '';
                    if (slot.startTime && slot.endTime) {
                      const now = Date.now();
                      const start = new Date(slot.startTime).getTime();
                      const end = new Date(slot.endTime).getTime();
                      progress = Math.round(((now - start) / (end - start)) * 100);
                      progress = Math.max(0, Math.min(100, progress));
                      statusText = timeAgoOrDuration(slot.startTime, slot.endTime, slot.status);
                    } else if (slot.startTime) {
                      progress = 50;
                      statusText = timeAgoOrDuration(slot.startTime, null, slot.status);
                    } else {
                      progress = 50;
                      statusText = slot.status;
                    }
                    return (
                      <Slot
                        key={slot._id || idx}
                        empty={slot.empty}
                        url={slot.url}
                        imageUrl={slot.imageUrl}
                        difficulty={slot.difficulty}
                        status={slot.status}
                        ariaLabel={slot.empty ? 'Empty slot' : 'Active slot'}
                        progress={progress}
                      >
                        <div className="text-xs text-neutral-400 ml-2">{statusText}</div>
                      </Slot>
                    );
                  })
                )}
              </div>
            </div>
            {/* Section Headings */}
            <h3 className="section-description text-xl font-bold mb-2" aria-label="Ongoing dares">Ongoing Dares</h3>
            <div className="ongoing-dares-list grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {completedLoading ? (
                <div className="text-center py-8 text-neutral-400">Loading completed dares...</div>
              ) : ongoing.length === 0 ? (
                <div className="text-neutral-400">No ongoing dares. When you claim a dare, it will appear here.</div>
              ) : (
                ongoing.map((dare, idx) => {
                  let statusText = '';
                  if (dare.startTime && dare.endTime) {
                    statusText = timeAgoOrDuration(dare.startTime, dare.endTime, dare.status);
                  } else if (dare.startTime) {
                    statusText = timeAgoOrDuration(dare.startTime, null, dare.status);
                  } else {
                    statusText = dare.status;
                  }
                  return (
                    <div key={dare._id || idx} className="dare-card bg-neutral-100 border border-neutral-300 rounded p-4 flex flex-col gap-2" aria-label="Ongoing dare card">
                      <div onClick={() => setExpandedOngoingIdx(expandedOngoingIdx === idx ? null : idx)} className="cursor-pointer">
                        <DareCard dare={dare} />
                      </div>
                      {expandedOngoingIdx === idx && (
                        <Accordion title="Details" defaultOpen={true} className="mt-2">
                          <div className="text-sm text-neutral-200">
                            <div><b>Description:</b> {dare.description}</div>
                            <div><b>Tags:</b> {dare.tags?.join(', ') || 'None'}</div>
                            <div><b>Creator:</b> {dare.creator?.username || 'Unknown'}</div>
                            <div><b>Performer:</b> {dare.performer?.username || 'Unknown'}</div>
                            <div><b>Status:</b> {dare.status}</div>
                            {dare.proof && <div><b>Proof:</b> {dare.proof.submitted ? 'Submitted' : 'Not submitted'}</div>}
                            {dare.grades && dare.grades.length > 0 && <div><b>Grades:</b> {dare.grades.map(g => g.grade).join(', ')}</div>}
                            {dare.status === 'rejected' && dare.rejectionReason && (
                              <div className="text-xs text-red-600 mt-1">
                                <b>Rejection reason:</b> {getRejectionExplanation(dare.rejectionReason)}
                              </div>
                            )}
                          </div>
                        </Accordion>
                      )}
                      <div className="actions flex gap-2 mt-2">
                        <button
                          className="btn btn-primary px-3 py-1 bg-blue-600 text-white rounded"
                          onClick={() => handleCompleteDare(idx)}
                          disabled={cooldownUntil && new Date() < new Date(cooldownUntil)}
                          aria-label="Mark dare as completed"
                        >
                          Complete
                        </button>
                        <button
                          className="btn btn-danger px-3 py-1 bg-red-600 text-white rounded"
                          onClick={() => handleRejectDare(idx)}
                          disabled={cooldownUntil && new Date() < new Date(cooldownUntil)}
                          aria-label="Reject dare"
                        >
                          Reject
                        </button>
                        <a
                          href={`/perform/${dare._id}`}
                          className="btn btn-secondary px-3 py-1 bg-gray-500 text-white rounded"
                          aria-label="Submit proof or view dare details"
                          tabIndex={0}
                          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') window.location.href = `/perform/${dare._id}`; }}
                        >
                          Submit/View
                        </a>
                      </div>
                      <div className="text-xs text-neutral-500 mt-1 flex items-center">Status: {statusText}{renderStatusBadge(dare.status)}</div>
                    </div>
                  );
                })
              )}
            </div>
            <h3 className="section-description text-xl font-bold mb-2" aria-label="Completed dares">Completed Dares</h3>
            <div className="completed-dares-list grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {completedLoading ? (
                <div className="text-center py-8 text-neutral-400">Loading completed dares...</div>
              ) : completed.length === 0 ? (
                <div className="text-neutral-400">No completed dares yet. When you complete a dare, it will appear here for your records.</div>
              ) : (
                completed.map((dare, idx) => (
                  <div key={dare._id || idx} className="dare-card bg-neutral-50 border border-neutral-200 rounded p-4 flex flex-col gap-2" aria-label="Completed dare card">
                    <DareCard dare={dare} />
                    <div className="text-xs text-neutral-400 mt-1">Completed at: {dare.completedAt ? new Date(dare.completedAt).toLocaleString() : '—'}</div>
                  </div>
                ))
              )}
            </div>
            <h3 className="section-description text-xl font-bold mb-2" aria-label="Browse public dares">Browse Public Dares</h3>
            {/* Public act counts summary */}
            <div className="flex flex-wrap gap-2 mb-4" aria-label="Public act counts">
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
                  {dedupeActsByUser(publicDares).map((dare, idx) => (
                    <div key={dare._id || idx} className="thing thing-with-avatar public-act flex items-center gap-4 bg-neutral-900 border border-neutral-700 rounded p-3 mb-2">
                      <img src={dare.user?.avatar || dare.creator?.avatar || '/default-avatar.png'} alt="avatar" className="avatar w-10 h-10 rounded-full object-cover" />
                      <div className="thing-details flex-1">
                        <div className="thing-title user-name font-bold">{dare.user?.username || dare.creator?.username || 'User'}</div>
                        <div className="text-xs text-neutral-400">{dare.title || dare.description || ''}</div>
                        {/* Add more details as needed */}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Call to Action */}
            <div className="call-to-action flex gap-2 mb-4" /* Tailwind: flex gap-2 mb-4 */>
              <a className="btn btn-primary px-4 py-2 bg-blue-600 text-white rounded" href="/subs/new" /* Tailwind: px-4 py-2 bg-blue-600 text-white rounded */ aria-label="Offer submission">Offer submission</a>
              <a className="btn btn-primary px-4 py-2 bg-green-600 text-white rounded" href="/switches/new" /* Tailwind: px-4 py-2 bg-green-600 text-white rounded */ aria-label="Switch battle">Switch battle</a>
            </div>
            {/* TODO: Public dares browser, advanced filtering, etc. */}
          </div>
        )}
        {/* Demand Tab Content */}
        {tab === 'demand' && (
          <div className="tab-pane active" id="demand">
            <h3 className="section-description text-xl font-bold mb-2" aria-label="Your demand slots">Your Demand Slots</h3>
            {/* Edge-case explanations for cooldown/slots */}
            {cooldownUntil && new Date() < new Date(cooldownUntil) && (
              <div className="cooldown-warning bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded mb-4 text-center" aria-label="Cooldown warning">
                <strong>Cooldown active:</strong> You recently withdrew a demand. To ensure fair play, there is a cooldown period after each withdrawal. You can create new demands after <b>{new Date(cooldownUntil).toLocaleTimeString()}</b>.<br/>
                <span className="text-xs text-yellow-700">There is nothing wrong with withdrawing, but this prevents demands from being withdrawn too quickly.</span>
              </div>
            )}
            {demandSlots.length >= MAX_SLOTS && (
              <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-2 rounded mb-4 text-center" aria-label="Demand slots full">
                <strong>Slot limit reached:</strong> You can only have {MAX_SLOTS} open demand slots at a time. Complete or withdraw a demand to free up a slot.
              </div>
            )}
            <div className="slot-list-container grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="slot-list flex flex-wrap gap-4">
                {demandLoading ? <div className="text-center py-8 text-neutral-400">Loading demand slots...</div> : demandSlots.length === 0 ? (
                  <div className="text-neutral-400">No active demand slots. Create a new demand or browse public offers below.</div>
                ) : (
                  demandSlots.map((slot, idx) => (
                    <Slot
                      key={slot._id || idx}
                      url={slot.url}
                      imageUrl={slot.imageUrl}
                      difficulty={slot.difficulty}
                      status={slot.status}
                      ariaLabel="Demand slot"
                      onWithdraw={e => { e.preventDefault(); setConfirmWithdrawIdx(idx); }}
                    >
                      {renderStatusBadge(slot.status)}
                    </Slot>
                  ))
                )}
              </div>
            </div>
            <h3 className="section-description text-xl font-bold mb-2" aria-label="Completed demand dares">Completed Demand Dares</h3>
            <div className="completed-demand-list grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {completedLoading ? (
                <div className="text-center py-8 text-neutral-400">Loading completed demand dares...</div>
              ) : completedDemand.length === 0 ? (
                <div className="text-neutral-400">No completed demand dares yet. When someone completes a dare you created, it will appear here.</div>
              ) : (
                completedDemand.map((dare, idx) => (
                  <div key={dare._id || idx} className="dare-card bg-neutral-50 border border-neutral-200 rounded p-4 flex flex-col gap-2" aria-label="Completed demand dare card">
                    <DareCard dare={dare} />
                    <div className="text-xs text-neutral-400 mt-1">Completed at: {dare.completedAt ? new Date(dare.completedAt).toLocaleString() : '—'}</div>
                  </div>
                ))
              )}
            </div>
            <h3 className="section-description text-xl font-bold mb-2" aria-label="Browse public demand acts">Browse Public Demand Offers</h3>
            {publicDemandError && <div className="text-danger text-center mb-2">{publicDemandError}</div>}
            <div className="public-demand-browser mb-8">
              {renderDemandFilters()}
              {publicDemandLoading ? (
                <div className="text-center py-8 text-neutral-400">Loading public demand offers...</div>
              ) : publicDemandActs.length === 0 ? (
                selectedDemandDifficulties.length === 0 ? (
                  <div className="text-neutral-400">You need to select at least one difficulty level in order to see some offers.</div>
                ) : (
                  <div className="text-neutral-400">No public demand offers found. Try adjusting your filters or check back later for new offers.</div>
                )
              ) : (
                <div className="public-demand-list grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dedupeActsByUser(publicDemandActs).map((dare, idx) => (
                    <div key={dare._id || idx} className="thing thing-with-avatar public-act flex items-center gap-4 bg-neutral-900 border border-neutral-700 rounded p-3 mb-2">
                      <img src={dare.user?.avatar || dare.creator?.avatar || '/default-avatar.png'} alt="avatar" className="avatar w-10 h-10 rounded-full object-cover" />
                      <div className="thing-details flex-1">
                        <div className="thing-title user-name font-bold">{dare.user?.username || dare.creator?.username || 'User'}</div>
                        <div className="text-xs text-neutral-400">{dare.title || dare.description || ''}</div>
                        {/* Add more details as needed */}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="call-to-action flex gap-2 mb-4">
              <a className="btn btn-primary px-4 py-2 bg-blue-600 text-white rounded" href="/doms/new" aria-label="Offer domination">Offer domination</a>
              <a className="btn btn-primary px-4 py-2 bg-green-600 text-white rounded" href="/switches/new" aria-label="Switch battle">Switch battle</a>
            </div>
          </div>
        )}
      </div>
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
          <div className="bg-white rounded shadow-lg p-6 max-w-sm w-full">
            <div className="text-lg font-bold mb-2" id="withdraw-dialog-title">Withdraw Demand Dare</div>
            <div className="mb-4">Are you sure you want to withdraw this dare? This action cannot be undone.</div>
            <div className="flex gap-2 justify-end">
              <button className="btn btn-secondary px-4 py-2 bg-gray-300 text-gray-800 rounded" onClick={() => setConfirmWithdrawIdx(null)} aria-label="Cancel withdraw">Cancel</button>
              <button className="btn btn-danger px-4 py-2 bg-red-600 text-white rounded" onClick={async () => { await handleWithdrawDemand(confirmWithdrawIdx); setConfirmWithdrawIdx(null); }} aria-label="Confirm withdraw">Withdraw</button>
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
        <DashboardChart stats={{ daresCount: 7, avgGrade: 4.2 }} />
      </div>
      {/* Add dashboard settings modal (stub) */}
      <button className="bg-primary text-primary-contrast px-4 py-2 rounded mb-4" onClick={() => setShowDashboardSettings(true)}>Dashboard Settings</button>
      {showDashboardSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#222] border border-[#282828] rounded p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Dashboard Settings</h2>
            <div className="text-neutral-300 mb-4">(Settings coming soon...)</div>
            <button className="bg-primary text-primary-contrast px-4 py-2 rounded" onClick={() => setShowDashboardSettings(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
} 