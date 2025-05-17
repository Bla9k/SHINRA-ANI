
// src/app/gacha/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { performGachaRoll } from '@/services/collectibles';
import type { Collectible } from '@/types/collectibles';
import Image from 'next/image';
import { Loader2, Gift, Sparkles, Tag, Info } from 'lucide-react'; // Added icons
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function GachaPage() {
  const [pulledCollectible, setPulledCollectible] = useState<Collectible | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false); // To prevent hydration errors with Math.random
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true); // Component has mounted, safe to use randomness
  }, []);

  const handleRoll = async () => {
    if (!isClient) return; // Don't roll on server or before mount

    setIsLoading(true);
    setPulledCollectible(null); // Clear previous pull

    const result = await performGachaRoll();

    if ('error' in result) {
      toast({
        title: 'Gacha Roll Failed',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      setPulledCollectible(result);
      toast({
        title: 'Collectible Pulled!',
        description: `You got: ${result.parodyTitle} (${result.rarity})`,
        variant: 'default',
      });
    }
    setIsLoading(false);
  };

  const getRarityColor = (rarity: Collectible['rarity']) => {
    switch (rarity) {
      case 'Common': return 'bg-gray-500/20 border-gray-500 text-gray-300';
      case 'Rare': return 'bg-blue-500/20 border-blue-500 text-blue-300';
      case 'Ultra Rare': return 'bg-purple-500/20 border-purple-500 text-purple-300';
      case 'Legendary': return 'bg-orange-500/20 border-orange-500 text-orange-300';
      case 'Mythic': return 'bg-red-600/20 border-red-600 text-red-300';
      case 'Event': return 'bg-yellow-500/20 border-yellow-500 text-yellow-300';
      default: return 'bg-muted/20 border-muted text-muted-foreground';
    }
  };


  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center">
      <div className="text-center mb-8">
        <Gift className="h-16 w-16 mx-auto text-primary mb-3" />
        <h1 className="text-4xl font-bold text-primary sf-text-glow">Shinra-Ani Gacha</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Roll for unique, parody collectibles! It's free!
        </p>
      </div>

      <Button
        onClick={handleRoll}
        disabled={isLoading || !isClient}
        size="lg"
        className="px-8 py-6 text-lg fiery-glow-hover sf-bansho-button mb-8"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-5 w-5" />
        )}
        Roll for Collectible!
      </Button>

      {pulledCollectible && (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-md"
        >
          <Card className={cn("glass-deep shadow-xl border overflow-hidden", getRarityColor(pulledCollectible.rarity).split(' ')[1])}>
            <CardHeader className="p-0 relative aspect-[3/4]">
              <Image
                src={pulledCollectible.imageUrl || 'https://placehold.co/300x400.png?text=Collectible'}
                alt={pulledCollectible.parodyTitle}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="parody collectible"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              <Badge
                className={cn(
                  "absolute top-2 right-2 text-xs px-2 py-1 font-semibold shadow-md",
                  getRarityColor(pulledCollectible.rarity)
                )}
              >
                {pulledCollectible.rarity}
              </Badge>
            </CardHeader>
            <CardContent className="p-4">
              <CardTitle className="text-xl font-bold mb-1 text-primary leading-tight">
                {pulledCollectible.parodyTitle}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground mb-3 italic">
                "{pulledCollectible.parodyBlurb}"
              </CardDescription>
              <div className="space-y-1 text-xs">
                {pulledCollectible.genreTags && pulledCollectible.genreTags.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Tag size={14} className="text-muted-foreground/80" />
                    <span className="font-medium text-muted-foreground">Parody Genres:</span>
                    <span className="text-foreground/90">{pulledCollectible.genreTags.join(', ')}</span>
                  </div>
                )}
                {pulledCollectible.moodTags && pulledCollectible.moodTags.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Info size={14} className="text-muted-foreground/80" />
                    <span className="font-medium text-muted-foreground">Feels Like:</span>
                    <span className="text-foreground/90">{pulledCollectible.moodTags.join(', ')}</span>
                  </div>
                )}
                {pulledCollectible.originalMalId && (
                  <p className="text-muted-foreground/80">
                    (Based on MAL ID: {pulledCollectible.originalMalId})
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
       {!pulledCollectible && !isLoading && isClient && (
          <div className="text-center text-muted-foreground mt-8 p-6 border border-dashed border-border/50 rounded-lg glass max-w-md">
            <p className="text-lg">Your next legendary (or hilariously common) pull awaits!</p>
            <p className="text-sm mt-1">Click the button above to try your luck.</p>
          </div>
        )}
    </div>
  );
}

// Added Framer Motion for subtle animation of the pulled card
import { motion } from 'framer-motion';
