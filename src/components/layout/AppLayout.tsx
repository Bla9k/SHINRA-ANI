'use client';

import React, { useState, type ReactNode, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from "next-themes";
import TopBar from './TopBar';
import BottomNavigationBar from './BottomNavigationBar';
import SearchPopup from '@/components/search/SearchPopup';
import { cn } from '@/lib/utils';
import anime from 'animejs';
import { flushSync } from 'react-dom'; // Import flushSync
import { Button } from '@/components/ui/button'; // Import Button
import { Zap } from 'lucide-react'; // Assuming Zap is the icon

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAiSearchActive, setIsAiSearchActive] = useState(false);
  const [initialSearchTerm, setInitialSearchTerm] = useState('');
  const [openWithFilters, setOpenWithFilters] = useState(false);
  const [isHypercharging, setIsHypercharging] = useState(false);

  // Track mounted state to avoid hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  // --- Search Handlers ---
  const handleSearchToggle = useCallback((term: string = '') => {
    setInitialSearchTerm(term);
    setIsSearchOpen(prev => !prev);
    setIsAiSearchActive(false);
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
        if (nextState && !isSearchOpen) {
            setIsSearchOpen(true);
            setOpenWithFilters(false);
        }
        return nextState;
    });
  }, [isSearchOpen]);

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

  // --- Hypercharge Animation Logic ---
  const triggerAshOut = () => {
    console.log("Triggering Ash Out");
    const elementsToDissolve = document.querySelectorAll('.vanilla-ui-element');

    anime({
      targets: elementsToDissolve,
      opacity: [1, 0],
      scale: [1, 0.8],
      translateY: [0, -50],
      filter: ['blur(0)', 'blur(10px)'],
      duration: 800,
      easing: 'easeOutExpo',
      delay: anime.stagger(50),
      begin: () => {
          // Add a class to prevent interaction during animation
          document.body.classList.add('no-interaction');
      },
      complete: () => {
        console.log("Ash Out complete, triggering Katana Slash");
        elementsToDissolve.forEach(el => (el as HTMLElement).style.visibility = 'hidden'); // Hide after animation
        triggerKatanaSlash();
      }
    });
  };

  const triggerKatanaSlash = () => {
    console.log("Triggering Katana Slash");
    const slashElement = document.createElement('div');
    slashElement.className = 'katana-slash-effect';
    document.body.appendChild(slashElement);

    // Use flushSync to ensure theme change happens *after* slash animation starts
    // This is crucial to avoid flashing the wrong theme styles.
    flushSync(() => {
        setTheme('hypercharged'); // Apply the theme class via ThemeProvider
    });

    // Remove slash after animation and clean up
    setTimeout(() => {
        console.log("Katana Slash animation finished, resetting elements");
        if (document.body.contains(slashElement)) {
            document.body.removeChild(slashElement);
        }
         setIsHypercharging(false);
         document.body.classList.remove('no-interaction'); // Re-enable interaction
         console.log("Hypercharge activated");

    }, 500); // Matches katana-slash animation duration
  };

  const triggerHyperchargeOff = () => {
    console.log("Triggering Hypercharge Off");

    // Animate hypercharge UI elements fading out
    // Target elements likely styled by data-theme="hypercharged" or specific classes
    const hyperchargeElements = document.querySelectorAll('[data-theme="hypercharged"] .hypercharge-element, [data-theme="hypercharged"] nav'); // Example selectors

    anime({
        targets: hyperchargeElements,
        opacity: [1, 0],
        scale: [1, 0.95], // Slight scale down
        duration: 600,
        easing: 'easeInExpo',
        delay: anime.stagger(30),
        begin: () => {
          document.body.classList.add('no-interaction'); // Disable interaction during fade out
        },
        complete: () => {
            console.log("Hypercharge fade out complete, setting theme to dark");
            // Use flushSync to ensure theme is set synchronously before next animation
            flushSync(() => {
                setTheme('dark'); // Switch back to dark theme class via ThemeProvider
            });

             console.log("Theme set to dark, animating vanilla elements back in");
            // Animate vanilla elements fading back in AFTER theme has changed
             const vanillaElements = document.querySelectorAll('.vanilla-ui-element');
             vanillaElements.forEach(el => {
                 const htmlEl = el as HTMLElement;
                 // Reset styles potentially affected by ash-out and ensure visibility for animation
                 htmlEl.style.visibility = 'visible'; // Make them visible first
                 htmlEl.style.opacity = '0'; // Start animation from invisible
                 htmlEl.style.transform = 'translateY(20px) scale(1)'; // Start position for entry animation
                 htmlEl.style.filter = 'blur(0)'; // Reset filter
             });

            anime({
                targets: '.vanilla-ui-element',
                opacity: [0, 1],
                translateY: [20, 0], // Animate from slightly below
                duration: 700,
                easing: 'easeOutExpo',
                delay: anime.stagger(40, { start: 100 }), // Staggered entry
                 complete: () => {
                     console.log("Hypercharge deactivated");
                     setIsHypercharging(false); // Reset state after animation completes
                     document.body.classList.remove('no-interaction'); // Re-enable interaction
                 }
            });
        }
    });
  };


  const handleHyperchargeToggle = () => {
    if (isHypercharging || !mounted) return; // Prevent double-clicks and run only client-side
    console.log(`Toggling Hypercharge. Current theme: ${theme}`);
    setIsHypercharging(true);

     if (theme !== 'hypercharged') {
         triggerAshOut(); // Transition to Hypercharge
     } else {
         triggerHyperchargeOff(); // Transition back to Dark
     }
  };

   // Theme will be undefined on first render, then set based on localStorage/default
   // Only access theme after mount to avoid hydration issues
   const currentTheme = mounted ? theme : 'dark'; // Use actual theme after mount

  return (
    // Remove the theme class from this div, ThemeProvider manages it on <html>
    <div className={"flex flex-col min-h-screen h-screen overflow-hidden relative"}>

        {/* Render TopBar only if not hypercharged OR during transition out */}
        {mounted && currentTheme !== 'hypercharged' && (
             <TopBar
                 className={cn(
                    "vanilla-ui-element transition-opacity duration-500", // Base class + transition
                    isHypercharging ? 'opacity-0' : 'opacity-100' // Fade out during transition TO hypercharge
                 )}
                 onSearchIconClick={() => handleSearchToggle()}
                 onSearchSubmit={handleSearchToggle}
                 onAiToggle={handleAiToggle}
                 isAiSearchActive={isAiSearchActive}
                 onOpenAiSearch={handleOpenAiSearch}
                 onOpenAdvancedSearch={handleOpenAdvancedSearch}
            />
        )}

         {/* Use a container div for the main content */}
         <div className="flex-1 overflow-y-auto pb-16"> {/* Adjust padding-bottom */}
            {/* Add vanilla-ui-element class to main content area for ash-out animation */}
             <main className={cn(
                  "transition-opacity duration-500 vanilla-ui-element",
                  // Fade out vanilla content when transitioning TO hypercharge
                  isHypercharging && currentTheme !== 'hypercharged' ? 'opacity-0' : 'opacity-100'
             )}>
                 {children}
             </main>
         </div>

        {/* Bottom Nav: Render always but style based on theme */}
        <BottomNavigationBar
             className={cn(
                "vanilla-ui-element transition-opacity duration-500", // Base class + transition
                // Fade out vanilla nav when transitioning TO hypercharge
                isHypercharging && currentTheme !== 'hypercharged' ? 'opacity-0' : 'opacity-100'
             )}
             onHyperchargeToggle={handleHyperchargeToggle}
             isHypercharging={isHypercharging}
             currentTheme={currentTheme ?? 'dark'} // Pass current theme
        />

        {/* Search Popup: Render always, styling handled internally */}
        <SearchPopup
            isOpen={isSearchOpen}
            onClose={handleCloseSearch}
            isAiActive={isAiSearchActive}
            initialSearchTerm={initialSearchTerm}
            onAiToggle={handleAiToggle}
            openWithFilters={openWithFilters}
        />

         {/* Floating Hypercharge Button (Rendered only on client after mount) */}
         {/* Apply hypercharge-element class for targeting during fade-out */}
         {mounted && (
           <Button
             variant="default" // Or custom variant
             size="icon"
             className={cn(
               'fixed bottom-20 right-5 z-50 rounded-full h-14 w-14 shadow-lg transition-all duration-300 ease-out hypercharge-element', // Added hypercharge-element
               // Theme-specific styling
               currentTheme === 'hypercharged'
                 ? 'bg-gradient-to-br from-secondary to-accent text-black button-pulse-hover' // Hypercharge style
                 : 'bg-primary text-primary-foreground hover:bg-primary/90', // Vanilla style
               // Animation states
               isHypercharging ? 'opacity-50 scale-95 cursor-not-allowed' : 'hover:scale-110',
               // Hide button briefly during transition *away* from hypercharge
               isHypercharging && currentTheme === 'hypercharged' ? 'opacity-0' : 'opacity-100'
             )}
             onClick={handleHyperchargeToggle}
             disabled={isHypercharging}
             aria-label="Toggle Hypercharge Mode"
           >
             {/* Replace Zap with a custom Katana hilt icon/SVG if desired */}
              <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn(currentTheme === 'hypercharged' ? "text-black" : "text-primary-foreground")}>
                  <path d="M50 0L61.226 30.9017H95.1056L69.9398 50L81.1658 80.9017H50L18.8342 80.9017L30.0602 50L4.89435 30.9017H38.774L50 0Z" fill="currentColor"/>
              </svg>
           </Button>
         )}
         {/* Global styles for interaction blocking */}
         <style jsx global>{`
            .no-interaction {
                pointer-events: none;
                user-select: none;
            }
        `}</style>
    </div>
  );
}
