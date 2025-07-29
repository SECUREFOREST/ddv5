import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import DareCard from '../components/DareCard';
import { DIFFICULTY_OPTIONS, TYPE_OPTIONS } from '../constants';
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

// Status mapping for better UX
const statusMap = {
  waiting_for_participant: { label: 'Waiting', color: 'bg-blue-600/20 border border-blue-500/50 text-blue-300' },
  pending: { label: 'Pending', color: 'bg-yellow-600/20 border border-yellow-500/50 text-yellow-300' },
  soliciting: { label: 'Soliciting', color: 'bg-purple-600/20 border border-purple-500/50 text-purple-300' },
  in_progress: { label: 'In Progress', color: 'bg-green-600/20 border border-green-500/50 text-green-300' },
  completed: { label: 'Completed', color: 'bg-emerald-600/20 border border-emerald-500/50 text-emerald-300' },
  rejected: { label: 'Rejected', color: 'bg-red-600/20 border border-red-500/50 text-red-300' },
  graded: { label: 'Graded', color: 'bg-indigo-600/20 border border-indigo-500/50 text-indigo-300' },
  approved: { label: 'Approved', color: 'bg-green-600/20 border border-green-500/50 text-green-300' },
  forfeited: { label: 'Forfeited', color: 'bg-red-600/20 border border-red-500/50 text-red-300' },
  expired: { label: 'Expired', color: 'bg-neutral-600/20 border border-neutral-500/50 text-neutral-300' }
};

