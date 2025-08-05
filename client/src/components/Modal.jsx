import React, { useEffect, useRef, useState, useId } from 'react';
import { useEventListener } from '../utils/memoryLeakPrevention';
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
  const generatedId = typeof useId === 'function' ? useId() : 'modal-title-' + Math.random().toString(36).slice(2, 10);
  const titleId = generatedId;
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

  // Memory-safe event listener for keyboard handling
  const { addEventListener, removeEventListener } = useEventListener();
  
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    addEventListener(document, 'keydown', handleKey);
    return () => removeEventListener(document, 'keydown', handleKey);
  }, [open, onClose, addEventListener, removeEventListener]);

  if (!show) return null;

  // Modal size class
  let sizeClass = 'max-w-lg';
  if (size === 'sm') sizeClass = 'max-w-sm';
  else if (size === 'lg') sizeClass = 'max-w-2xl';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="bg-neutral-900 rounded-lg max-w-lg w-full p-6 relative">
        <button
          type="button"
          className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-100"
          onClick={onClose}
          aria-label="Close modal"
        >
          &times;
        </button>
        <h2 id={titleId} className="text-xl font-bold mb-4">{title}</h2>
        {children}
      </div>
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
        <button className="ml-4 text-lg font-bold focus:outline-none shadow-lg" onClick={onClose} aria-label="Close">&times;</button>
      )}
    </div>
  );
} 