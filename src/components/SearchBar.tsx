import { RotateCcw, Search, X } from 'lucide-react';
import {
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  type StatusFilter,
  type TaskCategory,
  type TaskPriority,
  type TaskSortBy,
} from '../types/task';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  priority: TaskPriority | 'all';
  onPriorityChange: (value: TaskPriority | 'all') => void;
  category: TaskCategory | 'all';
  onCategoryChange: (value: TaskCategory | 'all') => void;
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  sortBy: TaskSortBy;
  onSortChange: (value: TaskSortBy) => void;
  showStatusFilter?: boolean;
  onReset: () => void;
}

export function SearchBar({
  searchQuery,
  onSearchChange,
  priority,
  onPriorityChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  sortBy,
  onSortChange,
  showStatusFilter = true,
  onReset,
}: SearchBarProps) {
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    priority !== 'all' ||
    category !== 'all' ||
    (showStatusFilter && status !== 'all') ||
    sortBy !== 'dueDate';

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E9E4] rounded-xl p-4 space-y-3">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="w-4 h-4 text-[#777F78] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks by title..."
            aria-label="Search tasks by title"
            className="w-full pl-9 pr-9 py-2 text-sm bg-[#F6F7F4] border border-[#E5E9E4] rounded-lg text-[#252A26] placeholder:text-[#777F78] focus:bg-[#FFFFFF] focus:border-[#52765D] focus:outline-none transition-colors"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#777F78] hover:text-[#252A26] rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5">
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value as TaskCategory | 'all')}
            aria-label="Filter by category"
            className="px-3 py-2 text-sm bg-[#F6F7F4] border border-[#E5E9E4] rounded-lg text-[#252A26] focus:bg-[#FFFFFF] focus:border-[#52765D] focus:outline-none cursor-pointer"
          >
            <option value="all">All categories</option>
            {TASK_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value as TaskPriority | 'all')}
            aria-label="Filter by priority"
            className="px-3 py-2 text-sm bg-[#F6F7F4] border border-[#E5E9E4] rounded-lg text-[#252A26] focus:bg-[#FFFFFF] focus:border-[#52765D] focus:outline-none cursor-pointer"
          >
            <option value="all">All priorities</option>
            {TASK_PRIORITIES.map((pri) => (
              <option key={pri} value={pri}>
                {pri} priority
              </option>
            ))}
          </select>

          {showStatusFilter ? (
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
              aria-label="Filter by completion status"
              className="px-3 py-2 text-sm bg-[#F6F7F4] border border-[#E5E9E4] rounded-lg text-[#252A26] focus:bg-[#FFFFFF] focus:border-[#52765D] focus:outline-none cursor-pointer"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          ) : null}

          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as TaskSortBy)}
            aria-label="Sort tasks"
            className="px-3 py-2 text-sm bg-[#F6F7F4] border border-[#E5E9E4] rounded-lg text-[#252A26] focus:bg-[#FFFFFF] focus:border-[#52765D] focus:outline-none cursor-pointer"
          >
            <option value="dueDate">Sort: Due date</option>
            <option value="priority">Sort: Priority</option>
            <option value="createdAt">Sort: Recently created</option>
          </select>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-[#777F78] hover:text-[#252A26] bg-[#F6F7F4] hover:bg-[#E5E9E4] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