function StatusBadge({ status }) {
  const s = statusMap[status] || { label: status, color: 'bg-neutral-600/20 border border-neutral-500/50 text-neutral-300' };
  return <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${s.color}`} title={status}>{s.label}</span>;
}

export default function DarePerformerDashboard() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  
  // Core state with better organization
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Data states
  const [ongoing, setOngoing] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [publicDares, setPublicDares] = useState([]);
  const [mySwitchGames, setMySwitchGames] = useState([]);
  const [switchGameHistory, setSwitchGameHistory] = useState([]);
  
  // Loading states
  const [dataLoading, setDataLoading] = useState({
    ongoing: true,
    completed: true,
    public: true,
    switchGames: true
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    difficulty: '',
    type: '',
    search: ''
  });
  
  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [expandedDare, setExpandedDare] = useState(null);
  const [notification, setNotification] = useState(null);
  
  // Notification system
  const notificationTimeout = useRef(null);
  const showNotification = (msg, type = 'info') => {
    setNotification({ message: msg, type });
    if (notificationTimeout.current) clearTimeout(notificationTimeout.current);
    notificationTimeout.current = setTimeout(() => setNotification(null), 5000);
    if (type === 'success') showSuccess(msg);
    if (type === 'error') showError(msg);
  };

  // Fetch data on mount
  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        const [ongoingRes, completedRes, publicRes, switchRes, historyRes] = await Promise.all([
          api.get('/dares/mine?status=in_progress,waiting_for_participant'),
          api.get('/dares/mine?status=completed'),
          api.get('/dares/public'),
          api.get('/switches/performer'),
          api.get('/switches/history')
        ]);
        
        setOngoing(Array.isArray(ongoingRes.data) ? ongoingRes.data : []);
        setCompleted(Array.isArray(completedRes.data) ? completedRes.data : []);
        setPublicDares(Array.isArray(publicRes.data) ? publicRes.data : []);
        setMySwitchGames(Array.isArray(switchRes.data) ? switchRes.data : []);
        setSwitchGameHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
        
        showNotification('Dashboard loaded successfully!', 'success');
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
        showNotification('Failed to load dashboard data.', 'error');
      } finally {
        setIsLoading(false);
        setDataLoading({
          ongoing: false,
          completed: false,
          public: false,
          switchGames: false
        });
      }
    };
    
    fetchData();
  }, [user]);

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

  // Action handlers
  const handleClaimDare = async (dare) => {
    if (ongoing.length >= MAX_SLOTS) {
      showNotification('You have reached your maximum number of perform slots.', 'error');
      return;
    }
    
    try {
      const res = await api.get(`/dares/random${dare.difficulty ? `?difficulty=${dare.difficulty}` : ''}`);
      setOngoing(prev => [...prev, res.data]);
      showNotification('Dare claimed successfully!', 'success');
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to claim dare.', 'error');
    }
  };

  const handleCompleteDare = async (dareId) => {
    const dareIdx = ongoing.findIndex(d => d._id === dareId);
    if (dareIdx === -1) return;
    
    try {
      await api.post(`/dares/${ongoing[dareIdx]._id}/proof`, { text: 'Completed via dashboard.' });
      setOngoing(prev => prev.filter((_, i) => i !== dareIdx));
      setCompleted(prev => [...prev, { ...ongoing[dareIdx], status: 'completed', completedAt: new Date() }]);
      showNotification('Dare completed successfully!', 'success');
    } catch (err) {
      showNotification('Failed to complete dare.', 'error');
    }
  };

  // Tab configuration with better UX
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
                  <div className="text-2xl font-bold text-blue-400">{ongoing.length}</div>
                  <div className="text-sm text-blue-300">Active Dares</div>
                </div>
                <ClockIcon className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-600/20 to-green-700/20 rounded-xl p-4 border border-green-600/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-400">{completed.length}</div>
                  <div className="text-sm text-green-300">Completed</div>
                </div>
                <TrophyIcon className="w-8 h-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-600/20 to-purple-700/20 rounded-xl p-4 border border-purple-600/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-400">{mySwitchGames.length}</div>
                  <div className="text-sm text-purple-300">Switch Games</div>
                </div>
                <FireIcon className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-orange-600/20 to-orange-700/20 rounded-xl p-4 border border-orange-600/30">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-orange-400">{publicDares.length}</div>
                  <div className="text-sm text-orange-300">Available</div>
                </div>
                <SparklesIcon className="w-8 h-8 text-orange-400" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-neutral-900/60 rounded-xl p-6 border border-neutral-800/50">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button 
                onClick={() => navigate('/dare/create')}
                className="group bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl p-4 font-semibold hover:from-primary-dark hover:to-primary transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <PlusIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                Create Dare
              </button>
              
              <button 
                onClick={() => navigate('/dare/select')}
                className="group bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-4 font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <PlayIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                Perform Dare
              </button>
              
              <button 
                onClick={() => navigate('/subs/new')}
                className="group bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl p-4 font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <DocumentPlusIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                Submit Offer
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-neutral-900/60 rounded-xl p-6 border border-neutral-800/50">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {ongoing.slice(0, 3).map(dare => (
                <div key={dare._id} className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-lg border border-neutral-700/30">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={dare.status} />
                    <span className="text-white text-sm truncate">{dare.description}</span>
                  </div>
                  <button
                    onClick={() => setExpandedDare(expandedDare === dare._id ? null : dare._id)}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'active',
      label: 'Active Dares',
      icon: ClockIcon,
      content: (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-neutral-900/60 rounded-xl p-4 border border-neutral-800/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Active Dares</h3>
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
                  actions={[
                    <button
                      key="complete"
                      onClick={() => handleCompleteDare(dare._id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      Complete
                    </button>
                  ]}
                  currentUserId={user?.id || user?._id}
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
      label: 'Completed',
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
                  currentUserId={user?.id || user?._id}
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
      key: 'switch',
      label: 'Switch Games',
      icon: FireIcon,
      content: (
        <div className="space-y-6">
          <div className="bg-neutral-900/60 rounded-xl p-4 border border-neutral-800/50">
            <h3 className="text-lg font-semibold text-white mb-4">Switch Games</h3>
            <div className="space-y-4">
              {mySwitchGames.map(game => (
                <DareCard
                  key={game._id}
                  description={game.creatorDare?.description || ''}
                  difficulty={game.difficulty || game.creatorDare?.difficulty}
                  tags={game.tags}
                  status={game.status}
                  creator={game.creator}
                  performer={game.participant}
                  currentUserId={user?.id || user?._id}
                />
              ))}
              
              {mySwitchGames.length === 0 && (
                <div className="text-center py-12">
                  <div className="bg-neutral-900/40 rounded-xl p-8 border border-neutral-800/30">
                    <FireIcon className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                    <div className="text-neutral-400 text-lg mb-2">No switch games</div>
                    <p className="text-neutral-500 text-sm">Create or join a switch game to get started</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }
  ];

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
            <div className="bg-red-900/20 border border-red-800/30 rounded-xl p-4 text-red-300 text-center mb-6">
              {error}
            </div>
          )}

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
