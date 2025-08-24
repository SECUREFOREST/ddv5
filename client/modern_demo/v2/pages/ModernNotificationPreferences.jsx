import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FireIcon, 
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  ChatBubbleLeftIcon,
  UserGroupIcon,
  StarIcon,
  ShieldCheckIcon,
  CogIcon,
  CheckIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

const ModernNotificationPreferences = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTestNotification, setShowTestNotification] = useState(false);

  const [notificationSettings, setNotificationSettings] = useState({
    // Platform Notifications
    platform: {
      enabled: true,
      sound: true,
      vibration: true,
      showPreview: true
    },
    
    // Email Notifications
    email: {
      enabled: true,
      frequency: 'immediate',
      digest: {
        daily: false,
        weekly: true,
        monthly: false
      }
    },
    
    // Push Notifications
    push: {
      enabled: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    },
    
    // Task-Related Notifications
    tasks: {
      newTasks: true,
      taskUpdates: true,
      taskCompletion: true,
      taskGrading: true,
      taskExpiration: true,
      cooldownReminders: true
    },
    
    // Social & Community Notifications
    social: {
      newMessages: true,
      friendRequests: true,
      mentions: true,
      comments: true,
      likes: true,
      communityUpdates: false
    },
    
    // Game & Challenge Notifications
    games: {
      newChallenges: true,
      gameUpdates: true,
      gameResults: true,
      participantActivity: true,
      gameInvitations: true
    },
    
    // Safety & Security Notifications
    safety: {
      loginAlerts: true,
      securityUpdates: true,
      contentModeration: true,
      reportUpdates: true,
      privacyChanges: true
    },
    
    // Marketing & Promotional
    marketing: {
      newFeatures: true,
      platformUpdates: true,
      specialEvents: false,
      partnerOffers: false,
      newsletter: true
    }
  });

  const [testNotification, setTestNotification] = useState({
    type: 'push',
    title: 'Test Notification',
    message: 'This is a test notification to verify your settings.'
  });

  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        // Simulate API call to fetch current settings
        await new Promise(resolve => setTimeout(resolve, 500));
        // Settings are already initialized in state
      } catch (error) {
        console.error('Error fetching notification settings:', error);
      }
    };

    fetchNotificationSettings();
  }, []);

  const handleSettingChange = (category, setting, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleNestedSettingChange = (category, subcategory, setting, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [subcategory]: {
          ...prev[category][subcategory],
          [setting]: value
        }
      }
    }));
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
      console.error('Error updating notification settings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      if (testNotification.type === 'push' && notificationSettings.push.enabled) {
        // Simulate push notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(testNotification.title, {
            body: testNotification.message,
            icon: '/favicon.svg'
          });
        }
      }
      
      setShowTestNotification(true);
      setTimeout(() => setShowTestNotification(false), 3000);
      
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  const getNotificationIcon = (category) => {
    const icons = {
      platform: <CogIcon className="w-6 h-6" />,
      email: <EnvelopeIcon className="w-6 h-6" />,
      push: <DevicePhoneMobileIcon className="w-6 h-6" />,
      tasks: <StarIcon className="w-6 h-6" />,
      social: <UserGroupIcon className="w-6 h-6" />,
      games: <FireIcon className="w-6 h-6" />,
      safety: <ShieldCheckIcon className="w-6 h-6" />,
      marketing: <ChatBubbleLeftIcon className="w-6 h-6" />
    };
    return icons[category] || <BellIcon className="w-6 h-6" />;
  };

  const getNotificationColor = (category) => {
    const colors = {
      platform: 'bg-blue-500/20 text-blue-400',
      email: 'bg-green-500/20 text-green-400',
      push: 'bg-purple-500/20 text-purple-400',
      tasks: 'bg-yellow-500/20 text-yellow-400',
      social: 'bg-pink-500/20 text-pink-400',
      games: 'bg-red-500/20 text-red-400',
      safety: 'bg-orange-500/20 text-orange-400',
      marketing: 'bg-indigo-500/20 text-indigo-400'
    };
    return colors[category] || 'bg-neutral-500/20 text-neutral-400';
  };

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
                <h1 className="text-2xl font-bold text-white">Notification Preferences</h1>
                <p className="text-neutral-400 text-sm">Control how and when you receive notifications</p>
              </div>
            </div>
            <Link
              to="/modern/profile/settings"
              className="px-4 py-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              <span>Back to Settings</span>
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
              <span className="text-sm font-medium">Notification preferences updated successfully!</span>
            </div>
          </div>
        )}

        {/* Test Notification Success */}
        {showTestNotification && (
          <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center space-x-2 text-blue-400">
              <CheckIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Test notification sent successfully!</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Platform Notifications */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getNotificationColor('platform')}`}>
                {getNotificationIcon('platform')}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Platform Notifications</h2>
                <p className="text-neutral-400 text-sm">General notification settings for the platform</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.platform.enabled}
                  onChange={(e) => handleSettingChange('platform', 'enabled', e.target.checked)}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300">Enable platform notifications</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.platform.sound}
                  onChange={(e) => handleSettingChange('platform', 'sound', e.target.checked)}
                  disabled={!notificationSettings.platform.enabled}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2 disabled:opacity-50"
                />
                <span className="text-neutral-300">Play notification sounds</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.platform.vibration}
                  onChange={(e) => handleSettingChange('platform', 'vibration', e.target.checked)}
                  disabled={!notificationSettings.platform.enabled}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2 disabled:opacity-50"
                />
                <span className="text-neutral-300">Enable vibration</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.platform.showPreview}
                  onChange={(e) => handleSettingChange('platform', 'showPreview', e.target.checked)}
                  disabled={!notificationSettings.platform.enabled}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2 disabled:opacity-50"
                />
                <span className="text-neutral-300">Show notification previews</span>
              </label>
            </div>
          </div>

          {/* Email Notifications */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getNotificationColor('email')}`}>
                {getNotificationIcon('email')}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Email Notifications</h2>
                <p className="text-neutral-400 text-sm">Control email notification frequency and content</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.email.enabled}
                  onChange={(e) => handleSettingChange('email', 'enabled', e.target.checked)}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300">Enable email notifications</span>
              </label>
              
              {notificationSettings.email.enabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">
                      Notification Frequency
                    </label>
                    <select
                      value={notificationSettings.email.frequency}
                      onChange={(e) => handleSettingChange('email', 'frequency', e.target.value)}
                      className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="immediate">Immediate</option>
                      <option value="hourly">Hourly</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-3">Digest Options</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.email.digest.daily}
                          onChange={(e) => handleNestedSettingChange('email', 'digest', 'daily', e.target.checked)}
                          className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                        />
                        <span className="text-neutral-300">Daily digest</span>
                      </label>
                      
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.email.digest.weekly}
                          onChange={(e) => handleNestedSettingChange('email', 'digest', 'weekly', e.target.checked)}
                          className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                        />
                        <span className="text-neutral-300">Weekly digest</span>
                      </label>
                      
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.email.digest.monthly}
                          onChange={(e) => handleNestedSettingChange('email', 'digest', 'monthly', e.target.checked)}
                          className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                        />
                        <span className="text-neutral-300">Monthly digest</span>
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Push Notifications */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getNotificationColor('push')}`}>
                {getNotificationIcon('push')}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Push Notifications</h2>
                <p className="text-neutral-400 text-sm">Mobile and browser push notification settings</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.push.enabled}
                  onChange={(e) => handleSettingChange('push', 'enabled', e.target.checked)}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300">Enable push notifications</span>
              </label>
              
              {notificationSettings.push.enabled && (
                <>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.push.quietHours.enabled}
                      onChange={(e) => handleNestedSettingChange('push', 'quietHours', 'enabled', e.target.checked)}
                      className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                    />
                    <span className="text-neutral-300">Enable quiet hours</span>
                  </label>
                  
                  {notificationSettings.push.quietHours.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">Start Time</label>
                        <input
                          type="time"
                          value={notificationSettings.push.quietHours.start}
                          onChange={(e) => handleNestedSettingChange('push', 'quietHours', 'start', e.target.value)}
                          className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-2">End Time</label>
                        <input
                          type="time"
                          value={notificationSettings.push.quietHours.end}
                          onChange={(e) => handleNestedSettingChange('push', 'quietHours', 'end', e.target.value)}
                          className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Task-Related Notifications */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getNotificationColor('tasks')}`}>
                {getNotificationIcon('tasks')}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Task Notifications</h2>
                <p className="text-neutral-400 text-sm">Notifications related to task activities</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.tasks.newTasks}
                  onChange={(e) => handleSettingChange('tasks', 'newTasks', e.target.checked)}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300">New tasks available</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.tasks.taskUpdates}
                  onChange={(e) => handleSettingChange('tasks', 'taskUpdates', e.target.checked)}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300">Task updates and changes</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.tasks.taskCompletion}
                  onChange={(e) => handleSettingChange('tasks', 'taskCompletion', e.target.checked)}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300">Task completion</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.tasks.taskGrading}
                  onChange={(e) => handleSettingChange('tasks', 'taskGrading', e.target.checked)}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300">Task grading results</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.tasks.taskExpiration}
                  onChange={(e) => handleSettingChange('tasks', 'taskExpiration', e.target.checked)}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300">Task expiration warnings</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.tasks.cooldownReminders}
                  onChange={(e) => handleSettingChange('tasks', 'cooldownReminders', e.target.checked)}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300">Cooldown reminders</span>
              </label>
            </div>
          </div>

          {/* Social & Community Notifications */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getNotificationColor('social')}`}>
                {getNotificationIcon('social')}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Social Notifications</h2>
                <p className="text-neutral-400 text-sm">Community and social interaction notifications</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.social.newMessages}
                  onChange={(e) => handleSettingChange('social', 'newMessages', e.target.checked)}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300">New messages</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.social.friendRequests}
                  onChange={(e) => handleSettingChange('social', 'friendRequests', e.target.checked)}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300">Friend requests</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.social.mentions}
                  onChange={(e) => handleSettingChange('social', 'mentions', e.target.checked)}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300">Mentions and tags</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.social.comments}
                  onChange={(e) => handleSettingChange('social', 'comments', e.target.checked)}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300">Comments on your content</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.social.likes}
                  onChange={(e) => handleSettingChange('social', 'likes', e.target.checked)}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300">Likes and reactions</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.social.communityUpdates}
                  onChange={(e) => handleSettingChange('social', 'communityUpdates', e.target.checked)}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300">Community updates</span>
              </label>
            </div>
          </div>

          {/* Game & Challenge Notifications */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getNotificationColor('games')}`}>
                {getNotificationIcon('games')}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Game Notifications</h2>
                <p className="text-neutral-400 text-sm">Switch games and challenge notifications</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.games.newChallenges}
                  onChange={(e) => handleSettingChange('games', 'newChallenges', e.target.checked)}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300">New challenges</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.games.gameUpdates}
                  onChange={(e) => handleSettingChange('games', 'gameUpdates', e.target.checked)}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300">Game updates</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.games.gameResults}
                  onChange={(e) => handleSettingChange('games', 'gameResults', e.target.checked)}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300">Game results</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.games.participantActivity}
                  onChange={(e) => handleSettingChange('games', 'participantActivity', e.target.checked)}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300">Participant activity</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.games.gameInvitations}
                  onChange={(e) => handleSettingChange('games', 'gameInvitations', e.target.checked)}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300">Game invitations</span>
              </label>
            </div>
          </div>

          {/* Safety & Security Notifications */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getNotificationColor('safety')}`}>
                {getNotificationIcon('safety')}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Safety & Security</h2>
                <p className="text-neutral-400 text-sm">Important security and safety notifications</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.safety.loginAlerts}
                  onChange={(e) => handleSettingChange('safety', 'loginAlerts', e.target.checked)}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300">Login alerts</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.safety.securityUpdates}
                  onChange={(e) => handleSettingChange('safety', 'securityUpdates', e.target.checked)}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300">Security updates</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.safety.contentModeration}
                  onChange={(e) => handleSettingChange('safety', 'contentModeration', e.target.checked)}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300">Content moderation</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.safety.reportUpdates}
                  onChange={(e) => handleSettingChange('safety', 'reportUpdates', e.target.checked)}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300">Report updates</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.safety.privacyChanges}
                  onChange={(e) => handleSettingChange('safety', 'privacyChanges', e.target.checked)}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300">Privacy policy changes</span>
              </label>
            </div>
          </div>

          {/* Marketing & Promotional Notifications */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getNotificationColor('marketing')}`}>
                {getNotificationIcon('marketing')}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Marketing & Updates</h2>
                <p className="text-neutral-400 text-sm">Platform updates and promotional content</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.marketing.newFeatures}
                  onChange={(e) => handleSettingChange('marketing', 'newFeatures', e.target.checked)}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300">New features</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.marketing.platformUpdates}
                  onChange={(e) => handleSettingChange('marketing', 'platformUpdates', e.target.checked)}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300">Platform updates</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.marketing.specialEvents}
                  onChange={(e) => handleSettingChange('marketing', 'specialEvents', e.target.checked)}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300">Special events</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.marketing.partnerOffers}
                  onChange={(e) => handleSettingChange('marketing', 'partnerOffers', e.target.checked)}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300">Partner offers</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.marketing.newsletter}
                  onChange={(e) => handleSettingChange('marketing', 'newsletter', e.target.checked)}
                  className="w-4 h-4 text-primary bg-neutral-700/50 border-neutral-600/50 focus:ring-primary focus:ring-2"
                />
                <span className="text-neutral-300">Newsletter</span>
              </label>
            </div>
          </div>

          {/* Test Notification Section */}
          <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <BellIcon className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Test Notifications</h2>
                <p className="text-neutral-400 text-sm">Test your notification settings</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Notification Type</label>
                  <select
                    value={testNotification.type}
                    onChange={(e) => setTestNotification(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="push">Push Notification</option>
                    <option value="email">Email</option>
                    <option value="in-app">In-App</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Message</label>
                  <input
                    type="text"
                    value={testNotification.message}
                    onChange={(e) => setTestNotification(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full px-4 py-3 bg-neutral-700/50 border border-neutral-600/50 rounded-lg text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Test notification message"
                  />
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleTestNotification}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <BellIcon className="w-5 h-5" />
                <span>Send Test Notification</span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="w-5 h-5" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModernNotificationPreferences; 