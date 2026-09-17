import React, { useState } from 'react';
import {
  Check,
  AlertCircle,
  Calendar,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import type { Todo } from '../../types/todo';
import { PRIORITY_CONFIG } from '../../types/todo';
import { useTodos } from '../../context/TodoContext';
import {
  formatTaskDueDate,
  isTaskOverdue,
  isTaskDueToday,
  isTaskFromPreviousDay,
} from '../../utils/dateUtils';
import { SubtaskList } from './SubtaskList';

interface TodoCardProps {
  todo: Todo;
  onEdit?: (todo: Todo) => void;
}

export const TodoCard: React.FC<TodoCardProps> = ({ todo, onEdit }) => {
  const { toggleComplete, deleteTodo, toggleSubtaskCheck, rescheduleToToday, rescheduleToTomorrow } = useTodos();
  const [showSubtasks, setShowSubtasks] = useState(false);

  const priorityMeta = PRIORITY_CONFIG[todo.priority] || PRIORITY_CONFIG.medium;
  const isOverdue = !todo.completed && isTaskOverdue(todo.dueDate, todo.dueTime);
  const isFromPrevDay = !todo.completed && isTaskFromPreviousDay(todo.dueDate);
  const isToday = !todo.completed && isTaskDueToday(todo.dueDate);

  const subtasksCount = todo.subtasks?.length || 0;
  const completedSubtasks = todo.subtasks?.filter((s) => s.completed).length || 0;

  return (
    <div
      className={`group rounded-2xl border transition-all duration-150 ${
        todo.completed
          ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/50 opacity-60'
          : isOverdue
          ? 'bg-white dark:bg-slate-900 border-rose-200 dark:border-rose-900/60 shadow-sm'
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-800'
      } p-4 sm:p-4.5`}
    >
      <div className="flex items-start gap-3">
        {/* Simple Round Checkbox */}
        <button
          type="button"
          onClick={() => toggleComplete(todo.id)}
          aria-label={todo.completed ? 'Mark incomplete' : 'Mark complete'}
          className={`w-5 h-5 rounded-full mt-0.5 flex items-center justify-center transition-all flex-shrink-0 ${
            todo.completed
              ? 'bg-emerald-500 text-white'
              : 'border-2 border-slate-300 dark:border-slate-600 hover:border-indigo-500 hover:scale-105'
          }`}
        >
          {todo.completed && <Check className="w-3 h-3 stroke-[3]" />}
        </button>

        {/* Task Core Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            {/* Category */}
            {todo.category && (
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">
                {todo.category}
              </span>
            )}

            {/* Priority dot / badge */}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${priorityMeta.badgeClass}`}>
              {priorityMeta.label}
            </span>

            {/* Due date */}
            {todo.dueDate && (
              <span
                className={`text-[11px] font-medium flex items-center gap-1 px-1.5 py-0.5 rounded ${
                  todo.completed
                    ? 'text-slate-400'
                    : isOverdue
                    ? 'text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-950/60'
                    : isToday
                    ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/60'
                    : 'text-slate-400'
                }`}
              >
                {isOverdue ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                <span>{formatTaskDueDate(todo.dueDate, todo.dueTime)}</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            className={`text-sm sm:text-base font-semibold transition-all ${
              todo.completed
                ? 'line-through text-slate-400 dark:text-slate-500'
                : 'text-slate-900 dark:text-white'
            }`}
          >
            {todo.title}
          </h3>

          {/* Description */}
          {todo.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
              {todo.description}
            </p>
          )}

          {/* Checklist footer */}
          <div className="flex items-center gap-3 mt-2">
            {subtasksCount > 0 && (
              <button
                type="button"
                onClick={() => setShowSubtasks(!showSubtasks)}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
              >
                <span>
                  Checklist ({completedSubtasks}/{subtasksCount})
                </span>
                {showSubtasks ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}

            {(isOverdue || isFromPrevDay) && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => rescheduleToToday(todo.id)}
                  title="Move deadline to Today"
                  className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:underline flex items-center gap-1 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-lg border border-rose-200/80 dark:border-rose-900/80 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Move to Today</span>
                </button>
                <button
                  type="button"
                  onClick={() => rescheduleToTomorrow(todo.id)}
                  title="Move deadline to Tomorrow"
                  className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <ArrowRight className="w-3 h-3" />
                  <span>To Tomorrow</span>
                </button>
              </div>
            )}
          </div>

          {/* Subtasks dropdown container */}
          {showSubtasks && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
              <SubtaskList
                subtasks={todo.subtasks || []}
                onToggle={(stId) => toggleSubtaskCheck(todo.id, stId)}
                readOnly={todo.completed}
              />
            </div>
          )}
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-0.5 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && !todo.completed && (
            <button
              type="button"
              onClick={() => onEdit(todo)}
              title="Edit"
              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => deleteTodo(todo.id)}
            title="Delete"
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
