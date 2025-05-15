
'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input'; // Import Input
import { Label } from '@/components/ui/label'; // Import Label
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Chrome } from 'lucide-react'; // Added Chrome for Google icon
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const { user, signInWithEmail, signInWithGoogle, loading } = useAuth(); // Added signInWithGoogle
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleEmailSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    const signInError = await signInWithEmail(email, password);

    if (signInError) {
        console.error("Login page Sign-In error:", signInError);
        let userMessage = "Login failed. Please check your credentials and try again.";
        if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/wrong-password' || signInError.code === 'auth/invalid-credential') {
            userMessage = "Invalid email or password.";
        } else if (signInError.code === 'auth/invalid-email') {
            userMessage = "Please enter a valid email address.";
        } else if (signInError.code === 'auth/too-many-requests') {
            userMessage = "Too many login attempts. Please try again later.";
        }
        setError(userMessage);
        toast({
           title: "Login Failed",
           description: userMessage,
           variant: "destructive",
        });
    } else {
        setError(null);
        toast({
          title: "Login Successful!",
          description: "Welcome back!",
          variant: "default",
        });
        // Redirect is handled by AuthContext/useEffect
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    const signInError = await signInWithGoogle();
    if (signInError) {
      console.error("Google Sign-In error:", signInError);
      let userMessage = "Google Sign-In failed. Please try again.";
      if (signInError.code === 'auth/popup-closed-by-user') {
        userMessage = "Google Sign-In cancelled.";
      } else if (signInError.code === 'auth/account-exists-with-different-credential') {
        userMessage = "An account already exists with this email using a different sign-in method.";
      }
      setError(userMessage);
      toast({
        title: "Google Sign-In Failed",
        description: userMessage,
        variant: "destructive",
      });
    } else {
      setError(null);
      toast({
        title: "Google Sign-In Successful!",
        description: "Welcome!",
        variant: "default",
      });
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
        <form onSubmit={handleEmailSignIn}>
            <CardContent className="space-y-4">
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
                </div>

                 {error && (
                    <p className="text-sm text-destructive text-center">{error}</p>
                 )}

                <Button type="submit" disabled={loading} className="w-full neon-glow-hover">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
                </Button>
            </CardContent>
        </form>
        <div className="px-6 pb-4 space-y-3">
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>
            <Button variant="outline" onClick={handleGoogleSignIn} disabled={loading} className="w-full neon-glow-hover glass">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Chrome size={18} className="mr-2" /> Sign in with Google</>}
            </Button>
        </div>
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
