import React, { useState, useRef, useEffect } from 'react';

/**
 * Tooltip component (Tailwind refactor)
 * @param {React.ReactNode} children - The trigger element
 * @param {React.ReactNode} content - Tooltip content
 * @param {string} className - Additional classes for the tooltip
 * @param {('top'|'bottom'|'left'|'right')} position - Tooltip position (default: 'top')
 * @param {object} props - Other props
 */
export default function Tooltip({
  children,
  content,
  className = '',
  position = 'top',
  ...props
}) {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const tooltipId = React.useId ? React.useId() : 'tooltip';
  


  // Position tooltip
  useEffect(() => {
    if (visible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      let top, left;
      if (position === 'bottom') {
        top = triggerRect.bottom + window.scrollY + 8;
      } else if (position === 'left') {
        top = triggerRect.top + window.scrollY + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left + window.scrollX - tooltipRect.width - 8;
      } else if (position === 'right') {
        top = triggerRect.top + window.scrollY + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + window.scrollX + 8;
      } else {
        // top
        top = triggerRect.top + window.scrollY - tooltipRect.height - 8;
      }
      if (position === 'left' || position === 'right') {
        // left and right already set
      } else {
        left = triggerRect.left + window.scrollX + (triggerRect.width - tooltipRect.width) / 2;
      }
      // Clamp to viewport
      const vw = window.innerWidth, vh = window.innerHeight;
      left = Math.max(8, Math.min(left, vw - tooltipRect.width - 8));
      top = Math.max(8, Math.min(top, vh - tooltipRect.height - 8));
      setCoords({ top, left });
    }
  }, [visible, position]);

  // Hide on scroll
  useEffect(() => {
    if (!visible) return;
    
    const hide = () => setVisible(false);
    window.addEventListener('scroll', hide, true);
    
    return () => {
      window.removeEventListener('scroll', hide, true);
    };
  }, [visible]);

  // Accessibility: show on focus/hover/click, hide on Escape
  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  useEffect(() => {
    if (!visible) return;
    
    const handleKey = (e) => {
      if (e.key === 'Escape') hide();
    };
    
    document.addEventListener('keydown', handleKey);
    
    return () => {
      document.removeEventListener('keydown', handleKey);
    };
  }, [visible]);

  return (
    <>
      <span
        ref={triggerRef}
        tabIndex={0}
        aria-describedby={visible ? tooltipId : undefined}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        onClick={show}
        style={{ display: 'inline-block' }}
      >
        {children}
      </span>
      {visible && (
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          className={`pointer-events-none z-50 px-[12px] py-[8px] rounded-none bg-[#222] text-white text-[12px] shadow-[0_1px_3px_rgba(0,0,0,0.2)] fixed transition-opacity duration-200 opacity-90 ${className}`.trim()}
          style={{ top: coords.top, left: coords.left }}
          {...props}
        >
          <div className="absolute w-2 h-2 bg-[#222] rotate-45 -mt-1 left-1/2 -translate-x-1/2" style={{ top: '100%' }} />
          <div>{content}</div>
        </div>
      )}
    </>
  );
} 