import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Terminal, Copy, Check } from 'lucide-react';
import { Cheatsheet } from '../types';
import { CodeBlock } from './CodeBlock';

interface CheatsheetsViewerProps {
  cheatsheets: Cheatsheet[];
}

export const CheatsheetsViewer: React.FC<CheatsheetsViewerProps> = ({ cheatsheets }) => {
  const [activeId, setActiveId] = useState<string>(cheatsheets[0]?.id || 'linux');
  const [copiedAll, setCopiedAll] = useState(false);

  const activeSheet = cheatsheets.find((c) => c.id === activeId) || cheatsheets[0];

  const handleCopyFullSheet = () => {
    if (!activeSheet) return;
    navigator.clipboard.writeText(activeSheet.content);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  if (!activeSheet) {
    return <div className="p-8 text-center text-slate-500">No cheatsheets found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-xs font-bold text-blue-600 dark:text-blue-400">
          <Terminal className="w-3.5 h-3.5" />
          <span>Quick Reference Guides</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Cloud Engineering CLI Cheatsheets
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Concise, printable command references for Linux, Git, Docker, Kubernetes, Terraform, and the AWS CLI.
        </p>

        {/* Cheatsheet Selection Tabs */}
        <div className="pt-2 flex flex-wrap gap-2">
          {cheatsheets.map((sheet) => (
            <button
              key={sheet.id}
              onClick={() => setActiveId(sheet.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all ${
                activeId === sheet.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-[1.02]'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {sheet.id}
            </button>
          ))}
        </div>
      </div>

      {/* Cheatsheet Content Card */}
      <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="font-mono text-blue-600 dark:text-blue-400">#</span>
            {activeSheet.title}
          </h2>

          <button
            onClick={handleCopyFullSheet}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAll ? 'Copied Markdown' : 'Copy All'}</span>
          </button>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-lg prose-h2:border-b prose-h2:border-slate-200 dark:prose-h2:border-slate-800 prose-h2:pb-1 prose-h2:mt-6 prose-a:text-blue-600">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const isInline = !match && !String(children).includes('\n');
                if (isInline) {
                  return (
                    <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-mono text-xs font-semibold" {...props}>
                      {children}
                    </code>
                  );
                }
                return (
                  <CodeBlock
                    language={match ? match[1] : 'bash'}
                    value={String(children).replace(/\n$/, '')}
                  />
                );
              },
              table({ children }) {
                return (
                  <div className="overflow-x-auto my-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-left text-xs sm:text-sm divide-y divide-slate-200 dark:divide-slate-800 my-0">
                      {children}
                    </table>
                  </div>
                );
              },
              th({ children }) {
                return (
                  <th className="px-3 py-2 bg-slate-100 dark:bg-slate-800 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {children}
                  </th>
                );
              },
              td({ children }) {
                return (
                  <td className="px-3 py-2 text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800">
                    {children}
                  </td>
                );
              },
            }}
          >
            {activeSheet.content}
          </ReactMarkdown>
        </div>
      </div>

    </div>
  );
};
