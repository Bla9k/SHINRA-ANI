
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home as HomeIcon,
  Search as SearchIconLucide,
  Users as UsersIcon,
  User as UserIconLucide,
  Settings,
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
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import anime from 'animejs';

const DOUBLE_CLICK_THRESHOLD = 300;

export interface NavSubItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  action?: () => void;
  disabled?: boolean;
  title?: string;
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
  requiresTier?: UserProfileData['subscriptionTier'][];
}

interface BottomNavigationBarProps {
  className?: string;
  onSearchIconClick: () => void;
  onOpenSubscriptionModal: () => void;
  onOpenCreateCommunityModal: () => void;
  handleLogout: () => void;
  // These will be managed locally by this component now
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
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { user, userProfile } = useAuth();

  const [isMenuPanelOpen, setIsMenuPanelOpen] = useState(false);
  const [expandedSubMenuId, setExpandedSubMenuId] = useState<string | null>(null);

  const menuPanelRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  const navSections: NavSection[] = [
    { id: 'home', label: 'Home', icon: HomeIcon, mainHref: '/' },
    { id: 'anime', label: 'Anime', icon: Tv, mainHref: '/anime' },
    { id: 'manga', label: 'Manga', icon: BookText, mainHref: '/manga' },
    { id: 'community', label: 'Community', icon: UsersIcon, mainHref: '/community' },
    { id: 'gacha', label: 'Gacha', icon: Gift, mainHref: '/gacha' },
    { id: 'system', label: 'System', icon: ShieldCheck, mainHref: '/system' },
    {
      id: 'profile',
      label: 'Profile & Account',
      icon: UserIconLucide,
      mainHref: '/profile', // Can navigate directly to profile
      requiresAuth: true,
      subItems: [
        { id: 'profile-view', label: 'View Profile', icon: UserIconLucide, href: '/profile' },
        { id: 'profile-settings', label: 'Account Settings', icon: Settings, href: '/settings' },
        { id: 'profile-logout', label: 'Logout', icon: LogOut, action: handleLogout },
      ],
    },
    {
      id: 'customize',
      label: 'Customize',
      icon: Palette,
      subItems: [
        { id: 'theme-light', label: 'Light Theme', icon: Sun, action: () => setTheme('light') },
        { id: 'theme-dark', label: 'Dark Theme', icon: Moon, action: () => setTheme('dark') },
        {
          id: 'theme-shinra-fire',
          label: 'Shinra Fire Theme',
          icon: Flame,
          action: () => setTheme('shinra-fire'),
        },
        {
          id: 'theme-modern-shinra',
          label: 'Modern Shinra',
          icon: Zap,
          action: () => setTheme('modern-shinra'),
        },
        {
          id: 'theme-hypercharge-netflix',
          label: 'Hypercharge (Netflix)',
          icon: Tv, // Using Tv for Netflix icon as it's more generic
          action: () => setTheme('hypercharge-netflix'),
        },
        { id: 'subscription-tiers', label: 'Subscription Tiers', icon: Star, action: onOpenSubscriptionModal },
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
      id: 'create-community-action',
      label: 'Create Community',
      icon: PlusCircle,
      isDirectAction: true,
      directAction: () => {
        if (!user) {
          toast({ title: "Login Required", description: "Please log in to create a community.", variant: "destructive" });
          return;
        }
        if (userProfile && userProfile.subscriptionTier !== 'ignition' && userProfile.subscriptionTier !== 'hellfire' && userProfile.subscriptionTier !== 'burstdrive') {
          toast({ title: "Upgrade Required", description: "Creating communities requires at least the Ignition tier.", variant: "default" });
          onOpenSubscriptionModal();
          return;
        }
        onOpenCreateCommunityModal();
      },
      requiresAuth: true, // Technically handled by the tier check too
    }
  ];

  const handlePanelToggle = useCallback(() => {
    setIsMenuPanelOpen(prev => !prev);
    if (isMenuPanelOpen) { // If closing, reset expanded submenu
      setExpandedSubMenuId(null);
    }
  }, [isMenuPanelOpen]);

  const handlePanelClose = useCallback(() => {
    setIsMenuPanelOpen(false);
    setExpandedSubMenuId(null);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuPanelRef.current &&
        !menuPanelRef.current.contains(event.target as Node) &&
        triggerButtonRef.current &&
        !triggerButtonRef.current.contains(event.target as Node)
      ) {
        handlePanelClose();
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
  }, [isMenuPanelOpen, handlePanelClose]);

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
          "fixed bottom-4 left-1/2 -translate-x-1/2 h-14 w-14 rounded-full shadow-xl z-[60] flex items-center justify-center transition-all duration-300 ease-in-out",
          "bg-primary/90 hover:bg-primary text-primary-foreground",
          theme === 'shinra-fire' && 'sf-bansho-button',
          theme !== 'shinra-fire' && 'neon-glow-hover',
          isMenuPanelOpen && "rotate-45 bg-destructive/90 hover:bg-destructive"
        )}
        onClick={handlePanelToggle}
        aria-expanded={isMenuPanelOpen}
        aria-label={isMenuPanelOpen ? "Close Menu" : "Open Menu"}
      >
        {isMenuPanelOpen ? <X size={28} /> : <MenuIcon size={28} />}
      </Button>

      <AnimatePresence>
        {isMenuPanelOpen && (
          <motion.div
            key="menu-panel-backdrop"
            className="fixed inset-0 z-[55] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            onClick={handlePanelClose}
          >
            <motion.div
              ref={menuPanelRef}
              key="menu-panel-content"
              className="glass-deep w-full max-w-xs sm:max-w-sm rounded-xl flex flex-col max-h-[70vh] sm:max-h-[calc(100vh-6rem)] shadow-2xl border-border/30 overflow-hidden"
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 flex items-center justify-between border-b border-border/50 flex-shrink-0">
                <h3 className="text-base font-semibold text-primary">Navigation</h3>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-7 w-7" onClick={handlePanelClose}>
                  <X size={18} />
                  <span className="sr-only">Close panel</span>
                </Button>
              </div>

              <ScrollArea className="flex-1 min-h-0">
                <div className="p-2 sm:p-3 md:p-4 space-y-1"> {/* Reduced padding on mobile */}
                  {navSections.map((section) => {
                    const Icon = section.icon;
                    const isSubMenuExpanded = expandedSubMenuId === section.id;

                    if (section.requiresAuth && !user) {
                      return null; // Don't render auth-required sections if not logged in
                    }
                     if (section.requiresTier && (!userProfile || (section.requiresTier.length > 0 && !section.requiresTier.includes(userProfile.subscriptionTier)))) {
                         return null; // Don't render if tier requirement not met
                     }


                    const handleSectionHeaderClick = () => {
                      if (section.isDirectAction && section.directAction) {
                        section.directAction();
                        handlePanelClose();
                      } else if (section.subItems && section.subItems.length > 0) {
                        setExpandedSubMenuId(prev => prev === section.id ? null : section.id);
                      } else if (section.mainHref) {
                        router.push(section.mainHref);
                        handlePanelClose();
                      }
                    };

                    return (
                      <div key={section.id}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-between text-sm h-auto py-2.5 px-3 flex items-center gap-3 text-foreground",
                            "hover:bg-accent/10 hover:text-primary",
                            pathname === section.mainHref && section.mainHref && !section.subItems && "bg-primary/15 text-primary font-medium",
                            theme === 'shinra-fire' && 'hover:sf-bansho-button'
                          )}
                          onClick={handleSectionHeaderClick}
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
                                className="overflow-hidden pl-4 mt-0.5"
                              >
                                <div className="py-1 space-y-0.5 border-l border-border/30 pl-3">
                                  {section.subItems.map(subItem => {
                                    const SubIcon = subItem.icon;
                                    if (subItem.href) {
                                      return (
                                        <Link key={subItem.id} href={subItem.href} passHref legacyBehavior>
                                          <a
                                            className={cn(
                                              "w-full justify-start text-xs h-auto py-2 px-3 flex items-center gap-2.5 rounded-md transition-colors text-muted-foreground hover:text-primary hover:bg-primary/10",
                                              pathname === subItem.href && "bg-primary/10 text-primary font-medium"
                                            )}
                                            onClick={handlePanelClose}
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
                                        onClick={() => {
                                          if (subItem.action) subItem.action();
                                          handlePanelClose();
                                        }}
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

interface NavItemProps {
  section: NavSection;
  isActive: boolean;
  isPanelOpen: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  onDoubleClick: () => void;
}
// NavItem is no longer a separate component in this revised structure, logic is inlined.

interface UserProfileData { // Duplicated from AppLayout for now
    subscriptionTier: 'spark' | 'ignition' | 'hellfire' | 'burstdrive' | null;
    // Add other fields if useAuth's userProfile needs them here
}

    