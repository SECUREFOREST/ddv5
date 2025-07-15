import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { useEffect, useState } from 'react';

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
          <li><Link className="text-[#888] hover:text-white transition-colors px-2 py-1" to="/dares">Dares</Link></li>
          <li><Link className="text-[#888] hover:text-white transition-colors px-2 py-1" to="/dare/create">Create Dare</Link></li>
          <li><Link className="text-[#888] hover:text-white transition-colors px-2 py-1" to="/switches">Switch Games</Link></li>
          <li><Link className="text-[#888] hover:text-white transition-colors px-2 py-1" to="/game-history">Game History</Link></li>
          <li><Link className="text-[#888] hover:text-white transition-colors px-2 py-1" to="/dare/perform">Perform Dare</Link></li>
          <li><Link className="text-[#888] hover:text-white transition-colors px-2 py-1" to="/leaderboard">Leaderboard</Link></li>
          {user && (
            <li><Link className="text-[#888] hover:text-white transition-colors px-2 py-1" to="/performer-dashboard">Performer Dashboard</Link></li>
          )}
          {user && user.roles?.includes('admin') && (
            <li><Link className="text-[#888] hover:text-white transition-colors px-2 py-1" to="/admin">Admin</Link></li>
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
          <ul className="flex flex-col space-y-1">
            <li><Link className="text-[#888] hover:text-white transition-colors" to="/dares" onClick={() => setMobileMenuOpen(false)}>Dares</Link></li>
            <li><Link className="text-[#888] hover:text-white transition-colors" to="/dare/create" onClick={() => setMobileMenuOpen(false)}>Create Dare</Link></li>
            <li><Link className="text-[#888] hover:text-white transition-colors" to="/switches" onClick={() => setMobileMenuOpen(false)}>Switch Games</Link></li>
            <li><Link className="text-[#888] hover:text-white transition-colors" to="/game-history" onClick={() => setMobileMenuOpen(false)}>Game History</Link></li>
            <li><Link className="text-[#888] hover:text-white transition-colors" to="/dare/perform" onClick={() => setMobileMenuOpen(false)}>Perform Dare</Link></li>
            <li><Link className="text-[#888] hover:text-white transition-colors" to="/leaderboard" onClick={() => setMobileMenuOpen(false)}>Leaderboard</Link></li>
            <li><Link className="text-[#888] hover:text-white transition-colors" to="/profile" onClick={() => setMobileMenuOpen(false)}>Profile</Link></li>
            {user && user.roles?.includes('admin') && (
              <li><Link className="text-[#888] hover:text-white transition-colors" to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin</Link></li>
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