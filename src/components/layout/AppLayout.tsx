// src/components/layout/AppLayout.tsx
'use client';

import React, { useState, type ReactNode, useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import TopBar from './TopBar';
import BottomNavigationBar from './BottomNavigationBar';
import SearchPopup from '@/components/search/SearchPopup';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { useAnimation } from '@/context/AnimationContext';
import BootAnimation from './BootAnimation'; // Import BootAnimation
import SubscriptionModal, { type Tier } from '@/components/subscription/SubscriptionModal'; // Import SubscriptionModal and Tier type
import { useAuth } from '@/hooks/useAuth';
import { UserProfileData, updateUserSubscriptionTier } from '@/services/profile';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Flame, Zap, Rocket, Star } from 'lucide-react'; // Ensured all icons are imported


interface AppLayoutProps {
  children: ReactNode;
}

// Moved TIER_DATA_RAW here to be accessible by handleSelectTier
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
            { text: 'Ad-supported (conceptual)', included: true },
        ],
        buttonText: 'Start with Spark',
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
            { text: 'Reduced ads (conceptual)', included: true },
        ],
        buttonText: 'Ignite Experience',
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
        buttonText: 'Unleash Hellfire',
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
        buttonText: 'Go Burst Drive',
        tierColorClass: 'text-accent',
        iconGlowClass: 'fiery-glow-icon',
    },
];


