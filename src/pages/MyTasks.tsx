import { useMemo, useState } from 'react';
import { ListTodo } from 'lucide-react';
import { SearchBar } from '../components/SearchBar';
import { TaskCard } from '../components/TaskCard';
import { EmptyState, TaskListSkeleton } from '../components/TaskStateViews';
import type {
  StatusFilter,
  Task,
  TaskCategory,
  TaskPriority,
  TaskSortBy,
} from '../types/task';
import { filterAndSortTasks } from '../utils/taskHelpers';

interface MyTasksProps {
  tasks: Task[];
  loading: boolean;
  onToggleComplete: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onAddTask: () => void;
}

export function MyTasks({
  tasks,
  loading,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onAddTask,
}: MyTasksProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [priority, setPriority] = useState<TaskPriority | 'all'>('all');
  const [category, setCategory] = useState<TaskCategory | 'all'>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<TaskSortBy>('dueDate');

  const filteredTasks = useMemo(
    () =>
      filterAndSortTasks(tasks, {
        searchQuery,
        priority,
        category,
        status,
        sortBy,
      }),
    [tasks, searchQuery, priority, category, status, sortBy]
  );

  const handleReset = () => {
    setSearchQuery('');
    setPriority('all');
    setCategory('all');
    setStatus('all');
    setSortBy('dueDate');
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
        status={status}
        onStatusChange={setStatus}
        sortBy={sortBy}
        onSortChange={setSortBy}
        onReset={handleReset}
      />

      {!loading ? (
        <div className="flex items-center justify-between text-xs text-[#777F78] px-1">
          <span className="tabular-nums">
            Showing {filteredTasks.length} of {tasks.length}{' '}
            {tasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>
      ) : null}

      {loading ? (
        <TaskListSkeleton rows={5} />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="No tasks created yet"
          description="Create your first task to start organizing your schedule and priorities."
          actionLabel="Create First Task"
          onAction={onAddTask}
        />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="No matching tasks"
          description="Try adjusting your search query or clearing active filters."
        />
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => (
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
