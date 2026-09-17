import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { AppNotification, NotificationSettings } from '../types/notification';
import { requestNotificationPermission } from '../services/notificationEngine';
import { soundService } from '../services/sound';

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  settings: NotificationSettings;
  isPanelOpen: boolean;
  setIsPanelOpen: (open: boolean) => void;
  togglePanel: () => void;
  closePanel: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (notif: AppNotification) => void;
  updateSettings: (newSettings: Partial<NotificationSettings>) => void;
  requestPermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const NOTIFICATIONS_STORAGE_KEY = 'taskpulse_notifications_history';
const SETTINGS_STORAGE_KEY = 'taskpulse_notification_settings';

const DEFAULT_SETTINGS: NotificationSettings = {
  soundEnabled: true,
  browserNotificationsEnabled: false,
  dueSoonAlerts: true,
  overdueAlerts: true,
  dailySummary: true,
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [
      {
        id: 'welcome-1',
        type: 'system',
        title: 'Welcome to TaskPulse! 🚀',
        message: 'Your personal productivity & smart reminder space is ready.',
        timestamp: new Date().toISOString(),
        read: false,
      },
    ];
  });

  const [settings, setSettings] = useState<NotificationSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);

  // Sync sound service with settings
  useEffect(() => {
    soundService.setMuted(!settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Persist notifications
  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const togglePanel = () => setIsPanelOpen((prev) => !prev);
  const closePanel = () => setIsPanelOpen(false);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const addNotification = useCallback((notif: AppNotification) => {
    setNotifications((prev) => [notif, ...prev.slice(0, 49)]); // Keep last 50
  }, []);

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    const granted = await requestNotificationPermission();
    updateSettings({ browserNotificationsEnabled: granted });
    return granted;
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        settings,
        isPanelOpen,
        setIsPanelOpen,
        togglePanel,
        closePanel,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        addNotification,
        updateSettings,
        requestPermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
