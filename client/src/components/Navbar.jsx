import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import Avatar from './Avatar';
import { useState } from 'react';
import { 
  FireIcon, 
  SparklesIcon, 
  EyeDropperIcon, 
  ExclamationTriangleIcon, 
  RocketLaunchIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  HomeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  HeartIcon,
  BellIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  PlayIcon,
  UserGroupIcon,
  NewspaperIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/solid';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [impersonationError, setImpersonationError] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Impersonation banner logic
  const isImpersonating = Boolean(localStorage.getItem('impersonatorToken'));
  const handleReturnToAdmin = () => {
    const adminToken = localStorage.getItem('impersonatorToken');
    if (adminToken) {
      localStorage.setItem('token', adminToken);
      localStorage.removeItem('impersonatorToken');
      window.location.reload();
    } else {
      setImpersonationError('Admin token missing. Please log in again.');
      logout();
      navigate('/login');
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('impersonatorToken');
    navigate('/login');
  };

  // Enhanced navigation groups with icons
  const navGroups = [
    {
      title: 'Main',
      links: [
        { to: '/dom-demand/create', label: 'Dom Demand', auth: true, icon: <PlusIcon className="w-5 h-5" /> },
        { to: '/dare/select', label: 'Perform Dare', auth: true, icon: <PlayIcon className="w-5 h-5" /> },
      ]
    },
    {
      title: 'Community',
      links: [
        { to: '/switches', label: 'Switch Games', auth: true, icon: <UserGroupIcon className="w-5 h-5" /> },
        { to: '/leaderboard', label: 'Leaderboard', auth: true, icon: <ChartBarIcon className="w-5 h-5" /> },
        { to: '/user-activity', label: 'Activity', auth: true, icon: <SparklesIcon className="w-5 h-5" /> },
        { to: '/news', label: 'News', auth: false, icon: <NewspaperIcon className="w-5 h-5" /> },
      ]
    },
    {
      title: 'Special',
      links: [
        { to: '/performer-dashboard', label: 'Performer Dashboard', auth: true, icon: <FireIcon className="w-5 h-5" /> },
        { to: '/admin', label: 'Admin', admin: true, icon: <ShieldCheckIcon className="w-5 h-5" /> },
      ]
    }
  ];

  // Helper for link classes
  const currentPath = window.location.pathname;
  function linkClass(link) {
    return (
      'flex items-center space-x-2 px-4 py-2 text-white hover:text-primary transition-colors duration-200 rounded-lg hover:bg-neutral-700/50 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ' +
      (currentPath === link.to ? 'bg-primary/20 text-primary border border-primary/30' : '')
    );
  }

  // Get role-based styling
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
      dominant: <FireIcon className="w-5 h-5" />,
      submissive: <HeartIcon className="w-5 h-5" />,
      switch: <SparklesIcon className="w-5 h-5" />
    };
    return icons[role] || <UserIcon className="w-5 h-5" />;
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block bg-neutral-800/80 backdrop-blur-md border-b border-neutral-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-lg flex items-center justify-center">
                  <FireIcon className="w-6 h-6 text-white" />
                </div>
                <Link className="text-xl font-bold text-white hover:text-primary transition-colors" to="/">
                  Deviant Dare
                </Link>
              </div>

              {/* Main Navigation */}
              <div className="flex items-center space-x-1">
                {navGroups.map(group => (
                  <div key={group.title} className="flex items-center space-x-1">
                    {group.links.map(link => {
                      if (link.admin && !(user && user.roles?.includes('admin'))) return null;
                      if (link.auth && !user) return null;
                      return (
                        <Link 
                          key={link.to} 
                          to={link.to} 
                          className={linkClass(link)}
                        >
                          {link.icon}
                          <span>{link.label}</span>
                        </Link>
                      );
                    })}
                    {group.title !== 'Special' && <div className="w-px h-6 bg-neutral-700 mx-2" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - User Menu */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  {/* Notifications */}
                  <NotificationDropdown />
                  
                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      className="flex items-center space-x-3 p-2 text-white hover:text-primary transition-colors duration-200 rounded-lg hover:bg-neutral-700/50"
                    >
                      <div className="w-8 h-8 bg-neutral-600 rounded-full flex items-center justify-center">
                        <Avatar user={user} size={32} border shadow />
                      </div>
                      <span className="hidden xl:block">{user.fullName || user.username}</span>
                      {user.role && (
                        <span className={`hidden xl:inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getRoleColor(user.role)} text-white`}>
                          {getRoleIcon(user.role)}
                          <span className="capitalize">{user.role}</span>
                        </span>
                      )}
                    </button>

                    {/* Profile Dropdown Menu */}
                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-neutral-800 rounded-xl border border-neutral-700/50 shadow-xl z-50">
                        <div className="p-4 border-b border-neutral-700/50">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-neutral-600 rounded-full flex items-center justify-center">
                              <Avatar user={user} size={48} border shadow />
                            </div>
                            <div>
                              <p className="text-white font-medium">{user.fullName || user.username}</p>
                              <p className="text-neutral-400 text-sm">@{user.username}</p>
                            </div>
                          </div>
                        </div>
                        <div className="p-2">
                          <button
                            onClick={() => navigate('/profile')}
                            className="flex items-center space-x-3 px-3 py-2 text-white hover:bg-neutral-700/50 rounded-lg transition-colors duration-200 w-full"
                          >
                            <UserIcon className="w-5 h-5" />
                            <span>Profile</span>
                          </button>
                          <button
                            onClick={() => navigate('/settings')}
                            className="flex items-center space-x-3 px-3 py-2 text-white hover:bg-neutral-700/50 rounded-lg transition-colors duration-200 w-full"
                          >
                            <CogIcon className="w-5 h-5" />
                            <span>Settings</span>
                          </button>
                          <hr className="border-neutral-700/50 my-2" />
                          <button 
                            onClick={handleLogout}
                            className="flex items-center space-x-3 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200 w-full"
                          >
                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link className="text-neutral-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-neutral-800/50" to="/login">
                    Login
                  </Link>
                  <Link className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105" to="/register">
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="lg:hidden bg-neutral-800/80 backdrop-blur-md border-b border-neutral-700/50 sticky top-0 z-50">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary-dark rounded-lg flex items-center justify-center">
                <FireIcon className="w-5 h-5 text-white" />
              </div>
              <Link className="text-lg font-bold text-white" to="/">
                Deviant Dare
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-white hover:text-primary transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-neutral-800 border-t border-neutral-700/50">
            <div className="px-4 py-2 space-y-1">
              {navGroups.map(group => (
                <div key={group.title}>
                  <div className="px-3 py-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    {group.title}
                  </div>
                  {group.links.map(link => {
                    if (link.admin && !(user && user.roles?.includes('admin'))) return null;
                    if (link.auth && !user) return null;
                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        className="flex items-center space-x-3 px-3 py-2 text-white hover:bg-neutral-700/50 rounded-lg transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.icon}
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
              {user && (
                <>
                  <hr className="border-neutral-700/50 my-2" />
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 px-3 py-2 text-white hover:bg-neutral-700/50 rounded-lg transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <UserIcon className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center space-x-3 px-3 py-2 text-white hover:bg-neutral-700/50 rounded-lg transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <CogIcon className="w-5 h-5" />
                    <span>Settings</span>
                  </Link>
                  <hr className="border-neutral-700/50 my-2" />
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200 w-full"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Impersonation banner */}
      {isImpersonating && (
        <div className="bg-yellow-500/20 border-b border-yellow-500/30 px-4 py-3">
          <div className="container mx-auto flex items-center justify-between">
            <span className="text-yellow-200 text-sm font-medium">You are impersonating another user.</span>
            <button
              className="bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg px-3 py-1 text-sm font-medium transition-all duration-200"
              onClick={handleReturnToAdmin}
            >
              Return to Admin
            </button>
            {impersonationError && (
              <div className="bg-red-500 text-white rounded-lg px-3 py-1 text-sm">{impersonationError}</div>
            )}
          </div>
        </div>
      )}

      {/* Click outside handlers */}
      {isProfileDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileDropdownOpen(false)}
        />
      )}
    </>
  );
} 