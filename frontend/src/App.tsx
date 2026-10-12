import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CurriculumData, ViewMode } from './types';
import curriculumDataJson from './data/curriculum.json';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { DayViewer } from './components/DayViewer';
import { CheatsheetsViewer } from './components/CheatsheetsViewer';
import { GlossaryViewer } from './components/GlossaryViewer';
import { InterviewViewer } from './components/InterviewViewer';
import { CapstoneViewer } from './components/CapstoneViewer';
import { CertificationsViewer } from './components/CertificationsViewer';
import { SearchModal } from './components/SearchModal';

const curriculumData = curriculumDataJson as CurriculumData;

export function App() {
  // Navigation & View state
  const [currentView, setCurrentView] = useState<ViewMode>('curriculum');
  const [selectedDayNum, setSelectedDayNum] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('cloud_engineering_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // User progress state persisted in localStorage
  const [completedDays, setCompletedDays] = useState<number[]>(() => {
    const saved = localStorage.getItem('cloud_engineering_completed_days');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('cloud_engineering_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('cloud_engineering_theme', 'light');
    }
  }, [darkMode]);

  // Persist completed days
  useEffect(() => {
    localStorage.setItem('cloud_engineering_completed_days', JSON.stringify(completedDays));
  }, [completedDays]);

  // Global Ctrl+K / Cmd+K search listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectDay = (dayNum: number) => {
    setSelectedDayNum(dayNum);
    setCurrentView('day');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleDayComplete = (dayNum: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setCompletedDays((prev) => {
      const isAlreadyDone = prev.includes(dayNum);
      if (isAlreadyDone) {
        return prev.filter((d) => d !== dayNum);
      } else {
        // Trigger celebratory confetti on completing a day!
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.8 },
        });
        return [...prev, dayNum];
      }
    });
  };

  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset all checked days? This cannot be undone.')) {
      setCompletedDays([]);
    }
  };

  const currentDay = curriculumData.days.find((d) => d.day === selectedDayNum) || curriculumData.days[0];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Navbar */}
      <Navbar
        currentView={currentView}
        onSelectView={(view) => {
          setCurrentView(view);
          if (view === 'curriculum') {
            setSelectedDayNum(null);
          }
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
        completedCount={completedDays.length}
        totalDays={curriculumData.days.length}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      {/* Main Content Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar (available on curriculum and day views) */}
        {(currentView === 'curriculum' || currentView === 'day') && (
          <Sidebar
            modules={curriculumData.modules}
            days={curriculumData.days}
            selectedDayNum={selectedDayNum}
            onSelectDay={handleSelectDay}
            completedDays={completedDays}
            onToggleDayComplete={handleToggleDayComplete}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-hidden">
          {currentView === 'curriculum' && selectedDayNum === null && (
            <Dashboard
              modules={curriculumData.modules}
              days={curriculumData.days}
              completedDays={completedDays}
              onSelectDay={handleSelectDay}
              onResetProgress={handleResetProgress}
            />
          )}

          {currentView === 'day' && currentDay && (
            <DayViewer
              day={currentDay}
              isCompleted={completedDays.includes(currentDay.day)}
              onToggleComplete={() => handleToggleDayComplete(currentDay.day)}
              onPrevDay={() => {
                if (currentDay.day > 1) handleSelectDay(currentDay.day - 1);
              }}
              onNextDay={() => {
                if (currentDay.day < curriculumData.days.length) handleSelectDay(currentDay.day + 1);
              }}
              hasPrev={currentDay.day > 1}
              hasNext={currentDay.day < curriculumData.days.length}
            />
          )}

          {currentView === 'cheatsheets' && (
            <CheatsheetsViewer cheatsheets={curriculumData.cheatsheets} />
          )}

          {currentView === 'glossary' && (
            <GlossaryViewer content={curriculumData.glossary} />
          )}

          {currentView === 'interview' && (
            <InterviewViewer content={curriculumData.interview} />
          )}

          {currentView === 'capstone' && (
            <CapstoneViewer content={curriculumData.capstone} />
          )}

          {currentView === 'certifications' && (
            <CertificationsViewer content={curriculumData.certifications} />
          )}
        </main>
      </div>

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        days={curriculumData.days}
        cheatsheets={curriculumData.cheatsheets}
        onSelectDay={handleSelectDay}
        onSelectCheatsheet={() => {
          setCurrentView('cheatsheets');
        }}
      />
    </div>
  );
}

export default App;
