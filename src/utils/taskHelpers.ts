import { format, isBefore, isToday, isTomorrow, startOfDay } from 'date-fns';
import type {
  StatusFilter,
  Task,
  TaskCategory,
  TaskPriority,
  TaskSortBy,
} from '../types/task';

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

export function isTaskOverdue(task: Task, referenceDate: Date = new Date()): boolean {
  if (task.completed) return false;
  const todayStart = startOfDay(referenceDate);
  const dueDay = startOfDay(task.dueDate);

  if (isBefore(dueDay, todayStart)) {
    return true;
  }

  if (isToday(task.dueDate) && task.dueTime) {
    const [hoursStr, minutesStr] = task.dueTime.split(':');
    const dueWithTime = new Date(task.dueDate);
    dueWithTime.setHours(Number(hoursStr), Number(minutesStr), 0, 0);
    return isBefore(dueWithTime, referenceDate);
  }

  return false;
}

export function formatDueDateLabel(dueDate: Date, dueTime?: string): string {
  let dayLabel: string;
  if (isToday(dueDate)) {
    dayLabel = 'Today';
  } else if (isTomorrow(dueDate)) {
    dayLabel = 'Tomorrow';
  } else {
    dayLabel = format(dueDate, 'MMM d, yyyy');
  }

  if (dueTime && dueTime.trim()) {
    const [h, m] = dueTime.split(':').map(Number);
    const temp = new Date();
    temp.setHours(h, m, 0, 0);
    return `${dayLabel} at ${format(temp, 'h:mm a')}`;
  }

  return dayLabel;
}

export function getPriorityMeta(priority: TaskPriority): {
  label: string;
  textClass: string;
  bgClass: string;
} {
  switch (priority) {
    case 'High':
      return {
        label: 'High',
        textClass: 'text-[#B3433E]',
        bgClass: 'bg-[#FBECEB]',
      };
    case 'Medium':
      return {
        label: 'Medium',
        textClass: 'text-[#A6711F]',
        bgClass: 'bg-[#FBF3E4]',
      };
    case 'Low':
      return {
        label: 'Low',
        textClass: 'text-[#3F8559]',
        bgClass: 'bg-[#EAF1EA]',
      };
  }
}

export function getCategoryMeta(category: TaskCategory): {
  label: string;
  textClass: string;
  bgClass: string;
} {
  switch (category) {
    case 'Work':
      return { label: 'Work', textClass: 'text-[#42634C]', bgClass: 'bg-[#EAF1EA]' };
    case 'Study':
      return { label: 'Study', textClass: 'text-[#6E5C38]', bgClass: 'bg-[#F5F1E6]' };
    case 'Personal':
      return { label: 'Personal', textClass: 'text-[#3D5C53]', bgClass: 'bg-[#E9F1EE]' };
    case 'Shopping':
      return { label: 'Shopping', textClass: 'text-[#735A43]', bgClass: 'bg-[#F5EFE9]' };
    case 'Health':
      return { label: 'Health', textClass: 'text-[#3F8559]', bgClass: 'bg-[#E9F3EC]' };
    case 'Other':
      return { label: 'Other', textClass: 'text-[#5A625B]', bgClass: 'bg-[#EFF1EE]' };
  }
}

export function sortTasks(items: Task[], sortBy: TaskSortBy): Task[] {
  const copy = [...items];
  copy.sort((a, b) => {
    if (sortBy === 'priority') {
      const diff = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
      if (diff !== 0) return diff;
      return a.dueDate.getTime() - b.dueDate.getTime();
    }
    if (sortBy === 'createdAt') {
      return b.createdAt.getTime() - a.createdAt.getTime();
    }
    const dateDiff = startOfDay(a.dueDate).getTime() - startOfDay(b.dueDate).getTime();
    if (dateDiff !== 0) return dateDiff;
    if (a.dueTime && b.dueTime) {
      return a.dueTime.localeCompare(b.dueTime);
    }
    if (a.dueTime) return -1;
    if (b.dueTime) return 1;
    return PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
  });
  return copy;
}

export function filterAndSortTasks(
  tasks: Task[],
  options: {
    searchQuery: string;
    priority: TaskPriority | 'all';
    category: TaskCategory | 'all';
    status: StatusFilter;
    sortBy: TaskSortBy;
  }
): Task[] {
  const queryLower = options.searchQuery.trim().toLowerCase();

  const filtered = tasks.filter((task) => {
    if (queryLower) {
      const matchesTitle = task.title.toLowerCase().includes(queryLower);
      const matchesDesc = task.description.toLowerCase().includes(queryLower);
      if (!matchesTitle && !matchesDesc) return false;
    }
    if (options.priority !== 'all' && task.priority !== options.priority) {
      return false;
    }
    if (options.category !== 'all' && task.category !== options.category) {
      return false;
    }
    if (options.status === 'pending' && task.completed) {
      return false;
    }
    if (options.status === 'completed' && !task.completed) {
      return false;
    }
    return true;
  });

  return sortTasks(filtered, options.sortBy);
}

export function getGreetingByTime(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
