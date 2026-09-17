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
import {
  ref as rtdbRef,
  set as rtdbSet,
  update as rtdbUpdate,
  remove as rtdbRemove,
  onValue as rtdbOnValue,
} from 'firebase/database';
import { db, rtdb } from './firebase';
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
 * Recursively removes any keys with `undefined` values and ensures nested structures
 * are safe for Cloud Firestore.
 */
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      clean[key] = value.map((item) =>
        typeof item === 'object' && item !== null ? sanitizeForFirestore(item) : item
      );
    } else if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
      clean[key] = sanitizeForFirestore(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

export type DbSyncStatus = 'connected' | 'local_fallback';

export interface DbStatusDetail {
  status: DbSyncStatus;
  message?: string;
  error?: string;
  code?: string;
}

/**
 * Subscribes to real-time todos for a given user.
 * Maintains local-first reactivity while synchronizing with Firebase Realtime Database (or Firestore).
 */
export function subscribeToUserTodos(
  userId: string,
  _isDemoMode: boolean,
  callback: (todos: Todo[]) => void
): Unsubscribe {
  let isSubscribed = true;

  // Local emitter function
  const emitLocalTodos = () => {
    if (!isSubscribed) return;
    const todos = getLocalTodos(userId);
    callback(todos);
  };

  const handleLocalUpdate = () => {
    emitLocalTodos();
  };

  window.addEventListener('taskpulse:todos_updated', handleLocalUpdate);
  window.addEventListener('storage', handleLocalUpdate);

  // Emit local data immediately on mount for instantaneous zero-latency render
  emitLocalTodos();

  if (!rtdb && !db) {
    window.dispatchEvent(
      new CustomEvent('taskpulse:db_status', {
        detail: {
          status: 'local_fallback',
          message: 'Running in Local Storage Mode',
        } as DbStatusDetail,
      })
    );
    return () => {
      isSubscribed = false;
      window.removeEventListener('taskpulse:todos_updated', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
    };
  }

  // 1. Primary: Firebase Realtime Database synchronization
  const rtdbInstance = rtdb;
  if (rtdbInstance) {
    try {
      const todosRef = rtdbRef(rtdbInstance, 'todos');
      const unsubscribeRtdb = rtdbOnValue(
        todosRef,
        (snapshot) => {
          if (!isSubscribed) return;
          const val = snapshot.val();
          const remoteTodos: Todo[] = [];

          if (val && typeof val === 'object') {
            Object.entries(val).forEach(([key, item]: [string, any]) => {
              if (item && typeof item === 'object') {
                if (item.title !== undefined) {
                  // Direct child under /todos/{id}
                  remoteTodos.push({ ...(item as Omit<Todo, 'id'>), id: item.id || key });
                } else {
                  // Nested under /todos/{userId}/{id}
                  Object.entries(item).forEach(([childKey, childItem]: [string, any]) => {
                    if (childItem && typeof childItem === 'object' && childItem.title !== undefined) {
                      remoteTodos.push({ ...(childItem as Omit<Todo, 'id'>), id: childItem.id || childKey });
                    }
                  });
                }
              }
            });
          }

          if (remoteTodos.length > 0) {
            // Deduplicate by ID
            const uniqueMap = new Map<string, Todo>();
            remoteTodos.forEach((t) => {
              if (!uniqueMap.has(t.id)) {
                // Match user or allow demo user / unassigned
                if (!userId || t.userId === userId || userId === 'user_bala_demo' || !t.userId) {
                  uniqueMap.set(t.id, t);
                }
              }
            });
            const deduplicated = Array.from(uniqueMap.values());
            if (deduplicated.length > 0) {
              saveLocalTodos(userId, deduplicated);
              callback(deduplicated);
            } else {
              callback(getLocalTodos(userId));
            }
          } else {
            // If remote database has no tasks yet (val === null), sync initial local tasks to Firebase Realtime Database
            const locals = getLocalTodos(userId);
            callback(locals);
            const clearedKey = `taskpulse_cleared_${userId}`;
            if (locals.length > 0 && !localStorage.getItem(clearedKey)) {
              const initialBatch: Record<string, any> = {};
              locals.forEach((t) => {
                initialBatch[`todos/${t.id}`] = sanitizeForFirestore(t);
                initialBatch[`todos/${userId}/${t.id}`] = sanitizeForFirestore(t);
              });
              rtdbUpdate(rtdbRef(rtdbInstance), initialBatch).catch((err) => {
                console.warn('Initial RTDB sync notice:', err);
              });
            }
          }

          window.dispatchEvent(
            new CustomEvent('taskpulse:db_status', {
              detail: {
                status: 'connected',
                message: 'Connected to Firebase Realtime Database',
              } as DbStatusDetail,
            })
          );
        },
        (error) => {
          console.warn('Firebase Realtime Database sync notice:', error);
          window.dispatchEvent(
            new CustomEvent('taskpulse:db_status', {
              detail: {
                status: 'local_fallback',
                error: error.message,
                message: 'Operating in local offline storage mode.',
              } as DbStatusDetail,
            })
          );
          emitLocalTodos();
        }
      );

      return () => {
        isSubscribed = false;
        window.removeEventListener('taskpulse:todos_updated', handleLocalUpdate);
        window.removeEventListener('storage', handleLocalUpdate);
        try {
          unsubscribeRtdb();
        } catch {}
      };
    } catch (rtdbErr) {
      console.warn('Realtime Database setup notice:', rtdbErr);
    }
  }

  // 2. Secondary / Fallback: Cloud Firestore Mode
  let firestoreUnsubscribe: Unsubscribe = () => {};

  if (db) {
    try {
      const todosRef = collection(db, 'todos');
      const q = query(todosRef, where('userId', '==', userId));

      firestoreUnsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!isSubscribed) return;
          const remoteTodos: Todo[] = [];
          snapshot.forEach((docSnap) => {
            remoteTodos.push({
              ...(docSnap.data() as Omit<Todo, 'id'>),
              id: docSnap.id,
            });
          });

          if (remoteTodos.length > 0) {
            saveLocalTodos(userId, remoteTodos);
            callback(remoteTodos);
          } else {
            const locals = getLocalTodos(userId);
            callback(locals);
          }

          window.dispatchEvent(
            new CustomEvent('taskpulse:db_status', {
              detail: {
                status: 'connected',
                message: 'Connected to Cloud Firestore',
              } as DbStatusDetail,
            })
          );
        },
        (error) => {
          console.warn('Firestore sync notice:', error);
          window.dispatchEvent(
            new CustomEvent('taskpulse:db_status', {
              detail: {
                status: 'local_fallback',
                error: error.message,
                message: 'Operating in local offline storage mode.',
              } as DbStatusDetail,
            })
          );
          emitLocalTodos();
        }
      );
    } catch (error) {
      console.warn('Firestore subscription setup notice:', error);
      emitLocalTodos();
    }
  }

  return () => {
    isSubscribed = false;
    window.removeEventListener('taskpulse:todos_updated', handleLocalUpdate);
    window.removeEventListener('storage', handleLocalUpdate);
    try {
      firestoreUnsubscribe();
    } catch {}
  };
}

