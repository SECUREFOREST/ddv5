import React, { useState, useRef } from 'react';

export default function Accordion({ title, children, defaultOpen = false, className = '' }) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef(null);

  return (
    <div className={`rounded-lg border border-neutral-900 bg-neutral-800 shadow mb-4 ${className}`.trim()}>
      <button
        className="w-full flex justify-between items-center px-4 py-3 text-left text-lg font-semibold text-primary focus:outline-none focus:ring"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className={`transform transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      <div
        ref={contentRef}
        className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 py-2 px-4' : 'max-h-0 py-0 px-4'}`}
        aria-hidden={!open}
      >
        <div className="text-neutral-100">{children}</div>
      </div>
    </div>
  );
} 