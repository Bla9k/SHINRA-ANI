'use client';

import React, { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword, // Import email/password sign-in
  createUserWithEmailAndPassword, // Import email/password sign-up
  signOut,
  type User,
  type AuthError // Import AuthError type
} from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Keep auth import
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Define error structure for more specific feedback
interface AuthActionError {
    code: string;
    message: string;
}

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  // Add new functions for email/password
  signUpWithEmail: (email: string, password: string) => Promise<AuthActionError | null>;
  signInWithEmail: (email: string, password: string) => Promise<AuthActionError | null>;
  signOutUser: () => Promise<void>;
}

// No need to export AuthContext itself if useAuth is the intended way to access it
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed:', currentUser?.email); // Log email instead of displayName
      setUser(currentUser);
      setLoading(false); // Set loading false after checking auth state
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // --- Email/Password Sign-Up ---
  const signUpWithEmail = async (email: string, password: string): Promise<AuthActionError | null> => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // User will be set by onAuthStateChanged
      console.log('Email/Password Sign-Up successful');
      router.push('/'); // Redirect to home after sign up
      return null; // Indicate success
    } catch (error) {
        const authError = error as AuthError; // Type assertion
        console.error('Error during Email/Password Sign-Up:', authError.code, authError.message);
        // Return specific error code and message
        return { code: authError.code, message: authError.message };
    } finally {
        setLoading(false);
    }
  };

  // --- Email/Password Sign-In ---
  const signInWithEmail = async (email: string, password: string): Promise<AuthActionError | null> => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // User will be set by onAuthStateChanged
      console.log('Email/Password Sign-In successful');
      router.push('/'); // Redirect to home after sign in
      return null; // Indicate success
    } catch (error) {
       const authError = error as AuthError; // Type assertion
       console.error('Error during Email/Password Sign-In:', authError.code, authError.message);
        // Return specific error code and message
        return { code: authError.code, message: authError.message };
    } finally {
       setLoading(false); // Ensure loading is false even on error
    }
  };

  // --- Sign Out (Remains the same) ---
  const signOutUser = async () => {
    setLoading(true);
    try {
      await signOut(auth);
       setUser(null); // Ensure user state is cleared immediately
       router.push('/login'); // Redirect to login page after sign out
       console.log('Sign-Out successful');
    } catch (error) {
      console.error('Error during Sign-Out:', error);
    } finally {
        setLoading(false);
    }
  };

  // Show loading spinner while checking auth state initially
   if (loading) { // Simplified loading check
       return (
          <div className="flex justify-center items-center min-h-screen bg-background">
             <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
       );
    }

  return (
    <AuthContext.Provider value={{ user, loading, signUpWithEmail, signInWithEmail, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context (remains the same)
export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
