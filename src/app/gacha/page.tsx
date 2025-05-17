
// src/app/gacha/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle as CardTitlePrimitive } from '@/components/ui/card'; // Renamed CardTitle
import { useToast } from '@/hooks/use-toast';
import { performGachaRoll } from '@/services/collectibles';
import type { Collectible } from '@/types/collectibles';
import Image from 'next/image';
import { Loader2, Gift, Sparkles, Tag, Info, Star, CalendarDays, Film, Layers, Library, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { getAnimeDetails, type Anime } from '@/services/anime';
import { getMangaDetails, type Manga } from '@/services/manga';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth'; // Import useAuth
import { GACHA_ROLL_SIZE, PITY_TARGET_RARITIES, HARD_PITY_COUNT, SOFT_PITY_START_COUNT } from '@/config/gachaConfig';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Use the CardTitle from shadcn/ui
const CardTitle = CardTitlePrimitive;

interface GachaCardProps {
  collectible: Collectible;
}

const GachaCard: React.FC<GachaCardProps> = ({ collectible }) => {
  const [realItemDetails, setRealItemDetails] = useState<Anime | Manga | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRealDetails = async () => {
      if (!collectible.originalMalId || !collectible.originalType) {
        setIsLoadingDetails(false);
        setErrorDetails('Missing original item ID or type.');
        return;
      }
      setIsLoadingDetails(true);
      setErrorDetails(null);
      try {
        let details: Anime | Manga | null = null;
        if (collectible.originalType === 'anime') {
          details = await getAnimeDetails(collectible.originalMalId, undefined, true); // true for noDelay
        } else if (collectible.originalType === 'manga') {
          details = await getMangaDetails(collectible.originalMalId, undefined, true); // true for noDelay
        }
        setRealItemDetails(details);
        if (!details) {
            setErrorDetails(`Could not load details for ${collectible.originalType} (ID: ${collectible.originalMalId}) from source.`);
        }
      } catch (err) {
        console.error(`Error fetching details for collectible ${collectible.id} (Original ID: ${collectible.originalMalId}):`, err);
        setErrorDetails('Failed to load original item details.');
      } finally {
        setIsLoadingDetails(false);
      }
    };
    fetchRealDetails();
  }, [collectible]);

  const getRarityColorClasses = (rarity: Collectible['rarity']) => {
    switch (rarity) {
      case 'Common': return 'border-gray-400/50 bg-gray-700/20 text-gray-300';
      case 'Rare': return 'border-blue-400/60 bg-blue-600/20 text-blue-300 neon-glow-rare';
      case 'Ultra Rare': return 'border-purple-400/60 bg-purple-600/20 text-purple-300 neon-glow-ultra-rare';
      case 'Legendary': return 'border-orange-400/70 bg-orange-500/20 text-orange-300 neon-glow-legendary';
      case 'Mythic': return 'border-red-500/70 bg-red-600/20 text-red-300 fiery-glow'; // Use fiery-glow for Mythic
      case 'Event': return 'border-yellow-400/70 bg-yellow-500/20 text-yellow-300 neon-glow-event';
      default: return 'border-muted/50 bg-muted/20 text-muted-foreground';
    }
  };
  
  const rarityColor = getRarityColorClasses(collectible.rarity);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: Math.random() * 0.4, type: "spring", stiffness: 100, damping: 10 }}
      className="w-full group"
    >
      <Card className={cn(
        "glass-deep shadow-xl border overflow-hidden h-full flex flex-col transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-2xl",
        rarityColor.split(' ')[0] // Use border color from rarity
      )}>
        <CardHeader className="p-0 relative aspect-[3/4]">
          {isLoadingDetails && (!realItemDetails?.imageUrl && !collectible.imageUrl) && (
            <Skeleton className="absolute inset-0 bg-muted/30" />
          )}
          <Image
            src={realItemDetails?.imageUrl || collectible.imageUrl || 'https://placehold.co/300x400.png?text=Shinra&font=lora'}
            alt={collectible.parodyTitle}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn("object-cover transition-opacity duration-500", isLoadingDetails ? "opacity-30" : "opacity-100")}
            data-ai-hint={collectible.originalType === 'anime' ? "anime art" : "manga art"}
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/300x400.png?text=Error&font=lora'; }}
            priority={false} // Banners should be priority, not gacha cards
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
          <Badge
            className={cn(
              "absolute top-1.5 right-1.5 text-[10px] px-2 py-0.5 font-semibold shadow-md backdrop-blur-sm",
              rarityColor // Apply full rarity class for bg and text
            )}
          >
            {collectible.rarity}
          </Badge>
          <CardTitle className="absolute bottom-1.5 left-2 right-2 z-10 text-xs sm:text-sm font-bold text-primary-foreground line-clamp-2 shadow-text group-hover:text-primary transition-colors">
            {collectible.parodyTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 flex-grow flex flex-col bg-card/50">
            <div className="flex-grow mb-1.5">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 italic line-clamp-2 sm:line-clamp-3 group-hover:line-clamp-none transition-all duration-200">
                    "{collectible.parodyBlurb}"
                </p>
                {isLoadingDetails && (
                    <div className="space-y-1 mt-1">
                        <Skeleton className="h-3 w-3/4 bg-muted/30" />
                        <Skeleton className="h-3 w-1/2 bg-muted/30" />
                    </div>
                )}
                {errorDetails && !isLoadingDetails && (
                    <p className="text-[10px] text-destructive mt-1">{errorDetails}</p>
                )}
                {realItemDetails && !isLoadingDetails && (
                    <div className="mt-1 border-t border-border/30 pt-1.5 space-y-0.5">
                        <p className="text-[10px] text-muted-foreground font-semibold line-clamp-1">
                            Original: <Link href={`/${collectible.originalType}/${collectible.originalMalId}`} passHref legacyBehavior><a target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{realItemDetails.title}</a></Link>
                        </p>
                        <div className="flex items-center gap-x-1.5 gap-y-0.5 text-[9px] text-muted-foreground/80 flex-wrap">
                            {realItemDetails.score !== null && realItemDetails.score !== undefined && <span className="flex items-center gap-0.5"><Star size={10} className="text-yellow-400"/>{realItemDetails.score.toFixed(1)}</span>}
                            {realItemDetails.year && <span className="flex items-center gap-0.5"><CalendarDays size={10}/>{realItemDetails.year}</span>}
                            {collectible.originalType === 'anime' && (realItemDetails as Anime).episodes && <span className="flex items-center gap-0.5"><Film size={10}/>{(realItemDetails as Anime).episodes} eps</span>}
                            {collectible.originalType === 'manga' && (realItemDetails as Manga).chapters && <span className="flex items-center gap-0.5"><Layers size={10}/>{(realItemDetails as Manga).chapters} ch</span>}
                            {collectible.originalType === 'manga' && (realItemDetails as Manga).volumes && <span className="flex items-center gap-0.5"><Library size={10}/>{(realItemDetails as Manga).volumes} vol</span>}
                        </div>
                    </div>
                )}
            </div>
            {(collectible.genreTags || collectible.moodTags) && (
                <div className="mt-auto pt-1.5 border-t border-border/30">
                    {collectible.genreTags && collectible.genreTags.length > 0 && (
                        <div className="flex items-center gap-1 text-[9px] mb-0.5">
                            <Tag size={10} className="text-muted-foreground/70 flex-shrink-0" />
                            <span className="text-muted-foreground/70 flex-shrink-0 mr-1">Parody Genres:</span>
                            <span className="text-foreground/80 line-clamp-1">{collectible.genreTags.join(', ')}</span>
                        </div>
                    )}
                    {collectible.moodTags && collectible.moodTags.length > 0 && (
                        <div className="flex items-center gap-1 text-[9px]">
                            <Info size={10} className="text-muted-foreground/70 flex-shrink-0" />
                            <span className="text-muted-foreground/70 flex-shrink-0 mr-1">Feels Like:</span>
                            <span className="text-foreground/80 line-clamp-1">{collectible.moodTags.join(', ')}</span>
                        </div>
                    )}
                </div>
            )}
        </CardContent>
      </Card>
    </motion.div>
  );
};


