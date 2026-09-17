export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export type ReminderOffset = 'at_due' | '15m' | '30m' | '1h' | '1d';

export interface Todo {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm (24h)
  priority: Priority;
  category: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  subtasks: Subtask[];
  reminder?: ReminderOffset;
  reminderDismissed?: boolean;
}

export type TodoFilter = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';

export type TodoSortBy = 'dueDate' | 'priority' | 'createdAt' | 'alphabetical';
export type SortOrder = 'asc' | 'desc';

export interface CategoryItem {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

// Student & Fresher Friendly Categories
export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'academics', name: 'Academics & Exams', color: '#6366f1' }, // Indigo
  { id: 'placement', name: 'Placement & Career', color: '#0ea5e9' }, // Sky
  { id: 'coding', name: 'Coding & DSA', color: '#10b981' },         // Emerald
  { id: 'projects', name: 'Projects & Portfolio', color: '#8b5cf6' }, // Violet
  { id: 'habits', name: 'Daily Habits', color: '#f59e0b' },         // Amber
];

export interface StudentTemplate {
  id: string;
  title: string;
  category: string;
  priority: Priority;
  description: string;
  subtasks: { id: string; title: string; completed: boolean }[];
}

export const STUDENT_TEMPLATES: StudentTemplate[] = [
  {
    id: 'tpl-dsa',
    title: 'DSA: Solve 2 LeetCode Problems',
    category: 'Coding & DSA',
    priority: 'high',
    description: 'Focus on Arrays/HashMaps or Two Pointers patterns. Understand time & space complexity.',
    subtasks: [
      { id: 'st-1', title: 'Solve Problem 1 (Medium)', completed: false },
      { id: 'st-2', title: 'Solve Problem 2 (Easy/Medium)', completed: false },
      { id: 'st-3', title: 'Write down optimal approach & edge cases', completed: false },
    ],
  },
  {
    id: 'tpl-job-apply',
    title: 'Career: Apply to 3 Software Engineer Roles',
    category: 'Placement & Career',
    priority: 'high',
    description: 'Customize resume keywords for each job post and connect with 1 recruiter/alumnus on LinkedIn.',
    subtasks: [
      { id: 'st-4', title: 'Tailor resume for job descriptions', completed: false },
      { id: 'st-5', title: 'Submit 3 applications via company career portals', completed: false },
      { id: 'st-6', title: 'Send polite connection note on LinkedIn', completed: false },
    ],
  },
  {
    id: 'tpl-assignment',
    title: 'College: Finish Semester Assignment',
    category: 'Academics & Exams',
    priority: 'urgent',
    description: 'Complete problem sets, check formatting guidelines, and submit before deadline.',
    subtasks: [
      { id: 'st-7', title: 'Complete all exercise questions', completed: false },
      { id: 'st-8', title: 'Check citations & plagiarism report', completed: false },
      { id: 'st-9', title: 'Export clean PDF and upload to portal', completed: false },
    ],
  },
  {
    id: 'tpl-core-cs',
    title: 'Revision: Core CS Subjects (OS / DBMS)',
    category: 'Placement & Career',
    priority: 'medium',
    description: 'Revise frequently asked interview topics: Indexing, Transactions (ACID), Deadlocks, and Paging.',
    subtasks: [
      { id: 'st-10', title: 'Revise ACID properties & Normalization (1NF-BCNF)', completed: false },
      { id: 'st-11', title: 'Review OS Process Scheduling & Deadlock conditions', completed: false },
      { id: 'st-12', title: 'Answer 5 mock interview technical questions', completed: false },
    ],
  },
  {
    id: 'tpl-project-commit',
    title: 'Project: Build & Commit New Feature',
    category: 'Projects & Portfolio',
    priority: 'medium',
    description: 'Implement a new feature on capstone/portfolio project and push a clean commit to GitHub.',
    subtasks: [
      { id: 'st-13', title: 'Write feature code & handle error states', completed: false },
      { id: 'st-14', title: 'Test locally and write documentation in README', completed: false },
      { id: 'st-15', title: 'Commit and push with descriptive message', completed: false },
    ],
  },
];

export const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bgColor: string; textColor: string; badgeClass: string; rank: number }> = {
  urgent: {
    label: 'Urgent',
    color: '#ef4444',
    bgColor: 'bg-rose-500/10 dark:bg-rose-500/20',
    textColor: 'text-rose-600 dark:text-rose-400',
    badgeClass: 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200 dark:border-rose-900',
    rank: 4,
  },
  high: {
    label: 'High',
    color: '#f97316',
    bgColor: 'bg-orange-500/10 dark:bg-orange-500/20',
    textColor: 'text-orange-600 dark:text-orange-400',
    badgeClass: 'bg-orange-50 text-orange-700 dark:bg-orange-950/70 dark:text-orange-300 border border-orange-200 dark:border-orange-900',
    rank: 3,
  },
  medium: {
    label: 'Medium',
    color: '#3b82f6',
    bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
    textColor: 'text-blue-600 dark:text-blue-400',
    badgeClass: 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200 dark:border-blue-900',
    rank: 2,
  },
  low: {
    label: 'Low',
    color: '#64748b',
    bgColor: 'bg-slate-500/10 dark:bg-slate-500/20',
    textColor: 'text-slate-600 dark:text-slate-400',
    badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
    rank: 1,
  },
};