/**
 * Adds a new Todo item with local-first guarantee and Firebase Realtime Database synchronization
 */
export async function addTodoItem(
  todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>,
  _isDemoMode: boolean
): Promise<string> {
  const now = new Date().toISOString();
  const localId = 'todo-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

  const newTodo: Todo = {
    ...todoData,
    id: localId,
    description: todoData.description || '',
    dueDate: todoData.dueDate || getTodayDateString(),
    dueTime: todoData.dueTime || '18:00',
    createdAt: now,
    updatedAt: now,
    subtasks: todoData.subtasks || [],
  };

  // 1. Immediately persist locally (Guaranteed local storage & instant UI reactivity)
  const current = getLocalTodos(todoData.userId);
  saveLocalTodos(todoData.userId, [newTodo, ...current]);

  // 2. Primary: Store in Firebase Realtime Database
  if (rtdb) {
    try {
      const sanitized = sanitizeForFirestore({ ...newTodo });
      // Store at /todos/{localId}
      await rtdbSet(rtdbRef(rtdb, `todos/${localId}`), sanitized);
      // Also store at /todos/{userId}/{localId} for nested user path compatibility
      await rtdbSet(rtdbRef(rtdb, `todos/${todoData.userId}/${localId}`), sanitized).catch(() => {});
      console.log('Saved todo to Firebase Realtime Database:', localId);
      return localId;
    } catch (rtdbErr: any) {
      console.warn(
        'Firebase Realtime Database storage notice (local copy preserved):',
        rtdbErr?.message || rtdbErr
      );
    }
  }

  // 3. Secondary / Fallback: Cloud Firestore
  if (db) {
    try {
      const sanitized = sanitizeForFirestore({ ...newTodo });
      delete sanitized.id;
      const docRef = await addDoc(collection(db, 'todos'), sanitized);
      const updatedLocals = getLocalTodos(todoData.userId).map((t) =>
        t.id === localId ? { ...t, id: docRef.id } : t
      );
      saveLocalTodos(todoData.userId, updatedLocals);
      return docRef.id;
    } catch (cloudErr: any) {
      console.warn(
        'Cloud Firestore storage notice (local copy preserved):',
        cloudErr?.message || cloudErr
      );
    }
  }

  return localId;
}

