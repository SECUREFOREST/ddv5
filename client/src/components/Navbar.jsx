import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import Avatar from './Avatar';
import { useState } from 'react';
import { XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline';

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

  // Helper for link classes
  const currentPath = window.location.pathname;
  function linkClass(link) {
    return (
      'text-neutral-300 hover:text-white transition-all duration-200 px-4 py-3 rounded-lg font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ' +
      (currentPath === link.to ? 'bg-primary/20 text-primary border border-primary/30' : 'hover:bg-neutral-800/50')
    );
  }

  return (
    <nav className="bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-800 sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <Link className="text-xl font-bold tracking-tight text-white hover:text-primary transition-colors" to="/">
            Deviant Dare
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center space-x-1">
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
                className="focus:outline-none focus:ring-2 focus:ring-primary rounded-full"
                aria-label="Go to profile"
              >
                <Avatar user={user} size={40} border shadow />
              </button>
              <button 
                onClick={handleLogout} 
                className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105 shadow-lg"
              >
                Logout
              </button>
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

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-3 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

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

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Mobile menu drawer */}
          <div className="fixed inset-y-0 right-0 w-80 bg-neutral-900 border-l border-neutral-800 z-50 lg:hidden transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-neutral-800">
                <h2 className="text-lg font-semibold text-white">Menu</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-lg text-neutral-300 hover:text-white hover:bg-neutral-800/50 transition-all duration-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Groups */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {navGroups.map(group => (
                  <div key={group.title}>
                    <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                      {group.title}
                    </h3>
                    <div className="space-y-1">
                      {group.links.map(link => {
              if (link.admin && !(user && user.roles?.includes('admin'))) return null;
              if (link.auth && !user) return null;
              return (
                          <Link
                            key={link.to}
                            to={link.to}
                            className={`block px-4 py-4 rounded-lg transition-all duration-200 min-h-[44px] flex items-center ${
                              currentPath === link.to 
                                ? 'bg-primary/20 text-primary border border-primary/30' 
                                : 'text-neutral-300 hover:text-white hover:bg-neutral-800/50'
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                            aria-label={`Navigate to ${link.label}`}
                          >
                            {link.label}
                          </Link>
              );
            })}
                    </div>
                  </div>
                ))}
              </div>

              {/* User section */}
              <div className="p-4 border-t border-neutral-800">
            {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-neutral-800/50 rounded-lg">
                      <Avatar user={user} size={40} border shadow />
                      <div>
                        <div className="text-white font-medium">{user.fullName || user.username}</div>
                        <div className="text-neutral-400 text-sm">{user.email}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setMobileMenuOpen(false); handleLogout(); }} 
                      className="w-full bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-4 font-medium transition-all duration-200 min-h-[44px] flex items-center justify-center"
                      aria-label="Logout from account"
                    >
                      Logout
                    </button>
                  </div>
            ) : (
                  <div className="space-y-3">
                    <Link 
                      to="/login" 
                      className="block w-full text-center bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg px-4 py-4 font-medium transition-all duration-200 min-h-[44px] flex items-center justify-center"
                      onClick={() => setMobileMenuOpen(false)}
                      aria-label="Navigate to login page"
                    >
                      Login
                    </Link>
                    <Link 
                      to="/register" 
                      className="block w-full text-center bg-primary hover:bg-primary-dark text-white rounded-lg px-4 py-4 font-medium transition-all duration-200 min-h-[44px] flex items-center justify-center"
                      onClick={() => setMobileMenuOpen(false)}
                      aria-label="Navigate to registration page"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
        </div>
        </>
      )}
    </nav>
  );
} 