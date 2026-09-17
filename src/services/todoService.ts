import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Todo, Subtask } from '../types/todo';
import { getTodayDateString, getTomorrowDateString } from '../utils/dateUtils';

const LOCAL_STORAGE_TODOS_KEY = 'taskpulse_demo_todos';

/**
 * Initial sample todos for new users or demo mode
 */
export function getSampleTodos(userId: string): Todo[] {
  const today = getTodayDateString();
  const tomorrow = getTomorrowDateString();

  return [
    {
      id: 'demo-1',
      userId,
      title: 'DSA: Solve 2 LeetCode Medium Array & String Problems',
      description: 'Focus on Two Pointers and Sliding Window technique. Write clean, optimal code.',
      dueDate: today,
      dueTime: '11:00',
      priority: 'high',
      category: 'Coding & DSA',
      completed: false,
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      updatedAt: new Date().toISOString(),
      subtasks: [
        { id: 'sub-1', title: 'Container With Most Water', completed: true },
        { id: 'sub-2', title: 'Longest Substring Without Repeating Characters', completed: false },
        { id: 'sub-3', title: 'Note down edge cases & complexities', completed: false },
      ],
      reminder: '15m',
    },
    {
      id: 'demo-2',
      userId,
      title: 'Submit Operating Systems Lab Assignment 3',
      description: 'Implement producer-consumer problem using POSIX semaphores and mutex locks.',
      dueDate: today,
      dueTime: '09:00', // Past deadline demonstration for overdue badge
      priority: 'urgent',
      category: 'Academics & Exams',
      completed: false,
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      updatedAt: new Date().toISOString(),
      subtasks: [
        { id: 'sub-4', title: 'Compile and test with GCC', completed: true },
        { id: 'sub-5', title: 'Generate screenshots and upload PDF', completed: false },
      ],
      reminder: 'at_due',
    },
    {
      id: 'demo-3',
      userId,
      title: 'Placement Prep: Tailor Resume & Apply to 3 Companies',
      description: 'Target Graduate Software Engineer roles on company portals & LinkedIn.',
      dueDate: today,
      dueTime: '17:30',
      priority: 'high',
      category: 'Placement & Career',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subtasks: [
        { id: 'sub-6', title: 'Add latest React capstone project to resume', completed: true },
        { id: 'sub-7', title: 'Apply to Company A (SWE Intern / Fresher)', completed: false },
        { id: 'sub-8', title: 'Apply to Company B & reach out to recruiter', completed: false },
      ],
      reminder: '30m',
    },
    {
      id: 'demo-4',
      userId,
      title: 'Revise DBMS: Indexing, B-Trees & ACID Properties',
      description: 'Frequently asked interview topics for college placements.',
      dueDate: tomorrow,
      dueTime: '19:00',
      priority: 'medium',
      category: 'Academics & Exams',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subtasks: [],
    },
    {
      id: 'demo-5',
      userId,
      title: 'Portfolio Website: Deploy V1 & Add Live Demo Links',
      description: 'Showcase projects, GitHub repositories, and contact info to recruiters.',
      dueDate: today,
      dueTime: '14:00',
      priority: 'medium',
      category: 'Projects & Portfolio',
      completed: true,
      completedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      updatedAt: new Date().toISOString(),
      subtasks: [
        { id: 'sub-9', title: 'Setup GitHub repository & Vercel deployment', completed: true },
        { id: 'sub-10', title: 'Verify responsive mobile preview', completed: true },
      ],
    },
  ];
}

/**
 * Loads demo todos from localStorage or creates default samples
 */
function getLocalTodos(userId: string): Todo[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_TODOS_KEY}_${userId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  const samples = getSampleTodos(userId);
  saveLocalTodos(userId, samples);
  return samples;
}

