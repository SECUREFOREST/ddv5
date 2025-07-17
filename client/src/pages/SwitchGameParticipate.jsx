import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Banner } from '../components/Modal';

const MOVES = ['rock', 'paper', 'scissors'];
const DIFFICULTIES = [
  { value: 'titillating', label: 'Titillating', desc: 'Fun, flirty, and easy. For beginners or light play.' },
  { value: 'arousing', label: 'Arousing', desc: 'A bit more daring, but still approachable.' },
  { value: 'explicit', label: 'Explicit', desc: 'Sexually explicit or more intense.' },
  { value: 'edgy', label: 'Edgy', desc: 'Pushes boundaries, not for the faint of heart.' },
  { value: 'hardcore', label: 'Hardcore', desc: 'Extreme, risky, or very advanced.' },
];

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
      await api.post(`/switches/${gameId}/join`, { demand, move: gesture, consent: true, difficulty: game.difficulty });
      navigate(`/switches/${gameId}`);
    } catch (err) {
      setBanner({ type: 'error', message: err.response?.data?.error || 'Failed to join game.' });
    }
  };

  // Conditional rendering logic
  let content;
  if (!gameId) {
    content = (
      <div className="max-w-md w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-[15px] mb-8 overflow-hidden">
        {/* Sticky header at the top */}
        <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-center h-14 sm:h-16 mb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Participate in a Switch Game</h1>
        </div>
        {/* Section divider for main content */}
        <div className="border-t border-neutral-800 my-4" />
        <Banner type={banner.type} message={banner.message} onClose={() => setBanner({ type: '', message: '' })} />
        {/* Card-like section for form content */}
        <form onSubmit={handleFindGame} className="space-y-6 p-6 bg-neutral-800/90 rounded-xl text-neutral-100 border border-neutral-700 text-center shadow-lg hover:shadow-2xl transition-shadow duration-200 mb-4">
          <div>
            <div className="font-bold text-xl text-primary mb-2">Choose a difficulty</div>
            <div className="flex flex-col gap-3">
              {DIFFICULTIES.map(opt => (
                <label key={opt.value} className={`flex items-start gap-2 p-3 rounded-lg cursor-pointer border transition-all duration-150
                  ${difficulty === opt.value
                    ? 'border-primary bg-primary/10 shadow-lg scale-105'
                    : 'border-neutral-700 hover:border-primary hover:bg-neutral-800/60'}
                `} tabIndex={0} aria-label={`Select ${opt.label} difficulty`}>
                  <input type="radio" name="difficulty" value={opt.value} checked={difficulty === opt.value} onChange={() => setDifficulty(opt.value)} className="accent-primary mt-1 focus:ring-2 focus:ring-primary-contrast" />
                  <span>
                    <b className="text-base">{opt.label}</b>
                    <div className="text-xs text-neutral-400 mt-1 ml-1">{opt.desc}</div>
                  </span>
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
      <div className="max-w-md w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-[15px] mb-8 overflow-hidden">
        <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-center h-14 sm:h-16 mb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Participate in a Switch Game</h1>
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
    content = <div className="max-w-md w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-[15px] mb-8 overflow-hidden text-neutral-200 flex items-center justify-center min-h-[200px]">Loading...</div>;
  } else {
    const u = game.creator;
    content = (
      <div className="max-w-md w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-[15px] mb-8 overflow-hidden">
        {/* Sticky header at the top */}
        <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-center h-14 sm:h-16 mb-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Participate in a Switch Game</h1>
        </div>
        <div className="border-t border-neutral-800 my-4" />
        <Banner type={banner.type} message={banner.message} onClose={() => setBanner({ type: '', message: '' })} />
        {/* User info card */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-6 bg-neutral-900/80 rounded-xl p-4 border border-neutral-800 shadow-lg">
          <div className="flex flex-col items-center">
            <span className="inline-flex items-center gap-1 text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full mt-1">Creator</span>
            <span className="font-semibold text-neutral-100">{u.username}</span>
            {/* Add more user info as needed */}
          </div>
        </div>
        {/* Game info and join form */}
        <div className="p-6 bg-neutral-800/90 rounded-xl text-neutral-100 border border-neutral-700 text-center shadow-lg hover:shadow-2xl transition-shadow duration-200 mb-4">
          <div className="font-bold text-xl text-primary mb-2">Game Details</div>
          <div className="mb-2 text-neutral-200 text-sm">{game.difficultyDescription}</div>
          <div className="mb-4">
            <span className="font-semibold text-neutral-300">Difficulty:</span> <span className="font-bold text-primary ml-1">{game.difficulty}</span>
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
        </div>
        {/* Timestamps/meta if available */}
        {game.createdAt && (
          <div className="mt-4 text-xs text-neutral-500 flex flex-col items-center gap-1">
            <div className="flex items-center gap-1" title={game.createdAt}>
              <span className="material-icons text-neutral-400" style={{fontSize:'16px'}}>schedule</span>
              Created: {new Date(game.createdAt).toLocaleString()}
            </div>
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
