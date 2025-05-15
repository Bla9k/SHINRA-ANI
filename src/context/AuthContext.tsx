
'use client';

import React, { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider, // Import GoogleAuthProvider
  signInWithPopup,      // Import signInWithPopup
  type User,
  type AuthError
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createUserProfileDocument } from '@/services/profile.ts'; // Import profile service

interface AuthActionError {
    code: string;
    message: string;
}

export interface AuthContextProps {
  user: User | null;
  loading: boolean;
  signUpWithEmail: (email: string, password: string) => Promise<AuthActionError | null>;
  signInWithEmail: (email: string, password: string) => Promise<AuthActionError | null>;
  signInWithGoogle: () => Promise<AuthActionError | null>; // Add signInWithGoogle
  signOutUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('Auth state changed. Current user:', currentUser?.uid);
      setUser(currentUser);
      if (currentUser) {
        // Ensure profile exists or is created
        try {
            await createUserProfileDocument(currentUser.uid, {
                email: currentUser.email || undefined,
                username: currentUser.displayName || undefined,
                avatarUrl: currentUser.photoURL || undefined,
            });
            console.log("Profile ensured for user:", currentUser.uid);
        } catch (profileError) {
            console.error("Error ensuring user profile:", profileError);
            // Optionally, handle this error more gracefully (e.g., redirect to an error page or show a toast)
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUpWithEmail = async (email: string, password: string): Promise<AuthActionError | null> => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Profile creation is handled by onAuthStateChanged
      console.log('Email/Password Sign-Up successful for:', userCredential.user.uid);
      router.push('/');
      return null;
    } catch (error) {
        const authError = error as AuthError;
        console.error('Error during Email/Password Sign-Up:', authError.code, authError.message);
        return { code: authError.code, message: authError.message };
    } finally {
        setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<AuthActionError | null> => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Profile creation/check handled by onAuthStateChanged
      console.log('Email/Password Sign-In successful for:', userCredential.user.uid);
      router.push('/');
      return null;
    } catch (error) {
       const authError = error as AuthError;
       console.error('Error during Email/Password Sign-In:', authError.code, authError.message);
        return { code: authError.code, message: authError.message };
    } finally {
       setLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<AuthActionError | null> => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Profile creation/check is handled by onAuthStateChanged
      console.log('Google Sign-In successful for:', result.user.uid);
      router.push('/');
      return null;
    } catch (error) {
      const authError = error as AuthError;
      console.error('Error during Google Sign-In:', authError.code, authError.message);
      return { code: authError.code, message: authError.message };
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    try {
      await signOut(auth);
       setUser(null);
       router.push('/login');
       console.log('Sign-Out successful');
    } catch (error) {
      console.error('Error during Sign-Out:', error);
    } finally {
        setLoading(false);
    }
  };

   if (loading) {
       return (
          <div className="flex justify-center items-center min-h-screen bg-background">
             <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
       );
    }

  return (
    <AuthContext.Provider value={{ user, loading, signUpWithEmail, signInWithEmail, signInWithGoogle, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
