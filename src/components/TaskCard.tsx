import { Calendar, Check, Pencil, Trash2 } from 'lucide-react';
import type { Task } from '../types/task';
import {
  formatDueDateLabel,
  getCategoryMeta,
  getPriorityMeta,
  isTaskOverdue,
} from '../utils/taskHelpers';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  compact?: boolean;
}

export function TaskCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  compact = false,
}: TaskCardProps) {
  const overdue = isTaskOverdue(task);
  const priorityMeta = getPriorityMeta(task.priority);
  const categoryMeta = getCategoryMeta(task.category);
  const dueLabel = formatDueDateLabel(task.dueDate, task.dueTime);

  return (
    <div
      className={`group bg-[#FFFFFF] border border-[#E5E9E4] rounded-lg transition-colors hover:border-[#CFD6CE] ${
        compact ? 'px-4 py-3' : 'px-4 sm:px-5 py-4'
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onToggleComplete(task)}
          role="checkbox"
          aria-checked={task.completed}
          aria-label={
            task.completed
              ? `Mark "${task.title}" as pending`
              : `Mark "${task.title}" as completed`
          }
          className="mt-0.5 w-6 h-6 -m-0.5 flex items-center justify-center rounded cursor-pointer shrink-0"
        >
          <span
            className={`w-[18px] h-[18px] rounded flex items-center justify-center border transition-colors ${
              task.completed
                ? 'bg-[#52765D] border-[#52765D] text-white'
                : 'bg-[#FFFFFF] border-[#C5CCC4] group-hover:border-[#52765D]'
            }`}
          >
            {task.completed ? (
              <Check className="w-3 h-3 stroke-[2.5]" aria-hidden="true" />
            ) : null}
          </span>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3
                className={`text-[15px] font-medium leading-snug break-words ${
                  task.completed
                    ? 'line-through text-[#777F78]'
                    : 'text-[#252A26]'
                }`}
              >
                {task.title}
              </h3>
              {task.description && !compact ? (
                <p
                  className={`text-sm mt-1 leading-relaxed line-clamp-2 break-words ${
                    task.completed ? 'text-[#9AA19B]' : 'text-[#777F78]'
                  }`}
                >
                  {task.description}
                </p>
              ) : null}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => onEdit(task)}
                aria-label={`Edit task "${task.title}"`}
                className="p-2 text-[#777F78] hover:text-[#252A26] hover:bg-[#F6F7F4] rounded-md transition-colors cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(task)}
                aria-label={`Delete task "${task.title}"`}
                className="p-2 text-[#777F78] hover:text-[#D65B55] hover:bg-[#FBECEB] rounded-md transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-2.5 text-xs">
            <span
              className={`inline-flex items-center gap-1.5 tabular-nums ${
                overdue
                  ? 'text-[#D65B55] font-medium'
                  : 'text-[#777F78]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{overdue ? `Overdue · ${dueLabel}` : dueLabel}</span>
            </span>

            <span className="text-[#D4DAD3]" aria-hidden="true">
              ·
            </span>

            <span
              className={`inline-block px-2 py-0.5 rounded font-medium ${categoryMeta.bgClass} ${categoryMeta.textClass}`}
            >
              {categoryMeta.label}
            </span>

            <span
              className={`inline-block px-2 py-0.5 rounded font-medium ${priorityMeta.bgClass} ${priorityMeta.textClass}`}
            >
              {priorityMeta.label} priority
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
