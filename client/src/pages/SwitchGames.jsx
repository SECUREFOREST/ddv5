import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Squares2X2Icon, PlayIcon } from '@heroicons/react/24/solid';
import { LoadingSpinner } from '../components/LoadingSpinner';
import api from '../api/axios';

export default function SwitchGames() {
  const { user } = useAuth ? useAuth() : { user: null };
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [generalError, setGeneralError] = useState('');
  const [generalInfo, setGeneralInfo] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get('/switches/stats');
        setStats(response.data);
        showSuccess('Switch games loaded successfully!');
      } catch (error) {
        console.error('Failed to load switch games stats:', error);
        showError('Failed to load switch games data.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [showSuccess, showError]);

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
              <p className="text-white/70">Please wait while we load the latest games...</p>
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
            <p className="text-xl text-white/80">Create or participate in switch games</p>
          </div>

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
                <h2 className="text-2xl font-bold text-white mb-4">Participate in a Switch Game</h2>
                <p className="text-white/70 mb-6">Join an existing switch game and challenge others</p>
                <Link to="/switches/participate">
                  <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-6 py-4 font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
                    Join Game
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-12 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4 text-center">How Switch Games Work</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">1</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Create or Join</h4>
                <p className="text-white/70 text-sm">Start a new game or join an existing one</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">2</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Play Rock-Paper-Scissors</h4>
                <p className="text-white/70 text-sm">Both players choose their moves simultaneously</p>
              </div>
              <div>
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">3</span>
                </div>
                <h4 className="font-semibold text-white mb-2">Complete the Dare</h4>
                <p className="text-white/70 text-sm">The loser must complete the winner's dare</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 