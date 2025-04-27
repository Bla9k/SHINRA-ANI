
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Tv, // Icon for Anime
  BookText, // Icon for Manga
  Users, // Icon for Community
  User, // Icon for Profile
  Sparkles, // Icon for Nami AI Search Trigger
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
            {/* Use flex-1 to allow items to space out evenly */}
            <Button
              variant="ghost"
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full px-1 py-2 text-xs sm:text-sm transition-colors duration-200 relative z-10', // Added z-index
                isActive ? 'text-primary neon-glow' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
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


// Interface for props including the search modal toggle
interface BottomNavigationBarProps {
  onSearchClick: () => void;
}

export default function BottomNavigationBar({ onSearchClick }: BottomNavigationBarProps) {
  // Updated navigation items - remove search page link
  const leftNavItems: NavItemProps[] = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/anime', icon: Tv, label: 'Anime' },
  ];
   const rightNavItems: NavItemProps[] = [
    { href: '/manga', icon: BookText, label: 'Manga' },
    { href: '/community', icon: Users, label: 'Community' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background/95 backdrop-blur-lg glass">
      {/* Flex container for items */}
      <div className="flex justify-around items-stretch h-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto px-1 relative"> {/* Added relative positioning */}
        {/* Left Items */}
        {leftNavItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}

        {/* Central Nami AI Search Button */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[60%] z-20"> {/* Position centrally, slightly elevated */}
            <TooltipProvider delayDuration={100}>
             <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="default" // Make it stand out
                        size="icon"
                        className="rounded-full h-14 w-14 shadow-lg neon-glow neon-glow-hover border-2 border-background flex items-center justify-center bg-gradient-to-br from-primary to-purple-600 text-primary-foreground" // Larger, styled button
                        onClick={onSearchClick}
                        aria-label="Open AI Search"
                    >
                        <Sparkles className="h-7 w-7" />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                   <p>Nami AI Search</p>
                </TooltipContent>
            </Tooltip>
           </TooltipProvider>
        </div>

        {/* Right Items */}
         {/* Add placeholder divs to balance the layout since the button is absolutely positioned */}
         <div className="flex-1"></div> {/* Placeholder to push right items */}

        {rightNavItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </div>
    </nav>
  );
}
