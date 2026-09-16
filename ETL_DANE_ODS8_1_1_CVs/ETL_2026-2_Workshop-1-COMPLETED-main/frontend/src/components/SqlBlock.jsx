import React, { useMemo, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { format } from 'sql-formatter';
import { Copy, Check, TerminalSquare, ChevronDown } from 'lucide-react';

export default function SqlBlock({ sql, defaultOpen = false, title = 'Consulta SQL' }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(defaultOpen);

  const pretty = useMemo(() => {
    try {
      return format(sql.trim(), { language: 'postgresql', tabWidth: 2 });
    } catch {
      return sql.trim();
    }
  }, [sql]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pretty);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={`sql-card ${open ? 'open' : ''}`}>
      <button className="sql-head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className="sql-dots">
          <span className="sql-dot" style={{ background: '#f87171' }} />
          <span className="sql-dot" style={{ background: '#fbbf24' }} />
          <span className="sql-dot" style={{ background: '#34d399' }} />
        </span>
        <TerminalSquare size={16} />
        <span className="sql-title">{title}</span>
        <span className="sql-lang">PostgreSQL</span>
        <span
          className="copy-btn"
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            copy();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.stopPropagation();
              copy();
            }
          }}
          title="Copiar SQL"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copiado' : 'Copiar'}
        </span>
        <ChevronDown size={16} className={`chev ${open ? 'rot' : ''}`} />
      </button>
      {open && (
        <div className="sql-code">
          <SyntaxHighlighter
            language="sql"
            style={vscDarkPlus}
            customStyle={{ margin: 0, background: 'transparent', fontSize: 12.8, lineHeight: 1.65, padding: '14px 16px 16px' }}
            codeTagProps={{ style: { fontFamily: "'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace" } }}
          >
            {pretty}
          </SyntaxHighlighter>
        </div>
      )}
    </div>
  );
}
