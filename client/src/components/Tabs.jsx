import React, { useState, useRef } from 'react';

/**
 * Tabs component (legacy CSS)
 * @param {Array<{label: string, content: React.ReactNode, disabled?: boolean}>} tabs - Tab definitions
 * @param {number} value - Controlled selected tab index
 * @param {function} onChange - Controlled tab change handler
 * @param {string} className - Additional classes
 * @param {object} props - Other props
 */
export default function Tabs({
  tabs = [],
  value,
  onChange,
  className = '',
  ...props
}) {
  const isControlled = value !== undefined && onChange;
  const [selected, setSelected] = useState(0);
  const selectedIndex = isControlled ? value : selected;
  const tabRefs = useRef([]);

  const handleTabClick = (idx) => {
    if (tabs[idx]?.disabled) return;
    if (isControlled) onChange(idx);
    else setSelected(idx);
  };

  const allDisabled = tabs.length > 0 && tabs.every(tab => tab.disabled);

  const handleKeyDown = (e) => {
    if (allDisabled) return;
    let idx = selectedIndex;
    if (e.key === 'ArrowRight') {
      do { idx = (idx + 1) % tabs.length; } while (tabs[idx]?.disabled);
      handleTabClick(idx);
      tabRefs.current[idx]?.focus();
    } else if (e.key === 'ArrowLeft') {
      do { idx = (idx - 1 + tabs.length) % tabs.length; } while (tabs[idx]?.disabled);
      handleTabClick(idx);
      tabRefs.current[idx]?.focus();
    }
  };

  return (
    <div className={className} {...props}>
      {allDisabled ? (
        <div className="alert alert-warning" role="alert">All tabs are disabled.</div>
      ) : (
        <>
          <ul className="nav nav-tabs" role="tablist">
            {tabs.map((tab, idx) => (
              <li key={tab.label} className={selectedIndex === idx ? 'active' : tab.disabled ? 'disabled' : ''} role="presentation">
                <a
                  ref={el => tabRefs.current[idx] = el}
                  href="#"
                  role="tab"
                  aria-selected={selectedIndex === idx}
                  aria-controls={`tabpanel-${idx}`}
                  id={`tab-${idx}`}
                  tabIndex={selectedIndex === idx ? 0 : -1}
                  onClick={e => { e.preventDefault(); handleTabClick(idx); }}
                  onKeyDown={handleKeyDown}
                  style={tab.disabled ? { pointerEvents: 'none', color: '#888', cursor: 'not-allowed' } : {}}
                >
                  {tab.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="tab-content">
            {tabs.map((tab, idx) => (
              <div
                key={tab.label}
                className={`tab-pane${selectedIndex === idx ? ' active' : ''}`}
                id={`tabpanel-${idx}`}
                role="tabpanel"
                aria-labelledby={`tab-${idx}`}
                style={{ display: selectedIndex === idx ? 'block' : 'none', background: 'transparent', padding: 15 }}
              >
                {selectedIndex === idx && tab.content}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
} 