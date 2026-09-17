import React, { useState } from 'react';
import { TodoCard } from './TodoCard';
import { CreateTodoModal } from './CreateTodoModal';
import type { Todo } from '../../types/todo';
import { CheckCircle, Plus } from 'lucide-react';
import { useTodos } from '../../context/TodoContext';

interface TodoListProps {
  todos: Todo[];
  emptyMessage?: string;
  emptySubtext?: string;
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  emptyMessage = 'No tasks found',
  emptySubtext = 'Add a new task or adjust your filters to view tasks here.',
}) => {
  const { openCreateModal } = useTodos();
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  if (todos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mb-3">
          <CheckCircle className="w-7 h-7" />
        </div>
        <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 font-display">
          {emptyMessage}
        </h4>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
          {emptySubtext}
        </p>
        <button
          type="button"
          onClick={() => openCreateModal()}
          className="mt-4 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Task</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {todos.map((todo) => (
        <TodoCard key={todo.id} todo={todo} onEdit={(t) => setEditingTodo(t)} />
      ))}

      {editingTodo && (
        <CreateTodoModal
          isOpen={Boolean(editingTodo)}
          onClose={() => setEditingTodo(null)}
          preset={editingTodo}
        />
      )}
    </div>
  );
};
