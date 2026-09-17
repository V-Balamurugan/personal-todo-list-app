import {
  format,
  isToday,
  isTomorrow,
  isYesterday,
  isPast,
  parseISO,
  addDays,
  differenceInMinutes,
  formatDistanceToNow,
  startOfDay,
} from 'date-fns';

/**
 * Returns today's date formatted as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Returns tomorrow's date formatted as YYYY-MM-DD
 */
export function getTomorrowDateString(): string {
  return format(addDays(new Date(), 1), 'yyyy-MM-dd');
}

/**
 * Returns a date string formatted as YYYY-MM-DD offset by N days from today
 */
export function getDaysOffsetDateString(daysOffset: number): string {
  return format(addDays(new Date(), daysOffset), 'yyyy-MM-dd');
}

/**
 * Checks if a task was scheduled for yesterday or a previous calendar day
 */
export function isTaskFromPreviousDay(dueDate?: string): boolean {
  if (!dueDate) return false;
  try {
    const taskDate = startOfDay(parseISO(dueDate));
    const today = startOfDay(new Date());
    return taskDate < today;
  } catch {
    return false;
  }
}

/**
 * Parses dueDate (YYYY-MM-DD) and optional dueTime (HH:mm) into a Date object
 */
export function parseTaskDateTime(dueDate?: string, dueTime?: string): Date | null {
  if (!dueDate) return null;
  try {
    if (dueTime) {
      const [hours, minutes] = dueTime.split(':').map(Number);
      const date = parseISO(dueDate);
      date.setHours(hours, minutes, 0, 0);
      return date;
    } else {
      // Default to end of that day (23:59:59) so it isn't considered overdue in the morning
      const date = parseISO(dueDate);
      date.setHours(23, 59, 59, 999);
      return date;
    }
  } catch {
    return null;
  }
}

/**
 * Checks if a task is overdue (past its due date and time)
 */
export function isTaskOverdue(dueDate?: string, dueTime?: string): boolean {
  if (!dueDate) return false;
  const targetDate = parseTaskDateTime(dueDate, dueTime);
  if (!targetDate) return false;
  return isPast(targetDate);
}

/**
 * Checks if a task is due today
 */
export function isTaskDueToday(dueDate?: string): boolean {
  if (!dueDate) return false;
  try {
    return isToday(parseISO(dueDate));
  } catch {
    return false;
  }
}

/**
 * Checks if a task is due in the future
 */
export function isTaskUpcoming(dueDate?: string): boolean {
  if (!dueDate) return false;
  try {
    const taskDate = startOfDay(parseISO(dueDate));
    const today = startOfDay(new Date());
    return taskDate > today;
  } catch {
    return false;
  }
}

/**
 * Checks if a task is due soon (within threshold minutes)
 */
export function isTaskDueSoon(dueDate?: string, dueTime?: string, minutesThreshold = 30): boolean {
  if (!dueDate || !dueTime) return false;
  const targetDate = parseTaskDateTime(dueDate, dueTime);
  if (!targetDate) return false;

  const now = new Date();
  const diffMinutes = differenceInMinutes(targetDate, now);
  return diffMinutes > 0 && diffMinutes <= minutesThreshold;
}

/**
 * Formats a due date and optional time into a friendly display string
 */
export function formatTaskDueDate(dueDate?: string, dueTime?: string): string {
  if (!dueDate) return 'No due date';

  try {
    const dateObj = parseISO(dueDate);
    let datePart = '';

    if (isToday(dateObj)) {
      datePart = 'Today';
    } else if (isTomorrow(dateObj)) {
      datePart = 'Tomorrow';
    } else if (isYesterday(dateObj)) {
      datePart = 'Yesterday';
    } else {
      datePart = format(dateObj, 'MMM d, yyyy');
    }

    if (dueTime) {
      const [hours, minutes] = dueTime.split(':').map(Number);
      const tempDate = new Date();
      tempDate.setHours(hours, minutes);
      const timePart = format(tempDate, 'h:mm a');
      return `${datePart} at ${timePart}`;
    }

    return datePart;
  } catch {
    return dueDate;
  }
}

/**
 * Formats relative timestamp for notifications (e.g. "5 minutes ago")
 */
export function formatRelativeTime(isoString: string): string {
  try {
    return formatDistanceToNow(parseISO(isoString), { addSuffix: true });
  } catch {
    return isoString;
  }
}

/**
 * Returns dynamic greeting based on current local hour
 */
export function getTimeBasedGreeting(name?: string): { greeting: string; period: string } {
  const hour = new Date().getHours();
  let greeting = 'Good evening';
  let period = 'evening';

  if (hour >= 5 && hour < 12) {
    greeting = 'Good morning';
    period = 'morning';
  } else if (hour >= 12 && hour < 17) {
    greeting = 'Good afternoon';
    period = 'afternoon';
  } else if (hour >= 17 && hour < 22) {
    greeting = 'Good evening';
    period = 'evening';
  } else {
    greeting = 'Good night';
    period = 'night';
  }

  return {
    greeting: name ? `${greeting}, ${name} 👋` : `${greeting} 👋`,
    period,
  };
}
