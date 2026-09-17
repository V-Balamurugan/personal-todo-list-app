import React, { useEffect, useState, useRef } from 'react';
import { Search, X, Calendar, ArrowRight, Tag } from 'lucide-react';
import { useTodos } from '../../context/TodoContext';
import { PRIORITY_CONFIG } from '../../types/todo';
import { formatTaskDueDate } from '../../utils/dateUtils';
import type { Todo } from '../../types/todo';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTodo?: (todo: Todo) => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTodo,
}) => {
  const { todos, setActiveView } = useTodos();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? todos.filter(
        (t) =>
          t.title.toLowerCase().includes(query.toLowerCase()) ||
          (t.description && t.description.toLowerCase().includes(query.toLowerCase())) ||
          t.category.toLowerCase().includes(query.toLowerCase())
      )
    : todos.slice(0, 5); // Show first 5 recents if query is empty

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xl glass-modal rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-slide-down flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-500 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search all tasks..."
            className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 font-medium text-base focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {query.trim() ? `Search Results (${filtered.length})` : 'Recent Tasks'}
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No tasks matching "{query}"
            </div>
          ) : (
            filtered.map((item) => {
              const priority = PRIORITY_CONFIG[item.priority] || PRIORITY_CONFIG.medium;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (onSelectTodo) onSelectTodo(item);
                    setActiveView('all');
                    onClose();
                  }}
                  className="p-3 rounded-2xl hover:bg-indigo-50/70 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between gap-3 group transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${priority.badgeClass}`}
                      >
                        {priority.label}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-indigo-400" />
                        {item.category}
                      </span>
                    </div>
                    <h5
                      className={`text-sm font-semibold truncate ${
                        item.completed
                          ? 'line-through text-slate-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {item.title}
                    </h5>
                  </div>

                  {item.dueDate && (
                    <span className="text-xs text-slate-400 flex items-center gap-1 flex-shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatTaskDueDate(item.dueDate, item.dueTime)}
                    </span>
                  )}

                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
