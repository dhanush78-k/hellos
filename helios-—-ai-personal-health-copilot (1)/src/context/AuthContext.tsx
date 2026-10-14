import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fbSignOut,
  onAuthStateChanged,
  User,
} from '../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';

interface AuthContextType {
  user: User | null;
  guestUser: { uid: string; email: string; displayName: string } | null;
  activeUser: { uid: string; email: string | null; displayName: string | null } | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  signUpWithEmail: (e: string, p: string) => Promise<void>;
  signInGuest: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [guestUser, setGuestUser] = useState<{
    uid: string;
    email: string;
    displayName: string;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('helios_guest_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // sync user doc in firestore
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          await setDoc(
            userRef,
            {
              email: currentUser.email || 'anonymous@helios.health',
              displayName: currentUser.displayName || 'Health Voyager',
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (err) {
          // If profile sync fails (e.g. offline), log with handler
          console.warn('User profile sync notice:', err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      setGuestUser(null);
      localStorage.removeItem('helios_guest_user');
    } catch (err: any) {
      console.error('Google Sign In failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, pass);
      setGuestUser(null);
      localStorage.removeItem('helios_guest_user');
    } catch (err: any) {
      console.error('Email Sign In failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    try {
      setLoading(true);
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const userRef = doc(db, 'users', cred.user.uid);
      await setDoc(userRef, {
        email: cred.user.email,
        displayName: 'Health Voyager',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setGuestUser(null);
      localStorage.removeItem('helios_guest_user');
    } catch (err: any) {
      console.error('Sign Up failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInGuest = () => {
    const guest = {
      uid: 'guest_' + Math.random().toString(36).substring(2, 10),
      email: 'explorer@helios.local',
      displayName: 'Personal Explorer',
    };
    setGuestUser(guest);
    localStorage.setItem('helios_guest_user', JSON.stringify(guest));
  };

  const signOut = async () => {
    try {
      if (user) {
        await fbSignOut(auth);
      }
      setGuestUser(null);
      localStorage.removeItem('helios_guest_user');
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  const activeUser = user
    ? { uid: user.uid, email: user.email, displayName: user.displayName }
    : guestUser;

  return (
    <AuthContext.Provider
      value={{
        user,
        guestUser,
        activeUser,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        signInGuest,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
