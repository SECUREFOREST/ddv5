import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import Avatar from './Avatar';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
    { to: '/dom-demand/create', label: 'Dom Demand', auth: true },
        { to: '/dare/select', label: 'Perform Dare', auth: true },
      ]
    },
    {
      title: 'Community',
      links: [
    { to: '/switches', label: 'Switch Games', auth: true },
    { to: '/leaderboard', label: 'Leaderboard', auth: true },
    { to: '/user-activity', label: 'Activity', auth: true },
    { to: '/news', label: 'News', auth: false },
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
                  <Link 
                    key={link.to} 
                    to={link.to} 
                    className={linkClass(link)}
                  >
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

        {/* Mobile menu button - hidden since we use bottom navigation */}
        <div className="lg:hidden w-12" />
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

      {/* Mobile menu overlay - removed since we use bottom navigation */}
    </nav>
  );
} 