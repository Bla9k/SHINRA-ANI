
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  ListVideo,
  BookOpen,
  Heart,
  User,
  Upload,
  Settings,
  Sparkles,
  Menu, // Using Menu temporarily for "More" if needed
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
  const isActive = pathname === href;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={href} passHref legacyBehavior>
            <Button
              variant="ghost"
              className={cn(
                'flex flex-col items-center h-auto px-2 py-1 text-xs sm:flex-row sm:text-sm sm:px-3 sm:py-2 sm:h-10 gap-1 transition-colors duration-200',
                isActive ? 'text-primary neon-glow' : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-5 h-5 sm:w-4 sm:h-4" />
              <span className="mt-1 sm:mt-0 sm:ml-1">{label}</span>
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
  const handleSurpriseMe = () => {
    // TODO: Implement surprise me logic using surpriseMeRecommendation flow
    console.log('Surprise Me clicked!');
    // Example: Call surpriseMeRecommendation({ userProfile: '...', mood: '...', recentInteractions: '...' })
  };

  // Define navigation items
  const navItems: NavItemProps[] = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/search', icon: Search, label: 'Search' },
    { href: '/watchlist', icon: ListVideo, label: 'Watchlist' },
    { href: '/readlist', icon: BookOpen, label: 'Readlist' },
    { href: '/favorites', icon: Heart, label: 'Favorites' },
    { href: '/upload', icon: Upload, label: 'Upload' },
    // Optionally include Profile/Settings here or keep in TopBar
    // { href: '/profile', icon: User, label: 'Profile' },
    // { href: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t bg-background/90 backdrop-blur-lg glass md:hidden"> {/* Hide on md and larger screens */}
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.slice(0, 5).map((item) => ( // Show first 5 items, adjust as needed
          <NavItem key={item.href} {...item} />
        ))}
         {/* Surprise Me Button */}
         <TooltipProvider delayDuration={100}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                         className="flex flex-col items-center h-auto px-2 py-1 text-xs sm:flex-row sm:text-sm sm:px-3 sm:py-2 sm:h-10 gap-1 transition-colors duration-200 text-muted-foreground hover:text-primary hover:bg-accent neon-glow-hover"
                        onClick={handleSurpriseMe}
                    >
                        <Sparkles className="w-5 h-5 sm:w-4 sm:h-4 text-primary" />
                         <span className="mt-1 sm:mt-0 sm:ml-1">Surprise</span>
                    </Button>
                 </TooltipTrigger>
                 <TooltipContent side="top" className="hidden sm:block">
                     <p>Surprise Me!</p>
                 </TooltipContent>
            </Tooltip>
         </TooltipProvider>
        {/* Add a "More" button or similar if more than 5 items */}
        {/* Example:
        {navItems.length > 5 && (
          <NavItem href="/more" icon={Menu} label="More" />
        )} */}
      </div>
    </nav>
  );
}
