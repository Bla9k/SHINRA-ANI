'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home as HomeIcon, Search as SearchIconLucide, Users as UsersIcon,
  User as UserIcon, Settings, Tv, BookText, Moon, Sun,
  Palette, Flame, Zap, Rocket, Star, ShieldCheck, Gift, Menu as MenuIcon,
  LogOut, PlusCircle, XCircle, ChevronDown, ChevronUp, MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area'; // Import ScrollArea
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import anime from 'animejs';

export interface NavSubItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  action?: () => void;
  disabled?: boolean;
  title?: string;
}
export interface NavSection {
  id: string;
  label: string;
  icon: React.ElementType;
  mainHref?: string;
  directAction?: () => void;
  isDirectAction?: boolean;
  subItems?: NavSubItem[];
}

interface BottomNavigationBarProps {
  className?: string;
  onSearchIconClick: () => void;
  onOpenSubscriptionModal: () => void;
  onOpenCreateCommunityModal: () => void;
  handleLogout: () => void;
  // isPanelOpen, setIsPanelOpen, expandedSectionId, setExpandedSectionId are now local
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
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { user, userProfile } = useAuth();

  const [isMenuPanelOpen, setIsMenuPanelOpen] = useState(false);
  const [expandedSubMenuId, setExpandedSubMenuId] = useState<string | null>(null);

  const menuPanelRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickTimestampRef = useRef<Map<string, number>>(new Map());

  const navSections: NavSection[] = [
    { id: 'home', label: 'Home', icon: HomeIcon, mainHref: '/', subItems: [
      { id: 'home-anime', label: 'Anime', icon: Tv, href: '/anime' },
      { id: 'home-manga', label: 'Manga', icon: BookText, href: '/manga' },
      { id: 'home-gacha', label: 'Gacha Game', icon: Gift, href: '/gacha'},
    ]},
    { id: 'search', label: 'Search', icon: SearchIconLucide, isDirectAction: true, directAction: onSearchIconClick },
    { id: 'community', label: 'Community', icon: UsersIcon, mainHref: '/community', subItems: [
      { id: 'community-explore', label: 'Explore Hubs', icon: UsersIcon, href: '/community'},
      { id: 'community-create', label: 'Create Hub', icon: PlusCircle, action: onOpenCreateCommunityModal,
        disabled: !user || (!!userProfile && userProfile.subscriptionTier !== 'ignition' && userProfile.subscriptionTier !== 'hellfire' && userProfile.subscriptionTier !== 'burstdrive'),
        title: !user ? "Login to create" : (!!userProfile && userProfile.subscriptionTier !== 'ignition' && userProfile.subscriptionTier !== 'hellfire' && userProfile.subscriptionTier !== 'burstdrive') ? "Upgrade to Ignition Tier or higher" : "Create a new community hub"
      },
      // { id: 'community-chat', label: 'Global Chat', icon: MessageCircle, href: '/chat' }, // Example
    ]},
    { id: 'system', label: 'System', icon: ShieldCheck, mainHref: '/system'},
    { id: 'profile', label: 'Profile & Account', icon: UserIcon, mainHref: '/profile', subItems: [
      { id: 'profile-view', label: 'View Profile', icon: UserIcon, href: '/profile' },
      { id: 'profile-settings', label: 'Account Settings', icon: Settings, href: '/settings' },
      { id: 'profile-logout', label: 'Logout', icon: LogOut, action: handleLogout, disabled: !user }
    ]},
    {
      id: 'customize',
      label: 'Customize',
      icon: Palette,
      subItems: [
        { id: 'theme-light', label: 'Light Theme', icon: Sun, action: () => setTheme('light') },
        { id: 'theme-dark', label: 'Dark Theme', icon: Moon, action: () => setTheme('dark') },
        { id: 'theme-shinra-fire', label: 'Shinra Fire Theme', icon: Flame, action: () => setTheme('shinra-fire') },
        { id: 'theme-modern-shinra', label: 'Modern Shinra', icon: Zap, action: () => setTheme('modern-shinra') },
        { id: 'theme-hypercharge-netflix', label: 'Hypercharge (Netflix)', icon: Tv, action: () => setTheme('hypercharge-netflix') },
        { id: 'subscription-tiers', label: 'Subscription Tiers', icon: Star, action: onOpenSubscriptionModal },
      ]
    },
  ];

