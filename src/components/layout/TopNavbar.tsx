import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  Sparkles,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';

interface TopNavbarProps {
  onOpenSearch: () => void;
  onOpenMobileMenu?: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onOpenSearch,
  onOpenMobileMenu,
}) => {
  const { user, logout, isDemoMode } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { unreadCount, togglePanel } = useNotifications();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 glass-panel border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile hamburger & Search trigger */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Global Search Bar Trigger */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full max-w-xs flex items-center justify-between px-3.5 py-2 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-400 transition-all group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            <span>Search tasks...</span>
          </div>
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md">
            Ctrl K
          </kbd>
        </button>
      </div>

      {/* Right controls: Notifications, Dark mode, User Avatar */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Demo Mode Badge */}
        {isDemoMode && (
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Demo Mode</span>
          </span>
        )}

        {/* Notification Bell with Badge */}
        <button
          type="button"
          onClick={togglePanel}
          title="Open notification panel"
          className="relative p-2.5 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Theme Toggle (Dark / Light) */}
        <button
          type="button"
          onClick={toggleTheme}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="p-2.5 rounded-2xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-600 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* User Profile Avatar Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 pl-2 sm:pr-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-sm flex items-center justify-center shadow-sm">
              {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="hidden sm:inline text-xs font-semibold text-slate-800 dark:text-slate-200">
              {user?.displayName || user?.email?.split('@')[0]}
            </span>
          </button>

          {isUserMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsUserMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 glass-modal rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-slide-down">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user?.displayName || 'User'}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
