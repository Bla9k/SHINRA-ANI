
'use client';

import React, { useState, type ReactNode, useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import TopBar from './TopBar';
import BottomNavigationBar from './BottomNavigationBar';
import SearchPopup from '@/components/search/SearchPopup';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { useAnimation } from '@/context/AnimationContext';
import BootAnimation from './BootAnimation';
import SubscriptionModal from '@/components/subscription/SubscriptionModal';
import { useAuth } from '@/hooks/useAuth';
import { UserProfileData, updateUserSubscriptionTier } from '@/services/profile.ts';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion'; // Import AnimatePresence and motion

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

  const pathname = usePathname();
  const { playAnimation } = useAnimation();
  const { user, userProfile, loading: authLoading, fetchUserProfile } = useAuth();
  const { toast } = useToast();
  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && userProfile && !authLoading) {
      if (userProfile.subscriptionTier === null) {
        let appLaunchCount = 0;
        try {
          appLaunchCount = parseInt(localStorage.getItem('appLaunchCount') || '0', 10) + 1;
          localStorage.setItem('appLaunchCount', appLaunchCount.toString());
        } catch (error) {
          console.warn("Could not access localStorage for appLaunchCount:", error);
          // Fallback or do nothing if localStorage is not available
        }

        if (appLaunchCount > 0 && (appLaunchCount === 1 || (appLaunchCount > 1 && (appLaunchCount - 1) % 5 === 0))) {
          console.log(`App launch count: ${appLaunchCount}. Showing subscription modal.`);
          setShowSubscriptionModal(true);
        }
      }
    }
  }, [user, userProfile, authLoading]);

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

  const handleSearchToggle = useCallback((term: string = '') => {
    setInitialSearchTerm(term);
    setIsSearchOpen((prev) => !prev);
    if (!isSearchOpen && isAiSearchActive) {
      // Keep AI active
    } else {
      setIsAiSearchActive(false);
    }
    setOpenWithFilters(false);
  }, [isSearchOpen, isAiSearchActive]);

  const handleOpenSearchWithTerm = useCallback((term: string = '') => {
    setInitialSearchTerm(term);
    setIsSearchOpen(true);
    setIsAiSearchActive(false);
    setOpenWithFilters(false);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setIsSearchOpen(false);
    setInitialSearchTerm('');
    setOpenWithFilters(false);
  }, []);

  const handleAiToggleInternal = useCallback(() => {
    const newAiState = !isAiSearchActive;
    setIsAiSearchActive(newAiState);
    if (!isSearchOpen && newAiState) {
      setIsSearchOpen(true);
      setInitialSearchTerm('');
      setOpenWithFilters(false);
    }
    if (playAnimation) {
      playAnimation('.ai-toggle-button-bottom-nav', { scale: [1, 1.2, 1], duration: 300, easing: 'easeInOutQuad' });
    }
  }, [isAiSearchActive, isSearchOpen, playAnimation]);

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
      try {
        await updateUserSubscriptionTier(user.uid, tierId);
        // Find tier name for the toast
        const selectedTierInfo = TIER_DATA_RAW.find(t => t.id === tierId);
        toast({
          title: `Welcome to the ${selectedTierInfo?.name || 'new tier'}!`,
          description: "Thank you for supporting Shinra-Ani and unlocking new features!",
          variant: "default",
        });
        setShowSubscriptionModal(false);
        if (fetchUserProfile) {
          await fetchUserProfile(user.uid);
        }
      } catch (error: any) {
        toast({
          title: "Update Failed",
          description: error.message || "Could not update your subscription tier.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <>
      {isBooting && <BootAnimation onAnimationComplete={handleAnimationComplete} />}
      <AnimatePresence>
        {showApp && (
          <motion.div
            ref={mainContentRef}
            key="appContent" // Add key for AnimatePresence
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={cn(
              "flex flex-col min-h-screen h-screen overflow-hidden relative bg-background text-foreground",
            )}
          >
            <TopBar
              onSearchIconClick={() => handleSearchToggle()}
              onSearchSubmit={handleOpenSearchWithTerm}
              onAiToggle={handleAiToggleInternal}
              isAiSearchActive={isAiSearchActive}
              onOpenAiSearch={handleOpenAiSearch}
              onOpenAdvancedSearch={handleOpenAdvancedSearch}
            />
            <div className="flex-1 overflow-y-auto pb-20 scrollbar-thin">
              <main className="transition-smooth">
                {children}
              </main>
            </div>

            <BottomNavigationBar
                onSearchIconClick={handleSearchToggle}
                onOpenSubscriptionModal={handleOpenSubscriptionModal}
            />

            <SearchPopup
              isOpen={isSearchOpen}
              onClose={handleCloseSearch}
              isAiActive={isAiSearchActive}
              initialSearchTerm={initialSearchTerm}
              onAiToggle={handleAiToggleInternal}
              openWithFilters={openWithFilters}
            />
            <SubscriptionModal
                isOpen={showSubscriptionModal}
                onClose={() => setShowSubscriptionModal(false)}
                currentTier={userProfile?.subscriptionTier || null}
                onSelectTier={handleSelectTier}
            />
            <Toaster />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


// Raw tier data, can be moved to a config file if needed
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
        buttonText: 'Ignite Your Experience',
        isPopular: true,
        tierColorClass: 'text-accent',
        iconGlowClass: 'fiery-glow-icon',
    },
    {
        id: 'hellfire',
        name: 'Hellfire Tier',
        slogan: 'Shinra-style blazing speed and fury.',
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

interface Tier {
    id: UserProfileData['subscriptionTier'];
    name: string;
    slogan: string;
    icon: React.ElementType;
    features: TierFeature[];
    buttonText: string;
    isCurrent?: boolean;
    isPopular?: boolean;
    tierColorClass?: string;
    iconGlowClass?: string;
}

interface TierFeature {
    text: string;
    included: boolean;
}
