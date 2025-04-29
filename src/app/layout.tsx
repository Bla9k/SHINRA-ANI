
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import AppLayout from '@/components/layout/AppLayout';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import { AuthProvider } from '@/context/AuthContext';
import Head from 'next/head'; // Import Head for metadata and scripts
import Script from 'next/script'; // Import Script for anime.js
import { AnimationProvider } from '@/context/AnimationContext'; // Corrected import path


const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Shinra-Ani', // Updated App Name
  description: 'Ultimate Anime & Manga Platform with Nami AI Integration',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Let ThemeProvider handle the theme class on the html tag
    <html lang="en" className="h-full" suppressHydrationWarning> {/* Add suppressHydrationWarning */}
      <head />{/* Ensure head is present */}
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased transition-smooth flex flex-col h-full', // Use flex column and full height
          poppins.variable // Use Poppins variable
        )}
      >
        <AuthProvider>
          <AnimationProvider> {/* Wrap with AnimationProvider */}
            <ThemeProvider
                attribute="data-theme" // Use data-theme attribute
                defaultTheme="dark"
                enableSystem={false} // Disable system preference detection
                disableTransitionOnChange // Prevent transition on initial load
            >
                 <AppLayout>
                   {children}
                 </AppLayout>
                 <Toaster />
            </ThemeProvider>
          </AnimationProvider>
        </AuthProvider>
         {/* Load Anime.js after interactive elements */}
         <Script
            src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js"
            strategy="lazyOnload" // Changed strategy to lazyOnload for potentially better performance
            integrity="sha512-z4OUqw38qNLpn1libAN9BsoDx6nbNFio5lA6CuTp9NlK83b89hgyCVq+N5FdBJptINztxn1Z3SaKSKUS5UP60Q=="
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            // Removed onLoad prop as it's an event handler
        />
      </body>
    </html>
  );
}
