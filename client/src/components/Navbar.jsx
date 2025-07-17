import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { useEffect, useState } from 'react';
import { HomeIcon, PlusCircleIcon, PlayCircleIcon, GlobeAltIcon, Squares2X2Icon, ChartBarIcon, TrophyIcon, UserCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('impersonatorToken');
    navigate('/login');
  };

  // Impersonation banner logic
  const isImpersonating = Boolean(localStorage.getItem('impersonatorToken'));
  const [impersonationError, setImpersonationError] = useState(null);
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

  return (
    <nav className="bg-[#060606] border-b border-[#282828] min-h-[50px] mb-6">
      <div className="container mx-auto flex flex-wrap items-center justify-between px-4 py-2 min-h-[50px]">
        <div className="flex items-center space-x-4">
          <Link className="text-xl font-bold tracking-tight text-white" to="/">DDV5</Link>
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
        {user && (
          <>
            <li><Link className="flex items-center gap-1 text-[#888] hover:text-white transition-colors px-2 py-1" to="/dare/create"><PlusCircleIcon className="w-5 h-5" />Create Dare</Link></li>
            <li><Link className="flex items-center gap-1 text-[#888] hover:text-white transition-colors px-2 py-1" to="/dare/perform"><PlayCircleIcon className="w-5 h-5" />Perform Dare</Link></li>
            <li><Link className="flex items-center gap-1 text-[#888] hover:text-white transition-colors px-2 py-1" to="/public-dares"><GlobeAltIcon className="w-5 h-5" />Public Dares</Link></li>
            <li><Link className="flex items-center gap-1 text-[#888] hover:text-white transition-colors px-2 py-1" to="/switches"><Squares2X2Icon className="w-5 h-5" />Switch Games</Link></li>
            <li><Link className="flex items-center gap-1 text-[#888] hover:text-white transition-colors px-2 py-1" to="/user-activity"><ChartBarIcon className="w-5 h-5" />Activity</Link></li>
            <li><Link className="flex items-center gap-1 text-[#888] hover:text-white transition-colors px-2 py-1" to="/leaderboard"><TrophyIcon className="w-5 h-5" />Leaderboard</Link></li>
            <li className="nav-item performer-dashboard-link">
              <a href="/performer-dashboard" className="flex items-center gap-1 nav-link px-4 py-2 hover:bg-blue-900/20 rounded transition text-blue-400 font-bold underline"><UserCircleIcon className="w-5 h-5" />Performer Dashboard</a>
            </li>

          </>
        )}
          {user && user.roles?.includes('admin') && (
            <li><Link className="flex items-center gap-1 px-2 py-1 text-danger font-bold underline border-b-2 border-danger" to="/admin"><ShieldCheckIcon className="w-5 h-5" />Admin</Link></li>
          )}
        </ul>
        <div className="flex items-center space-x-4 ml-4 mt-2 sm:mt-0">
          {user ? (
            <>
              <NotificationDropdown />
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigate('/profile')}
                  className="focus:outline-none"
                  aria-label="Go to profile"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover border-2 border-[#282828]" />
                  ) : (
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-neutral-800 text-neutral-300 border-2 border-[#282828]">
                      <i className="fas fa-user text-lg" />
                    </span>
                  )}
                </button>
                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1 text-xs font-semibold ml-2">Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link className="text-[#888] hover:text-white transition-colors px-2 py-1" to="/login">Login</Link>
              <Link className="text-[#888] hover:text-white transition-colors px-2 py-1" to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#181818] border-t border-[#282828] px-4 py-2">
          <ul className="sm:hidden flex flex-col gap-2 mt-4">
            <li><Link className="block text-[#888] hover:text-white transition-colors px-2 py-1" to="/dare/create" onClick={() => setMobileMenuOpen(false)}><PlusCircleIcon className="w-5 h-5" />Create Dare</Link></li>
            <li><Link className="block text-[#888] hover:text-white transition-colors px-2 py-1" to="/dare/perform" onClick={() => setMobileMenuOpen(false)}><PlayCircleIcon className="w-5 h-5" />Perform Dare</Link></li>
            <li><Link className="block text-[#888] hover:text-white transition-colors px-2 py-1" to="/public-dares" onClick={() => setMobileMenuOpen(false)}><GlobeAltIcon className="w-5 h-5" />Public Dares</Link></li>
            <li><Link className="block text-[#888] hover:text-white transition-colors px-2 py-1" to="/switches" onClick={() => setMobileMenuOpen(false)}><Squares2X2Icon className="w-5 h-5" />Switch Games</Link></li>
            <li><Link className="block text-[#888] hover:text-white transition-colors px-2 py-1" to="/user-activity" onClick={() => setMobileMenuOpen(false)}><ChartBarIcon className="w-5 h-5" />Activity</Link></li>
            <li><Link className="block text-[#888] hover:text-white transition-colors px-2 py-1" to="/leaderboard" onClick={() => setMobileMenuOpen(false)}><TrophyIcon className="w-5 h-5" />Leaderboard</Link></li>
            <li><Link className="block text-[#888] hover:text-white transition-colors px-2 py-1" to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</Link></li>
            {user && user.roles?.includes('admin') && (
              <li><Link className="block text-[#888] hover:text-white transition-colors px-2 py-1" to="/admin" onClick={() => setMobileMenuOpen(false)}><ShieldCheckIcon className="w-5 h-5" />Admin</Link></li>
            )}
            {user ? (
              <li className="text-[#aaa] text-sm">{user.username}</li>
            ) : null}
            {user ? (
              <li><button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} className="px-3 py-1 rounded bg-[#222] text-[#eee] hover:bg-[#333] text-sm w-full text-left">Logout</button></li>
            ) : null}
          </ul>
        </div>
      )}
    </nav>
  );
} 