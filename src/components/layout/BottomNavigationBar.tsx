
// src/components/layout/BottomNavigationBar.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  Search as SearchIcon,
  Users,
  User as UserIcon,
  Settings as SettingsIcon,
  Tv,
  BookText,
  PlusCircle,
  LogOut,
  Sun,
  Moon,
  Star,
  ChevronUp,
  Palette, // Added Palette for theme customization
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { useToast } from '@/hooks/use-toast'; // Import useToast

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
  subItems?: NavSubItem[];
  isDirectAction?: boolean;
  directAction?: () => void;
  mainHref?: string;
}

interface BottomNavigationBarProps {
  className?: string;
  onSearchIconClick: () => void;
  onOpenSubscriptionModal: () => void;
  onOpenCreateCommunityModal: () => void;
  handleLogout: () => void;
}

const DOUBLE_CLICK_THRESHOLD = 300;

export default function BottomNavigationBar({
  className,
  onSearchIconClick,
  onOpenSubscriptionModal,
  onOpenCreateCommunityModal,
  handleLogout,
}: BottomNavigationBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { playAnimation } = useAnimation();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast(); // Initialize useToast

  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const navBarRef = useRef<HTMLElement>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickTimestampRef = useRef<{ [key: string]: number }>({});

  const navSections: NavSection[] = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      mainHref: '/',
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
      mainHref: '/community',
      subItems: [
        { label: 'Explore Hubs', icon: Users, href: '/community' },
        { label: 'Create Community', icon: PlusCircle, onClick: onOpenCreateCommunityModal },
      ],
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: UserIcon,
      mainHref: '/profile',
      subItems: [
        { label: 'View Profile', icon: UserIcon, href: '/profile' },
        { label: 'Settings', icon: SettingsIcon, href: '/settings' },
        { label: 'Logout', icon: LogOut, onClick: handleLogout },
      ],
    },
    {
      id: 'customize',
      label: 'Customize',
      icon: Palette, // Changed icon to Palette
      subItems: [
        { label: 'Light Theme', icon: Sun, onClick: () => setTheme('light') },
        { label: 'Dark Theme (Default)', icon: Moon, onClick: () => setTheme('dark') },
        { label: 'Shinra Fire Theme', icon: Flame, onClick: () => setTheme('shinra-fire') },
        { label: 'Subscription Tiers', icon: Star, onClick: onOpenSubscriptionModal },
        {
          label: 'Community Theme',
          icon: Palette,
          onClick: () => {
            if (pathname.startsWith('/community/') && !pathname.includes('/settings/theme')) {
              const pathSegments = pathname.split('/');
              // Ensure communityId is present and not an empty string
              if (pathSegments.length > 2 && pathSegments[2]) {
                const communityId = pathSegments[2];
                router.push(`/community/${communityId}/settings/theme`);
              } else {
                toast({ title: "Error", description: "Could not determine the community ID from the current page.", variant: "destructive"});
              }
            } else if (pathname.startsWith('/community/') && pathname.includes('/settings/theme')) {
                toast({ title: "Already Here", description: "You are already on the theme settings page.", variant: "default"});
            }
            else {
                 toast({ title: "Navigate to a Community", description: "Please go to a specific community page to edit its theme.", variant: "default"});
            }
            closePanel();
          },
        }
      ],
    },
  ];

  const closePanel = useCallback(() => {
    setIsPanelOpen(false);
    setTimeout(() => setExpandedSectionId(null), 300);
  }, []);

  const handleMainIconClickInternal = (section: NavSection, targetElement: HTMLElement | null) => {
    const now = Date.now();
    const lastClickTime = lastClickTimestampRef.current[section.id] || 0;

    if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
        clickTimeoutRef.current = null;
    }

    if (targetElement && playAnimation) {
        const svgIcon = targetElement.querySelector('svg');
        if (svgIcon) {
            playAnimation(svgIcon, { scale: [1, 0.8, 1.1, 1], duration: 300, easing: 'easeInOutQuad' });
        }
    }

    if (section.isDirectAction && section.directAction) {
        section.directAction();
        closePanel();
        return;
    }

    if (section.mainHref && (now - lastClickTime < DOUBLE_CLICK_THRESHOLD)) {
        router.push(section.mainHref);
        closePanel();
        lastClickTimestampRef.current[section.id] = 0;
    } else {
        lastClickTimestampRef.current[section.id] = now;
        clickTimeoutRef.current = setTimeout(() => {
            if (expandedSectionId === section.id && isPanelOpen) {
                closePanel();
            } else {
                setExpandedSectionId(section.id);
                setIsPanelOpen(true);
            }
        }, DOUBLE_CLICK_THRESHOLD);
    }
  };

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
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, [isPanelOpen, closePanel]);

  const activeSectionDetails = navSections.find(s => s.id === expandedSectionId);

  return (
    <>
      <AnimatePresence>
        {isPanelOpen && activeSectionDetails && activeSectionDetails.subItems && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: "100%", height: 0 }}
            animate={{ opacity: 1, y: 0, height: "var(--bottom-nav-panel-max-height, 16rem)" }}
            exit={{ opacity: 0, y: "100%", height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed bottom-16 left-0 right-0 z-40 mx-auto w-full max-w-md"
            style={{ maxHeight: 'var(--bottom-nav-panel-max-height, 16rem)' }}
          >
            <div className="p-2">
              <Card className="glass-deep shadow-xl border-primary/30 overflow-hidden max-h-[calc(var(--bottom-nav-panel-max-height,_16rem)_-_1rem)] flex flex-col">
                <div className="p-3 flex items-center justify-between border-b border-border/50 flex-shrink-0">
                  <h3 className="text-sm font-semibold text-primary">
                    {activeSectionDetails.label}
                  </h3>
                  <Button variant="ghost" size="icon" onClick={closePanel} className="h-7 w-7 text-muted-foreground hover:text-foreground">
                    <ChevronUp size={18} />
                    <span className="sr-only">Close Panel</span>
                  </Button>
                </div>
                <ScrollArea className="flex-grow p-2">
                  <div className="space-y-1">
                    {activeSectionDetails.subItems.map((item) => (
                      <TooltipProvider key={item.label} delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {item.href ? (
                              <Link href={item.href} legacyBehavior passHref>
                                <a
                                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                                  onClick={closePanel}
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
          'fixed bottom-0 left-0 right-0 z-50 h-16 border-t transition-smooth',
          'bg-background/90 border-border/70 glass-deep shadow-top-md',
          className
        )}
      >
        <div className="flex justify-around items-stretch h-full max-w-md mx-auto px-1 relative">
          {navSections.map((section) => {
            const isLinkActive = section.mainHref ? (pathname === section.mainHref || (section.mainHref !== '/' && pathname.startsWith(section.mainHref))) : false;
            const isSectionExpanded = expandedSectionId === section.id && isPanelOpen;
            const itemRef = React.createRef<HTMLAnchorElement>(); // For link type

            const commonClasses = cn(
              'flex flex-col items-center justify-center flex-1 h-full px-1 py-2 text-xs sm:text-sm transition-colors duration-200 ease-in-out relative',
              'hover:bg-transparent', // Remove Button's default hover
              (isLinkActive && !section.isDirectAction && !isSectionExpanded)
                ? 'active-nav-item text-primary' // Active link color
                : isSectionExpanded
                ? 'text-primary' // Expanded section color
                : 'text-muted-foreground hover:text-primary', // Default and hover
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
                    <button
                      type="button"
                      className={commonClasses}
                      onClick={(e) => handleMainIconClickInternal(section, e.currentTarget)}
                      aria-pressed={isSectionExpanded}
                      aria-label={section.label}
                      ref={itemRef as React.RefObject<HTMLButtonElement>} // Cast for button type
                    >
                      {iconAndLabel}
                    </button>
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

