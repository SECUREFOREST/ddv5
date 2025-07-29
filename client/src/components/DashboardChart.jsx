import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { chartColors } from '../tailwindColors.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

/**
 * DashboardChart component
 * @param {object} stats - { daresCount, avgGrade }
 * @param {string} className - Additional classes
 */
export default function DashboardChart({ stats = {}, className = '' }) {
  const data = {
    labels: ['Dares Completed', 'Avg. Grade'],
    datasets: [
      {
        label: 'User Stats',
        data: [stats.daresCount || 0, stats.avgGrade || 0],
        backgroundColor: [
          chartColors.red, // primary
          chartColors.orange, // warning
        ],
        borderRadius: 0,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  };
  return (
    <div className={`bg-gradient-to-br from-neutral-900/80 to-neutral-800/60 border border-neutral-700/50 rounded-2xl p-6 ${className}`}>
      <div className="mb-4">
        <h4 className="text-lg font-semibold text-white">User Stats</h4>
      </div>
      <div className="bg-neutral-800/30 rounded-lg p-4">
        <Bar data={data} options={options} height={220} />
      </div>
    </div>
  );
} 