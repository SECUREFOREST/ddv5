import React, { useState, useRef, useEffect } from 'react';

/**
 * Dropdown component (Tailwind refactor)
 * @param {React.ReactNode} trigger - The element that toggles the dropdown
 * @param {React.ReactNode[]} items - Array of menu items (can be elements or objects with label/onClick)
 * @param {string} className - Additional classes for the menu
 * @param {string} menuClassName - Additional classes for the dropdown menu
 * @param {boolean} alignRight - Align menu to the right
 * @param {object} props - Other props
 */
export default function Dropdown({
  trigger,
  items = [],
  className = '',
  menuClassName = '',
  alignRight = false,
  ...props
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Close on outside click
  useEffect(() => {
    setMenuOpen(open);
  }, [open]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!open) return;
    const focusable = menuRef.current?.querySelectorAll('button:not(:disabled),a:not(:disabled)');
    if (!focusable || !focusable.length) return;
    const idx = Array.from(focusable).indexOf(document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (idx + 1) % focusable.length;
      focusable[next].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = (idx - 1 + focusable.length) % focusable.length;
      focusable[prev].focus();
    }
  };

  // Render menu items
  const renderItems = () =>
    items.map((item, idx) => {
      if (React.isValidElement(item)) {
        return React.cloneElement(item, { key: idx, tabIndex: 0 });
      } else if (typeof item === 'object' && item.label) {
        return (
          <li key={item.label} className={item.disabled ? 'opacity-50 cursor-not-allowed' : ''}>
            <a
              href="#"
              className={`block px-4 py-2 text-sm text-neutral-100 hover:bg-neutral-900 rounded transition-colors ${item.disabled ? 'pointer-events-none' : ''}`}
              onClick={e => {
                e.preventDefault();
                setOpen(false);
                if (!item.disabled) item.onClick?.(e);
              }}
              tabIndex={0}
            >
              {item.label}
            </a>
          </li>
        );
      } else {
        return null;
      }
    });

  return (
    <div className={`relative inline-block ${className}`.trim()} {...props}>
      <span
        ref={triggerRef}
        className="cursor-pointer select-none"
        onClick={() => setOpen(v => !v)}
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(v => !v);
          }
        }}
        aria-haspopup="true"
        aria-expanded={open}
        role="button"
      >
        {trigger} <span className="ml-1">▼</span>
      </span>
      <ul
        ref={menuRef}
        className={`absolute z-50 mt-2 min-w-[160px] bg-neutral-800 border border-neutral-900 rounded shadow-lg py-1 ${alignRight ? 'right-0' : 'left-0'} ${open ? '' : 'hidden'} ${menuClassName}`.trim()}
        role="menu"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        {renderItems()}
      </ul>
    </div>
  );
} 