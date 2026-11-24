import { useMemo, useState } from 'react';
import { FolderKanban, Plus } from 'lucide-react';
import { TaskCard } from '../components/TaskCard';
import { EmptyState, TaskListSkeleton } from '../components/TaskStateViews';
import { TASK_CATEGORIES, type Task, type TaskCategory } from '../types/task';
import { getCategoryMeta, sortTasks } from '../utils/taskHelpers';

interface CategoriesProps {
  tasks: Task[];
  categoryCounts: Record<
    TaskCategory,
    { total: number; pending: number; completed: number }
  >;
  loading: boolean;
  onToggleComplete: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onAddTaskInCategory: (category: TaskCategory) => void;
}

export function Categories({
  tasks,
  categoryCounts,
  loading,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onAddTaskInCategory,
}: CategoriesProps) {
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory>('Personal');

  const categoryTasks = useMemo(
    () =>
      sortTasks(
        tasks.filter((t) => t.category === selectedCategory),
        'dueDate'
      ),
    [tasks, selectedCategory]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {TASK_CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category;
          const counts = categoryCounts[category];
          const meta = getCategoryMeta(category);

          return (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              aria-pressed={isSelected}
              className={`text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-[#EAF1EA] border-[#52765D]'
                  : 'bg-[#FFFFFF] border-[#E5E9E4] hover:border-[#CFD6CE]'
              }`}
            >
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 ${meta.bgClass} ${meta.textClass}`}
              >
                {category}
              </span>
              <p className="text-xl font-semibold text-[#252A26] tabular-nums">
                {counts.pending}
              </p>
              <p className="text-xs text-[#777F78] tabular-nums mt-0.5">
                {counts.total} total
              </p>
            </button>
          );
        })}
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-[#252A26]">
            {selectedCategory} Tasks
          </h2>
          <button
            type="button"
            onClick={() => onAddTaskInCategory(selectedCategory)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#52765D] bg-[#EAF1EA] hover:bg-[#DCE7DC] rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add to {selectedCategory}</span>
          </button>
        </div>

        {loading ? (
          <TaskListSkeleton rows={3} />
        ) : categoryTasks.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title={`No tasks in ${selectedCategory}`}
            description={`Keep track of your ${selectedCategory.toLowerCase()} activities by adding a task here.`}
            actionLabel={`Add ${selectedCategory} Task`}
            onAction={() => onAddTaskInCategory(selectedCategory)}
          />
        ) : (
          <div className="space-y-2.5">
            {categoryTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
