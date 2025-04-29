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
                 'hover:bg-transparent', // Remove background hover
                isActive
                  ? 'active-nav-item text-primary' // Active state text color
                  : 'text-muted-foreground',
                 // Theme-specific hover color for text
                 currentTheme === 'hypercharged'
                    ? 'hover:text-secondary' // Cyan hover for hypercharge
                    : 'hover:text-primary', // Blue hover for vanilla
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
  // Remove Hypercharge related props as the button is moved
  // onHyperchargeToggle: () => void;
  // isHypercharging: boolean;
  currentTheme: 'vanilla' | 'hypercharged'; // Specify theme types
}

export default function BottomNavigationBar({
  className,
  currentTheme,
}: BottomNavigationBarProps) {
  const navItems: Omit<NavItemProps, 'currentTheme'>[] = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/anime', icon: Tv, label: 'Anime' },
    { href: '/manga', icon: BookText, label: 'Manga' },
    { href: '/community', icon: Users, label: 'Community' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 h-16 border-t transition-smooth',
        // Apply theme-specific background and glass effect
        currentTheme === 'hypercharged'
          ? 'hypercharge-nav' // Use class from globals.css for hypercharge nav style
          : 'bg-background/95 border-border glass', // Vanilla style
        className
      )}
    >
       {/* Spread items evenly */}
      <div className="flex justify-around items-center h-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto px-1 relative">
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} currentTheme={currentTheme} />
        ))}
      </div>
    </nav>
  );
}
