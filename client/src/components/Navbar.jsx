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