import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

// Helper to format inline bold, link, and code styles
function renderInlineContent(text: string): React.ReactNode[] {
  // Regex matches:
  // 1. **bold**
  // 2. [text](url)
  // 3. `code`
  const regex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\)|`[^`]+`)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="text-[var(--gp-text-strong)] font-semibold">
          {boldText}
        </strong>
      );
    }

    if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (match) {
        return (
          <a
            key={index}
            href={match[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--gp-brand-light)] hover:underline font-medium"
          >
            {match[1]}
          </a>
        );
      }
    }

    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded bg-[var(--gp-secondary)] text-[var(--gp-text-strong)] text-[11px] font-mono border border-[var(--gp-divider)]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let currentList: { text: string; key: number }[] = [];
  let elementKey = 0;

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`list-${elementKey++}`} className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-[var(--gp-text-muted)] leading-relaxed my-2">
          {currentList.map((item) => (
            <li key={item.key} className="pl-1">
              {renderInlineContent(item.text)}
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      flushList();
      continue;
    }

    // Check for Image syntax: ![alt](url)
    const imageMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imageMatch) {
      flushList();
      const altText = imageMatch[1];
      const imageUrl = imageMatch[2];

      elements.push(
        <div key={`img-${elementKey++}`} className="pt-3 max-w-2xl my-2">
          <div className="rounded-xl overflow-hidden border border-[var(--gp-divider)] bg-[var(--gp-rail)] shadow-md">
            <img
              src={imageUrl}
              alt={altText || 'Screenshot'}
              className="w-full h-auto object-cover hover:scale-[1.01] transition-transform duration-300"
            />
            {altText && (
              <div className="px-4 py-2.5 bg-[var(--gp-floating)] border-t border-[var(--gp-divider)] flex items-center justify-between text-xs text-[var(--gp-text-muted)]">
                <span className="font-medium text-[11px] sm:text-xs">
                  {altText}
                </span>
                <span className="text-[10px] font-mono opacity-75">Preview</span>
              </div>
            )}
          </div>
        </div>
      );
      continue;
    }

    // Check for Header 1: # Title
    if (trimmed.startsWith('# ')) {
      flushList();
      const title = trimmed.replace(/^#\s+/, '');
      elements.push(
        <div key={`h1-${elementKey++}`} className="space-y-2 pb-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--gp-text-strong)] tracking-tight">
            {renderInlineContent(title)}
          </h1>
        </div>
      );
      continue;
    }

    // Check for Header 2: ## Section Title
    if (trimmed.startsWith('## ')) {
      flushList();
      const sectionTitle = trimmed.replace(/^##\s+/, '');
      elements.push(
        <div key={`h2-${elementKey++}`} className="pt-6 border-t border-[var(--gp-divider)] mt-6">
          <h2 className="text-base sm:text-lg font-bold text-[var(--gp-text-strong)]">
            {renderInlineContent(sectionTitle)}
          </h2>
        </div>
      );
      continue;
    }

    // Check for Header 3: ### Subtitle
    if (trimmed.startsWith('### ')) {
      flushList();
      const subTitle = trimmed.replace(/^###\s+/, '');
      elements.push(
        <h3 key={`h3-${elementKey++}`} className="text-sm sm:text-base font-semibold text-[var(--gp-text-strong)] mt-4 mb-1">
          {renderInlineContent(subTitle)}
        </h3>
      );
      continue;
    }

    // Check for Blockquote: > text
    if (trimmed.startsWith('> ')) {
      flushList();
      const quoteText = trimmed.replace(/^>\s+/, '');
      elements.push(
        <div
          key={`quote-${elementKey++}`}
          className="border-l-4 border-[var(--gp-brand-light)] bg-[var(--gp-secondary-alt)] px-4 py-2.5 rounded-r-lg text-xs sm:text-sm text-[var(--gp-text)] my-2"
        >
          {renderInlineContent(quoteText)}
        </div>
      );
      continue;
    }

    // Check for List item: * text or - text
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const itemText = trimmed.replace(/^[\*\-]\s+/, '');
      currentList.push({ text: itemText, key: elementKey++ });
      continue;
    }

    // Check for Horizontal Rule: ---
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      flushList();
      elements.push(
        <hr key={`hr-${elementKey++}`} className="border-t border-[var(--gp-divider)] my-6" />
      );
      continue;
    }

    // Normal Paragraph
    flushList();
    elements.push(
      <p key={`p-${elementKey++}`} className="text-xs sm:text-sm text-[var(--gp-text)] leading-relaxed my-1.5">
        {renderInlineContent(trimmed)}
      </p>
    );
  }

  flushList();

  return <div className="space-y-1">{elements}</div>;
}
