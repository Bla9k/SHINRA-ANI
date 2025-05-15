
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
import { Sparkle, Flame, Zap, Rocket, CheckCircle2, XCircle } from 'lucide-react'; // Added Check/X icons
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { updateUserSubscriptionTier } from '@/services/profile';
import { cn } from '@/lib/utils';

interface TierFeature {
    text: string;
    included: boolean;
}

interface Tier {
    id: 'spark' | 'ignition' | 'hellfire' | 'burstdrive';
    name: string;
    slogan: string;
    icon: React.ElementType;
    features: TierFeature[];
    buttonText: string;
    isCurrent?: boolean; // To highlight the user's current tier
    isPopular?: boolean; // To highlight a popular tier
}

const TIER_DATA: Tier[] = [
    {
        id: 'spark',
        name: 'Spark Tier',
        slogan: 'You’re just lighting the fuse.',
        icon: Sparkle,
        features: [
            { text: 'Basic browsing of anime & manga', included: true },
            { text: 'Limited search results', included: true },
            { text: 'Read/Watch 3 indie items/day', included: true },
            { text: 'Join up to 2 communities', included: true },
            { text: 'Standard Nami AI search', included: true },
            { text: 'Ad-supported (conceptual)', included: true },
        ],
        buttonText: 'Start with Spark',
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
            { text: 'Full profile customization', included: true },
            { text: 'Create up to 3 communities', included: true },
            { text: 'Ad-free experience (conceptual)', included: true },
        ],
        buttonText: 'Unleash Hellfire',
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
    },
];

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentTier: string | null;
    onSelectTier: (tierId: string) => Promise<void>; // Make it async
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, currentTier, onSelectTier }) => {
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();

    const handleTierSelection = async (tierId: string) => {
        if (!user) {
            toast({ title: "Not Logged In", description: "Please log in to select a tier.", variant: "destructive" });
            return;
        }
        setIsLoading(true);
        try {
            await onSelectTier(tierId); // Call the passed-in handler
            // Success toast is handled by AppLayout after profile update
        } catch (error: any) {
            toast({
                title: "Selection Failed",
                description: error.message || "Could not update your subscription tier. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="glass-deep sm:max-w-4xl max-h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-4 border-b border-border/50 sticky top-0 bg-card/80 backdrop-blur-md z-10">
                    <DialogTitle className="text-2xl font-bold text-primary text-center">Choose Your Power Level</DialogTitle>
                    <DialogDescription className="text-center text-muted-foreground">
                        Unlock features and support Shinra-Ani. All tiers are currently free during beta!
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 overflow-y-auto scrollbar-thin flex-grow">
                    {TIER_DATA.map((tier) => (
                        <Card
                            key={tier.id}
                            className={cn(
                                "glass flex flex-col transition-all duration-300 hover:shadow-xl hover:border-primary/70",
                                tier.id === currentTier ? "border-primary neon-glow ring-2 ring-primary/50" : "border-border/30",
                                tier.isPopular && tier.id !== currentTier ? "border-accent ring-1 ring-accent/50" : ""
                            )}
                        >
                            <CardHeader className="items-center text-center p-4 border-b border-border/30">
                                <tier.icon className={cn("w-10 h-10 mb-2", tier.id === currentTier ? "text-primary" : "text-accent")} />
                                <TierCardTitle className="text-lg font-semibold">{tier.name}</TierCardTitle>
                                <TierCardDescription className="text-xs text-muted-foreground h-8 line-clamp-2">{tier.slogan}</TierCardDescription>
                            </CardHeader>
                            <CardContent className="p-4 flex-grow">
                                <ul className="space-y-2 text-xs">
                                    {tier.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                            {feature.included ? (
                                                <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                                            ) : (
                                                <XCircle className="w-3.5 h-3.5 text-muted-foreground/70 mt-0.5 flex-shrink-0" />
                                            )}
                                            <span className={!feature.included ? "text-muted-foreground/70 line-through" : ""}>{feature.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <DialogFooter className="p-4 border-t border-border/30 mt-auto">
                                <Button
                                    className="w-full neon-glow-hover"
                                    onClick={() => handleTierSelection(tier.id)}
                                    disabled={isLoading || tier.id === currentTier}
                                    variant={tier.id === currentTier ? "default" : "outline"}
                                >
                                    {tier.id === currentTier ? 'Current Tier' : tier.buttonText}
                                </Button>
                            </DialogFooter>
                        </Card>
                    ))}
                </div>
                {/* Removed sticky bottom-0 and z-10 from DialogFooter */}
                <DialogFooter className="p-4 border-t border-border/50 bg-card/80 backdrop-blur-md">
                     <DialogClose asChild>
                        <Button variant="ghost" onClick={onClose} className="w-full sm:w-auto">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default SubscriptionModal;
