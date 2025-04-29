// src/components/layout/AppLayout.tsx
'use client';

import React, { useState, type ReactNode, useCallback, useEffect } from 'react';
import { useTheme } from 'next-themes';
import TopBar from './TopBar';
import BottomNavigationBar from './BottomNavigationBar';
import SearchPopup from '@/components/search/SearchPopup';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster'; // Import Toaster if needed globally here
import VanillaLayout from './VanillaLayout'; // New component for the default layout
import HyperchargedLayout from './HyperchargedLayout'; // New component for the hypercharged layout

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAiSearchActive, setIsAiSearchActive] = useState(false);
  const [initialSearchTerm, setInitialSearchTerm] = useState('');
  const [openWithFilters, setOpenWithFilters] = useState(false);
  // State to control which UI mode is actively displayed
  const [activeUIMode, setActiveUIMode] = useState<'vanilla' | 'hypercharged'>('vanilla');

  useEffect(() => {
    setMounted(true);
    // Set initial UI mode based on the theme loaded from next-themes
    setActiveUIMode(theme === 'hypercharged' ? 'hypercharged' : 'vanilla');
  }, [theme]); // Re-run if theme changes externally


  // --- Search Handlers ---
  const handleSearchToggle = useCallback((term: string = '') => {
    setInitialSearchTerm(term);
    setIsSearchOpen((prev) => !prev);
    setIsAiSearchActive(false); // Default to standard search when opening
    setOpenWithFilters(false);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false);
    setInitialSearchTerm('');
    setOpenWithFilters(false);
  }, []);

  const handleAiToggle = useCallback(() => {
     setIsAiSearchActive(prev => {
         const nextState = !prev;
         // If activating AI and search isn't open, open it.
         if (nextState && !isSearchOpen) {
             setIsSearchOpen(true);
             setOpenWithFilters(false); // Ensure filters aren't open
         }
         return nextState;
     });
  }, [isSearchOpen]); // Depend on isSearchOpen

  const handleOpenAiSearch = useCallback((term: string) => {
    setInitialSearchTerm(term);
    setIsAiSearchActive(true);
    setIsSearchOpen(true);
    setOpenWithFilters(false);
  }, []);

   const handleOpenAdvancedSearch = useCallback((term: string) => {
     setInitialSearchTerm(term);
     setIsAiSearchActive(false);
     setOpenWithFilters(true); // Specifically open with filters
     setIsSearchOpen(true);
   }, []);

  // --- Hypercharge Toggle Handler ---
  const handleHyperchargeToggle = useCallback(() => {
    if (!mounted) return;

    const nextTheme = activeUIMode === 'vanilla' ? 'hypercharged' : 'dark';
    const nextUIMode = nextTheme === 'hypercharged' ? 'hypercharged' : 'vanilla';

    console.log(`Toggling theme. Current UI: ${activeUIMode}, Next UI: ${nextUIMode}, Next Theme: ${nextTheme}`);

    // Apply theme using next-themes
    setTheme(nextTheme);

    // Update the active UI mode state
    // We might add animations here later using Anime.js triggered by this state change
    setActiveUIMode(nextUIMode);

  }, [mounted, activeUIMode, setTheme]);


  // Render placeholders or nothing until mounted to avoid hydration errors
  if (!mounted) {
    return null; // Or a minimal loading skeleton if preferred
  }

  // Common props for both layouts
  const commonLayoutProps = {
      onSearchToggle: handleSearchToggle,
      onAiToggle: handleAiToggle,
      isAiSearchActive: isAiSearchActive,
      onOpenAiSearch: handleOpenAiSearch,
      onOpenAdvancedSearch: handleOpenAdvancedSearch,
      onHyperchargeToggle: handleHyperchargeToggle,
      isHypercharging: false, // Simplified - manage visual state via activeUIMode
      currentTheme: activeUIMode, // Pass the active UI mode as the 'theme' indicator
  };

  return (
    <div className="flex flex-col min-h-screen h-screen overflow-hidden relative">
      {/* Conditionally render the layout based on the active UI mode */}
      {activeUIMode === 'vanilla' ? (
        <VanillaLayout {...commonLayoutProps}>
          {children}
        </VanillaLayout>
      ) : (
        <HyperchargedLayout {...commonLayoutProps}>
          {children}
        </HyperchargedLayout>
      )}

       {/* Search Popup remains outside the themed layouts */}
      <SearchPopup
        isOpen={isSearchOpen}
        onClose={handleCloseSearch}
        isAiActive={isAiSearchActive}
        initialSearchTerm={initialSearchTerm}
        onAiToggle={handleAiToggle}
        openWithFilters={openWithFilters}
      />

      {/* Global Toaster */}
      <Toaster />
    </div>
  );
}
