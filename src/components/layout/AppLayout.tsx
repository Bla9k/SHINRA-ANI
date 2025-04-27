'use client';

import type { ReactNode } from 'react';
import TopBar from './TopBar';
import BottomNavigationBar from './BottomNavigationBar'; // Import the new bottom bar

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar />
      {/* Add consistent padding-bottom for the fixed bottom bar */}
      {/* Adjust pb-16 based on the actual height of BottomNavigationBar (h-16) */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 overflow-y-auto"> {/* Increased padding for better spacing */}
        {/* Add subtle animation */}
        <div className="animate-in fade-in duration-500">
          {children}
        </div>
      </main>
      <BottomNavigationBar />
    </div>
  );
}
