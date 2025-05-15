
'use client';

import React, { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  getAdditionalUserInfo, // Import this to check if it's a new user with Google Sign-In
  type User,
  type AuthError
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createUserProfileDocument, getUserProfileDocument, type UserProfileData } from '@/services/profile.ts'; // Import profile service

interface AuthActionError {
    code: string;
    message: string;
}

export interface AuthContextProps {
  user: User | null;
  userProfile: UserProfileData | null; // Add userProfile state
  loading: boolean;
  signUpWithEmail: (email: string, password: string) => Promise<AuthActionError | null>;
  signInWithEmail: (email: string, password: string) => Promise<AuthActionError | null>;
  signInWithGoogle: () => Promise<AuthActionError | null>;
  signOutUser: () => Promise<void>;
  fetchUserProfile: (uid: string) => Promise<void>; // Expose fetchUserProfile
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfileState] = useState<UserProfileData | null>(null); // Renamed to avoid conflict
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserProfile = async (uid: string) => {
    console.log('[AuthContext] Fetching user profile for UID:', uid);
    try {
      const profile = await getUserProfileDocument(uid);
      setUserProfileState(profile);
      console.log('[AuthContext] User profile fetched and set:', profile);
    } catch (error) {
      console.error('[AuthContext] Error fetching user profile in AuthProvider:', error);
      setUserProfileState(null); // Set to null on error
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true); // Set loading true while processing auth state
      console.log('[AuthContext] Auth state changed. Current user UID:', currentUser?.uid);
      setUser(currentUser);

      if (currentUser) {
        // Introduce a small delay before trying to interact with Firestore
        // This helps if Firestore SDK isn't immediately ready after auth.
        await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5-second delay

        try {
          console.log('[AuthContext] Ensuring profile for user:', currentUser.uid);
          // Ensure profile exists or is created. createUserProfileDocument handles both cases.
          // It will create if not exists, or ensure core fields are up-to-date if it does.
          const profile = await createUserProfileDocument(currentUser.uid, {
            email: currentUser.email || undefined,
            username: currentUser.displayName || undefined,
            avatarUrl: currentUser.photoURL || undefined,
          });
          setUserProfileState(profile); // Set the local profile state
          console.log("[AuthContext] Profile ensured/created and set for user:", currentUser.uid);
        } catch (profileError) {
          console.error("[AuthContext] Error ensuring user profile in onAuthStateChanged:", profileError);
          setUserProfileState(null); // Clear profile on error
          // Optionally, notify the user or handle more gracefully
        }
      } else {
        setUserProfileState(null); // Clear profile if no user
      }
      setLoading(false); // Set loading false after all processing
    });
    return () => unsubscribe();
  }, []);

  const signUpWithEmail = async (email: string, password: string): Promise<AuthActionError | null> => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle profile creation and setting user state.
      console.log('[AuthContext] Email/Password Sign-Up successful for:', userCredential.user.uid);
      router.push('/profile'); // Redirect to profile for customization
      return null;
    } catch (error) {
        const authError = error as AuthError;
        console.error('[AuthContext] Error during Email/Password Sign-Up:', authError.code, authError.message);
        return { code: authError.code, message: authError.message };
    } finally {
        // No setLoading(false) here, onAuthStateChanged will handle it
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<AuthActionError | null> => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle profile fetching/creation and setting user state.
      console.log('[AuthContext] Email/Password Sign-In successful for:', userCredential.user.uid);
      router.push('/'); // Redirect to home for existing users
      return null;
    } catch (error) {
       const authError = error as AuthError;
       console.error('[AuthContext] Error during Email/Password Sign-In:', authError.code, authError.message);
        return { code: authError.code, message: authError.message };
    } finally {
        // No setLoading(false) here, onAuthStateChanged will handle it
    }
  };

  const signInWithGoogle = async (): Promise<AuthActionError | null> => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const additionalUserInfo = getAdditionalUserInfo(result);
      // onAuthStateChanged will handle profile creation and setting user state.
      console.log('[AuthContext] Google Sign-In successful for:', result.user.uid);
      if (additionalUserInfo?.isNewUser) {
        router.push('/profile'); // Redirect new users to profile
      } else {
        router.push('/'); // Redirect existing users to home
      }
      return null;
    } catch (error) {
      const authError = error as AuthError;
      console.error('[AuthContext] Error during Google Sign-In:', authError.code, authError.message);
      // Handle specific error codes like 'auth/popup-closed-by-user' or 'auth/account-exists-with-different-credential'
      if (authError.code === 'auth/popup-closed-by-user') {
        // User closed the popup, not necessarily an "error" to display prominently
        setLoading(false); // Ensure loading is set to false
        return { code: authError.code, message: "Google Sign-In was cancelled."};
      }
      return { code: authError.code, message: authError.message };
    } finally {
       // No setLoading(false) here if successful, onAuthStateChanged will handle it.
       // If error, it might be set above or here.
       if (auth.currentUser === null) { // Ensure loading is false if sign-in failed and no user is set
            setLoading(false);
       }
    }
  };

  const signOutUser = async () => {
    // No need to setLoading(true) here, as onAuthStateChanged will trigger and handle loading.
    try {
      await signOut(auth);
       // setUser(null); // Handled by onAuthStateChanged
       // setUserProfileState(null); // Handled by onAuthStateChanged
       router.push('/login');
       console.log('[AuthContext] Sign-Out successful, user will be null.');
    } catch (error) {
      console.error('[AuthContext] Error during Sign-Out:', error);
    }
    // No setLoading(false) here, onAuthStateChanged handles it
  };

   // This loading state is primarily for the initial auth check.
   if (loading && user === undefined) { // Check for undefined user before initial check completes
       return (
         <div className="flex justify-center items-center min-h-screen bg-background">
           <Loader2 className="h-12 w-12 animate-spin text-primary" />
         </div>
       );
    }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signUpWithEmail, signInWithEmail, signInWithGoogle, signOutUser, fetchUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
