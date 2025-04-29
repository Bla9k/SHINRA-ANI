// src/components/layout/HyperchargedLayout.tsx
'use client';

import React, { type ReactNode, useEffect, useRef } from 'react';
import { Zap, Sparkles, Search, User, Tv, BookText, Users } from 'lucide-react'; // Import necessary icons
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
import { usePathname } from 'next/navigation'; // Import usePathname

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
               isAiSearchActive && "bg-primary/20 ring-2 ring-primary animate-neon-pulse" // Enhanced active state
            )}
           onClick={onAiToggle}
           aria-pressed={isAiSearchActive}
           aria-label={isAiSearchActive ? 'Deactivate AI Search Mode' : 'Activate AI Search Mode'}
        >
         <Sparkles className="h-5 w-5 transition-transform duration-300 group-hover:rotate-[360deg] group-hover:scale-110" />
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
    const pathname = usePathname();


   // Anime.js entrance animation for hypercharged elements
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
                // More complex movement for nebula/cityscape effect
               { backgroundPosition: '0% 50%', opacity: 0.8 },
               { backgroundPosition: '100% 50%', opacity: 1.0 },
               { backgroundPosition: '0% 50%', opacity: 0.8 },
             ],
             duration: 90000, // Very slow animation (90 seconds)
             easing: 'linear',
             loop: true,
           });
         }

    }, []); // Run only once on mount

      // --- Hypercharged Bottom Nav ---
      // Note: Consider abstracting this further if it grows complex
      const HyperchargedBottomNav = () => {
           const navItems = [
             { href: '/', icon: Zap, label: 'Home' }, // Use Zap for Home
             { href: '/anime', icon: Tv, label: 'Anime' },
             { href: '/manga', icon: BookText, label: 'Manga' },
             { href: '/community', icon: Users, label: 'Community' },
             { href: '/profile', icon: User, label: 'Profile' },
           ];

          return (
             <nav className={cn(
                 "fixed bottom-0 left-0 right-0 z-50 h-16 border-t hypercharge-nav", // Use dedicated class
                 "hypercharged-ui-element" // Target for animations
             )}>
                <div className="flex justify-around items-center h-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto px-1 relative">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                        return (
                            <Link href={item.href} key={item.href} passHref legacyBehavior>
                                <Button
                                    variant="ghost"
                                    className={cn(
                                    'nav-item-base flex flex-col items-center justify-center flex-1 h-full px-1 py-2 text-xs sm:text-sm transition-all duration-300 ease-in-out relative z-10 group',
                                    'hover:bg-transparent', // No background hover
                                    isActive
                                        ? 'text-accent animate-neon-pulse-icon' // Active uses accent color + pulse
                                        : 'text-muted-foreground hover:text-secondary', // Inactive uses muted, hover cyan
                                    )}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                     <item.icon className={cn(
                                         "w-5 h-5 mb-0.5 transition-transform duration-300 group-hover:scale-110",
                                         isActive ? 'text-accent' : '' // Icon color matches text
                                     )} />
                                    <span className="truncate max-w-full">{item.label}</span>
                                </Button>
                            </Link>
                        );
                    })}
                </div>
            </nav>
          );
      };


  return (
     <>
        {/* Dynamic Background Container */}
         <div
            ref={backgroundRef}
            className={cn(
                "absolute inset-0 -z-10 transition-opacity duration-1000",
                 // Complex gradient for space/cyberpunk feel
                "bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-indigo-900/40 via-purple-900/30 to-hc-deep-space-blue",
                "bg-[length:300%_300%]" // Make background larger for animation
            )}
          />

       <HyperchargedTopBar
          onSearchToggle={onSearchToggle}
          onAiToggle={onAiToggle}
          isAiSearchActive={isAiSearchActive}
          />

        {/* Main content area with specific class for animation targeting */}
       <div ref={mainContentRef} className="flex-1 overflow-y-auto pb-16 hypercharged-ui-element scrollbar-thin">
         <main className="p-4 md:p-6"> {/* Consistent padding */}
           {children}
         </main>
           {/* Hypercharge Specific Footer - Example */}
           <footer className="text-center py-4 px-4 border-t border-secondary/30 text-xs text-muted-foreground hypercharged-ui-element">
              <p>&copy; {new Date().getFullYear()} Shinra-Ani Inc. - Hypercharge Protocol v1.0</p>
               <p>Built with Neon & Dreams</p>
           </footer>
       </div>

        {/* Use the dedicated Hypercharged Bottom Nav */}
        <HyperchargedBottomNav />
     </>
   );
}
