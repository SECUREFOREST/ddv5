import React, { useState, useRef, useEffect } from 'react';

/**
 * Dropdown component
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
          <li key={item.label} className={item.disabled ? 'disabled' : ''}>
            <a
              href="#"
              className={item.disabled ? 'disabled' : ''}
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
    <div className={`dropdown${open ? ' open' : ''} ${className}`.trim()} {...props}>
      <span
        ref={triggerRef}
        className="dropdown-toggle"
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
        {trigger} <span className="caret" />
      </span>
      <ul
        ref={menuRef}
        className={`dropdown-menu${alignRight ? ' pull-right' : ''} ${menuClassName}`.trim()}
        role="menu"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        style={{ display: open ? 'block' : 'none' }}
      >
        {renderItems()}
      </ul>
    </div>
  );
} 