import React from 'react';
import { Search, ArrowUpDown, X, Filter, SlidersHorizontal } from 'lucide-react';
import { useTodos } from '../../context/TodoContext';
import type { Priority, TodoSortBy } from '../../types/todo';
import { PRIORITY_CONFIG } from '../../types/todo';

export const TodoFilters: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    selectedCategory,
    setSelectedCategory,
  } = useTodos();

  const hasActiveFilters =
    Boolean(searchQuery) || priorityFilter !== 'all' || selectedCategory !== null;

  const handleReset = () => {
    setSearchQuery('');
    setPriorityFilter('all');
    setSelectedCategory(null);
  };

  return (
    <div className="space-y-3">
      {/* Top row: Search input + Sort options */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks by title, note, or category..."
            className="w-full pl-10 pr-9 py-2 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as TodoSortBy)}
              className="bg-transparent border-none text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="createdAt">Date Created</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            className="p-2 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Priority Pill Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 sm:flex-wrap no-scrollbar">
        <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1 flex-shrink-0">
          <Filter className="w-3 h-3" /> Priority:
        </span>

        <button
          onClick={() => setPriorityFilter('all')}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex-shrink-0 ${
            priorityFilter === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          All
        </button>

        {(['urgent', 'high', 'medium', 'low'] as Priority[]).map((p) => {
          const config = PRIORITY_CONFIG[p];
          const isSelected = priorityFilter === p;
          return (
            <button
              key={p}
              onClick={() => setPriorityFilter(isSelected ? 'all' : p)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex-shrink-0 ${
                isSelected
                  ? `${config.badgeClass} shadow-sm ring-1 ring-indigo-500`
                  : 'bg-slate-100 dark:bg-slate-800/60 border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {config.label}
            </button>
          );
        })}

        {/* Selected Category Pill (if active) */}
        {selectedCategory && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex-shrink-0">
            Category: {selectedCategory}
            <button
              onClick={() => setSelectedCategory(null)}
              className="hover:text-rose-500"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        )}

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-medium ml-auto flex-shrink-0 pl-1"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};
