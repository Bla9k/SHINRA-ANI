
'use client';

import { useState, type ReactNode } from 'react';
import TopBar from './TopBar';
import BottomNavigationBar from './BottomNavigationBar';
import SearchPopup from '@/components/search/SearchPopup'; // Import the SearchPopup component

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSearchToggle = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar onSearchClick={handleSearchToggle} /> {/* Pass handler to TopBar if needed */}
      <main className="flex-1 pb-20 overflow-y-auto">
        <div className="animate-in fade-in duration-500">
          {children}
        </div>
      </main>
      <BottomNavigationBar onSearchClick={handleSearchToggle} /> {/* Pass handler to BottomNav */}
      <SearchPopup isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} /> {/* Render SearchPopup */}
    </div>
  );
}
