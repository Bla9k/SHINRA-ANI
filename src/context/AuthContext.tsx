'use client';

import React, { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, type User } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  googleSignIn: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading true
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed:', currentUser?.displayName);
      setUser(currentUser);
      setLoading(false); // Set loading false after checking auth state
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const googleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      // Redirect handled by onAuthStateChanged or can be forced here
       router.push('/'); // Redirect to home after sign in
       console.log('Google Sign-In successful');
    } catch (error) {
      console.error('Error during Google Sign-In:', error);
      // Optionally show a toast message to the user
    } finally {
       setLoading(false); // Ensure loading is false even on error
    }
  };

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
   if (loading && user === undefined) { // Adjust condition slightly if needed
       return (
          <div className="flex justify-center items-center min-h-screen">
             <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
       );
    }

  return (
    <AuthContext.Provider value={{ user, loading, googleSignIn, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
