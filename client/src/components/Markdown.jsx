import React from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export default function Markdown({ children, content, className = '', ...props }) {
  const md = typeof children === 'string' ? children : content || '';
  const html = React.useMemo(() => {
    const raw = marked.parse(md, { breaks: true });
    return DOMPurify.sanitize(raw);
  }, [md]);

  return (
    <div
      className={`well ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: html }}
      {...props}
    />
  );
} 