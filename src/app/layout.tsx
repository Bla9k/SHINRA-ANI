import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import AppLayout from '@/components/layout/AppLayout';
import { ThemeProvider } from '@/components/theme/ThemeProvider'; // Updated import

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
    <html lang="en" suppressHydrationWarning className="dark h-full"> {/* Ensure html takes full height and remove whitespace */}
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased transition-smooth flex flex-col h-full', // Use flex column and full height
          poppins.variable // Use Poppins variable
        )}
      >
        <ThemeProvider
            attribute="class" // Use attribute="class" instead of "body"
            defaultTheme="dark"
            enableSystem={false} // Explicitly disable system theme preference
            disableTransitionOnChange
        >
            {/* AppLayout now handles the core layout structure */}
            <AppLayout>
              {children}
            </AppLayout>
            <Toaster /> {/* Add Toaster component */}
        </ThemeProvider>
      </body>
    </html>
  );
}
