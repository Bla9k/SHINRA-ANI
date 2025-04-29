// src/components/layout/AppLayout.tsx
'use client';

import React, { useState, type ReactNode, useCallback, useEffect } from 'react';
import { useTheme } from 'next-themes';
import SearchPopup from '@/components/search/SearchPopup';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster'; // Import Toaster if needed globally here
import TopBar from './TopBar'; // Import TopBar
import BottomNavigationBar from './BottomNavigationBar'; // Import BottomNavigationBar

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { theme, systemTheme } = useTheme(); // Keep useTheme for potential future use, but don't use setTheme here
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAiSearchActive, setIsAiSearchActive] = useState(false);
  const [initialSearchTerm, setInitialSearchTerm] = useState('');
  const [openWithFilters, setOpenWithFilters] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // --- Search Handlers ---
  const handleSearchToggle = useCallback((term: string = '') => {
    setInitialSearchTerm(term);
    setIsSearchOpen((prev) => !prev);
    setIsAiSearchActive(false); // Default to standard search when opening
    setOpenWithFilters(false);
  }, []);

   const handleOpenSearchWithTerm = useCallback((term: string = '') => {
      setInitialSearchTerm(term);
      setIsSearchOpen(true);
      setIsAiSearchActive(false);
      setOpenWithFilters(false);
   }, []);


  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false);
    setInitialSearchTerm('');
    setOpenWithFilters(false);
  }, []);

  const handleAiToggle = useCallback(() => {
     setIsAiSearchActive(prev => !prev);
     // If search isn't open when AI is toggled ON, open it
     if (!isSearchOpen && !isAiSearchActive) {
         setIsSearchOpen(true);
         setOpenWithFilters(false); // Ensure filters aren't open
     }
  }, [isSearchOpen, isAiSearchActive]); // Depend on both

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


  // Render placeholders or nothing until mounted to avoid hydration errors
  if (!mounted) {
    return null; // Or a minimal loading skeleton if preferred
  }

  const currentResolvedTheme = theme === 'system' ? systemTheme : theme;

  return (
    <div className="flex flex-col min-h-screen h-screen overflow-hidden relative">
      {/* Directly render the main layout (previously VanillaLayout) */}
      <TopBar
         onSearchIconClick={handleSearchToggle} // Use handleSearchToggle for icon click
         onSearchSubmit={handleOpenSearchWithTerm} // Use this to open popup with term
         onAiToggle={handleAiToggle}
         isAiSearchActive={isAiSearchActive}
         onOpenAiSearch={handleOpenAiSearch}
         onOpenAdvancedSearch={handleOpenAdvancedSearch}
      />

      <div className="flex-1 overflow-y-auto pb-16 scrollbar-thin"> {/* Main content area */}
        <main className="transition-smooth">
          {children}
        </main>
        {/* Vanilla Specific Footer - Example */}
        <footer className="text-center py-4 px-4 border-t border-border/50 text-xs text-muted-foreground">
             © {new Date().getFullYear()} Shinra-Ani Inc. | All Rights Reserved
        </footer>
      </div>

      <BottomNavigationBar
        // Always use 'vanilla' theme style now
        currentTheme={'vanilla'}
      />

       {/* Search Popup remains outside the themed layouts, always available */}
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
