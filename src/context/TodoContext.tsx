import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import type { Todo, Priority, TodoSortBy, SortOrder } from '../types/todo';
import {
  subscribeToUserTodos,
  addTodoItem,
  updateTodoItem,
  toggleTodoCompletion,
  deleteTodoItem,
  clearCompletedTodos,
} from '../services/todoService';
import { soundService } from '../services/sound';
import { checkTodoReminders } from '../services/notificationEngine';
import {
  isTaskDueToday,
  isTaskOverdue,
  isTaskUpcoming,
  getTodayDateString,
  parseTaskDateTime,
} from '../utils/dateUtils';

export type AppView = 'dashboard' | 'today' | 'upcoming' | 'overdue' | 'completed' | 'all' | 'categories' | 'settings';

interface TodoContextType {
  todos: Todo[];
  loading: boolean;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  priorityFilter: Priority | 'all';
  setPriorityFilter: (priority: Priority | 'all') => void;
  sortBy: TodoSortBy;
  setSortBy: (sort: TodoSortBy) => void;
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  isCreateModalOpen: boolean;
  createModalPreset: Partial<Todo> | null;
  openCreateModal: (preset?: Partial<Todo>) => void;
  closeCreateModal: () => void;
  // Actions
  addTodo: (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<string>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  toggleSubtaskCheck: (todoId: string, subtaskId: string) => Promise<void>;
  rescheduleToToday: (id: string) => Promise<void>;
  clearAllCompleted: () => Promise<void>;
  // Filtered lists and stats
  filteredTodos: Todo[];
  todayTodos: Todo[];
  upcomingTodos: Todo[];
  overdueTodos: Todo[];
  completedTodos: Todo[];
  todayCount: number;
  completedCount: number;
  pendingCount: number;
  overdueCount: number;
  allCount: number;
  completionRate: number;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isDemoMode } = useAuth();
  const { settings, addNotification } = useNotifications();

  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [sortBy, setSortBy] = useState<TodoSortBy>('dueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [createModalPreset, setCreateModalPreset] = useState<Partial<Todo> | null>(null);

  // Real-time synchronization
  useEffect(() => {
    if (!user) {
      setTodos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToUserTodos(user.uid, isDemoMode, (incomingTodos) => {
      setTodos(incomingTodos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isDemoMode]);

  // Periodic Reminder Engine
  useEffect(() => {
    if (!todos.length) return;

    // Run check initially
    checkTodoReminders(todos, settings.soundEnabled, settings.browserNotificationsEnabled, addNotification);

    // Re-check every 30 seconds
    const interval = setInterval(() => {
      checkTodoReminders(todos, settings.soundEnabled, settings.browserNotificationsEnabled, addNotification);
    }, 30000);

    return () => clearInterval(interval);
  }, [todos, settings.soundEnabled, settings.browserNotificationsEnabled, addNotification]);

  const openCreateModal = useCallback((preset?: Partial<Todo>) => {
    setCreateModalPreset(preset || null);
    setIsCreateModalOpen(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
    setCreateModalPreset(null);
  }, []);

  // CRUD Actions
  const addTodo = useCallback(
    async (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
      if (!user) throw new Error('User must be logged in to create a todo');

      const id = await addTodoItem(
        {
          ...todoData,
          userId: user.uid,
        },
        isDemoMode
      );
      return id;
    },
    [user, isDemoMode]
  );

  const updateTodo = useCallback(
    async (id: string, updates: Partial<Todo>) => {
      if (!user) return;
      await updateTodoItem(id, user.uid, updates, isDemoMode);
    },
    [user, isDemoMode]
  );

  const toggleComplete = useCallback(
    async (id: string) => {
      if (!user) return;
      const target = todos.find((t) => t.id === id);
      if (!target) return;

      const willBeCompleted = !target.completed;
      if (willBeCompleted) {
        soundService.playTaskCompleteSound();
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#6366f1', '#ec4899', '#10b981', '#f59e0b'],
          });
        } catch {
          // ignore
        }
      }

      await toggleTodoCompletion(id, user.uid, target.completed, isDemoMode);
    },
    [user, todos, isDemoMode]
  );

  const deleteTodo = useCallback(
    async (id: string) => {
      if (!user) return;
      await deleteTodoItem(id, user.uid, isDemoMode);
    },
    [user, isDemoMode]
  );

  const toggleSubtaskCheck = useCallback(
    async (todoId: string, subtaskId: string) => {
      if (!user) return;
      const target = todos.find((t) => t.id === todoId);
      if (!target) return;

      const updatedSubtasks = (target.subtasks || []).map((st) =>
        st.id === subtaskId ? { ...st, completed: !st.completed } : st
      );

      await updateTodoItem(todoId, user.uid, { subtasks: updatedSubtasks }, isDemoMode);
    },
    [user, todos, isDemoMode]
  );

  const rescheduleToToday = useCallback(
    async (id: string) => {
      if (!user) return;
      await updateTodoItem(
        id,
        user.uid,
        {
          dueDate: getTodayDateString(),
          dueTime: '18:00',
        },
        isDemoMode
      );
    },
    [user, isDemoMode]
  );

  const clearAllCompleted = useCallback(async () => {
    if (!user) return;
    await clearCompletedTodos(user.uid, todos, isDemoMode);
  }, [user, todos, isDemoMode]);

  // Computed Groups & Counts
  const todayTodos = useMemo(() => {
    return todos.filter((t) => !t.completed && isTaskDueToday(t.dueDate));
  }, [todos]);

  const upcomingTodos = useMemo(() => {
    return todos.filter((t) => !t.completed && isTaskUpcoming(t.dueDate));
  }, [todos]);

  const overdueTodos = useMemo(() => {
    return todos.filter((t) => !t.completed && isTaskOverdue(t.dueDate, t.dueTime));
  }, [todos]);

  const completedTodos = useMemo(() => {
    return todos.filter((t) => t.completed);
  }, [todos]);

  const todayCount = todayTodos.length;
  const overdueCount = overdueTodos.length;
  const completedCount = completedTodos.length;
  const pendingCount = todos.filter((t) => !t.completed).length;
  const allCount = todos.length;
  const completionRate = allCount > 0 ? Math.round((completedCount / allCount) * 100) : 0;

  // Filtered Todos by active view, search, priority, category, and sort order
  const filteredTodos = useMemo(() => {
    let list: Todo[] = [];

    switch (activeView) {
      case 'today':
        list = todos.filter((t) => isTaskDueToday(t.dueDate));
        break;
      case 'upcoming':
        list = todos.filter((t) => isTaskUpcoming(t.dueDate));
        break;
      case 'overdue':
        list = todos.filter((t) => !t.completed && isTaskOverdue(t.dueDate, t.dueTime));
        break;
      case 'completed':
        list = todos.filter((t) => t.completed);
        break;
      case 'categories':
        if (selectedCategory) {
          list = todos.filter((t) => t.category.toLowerCase() === selectedCategory.toLowerCase());
        } else {
          list = [...todos];
        }
        break;
      case 'all':
      case 'dashboard':
      default:
        list = [...todos];
        break;
    }

    // Category filter (if applied outside categories tab)
    if (selectedCategory && activeView !== 'categories') {
      list = list.filter((t) => t.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      list = list.filter((t) => t.priority === priorityFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          t.category.toLowerCase().includes(q)
      );
    }

    // Sorting
    list.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'dueDate') {
        const dateA = parseTaskDateTime(a.dueDate, a.dueTime);
        const dateB = parseTaskDateTime(b.dueDate, b.dueTime);
        if (!dateA && !dateB) comparison = 0;
        else if (!dateA) comparison = 1;
        else if (!dateB) comparison = -1;
        else comparison = dateA.getTime() - dateB.getTime();
      } else if (sortBy === 'priority') {
        const priorityWeights: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        comparison = priorityWeights[b.priority] - priorityWeights[a.priority];
      } else if (sortBy === 'createdAt') {
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'alphabetical') {
        comparison = a.title.localeCompare(b.title);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [todos, activeView, selectedCategory, priorityFilter, searchQuery, sortBy, sortOrder]);

  return (
    <TodoContext.Provider
      value={{
        todos,
        loading,
        activeView,
        setActiveView,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        priorityFilter,
        setPriorityFilter,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        isCreateModalOpen,
        createModalPreset,
        openCreateModal,
        closeCreateModal,
        addTodo,
        updateTodo,
        toggleComplete,
        deleteTodo,
        toggleSubtaskCheck,
        rescheduleToToday,
        clearAllCompleted,
        filteredTodos,
        todayTodos,
        upcomingTodos,
        overdueTodos,
        completedTodos,
        todayCount,
        completedCount,
        pendingCount,
        overdueCount,
        allCount,
        completionRate,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

export const useTodos = (): TodoContextType => {
  const context = useContext(TodoContext);
  if (!context) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
};
