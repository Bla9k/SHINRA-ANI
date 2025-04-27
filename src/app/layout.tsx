
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google'; // Changed from Geist to Poppins
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import AppLayout from '@/components/layout/AppLayout'; // Import AppLayout

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'], // Include desired weights
  subsets: ['latin'],
  variable: '--font-poppins', // Define CSS variable
});

export const metadata: Metadata = {
  title: 'Shinra-Ani', // Updated App Name
  description: 'Ultimate Anime & Manga Platform with Nami AI Integration', // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased transition-smooth', // Added transition-smooth
          poppins.variable // Use Poppins variable
        )}
      >
        <AppLayout>
          <div className="animate-fade-in"> {/* Wrap children in fade-in animation div */}
            {children}
          </div>
        </AppLayout>
        <Toaster /> {/* Add Toaster component */}
      </body>
    </html>
  );
}