export default function AppLayout({ children }: AppLayoutProps) {
  const [isBooting, setIsBooting] = useState(true);
  const [showApp, setShowApp] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAiSearchActive, setIsAiSearchActive] = useState(false);
  const [initialSearchTerm, setInitialSearchTerm] = useState('');
  const [openWithFilters, setOpenWithFilters] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const pathname = usePathname();
  const { playAnimation } = useAnimation();
  const { user, userProfile, loading: authLoading, fetchUserProfile } = useAuth();
  const { toast } = useToast();
  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run modal logic if auth is not loading and we have user/profile info
    if (!authLoading && user && userProfile) {
      if (userProfile.subscriptionTier === null) {
        let appLaunchCount = 0;
        try {
          appLaunchCount = parseInt(localStorage.getItem('appLaunchCount') || '0', 10) + 1;
          localStorage.setItem('appLaunchCount', appLaunchCount.toString());
        } catch (error) {
          console.warn("Could not access localStorage for appLaunchCount:", error);
          // Fallback to showing modal on first load if localStorage fails
          if (!localStorage.getItem('hasSeenSubModalOnce')) {
            appLaunchCount = 1;
            localStorage.setItem('hasSeenSubModalOnce', 'true');
          }
        }

        if (appLaunchCount === 1 || (appLaunchCount > 1 && (appLaunchCount -1) % 5 === 0)) {
          console.log(`App launch count: ${appLaunchCount}. Showing subscription modal.`);
          setShowSubscriptionModal(true);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userProfile, authLoading]); // Rerun when auth state or profile changes


  const handleAnimationComplete = useCallback(() => {
    setIsBooting(false);
    setTimeout(() => {
      setShowApp(true);
      if (mainContentRef.current && playAnimation) {
        playAnimation(mainContentRef.current, {
          opacity: [0, 1],
          translateY: [10, 0],
          duration: 500,
          easing: 'easeOutQuad',
        });
      }
    }, 100);
  }, [playAnimation]);

  const handleSearchToggle = useCallback(() => {
    setInitialSearchTerm(''); // Clear initial term when just toggling
    setIsSearchOpen((prev) => !prev);
    // setIsAiSearchActive(false); // Keep AI state as is or reset based on preference
    setOpenWithFilters(false);
  }, []);

  const handleOpenSearchWithTerm = useCallback((term: string = '') => {
    setInitialSearchTerm(term);
    setIsSearchOpen(true);
    setIsAiSearchActive(false); // Default to standard search when opened via TopBar submit
    setOpenWithFilters(false);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false);
    setInitialSearchTerm('');
    setOpenWithFilters(false);
  }, []);

  const handleAiToggleInPopup = useCallback(() => { // Renamed to avoid confusion
    setIsAiSearchActive(prev => !prev);
    // If search isn't open when AI is toggled, it remains closed.
    // If it is open, it just switches mode.
  }, []);


  const handleOpenAiSearch = useCallback((term: string) => {
    setInitialSearchTerm(term);
    setIsAiSearchActive(true);
    setIsSearchOpen(true);
    setOpenWithFilters(false);
  }, []);

  const handleOpenAdvancedSearch = useCallback((term: string) => {
    setInitialSearchTerm(term);
    setIsAiSearchActive(false);
    setOpenWithFilters(true);
    setIsSearchOpen(true);
  }, []);

  const handleOpenSubscriptionModal = useCallback(() => {
    setShowSubscriptionModal(true);
  }, []);

  const handleSelectTier = async (tierId: Exclude<UserProfileData['subscriptionTier'], null>) => {
    if (user?.uid) {
      // const selectedTierInfo = TIER_DATA_RAW.find(t => t.id === tierId);
      // const tierName = selectedTierInfo?.name || 'the selected tier';
      // console.log(`[AppLayout] Simulating tier selection for ${tierName}. Backend update skipped.`);

      // **Temporarily comment out Firestore update for UI testing of toast and modal close**
      // try {
      //   await updateUserSubscriptionTier(user.uid, tierId);
      //   if (fetchUserProfile) {
      //     await fetchUserProfile(user.uid); // Refetch profile to update tier locally
      //   }
      // } catch (error: any) {
      //   toast({
      //     title: "Update Failed",
      //     description: error.message || "Could not update your subscription tier.",
      //     variant: "destructive",
      //   });
      //   return; // Don't show success toast or close modal if update fails
      // }

      const selectedTierInfo = TIER_DATA_RAW.find(t => t.id === tierId);
      const tierName = selectedTierInfo?.name || 'the selected tier';

      toast({
        title: `Welcome to the ${tierName}!`,
        description: "Thank you for supporting Shinra-Ani and unlocking new features!",
        variant: "default",
      });
      setShowSubscriptionModal(false);
    } else {
        toast({
            title: "Login Required",
            description: "Please log in to select a subscription tier.",
            variant: "destructive",
        });
    }
  };

  return (
    <>
      {isBooting && <BootAnimation onAnimationComplete={handleAnimationComplete} />}
      <AnimatePresence>
        {showApp && (
          <motion.div
            ref={mainContentRef}
            key="appContent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn(
              "flex flex-col min-h-screen h-screen overflow-hidden relative bg-background text-foreground",
            )}
          >
            <TopBar
              onSearchIconClick={handleSearchToggle} // For mobile search icon
              onSearchSubmit={handleOpenSearchWithTerm} // For desktop search submit
            />
            <div className="flex-1 overflow-y-auto pb-20 scrollbar-thin"> {/* Ensure pb-20 for BottomNav clearance */}
              <main className="transition-smooth">
                {children}
              </main>
            </div>
            <BottomNavigationBar
                onSearchIconClick={handleSearchToggle} // Search icon on bottom nav
                onOpenSubscriptionModal={handleOpenSubscriptionModal}
            />
            <SearchPopup
              isOpen={isSearchOpen}
              onClose={handleCloseSearch}
              isAiActive={isAiSearchActive}
              initialSearchTerm={initialSearchTerm}
              onAiToggle={handleAiToggleInPopup} // Pass the correct handler
              openWithFilters={openWithFilters}
            />
            <SubscriptionModal
                isOpen={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
                currentTier={userProfile?.subscriptionTier || null}
                onSelectTier={handleSelectTier}
                TIER_DATA={TIER_DATA_RAW.map(t => ({...t, isCurrent: userProfile?.subscriptionTier === t.id}))}
            />
            <Toaster />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
