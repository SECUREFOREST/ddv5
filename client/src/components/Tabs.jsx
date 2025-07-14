import React, { useState, useRef } from 'react';

/**
 * Tabs component (Tailwind refactor)
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
        <div className="bg-warning bg-opacity-10 text-warning p-3 rounded mb-2 text-center" role="alert">All tabs are disabled.</div>
      ) : (
        <>
          <ul className="flex border-b border-[#666] mb-4 rounded-none" role="tablist">
            {tabs.map((tab, idx) => (
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
                  className={`w-full flex-1 px-4 py-2 font-bold text-center focus:outline-none transition-colors duration-200 border-b-2
                    ${selectedIndex === idx
                      ? 'bg-[#D60B20] text-white border-[#D60B20]'
                      : tab.disabled
                        ? 'bg-[#222] text-[#888] border-transparent cursor-not-allowed'
                        : 'bg-[#222] text-[#888] border-transparent hover:bg-[#333]'}
                  `}
                  style={{ borderRadius: '0.5rem 0.5rem 0 0' }}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="bg-[#222] rounded-none p-[15px]">
            {tabs.map((tab, idx) => (
              <div
                key={tab.label}
                className={selectedIndex === idx ? '' : 'hidden'}
                id={`tabpanel-${idx}`}
                role="tabpanel"
                aria-labelledby={`tab-${idx}`}
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