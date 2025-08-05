import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { retryApiCall } from '../utils/retry';
import api from '../api/axios';

export function useContentDeletion() {
  const { user } = useAuth();
  const { showError } = useToast();
  const [contentDeletion, setContentDeletion] = useState('delete_after_30_days'); // Default fallback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Map frontend values to backend values
  const mapPrivacyValue = (val) => {
    if (val === 'when_viewed') return 'delete_after_view';
    if (val === '30_days') return 'delete_after_30_days';
    if (val === 'never') return 'never_delete';
    return val;
  };

  // Load user's content deletion setting
  const loadContentDeletion = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError('');
      const response = await retryApiCall(() => api.get('/safety/content_deletion'));
      const savedValue = response.data?.value;
      
      if (savedValue) {
        setContentDeletion(savedValue);
      } else {
        // If no saved value, use default
        setContentDeletion('delete_after_30_days');
      }
    } catch (err) {
      console.error('Failed to load content deletion setting:', err);
      setError('Failed to load content deletion setting');
      // Use default value on error
      setContentDeletion('delete_after_30_days');
    } finally {
      setLoading(false);
    }
  };

  // Update content deletion setting
  const updateContentDeletion = async (val) => {
    try {
      setLoading(true);
      setError('');
      const backendValue = mapPrivacyValue(val);
      await retryApiCall(() => api.post('/safety/content_deletion', { value: backendValue }));
      setContentDeletion(backendValue);
      return true;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update content deletion setting';
      setError(errorMessage);
      showError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load setting on mount
  useEffect(() => {
    if (user) {
      loadContentDeletion();
    }
  }, [user?.id]); // Only depend on user ID, not the entire user object

  return {
    contentDeletion,
    loading,
    error,
    updateContentDeletion,
    loadContentDeletion
  };
} 