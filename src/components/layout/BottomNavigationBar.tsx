// src/components/layout/BottomNavigationBar.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home as HomeIcon, Search as SearchIconLucide, Users as UsersIcon,
  User as UserIcon, Settings, Tv, BookText, Moon, Sun,
  Palette, Flame, Zap, Rocket, Star, ShieldCheck, Gift, Menu as MenuIcon,
  LogOut, PlusCircle, XCircle, ChevronDown, ChevronUp, MessageCircle // Added Chevron icons
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth'; // Corrected import path
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
  isAlwaysVisible?: boolean; // For main icons like Search, System, etc.
}

interface BottomNavigationBarProps {
  className?: string;
  onSearchIconClick: () => void;
  onOpenSubscriptionModal: () => void;
  onOpenCreateCommunityModal: () => void;
  handleLogout: () => void;
  // State for panel is now managed internally by this component
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
  const [expandedSubMenuId, setExpandedSubMenuId] = useState<string | null>(null); // For sub-menu expansion

  const menuPanelRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  const navSections: NavSection[] = [
    { id: 'home', label: 'Home', icon: HomeIcon, mainHref: '/' },
    { id: 'anime', label: 'Anime', icon: Tv, mainHref: '/anime' },
    { id: 'manga', label: 'Manga', icon: BookText, mainHref: '/manga' },
    { id: 'community', label: 'Community', icon: UsersIcon, mainHref: '/community' },
    { id: 'system', label: 'System', icon: ShieldCheck, mainHref: '/system' },
    { id: 'gacha', label: 'Gacha Game', icon: Gift, mainHref: '/gacha' },
    { id: 'search', label: 'Search', icon: SearchIconLucide, isDirectAction: true, directAction: onSearchIconClick },
    {
      id: 'profile-actions',
      label: 'Profile & Account',
      icon: UserIcon,
      subItems: [
        { id: 'profile-view', label: 'View Profile', icon: UserIcon, href: '/profile' },
        { id: 'profile-settings', label: 'Account Settings', icon: Settings, href: '/settings' },
      ]
    },
    {
      id: 'customization-actions',
      label: 'Customization',
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
    {
      id: 'community-creation-actions',
      label: 'Community Tools',
      icon: PlusCircle,
      subItems: [
        {
          id: 'community-create', label: 'Create Community', icon: PlusCircle, action: () => {
            if (!user) { toast({ title: "Login Required", description: "Please log in to create a community.", variant: "destructive" }); return; }
            if (userProfile && userProfile.subscriptionTier !== 'ignition' && userProfile.subscriptionTier !== 'hellfire' && userProfile.subscriptionTier !== 'burstdrive') {
              toast({ title: "Upgrade Required", description: "Creating communities requires at least the Ignition tier.", variant: "default" });
              onOpenSubscriptionModal(); return;
            }
            onOpenCreateCommunityModal();
          },
          disabled: !user || (!!userProfile && userProfile.subscriptionTier !== 'ignition' && userProfile.subscriptionTier !== 'hellfire' && userProfile.subscriptionTier !== 'burstdrive'),
          title: !user ? "Login to create" : (!!userProfile && userProfile.subscriptionTier !== 'ignition' && userProfile.subscriptionTier !== 'hellfire' && userProfile.subscriptionTier !== 'burstdrive') ? "Upgrade to Ignition Tier or higher" : "Create a new community"
        },
      ]
    },
  ];

  const closePanel = useCallback(() => {
    setIsMenuPanelOpen(false);
    setExpandedSubMenuId(null); // Also reset expanded sub-menu
  }, []);

  const handleToggleSubMenu = (sectionId: string) => {
    setExpandedSubMenuId(prev => prev === sectionId ? null : sectionId);
  };

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
      document.body.style.overflow = 'hidden';
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuPanelOpen, closePanel]);

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
        onClick={() => setIsMenuPanelOpen(prev => !prev)}
        aria-expanded={isMenuPanelOpen}
        aria-label={isMenuPanelOpen ? "Close Menu" : "Open Menu"}
      >
        {isMenuPanelOpen ? <XCircle size={28} /> : <MenuIcon size={28} />}
      </Button>

      <AnimatePresence>
        {isMenuPanelOpen && (
          <motion.div
            key="menu-panel-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            onClick={closePanel}
          >
            <motion.div
              ref={menuPanelRef}
              key="menu-panel-content"
              className="glass-deep w-full max-w-xs shadow-2xl border-primary/30 rounded-xl flex flex-col max-h-[70vh] sm:max-h-[60vh]"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }}
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

              <ScrollArea className="flex-grow p-3 min-h-0">
                <div className="space-y-1">
                  {navSections.map((section) => {
                    const Icon = section.icon;
                    // Sections with mainHref or directAction are direct items
                    if (section.mainHref || section.isDirectAction) {
                      return (
                        <TooltipProvider key={section.id} delayDuration={150}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {section.mainHref ? (
                                <Link href={section.mainHref} passHref legacyBehavior>
                                  <a
                                    className={cn(
                                      "w-full justify-start text-sm h-auto py-2.5 px-3 flex items-center gap-3 rounded-md transition-colors text-foreground",
                                      "hover:bg-primary/10 hover:text-primary",
                                      pathname === section.mainHref && "bg-primary/15 text-primary font-medium"
                                    )}
                                    onClick={() => { closePanel(); }}
                                  >
                                    <Icon size={18} className="text-primary/90" />
                                    {section.label}
                                  </a>
                                </Link>
                              ) : (
                                <Button
                                  variant="ghost"
                                  className={cn(
                                    "w-full justify-start text-sm h-auto py-2.5 px-3 flex items-center gap-3 text-foreground",
                                    "hover:bg-primary/10 hover:text-primary"
                                  )}
                                  onClick={() => { section.directAction?.(); closePanel(); }}
                                >
                                  <Icon size={18} className="text-primary/90" />
                                  {section.label}
                                </Button>
                              )}
                            </TooltipTrigger>
                            <TooltipContent side="right" className="text-xs glass-deep"><p>{section.label}</p></TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    }
                    // Sections with subItems are expandable headers
                    if (section.subItems && section.subItems.length > 0) {
                      const isSubMenuExpanded = expandedSubMenuId === section.id;
                      return (
                        <div key={section.id}>
                          <Button
                            variant="ghost"
                            className="w-full justify-between text-sm h-auto py-2.5 px-3 flex items-center gap-3 text-foreground hover:bg-accent/10"
                            onClick={() => handleToggleSubMenu(section.id)}
                            aria-expanded={isSubMenuExpanded}
                          >
                            <div className="flex items-center gap-3">
                              <Icon size={18} className="text-primary/90" />
                              {section.label}
                            </div>
                            {isSubMenuExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </Button>
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
                        </div>
                      );
                    }
                    return null;
                  })}
                   {/* Logout Button if user is logged in */}
                  {user && (
                    <div className="pt-2 mt-2 border-t border-border/30">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm h-auto py-2.5 px-3 flex items-center gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => { handleLogout(); closePanel(); }}
                      >
                        <LogOut size={18} className="text-destructive/90" />
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
