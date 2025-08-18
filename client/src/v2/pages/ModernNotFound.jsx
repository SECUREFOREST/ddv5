import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ExclamationTriangleIcon,
  HomeIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  CogIcon,
  BellIcon,
  BookOpenIcon,
  FireIcon,
  PlayIcon,
  ClockIcon,
  BoltIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const ModernNotFound = () => {
  const navigate = useNavigate();

  const quickLinks = [
    { path: '/modern', name: 'Home', icon: HomeIcon, color: 'from-blue-500 to-blue-600' },
    { path: '/modern/dashboard', name: 'Dashboard', icon: CogIcon, color: 'from-green-500 to-green-600' },
    { path: '/modern/dares', name: 'Browse Dares', icon: FireIcon, color: 'from-red-500 to-red-600' },
    { path: '/modern/activity-feed', name: 'Activity Feed', icon: BellIcon, color: 'from-purple-500 to-purple-600' },
    { path: '/modern/profile', name: 'Profile', icon: StarIcon, color: 'from-yellow-500 to-yellow-600' },
    { path: '/modern/help', name: 'Help Center', icon: QuestionMarkCircleIcon, color: 'from-indigo-500 to-indigo-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Header */}
      <div className="bg-neutral-800/50 backdrop-blur-sm border-b border-neutral-700/50">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-neutral-700/50 hover:bg-neutral-600/50 text-white rounded-lg transition-colors duration-200"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
                <p className="text-neutral-400 text-sm">404 Error - Page doesn't exist</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full text-sm font-medium">
                <div className="flex items-center space-x-1">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span>404 Error</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        {/* Main Error Content */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-32 h-32 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/25">
              <ExclamationTriangleIcon className="w-16 h-16 text-white" />
            </div>
            <div>
              <h2 className="text-6xl sm:text-7xl font-bold text-white mb-6">404</h2>
              <p className="text-2xl sm:text-3xl text-neutral-300 mt-2">
                Page Not Found
              </p>
            </div>
          </div>
          <p className="text-neutral-400 text-xl max-w-3xl mx-auto mb-8">
            Sorry, the page you are looking for does not exist or has been moved. 
            Don't worry though, we've got plenty of other great content for you to explore!
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for pages, dares, or users..."
                className="w-full pl-12 pr-4 py-4 bg-neutral-700/50 border border-neutral-600/50 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-200"
              />
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/modern">
              <button className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl px-8 py-4 font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-3">
                <HomeIcon className="w-6 h-6" />
                Go to Home
              </button>
            </Link>
            <button
              onClick={() => navigate(-1)}
              className="bg-neutral-700/50 text-white border border-neutral-600/50 rounded-xl px-8 py-4 font-bold text-lg transition-all duration-200 hover:bg-neutral-600/50 flex items-center gap-3"
            >
              <ArrowLeftIcon className="w-6 h-6" />
              Go Back
            </button>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl mb-12">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            Quick Navigation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickLinks.map((link, index) => {
              const IconComponent = link.icon;
              return (
                <Link
                  key={index}
                  to={link.path}
                  className="group p-6 bg-neutral-700/30 hover:bg-neutral-600/30 rounded-xl border border-neutral-600/30 transition-all duration-200 hover:shadow-lg hover:scale-105"
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 bg-gradient-to-r ${link.color} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-bold text-white text-lg group-hover:text-primary transition-colors duration-200">
                      {link.name}
                    </h4>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl mb-12">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            Need Help?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <QuestionMarkCircleIcon className="w-10 h-10 text-white" />
              </div>
              <h4 className="font-bold text-white text-lg mb-3">Contact Support</h4>
              <p className="text-neutral-400 text-sm mb-4">
                If you believe this is an error, please contact our support team for assistance.
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-3 font-bold transition-colors duration-200">
                Contact Support
              </button>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpenIcon className="w-10 h-10 text-white" />
              </div>
              <h4 className="font-bold text-white text-lg mb-3">Help Center</h4>
              <p className="text-neutral-400 text-sm mb-4">
                Browse our comprehensive help documentation and frequently asked questions.
              </p>
              <Link to="/modern/help">
                <button className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-3 font-bold transition-colors duration-200">
                  Visit Help Center
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-neutral-700/50 p-8 shadow-xl text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-4">
              What happened?
            </h3>
            <div className="space-y-3 text-neutral-400 text-sm">
              <p>• The page may have been moved or deleted</p>
              <p>• You may have typed the wrong URL</p>
              <p>• The link you followed may be broken</p>
              <p>• The page might be temporarily unavailable</p>
            </div>
            <div className="mt-6 p-4 bg-neutral-700/30 rounded-xl border border-neutral-600/30">
              <p className="text-neutral-300 text-sm">
                <strong>Pro tip:</strong> Use the navigation menu above or try searching for what you're looking for. 
                Most content can be found through our main navigation sections.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link to="/modern" className="text-neutral-400 hover:text-white transition-colors duration-200 underline">
              Home
            </Link>
            <Link to="/modern/dares" className="text-neutral-400 hover:text-white transition-colors duration-200 underline">
              Browse Dares
            </Link>
            <Link to="/modern/activity-feed" className="text-neutral-400 hover:text-white transition-colors duration-200 underline">
              Activity Feed
            </Link>
            <Link to="/modern/profile" className="text-neutral-400 hover:text-white transition-colors duration-200 underline">
              Profile
            </Link>
            <Link to="/modern/help" className="text-neutral-400 hover:text-white transition-colors duration-200 underline">
              Help & Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernNotFound;
