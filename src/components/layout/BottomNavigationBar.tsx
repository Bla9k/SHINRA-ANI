'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Tv,
  BookText,
  Users,
  User,
  Zap
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
}

const NavItem = ({ href, icon: Icon, label }: NavItemProps) => {
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
                'flex flex-col items-center justify-center flex-1 h-full px-1 py-2 text-xs sm:text-sm transition-colors duration-200 ease-in-out relative z-10', // Smooth transition for color
                isActive ? 'text-primary neon-glow' : 'text-muted-foreground hover:text-primary', // Change color on hover, no background
                '[&_svg]:transition-colors [&_svg]:duration-200 [&_svg]:ease-in-out', // Ensure icon transitions smoothly too
                '[&_span]:transition-colors [&_span]:duration-200 [&_span]:ease-in-out' // Ensure text transitions smoothly too
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
    onHyperchargeToggle: () => void; // Added prop
    isHypercharging: boolean; // Added prop
}

export default function BottomNavigationBar({ className, onHyperchargeToggle, isHypercharging }: BottomNavigationBarProps) {
  const navItems: NavItemProps[] = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/anime', icon: Tv, label: 'Anime' },
    // Hypercharge button will be in the middle
    { href: '/manga', icon: BookText, label: 'Manga' },
    { href: '/community', icon: Users, label: 'Community' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  // Split nav items to place the hypercharge button in the middle
  const midIndex = Math.ceil(navItems.length / 2);
  const leftItems = navItems.slice(0, midIndex);
  const rightItems = navItems.slice(midIndex);

  return (
    <nav className={cn(
        "fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background/95 backdrop-blur-lg glass transition-smooth vanilla-ui-element", // Added vanilla-ui-element
        className
    )}>
      <div className="flex justify-around items-center h-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto px-1 relative">
        {leftItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}

        {/* Hypercharge Button in the Middle */}
        <TooltipProvider delayDuration={100}>
          <Tooltip>
            <TooltipTrigger asChild>
               <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'hypercharge-button flex flex-col items-center justify-center h-full w-16 mx-2 text-xs sm:text-sm transition-colors duration-200 z-10 group', // Add group class
                  'text-muted-foreground hover:text-foreground' // Standard hover effect
                )}
                onClick={onHyperchargeToggle}
                disabled={isHypercharging} // Disable while transition is active
                aria-label="Toggle Hypercharge Mode"
              >
                {/* Apply glitch effect to the icon via CSS when hypercharge-button is hovered in hypercharged mode */}
                <Zap className="w-6 h-6 hypercharge-icon transition-colors duration-200 group-hover:text-primary" />
                <span className="truncate max-w-full">Hypercharge</span>
              </Button>
            </TooltipTrigger>
             <TooltipContent side="top">
                <p>Toggle Hypercharge Mode</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {rightItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </div>
    </nav>
  );
}
