import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FireIcon, 
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  CameraIcon,
  CogIcon,
  ShieldCheckIcon,
  BellIcon,
  GlobeAltIcon,
  CheckIcon,
  XMarkIcon,
  ArrowLeftIcon,
  TrashIcon,
  DownloadIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const ModernProfileSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const [profileData, setProfileData] = useState({
    fullName: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    bio: 'Passionate about exploring new experiences and building meaningful connections.',
    location: 'New York, NY',
    age: 28,
    role: 'switch',
    interests: ['roleplay', 'bondage', 'sensory', 'power-exchange'],
    avatar: '/api/avatars/user_123.jpg'
  });

  const [privacyData, setPrivacyData] = useState({
    profileVisibility: 'public',
    showOnlineStatus: true,
    allowMessages: 'friends',
    showActivity: 'friends',
    allowFriendRequests: true,
    showLastSeen: false,
    allowTagging: true
  });

  const [notificationData, setNotificationData] = useState({
    emailNotifications: true,
    pushNotifications: true,
    taskUpdates: true,
    messageNotifications: true,
    communityUpdates: false,
    marketingEmails: false,
    weeklyDigest: true
  });

  const [securityData, setSecurityData] = useState({
    twoFactorEnabled: false,
    loginNotifications: true,
    sessionTimeout: 30,
    allowMultipleSessions: true
  });

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handlePrivacyChange = (field, value) => {
    setPrivacyData(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field, value) => {
    setNotificationData(prev => ({ ...prev, [field]: value }));
  };

  const handleSecurityChange = (field, value) => {
    setSecurityData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrors({ general: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Simulate avatar upload
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({ ...prev, avatar: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: <UserIcon className="w-5 h-5" /> },
    { id: 'privacy', name: 'Privacy', icon: <ShieldCheckIcon className="w-5 h-5" /> },
    { id: 'notifications', name: 'Notifications', icon: <BellIcon className="w-5 h-5" /> },
    { id: 'security', name: 'Security', icon: <LockClosedIcon className="w-5 h-5" /> }
  ];

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
                <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
                <p className="text-neutral-400 text-sm">Manage your account and preferences</p>
              </div>
            </div>
            <Link
              to="/modern/dashboard"
              className="px-4 py-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center space-x-2 text-green-400">
              <CheckIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Profile updated successfully!</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <div className="flex items-center space-x-2 text-red-400">
              <XMarkIcon className="w-5 h-5" />
              <span className="text-sm font-medium">{errors.general}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6 sticky top-32">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-700/50'
                    }`}
                  >
                    {tab.icon}
                    <span className="font-medium">{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-8">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>
                    
                    {/* Avatar Section */}
                    <div className="mb-8">
                      <label className="block text-sm font-medium text-neutral-300 mb-4">Profile Picture</label>
                      <div className="flex items-center space-x-6">
                        <div className="relative">
                          <img
                            src={profileData.avatar}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover border-4 border-neutral-700"
                          />
                          <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary hover:bg-primary-dark rounded-full flex items-center justify-center cursor-pointer transition-colors duration-200">
                            <CameraIcon className="w-4 h-4 text-white" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAvatarUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                        <div>
                          <p className="text-neutral-400 text-sm mb-2">
                            Upload a new profile picture. Supported formats: JPG, PNG, GIF
                          </p>
                          <p className="text-neutral-400 text-xs">
                            Maximum file size: 5MB
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-neutral-300 mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          id="fullName"
                          value={profileData.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200"
                          placeholder="Enter your full name"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="username" className="block text-sm font-medium text-neutral-300 mb-2">
                          Username *
                        </label>
                        <input
                          type="text"
                          id="username"
                          value={profileData.username}
                          onChange={(e) => handleInputChange('username', e.target.value)}
                          className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200"
                          placeholder="Enter your username"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={profileData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200"
                          placeholder="Enter your email"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="age" className="block text-sm font-medium text-neutral-300 mb-2">
                          Age *
                        </label>
                        <input
                          type="number"
                          id="age"
                          value={profileData.age}
                          onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
                          min="18"
                          max="100"
                          className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200"
                          placeholder="Enter your age"
                        />
                      </div>
                    </div>

                    {/* Bio and Location */}
                    <div>
                      <label htmlFor="bio" className="block text-sm font-medium text-neutral-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        value={profileData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-neutral-300 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        id="location"
                        value={profileData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white placeholder-neutral-400 focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-200"
                        placeholder="City, State/Country"
                      />
                    </div>

                    {/* Role Selection */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-4">
                        Preferred Role
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { value: 'switch', label: 'Switch', description: 'Enjoy both roles' },
                          { value: 'dom', label: 'Dominant', description: 'Prefer to lead' },
                          { value: 'sub', label: 'Submissive', description: 'Prefer to follow' }
                        ].map((role) => (
                          <label key={role.value} className="flex items-start space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="role"
                              value={role.value}
                              checked={profileData.role === role.value}
                              onChange={(e) => handleInputChange('role', e.target.value)}
                              className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2 mt-1"
                            />
                            <div className="flex-1">
                              <div className="text-white font-medium">{role.label}</div>
                              <div className="text-neutral-400 text-sm">{role.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Updating...' : 'Update Profile'}
                    </button>
                  </div>
                </form>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Privacy Settings</h2>
                    
                    <div className="space-y-6">
                      <div className="bg-neutral-700/30 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Profile Visibility</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                              Profile Visibility
                            </label>
                            <select
                              value={privacyData.profileVisibility}
                              onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                              className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                              <option value="public">Public - Visible to everyone</option>
                              <option value="friends">Friends - Visible to friends only</option>
                              <option value="private">Private - Hidden from everyone</option>
                            </select>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={privacyData.showOnlineStatus}
                                onChange={(e) => handlePrivacyChange('showOnlineStatus', e.target.checked)}
                                className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                              />
                              <span className="text-neutral-300">Show online status</span>
                            </label>
                            
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={privacyData.showLastSeen}
                                onChange={(e) => handlePrivacyChange('showLastSeen', e.target.checked)}
                                className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                              />
                              <span className="text-neutral-300">Show last seen</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="bg-neutral-700/30 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Communication Settings</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                              Who can send you messages?
                            </label>
                            <select
                              value={privacyData.allowMessages}
                              onChange={(e) => handlePrivacyChange('allowMessages', e.target.value)}
                              className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                              <option value="everyone">Everyone</option>
                              <option value="friends">Friends only</option>
                              <option value="none">No one</option>
                            </select>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={privacyData.allowFriendRequests}
                                onChange={(e) => handlePrivacyChange('allowFriendRequests', e.target.checked)}
                                className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                              />
                              <span className="text-neutral-300">Allow friend requests</span>
                            </label>
                            
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={privacyData.allowTagging}
                                onChange={(e) => handlePrivacyChange('allowTagging', e.target.checked)}
                                className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                              />
                              <span className="text-neutral-300">Allow tagging in posts</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Notification Preferences</h2>
                    
                    <div className="space-y-6">
                      <div className="bg-neutral-700/30 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Platform Notifications</h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notificationData.emailNotifications}
                                onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                                className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                              />
                              <span className="text-neutral-300">Email notifications</span>
                            </label>
                            
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notificationData.pushNotifications}
                                onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
                                className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                              />
                              <span className="text-neutral-300">Push notifications</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="bg-neutral-700/30 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Activity Notifications</h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notificationData.taskUpdates}
                                onChange={(e) => handleNotificationChange('taskUpdates', e.target.checked)}
                                className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                              />
                              <span className="text-neutral-300">Task updates and changes</span>
                            </label>
                            
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notificationData.messageNotifications}
                                onChange={(e) => handleNotificationChange('messageNotifications', e.target.checked)}
                                className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                              />
                              <span className="text-neutral-300">New messages</span>
                            </label>
                            
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notificationData.communityUpdates}
                                onChange={(e) => handleNotificationChange('communityUpdates', e.target.checked)}
                                className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                              />
                              <span className="text-neutral-300">Community updates</span>
                            </label>
                            
                            <label className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notificationData.weeklyDigest}
                                onChange={(e) => handleNotificationChange('weeklyDigest', e.target.checked)}
                                className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                              />
                              <span className="text-neutral-300">Weekly activity digest</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">Security Settings</h2>
                    
                    <div className="space-y-6">
                      <div className="bg-neutral-700/30 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Two-Factor Authentication</h3>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-neutral-300 mb-2">
                              Add an extra layer of security to your account
                            </p>
                            <p className="text-neutral-400 text-sm">
                              {securityData.twoFactorEnabled 
                                ? 'Two-factor authentication is currently enabled' 
                                : 'Two-factor authentication is currently disabled'
                              }
                            </p>
                          </div>
                          <button
                            onClick={() => handleSecurityChange('twoFactorEnabled', !securityData.twoFactorEnabled)}
                            className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                              securityData.twoFactorEnabled
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                          >
                            {securityData.twoFactorEnabled ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      </div>

                      <div className="bg-neutral-700/30 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Session Management</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-neutral-300 mb-2">
                              Session Timeout (minutes)
                            </label>
                            <select
                              value={securityData.sessionTimeout}
                              onChange={(e) => handleSecurityChange('sessionTimeout', parseInt(e.target.value))}
                              className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                              <option value={15}>15 minutes</option>
                              <option value={30}>30 minutes</option>
                              <option value={60}>1 hour</option>
                              <option value={1440}>24 hours</option>
                            </select>
                          </div>
                          
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={securityData.allowMultipleSessions}
                              onChange={(e) => handleSecurityChange('allowMultipleSessions', e.target.checked)}
                              className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                            />
                            <span className="text-neutral-300">Allow multiple active sessions</span>
                          </label>
                        </div>
                      </div>

                      <div className="bg-neutral-700/30 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Account Actions</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-neutral-300 font-medium">Export Data</p>
                              <p className="text-neutral-400 text-sm">Download a copy of your data</p>
                            </div>
                            <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2">
                              <DownloadIcon className="w-4 h-4" />
                              <span>Export</span>
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-neutral-300 font-medium">Delete Account</p>
                              <p className="text-neutral-400 text-sm">Permanently remove your account</p>
                            </div>
                            <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2">
                              <TrashIcon className="w-4 h-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernProfileSettings; 