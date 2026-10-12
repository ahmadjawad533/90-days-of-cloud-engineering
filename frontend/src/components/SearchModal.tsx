import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, BookOpen, Terminal, ArrowRight } from 'lucide-react';
import { Day, Cheatsheet } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  days: Day[];
  cheatsheets: Cheatsheet[];
  onSelectDay: (dayNum: number) => void;
  onSelectCheatsheet: (id: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  days,
  cheatsheets,
  onSelectDay,
  onSelectCheatsheet,
}) => {
  const [query, setQuery] = useState('');

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or focus
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const results = useMemo(() => {
    if (!query.trim()) return { matchedDays: [] as Day[], matchedSheets: [] as Cheatsheet[] };
    const q = query.toLowerCase();

    const matchedDays = days
      .filter((d) => 
        d.title.toLowerCase().includes(q) || 
        d.goal.toLowerCase().includes(q) || 
        `day ${d.day}`.includes(q) ||
        d.module.title.toLowerCase().includes(q)
      )
      .slice(0, 8);

    const matchedSheets = cheatsheets
      .filter((c) => c.title.toLowerCase().includes(q) || c.content.toLowerCase().includes(q))
      .slice(0, 3);

    return { matchedDays, matchedSheets };
  }, [query, days, cheatsheets]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-100"
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search lessons, cheatsheets, tools (e.g., Docker, Terraform, VPC)..."
            className="w-full bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 space-y-4 flex-1">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-xs text-slate-400 space-y-1">
              <p>Type keywords to search across all 95 curriculum days and CLI cheatsheets.</p>
              <p>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono">ESC</kbd> to close.</p>
            </div>
          ) : (
            <>
              {/* Day Results */}
              {results.matchedDays.length > 0 && (
                <div className="space-y-1">
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Curriculum Days</span>
                  </div>
                  {results.matchedDays.map((d) => (
                    <button
                      key={d.day}
                      onClick={() => {
                        onSelectDay(d.day);
                        onClose();
                      }}
                      className="w-full p-2.5 rounded-xl text-left flex items-center justify-between hover:bg-blue-50 dark:hover:bg-blue-950/40 group transition-colors"
                    >
                      <div className="min-w-0 pr-3">
                        <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                          Day {d.day}: {d.title}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {d.module.title} • {d.goal}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ))}
                </div>
              )}

              {/* Cheatsheets Results */}
              {results.matchedSheets.length > 0 && (
                <div className="space-y-1">
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Cheatsheets</span>
                  </div>
                  {results.matchedSheets.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onSelectCheatsheet(c.id);
                        onClose();
                      }}
                      className="w-full p-2.5 rounded-xl text-left flex items-center justify-between hover:bg-blue-50 dark:hover:bg-blue-950/40 group transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                          {c.title}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {results.matchedDays.length === 0 && results.matchedSheets.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-500">
                  No matching results found for "{query}".
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
