
'use client';

import { useState, type ReactNode, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from "next-themes"; // Import useTheme
import TopBar from './TopBar';
import BottomNavigationBar from './BottomNavigationBar';
import SearchPopup from '@/components/search/SearchPopup';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button'; // Import Button
import { Zap } from 'lucide-react'; // Or a custom Katana icon
import anime from 'animejs'; // Import animejs

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme(); // Use the theme hook

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAiSearchActive, setIsAiSearchActive] = useState(false);
  const [initialSearchTerm, setInitialSearchTerm] = useState('');
  const [openWithFilters, setOpenWithFilters] = useState(false);
  const [isHypercharging, setIsHypercharging] = useState(false); // State for animation

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
    // Target elements to dissolve
    const elementsToDissolve = document.querySelectorAll('.vanilla-ui-element'); // Add this class to elements you want to dissolve

    anime({
      targets: elementsToDissolve,
      opacity: [1, 0],
      scale: [1, 0.8],
      translateY: [0, -50],
      filter: ['blur(0)', 'blur(10px)'],
      duration: 800,
      easing: 'easeOutExpo',
      delay: anime.stagger(50), // Stagger the animation
      complete: () => {
        // Hide elements after animation
        elementsToDissolve.forEach(el => (el as HTMLElement).style.visibility = 'hidden');
        triggerKatanaSlash();
      }
    });
  };

  const triggerKatanaSlash = () => {
    const slashElement = document.createElement('div');
    slashElement.className = 'katana-slash-effect';
    document.body.appendChild(slashElement);

    // Optional: Play sound
    // const audio = new Audio('/sounds/katana-slash.mp3');
    // audio.play();

    // Animation is handled by CSS, wait for it to complete
    setTimeout(() => {
      setTheme('hypercharged'); // Switch theme after slash
       document.body.removeChild(slashElement); // Clean up slash element
      setIsHypercharging(false); // End animation state
      // Reset visibility of vanilla elements if needed when switching back
      const elementsToDissolve = document.querySelectorAll('.vanilla-ui-element');
      elementsToDissolve.forEach(el => (el as HTMLElement).style.visibility = '');
    }, 500); // Matches CSS animation duration
  };

    const triggerHyperchargeOff = () => {
        // 1. Reverse Katana Slash (or similar effect) - Example: Bright fade out
        anime({
            targets: 'body[data-theme="hypercharged"] > *', // Target top-level elements in hypercharge
            opacity: [1, 0],
            duration: 600,
            easing: 'easeInExpo',
            delay: anime.stagger(30),
            complete: () => {
                // 2. Switch theme
                setTheme('dark'); // Switch back to vanilla dark

                // 3. Rebuild Vanilla UI (Fade in)
                 // Reset visibility for elements that were hidden
                const vanillaElements = document.querySelectorAll('.vanilla-ui-element');
                vanillaElements.forEach(el => {
                    (el as HTMLElement).style.opacity = '0';
                     (el as HTMLElement).style.visibility = 'visible'; // Make sure they are visible again
                 });

                anime({
                    targets: '.vanilla-ui-element',
                    opacity: [0, 1],
                    translateY: [20, 0], // Optional: slide in effect
                    duration: 700,
                    easing: 'easeOutExpo',
                    delay: anime.stagger(40, { start: 100 }), // Start after theme switch settles
                     complete: () => {
                         setIsHypercharging(false); // Animation complete
                     }
                });
            }
        });
    };


  const handleHyperchargeToggle = () => {
    if (isHypercharging) return; // Prevent triggering during animation
    setIsHypercharging(true);

     if (theme !== 'hypercharged') {
         // Trigger "ON" animation
         triggerAshOut(); // Starts the sequence: Ash -> Slash -> Theme Change
     } else {
         // Trigger "OFF" animation
         triggerHyperchargeOff(); // Starts the reverse sequence
     }
  };

  return (
    <div className="flex flex-col min-h-screen h-screen overflow-hidden relative"> {/* Added relative for absolute positioning */}
      {/* Add vanilla-ui-element class to major layout components */}
      <TopBar
        className="vanilla-ui-element"
        onSearchIconClick={() => handleSearchToggle()}
        onSearchSubmit={handleSearchToggle}
        onAiToggle={handleAiToggle}
        isAiSearchActive={isAiSearchActive}
        onOpenAiSearch={handleOpenAiSearch}
        onOpenAdvancedSearch={handleOpenAdvancedSearch}
      />

      <main className="flex-1 overflow-y-auto pb-20 vanilla-ui-element">
        <div className={cn("transition-opacity duration-500", isHypercharging ? "opacity-0" : "opacity-100")}>
             {/* Apply animation class conditionally if needed */}
             {/* Add vanilla-ui-element to children container if they should dissolve */}
             <div className="animate-fade-in duration-500 vanilla-ui-element">
                 {children}
             </div>
        </div>
      </main>

      <BottomNavigationBar
        className="vanilla-ui-element"
        /* removed search/ai handlers as they are handled globally now */
      />

      <SearchPopup
        isOpen={isSearchOpen}
        onClose={handleCloseSearch}
        isAiActive={isAiSearchActive}
        initialSearchTerm={initialSearchTerm}
        onAiToggle={handleAiToggle}
        openWithFilters={openWithFilters}
      />

      {/* Hypercharge Button */}
      <Button
        variant="default" // Style as needed
        size="icon"
        className={cn(
            "fixed bottom-20 right-4 z-50 rounded-full h-12 w-12 shadow-lg neon-glow-hover",
             // Apply theme-specific styles
            theme === 'hypercharged'
            ? "bg-accent text-accent-foreground hover:bg-accent/90 border-2 border-secondary" // Green button in hypercharge
            : "bg-primary text-primary-foreground hover:bg-primary/90", // Default blue button
            isHypercharging && "opacity-50 pointer-events-none" // Disable during animation
        )}
        onClick={handleHyperchargeToggle}
        aria-label="Toggle Hypercharge Mode"
      >
        <Zap className="h-6 w-6" />
      </Button>
    </div>
  );
}
