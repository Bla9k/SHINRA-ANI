
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
import BootAnimation from './BootAnimation';
import SubscriptionModal, { type Tier } from '@/components/subscription/SubscriptionModal';
import CreateCommunityModal from '@/components/community/CreateCommunityModal'; // Import CreateCommunityModal
import { useAuth } from '@/hooks/useAuth';
import { UserProfileData, updateUserSubscriptionTier } from '@/services/profile';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, Flame, Zap, Rocket, Star } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

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
        tierColorClass: 'text-accent', // Fiery
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
        tierColorClass: 'text-accent', // Fiery
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
        tierColorClass: 'text-accent', // Fiery
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
  const [isCreateCommunityModalOpen, setIsCreateCommunityModalOpen] = useState(false); // New state

  const pathname = usePathname();
  const { playAnimation } = useAnimation();
  const { user, userProfile, loading: authLoading, fetchUserProfile, signOutUser } = useAuth();
  const { toast } = useToast();
  const mainContentRef = useRef<HTMLDivElement>(null);

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
        // For testing: show every 2 launches. For production: (appLaunchCount -1) % 30 === 0
        if (appLaunchCount === 1 || (appLaunchCount > 1 && (appLaunchCount -1) % 5 === 0) ) {
          console.log(`App launch count: ${appLaunchCount}. Showing subscription modal.`);
          setShowSubscriptionModal(true);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleOpenCreateCommunityModal = useCallback(() => { // New handler
    if (!user) {
        toast({ title: "Login Required", description: "Please log in to create a community.", variant: "destructive" });
        return;
    }
    // Add tier check from userProfile if needed, e.g.,
    // if (userProfile?.subscriptionTier === 'spark') { ... }
    setIsCreateCommunityModalOpen(true);
  }, [user, toast]);

  const handleLogout = async () => {
    try {
      await signOutUser();
      toast({
         title: "Logged Out",
         description: "You have been successfully logged out.",
         variant: "default",
      });
      // Router push to /login is handled in AuthContext
    } catch (error) {
      console.error("Logout failed in AppLayout:", error);
      toast({
         title: "Logout Failed",
         description: "Could not log you out. Please try again.",
         variant: "destructive",
      });
    }
  };


  const handleSelectTier = async (tierId: Exclude<UserProfileData['subscriptionTier'], null>) => {
    if (user?.uid) {
      const selectedTierInfo = TIER_DATA_RAW.find(t => t.id === tierId);
      const tierName = selectedTierInfo?.name || 'the selected tier';
      setIsLoading(true); // You might need an isLoading state in AppLayout for this
      try {
        await updateUserSubscriptionTier(user.uid, tierId);
        if (fetchUserProfile) {
          await fetchUserProfile(user.uid); // Refetch profile to update tier locally
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
        setIsLoading(false);
      }
    } else {
        toast({
            title: "Login Required",
            description: "Please log in to select a subscription tier.",
            variant: "destructive",
        });
    }
  };
   const [isLoading, setIsLoading] = useState(false); // Add isLoading state for tier selection

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
            <TopBar onSearchIconClick={handleSearchToggle} />
            {/* Main content area should allow for bottom nav clearance */}
            <div className="flex-1 overflow-y-auto pb-16 scrollbar-thin"> {/* pb-16 for BottomNav clearance */}
              <main className="transition-smooth">
                {children}
              </main>
            </div>
            <BottomNavigationBar
                onSearchIconClick={handleSearchToggle}
                onOpenSubscriptionModal={handleOpenSubscriptionModal}
                onOpenCreateCommunityModal={handleOpenCreateCommunityModal} // Pass handler
                handleLogout={handleLogout} // Pass handler
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
            <CreateCommunityModal // Render the modal
                isOpen={isCreateCommunityModalOpen}
                onClose={() => setIsCreateCommunityModalOpen(false)}
                onCreate={(newCommunity) => {
                    console.log("Community created in AppLayout:", newCommunity);
                    // Optionally refetch communities list or update local state
                    setIsCreateCommunityModalOpen(false); // Close modal on creation
                }}
            />
            <Toaster />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
