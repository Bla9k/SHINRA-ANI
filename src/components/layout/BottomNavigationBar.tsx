
// src/components/layout/BottomNavigationBar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Tv,
  BookText,
  Users,
  User,
  Search as SearchIcon,
  Star, // Icon for "Join"/Subscription
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
  itemRef?: React.RefObject<HTMLButtonElement | HTMLAnchorElement>; // For animation targeting
}

const NavItem = ({ href, icon: Icon, label, onClick, isActive, isToggleButton, itemRef }: NavItemProps) => {
  const pathname = usePathname();
  const { playAnimation } = useAnimation();

  const isLinkActive = href ? (pathname === href || (href !== '/' && pathname.startsWith(href))) : false;
  const effectiveIsActive = isToggleButton ? isActive : isLinkActive;

  const handleInteraction = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
    if (onClick) onClick();
    if (itemRef?.current) {
        playAnimation(itemRef.current.querySelector('svg'), { // Target the SVG within
            scale: [1, 0.8, 1.1, 1],
            duration: 300,
            easing: 'easeInOutQuad'
        });
    }
  };

  const buttonContent = (
    <Button
      ref={itemRef as React.RefObject<HTMLButtonElement>} // Cast for Button
      variant="ghost"
      className={cn(
        'nav-item-base flex flex-col items-center justify-center flex-1 h-full px-1 py-2 text-xs sm:text-sm transition-colors duration-200 ease-in-out relative z-10',
        'hover:bg-transparent',
        effectiveIsActive
          ? 'active-nav-item text-primary'
          : 'text-muted-foreground hover:text-primary',
        '[&_svg]:transition-colors [&_svg]:duration-200 [&_svg]:ease-in-out',
        '[&_span]:transition-colors [&_span]:duration-200 [&_span]:ease-in-out',
        isToggleButton && effectiveIsActive && 'neon-glow-icon'
      )}
      aria-current={isLinkActive ? 'page' : undefined}
      onClick={!href ? handleInteraction : undefined}
      aria-pressed={isToggleButton ? effectiveIsActive : undefined}
      aria-label={label}
    >
      <Icon className={cn("w-5 h-5 mb-0.5")} />
      <span className="truncate max-w-full">{label}</span>
    </Button>
  );

  const linkContent = (
    <a
        ref={itemRef as React.RefObject<HTMLAnchorElement>} // Cast for anchor
        className={cn(
            'nav-item-base flex flex-col items-center justify-center flex-1 h-full px-1 py-2 text-xs sm:text-sm transition-colors duration-200 ease-in-out relative z-10',
            'hover:bg-transparent', // No background on hover
             effectiveIsActive
                ? 'active-nav-item text-primary'
                : 'text-muted-foreground hover:text-primary',
            '[&_svg]:transition-colors [&_svg]:duration-200 [&_svg]:ease-in-out',
            '[&_span]:transition-colors [&_span]:duration-200 [&_span]:ease-in-out'
        )}
        aria-current={isLinkActive ? 'page' : undefined}
        onClick={handleInteraction} // Apply interaction to anchor as well
        aria-label={label}
      >
        <Icon className={cn("w-5 h-5 mb-0.5")} />
        <span className="truncate max-w-full">{label}</span>
    </a>
  );


  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          {href ? (
            <Link href={href} passHref legacyBehavior>
                {/* The <a> tag is now the direct child of Link and gets the ref */}
                {linkContent}
            </Link>
          ) : (
            buttonContent
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
  onOpenSubscriptionModal: () => void; // New prop to open subscription modal
}

export default function BottomNavigationBar({
  className,
  onSearchIconClick,
  onOpenSubscriptionModal,
}: BottomNavigationBarProps) {
  // Create refs for each item if you want to animate them individually
  const homeRef = React.useRef<HTMLAnchorElement>(null);
  const animeRef = React.useRef<HTMLAnchorElement>(null);
  const mangaRef = React.useRef<HTMLAnchorElement>(null);
  const communityRef = React.useRef<HTMLAnchorElement>(null);
  const searchRef = React.useRef<HTMLButtonElement>(null);
  const joinRef = React.useRef<HTMLButtonElement>(null);
  const profileRef = React.useRef<HTMLAnchorElement>(null);


  const navItems: NavItemProps[] = [
    { href: '/', icon: Home, label: 'Home', itemRef: homeRef as any },
    { href: '/anime', icon: Tv, label: 'Anime', itemRef: animeRef as any },
    { href: '/manga', icon: BookText, label: 'Manga', itemRef: mangaRef as any },
    { href: '/community', icon: Users, label: 'Community', itemRef: communityRef as any },
    { icon: SearchIcon, label: 'Search', onClick: onSearchIconClick, itemRef: searchRef as any },
    { icon: Star, label: 'Join', onClick: onOpenSubscriptionModal, itemRef: joinRef as any }, // "Join" button
    { href: '/profile', icon: User, label: 'Profile', itemRef: profileRef as any },
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
            isActive={item.isActive}
            isToggleButton={item.isToggleButton}
            itemRef={item.itemRef}
          />
        ))}
      </div>
    </nav>
  );
}
