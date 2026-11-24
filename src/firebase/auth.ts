import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Timestamp,
} from 'firebase/firestore';
import {
  MAX_DISPLAY_NAME_LENGTH,
  TASK_CATEGORIES,
  TASK_PRIORITIES,
  type TaskCategory,
  type TaskPriority,
  type UserProfile,
} from '../types/task';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from './firebase';

function sanitizeDisplayName(rawName: string | null | undefined, email: string | null | undefined): string {
  const candidate = (rawName || email?.split('@')[0] || 'User').trim();
  return candidate.slice(0, MAX_DISPLAY_NAME_LENGTH) || 'User';
}

export function formatAuthError(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'An unexpected authentication error occurred.';
  }
  const code = 'code' in error ? String((error as { code?: unknown }).code) : '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please check your credentials and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email address already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment before trying again.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in window was closed before completing authentication.';
    case 'auth/popup-blocked':
      return 'Your browser blocked the sign-in popup. Please allow popups for this site.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not yet enabled in Firebase Authentication. Use Google Sign-In or enable Email/Password in your Firebase Console.';
    case 'auth/network-request-failed':
      return 'Network error while connecting to authentication service.';
    default:
      return error instanceof Error ? error.message : 'Authentication failed. Please try again.';
  }
}

export async function ensureUserDocument(user: User): Promise<UserProfile | null> {
  if (!user.emailVerified) {
    return null;
  }
  const path = `users/${user.uid}`;
  const userRef = doc(db, 'users', user.uid);
  let snap;
  try {
    snap = await getDoc(userRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  if (snap.exists()) {
    const data = snap.data();
    return {
      uid: String(data.uid || user.uid),
      displayName: String(data.displayName || sanitizeDisplayName(user.displayName, user.email)),
      email: String(data.email || user.email || ''),
      defaultCategory: TASK_CATEGORIES.includes(data.defaultCategory)
        ? (data.defaultCategory as TaskCategory)
        : 'Personal',
      defaultPriority: TASK_PRIORITIES.includes(data.defaultPriority)
        ? (data.defaultPriority as TaskPriority)
        : 'Medium',
      createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : null,
      updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate() : null,
    };
  }

  const displayName = sanitizeDisplayName(user.displayName, user.email);
  const email = (user.email || '').trim().slice(0, 254);

  try {
    await setDoc(userRef, {
      uid: user.uid,
      displayName,
      email,
      defaultCategory: 'Personal',
      defaultPriority: 'Medium',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }

  return {
    uid: user.uid,
    displayName,
    email,
    defaultCategory: 'Personal',
    defaultPriority: 'Medium',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function registerWithEmail(
  fullName: string,
  email: string,
  password: string
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const cleanName = sanitizeDisplayName(fullName, email);
  await updateProfile(credential.user, { displayName: cleanName });
  await sendEmailVerification(credential.user);
  return credential.user;
}

export async function loginWithEmail(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  if (credential.user.emailVerified) {
    await ensureUserDocument(credential.user);
  }
  return credential.user;
}

export async function loginWithGoogle(): Promise<User> {
  const credential = await signInWithPopup(auth, googleProvider);
  await ensureUserDocument(credential.user);
  return credential.user;
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email.trim());
}

export async function resendVerificationEmail(user: User): Promise<void> {
  await sendEmailVerification(user);
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function updateUserProfileSettings(
  user: User,
  updates: {
    displayName: string;
    defaultCategory: TaskCategory;
    defaultPriority: TaskPriority;
  }
): Promise<UserProfile> {
  const cleanName = sanitizeDisplayName(updates.displayName, user.email);
  const validCategory = TASK_CATEGORIES.includes(updates.defaultCategory)
    ? updates.defaultCategory
    : 'Personal';
  const validPriority = TASK_PRIORITIES.includes(updates.defaultPriority)
    ? updates.defaultPriority
    : 'Medium';

  if (user.displayName !== cleanName) {
    await updateProfile(user, { displayName: cleanName });
  }

  const path = `users/${user.uid}`;
  const userRef = doc(db, 'users', user.uid);
  try {
    await updateDoc(userRef, {
      displayName: cleanName,
      defaultCategory: validCategory,
      defaultPriority: validPriority,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }

  return {
    uid: user.uid,
    displayName: cleanName,
    email: user.email || '',
    defaultCategory: validCategory,
    defaultPriority: validPriority,
    createdAt: null,
    updatedAt: new Date(),
  };
}
