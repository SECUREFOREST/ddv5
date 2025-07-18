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
    navigate(`/dare/reveal/${dare._id}`);
  };

  if (!dare) return null;

  return (
    <div className="max-w-md w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-[15px] mb-8 overflow-hidden">
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-center h-14 sm:h-16 mb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Dare Consent</h1>
      </div>
      {/* Section divider */}
      <div className="border-t border-neutral-800 my-4" />
      {/* Card-like section for main content */}
      <div className="p-6 flex flex-col gap-6 bg-neutral-800/90 rounded-xl text-neutral-100 border border-neutral-700 text-center shadow-lg hover:shadow-2xl transition-shadow duration-200 mb-4">
        <div className="mb-2 text-center">
          <p className="text-lg text-primary-contrast">Selenophile wants you to perform</p>
          <h1 className="text-2xl font-bold inline-block text-primary mb-2">A Deviant Dare</h1>
        </div>
        <div className="mb-2 flex flex-col gap-2 items-center justify-center">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-300">Difficulty:</span>
            <DifficultyBadge level={dare.difficulty} />
          </div>
          {dare.creator && (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-300">Creator:</span>
              <span className="text-primary-contrast">{dare.creator.username || 'Anonymous'}</span>
            </div>
          )}
        </div>
        <div className="mb-2 text-center">
          <p className="text-neutral-200">Will you agree to perform their dare?</p>
          <h2 className="text-xl font-semibold my-2 text-primary">Of course, there's a catch.</h2>
          <p className="text-neutral-400">We'll only tell you what you have to do once you consent. :)</p>
        </div>
        <form onSubmit={handleConsent} className="flex flex-col items-center">
          <button type="submit" className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-bold text-base shadow hover:bg-primary-contrast hover:text-primary transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary-contrast" style={{maxWidth:'300px'}} aria-label="Consent to perform dare">
            I Consent
          </button>
        </form>
      </div>
    </div>
  );
};

export default DareConsent; 