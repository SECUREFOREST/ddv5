import React, { useEffect, useRef, useState } from 'react';
import Button from './Button';

/**
 * Modal component (Tailwind refactor)
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
  let sizeClass = 'max-w-lg';
  if (size === 'sm') sizeClass = 'max-w-sm';
  else if (size === 'lg') sizeClass = 'max-w-2xl';

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${open ? 'opacity-100' : 'opacity-0'} ${className}`} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={title ? 'modal-title' : undefined} {...props}>
      <section className={`bg-[#202020] border border-[#999] rounded-none shadow-[0_3px_9px_rgba(0,0,0,0.5)] w-full ${sizeClass} mx-4 relative`} role="document">
        {title && (
          <div className="flex items-center justify-between border-b border-[#282828] px-[15px] py-[15px] -mx-[15px] mt-[-15px]">
            <h2 id="modal-title" className="text-lg font-semibold text-primary">{title}</h2>
            <button type="button" className="text-neutral-400 hover:text-neutral-100 text-2xl font-bold focus:outline-none" aria-label="Close" onClick={onClose}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        )}
        <div className="p-[20px]">{children}</div>
        {actions && <div className="border-t border-[#282828] px-[15px] py-[15px] -mx-[15px] mb-[-15px] flex justify-end space-x-2">{actions}</div>}
      </section>
    </div>
  );
}

// Banner component for error/success/info feedback
export function Banner({ type = 'info', message = '', onClose }) {
  if (!message) return null;
  let bg = 'bg-info text-info-contrast';
  if (type === 'error') bg = 'bg-danger text-danger-contrast';
  if (type === 'success') bg = 'bg-success text-success-contrast';
  if (type === 'warning') bg = 'bg-warning text-warning-contrast';
  return (
    <div className={`w-full px-4 py-3 mb-4 rounded flex items-center justify-between ${bg}`} role="alert" aria-live="assertive">
      <span>{message}</span>
      {onClose && (
        <button className="ml-4 text-lg font-bold focus:outline-none" onClick={onClose} aria-label="Close">&times;</button>
      )}
    </div>
  );
} 