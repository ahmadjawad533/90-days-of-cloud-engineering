import React, { useState, useMemo } from 'react';
import { Search, Book, HelpCircle } from 'lucide-react';

interface GlossaryViewerProps {
  content: string;
}

interface TermItem {
  term: string;
  definition: string;
}

export const GlossaryViewer: React.FC<GlossaryViewerProps> = ({ content }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  // Parse markdown bold terms: **Term**: Definition or **Term** - Definition
  const terms = useMemo<TermItem[]>(() => {
    const list: TermItem[] = [];
    const lines = content.split('\n');
    for (const line of lines) {
      const match = line.match(/^[-*]?\s*\*\*([^*]+)\*\*[:\s—-]+(.*)/);
      if (match) {
        list.push({
          term: match[1].trim(),
          definition: match[2].trim(),
        });
      }
    }
    return list;
  }, [content]);

  // Unique starting letters
  const letters = useMemo(() => {
    const set = new Set<string>();
    terms.forEach((t) => {
      const char = t.term[0]?.toUpperCase();
      if (char && char >= 'A' && char <= 'Z') set.add(char);
    });
    return Array.from(set).sort();
  }, [terms]);

  // Filtered terms
  const filteredTerms = useMemo(() => {
    return terms.filter((item) => {
      const matchesSearch =
        item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.definition.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesLetter = selectedLetter
        ? item.term.toUpperCase().startsWith(selectedLetter)
        : true;

      return matchesSearch && matchesLetter;
    });
  }, [terms, searchQuery, selectedLetter]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-xs font-bold text-blue-600 dark:text-blue-400">
          <Book className="w-3.5 h-3.5" />
          <span>A–Z Terminology</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Cloud Engineering Glossary
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Quick definitions for 80+ essential cloud, networking, Linux, container, and DevOps terms.
        </p>

        {/* Search input */}
        <div className="relative max-w-md pt-2">
          <Search className="w-4 h-4 absolute left-3.5 top-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search terms or definitions (e.g., VPC, Pod, CIDR)..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-colors"
          />
        </div>

        {/* Alphabet filter strip */}
        <div className="flex flex-wrap items-center gap-1 pt-1">
          <button
            onClick={() => setSelectedLetter(null)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
              selectedLetter === null
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All
          </button>
          {letters.map((char) => (
            <button
              key={char}
              onClick={() => setSelectedLetter(char === selectedLetter ? null : char)}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                selectedLetter === char
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {char}
            </button>
          ))}
        </div>
      </div>

      {/* Terms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTerms.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-500/40 transition-colors"
          >
            <div className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span>{item.term}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {item.definition}
            </p>
          </div>
        ))}

        {filteredTerms.length === 0 && (
          <div className="col-span-full p-12 text-center text-slate-500 space-y-2">
            <HelpCircle className="w-8 h-8 mx-auto text-slate-400" />
            <p className="font-semibold">No terms found matching "{searchQuery}"</p>
          </div>
        )}
      </div>

    </div>
  );
};
