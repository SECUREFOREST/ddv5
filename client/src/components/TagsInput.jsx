import React, { useRef, useState } from 'react';

export default function TagsInput({ value = [], onChange, placeholder = 'Add tag...', className = '', ...props }) {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  // Ensure value is always an array to prevent .map() errors
  const safeValue = Array.isArray(value) ? value : [];

  const addTag = (tag) => {
    tag = tag.trim();
    if (tag && !safeValue.some(t => t.toLowerCase() === tag.toLowerCase())) {
      onChange([...safeValue, tag]);
    }
  };

  const removeTag = (tag) => {
    onChange(safeValue.filter(t => t !== tag));
  };

  const handleInput = (e) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      addTag(input);
      setInput('');
    } else if (e.key === 'Backspace' && !input && safeValue.length > 0) {
      removeTag(safeValue[safeValue.length - 1]);
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text');
    const tags = pasted.split(/[\,\s]+/).map(t => t.trim()).filter(Boolean);
    let added = false;
    tags.forEach(tag => {
      if (tag && !safeValue.some(t => t.toLowerCase() === tag.toLowerCase())) {
        onChange([...safeValue, tag]);
        added = true;
      }
    });
    if (added) setInput('');
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 bg-neutral-900 rounded p-2 min-h-[44px] ${className}`.trim()} role="list" {...props}>
      {safeValue.map(tag => (
        <span key={tag} className="flex items-center bg-primary text-primary-contrast px-2 py-1 rounded-none text-xs font-semibold" role="listitem">
          {tag}
          <button
            type="button"
            className="ml-1 text-primary-contrast hover:text-danger-contrast focus:outline-none"
            aria-label={`Remove tag ${tag}`}
            onClick={e => { e.preventDefault(); removeTag(tag); }}
          >
            &times;
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={placeholder}
        aria-label="Add tag"
        className="outline-none border-none text-sm px-2 py-1 flex-1 min-w-[80px] text-neutral-100 bg-[#1a1a1a]"
      />
    </div>
  );
} 