export type NotificationType = 'due_soon' | 'overdue' | 'task_completed' | 'daily_summary' | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO string
  read: boolean;
  todoId?: string;
  actionUrl?: string;
}

export interface NotificationSettings {
  soundEnabled: boolean;
  browserNotificationsEnabled: boolean;
  dueSoonAlerts: boolean;
  overdueAlerts: boolean;
  dailySummary: boolean;
}
