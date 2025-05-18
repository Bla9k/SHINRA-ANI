// src/components/layout/BottomNavigationBar.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home as HomeIcon, Search as SearchIconLucide, Users as UsersIcon,
  User as UserIconLucide, Settings, Palette, Star, PlusCircle, LogOut,
  Tv, BookText, Moon, Sun, Flame, ShieldCheck, Zap, Rocket, Menu as MenuIcon, X, XCircle, Gift, List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DialogHeader, // Only DialogHeader, Title, Description, Close are needed for the panel
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area'; // Import ScrollArea
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import anime from 'animejs';

export interface NavSection {
  id: string;
  label: string;
  icon: React.ElementType;
  href?: string;
  mainHref?: string; // For direct navigation from top-level icon
  action?: () => void;
  isDirectAction?: boolean; // If true, clicking main icon performs action directly
  subItems?: NavSubItem[];
  isBottomBarIcon?: boolean; // True if it should be a main icon on the bar
  isPanelOnly?: boolean; // True if it should only appear in the expanded panel
}

export interface NavSubItem {
  label: string;
  icon: React.ElementType;
  href?: string;
  action?: () => void;
  disabled?: boolean;
  title?: string;
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
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { user, userProfile } = useAuth();

  const [isMenuPanelOpen, setIsMenuPanelOpen] = useState(false);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  const navSections: NavSection[] = [
    { id: 'home', label: 'Home', icon: HomeIcon, mainHref: '/' },
    { id: 'anime', label: 'Anime', icon: Tv, mainHref: '/anime' },
    { id: 'manga', label: 'Manga', icon: BookText, mainHref: '/manga' },
    { id: 'community', label: 'Community', icon: UsersIcon, mainHref: '/community' },
    { id: 'gacha', label: 'Gacha Game', icon: Gift, mainHref: '/gacha' },
    { id: 'system', label: 'System', icon: ShieldCheck, mainHref: '/system' },
    { id: 'search', label: 'Search', icon: SearchIconLucide, isDirectAction: true, action: onSearchIconClick },
    {
      id: 'profileGroup', label: 'Profile', icon: UserIconLucide, isPanelOnly: true,
      subItems: [
        { label: 'View Profile', icon: UserIconLucide, href: '/profile' },
        { label: 'Account Settings', icon: Settings, href: '/settings' },
      ]
    },
    {
      id: 'customizeGroup', label: 'Customize', icon: Palette, isPanelOnly: true,
      subItems: [
        { label: 'Light Theme', icon: Sun, action: () => setTheme('light') },
        { label: 'Dark Theme', icon: Moon, action: () => setTheme('dark') },
        { label: 'Shinra Fire Theme', icon: Flame, action: () => setTheme('shinra-fire') },
        { label: 'Modern Shinra Theme', icon: Zap, action: () => setTheme('modern-shinra') },
        { label: 'Hypercharge (Netflix)', icon: Tv, action: () => setTheme('hypercharge-netflix') },
        { label: 'Subscription Tiers', icon: Star, action: onOpenSubscriptionModal },
      ]
    },
    {
      id: 'actionsGroup', label: 'Actions', icon: PlusCircle, isPanelOnly: true,
      subItems: [
        {
          label: 'Create Hub', icon: PlusCircle, action: () => {
            if (!user) {
              toast({ title: "Login Required", description: "Please log in to create a community.", variant: "destructive" }); return;
            }
            if (userProfile && userProfile.subscriptionTier !== 'ignition' && userProfile.subscriptionTier !== 'hellfire' && userProfile.subscriptionTier !== 'burstdrive') {
              toast({ title: "Upgrade Required", description: "Creating communities requires at least Ignition tier.", variant: "default" });
              onOpenSubscriptionModal(); return;
            }
            onOpenCreateCommunityModal();
          },
          disabled: !user || (!!userProfile && userProfile.subscriptionTier !== 'ignition' && userProfile.subscriptionTier !== 'hellfire' && userProfile.subscriptionTier !== 'burstdrive'),
          title: !user ? "Login to create" : (!!userProfile && userProfile.subscriptionTier !== 'ignition' && userProfile.subscriptionTier !== 'hellfire' && userProfile.subscriptionTier !== 'burstdrive') ? "Upgrade to Ignition Tier or higher" : "Create a new community"
        },
      ]
    },
    // Logout will be handled separately if user is logged in
  ];


  const closePanel = useCallback(() => {
    setIsMenuPanelOpen(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuPanelRef.current && !menuPanelRef.current.contains(event.target as Node) &&
        triggerButtonRef.current && !triggerButtonRef.current.contains(event.target as Node)
      ) {
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
    };
  }, [isMenuPanelOpen, closePanel]);


  const allPanelItems = [...navSections];
  if (user) {
    const actionsGroup = allPanelItems.find(s => s.id === 'actionsGroup');
    if (actionsGroup && actionsGroup.subItems) {
      // Logout added to actions group if user is logged in
    }
  }


  if (theme === 'hypercharge-netflix') {
    return null; // Bottom nav is hidden for Netflix theme
  }

