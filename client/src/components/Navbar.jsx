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
    <nav className="bg-primary text-white shadow mb-6">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <Link className="text-2xl font-bold tracking-tight" to="/">DDV5</Link>
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
        <ul className="flex space-x-4 items-center">
          <li><Link className="hover:underline" to="/acts">Acts</Link></li>
          <li><Link className="hover:underline" to="/switches">Switch Games</Link></li>
          <li><Link className="hover:underline" to="/leaderboard">Leaderboard</Link></li>
          <li><Link className="hover:underline" to="/credits">Credits</Link></li>
          <li><Link className="hover:underline" to="/profile">Profile</Link></li>
          <li><Link className="hover:underline" to="/admin">Admin</Link></li>
        </ul>
        <ul className="flex space-x-4 items-center">
          {user ? (
            <>
              <li><NotificationDropdown /></li>
              <li className="flex items-center space-x-2">
                {user.avatar ? (
                  <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <span className="font-semibold">{user.username}</span>
                )}
                <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white rounded px-2 py-1 text-xs font-semibold ml-2">Logout</button>
              </li>
            </>
          ) : (
            <>
              <li><Link className="hover:underline" to="/login">Login</Link></li>
              <li><Link className="hover:underline" to="/register">Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
} 