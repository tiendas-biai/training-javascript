import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

// Renders markdown-style text: fenced code blocks get Prism highlighting,
// inline `code` gets styled chips, *em* / **strong** emphasis, newlines → <br>.

const FENCE_SPLIT = /(```(?:\w+)?\n[\s\S]*?```)/g;
const FENCE_MATCH = /^```(\w+)?\n([\s\S]*?)```$/;
const INLINE_CODE_SPLIT = /(`[^`\n]+`)/g;
const INLINE_CODE_MATCH = /^`([^`\n]+)`$/;
const EMPHASIS_SPLIT = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|\n)/g;

function emphasisNodes(text: string): ReactNode[] {
  return text.split(EMPHASIS_SPLIT).map((seg, i) => {
    if (seg === '\n') return <br key={i} />;
    if (seg.startsWith('**') && seg.endsWith('**')) return <strong key={i}>{seg.slice(2, -2)}</strong>;
    if (seg.startsWith('*') && seg.endsWith('*') && seg.length > 2) return <em key={i}>{seg.slice(1, -1)}</em>;
    return seg;
  });
}

// Inline code chips are split out first so * inside backticks (e.g. `s3:*`)
// is never mistaken for emphasis.
function inlineNodes(text: string): ReactNode[] {
  return text.split(INLINE_CODE_SPLIT).map((seg, i) => {
    const code = seg.match(INLINE_CODE_MATCH);
    if (code) return <code key={i} className="inline-code">{code[1]}</code>;
    return <span key={i}>{emphasisNodes(seg)}</span>;
  });
}

function CodeBlock({ lang, code }: { lang: string | undefined; code: string }) {
  const language = lang === 'js' ? 'javascript' : (lang || 'javascript');
  const grammar = Prism.languages[language] ?? Prism.languages.javascript;
  // Prism output is trusted: it highlights our own question-bank JSON.
  const html = Prism.highlight(code, grammar, language);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable (e.g. insecure context) — leave the button as-is
    }
  };

  return (
    <div className="code-block-wrap">
      <button type="button" className="copy-btn" onClick={copy} aria-label="Copy code">
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre className="code-block">
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}

export function RichText({ text }: { text: string | undefined }) {
  if (!text) return null;
  return (
    <>
      {text.split(FENCE_SPLIT).map((part, i) => {
        const fence = part.match(FENCE_MATCH);
        if (fence) return <CodeBlock key={i} lang={fence[1]} code={fence[2]} />;
        return <span key={i}>{inlineNodes(part)}</span>;
      })}
    </>
  );
}

// Plain text for search previews: strips code fences and backticks.
export function plainText(str: string | undefined): string {
  if (!str) return '';
  return str
    .replace(/```[\s\S]*?```/g, '[code]')
    .replace(/`([^`\n]+)`/g, '$1');
}
