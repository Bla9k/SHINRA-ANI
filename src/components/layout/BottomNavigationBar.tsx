
// src/components/layout/BottomNavigationBar.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search as SearchIcon,
  Users,
  User as UserIcon,
  Settings as SettingsIcon, // Renamed to avoid conflict with Settings page link
  Tv,
  BookText,
  PlusCircle,
  LogOut,
  Sun,
  Moon,
  Star,
  X,
  ChevronUp,
  Award, // For Subscription tier
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
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NavSubItem {
  label: string;
  icon: React.ElementType;
  href?: string;
  onClick?: () => void;
}

interface NavSection {
  id: string;
  label: string;
  icon: React.ElementType;
  subItems?: NavSubItem[]; // Sub-items are optional; Search won't have them
  isDirectAction?: boolean; // For items like Search that trigger an action directly
  directAction?: () => void; // The action for direct action items
}

interface BottomNavigationBarProps {
  className?: string;
  onSearchIconClick: () => void;
  onOpenSubscriptionModal: () => void;
  onOpenCreateCommunityModal: () => void;
  handleLogout: () => void;
}

export default function BottomNavigationBar({
  className,
  onSearchIconClick,
  onOpenSubscriptionModal,
  onOpenCreateCommunityModal,
  handleLogout,
}: BottomNavigationBarProps) {
  const pathname = usePathname();
  const { playAnimation } = useAnimation();
  const { theme, setTheme } = useTheme();

  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const navBarRef = useRef<HTMLElement>(null);

  const navSections: NavSection[] = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      subItems: [
        { label: 'Anime', icon: Tv, href: '/anime' },
        { label: 'Manga', icon: BookText, href: '/manga' },
      ],
    },
    {
      id: 'search',
      label: 'Search',
      icon: SearchIcon,
      isDirectAction: true,
      directAction: onSearchIconClick,
    },
    {
      id: 'community',
      label: 'Community',
      icon: Users,
      subItems: [
        { label: 'Explore Hubs', icon: Users, href: '/community' },
        { label: 'Create Hub', icon: PlusCircle, onClick: onOpenCreateCommunityModal },
        // { label: 'My Hubs', icon: Home, href: '/community/my-hubs' }, // Example
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: UserIcon,
      subItems: [
        { label: 'View Profile', icon: UserIcon, href: '/profile' },
        { label: 'Settings', icon: SettingsIcon, href: '/settings' },
        { label: 'Logout', icon: LogOut, onClick: handleLogout },
      ],
    },
    {
      id: 'customize',
      label: 'Customize',
      icon: SettingsIcon, // Using Settings icon for Customize as well
      subItems: [
        { label: 'Light Theme', icon: Sun, onClick: () => setTheme('light') },
        { label: 'Dark Theme', icon: Moon, onClick: () => setTheme('dark') },
        { label: 'Subscription', icon: Award, onClick: onOpenSubscriptionModal },
      ],
    },
  ];

  const handleMainIconClick = (section: NavSection) => {
    if (section.isDirectAction && section.directAction) {
      section.directAction();
      setIsPanelOpen(false);
      setExpandedSectionId(null);
      return;
    }

    if (expandedSectionId === section.id && isPanelOpen) {
      setIsPanelOpen(false);
      // Optional: setExpandedSectionId(null) after a delay to allow panel to animate out
      setTimeout(() => setExpandedSectionId(null), 300);
    } else {
      setExpandedSectionId(section.id);
      setIsPanelOpen(true);
    }
  };

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
    setTimeout(() => setExpandedSectionId(null), 300); // Delay to allow animation
  }, []);

  // Click outside to close panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        navBarRef.current &&
        !navBarRef.current.contains(event.target as Node)
      ) {
        closePanel();
      }
    };

    if (isPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPanelOpen, closePanel]);

  const activeSectionDetails = navSections.find(s => s.id === expandedSectionId);

  return (
    <>
      <AnimatePresence>
        {isPanelOpen && activeSectionDetails && activeSectionDetails.subItems && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 50, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 50, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed bottom-16 left-0 right-0 z-20 mx-auto w-full max-w-md" // Centered and max-width
          >
            <div className="p-2"> {/* Add a small margin around the panel card */}
              <Card className="glass-deep shadow-xl border-primary/30 overflow-hidden max-h-[240px] flex flex-col"> {/* max-h and flex-col */}
                <div className="p-3 flex items-center justify-between border-b border-border/50 flex-shrink-0">
                  <h3 className="text-sm font-semibold text-primary">
                    {activeSectionDetails.label}
                  </h3>
                  <Button variant="ghost" size="icon" onClick={closePanel} className="h-7 w-7 text-muted-foreground hover:text-foreground">
                    <ChevronUp size={18} /> {/* Changed to ChevronUp for "collapse" feel */}
                    <span className="sr-only">Close Panel</span>
                  </Button>
                </div>
                <ScrollArea className="flex-grow p-2"> {/* Scrollable area for sub-items */}
                  <div className="space-y-1">
                    {activeSectionDetails.subItems.map((item) => (
                      <TooltipProvider key={item.label} delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {item.href ? (
                              <Link href={item.href} passHref legacyBehavior>
                                <a
                                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                                  onClick={closePanel} // Close panel on navigation
                                >
                                  <item.icon size={16} />
                                  <span>{item.label}</span>
                                </a>
                              </Link>
                            ) : (
                              <Button
                                variant="ghost"
                                className="flex items-center gap-3 w-full justify-start px-3 py-2.5 text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                                onClick={() => {
                                  item.onClick?.();
                                  closePanel();
                                }}
                              >
                                <item.icon size={16} />
                                <span>{item.label}</span>
                              </Button>
                            )}
                          </TooltipTrigger>
                          <TooltipContent side="right" className="glass-deep text-xs">
                            <p>{item.label}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </ScrollArea>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav
        ref={navBarRef}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-30 h-16 border-t transition-smooth',
          'bg-background/90 border-border/70 glass-deep shadow-top-md',
          className
        )}
      >
        <div className="flex justify-around items-stretch h-full max-w-md mx-auto px-1 relative">
          {navSections.map((section) => {
            const itemRef = React.createRef<HTMLButtonElement | HTMLAnchorElement>();
            const isLinkActive = section.subItems?.some(sub => sub.href && pathname.startsWith(sub.href)) || (section.id === 'home' && (pathname === '/' || section.subItems?.some(sub => sub.href && pathname.startsWith(sub.href))));
            const isSectionExpanded = expandedSectionId === section.id && isPanelOpen;

            const commonClasses = cn(
              'nav-item-base flex flex-col items-center justify-center flex-1 h-full px-1 py-2 text-xs sm:text-sm transition-colors duration-200 ease-in-out relative z-10',
              'hover:bg-transparent',
              (isLinkActive && !section.isDirectAction) || isSectionExpanded
                ? 'active-nav-item text-primary'
                : 'text-muted-foreground hover:text-primary',
              '[&_svg]:transition-colors [&_svg]:duration-200 [&_svg]:ease-in-out',
              '[&_span]:transition-colors [&_span]:duration-200 [&_span]:ease-in-out'
            );

            const iconAndLabel = (
              <>
                <section.icon className={cn("w-5 h-5 mb-0.5", (isLinkActive && !section.isDirectAction) || isSectionExpanded ? 'neon-glow-icon' : '')} />
                <span className="truncate max-w-full">{section.label}</span>
              </>
            );

            return (
              <TooltipProvider key={section.id} delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                     <Button
                        ref={itemRef as React.RefObject<HTMLButtonElement>}
                        variant="ghost"
                        className={cn(commonClasses)}
                        onClick={() => {
                          playAnimation(itemRef.current?.querySelector('svg'), { scale: [1, 0.8, 1.1, 1], duration: 300, easing: 'easeInOutQuad' });
                          handleMainIconClick(section);
                        }}
                        aria-pressed={isSectionExpanded}
                        aria-label={section.label}
                      >
                        {iconAndLabel}
                      </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="hidden sm:block bg-popover text-popover-foreground glass-deep text-xs">
                    <p>{section.label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </nav>
    </>
  );
}
