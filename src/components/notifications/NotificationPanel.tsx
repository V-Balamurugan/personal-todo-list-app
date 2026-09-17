import React, { useState } from 'react';
import {
  Bell,
  X,
  CheckCheck,
  Trash2,
  Clock,
  AlertTriangle,
  CheckCircle,
  Volume2,
  VolumeX,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useTodos } from '../../context/TodoContext';
import { formatRelativeTime } from '../../utils/dateUtils';
import type { NotificationType } from '../../types/notification';

export const NotificationPanel: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isPanelOpen,
    closePanel,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    settings,
    updateSettings,
    requestPermission,
  } = useNotifications();

  const { setActiveView } = useTodos();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!isPanelOpen) return null;

  const filteredList =
    filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'overdue':
        return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      case 'due_soon':
        return <Clock className="w-5 h-5 text-amber-500" />;
      case 'task_completed':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'system':
      default:
        return <Bell className="w-5 h-5 text-indigo-500" />;
    }
  };

  const handleNotificationClick = (todoId?: string, notificationId?: string) => {
    if (notificationId) {
      markAsRead(notificationId);
    }
    if (todoId) {
      setActiveView('all');
      closePanel();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-md h-full glass-modal shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white font-display text-lg">
                Notifications
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {unreadCount > 0 ? `${unreadCount} unread reminder${unreadCount === 1 ? '' : 's'}` : 'All caught up'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio Toggle */}
            <button
              onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
              title={settings.soundEnabled ? 'Mute reminder sounds' : 'Enable reminder sounds'}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {settings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-indigo-500" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            <button
              onClick={closePanel}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Sub-header */}
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                filter === 'unread'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                title="Mark all as read"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark read</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                title="Clear all notifications"
                className="text-xs text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Browser Permission Banner (if not yet granted) */}
        {!settings.browserNotificationsEnabled && (
          <div className="mx-5 mt-4 p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <span className="text-xs text-indigo-950 dark:text-indigo-200">
                Get desktop popups when tasks are due
              </span>
            </div>
            <button
              onClick={requestPermission}
              className="text-xs font-semibold px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg whitespace-nowrap transition-colors"
            >
              Enable
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filteredList.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Bell className="w-6 h-6 opacity-40" />
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                  We'll notify you here when tasks are approaching their due time or require attention.
                </p>
              </div>
            </div>
          ) : (
            filteredList.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item.todoId, item.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer group relative ${
                  item.read
                    ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 text-slate-600 dark:text-slate-400'
                    : 'bg-white dark:bg-slate-800/90 border-indigo-200/70 dark:border-indigo-900/60 shadow-sm text-slate-900 dark:text-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0">{getIcon(item.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4
                        className={`text-sm font-semibold truncate ${
                          !item.read ? 'text-slate-900 dark:text-white' : ''
                        }`}
                      >
                        {item.title}
                      </h4>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                      <span className="text-[11px] text-slate-400">
                        {formatRelativeTime(item.timestamp)}
                      </span>
                      {item.todoId && (
                        <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          View Task <ExternalLink className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all absolute top-3 right-3"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
