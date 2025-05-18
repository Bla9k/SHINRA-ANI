// src/components/layout/BottomNavigationBar.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home as HomeIcon,
  Search as SearchIconLucide,
  Users as UsersIcon,
  User as UserIconLucide,
  Settings as SettingsIcon,
  Tv,
  BookText,
  Moon,
  Sun,
  Palette,
  Flame,
  Zap,
  Rocket,
  Star,
  ShieldCheck,
  Gift,
  Menu as MenuIcon,
  LogOut,
  PlusCircle,
  X,
  ChevronDown,
  ChevronUp,
  Compass, // Added Compass
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Keep Card imports for panel styling
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth'; // Corrected import path
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import anime from 'animejs';
import type { UserProfileData } from '@/services/profile';

const DOUBLE_CLICK_THRESHOLD = 300; // ms

export interface NavSubItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  action?: () => void;
  requiresAuth?: boolean;
  isSubGroupHeader?: boolean; // For "Customize Appearance" type headers
  subItems?: NavSubItem[]; // For nested sub-items under a sub-group header
}
export interface NavSection {
  id: string;
  label: string;
  icon: LucideIcon;
  mainHref?: string;
  isDirectAction?: boolean;
  directAction?: () => void;
  subItems?: NavSubItem[];
  requiresAuth?: boolean;
}

interface BottomNavigationBarProps {
  className?: string;
  // navSections prop is now defined and used within the component
  onSearchIconClick: () => void;
  onOpenSubscriptionModal: () => void;
  onOpenCreateCommunityModal: () => void;
  handleLogout: () => void;
  // theme and setTheme are now managed by useTheme hook internally
}