function saveLocalTodos(userId: string, todos: Todo[]): void {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_TODOS_KEY}_${userId}`, JSON.stringify(todos));
    window.dispatchEvent(new CustomEvent('taskpulse:todos_updated'));
  } catch {
    // ignore
  }
}

/**
 * Subscribes to real-time todos for a given user.
 * Dispatches updates whenever Firestore documents change or local state updates.
 */
export function subscribeToUserTodos(
  userId: string,
  isDemoMode: boolean,
  callback: (todos: Todo[]) => void
): Unsubscribe {
  if (isDemoMode || !db) {
    // Demo / Local Mode
    const loadAndEmit = () => {
      const todos = getLocalTodos(userId);
      callback(todos);
    };

    loadAndEmit();

    const handleLocalUpdate = () => {
      loadAndEmit();
    };

    window.addEventListener('taskpulse:todos_updated', handleLocalUpdate);
    window.addEventListener('storage', handleLocalUpdate);

    return () => {
      window.removeEventListener('taskpulse:todos_updated', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
    };
  }

  // Live Firestore Mode
  try {
    const todosRef = collection(db, 'todos');
    const q = query(todosRef, where('userId', '==', userId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const todos: Todo[] = [];
        snapshot.forEach((docSnap) => {
          todos.push({
            ...(docSnap.data() as Omit<Todo, 'id'>),
            id: docSnap.id,
          });
        });
        callback(todos);
      },
      (error) => {
        console.error('Firestore onSnapshot error:', error);
        // Fallback to local storage if Firestore connection errors
        callback(getLocalTodos(userId));
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Failed to setup Firestore listener:', error);
    callback(getLocalTodos(userId));
    return () => {};
  }
}

/**
 * Adds a new Todo item
 */
export async function addTodoItem(
  todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>,
  isDemoMode: boolean
): Promise<string> {
  const now = new Date().toISOString();

  if (isDemoMode || !db) {
    const newId = 'todo-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const newTodo: Todo = {
      ...todoData,
      id: newId,
      createdAt: now,
      updatedAt: now,
      subtasks: todoData.subtasks || [],
    };
    const current = getLocalTodos(todoData.userId);
    saveLocalTodos(todoData.userId, [newTodo, ...current]);
    return newId;
  }

  const docRef = await addDoc(collection(db, 'todos'), {
    ...todoData,
    subtasks: todoData.subtasks || [],
    createdAt: now,
    updatedAt: now,
  });

  return docRef.id;
}

/**
 * Updates an existing Todo item
 */
export async function updateTodoItem(
  todoId: string,
  userId: string,
  updates: Partial<Todo>,
  isDemoMode: boolean
): Promise<void> {
  const now = new Date().toISOString();

  if (isDemoMode || !db) {
    const current = getLocalTodos(userId);
    const updated = current.map((item) =>
      item.id === todoId ? { ...item, ...updates, updatedAt: now } : item
    );
    saveLocalTodos(userId, updated);
    return;
  }

  const docRef = doc(db, 'todos', todoId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: now,
  });
}

/**
 * Toggles completion status of a Todo
 */
export async function toggleTodoCompletion(
  todoId: string,
  userId: string,
  currentStatus: boolean,
  isDemoMode: boolean
): Promise<void> {
  const completed = !currentStatus;
  const updates: Partial<Todo> = {
    completed,
    completedAt: completed ? new Date().toISOString() : undefined,
  };
  await updateTodoItem(todoId, userId, updates, isDemoMode);
}

/**
 * Deletes a Todo item
 */
export async function deleteTodoItem(
  todoId: string,
  userId: string,
  isDemoMode: boolean
): Promise<void> {
  if (isDemoMode || !db) {
    const current = getLocalTodos(userId);
    const filtered = current.filter((item) => item.id !== todoId);
    saveLocalTodos(userId, filtered);
    return;
  }

  const docRef = doc(db, 'todos', todoId);
  await deleteDoc(docRef);
}

/**
 * Updates subtask completion status within a Todo
 */
export async function toggleSubtask(
  todo: Todo,
  subtaskId: string,
  isDemoMode: boolean
): Promise<void> {
  const updatedSubtasks: Subtask[] = todo.subtasks.map((st) =>
    st.id === subtaskId ? { ...st, completed: !st.completed } : st
  );

  await updateTodoItem(todo.id, todo.userId, { subtasks: updatedSubtasks }, isDemoMode);
}

/**
 * Clears all completed todos for user
 */
export async function clearCompletedTodos(
  userId: string,
  todos: Todo[],
  isDemoMode: boolean
): Promise<void> {
  const completedList = todos.filter((t) => t.completed);
  for (const item of completedList) {
    await deleteTodoItem(item.id, userId, isDemoMode);
  }
}
