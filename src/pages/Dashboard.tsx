import { formatDistanceToNow } from 'date-fns';
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock,
  ListChecks,
  Sun,
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { TaskCard } from '../components/TaskCard';
import { EmptyState, TaskListSkeleton } from '../components/TaskStateViews';
import type { TaskStats } from '../hooks/useTasks';
import type { NavSection, Task } from '../types/task';

interface DashboardProps {
  stats: TaskStats;
  todayTasks: Task[];
  upcomingTasks: Task[];
  recentActivity: Task[];
  loading: boolean;
  onToggleComplete: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onAddTask: () => void;
  onNavigate: (section: NavSection) => void;
}

export function Dashboard({
  stats,
  todayTasks,
  upcomingTasks,
  recentActivity,
  loading,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onAddTask,
  onNavigate,
}: DashboardProps) {
  const previewToday = todayTasks.slice(0, 5);
  const previewUpcoming = upcomingTasks.filter(
    (t) => !todayTasks.some((today) => today.id === t.id)
  ).slice(0, 4);

  return (
    <div className="space-y-6">
      <section aria-label="Task statistics">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Total Tasks"
            value={stats.total}
            icon={ListChecks}
            tone="neutral"
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            icon={CheckCircle2}
            tone="success"
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            icon={Clock}
            tone="warning"
          />
          <StatCard
            label="Overdue"
            value={stats.overdue}
            icon={AlertCircle}
            tone="danger"
          />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-[#252A26]">
                Today&apos;s Tasks
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('today')}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#52765D] hover:text-[#42634C] cursor-pointer"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            {loading ? (
              <TaskListSkeleton rows={3} />
            ) : previewToday.length === 0 ? (
              <EmptyState
                icon={Sun}
                title="No tasks scheduled for today"
                description="Add a task for today to keep your priorities front and center."
                actionLabel="Add Task"
                onAction={onAddTask}
              />
            ) : (
              <div className="space-y-2.5">
                {previewToday.map((task) => (
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

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-[#252A26]">
                Upcoming Tasks
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('upcoming')}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#52765D] hover:text-[#42634C] cursor-pointer"
              >
                <span>Open schedule</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            {loading ? (
              <TaskListSkeleton rows={2} />
            ) : previewUpcoming.length === 0 ? (
              <EmptyState
                icon={CalendarClock}
                title="No upcoming deadlines"
                description="Tasks scheduled for tomorrow and later this week will appear here."
              />
            ) : (
              <div className="space-y-2.5">
                {previewUpcoming.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    compact
                    onToggleComplete={onToggleComplete}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className="bg-[#FFFFFF] border border-[#E5E9E4] rounded-xl p-5">
            <div className="flex items-baseline justify-between gap-2 mb-3">
              <h2 className="text-base font-semibold text-[#252A26]">
                Completion Progress
              </h2>
              <span className="text-lg font-semibold text-[#52765D] tabular-nums">
                {stats.completionRate}%
              </span>
            </div>

            <div
              className="w-full h-2 bg-[#EAF1EA] rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={stats.completionRate}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Overall task completion progress"
            >
              <div
                className="h-full bg-[#52765D] rounded-full transition-all duration-300"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>

            <p className="text-xs text-[#777F78] mt-3 tabular-nums">
              {stats.completed} of {stats.total} {stats.total === 1 ? 'task' : 'tasks'}{' '}
              completed
            </p>
          </section>

          <section className="bg-[#FFFFFF] border border-[#E5E9E4] rounded-xl p-5">
            <h2 className="text-base font-semibold text-[#252A26] mb-3">
              Recent Activity
            </h2>

            {loading ? (
              <div className="space-y-3 animate-pulse">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-10 bg-[#F6F7F4] rounded-lg" />
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-[#777F78]">
                Recent task updates will appear here once you start tracking tasks.
              </p>
            ) : (
              <ul className="divide-y divide-[#E5E9E4]">
                {recentActivity.map((item) => (
                  <li key={item.id} className="py-2.5 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            item.completed
                              ? 'line-through text-[#777F78]'
                              : 'text-[#252A26]'
                          }`}
                        >
                          {item.title}
                        </p>
                        <p className="text-xs text-[#777F78] mt-0.5">
                          {item.completed ? 'Completed' : 'Updated'} ·{' '}
                          <span className="tabular-nums">
                            {formatDistanceToNow(item.updatedAt, {
                              addSuffix: true,
                            })}
                          </span>
                        </p>
                      </div>
                      <span className="text-xs text-[#777F78] shrink-0">
                        {item.category}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
