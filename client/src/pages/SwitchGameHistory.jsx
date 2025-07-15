import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const statusLabels = {
  completed: 'Completed',
  forfeited: 'Forfeited',
  expired: 'Expired',
};

export default function SwitchGameHistory() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    axios.get('/switches/history')
      .then(res => {
        setGames(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load game history.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-6 text-center">Loading your switch game history...</div>;
  if (error) return <div className="p-6 text-red-500 text-center">{error}</div>;
  if (!games.length) return <div className="p-6 text-center">No past switch games found.</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Switch Game History</h1>
      <div className="space-y-4">
        {games.map(game => {
          const isWinner = user && game.winner && (game.winner._id === user._id || game.winner._id === user.id);
          return (
            <div key={game._id} className="bg-white rounded shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold text-lg">{game.creatorDare?.description || 'No description'}</div>
                <div className="text-sm text-gray-500 mb-1">
                  Status: <span className="font-medium">{statusLabels[game.status] || game.status}</span>
                </div>
                <div className="text-sm text-gray-500 mb-1">
                  Creator: {game.creator?.username || 'Unknown'}
                  {game.participant && (
                    <> | Participant: {game.participant?.username || 'Unknown'}</>
                  )}
                </div>
                <div className="text-xs text-gray-400 mb-1">
                  Winner: {game.winner ? (game.winner.username || 'Unknown') : 'N/A'}
                  {isWinner && <span className="ml-2 text-green-600 font-semibold">(You won)</span>}
                </div>
                <div className="text-xs text-gray-400">
                  Last updated: {game.updatedAt ? new Date(game.updatedAt).toLocaleString() : 'N/A'}
                </div>
              </div>
              <div className="mt-2 md:mt-0 md:ml-4 flex items-center space-x-2">
                <Link to={`/switches/${game._id}`} className="btn btn-primary btn-sm">View Details</Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 