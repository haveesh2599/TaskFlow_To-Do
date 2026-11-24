import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addDays,
  endOfDay,
  isAfter,
  isBefore,
  isSameDay,
  isToday,
  isTomorrow,
  startOfDay,
} from 'date-fns';
import { useAuth } from '../context/AuthContext';
import {
  createTask,
  deleteTask,
  subscribeToUserTasks,
  toggleTaskCompletion,
  updateTask,
} from '../firebase/tasks';
import {
  TASK_CATEGORIES,
  type Task,
  type TaskCategory,
  type TaskInput,
} from '../types/task';
import { isTaskOverdue, sortTasks } from '../utils/taskHelpers';

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  completionRate: number;
}

export function useTasks() {
  const { user, authLoading, profileReady } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!user || !user.emailVerified || !profileReady) {
      setTasks([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToUserTasks(
      user.uid,
      (incomingTasks) => {
        setTasks(incomingTasks);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, authLoading, profileReady]);

  const addTask = useCallback(
    async (input: TaskInput) => {
      if (!user) throw new Error('You must be signed in to create a task.');
      return createTask(user.uid, input);
    },
    [user]
  );

  const editTask = useCallback(
    async (taskId: string, input: TaskInput) => {
      if (!user) throw new Error('You must be signed in to update a task.');
      return updateTask(user.uid, taskId, input);
    },
    [user]
  );

  const toggleComplete = useCallback(
    async (taskId: string, nextCompleted: boolean) => {
      if (!user) throw new Error('You must be signed in to update a task.');
      return toggleTaskCompletion(user.uid, taskId, nextCompleted);
    },
    [user]
  );

  const removeTask = useCallback(
    async (taskId: string) => {
      if (!user) throw new Error('You must be signed in to delete a task.');
      return deleteTask(user.uid, taskId);
    },
    [user]
  );

  const derived = useMemo(() => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekEnd = endOfDay(addDays(todayStart, 6));

    const completedTasks = tasks.filter((t) => t.completed);
    const pendingTasks = tasks.filter((t) => !t.completed);
    const overdueTasks = pendingTasks.filter((t) => isTaskOverdue(t, now));
    const todayTasks = sortTasks(
      tasks.filter((t) => isToday(t.dueDate)),
      'dueDate'
    );
    const tomorrowTasks = sortTasks(
      pendingTasks.filter((t) => isTomorrow(t.dueDate)),
      'dueDate'
    );
    const thisWeekTasks = sortTasks(
      pendingTasks.filter((t) => {
        const d = startOfDay(t.dueDate);
        return (
          !isToday(d) &&
          !isTomorrow(d) &&
          !isBefore(d, todayStart) &&
          !isAfter(d, weekEnd)
        );
      }),
      'dueDate'
    );
    const upcomingTasks = sortTasks(
      pendingTasks.filter((t) => !isBefore(startOfDay(t.dueDate), todayStart)),
      'dueDate'
    );

    const recentActivity = [...tasks]
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 6);

    const categoryCounts = TASK_CATEGORIES.reduce<Record<TaskCategory, { total: number; pending: number; completed: number }>>(
      (acc, cat) => {
        const matching = tasks.filter((t) => t.category === cat);
        acc[cat] = {
          total: matching.length,
          pending: matching.filter((t) => !t.completed).length,
          completed: matching.filter((t) => t.completed).length,
        };
        return acc;
      },
      {
        Personal: { total: 0, pending: 0, completed: 0 },
        Study: { total: 0, pending: 0, completed: 0 },
        Work: { total: 0, pending: 0, completed: 0 },
        Shopping: { total: 0, pending: 0, completed: 0 },
        Health: { total: 0, pending: 0, completed: 0 },
        Other: { total: 0, pending: 0, completed: 0 },
      }
    );

    const stats: TaskStats = {
      total: tasks.length,
      completed: completedTasks.length,
      pending: pendingTasks.length,
      overdue: overdueTasks.length,
      completionRate:
        tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0,
    };

    const getTasksForDate = (date: Date) =>
      sortTasks(
        tasks.filter((t) => isSameDay(t.dueDate, date)),
        'dueDate'
      );

    return {
      stats,
      completedTasks: sortTasks(completedTasks, 'createdAt'),
      pendingTasks: sortTasks(pendingTasks, 'dueDate'),
      overdueTasks: sortTasks(overdueTasks, 'dueDate'),
      todayTasks,
      tomorrowTasks,
      thisWeekTasks,
      upcomingTasks,
      recentActivity,
      categoryCounts,
      getTasksForDate,
    };
  }, [tasks]);

  return {
    tasks,
    loading,
    error,
    addTask,
    editTask,
    toggleComplete,
    removeTask,
    ...derived,
  };
}