export default function GachaPage() {
  const [pulledCollectibles, setPulledCollectibles] = useState<Collectible[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { user, userProfile, loading: authLoading, fetchUserProfile } = useAuth();
  const { toast } = useToast();
  const [currentPityCount, setCurrentPityCount] = useState(0);

  useEffect(() => {
    setIsClient(true);
    if (user && userProfile) {
      setCurrentPityCount(userProfile.gachaPityCounter || 0);
    } else if (!user && !authLoading) { // If not logged in and auth check is done
      setCurrentPityCount(0); // Reset for non-logged-in users
    }
  }, [user, userProfile, authLoading]);

  const handleRoll = async () => {
    if (!isClient) return;
    setIsLoading(true);
    setPulledCollectibles(null); // Clear previous for animation

    // Simulate a short delay for UX before API call
    await new Promise(resolve => setTimeout(resolve, 300));

    const result = await performGachaRoll(user?.uid || null);

    if ('error' in result) {
      toast({
        title: 'Gacha Roll Failed',
        description: result.error,
        variant: 'destructive',
      });
      setPulledCollectibles([]); // Set to empty array to clear skeletons
    } else {
      setPulledCollectibles(result.collectibles);
      if(result.newPityCounter !== undefined) {
        setCurrentPityCount(result.newPityCounter);
        // If user is logged in, optimistic update of local profile pity (or refetch)
        if(user && fetchUserProfile) {
            // Optimistically update for now, or trigger full refetch:
            // await fetchUserProfile(user.uid);
        }
      }
      toast({
        title: 'Gacha Roll Success!',
        description: `You pulled ${result.collectibles.length} new collectibles!`,
        variant: "default",
      });
    }
    setIsLoading(false);
  };
  
  const pityTooltipContent = user ? (
    <>
        Current Pity: {currentPityCount}/{HARD_PITY_COUNT} <br />
        (Soft pity starts at {SOFT_PITY_START_COUNT}. Target: {PITY_TARGET_RARITIES.join('/')})
    </>
    ) : "Log in to track pity progress.";


  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 flex flex-col items-center min-h-screen">
      <div className="text-center mb-6 sm:mb-8">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.2 }}
        >
          <Gift className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-primary mb-2 sm:mb-3 fiery-glow-icon" />
        </motion.div>
        <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold text-primary sf-text-glow" // Added Shinra Fire text glow
        >
            Shinra-Ani Gacha
        </motion.h1>
        <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base"
        >
          Roll for unique, parody collectibles! (Free during Beta)
        </motion.p>
      </div>

      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <Button
            onClick={handleRoll}
            disabled={isLoading || !isClient}
            size="lg"
            className="px-6 py-4 sm:px-8 sm:py-6 text-md sm:text-lg fiery-glow-hover sf-bansho-button rounded-xl relative overflow-hidden"
            aria-label={`Roll for ${GACHA_ROLL_SIZE} collectibles`}
        >
            {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
            <Sparkles className="mr-2 h-5 w-5" />
            )}
            Roll for {GACHA_ROLL_SIZE} Collectibles!
        </Button>
        <TooltipProvider delayDuration={100}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full glass h-10 w-10 sm:h-12 sm:w-12">
                        <HelpCircle size={20} className="text-muted-foreground"/>
                    </Button>
                </TooltipTrigger>
                <TooltipContent className="glass-deep max-w-xs text-xs" side="bottom">
                    <p className="font-semibold mb-1">Gacha Pity System:</p>
                    {pityTooltipContent}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
      </div>


      {isLoading && (
        <div className="w-full grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {Array.from({ length: GACHA_ROLL_SIZE }).map((_, index) => (
            <Card key={`skel-${index}`} className="glass-deep aspect-[3/4] animate-pulse">
                <CardHeader className="p-0 relative h-2/3">
                    <Skeleton className="h-full w-full rounded-t-lg bg-muted/40" />
                </CardHeader>
                <CardContent className="p-2 space-y-1">
                    <Skeleton className="h-3 w-3/4 bg-muted/40" />
                    <Skeleton className="h-2 w-full bg-muted/40" />
                    <Skeleton className="h-2 w-1/2 bg-muted/40" />
                </CardContent>
            </Card>
          ))}
        </div>
      )}

      {pulledCollectibles && pulledCollectibles.length > 0 && !isLoading && (
        <div className="w-full grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {pulledCollectibles.map((collectible) => (
            <GachaCard key={collectible.id} collectible={collectible} />
          ))}
        </div>
      )}

       {!pulledCollectibles && !isLoading && isClient && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center text-muted-foreground mt-8 p-6 border border-dashed border-border/50 rounded-lg glass max-w-md w-full"
          >
            <p className="text-lg">Your next legendary (or hilariously common) pulls await!</p>
            <p className="text-sm mt-1">Click the button above to try your luck.</p>
          </motion.div>
        )}
    </div>
  );
}
