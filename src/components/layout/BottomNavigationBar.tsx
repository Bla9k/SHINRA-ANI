
// src/components/layout/BottomNavigationBar.tsx
'use client';

import React, { useRef } from 'react'; // Import React and useRef
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Tv,
  BookText,
  Users,
  User,
  Search as SearchIcon,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAnimation } from '@/context/AnimationContext';

interface NavItemProps {
  href?: string;
  icon: React.ElementType;
  label: string;
  onClick?: () => void;
  isActive?: boolean; // For visual active state if not a link
  isToggleButton?: boolean;
}

const NavItem = ({ href, icon: Icon, label, onClick, isActive, isToggleButton }: NavItemProps) => {
  const pathname = usePathname();
  const { playAnimation } = useAnimation();
  const itemRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);

  const isLinkActive = href ? (pathname === href || (href !== '/' && pathname.startsWith(href))) : false;
  const effectiveIsActive = isToggleButton ? isActive : isLinkActive;

  const handleInteraction = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (onClick && !href) {
      onClick();
    }
    if (itemRef.current) {
      const svgElement = itemRef.current.querySelector('svg');
      if (svgElement) {
        playAnimation(svgElement, {
          scale: [1, 0.8, 1.1, 1],
          duration: 300,
          easing: 'easeInOutQuad'
        });
      }
    }
    // For actual links, Next.js Link component handles navigation.
    // If it's a button, the onClick prop handles the action.
  };

  const commonClasses = cn(
    'nav-item-base flex flex-col items-center justify-center flex-1 h-full px-1 py-2 text-xs sm:text-sm transition-colors duration-200 ease-in-out relative z-10',
    'hover:bg-transparent', // Keep hover transparent as active state uses text color
    effectiveIsActive
      ? 'active-nav-item text-primary' // Active state directly applies text color
      : 'text-muted-foreground hover:text-primary', // Hover state for inactive items
    '[&_svg]:transition-colors [&_svg]:duration-200 [&_svg]:ease-in-out',
    '[&_span]:transition-colors [&_span]:duration-200 [&_span]:ease-in-out'
  );

  const iconAndLabel = (
    <>
      <Icon className={cn("w-5 h-5 mb-0.5")} />
      <span className="truncate max-w-full">{label}</span>
    </>
  );

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          {href ? (
            <Link href={href} legacyBehavior passHref>
              <a
                ref={itemRef as React.RefObject<HTMLAnchorElement>}
                className={commonClasses}
                onClick={handleInteraction}
                aria-current={isLinkActive ? 'page' : undefined}
                aria-label={label}
              >
                {iconAndLabel}
              </a>
            </Link>
          ) : (
            <Button
              ref={itemRef as React.RefObject<HTMLButtonElement>}
              variant="ghost"
              className={cn(commonClasses, isToggleButton && effectiveIsActive && 'neon-glow-icon')}
              onClick={handleInteraction}
              aria-pressed={isToggleButton ? effectiveIsActive : undefined}
              aria-label={label}
            >
              {iconAndLabel}
            </Button>
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
  onSearchIconClick: () => void;
  onOpenSubscriptionModal: () => void;
  // Removed onAiToggle and isAiSearchActive as these are managed within SearchPopup
}

export default function BottomNavigationBar({
  className,
  onSearchIconClick,
  onOpenSubscriptionModal,
}: BottomNavigationBarProps) {
  const navItems: NavItemProps[] = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/anime', icon: Tv, label: 'Anime' },
    { href: '/manga', icon: BookText, label: 'Manga' },
    { href: '/community', icon: Users, label: 'Community' },
    { icon: SearchIcon, label: 'Search', onClick: onSearchIconClick },
    { icon: Star, label: 'Join', onClick: onOpenSubscriptionModal },
    { href: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-30 h-16 border-t transition-smooth',
        'bg-background/90 border-border/70 glass-deep shadow-top-md',
        className
      )}
    >
      <div className="flex justify-around items-stretch h-full max-w-full mx-auto px-1 relative">
        {navItems.map((item) => (
          <NavItem
            key={item.label}
            href={item.href}
            icon={item.icon}
            label={item.label}
            onClick={item.onClick}
            isActive={item.isActive} // For toggle buttons if any
            isToggleButton={item.isToggleButton}
          />
        ))}
      </div>
    </nav>
  );
}
