import { Sun } from 'lucide-react';
import { TaskCard } from '../components/TaskCard';
import { EmptyState, TaskListSkeleton } from '../components/TaskStateViews';
import type { Task } from '../types/task';

interface TodayProps {
  todayTasks: Task[];
  overdueTasks: Task[];
  loading: boolean;
  onToggleComplete: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onAddTask: () => void;
}

export function Today({
  todayTasks,
  overdueTasks,
  loading,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onAddTask,
}: TodayProps) {
  const activeToday = todayTasks.filter((t) => !t.completed);
  const completedToday = todayTasks.filter((t) => t.completed);

  return (
    <div className="space-y-6">
      {loading ? (
        <TaskListSkeleton rows={4} />
      ) : (
        <>
          {overdueTasks.length > 0 ? (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#D65B55]">
                  Overdue ({overdueTasks.length})
                </h2>
              </div>
              <div className="space-y-2.5">
                {overdueTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-[#252A26] tabular-nums">
              Due Today ({activeToday.length})
            </h2>

            {activeToday.length === 0 ? (
              <EmptyState
                icon={Sun}
                title="All caught up for today"
                description="No pending tasks are scheduled for today. Add a task if something comes up."
                actionLabel="Add Task for Today"
                onAction={onAddTask}
              />
            ) : (
              <div className="space-y-2.5">
                {activeToday.map((task) => (
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

          {completedToday.length > 0 ? (
            <section className="space-y-3 pt-2">
              <h2 className="text-sm font-semibold text-[#777F78] tabular-nums">
                Completed Today ({completedToday.length})
              </h2>
              <div className="space-y-2.5">
                {completedToday.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
