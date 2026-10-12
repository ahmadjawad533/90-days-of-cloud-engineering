import React from 'react';
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Award, 
  ChevronRight,
  RotateCcw,
  Download
} from 'lucide-react';
import { Module, Day } from '../types';

interface DashboardProps {
  modules: Module[];
  days: Day[];
  completedDays: number[];
  onSelectDay: (dayNum: number) => void;
  onResetProgress: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  modules,
  days,
  completedDays,
  onSelectDay,
  onResetProgress,
}) => {
  const totalDays = days.length;
  const completedCount = completedDays.length;
  const percent = Math.round((completedCount / totalDays) * 100);

  // Find next uncompleted day
  const nextDay = days.find((d) => !completedDays.includes(d.day)) || days[0];

  // Estimated completed hours (average 1.5 hrs per day)
  const hoursInvested = Math.round(completedCount * 1.5);

  const handleExportProgress = () => {
    const data = {
      completedDays,
      completionRate: `${percent}%`,
      lastUpdated: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `90-days-cloud-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 text-white p-6 sm:p-10 shadow-xl shadow-blue-500/10">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-200 border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Self-Paced • 100% Free • Production-Grade</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            90 Days of Cloud Engineering
          </h1>

          <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
            From networking fundamentals and Linux scripting to container orchestration, Terraform IaC, automated CI/CD, and your end-to-end cloud capstone project.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onSelectDay(nextDay.day)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-blue-900 font-bold text-sm shadow-md hover:bg-blue-50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Play className="w-4 h-4 fill-blue-900" />
              <span>{completedCount === 0 ? 'Start Day 1' : `Resume Day ${nextDay.day}: ${nextDay.title}`}</span>
            </button>

            <button
              onClick={handleExportProgress}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm backdrop-blur-xs border border-white/10 transition-colors"
              title="Export progress as JSON"
            >
              <Download className="w-4 h-4" />
              <span>Export Progress</span>
            </button>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -right-12 -bottom-12 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
        <div className="absolute right-20 top-0 w-64 h-64 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Progress % */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-2">
            <span>Overall Completion</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {percent}%
          </div>
          <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-600 to-indigo-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Days Done */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-2">
            <span>Days Completed</span>
            <span className="font-mono text-xs">{completedCount}/{totalDays}</span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {completedCount} <span className="text-sm font-normal text-slate-400">/ {totalDays}</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {totalDays - completedCount} days remaining
          </div>
        </div>

        {/* Hours Invested */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-2">
            <span>Hours Invested</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
            ~{hoursInvested} <span className="text-sm font-normal text-slate-400">hrs</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Pacing: 1-2 hours / day
          </div>
        </div>

        {/* Capstone Readiness */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-2">
            <span>Capstone Status</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {completedCount >= 84 ? '🎉 Ready' : completedCount >= 50 ? 'In Progress' : 'Unlocking...'}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Days 84–90 Capstone Project
          </div>
        </div>
      </div>

      {/* Curriculum Modules Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Curriculum Modules
          </h2>
          {completedCount > 0 && (
            <button
              onClick={onResetProgress}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors"
              title="Reset all checked items"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Progress</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((mod) => {
            const modDays = days.filter((d) => d.day >= mod.days[0] && d.day <= mod.days[1]);
            const modCompleted = modDays.filter((d) => completedDays.includes(d.day)).length;
            const modTotal = mod.days[1] - mod.days[0] + 1;
            const modPercent = Math.round((modCompleted / modTotal) * 100);
            const isFinished = modCompleted === modTotal;

            return (
              <div
                key={mod.id}
                onClick={() => onSelectDay(mod.days[0])}
                className="group relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                      Module {mod.id}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Days {mod.days[0]}–{mod.days[1]}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {mod.title}
                  </h3>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span>{modCompleted} of {modTotal} days</span>
                    <span className={isFinished ? 'text-emerald-500 font-bold' : ''}>
                      {modPercent}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isFinished ? 'bg-emerald-500' : 'bg-blue-600 dark:bg-blue-500'
                      }`}
                      style={{ width: `${modPercent}%` }}
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                    <span>Jump to Module</span>
                    <ChevronRight className="w-4 h-4 ml-0.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
