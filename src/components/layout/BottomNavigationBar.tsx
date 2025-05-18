
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
  type LucideIcon,
  MessageCircle,
  ExternalLink,
  Package,
  List,
  HelpCircle,
  RefreshCw,
  Combine,
  Info,
  Trophy,
  ImageIcon,
  Camera,
  XCircle
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
import type { UserProfileData } from '@/services/profile'; // For checking subscriptionTier

const DOUBLE_CLICK_THRESHOLD = 300;

export interface NavSubItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  action?: () => void;
  disabled?: boolean;
  title?: string;
  requiresTier?: UserProfileData['subscriptionTier'][];
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
  navSections: NavSection[];
  onSearchIconClick: () => void;
  onOpenSubscriptionModal: () => void;
  onOpenCreateCommunityModal: () => void;
  handleLogout: () => void;
  theme?: string;
  setTheme: (theme: string) => void;
}

export default function BottomNavigationBar({
  className,
  navSections,
  onSearchIconClick,
  onOpenSubscriptionModal,
  onOpenCreateCommunityModal,
  handleLogout,
  theme,
  setTheme,
}: BottomNavigationBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { toast } = useToast();

  const [isMenuPanelOpen, setIsMenuPanelOpen] = useState(false);
  const [expandedSubMenuId, setExpandedSubMenuId] = useState<string | null>(null);

  const menuPanelRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastClickTimestampRef = useRef<Map<string, number>>(new Map());

  const closePanel = useCallback(() => {
    setIsMenuPanelOpen(false);
    setExpandedSubMenuId(null);
  }, []);

  const handleMainIconClickInternal = (section: NavSection, event: React.MouseEvent<HTMLButtonElement>) => {
    const iconElement = event.currentTarget.querySelector('svg');
    if (iconElement && typeof anime !== 'undefined') {
      anime.remove(iconElement);
      anime({
        targets: iconElement,
        scale: [1, 1.3, 1],
        duration: 300,
        easing: 'easeOutElastic(1, .6)',
      });
    }

    if (section.isDirectAction && section.directAction) {
      section.directAction();
      closePanel(); // Close panel if it was a direct action from a sub-menu context
      return;
    }

    const now = Date.now();
    const lastClick = lastClickTimestampRef.current.get(section.id) || 0;

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    if (section.mainHref && (now - lastClick < DOUBLE_CLICK_THRESHOLD)) {
      // Double click
      lastClickTimestampRef.current.delete(section.id); // Reset for next interaction
      router.push(section.mainHref);
      closePanel();
    } else {
      // Single click
      lastClickTimestampRef.current.set(section.id, now);
      clickTimeoutRef.current = setTimeout(() => {
        if (section.subItems && section.subItems.length > 0) {
          setExpandedSubMenuId(prev => prev === section.id ? null : section.id);
          if (!isMenuPanelOpen) setIsMenuPanelOpen(true); // Open panel if expanding a section
        } else if (section.mainHref) {
          // This part might be redundant if double click handles direct navigation.
          // If single click on items without submenus should navigate, then keep it.
          // For now, let's assume single click on mainHref items (like Home, Anime) opens panel or does nothing if no subitems.
          // If we want single click to navigate for items like Home, Anime, etc., when no panel is open:
          // if (!isMenuPanelOpen) { router.push(section.mainHref); } else { setIsMenuPanelOpen(true); setExpandedSectionId(section.id); }
          setIsMenuPanelOpen(true);
          setExpandedSubMenuId(section.id);
        } else {
          // If no mainHref and no subItems, it's likely a placeholder or non-interactive header
          // For now, just open the panel with this section active if it has a label
           if (section.label) {
             setIsMenuPanelOpen(true);
             setExpandedSectionId(section.id);
           }
        }
        lastClickTimestampRef.current.delete(section.id); // Clear timestamp after timeout
      }, DOUBLE_CLICK_THRESHOLD);
    }
  };


  const handleTriggerButtonClick = () => {
    setIsMenuPanelOpen(prev => !prev);
    if (isMenuPanelOpen) {
      setExpandedSubMenuId(null); // Reset expanded section when closing with main trigger
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
      document.body.style.overflow = 'hidden'; // Prevent background scroll
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

  const activeSectionDetails = isMenuPanelOpen && expandedSubMenuId ? navSections.find(s => s.id === expandedSubMenuId) : null;


  if (theme === 'hypercharge-netflix') {
    return null;
  }

  return (
    <>
      {/* Main Navigation Bar */}
      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-40 h-16 border-t bg-background/80 shadow-top-md backdrop-blur-md md:h-auto md:relative md:bottom-auto md:left-auto md:right-auto md:border-none md:bg-transparent md:shadow-none md:backdrop-blur-none",
          "md:flex md:items-center md:justify-center md:py-2", // Desktop: Centered icons
          "flex items-center justify-around px-2", // Mobile: Spread out icons
          isMenuPanelOpen && "opacity-0 pointer-events-none", // Hide when panel is open
          className
        )}
      >
        {navSections
          .filter(section => !section.subItems || section.isDirectAction) // Filter for main display items
          .slice(0, 5) // Max 5 main icons
          .map((section) => {
            const Icon = section.icon;
            const isLinkActive = section.mainHref ? (pathname === section.mainHref || (section.mainHref !== '/' && pathname.startsWith(section.mainHref))) : false;

            const commonClasses = cn(
              "flex flex-col items-center justify-center p-2 rounded-lg h-full text-xs w-16 transition-colors duration-200",
              "md:flex-row md:gap-2 md:px-3 md:py-1.5 md:w-auto", // Desktop specific
              "nav-item-base" // Base class for theme-specific hover/active states
            );

            const interactionClasses = cn(
              isLinkActive ? "active-nav-item text-primary" : "text-muted-foreground hover:text-primary",
              theme === 'shinra-fire' && (isLinkActive ? 'sf-text-glow' : 'hover:sf-bansho-button')
            );
            
            return (
              <TooltipProvider key={section.id} delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      ref={section.id === 'menu-trigger' ? triggerButtonRef : null}
                      variant="ghost"
                      className={cn(commonClasses, interactionClasses)}
                      onClick={(e) => {
                        if (section.id === 'menu-trigger') {
                          handleTriggerButtonClick();
                        } else {
                           handleMainIconClickInternal(section, e);
                        }
                      }}
                      aria-label={section.label}
                    >
                      <Icon size={20} className={cn("mb-0.5 md:mb-0", isLinkActive && (theme !== 'shinra-fire' ? 'text-primary' : 'sf-text-glow'))} />
                      <span className="md:inline hidden">{section.label}</span>
                      <span className="md:hidden text-[10px] leading-tight mt-0.5">{section.label.split(' ')[0]}</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs glass-deep hidden md:block">
                    <p>{section.label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
           {/* Central Menu Trigger Button (replaces one of the icons or is separate) */}
           <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  ref={triggerButtonRef}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-12 w-12 rounded-full shadow-md flex items-center justify-center transition-all duration-300 ease-in-out",
                    "md:hidden", // Only show on mobile where central trigger makes more sense
                    "bg-primary/20 hover:bg-primary/30 text-primary",
                     theme === 'shinra-fire' && 'sf-bansho-button',
                     isMenuPanelOpen && "rotate-45 bg-destructive/90 text-destructive-foreground hover:bg-destructive"
                  )}
                  onClick={handleTriggerButtonClick}
                  aria-expanded={isMenuPanelOpen}
                  aria-label={isMenuPanelOpen ? "Close Menu" : "Open Menu"}
                >
                   {isMenuPanelOpen ? <X size={24} /> : <MenuIcon size={24} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs glass-deep">
                <p>{isMenuPanelOpen ? "Close Menu" : "Open Menu"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
      </nav>

      {/* Sliding/Expanding Panel */}
      <AnimatePresence>
        {isMenuPanelOpen && (
          <motion.div
            key="menu-panel-backdrop"
            className="fixed inset-0 z-30 flex items-end justify-center bg-black/50 backdrop-blur-sm md:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            onClick={closePanel}
          >
            <motion.div
              ref={menuPanelRef}
              key="menu-panel-content"
              className={cn(
                "glass-deep w-full shadow-2xl border-t md:border border-primary/30 overflow-hidden",
                "md:max-w-sm md:rounded-xl", // Desktop: smaller, centered card
                "flex flex-col max-h-[70vh] sm:max-h-[60vh] md:max-h-[75vh]" // Responsive max height
              )}
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%", transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 flex items-center justify-between border-b border-border/50 flex-shrink-0 bg-card/50 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-primary">
                  {activeSectionDetails ? activeSectionDetails.label : "Navigation"}
                </h3>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground h-8 w-8" onClick={closePanel}>
                  <X size={20} />
                  <span className="sr-only">Close panel</span>
                </Button>
              </div>

              <ScrollArea className="flex-1 min-h-0"> {/* This makes the content area scrollable */}
                <div className="p-3 sm:p-4 space-y-1.5">
                  {(activeSectionDetails?.subItems || navSections.filter(s => s.id !== 'search-action')).map((itemOrSection) => {
                    // If it's a main section to be displayed as a header for sub-items
                    if (itemOrSection.subItems && itemOrSection.id === expandedSubMenuId) {
                        const SectionIcon = itemOrSection.icon;
                        return (
                            <div key={itemOrSection.id}>
                                {/* Main section header (already rendered, or re-render if needed for context) */}
                                {/* <div className="flex items-center gap-3 px-1 py-2 text-sm font-medium text-muted-foreground">
                                    <SectionIcon size={18} />
                                    {itemOrSection.label}
                                </div> */}
                                <motion.div
                                    key={`${itemOrSection.id}-submenu-content`}
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                                    className="overflow-hidden pl-3 mt-1"
                                >
                                    <div className="py-1 space-y-1 border-l border-border/50 pl-3">
                                        {itemOrSection.subItems.map(subItem => {
                                            const SubIcon = subItem.icon;
                                            const isSubItemActive = subItem.href ? (pathname === subItem.href || (subItem.href !== '/' && pathname.startsWith(subItem.href))) : false;
                                            
                                            const canAccessSubItem = (!subItem.requiresTier || (userProfile && subItem.requiresTier.includes(userProfile.subscriptionTier)));

                                            if (subItem.href) {
                                                return (
                                                    <Link key={subItem.id} href={subItem.href} passHref legacyBehavior>
                                                        <a
                                                            className={cn(
                                                                "w-full justify-start text-sm h-auto py-2 px-3 flex items-center gap-3 rounded-md transition-colors",
                                                                "text-muted-foreground hover:text-primary hover:bg-primary/10",
                                                                isSubItemActive && "bg-primary/15 text-primary font-medium"
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
                                                        "w-full justify-start text-sm h-auto py-2 px-3 flex items-center gap-3",
                                                        "text-muted-foreground hover:text-primary hover:bg-primary/10",
                                                        subItem.disabled && "opacity-50 cursor-not-allowed",
                                                        !canAccessSubItem && "opacity-50 cursor-not-allowed line-through"
                                                    )}
                                                    onClick={() => {
                                                        if (!canAccessSubItem) {
                                                            toast({title: "Tier Requirement", description: `Upgrade to access ${subItem.label}.`});
                                                            onOpenSubscriptionModal();
                                                            return;
                                                        }
                                                        if (subItem.action) subItem.action();
                                                        closePanel();
                                                    }}
                                                    disabled={subItem.disabled || !canAccessSubItem}
                                                    title={!canAccessSubItem ? `Requires higher tier` : subItem.title}
                                                >
                                                    <SubIcon size={16} />
                                                    {subItem.label}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            </div>
                        );
                    } else if (!itemOrSection.subItems && itemOrSection.id !== expandedSubMenuId && (!activeSectionDetails || itemOrSection.id !== activeSectionDetails.id)) {
                       // Render main items if no section is expanded OR if this item is not the expanded one
                        const ItemIcon = itemOrSection.icon;
                        const isItemLinkActive = itemOrSection.mainHref ? (pathname === itemOrSection.mainHref || (itemOrSection.mainHref !== '/' && pathname.startsWith(itemOrSection.mainHref))) : false;
                        const canAccessItem = (!itemOrSection.requiresTier || (userProfile && itemOrSection.requiresTier.includes(userProfile.subscriptionTier)));

                        if (itemOrSection.isDirectAction) {
                           return (
                             <Button
                                key={itemOrSection.id}
                                variant="ghost"
                                className={cn(
                                  "w-full justify-start text-sm h-auto py-2.5 px-3 flex items-center gap-3",
                                  "text-foreground hover:text-primary hover:bg-primary/10",
                                  theme === 'shinra-fire' && 'hover:sf-bansho-button',
                                   !canAccessItem && "opacity-50 cursor-not-allowed line-through"
                                )}
                                onClick={(e) => {
                                  if (!canAccessItem) {
                                    toast({title: "Tier Requirement", description: `Upgrade to access ${itemOrSection.label}.`});
                                    onOpenSubscriptionModal();
                                    return;
                                  }
                                  if (itemOrSection.directAction) itemOrSection.directAction();
                                  closePanel();
                                }}
                                disabled={!canAccessItem}
                                title={!canAccessItem ? `Requires higher tier` : itemOrSection.label}
                              >
                                <ItemIcon size={18} className="text-primary/90" />
                                {itemOrSection.label}
                              </Button>
                           );
                        }
                        return (
                           <Link key={itemOrSection.id} href={itemOrSection.mainHref || '#'} passHref legacyBehavior>
                             <a
                               className={cn(
                                 "w-full justify-start text-sm h-auto py-2.5 px-3 flex items-center gap-3 rounded-md transition-colors",
                                 "text-foreground hover:text-primary hover:bg-primary/10",
                                 isItemLinkActive && "bg-primary/15 text-primary font-medium",
                                  !canAccessItem && "opacity-50 cursor-not-allowed line-through pointer-events-none"
                               )}
                               onClick={(e) => {
                                 if(!canAccessItem) {
                                    e.preventDefault();
                                    toast({title: "Tier Requirement", description: `Upgrade to access ${itemOrSection.label}.`});
                                    onOpenSubscriptionModal();
                                    return;
                                 }
                                 closePanel();
                               }}
                               title={!canAccessItem ? `Requires higher tier` : itemOrSection.label}
                             >
                               <ItemIcon size={18} className="text-primary/90" />
                               {itemOrSection.label}
                             </a>
                           </Link>
                        );
                    }
                    return null;
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

// Helper type for UserProfileData if needed by BottomNav directly
interface UserProfileData {
    subscriptionTier: 'spark' | 'ignition' | 'hellfire' | 'burstdrive' | null;
}
