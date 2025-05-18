// src/components/layout/AppLayout.tsx
'use client';

import React, { useState, type ReactNode, useCallback, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from "next-themes";
import TopBar from './TopBar';
import BottomNavigationBar, { type NavSection } from './BottomNavigationBar'; // Will be refactored
import CustomizeModal from './CustomizeModal';
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
import { Button } from '@/components/ui/button';
import {
  Home as HomeIcon, Search as SearchIconLucide, Users as UsersIcon,
  User as UserIconLucide, Settings as SettingsIconOriginal, Tv, BookText, Moon, Sun,
  Palette, Flame, Zap, Rocket, Star, ShieldCheck, Gift, Menu as MenuIcon,
  LogOut, PlusCircle, Sparkles, MessageCircle, X // Added X for the new menu button
} from 'lucide-react';
import anime from 'animejs';

// TIER_DATA_RAW definition - ensure all icons used here are imported
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

  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const { playAnimation } = useAnimation();
  const { user, userProfile, loading: authLoading, fetchUserProfile, signOutUser } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const appContainerRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);


  const handleLogout = async () => {
    try {
      await signOutUser();
      toast({
         title: "Logged Out",
         description: "You have been successfully logged out.",
         variant: "default",
      });
      router.push('/login');
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
     if (userProfile && userProfile.subscriptionTier !== 'ignition' && userProfile.subscriptionTier !== 'hellfire' && userProfile.subscriptionTier !== 'burstdrive') {
      toast({ title: "Upgrade Required", description: "Creating communities requires at least the Ignition tier.", variant: "default" });
      setShowSubscriptionModal(true);
      return;
    }
    setIsCreateCommunityModalOpen(true);
  }, [user, userProfile, toast]);

  const TIER_DATA = TIER_DATA_RAW.map(t => ({...t, isCurrent: userProfile?.subscriptionTier === t.id}));

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
          if (!sessionStorage.getItem('hasSeenSubModalOnceThisSession')) {
            appLaunchCount = 1;
            try { sessionStorage.setItem('hasSeenSubModalOnceThisSession', 'true'); } catch {}
          }
        }
        if (appLaunchCount === 1 || (appLaunchCount > 1 && (appLaunchCount -1) % 5 === 0)) {
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
        anime.remove(appContainerRef.current);
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
    const currentTierDetails = TIER_DATA_RAW.find(t => t.id === tierId);
    const tierName = currentTierDetails?.name || 'your new tier';

    try {
      await updateUserProfileDocument(user.uid, { subscriptionTier: tierId });
      if (fetchUserProfile) {
        await fetchUserProfile(user.uid);
      }
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

  // State variables for the new central menu
  const [isMenuPanelOpen, setIsMenuPanelOpen] = useState(false);
  const mainContentPaddingBottom = theme === 'hypercharge-netflix' ? 'pb-8' : (isMenuPanelOpen ? 'pb-20' : 'pb-20'); // Adjust if panel overlays

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
                isAiSearchActive={isAiSearchActive} // Pass this if TopBar uses it
                onAiToggle={() => setIsAiSearchActive(prev => !prev)} // Pass handler
                onOpenSubscriptionModal={handleOpenSubscriptionModal}
                onOpenCreateCommunityModal={handleOpenCreateCommunityModal}
                handleLogout={handleLogout}
             />
            <div className={cn("flex-1 overflow-y-auto scrollbar-thin", mainContentPaddingBottom)} ref={mainContentRef}>
              <motion.main
                key={pathname}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 15 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="transition-smooth"
              >
                {children}
              </motion.main>
            </div>

            {theme !== 'hypercharge-netflix' && (
              <BottomNavigationBar
                onSearchIconClick={handleSearchToggle}
                onOpenSubscriptionModal={handleOpenSubscriptionModal}
                onOpenCreateCommunityModal={handleOpenCreateCommunityModal}
                handleLogout={handleLogout}
                isMenuPanelOpen={isMenuPanelOpen}
                setIsMenuPanelOpen={setIsMenuPanelOpen}
              />
            )}

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
                TIER_DATA={TIER_DATA}
                isLoading={isLoadingTier}
            />
            <CreateCommunityModal
                isOpen={isCreateCommunityModalOpen}
                onClose={() => setIsCreateCommunityModalOpen(false)}
                onCreate={(newCommunity) => {
                    setIsCreateCommunityModalOpen(false);
                    router.push(`/community/${newCommunity.id}`);
                }}
            />
            {/* CustomizeModal is likely opened from within the new BottomNavigationBar's panel */}
            <Toaster />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
