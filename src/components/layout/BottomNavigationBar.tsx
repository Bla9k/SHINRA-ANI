
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Tv, // Icon for Anime
  BookText, // Icon for Manga
  Users, // Icon for Community
  User, // Icon for Profile
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
                'flex flex-col items-center justify-center flex-1 h-full px-1 py-2 text-xs sm:text-sm transition-smooth relative z-10', // Added transition-smooth and z-index
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


// Remove onSearchClick prop
export default function BottomNavigationBar() {
  // Combine all navigation items
  const navItems: NavItemProps[] = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/anime', icon: Tv, label: 'Anime' },
    { href: '/manga', icon: BookText, label: 'Manga' },
    { href: '/community', icon: Users, label: 'Community' },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background/95 backdrop-blur-lg glass transition-smooth">
      {/* Flex container for items, use justify-around to distribute space */}
      <div className="flex justify-around items-stretch h-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto px-1 relative">
        {/* Removed Central Nami AI Search Button */}

        {/* Render all nav items */}
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </div>
    </nav>
  );
}
