import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const statusLabels = {
  in_progress: 'In Progress',
  completed: 'Completed',
  forfeited: 'Forfeited',
  graded: 'Graded',
  pending: 'Pending',
  waiting_for_participant: 'Waiting',
  open: 'Open',
  proof_submitted: 'Proof Submitted',
  awaiting_proof: 'Awaiting Proof',
  expired: 'Expired',
};

export default function PerformerDashboard() {
  const [dares, setDares] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get('/dares/performer'),
      axios.get('/switches/performer')
    ])
      .then(([daresRes, gamesRes]) => {
        setDares(daresRes.data);
        setGames(gamesRes.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load dashboard data.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-6 text-center">Loading your dashboard...</div>;
  if (error) return <div className="p-6 text-red-500 text-center">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Performer Dashboard</h1>
      {/* Dares Section */}
      <h2 className="text-xl font-semibold mb-2 mt-6">Dares</h2>
      {!dares.length ? (
        <div className="p-4 text-center text-gray-400">You are not performing any dares yet.</div>
      ) : (
        <div className="space-y-4 mb-8">
          {dares.map(dare => (
            <div key={dare._id} className="bg-white rounded shadow p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold text-lg">{dare.description}</div>
                <div className="text-sm text-gray-500 mb-1">
                  Status: <span className="font-medium">{statusLabels[dare.status] || dare.status}</span>
                </div>
                <div className="text-sm text-gray-500 mb-1">
                  Creator: {dare.creator?.username || 'Unknown'}
                </div>
                <div className="text-xs text-gray-400">
                  Claimed: {dare.claimedAt ? new Date(dare.claimedAt).toLocaleString() : 'N/A'}
                  {dare.status === 'completed' && dare.updatedAt && (
                    <>
                      {' | '}Completed: {new Date(dare.updatedAt).toLocaleString()}
                    </>
                  )}
                </div>
              </div>
              <div className="mt-2 md:mt-0 md:ml-4 flex items-center space-x-2">
                <Link to={`/dare/${dare._id}/perform`} className="btn btn-primary btn-sm">View</Link>
                {dare.status === 'in_progress' && (
                  <Link to={`/dare/${dare._id}/perform#submit-proof`} className="btn btn-accent btn-sm">Submit Proof</Link>
                )}
                {/* See Feedback button if graded/completed and feedback exists */}
                {(dare.status === 'graded' || dare.status === 'completed') && dare.grades && dare.grades.length > 0 && (
                  <Link to={`/dare/${dare._id}/perform#feedback`} className="btn btn-info btn-sm">See Feedback</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Switch Games Section */}
      <h2 className="text-xl font-semibold mb-2 mt-6">Switch Games</h2>
      {!games.length ? (
        <div className="p-4 text-center text-gray-400">You are not participating in any switch games yet.</div>
      ) : (
        <div className="space-y-4">
          {games.map(game => {
            // Determine if user is winner or loser
            const isWinner = user && game.winner && (game.winner._id === user._id || game.winner._id === user.id);
            const isLoser = user && game.winner && ((game.creator && (game.creator._id === user._id || game.creator._id === user.id) && game.participant && game.participant._id !== user._id && game.participant._id !== user.id) || (game.participant && (game.participant._id === user._id || game.participant._id === user.id) && game.creator && game.creator._id !== user._id && game.creator._id !== user.id)) && !isWinner;
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
                  <div className="text-xs text-gray-400">
                    {game.winner && (
                      <>Winner: {game.winner?.username || 'Unknown'} | </>
                    )}
                    Created: {game.createdAt ? new Date(game.createdAt).toLocaleString() : 'N/A'}
                    {game.status === 'completed' && game.updatedAt && (
                      <>
                        {' | '}Completed: {new Date(game.updatedAt).toLocaleString()}
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-2 md:mt-0 md:ml-4 flex items-center space-x-2">
                  <Link to={`/switches/${game._id}`} className="btn btn-primary btn-sm">View</Link>
                  {/* Submit Proof if user is loser and status is awaiting_proof */}
                  {game.status === 'awaiting_proof' && user && !isWinner && (
                    <Link to={`/switches/${game._id}#submit-proof`} className="btn btn-accent btn-sm">Submit Proof</Link>
                  )}
                  {/* Review Proof if user is winner and status is proof_submitted */}
                  {game.status === 'proof_submitted' && isWinner && (
                    <Link to={`/switches/${game._id}#review-proof`} className="btn btn-info btn-sm">Review Proof</Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 