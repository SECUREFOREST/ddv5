import React, { useEffect, useRef, useState } from 'react';
import Button from './Button';

/**
 * Modal component (legacy CSS)
 * @param {boolean} open - Whether the modal is open
 * @param {function} onClose - Function to call when closing
 * @param {string} title - Modal title
 * @param {React.ReactNode} children - Modal content
 * @param {React.ReactNode} actions - Modal footer actions (buttons)
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
export default function Modal({ open, onClose, title, children, actions, className = '', size = '', ...props }) {
  const [show, setShow] = useState(open);
  const overlayRef = useRef(null);

  useEffect(() => {
    if (open) setShow(true);
    else {
      // Delay unmount for fade-out
      const timeout = setTimeout(() => setShow(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!show) return null;

  // Modal size class
  let sizeClass = '';
  if (size === 'sm') sizeClass = 'modal-sm';
  else if (size === 'lg') sizeClass = 'modal-lg';

  return (
    <div className={`modal fade in ${className}`} style={{ display: open ? 'block' : 'none' }} tabIndex={-1} role="dialog" aria-modal="true" {...props}>
      <div className="modal-backdrop fade in" ref={overlayRef} onClick={onClose} aria-hidden="true" />
      <div className={`modal-dialog ${sizeClass}`} role="document">
        <div className="modal-content">
          {title && (
            <div className="modal-header">
              <button type="button" className="close" aria-label="Close" onClick={onClose}>
                <span aria-hidden="true">&times;</span>
              </button>
              <h4 className="modal-title">{title}</h4>
            </div>
          )}
          <div className="modal-body">{children}</div>
          {actions && <div className="modal-footer">{actions}</div>}
        </div>
      </div>
    </div>
  );
} 