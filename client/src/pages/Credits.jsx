import React, { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Credits() {
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/credits')
      .then(res => setCredits(res.data))
      .catch(() => setCredits([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="panel panel-default">
      <div className="panel-heading">
        <h1 className="panel-title">Credits</h1>
      </div>
      <div className="panel-body">
      {loading ? (
        <div>Loading credits...</div>
        ) : credits.length === 0 ? (
          <div className="text-muted">No credit data available.</div>
          ) : (
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Credits</th>
                </tr>
              </thead>
              <tbody>
                {credits.map((entry, i) => (
                  <tr key={entry.user?._id || i}>
                    <td>
                      {entry.user?.avatar ? (
                        <img src={entry.user.avatar} alt="avatar" className="avatar" style={{ width: 32, height: 32, marginRight: 8, verticalAlign: 'middle' }} />
                      ) : (
                        <span className="avatar" style={{ width: 32, height: 32, marginRight: 8, display: 'inline-block', background: '#333', color: '#fff', textAlign: 'center', lineHeight: '32px', borderRadius: '50%', verticalAlign: 'middle' }}>
                          {entry.user?.username?.[0]?.toUpperCase() || '?'}
                        </span>
                      )}
                      <span>{entry.user?.username || 'Unknown'}</span>
                    </td>
                    <td>{entry.credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
    </div>
  );
} 