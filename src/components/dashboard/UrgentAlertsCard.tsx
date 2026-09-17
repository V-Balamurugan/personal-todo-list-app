import React from 'react';
import { AlertCircle, RotateCcw, ArrowRight } from 'lucide-react';
import { useTodos } from '../../context/TodoContext';

export const UrgentAlertsCard: React.FC = () => {
  const { overdueTodos, overdueCount, setActiveView, rescheduleToToday } = useTodos();
  const [isRescheduling, setIsRescheduling] = React.useState(false);

  if (overdueCount === 0) return null;

  const firstOverdue = overdueTodos[0];

  const handleReschedule = async () => {
    if (!firstOverdue || isRescheduling) return;
    setIsRescheduling(true);
    try {
      await rescheduleToToday(firstOverdue.id);
    } finally {
      setIsRescheduling(false);
    }
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-rose-500/10 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-slide-down">
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 rounded-2xl bg-rose-500 text-white shadow-md shadow-rose-500/25 flex-shrink-0 mt-0.5">
          <AlertCircle className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Action Required
            </span>
            <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300">
              {overdueCount} Overdue
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
            "{firstOverdue?.title}"
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            {overdueCount > 1
              ? `And ${overdueCount - 1} other task${overdueCount - 1 === 1 ? '' : 's'} past the scheduled due date.`
              : 'This task was scheduled earlier and requires your prompt attention.'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        {firstOverdue && (
          <button
            type="button"
            onClick={handleReschedule}
            disabled={isRescheduling}
            className="flex-1 sm:flex-initial py-2 px-3.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRescheduling ? 'animate-spin' : ''}`} />
            <span>{isRescheduling ? 'Rescheduling...' : 'Reschedule to Today'}</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => setActiveView('overdue')}
          className="flex-1 sm:flex-initial py-2 px-3.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1 transition-all"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
