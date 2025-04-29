// src/components/layout/BottomNavigationBar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Tv,
  BookText,
  Users,
  User,
  Zap,
  Sparkles, // Icon for AI/Nami if needed
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  currentTheme: string; // Pass theme to NavItem
}

const NavItem = ({ href, icon: Icon, label, currentTheme }: NavItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={href} passHref legacyBehavior>
            <Button
              variant="ghost"
              className={cn(
                'nav-item-base flex flex-col items-center justify-center flex-1 h-full px-1 py-2 text-xs sm:text-sm transition-colors duration-300 ease-in-out relative z-10',
                // Base styling, remove background on hover
                 'hover:bg-transparent',
                // Active state styling
                isActive
                  ? 'active-nav-item text-primary' // Use primary color directly for active state
                  : 'text-muted-foreground',
                 // Theme-specific hover color
                 currentTheme === 'hypercharged'
                    ? 'hover:text-secondary' // Cyan hover for hypercharge
                    : 'hover:text-primary', // Blue hover for vanilla
                // Icon and text smooth transition
                '[&_svg]:transition-colors [&_svg]:duration-300 [&_svg]:ease-in-out',
                '[&_span]:transition-colors [&_span]:duration-300 [&_span]:ease-in-out'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="truncate max-w-full">{label}</span>
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="top" className="hidden sm:block">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface BottomNavigationBarProps {
  className?: string;
  onHyperchargeToggle: () => void;
  isHypercharging: boolean;
  currentTheme: 'vanilla' | 'hypercharged'; // Specify theme types
}

export default function BottomNavigationBar({
  className,
  onHyperchargeToggle,
  isHypercharging,
  currentTheme,
}: BottomNavigationBarProps) {
  const navItems: Omit<NavItemProps, 'currentTheme'>[] = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/anime', icon: Tv, label: 'Anime' },
    { href: '/manga', icon: BookText, label: 'Manga' },
    { href: '/community', icon: Users, label: 'Community' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  // Split nav items to place the hypercharge button in the middle
  const midIndex = Math.ceil(navItems.length / 2);
  const leftItems = navItems.slice(0, midIndex);
  const rightItems = navItems.slice(midIndex);

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 h-16 border-t transition-smooth',
        // Apply theme-specific background and glass effect
        currentTheme === 'hypercharged'
          ? 'bg-black/80 border-primary/50 shadow-[0_0_15px_theme(colors.secondary)] backdrop-blur-xl' // Hypercharge style
          : 'bg-background/95 border-border glass', // Vanilla style
        className
      )}
    >
      <div className="flex justify-around items-center h-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto px-1 relative">
        {leftItems.map((item) => (
          <NavItem key={item.href} {...item} currentTheme={currentTheme} />
        ))}

        {/* Hypercharge Button in the Middle */}
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'hypercharge-button flex flex-col items-center justify-center h-full w-16 mx-2 text-xs sm:text-sm transition-colors duration-200 z-10 group',
                  // Theme-specific text/hover color
                  currentTheme === 'hypercharged'
                    ? 'text-primary hover:text-accent hover:bg-transparent' // Hypercharge: Purple text, Green hover
                    : 'text-muted-foreground hover:text-primary hover:bg-transparent', // Vanilla: Muted text, Blue hover
                  isHypercharging ? 'opacity-50 cursor-not-allowed' : ''
                )}
                onClick={onHyperchargeToggle}
                disabled={isHypercharging}
                aria-label="Toggle Theme Mode"
              >
                 {/* Use Zap icon for toggling */}
                 <Zap className="w-6 h-6 hypercharge-icon transition-colors duration-200" />
                 {/* Change label based on current theme */}
                 <span className="truncate max-w-full text-[10px] leading-tight mt-0.5">
                     {currentTheme === 'hypercharged' ? 'Vanilla' : 'Hypercharge'}
                 </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p>Toggle Theme Mode</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {rightItems.map((item) => (
          <NavItem key={item.href} {...item} currentTheme={currentTheme} />
        ))}
      </div>
    </nav>
  );
}
