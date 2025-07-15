import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const MOVES = ['rock', 'paper', 'scissors'];

export default function SwitchGameParticipate() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [demand, setDemand] = useState('');
  const [gesture, setGesture] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
    api.get(`/switches/${gameId}`)
      .then(res => setGame(res.data))
      .catch(() => setError('Game not found.'));
  }, [gameId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(`/switches/${gameId}/join`, { demand, move: gesture, consent: true, difficulty: game.difficulty });
      navigate(`/switches/${gameId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join game.');
    }
  };

  if (error) return <div className="max-w-sm mx-auto mt-16 p-6 bg-black bg-opacity-80 rounded text-danger">{error}</div>;
  if (!game) return <div className="max-w-sm mx-auto mt-16 p-6 bg-black bg-opacity-80 rounded text-neutral-200">Loading...</div>;

  const u = game.creator;

  return (
    <div className="max-w-lg mx-auto mt-16 p-6 bg-black bg-opacity-80 rounded shadow">
      <div className="aggressive-text mb-4">
        <p>
          <span className="user-name font-bold">{u.username}</span> has volunteered to compete with other switches, the loser having to perform
        </p>
        <h1 className="inline-heading text-2xl font-bold">One Submissive Act</h1>
      </div>
      <div className="user_info mb-4">
        <table className="table-auto w-full text-white">
          <tbody>
            <tr><td className="font-semibold">Name</td><td>{u.username}</td></tr>
            <tr><td className="font-semibold">Gender</td><td>{u.gender}</td></tr>
            <tr><td className="font-semibold">Age</td><td>{u.age}</td></tr>
            <tr>
              <td className="font-semibold">Dares performed</td>
              <td>
                <div>{u.daresPerformed} completed</div>
                <div>{u.avgGrade ? `Grade: ${u.avgGrade.toFixed(1)}` : 'No grades yet'}</div>
              </td>
            </tr>
            <tr>
              <td className="font-semibold">Dares created</td>
              <td>{u.daresCreated}</td>
            </tr>
            <tr>
              <td className="font-semibold">Hard Limits</td>
              <td>
                {u.limits && u.limits.length > 0 ? u.limits.map(lim => (
                  <span key={lim} className="tag bg-danger text-white px-2 py-1 rounded mr-1 mb-1 inline-block text-xs">{lim}</span>
                )) : 'None'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="aggressive-text mb-4">
        <h2 className="text-xl font-bold">Join in this game</h2>
        <p>
          By describing one act for <span className="user-name font-bold">{u.username}</span> to perform and photograph which does not exceed the difficulty level below:
        </p>
        <div className="difficulty-details border border-danger p-3 mt-2 mb-2">
          <div className="heading flex items-center mb-1">
            <span className="prefix font-bold mr-2">difficulty:</span>
            <span className="name font-semibold">{game.difficulty}</span>
          </div>
          <div className="description text-neutral-200 text-sm">{game.difficultyDescription}</div>
        </div>
        <p>
          However, if you lose, then you will have to perform the act that <span className="user-name font-bold">{u.username}</span> has selected for you to perform.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="form-group mb-4">
          <label className="text required control-label font-semibold mb-1" htmlFor="switch_demand">
            <abbr title="required">*</abbr> Your demand, if they lose
          </label>
          <textarea
            rows={6}
            className="text required form-control w-full rounded border border-neutral-900 px-3 py-2 bg-[#181818] text-neutral-100 focus:outline-none focus:ring focus:border-primary"
            required
            aria-required="true"
            name="switch[demand]"
            id="switch_demand"
            value={demand}
            onChange={e => setDemand(e.target.value)}
          />
          <p className="help-block text-xs text-neutral-400">They will only see this if they lose the game</p>
        </div>
        <div className="rock-paper-scissors mb-4">
          <label className="radio_buttons required control-label font-semibold mb-1">
            <abbr title="required">*</abbr> Your gesture
          </label>
          <div className="flex gap-4 mb-2">
            {MOVES.map(opt => (
              <label key={opt} className="flex items-center gap-1 cursor-pointer">
                <input
                  className="radio_buttons required"
                  required
                  aria-required="true"
                  type="radio"
                  value={opt}
                  name="switch[gesture]"
                  checked={gesture === opt}
                  onChange={e => setGesture(e.target.value)}
                />
                {opt}
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
        {error && <div className="text-danger text-sm font-medium mb-2" role="alert">{error}</div>}
        <button type="submit" className="btn btn-primary btn-lg w-full bg-primary text-white rounded px-4 py-2 font-semibold hover:bg-primary-dark">Join Game</button>
      </form>
    </div>
  );
}
