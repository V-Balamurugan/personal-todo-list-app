import React from 'react';
import { Calendar, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { useTodos } from '../../context/TodoContext';

export const ProductivitySummary: React.FC = () => {
  const {
    todayCount,
    completedCount,
    pendingCount,
    overdueCount,
    completionRate,
    setActiveView,
  } = useTodos();

  const cards = [
    {
      id: 'today',
      title: "Today's Plan",
      count: todayCount,
      sublabel: `${todayCount} remaining`,
      icon: Calendar,
      colorClass: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60',
      viewTarget: 'today' as const,
    },
    {
      id: 'completed',
      title: 'Accomplished',
      count: completedCount,
      sublabel: `${completionRate}% completed`,
      icon: CheckCircle2,
      colorClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60',
      viewTarget: 'completed' as const,
    },
    {
      id: 'pending',
      title: 'Active Total',
      count: pendingCount,
      sublabel: 'Across all topics',
      icon: Clock,
      colorClass: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60',
      viewTarget: 'all' as const,
    },
    {
      id: 'overdue',
      title: 'Deadlines Passed',
      count: overdueCount,
      sublabel: overdueCount > 0 ? 'Needs attention' : 'All on time',
      icon: AlertTriangle,
      colorClass: overdueCount > 0
        ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60'
        : 'text-slate-400 bg-slate-100 dark:bg-slate-800',
      viewTarget: 'overdue' as const,
      isPulsing: overdueCount > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.id}
            type="button"
            onClick={() => setActiveView(card.viewTarget)}
            className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800 text-left transition-all hover:border-indigo-300 dark:hover:border-indigo-800 group touch-manipulation active:scale-[0.98]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg ${card.colorClass}`}>
                <Icon className={`w-3.5 h-3.5 ${card.isPulsing ? 'animate-pulse' : ''}`} />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-display">
                {card.count}
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                {card.sublabel}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