export default function BottomNavigationBar({
  className,
  onSearchIconClick,
  onOpenSubscriptionModal,
  onOpenCreateCommunityModal,
  handleLogout,
}: BottomNavigationBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const [isMenuPanelOpen, setIsMenuPanelOpen] = useState(false);
  const [expandedSubMenuId, setExpandedSubMenuId] = useState<string | null>(null); // For top-level expandable sections
  const [expandedNestedSubMenuId, setExpandedNestedSubMenuId] = useState<string | null>(null); // For nested expandable sections like "Customize Appearance"

  const menuPanelRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);


  const navSections: NavSection[] = [
    {
      id: 'home',
      label: 'Home',
      icon: HomeIcon,
      subItems: [
        { id: 'home-feed', label: 'Main Feed', icon: HomeIcon, href: '/' },
        { id: 'home-anime', label: 'Browse Anime', icon: Tv, href: '/anime' },
        { id: 'home-manga', label: 'Browse Manga', icon: BookText, href: '/manga' },
        { id: 'home-gacha', label: 'Gacha Game', icon: Gift, href: '/gacha' },
      ],
    },
    {
      id: 'search-action',
      label: 'Search',
      icon: SearchIconLucide,
      isDirectAction: true,
      directAction: onSearchIconClick,
    },
    {
      id: 'community',
      label: 'Community',
      icon: UsersIcon,
      mainHref: '/community',
      subItems: [
        { id: 'community-explore', label: 'Explore Hubs', icon: Compass, href: '/community' },
        { id: 'community-create', label: 'Create Hub', icon: PlusCircle, action: onOpenCreateCommunityModal, requiresAuth: true },
      ],
    },
    {
      id: 'system',
      label: 'System',
      icon: ShieldCheck,
      mainHref: '/system',
    },
    {
      id: 'me-settings',
      label: 'Me & Settings',
      icon: UserIconLucide,
      subItems: [
        { id: 'profile-view', label: 'View Profile', icon: UserIconLucide, href: '/profile', requiresAuth: true },
        { id: 'profile-settings', label: 'Account Settings', icon: SettingsIcon, href: '/settings', requiresAuth: true },
        {
          id: 'customize-appearance-group',
          label: 'Customize Appearance',
          icon: Palette,
          isSubGroupHeader: true, // Indicates this is a header for more sub-items
          subItems: [ // Nested sub-items for themes
            { id: 'theme-light', label: 'Light Theme', icon: Sun, action: () => setTheme('light') },
            { id: 'theme-dark', label: 'Dark Theme', icon: Moon, action: () => setTheme('dark') },
            { id: 'theme-shinra-fire', label: 'Shinra Fire Theme', icon: Flame, action: () => setTheme('shinra-fire') },
            { id: 'theme-modern-shinra', label: 'Modern Shinra', icon: Zap, action: () => setTheme('modern-shinra') },
            { id: 'theme-hypercharge-netflix', label: 'Hypercharge (Netflix)', icon: Tv, action: () => setTheme('hypercharge-netflix') },
          ],
        },
        { id: 'subscription-tiers', label: 'Subscription Tiers', icon: Star, action: onOpenSubscriptionModal },
        { id: 'profile-logout', label: 'Logout', icon: LogOut, action: handleLogout, requiresAuth: true },
      ],
    },
  ];


  const closePanel = useCallback(() => {
    setIsMenuPanelOpen(false);
    setExpandedSubMenuId(null);
    setExpandedNestedSubMenuId(null);
  }, []);

  const handleTriggerButtonClick = () => {
    setIsMenuPanelOpen(prev => !prev);
    if (isMenuPanelOpen) { // If closing
      setExpandedSubMenuId(null);
      setExpandedNestedSubMenuId(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuPanelRef.current &&
        !menuPanelRef.current.contains(event.target as Node) &&
        triggerButtonRef.current &&
        !triggerButtonRef.current.contains(event.target as Node)
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

  const renderNavItem = (item: NavSubItem | NavSection, level: number = 0, parentId?: string) => {
    const Icon = item.icon;
    const isAuthRequiredAndNotLoggedIn = item.requiresAuth && !user;
    const isExpandable = item.subItems && item.subItems.length > 0;
    const isExpanded = level === 0 ? expandedSubMenuId === item.id : expandedNestedSubMenuId === item.id;

    const handleClick = () => {
      if (isAuthRequiredAndNotLoggedIn) {
        toast({ title: "Login Required", description: `Please log in to access ${item.label}.`, variant: "destructive" });
        router.push('/login');
        closePanel();
        return;
      }
      if (item.isSubGroupHeader || (isExpandable && !item.mainHref && !item.isDirectAction && !item.action)) {
        if (level === 0) {
          setExpandedSubMenuId(prev => (prev === item.id ? null : item.id));
        } else {
          setExpandedNestedSubMenuId(prev => (prev === item.id ? null : item.id));
        }
      } else if (item.action) {
        item.action();
        closePanel();
      } else if (item.isDirectAction && item.directAction) {
        item.directAction();
        closePanel();
      } else if ((item as NavSection).mainHref) { // For top-level direct links
        router.push((item as NavSection).mainHref!);
        closePanel();
      } else if (item.href) { // For sub-item links
        router.push(item.href);
        closePanel();
      }
    };

    const commonItemClasses = cn(
      "w-full justify-start text-sm h-auto py-2.5 px-3 flex items-center gap-3 rounded-md transition-colors",
      level > 0 && "py-2", // Slightly smaller padding for sub-items
      isAuthRequiredAndNotLoggedIn ? "opacity-50 cursor-not-allowed" : "text-foreground hover:text-primary hover:bg-primary/10",
      theme === 'shinra-fire' && !isAuthRequiredAndNotLoggedIn && "hover:sf-bansho-button"
    );

    const itemContent = (
      <>
        <Icon size={level === 0 ? 18 : 16} className={cn(isAuthRequiredAndNotLoggedIn ? "text-muted-foreground" : "text-primary/90")} />
        <span className="flex-grow text-left">{item.label}</span>
        {isExpandable && !item.isSubGroupHeader && (isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
      </>
    );

    return (
      <div key={item.id}>
        {item.href && !isExpandable && !item.isSubGroupHeader ? (
          <Link href={isAuthRequiredAndNotLoggedIn ? '#' : item.href} passHref legacyBehavior>
            <a
              className={commonItemClasses}
              onClick={(e) => {
                if (isAuthRequiredAndNotLoggedIn) {
                  e.preventDefault();
                  toast({ title: "Login Required", description: `Please log in to access ${item.label}.`, variant: "destructive" });
                  router.push('/login');
                }
                closePanel();
              }}
            >
              {itemContent}
            </a>
          </Link>
        ) : (
          <button
            type="button"
            className={commonItemClasses}
            onClick={handleClick}
            disabled={isAuthRequiredAndNotLoggedIn && !item.href} // Disable button if auth needed and not a link
            aria-expanded={isExpandable ? isExpanded : undefined}
          >
            {itemContent}
          </button>
        )}
        <AnimatePresence>
          {isExpanded && item.subItems && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className={cn("overflow-hidden", level === 0 ? "pl-4" : "pl-8")} // Indent sub-items
            >
              <div className="py-1 space-y-0.5 border-l border-border/30 ml-2.5 pl-2.5">
                {item.subItems.map(sub => renderNavItem(sub, level + 1, item.id))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };


  if (theme === 'hypercharge-netflix') {
    return null; // Bottom nav is hidden in Netflix theme
  }

  return (
    <>
      {/* Main Trigger Button */}
      <Button
        ref={triggerButtonRef}
        variant="default"
        size="icon"
        className={cn(
          "fixed bottom-4 left-1/2 -translate-x-1/2 h-14 w-14 rounded-full shadow-xl z-50 transition-all duration-300 ease-in-out",
          "bg-card/80 backdrop-blur-md border border-primary/30 text-primary hover:bg-primary/20",
          theme === 'shinra-fire' && "sf-bansho-button",
          isMenuPanelOpen && (theme === 'shinra-fire' ? "bg-destructive/70 text-destructive-foreground sf-bansho-button" : "bg-destructive/80 text-destructive-foreground rotate-45")
        )}
        onClick={handleTriggerButtonClick}
        aria-expanded={isMenuPanelOpen}
        aria-label={isMenuPanelOpen ? "Close Menu" : "Open Menu"}
      >
        {isMenuPanelOpen ? <X size={28} /> : <MenuIcon size={28} />}
      </Button>

      {/* Navigation Panel */}
      <AnimatePresence>
        {isMenuPanelOpen && (
          <motion.div
            key="nav-panel-backdrop"
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            onClick={closePanel} // Close on backdrop click
          >
            <motion.div
              ref={menuPanelRef}
              className="glass-deep w-full max-w-xs sm:max-w-sm rounded-xl shadow-2xl border border-primary/40 flex flex-col max-h-[75vh] sm:max-h-[80vh]"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside panel
            >
              <div className="p-4 flex items-center justify-between border-b border-border/50 flex-shrink-0 bg-card/50 backdrop-blur-sm rounded-t-xl">
                <h3 className="text-lg font-semibold text-primary">Navigation</h3>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8" onClick={closePanel}>
                  <X size={20} />
                  <span className="sr-only">Close panel</span>
                </Button>
              </div>

              <ScrollArea className="flex-1 min-h-0">
                <div className="p-3 sm:p-4 space-y-1">
                  {navSections.map(section => renderNavItem(section, 0))}
                </div>
              </ScrollArea>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
