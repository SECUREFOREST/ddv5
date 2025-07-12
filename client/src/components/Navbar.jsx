import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
        <ul className="flex flex-wrap items-center space-x-6 sm:space-x-8 md:space-x-10 lg:space-x-12">
          <li><Link className="text-[#888] hover:text-white transition-colors px-2 py-1" to="/dares">Dares</Link></li>
          <li><Link className="text-[#888] hover:text-white transition-colors px-2 py-1" to="/dare/create">Create Dare</Link></li>
          <li><Link className="text-[#888] hover:text-white transition-colors px-2 py-1" to="/switches">Switch Games</Link></li>
          <li><Link className="text-[#888] hover:text-white transition-colors px-2 py-1" to="/dare/123/perform">Perform Dare</Link></li>
          <li><Link className="text-[#888] hover:text-white transition-colors px-2 py-1" to="/leaderboard">Leaderboard</Link></li>
          <li><Link className="text-[#888] hover:text-white transition-colors px-2 py-1" to="/credits">Credits</Link></li>
          <li><Link className="text-[#888] hover:text-white transition-colors px-2 py-1" to="/profile">Profile</Link></li>
          <li><Link className="text-[#888] hover:text-white transition-colors px-2 py-1" to="/admin">Admin</Link></li>
        </ul>
        <div className="flex items-center space-x-4 ml-4 mt-2 sm:mt-0">
          {user ? (
            <>
              <NotificationDropdown />
              <div className="flex items-center space-x-2">
                {user.avatar ? (
                  <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <span className="font-semibold text-white">{user.username}</span>
                )}
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
    </nav>
  );
} 