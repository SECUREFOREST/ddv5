import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Banner } from '../components/Modal';
// 1. Import Avatar and Heroicons
import Avatar from '../components/Avatar';
import { CheckCircleIcon, ExclamationTriangleIcon, ClockIcon, TagIcon, ArrowPathIcon, SparklesIcon, FireIcon, EyeDropperIcon, RocketLaunchIcon } from '@heroicons/react/24/solid';

const MOVES = ['rock', 'paper', 'scissors'];
const DIFFICULTIES = [
  {
    value: 'titillating',
    label: 'Titillating',
    desc: 'Fun, flirty, and easy. For beginners or light play.',
    icon: <SparklesIcon className="w-6 h-6 text-pink-400" aria-hidden="true" />,
  },
  {
    value: 'arousing',
    label: 'Arousing',
    desc: 'A bit more daring, but still approachable.',
    icon: <FireIcon className="w-6 h-6 text-purple-500" aria-hidden="true" />,
  },
  {
    value: 'explicit',
    label: 'Explicit',
    desc: 'Sexually explicit or more intense.',
    icon: <EyeDropperIcon className="w-6 h-6 text-red-500" aria-hidden="true" />,
  },
  {
    value: 'edgy',
    label: 'Edgy',
    desc: 'Pushes boundaries, not for the faint of heart.',
    icon: <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" aria-hidden="true" />,
  },
  {
    value: 'hardcore',
    label: 'Hardcore',
    desc: 'Extreme, risky, or very advanced.',
    icon: <RocketLaunchIcon className="w-6 h-6 text-black dark:text-white" aria-hidden="true" />,
  },
];

