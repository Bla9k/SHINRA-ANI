'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input'; // Import Input
import { Label } from '@/components/ui/label'; // Import Label
import { useAuth } from '@/context/AuthContext'; // Use the updated hook
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Import Link
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast'; // Import useToast for error display

export default function LoginPage() {
  const { user, signInWithEmail, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast(); // Initialize toast

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null); // State for login errors

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push('/'); // Redirect to home or profile
    }
  }, [user, router]);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    setError(null); // Clear previous errors

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    const signInError = await signInWithEmail(email, password);

    if (signInError) {
        console.error("Login page Sign-In error:", signInError);
        // Map common Firebase error codes to user-friendly messages
        let userMessage = "Login failed. Please check your credentials and try again.";
        if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/wrong-password' || signInError.code === 'auth/invalid-credential') {
            userMessage = "Invalid email or password.";
        } else if (signInError.code === 'auth/invalid-email') {
            userMessage = "Please enter a valid email address.";
        } else if (signInError.code === 'auth/too-many-requests') {
            userMessage = "Too many login attempts. Please try again later.";
        }
        setError(userMessage); // Set state for display below form
        toast({ // Also show a toast notification
           title: "Login Failed",
           description: userMessage,
           variant: "destructive",
        });
    } else {
        setError(null);
        // Redirect is handled by AuthContext/useEffect
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-background via-card to-background/80">
      <Card className="w-full max-w-sm glass shadow-2xl border-primary/20">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-bold text-primary">Welcome Back!</CardTitle>
          <CardDescription>Sign in to your Shinra-Ani account.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignIn}>
            <CardContent className="space-y-4">
                {/* Email Input */}
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="glass"
                        disabled={loading}
                    />
                </div>
                {/* Password Input */}
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="glass"
                        disabled={loading}
                    />
                     {/* Optional: Add 'Forgot Password?' link here */}
                    {/* <div className="text-right">
                       <Button variant="link" size="sm" className="text-xs p-0 h-auto" asChild>
                           <Link href="/forgot-password">Forgot password?</Link>
                       </Button>
                    </div> */}
                </div>

                 {/* Error Message Display */}
                 {error && (
                    <p className="text-sm text-destructive text-center">{error}</p>
                 )}

                {/* Sign In Button */}
                <Button type="submit" disabled={loading} className="w-full neon-glow-hover">
                    {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                    'Sign In'
                    )}
                </Button>
            </CardContent>
        </form>
        <CardFooter className="flex flex-col items-center text-sm text-muted-foreground pt-4 border-t">
           <p>Don't have an account?</p>
           <Button variant="link" size="sm" className="p-0 h-auto mt-1 text-primary" asChild>
                <Link href="/signup">Sign Up Here</Link>
           </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
