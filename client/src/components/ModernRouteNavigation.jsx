import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  Bars3Icon,
  FireIcon,
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
  PlayIcon,
  DocumentTextIcon,
  UserPlusIcon,
  LockClosedIcon,
  CogIcon,
  TrophyIcon,
  ShieldCheckIcon,
  PhotoIcon,
  BellIcon,
  EyeIcon,
  SettingsIcon,
  StarIcon
} from '@heroicons/react/24/solid';

const ModernRouteNavigation = () => {
  const location = useLocation();

  const routes = [
    {
      path: '/',
      name: 'Landing Page',
      icon: <FireIcon className="w-5 h-5" />,
      description: 'Modern OSA platform introduction and features'
    },
    {
      path: '/register',
      name: 'Registration',
      icon: <UserPlusIcon className="w-5 h-5" />,
      description: 'Create your OSA account and start your journey'
    },
    {
      path: '/login',
      name: 'Login',
      icon: <LockClosedIcon className="w-5 h-5" />,
      description: 'Sign in to your existing OSA account'
    },
    {
      path: '/modern/routes',
      name: 'Route Navigation',
      icon: <CogIcon className="w-5 h-5" />,
      description: 'Navigate between all modern UI components'
    },
    {
      path: '/modern',
      name: 'Modern UI Demo',
      icon: <FireIcon className="w-5 h-5" />,
      description: 'Interactive showcase of all modern components'
    },
    {
      path: '/modern/dashboard',
      name: 'Modern Dashboard',
      icon: <HomeIcon className="w-5 h-5" />,
      description: 'Enhanced dashboard with modern design'
    },
    {
      path: '/modern/create',
      name: 'Task Creator',
      icon: <PlusIcon className="w-5 h-5" />,
      description: 'Modern task creation interface'
    },
    {
      path: '/modern/browse',
      name: 'Task Browser',
      icon: <MagnifyingGlassIcon className="w-5 h-5" />,
      description: 'Advanced task discovery and filtering'
    },
    {
      path: '/modern/profile',
      name: 'Modern Profile',
      icon: <UserIcon className="w-5 h-5" />,
      description: 'Enhanced user profile and statistics'
    },
    {
      path: '/modern/navigation',
      name: 'Navigation Demo',
      icon: <Bars3Icon className="w-5 h-5" />,
      description: 'Modern navigation system showcase'
    },
    {
      path: '/modern/dares',
      name: 'Modern Dares',
      icon: <FireIcon className="w-5 h-5" />,
      description: 'Task browsing with modern interface'
    },
    {
      path: '/modern/dares/create',
      name: 'Create Dare',
      icon: <PlusIcon className="w-5 h-5" />,
      description: 'Create new dares with modern form'
    },
    {
      path: '/modern/leaderboard',
      name: 'Modern Leaderboard',
      icon: <HomeIcon className="w-5 h-5" />,
      description: 'Leaderboard with modern dashboard'
    },
    {
      path: '/modern/activity',
      name: 'Activity Feed',
      icon: <HomeIcon className="w-5 h-5" />,
      description: 'Activity tracking with modern interface'
    },
    {
      path: '/modern/tasks/active',
      name: 'Active Tasks',
      icon: <ClockIcon className="w-5 h-5" />,
      description: 'Manage active tasks and track progress'
    },
    {
      path: '/modern/users/analytics',
      name: 'User Analytics',
      icon: <ChartBarIcon className="w-5 h-5" />,
      description: 'Comprehensive performance analytics'
    },
    {
      path: '/modern/community',
      name: 'Community',
      icon: <UserGroupIcon className="w-5 h-5" />,
      description: 'Public acts and community features'
    },
    {
      path: '/modern/switch-games',
      name: 'Switch Games',
      icon: <UserGroupIcon className="w-5 h-5" />,
      description: 'Multi-participant games with role switching'
    },
    {
      path: '/modern/switch-games/create',
      name: 'Create Switch Game',
      icon: <PlusIcon className="w-5 h-5" />,
      description: 'Design and create new switch games'
    },
    {
      path: '/modern/switch-games/participate',
      name: 'Game Participation',
      icon: <PlayIcon className="w-5 h-5" />,
      description: 'Manage your active games and join new ones'
    },
    {
      path: '/modern/switch-games/tasks',
      name: 'Task Management',
      icon: <DocumentTextIcon className="w-5 h-5" />,
      description: 'Create, assign, and grade game tasks'
    },
    {
      path: '/modern/switch-games/results',
      name: 'Game Results',
      icon: <TrophyIcon className="w-5 h-5" />,
      description: 'View results and manage loser proof submissions'
    },
    {
      path: '/modern/admin',
      name: 'Admin Dashboard',
      icon: <CogIcon className="w-5 h-5" />,
      description: 'System management and user administration'
    },
           {
         path: '/modern/safety/report',
         name: 'Safety Report',
         icon: <ShieldCheckIcon className="w-5 h-5" />,
         description: 'Report inappropriate content and behavior'
       },
       {
         path: '/modern/tasks/history',
         name: 'Task History',
         icon: <ClockIcon className="w-5 h-5" />,
         description: 'Complete tracking of your platform activities'
       },
       {
         path: '/modern/tasks/evidence',
         name: 'Evidence Gallery',
         icon: <PhotoIcon className="w-5 h-5" />,
         description: 'Manage and view your proof submissions'
       },
       {
         path: '/modern/profile/notifications',
         name: 'Notification Preferences',
         icon: <BellIcon className="w-5 h-5" />,
         description: 'Control how and when you receive notifications'
       },
       {
         path: '/modern/users/:userId',
         name: 'User Profile',
         icon: <UserIcon className="w-5 h-5" />,
         description: 'Detailed user profiles with activity history'
       },
       {
         path: '/modern/dares/create/dom',
         name: 'Create Dominant Demand',
         icon: <FireIcon className="w-5 h-5" />,
         description: 'Create dominant dares with consent protection'
       },
       {
         path: '/modern/dares/:id',
         name: 'Dare Details',
         icon: <EyeIcon className="w-5 h-5" />,
         description: 'View and manage dare details with modern interface'
       },
       {
         path: '/modern/dares/select',
         name: 'Difficulty Selection',
         icon: <StarIcon className="w-5 h-5" />,
         description: 'Choose your comfort level for dare performance'
       },
       {
         path: '/modern/dares/123/participate',
         name: 'Dare Participation',
         icon: <UserGroupIcon className="w-5 h-5" />,
         description: 'Participate in dares with consent and proof submission'
       },
       {
         path: '/modern/dares/123/consent',
         name: 'Dare Consent',
         icon: <ShieldCheckIcon className="w-5 h-5" />,
         description: 'Review and consent to perform dares with safety information'
       },
       {
         path: '/modern/dares/123/reveal',
         name: 'Dare Reveal',
         icon: <EyeIcon className="w-5 h-5" />,
         description: 'View revealed dare content and submit proof'
       },
       {
         path: '/modern/dares/123/perform',
         name: 'Dare Performance',
         icon: <PlayIcon className="w-5 h-5" />,
         description: 'Perform dares with progress tracking and proof submission'
       },
       {
         path: '/modern/dares/123/share',
         name: 'Dare Sharing',
         icon: <ShareIcon className="w-5 h-5" />,
         description: 'Share dares with friends and community with enhanced privacy controls'
       },
       {
         path: '/modern/performer-dashboard',
         name: 'Performer Dashboard',
         icon: <UserIcon className="w-5 h-5" />,
         description: 'Comprehensive dashboard for managing dares, switch games, and performance tracking'
       },
       {
         path: '/modern/offer-submission',
         name: 'Offer Submission',
         icon: <DocumentPlusIcon className="w-5 h-5" />,
         description: 'Create submission offers with difficulty selection, tags, and privacy controls'
       },
       {
         path: '/modern/leaderboard',
         name: 'Leaderboard',
         icon: <TrophyIcon className="w-5 h-5" />,
         description: 'View performance rankings and community standings with role-based filtering'
       },
       {
         path: '/modern/profile/123',
         name: 'Profile View',
         icon: <UserIcon className="w-5 h-5" />,
         description: 'View detailed user profiles with statistics, preferences, and activity history'
       },
       {
         path: '/modern/profile',
         name: 'Profile Management',
         icon: <SettingsIcon className="w-5 h-5" />,
         description: 'Manage your profile, preferences, and account settings with enhanced controls'
       }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 py-8">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-dark rounded-2xl flex items-center justify-center">
              <FireIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">Modern OSA UI System</h1>
              <p className="text-neutral-400 text-lg">Route Navigation & Testing</p>
            </div>
          </div>
          <p className="text-neutral-300 text-lg max-w-3xl mx-auto">
            Navigate to different modern UI components to test functionality and explore the new design system.
            All components are built from legacy OSA patterns with contemporary design principles.
          </p>
        </div>

        {/* Current Route Display */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Current Route</h2>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <code className="text-primary font-mono text-lg">{location.pathname}</code>
          </div>
        </div>

        {/* Route Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {routes.map((route) => (
            <Link
              key={route.path}
              to={route.path}
              className={`group block p-6 rounded-xl border-2 transition-all duration-200 ${
                location.pathname === route.path
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                  : 'border-neutral-700/50 bg-neutral-800/50 hover:border-neutral-600/50 hover:bg-neutral-700/30'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  location.pathname === route.path
                    ? 'bg-primary text-white'
                    : 'bg-neutral-700/50 text-neutral-400 group-hover:bg-neutral-600/50 group-hover:text-neutral-300'
                }`}>
                  {route.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-lg transition-colors duration-200 ${
                    location.pathname === route.path
                      ? 'text-primary'
                      : 'text-white group-hover:text-primary'
                  }`}>
                    {route.name}
                  </h3>
                  <p className="text-neutral-400 text-sm mt-1 group-hover:text-neutral-300 transition-colors duration-200">
                    {route.description}
                  </p>
                  <div className="mt-3">
                    <span className="text-xs text-neutral-500 font-mono">
                      {route.path}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Active Indicator */}
              {location.pathname === route.path && (
                <div className="mt-4 pt-4 border-t border-primary/20">
                  <div className="flex items-center space-x-2 text-primary text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span>Currently Active</span>
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
          <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/dashboard"
              className="px-6 py-3 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <HomeIcon className="w-5 h-5" />
              <span>Back to Legacy Dashboard</span>
            </Link>
            <Link
              to="/ui-demo"
              className="px-6 py-3 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <Bars3Icon className="w-5 h-5" />
              <span>Legacy UI Demo</span>
            </Link>
            <a
              href="/MODERN_UI_SYSTEM.md"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-info/20 hover:bg-info/30 text-info rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <FireIcon className="w-5 h-5" />
              <span>View Documentation</span>
            </a>
          </div>
        </div>

        {/* System Information */}
        <div className="mt-8 bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6 border border-neutral-700/50">
          <h2 className="text-xl font-semibold text-white mb-4">System Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-white font-medium mb-2">Modern UI Features</h3>
              <ul className="space-y-1 text-sm text-neutral-400">
                <li>• Glassmorphism design with backdrop blur</li>
                <li>• OSA color scheme preservation</li>
                <li>• Responsive mobile-first design</li>
                <li>• Enhanced accessibility features</li>
                <li>• Smooth animations and transitions</li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-medium mb-2">Legacy Integration</h3>
              <ul className="space-y-1 text-sm text-neutral-400">
                <li>• Difficulty system (titillating → hardcore)</li>
                <li>• Role management (dom/sub/switch)</li>
                <li>• Task workflows and cooldown system</li>
                <li>• Performance tracking and grading</li>
                <li>• Privacy and visibility controls</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernRouteNavigation; 