'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SignUpPage() {
  const { user, signUpWithEmail, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push('/'); // Redirect to home
    }
  }, [user, router]);

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || !confirmPassword) {
        setError("Please fill in all fields.");
        return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }

    const signUpError = await signUpWithEmail(email, password);

    if (signUpError) {
      console.error("Sign Up page error:", signUpError);
      let userMessage = "Sign up failed. Please try again.";
      if (signUpError.code === 'auth/email-already-in-use') {
          userMessage = "This email address is already registered.";
      } else if (signUpError.code === 'auth/invalid-email') {
          userMessage = "Please enter a valid email address.";
      } else if (signUpError.code === 'auth/weak-password') {
           userMessage = "Password is too weak. Please choose a stronger password.";
      }
      setError(userMessage);
      toast({
         title: "Sign Up Failed",
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
          <CardTitle className="text-2xl font-bold text-primary">Create Account</CardTitle>
          <CardDescription>Join Shinra-Ani today!</CardDescription>
        </CardHeader>
         <form onSubmit={handleSignUp}>
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
                    placeholder="Choose a strong password (min. 6 chars)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="glass"
                    disabled={loading}
                />
                </div>
                {/* Confirm Password Input */}
                <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="glass"
                    disabled={loading}
                />
                </div>

                {/* Error Message Display */}
                {error && (
                    <p className="text-sm text-destructive text-center">{error}</p>
                )}

                {/* Sign Up Button */}
                <Button type="submit" disabled={loading} className="w-full neon-glow-hover">
                {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    'Sign Up'
                )}
                </Button>
            </CardContent>
        </form>
        <CardFooter className="flex flex-col items-center text-sm text-muted-foreground pt-4 border-t">
          <p>Already have an account?</p>
          <Button variant="link" size="sm" className="p-0 h-auto mt-1 text-primary" asChild>
            <Link href="/login">Sign In Here</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
