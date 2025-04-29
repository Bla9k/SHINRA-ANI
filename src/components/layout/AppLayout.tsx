// src/components/layout/AppLayout.tsx
'use client';

import React, { useState, type ReactNode, useCallback, useEffect } from 'react';
import { useTheme } from 'next-themes';
import SearchPopup from '@/components/search/SearchPopup';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster'; // Import Toaster if needed globally here
import VanillaLayout from './VanillaLayout'; // New component for the default layout
import HyperchargedLayout from './HyperchargedLayout'; // New component for the hypercharged layout
import anime from 'animejs'; // Import Anime.js for animations

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
  // State to manage the transition animation
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Set initial UI mode based on the theme loaded from next-themes
    const initialMode = theme === 'hypercharged' ? 'hypercharged' : 'vanilla';
    setActiveUIMode(initialMode);
    // Ensure body has correct theme class on initial mount
    document.documentElement.setAttribute('data-theme', initialMode);
    document.documentElement.classList.toggle('dark', initialMode === 'vanilla'); // Assume vanilla is dark
    document.documentElement.classList.toggle('hypercharged-active', initialMode === 'hypercharged');

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

  // --- Hypercharge Toggle Handler with Animation ---
  const handleHyperchargeToggle = useCallback(() => {
    if (!mounted || isTransitioning) return; // Prevent toggling during transition

    const nextTheme = activeUIMode === 'vanilla' ? 'hypercharged' : 'dark';
    const nextUIMode = nextTheme === 'hypercharged' ? 'hypercharged' : 'vanilla';

    console.log(`Toggling theme. Current UI: ${activeUIMode}, Next UI: ${nextUIMode}, Next Theme: ${nextTheme}`);

    setIsTransitioning(true); // Start transition animation

    // Placeholder: Trigger "Ash Out" or "Dissolve" animation based on current mode
    // This would target the '.vanilla-ui-element' or '.hypercharged-ui-element' classes
    const currentElementsSelector = activeUIMode === 'vanilla' ? '.vanilla-ui-element' : '.hypercharged-ui-element';
    const animationOutConfig = activeUIMode === 'vanilla' ?
      { // Ash Out Effect (Simplified)
        targets: currentElementsSelector,
        opacity: [1, 0],
        translateY: [0, -20], // Move slightly up
        filter: ['blur(0px)', 'blur(10px)'],
        scale: [1, 0.9],
        duration: 600, // Duration for ash out
        easing: 'easeInQuad',
        delay: anime.stagger(50) // Stagger element animations
      } :
      { // Hypercharged Dissolve Effect
        targets: currentElementsSelector,
        opacity: [1, 0],
        scale: [1, 1.1],
        filter: ['blur(0px)', 'blur(8px)'],
        duration: 600, // Duration for dissolve out
        easing: 'easeInCubic',
        delay: anime.stagger(50) // Stagger element animations
      };

    anime({
      ...animationOutConfig,
      complete: () => {
        // --- Update Theme and UI State ---
        // Apply theme using next-themes
        setTheme(nextTheme);
        // Update the active UI mode state
        setActiveUIMode(nextUIMode);
        // Update body/html attributes AFTER the state update allows new layout to mount
        requestAnimationFrame(() => {
             document.documentElement.setAttribute('data-theme', nextUIMode);
             document.documentElement.classList.toggle('dark', nextUIMode === 'vanilla');
             document.documentElement.classList.toggle('hypercharged-active', nextUIMode === 'hypercharged');

            // --- Trigger "Reveal" Animation ---
            // Placeholder: Trigger "Katana Slash" or "Rebuild" animation
            // This targets the new elements that just mounted
            const nextElementsSelector = nextUIMode === 'vanilla' ? '.vanilla-ui-element' : '.hypercharged-ui-element';
             const animationInConfig = nextUIMode === 'hypercharged' ?
                 { // Katana Slash Reveal (Simplified)
                     targets: nextElementsSelector,
                     opacity: [0, 1],
                     translateX: [-50, 0], // Slide in from left after slash
                     scale: [1.2, 1],
                     filter: ['blur(10px)', 'blur(0px)'],
                     duration: 700, // Duration for reveal
                     delay: anime.stagger(100, { start: 100 }), // Stagger elements slightly
                     easing: 'easeOutExpo',
                 } :
                 { // Vanilla Rebuild Effect
                     targets: nextElementsSelector,
                     opacity: [0, 1],
                     translateY: [20, 0], // Slide up
                     scale: [0.95, 1],
                     duration: 700, // Duration for rebuild
                     delay: anime.stagger(100, { start: 100 }), // Stagger elements slightly
                     easing: 'easeOutCubic',
                 };

             anime({
                 ...animationInConfig,
                 begin: () => {
                     // Ensure elements are initially hidden for animation
                     const elements = document.querySelectorAll(nextElementsSelector);
                      elements.forEach(el => (el as HTMLElement).style.opacity = '0');
                 },
                 update: (anim) => {
                      // Ensure elements become visible during animation
                       const elements = document.querySelectorAll(nextElementsSelector);
                       elements.forEach(el => (el as HTMLElement).style.opacity = ''); // Let anime.js control opacity
                 },
                 complete: () => {
                   setIsTransitioning(false); // End transition
                 }
             });
        });
      }
    });

  }, [mounted, activeUIMode, setTheme, isTransitioning]);


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
      isHypercharging: isTransitioning, // Indicate if transition is happening
      currentTheme: activeUIMode, // Pass the active UI mode as the 'theme' indicator
  };

  return (
    <div className={cn(
        "flex flex-col min-h-screen h-screen overflow-hidden relative",
        // Add classes to manage visibility during transitions
        // These help prevent both UIs showing simultaneously briefly
        // isTransitioning ? 'transition-opacity duration-500 opacity-0' : 'opacity-100' // Basic fade (might cause flicker)
        )}>
        {/* Render the currently active UI */}
         <div className={cn("absolute inset-0 transition-opacity duration-700", activeUIMode === 'vanilla' ? 'opacity-100 z-10' : 'opacity-0 z-0')}>
            <VanillaLayout {...commonLayoutProps}>
                {children}
            </VanillaLayout>
         </div>
          <div className={cn("absolute inset-0 transition-opacity duration-700", activeUIMode === 'hypercharged' ? 'opacity-100 z-10' : 'opacity-0 z-0')}>
            <HyperchargedLayout {...commonLayoutProps}>
                {children}
            </HyperchargedLayout>
         </div>


       {/* Search Popup remains outside the themed layouts, always available */}
      <SearchPopup
        isOpen={isSearchOpen}
        onClose={handleCloseSearch}
        isAiActive={isAiSearchActive}
        initialSearchTerm={initialSearchTerm}
        onAiToggle={handleAiToggle}
        openWithFilters={openWithFilters}
      />

       {/* Floating Hypercharge Button - Positioned outside main layouts */}
      <button
          onClick={handleHyperchargeToggle}
          disabled={isTransitioning}
          className={cn(
              "fixed bottom-20 right-4 z-[60] p-2 rounded-full transition-all duration-300 ease-in-out group",
              "w-12 h-12 flex items-center justify-center", // Consistent size
              // Theme-aware styling - applied dynamically based on `activeUIMode`
              activeUIMode === 'vanilla'
                  ? "bg-primary text-primary-foreground shadow-lg hover:bg-primary/80 hover:scale-105" // Vanilla Style
                  : "bg-gradient-to-br from-accent to-green-400 text-black shadow-[0_0_15px_theme(colors.accent)] hover:shadow-[0_0_25px_theme(colors.accent)] hover:scale-105", // Hypercharge Style
              isTransitioning ? 'opacity-50 cursor-not-allowed animate-pulse-subtle' : '' // Indicate transition state
          )}
          aria-label="Toggle Hypercharge Mode"
      >
           {/* Katana Hilt SVG */}
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
             className={cn(
                "transition-transform duration-300 ease-in-out group-hover:rotate-12",
                // Change color based on active theme
                activeUIMode === 'vanilla' ? 'text-primary-foreground' : 'text-black',
                // Glitch effect on hover when hypercharge is *off*
                activeUIMode === 'vanilla' ? 'group-hover:animate-glitch-subtle' : '',
                {'animate-neon-pulse': activeUIMode === 'hypercharged'} // Neon pulse when hypercharge is active
             )}
             data-text="⚡" // For glitch effect if using CSS ::before/::after
           >
             <path d="M20 4v5l-9 7-7-7Z" /> {/* Tsuka (handle) top */}
             <path d="M4 20v-5l9-7 7 7Z" /> {/* Tsuka (handle) bottom */}
             <path d="M11 7h2"/> {/* Tsuba (guard) - simplified */}
             {/* Subtle glow for hypercharge button */}
             {activeUIMode === 'hypercharged' && <filter id="neon-glow"><feGaussianBlur stdDeviation="0.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>}
             {activeUIMode === 'hypercharged' && <path d="M20 4v5l-9 7-7-7Z" style={{ filter: 'url(#neon-glow)' }} strokeWidth="2.5" stroke="hsl(var(--accent))"/>}
             {activeUIMode === 'hypercharged' && <path d="M4 20v-5l9-7 7 7Z" style={{ filter: 'url(#neon-glow)' }} strokeWidth="2.5" stroke="hsl(var(--accent))"/>}
            </svg>
      </button>

      {/* Global Toaster */}
      <Toaster />
    </div>
  );
}
