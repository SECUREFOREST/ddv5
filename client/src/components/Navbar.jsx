import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import Avatar from './Avatar';
import { useState } from 'react';
import { XMarkIcon, Bars3Icon, HomeIcon, FireIcon, TrophyIcon, UserIcon, UserGroupIcon, BellIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [impersonationError, setImpersonationError] = useState(null);

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

  // Grouped navigation links for better organization
  const navGroups = [
    {
      title: 'Main',
      links: [
    { to: '/dares', label: 'Dares', auth: true },
    { to: '/dare/create', label: 'Create Dare', auth: true },
        { to: '/dare/select', label: 'Perform Dare', auth: true },
      ]
    },
    {
      title: 'Community',
      links: [
    { to: '/switches', label: 'Switch Games', auth: true },
    { to: '/leaderboard', label: 'Leaderboard', auth: true },
    { to: '/user-activity', label: 'Activity', auth: true },
      ]
    },
    {
      title: 'Special',
      links: [
    { to: '/performer-dashboard', label: 'Performer Dashboard', auth: true },
    { to: '/admin', label: 'Admin', admin: true },
      ]
    }
  ];

  // Mobile navigation items
  const mobileNavItems = [
    { to: '/dashboard', label: 'Home', icon: HomeIcon, auth: true },
    { to: '/dares', label: 'Dares', icon: FireIcon, auth: true },
    { to: '/leaderboard', label: 'Leaderboard', icon: TrophyIcon, auth: true },
    { to: '/switches', label: 'Games', icon: UserGroupIcon, auth: true },
    { to: '/profile', label: 'Profile', icon: UserIcon, auth: true },
  ];

  // Helper for link classes
  const currentPath = window.location.pathname;
  function linkClass(link) {
    return (
      'text-neutral-300 hover:text-white transition-all duration-200 px-4 py-3 rounded-lg font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-900 ' +
      (currentPath === link.to ? 'bg-primary/20 text-primary border border-primary/30 shadow-lg' : 'hover:bg-neutral-800/50 hover:shadow-md')
    );
  }

  function mobileNavClass(link) {
    return (
      'flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px] touch-manipulation ' +
      (currentPath === link.to ? 'text-primary bg-primary/10' : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50')
    );
  }

  return (
    <>
      <nav className="bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-800 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link className="text-xl font-bold tracking-tight text-white hover:text-primary transition-colors duration-200 hover:scale-105" to="/">
              Deviant Dare
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navGroups.map(group => (
              <div key={group.title} className="flex items-center space-x-1">
                {group.links.map(link => {
              if (link.admin && !(user && user.roles?.includes('admin'))) return null;
              if (link.auth && !user) return null;
              return (
                    <Link key={link.to} to={link.to} className={linkClass(link)}>
                      {link.label}
                    </Link>
              );
            })}
                {group.title !== 'Special' && <div className="w-px h-6 bg-neutral-700 mx-2" />}
              </div>
            ))}
          </div>

          {/* User section (desktop) */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <>
                <NotificationDropdown />
                <button
                  onClick={() => navigate('/profile')}
                  className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-neutral-900 rounded-full transition-all duration-200 hover:scale-105"
                  aria-label="Go to profile"
                >
                  <Avatar user={user} size={40} border shadow />
                </button>
                <button 
                  onClick={handleLogout} 
                  className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl active:scale-95"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link className="text-neutral-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-neutral-800/50 hover:shadow-md" to="/login">
                  Login
                </Link>
                <Link className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl active:scale-95" to="/register">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-3 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-neutral-900 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile slide-out menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-neutral-900/95 backdrop-blur-sm border-t border-neutral-800">
            <div className="px-4 py-6 space-y-4">
              {navGroups.map(group => (
                <div key={group.title} className="space-y-2">
                  <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider px-3">{group.title}</h3>
                  <div className="space-y-1">
                    {group.links.map(link => {
                  if (link.admin && !(user && user.roles?.includes('admin'))) return null;
                  if (link.auth && !user) return null;
                  return (
                        <Link 
                          key={link.to} 
                          to={link.to} 
                          className="block px-3 py-3 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800/50 transition-all duration-200"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                  );
                })}
                  </div>
                </div>
              ))}
              
              {user && (
                <div className="pt-4 border-t border-neutral-800">
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <Avatar user={user} size={32} border />
                    <span className="text-white font-medium">{user.fullName || user.username}</span>
                  </div>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full mt-3 px-3 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-all duration-200"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Impersonation banner */}
        {isImpersonating && (
          <div className="bg-yellow-500/20 border-b border-yellow-500/30 px-4 py-3">
            <div className="container mx-auto flex items-center justify-between">
              <span className="text-yellow-200 text-sm font-medium">You are impersonating another user.</span>
            <button
                className="bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg px-3 py-1 text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95"
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
      </nav>

      {/* Mobile Bottom Navigation */}
      {user && (
        <div className="fixed bottom-0 inset-x-0 bg-neutral-900/95 backdrop-blur-lg border-t border-neutral-800 lg:hidden z-50">
          <div className="flex justify-around items-center py-2 px-4">
            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={mobileNavClass(item)}
                  aria-label={item.label}
                >
                  <Icon className="h-6 w-6 mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
} 