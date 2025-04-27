
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
  const handleSurpriseMe = () => {
    // TODO: Implement surprise me logic using surpriseMeRecommendation flow
    console.log('Surprise Me clicked!');
    // Example: Call surpriseMeRecommendation({ userProfile: '...', mood: '...', recentInteractions: '...' })
  };

  // Define navigation items - keep essential ones for mobile
  const navItems: NavItemProps[] = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/search', icon: Search, label: 'Search' },
    { href: '/watchlist', icon: ListVideo, label: 'Watchlist' },
    { href: '/readlist', icon: BookOpen, label: 'Readlist' },
    // Favorites might be better under a 'More' or profile section on mobile
    // { href: '/favorites', icon: Heart, label: 'Favorites' },
    { href: '/upload', icon: Upload, label: 'Upload' },
  ];

   // Determine items to show directly (e.g., max 4 + Surprise Me)
   const maxDirectItems = 4;
   const directItems = navItems.slice(0, maxDirectItems);
   // const moreItems = navItems.slice(maxDirectItems); // For potential "More" menu


  return (
    // Fixed position at bottom, full width, z-index, background with blur
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-background/95 backdrop-blur-lg glass md:hidden"> {/* Hide on md and larger screens */}
      {/* Flex container for items, centered content */}
      <div className="flex justify-around items-stretch h-full max-w-md mx-auto px-2"> {/* items-stretch for full height buttons */}
        {directItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}

         {/* Surprise Me Button - Treat as a NavItem */}
         <TooltipProvider delayDuration={100}>
            <Tooltip>
                <TooltipTrigger asChild>
                    {/* Use flex-1 like other items */}
                    <Button
                        variant="ghost"
                        className="flex flex-col items-center justify-center flex-1 h-full px-1 py-2 text-xs sm:text-sm transition-colors duration-200 text-muted-foreground hover:text-primary hover:bg-accent/50 neon-glow-hover"
                        onClick={handleSurpriseMe}
                    >
                        <Sparkles className="w-5 h-5 mb-0.5 text-primary" />
                        <span className="truncate max-w-full">Surprise</span>
                    </Button>
                 </TooltipTrigger>
                 <TooltipContent side="top" className="hidden sm:block">
                     <p>Surprise Me!</p>
                 </TooltipContent>
            </Tooltip>
         </TooltipProvider>

        {/* Example: More button if needed */}
        {/* {moreItems.length > 0 && (
             // Implement a Sheet or Popover trigger here for "More"
             <NavItem href="#" icon={Menu} label="More" /> // Adjust href/action
        )} */}
      </div>
    </nav>
  );
}
