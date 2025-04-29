// src/components/layout/HyperchargedLayout.tsx
'use client';

import React, { type ReactNode, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import anime from 'animejs'; // Import Anime.js

// Define placeholder components for Hypercharged theme specific elements
// Replace these with actual implementations later

const HyperchargedTopBar = ({ onSearchToggle, onAiToggle, isAiSearchActive }: any) => (
  <header className="sticky top-0 z-40 flex h-16 items-center gap-2 md:gap-4 border-b bg-black/80 px-4 backdrop-blur-xl border-primary/50 shadow-[0_0_15px_theme(colors.primary)]">
    {/* Hypercharged Logo/Title */}
    <div className="flex items-center gap-2 mr-auto">
      <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary animate-pulse-subtle">
        <path d="M50 0L61.226 30.9017H95.1056L69.9398 50L81.1658 80.9017H50L18.8342 80.9017L30.0602 50L4.89435 30.9017H38.774L50 0Z" fill="currentColor"/>
      </svg>
      <span className="font-bold text-lg hidden sm:inline text-transparent bg-clip-text bg-gradient-to-r from-primary via-fuchsia-500 to-secondary">
        SHINRA-ANI
      </span>
    </div>
    {/* Hypercharged Search/AI/Profile controls */}
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon" className="rounded-full text-secondary hover:text-accent hover:bg-secondary/10" onClick={() => onSearchToggle()}>
        {/* Replace with styled search icon */}
         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </Button>
       <Button variant="ghost" size="icon" className={cn("rounded-full text-primary hover:text-accent hover:bg-primary/10", isAiSearchActive && "bg-primary/20 ring-2 ring-primary")} onClick={onAiToggle}>
         {/* Replace with styled AI icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
       </Button>
       {/* Profile Button Placeholder */}
        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </Button>
    </div>
  </header>
);

const HyperchargedBottomNav = ({ onHyperchargeToggle, isHypercharging }: any) => (
   <nav className={cn(
       "fixed bottom-0 left-0 right-0 z-50 h-16 hypercharge-nav transition-smooth", // Use hypercharge specific class
   )}>
     <div className="flex justify-around items-center h-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto px-1 relative">
       {/* Placeholder Nav Items - Replace with actual styled items later */}
       <Button variant="ghost" className="flex-1 h-full text-muted-foreground hover:text-secondary">Home</Button>
       <Button variant="ghost" className="flex-1 h-full text-muted-foreground hover:text-secondary">Anime</Button>
        {/* Hypercharge Toggle Button */}
        <Button
            variant="ghost"
            size="icon"
            className={cn(
                'hypercharge-button flex flex-col items-center justify-center h-full w-16 mx-2 text-xs sm:text-sm transition-colors duration-200 z-10 group',
                 'text-primary hover:text-accent hover:bg-transparent', // Hypercharge style
                 isHypercharging ? 'opacity-50 cursor-not-allowed' : ''
             )}
            onClick={onHyperchargeToggle}
            disabled={isHypercharging}
            aria-label="Toggle Hypercharge Mode"
        >
             <Zap className="w-6 h-6 hypercharge-icon" />
            <span className="truncate max-w-full text-[10px] leading-tight mt-0.5">Vanilla</span>
        </Button>
       <Button variant="ghost" className="flex-1 h-full text-muted-foreground hover:text-secondary">Manga</Button>
       <Button variant="ghost" className="flex-1 h-full text-muted-foreground hover:text-secondary">Community</Button>
        <Button variant="ghost" className="flex-1 h-full text-muted-foreground hover:text-secondary">Profile</Button>
     </div>
   </nav>
);


interface HyperchargedLayoutProps {
  children: ReactNode;
   onSearchToggle: (term?: string) => void;
   onAiToggle: () => void;
   isAiSearchActive: boolean;
   onHyperchargeToggle: () => void;
   isHypercharging: boolean;
   currentTheme: string; // Keep theme prop
   // Remove unused search handlers if TopBar handles them internally now
    onOpenAiSearch: (term: string) => void;
    onOpenAdvancedSearch: (term: string) => void;
}

export default function HyperchargedLayout({
  children,
  onSearchToggle,
  onAiToggle,
  isAiSearchActive,
  onHyperchargeToggle,
  isHypercharging,
}: HyperchargedLayoutProps) {

   // Example Anime.js animation on mount - Apply to a specific element
   useEffect(() => {
       const targetElement = '.hypercharge-main-content'; // Target the main content area
        if(document.querySelector(targetElement)) {
             anime({
                 targets: targetElement,
                 opacity: [0, 1],
                 translateY: [20, 0],
                 duration: 800,
                 easing: 'easeOutExpo',
                 delay: 100 // Slight delay after theme switch
             });
         }
    }, []); // Run only once on mount


  return (
     <>
        {/* Apply dynamic background class to the body or a container */}
        {/* Example: A background container */}
         <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[hsl(var(--background))] via-purple-950/50 to-cyan-950/50 animate-pulse-subtle">
            {/* Optional: Add moving particle/nebula effect here */}
         </div>

       <HyperchargedTopBar
          onSearchToggle={onSearchToggle}
          onAiToggle={onAiToggle}
          isAiSearchActive={isAiSearchActive}
          />

        {/* Main content area with specific class for animation targeting */}
       <div className="flex-1 overflow-y-auto pb-16 hypercharge-main-content">
         {/* Apply glass effect to children container if needed */}
         {/* <main className="p-4 md:p-6 glass"> */}
         <main className="transition-smooth">
           {children}
         </main>
       </div>

       <HyperchargedBottomNav
         onHyperchargeToggle={onHyperchargeToggle}
         isHypercharging={isHypercharging}
       />
     </>
   );
}
