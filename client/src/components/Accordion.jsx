import React, { useState, useRef } from 'react';

export default function Accordion({ title, children, defaultOpen = false, className = '' }) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef(null);

  const headerId = React.useId ? React.useId() : `accordion-header-${Math.random().toString(36).substr(2, 9)}`;
  const panelId = React.useId ? React.useId() : `accordion-panel-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-4 ${className}`.trim()}>
      <button
        className="w-full flex justify-between items-center px-[15px] py-[10px] text-left text-lg font-semibold text-[#888] bg-[#3c3c3c] border-b border-[#282828] focus:outline-none focus:ring rounded-none -mt-[15px] -mx-[15px] mb-4"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        id={headerId}
      >
        <span>{title}</span>
        <span className={`transform transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>
      <div
        ref={contentRef}
        className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 py-2 px-4' : 'max-h-0 py-0 px-4'}`}
        aria-hidden={!open}
        role="region"
        aria-labelledby={headerId}
        id={panelId}
      >
        <div className="text-neutral-100">{children}</div>
      </div>
    </div>
  );
} 