  const closePanel = useCallback(() => {
    setIsMenuPanelOpen(false);
    setExpandedSubMenuId(null);
  }, []);

  const handleMainIconClickInternal = (section: NavSection, event?: React.MouseEvent<HTMLButtonElement>) => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    const now = Date.now();
    const lastClick = lastClickTimestampRef.current.get(section.id) || 0;

    if (now - lastClick < DOUBLE_CLICK_THRESHOLD) { // Double click
      lastClickTimestampRef.current.delete(section.id); // Reset for next interaction
      if (section.mainHref) {
        router.push(section.mainHref);
        closePanel();
      } else if (section.isDirectAction && section.directAction) {
        section.directAction();
        closePanel(); // Close panel if direct action
      }
    } else { // Single click
      lastClickTimestampRef.current.set(section.id, now);
      clickTimeoutRef.current = setTimeout(() => {
        if (section.isDirectAction && section.directAction) {
          section.directAction();
          closePanel();
        } else if (section.subItems && section.subItems.length > 0) {
          setExpandedSubMenuId(prev => prev === section.id ? null : section.id);
          // Keep panel open if expanding a submenu, or if it's a section meant to show subItems by default
          if (expandedSubMenuId !== section.id) {
             setIsMenuPanelOpen(true); // Ensure panel is open if a new submenu is expanded
          }
        } else if (section.mainHref) {
          // For single click on items that also have mainHref but no subItems for current design
          // we might want them to expand the panel if there was a conceptual "panel content" for them.
          // For now, direct navigation on double click for such items, panel expansion on single click for those *with* subitems.
          // If it has mainHref but no subitems, single click could just open an empty panel or do nothing for now.
          // Or, if we always want panel open for any section that is not directAction:
          // setIsMenuPanelOpen(true); setExpandedSectionId(section.id);
           toast({title: "Hint", description: `Double-click ${section.label} to navigate directly.`, duration: 2000});
        }
        lastClickTimestampRef.current.delete(section.id); // Clear after single click action
      }, DOUBLE_CLICK_THRESHOLD);
    }
  };


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuPanelRef.current && !menuPanelRef.current.contains(event.target as Node) &&
          triggerButtonRef.current && !triggerButtonRef.current.contains(event.target as Node)) {
        closePanel();
      }
    };

    if (isMenuPanelOpen) {
      document.body.style.overflow = 'hidden'; // Prevent background scroll when panel is open
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('mousedown', handleClickOutside);
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, [isMenuPanelOpen, closePanel]);

  if (theme === 'hypercharge-netflix') {
    return null; // Bottom nav is hidden for Netflix theme
  }

  return (
    <>
      {/* Central Trigger Button */}
      <Button
        ref={triggerButtonRef}
        variant="default"
        size="icon"
        className={cn(
          "fixed bottom-4 left-1/2 -translate-x-1/2 h-14 w-14 rounded-full shadow-xl z-[60] flex items-center justify-center transition-all duration-300 ease-in-out",
          "bg-primary/90 hover:bg-primary text-primary-foreground",
          theme === 'shinra-fire' && 'sf-bansho-button',
          theme !== 'shinra-fire' && 'neon-glow-hover',
          isMenuPanelOpen && "rotate-45 bg-destructive/90 hover:bg-destructive"
        )}
        onClick={() => setIsMenuPanelOpen(prev => !prev)}
        aria-expanded={isMenuPanelOpen}
        aria-label={isMenuPanelOpen ? "Close Menu" : "Open Menu"}
      >
        {isMenuPanelOpen ? <XCircle size={28} /> : <MenuIcon size={28} />}
      </Button>

      {/* Navigation Panel */}
      <AnimatePresence>
        {isMenuPanelOpen && (
          <motion.div
            key="menu-panel-backdrop"
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-md p-4 pb-20" // Added pb-20 to make space for FAB
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            onClick={closePanel} // Close on backdrop click
          >
            <motion.div
              ref={menuPanelRef}
              key="menu-panel-content"
              className="glass-deep w-full max-w-xs shadow-2xl border-primary/30 rounded-xl flex flex-col max-h-[calc(100vh-10rem)] sm:max-h-[calc(100vh-12rem)]" // Adjusted max height
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()} // Prevent backdrop click when clicking panel
            >
              <div className="p-4 border-b border-border/50 flex-shrink-0 text-center relative">
                <h3 className="text-lg font-semibold text-primary">Navigation</h3>
                <Button variant="ghost" size="icon" className="absolute top-1/2 -translate-y-1/2 right-2 text-muted-foreground hover:text-foreground h-8 w-8" onClick={closePanel}>
                  <XCircle size={20}/>
                  <span className="sr-only">Close menu</span>
                </Button>
              </div>

              <ScrollArea className="flex-1 p-3 min-h-0"> {/* Added min-h-0 */}
                <div className="space-y-1">
                  {navSections.map((section) => {
                    const Icon = section.icon;
                    const isSubMenuExpanded = expandedSubMenuId === section.id;

                    if (section.isDirectAction) {
                      return (
                        <TooltipProvider key={section.id} delayDuration={150}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                className={cn(
                                  "w-full justify-start text-sm h-auto py-2.5 px-3 flex items-center gap-3 text-foreground",
                                  "hover:bg-primary/10 hover:text-primary",
                                  theme === 'shinra-fire' && 'hover:sf-bansho-button'
                                )}
                                onClick={() => { section.directAction?.(); closePanel(); }}
                              >
                                <Icon size={18} className="text-primary/90" />
                                {section.label}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="text-xs glass-deep"><p>{section.label}</p></TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    }

                    // Section with subItems or a direct mainHref (but not a directAction)
                    return (
                      <div key={section.id}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-between text-sm h-auto py-2.5 px-3 flex items-center gap-3 text-foreground",
                            "hover:bg-accent/10 hover:text-primary",
                            pathname === section.mainHref && section.mainHref && "bg-primary/15 text-primary font-medium",
                            theme === 'shinra-fire' && 'hover:sf-bansho-button'
                          )}
                          onClick={() => handleMainIconClickInternal(section)}
                          aria-expanded={isSubMenuExpanded}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={18} className="text-primary/90" />
                            {section.label}
                          </div>
                          {section.subItems && section.subItems.length > 0 && (
                            isSubMenuExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                          )}
                        </Button>
                        {section.subItems && section.subItems.length > 0 && (
                          <AnimatePresence initial={false}>
                            {isSubMenuExpanded && (
                              <motion.div
                                key={`${section.id}-submenu`}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2, ease: 'easeInOut' }}
                                className="overflow-hidden pl-4"
                              >
                                <div className="py-1 space-y-0.5">
                                  {section.subItems.map(subItem => {
                                    const SubIcon = subItem.icon;
                                    if (subItem.href) {
                                      return (
                                        <Link key={subItem.id} href={subItem.href} passHref legacyBehavior>
                                          <a
                                            className={cn(
                                              "w-full justify-start text-xs h-auto py-2 px-3 flex items-center gap-2.5 rounded-md transition-colors text-muted-foreground hover:text-primary hover:bg-primary/10",
                                              pathname === subItem.href && "bg-primary/10 text-primary"
                                            )}
                                            onClick={closePanel}
                                          >
                                            <SubIcon size={16} />
                                            {subItem.label}
                                          </a>
                                        </Link>
                                      );
                                    }
                                    return (
                                      <Button
                                        key={subItem.id}
                                        variant="ghost"
                                        className={cn(
                                          "w-full justify-start text-xs h-auto py-2 px-3 flex items-center gap-2.5 text-muted-foreground hover:text-primary hover:bg-primary/10",
                                          subItem.disabled && "opacity-50 cursor-not-allowed"
                                        )}
                                        onClick={() => { subItem.action?.(); closePanel(); }}
                                        disabled={subItem.disabled}
                                        title={subItem.title}
                                      >
                                        <SubIcon size={16} />
                                        {subItem.label}
                                      </Button>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              <div className="p-3 border-t border-border/50 flex-shrink-0">
                 <Button variant="outline" className="w-full neon-glow-hover" onClick={closePanel}>Done</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
