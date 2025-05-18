
// src/components/layout/AppLayout.tsx
'use client';

import React, { useState, type ReactNode, useCallback, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from "next-themes";
import TopBar from './TopBar';
// import BottomNavigationBar from './BottomNavigationBar'; // Commented out - RadialMenu is primary
import RadialMenu from './RadialMenu'; // Import RadialMenu
import CustomizeModal from './CustomizeModal'; // Import CustomizeModal
import SearchPopup from '@/components/search/SearchPopup';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { useAnimation } from '@/context/AnimationContext';
import BootAnimation from './BootAnimation';
import SubscriptionModal, { type Tier } from '@/components/subscription/SubscriptionModal';
import CreateCommunityModal from '@/components/community/CreateCommunityModal';
import { useAuth } from '@/hooks/useAuth';
import { UserProfileData, updateUserProfileDocument } from '@/services/profile';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, X, Home, Search as SearchIconOriginal, Users, User as UserIconOriginal, Settings as SettingsIconOriginal, Tv, BookText, Moon, Sun, Palette, Flame, Zap, Rocket, Star, ShieldCheck, Gift } from 'lucide-react';
import anime from 'animejs';

// Moved TIER_DATA_RAW here as it's used by AppLayout for SubscriptionModal prop
const TIER_DATA_RAW: Omit<Tier, 'isCurrent'>[] = [
    {
        id: 'spark',
        name: 'Spark Tier',
        slogan: 'You’re just lighting the fuse.',
        icon: Sparkles,
        features: [
            { text: 'Basic browsing of anime & manga', included: true },
            { text: 'Limited search results (e.g., top 10)', included: true },
            { text: 'Read/Watch 3 indie items/day', included: true },
            { text: 'Join up to 2 communities', included: true },
            { text: 'Standard Nami AI search', included: true },
        ],
        buttonText: 'Select Spark',
        tierColorClass: 'text-primary',
        iconGlowClass: 'neon-glow-icon',
    },
    {
        id: 'ignition',
        name: 'Ignition Tier',
        slogan: 'First burst of power.',
        icon: Flame,
        features: [
            { text: 'All Spark features', included: true },
            { text: 'Unlimited search results', included: true },
            { text: 'Read/Watch 10 indie items/day', included: true },
            { text: 'Join up to 10 communities', included: true },
            { text: 'Post in communities', included: true },
            { text: 'Basic profile customization', included: true },
            { text: 'Create 1 community', included: true },
        ],
        buttonText: 'Select Ignition',
        isPopular: true,
        tierColorClass: 'text-accent',
        iconGlowClass: 'fiery-glow-icon',
    },
    {
        id: 'hellfire',
        name: 'Hellfire Tier',
        slogan: 'Shinra-style blazing speed.',
        icon: Zap,
        features: [
            { text: 'All Ignition features', included: true },
            { text: 'Unlimited indie reading/watching', included: true },
            { text: 'Join unlimited communities', included: true },
            { text: 'Advanced Nami AI features', included: true },
            { text: 'Full profile customization (banner, themes)', included: true },
            { text: 'Create up to 3 communities', included: true },
            { text: 'Ad-free experience (conceptual)', included: true },
        ],
        buttonText: 'Select Hellfire',
        tierColorClass: 'text-accent',
        iconGlowClass: 'fiery-glow-icon',
    },
    {
        id: 'burstdrive',
        name: 'Burst Drive Tier',
        slogan: 'Power, speed, hero-level impact.',
        icon: Rocket,
        features: [
            { text: 'All Hellfire features', included: true },
            { text: 'Exclusive profile badges & themes', included: true },
            { text: 'Early access to new features', included: true },
            { text: 'Priority Nami AI requests', included: true },
            { text: 'Create unlimited communities', included: true },
            { text: 'Increased indie upload limits', included: true },
        ],
        buttonText: 'Select Burst Drive',
        tierColorClass: 'text-accent',
        iconGlowClass: 'fiery-glow-icon',
    },
];

// Define NavSection and NavSubItem types here or import from a shared types file
export interface NavSubItem {
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
  isToggleButton?: boolean;
}


interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isBooting, setIsBooting] = useState(true);
  const [showApp, setShowApp] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAiSearchActive, setIsAiSearchActive] = useState(false);
  const [initialSearchTerm, setInitialSearchTerm] = useState('');
  const [openWithFilters, setOpenWithFilters] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isCreateCommunityModalOpen, setIsCreateCommunityModalOpen] = useState(false);
  const [isLoadingTier, setIsLoadingTier] = useState(false);

  const [isRadialMenuOpen, setIsRadialMenuOpen] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);


  const pathname = usePathname();
  const router = useRouter();
  const { playAnimation } = useAnimation();
  const { user, userProfile, loading: authLoading, fetchUserProfile, signOutUser } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const appContainerRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await signOutUser();
      toast({
         title: "Logged Out",
         description: "You have been successfully logged out.",
         variant: "default",
      });
      router.push('/login'); // Redirect to login after logout
    } catch (error) {
      console.error("Logout failed in AppLayout:", error);
      toast({
         title: "Logout Failed",
         description: "Could not log you out. Please try again.",
         variant: "destructive",
      });
    }
  };

  const handleOpenCreateCommunityModal = useCallback(() => {
    if (!user) {
        toast({ title: "Login Required", description: "Please log in to create a community.", variant: "destructive" });
        return;
    }
    setIsCreateCommunityModalOpen(true);
  }, [user, toast]);

  // Define navSections here now
  const navSections: NavSection[] = [
    { id: 'home', label: 'Home', icon: HomeIcon, mainHref: '/' },
    { id: 'anime', label: 'Anime', icon: Tv, mainHref: '/anime' },
    { id: 'manga', label: 'Manga', icon: BookText, mainHref: '/manga' },
    { id: 'search', label: 'Search', icon: SearchIconOriginal, isDirectAction: true, directAction: () => setIsSearchOpen(true) },
    { id: 'community', label: 'Community', icon: UsersIcon, mainHref: '/community' },
    { id: 'gacha', label: 'Gacha', icon: Gift, mainHref: '/gacha'},
    { id: 'system', label: 'System', icon: ShieldCheck, mainHref: '/system' },
    { id: 'profile', label: 'Profile', icon: UserIconOriginal, mainHref: '/profile' },
    {
      id: 'customize',
      label: 'Customize',
      icon: Palette,
      isDirectAction: true, // It will trigger the modal directly
      directAction: () => setIsCustomizeModalOpen(true),
    },
  ];


  useEffect(() => {
    if (!authLoading && user && userProfile) {
      if (userProfile.subscriptionTier === null) {
        let appLaunchCount = 0;
        try {
          const storedCount = localStorage.getItem('appLaunchCount');
          appLaunchCount = storedCount ? parseInt(storedCount, 10) + 1 : 1;
          localStorage.setItem('appLaunchCount', appLaunchCount.toString());
        } catch (error) {
          console.warn("Could not access localStorage for appLaunchCount:", error);
          if (!localStorage.getItem('hasSeenSubModalOnce')) {
            appLaunchCount = 1;
            localStorage.setItem('hasSeenSubModalOnce', 'true');
          }
        }
        if (appLaunchCount === 1 || (appLaunchCount > 1 && (appLaunchCount - 1) % 5 === 0)) {
          setShowSubscriptionModal(true);
        }
      }
    }
  }, [user, userProfile, authLoading]);

  const handleAnimationComplete = useCallback(() => {
    setIsBooting(false);
    setTimeout(() => {
      setShowApp(true);
      if (appContainerRef.current && playAnimation && typeof anime !== 'undefined') {
        anime.remove(appContainerRef.current); // Ensure no prior animations are running on this target
        playAnimation(appContainerRef.current, {
          opacity: [0, 1],
          translateY: [10, 0],
          duration: 500,
          easing: 'easeOutQuad',
        });
      }
    }, 100);
  }, [playAnimation]);

  const handleSearchToggle = useCallback(() => {
    setInitialSearchTerm('');
    setIsSearchOpen((prev) => !prev);
    setOpenWithFilters(false);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false);
    setInitialSearchTerm('');
    setOpenWithFilters(false);
  }, []);

  const handleOpenSubscriptionModal = useCallback(() => {
    setShowSubscriptionModal(true);
  }, []);

  const handleSelectTier = async (tierId: Exclude<UserProfileData['subscriptionTier'], null>) => {
    if (!user?.uid) {
        toast({ title: "Login Required", description: "Please log in to select a subscription tier.", variant: "destructive" });
        return;
    }
    if (!tierId) {
        toast({ title: "Error", description: "No tier was selected.", variant: "destructive" });
        return;
    }
    setIsLoadingTier(true);
    try {
      await updateUserProfileDocument(user.uid, { subscriptionTier: tierId });
      if (fetchUserProfile) {
        await fetchUserProfile(user.uid);
      }
      const selectedTierInfo = TIER_DATA_RAW.find(t => t.id === tierId);
      const tierName = selectedTierInfo?.name || 'your new tier';
      toast({
        title: `Welcome to the ${tierName}!`,
        description: "Thank you for supporting Shinra-Ani and unlocking new features!",
        variant: "default",
      });
      setShowSubscriptionModal(false);
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Could not update your subscription tier.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingTier(false);
    }
  };

  const mainContentPaddingBottom = theme === 'hypercharge-netflix' ? 'pb-8' : 'pb-16'; // Simplified

  return (
    <>
      {isBooting && <BootAnimation onAnimationComplete={handleAnimationComplete} theme={theme || 'dark'} />}
      <AnimatePresence>
        {showApp && (
          <motion.div
            ref={appContainerRef}
            key="appContent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
              "flex flex-col min-h-screen h-screen overflow-hidden relative bg-background text-foreground",
            )}
          >
            <TopBar
                onSearchIconClick={handleSearchToggle}
                onOpenSubscriptionModal={handleOpenSubscriptionModal}
                onOpenCreateCommunityModal={handleOpenCreateCommunityModal}
                onOpenCustomizeModal={() => setIsCustomizeModalOpen(true)}
                handleLogout={handleLogout}
            />
            <div className={cn("flex-1 overflow-y-auto scrollbar-thin", mainContentPaddingBottom)}>
              <main className="transition-smooth">
                {children}
              </main>
            </div>

            {/* FAB for Radial Menu - Rendered if not Netflix theme */}
            {theme !== 'hypercharge-netflix' && (
                 <Button
                    variant="default"
                    size="icon"
                    className={cn(
                        "fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-xl z-50 transition-all duration-300 ease-in-out",
                        "bg-primary/80 hover:bg-primary text-primary-foreground fiery-glow-hover",
                        isRadialMenuOpen && "rotate-45 bg-destructive/80 hover:bg-destructive"
                    )}
                    onClick={() => setIsRadialMenuOpen(!isRadialMenuOpen)}
                    aria-label={isRadialMenuOpen ? "Close Menu" : "Open Menu"}
                >
                    {isRadialMenuOpen ? <X size={28} /> : <Plus size={28} />}
                </Button>
            )}

            <RadialMenu
                isOpen={isRadialMenuOpen}
                onClose={() => setIsRadialMenuOpen(false)}
                navSections={navSections}
                router={router}
                theme={theme || 'dark'}
                openCustomizeModal={() => setIsCustomizeModalOpen(true)}
            />

            <SearchPopup
              isOpen={isSearchOpen}
              onClose={handleCloseSearch}
              isAiActive={isAiSearchActive}
              initialSearchTerm={initialSearchTerm}
              onAiToggle={() => setIsAiSearchActive(prev => !prev)}
              openWithFilters={openWithFilters}
            />
            <SubscriptionModal
                isOpen={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
                currentTier={userProfile?.subscriptionTier || null}
                onSelectTier={handleSelectTier}
                TIER_DATA={TIER_DATA_RAW.map(t => ({...t, isCurrent: userProfile?.subscriptionTier === t.id}))}
            />
            <CreateCommunityModal
                isOpen={isCreateCommunityModalOpen}
                onClose={() => setIsCreateCommunityModalOpen(false)}
                onCreate={(newCommunity) => {
                    console.log("Community created in AppLayout:", newCommunity);
                    setIsCreateCommunityModalOpen(false);
                    router.push(`/community/${newCommunity.id}`);
                }}
            />
            <CustomizeModal
                isOpen={isCustomizeModalOpen}
                onClose={() => setIsCustomizeModalOpen(false)}
                theme={theme}
                setTheme={setTheme}
                onOpenSubscriptionModal={handleOpenSubscriptionModal}
            />
            <Toaster />
          </