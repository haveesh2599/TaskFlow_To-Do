import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import {
  DUE_TIME_REGEX,
  MAX_DESCRIPTION_LENGTH,
  MAX_TITLE_LENGTH,
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  type Task,
  type TaskCategory,
  type TaskInput,
  type TaskPriority,
} from '../types/task';
import { db, handleFirestoreError, OperationType } from './firebase';

function validateAndSanitizeTaskInput(input: TaskInput): {
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: Timestamp;
  dueTime: string;
  completed: boolean;
} {
  const title = input.title.trim().slice(0, MAX_TITLE_LENGTH);
  if (!title) {
    throw new Error('Task title is required.');
  }

  const description = input.description.trim().slice(0, MAX_DESCRIPTION_LENGTH);
  const category = TASK_CATEGORIES.includes(input.category) ? input.category : 'Personal';
  const priority = TASK_PRIORITIES.includes(input.priority) ? input.priority : 'Medium';
  const dueTime = DUE_TIME_REGEX.test(input.dueTime.trim()) ? input.dueTime.trim() : '';

  const validDate =
    input.dueDate instanceof Date && !Number.isNaN(input.dueDate.getTime())
      ? input.dueDate
      : new Date();

  return {
    title,
    description,
    category,
    priority,
    dueDate: Timestamp.fromDate(validDate),
    dueTime,
    completed: Boolean(input.completed),
  };
}

export function subscribeToUserTasks(
  uid: string,
  onTasks: (tasks: Task[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const path = `users/${uid}/tasks`;
  const tasksRef = collection(db, 'users', uid, 'tasks');
  const q = query(tasksRef, where('userId', '==', uid));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Task[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const dueTs = data.dueDate as Timestamp | undefined;
        const createdTs = data.createdAt as Timestamp | undefined;
        const updatedTs = data.updatedAt as Timestamp | undefined;

        return {
          id: docSnap.id,
          userId: String(data.userId || uid),
          title: String(data.title || ''),
          description: String(data.description || ''),
          category: TASK_CATEGORIES.includes(data.category)
            ? (data.category as TaskCategory)
            : 'Other',
          priority: TASK_PRIORITIES.includes(data.priority)
            ? (data.priority as TaskPriority)
            : 'Medium',
          dueDate: dueTs ? dueTs.toDate() : new Date(),
          dueTime: String(data.dueTime || ''),
          completed: Boolean(data.completed),
          createdAt: createdTs ? createdTs.toDate() : new Date(),
          updatedAt: updatedTs ? updatedTs.toDate() : new Date(),
        };
      });
      onTasks(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export async function createTask(uid: string, input: TaskInput): Promise<string> {
  const payload = validateAndSanitizeTaskInput(input);
  const newDocRef = doc(collection(db, 'users', uid, 'tasks'));
  const path = `users/${uid}/tasks/${newDocRef.id}`;

  try {
    await setDoc(newDocRef, {
      userId: uid,
      title: payload.title,
      description: payload.description,
      category: payload.category,
      priority: payload.priority,
      dueDate: payload.dueDate,
      dueTime: payload.dueTime,
      completed: payload.completed,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return newDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateTask(
  uid: string,
  taskId: string,
  input: TaskInput
): Promise<void> {
  const payload = validateAndSanitizeTaskInput(input);
  const path = `users/${uid}/tasks/${taskId}`;
  const taskRef = doc(db, 'users', uid, 'tasks', taskId);

  try {
    await updateDoc(taskRef, {
      title: payload.title,
      description: payload.description,
      category: payload.category,
      priority: payload.priority,
      dueDate: payload.dueDate,
      dueTime: payload.dueTime,
      completed: payload.completed,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function toggleTaskCompletion(
  uid: string,
  taskId: string,
  completed: boolean
): Promise<void> {
  const path = `users/${uid}/tasks/${taskId}`;
  const taskRef = doc(db, 'users', uid, 'tasks', taskId);

  try {
    await updateDoc(taskRef, {
      completed,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteTask(uid: string, taskId: string): Promise<void> {
  const path = `users/${uid}/tasks/${taskId}`;
  const taskRef = doc(db, 'users', uid, 'tasks', taskId);

  try {
    await deleteDoc(taskRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
