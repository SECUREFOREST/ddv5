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
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity ${open ? 'opacity-100' : 'opacity-0'} ${className}`} tabIndex={-1} role="dialog" aria-modal="true" {...props}>
      <div className={`bg-white dark:bg-surface-dark rounded-lg shadow-lg w-full ${sizeClass} mx-4 relative`} role="document">
        {title && (
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h4 className="text-lg font-semibold">{title}</h4>
            <button type="button" className="text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none" aria-label="Close" onClick={onClose}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        )}
        <div className="px-6 py-4">{children}</div>
        {actions && <div className="border-t px-6 py-3 flex justify-end space-x-2">{actions}</div>}
      </div>
    </div>
  );
} 