
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
  Search as SearchIcon, // Added Search Icon
  Sparkles, // Added Sparkles for Nami AI
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAnimation } from '@/context/AnimationContext'; // Import useAnimation

interface NavItemProps {
  href?: string; // Href is optional for action buttons
  icon: React.ElementType;
  label: string;
  onClick?: () => void; // For action buttons like Search/AI toggle
  isActive?: boolean; // For AI toggle active state
  isToggleButton?: boolean; // To identify AI toggle
}

const NavItem = ({ href, icon: Icon, label, onClick, isActive, isToggleButton }: NavItemProps) => {
  const pathname = usePathname();
  const { playAnimation } = useAnimation();
  // Active state for links: if href exists and matches current path or startsWith for nested routes
  // Active state for buttons: explicitly passed via isActive prop
  const isLinkActive = href ? (pathname === href || (href !== '/' && pathname.startsWith(href))) : false;
  const effectiveIsActive = isToggleButton ? isActive : isLinkActive;

  const handleInteraction = () => {
    if (onClick) onClick();
    // Example animation on click/tap
    playAnimation(`.${label.toLowerCase().replace(/\s+/g, '-')}-nav-item-icon`, {
      scale: [1, 0.8, 1.1, 1],
      duration: 400,
      easing: 'easeInOutQuad'
    });
  };

  const itemContent = (
    <Button
      variant="ghost"
      className={cn(
        'nav-item-base flex flex-col items-center justify-center flex-1 h-full px-1 py-2 text-xs sm:text-sm transition-colors duration-200 ease-in-out relative z-10',
        'hover:bg-transparent', // No background on hover
        effectiveIsActive
          ? 'active-nav-item text-primary'
          : 'text-muted-foreground hover:text-primary',
        '[&_svg]:transition-colors [&_svg]:duration-200 [&_svg]:ease-in-out',
        '[&_span]:transition-colors [&_span]:duration-200 [&_span]:ease-in-out',
        isToggleButton && effectiveIsActive && 'neon-glow-icon' // Special glow for active AI toggle
      )}
      aria-current={isLinkActive ? 'page' : undefined}
      onClick={!href ? handleInteraction : undefined} // onClick only if it's not a link
      aria-pressed={isToggleButton ? effectiveIsActive : undefined}
      aria-label={label}
    >
      <Icon className={cn("w-5 h-5 mb-0.5", `${label.toLowerCase().replace(/\s+/g, '-')}-nav-item-icon`)} />
      <span className="truncate max-w-full">{label}</span>
    </Button>
  );

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          {href ? (
            <Link href={href} passHref legacyBehavior onClick={handleInteraction}>
              {itemContent}
            </Link>
          ) : (
            itemContent
          )}
        </TooltipTrigger>
        <TooltipContent side="top" className="hidden sm:block bg-popover text-popover-foreground glass-deep text-xs">
          <p>{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface BottomNavigationBarProps {
  className?: string;
  onSearchIconClick: () => void; // For Search icon
  onAiToggle: () => void;        // For Nami AI icon
  isAiSearchActive: boolean;    // To show AI active state
}

export default function BottomNavigationBar({
  className,
  onSearchIconClick,
  onAiToggle,
  isAiSearchActive,
}: BottomNavigationBarProps) {
  const navItems: NavItemProps[] = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/anime', icon: Tv, label: 'Anime' },
    { href: '/manga', icon: BookText, label: 'Manga' },
    { href: '/community', icon: Users, label: 'Community' },
    // Action Buttons
    { icon: SearchIcon, label: 'Search', onClick: onSearchIconClick },
    { icon: Sparkles, label: 'Nami AI', onClick: onAiToggle, isActive: isAiSearchActive, isToggleButton: true },
    { href: '/profile', icon: User, label: 'Profile' }, // Profile can remain a link
  ];

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-30 h-16 border-t transition-smooth', // z-30 to be below SearchPopup (z-50)
        'bg-background/90 border-border/70 glass-deep shadow-top-md', // Enhanced glassmorphism and shadow
        className
      )}
    >
      <div className="flex justify-around items-stretch h-full max-w-full mx-auto px-1 relative"> {/* items-stretch for full height buttons */}
        {navItems.map((item) => (
          <NavItem
            key={item.label} // Use label as key since href might be undefined
            href={item.href}
            icon={item.icon}
            label={item.label}
            onClick={item.onClick}
            isActive={item.isActive}
            isToggleButton={item.isToggleButton}
          />
        ))}
      </div>
    </nav>
  );
}

// Add this to globals.css or ensure it's defined
/*
.shadow-top-md {
  box-shadow: 0 -4px 6px -1px rgb(0 0 0 / 0.07), 0 -2px 4px -2px rgb(0 0 0 / 0.07);
}
.neon-glow-icon svg {
  filter: drop-shadow(0 0 3px hsl(var(--primary))) drop-shadow(0 0 6px hsl(var(--primary) / 0.7));
}
*/
