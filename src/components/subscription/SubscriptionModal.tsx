
// src/components/subscription/SubscriptionModal.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader as TierCardHeader, CardTitle as TierCardTitleOriginal, CardDescription as TierCardDescription } from '@/components/ui/card';
import { Sparkles, Flame, Zap, Rocket, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { updateUserSubscriptionTier, UserProfileData } from '@/services/profile';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import anime from 'animejs'; // Import animejs
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

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTier: UserProfileData['subscriptionTier'] | null;
    onSelectTier: (tierId: Exclude<UserProfileData['subscriptionTier'], null>) => Promise<void>;
    TIER_DATA: Tier[];
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, currentTier, onSelectTier, TIER_DATA }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [animatingTierId, setAnimatingTierId] = useState<string | null>(null);
    const [isAnimeJsLoaded, setIsAnimeJsLoaded] = useState(false); // State for anime.js load status
    const { user } = useAuth();
    const { toast } = useToast();
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        cardRefs.current = cardRefs.current.slice(0, TIER_DATA.length);
    }, [TIER_DATA.length]);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.anime) {
            setIsAnimeJsLoaded(true);
        } else {
            // Poll for anime.js if it's not immediately available (e.g., due to lazyOnload)
            const intervalId = setInterval(() => {
                if (typeof window !== 'undefined' && window.anime) {
                    setIsAnimeJsLoaded(true);
                    clearInterval(intervalId);
                }
            }, 100);
            return () => clearInterval(intervalId);
        }
    }, []);


    const handleTierSelection = async (tierId: Exclude<UserProfileData['subscriptionTier'], null>, cardIndex: number) => {
        if (!user) {
            toast({ title: "Not Logged In", description: "Please log in to select a tier.", variant: "destructive" });
            return;
        }
        if (!tierId) {
            toast({ title: "Invalid Tier", description: "An invalid tier was selected.", variant: "destructive" });
            return;
        }
        if (!isAnimeJsLoaded) {
            toast({ title: "Animation Library Not Ready", description: "Please wait a moment for animations to load.", variant: "default" });
            // Proceed without animation or wait longer? For now, we just show a message and rely on button disable.
            // Alternatively, directly call onSelectTier if animation isn't critical.
            // For now, the button is disabled if !isAnimeJsLoaded, so this path might not be hit often.
            // If it is hit, means there's a race condition.
            // As a fallback, call onSelectTier directly
            setIsLoading(true);
            try {
                await onSelectTier(tierId);
            } catch (error: any) {
                console.error("SubscriptionModal: Error selecting tier (anime.js not loaded path):", error);
            } finally {
                setIsLoading(false);
                setAnimatingTierId(null);
            }
            return;
        }


        setAnimatingTierId(tierId);
        setIsLoading(true);

        const cardElement = cardRefs.current[cardIndex];
        if (cardElement && typeof anime === 'function') {
            anime.remove(cardElement); // Remove any previous animations on this target

            // Get computed styles for reliable color values
            const computedStyle = getComputedStyle(document.documentElement);
            const primaryColor = computedStyle.getPropertyValue('--primary').trim(); // e.g., "15 100% 55%"
            const accentColor = computedStyle.getPropertyValue('--accent').trim(); // e.g., "15 100% 55%" (same as primary in this case)
            const borderColor = computedStyle.getPropertyValue('--border').trim();

            const currentTierDetails = TIER_DATA[cardIndex];
            const initialBorderColor = currentTierDetails.isCurrent ? `hsl(${primaryColor})` : (currentTierDetails.isPopular ? `hsl(${accentColor})` : `hsl(${borderColor})`);

            anime({
                targets: cardElement,
                scale: [
                    { value: 1, duration: 0 },
                    { value: 1.03, duration: 150, easing: 'easeOutQuad' },
                    { value: 1, duration: 200, easing: 'easeInQuad' }
                ],
                borderColor: [ // Animate border color
                    { value: `hsl(${primaryColor})`, duration: 150, easing: 'easeOutQuad' }, // Flash to primary
                    { value: initialBorderColor, duration: 200, easing: 'easeInQuad', delay: 50 } // Return to original or new current
                ],
                boxShadow: [ // Animate box shadow for glow effect
                     { value: `0 0 10px hsl(${primaryColor} / 0.5), 0 0 20px hsl(${primaryColor} / 0.3)`, duration: 150, easing: 'easeOutQuad'}, // Glow with primary
                     { value: '0 0 0px transparent', duration: 200, easing: 'easeInQuad', delay: 50} // Fade out glow
                ],
                easing: 'linear', // Overall easing for the timeline
                complete: () => {
                    // Reset inline styles set by anime.js if needed, or rely on classes
                    if(cardElement) {
                        cardElement.style.borderColor = '';
                        cardElement.style.boxShadow = '';
                    }
                }
            });
        }
        
        // Artificial delay to let animation play a bit before actual async operation
        await new Promise(resolve => setTimeout(resolve, 250)); 

        try {
            await onSelectTier(tierId);
            // Success toast and modal close are handled in AppLayout's onSelectTier
        } catch (error: any) {
            console.error("SubscriptionModal: Error selecting tier forwarded from AppLayout:", error);
            // Error toast is also handled in AppLayout
        } finally {
            setIsLoading(false);
            setAnimatingTierId(null); // Reset animation state regardless of success/failure
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
                    <DialogHeader className="p-6 pb-4 border-b border-border/30 flex-shrink-0 bg-card/80 backdrop-blur-md z-10 sticky top-0">
                        <DialogTitle className="text-2xl font-bold text-accent text-center fiery-glow-text">Choose Your Power Level</DialogTitle>
                        <DialogDescription className="text-center text-muted-foreground">
                            Unlock features and support Shinra-Ani. All tiers are currently free during beta!
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-grow overflow-y-auto scrollbar-thin p-6 min-h-0"> {/* Added min-h-0 */}
                        <div className="grid grid-cols-4 gap-4"> {/* Always 4 columns */}
                            {TIER_DATA.map((tier, index) => (
                                <Card
                                    key={tier.id || `tier-${index}`}
                                    ref={el => cardRefs.current[index] = el}
                                    className={cn(
                                        "glass flex flex-col transition-all duration-300 transform-gpu h-full rounded-lg", // Added rounded-lg
                                        tier.id === currentTier ? "border-2 border-primary neon-glow ring-2 ring-primary/50" : "border-border/30 hover:border-accent/70",
                                        tier.isPopular && tier.id !== currentTier ? "border-accent fiery-glow ring-1 ring-accent/70" : "",
                                        // Conditional animation class if needed, or rely on anime.js
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
                                                animatingTierId === tier.id ? "bg-primary/80 hover:bg-primary/70" : // Style for animating button
                                                tier.id === currentTier
                                                    ? "bg-primary hover:bg-primary/90 text-primary-foreground" // Current tier button style
                                                    : "bg-accent/80 hover:bg-accent text-accent-foreground fiery-glow-hover" // Default button style
                                            )}
                                            onClick={() => tier.id && handleTierSelection(tier.id as Exclude<UserProfileData['subscriptionTier'], null>, index)}
                                            disabled={isLoading || !isAnimeJsLoaded || tier.id === currentTier || !tier.id}
                                        >
                                            {(isLoading && animatingTierId === tier.id) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {tier.id === currentTier ? 'Current Tier' : tier.buttonText}
                                        </Button>
                                    </DialogFooter>
                                </Card>
                            ))}
                        </div>
                    </div>
                    {/* Removed the overall DialogFooter to use the 'X' from DialogContent */}
                </motion.div>
            </DialogContent>
        </Dialog>
    );
};

export default SubscriptionModal;
