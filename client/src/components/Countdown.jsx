import React, { useEffect, useState } from 'react';

function formatDuration(ms) {
  if (ms <= 0) return '0s';
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000) % 60;
  const h = Math.floor(ms / 3600000) % 24;
  const d = Math.floor(ms / 86400000);
  return [
    d > 0 ? `${d}d` : '',
    h > 0 ? `${h}h` : '',
    m > 0 ? `${m}m` : '',
    `${s}s`
  ].filter(Boolean).join(' ');
}

export default function Countdown({ target, onComplete, className = '', ...props }) {
  const targetTime = typeof target === 'string' ? new Date(target).getTime() : target instanceof Date ? target.getTime() : 0;
  const [remaining, setRemaining] = useState(Math.max(0, targetTime - Date.now()));

  useEffect(() => {
    if (remaining <= 0) return;
    const interval = setInterval(() => {
      setRemaining(prev => {
        const next = Math.max(0, targetTime - Date.now());
        if (next === 0 && prev !== 0 && onComplete) onComplete();
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [targetTime, onComplete]);

  return (
    <span className={`inline-block font-mono text-sm ${className}`} aria-live="polite" {...props}>
      {formatDuration(remaining)}
    </span>
  );
} 