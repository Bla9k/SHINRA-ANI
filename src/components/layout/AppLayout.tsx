
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
import SubscriptionModal from '@/components/subscription/SubscriptionModal'; // Import SubscriptionModal
import { useAuth } from '@/hooks/useAuth'; // Import useAuth to get user profile
import { UserProfileData, updateUserSubscriptionTier } from '@/services/profile.ts'; // Import profile types and update function
import { useToast } from '@/hooks/use-toast'; // Import useToast for notifications

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
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false); // State for subscription modal

  const pathname = usePathname();
  const { playAnimation } = useAnimation();
  const { user, userProfile, loading: authLoading, fetchUserProfile } = useAuth(); // Get userProfile and fetchUserProfile
  const { toast } = useToast();
  const mainContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Logic to show subscription modal on startup
    if (user && userProfile && !authLoading) {
      if (userProfile.subscriptionTier === null) {
        const appLaunchCount = parseInt(localStorage.getItem('appLaunchCount') || '0', 10) + 1;
        localStorage.setItem('appLaunchCount', appLaunchCount.toString());
        // Show modal on 1st launch, then every 5th launch (for testing, adjust 5 to 31 for production)
        if (appLaunchCount === 1 || (appLaunchCount > 1 && (appLaunchCount -1) % 5 === 0)) {
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
      if (mainContentRef.current) {
        playAnimation(mainContentRef.current, {
          opacity: [0, 1],
          translateY: [10, 0],
          duration: 500,
          easing: 'easeOutQuad',
        });
      }
    }, 100); // Short delay for smoother transition
  }, [playAnimation]);

  const handleSearchToggle = useCallback((term: string = '') => {
    setInitialSearchTerm(term);
    setIsSearchOpen((prev) => !prev);
    if (!isSearchOpen && isAiSearchActive) {
      // Keep AI active if it was already
    } else {
      setIsAiSearchActive(false); // Default to standard search
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
    playAnimation('.ai-toggle-button-bottom-nav', { scale: [1, 1.2, 1], duration: 300, easing: 'easeInOutQuad' });
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

  const handleSelectTier = async (tierId: string) => {
    if (user?.uid) {
      try {
        await updateUserSubscriptionTier(user.uid, tierId as UserProfileData['subscriptionTier']);
        toast({
          title: "Subscription Updated!",
          description: `You've selected the ${tierId.charAt(0).toUpperCase() + tierId.slice(1)} Tier.`,
          variant: "default",
        });
        setShowSubscriptionModal(false);
        await fetchUserProfile(user.uid); // Refetch profile to update local state
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
      <div
        ref={mainContentRef}
        className={cn(
          "flex flex-col min-h-screen h-screen overflow-hidden relative bg-background text-foreground",
          showApp ? "opacity-100" : "opacity-0" // Control visibility for fade-in
        )}
        style={{ transition: 'opacity 0.5s ease-in-out' }}
      >
        <TopBar
          onSearchIconClick={() => handleSearchToggle()}
          onSearchSubmit={handleOpenSearchWithTerm}
          onAiToggle={handleAiToggleInternal} // AI toggle inside search popup is handled there
          isAiSearchActive={isAiSearchActive} // This might be for a top-level indicator if any
          onOpenAiSearch={handleOpenAiSearch}
          onOpenAdvancedSearch={handleOpenAdvancedSearch}
        />
        <div className="flex-1 overflow-y-auto pb-20 scrollbar-thin">
          {/* AnimatePresence can be used here if page transitions are complex */}
          <main className="transition-smooth">
            {children}
          </main>
        </div>

        <BottomNavigationBar
            onSearchIconClick={handleSearchToggle} // Opens search popup
            // Nami AI toggle is now inside SearchPopup
            onOpenSubscriptionModal={handleOpenSubscriptionModal} // Pass handler to open modal
        />

        <SearchPopup
          isOpen={isSearchOpen}
          onClose={handleCloseSearch}
          isAiActive={isAiSearchActive}
          initialSearchTerm={initialSearchTerm}
          onAiToggle={handleAiToggleInternal} // Let SearchPopup manage its internal AI toggle
          openWithFilters={openWithFilters}
        />
        <SubscriptionModal
            isOpen={showSubscriptionModal}
            onClose={() => setShowSubscriptionModal(false)}
            currentTier={userProfile?.subscriptionTier || null}
            onSelectTier={handleSelectTier}
        />
        <Toaster />
      </div>
    </>
  );
}
