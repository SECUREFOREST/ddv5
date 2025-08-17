import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FireIcon, 
  ClockIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  StarIcon,
  TrophyIcon,
  CalendarDaysIcon,
  ClockIcon as ClockIconSolid,
  FireIcon as FireIconSolid
} from '@heroicons/react/24/outline';

const ModernTaskHistory = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [taskHistory, setTaskHistory] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchTaskHistory = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockTaskHistory = [
          {
            id: 'task_001',
            title: 'Weekend Role Switch Challenge',
            type: 'switch_game',
            difficulty: 'explicit',
            status: 'completed',
            grade: 9.2,
            completedAt: '2024-01-15T14:30:00Z',
            duration: '3 days',
            points: 298,
            role: 'switch',
            participants: 4,
            evidence: 'photo_proof.jpg'
          },
          {
            id: 'task_002',
            title: 'Sensory Deprivation Experience',
            type: 'individual',
            difficulty: 'edgy',
            status: 'completed',
            grade: 8.8,
            completedAt: '2024-01-12T20:15:00Z',
            duration: '2 hours',
            points: 156,
            role: 'sub',
            participants: 1,
            evidence: 'video_proof.mp4'
          },
          {
            id: 'task_003',
            title: 'Power Exchange Workshop',
            type: 'group',
            difficulty: 'arousing',
            status: 'completed',
            grade: 9.5,
            completedAt: '2024-01-10T16:45:00Z',
            duration: '1 day',
            points: 234,
            role: 'dom',
            participants: 3,
            evidence: 'text_proof.txt'
          },
          {
            id: 'task_004',
            title: 'Bondage Safety Training',
            type: 'educational',
            difficulty: 'titillating',
            status: 'completed',
            grade: 9.8,
            completedAt: '2024-01-08T11:20:00Z',
            duration: '4 hours',
            points: 89,
            role: 'switch',
            participants: 1,
            evidence: 'certificate.pdf'
          },
          {
            id: 'task_005',
            title: 'Advanced Role Play Scenario',
            type: 'individual',
            difficulty: 'hardcore',
            status: 'completed',
            grade: 9.0,
            completedAt: '2024-01-05T22:30:00Z',
            duration: '6 hours',
            points: 445,
            role: 'dom',
            participants: 1,
            evidence: 'photo_proof.jpg'
          }
        ];

        const mockStats = {
          totalTasks: 156,
          completedTasks: 142,
          averageGrade: 8.9,
          totalPoints: 12450,
          totalDuration: '47 days',
          roleBreakdown: {
            dom: 45,
            sub: 67,
            switch: 44
          },
          difficultyBreakdown: {
            titillating: 23,
            arousing: 34,
            explicit: 45,
            edgy: 28,
            hardcore: 16
          }
        };

        setTaskHistory(mockTaskHistory);
        setStats(mockStats);
      } catch (error) {
        console.error('Error fetching task history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskHistory();
  }, []);

  const tabs = [
    { id: 'all', name: 'All Tasks', count: stats.totalTasks || 0 },
    { id: 'completed', name: 'Completed', count: stats.completedTasks || 0 },
    { id: 'switch_games', name: 'Switch Games', count: taskHistory.filter(t => t.type === 'switch_game').length },
    { id: 'individual', name: 'Individual', count: taskHistory.filter(t => t.type === 'individual').length },
    { id: 'group', name: 'Group', count: taskHistory.filter(t => t.type === 'group').length }
  ];

  const difficulties = [
    { value: 'all', label: 'All Difficulties', color: 'bg-neutral-500' },
    { value: 'titillating', label: 'Titillating', color: 'bg-pink-400' },
    { value: 'arousing', label: 'Arousing', color: 'bg-red-400' },
    { value: 'explicit', label: 'Explicit', color: 'bg-red-600' },
    { value: 'edgy', label: 'Edgy', color: 'bg-red-800' },
    { value: 'hardcore', label: 'Hardcore', color: 'bg-red-900' }
  ];

  const statuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'completed', label: 'Completed' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'abandoned', label: 'Abandoned' },
    { value: 'expired', label: 'Expired' }
  ];

  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'grade', label: 'Grade' },
    { value: 'points', label: 'Points' },
    { value: 'difficulty', label: 'Difficulty' },
    { value: 'duration', label: 'Duration' }
  ];

  const filteredTasks = taskHistory.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = selectedDifficulty === 'all' || task.difficulty === selectedDifficulty;
    const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
    const matchesTab = activeTab === 'all' || task.type === activeTab || 
                      (activeTab === 'completed' && task.status === 'completed');
    
    return matchesSearch && matchesDifficulty && matchesStatus && matchesTab;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.completedAt);
        bValue = new Date(b.completedAt);
        break;
      case 'grade':
        aValue = a.grade || 0;
        bValue = b.grade || 0;
        break;
      case 'points':
        aValue = a.points || 0;
        bValue = b.points || 0;
        break;
      case 'difficulty':
        const difficultyOrder = { titillating: 1, arousing: 2, explicit: 3, edgy: 4, hardcore: 5 };
        aValue = difficultyOrder[a.difficulty] || 0;
        bValue = difficultyOrder[b.difficulty] || 0;
        break;
      case 'duration':
        aValue = a.duration;
        bValue = b.duration;
        break;
      default:
        aValue = a.title;
        bValue = b.title;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const getDifficultyColor = (difficulty) => {
    const colors = {
      titillating: 'bg-pink-500',
      arousing: 'bg-red-400',
      explicit: 'bg-red-600',
      edgy: 'bg-red-800',
      hardcore: 'bg-red-900'
    };
    return colors[difficulty] || 'bg-neutral-500';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
      case 'in_progress':
        return <ClockIcon className="w-5 h-5 text-blue-400" />;
      case 'abandoned':
        return <XCircleIcon className="w-5 h-5 text-red-400" />;
      case 'expired':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />;
      default:
        return <ClockIcon className="w-5 h-5 text-neutral-400" />;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'text-green-400',
      in_progress: 'text-blue-400',
      abandoned: 'text-red-400',
      expired: 'text-yellow-400'
    };
    return colors[status] || 'text-neutral-400';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading your task history...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Header */}
      <div className="bg-neutral-800/50 backdrop-blur-sm border-b border-neutral-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-xl flex items-center justify-center">
                <FireIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Task History</h1>
                <p className="text-neutral-400 text-sm">Complete tracking of your platform activities</p>
              </div>
            </div>
            <Link
              to="/modern/dashboard"
              className="px-4 py-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg transition-colors duration-200"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm">Total Tasks</p>
                <p className="text-2xl font-bold text-white">{stats.totalTasks}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm">Average Grade</p>
                <p className="text-2xl font-bold text-white">{stats.averageGrade}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <StarIcon className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm">Total Points</p>
                <p className="text-2xl font-bold text-white">{stats.totalPoints?.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <TrophyIcon className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm">Total Time</p>
                <p className="text-2xl font-bold text-white">{stats.totalDuration}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-2 mb-6">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-700/50'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span>{tab.name}</span>
                  <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200"
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <FunnelIcon className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-neutral-700/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Difficulty</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {difficulties.map((difficulty) => (
                      <option key={difficulty.value} value={difficulty.value}>
                        {difficulty.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {statuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Date Range</label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {dateRanges.map((range) => (
                      <option key={range.value} value={range.value}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Sort By</label>
                  <div className="flex space-x-2">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="flex-1 px-3 py-2 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {sortOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-3 py-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg transition-colors duration-200"
                    >
                      {sortOrder === 'asc' ? <ArrowUpIcon className="w-5 h-5" /> : <ArrowDownIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {sortedTasks.length === 0 ? (
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-12 text-center">
              <div className="w-16 h-16 bg-neutral-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <ChartBarIcon className="w-8 h-8 text-neutral-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No tasks found</h3>
              <p className="text-neutral-400">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            sortedTasks.map((task) => (
              <div key={task.id} className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  {/* Task Info */}
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full ${getDifficultyColor(task.difficulty)}`}></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status.replace('_', ' ')}
                          </span>
                          {getStatusIcon(task.status)}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-neutral-400">Type</p>
                            <p className="text-white capitalize">{task.type.replace('_', ' ')}</p>
                          </div>
                          <div>
                            <p className="text-neutral-400">Role</p>
                            <p className="text-white capitalize">{task.role}</p>
                          </div>
                          <div>
                            <p className="text-neutral-400">Duration</p>
                            <p className="text-white">{task.duration}</p>
                          </div>
                          <div>
                            <p className="text-neutral-400">Participants</p>
                            <p className="text-white">{task.participants}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Task Metrics */}
                  <div className="flex flex-col items-end space-y-3">
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        <StarIcon className="w-5 h-5 text-yellow-400" />
                        <span className="text-2xl font-bold text-white">{task.grade}</span>
                      </div>
                      <p className="text-neutral-400 text-sm">Grade</p>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        <TrophyIcon className="w-5 h-5 text-purple-400" />
                        <span className="text-xl font-bold text-white">{task.points}</span>
                      </div>
                      <p className="text-neutral-400 text-sm">Points</p>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center space-x-2 mb-1">
                        <CalendarDaysIcon className="w-5 h-5 text-blue-400" />
                        <span className="text-white">{new Date(task.completedAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-neutral-400 text-sm">Completed</p>
                    </div>
                  </div>
                </div>

                {/* Evidence Link */}
                {task.evidence && (
                  <div className="mt-4 pt-4 border-t border-neutral-700/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <EyeIcon className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-400 text-sm">Evidence submitted</span>
                      </div>
                      <button className="text-primary hover:text-primary-dark text-sm font-medium transition-colors duration-200">
                        View Evidence
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernTaskHistory; 