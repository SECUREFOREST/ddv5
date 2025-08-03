import React, { useState } from 'react';
import { NoSymbolIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export default function BlockButton({ userId, username, onBlockChange, className = '' }) {
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleBlock = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      if (isBlocked) {
        await api.post(`/users/${userId}/unblock`);
        showSuccess('User unblocked successfully!');
      } else {
        await api.post(`/users/${userId}/block`);
        showSuccess('User blocked successfully!');
      }
      setIsBlocked(!isBlocked);
      if (onBlockChange) {
        onBlockChange(!isBlocked);
      }
    } catch (error) {
      const message = isBlocked ? 'Failed to unblock user.' : 'Failed to block user.';
      showError(error.response?.data?.error || message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleBlock}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
        isBlocked
          ? 'bg-green-600/20 text-green-300 border border-green-500/50 hover:bg-green-600/30'
          : 'bg-red-600/20 text-red-300 border border-red-500/50 hover:bg-red-600/30'
      } ${className}`}
      title={isBlocked ? `Unblock ${username}` : `Block ${username}`}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      ) : isBlocked ? (
        <>
          <NoSymbolIcon className="w-4 h-4" />
          Unblock
        </>
      ) : (
        <>
          <ExclamationTriangleIcon className="w-4 h-4" />
          Block
        </>
      )}
    </button>
  );
} 