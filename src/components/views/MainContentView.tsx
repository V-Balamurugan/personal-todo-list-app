import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ListTodo,
  Tag,
  RotateCcw,
  Flame,
} from 'lucide-react';
import { useTodos } from '../../context/TodoContext';
import { GreetingBanner } from '../dashboard/GreetingBanner';
import { ProductivitySummary } from '../dashboard/ProductivitySummary';
import { UrgentAlertsCard } from '../dashboard/UrgentAlertsCard';
import { QuickAddInput } from '../todos/QuickAddInput';
import { TodoFilters } from '../todos/TodoFilters';
import { TodoList } from '../todos/TodoList';
import { SettingsView } from '../settings/SettingsView';
import { DEFAULT_CATEGORIES } from '../../types/todo';
import { PomodoroTimer } from '../student/PomodoroTimer';
import { DatabaseStatusBanner } from '../dashboard/DatabaseStatusBanner';

export const MainContentView: React.FC = () => {
  const [showPomodoro, setShowPomodoro] = useState(false);
  const {
    activeView,
    setActiveView,
    filteredTodos,
    todayTodos,
    overdueTodos,
    todayCount,
    overdueCount,
    completedCount,
    allCount,
    selectedCategory,
    setSelectedCategory,
    rolloverPreviousDayTasks,
    clearAllCompleted,
  } = useTodos();

  // 1. Settings View
  if (activeView === 'settings') {
    return <SettingsView />;
  }

  // 2. Dashboard View
  if (activeView === 'dashboard') {
    return (
      <div className="space-y-6 pb-16 animate-fade-in">
        {/* Personalized Banner */}
        <GreetingBanner />

        {/* Database Sync Status Banner */}
        <DatabaseStatusBanner />

        {/* Overdue Urgent Alert (if any) */}
        <UrgentAlertsCard />

        {/* Productivity Summary 4-Cards */}
        <ProductivitySummary />

        {/* Study & Coding Focus Mode Widget */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setShowPomodoro(!showPomodoro)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              showPomodoro
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900 shadow-sm'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-500 fill-current" />
            <span>{showPomodoro ? 'Hide Focus Timer' : '⚡ 25m Focus Timer (Pomodoro)'}</span>
          </button>
        </div>

        {showPomodoro && (
          <PomodoroTimer onClose={() => setShowPomodoro(false)} />
        )}

        {/* Lightning Fast Task Quick Add */}
        <div className="pt-1">
          <QuickAddInput placeholder="Quick add a study or placement task... (Press Enter)" />
        </div>

        {/* Today's Tasks Immediate Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-display">
                Today's Tasks
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
                {todayCount}
              </span>
            </div>

            {todayCount > 4 && (
              <button
                type="button"
                onClick={() => setActiveView('today')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View all ({todayCount})
              </button>
            )}
          </div>

          <TodoList
            todos={todayTodos.slice(0, 5)}
            emptyMessage="No tasks scheduled for today"
            emptySubtext="Use the quick add bar above or click + to add something for today!"
          />
        </div>

        {/* Overdue / Previous Day section if any exist */}
        {overdueCount > 0 && (
          <div className="space-y-3 pt-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-display">
                  Overdue & Previous Day
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                  {overdueCount}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => rolloverPreviousDayTasks('today')}
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Move All to Today</span>
                </button>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <button
                  type="button"
                  onClick={() => rolloverPreviousDayTasks('tomorrow')}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Calendar className="w-3 h-3 text-indigo-500" />
                  <span>To Tomorrow</span>
                </button>
              </div>
            </div>

            <TodoList todos={overdueTodos.slice(0, 3)} />
          </div>
        )}
      </div>
    );
  }

  // 3. Today's View
  if (activeView === 'today') {
    return (
      <div className="space-y-6 pb-16 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-2">
              <Calendar className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
              Today's Tasks
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Focus on what matters most for today
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900 self-start sm:self-auto">
            {todayCount} Active Today
          </span>
        </div>

        <QuickAddInput placeholder="Add another task for today..." />
        <TodoFilters />
        <TodoList
          todos={filteredTodos}
          emptyMessage="No tasks for today"
          emptySubtext="You have a clear schedule today! Enjoy your free time or add a new goal."
        />
      </div>
    );
  }

  // 4. Upcoming View
  if (activeView === 'upcoming') {
    return (
      <div className="space-y-6 pb-16 animate-fade-in">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-2">
            <Clock className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Upcoming Tasks
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tasks scheduled for tomorrow and future dates
          </p>
        </div>

        <TodoFilters />
        <TodoList
          todos={filteredTodos}
          emptyMessage="No upcoming tasks"
          emptySubtext="Plan ahead by creating tasks with future due dates."
        />
      </div>
    );
  }

  // 5. Overdue View
  if (activeView === 'overdue') {
    return (
      <div className="space-y-6 pb-16 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 font-display flex items-center gap-2">
              <AlertTriangle className="w-7 h-7 text-rose-500" />
              Overdue Tasks
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Tasks past their scheduled deadline requiring prompt action
            </p>
          </div>

          {overdueCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
              <button
                type="button"
                onClick={() => rolloverPreviousDayTasks('today')}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Move All to Today</span>
              </button>
              <button
                type="button"
                onClick={() => rolloverPreviousDayTasks('tomorrow')}
                className="py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all"
              >
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>Move All to Tomorrow</span>
              </button>
            </div>
          )}
        </div>

        <TodoFilters />
        <TodoList
          todos={filteredTodos}
          emptyMessage="Awesome! Zero overdue tasks"
          emptySubtext="You are completely on schedule. No overdue items require attention."
        />
      </div>
    );
  }

  // 6. Completed View
  if (activeView === 'completed') {
    return (
      <div className="space-y-6 pb-16 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-2">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              Completed Tasks
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {completedCount} accomplished task{completedCount === 1 ? '' : 's'} to celebrate
            </p>
          </div>

          {completedCount > 0 && (
            <button
              type="button"
              onClick={clearAllCompleted}
              className="py-2.5 px-4 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/60 dark:hover:text-rose-400 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-all self-start sm:self-auto"
            >
              Clear Completed History
            </button>
          )}
        </div>

        <TodoFilters />
        <TodoList
          todos={filteredTodos}
          emptyMessage="No completed tasks yet"
          emptySubtext="Mark a task as completed to see it listed here with completion timestamps."
        />
      </div>
    );
  }

  // 7. Categories View
  if (activeView === 'categories') {
    return (
      <div className="space-y-6 pb-16 animate-fade-in">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-2">
            <Tag className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Task Categories
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organize tasks by context, project, or domain
          </p>
        </div>

        {/* Category Chips Bar */}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all ${
              selectedCategory === null
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            All Categories
          </button>
          {DEFAULT_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(isSelected ? null : cat.name)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        <TodoFilters />
        <TodoList
          todos={filteredTodos}
          emptyMessage={`No tasks in ${selectedCategory || 'selected category'}`}
          emptySubtext="Add tasks to this category to keep your work organized."
        />
      </div>
    );
  }

  // 8. All Todos View (Default)
  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-2">
            <ListTodo className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            All Tasks
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete list of your personal tasks and reminders ({allCount} total)
          </p>
        </div>
      </div>

      <QuickAddInput placeholder="Add a new task... (Press Enter)" />
      <TodoFilters />
      <TodoList
        todos={filteredTodos}
        emptyMessage="No tasks found"
        emptySubtext="Create a task above to get started!"
      />
    </div>
  );
};
