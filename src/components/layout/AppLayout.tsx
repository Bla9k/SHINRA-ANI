// src/components/layout/AppLayout.tsx
'use client';

import React, { useState, type ReactNode, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation'; // Import usePathname
import { motion, AnimatePresence } from 'framer-motion'; // Import framer-motion
import SearchPopup from '@/components/search/SearchPopup';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import TopBar from './TopBar';
import BottomNavigationBar from './BottomNavigationBar';
import Footer from './Footer'; // Import Footer

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAiSearchActive, setIsAiSearchActive] = useState(false);
  const [initialSearchTerm, setInitialSearchTerm] = useState('');
  const [openWithFilters, setOpenWithFilters] = useState(false);
  const pathname = usePathname(); // Get the current pathname

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
    if (!isSearchOpen && !isAiSearchActive) {
      setIsSearchOpen(true);
      setOpenWithFilters(false);
    }
  }, [isSearchOpen, isAiSearchActive]);

  const handleOpenAiSearch = useCallback((term: string) => {
    setInitialSearchTerm(term);
    setIsAiSearchActive(true);
    setIsSearchOpen(true);
    setOpenWithFilters(false);
  }, []);

  const handleOpenAdvancedSearch = useCallback((term: string) => {
    setInitialSearchTerm(term);
    setIsAiSearchActive(false);
    setOpenWithFilters(true);
    setIsSearchOpen(true);
  }, []);

  // Animation variants for page transitions
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 5, // Slight upward movement
    },
    in: {
      opacity: 1,
      y: 0,
    },
    out: {
      opacity: 0,
      y: -5, // Slight downward movement
    },
  };

  const pageTransition = {
    type: "tween", // Smoother transition
    ease: "anticipate", // Easing function for a slight bounce/anticipation
    duration: 0.4 // Faster duration
  };

  // Render placeholders or nothing until mounted to avoid hydration errors
  if (!mounted) {
    return null; // Or a minimal loading skeleton if preferred
  }

  return (
    <div className="flex flex-col min-h-screen h-screen overflow-hidden relative">
      {/* Pass search handlers to TopBar */}
      <TopBar
        onSearchIconClick={handleSearchToggle}
        onSearchSubmit={handleOpenSearchWithTerm}
        onAiToggle={handleAiToggle}
        isAiSearchActive={isAiSearchActive}
        onOpenAiSearch={handleOpenAiSearch}
        onOpenAdvancedSearch={handleOpenAdvancedSearch}
      />

      {/* Main content area with page transitions */}
      <div className="flex-1 overflow-y-auto pb-16 scrollbar-thin"> {/* Main content area scroll */}
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname} // Use pathname as key to trigger animation on route change
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="transition-smooth" // Keep existing smooth transition class if needed
          >
            {children}
          </motion.main>
        </AnimatePresence>
        {/* Add Footer inside the scrollable area */}
        <Footer />
      </div>

      <BottomNavigationBar />

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
