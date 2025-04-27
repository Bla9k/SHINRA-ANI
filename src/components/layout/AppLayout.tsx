
'use client';

import { useState, type ReactNode, useCallback } from 'react';
import { usePathname } from 'next/navigation'; // Import usePathname
import TopBar from './TopBar';
import BottomNavigationBar from './BottomNavigationBar';
import SearchPopup from '@/components/search/SearchPopup'; // Import the SearchPopup component
import { cn } from '@/lib/utils'; // Import cn

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname(); // Get the current path
  // const isCommunityPage = pathname === '/community'; // No longer needed

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAiSearchActive, setIsAiSearchActive] = useState(false); // State for AI search mode
  const [initialSearchTerm, setInitialSearchTerm] = useState(''); // State for initial search term
  const [openWithFilters, setOpenWithFilters] = useState(false); // Flag to show filters immediately

  // Opens search, optionally with a term. Resets AI mode.
  const handleSearchToggle = useCallback((term: string = '') => {
    setInitialSearchTerm(term);
    setIsSearchOpen(prev => !prev);
    setIsAiSearchActive(false); // Ensure AI is off for standard search toggle/submit
    setOpenWithFilters(false); // Don't force filters open on standard toggle
  }, []);

  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false);
    setInitialSearchTerm(''); // Clear initial term on close
    setOpenWithFilters(false); // Reset filter flag
    // Keep AI state sticky unless explicitly changed
  }, []);

  // Toggles AI mode. Ensures popup is open if toggling AI on.
  const handleAiToggle = useCallback(() => {
    setIsAiSearchActive(prev => {
        const nextState = !prev;
        // If turning AI mode ON, ensure the popup is open
        if (nextState && !isSearchOpen) {
            setIsSearchOpen(true);
            setOpenWithFilters(false); // Don't force filters open when toggling AI
        }
        return nextState;
    });
  }, [isSearchOpen]);

  // Opens search popup specifically in AI mode with a given term
  const handleOpenAiSearch = useCallback((term: string) => {
    setInitialSearchTerm(term);
    setIsAiSearchActive(true); // Force AI mode active
    setIsSearchOpen(true);     // Ensure popup is open
    setOpenWithFilters(false); // Don't force filters open for AI search
  }, []);

  // Opens search popup specifically for Advanced Search with filters visible
  const handleOpenAdvancedSearch = useCallback((term: string) => {
    setInitialSearchTerm(term);
    setIsAiSearchActive(false); // Ensure AI mode is OFF for advanced search
    setOpenWithFilters(true);   // Flag to show filters immediately
    setIsSearchOpen(true);      // Ensure popup is open
  }, []);


  return (
    // Main flex container for the entire app layout
    <div className="flex flex-col min-h-screen h-screen overflow-hidden"> {/* Ensure full height and prevent body scroll */}
      {/* TopBar remains fixed */}
      <TopBar
        onSearchIconClick={() => handleSearchToggle()} // Simple toggle for icon click
        onSearchSubmit={handleSearchToggle} // Pass term on submit (opens popup, standard mode)
        onAiToggle={handleAiToggle}
        isAiSearchActive={isAiSearchActive}
        onOpenAiSearch={handleOpenAiSearch}
        onOpenAdvancedSearch={handleOpenAdvancedSearch} // Pass advanced search handler
      />

      {/* Main content area */}
      {/* Apply flex-grow and add bottom padding to prevent overlap with bottom nav */}
      <main className="flex-1 overflow-y-auto pb-20"> {/* Allow content to scroll internally */}
        <div className="animate-fade-in duration-500">
          {children}
        </div>
      </main>

      {/* BottomNav is always shown */}
      <BottomNavigationBar onSearchClick={handleSearchToggle} onAiClick={handleAiToggle} isAiActive={isAiSearchActive} />

      {/* SearchPopup remains outside the main scroll */}
      <SearchPopup
        isOpen={isSearchOpen}
        onClose={handleCloseSearch}
        isAiActive={isAiSearchActive} // Pass AI activation state
        initialSearchTerm={initialSearchTerm} // Pass initial search term
        onAiToggle={handleAiToggle} // Allow popup to toggle AI state
        openWithFilters={openWithFilters} // Pass flag to show filters
      />
    </div>
  );
}
