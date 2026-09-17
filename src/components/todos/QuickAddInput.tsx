import React, { useState } from 'react';
import { Plus, SlidersHorizontal, Loader2, Sparkles } from 'lucide-react';
import { useTodos } from '../../context/TodoContext';
import { getTodayDateString } from '../../utils/dateUtils';
import { StudentTemplatesModal } from '../student/StudentTemplatesModal';

interface QuickAddInputProps {
  placeholder?: string;
  defaultCategory?: string;
}

export const QuickAddInput: React.FC<QuickAddInputProps> = ({
  placeholder = 'Add a quick task... (Press Enter to save)',
  defaultCategory = 'Coding & DSA',
}) => {
  const { addTodo, openCreateModal } = useTodos();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || loading) return;

    setLoading(true);
    try {
      await addTodo({
        title: title.trim(),
        dueDate: getTodayDateString(),
        dueTime: '18:00',
        priority: 'medium',
        category: defaultCategory,
        completed: false,
        subtasks: [],
      });
      setTitle('');
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="relative group">
        <div className="flex items-center gap-2 p-1.5 pl-4 bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-none text-slate-900 dark:text-white placeholder-slate-400 text-sm font-medium focus:outline-none"
          />

          {/* Student & Fresher Templates Button */}
          <button
            type="button"
            onClick={() => setIsTemplatesOpen(true)}
            title="Browse student & placement templates"
            className="hidden sm:flex items-center gap-1 py-1.5 px-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-semibold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Templates</span>
          </button>

          {/* Detailed options modal trigger */}
          <button
            type="button"
            onClick={() => openCreateModal({ title: title.trim() || undefined })}
            title="Open detailed task editor"
            className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Quick add action button */}
          <button
            type="submit"
            disabled={!title.trim() || loading}
            className="py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm shadow-indigo-600/30 transition-all"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span className="hidden sm:inline">Add</span>
              </>
            )}
          </button>
        </div>
      </form>

      <StudentTemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
      />
    </>
  );
};
