import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import AppLayout from '@/components/layout/AppLayout';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import Script from 'next/script'; // Import Script
import { AuthProvider } from '@/context/AuthContext'; // Import AuthProvider

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
    // Let ThemeProvider handle the theme class/attribute on the html tag
    <html lang="en" className="h-full" suppressHydrationWarning> {/* Add suppressHydrationWarning */}
      <head />{/* Ensure head is present */}
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased transition-smooth flex flex-col h-full', // Use flex column and full height
          poppins.variable // Use Poppins variable
        )}
      >
        <AuthProvider> {/* Wrap with AuthProvider */}
            <ThemeProvider
                attribute="data-theme" // Use data-theme attribute
                defaultTheme="dark" // Keep dark as default
                enableSystem={false} // Disable system preference detection
                disableTransitionOnChange // Prevent transition on initial load
            >
                 <AppLayout>
                   {children}
                 </AppLayout>
                 <Toaster /> {/* Add Toaster component */}
            </ThemeProvider>
        </AuthProvider>
          {/* Add Anime.js script */}
          <Script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
