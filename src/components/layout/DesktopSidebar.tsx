import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ListTodo,
  Tags,
  Settings,
  Plus,
} from 'lucide-react';
import { useTodos, type AppView } from '../../context/TodoContext';
import { DEFAULT_CATEGORIES } from '../../types/todo';

export const DesktopSidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    todayCount,
    overdueCount,
    completedCount,
    allCount,
    openCreateModal,
    selectedCategory,
    setSelectedCategory,
  } = useTodos();

  const navItems: {
    id: AppView;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'today', label: 'Today', icon: Calendar, badge: todayCount, badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' },
    { id: 'upcoming', label: 'Upcoming', icon: Clock },
    {
      id: 'overdue',
      label: 'Overdue',
      icon: AlertTriangle,
      badge: overdueCount,
      badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold animate-pulse',
    },
    { id: 'completed', label: 'Completed', icon: CheckCircle2, badge: completedCount, badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
    { id: 'all', label: 'All Todos', icon: ListTodo, badge: allCount },
  ];

  return (
    <aside className="w-64 h-screen sticky top-0 hidden lg:flex flex-col glass-panel border-r border-slate-200 dark:border-slate-800 p-4 select-none">
      {/* App Brand Header */}
      <div className="flex items-center gap-3 px-3 py-4 mb-2">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
          <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white font-display tracking-tight flex items-center gap-1.5">
            TaskPulse
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          </h2>
          <p className="text-[11px] font-medium text-slate-400">Personal Todo & Reminders</p>
        </div>
      </div>

      {/* Quick Add Button */}
      <div className="px-2 mb-4">
        <button
          type="button"
          onClick={() => openCreateModal()}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-2xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Task</span>
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto space-y-1 px-1">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
          Views
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSelectedCategory(null);
                setActiveView(item.id);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Categories Section */}
        <div className="pt-5">
          <div className="flex items-center justify-between px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <span>Categories</span>
            <button
              onClick={() => setActiveView('categories')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              <Tags className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-0.5 mt-1">
            {DEFAULT_CATEGORIES.map((cat) => {
              const isSelected = activeView === 'categories' && selectedCategory === cat.name;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setActiveView('categories');
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="truncate">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Settings at Bottom */}
      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 px-1">
        <button
          type="button"
          onClick={() => {
            setSelectedCategory(null);
            setActiveView('settings');
          }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
            activeView === 'settings'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
};
