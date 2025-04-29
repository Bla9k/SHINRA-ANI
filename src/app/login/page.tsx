'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth'; // Use the custom hook
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react'; // For loading state

// Simple Google Icon SVG (replace with a better one if desired)
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path d="M12 5.38c1.63 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    <path d="M1 1h22v22H1z" fill="none"/>
  </svg>
);

export default function LoginPage() {
  const { user, googleSignIn, loading } = useAuth();
  const router = useRouter();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push('/profile'); // Redirect to profile page or home
    }
  }, [user, router]);

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
      // Redirection is handled in AuthContext or by the effect above
    } catch (error) {
      console.error("Login page Google Sign-In error:", error);
      // Handle error display if needed (e.g., using toast)
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-background via-card to-background/80">
      <Card className="w-full max-w-sm glass shadow-2xl border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">Welcome Back!</CardTitle>
          <CardDescription>Sign in to Shinra-Ani to continue.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full neon-glow-hover flex items-center justify-center"
            variant="outline"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-pulse" /> // Use Loader2 with pulse
            ) : (
              <>
                <GoogleIcon /> Sign in with Google
              </>
            )}
          </Button>
           {/* Add other sign-in methods here if needed */}
        </CardContent>
      </Card>
    </div>
  );
}
