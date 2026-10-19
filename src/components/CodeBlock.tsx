'use client';
import { useState } from 'react';
export default function CodeBlock({ title, code, lang }: { title: string; code: string; lang: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--app-border)] text-xs"><span>{title} <span className="muted">· {lang} · {code.length.toLocaleString()} chars</span></span><button className="btn btn-sm" onClick={async () => { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1200); }}>{copied ? 'Copied' : 'Copy'}</button></div>
      <pre className="code p-3 overflow-auto max-h-80 whitespace-pre-wrap break-words text-[var(--app-text)]">{code}</pre>
    </div>
  );
}
