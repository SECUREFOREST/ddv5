import React, { useState, useRef } from 'react';

export default function Accordion({ title, children, defaultOpen = false, className = '' }) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef(null);

  return (
    <div className={`panel-group ${className}`.trim()}>
      <div className="panel panel-default">
        <div className="panel-heading" onClick={() => setOpen(o => !o)} style={{ cursor: 'pointer' }}>
          <h4 className="panel-title">
        <span>{title}</span>
            <span style={{ float: 'right', transition: 'transform 0.3s', transform: open ? 'rotate(180deg)' : 'none' }}>
              ▼
            </span>
          </h4>
        </div>
      <div
          className={`panel-collapse collapse${open ? ' in' : ''}`}
        ref={contentRef}
        aria-hidden={!open}
      >
          <div className="panel-body">
        {children}
          </div>
        </div>
      </div>
    </div>
  );
} 