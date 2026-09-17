import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Laptop,
  Bell,
  Download,
  Trash2,
  RotateCcw,
  Flame,
  LogOut,
  ShieldCheck,
  Play,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { useTodos } from '../../context/TodoContext';
import { useAuth } from '../../context/AuthContext';
import { soundService } from '../../services/sound';
import { FirebaseConfigModal } from './FirebaseConfigModal';
import { isFirebaseConfigured } from '../../services/firebase';
import { getSampleTodos } from '../../services/todoService';

export const SettingsView: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings, requestPermission } = useNotifications();
  const { todos, clearAllCompleted } = useTodos();
  const { user, logout, isDemoMode } = useAuth();

  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const hasFirebase = isFirebaseConfigured();

  const handleTestSound = () => {
    soundService.playReminderSound();
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(todos, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `taskpulse_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClearCompleted = async () => {
    if (confirm('Are you sure you want to remove all completed tasks?')) {
      setClearing(true);
      await clearAllCompleted();
      setClearing(false);
    }
  };

  const handleResetSampleData = () => {
    if (!user) return;
    if (confirm('Reset to default sample tasks? Any current tasks will be replaced.')) {
      const samples = getSampleTodos(user.uid);
      localStorage.setItem(`taskpulse_demo_todos_${user.uid}`, JSON.stringify(samples));
      window.dispatchEvent(new CustomEvent('taskpulse:todos_updated'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
          Settings & Preferences
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize your workspace, smart reminders, and synchronization
        </p>
      </div>

      {/* 1. Appearance */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-500" />
          Appearance & Theme
        </h3>

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-3 sm:p-4 rounded-2xl border text-center flex flex-col items-center gap-1.5 sm:gap-2 transition-all touch-manipulation active:scale-95 ${
              theme === 'light'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm'
                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-500" />
            <span className="text-[11px] sm:text-xs font-semibold">Light</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-3 sm:p-4 rounded-2xl border text-center flex flex-col items-center gap-1.5 sm:gap-2 transition-all touch-manipulation active:scale-95 ${
              theme === 'dark'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm'
                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <Moon className="w-5 h-5 text-indigo-500" />
            <span className="text-[11px] sm:text-xs font-semibold">Dark</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`p-3 sm:p-4 rounded-2xl border text-center flex flex-col items-center gap-1.5 sm:gap-2 transition-all touch-manipulation active:scale-95 ${
              theme === 'system'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-600 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm'
                : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <Laptop className="w-5 h-5 text-slate-500" />
            <span className="text-[11px] sm:text-xs font-semibold">System</span>
          </button>
        </div>
      </div>

      {/* 2. Smart Reminders & Notifications */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
          <Bell className="w-5 h-5 text-indigo-500" />
          Smart Reminders & Sound
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {/* Sound Toggle */}
          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Audio Chimes
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Play pleasant synthesized chimes on task completion and due alerts
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleTestSound}
                title="Test audio chime"
                className="p-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 flex items-center gap-1 transition-colors"
              >
                <Play className="w-3 h-3" /> Test
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  settings.soundEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    settings.soundEnabled ? 'left-6.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Browser Notifications */}
          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Browser Desktop Notifications
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Display native OS notifications even when the browser is minimized
              </p>
            </div>
            <button
              type="button"
              onClick={requestPermission}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                settings.browserNotificationsEnabled
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
              }`}
            >
              {settings.browserNotificationsEnabled ? 'Enabled' : 'Enable Popups'}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Firebase Synchronization */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" />
            Firebase Backend & Sync
          </h3>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
              hasFirebase
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200'
            }`}
          >
            {hasFirebase ? 'Live Firebase Connected' : 'Local Demo Storage Active'}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {hasFirebase
            ? 'Your tasks are securely synchronized in real-time to Google Cloud Firestore with per-user data isolation rules.'
            : 'Currently running in standalone Demo Mode with local persistence. You can connect your real Firebase project at any time!'}
        </p>

        <button
          type="button"
          onClick={() => setIsFirebaseModalOpen(true)}
          className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all"
        >
          <Flame className="w-4 h-4" />
          <span>Configure Firebase Keys</span>
        </button>
      </div>

      {/* 4. Data Management */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white font-display flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-500" />
          Data Backup & Management
        </h3>

        <div className="flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={handleExportData}
            className="w-full sm:w-auto justify-center py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors touch-manipulation active:scale-95"
          >
            <Download className="w-4 h-4 text-indigo-500" />
            <span>Export Backup (JSON)</span>
          </button>

          <button
            type="button"
            onClick={handleClearCompleted}
            disabled={clearing}
            className="w-full sm:w-auto justify-center py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors touch-manipulation active:scale-95"
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>Clear Completed Tasks</span>
          </button>

          {isDemoMode && (
            <button
              type="button"
              onClick={handleResetSampleData}
              className="w-full sm:w-auto justify-center py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors touch-manipulation active:scale-95"
            >
              <RotateCcw className="w-4 h-4 text-amber-500" />
              <span>Reset Sample Todos</span>
            </button>
          )}
        </div>
      </div>

      {/* 5. Account & Sign Out */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            Signed in as {user?.displayName || 'User'}
          </p>
          <p className="text-xs text-slate-400">{user?.email}</p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="w-full sm:w-auto justify-center py-2.5 px-4 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors touch-manipulation active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      <FirebaseConfigModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />
    </div>
  );
};
