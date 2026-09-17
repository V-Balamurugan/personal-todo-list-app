import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Flag,
  Tag,
  Bell,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import type { Todo, Priority, ReminderOffset, Subtask } from '../../types/todo';
import { DEFAULT_CATEGORIES, PRIORITY_CONFIG } from '../../types/todo';
import { useTodos } from '../../context/TodoContext';
import {
  getTodayDateString,
  getTomorrowDateString,
  isTaskFromPreviousDay,
  formatTaskDueDate,
} from '../../utils/dateUtils';
import { SubtaskList } from './SubtaskList';
import { addDays, format } from 'date-fns';

interface CreateTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  preset?: Partial<Todo> | null;
}

export const CreateTodoModal: React.FC<CreateTodoModalProps> = ({
  isOpen,
  onClose,
  preset,
}) => {
  const { addTodo, updateTodo } = useTodos();

  const isEditing = Boolean(preset?.id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<string>(getTodayDateString());
  const [dueTime, setDueTime] = useState<string>('18:00');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<string>('Coding & DSA');
  const [reminder, setReminder] = useState<ReminderOffset>('15m');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [customCategory, setCustomCategory] = useState('');
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);

  useEffect(() => {
    if (preset) {
      setTitle(preset.title || '');
      setDescription(preset.description || '');
      setDueDate(preset.dueDate || getTodayDateString());
      setDueTime(preset.dueTime || '18:00');
      setPriority(preset.priority || 'medium');
      setCategory(preset.category || 'Coding & DSA');
      setReminder(preset.reminder || '15m');
      setSubtasks(preset.subtasks || []);
    } else {
      setTitle('');
      setDescription('');
      setDueDate(getTodayDateString());
      setDueTime('18:00');
      setPriority('medium');
      setCategory('Coding & DSA');
      setReminder('15m');
      setSubtasks([]);
    }
  }, [preset, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleQuickDatePreset = (daysOffset: number) => {
    if (daysOffset === 0) {
      setDueDate(getTodayDateString());
    } else if (daysOffset === 1) {
      setDueDate(getTomorrowDateString());
    } else {
      setDueDate(format(addDays(new Date(), daysOffset), 'yyyy-MM-dd'));
    }
  };

  const handleAddSubtask = (stTitle: string) => {
    setSubtasks((prev) => [
      ...prev,
      {
        id: 'st-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
        title: stTitle,
        completed: false,
      },
    ]);
  };

  const handleRemoveSubtask = (stId: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== stId));
  };

  const handleToggleSubtask = (stId: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === stId ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const chosenCategory = isAddingCustomCategory && customCategory.trim()
      ? customCategory.trim()
      : category;

    if (isEditing && preset?.id) {
      await updateTodo(preset.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        priority,
        category: chosenCategory,
        reminder,
        subtasks,
      });
    } else {
      await addTodo({
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate || undefined,
        dueTime: dueTime || undefined,
        priority,
        category: chosenCategory,
        completed: false,
        subtasks,
        reminder,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-xl max-h-[90vh] flex flex-col glass-modal rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
              {isEditing ? 'Edit Task' : 'Create New Task'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need to accomplish?"
              className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 font-medium text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Notes / Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, links, or context..."
              className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Date & Time Settings */}
          <div className="space-y-3">
            {isEditing && preset?.dueDate && isTaskFromPreviousDay(preset.dueDate) && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-300 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="text-xs text-amber-900 dark:text-amber-200">
                  <span className="font-bold">Previous day deadline:</span> Task was scheduled for{' '}
                  <span className="font-semibold underline">{formatTaskDueDate(preset.dueDate, preset.dueTime)}</span>.
                </div>
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleQuickDatePreset(0)}
                    className="px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    Move to Today
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDatePreset(1)}
                    className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-all"
                  >
                    To Tomorrow
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    Due Date
                  </label>
                  {/* Fast Presets */}
                  <div className="flex gap-1 text-[11px] flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleQuickDatePreset(0)}
                      className={`px-2 py-0.5 rounded transition-colors ${
                        dueDate === getTodayDateString()
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-slate-200/80 dark:bg-slate-800 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDatePreset(1)}
                      className={`px-2 py-0.5 rounded transition-colors ${
                        dueDate === getTomorrowDateString()
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-slate-200/80 dark:bg-slate-800 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDatePreset(2)}
                      className="px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/50 text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      +2d
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDatePreset(7)}
                      className="px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/50 text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      +1w
                    </button>
                  </div>
                </div>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Due Time
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
              <Flag className="w-3.5 h-3.5 text-indigo-500" />
              Priority Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['low', 'medium', 'high', 'urgent'] as Priority[]).map((p) => {
                const config = PRIORITY_CONFIG[p];
                const isSelected = priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border text-center transition-all ${
                      isSelected
                        ? `${config.badgeClass} ring-2 ring-indigo-500/40 shadow-sm scale-102`
                        : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                Category
              </label>
              <button
                type="button"
                onClick={() => setIsAddingCustomCategory(!isAddingCustomCategory)}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                {isAddingCustomCategory ? 'Use preset' : '+ Custom'}
              </button>
            </div>

            {isAddingCustomCategory ? (
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Enter custom category name..."
                className="w-full px-3.5 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <div className="flex flex-wrap gap-2">
                {DEFAULT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                      category === cat.name
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Smart Reminder Alert Preference */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-indigo-500" />
              Smart Reminder Alert
            </label>
            <select
              value={reminder}
              onChange={(e) => setReminder(e.target.value as ReminderOffset)}
              className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="at_due">At time of task</option>
              <option value="15m">15 minutes before</option>
              <option value="30m">30 minutes before</option>
              <option value="1h">1 hour before</option>
              <option value="1d">1 day before</option>
            </select>
          </div>

          {/* Subtasks / Checklist */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Subtasks & Checklist
            </label>
            <SubtaskList
              subtasks={subtasks}
              onToggle={handleToggleSubtask}
              onAddSubtask={handleAddSubtask}
              onRemoveSubtask={handleRemoveSubtask}
            />
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>{isEditing ? 'Save Changes' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
