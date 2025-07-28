import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import Avatar from './Avatar';
import { useState } from 'react';

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

  // Navigation links
  const navLinks = [
    { to: '/dares', label: 'Dares', auth: true },
    { to: '/dare/create', label: 'Create Dare', auth: true },
    { to: '/switches', label: 'Switch Games', auth: true },
    { to: '/dare/select', label: 'Perform Dare', auth: true },
    { to: '/leaderboard', label: 'Leaderboard', auth: true },
    { to: '/game-history', label: 'Game History', auth: true },
    { to: '/user-activity', label: 'Activity', auth: true },
    { to: '/performer-dashboard', label: 'Performer Dashboard', auth: true },
    { to: '/admin', label: 'Admin', admin: true },
  ];

  // Helper for link classes
  const currentPath = window.location.pathname;
  function linkClass(link) {
    return (
      'text-[#888] hover:text-white transition-colors px-2 py-1 rounded font-semibold focus-visible:outline-none ' +
      (currentPath === link.to ? 'bg-neutral-800 text-white' : '')
    );
  }

  return (
    <nav className="bg-[#060606] border-b border-[#282828] min-h-[50px] mb-6">
      <div className="container mx-auto flex flex-wrap items-center justify-between px-4 py-2 min-h-[50px]">
        <div className="flex items-center space-x-4">
          <Link className="text-xl font-bold tracking-tight text-white" to="/">Deviant Dare</Link>
        </div>
        {/* Hamburger menu button for mobile */}
        <div className="flex items-center sm:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-300 hover:text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        {/* Desktop links */}
        <ul className="hidden sm:flex flex-wrap items-center space-x-3">
          {navLinks.map(link => {
            if (link.admin && !(user && user.roles?.includes('admin'))) return null;
            if (link.auth && !user) return null;
            return (
              <li key={link.to}>
                <Link to={link.to} className={linkClass(link)}>{link.label}</Link>
              </li>
            );
          })}
        </ul>
        {/* User section (desktop) */}
        <div className="hidden sm:flex items-center space-x-4 ml-4 mt-2 sm:mt-0">
          {user ? (
            <>
              <NotificationDropdown />
              <button
                onClick={() => navigate('/profile')}
                className="focus:outline-none"
                aria-label="Go to profile"
              >
                <Avatar user={user} size={32} border shadow />
              </button>
              <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1 text-xs font-semibold ml-2 shadow-lg">Logout</button>
            </>
          ) : (
            <>
              <Link className="text-[#888] hover:text-white transition-colors px-2 py-1" to="/login">Login</Link>
              <Link className="text-[#888] hover:text-white transition-colors px-2 py-1" to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
      {/* Impersonation banner */}
      {isImpersonating && (
        <div className="bg-yellow-400 text-black px-4 py-2 rounded flex items-center space-x-2 ml-4">
          <span>You are impersonating another user.</span>
          <button
            className="bg-white text-black rounded px-2 py-1 text-xs font-semibold hover:bg-gray-100"
            onClick={handleReturnToAdmin}
          >
            Return to Admin
          </button>
          {impersonationError && (
            <div className="bg-red-500 text-white rounded px-2 py-1 text-xs ml-2">{impersonationError}</div>
          )}
        </div>
      )}
      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#181818] border-t border-[#282828] px-4 py-2">
          <ul className="flex flex-col space-y-1">
            {navLinks.map(link => {
              if (link.admin && !(user && user.roles?.includes('admin'))) return null;
              if (link.auth && !user) return null;
              return (
                <li key={link.to}>
                  <Link className="text-[#888] hover:text-white transition-colors" to={link.to} onClick={() => setMobileMenuOpen(false)}>{link.label}</Link>
                </li>
              );
            })}
            {user ? (
              <>
                <li className="text-[#aaa] text-sm">{user.username}</li>
                <li><button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} className="px-3 py-1 rounded bg-[#222] text-[#eee] hover:bg-[#333] text-sm w-full text-left">Logout</button></li>
              </>
            ) : (
              <>
                <li><Link className="text-[#888] hover:text-white transition-colors" to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link></li>
                <li><Link className="text-[#888] hover:text-white transition-colors" to="/register" onClick={() => setMobileMenuOpen(false)}>Register</Link></li>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  );
} 