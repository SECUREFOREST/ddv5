import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Squares2X2Icon, PlayIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api/axios';

export default function SwitchGames() {
  const { user } = useAuth ? useAuth() : { user: null };
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [userSwitchGames, setUserSwitchGames] = useState([]);
  const [generalError, setGeneralError] = useState('');
  const [generalInfo, setGeneralInfo] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchUserSwitchGames = async () => {
    try {
      setLoading(true);
      setGeneralError('');
      setGeneralInfo('');
      
      console.log('Fetching user switch games...');
      
      // Get user's switch games
      const response = await api.get('/switches/performer');
      
      console.log('API response:', response);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Is array:', Array.isArray(response.data));
      
      if (response && response.data) {
        const switchGamesData = Array.isArray(response.data) ? response.data : [];
        console.log('Processed switch games data:', switchGamesData);
        setUserSwitchGames(switchGamesData);
        console.log('User switch games loaded:', switchGamesData.length);
        
        if (switchGamesData.length > 0) {
          setGeneralInfo(`Found ${switchGamesData.length} switch game(s)!`);
        } else {
          setGeneralInfo('No switch games found. Create your first one!');
        }
      } else {
        console.log('No data in response, setting empty array');
        setUserSwitchGames([]);
        setGeneralInfo('No switch games found. Create your first one!');
      }
    } catch (error) {
      console.error('Failed to load user switch games:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load switch games data.';
      setGeneralError(errorMessage);
      setUserSwitchGames([]);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('SwitchGames component mounted, fetching data...');
    fetchUserSwitchGames();
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('Loading timeout reached, forcing loading to false');
        setLoading(false);
        setGeneralError('Request timed out. Please try again.');
      }
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timeout);
  }, []); // Only run once on mount

  // Calculate basic stats from user's switch games
  const stats = {
    total: userSwitchGames.length,
    active: userSwitchGames.filter(game => game.status === 'in_progress').length,
    completed: userSwitchGames.filter(game => game.status === 'completed').length,
    waiting: userSwitchGames.filter(game => game.status === 'waiting_for_participant').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-16">
              <div className="flex items-center justify-center mb-8">
                <LoadingSpinner variant="spinner" size="lg" color="white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Loading Switch Games</h2>
              <p className="text-white/70">Please wait while we load your games...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-2 left-2 bg-purple-600 text-white px-4 py-2 rounded z-50">Skip to main content</a>
      <main id="main-content" tabIndex="-1" role="main">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <PlayIcon className="w-12 h-12 text-white mr-4" />
              <h1 className="text-4xl md:text-5xl font-bold text-white">Switch Games</h1>
            </div>
            <p className="text-xl text-white/80 mb-4">Create or participate in switch games</p>
            <button
              onClick={fetchUserSwitchGames}
              disabled={loading}
              className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {/* Stats Display */}
          {stats.total > 0 && (
            <div className="mb-8">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4 text-center">Your Switch Games</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{stats.total}</div>
                    <div className="text-white/70 text-sm">Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{stats.active}</div>
                    <div className="text-white/70 text-sm">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{stats.completed}</div>
                    <div className="text-white/70 text-sm">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{stats.waiting}</div>
                    <div className="text-white/70 text-sm">Waiting</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {generalError && (
            <div className="mb-8 bg-red-500/20 border border-red-500/50 rounded-xl p-4">
              <p className="text-red-300">{generalError}</p>
            </div>
          )}

          {/* Info Display */}
          {generalInfo && (
            <div className="mb-8 bg-blue-500/20 border border-blue-500/50 rounded-xl p-4">
              <p className="text-blue-300">{generalInfo}</p>
            </div>
          )}

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Create Game Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Squares2X2Icon className="w-8 h-8 text-purple-300" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Create a Switch Game</h2>
                <p className="text-white/70 mb-6">Start a new switch game and invite others to participate</p>
                <Link to="/switches/create">
                  <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl px-6 py-4 font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
                    Create Game
                  </button>
                </Link>
              </div>
            </div>

            {/* Participate Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlayIcon className="w-8 h-8 text-blue-300" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">Join a Switch Game</h2>
                <p className="text-white/70 mb-6">Find and join available switch games</p>
                <Link to="/switches/join">
                  <button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl px-6 py-4 font-bold text-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
                    Join Game
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* User's Switch Games List */}
          {userSwitchGames.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Your Switch Games</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userSwitchGames.slice(0, 6).map((game) => (
                  <div key={game._id} className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        game.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                        game.status === 'in_progress' ? 'bg-blue-500/20 text-blue-300' :
                        game.status === 'waiting_for_participant' ? 'bg-yellow-500/20 text-yellow-300' :
                        'bg-gray-500/20 text-gray-300'
                      }`}>
                        {game.status.replace('_', ' ')}
                      </span>
                    </div>
                    <h4 className="text-white font-semibold mb-2 truncate">
                      {game.creatorDare?.description || 'Switch Game'}
                    </h4>
                    <p className="text-white/70 text-sm mb-4">
                      Created by {game.creator?.username || 'Unknown'}
                    </p>
                    <Link to={`/switches/${game._id}`}>
                      <button className="w-full bg-white/20 text-white rounded-lg px-4 py-2 hover:bg-white/30 transition-colors">
                        View Details
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
              {userSwitchGames.length > 6 && (
                <div className="text-center mt-6">
                  <Link to="/switches">
                    <button className="bg-white/20 text-white rounded-xl px-6 py-3 hover:bg-white/30 transition-colors">
                      View All Games ({userSwitchGames.length})
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 