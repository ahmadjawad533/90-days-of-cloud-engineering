import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Compass } from 'lucide-react';
import { CodeBlock } from './CodeBlock';

interface CertificationsViewerProps {
  content: string;
}

export const CertificationsViewer: React.FC<CertificationsViewerProps> = ({ content }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-xs font-bold text-teal-600 dark:text-teal-400">
          <Compass className="w-3.5 h-3.5" />
          <span>Industry Certifications Roadmap</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Cloud Engineering Certification Guide
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Detailed breakdown of AWS, Azure, Google Cloud, Terraform, and CKA certifications with exam formats, costs, and study plans.
        </p>
      </div>

      <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-xl prose-h2:border-b prose-h2:border-slate-200 dark:prose-h2:border-slate-800 prose-h2:pb-2 prose-h2:mt-8">
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
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};
