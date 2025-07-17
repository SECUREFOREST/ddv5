import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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

const DareConsent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dare = location.state?.dare;

  React.useEffect(() => {
    if (!dare) {
      navigate('/dare/select');
    }
  }, [dare, navigate]);

  const handleConsent = (e) => {
    e.preventDefault();
    navigate('/dare/reveal', { state: { dareId: dare._id } });
  };

  if (!dare) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-primary-contrast">
      <div className="bg-neutral-800 p-8 rounded-lg shadow-lg w-full max-w-xl">
        <div className="mb-6 text-center">
          <p className="text-lg">Selenophile wants you to perform</p>
          <h1 className="text-2xl font-bold inline-block">A Deviant Dare</h1>
        </div>
        <div className="mb-6">
          <table className="w-full text-left">
            <tbody>
              <tr><td className="pr-4">Difficulty</td><td><DifficultyBadge level={dare.difficulty} /></td></tr>
              {dare.creator && (
                <tr><td className="pr-4">Creator</td><td>{dare.creator.username || 'Anonymous'}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mb-6 text-center">
          <p>Will you agree to perform their dare?</p>
          <h2 className="text-xl font-semibold my-2">Of course, there's a catch.</h2>
          <p>We'll only tell you what you have to do once you consent. :)</p>
        </div>
        <form onSubmit={handleConsent} className="flex flex-col items-center">
          <button type="submit" className="btn btn-primary btn-lg bg-primary text-primary-contrast px-8 py-3 rounded-lg text-lg font-bold hover:bg-primary-dark transition">I Consent</button>
        </form>
      </div>
    </div>
  );
};

export default DareConsent; 