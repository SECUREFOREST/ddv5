import React, { useState, useRef } from 'react';

/**
 * Tabs component (Tailwind refactor with improved UX)
 * @param {Array<{label: string, content: React.ReactNode, disabled?: boolean, icon?: React.Component}>} tabs - Tab definitions
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
        <div className="bg-warning bg-opacity-10 text-warning p-3 rounded mb-2 text-center" role="alert">All tabs are disabled.</div>
      ) : (
        <>
          {/* Tab bar with improved styling */}
          <div className="relative mb-6">
            <ul className="flex z-10 relative bg-neutral-900/60 rounded-xl p-1 border border-neutral-800/50" role="tablist">
              {tabs.map((tab, idx) => {
                const Icon = tab.icon;
                return (
                  <li key={tab.label} className="flex-1" role="presentation">
                    <button
                      ref={el => tabRefs.current[idx] = el}
                      type="button"
                      role="tab"
                      aria-selected={selectedIndex === idx}
                      aria-controls={`tabpanel-${idx}`}
                      id={`tab-${idx}`}
                      tabIndex={selectedIndex === idx ? 0 : -1}
                      onClick={() => handleTabClick(idx)}
                      onKeyDown={handleKeyDown}
                      disabled={tab.disabled}
                      className={`w-full flex-grow px-4 py-3 font-semibold text-center focus:outline-none transition-all duration-200 whitespace-nowrap rounded-lg
                        ${selectedIndex === idx
                          ? 'bg-gradient-to-r from-primary to-primary-dark text-primary-contrast shadow-lg'
                          : 'text-neutral-300 hover:text-white hover:bg-neutral-800/50'
                        }
                        ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {Icon && <Icon className="w-4 h-4" />}
                        <span className="hidden sm:inline">{tab.label}</span>
                        <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          
          {/* Tab content with improved styling */}
          <div className="bg-neutral-900/40 rounded-xl border border-neutral-800/30">
            {tabs.map((tab, idx) => (
              <div
                key={tab.label}
                className={selectedIndex === idx ? 'block' : 'hidden'}
                id={`tabpanel-${idx}`}
                role="tabpanel"
                aria-labelledby={`tab-${idx}`}
              >
                {selectedIndex === idx && (
                  <div className="p-6">
                    {tab.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
} 