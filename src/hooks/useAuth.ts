
// src/hooks/useAuth.ts
'use client'; // Ensure this hook can be used in client components

import { useContext } from 'react';
import { AuthContext, type AuthContextProps } from '@/context/AuthContext'; // Adjust path if needed

// Custom hook to use the auth context
export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
