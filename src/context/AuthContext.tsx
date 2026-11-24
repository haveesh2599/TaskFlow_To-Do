import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  ensureUserDocument,
  logoutUser,
  updateUserProfileSettings,
} from '../firebase/auth';
import { auth } from '../firebase/firebase';
import type { TaskCategory, TaskPriority, UserProfile } from '../types/task';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  authLoading: boolean;
  profileReady: boolean;
  profileError: string | null;
  refreshAuthState: () => Promise<void>;
  retryProfileSync: () => Promise<void>;
  updateSettings: (updates: {
    displayName: string;
    defaultCategory: TaskCategory;
    defaultPriority: TaskPriority;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [profileReady, setProfileReady] = useState<boolean>(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const syncUserDoc = useCallback(async (firebaseUser: User | null) => {
    if (!firebaseUser || !firebaseUser.emailVerified) {
      setProfile(null);
      setProfileReady(false);
      setProfileError(null);
      return;
    }
    try {
      setProfileError(null);
      const loadedProfile = await ensureUserDocument(firebaseUser);
      setProfile(loadedProfile);
      setProfileReady(Boolean(loadedProfile));
    } catch (err) {
      console.error('Failed to sync user document:', err);
      setProfileReady(false);
      setProfileError(
        err instanceof Error ? err.message : 'Unable to connect to Cloud Firestore.'
      );
    }
  }, []);

  useEffect(() => {
    let settled = false;
    const fallbackTimer = window.setTimeout(() => {
      if (!settled) {
        setAuthLoading(false);
      }
    }, 3000);

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        settled = true;
        window.clearTimeout(fallbackTimer);
        setUser(firebaseUser);
        setAuthLoading(false);
        void syncUserDoc(firebaseUser);
      },
      (err) => {
        settled = true;
        window.clearTimeout(fallbackTimer);
        console.error('Auth state listener error:', err);
        setAuthLoading(false);
      }
    );

    return () => {
      window.clearTimeout(fallbackTimer);
      unsubscribe();
    };
  }, [syncUserDoc]);

  const refreshAuthState = useCallback(async () => {
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    const refreshed = auth.currentUser;
    setUser(refreshed);
    await syncUserDoc(refreshed);
  }, [syncUserDoc]);

  const retryProfileSync = useCallback(async () => {
    await syncUserDoc(auth.currentUser);
  }, [syncUserDoc]);

  const updateSettings = useCallback(
    async (updates: {
      displayName: string;
      defaultCategory: TaskCategory;
      defaultPriority: TaskPriority;
    }) => {
      if (!auth.currentUser) {
        throw new Error('You must be signed in to update settings.');
      }
      const updated = await updateUserProfileSettings(auth.currentUser, updates);
      setProfile((prev) => ({
        uid: updated.uid,
        displayName: updated.displayName,
        email: updated.email,
        defaultCategory: updated.defaultCategory,
        defaultPriority: updated.defaultPriority,
        createdAt: prev?.createdAt ?? null,
        updatedAt: updated.updatedAt,
      }));
      setUser(auth.currentUser);
    },
    []
  );

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    setProfile(null);
    setProfileReady(false);
    setProfileError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        authLoading,
        profileReady,
        profileError,
        refreshAuthState,
        retryProfileSync,
        updateSettings,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
