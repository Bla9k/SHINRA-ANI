// src/components/layout/HyperchargedLayout.tsx
'use client';

import React, { type ReactNode, useEffect, useRef } from 'react';
import { Zap, Sparkles, Search, User } from 'lucide-react'; // Import necessary icons
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import anime from 'animejs'; // Import Anime.js
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import BottomNavigationBar from './BottomNavigationBar'; // Import common bottom nav

// Define placeholder components for Hypercharged theme specific elements
// Replace these with actual implementations later

const HyperchargedTopBar = ({ onSearchToggle, onAiToggle, isAiSearchActive }: any) => (
    // Use hypercharge-specific colors and effects
  <header className={cn(
      "sticky top-0 z-40 flex h-16 items-center gap-2 md:gap-4 border-b px-4 backdrop-blur-xl",
      "bg-black/80 border-secondary/50 shadow-[0_0_20px_theme(colors.secondary/30)]", // Use secondary for border/shadow
       "hypercharged-ui-element" // Class for animation targeting
      )}>
    {/* Hypercharged Logo/Title */}
    <Link href="/" className="flex items-center gap-2 mr-auto group">
       {/* Animated SVG logo */}
      <svg width="24" height="24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-secondary group-hover:text-accent transition-colors duration-300 hypercharge-glow">
        <path d="M50 0L61.226 30.9017H95.1056L69.9398 50L81.1658 80.9017H50L18.8342 80.9017L30.0602 50L4.89435 30.9017H38.774L50 0Z" fill="currentColor"/>
      </svg>
      <span className="font-bold text-lg hidden sm:inline text-transparent bg-clip-text bg-gradient-to-r from-secondary via-primary to-fuchsia-500 group-hover:from-accent group-hover:to-primary transition-all duration-300 neon-text-secondary group-hover:neon-text-primary">
        SHINRA-ANI
      </span>
    </Link>
    {/* Hypercharged Search/AI/Profile controls */}
    <div className="flex items-center gap-2">
      <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-secondary hover:text-accent hover:bg-secondary/10 transition-colors duration-300 group hypercharge-glow"
          onClick={() => onSearchToggle()}
          aria-label="Open Search"
        >
         <Search className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
      </Button>
       <Button
           variant="ghost"
           size="icon"
           className={cn(
               "rounded-full text-primary hover:text-accent hover:bg-primary/10 transition-all duration-300 group hypercharge-glow",
               isAiSearchActive && "bg-primary/20 ring-2 ring-primary neon-pulse" // Enhanced active state
            )}
           onClick={onAiToggle}
           aria-pressed={isAiSearchActive}
           aria-label={isAiSearchActive ? 'Deactivate AI Search Mode' : 'Activate AI Search Mode'}
        >
         <Sparkles className="h-5 w-5 transition-transform duration-300 group-hover:rotate-[360deg]" />
       </Button>
       {/* Profile Dropdown */}
       <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hypercharge-glow group">
              <Avatar className="h-8 w-8 border-2 border-transparent group-hover:border-secondary transition-colors duration-300">
                 {/* Replace with actual user data */}
                <AvatarImage src={'https://picsum.photos/40/40?random=1'} alt={'User'} />
                <AvatarFallback className="bg-primary/30 text-primary-foreground text-xs">{'U'}</AvatarFallback>
              </Avatar>
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass animate-hyper-fade-in border-primary/50 w-48"> {/* Styled Dropdown */}
            <DropdownMenuLabel className="neon-text-secondary">ShinraUser</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem asChild className="hover:bg-primary/10 focus:bg-primary/10 cursor-pointer">
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="hover:bg-primary/10 focus:bg-primary/10 cursor-pointer">
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/50"/>
            <DropdownMenuItem className="hover:bg-destructive/20 focus:bg-destructive/20 text-destructive cursor-pointer" onClick={() => console.log('Logout clicked')}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
    </div>
  </header>
);


interface HyperchargedLayoutProps {
  children: ReactNode;
   onSearchToggle: (term?: string) => void;
   onAiToggle: () => void;
   isAiSearchActive: boolean;
   onHyperchargeToggle: () => void;
   isHypercharging: boolean;
   currentTheme: string; // Keep theme prop
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
  currentTheme, // Receive current theme
  // Search handlers might be needed by TopBar
  onOpenAiSearch,
  onOpenAdvancedSearch,
}: HyperchargedLayoutProps) {
    const mainContentRef = useRef<HTMLDivElement>(null);
    const backgroundRef = useRef<HTMLDivElement>(null);


   // Example Anime.js animation on mount - Apply to a specific element
   useEffect(() => {
        // Initial entrance animation for the layout itself
        anime({
            targets: '.hypercharged-ui-element', // Target elements specific to this layout
            opacity: [0, 1],
            translateY: [15, 0], // Subtle slide up
            scale: [0.98, 1], // Subtle zoom in
            filter: ['blur(5px)', 'blur(0px)'],
            duration: 800,
            delay: anime.stagger(100, { start: 100 }), // Stagger elements slightly
            easing: 'easeOutExpo',
        });

        // Dynamic background animation (subtle)
         if (backgroundRef.current) {
           anime({
             targets: backgroundRef.current,
             keyframes: [
               { backgroundPosition: '0% 0%' },
               { backgroundPosition: '100% 100%' },
               { backgroundPosition: '0% 0%' }, // Loop
             ],
             duration: 60000, // Very slow animation (60 seconds)
             easing: 'linear',
             loop: true,
           });
         }

    }, []); // Run only once on mount

  return (
     <>
        {/* Dynamic Background Container */}
         <div
            ref={backgroundRef}
            className={cn(
                "absolute inset-0 -z-10 transition-opacity duration-1000",
                "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/30 via-cyan-900/20 to-background",
                "bg-[length:200%_200%]" // Make background larger for animation
            )}
            // Style below can be used for nebula effect if an image is preferred
            // style={{ backgroundImage: 'url(/path/to/nebula.jpg)', backgroundSize: 'cover' }}
          />

       <HyperchargedTopBar
          onSearchToggle={onSearchToggle}
          onAiToggle={onAiToggle}
          isAiSearchActive={isAiSearchActive}
          // Pass search handlers if TopBar needs them directly
          // onOpenAiSearch={onOpenAiSearch}
          // onOpenAdvancedSearch={onOpenAdvancedSearch}
          />

        {/* Main content area with specific class for animation targeting */}
       <div ref={mainContentRef} className="flex-1 overflow-y-auto pb-16 hypercharged-ui-element scrollbar-thin">
         <main className="transition-smooth p-4 md:p-6"> {/* Add padding to main content */}
           {children}
         </main>
       </div>

       {/* Use the common BottomNavigationBar but pass the hypercharged theme prop */}
       <BottomNavigationBar
         className="hypercharged-ui-element" // Specific class for targeting
         currentTheme="hypercharged"
         // Pass other necessary props if BottomNav needs them (it doesn't currently handle hypercharge toggle)
       />
     </>
   );
}
