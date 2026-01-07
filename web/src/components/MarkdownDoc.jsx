import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';
import { Link } from 'react-router-dom';
import { Home, FileText, Copy, Check, ChevronUp, Languages } from 'lucide-react';

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#3b82f6',
    primaryTextColor: '#f8fafc',
    primaryBorderColor: '#64748b',
    lineColor: '#64748b',
    secondaryColor: '#1e293b',
    tertiaryColor: '#334155',
    background: '#0f172a',
    mainBkg: '#1e293b',
    nodeBorder: '#64748b',
    clusterBkg: '#1e293b',
    titleColor: '#f8fafc',
    edgeLabelBackground: '#1e293b',
  },
  flowchart: { htmlLabels: true, curve: 'basis' },
});

// Custom code block component with copy button and mermaid support
function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false);
  const mermaidRef = useRef(null);
  const [mermaidSvg, setMermaidSvg] = useState('');
  const codeString = String(children).replace(/\n$/, '');
  const language = className?.replace('language-', '') || '';

  useEffect(() => {
    if (language === 'mermaid' && mermaidRef.current) {
      mermaid.render(`mermaid-${Date.now()}`, codeString)
        .then(({ svg }) => setMermaidSvg(svg))
        .catch(console.error);
    }
  }, [codeString, language]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (language === 'mermaid') {
    return (
      <div
        ref={mermaidRef}
        className="my-4 p-4 bg-slate-800 rounded-lg overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: mermaidSvg }}
      />
    );
  }

  return (
    <div className="relative group my-4">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 p-1.5 bg-slate-700 hover:bg-slate-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        title="Copy code"
      >
        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
      </button>
      {language && (
        <span className="absolute left-3 top-2 text-xs text-slate-500 font-mono">{language}</span>
      )}
      <pre className="bg-slate-800 rounded-lg p-4 pt-8 overflow-x-auto">
        <code className={`${className || ''} text-sm font-mono text-slate-300`}>{children}</code>
      </pre>
    </div>
  );
}

// Custom markdown components
const markdownComponents = {
  h1: ({ children }) => (
    <h1 className="text-3xl font-bold text-white mt-8 mb-4 pb-2 border-b border-slate-700">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-2xl font-bold text-white mt-6 mb-3 pb-1 border-b border-slate-800">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-xl font-semibold text-slate-100 mt-5 mb-2">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-lg font-semibold text-slate-200 mt-4 mb-2">{children}</h4>
  ),
  p: ({ children }) => <p className="text-slate-300 mb-4 leading-relaxed">{children}</p>,
  ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1 text-slate-300">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1 text-slate-300">{children}</ol>,
  li: ({ children }) => <li className="text-slate-300">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic text-slate-400">{children}</blockquote>
  ),
  a: ({ href, children }) => (
    <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full divide-y divide-slate-700">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="px-4 py-2 text-left text-sm font-semibold text-slate-200 bg-slate-800">{children}</th>
  ),
  td: ({ children }) => (
    <td className="px-4 py-2 text-sm text-slate-300 border-t border-slate-700">{children}</td>
  ),
  code: ({ inline, className, children }) => {
    if (inline) {
      return <code className="bg-slate-700 px-1.5 py-0.5 rounded text-sm font-mono text-blue-300">{children}</code>;
    }
    return <CodeBlock className={className}>{children}</CodeBlock>;
  },
  pre: ({ children }) => <>{children}</>,
  hr: () => <hr className="my-8 border-slate-700" />,
  strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
  em: ({ children }) => <em className="text-slate-200">{children}</em>,
};

/**
 * MarkdownDoc Component
 *
 * Renders markdown documentation with:
 * - Bilingual support (EN/SR)
 * - Mermaid diagram rendering
 * - Code syntax highlighting
 * - Copy code button
 * - Table of contents (optional)
 *
 * @param {string} content - Markdown content (EN)
 * @param {string} contentSr - Markdown content (SR) - optional
 * @param {string} title - Document title
 * @param {string} backLink - Link for back navigation (default: '/')
 * @param {string} backLabel - Label for back link (default: 'Home')
 * @param {boolean} showToc - Show table of contents (default: false)
 */
export default function MarkdownDoc({
  content,
  contentSr = null,
  title,
  backLink = '/',
  backLabel = 'Home',
  showToc = false,
}) {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith('sr') ? 'sr' : 'en';
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Select content based on language
  const displayContent = lang === 'sr' && contentSr ? contentSr : content;

  // Handle scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Toggle language
  const toggleLanguage = () => {
    i18n.changeLanguage(lang === 'sr' ? 'en' : 'sr');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to={backLink} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <Home className="w-5 h-5" />
            <span>{backLabel}</span>
          </Link>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            {title}
          </h1>
          {contentSr && (
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg transition-colors"
            >
              <Languages className="w-4 h-4" />
              {lang === 'sr' ? 'EN' : 'SR'}
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <article className="prose prose-invert prose-slate max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {displayContent}
          </ReactMarkdown>
        </article>
      </main>

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all"
          title="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </button>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-8 text-center text-slate-500 text-sm">
          &copy; 2026 Elektrokombinacija. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
