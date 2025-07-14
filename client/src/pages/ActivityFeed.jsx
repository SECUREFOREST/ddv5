import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Banner } from '../components/Modal';

export default function ActivityFeed() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/activity-feed?limit=30')
      .then(res => setActivities(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Failed to load activity feed.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl w-full mx-auto mt-16 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
      <div className="bg-[#3c3c3c] text-[#888] border-b border-[#282828] px-[15px] py-[10px] -mx-[15px] mt-[-15px] mb-4 rounded-t-none">
        <h1 className="text-2xl font-bold">Global Activity Feed</h1>
      </div>
      <div className="panel-body">
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <Banner type="error" message={error} onClose={() => setError('')} />
        ) : activities.length === 0 ? (
          <div className="text-muted">No recent activity.</div>
        ) : (
          <ul className="list-group">
            {activities.map(a => (
              <li key={a._id} className="list-group-item">
                <span className="label label-default">{a.user?.username || 'Someone'}</span>{' '}
                {renderActivityText(a)}
                <span className="text-muted" style={{ marginLeft: 8, fontSize: 12 }}>{new Date(a.createdAt).toLocaleString()}</span>
              </li>
            ))}
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