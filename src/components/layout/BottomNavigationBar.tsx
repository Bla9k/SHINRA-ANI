// src/components/layout/BottomNavigationBar.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home as HomeIcon, Search as SearchIcon, Users as UsersIcon, User as UserIconLucide,
  Settings as SettingsIconOriginal, Tv, BookText, PlusCircle, LogOut, Sun, Moon,
  Star, Palette, Flame, ShieldCheck, Gift, Menu as MenuIcon, X, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import anime from 'animejs';

interface NavSubItem {
  label: string;
  icon: React.ElementType;
  href?: string;
  onClick?: () => void;
  premium?: boolean;
}

export interface NavSection {
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
  isMenuPanelOpen: boolean; // Controlled by AppLayout
  setIsMenuPanelOpen: (isOpen: boolean) => void; // Controlled by AppLayout
}

const DOUBLE_CLICK_THRESHOLD = 300;

export default function BottomNavigationBar({
  className,
  onSearchIconClick,
  onOpenSubscriptionModal,
  onOpenCreateCommunityModal,
  handleLogout,
  isMenuPanelOpen,
  setIsMenuPanelOpen,
}: BottomNavigationBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  const navSections: NavSection[] = [
    { id: 'home', label: 'Home', icon: HomeIcon, mainHref: '/' },
    { id: 'anime', label: 'Anime', icon: Tv, mainHref: '/anime' },
    { id: 'manga', label: 'Manga', icon: BookText, mainHref: '/manga' },
    { id: 'community', label: 'Community', icon: UsersIcon, mainHref: '/community' },
    { id: 'system', label: 'System', icon: ShieldCheck, mainHref: '/system' },
    { id: 'profile', label: 'Profile', icon: UserIconLucide, mainHref: '/profile' },
    // Add more direct links or sections that trigger specific actions from the panel
  ];

  const actionSections: NavSection[] = [
    { id: 'search', label: 'Search', icon: SearchIcon, isDirectAction: true, directAction: onSearchIconClick },
    { id: 'create-community', label: 'Create Hub', icon: PlusCircle, isDirectAction: true, directAction: onOpenCreateCommunityModal },
    { id: 'subscriptions', label: 'Subscription Tiers', icon: Star, isDirectAction: true, directAction: onOpenSubscriptionModal },
    {
      id: 'theme-light',
      label: 'Light Theme',
      icon: Sun,
      isDirectAction: true,
      directAction: () => setTheme('light'),
    },
    {
      id: 'theme-dark',
      label: 'Dark Theme',
      icon: Moon,
      isDirectAction: true,
      directAction: () => setTheme('dark'),
    },
    {
      id: 'theme-shinra-fire',
      label: 'Shinra Fire Theme',
      icon: Flame,
      isDirectAction: true,
      directAction: () => {
        setTheme('shinra-fire');
        toast({ title: "Shinra Fire Activated!", description: "Feel the burn!", variant: "default" });
      },
    },
    {
      id: 'theme-modern-shinra',
      label: 'Modern Shinra Theme',
      icon: Zap,
      isDirectAction: true,
      directAction: () => setTheme('modern-shinra'),
    },
    {
      id: 'theme-hypercharge-netflix',
      label: 'Hypercharge (Netflix)',
      icon: Tv,
      isDirectAction: true,
      directAction: () => setTheme('hypercharge-netflix'),
    },
    { id: 'settings', label: 'App Settings', icon: SettingsIconOriginal, mainHref: '/settings' },
    { id: 'logout', label: 'Logout', icon: LogOut, isDirectAction: true, directAction: handleLogout },
  ];

  const handleTriggerClick = () => {
    setIsMenuPanelOpen(!isMenuPanelOpen);
  };

  const handleItemClick = (item: NavSection) => {
    if (item.isDirectAction && item.directAction) {
      item.directAction();
    } else if (item.mainHref) {
      router.push(item.mainHref);
    }
    setIsMenuPanelOpen(false); // Close panel after action/navigation
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuPanelRef.current && !menuPanelRef.current.contains(event.target as Node) &&
        triggerButtonRef.current && !triggerButtonRef.current.contains(event.target as Node)
      ) {
        setIsMenuPanelOpen(false);
      }
    };

    if (isMenuPanelOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuPanelOpen, setIsMenuPanelOpen]);


  return (
    <>
      {/* Central Menu Trigger Button */}
      <Button
        ref={triggerButtonRef}
        variant="default"
        size="icon"
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 h-14 w-14 rounded-full shadow-xl z-50 flex items-center justify-center transition-all duration-300 ease-in-out",
          "bg-primary/90 hover:bg-primary text-primary-foreground",
          theme === 'shinra-fire' && 'fiery-glow-hover',
          theme !== 'shinra-fire' && 'neon-glow-hover',
          isMenuPanelOpen && "rotate-45 bg-destructive/90 hover:bg-destructive"
        )}
        onClick={handleTriggerClick}
        aria-expanded={isMenuPanelOpen}
        aria-label={isMenuPanelOpen ? "Close Menu" : "Open Menu"}
      >
        {isMenuPanelOpen ? <X size={28} /> : <MenuIcon size={28} />}
      </Button>

      {/* Menu Panel */}
      <AnimatePresence>
        {isMenuPanelOpen && (
          <motion.div
            ref={menuPanelRef}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            onClick={() => setIsMenuPanelOpen(false)} // Close on backdrop click
          >
            <Card
              className="glass-deep w-full max-w-sm shadow-2xl border-primary/30 overflow-hidden flex flex-col max-h-[70vh]"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside panel
            >
              <CardHeader className="p-4 border-b border-border/50 flex-shrink-0">
                <CardTitle className="text-lg font-semibold text-primary text-center">Navigation</CardTitle>
              </CardHeader>
              <ScrollArea className="flex-grow p-3">
                <div className="space-y-1.5">
                  {[...navSections, ...actionSections].map((item) => {
                    const Icon = item.icon;
                    const isActionDisabled = item.id === 'logout' && !user; // Disable logout if not logged in
                    const isCreateCommunityDisabled = item.id === 'create-community' && (!user || (userProfile && userProfile.subscriptionTier !== 'ignition' && userProfile.subscriptionTier !== 'hellfire' && userProfile.subscriptionTier !== 'burstdrive'));

                    return (
                      <Button
                        key={item.id}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-sm h-auto py-2.5 px-3 flex items-center gap-3 transition-colors",
                          theme === 'shinra-fire' ? 'sf-bansho-button' : 'hover:bg-primary/10 hover:text-primary',
                          (isActionDisabled || (item.id === 'create-community' && isCreateCommunityDisabled)) && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => {
                          if (item.id === 'create-community' && isCreateCommunityDisabled) {
                            toast({ title: "Upgrade Required", description: "Creating communities requires at least Ignition tier.", variant: "default"});
                            onOpenSubscriptionModal();
                            setIsMenuPanelOpen(false);
                            return;
                          }
                          handleItemClick(item);
                        }}
                        disabled={isActionDisabled}
                        title={(item.id === 'create-community' && isCreateCommunityDisabled) ? "Upgrade to Ignition Tier or higher" : item.label}
                      >
                        <Icon size={18} className={cn(item.id === 'logout' && user ? "text-destructive" : "text-primary/80")} />
                        <span className={cn(item.id === 'logout' && user ? "text-destructive" : "text-foreground")}>{item.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
