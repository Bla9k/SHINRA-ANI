
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Tv, // Icon for Anime
  BookText, // Icon for Manga
  Users, // Icon for Community
  User, // Icon for Profile
  Search, // Keep Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'; // Import Tooltip components


interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
}

const NavItem = ({ href, icon: Icon, label }: NavItemProps) => {
  const pathname = usePathname();
  // Adjust isActive logic for nested paths (e.g., /anime/* should highlight /anime)
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
                'flex flex-col items-center justify-center flex-1 h-full px-1 py-2 text-xs sm:text-sm transition-colors duration-200', // Adjusted padding/height for consistency
                isActive ? 'text-primary neon-glow' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50', // Subtle hover
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-5 h-5 mb-0.5" /> {/* Adjusted icon size/margin */}
              <span className="truncate max-w-full">{label}</span> {/* Truncate long labels */}
            </Button>
          </Link>
        </TooltipTrigger>
        {/* Tooltip visible only on larger screens potentially */}
        <TooltipContent side="top" className="hidden sm:block">
            <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};


export default function BottomNavigationBar() {
  // Updated navigation items
  const navItems: NavItemProps[] = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/search', icon: Search, label: 'Search' }, // Keep search accessible
    { href: '/anime', icon: Tv, label: 'Anime' }, // New Anime section
    { href: '/manga', icon: BookText, label: 'Manga' }, // New Manga section
    { href: '/community', icon: Users, label: 'Community' }, // New Community section
    { href: '/profile', icon: User, label: 'Profile' }, // Profile section
  ];

  return (
    // Fixed position at bottom, full width, z-index, background with blur
    // Removed md:hidden to make it visible on all screen sizes
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background/95 backdrop-blur-lg glass">
      {/* Flex container for items, centered content */}
      {/* Adjust max-w-* if you want to limit width on larger screens */}
      <div className="flex justify-around items-stretch h-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto px-1"> {/* items-stretch for full height buttons, reduced padding */}
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </div>
    </nav>
  );
}
