import React from 'react';

export default function ProgressBar({ value = 0, label, className = '', ...props }) {
  let pct = Number(value);
  if (isNaN(pct)) pct = 0;
  if (process.env.NODE_ENV === 'development' && (pct < 0 || pct > 100)) {
    console.warn('ProgressBar: value out of bounds', pct);
  }
  pct = Math.max(0, Math.min(100, pct));
  return (
    <div className={`w-full ${className}`.trim()} {...props}>
      {label && <div className="mb-1 text-sm text-[#eee]">{label}</div>}
      <div className="w-full bg-[#282828] border border-[#282828] rounded-none h-4 overflow-hidden">
        <div
          className="bg-primary h-4 rounded-none transition-all duration-300"
          style={{ width: pct + '%' }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label || 'Progress'}
        >
          <span className="sr-only">{pct}%</span>
        </div>
      </div>
    </div>
  );
} 