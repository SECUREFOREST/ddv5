import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Banner } from '../components/Modal';
import Avatar from '../components/Avatar';
import { Link } from 'react-router-dom';

const LAST_SEEN_KEY = 'activityFeedLastSeen';

export default function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastSeen, setLastSeen] = useState(() => {
    const stored = localStorage.getItem(LAST_SEEN_KEY);
    return stored ? new Date(stored) : null;
  });

  useEffect(() => {
    setLoading(true);
    api.get('/activity-feed?limit=30')
      .then(res => setActivities(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Failed to load activity feed.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // On mount, update last seen to now
    const now = new Date();
    localStorage.setItem(LAST_SEEN_KEY, now.toISOString());
    setLastSeen(now);
  }, []);

  return (
    <div className="max-w-md w-full mx-auto mt-16 bg-gradient-to-br from-[#232526] via-[#282828] to-[#1a1a1a] border border-[#282828] rounded-2xl shadow-2xl p-0 sm:p-[15px] mb-8 overflow-hidden">
      {/* Sticky header at the top */}
      <div className="sticky top-0 z-30 bg-neutral-950/95 border-b border-neutral-800 shadow-sm flex items-center justify-center h-14 sm:h-16 mb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Global Activity Feed</h1>
      </div>
      {/* Section divider for main content */}
      <div className="border-t border-neutral-800 my-4" />
      <div className="p-4 bg-neutral-800/90 rounded-xl text-neutral-100 border border-neutral-700 shadow-lg hover:shadow-2xl transition-shadow duration-200 mb-4">
        {loading ? (
          <div className="text-center text-neutral-400">Loading...</div>
        ) : error ? (
          <Banner type="error" message={error} onClose={() => setError('')} />
        ) : activities.length === 0 ? (
          <div className="text-neutral-400 text-center">No recent activity.</div>
        ) : (
          <ul className="flex flex-col gap-3">
            {activities.map(a => {
              const isNew = lastSeen && new Date(a.createdAt) > lastSeen;
              return (
                <li
                  key={a._id}
                  className={`transition-shadow bg-neutral-900/90 border border-neutral-800 rounded-lg p-3 flex items-center gap-3 shadow hover:shadow-2xl ${isNew ? 'ring-2 ring-info/60' : ''}`}
                >
                  <Link to={a.user?._id ? `/profile/${a.user._id}` : '#'} className="group" tabIndex={0} aria-label={`View ${a.user?.username || 'user'}'s profile`}>
                    <Avatar user={a.user} size={36} />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link to={a.user?._id ? `/profile/${a.user._id}` : '#'} className="font-bold text-primary hover:underline focus:outline-none">
                        {a.user?.username || 'Someone'}
                      </Link>
                      {isNew && <span className="ml-2 text-xs text-info font-semibold">NEW</span>}
                    </div>
                    <div className="text-neutral-200 text-sm mt-1">{renderActivityText(a)}</div>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-neutral-400 ml-2" title={new Date(a.createdAt).toLocaleString()}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {formatRelativeTime(new Date(a.createdAt))}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

function renderActivityText(a) {
  switch (a.type) {
    case 'dare_created':
      return <>created a new dare{a.dare ? <>: <b>{a.dare.description}</b></> : null}.</>;
    case 'dare_completed':
      return <>completed a dare{a.dare ? <>: <b>{a.dare.description}</b></> : null}.</>;
    case 'dare_graded':
      return <>graded dare{a.dare ? <>: <b>{a.dare.description}</b></> : null}{a.details?.grade ? <> (grade: {a.details.grade})</> : null}.</>;
    case 'comment_added':
      return <>commented on dare{a.dare ? <>: <b>{a.dare.description}</b></> : null}{a.comment ? <>: "{a.comment.text}"</> : null}.</>;
    default:
      return <>did something.</>;
  }
}

function formatRelativeTime(date) {
  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // in seconds
  if (diff < 60) return `${diff} second${diff !== 1 ? 's' : ''} ago`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  const years = Math.floor(days / 365);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
} 