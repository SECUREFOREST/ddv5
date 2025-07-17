import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

function DifficultyBadge({ level }) {
  let badgeClass = 'bg-neutral-700 text-neutral-100 rounded-none';
  let label = '';
  switch (level) {
    case 'titillating':
      badgeClass = 'bg-pink-600 text-white rounded-none';
      label = 'Titillating';
      break;
    case 'arousing':
      badgeClass = 'bg-purple-700 text-white rounded-none';
      label = 'Arousing';
      break;
    case 'explicit':
      badgeClass = 'bg-red-700 text-white rounded-none';
      label = 'Explicit';
      break;
    case 'edgy':
      badgeClass = 'bg-yellow-700 text-white rounded-none';
      label = 'Edgy';
      break;
    case 'hardcore':
      badgeClass = 'bg-black text-white rounded-none border border-red-700';
      label = 'Hardcore';
      break;
    default:
      label = level ? level.charAt(0).toUpperCase() + level.slice(1) : 'Unknown';
  }
  return (
    <span className={`px-2 py-1 rounded-none text-xs font-semibold mr-2 ${badgeClass}`}>{label}</span>
  );
}

export default function DareReveal() {
  const location = useLocation();
  const navigate = useNavigate();
  const dareId = location.state?.dareId;
  const { user } = useAuth();
  const [dare, setDare] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (!dareId) {
      navigate('/dare/select');
      return;
    }
    setLoading(true);
    setError('');
    api.get(`/dares/${dareId}`)
      .then(res => {
        if (res.data && res.data._id) {
          // Check performer
          if (!user || !res.data.performer || (res.data.performer._id !== user.id && res.data.performer !== user.id)) {
            setError('You are not authorized to view this dare.');
            setDare(null);
          } else {
            setDare(res.data);
          }
        } else {
          setError('Dare not found.');
        }
      })
      .catch(() => {
        setError('Failed to fetch dare.');
      })
      .finally(() => setLoading(false));
  }, [dareId, navigate, user]);

  if (!dareId) return null;

  return (
    <div className="max-w-md w-full mx-auto mt-16 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
      <h1 className="text-2xl font-bold text-center mb-6 text-[#888]">Your Dare</h1>
      {loading ? (
        <div className="text-lg text-center">Loading dare...</div>
      ) : error ? (
        <div className="text-danger text-center mb-4">{error}</div>
      ) : dare ? (
        <div className="p-4 bg-neutral-900 rounded text-neutral-100 border border-neutral-800 text-center">
          <div className="mb-2">
            <DifficultyBadge level={dare.difficulty} />
          </div>
          <div className="text-lg font-bold mb-2">{dare.description}</div>
          {dare.creator && (
            <div className="text-xs text-neutral-400">Created by: {dare.creator.username || 'Anonymous'}</div>
          )}
        </div>
      ) : null}
    </div>
  );
} 