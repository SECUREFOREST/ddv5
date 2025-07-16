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
    <div className="max-w-2xl w-full mx-auto mt-16 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
      <div className="bg-[#3c3c3c] text-[#888] border-b border-[#282828] px-[15px] py-[10px] -mx-[15px] mt-[-15px] mb-4 rounded-t-none">
        <h1 className="text-2xl font-bold">Global Activity Feed</h1>
      </div>
      <div className="panel-body overflow-x-auto">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <Banner type="error" message={error} onClose={() => setError('')} />
        ) : activities.length === 0 ? (
          <div className="text-muted">No recent activity.</div>
        ) : (
          <ul className="list-group">
            {activities.map(a => {
              const isNew = lastSeen && new Date(a.createdAt) > lastSeen;
              return (
                <li
                  key={a._id}
                  className={`list-group-item ${isNew ? 'bg-info bg-opacity-10 border-l-4 border-info' : ''}`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Link to={a.user?._id ? `/profile/${a.user._id}` : '#'} className="hover:underline focus:outline-none">
                      <Avatar user={a.user} size={28} />
                    </Link>
                    <Link to={a.user?._id ? `/profile/${a.user._id}` : '#'} className="hover:underline text-primary focus:outline-none">
                      {a.user?.username || 'Someone'}
                    </Link>
                  </span>
                  {renderActivityText(a)}
                  <span className="text-muted" style={{ marginLeft: 8, fontSize: 12 }}>{formatRelativeTime(new Date(a.createdAt))}</span>
                  {isNew && <span className="ml-2 text-xs text-info font-semibold">NEW</span>}
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