import React, { useState } from 'react';
import { Plus, X, Check } from 'lucide-react';
import type { Subtask } from '../../types/todo';

interface SubtaskListProps {
  subtasks: Subtask[];
  onToggle?: (id: string) => void;
  onAddSubtask?: (title: string) => void;
  onRemoveSubtask?: (id: string) => void;
  readOnly?: boolean;
}

export const SubtaskList: React.FC<SubtaskListProps> = ({
  subtasks,
  onToggle,
  onAddSubtask,
  onRemoveSubtask,
  readOnly = false,
}) => {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const completedCount = subtasks.filter((s) => s.completed).length;
  const totalCount = subtasks.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAdd = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!newSubtaskTitle.trim() || !onAddSubtask) return;
    onAddSubtask(newSubtaskTitle.trim());
    setNewSubtaskTitle('');
  };

  return (
    <div className="space-y-2.5">
      {totalCount > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Checklist ({completedCount}/{totalCount})
          </span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-semibold text-slate-700 dark:text-slate-300">{progress}%</span>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {subtasks.map((st) => (
          <div
            key={st.id}
            className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 group"
          >
            <div className="flex items-center gap-2.5 flex-1 min-w-0 select-none">
              <button
                type="button"
                onClick={() => onToggle && onToggle(st.id)}
                className={`w-4 h-4 rounded-md flex items-center justify-center transition-all flex-shrink-0 ${
                  st.completed
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'border-2 border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                }`}
              >
                {st.completed && <Check className="w-3 h-3 stroke-[3]" />}
              </button>
              <span
                onClick={() => onToggle && onToggle(st.id)}
                className={`text-xs truncate transition-all cursor-pointer ${
                  st.completed
                    ? 'line-through text-slate-400 dark:text-slate-500'
                    : 'text-slate-800 dark:text-slate-200 font-medium'
                }`}
              >
                {st.title}
              </span>
            </div>

            {!readOnly && onRemoveSubtask && (
              <button
                type="button"
                onClick={() => onRemoveSubtask(st.id)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {!readOnly && onAddSubtask && (
        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd();
              }
            }}
            placeholder="Add a checklist item..."
            className="flex-1 px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newSubtaskTitle.trim()}
            className="p-1.5 px-3 bg-slate-200 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-300 disabled:opacity-40 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      )}
    </div>
  );
};
