'use client'; // Ensure this hook can be used in Client Components

import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext'; // Adjust path if needed

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
