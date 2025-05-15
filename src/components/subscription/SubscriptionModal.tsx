// src/components/subscription/SubscriptionModal.tsx
'use client';

import React, { useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle as TierCardTitle, CardDescription as TierCardDescription } from '@/components/ui/card';
import { Sparkles, Flame, Zap, Rocket, CheckCircle2, XCircle, Loader2 } from 'lucide-react'; // Added Loader2
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { updateUserSubscriptionTier, UserProfileData } from '@/services/profile.ts';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion'; // For modal animation

interface TierFeature {
    text: string;
    included: boolean;
}

interface Tier {
    id: UserProfileData['subscriptionTier']; // Ensure this aligns with UserProfileData
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

const TIER_DATA: Tier[] = [
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
        tierColorClass: 'text-primary', // Cyan for free tier
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
        tierColorClass: 'text-accent', // Fiery accent
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

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTier: UserProfileData['subscriptionTier'] | null;
    onSelectTier: (tierId: Exclude<UserProfileData['subscriptionTier'], null>) => Promise<void>;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, currentTier, onSelectTier }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();

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
        try {
            await onSelectTier(tierId);
            // Success toast is now handled in AppLayout after profile update
        } catch (error: any) {
            // Error toast is also handled in AppLayout
            console.error("SubscriptionModal: Error selecting tier forwarded to AppLayout:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isLoading) onClose(); }}>
            <DialogContent
                className="glass-deep sm:max-w-4xl max-h-[90vh] flex flex-col p-0 shadow-2xl border-accent/50"
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col h-full"
                >
                    <DialogHeader className="p-6 pb-4 border-b border-border/30 sticky top-0 bg-card/80 backdrop-blur-md z-10">
                        <DialogTitle className="text-2xl font-bold text-accent text-center fiery-glow-text">Choose Your Power Level</DialogTitle>
                        <DialogDescription className="text-center text-muted-foreground">
                            Unlock features and support Shinra-Ani. All tiers are currently free during beta!
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 overflow-y-auto scrollbar-thin flex-grow">
                        {TIER_DATA.map((tier) => (
                            <Card
                                key={tier.id}
                                className={cn(
                                    "glass flex flex-col transition-all duration-300",
                                    tier.id === currentTier ? "border-2 border-primary neon-glow ring-2 ring-primary/50" : "border-border/30 hover:border-accent/70 fiery-glow-hover",
                                    tier.isPopular && tier.id !== currentTier ? "border-accent fiery-glow ring-1 ring-accent/70" : ""
                                )}
                            >
                                <CardHeader className="items-center text-center p-4 border-b border-border/30">
                                    <tier.icon className={cn("w-10 h-10 mb-2", tier.tierColorClass, tier.iconGlowClass)} />
                                    <TierCardTitle className={cn("text-lg font-semibold", tier.id === currentTier ? "text-primary" : tier.isPopular ? "text-accent" : "text-foreground")}>{tier.name}</TierCardTitle>
                                    <TierCardDescription className="text-xs text-muted-foreground h-8 line-clamp-2">{tier.slogan}</TierCardDescription>
                                </CardHeader>
                                <CardContent className="p-4 flex-grow">
                                    <ul className="space-y-2 text-xs">
                                        {tier.features.map((feature, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                {feature.included ? (
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                                                ) : (
                                                    <XCircle className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
                                                )}
                                                <span className={cn("text-foreground/90",!feature.included ? "text-muted-foreground/60 line-through" : "")}>{feature.text}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <DialogFooter className="p-4 border-t border-border/30 mt-auto">
                                    <Button
                                        className={cn(
                                            "w-full",
                                            tier.id === currentTier
                                                ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                                                : "bg-accent/80 hover:bg-accent text-accent-foreground fiery-glow-hover"
                                        )}
                                        onClick={() => handleTierSelection(tier.id as Exclude<UserProfileData['subscriptionTier'], null>)}
                                        disabled={isLoading || tier.id === currentTier}
                                    >
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {tier.id === currentTier ? 'Current Tier' : tier.buttonText}
                                    </Button>
                                </DialogFooter>
                            </Card>
                        ))}
                    </div>
                    <DialogFooter className="p-4 border-t border-border/50 bg-card/80 backdrop-blur-md">
                         <DialogClose asChild>
                            <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto text-muted-foreground hover:text-foreground">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
};

export default SubscriptionModal;
