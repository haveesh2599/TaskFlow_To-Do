import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarDays, Plus, X } from 'lucide-react';
import { CalendarView } from '../components/CalendarView';
import { TaskCard } from '../components/TaskCard';
import { EmptyState, TaskListSkeleton } from '../components/TaskStateViews';
import type { Task } from '../types/task';

interface UpcomingProps {
  allTasks: Task[];
  overdueTasks: Task[];
  todayTasks: Task[];
  tomorrowTasks: Task[];
  thisWeekTasks: Task[];
  getTasksForDate: (date: Date) => Task[];
  loading: boolean;
  onToggleComplete: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onAddTaskForDate: (date?: Date) => void;
}

export function Upcoming({
  allTasks,
  overdueTasks,
  todayTasks,
  tomorrowTasks,
  thisWeekTasks,
  getTasksForDate,
  loading,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onAddTaskForDate,
}: UpcomingProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];
  const activeToday = todayTasks.filter((t) => !t.completed);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      <div className="lg:col-span-2 space-y-6">
        {loading ? (
          <TaskListSkeleton rows={4} />
        ) : selectedDate ? (
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FFFFFF] border border-[#E5E9E4] rounded-xl px-4 py-3">
              <div>
                <h2 className="text-base font-semibold text-[#252A26]">
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </h2>
                <p className="text-xs text-[#777F78] tabular-nums">
                  {selectedDateTasks.length}{' '}
                  {selectedDateTasks.length === 1 ? 'task' : 'tasks'} scheduled
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onAddTaskForDate(selectedDate)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#52765D] hover:bg-[#42634C] rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Add for date</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#777F78] hover:text-[#252A26] bg-[#F6F7F4] hover:bg-[#E5E9E4] rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>All upcoming</span>
                </button>
              </div>
            </div>

            {selectedDateTasks.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="No tasks on this date"
                description={`Nothing is scheduled for ${format(selectedDate, 'MMMM d, yyyy')}.`}
                actionLabel="Schedule Task"
                onAction={() => onAddTaskForDate(selectedDate)}
              />
            ) : (
              <div className="space-y-2.5">
                {selectedDateTasks.map((task) => (
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
        ) : (
          <>
            {overdueTasks.length > 0 ? (
              <section className="space-y-2.5">
                <h2 className="text-sm font-semibold text-[#D65B55] tabular-nums">
                  Overdue ({overdueTasks.length})
                </h2>
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

            <section className="space-y-2.5">
              <h2 className="text-sm font-semibold text-[#252A26] tabular-nums">
                Today ({activeToday.length})
              </h2>
              {activeToday.length === 0 ? (
                <p className="text-sm text-[#777F78] bg-[#FFFFFF] border border-[#E5E9E4] rounded-lg px-4 py-3">
                  No pending tasks due today.
                </p>
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

            <section className="space-y-2.5">
              <h2 className="text-sm font-semibold text-[#252A26] tabular-nums">
                Tomorrow ({tomorrowTasks.length})
              </h2>
              {tomorrowTasks.length === 0 ? (
                <p className="text-sm text-[#777F78] bg-[#FFFFFF] border border-[#E5E9E4] rounded-lg px-4 py-3">
                  No tasks scheduled for tomorrow.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {tomorrowTasks.map((task) => (
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

            <section className="space-y-2.5">
              <h2 className="text-sm font-semibold text-[#252A26] tabular-nums">
                This Week ({thisWeekTasks.length})
              </h2>
              {thisWeekTasks.length === 0 ? (
                <p className="text-sm text-[#777F78] bg-[#FFFFFF] border border-[#E5E9E4] rounded-lg px-4 py-3">
                  No additional tasks due later this week.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {thisWeekTasks.map((task) => (
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
          </>
        )}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6">
        <CalendarView
          tasks={allTasks}
          selectedDate={selectedDate}
          onSelectDate={(date) => setSelectedDate(date)}
        />
        <p className="text-xs text-[#777F78] px-1 leading-relaxed">
          Select any date on the calendar to inspect scheduled tasks or add a task
          directly to that day.
        </p>
      </aside>
    </div>
  );
}
