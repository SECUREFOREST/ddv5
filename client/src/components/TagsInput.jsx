import React, { useRef, useState } from 'react';

export default function TagsInput({ value = [], onChange, placeholder = 'Add tag...', className = '', ...props }) {
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  const addTag = (tag) => {
    tag = tag.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
  };

  const removeTag = (tag) => {
    onChange(value.filter(t => t !== tag));
  };

  const handleInput = (e) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      addTag(input);
      setInput('');
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <div className={`tagsinput ${className}`.trim()} {...props}>
      {value.map(tag => (
        <span key={tag} className="tag">
          {tag}
          <a
            href="#remove"
            style={{ marginLeft: 4, textDecoration: 'none', cursor: 'pointer' }}
            aria-label={`Remove tag ${tag}`}
            onClick={e => { e.preventDefault(); removeTag(tag); }}
          >
            &times;
          </a>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label="Add tag"
        style={{ border: '1px solid transparent', padding: 5, background: 'transparent', color: '#000', outline: 0, marginRight: 5, marginBottom: 5, width: 80 }}
      />
      <div className="tags_clear" />
    </div>
  );
} 