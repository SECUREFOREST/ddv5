import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { useEffect, useState } from 'react';
import { HomeIcon, PlusCircleIcon, PlayCircleIcon, GlobeAltIcon, Squares2X2Icon, ChartBarIcon, TrophyIcon, UserCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Define navigation links
  const links = [
    { to: '/', label: 'Home' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/dares', label: 'Dares' },
    { to: '/switches', label: 'Switch Games' },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/profile', label: 'Profile' },
  ];

  // Helper for link classes
  const currentPath = window.location.pathname;
  function linkClass(link) {
    return (
      'px-3 py-2 rounded font-semibold transition-colors ' +
      (currentPath === link.to
        ? 'bg-primary text-primary-contrast'
        : 'text-neutral-200 hover:bg-neutral-800 hover:text-primary')
    );
  }

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
    <nav role="navigation" aria-label="Main navigation" className="bg-neutral-900 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <a href="/" className="text-xl font-bold text-primary">AppName</a>
      </div>
      <ul className="flex gap-4">
        {links.map(link => (
          <li key={link.to}>
            <a
              href={link.to}
              className={linkClass(link)}
              aria-current={currentPath === link.to ? 'page' : undefined}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
} 