/**
 * Updates an existing Todo item with local-first guarantee and Firebase Realtime Database synchronization
 */
export async function updateTodoItem(
  todoId: string,
  userId: string,
  updates: Partial<Todo>,
  _isDemoMode: boolean
): Promise<void> {
  const now = new Date().toISOString();

  // 1. Update locally first for instantaneous feedback
  const current = getLocalTodos(userId);
  const updated = current.map((item) =>
    item.id === todoId ? { ...item, ...updates, updatedAt: now } : item
  );
  saveLocalTodos(userId, updated);

  // 2. Primary: Update in Firebase Realtime Database
  if (rtdb) {
    try {
      const sanitized = sanitizeForFirestore({
        ...updates,
        updatedAt: now,
      });
      // Update at /todos/{todoId}
      await rtdbUpdate(rtdbRef(rtdb, `todos/${todoId}`), sanitized);
      // Also update at /todos/{userId}/{todoId}
      await rtdbUpdate(rtdbRef(rtdb, `todos/${userId}/${todoId}`), sanitized).catch(() => {});
    } catch (rtdbErr: any) {
      console.warn(
        'Firebase Realtime Database update notice (local update preserved):',
        rtdbErr?.message || rtdbErr
      );
    }
  }

  // 3. Secondary: Update in Cloud Firestore
  if (db) {
    try {
      const sanitized = sanitizeForFirestore({
        ...updates,
        updatedAt: now,
      });
      delete sanitized.id;
      const docRef = doc(db, 'todos', todoId);
      await updateDoc(docRef, sanitized);
    } catch (cloudErr: any) {
      console.warn(
        'Cloud Firestore update notice (local update preserved):',
        cloudErr?.message || cloudErr
      );
    }
  }
}

/**
 * Deletes a Todo item with local-first guarantee and Firebase Realtime Database synchronization
 */
export async function deleteTodoItem(
  todoId: string,
  userId: string,
  _isDemoMode: boolean
): Promise<void> {
  // 1. Delete locally first
  const current = getLocalTodos(userId);
  const filtered = current.filter((item) => item.id !== todoId);
  saveLocalTodos(userId, filtered);

  // 2. Primary: Delete from Firebase Realtime Database
  if (rtdb) {
    try {
      await rtdbRemove(rtdbRef(rtdb, `todos/${todoId}`));
      await rtdbRemove(rtdbRef(rtdb, `todos/${userId}/${todoId}`)).catch(() => {});
    } catch (rtdbErr: any) {
      console.warn(
        'Firebase Realtime Database delete notice (local delete preserved):',
        rtdbErr?.message || rtdbErr
      );
    }
  }

  // 3. Secondary: Delete from Cloud Firestore
  if (db) {
    try {
      const docRef = doc(db, 'todos', todoId);
      await deleteDoc(docRef);
    } catch (cloudErr: any) {
      console.warn(
        'Cloud Firestore delete notice (local delete preserved):',
        cloudErr?.message || cloudErr
      );
    }
  }
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
    completedAt: completed ? new Date().toISOString() : '',
  };
  await updateTodoItem(todoId, userId, updates, isDemoMode);
}

/**
 * Updates subtask completion status within a Todo
 */
export async function toggleSubtask(
  todo: Todo,
  subtaskId: string,
  isDemoMode: boolean
): Promise<void> {
  const updatedSubtasks: Subtask[] = (todo.subtasks || []).map((st) =>
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
