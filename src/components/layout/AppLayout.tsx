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
      {/* Removed p-4 md:p-6 lg:p-8 from main to allow full-width sections */}
      <main className="flex-1 pb-20 overflow-y-auto"> {/* Kept padding-bottom for bottom bar */}
        {/* Add subtle animation */}
        <div className="animate-in fade-in duration-500">
          {children}
        </div>
      </main>
      <BottomNavigationBar />
    </div>
  );
}
