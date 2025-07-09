import React from 'react';

export default function LeaderboardWidget({ leaders = [], loading = false, title = 'Leaderboard' }) {
  return (
    <div className="bg-neutral-800 rounded-lg shadow p-4 mb-4">
      <div className="border-b border-neutral-900 pb-2 mb-2">
        <h3 className="text-lg font-semibold text-primary">{title}</h3>
      </div>
      <div>
        {loading ? (
          <div className="text-neutral-400 py-4">Loading leaderboard...</div>
        ) : leaders.length === 0 ? (
          <div className="text-neutral-400 py-4">No leaderboard data available.</div>
        ) : (
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="bg-neutral-900 text-primary">
                <th className="px-4 py-2 font-semibold">#</th>
                <th className="px-4 py-2 font-semibold">User</th>
                <th className="px-4 py-2 font-semibold">Acts Completed</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((entry, i) => (
                <tr key={entry.user?.id || i} className="border-b border-neutral-900 last:border-b-0">
                  <td className="px-4 py-2 font-bold text-primary">{i + 1}</td>
                  <td className="px-4 py-2 flex items-center">
                    {entry.user?.avatar ? (
                      <img src={entry.user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover mr-2" />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-neutral-700 text-neutral-100 flex items-center justify-center mr-2 font-bold text-base">
                        {entry.user?.username?.[0]?.toUpperCase() || '?'}
                      </span>
                    )}
                    <span>{entry.user?.username || 'Unknown'}</span>
                  </td>
                  <td className="px-4 py-2 text-neutral-100">{entry.actsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 