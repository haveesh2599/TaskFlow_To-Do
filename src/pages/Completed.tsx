import { useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { TaskCard } from '../components/TaskCard';
import { EmptyState, TaskListSkeleton } from '../components/TaskStateViews';
import type { Task, TaskCategory, TaskPriority, TaskSortBy } from '../types/task';
import { filterAndSortTasks } from '../utils/taskHelpers';

interface CompletedProps {
  completedTasks: Task[];
  loading: boolean;
  onToggleComplete: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

export function Completed({
  completedTasks,
  loading,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
}: CompletedProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [priority, setPriority] = useState<TaskPriority | 'all'>('all');
  const [category, setCategory] = useState<TaskCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<TaskSortBy>('createdAt');

  const filtered = useMemo(
    () =>
      filterAndSortTasks(completedTasks, {
        searchQuery,
        priority,
        category,
        status: 'completed',
        sortBy,
      }),
    [completedTasks, searchQuery, priority, category, sortBy]
  );

  const handleReset = () => {
    setSearchQuery('');
    setPriority('all');
    setCategory('all');
    setSortBy('createdAt');
  };

  return (
    <div className="space-y-5">
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        priority={priority}
        onPriorityChange={setPriority}
        category={category}
        onCategoryChange={setCategory}
        status="completed"
        onStatusChange={() => {}}
        sortBy={sortBy}
        onSortChange={setSortBy}
        showStatusFilter={false}
        onReset={handleReset}
      />

      {loading ? (
        <TaskListSkeleton rows={4} />
      ) : completedTasks.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No completed tasks yet"
          description="Tasks you mark as completed will be archived here for reference."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No matching completed tasks"
          description="Try clearing your search or filters to view completed items."
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((task) => (
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
    </div>
  );
}
