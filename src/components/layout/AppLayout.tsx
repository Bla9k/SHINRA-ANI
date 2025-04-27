
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
      {/* Add padding-bottom to main content to avoid overlap with fixed bottom bar */}
      {/* Adjust pb-20 based on the actual height of BottomNavigationBar */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 pb-20 md:pb-24 overflow-y-auto">
        {/* Add subtle animation */}
        <div className="animate-in fade-in duration-500">
          {children}
        </div>
      </main>
      <BottomNavigationBar />
    </div>
  );
}
