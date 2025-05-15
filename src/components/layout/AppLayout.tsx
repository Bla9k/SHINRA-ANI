
'use client';

import React, { useState, type ReactNode, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from './TopBar';
import BottomNavigationBar from './BottomNavigationBar';
import SearchPopup from '@/components/search/SearchPopup';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { useAnimation } from '@/context/AnimationContext'; // Import useAnimation

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAiSearchActive, setIsAiSearchActive] = useState(false);
  const [initialSearchTerm, setInitialSearchTerm] = useState('');
  const [openWithFilters, setOpenWithFilters] = useState(false);
  const pathname = usePathname();
  const { playAnimation } = useAnimation(); // Get animation context

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearchToggle = useCallback((term: string = '') => {
    setInitialSearchTerm(term);
    setIsSearchOpen((prev) => !prev);
    // If opening and AI mode was active, keep it, otherwise default to standard.
    if (!isSearchOpen && isAiSearchActive) {
       // no change to isAiSearchActive
    } else {
       setIsAiSearchActive(false);
    }
    setOpenWithFilters(false);
  }, [isSearchOpen, isAiSearchActive]);

  const handleOpenSearchWithTerm = useCallback((term: string = '') => {
    setInitialSearchTerm(term);
    setIsSearchOpen(true);
    setIsAiSearchActive(false); // Standard search
    setOpenWithFilters(false);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false);
    setInitialSearchTerm('');
    setOpenWithFilters(false);
  }, []);

  const handleAiToggle = useCallback(() => {
    const newAiState = !isAiSearchActive;
    setIsAiSearchActive(newAiState);
    // If popup isn't open and AI is toggled ON, open it.
    if (!isSearchOpen && newAiState) {
      setIsSearchOpen(true);
      setInitialSearchTerm(''); // Clear term if opening fresh with AI
      setOpenWithFilters(false);
    } else if (isSearchOpen && !newAiState) {
      // If popup is open and AI is toggled OFF, ensure filters are NOT shown by default
      // (unless user manually opens them)
      setOpenWithFilters(false);
    }
    // Animate the AI toggle button (example)
    playAnimation('.ai-toggle-button', { scale: [1, 1.1, 1], duration: 300 });
  }, [isAiSearchActive, isSearchOpen, playAnimation]);


  const handleOpenAiSearch = useCallback((term: string) => {
    setInitialSearchTerm(term);
    setIsAiSearchActive(true);
    setIsSearchOpen(true);
    setOpenWithFilters(false);
  }, []);

  const handleOpenAdvancedSearch = useCallback((term: string) => {
    setInitialSearchTerm(term);
    setIsAiSearchActive(false); // Ensure AI is off for advanced
    setOpenWithFilters(true);
    setIsSearchOpen(true);
  }, []);


  const pageVariants = {
    initial: { opacity: 0, y: 8 }, // Slightly increased initial Y offset
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -8 }, // Slightly increased exit Y offset
  };

  const pageTransition = {
    type: "spring", // Spring for a more natural feel
    stiffness: 260,
    damping: 20,
    duration: 0.35 // Adjust duration for spring
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen h-screen overflow-hidden relative bg-background text-foreground">
      <TopBar
        onSearchIconClick={() => handleSearchToggle()} // Simplified for mobile icon click
        onSearchSubmit={handleOpenSearchWithTerm}
        onAiToggle={handleAiToggle}
        isAiSearchActive={isAiSearchActive}
        onOpenAiSearch={handleOpenAiSearch}
        onOpenAdvancedSearch={handleOpenAdvancedSearch}
      />
      <div className="flex-1 overflow-y-auto pb-20 scrollbar-thin"> {/* Increased pb for BottomNav */}
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="transition-smooth" // Keep this for potential CSS transitions
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>

      <BottomNavigationBar
          onSearchIconClick={handleSearchToggle}
          onAiToggle={handleAiToggle}
          isAiSearchActive={isAiSearchActive}
       />

      <SearchPopup
        isOpen={isSearchOpen}
        onClose={handleCloseSearch}
        isAiActive={isAiSearchActive}
        initialSearchTerm={initialSearchTerm}
        onAiToggle={handleAiToggle}
        openWithFilters={openWithFilters}
      />
      <Toaster />
    </div>
  );
}
