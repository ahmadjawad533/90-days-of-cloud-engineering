import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  Filter, 
  X,
  CreditCard
} from 'lucide-react';
import { Module, Day } from '../types';

interface SidebarProps {
  modules: Module[];
  days: Day[];
  selectedDayNum: number | null;
  onSelectDay: (dayNum: number) => void;
  completedDays: number[];
  onToggleDayComplete: (dayNum: number, e: React.MouseEvent) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  modules,
  days,
  selectedDayNum,
  onSelectDay,
  completedDays,
  onToggleDayComplete,
  isOpen,
  onClose,
}) => {
  // Collapsed modules state
  const [collapsedModules, setCollapsedModules] = useState<Record<number, boolean>>({});
  const [filterMode, setFilterMode] = useState<'all' | 'uncompleted' | 'completed'>('all');

  const toggleModule = (id: number) => {
    setCollapsedModules((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const isDayCompleted = (num: number) => completedDays.includes(num);

  const filteredDays = days.filter((d) => {
    if (filterMode === 'completed') return isDayCompleted(d.day);
    if (filterMode === 'uncompleted') return !isDayCompleted(d.day);
    return true;
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-80 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header / Filter bar */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value as any)}
              className="bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-slate-200 rounded px-2 py-0.5 text-xs font-medium cursor-pointer focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All ({days.length})</option>
              <option value="uncompleted">Remaining ({days.length - completedDays.length})</option>
              <option value="completed">Done ({completedDays.length})</option>
            </select>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            title="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modules & Days List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {modules.map((mod) => {
            const moduleDays = filteredDays.filter(
              (d) => d.day >= mod.days[0] && d.day <= mod.days[1]
            );
            if (moduleDays.length === 0 && filterMode !== 'all') return null;

            const isCollapsed = !!collapsedModules[mod.id];
            const modCompletedCount = days
              .filter((d) => d.day >= mod.days[0] && d.day <= mod.days[1])
              .filter((d) => isDayCompleted(d.day)).length;
            const modTotalCount = mod.days[1] - mod.days[0] + 1;
            const isAllDone = modCompletedCount === modTotalCount;

            return (
              <div 
                key={mod.id} 
                className="rounded-xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden bg-slate-50/50 dark:bg-slate-950/40"
              >
                {/* Module Header Button */}
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    {isCollapsed ? (
                      <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    )}
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
                        Module {mod.id} • Days {mod.days[0]}–{mod.days[1]}
                      </div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {mod.title}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                    isAllDone
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {modCompletedCount}/{modTotalCount}
                  </span>
                </button>

                {/* Day Items in Module */}
                {!isCollapsed && (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800/60">
                    {moduleDays.map((d) => {
                      const completed = isDayCompleted(d.day);
                      const isSelected = selectedDayNum === d.day;

                      return (
                        <div
                          key={d.day}
                          onClick={() => {
                            onSelectDay(d.day);
                            if (window.innerWidth < 1024) onClose();
                          }}
                          className={`group px-3 py-2 flex items-center justify-between gap-2.5 cursor-pointer text-xs transition-colors ${
                            isSelected
                              ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {/* Checkbox */}
                            <button
                              onClick={(e) => onToggleDayComplete(d.day, e)}
                              className="shrink-0 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              title={completed ? 'Mark uncompleted' : 'Mark completed'}
                            >
                              {completed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-blue-500" />
                              )}
                            </button>

                            {/* Title & Day */}
                            <div className="min-w-0 truncate">
                              <span className="font-mono text-[11px] text-slate-400 mr-1.5">
                                D{d.day < 10 ? `0${d.day}` : d.day}
                              </span>
                              <span className={completed ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                                {d.title}
                              </span>
                            </div>
                          </div>

                          {/* Badges */}
                          <div className="flex items-center gap-1 shrink-0 text-[10px] text-slate-400">
                            {d.isPaid && (
                              <span title="Optional paid component">
                                <CreditCard className="w-3 h-3 text-amber-500" />
                              </span>
                            )}
                            <span className="hidden sm:inline-flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {d.time.replace(/[^0-9-]/g, '')}m
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
};