  return (
    <>
      <Button
        ref={triggerButtonRef}
        variant="default"
        size="icon"
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 h-14 w-14 rounded-full shadow-xl z-[60] flex items-center justify-center transition-all duration-300 ease-in-out",
          "bg-primary/90 hover:bg-primary text-primary-foreground",
          theme === 'shinra-fire' && 'sf-bansho-button',
          theme !== 'shinra-fire' && 'neon-glow-hover',
          isMenuPanelOpen && "rotate-45 bg-destructive/90 hover:bg-destructive"
        )}
        onClick={() => setIsMenuPanelOpen(!isMenuPanelOpen)}
        aria-expanded={isMenuPanelOpen}
        aria-label={isMenuPanelOpen ? "Close Menu" : "Open Menu"}
      >
        {isMenuPanelOpen ? <X size={28} /> : <MenuIcon size={28} />}
      </Button>

      <AnimatePresence>
        {isMenuPanelOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            onClick={closePanel} // Close on backdrop click
          >
            <motion.div
              ref={menuPanelRef}
              className="glass-deep w-full max-w-xs shadow-2xl border-primary/30 rounded-xl overflow-hidden flex flex-col max-h-[calc(var(--bottom-nav-panel-max-height)*2.5)] sm:max-h-[calc(var(--bottom-nav-panel-max-height)*2)] md:max-h-[calc(var(--bottom-nav-panel-max-height)*1.8)]"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <DialogHeader className="p-4 border-b border-border/50 flex-shrink-0">
                <DialogTitle className="text-lg font-semibold text-primary text-center">Navigation</DialogTitle>
                <DialogClose asChild>
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-foreground h-8 w-8" onClick={closePanel}>
                    <XCircle size={20}/>
                    <span className="sr-only">Close menu</span>
                  </Button>
                </DialogClose>
              </DialogHeader>
              <ScrollArea className="flex-grow p-3 min-h-0"> {/* Added min-h-0 */}
                <div className="space-y-1.5">
                  {allPanelItems.filter(s => !s.isPanelOnly || s.subItems).map((section) => {
                    const Icon = section.icon;
                    const isGroup = !!section.subItems && section.isPanelOnly;

                    if (isGroup) {
                      return (
                        <div key={section.id} className="pt-2">
                          <h4 className="px-2 mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <Icon size={14} /> {section.label}
                          </h4>
                          {section.subItems?.map(subItem => {
                            const SubIcon = subItem.icon;
                            if (subItem.href) {
                              return (
                                <Link key={subItem.label} href={subItem.href} passHref legacyBehavior>
                                  <a
                                    className={cn(
                                      "w-full justify-start text-sm h-auto py-2 px-3 flex items-center gap-3 rounded-md transition-colors text-foreground",
                                      "hover:bg-primary/10 hover:text-primary",
                                      pathname === subItem.href && "bg-primary/15 text-primary font-medium"
                                    )}
                                    onClick={closePanel}
                                  >
                                    <SubIcon size={16} className="text-primary/80" />
                                    {subItem.label}
                                  </a>
                                </Link>
                              );
                            }
                            return (
                              <Button
                                key={subItem.label}
                                variant="ghost"
                                className={cn(
                                  "w-full justify-start text-sm h-auto py-2 px-3 flex items-center gap-3 text-foreground",
                                  "hover:bg-primary/10 hover:text-primary",
                                   subItem.disabled && "opacity-60 cursor-not-allowed"
                                )}
                                onClick={() => {
                                  if (subItem.action) subItem.action();
                                  closePanel();
                                }}
                                disabled={subItem.disabled}
                                title={subItem.title}
                              >
                                <SubIcon size={16} className="text-primary/80" />
                                {subItem.label}
                              </Button>
                            );
                          })}
                        </div>
                      );
                    }

                    // Direct navigation items
                    if (section.mainHref) {
                      return (
                        <Link key={section.id} href={section.mainHref} passHref legacyBehavior>
                          <a
                            className={cn(
                              "w-full justify-start text-sm h-auto py-2 px-3 flex items-center gap-3 rounded-md transition-colors text-foreground",
                              "hover:bg-primary/10 hover:text-primary",
                              pathname === section.mainHref && "bg-primary/15 text-primary font-medium"
                            )}
                            onClick={closePanel}
                          >
                            <Icon size={16} className="text-primary/80" />
                            {section.label}
                          </a>
                        </Link>
                      );
                    }
                    // Direct action items
                    if (section.isDirectAction && section.action) {
                      return (
                        <Button
                          key={section.id}
                          variant="ghost"
                          className={cn(
                            "w-full justify-start text-sm h-auto py-2 px-3 flex items-center gap-3 text-foreground",
                            "hover:bg-primary/10 hover:text-primary"
                          )}
                          onClick={() => {
                            if (section.action) section.action();
                            closePanel();
                          }}
                        >
                          <Icon size={16} className="text-primary/80" />
                          {section.label}
                        </Button>
                      );
                    }
                    return null;
                  })}
                  {/* Logout Button */}
                  {user && (
                    <div className="pt-2 mt-2 border-t border-border/30">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm h-auto py-2 px-3 flex items-center gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => { handleLogout(); closePanel(); }}
                      >
                        <LogOut size={16} />
                        Logout
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
