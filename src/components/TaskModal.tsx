import { useEffect, useState, type FormEvent } from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import {
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  type Task,
  type TaskCategory,
  type TaskInput,
  type TaskPriority,
} from '../types/task';

interface TaskModalProps {
  open: boolean;
  editingTask: Task | null;
  defaultCategory?: TaskCategory;
  defaultPriority?: TaskPriority;
  defaultDate?: Date;
  onClose: () => void;
  onSubmit: (input: TaskInput) => Promise<void>;
}

function parseLocalDateInput(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  const [year, month, day] = parts;
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function TaskModal({
  open,
  editingTask,
  defaultCategory = 'Personal',
  defaultPriority = 'Medium',
  defaultDate,
  onClose,
  onSubmit,
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>(defaultCategory);
  const [priority, setPriority] = useState<TaskPriority>(defaultPriority);
  const [dueDateStr, setDueDateStr] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [completed, setCompleted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setCategory(editingTask.category);
      setPriority(editingTask.priority);
      setDueDateStr(format(editingTask.dueDate, 'yyyy-MM-dd'));
      setDueTime(editingTask.dueTime || '');
      setCompleted(editingTask.completed);
    } else {
      setTitle('');
      setDescription('');
      setCategory(defaultCategory);
      setPriority(defaultPriority);
      setDueDateStr(format(defaultDate || new Date(), 'yyyy-MM-dd'));
      setDueTime('');
      setCompleted(false);
    }
    setValidationError(null);
    setSubmitting(false);
  }, [open, editingTask, defaultCategory, defaultPriority, defaultDate]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, submitting, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setValidationError('Please enter a task title.');
      return;
    }
    if (trimmedTitle.length > MAX_TITLE_LENGTH) {
      setValidationError(`Task title cannot exceed ${MAX_TITLE_LENGTH} characters.`);
      return;
    }
    if (description.trim().length > MAX_DESCRIPTION_LENGTH) {
      setValidationError(
        `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters.`
      );
      return;
    }
    const parsedDate = parseLocalDateInput(dueDateStr);
    if (!parsedDate) {
      setValidationError('Please select a valid due date.');
      return;
    }

    setValidationError(null);
    setSubmitting(true);
    try {
      await onSubmit({
        title: trimmedTitle,
        description: description.trim(),
        category,
        priority,
        dueDate: parsedDate,
        dueTime: dueTime.trim(),
        completed,
      });
      onClose();
    } catch (err) {
      setValidationError(
        err instanceof Error ? err.message : 'Unable to save task. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#252A26]/35 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
      onClick={() => {
        if (!submitting) onClose();
      }}
    >
      <div
        className="w-full max-w-lg bg-[#FFFFFF] border border-[#E5E9E4] rounded-xl p-6 shadow-md my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#E5E9E4]">
          <h2 id="task-modal-title" className="text-lg font-semibold text-[#252A26]">
            {editingTask ? 'Edit Task' : 'New Task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close modal"
            className="p-1.5 text-[#777F78] hover:text-[#252A26] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          {validationError ? (
            <div
              role="alert"
              className="px-3.5 py-2.5 text-sm text-[#B3433E] bg-[#FBECEB] border border-[#EBC3C1] rounded-lg"
            >
              {validationError}
            </div>
          ) : null}

          <div>
            <label
              htmlFor="task-title"
              className="block text-sm font-medium text-[#252A26] mb-1.5"
            >
              Task title <span className="text-[#D65B55]">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={MAX_TITLE_LENGTH}
              placeholder="e.g., Prepare quarterly project review"
              autoFocus
              className="w-full px-3.5 py-2.5 text-sm bg-[#FFFFFF] border border-[#E5E9E4] rounded-lg text-[#252A26] placeholder:text-[#777F78] focus:border-[#52765D] focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="task-description"
                className="block text-sm font-medium text-[#252A26]"
              >
                Description
              </label>
              <span className="text-xs text-[#777F78] tabular-nums">
                {description.length}/{MAX_DESCRIPTION_LENGTH}
              </span>
            </div>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={MAX_DESCRIPTION_LENGTH}
              rows={3}
              placeholder="Optional notes, context, or checklist details"
              className="w-full px-3.5 py-2.5 text-sm bg-[#FFFFFF] border border-[#E5E9E4] rounded-lg text-[#252A26] placeholder:text-[#777F78] focus:border-[#52765D] focus:outline-none resize-y"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="task-category"
                className="block text-sm font-medium text-[#252A26] mb-1.5"
              >
                Category
              </label>
              <select
                id="task-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FFFFFF] border border-[#E5E9E4] rounded-lg text-[#252A26] focus:border-[#52765D] focus:outline-none cursor-pointer"
              >
                {TASK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="block text-sm font-medium text-[#252A26] mb-1.5">
                Priority
              </span>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F6F7F4] border border-[#E5E9E4] rounded-lg">
                {TASK_PRIORITIES.map((pri) => {
                  const active = priority === pri;
                  const activeClass =
                    pri === 'High'
                      ? 'bg-[#FFFFFF] text-[#B3433E] shadow-xs font-semibold'
                      : pri === 'Medium'
                        ? 'bg-[#FFFFFF] text-[#A6711F] shadow-xs font-semibold'
                        : 'bg-[#FFFFFF] text-[#3F8559] shadow-xs font-semibold';
                  return (
                    <button
                      key={pri}
                      type="button"
                      onClick={() => setPriority(pri)}
                      aria-pressed={active}
                      className={`py-1.5 text-xs rounded-md transition-colors cursor-pointer ${
                        active
                          ? activeClass
                          : 'text-[#777F78] hover:text-[#252A26] font-medium'
                      }`}
                    >
                      {pri}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="task-due-date"
                className="block text-sm font-medium text-[#252A26] mb-1.5"
              >
                Due date <span className="text-[#D65B55]">*</span>
              </label>
              <input
                id="task-due-date"
                type="date"
                value={dueDateStr}
                onChange={(e) => setDueDateStr(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FFFFFF] border border-[#E5E9E4] rounded-lg text-[#252A26] focus:border-[#52765D] focus:outline-none tabular-nums"
              />
            </div>

            <div>
              <label
                htmlFor="task-due-time"
                className="block text-sm font-medium text-[#252A26] mb-1.5"
              >
                Due time <span className="text-[#777F78] font-normal">(optional)</span>
              </label>
              <input
                id="task-due-time"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-[#FFFFFF] border border-[#E5E9E4] rounded-lg text-[#252A26] focus:border-[#52765D] focus:outline-none tabular-nums"
              />
            </div>
          </div>

          {editingTask ? (
            <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
                className="w-4 h-4 accent-[#52765D] rounded cursor-pointer"
              />
              <span className="text-sm text-[#252A26]">Mark task as completed</span>
            </label>
          ) : null}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E9E4]">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-[#252A26] bg-[#F6F7F4] hover:bg-[#E5E9E4] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-[#52765D] hover:bg-[#42634C] rounded-lg transition-colors cursor-pointer disabled:opacity-60"
            >
              {submitting
                ? 'Saving...'
                : editingTask
                  ? 'Save Changes'
                  : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
