import React from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export default function Markdown({ children, content, className = '', ...props }) {
  let md;
  if (typeof children === 'string') {
    md = children;
    if (content && process.env.NODE_ENV === 'development') {
      console.warn('Markdown: both children and content provided; using children.');
    }
  } else {
    md = content || '';
  }
  const html = React.useMemo(() => {
    const raw = marked.parse(md, { breaks: true });
    return DOMPurify.sanitize(raw, { FORBID_TAGS: ['style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'script'], FORBID_ATTR: ['style', 'onerror', 'onclick', 'onload', 'onmouseover', 'onfocus', 'onblur'] });
  }, [md]);

  return (
    <div
      className={`well ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
      {...props}
    />
  );
} 