import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import api from '../api/axios';
import { SparklesIcon, FireIcon, EyeDropperIcon, ExclamationTriangleIcon, RocketLaunchIcon } from '@heroicons/react/24/solid';
import { useNotification } from '../context/NotificationContext';
import { DIFFICULTY_OPTIONS } from '../constants';

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

export default function DareConsent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [dare, setDare] = React.useState(location.state?.dare || null);
  const [loading, setLoading] = React.useState(false);
  const { showNotification } = useNotification();

  React.useEffect(() => {
    if (!dare && id) {
      api.get(`/dares/${id}`)
        .then(res => setDare(res.data))
        .catch(() => showNotification('Dare not found.', 'error'));
    }
  }, [dare, id]);

  const handleConsent = async () => {
    setLoading(true);
    if (dare && dare._id) {
      if (dare.status !== 'in_progress') {
        try {
          await api.patch(`/dares/${dare._id}`, { status: 'in_progress' });
        } catch (err) {
          showNotification('Failed to update dare status.', 'error');
          return;
        }
      }
      navigate(`/dare/reveal/${dare._id}`);
    }
    setLoading(false);
  };

  if (!dare) return <div className="text-neutral-400 text-center mt-8">Loading...</div>;

  const diff = DIFFICULTY_OPTIONS.find(d => d.value === dare.difficulty);

  return (
    <div className="max-w-md sm:max-w-xl lg:max-w-2xl w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl p-0 sm:p-6 mb-8 overflow-hidden">
      {/* Progress Bar */}
      <div className="w-full bg-neutral-700 rounded-full h-2 mt-4 mb-2">
        <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: '100%' }} />
      </div>
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 flex items-center justify-center h-16 mb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">Dare Consent</h1>
      </div>
      {/* Step indicator */}
      <div className="text-center text-xs text-neutral-400 font-semibold mb-2">Step 2 of 2: Consent to Perform Dare</div>


      {/* Card-like section for main content */}
      <div className="p-6 flex flex-col gap-6 bg-neutral-800/90 rounded-xl text-neutral-100 border border-neutral-700 text-center shadow-lg hover:shadow-2xl transition-duration-200 mb-4">
        <div className="mb-2 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 justify-center">
              {/* Avatar */}
              {dare.creator && dare.creator.avatar ? (
                <img src={dare.creator.avatar} alt={(dare.creator.fullName || dare.creator.username || 'Anonymous') + ' avatar'} className="w-8 h-8 rounded-full border border-primary" />
              ) : (
                <span className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-neutral-400 border border-neutral-600">?
                </span>
              )}
              {/* Full name or username (clickable if username is present) */}
              {dare.creator && (dare.creator.fullName || dare.creator.username) ? (
                dare.creator.username ? (
                  <a href={`/profile/${dare.creator.username}`} className="text-primary-contrast font-semibold hover:underline" target="_blank" rel="noopener noreferrer">
                    {dare.creator.fullName || dare.creator.username}
                  </a>
                ) : (
                  <span className="text-primary-contrast font-semibold">{dare.creator.fullName || dare.creator.username}</span>
                )
              ) : (
                <span className="text-neutral-400 font-semibold">Anonymous</span>
              )}
              <span className="text-neutral-400">wants you to perform</span>
            </div>
            <h1 className="text-2xl font-bold inline-block text-primary mb-2">A Deviant Dare</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 justify-center mt-2">
          {diff && diff.icon}
          <DifficultyBadge level={dare.difficulty} />
        </div>
        {diff && (
          <div className="text-xs text-neutral-400 mt-1 text-center">{diff.desc}</div>
        )}
        <div className="mb-2 text-center">
          <p className="text-neutral-200">Will you agree to perform their dare?</p>
          <h2 className="text-xl font-semibold my-2 text-primary">Of course, there's a catch.</h2>
          <p className="text-neutral-400">We'll only tell you what you have to do once you consent. :)</p>
        </div>
        {/* What happens next summary */}
        <div className="bg-primary/10 border border-primary rounded-lg p-3 text-primary-contrast flex items-center gap-2 justify-center text-sm">
          <CheckCircleIcon className="w-5 h-5 text-primary" />
          After you consent, you'll see the full dare and can choose to accept or forfeit it.
        </div>
        <form role="form" aria-labelledby="dare-consent-title" onSubmit={handleConsent} className="space-y-6">
          <h1 id="dare-consent-title" className="text-2xl font-bold mb-4">Dare Consent</h1>
          <div className="sticky bottom-0 w-full  py-4 flex justify-center z-10 border-t border-neutral-800">
            <button type="submit" className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-bold text-base transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-contrast flex items-center gap-2 justify-center text-lg shadow-lg" aria-label="Consent to perform dare" disabled={loading}>
              {loading ? 'Consenting...' : 'I Consent'} <ArrowRightIcon className="inline w-5 h-5 ml-1" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 