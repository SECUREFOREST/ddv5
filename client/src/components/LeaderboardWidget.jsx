import React from 'react';

export default function LeaderboardWidget({ leaders = [], loading = false, title = 'Leaderboard' }) {
  return (
    <div className="panel panel-default">
      <div className="panel-heading">
        <h3 className="panel-title">{title}</h3>
      </div>
      <div className="panel-body">
        {loading ? (
          <div>Loading leaderboard...</div>
        ) : leaders.length === 0 ? (
          <div className="text-muted">No leaderboard data available.</div>
        ) : (
          <table className="table table-striped">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Acts Completed</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((entry, i) => (
                <tr key={entry.user?.id || i}>
                  <td style={{ fontWeight: 'bold' }}>{i + 1}</td>
                  <td>
                    {entry.user?.avatar ? (
                      <img src={entry.user.avatar} alt="avatar" className="img-circle" style={{ width: 32, height: 32, marginRight: 8, verticalAlign: 'middle' }} />
                    ) : (
                      <span className="img-circle" style={{ width: 32, height: 32, display: 'inline-block', background: '#222', color: '#fff', textAlign: 'center', lineHeight: '32px', fontWeight: 'bold', fontSize: 18, marginRight: 8, verticalAlign: 'middle' }}>
                        {entry.user?.username?.[0]?.toUpperCase() || '?'}
                      </span>
                    )}
                    <span>{entry.user?.username || 'Unknown'}</span>
                  </td>
                  <td>{entry.actsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 