// 2. Add a StatusBadge helper (like DareReveal)
function StatusBadge({ status }) {
  if (!status) return null;
  let badgeClass = 'bg-neutral-700 text-neutral-100';
  let icon = null;
  let text = status;
  switch (status) {
    case 'waiting_for_participant':
      badgeClass = 'bg-blue-900/90 border border-blue-700 text-blue-200';
      icon = <ClockIcon className="w-5 h-5" />;
      text = 'Waiting for Participant';
      break;
    case 'in_progress':
      badgeClass = 'bg-blue-900/90 border border-blue-700 text-blue-200';
      icon = <ClockIcon className="w-5 h-5" />;
      text = 'In Progress';
      break;
    case 'completed':
      badgeClass = 'bg-green-900/90 border border-green-700 text-green-200';
      icon = <CheckCircleIcon className="w-5 h-5" />;
      text = 'Completed';
      break;
    case 'forfeited':
      badgeClass = 'bg-red-900/90 border border-red-700 text-red-200';
      icon = <ExclamationTriangleIcon className="w-5 h-5" />;
      text = 'Forfeited';
      break;
    default:
      badgeClass = 'bg-neutral-700 text-neutral-100';
      icon = null;
      text = status;
  }
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1 font-semibold shadow-lg text-lg ${badgeClass} mx-auto mb-4`}>
      {icon} {text}
    </span>
  );
}

export default function SwitchGameParticipate() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [demand, setDemand] = useState('');
  const [gesture, setGesture] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [showRules, setShowRules] = useState(false);
  // For difficulty/consent selection
  const [difficulty, setDifficulty] = useState('');
  const [consent, setConsent] = useState(false);
  const [searching, setSearching] = useState(false);
  const [banner, setBanner] = useState({ type: '', message: '' });

  // Handler for finding a game (for the difficulty/consent form)
  const handleFindGame = async (e) => {
    e.preventDefault();
    setError('');
    setBanner({ type: '', message: '' });
    if (!difficulty) {
      setBanner({ type: 'error', message: 'Please select a difficulty.' });
      return;
    }
    if (!consent) {
      setBanner({ type: 'error', message: 'You must consent to participate.' });
      return;
    }
    setSearching(true);
    try {
      // Fetch open switch games with selected difficulty
      const res = await api.get('/switches', { params: { status: 'waiting_for_participant', difficulty } });
      const games = Array.isArray(res.data) ? res.data : [];
      if (games.length > 0 && games[0]._id) {
        navigate(`/switches/participate/${games[0]._id}`);
      } else {
        setBanner({ type: 'error', message: 'No open switch games available for this difficulty.' });
      }
    } catch (err) {
      setBanner({ type: 'error', message: 'Failed to find a switch game.' });
    } finally {
      setSearching(false);
    }
  };

  // Fetch game if gameId is present
  useEffect(() => {
    if (!gameId) return;
    api.get(`/switches/${gameId}`)
      .then(res => setGame(res.data))
      .catch(() => setError('Game not found.'));
  }, [gameId]);

  // In the handleSubmit function, update the join POST request:
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBanner({ type: '', message: '' });
    if (!demand || demand.length < 10) {
      setBanner({ type: 'error', message: 'Please enter a demand of at least 10 characters.' });
      return;
    }
    if (!gesture) {
      setBanner({ type: 'error', message: 'Please select your gesture.' });
      return;
    }
    try {
      await api.post(`/switches/${gameId}/join`, { move: gesture, consent: true, difficulty: game.difficulty });
      navigate(`/switches/${gameId}`);
    } catch (err) {
      setBanner({ type: 'error', message: err.response?.data?.error || 'Failed to join game.' });
    }
  };

  // Conditional rendering logic
  let content;
  if (!gameId) {
    content = (
      <div className="max-w-md sm:max-w-xl lg:max-w-2xl w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-6 mb-8 overflow-hidden">
        {/* Progress/Accent Bar */}
        <div className="w-full bg-primary h-1 mb-1" />
        {/* Sticky header at the top */}
        <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-center h-16 mb-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">Participate in a Switch Game</h1>
        </div>
        {/* Section divider for main content */}
        <div className="border-t border-neutral-800 my-4" />
        <Banner type={banner.type} message={banner.message} onClose={() => setBanner({ type: '', message: '' })} />
        {/* Card-like section for form content */}
        <form onSubmit={handleFindGame} className="space-y-6 p-6 bg-neutral-800/90 rounded-xl text-neutral-100 border border-neutral-700 text-center shadow-lg hover:shadow-2xl transition-shadow duration-200 mb-4">
          <div>
            <div className="font-bold text-xl text-primary mb-4">Choose a difficulty</div>
            <div className="flex flex-col gap-4">
              {DIFFICULTIES.map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-150 focus-within:ring-2 focus-within:ring-primary-contrast
                    ${difficulty === opt.value
                      ? 'border-primary bg-primary/10 shadow-lg scale-105'
                      : 'border-neutral-700 hover:border-primary hover:bg-neutral-800/60'}
                  `}
                  tabIndex={0}
                  aria-label={`Select ${opt.label} difficulty`}
                  role="radio"
                  aria-checked={difficulty === opt.value}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') setDifficulty(opt.value);
                  }}
                >
                  <input
                    type="radio"
                    name="difficulty"
                    value={opt.value}
                    checked={difficulty === opt.value}
                    onChange={() => setDifficulty(opt.value)}
                    className="accent-primary focus:ring-2 focus:ring-primary-contrast focus:outline-none"
                    aria-checked={difficulty === opt.value}
                    aria-label={opt.label}
                    tabIndex={-1}
                  />
                  <span className="flex items-center gap-2">
                    {opt.icon}
                    <b className="text-base text-primary-contrast">{opt.label}</b>
                  </span>
                  <span className="text-xs text-neutral-400 ml-6 text-left">{opt.desc}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <div className="font-bold text-xl text-primary mb-2">Description / Requirements</div>
            <textarea
              className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-contrast focus:border-primary"
              value={demand}
              onChange={e => setDemand(e.target.value)}
              rows={3}
              required
              minLength={10}
              placeholder="Describe the dare you want the other to perform if they lose..."
              aria-label="Description or requirements"
            />
          </div>
          <div className="flex items-center justify-center mb-4">
            <input
              type="checkbox"
              id="consent"
              checked={consent}
              onChange={e => setConsent(e.target.checked)}
              className="mr-2 accent-primary focus:ring-2 focus:ring-primary-contrast"
              required
            />
            <label htmlFor="consent" className="text-neutral-200">I consent to participate in a switch game at this difficulty</label>
          </div>
          <button type="submit" className="w-full bg-primary text-primary-contrast px-4 py-2 rounded font-bold shadow hover:bg-primary-contrast hover:text-primary transition-colors disabled:opacity-50 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-contrast" disabled={searching} aria-label="Find Game">
            {searching ? (
              <svg className="animate-spin h-5 w-5 text-primary-contrast" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
            ) : (
              <>Find Game</>
            )}
          </button>
        </form>
      </div>
    );
  } else if (error) {
    content = (
      <div className="max-w-md sm:max-w-xl lg:max-w-2xl w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-6 mb-8 overflow-hidden">
        {/* Progress/Accent Bar */}
        <div className="w-full bg-primary h-1 mb-1" />
        <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-center h-16 mb-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">Participate in a Switch Game</h1>
        </div>
        <div className="border-t border-neutral-800 my-4" />
        <Banner type="error" message={error} onClose={() => setError('')} />
        <button
          className="mt-4 bg-primary text-primary-contrast rounded px-4 py-2 font-semibold hover:bg-primary-contrast hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary-contrast"
          onClick={() => navigate('/switches/participate')}
        >
          Try Another Game
        </button>
      </div>
    );
  } else if (!game) {
    content = <div className="max-w-md sm:max-w-xl lg:max-w-2xl w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-6 mb-8 overflow-hidden text-neutral-200 flex items-center justify-center min-h-[200px]">Loading...</div>;
  } else {
    const u = game.creator;
    content = (
      <div className="max-w-md sm:max-w-xl lg:max-w-2xl w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-6 mb-8 overflow-hidden">
        {/* Progress/Accent Bar */}
        <div className="w-full bg-primary h-1 mb-1" />
        {/* Sticky header at the top */}
        <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-center h-16 mb-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">Participate in a Switch Game</h1>
        </div>
        <div className="border-t border-neutral-800 my-4" />
        <Banner type={banner.type} message={banner.message} onClose={() => setBanner({ type: '', message: '' })} />
        {/* 3. In the main render, after the sticky header, add: */}
        {game && (
          <div className="flex justify-center mb-4">
            <StatusBadge status={game.status} />
          </div>
        )}
        {/* User info card */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-6 bg-neutral-900/80 rounded-xl p-4 border border-neutral-800 shadow-lg">
          <div className="flex flex-col items-center">
            {game.creator && (
              <a href={`/profile/${game.creator._id || game.creator.id || ''}`} className="group" tabIndex={0} aria-label={`View ${game.creator.username}'s profile`}>
                <Avatar user={game.creator} size="lg" />
              </a>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full mt-1">Creator</span>
            <span className="font-semibold text-neutral-100">{game.creator?.username}</span>
          </div>
          {/* Add participant info if available */}
          {game.participant && (
            <>
              <span className="hidden sm:block text-neutral-500 text-3xl mx-4">→</span>
              <div className="flex flex-col items-center">
                <a href={`/profile/${game.participant._id || game.participant.id || ''}`} className="group" tabIndex={0} aria-label={`View ${game.participant.username}'s profile`}>
                  <Avatar user={game.participant} size="lg" />
                </a>
                <span className="inline-flex items-center gap-1 text-xs text-blue-400 font-bold bg-blue-400/10 px-2 py-0.5 rounded-full mt-1">Participant</span>
                <span className="font-semibold text-neutral-100">{game.participant?.username}</span>
              </div>
            </>
          )}
        </div>
        {/* Game info and join form */}
        <div className="p-4 bg-neutral-800/90 rounded-xl text-neutral-100 border border-neutral-700 text-center shadow-lg hover:shadow-2xl transition-shadow duration-200 mb-4">
          <div className="font-bold text-xl text-primary mb-2">Game Details</div>
          <div className="text-base font-normal mb-3 break-words text-primary-contrast">{game.difficultyDescription}</div>
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 bg-primary text-primary-contrast rounded-full px-3 py-1 text-xs font-semibold border border-primary">
              <TagIcon className="w-3 h-3" /> {game.difficulty}
            </span>
            {game.tags && game.tags.map(tag => (
              <span key={tag} className="inline-flex items-center gap-1 bg-blue-900 text-blue-200 rounded-full px-3 py-1 text-xs font-semibold border border-blue-700">
                <TagIcon className="w-3 h-3" /> {tag}
              </span>
            ))}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="font-bold text-base text-primary mb-1">Your demand, if they lose</div>
              <textarea
                rows={4}
                className="w-full rounded border border-neutral-900 px-3 py-2 bg-neutral-900 text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-contrast focus:border-primary"
                required
                aria-required="true"
                name="switch[demand]"
                id="switch_demand"
                value={demand}
                onChange={e => setDemand(e.target.value)}
                placeholder="Describe the dare you want the other to perform if they lose..."
              />
              <p className="help-block text-xs text-neutral-400">They will only see this if they lose the game</p>
            </div>
            <div>
              <div className="font-bold text-base text-primary mb-1">Your gesture</div>
              <div className="flex gap-4 mb-2 justify-center">
                {MOVES.map(opt => (
                  <label key={opt} className={`cursor-pointer px-3 py-2 rounded-lg border transition-all duration-150 flex flex-col items-center
                    ${gesture === opt ? 'bg-primary text-primary-contrast border-primary scale-105 shadow-lg' : 'bg-neutral-900 text-neutral-100 border-neutral-700 hover:border-primary hover:bg-neutral-800/60'}`}
                    tabIndex={0} aria-label={`Select gesture ${opt}`}>
                    <input
                      className="hidden"
                      required
                      aria-required="true"
                      type="radio"
                      value={opt}
                      name="switch[gesture]"
                      checked={gesture === opt}
                      onChange={e => setGesture(e.target.value)}
                    />
                    <span className="text-2xl mb-1">{opt === 'rock' ? '🪨' : opt === 'paper' ? '📄' : '✂️'}</span>
                    <span className="font-semibold">{opt.charAt(0).toUpperCase() + opt.slice(1)}</span>
                  </label>
                ))}
              </div>
              <p className="help-block text-xs text-neutral-400">
                The winner is determined by this game of rock-paper-scissors. Wondering what happens on a draw?{' '}
                <a href="#rules" onClick={e => { e.preventDefault(); setShowRules(!showRules); }} className="underline cursor-pointer">See more details</a>
              </p>
              {showRules && (
                <div className="well mt-2 bg-neutral-800 p-3 rounded">
                  <h4 className="heading font-bold mb-2">Game rules</h4>
                  <div className="details text-sm text-neutral-200">
                    <p>If you don't know what rock-paper-scissors is, check out <a href="https://en.wikipedia.org/wiki/Rock-paper-scissors" className="underline text-info" target="_blank" rel="noopener noreferrer">the wikipedia article</a>.</p>
                    <p>In the case of a draw, what happens depend on which gesture you both picked:</p>
                    <p><strong>Rock:</strong> You both lose and both have to perform the other person's demand.</p>
                    <p><strong>Paper:</strong> You both win, and no one has to do anything. You might want to start another game.</p>
                    <p><strong>Scissors:</strong> Deep in the bowels of our data center, a trained monkey flips a coin and the loser is randomly determined.</p>
                  </div>
                </div>
              )}
            </div>
            <button type="submit" className="w-full bg-primary text-primary-contrast px-4 py-2 rounded font-bold shadow hover:bg-primary-contrast hover:text-primary transition-colors disabled:opacity-50 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary-contrast">Join Game</button>
          </form>
        {/* 6. Add timestamps/meta at the bottom */}
        {game.createdAt && (
          <div className="mt-4 text-xs text-neutral-500 flex flex-col items-center gap-1">
            <div className="flex items-center gap-1" title={game.createdAt}>
              <ClockIcon className="w-4 h-4 text-neutral-400" />
              Created: {new Date(game.createdAt).toLocaleString()}
            </div>
            {game.updatedAt && (
              <div className="flex items-center gap-1" title={game.updatedAt}>
                <ArrowPathIcon className="w-4 h-4 text-blue-400" />
                Last Updated: {new Date(game.updatedAt).toLocaleString()}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      {content}
    </div>
  );
}
