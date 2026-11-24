export type TaskCategory =
  | 'Personal'
  | 'Study'
  | 'Work'
  | 'Shopping'
  | 'Health'
  | 'Other';

export type TaskPriority = 'Low' | 'Medium' | 'High';

export type NavSection =
  | 'dashboard'
  | 'my-tasks'
  | 'today'
  | 'upcoming'
  | 'completed'
  | 'categories'
  | 'settings';

export type TaskSortBy = 'dueDate' | 'priority' | 'createdAt';
export type StatusFilter = 'all' | 'pending' | 'completed';

export const TASK_CATEGORIES: readonly TaskCategory[] = [
  'Personal',
  'Study',
  'Work',
  'Shopping',
  'Health',
  'Other',
] as const;

export const TASK_PRIORITIES: readonly TaskPriority[] = [
  'Low',
  'Medium',
  'High',
] as const;

export const MAX_TITLE_LENGTH = 200;
export const MAX_DESCRIPTION_LENGTH = 2000;
export const MAX_DISPLAY_NAME_LENGTH = 100;
export const DUE_TIME_REGEX = /^(|([01]\d|2[0-3]):[0-5]\d)$/;

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: Date;
  dueTime: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskInput {
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: Date;
  dueTime: string;
  completed?: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  defaultCategory: TaskCategory;
  defaultPriority: TaskPriority;
  createdAt: Date | null;
  updatedAt: Date | null;
}
