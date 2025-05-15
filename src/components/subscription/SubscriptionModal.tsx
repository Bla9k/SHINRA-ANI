// src/components/subscription/SubscriptionModal.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    // DialogFooter, // Keep commented if not used per user's last request
    DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader as TierCardHeader, CardTitle as TierCardTitleOriginal, CardDescription as TierCardDescription } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2, Sparkles, Flame, Zap, Rocket } from 'lucide-react'; // Ensured all icons are imported
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { UserProfileData } from '@/services/profile';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import anime from 'animejs';
import { ScrollArea } from '@/components/ui/scroll-area';

const TierCardTitle = TierCardTitleOriginal;

interface TierFeature {
    text: string;
    included: boolean;
}

export interface Tier {
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

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTier: UserProfileData['subscriptionTier'] | null;
    onSelectTier: (tierId: Exclude<UserProfileData['subscriptionTier'], null>) => Promise<void>; // Prop to handle tier selection
    TIER_DATA: Tier[];
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, currentTier, onSelectTier, TIER_DATA }) => {
    const [isLoading, setIsLoading] = useState(false);
    // const [animatingTierId, setAnimatingTierId] = useState<string | null>(null); // Keep for button loading state
    const [isAnimeJsLoaded, setIsAnimeJsLoaded] = useState(false);
    const { user } = useAuth(); // For checking login status
    const { toast } = useToast();
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);


    useEffect(() => {
        cardRefs.current = cardRefs.current.slice(0, TIER_DATA.length);
    }, [TIER_DATA.length]);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.anime) {
            setIsAnimeJsLoaded(true);
        } else {
            // Fallback if animejs is loaded later
            const intervalId = setInterval(() => {
                if (typeof window !== 'undefined' && window.anime) {
                    setIsAnimeJsLoaded(true);
                    clearInterval(intervalId);
                }
            }, 100);
            return () => clearInterval(intervalId);
        }
    }, []);


    const handleTierSelection = async (tierId: Exclude<UserProfileData['subscriptionTier'], null>) => {
        if (!user) {
            toast({ title: "Not Logged In", description: "Please log in to select a tier.", variant: "destructive" });
            return;
        }
        if (!tierId) {
            toast({ title: "Invalid Tier", description: "An invalid tier was selected.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        // setAnimatingTierId(tierId); // Keep for button loading visual

        console.log(`[SubscriptionModal] User selected tier: ${tierId}. Bypassing animation and backend for this test.`);

        // Directly call onSelectTier and let AppLayout handle toast & close
        try {
            await onSelectTier(tierId); // This will be handled in AppLayout
        } catch (error) {
            // Error handling for onSelectTier (e.g., if AppLayout's version throws)
            console.error("Error in onSelectTier callback:", error);
            toast({
                title: "Selection Error",
                description: "Could not process your tier selection.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
            // setAnimatingTierId(null);
        }
    };


    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isLoading) onClose(); }}>
            <DialogContent
                className="glass-deep sm:max-w-4xl max-h-[90vh] flex flex-col p-0 shadow-2xl border-accent/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 overflow-hidden"
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col h-full overflow-hidden"
                >
                    <DialogHeader className="p-6 pb-4 border-b border-border/30 flex-shrink-0 bg-card/80 backdrop-blur-md z-10 sticky top-0">
                        <DialogTitle className="text-2xl font-bold text-accent text-center fiery-glow-text">Choose Your Power Level</DialogTitle>
                        <DialogDescription className="text-center text-muted-foreground">
                            Unlock features and support Shinra-Ani. All tiers are currently free during beta!
                        </DialogDescription>
                         {/* Explicit Close Button in Header */}
                        <DialogClose asChild>
                            <Button variant="ghost" size="icon" className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
                                <XCircle className="h-5 w-5" />
                                <span className="sr-only">Close</span>
                            </Button>
                        </DialogClose>
                    </DialogHeader>

                    <div className="flex-grow overflow-y-auto scrollbar-thin p-6 min-h-0">
                        <div className="grid grid-cols-4 gap-4"> {/* Always 4 columns */}
                            {TIER_DATA.map((tier, index) => (
                                <Card
                                    key={tier.id || `tier-${index}`}
                                    ref={el => cardRefs.current[index] = el}
                                    className={cn(
                                        "glass flex flex-col transition-all duration-300 transform-gpu h-full rounded-lg border",
                                        tier.id === currentTier ? "border-2 border-primary neon-glow ring-2 ring-primary/50" : "border-border/30 hover:border-accent/70",
                                        tier.isPopular && tier.id !== currentTier ? "border-accent fiery-glow ring-1 ring-accent/70" : "",
                                        // Remove animatingTierId specific class for now to simplify
                                        // animatingTierId === tier.id && "ring-2 ring-offset-2 ring-offset-background ring-primary/70 shadow-2xl scale-105"
                                    )}
                                >
                                    <TierCardHeader className="items-center text-center p-4 border-b border-border/30 flex-shrink-0">
                                        <tier.icon className={cn("w-8 h-8 sm:w-10 sm:h-10 mb-2 mx-auto", tier.tierColorClass, tier.iconGlowClass)} />
                                        <TierCardTitle className={cn("text-base sm:text-lg font-semibold", tier.id === currentTier ? "text-primary" : tier.isPopular ? "text-accent" : "text-foreground")}>{tier.name}</TierCardTitle>
                                        <TierCardDescription className="text-xs text-muted-foreground h-8 line-clamp-2">{tier.slogan}</TierCardDescription>
                                    </TierCardHeader>
                                    <CardContent className="p-3 sm:p-4 flex-grow">
                                        <ul className="space-y-1.5 sm:space-y-2 text-xs">
                                            {tier.features.map((feature, featureIndex) => (
                                                <li key={featureIndex} className="flex items-start gap-1.5 sm:gap-2">
                                                    {feature.included ? (
                                                        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                                                    ) : (
                                                        <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                                                    )}
                                                    <span className={cn("text-foreground/90",!feature.included ? "text-muted-foreground/60 line-through" : "")}>{feature.text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <div className="p-3 sm:p-4 border-t border-border/30 mt-auto flex-shrink-0"> {/* Changed DialogFooter to div */}
                                        <Button
                                            className={cn(
                                                "w-full text-xs sm:text-sm",
                                                tier.id === currentTier
                                                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                                                    : "bg-accent/80 hover:bg-accent text-accent-foreground fiery-glow-hover"
                                            )}
                                            onClick={() => tier.id && handleTierSelection(tier.id as Exclude<UserProfileData['subscriptionTier'], null>)}
                                            disabled={isLoading || !isAnimeJsLoaded || tier.id === currentTier || !tier.id}
                                        >
                                            {(isLoading && tier.id === null /* Keep spinner logic simple if needed */) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {tier.id === currentTier ? 'Current Tier' : tier.buttonText}
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                    {/* Removed the overall DialogFooter per previous request */}
                </motion.div>
            </DialogContent>
        </Dialog>
    );
};

export default SubscriptionModal;
