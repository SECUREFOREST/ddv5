import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  FireIcon, 
  UserIcon,
  ClockIcon,
  CalendarIcon,
  EyeIcon,
  HeartIcon,
  PlusIcon,
  GlobeAltIcon,
  LockClosedIcon,
  StarIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftIcon,
  FlagIcon,
  ShareIcon,
  CogIcon,
  ArrowLeftIcon,
  TrophyIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  ClockIcon as ClockIconSolid,
  FireIcon as FireIconSolid,
  EyeIcon as EyeIconSolid,
  HeartIcon as HeartIconSolid
} from '@heroicons/react/24/outline';

const ModernUserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isCurrentUser, setIsCurrentUser] = useState(false);

  const [userProfile, setUserProfile] = useState(null);
  const [userStats, setUserStats] = useState({});
  const [userActivity, setUserActivity] = useState([]);
  const [userTasks, setUserTasks] = useState([]);
  const [userEvidence, setUserEvidence] = useState([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate checking if this is the current user
        const currentUserId = 'user_123'; // In real app, get from auth context
        setIsCurrentUser(userId === currentUserId);
        
        const mockUserProfile = {
          id: userId,
          username: 'GameMaster',
          fullName: 'Alex Thompson',
          email: 'alex@example.com',
          avatar: '/api/avatars/user_123.jpg',
          bio: 'Passionate switch player with 5+ years of experience. Love creating challenging games and helping others grow. Always open to new experiences and learning opportunities.',
          location: 'New York, NY',
          age: 28,
          role: 'switch',
          joinDate: '2020-03-15T00:00:00Z',
          lastSeen: '2024-01-15T14:30:00Z',
          isOnline: true,
          isVerified: true,
          isPremium: true,
          privacyLevel: 'public',
          interests: ['roleplay', 'bondage', 'sensory', 'power-exchange', 'switch-games', 'community-building'],
          badges: [
            { name: 'Game Master', icon: '👑', description: 'Created 50+ successful games' },
            { name: 'Mentor', icon: '🎓', description: 'Helped 100+ users improve' },
            { name: 'Community Leader', icon: '🌟', description: 'Active community contributor' },
            { name: 'Safety First', icon: '🛡️', description: '100% safety record' }
          ],
          socialLinks: {
            twitter: 'https://twitter.com/gamemaster',
            instagram: 'https://instagram.com/gamemaster',
            fetlife: 'https://fetlife.com/users/gamemaster'
          }
        };

        const mockUserStats = {
          totalTasks: 156,
          completedTasks: 142,
          averageGrade: 9.2,
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
          },
          completed: {
            titillating: 23,
            arousing: 34,
            explicit: 45,
            edgy: 28,
            hardcore: 16
          },
          achievements: {
            total: 24,
            recent: 3,
            rare: 5
          },
          community: {
            followers: 89,
            following: 67,
            gamesCreated: 23,
            gamesParticipated: 45
          }
        };

        const mockUserActivity = [
          {
            id: 'act_001',
            type: 'task_completed',
            title: 'Completed Weekend Role Switch Challenge',
            description: 'Successfully completed a 3-day challenge with 4 participants',
            timestamp: '2024-01-15T14:30:00Z',
            difficulty: 'explicit',
            grade: 9.2,
            points: 298,
            icon: <CheckCircleIcon className="w-5 h-5" />
          },
          {
            id: 'act_002',
            type: 'game_created',
            title: 'Created New Switch Game',
            description: 'Launched "Sensory Exploration Challenge" with 6 participants',
            timestamp: '2024-01-14T10:15:00Z',
            participants: 6,
            status: 'active',
            icon: <PlusIcon className="w-5 h-5" />
          },
          {
            id: 'act_003',
            type: 'achievement_earned',
            title: 'Earned "Mentor" Badge',
            description: 'Helped 100+ users improve their skills',
            timestamp: '2024-01-13T16:45:00Z',
            badge: 'Mentor',
            icon: <TrophyIcon className="w-5 h-5" />
          },
          {
            id: 'act_004',
            type: 'task_graded',
            title: 'Graded "Bondage Safety Training"',
            description: 'Provided feedback and grade for user submission',
            timestamp: '2024-01-12T20:30:00Z',
            grade: 9.8,
            icon: <StarIcon className="w-5 h-5" />
          },
          {
            id: 'act_005',
            type: 'community_contribution',
            title: 'Posted Community Guidelines',
            description: 'Shared safety tips for new users',
            timestamp: '2024-01-11T14:20:00Z',
            likes: 23,
            comments: 7,
            icon: <UserGroupIcon className="w-5 h-5" />
          }
        ];

        const mockUserTasks = [
          {
            id: 'task_001',
            title: 'Weekend Role Switch Challenge',
            type: 'switch_game',
            difficulty: 'explicit',
            status: 'completed',
            grade: 9.2,
            points: 298,
            completedAt: '2024-01-15T14:30:00Z',
            duration: '3 days',
            participants: 4
          },
          {
            id: 'task_002',
            title: 'Sensory Deprivation Experience',
            type: 'individual',
            difficulty: 'edgy',
            status: 'completed',
            grade: 8.8,
            points: 156,
            completedAt: '2024-01-12T20:15:00Z',
            duration: '2 hours',
            participants: 1
          },
          {
            id: 'task_003',
            title: 'Power Exchange Workshop',
            type: 'group',
            difficulty: 'arousing',
            status: 'completed',
            grade: 9.5,
            points: 234,
            completedAt: '2024-01-10T16:45:00Z',
            duration: '1 day',
            participants: 3
          }
        ];

        const mockUserEvidence = [
          {
            id: 'ev_001',
            title: 'Weekend Challenge Completion',
            type: 'photo',
            status: 'verified',
            difficulty: 'explicit',
            submittedAt: '2024-01-15T14:30:00Z',
            grade: 9.2,
            points: 298,
            thumbnail: '/api/evidence/thumbnails/ev_001.jpg'
          },
          {
            id: 'ev_002',
            title: 'Sensory Deprivation Video',
            type: 'video',
            status: 'verified',
            difficulty: 'edgy',
            submittedAt: '2024-01-12T20:15:00Z',
            grade: 8.8,
            points: 156,
            thumbnail: '/api/evidence/thumbnails/ev_002.jpg'
          }
        ];

        setUserProfile(mockUserProfile);
        setUserStats(mockUserStats);
        setUserActivity(mockUserActivity);
        setUserTasks(mockUserTasks);
        setUserEvidence(mockUserEvidence);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  const tabs = [
    { id: 'overview', name: 'Overview', icon: <UserIcon className="w-5 h-5" /> },
    { id: 'activity', name: 'Activity', icon: <ClockIcon className="w-5 h-5" /> },
    { id: 'tasks', name: 'Tasks', icon: <CheckCircleIcon className="w-5 h-5" /> },
    { id: 'evidence', name: 'Evidence', icon: <PhotoIcon className="w-5 h-5" /> },
    { id: 'statistics', name: 'Statistics', icon: <ChartBarIcon className="w-5 h-5" /> }
  ];

  const handleFollow = async () => {
    try {
      setIsFollowing(!isFollowing);
      setShowFollowModal(false);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleReport = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowReportModal(false);
      setReportReason('');
    } catch (error) {
      console.error('Error reporting user:', error);
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

  const getStatusColor = (status) => {
    const colors = {
      completed: 'text-green-400',
      in_progress: 'text-blue-400',
      abandoned: 'text-red-400',
      expired: 'text-yellow-400'
    };
    return colors[status] || 'text-neutral-400';
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading user profile...</div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">User Not Found</h2>
          <p className="text-neutral-400 mb-6">The user you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/modern/dashboard"
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-all duration-200"
          >
            Back to Dashboard
          </Link>
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
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">User Profile</h1>
                <p className="text-neutral-400 text-sm">Viewing profile of {userProfile.username}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {!isCurrentUser && (
                <>
                  <button
                    onClick={() => setShowFollowModal(true)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                      isFollowing
                        ? 'bg-neutral-700/50 text-white hover:bg-neutral-600/50'
                        : 'bg-primary hover:bg-primary-dark text-white'
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserIcon className="w-4 h-4" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <PlusIcon className="w-4 h-4" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  >
                    <FlagIcon className="w-4 h-4" />
                    <span>Report</span>
                  </button>
                </>
              )}
              
              <button className="px-4 py-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2">
                <ShareIcon className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Profile Header */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-6 lg:space-y-0">
            {/* Profile Info */}
            <div className="flex items-start space-x-6">
              <div className="relative">
                <img
                  src={userProfile.avatar}
                  alt={userProfile.username}
                  className="w-24 h-24 rounded-full object-cover border-4 border-neutral-700"
                />
                {userProfile.isOnline && (
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-neutral-800"></div>
                )}
                {userProfile.isVerified && (
                  <div className="absolute top-0 right-0 w-6 h-6 bg-blue-500 rounded-full border-2 border-neutral-800 flex items-center justify-center">
                    <ShieldCheckIcon className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-3xl font-bold text-white">{userProfile.fullName}</h2>
                  {userProfile.isPremium && (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full">
                      Premium
                    </span>
                  )}
                </div>
                
                <p className="text-xl text-neutral-400 mb-2">@{userProfile.username}</p>
                
                <div className="flex items-center space-x-4 text-sm text-neutral-400 mb-4">
                  <div className="flex items-center space-x-1">
                    <CalendarIcon className="w-4 h-4" />
                    <span>Joined {new Date(userProfile.joinDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <GlobeAltIcon className="w-4 h-4" />
                    <span>{userProfile.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <UserIcon className="w-4 h-4" />
                    <span className="capitalize">{userProfile.role}</span>
                  </div>
                </div>
                
                <p className="text-neutral-300 mb-4">{userProfile.bio}</p>
                
                {/* Interests */}
                <div className="flex flex-wrap gap-2">
                  {userProfile.interests.map((interest, index) => (
                    <span key={index} className="px-3 py-1 bg-neutral-700/50 text-neutral-300 text-sm rounded-full">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{userStats.totalTasks}</div>
                <div className="text-neutral-400 text-sm">Total Tasks</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{userStats.averageGrade}</div>
                <div className="text-neutral-400 text-sm">Avg Grade</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{userStats.totalPoints?.toLocaleString()}</div>
                <div className="text-neutral-400 text-sm">Total Points</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{userStats.community?.followers}</div>
                <div className="text-neutral-400 text-sm">Followers</div>
              </div>
            </div>
          </div>
          
          {/* Badges */}
          <div className="mt-8 pt-8 border-t border-neutral-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Badges & Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {userProfile.badges.map((badge, index) => (
                <div key={index} className="bg-neutral-700/30 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <div className="text-white font-medium mb-1">{badge.name}</div>
                  <div className="text-neutral-400 text-sm">{badge.description}</div>
                </div>
              ))}
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
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-700/50'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Role Breakdown */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Role Performance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-neutral-700/30 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">{userStats.roleBreakdown?.dom}%</div>
                    <div className="text-white font-medium mb-1">Dominant</div>
                    <div className="text-neutral-400 text-sm">Tasks completed</div>
                  </div>
                  <div className="bg-neutral-700/30 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">{userStats.roleBreakdown?.sub}%</div>
                    <div className="text-white font-medium mb-1">Submissive</div>
                    <div className="text-neutral-400 text-sm">Tasks completed</div>
                  </div>
                  <div className="bg-neutral-700/30 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">{userStats.roleBreakdown?.switch}%</div>
                    <div className="text-white font-medium mb-1">Switch</div>
                    <div className="text-neutral-400 text-sm">Tasks completed</div>
                  </div>
                </div>
              </div>

              {/* Difficulty Breakdown */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Difficulty Progression</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {Object.entries(userStats.difficultyBreakdown || {}).map(([difficulty, count]) => (
                    <div key={difficulty} className="bg-neutral-700/30 rounded-lg p-4 text-center">
                      <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${getDifficultyColor(difficulty)}`}></div>
                      <div className="text-2xl font-bold text-white mb-1">{count}</div>
                      <div className="text-neutral-400 text-sm capitalize">{difficulty}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity Preview */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {userActivity.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 bg-neutral-700/30 rounded-lg">
                      <div className="text-primary">
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{activity.title}</div>
                        <div className="text-neutral-400 text-sm">{activity.description}</div>
                      </div>
                      <div className="text-neutral-500 text-sm">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setActiveTab('activity')}
                    className="text-primary hover:text-primary-dark font-medium transition-colors duration-200"
                  >
                    View All Activity →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white mb-4">Activity History</h3>
              {userActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-neutral-700/30 rounded-lg">
                  <div className="text-primary mt-1">
                        {activity.icon}
                      </div>
                  <div className="flex-1">
                    <div className="text-white font-medium mb-1">{activity.title}</div>
                    <div className="text-neutral-400 text-sm mb-2">{activity.description}</div>
                    <div className="flex items-center space-x-4 text-xs text-neutral-500">
                      <span>{new Date(activity.timestamp).toLocaleString()}</span>
                      {activity.grade && (
                        <span className="flex items-center space-x-1">
                          <StarIcon className="w-3 h-3 text-yellow-400" />
                          <span>{activity.grade}</span>
                        </span>
                      )}
                      {activity.points && (
                        <span className="flex items-center space-x-1">
                          <TrophyIcon className="w-3 h-3 text-purple-400" />
                          <span>{activity.points} pts</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white mb-4">Task History</h3>
              {userTasks.map((task) => (
                <div key={task.id} className="bg-neutral-700/30 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-white mb-2">{task.title}</h4>
                      <div className="flex items-center space-x-4 text-sm text-neutral-400">
                        <span className="capitalize">{task.type.replace('_', ' ')}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(task.difficulty)}`}>
                          {task.difficulty}
                        </span>
                        <span className="flex items-center space-x-1">
                          {getStatusIcon(task.status)}
                          <span className={getStatusColor(task.status)}>
                            {task.status.replace('_', ' ')}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">{task.grade}</div>
                      <div className="text-neutral-400 text-sm">Grade</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-neutral-400">Points:</span>
                      <span className="text-white ml-2">{task.points}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400">Duration:</span>
                      <span className="text-white ml-2">{task.duration}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400">Completed:</span>
                      <span className="text-white ml-2">{new Date(task.completedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Evidence Tab */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-white mb-4">Evidence Gallery</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userEvidence.map((evidence) => (
                  <div key={evidence.id} className="bg-neutral-700/30 rounded-lg overflow-hidden">
                    <div className="aspect-video bg-neutral-700/50 flex items-center justify-center">
                      <div className="text-center">
                        {evidence.type === 'photo' && <PhotoIcon className="w-8 h-8 text-neutral-400" />}
                        {evidence.type === 'video' && <VideoCameraIcon className="w-8 h-8 text-neutral-400" />}
                        {evidence.type === 'document' && <DocumentTextIcon className="w-8 h-8 text-neutral-400" />}
                        <p className="text-neutral-400 text-sm mt-2">{evidence.type.toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-white font-medium mb-2">{evidence.title}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Status:</span>
                          <span className="text-green-400">{evidence.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Grade:</span>
                          <span className="text-white">{evidence.grade}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-neutral-400">Points:</span>
                          <span className="text-white">{evidence.points}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'statistics' && (
            <div className="space-y-8">
              {/* Performance Metrics */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-neutral-700/30 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">{userStats.completedTasks}</div>
                    <div className="text-white font-medium mb-1">Completed Tasks</div>
                    <div className="text-neutral-400 text-sm">Out of {userStats.totalTasks}</div>
                  </div>
                  <div className="bg-neutral-700/30 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">{userStats.totalDuration}</div>
                    <div className="text-white font-medium mb-1">Total Time</div>
                    <div className="text-neutral-400 text-sm">Active participation</div>
                  </div>
                  <div className="bg-neutral-700/30 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">{userStats.achievements?.total}</div>
                    <div className="text-white font-medium mb-1">Achievements</div>
                    <div className="text-neutral-400 text-sm">Badges earned</div>
                  </div>
                  <div className="bg-neutral-700/30 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-yellow-400 mb-2">{userStats.community?.gamesCreated}</div>
                    <div className="text-white font-medium mb-1">Games Created</div>
                    <div className="text-neutral-400 text-sm">Switch games</div>
                  </div>
                </div>
              </div>

              {/* Community Stats */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Community Impact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-neutral-700/30 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">{userStats.community?.followers}</div>
                    <div className="text-white font-medium mb-1">Followers</div>
                    <div className="text-neutral-400 text-sm">Community members</div>
                  </div>
                  <div className="bg-neutral-700/30 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">{userStats.community?.gamesParticipated}</div>
                    <div className="text-white font-medium mb-1">Games Participated</div>
                    <div className="text-neutral-400 text-sm">Active involvement</div>
                  </div>
                  <div className="bg-neutral-700/30 rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">{userStats.community?.following}</div>
                    <div className="text-white font-medium mb-1">Following</div>
                    <div className="text-neutral-400 text-sm">Users followed</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Follow Modal */}
      {showFollowModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-800 rounded-xl border border-neutral-700/50 max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-white mb-4">
              {isFollowing ? 'Unfollow User' : 'Follow User'}
            </h3>
            <p className="text-neutral-300 mb-6">
              {isFollowing 
                ? `Are you sure you want to unfollow ${userProfile.username}? You'll no longer see their updates.`
                : `Follow ${userProfile.username} to see their latest activities and updates.`
              }
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleFollow}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  isFollowing
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-primary hover:bg-primary-dark text-white'
                }`}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
              <button
                onClick={() => setShowFollowModal(false)}
                className="flex-1 px-4 py-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-800 rounded-xl border border-neutral-700/50 max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Report User</h3>
            <p className="text-neutral-300 mb-4">
              Please provide a reason for reporting {userProfile.username}. This will help our moderation team investigate the issue.
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Describe the issue..."
              className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent mb-4"
              rows={4}
            />
            <div className="flex space-x-3">
              <button
                onClick={handleReport}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Submit Report
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 px-4 py-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg font-medium transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernUserProfile; 