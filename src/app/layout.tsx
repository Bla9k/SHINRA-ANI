import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import AppLayout from '@/components/layout/AppLayout';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
// Removed Script import as anime.js is not directly used in layout now
import { AuthProvider } from '@/context/AuthContext';

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
            <ThemeProvider
                attribute="data-theme"
                defaultTheme="dark"
                enableSystem={false}
                disableTransitionOnChange // Prevent transition on initial load
            >
                 <AppLayout>
                   {children}
                 </AppLayout>
                 <Toaster />
            </ThemeProvider>
        </AuthProvider>
          {/* Removed Anime.js script import */}
      </body>
    </html>
  );
}
