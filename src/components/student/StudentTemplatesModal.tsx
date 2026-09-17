import React, { useState } from 'react';
import { X, Sparkles, Plus, Check, BookOpen, Briefcase, Code, CheckCircle2 } from 'lucide-react';
import { STUDENT_TEMPLATES, PRIORITY_CONFIG } from '../../types/todo';
import { useTodos } from '../../context/TodoContext';
import { getTodayDateString } from '../../utils/dateUtils';
import type { StudentTemplate } from '../../types/todo';

interface StudentTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentTemplatesModal: React.FC<StudentTemplatesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addTodo } = useTodos();
  const [addedTemplateId, setAddedTemplateId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApplyTemplate = async (tpl: StudentTemplate) => {
    await addTodo({
      title: tpl.title,
      description: tpl.description,
      dueDate: getTodayDateString(),
      dueTime: '18:00',
      priority: tpl.priority,
      category: tpl.category,
      completed: false,
      subtasks: tpl.subtasks.map((st) => ({
        id: 'st-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
        title: st.title,
        completed: false,
      })),
      reminder: '15m',
    });

    setAddedTemplateId(tpl.id);
    setTimeout(() => {
      setAddedTemplateId(null);
      onClose();
    }, 600);
  };

  const getTemplateIcon = (category: string) => {
    switch (category) {
      case 'Coding & DSA':
        return <Code className="w-5 h-5 text-emerald-500" />;
      case 'Placement & Career':
        return <Briefcase className="w-5 h-5 text-sky-500" />;
      case 'Academics & Exams':
      default:
        return <BookOpen className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col glass-modal rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile grab bar indicator */}
        <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mt-2.5 sm:hidden" />

        {/* Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-display">
                Fresher & Student Templates
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                1-click starter tasks for placements, exams, DSA, and projects
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close templates modal"
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Cards List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))]">
          {STUDENT_TEMPLATES.map((tpl) => {
            const priority = PRIORITY_CONFIG[tpl.priority];
            const isAdded = addedTemplateId === tpl.id;

            return (
              <div
                key={tpl.id}
                className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/70 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700/60 mt-0.5">
                    {getTemplateIcon(tpl.category)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                        {tpl.category}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${priority.badgeClass}`}>
                        {priority.label}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {tpl.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      {tpl.description}
                    </p>

                    {/* Subtask checklist preview */}
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {tpl.subtasks.map((st) => (
                        <span
                          key={st.id}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3 text-slate-400" />
                          <span>{st.title}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  disabled={isAdded}
                  className={`py-2.5 sm:py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all whitespace-nowrap self-stretch sm:self-auto justify-center touch-manipulation active:scale-95 ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add to Today</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
