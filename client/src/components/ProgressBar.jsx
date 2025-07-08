import React from 'react';

export default function ProgressBar({ value = 0, label, className = '', ...props }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={`progress ${className}`.trim()} {...props}>
      {label && <div style={{ marginBottom: 4, fontSize: 12, color: '#888' }}>{label}</div>}
      <div className="progress-bar" role="progressbar" style={{ width: pct + '%' }} aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        {pct}%
      </div>
    </div>
  );
} 