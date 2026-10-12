import React, { useState, useMemo } from 'react';
import { HelpCircle, ChevronDown, ChevronRight, Eye, EyeOff, Search } from 'lucide-react';

interface InterviewViewerProps {
  content: string;
}

interface QuestionItem {
  id: number;
  category: string;
  question: string;
  answer: string;
}

export const InterviewViewer: React.FC<InterviewViewerProps> = ({ content }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Parse questions from markdown:
  // ## Category Name
  // ### 1. Question?
  // Answer paragraphs...
  const questions = useMemo<QuestionItem[]>(() => {
    const list: QuestionItem[] = [];
    const sections = content.split(/^##\s+/m);

    let counter = 1;
    for (const section of sections) {
      if (!section.trim()) continue;
      const lines = section.split('\n');
      const category = lines[0].trim();

      const qBlocks = section.split(/^###\s+/m);
      for (const qBlock of qBlocks.slice(1)) {
        const qLines = qBlock.split('\n');
        const question = qLines[0].replace(/^\d+[\.\)]\s*/, '').trim();
        const answer = qLines.slice(1).join('\n').trim();

        if (question && answer) {
          list.push({
            id: counter++,
            category,
            question,
            answer,
          });
        }
      }
    }

    return list;
  }, [content]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    questions.forEach((q) => set.add(q.category));
    return ['All', ...Array.from(set)];
  }, [questions]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchCat = activeCategory === 'All' || q.category === activeCategory;
      const matchSearch =
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [questions, activeCategory, searchQuery]);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const map: Record<number, boolean> = {};
    filteredQuestions.forEach((q) => {
      map[q.id] = true;
    });
    setExpandedIds(map);
  };

  const collapseAll = () => {
    setExpandedIds({});
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-xs font-bold text-blue-600 dark:text-blue-400">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Active Recall & Interview Readiness</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          70+ Cloud Engineering Interview Questions
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Test your conceptual understanding across networking, Linux, AWS, containers, IaC, CI/CD, and behavioral scenarios.
        </p>

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search interview questions..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={expandAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Expand All</span>
            </button>
            <button
              onClick={collapseAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Collapse All</span>
            </button>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex flex-wrap gap-1.5 pt-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Questions Accordion List */}
      <div className="space-y-3">
        {filteredQuestions.map((q) => {
          const isOpen = !!expandedIds[q.id];

          return (
            <div
              key={q.id}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs transition-colors"
            >
              <button
                onClick={() => toggleExpand(q.id)}
                className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {q.category}
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {q.id}. {q.question}
                  </h3>
                </div>

                <div className="shrink-0 p-1 text-slate-400">
                  {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-sm text-slate-700 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
                  <div className="pt-3 font-medium whitespace-pre-line">
                    {q.answer}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredQuestions.length === 0 && (
          <div className="p-12 text-center text-slate-500 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <p className="font-semibold">No questions found matching your filter.</p>
          </div>
        )}
      </div>

    </div>
  );
};
