import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  BellIcon,
  UserIcon,
  HomeIcon,
  SwatchIcon,
  PuzzlePieceIcon,
  ArrowTopRightOnSquareIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { DIFFICULTY_OPTIONS } from '../../constants.jsx';
import api from '../../api/axios';

// Add difficulty constants to match ModernPublicDares exactly
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

const ModernDarePerformerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [dataLoading, setDataLoading] = useState({
    ongoing: true,
    completed: true,
    switchGames: true,
    public: true,
    publicSwitch: true,
  });
  
  // Data state
  const [ongoing, setOngoing] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [mySwitchGames, setMySwitchGames] = useState([]);
  const [publicDares, setPublicDares] = useState([]);
  const [publicSwitchGames, setPublicSwitchGames] = useState([]);
  
  // Summary data
  const [summary, setSummary] = useState({
    totalActiveDares: 0,
    totalCompletedDares: 0,
    totalSwitchGames: 0,
    totalPublicDares: 0,
    totalPublicSwitchGames: 0
  });

  // Filter state
  const [dareFilters, setDareFilters] = useState({
    difficulty: '',
    status: ''
  });
  
  const [switchGameFilters, setSwitchGameFilters] = useState({
    difficulty: '',
    status: ''
  });
  
  const [publicFilters, setPublicFilters] = useState({
    difficulty: '',
    dareType: ''
  });

  // Add helper functions to match ModernPublicDares exactly
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

  // Fetch dashboard data
  const fetchData = useCallback(async () => {
    if (!user?._id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch dashboard data from stats API
      const response = await api.get('/api/stats/dashboard');
      const { data, summary: summaryData } = response.data;
      
      // Set data with fallbacks
      setOngoing(Array.isArray(data?.activeDares) ? data.activeDares : []);
      setCompleted(Array.isArray(data?.completedDares) ? data.completedDares : []);
      setMySwitchGames(Array.isArray(data?.switchGames) ? data.switchGames : []);
      setPublicDares(Array.isArray(data?.publicDares) ? data.publicDares : []);
      setPublicSwitchGames(Array.isArray(data?.publicSwitchGames) ? data.publicSwitchGames : []);
      
      // Set summary data
      setSummary(summaryData || {
        totalActiveDares: data?.activeDares?.length || 0,
        totalCompletedDares: data?.completedDares?.length || 0,
        totalSwitchGames: data?.switchGames?.length || 0,
        totalPublicDares: data?.publicDares?.length || 0,
        totalPublicSwitchGames: data?.publicSwitchGames?.length || 0
      });
      
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
      
      // Set empty arrays on error
      setOngoing([]);
      setCompleted([]);
      setMySwitchGames([]);
      setPublicDares([]);
      setPublicSwitchGames([]);
    } finally {
      setIsLoading(false);
      setDataLoading({
        ongoing: false,
        completed: false,
        switchGames: false,
        public: false,
        publicSwitch: false,
      });
    }
  }, [user?._id]);

  // Handle filter changes
  const handleDareFilterChange = (filterType, value) => {
    setDareFilters(prev => ({ ...prev, [filterType]: value }));
  };
  
  const handleSwitchGameFilterChange = (filterType, value) => {
    setSwitchGameFilters(prev => ({ ...prev, [filterType]: value }));
  };
  
  const handlePublicFilterChange = (filterType, value) => {
    setPublicFilters(prev => ({ ...prev, [filterType]: value }));
  };

  // Quick actions
  const handleQuickAction = (action) => {
    try {
      switch (action) {
        case 'create-dare':
          navigate('/modern/dares/create/dom');
          break;
        case 'perform-dare':
          navigate('/modern/dares/select');
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
          navigate(`/profile/${user?._id}`);
          break;
        default:
          console.warn('Unknown action:', action);
      }
    } catch (err) {
      console.error('Failed to execute quick action:', err);
      showError('Action failed. Please try again.');
    }
  };

  // Effects
  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, fetchData]);

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-white/70 mb-6">
            Please log in to access the performer dashboard.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl px-6 py-3 font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading Dashboard</div>
          <p className="text-neutral-400 text-sm mt-2">Please wait while we load your data...</p>
        </div>
      </div>
    );
  }

  // Tab configuration
  const tabs = [
    {
      key: 'overview',
      label: 'Overview',
      icon: ChartBarIcon,
      content: (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer"
                 onClick={() => setActiveTab('dares')}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-3xl font-bold text-white mb-1">
                    {dataLoading.ongoing ? '...' : summary.totalActiveDares}
                  </div>
                  <div className="text-sm text-white/70 mb-2">Active Dares</div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400">
                  <ClockIcon className="w-6 h-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer"
                 onClick={() => setActiveTab('dares')}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-3xl font-bold text-white mb-1">
                    {dataLoading.completed ? '...' : summary.totalCompletedDares}
                  </div>
                  <div className="text-sm text-white/70 mb-2">Completed</div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30 text-green-400">
                  <TrophyIcon className="w-6 h-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer"
                 onClick={() => setActiveTab('switch-games')}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-3xl font-bold text-white mb-1">
                    {dataLoading.switchGames ? '...' : summary.totalSwitchGames}
                  </div>
                  <div className="text-sm text-white/70 mb-2">Switch Games</div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400">
                  <FireIcon className="w-6 h-6" />
                </div>
              </div>
            </div>
            
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer"
                 onClick={() => setActiveTab('public')}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="text-3xl font-bold text-white mb-1">
                    {dataLoading.public ? '...' : (summary.totalPublicDares + summary.totalPublicSwitchGames)}
                  </div>
                  <div className="text-sm text-white/70 mb-2">Available</div>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400">
                  <SparklesIcon className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <BoltIcon className="w-6 h-6 text-yellow-400" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <button
                onClick={() => handleQuickAction('create-dare')}
                className="h-20 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                <div className="flex flex-col items-center gap-2">
                  <PlusIcon className="w-8 h-8" />
                  <span className="text-sm">Create Dare</span>
                </div>
              </button>
              
              <button
                onClick={() => handleQuickAction('perform-dare')}
                className="h-20 bg-neutral-800/80 backdrop-blur-xl border border-white/20 text-white rounded-xl font-semibold transition-all duration-200 hover:bg-neutral-700/90 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                <div className="flex flex-col items-center gap-2">
                  <PlayIcon className="w-8 h-8" />
                  <span className="text-sm">Perform Dare</span>
                </div>
              </button>
              
              <button
                onClick={() => handleQuickAction('submit-offer')}
                className="h-20 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                <div className="flex flex-col items-center gap-2">
                  <DocumentPlusIcon className="w-8 h-8" />
                  <span className="text-sm">Submit Offer</span>
                </div>
              </button>
              
              <button
                onClick={() => handleQuickAction('create-switch')}
                className="h-20 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                <div className="flex flex-col items-center gap-2">
                  <PuzzlePieceIcon className="w-8 h-8" />
                  <span className="text-sm">Create Game</span>
                </div>
              </button>
              
              <button
                onClick={() => handleQuickAction('join-game')}
                className="h-20 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                <div className="flex flex-col items-center gap-2">
                  <UserGroupIcon className="w-8 h-8" />
                  <span className="text-sm">Join Game</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'dares',
      label: 'My Dares',
      icon: ClockIcon,
      content: (
        <div className="space-y-6">
          {/* Active Dares */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <ClockIcon className="w-6 h-6 text-blue-400" />
                My Active Dares ({ongoing.length})
              </h3>

              <div className="flex items-center gap-4">
                <select
                  value={dareFilters.difficulty}
                  onChange={(e) => handleDareFilterChange('difficulty', e.target.value)}
                  className="px-3 py-2 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Difficulties</option>
                  {DIFFICULTY_OPTIONS.map(diff => (
                    <option key={diff.value} value={diff.value}>{diff.label}</option>
                  ))}
                </select>
                
                <select
                  value={dareFilters.status}
                  onChange={(e) => handleDareFilterChange('status', e.target.value)}
                  className="px-3 py-2 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Statuses</option>
                  <option value="waiting_for_participant">Waiting for Participant</option>
                  <option value="approved">Approved</option>
                  <option value="in_progress">In Progress</option>
                </select>
              </div>
            </div>
            
            {ongoing.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ClockIcon className="w-8 h-8 text-blue-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">No Active Dares</h4>
                <p className="text-white/70 mb-6">You don't have any active dares at the moment.</p>
                <button
                  onClick={() => handleQuickAction('create-dare')}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg px-4 py-2 font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  Create Your First Dare
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {ongoing.map((dare) => {
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
                          
                          {/* Status Badge */}
                          <div className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                            dare.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            dare.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                            'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          }`}>
                            {dare.status.replace(/_/g, ' ')}
                          </div>
                          
                          {/* Creator Info */}
                          {dare.creator && (
                            <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3">
                              <span className="text-neutral-400 text-sm">Created by</span>
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center">
                                  <UserIcon className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-bold text-white">{dare.creator?.fullName || dare.creator?.username || 'User'}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Action Button */}
                        <button
                          onClick={() => navigate(`/modern/dares/${dare._id}`)}
                          className="w-full lg:w-auto bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl px-6 py-3 font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 justify-center"
                        >
                          <EyeIcon className="w-5 h-5" />
                          View Details
                        </button>
                      </div>
                      
                      {/* Tags */}
                      {renderTags(dare.tags)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Completed Dares */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
              <TrophyIcon className="w-6 h-6 text-green-400" />
              Completed Dares ({completed.length})
            </h3>
            
            {completed.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrophyIcon className="w-8 h-8 text-green-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">No Completed Dares</h4>
                <p className="text-white/70 mb-6">Complete your first dare to see it here!</p>
                <button
                  onClick={() => handleQuickAction('perform-dare')}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg px-4 py-2 font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  Start Performing Dares
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {completed.map((dare) => {
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
                          
                          {/* Status Badge */}
                          <div className="px-3 py-2 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 text-sm font-semibold">
                            {dare.status.replace(/_/g, ' ')}
                          </div>
                          
                          {/* Creator Info */}
                          {dare.creator && (
                            <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3">
                              <span className="text-neutral-400 text-sm">Created by</span>
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center">
                                  <UserIcon className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-bold text-white">{dare.creator?.fullName || dare.creator?.username || 'User'}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Action Button */}
                        <button
                          onClick={() => navigate(`/modern/dares/${dare._id}`)}
                          className="w-full lg:w-auto bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl px-6 py-3 font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 justify-center"
                        >
                          <EyeIcon className="w-5 h-5" />
                          View Details
                        </button>
                      </div>
                      
                      {/* Tags */}
                      {renderTags(dare.tags)}
                      
                      {/* Completion Info */}
                      {dare.completedAt && (
                        <div className="mt-3 pt-3 border-t border-neutral-600/30">
                          <div className="flex items-center gap-2 text-sm text-neutral-400">
                            <CheckCircleIcon className="w-4 h-4 text-green-400" />
                            <span>Completed on {new Date(dare.completedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'switch-games',
      label: 'My Switch Games',
      icon: FireIcon,
      content: (
        <div className="space-y-6">
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <FireIcon className="w-6 h-6 text-purple-400" />
                My Switch Games ({mySwitchGames.length})
              </h3>

              <div className="flex items-center gap-4">
                <select
                  value={switchGameFilters.difficulty}
                  onChange={(e) => handleSwitchGameFilterChange('difficulty', e.target.value)}
                  className="px-3 py-2 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Difficulties</option>
                  {DIFFICULTY_OPTIONS.map(diff => (
                    <option key={diff.value} value={diff.value}>{diff.label}</option>
                  ))}
                </select>
                
                <select
                  value={switchGameFilters.status}
                  onChange={(e) => handleSwitchGameFilterChange('status', e.target.value)}
                  className="px-3 py-2 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Statuses</option>
                  <option value="waiting_for_participant">Waiting for Participant</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="awaiting_proof">Awaiting Proof</option>
                  <option value="proof_submitted">Proof Submitted</option>
                </select>
              </div>
            </div>
            
            {mySwitchGames.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FireIcon className="w-8 h-8 text-purple-400" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">No Switch Games</h4>
                <p className="text-white/70 mb-6">You haven't joined any switch games yet.</p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setActiveTab('public')}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg px-4 py-2 font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
                  >
                    Find Games to Join
                  </button>
                  <button
                    onClick={() => handleQuickAction('create-switch')}
                    className="bg-neutral-800/80 backdrop-blur-xl border border-white/20 text-white rounded-lg px-4 py-2 font-semibold shadow-lg hover:bg-neutral-700/90 hover:scale-105 active:scale-95 transition-all duration-200"
                  >
                    Create a Game
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {mySwitchGames.map((game) => {
                  const { Icon: DifficultyIcon, color } = getDifficultyInfo(game.creatorDare?.difficulty || game.difficulty);
                  
                  return (
                    <div key={game._id} className="bg-neutral-700/50 backdrop-blur-sm rounded-xl border border-neutral-600/30 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] group">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                          {/* Difficulty Badge */}
                          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r ${color} text-white text-sm font-semibold`}>
                            <DifficultyIcon className="w-4 h-4" />
                            {game.creatorDare?.difficulty || game.difficulty}
                          </div>
                          
                          {/* Status Badge */}
                          <div className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                            game.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                            game.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            game.status === 'awaiting_proof' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            game.status === 'proof_submitted' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                            'bg-neutral-500/20 text-neutral-400 border border-neutral-500/30'
                          }`}>
                            {game.status.replace(/_/g, ' ')}
                          </div>
                          
                          {/* Game Type Badge */}
                          <div className="px-3 py-2 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 text-sm font-semibold">
                            Switch Game
                          </div>
                        </div>
                        
                        {/* Action Button */}
                        <button
                          onClick={() => navigate(`/modern/switches/${game._id}`)}
                          className="w-full lg:w-auto bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl px-6 py-3 font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 justify-center"
                        >
                          <EyeIcon className="w-5 h-5" />
                          View Details
                        </button>
                      </div>
                      
                      {/* Game Info */}
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-neutral-400">
                        {game.creator && (
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4" />
                            <span>Creator: {game.creator?.fullName || game.creator?.username || 'User'}</span>
                          </div>
                        )}
                        {game.participant && (
                          <div className="flex items-center gap-2">
                            <UserIcon className="w-4 h-4" />
                            <span>Participant: {game.participant?.fullName || game.participant?.username || 'User'}</span>
                          </div>
                        )}
                        {game.createdAt && (
                          <div className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4" />
                            <span>Created: {new Date(game.createdAt).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Tags */}
                      {renderTags(game.creatorDare?.tags || game.tags)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'public',
      label: 'Public',
      icon: SparklesIcon,
      content: (
        <div className="space-y-6">          
          {/* Public Dares */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <SparklesIcon className="w-6 h-6 text-orange-400" />
                Public Dares ({publicDares.length})
              </h3>
              
              <div className="flex items-center gap-4">
                <select
                  value={publicFilters.difficulty}
                  onChange={(e) => handlePublicFilterChange('difficulty', e.target.value)}
                  className="px-3 py-2 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Difficulties</option>
                  {DIFFICULTY_OPTIONS.map(diff => (
                    <option key={diff.value} value={diff.value}>{diff.label}</option>
                  ))}
                </select>
                
                <select
                  value={publicFilters.dareType}
                  onChange={(e) => handlePublicFilterChange('dareType', e.target.value)}
                  className="px-3 py-2 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Types</option>
                  <option value="submission">Submission</option>
                  <option value="domination">Domination</option>
                  <option value="switch">Switch</option>
                </select>
              </div>
            </div>
            
            {publicDares.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <SparklesIcon className="w-6 h-6 text-orange-400" />
                </div>
                <h4 className="text-md font-semibold text-white mb-2">No Public Dares</h4>
                <p className="text-white/70 mb-4 text-sm">No public dares are available at the moment.</p>
                <button
                  onClick={() => handleQuickAction('create-dare')}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  Create a Dare
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {publicDares.map((dare) => {
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
                          
                          {/* Dare Type Badge */}
                          <div className={`px-3 py-2 rounded-lg text-sm font-semibold ${
                            dare.dareType === 'submission' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            dare.dareType === 'domination' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            dare.dareType === 'switch' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                            'bg-neutral-500/20 text-neutral-400 border border-neutral-500/30'
                          }`}>
                            {dare.dareType || 'Unknown'}
                          </div>
                          
                          {/* Creator Info */}
                          {dare.creator && (
                            <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3">
                              <span className="text-neutral-400 text-sm">Created by</span>
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center">
                                  <UserIcon className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-bold text-white">{dare.creator?.fullName || dare.creator?.username || 'User'}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Action Button */}
                        <button
                          onClick={() => navigate(`/modern/claim/${dare.claimToken || dare._id}`)}
                          className="w-full lg:w-auto bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl px-6 py-3 font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 justify-center"
                        >
                          <PlayIcon className="w-5 h-5" />
                          Claim & Perform
                        </button>
                      </div>
                      
                      {/* Tags */}
                      {renderTags(dare.tags)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Public Switch Games */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <FireIcon className="w-6 h-6 text-purple-400" />
                Public Switch Games ({publicSwitchGames.length})
              </h3>

              <div className="flex items-center gap-4">
                <select
                  value={publicFilters.difficulty}
                  onChange={(e) => handlePublicFilterChange('difficulty', e.target.value)}
                  className="px-3 py-2 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Difficulties</option>
                  {DIFFICULTY_OPTIONS.map(diff => (
                    <option key={diff.value} value={diff.value}>{diff.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {publicSwitchGames.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FireIcon className="w-6 h-6 text-purple-400" />
                </div>
                <h4 className="text-md font-semibold text-white mb-2">No Public Switch Games</h4>
                <p className="text-white/70 mb-4 text-sm">No public switch games are available at the moment.</p>
                <button
                  onClick={() => handleQuickAction('create-switch')}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg px-3 py-2 text-sm font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  Create a Game
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {publicSwitchGames.map((game) => {
                  const { Icon: DifficultyIcon, color } = getDifficultyInfo(game.creatorDare?.difficulty || game.difficulty);
                  
                  return (
                    <div key={game._id} className="bg-neutral-700/50 backdrop-blur-sm rounded-xl border border-neutral-600/30 p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] group">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                          {/* Difficulty Badge */}
                          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r ${color} text-white text-sm font-semibold`}>
                            <DifficultyIcon className="w-4 h-4" />
                            {game.creatorDare?.difficulty || game.difficulty}
                          </div>
                          
                          {/* Game Type Badge */}
                          <div className="px-3 py-2 rounded-lg bg-green-500/20 text-green-400 border border-green-500/30 text-sm font-semibold">
                            Switch Game
                          </div>
                          
                          {/* Creator Info */}
                          {game.creator && (
                            <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3">
                              <span className="text-neutral-400 text-sm">Created by</span>
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-full flex items-center justify-center">
                                  <UserIcon className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-bold text-white">{game.creator?.fullName || game.creator?.username || 'User'}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Action Button */}
                        <button
                          onClick={() => navigate(`/modern/switches/claim/${game._id}`)}
                          className="w-full lg:w-auto bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl px-6 py-3 font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 justify-center"
                        >
                          <UserGroupIcon className="w-5 h-5" />
                          Join Game
                        </button>
                      </div>
                      
                      {/* Game Info */}
                      <div className="mt-3 flex flex-wrap gap-4 text-sm text-neutral-400">
                        {game.createdAt && (
                          <div className="flex items-center gap-2">
                            <ClockIcon className="w-4 h-4" />
                            <span>Created: {new Date(game.createdAt).toLocaleDateString()}</span>
                          </div>
                        )}
                        {game.participants && game.participants.length > 0 && (
                          <div className="flex items-center gap-2">
                            <UserGroupIcon className="w-4 h-4" />
                            <span>Participants: {game.participants.length}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Tags */}
                      {renderTags(game.creatorDare?.tags || game.tags)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Header */}
      <div className="bg-neutral-800/50 backdrop-blur-sm border-b border-neutral-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg transition-colors duration-200"
              >
                <ArrowTopRightOnSquareIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Performer Dashboard</h1>
                <p className="text-neutral-400 text-sm">Manage your dares and track progress</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm font-medium">
                <div className="flex items-center space-x-1">
                  <UserIcon className="w-4 h-4" />
                  <span>Performance Mode</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Main Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-2xl flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white">Performer Dashboard</h2>
              <p className="text-xl sm:text-2xl text-neutral-300 mt-2">
                Manage your dares and track your progress
              </p>
            </div>
          </div>
          <p className="text-neutral-400 text-lg max-w-3xl mx-auto">
            Track your active dares, completed challenges, and discover new opportunities
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 backdrop-blur-lg rounded-2xl border border-red-500/30 p-6 shadow-xl mb-8">
            <div className="flex items-center justify-center gap-3 text-red-300">
              <ExclamationTriangleIcon className="w-6 h-6" />
              <span className="font-semibold">{error}</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700/50 hover:text-white'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {tabs.find(tab => tab.key === activeTab)?.content}
        </div>

        {/* Empty State */}
        {!isLoading && 
         ongoing.length === 0 && 
         completed.length === 0 && 
         mySwitchGames.length === 0 && 
         publicDares.length === 0 && 
         publicSwitchGames.length === 0 && (
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-12 shadow-xl text-center">
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
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg px-6 py-3 font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <PlusIcon className="w-6 h-6" />
                Create Your First Dare
              </button>
              <button
                onClick={() => handleQuickAction('create-switch')}
                className="bg-neutral-800/80 backdrop-blur-xl border border-white/20 text-white rounded-lg px-6 py-3 font-semibold shadow-lg hover:bg-neutral-700/90 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <PuzzlePieceIcon className="w-6 h-6" />
                Create a Switch Game
              </button>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="text-center mt-8">
          <button
            onClick={fetchData}
            className="px-8 py-3 bg-neutral-700/50 hover:bg-neutral-600/50 text-neutral-300 hover:text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 mx-auto"
            disabled={isLoading}
          >
            <ArrowPathIcon className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh Dashboard'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModernDarePerformerDashboard; 