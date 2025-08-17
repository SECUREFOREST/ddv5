import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FireIcon, 
  PhotoIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  EyeIcon,
  TrashIcon,
  DownloadIcon,
  ShareIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  StarIcon,
  FilterIcon,
  MagnifyingGlassIcon,
  GridIcon,
  ListIcon,
  CalendarIcon,
  TagIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

const ModernEvidenceGallery = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState(null);
  const [showViewer, setShowViewer] = useState(false);

  const [evidenceItems, setEvidenceItems] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchEvidenceGallery = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockEvidenceItems = [
          {
            id: 'ev_001',
            title: 'Weekend Challenge Completion',
            type: 'photo',
            status: 'verified',
            difficulty: 'explicit',
            submittedAt: '2024-01-15T14:30:00Z',
            taskTitle: 'Weekend Role Switch Challenge',
            grade: 9.2,
            points: 298,
            fileSize: '2.4 MB',
            dimensions: '1920x1080',
            thumbnail: '/api/evidence/thumbnails/ev_001.jpg',
            fullSize: '/api/evidence/full/ev_001.jpg',
            description: 'Proof of completing the weekend challenge with all required elements',
            tags: ['challenge', 'role-switch', 'weekend', 'explicit'],
            verifiedBy: 'GameMaster',
            verifiedAt: '2024-01-16T10:15:00Z'
          },
          {
            id: 'ev_002',
            title: 'Sensory Deprivation Video',
            type: 'video',
            status: 'pending',
            difficulty: 'edgy',
            submittedAt: '2024-01-12T20:15:00Z',
            taskTitle: 'Sensory Deprivation Experience',
            grade: null,
            points: null,
            fileSize: '45.2 MB',
            dimensions: '1920x1080',
            thumbnail: '/api/evidence/thumbnails/ev_002.jpg',
            fullSize: '/api/evidence/full/ev_002.mp4',
            description: 'Video documentation of the sensory deprivation session',
            tags: ['sensory', 'deprivation', 'video', 'edgy'],
            verifiedBy: null,
            verifiedAt: null
          },
          {
            id: 'ev_003',
            title: 'Power Exchange Workshop Certificate',
            type: 'document',
            status: 'verified',
            difficulty: 'arousing',
            submittedAt: '2024-01-10T16:45:00Z',
            taskTitle: 'Power Exchange Workshop',
            grade: 9.5,
            points: 234,
            fileSize: '1.2 MB',
            dimensions: 'A4',
            thumbnail: '/api/evidence/thumbnails/ev_003.jpg',
            fullSize: '/api/evidence/full/ev_003.pdf',
            description: 'Certificate of completion for the power exchange workshop',
            tags: ['workshop', 'power-exchange', 'certificate', 'arousing'],
            verifiedBy: 'WorkshopLeader',
            verifiedAt: '2024-01-11T09:30:00Z'
          },
          {
            id: 'ev_004',
            title: 'Bondage Safety Training Photos',
            type: 'photo',
            status: 'verified',
            difficulty: 'titillating',
            submittedAt: '2024-01-08T11:20:00Z',
            taskTitle: 'Bondage Safety Training',
            grade: 9.8,
            points: 89,
            fileSize: '3.1 MB',
            dimensions: '1920x1080',
            thumbnail: '/api/evidence/thumbnails/ev_004.jpg',
            fullSize: '/api/evidence/full/ev_004.jpg',
            description: 'Photos demonstrating proper bondage safety techniques',
            tags: ['bondage', 'safety', 'training', 'titillating'],
            verifiedBy: 'SafetyInstructor',
            verifiedAt: '2024-01-09T14:20:00Z'
          },
          {
            id: 'ev_005',
            title: 'Advanced Role Play Scenario',
            type: 'photo',
            status: 'rejected',
            difficulty: 'hardcore',
            submittedAt: '2024-01-05T22:30:00Z',
            taskTitle: 'Advanced Role Play Scenario',
            grade: null,
            points: null,
            fileSize: '2.8 MB',
            dimensions: '1920x1080',
            thumbnail: '/api/evidence/thumbnails/ev_005.jpg',
            fullSize: '/api/evidence/full/ev_005.jpg',
            description: 'Role play scenario documentation',
            tags: ['roleplay', 'advanced', 'scenario', 'hardcore'],
            verifiedBy: 'Moderator',
            verifiedAt: '2024-01-06T15:45:00Z',
            rejectionReason: 'Content does not meet community guidelines'
          }
        ];

        const mockStats = {
          totalEvidence: 156,
          verifiedEvidence: 142,
          pendingEvidence: 8,
          rejectedEvidence: 6,
          totalStorage: '2.4 GB',
          averageGrade: 8.9,
          typeBreakdown: {
            photo: 89,
            video: 45,
            document: 22
          },
          statusBreakdown: {
            verified: 142,
            pending: 8,
            rejected: 6
          }
        };

        setEvidenceItems(mockEvidenceItems);
        setStats(mockStats);
      } catch (error) {
        console.error('Error fetching evidence gallery:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvidenceGallery();
  }, []);

  const evidenceTypes = [
    { value: 'all', label: 'All Types', icon: <EyeIcon className="w-5 h-5" /> },
    { value: 'photo', label: 'Photos', icon: <PhotoIcon className="w-5 h-5" /> },
    { value: 'video', label: 'Videos', icon: <VideoCameraIcon className="w-5 h-5" /> },
    { value: 'document', label: 'Documents', icon: <DocumentTextIcon className="w-5 h-5" /> }
  ];

  const evidenceStatuses = [
    { value: 'all', label: 'All Statuses' },
    { value: 'verified', label: 'Verified', color: 'text-green-400' },
    { value: 'pending', label: 'Pending', color: 'text-yellow-400' },
    { value: 'rejected', label: 'Rejected', color: 'text-red-400' }
  ];

  const difficulties = [
    { value: 'all', label: 'All Difficulties' },
    { value: 'titillating', label: 'Titillating', color: 'bg-pink-500' },
    { value: 'arousing', label: 'Arousing', color: 'bg-red-400' },
    { value: 'explicit', label: 'Explicit', color: 'bg-red-600' },
    { value: 'edgy', label: 'Edgy', color: 'bg-red-800' },
    { value: 'hardcore', label: 'Hardcore', color: 'bg-red-900' }
  ];

  const sortOptions = [
    { value: 'date', label: 'Submission Date' },
    { value: 'grade', label: 'Grade' },
    { value: 'points', label: 'Points' },
    { value: 'difficulty', label: 'Difficulty' },
    { value: 'type', label: 'Type' },
    { value: 'status', label: 'Status' }
  ];

  const filteredEvidence = evidenceItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.taskTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesDifficulty = selectedDifficulty === 'all' || item.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesType && matchesStatus && matchesDifficulty;
  });

  const sortedEvidence = [...filteredEvidence].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'date':
        aValue = new Date(a.submittedAt);
        bValue = new Date(b.submittedAt);
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
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
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

  const getStatusColor = (status) => {
    const colors = {
      verified: 'text-green-400',
      pending: 'text-yellow-400',
      rejected: 'text-red-400'
    };
    return colors[status] || 'text-neutral-400';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckIcon className="w-5 h-5 text-green-400" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-400" />;
      case 'rejected':
        return <XMarkIcon className="w-5 h-5 text-red-400" />;
      default:
        return <ClockIcon className="w-5 h-5 text-neutral-400" />;
    }
  };

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

  const getTypeIcon = (type) => {
    switch (type) {
      case 'photo':
        return <PhotoIcon className="w-6 h-6" />;
      case 'video':
        return <VideoCameraIcon className="w-6 h-6" />;
      case 'document':
        return <DocumentTextIcon className="w-6 h-6" />;
      default:
        return <EyeIcon className="w-6 h-6" />;
    }
  };

  const handleViewEvidence = (evidence) => {
    setSelectedEvidence(evidence);
    setShowViewer(true);
  };

  const handleDownload = (evidence) => {
    // Simulate download
    console.log('Downloading:', evidence.title);
  };

  const handleShare = (evidence) => {
    // Simulate sharing
    console.log('Sharing:', evidence.title);
  };

  const handleDelete = (evidence) => {
    // Simulate deletion
    setEvidenceItems(prev => prev.filter(item => item.id !== evidence.id));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading your evidence gallery...</div>
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
                <h1 className="text-2xl font-bold text-white">Evidence Gallery</h1>
                <p className="text-neutral-400 text-sm">Manage and view your proof submissions</p>
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
                <p className="text-neutral-400 text-sm">Total Evidence</p>
                <p className="text-2xl font-bold text-white">{stats.totalEvidence}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <EyeIcon className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm">Verified</p>
                <p className="text-2xl font-bold text-white">{stats.verifiedEvidence}</p>
              </div>
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckIcon className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm">Storage Used</p>
                <p className="text-2xl font-bold text-white">{stats.totalStorage}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <PhotoIcon className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm">Average Grade</p>
                <p className="text-2xl font-bold text-white">{stats.averageGrade}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <StarIcon className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
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
                  placeholder="Search evidence..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200"
                />
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  viewMode === 'grid' 
                    ? 'bg-primary text-white' 
                    : 'bg-neutral-700/50 text-neutral-400 hover:text-white'
                }`}
              >
                <GridIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  viewMode === 'list' 
                    ? 'bg-primary text-white' 
                    : 'bg-neutral-700/50 text-neutral-400 hover:text-white'
                }`}
              >
                <ListIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <FilterIcon className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-neutral-700/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    {evidenceTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
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
                    {evidenceStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

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

        {/* Evidence Grid/List */}
        {sortedEvidence.length === 0 ? (
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-12 text-center">
            <div className="w-16 h-16 bg-neutral-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <PhotoIcon className="w-8 h-8 text-neutral-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No evidence found</h3>
            <p className="text-neutral-400">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {sortedEvidence.map((evidence) => (
              <div key={evidence.id} className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 overflow-hidden">
                {/* Evidence Preview */}
                <div className="relative">
                  <div className="aspect-video bg-neutral-700/50 flex items-center justify-center">
                    <div className="text-center">
                      {getTypeIcon(evidence.type)}
                      <p className="text-neutral-400 text-sm mt-2">{evidence.type.toUpperCase()}</p>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium bg-neutral-800/80 ${getStatusColor(evidence.status)}`}>
                      {evidence.status}
                    </div>
                  </div>
                  
                  {/* Difficulty Badge */}
                  <div className="absolute top-2 left-2">
                    <div className={`w-3 h-3 rounded-full ${getDifficultyColor(evidence.difficulty)}`}></div>
                  </div>
                </div>

                {/* Evidence Info */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">{evidence.title}</h3>
                    {getStatusIcon(evidence.status)}
                  </div>
                  
                  <p className="text-neutral-400 text-sm mb-3">{evidence.description}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Task:</span>
                      <span className="text-white">{evidence.taskTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Submitted:</span>
                      <span className="text-white">{new Date(evidence.submittedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">File Size:</span>
                      <span className="text-white">{evidence.fileSize}</span>
                    </div>
                    {evidence.grade && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Grade:</span>
                        <span className="text-white">{evidence.grade}</span>
                      </div>
                    )}
                    {evidence.points && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Points:</span>
                        <span className="text-white">{evidence.points}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {evidence.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-neutral-700/50 text-neutral-300 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-700/50">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewEvidence(evidence)}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors duration-200"
                        title="View Evidence"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownload(evidence)}
                        className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors duration-200"
                        title="Download"
                      >
                        <DownloadIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleShare(evidence)}
                        className="p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-colors duration-200"
                        title="Share"
                      >
                        <ShareIcon className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <button
                      onClick={() => handleDelete(evidence)}
                      className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors duration-200"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Evidence Viewer Modal */}
      {showViewer && selectedEvidence && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-800 rounded-xl border border-neutral-700/50 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">{selectedEvidence.title}</h2>
                <button
                  onClick={() => setShowViewer(false)}
                  className="p-2 bg-neutral-700/50 hover:bg-neutral-700 text-white rounded-lg transition-colors duration-200"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Evidence Display */}
                <div className="aspect-video bg-neutral-700/50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    {getTypeIcon(selectedEvidence.type)}
                    <p className="text-neutral-400 mt-2">Evidence Preview</p>
                    <p className="text-neutral-500 text-sm">Click to view full content</p>
                  </div>
                </div>
                
                {/* Evidence Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Type:</span>
                        <span className="text-white capitalize">{selectedEvidence.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Status:</span>
                        <span className={`${getStatusColor(selectedEvidence.status)}`}>
                          {selectedEvidence.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Difficulty:</span>
                        <span className="text-white capitalize">{selectedEvidence.difficulty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">File Size:</span>
                        <span className="text-white">{selectedEvidence.fileSize}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Dimensions:</span>
                        <span className="text-white">{selectedEvidence.dimensions}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Task Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Task:</span>
                        <span className="text-white">{selectedEvidence.taskTitle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Submitted:</span>
                        <span className="text-white">{new Date(selectedEvidence.submittedAt).toLocaleString()}</span>
                      </div>
                      {selectedEvidence.grade && (
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Grade:</span>
                          <span className="text-white">{selectedEvidence.grade}</span>
                        </div>
                      )}
                      {selectedEvidence.points && (
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Points:</span>
                          <span className="text-white">{selectedEvidence.points}</span>
                        </div>
                      )}
                      {selectedEvidence.verifiedBy && (
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Verified By:</span>
                          <span className="text-white">{selectedEvidence.verifiedBy}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                  <p className="text-neutral-300">{selectedEvidence.description}</p>
                </div>
                
                {/* Tags */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvidence.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 bg-neutral-700/50 text-neutral-300 text-sm rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center justify-center space-x-4 pt-4 border-t border-neutral-700/50">
                  <button
                    onClick={() => handleDownload(selectedEvidence)}
                    className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <DownloadIcon className="w-5 h-5" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={() => handleShare(selectedEvidence)}
                    className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                  >
                    <ShareIcon className="w-5 h-5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernEvidenceGallery; 