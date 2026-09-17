import React from 'react';
import { Plus, Calendar, Flame } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTodos } from '../../context/TodoContext';
import { getTimeBasedGreeting } from '../../utils/dateUtils';
import { format } from 'date-fns';

export const GreetingBanner: React.FC = () => {
  const { user } = useAuth();
  const { openCreateModal, todayCount, completedCount } = useTodos();

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'there';
  const { greeting } = getTimeBasedGreeting(displayName);
  const formattedToday = format(new Date(), 'EEEE, MMMM d');

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 sm:p-7 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-800 text-white shadow-xl shadow-indigo-600/15 border border-indigo-500/30">
      {/* Soft minimalist ambient background highlights */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-white/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-indigo-100 text-xs font-semibold backdrop-blur-md border border-white/20">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formattedToday}</span>
            </span>

            {/* Student Study Streak Badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 text-xs font-bold border border-amber-300/30">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-current animate-pulse" />
              <span>3-Day Focus Streak</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight font-display">
            {greeting}
          </h1>

          <p className="text-xs sm:text-sm text-indigo-100/90 max-w-lg leading-relaxed">
            {todayCount > 0 ? (
              <>
                You have <strong className="text-white font-bold">{todayCount} priority task{todayCount === 1 ? '' : 's'}</strong> today ({completedCount} completed). Small steps every day lead to big placement and exam results!
              </>
            ) : (
              'All goals for today are completed! Great time for revision, projects, or relaxation.'
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => openCreateModal()}
          className="w-full sm:w-auto justify-center py-3 sm:py-2.5 px-5 bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-xs sm:text-sm rounded-2xl shadow-md shadow-black/10 flex items-center gap-2 transition-all active:scale-95 flex-shrink-0 touch-manipulation"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Task</span>
        </button>
      </div>
    </div>
  );
};
