
'use client';

import React, { useState, type ReactNode, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTheme } from "next-themes";
import TopBar from './TopBar';
import BottomNavigationBar from './BottomNavigationBar';
import SearchPopup from '@/components/search/SearchPopup';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import anime from 'animejs';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false); // State to track client mount

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAiSearchActive, setIsAiSearchActive] = useState(false);
  const [initialSearchTerm, setInitialSearchTerm] = useState('');
  const [openWithFilters, setOpenWithFilters] = useState(false);
  const [isHypercharging, setIsHypercharging] = useState(false);

  // Effect to set mounted state after initial render
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
      complete: () => {
        elementsToDissolve.forEach(el => (el as HTMLElement).style.visibility = 'hidden');
        triggerKatanaSlash();
      }
    });
  };

  const triggerKatanaSlash = () => {
    const slashElement = document.createElement('div');
    slashElement.className = 'katana-slash-effect';
    document.body.appendChild(slashElement);

    setTimeout(() => {
      setTheme('hypercharged');
       document.body.removeChild(slashElement);
      setIsHypercharging(false);
      const elementsToDissolve = document.querySelectorAll('.vanilla-ui-element');
      elementsToDissolve.forEach(el => (el as HTMLElement).style.visibility = ''); // Reset visibility
    }, 500);
  };

    const triggerHyperchargeOff = () => {
        anime({
            targets: 'body[data-theme="hypercharged"] > *',
            opacity: [1, 0],
            duration: 600,
            easing: 'easeInExpo',
            delay: anime.stagger(30),
            complete: () => {
                setTheme('dark');

                const vanillaElements = document.querySelectorAll('.vanilla-ui-element');
                vanillaElements.forEach(el => {
                    (el as HTMLElement).style.opacity = '0';
                     (el as HTMLElement).style.visibility = 'visible';
                 });

                anime({
                    targets: '.vanilla-ui-element',
                    opacity: [0, 1],
                    translateY: [20, 0],
                    duration: 700,
                    easing: 'easeOutExpo',
                    delay: anime.stagger(40, { start: 100 }),
                     complete: () => {
                         setIsHypercharging(false);
                     }
                });
            }
        });
    };


  const handleHyperchargeToggle = () => {
    if (isHypercharging) return;
    setIsHypercharging(true);

     if (theme !== 'hypercharged') {
         triggerAshOut();
     } else {
         triggerHyperchargeOff();
     }
  };


  return (
    <div className="flex flex-col min-h-screen h-screen overflow-hidden relative">
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
             <div className="animate-fade-in duration-500 vanilla-ui-element">
                 {children}
             </div>
        </div>
      </main>

      <BottomNavigationBar
        className="vanilla-ui-element"
        onHyperchargeToggle={handleHyperchargeToggle} // Pass the toggle function
        isHypercharging={isHypercharging} // Pass the state
      />

      <SearchPopup
        isOpen={isSearchOpen}
        onClose={handleCloseSearch}
        isAiActive={isAiSearchActive}
        initialSearchTerm={initialSearchTerm}
        onAiToggle={handleAiToggle}
        openWithFilters={openWithFilters}
      />

    </div>
  );
}
