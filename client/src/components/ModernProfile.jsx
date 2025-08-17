import React, { useState } from 'react';
import { 
  FireIcon, 
  SparklesIcon, 
  EyeDropperIcon, 
  ExclamationTriangleIcon, 
  RocketLaunchIcon,
  UserIcon,
  ChartBarIcon,
  TrophyIcon,
  ClockIcon,
  StarIcon,
  PencilIcon,
  CameraIcon,
  CogIcon,
  HeartIcon,
  EyeIcon,
  LockClosedIcon,
  PlusIcon,
  CheckCircleIcon
} from '@heroicons/react/24/solid';
import { DIFFICULTY_OPTIONS } from '../constants';

const ModernProfile = () => {
  const [profile, setProfile] = useState({
    username: 'AlexTheDom',
    fullName: 'Alex Johnson',
    email: 'alex@example.com',
    bio: 'Experienced dominant who enjoys creating challenging and rewarding tasks for submissives. Focus on safety, consent, and mutual satisfaction.',
    avatar: null,
    role: 'dominant',
    joinDate: '2023-03-15',
    lastActive: '2 hours ago',
    isPublic: true
  });

  const [stats, setStats] = useState({
    averageGrade: 8.7,
    totalTasks: 47,
    completedTasks: 42,
    failedTasks: 5,
    totalParticipants: 156,
    roleBreakdown: { dom: 65, sub: 35 },
    difficultyBreakdown: {
      titillating: 15,
      arousing: 25,
      explicit: 30,
      edgy: 20,
      hardcore: 10
    },
    completed: {
      titillating: 3,
      arousing: 5,
      explicit: 6,
      edgy: 4,
      hardcore: 2
    },
    achievements: [
      { id: 1, name: 'First Task', description: 'Completed your first task', icon: '🎯', unlocked: true },
      { id: 2, name: 'Task Master', description: 'Completed 25 tasks', icon: '👑', unlocked: true },
      { id: 3, name: 'High Achiever', description: 'Maintained 8.5+ average grade', icon: '⭐', unlocked: true },
      { id: 4, name: 'Diversity Explorer', description: 'Tried all difficulty levels', icon: '🌟', unlocked: false },
      { id: 5, name: 'Community Leader', description: '100+ participants in your tasks', icon: '🏆', unlocked: false }
    ]
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: 'task_created',
      title: 'Sensual Massage Challenge',
      difficulty: 'arousing',
      time: '2 hours ago',
      participants: 3
    },
    {
      id: 2,
      type: 'task_completed',
      title: 'Photo Challenge',
      difficulty: 'explicit',
      time: '1 day ago',
      grade: 9
    },
    {
      id: 3,
      type: 'grade_received',
      title: 'Dance Performance',
      difficulty: 'titillating',
      time: '3 days ago',
      grade: 8
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: profile.fullName,
    bio: profile.bio,
    isPublic: profile.isPublic
  });

  const getDifficultyColor = (difficulty) => {
    const colors = {
      titillating: 'from-pink-400 to-pink-600',
      arousing: 'from-purple-500 to-purple-700',
      explicit: 'from-red-500 to-red-700',
      edgy: 'from-yellow-400 to-yellow-600',
      hardcore: 'from-gray-800 to-black'
    };
    return colors[difficulty] || 'from-gray-500 to-gray-700';
  };

  const getDifficultyIcon = (difficulty) => {
    const icons = {
      titillating: <SparklesIcon className="w-5 h-5" />,
      arousing: <FireIcon className="w-5 h-5" />,
      explicit: <EyeDropperIcon className="w-5 h-5" />,
      edgy: <ExclamationTriangleIcon className="w-5 h-5" />,
      hardcore: <RocketLaunchIcon className="w-5 h-5" />
    };
    return icons[difficulty] || <SparklesIcon className="w-5 h-5" />;
  };

  const getRoleColor = (role) => {
    const colors = {
      dominant: 'from-primary to-primary-dark',
      submissive: 'from-info to-info-dark',
      switch: 'from-success to-success-dark'
    };
    return colors[role] || 'from-neutral-600 to-neutral-700';
  };

  const getRoleIcon = (role) => {
    const icons = {
      dominant: <TrophyIcon className="w-5 h-5" />,
      submissive: <HeartIcon className="w-5 h-5" />,
      switch: <StarIcon className="w-5 h-5" />
    };
    return icons[role] || <UserIcon className="w-5 h-5" />;
  };

  const handleEditSave = () => {
    setProfile(prev => ({
      ...prev,
      ...editForm
    }));
    setIsEditing(false);
  };

  const handleEditCancel = () => {
    setEditForm({
      fullName: profile.fullName,
      bio: profile.bio,
      isPublic: profile.isPublic
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Profile Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary-dark to-primary-darker">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-6 py-12 sm:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
              {/* Avatar Section */}
              <div className="relative">
                <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border-4 border-white/20">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.fullName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <UserIcon className="w-16 h-16 text-white" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors duration-200">
                  <CameraIcon className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start space-x-3 mb-4">
                  <h1 className="text-4xl font-bold text-white">{profile.fullName}</h1>
                  <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getRoleColor(profile.role)} text-white`}>
                    {getRoleIcon(profile.role)}
                    <span className="capitalize">{profile.role}</span>
                  </span>
                </div>
                
                <p className="text-white/80 text-lg mb-4 max-w-2xl">{profile.bio}</p>
                
                <div className="flex flex-wrap items-center justify-center lg:justify-start space-x-6 text-white/80 text-sm">
                  <span className="flex items-center space-x-2">
                    <UserIcon className="w-4 h-4" />
                    <span>@{profile.username}</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4" />
                    <span>Joined {new Date(profile.joinDate).toLocaleDateString()}</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4" />
                    <span>Last active {profile.lastActive}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm flex items-center space-x-2"
                >
                  <PencilIcon className="w-5 h-5" />
                  <span>Edit Profile</span>
                </button>
                <button className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 backdrop-blur-sm flex items-center space-x-2">
                  <CogIcon className="w-5 h-5" />
                  <span>Settings</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 sm:px-8 lg:px-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm font-medium">Average Grade</p>
                <p className="text-3xl font-bold text-white">{stats.averageGrade}</p>
              </div>
              <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center">
                <StarIcon className="w-6 h-6 text-success" />
              </div>
            </div>
          </div>

          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm font-medium">Total Tasks</p>
                <p className="text-3xl font-bold text-white">{stats.totalTasks}</p>
                <p className="text-sm text-neutral-400">{stats.completedTasks} completed</p>
              </div>
              <div className="w-12 h-12 bg-info/20 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-info" />
              </div>
            </div>
          </div>

          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm font-medium">Participants</p>
                <p className="text-3xl font-bold text-white">{stats.totalParticipants}</p>
                <p className="text-sm text-neutral-400">Total engagement</p>
              </div>
              <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-warning" />
              </div>
            </div>
          </div>

          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm font-medium">Success Rate</p>
                <p className="text-3xl font-bold text-white">
                  {Math.round((stats.completedTasks / stats.totalTasks) * 100)}%
                </p>
                <p className="text-sm text-neutral-400">Task completion</p>
              </div>
              <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center">
                <TrophyIcon className="w-6 h-6 text-success" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Role Breakdown & Difficulty Stats */}
          <div className="space-y-6">
            {/* Role Breakdown */}
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
              <h3 className="text-xl font-semibold text-white mb-4">Role Breakdown</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                      <TrophyIcon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-white font-medium">Dominant</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">{stats.roleBreakdown.dom}%</span>
                </div>
                <div className="w-full bg-neutral-700 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-primary to-primary-dark"
                    style={{ width: `${stats.roleBreakdown.dom}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-info/20 rounded-lg flex items-center justify-center">
                      <HeartIcon className="w-5 h-5 text-info" />
                    </div>
                    <span className="text-white font-medium">Submissive</span>
                  </div>
                  <span className="text-2xl font-bold text-info">{stats.roleBreakdown.sub}%</span>
                </div>
                <div className="w-full bg-neutral-700 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-info to-info-dark"
                    style={{ width: `${stats.roleBreakdown.sub}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Difficulty Breakdown */}
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
              <h3 className="text-xl font-semibold text-white mb-4">Difficulty Breakdown</h3>
              <div className="space-y-4">
                {Object.entries(stats.difficultyBreakdown).map(([difficulty, percentage]) => (
                  <div key={difficulty} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getDifficultyIcon(difficulty)}
                        <span className="text-white text-sm font-medium capitalize">{difficulty}</span>
                      </div>
                      <span className="text-neutral-400 text-sm">{percentage}%</span>
                    </div>
                    <div className="w-full bg-neutral-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${getDifficultyColor(difficulty)}`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
              <h3 className="text-xl font-semibold text-white mb-4">Achievements</h3>
              <div className="space-y-3">
                {stats.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      achievement.unlocked
                        ? 'bg-success/10 border border-success/20'
                        : 'bg-neutral-700/30 border border-neutral-600/30'
                    }`}
                  >
                    <div className={`text-2xl ${achievement.unlocked ? 'opacity-100' : 'opacity-30'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${achievement.unlocked ? 'text-white' : 'text-neutral-500'}`}>
                        {achievement.name}
                      </h4>
                      <p className={`text-sm ${achievement.unlocked ? 'text-neutral-300' : 'text-neutral-600'}`}>
                        {achievement.description}
                      </p>
                    </div>
                    {achievement.unlocked && (
                      <div className="w-6 h-6 bg-success/20 rounded-full flex items-center justify-center">
                        <CheckCircleIcon className="w-4 h-4 text-success" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center Column - Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
              <h3 className="text-xl font-semibold text-white mb-6">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 bg-neutral-700/30 rounded-lg">
                    <div className="w-10 h-10 bg-neutral-600 rounded-full flex items-center justify-center flex-shrink-0">
                      {activity.type === 'task_created' && <PlusIcon className="w-5 h-5 text-info" />}
                      {activity.type === 'task_completed' && <CheckCircleIcon className="w-5 h-5 text-success" />}
                      {activity.type === 'grade_received' && <StarIcon className="w-5 h-5 text-warning" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm">
                        {activity.type === 'task_created' && 'Created new task'}
                        {activity.type === 'task_completed' && 'Completed task'}
                        {activity.type === 'grade_received' && 'Received grade'}
                        : <span className="font-medium text-primary">{activity.title}</span>
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className={`inline-flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getDifficultyColor(activity.difficulty)} text-white`}>
                          {getDifficultyIcon(activity.difficulty)}
                          <span className="capitalize">{activity.difficulty}</span>
                        </span>
                        <span className="text-neutral-500 text-xs">{activity.time}</span>
                        {activity.grade && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success">
                            Grade: {activity.grade}
                          </span>
                        )}
                        {activity.participants && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-info/20 text-info">
                            {activity.participants} participants
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50">
          <div className="bg-neutral-800 rounded-xl border border-neutral-700/50 p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">Edit Profile</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full bg-neutral-700/50 border border-neutral-600 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full bg-neutral-700/50 border border-neutral-600 rounded-lg px-4 py-3 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={editForm.isPublic}
                  onChange={(e) => setEditForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="w-4 h-4 text-primary focus:ring-primary border-neutral-600 bg-neutral-700 rounded"
                />
                <label htmlFor="isPublic" className="text-white">
                  Make profile public
                </label>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleEditSave}
                className="flex-1 bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
              >
                Save Changes
              </button>
              <button
                onClick={handleEditCancel}
                className="flex-1 bg-neutral-700 hover:bg-neutral-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
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

export default ModernProfile; 