import React from 'react';
import { 
  Cloud, 
  Search, 
  Sun, 
  Moon, 
  BookOpen, 
  Terminal, 
  HelpCircle, 
  Award, 
  Menu,
  CheckCircle2
} from 'lucide-react';
import { ViewMode } from '../types';

interface NavbarProps {
  currentView: ViewMode;
  onSelectView: (view: ViewMode) => void;
  onOpenSearch: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  completedCount: number;
  totalDays: number;
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onSelectView,
  onOpenSearch,
  darkMode,
  onToggleDarkMode,
  completedCount,
  totalDays,
  onToggleSidebar,
}) => {
  const percent = Math.round((completedCount / totalDays) * 100);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Hamburger + Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors lg:hidden"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => onSelectView('curriculum')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                90 Days <span className="text-blue-600 dark:text-blue-400 font-bold">Cloud</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 -mt-1 font-medium hidden sm:block">
                Zero to Job-Ready Cloud Engineer
              </p>
            </div>
          </button>
        </div>

        {/* Center: Desktop Navigation tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/50 text-sm font-medium">
          <button
            onClick={() => onSelectView('curriculum')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentView === 'curriculum' || currentView === 'day'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Curriculum</span>
          </button>

          <button
            onClick={() => onSelectView('cheatsheets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentView === 'cheatsheets'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Cheatsheets</span>
          </button>

          <button
            onClick={() => onSelectView('interview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentView === 'interview'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Interview Qs</span>
          </button>

          <button
            onClick={() => onSelectView('glossary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentView === 'glossary'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>Glossary</span>
          </button>

          <button
            onClick={() => onSelectView('capstone')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentView === 'capstone'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Capstone</span>
          </button>
        </nav>

        {/* Right: Search + Progress + Dark Mode + GitHub */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded shadow-xs font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Progress pill */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/40 rounded-full text-xs font-semibold text-blue-700 dark:text-blue-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{completedCount}/{totalDays} Days ({percent}%)</span>
          </div>

          {/* Dark Mode toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle color theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* GitHub link */}
          <a
            href="https://github.com/ahmadjawad533/90-days-of-cloud-engineering"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="GitHub Repository"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
};
