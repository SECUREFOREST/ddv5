import React from 'react';

export default function LeaderboardWidget({ leaders = [], loading = false, title = 'Leaderboard' }) {
  return (
    <div className="bg-white dark:bg-surface-dark rounded-lg shadow p-4 mb-4">
      <div className="border-b pb-2 mb-2">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div>
        {loading ? (
          <div className="text-gray-500 dark:text-gray-400 py-4">Loading leaderboard...</div>
        ) : leaders.length === 0 ? (
          <div className="text-gray-400 py-4">No leaderboard data available.</div>
        ) : (
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="px-4 py-2 font-semibold">#</th>
                <th className="px-4 py-2 font-semibold">User</th>
                <th className="px-4 py-2 font-semibold">Acts Completed</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((entry, i) => (
                <tr key={entry.user?.id || i} className="border-b last:border-b-0">
                  <td className="px-4 py-2 font-bold">{i + 1}</td>
                  <td className="px-4 py-2 flex items-center">
                    {entry.user?.avatar ? (
                      <img src={entry.user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover mr-2" />
                    ) : (
                      <span className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center mr-2 font-bold text-base">
                        {entry.user?.username?.[0]?.toUpperCase() || '?'}
                      </span>
                    )}
                    <span>{entry.user?.username || 'Unknown'}</span>
                  </td>
                  <td className="px-4 py-2">{entry.actsCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 