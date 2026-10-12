import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Circle, 
  Clock, 
  CreditCard, 
  Sparkles,
  Share2
} from 'lucide-react';
import { Day } from '../types';
import { CodeBlock } from './CodeBlock';

interface DayViewerProps {
  day: Day;
  isCompleted: boolean;
  onToggleComplete: () => void;
  onPrevDay: () => void;
  onNextDay: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

export const DayViewer: React.FC<DayViewerProps> = ({
  day,
  isCompleted,
  onToggleComplete,
  onPrevDay,
  onNextDay,
  hasPrev,
  hasNext,
}) => {
  const handleShare = () => {
    const text = `I just worked on Day ${day.day}: ${day.title} in #90DaysOfCloudEngineering! ☁️🚀`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <article className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevDay}
            disabled={!hasPrev}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-700 dark:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <button
            onClick={onNextDay}
            disabled={!hasNext}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-700 dark:text-slate-300 transition-colors"
          >
            <span>Next</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Share button */}
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            title="Share milestone"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          {/* Mark Complete Button */}
          <button
            onClick={onToggleComplete}
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
              isCompleted
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-4 h-4 fill-white text-emerald-600" />
                <span>Completed</span>
              </>
            ) : (
              <>
                <Circle className="w-4 h-4" />
                <span>Mark as Done</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Day Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
            Day {day.day < 10 ? `0${day.day}` : day.day}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {day.module.title}
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <Clock className="w-3 h-3 text-amber-500" />
            {day.time}
          </span>
          {day.isPaid ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/40">
              <CreditCard className="w-3 h-3 text-amber-500" />
              Optional Paid Element
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40">
              $0 Free Tier
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {day.title}
        </h1>

        {day.goal && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <span className="font-bold text-slate-900 dark:text-white mr-2">🎯 Goal:</span>
            {day.goal}
          </div>
        )}
      </div>

      {/* Main Markdown Body Content */}
      <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-xl prose-h2:border-b prose-h2:border-slate-200 dark:prose-h2:border-slate-800 prose-h2:pb-2 prose-h2:mt-8 prose-h3:text-lg prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-semibold prose-img:rounded-xl">
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
                  language={match ? match[1] : ''}
                  value={String(children).replace(/\n$/, '')}
                />
              );
            },
            table({ children }) {
              return (
                <div className="overflow-x-auto my-6 rounded-xl border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-sm divide-y divide-slate-200 dark:divide-slate-800 my-0">
                    {children}
                  </table>
                </div>
              );
            },
            th({ children }) {
              return (
                <th className="px-4 py-3 bg-slate-100 dark:bg-slate-800/80 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {children}
                </th>
              );
            },
            td({ children }) {
              return (
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/50">
                  {children}
                </td>
              );
            },
            a({ href, children }) {
              const isExternal = href?.startsWith('http');
              return (
                <a
                  href={href}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
                >
                  {children}
                </a>
              );
            },
          }}
        >
          {day.rawContent}
        </ReactMarkdown>
      </div>

      {/* Completion celebration footer */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent border border-blue-200/50 dark:border-blue-900/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
              Finished Day {day.day}?
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Check off your progress and celebrate another step toward being job-ready!
            </p>
          </div>
        </div>

        <button
          onClick={onToggleComplete}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md ${
            isCompleted
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isCompleted ? '✓ Marked as Complete' : 'Complete Day ' + day.day}
        </button>
      </div>

      {/* Bottom Prev / Next Navigation */}
      <div className="flex items-center justify-between pt-4">
        {hasPrev ? (
          <button
            onClick={onPrevDay}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Day</span>
          </button>
        ) : <div />}

        {hasNext ? (
          <button
            onClick={onNextDay}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <span>Next Day</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : <div />}
      </div>

    </article>
  );
};
