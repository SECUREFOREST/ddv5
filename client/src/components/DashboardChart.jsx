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
 * @param {object} stats - { daresCount, totalCredits, avgGrade }
 * @param {string} className - Additional classes
 */
export default function DashboardChart({ stats = {}, className = '' }) {
  const data = {
    labels: ['Dares Completed', 'Credits', 'Avg. Grade'],
    datasets: [
      {
        label: 'User Stats',
        data: [stats.daresCount || 0, stats.totalCredits || 0, stats.avgGrade || 0],
        backgroundColor: [
          chartColors.red, // primary
          chartColors.green, // success
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
    <div className={`panel panel-default ${className}`.trim()}>
      <div className="panel-heading">
        <h4 className="panel-title">User Stats</h4>
      </div>
      <div className="panel-body">
      <Bar data={data} options={options} height={220} />
      </div>
    </div>
  );
} 