// src/components/subscription/SubscriptionModal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    // DialogFooter, // Removed
    // DialogClose, // Removed
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader as TierCardHeader, CardTitle as TierCardTitleOriginal, CardDescription as TierCardDescription } from '@/components/ui/card';
import { Sparkles, Flame, Zap, Rocket, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { updateUserSubscriptionTier, UserProfileData } from '@/services/profile';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import anime from 'animejs';
import { ScrollArea } from '@/components/ui/scroll-area';

const TierCardTitle = TierCardTitleOriginal;

interface TierFeature {
    text: string;
    included: boolean;
}

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

// This data is also in AppLayout.tsx, consider moving to a shared config if it grows.
const TIER_DATA_RAW: Omit<Tier, 'isCurrent'>[] = [
    {
        id: 'spark',
        name: 'Spark Tier',
        slogan: 'You’re just lighting the fuse.',
        icon: Sparkles,
        features: [
            { text: 'Basic browsing of anime & manga', included: true },
            { text: 'Limited search results', included: true },
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
            { text: 'Full profile customization', included: true },
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


interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTier: UserProfileData['subscriptionTier'] | null;
    onSelectTier: (tierId: Exclude<UserProfileData['subscriptionTier'], null>) => Promise<void>;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, currentTier, onSelectTier }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [animatingTierId, setAnimatingTierId] = useState<string | null>(null);
    const { user } = useAuth();
    const { toast } = useToast();
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        cardRefs.current = cardRefs.current.slice(0, TIER_DATA_RAW.length);
     }, []);

    const TIER_DATA = TIER_DATA_RAW.map(tier => ({ ...tier, isCurrent: tier.id === currentTier }));

    const handleTierSelection = async (tierId: Exclude<UserProfileData['subscriptionTier'], null>, cardIndex: number) => {
        if (!user) {
            toast({ title: "Not Logged In", description: "Please log in to select a tier.", variant: "destructive" });
            return;
        }
        if (!tierId) {
            toast({ title: "Invalid Tier", description: "An invalid tier was selected.", variant: "destructive" });
            return;
        }

        setAnimatingTierId(tierId);
        setIsLoading(true);

        const cardElement = cardRefs.current[cardIndex];
        if (cardElement && typeof anime === 'function') {
            anime.remove(cardElement); // Remove previous animations on this target
            anime({
                targets: cardElement,
                scale: [
                    { value: 1, duration: 0 }, // Start at normal scale
                    { value: 1.03, duration: 150, easing: 'easeOutQuad' },
                    { value: 1, duration: 200, easing: 'easeInQuad' }
                ],
                // Example: Flash border color
                borderColor: [
                    { value: 'hsl(var(--primary))', duration: 150, easing: 'easeOutQuad' }, // Flash to primary
                    { value: TIER_DATA[cardIndex].isCurrent ? 'hsl(var(--primary))' : (TIER_DATA[cardIndex].isPopular ? 'hsl(var(--accent))' : 'hsl(var(--border))'), duration: 200, easing: 'easeInQuad', delay: 50 } // Return to original or popular color
                ],
                boxShadow: [ // Example: Add a temporary shadow
                    { value: '0 0 10px hsl(var(--primary) / 0.3), 0 0 20px hsl(var(--primary) / 0.2)', duration: 150, easing: 'easeOutQuad'},
                    { value: '0 0 0px transparent', duration: 200, easing: 'easeInQuad', delay: 50} // Fade out shadow
                ],
                easing: 'linear', // Main easing for the sequence
                complete: () => {
                    // Reset inline styles if needed, or rely on CSS classes
                    cardElement.style.borderColor = ''; // Reset if changed directly
                    cardElement.style.boxShadow = '';   // Reset if changed directly
                }
            });
        }
        
        // Add a slight delay to let animation be perceived before API call
        await new Promise(resolve => setTimeout(resolve, 250)); 

        try {
            await onSelectTier(tierId);
            // Toast is handled in AppLayout after successful Firestore update
        } catch (error: any) {
            // Error toast is also handled in AppLayout if onSelectTier throws
            console.error("SubscriptionModal: Error selecting tier forwarded from AppLayout:", error);
        } finally {
            setIsLoading(false);
            setAnimatingTierId(null); // Reset animation state
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
                    className="flex flex-col h-full overflow-hidden" // Added overflow-hidden
                >
                    <DialogHeader className="p-6 pb-4 border-b border-border/30 flex-shrink-0 bg-card/80 backdrop-blur-md z-10">
                        <DialogTitle className="text-2xl font-bold text-accent text-center fiery-glow-text">Choose Your Power Level</DialogTitle>
                        <DialogDescription className="text-center text-muted-foreground">
                            Unlock features and support Shinra-Ani. All tiers are currently free during beta!
                        </DialogDescription>
                    </DialogHeader>

                    <ScrollArea className="flex-1 min-h-0"> {/* Made this the scrollable area */}
                        <div className="p-6"> {/* Padding for the content inside scroll area */}
                            <div className="grid grid-cols-4 gap-4"> {/* Adjusted to always be 4 columns */}
                                {TIER_DATA.map((tier, index) => (
                                    <Card
                                        key={tier.id}
                                        ref={el => cardRefs.current[index] = el}
                                        className={cn(
                                            "glass flex flex-col transition-all duration-300 transform-gpu h-full", // Ensure cards take full height of grid cell
                                            tier.id === currentTier ? "border-2 border-primary neon-glow ring-2 ring-primary/50" : "border-border/30 hover:border-accent/70",
                                            tier.isPopular && tier.id !== currentTier ? "border-accent fiery-glow ring-1 ring-accent/70" : "",
                                            // Conditional animation class for selection
                                            animatingTierId === tier.id && "scale-105 ring-2 ring-offset-2 ring-offset-background ring-primary/70 shadow-2xl" 
                                        )}
                                    >
                                        <TierCardHeader className="items-center text-center p-4 border-b border-border/30 flex-shrink-0">
                                            <tier.icon className={cn("w-8 h-8 sm:w-10 sm:h-10 mb-2", tier.tierColorClass, tier.iconGlowClass)} />
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
                                        <DialogFooter className="p-3 sm:p-4 border-t border-border/30 mt-auto flex-shrink-0"> {/* Footer per card */}
                                            <Button
                                                className={cn(
                                                    "w-full text-xs sm:text-sm",
                                                    // Style based on current selection or animating
                                                    animatingTierId === tier.id ? "bg-primary/80 hover:bg-primary/70" : // Style during animation
                                                    tier.id === currentTier
                                                        ? "bg-primary hover:bg-primary/90 text-primary-foreground" // Style for current tier
                                                        : "bg-accent/80 hover:bg-accent text-accent-foreground fiery-glow-hover" // Default style
                                                )}
                                                onClick={() => handleTierSelection(tier.id as Exclude<UserProfileData['subscriptionTier'], null>, index)}
                                                disabled={isLoading || tier.id === currentTier}
                                            >
                                                {isLoading && animatingTierId === tier.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                                {tier.id === currentTier ? 'Current Tier' : tier.buttonText}
                                            </Button>
                                        </DialogFooter>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </ScrollArea>
                    
                    {/* Main modal footer removed as requested */}
                </motion.div>
            </DialogContent>
        </Dialog>
    );
};

export default SubscriptionModal;
