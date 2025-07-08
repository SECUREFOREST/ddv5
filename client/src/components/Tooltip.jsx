import React, { useState, useRef, useEffect } from 'react';

/**
 * Tooltip component (legacy CSS)
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
      setCoords({ top, left });
    }
  }, [visible, position]);

  // Hide on scroll
  useEffect(() => {
    if (!visible) return;
    const hide = () => setVisible(false);
    window.addEventListener('scroll', hide, true);
    return () => window.removeEventListener('scroll', hide, true);
  }, [visible]);

  // Accessibility: show on focus/hover/click
  const show = () => setVisible(true);
  const hide = () => setVisible(false);

  return (
    <>
      <span
        ref={triggerRef}
        tabIndex={0}
        aria-describedby={visible ? 'tooltip' : undefined}
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
          id="tooltip"
          role="tooltip"
          className={`tooltip ${position} in ${className}`.trim()}
          style={{ top: coords.top, left: coords.left, position: 'absolute', opacity: 0.9, zIndex: 1070 }}
          {...props}
        >
          <div className="tooltip-arrow" />
          <div className="tooltip-inner">{content}</div>
        </div>
      )}
    </>
  );
} 