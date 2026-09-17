import type { Todo } from '../types/todo';
import type { AppNotification } from '../types/notification';
import { parseTaskDateTime, isTaskOverdue, formatTaskDueDate } from '../utils/dateUtils';
import { soundService } from './sound';
import { differenceInMinutes } from 'date-fns';

const NOTIFIED_CACHE_KEY = 'taskpulse_notified_events';

function getNotifiedCache(): Set<string> {
  try {
    const raw = sessionStorage.getItem(NOTIFIED_CACHE_KEY);
    if (raw) {
      return new Set(JSON.parse(raw));
    }
  } catch {
    // fallback
  }
  return new Set();
}

function saveNotifiedCache(cache: Set<string>) {
  try {
    sessionStorage.setItem(NOTIFIED_CACHE_KEY, JSON.stringify(Array.from(cache)));
  } catch {
    // fallback
  }
}

/**
 * Requests browser notification permission if not yet granted
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const status = await Notification.requestPermission();
    return status === 'granted';
  }

  return false;
}

/**
 * Sends a native browser notification if permissions allow
 */
export function sendBrowserNotification(title: string, body: string, icon = '/favicon.svg') {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon,
        badge: icon,
      });
    } catch {
      // Ignore worker failure
    }
  }
}

/**
 * Evaluates todos and generates appropriate notifications
 */
export function checkTodoReminders(
  todos: Todo[],
  soundEnabled: boolean,
  browserEnabled: boolean,
  onNewNotification: (notification: AppNotification) => void
): void {
  const notifiedEvents = getNotifiedCache();
  const now = new Date();

  todos.forEach((todo) => {
    if (todo.completed || !todo.dueDate) return;

    const targetDate = parseTaskDateTime(todo.dueDate, todo.dueTime);
    if (!targetDate) return;

    const diffMinutes = differenceInMinutes(targetDate, now);

    // 1. Check Upcoming Reminder based on user-chosen reminder setting
    let reminderThreshold = 15; // default 15m
    if (todo.reminder === 'at_due') reminderThreshold = 5;
    else if (todo.reminder === '15m') reminderThreshold = 15;
    else if (todo.reminder === '30m') reminderThreshold = 30;
    else if (todo.reminder === '1h') reminderThreshold = 60;
    else if (todo.reminder === '1d') reminderThreshold = 1440;

    if (diffMinutes > 0 && diffMinutes <= reminderThreshold) {
      const eventKey = `${todo.id}_upcoming_${todo.dueDate}_${todo.dueTime || 'allDay'}`;
      if (!notifiedEvents.has(eventKey)) {
        notifiedEvents.add(eventKey);
        saveNotifiedCache(notifiedEvents);

        const title = `Reminder: ${todo.title}`;
        const message = `Due in ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} (${formatTaskDueDate(todo.dueDate, todo.dueTime)})`;

        if (soundEnabled) {
          soundService.playReminderSound();
        }

        if (browserEnabled) {
          sendBrowserNotification(title, message);
        }

        onNewNotification({
          id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          type: 'due_soon',
          title,
          message,
          timestamp: new Date().toISOString(),
          read: false,
          todoId: todo.id,
        });
      }
    }

    // 2. Check Overdue Alert
    if (isTaskOverdue(todo.dueDate, todo.dueTime)) {
      const overdueKey = `${todo.id}_overdue_${todo.dueDate}_${todo.dueTime || 'allDay'}`;
      if (!notifiedEvents.has(overdueKey)) {
        notifiedEvents.add(overdueKey);
        saveNotifiedCache(notifiedEvents);

        const title = `Task Overdue: ${todo.title}`;
        const message = `This task was due ${formatTaskDueDate(todo.dueDate, todo.dueTime)}`;

        // Only play audible tone for freshly overdue items (within past 60 mins) to avoid jarring noise on initial load
        const overdueMinutes = Math.abs(diffMinutes);
        if (soundEnabled && overdueMinutes <= 60) {
          soundService.playOverdueSound();
        }

        if (browserEnabled) {
          sendBrowserNotification(title, message);
        }

        onNewNotification({
          id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          type: 'overdue',
          title,
          message,
          timestamp: new Date().toISOString(),
          read: false,
          todoId: todo.id,
        });
      }
    }
  });
}
