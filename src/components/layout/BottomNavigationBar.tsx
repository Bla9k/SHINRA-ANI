// src/components/layout/BottomNavigationBar.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home as HomeIcon, Search as SearchIconLucide, Users as UsersIcon,
  User as UserIconLucide, Settings, Palette, Star, PlusCircle, LogOut,
  Tv, BookText, Moon, Sun, Flame, ShieldCheck, Zap, Rocket, // Added Zap here
  Menu as MenuIcon, X, XCircle, Gift, List // Added List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth'; // Corrected import path
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
  href?: string; // For direct navigation from the panel
  action?: () => void; // For direct actions from the panel
  // subItems are no longer directly used by the main trigger, but by the panel content
}

interface BottomNavigationBarProps {
  className?: string;
  onSearchIconClick: () => void;
  onOpenSubscriptionModal: () => void;
  onOpenCreateCommunityModal: () => void;
  handleLogout: () => void;
  // No longer needs panel state from AppLayout
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
    { id: 'home', label: 'Home', icon: HomeIcon, href: '/' },
    { id: 'anime', label: 'Anime', icon: Tv, href: '/anime' },
    { id: 'manga', label: 'Manga', icon: BookText, href: '/manga' },
    { id: 'community', label: 'Community', icon: UsersIcon, href: '/community' },
    { id: 'gacha', label: 'Gacha Game', icon: Gift, href: '/gacha'},
    { id: 'system', label: 'System', icon: ShieldCheck, href: '/system' },
    { id: 'profile', label: 'Profile', icon: UserIconLucide, href: '/profile' },
    { id: 'search', label: 'Search', icon: SearchIconLucide, action: onSearchIconClick },
    {
      id: 'theme-light',
      label: 'Light Theme',
      icon: Sun,
      action: () => setTheme('light'),
    },
    {
      id: 'theme-dark',
      label: 'Dark Theme',
      icon: Moon,
      action: () => setTheme('dark'),
    },
    {
      id: 'theme-shinra-fire',
      label: 'Shinra Fire Theme',
      icon: Flame,
      action: () => {
        setTheme('shinra-fire');
        toast({ title: "Shinra Fire Activated!", description: "Feel the burn!", variant: "default" });
      },
    },
    {
      id: 'theme-modern-shinra',
      label: 'Modern Shinra Theme',
      icon: Zap, // Zap is now imported
      action: () => setTheme('modern-shinra'),
    },
    {
      id: 'theme-hypercharge-netflix',
      label: 'Hypercharge (Netflix)',
      icon: Tv, // Using Tv for Netflix theme
      action: () => setTheme('hypercharge-netflix'),
    },
    { id: 'subscriptions', label: 'Subscription Tiers', icon: Star, action: onOpenSubscriptionModal },
    { id: 'settings', label: 'App Settings', icon: Settings, href: '/settings' },
  ];

  const createCommunitySection: NavSection = {
    id: 'create-community',
    label: 'Create Hub',
    icon: PlusCircle,
    action: () => {
      if (!user) {
        toast({ title: "Login Required", description: "Please log in to create a community.", variant: "destructive" });
        return;
      }
      if (userProfile && userProfile.subscriptionTier !== 'ignition' && userProfile.subscriptionTier !== 'hellfire' && userProfile.subscriptionTier !== 'burstdrive') {
        toast({ title: "Upgrade Required", description: "Creating communities requires at least the Ignition tier.", variant: "default"});
        onOpenSubscriptionModal();
        return;
      }
      onOpenCreateCommunityModal();
    }
  };

  const logoutSection: NavSection = {
    id: 'logout',
    label: 'Logout',
    icon: LogOut,
    action: handleLogout,
  };


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
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuPanelOpen, closePanel]);

  const allPanelItems = [...navSections];
  if (user) {
    allPanelItems.push(createCommunitySection);
    allPanelItems.push(logoutSection);
  } else {
    allPanelItems.push({ id: 'login', label: 'Login/Sign Up', icon: UserIconLucide, href: '/login' });
  }


  return (
    <>
      {/* Central Menu Trigger Button */}
      <Button
        ref={triggerButtonRef}
        variant="default"
        size="icon"
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 h-14 w-14 rounded-full shadow-xl z-[60] flex items-center justify-center transition-all duration-300 ease-in-out",
          "bg-primary/90 hover:bg-primary text-primary-foreground",
          theme === 'shinra-fire' && 'sf-bansho-button', // Apply bansho button style for Shinra Fire
          theme !== 'shinra-fire' && 'neon-glow-hover',
          isMenuPanelOpen && "rotate-45 bg-destructive/90 hover:bg-destructive"
        )}
        onClick={() => setIsMenuPanelOpen(!isMenuPanelOpen)}
        aria-expanded={isMenuPanelOpen}
        aria-label={isMenuPanelOpen ? "Close Menu" : "Open Menu"}
      >
        {isMenuPanelOpen ? <X size={28} /> : <MenuIcon size={28} />}
      </Button>

      {/* Menu Panel */}
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
              className="glass-deep w-full max-w-sm shadow-2xl border-primary/30 rounded-xl overflow-hidden flex flex-col max-h-[70vh]"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside panel
            >
              <CardHeader className="p-4 border-b border-border/50 flex-shrink-0">
                <CardTitle className="text-lg font-semibold text-primary text-center">Navigation</CardTitle>
                 <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-muted-foreground hover:text-foreground h-8 w-8" onClick={closePanel}>
                    <XCircle size={20}/>
                    <span className="sr-only">Close menu</span>
                </Button>
              </CardHeader>
              <ScrollArea className="flex-grow p-3">
                <div className="space-y-1.5">
                  {allPanelItems.map((item) => {
                    const Icon = item.icon;
                     const isCreateCommunityDisabled = item.id === 'create-community' && userProfile && userProfile.subscriptionTier !== 'ignition' && userProfile.subscriptionTier !== 'hellfire' && userProfile.subscriptionTier !== 'burstdrive';

                    if (item.href) {
                      return (
                        <Link key={item.id} href={item.href} passHref legacyBehavior>
                          <a
                            className={cn(
                              "w-full justify-start text-sm h-auto py-2.5 px-3 flex items-center gap-3 rounded-md transition-colors",
                              theme === 'shinra-fire' ? 'sf-bansho-button' : 'hover:bg-primary/10 hover:text-primary',
                              pathname === item.href && "bg-primary/15 text-primary font-medium"
                            )}
                            onClick={closePanel}
                          >
                            <Icon size={18} className="text-primary/90" />
                            <span className="text-foreground">{item.label}</span>
                          </a>
                        </Link>
                      );
                    }
                    return (
                      <Button
                        key={item.id}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start text-sm h-auto py-2.5 px-3 flex items-center gap-3 transition-colors",
                          theme === 'shinra-fire' ? 'sf-bansho-button' : 'hover:bg-primary/10 hover:text-primary',
                          isCreateCommunityDisabled && "opacity-60 cursor-not-allowed"
                        )}
                        onClick={() => {
                          if (item.action) {
                            if (item.id === 'create-community' && isCreateCommunityDisabled) {
                                toast({ title: "Upgrade Required", description: "Creating communities requires at least Ignition tier.", variant: "default"});
                                onOpenSubscriptionModal();
                            } else {
                                item.action();
                            }
                          }
                          closePanel();
                        }}
                        disabled={item.id === 'logout' && !user}
                        title={isCreateCommunityDisabled ? "Upgrade to Ignition Tier or higher" : item.label}
                      >
                        <Icon size={18} className={cn(item.id === 'logout' && user ? "text-destructive" : "text-primary/90")} />
                        <span className={cn(item.id === 'logout' && user ? "text-destructive" : "text-foreground")}>{item.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </ScrollArea>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
