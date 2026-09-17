import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../services/firebase';
import type { AppUser } from '../types/auth';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isDemoMode: boolean;
  error: string | null;
  register: (email: string, pass: string, name: string) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsDemo: (customName?: string) => void;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_STORAGE_KEY = 'taskpulse_demo_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check if user is logged into Demo mode in localStorage
    const savedDemo = localStorage.getItem(DEMO_USER_STORAGE_KEY);
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo);
        setUser(parsed);
        setIsDemoMode(true);
        setLoading(false);
        return;
      } catch {
        // ignore
      }
    }

    // 2. If Firebase is configured and available, listen to auth state changes
    if (isFirebaseConfigured() && auth) {
      const unsubscribe = onAuthStateChanged(
        auth,
        (fbUser: FirebaseUser | null) => {
          if (fbUser) {
            setUser({
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
              photoURL: fbUser.photoURL,
              isAnonymous: fbUser.isAnonymous,
            });
            setIsDemoMode(false);
          } else if (!savedDemo) {
            setUser(null);
          }
          setLoading(false);
        },
        (authErr) => {
          console.warn('Firebase Auth State warning:', authErr);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } else {
      // If Firebase is not configured, default to demo mode or not logged in
      setLoading(false);
    }
  }, []);

  const clearError = () => setError(null);

  const register = async (email: string, pass: string, name: string) => {
    setError(null);
    setLoading(true);
    try {
      if (isFirebaseConfigured() && auth) {
        const credential = await createUserWithEmailAndPassword(auth, email, pass);
        if (name && credential.user) {
          await updateProfile(credential.user, { displayName: name });
        }
        setUser({
          uid: credential.user.uid,
          email: credential.user.email,
          displayName: name || credential.user.email?.split('@')[0] || 'User',
          photoURL: credential.user.photoURL,
        });
        setIsDemoMode(false);
      } else {
        // Demo mode fallback registration
        const demoUser: AppUser = {
          uid: 'demo_user_' + Date.now(),
          email,
          displayName: name || email.split('@')[0],
          photoURL: null,
        };
        localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser));
        setUser(demoUser);
        setIsDemoMode(true);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      if (isFirebaseConfigured() && auth) {
        const credential = await signInWithEmailAndPassword(auth, email, pass);
        setUser({
          uid: credential.user.uid,
          email: credential.user.email,
          displayName: credential.user.displayName || credential.user.email?.split('@')[0] || 'User',
          photoURL: credential.user.photoURL,
        });
        setIsDemoMode(false);
      } else {
        // Fallback login
        const demoUser: AppUser = {
          uid: 'demo_user_active',
          email,
          displayName: email.split('@')[0],
          photoURL: null,
        };
        localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser));
        setUser(demoUser);
        setIsDemoMode(true);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      if (isFirebaseConfigured() && auth) {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        setUser({
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
        });
        setIsDemoMode(false);
      } else {
        // Mock google login
        loginAsDemo('Google Demo User');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemo = (customName = 'Bala') => {
    setError(null);
    const demoUser: AppUser = {
      uid: 'user_bala_demo',
      email: 'bala@taskpulse.app',
      displayName: customName,
      photoURL: null,
    };
    localStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
    setIsDemoMode(true);
  };

  const logout = async () => {
    try {
      if (isFirebaseConfigured() && auth) {
        await signOut(auth);
      }
    } catch {
      // ignore
    }
    localStorage.removeItem(DEMO_USER_STORAGE_KEY);
    setUser(null);
    setIsDemoMode(false);
  };

  const resetPassword = async (email: string) => {
    setError(null);
    if (isFirebaseConfigured() && auth) {
      await sendPasswordResetEmail(auth, email);
    } else {
      // Simulate password reset email
      await new Promise((res) => setTimeout(res, 800));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemoMode,
        error,
        register,
        login,
        loginWithGoogle,
        loginAsDemo,
        logout,
        resetPassword,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
