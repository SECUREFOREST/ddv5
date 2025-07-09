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
    <nav className="navbar navbar-default">
      <div className="container-fluid">
        <div className="navbar-header">
          <Link className="navbar-brand" to="/">DDV5</Link>
        </div>
        {isImpersonating && (
          <div className="important-message bg-warning text-center" style={{marginBottom: 0}}>
            <span>You are impersonating another user.</span>
            <button
              className="btn btn-default btn-xs"
              onClick={handleReturnToAdmin}
              style={{marginLeft: 8}}
            >
              Return to Admin
            </button>
            {impersonationError && (
              <div className="label label-danger" style={{marginLeft: 8}}>{impersonationError}</div>
            )}
          </div>
        )}
        <ul className="nav navbar-nav">
          <li><Link to="/acts">Acts</Link></li>
          <li><Link to="/switches">Switch Games</Link></li>
          <li><Link to="/leaderboard">Leaderboard</Link></li>
          <li><Link to="/credits">Credits</Link></li>
          <li><Link to="/profile">Profile</Link></li>
          <li><Link to="/admin">Admin</Link></li>
        </ul>
        <ul className="nav navbar-nav navbar-right">
        {user ? (
          <>
              <li><NotificationDropdown /></li>
              <li className="avatar-and-user-info">
              {user.avatar ? (
                  <img src={user.avatar} alt="avatar" className="avatar img-circle" style={{width: 32, height: 32, marginRight: 8}} />
              ) : (
                  <span className="details name" style={{marginRight: 8}}>{user.username}</span>
              )}
                <button onClick={handleLogout} className="btn btn-danger btn-xs" style={{marginLeft: 8}}>Logout</button>
              </li>
          </>
        ) : (
          <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
          </>
        )}
        </ul>
      </div>
    </nav>
  );
} 