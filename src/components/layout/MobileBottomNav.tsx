import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Plus,
  Bell,
  Settings,
} from 'lucide-react';
import { useTodos } from '../../context/TodoContext';
import { useNotifications } from '../../context/NotificationContext';

export const MobileBottomNav: React.FC = () => {
  const { activeView, setActiveView, openCreateModal, todayCount, setSelectedCategory } = useTodos();
  const { unreadCount, togglePanel } = useNotifications();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden h-16 glass-panel border-t border-slate-200 dark:border-slate-800 px-4 flex items-center justify-around">
      {/* 1. Dashboard */}
      <button
        type="button"
        onClick={() => {
          setSelectedCategory(null);
          setActiveView('dashboard');
        }}
        className={`flex flex-col items-center gap-1 py-1 px-2 transition-colors ${
          activeView === 'dashboard'
            ? 'text-indigo-600 dark:text-indigo-400 font-bold'
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-[10px]">Home</span>
      </button>

      {/* 2. Today */}
      <button
        type="button"
        onClick={() => {
          setSelectedCategory(null);
          setActiveView('today');
        }}
        className={`relative flex flex-col items-center gap-1 py-1 px-2 transition-colors ${
          activeView === 'today'
            ? 'text-indigo-600 dark:text-indigo-400 font-bold'
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
        }`}
      >
        <Calendar className="w-5 h-5" />
        <span className="text-[10px]">Today</span>
        {todayCount > 0 && (
          <span className="absolute top-0 right-1 w-2 h-2 rounded-full bg-indigo-600" />
        )}
      </button>

      {/* 3. Floating Quick Add Button (Center) */}
      <button
        type="button"
        onClick={() => openCreateModal()}
        className="w-12 h-12 -mt-5 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all"
        aria-label="Create new task"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* 4. Notifications */}
      <button
        type="button"
        onClick={togglePanel}
        className="relative flex flex-col items-center gap-1 py-1 px-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
      >
        <Bell className="w-5 h-5" />
        <span className="text-[10px]">Alerts</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-1 px-1 min-w-[14px] h-[14px] text-[9px] font-bold rounded-full bg-indigo-600 text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* 5. Settings */}
      <button
        type="button"
        onClick={() => {
          setSelectedCategory(null);
          setActiveView('settings');
        }}
        className={`flex flex-col items-center gap-1 py-1 px-2 transition-colors ${
          activeView === 'settings'
            ? 'text-indigo-600 dark:text-indigo-400 font-bold'
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
        }`}
      >
        <Settings className="w-5 h-5" />
        <span className="text-[10px]">Settings</span>
      </button>
    </nav>
  );
};
