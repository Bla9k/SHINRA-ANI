// src/app/gacha/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { performGachaRoll } from '@/services/collectibles';
import type { Collectible } from '@/types/collectibles';
import Image from 'next/image';
import { Loader2, Gift, Sparkles, Tag, Info, Star, CalendarDays, Tv, BookText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { getAnimeDetails, type Anime } from '@/services/anime';
import { getMangaDetails, type Manga } from '@/services/manga';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

interface GachaCardProps {
  collectible: Collectible;
}

const GachaCard: React.FC<GachaCardProps> = ({ collectible }) => {
  const [realItemDetails, setRealItemDetails] = useState<Anime | Manga | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

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
        } else {
          details = await getMangaDetails(collectible.originalMalId, undefined, true); // true for noDelay
        }
        setRealItemDetails(details);
        if (!details) {
            setErrorDetails(`Could not load details for ${collectible.originalType} ID ${collectible.originalMalId}.`);
        }
      } catch (err) {
        console.error(`Error fetching details for collectible ${collectible.id}:`, err);
        setErrorDetails('Failed to load original item details.');
      } finally {
        setIsLoadingDetails(false);
      }
    };
    fetchRealDetails();
  }, [collectible]);

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.random() * 0.5 }} // Staggered animation
      className="w-full group"
    >
      <Card className={cn(
        "glass-deep shadow-lg border overflow-hidden h-full flex flex-col transition-all duration-300 ease-in-out group-hover:scale-105",
        getRarityColor(collectible.rarity).split(' ')[1] // Use border color from rarity
      )}>
        <CardHeader className="p-0 relative aspect-[3/4]">
          {isLoadingDetails && !realItemDetails?.imageUrl && (
            <Skeleton className="absolute inset-0" />
          )}
          {(!isLoadingDetails && !realItemDetails?.imageUrl) && (
            <Image
              src={collectible.imageUrl || 'https://placehold.co/300x400.png?text=Parody'}
              alt={collectible.parodyTitle}
              layout="fill"
              objectFit="cover"
              className="transition-opacity duration-300"
              data-ai-hint="parody collectible art"
            />
          )}
          {realItemDetails?.imageUrl && (
             <Link href={`/${collectible.originalType}/${collectible.originalMalId}`} passHref legacyBehavior>
                <a target="_blank" rel="noopener noreferrer" className="block w-full h-full relative">
                    <Image
                        src={realItemDetails.imageUrl}
                        alt={realItemDetails.title || collectible.parodyTitle}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 group-hover:scale-110"
                        data-ai-hint={`${collectible.originalType} cover`}
                    />
                </a>
             </Link>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
          <Badge
            className={cn(
              "absolute top-1.5 right-1.5 text-[10px] px-2 py-0.5 font-semibold shadow-md backdrop-blur-sm",
              getRarityColor(collectible.rarity)
            )}
          >
            {collectible.rarity}
          </Badge>
          <CardTitle className="absolute bottom-1.5 left-2 right-2 z-10 text-xs sm:text-sm font-semibold text-primary-foreground line-clamp-2 shadow-text group-hover:text-primary transition-colors">
            {collectible.parodyTitle}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 flex-grow flex flex-col">
            <div className="flex-grow">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 italic line-clamp-2 sm:line-clamp-3">
                    "{collectible.parodyBlurb}"
                </p>
                {isLoadingDetails && (
                    <div className="space-y-1 mt-1">
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                    </div>
                )}
                {errorDetails && !isLoadingDetails && (
                    <p className="text-[10px] text-destructive mt-1">{errorDetails}</p>
                )}
                {realItemDetails && !isLoadingDetails && (
                    <div className="mt-1 border-t border-border/30 pt-1.5 space-y-0.5">
                        <p className="text-[10px] text-muted-foreground font-semibold line-clamp-1">
                            Based on: <Link href={`/${collectible.originalType}/${collectible.originalMalId}`} passHref legacyBehavior><a target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{realItemDetails.title}</a></Link>
                        </p>
                        <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/80">
                            {realItemDetails.score && <span className="flex items-center gap-0.5"><Star size={10} className="text-yellow-400"/>{realItemDetails.score.toFixed(1)}</span>}
                            {realItemDetails.year && <span className="flex items-center gap-0.5"><CalendarDays size={10}/>{realItemDetails.year}</span>}
                            {realItemDetails.type === 'anime' && (realItemDetails as Anime).episodes && <span className="flex items-center gap-0.5"><Tv size={10}/>{(realItemDetails as Anime).episodes} eps</span>}
                            {realItemDetails.type === 'manga' && (realItemDetails as Manga).chapters && <span className="flex items-center gap-0.5"><BookText size={10}/>{(realItemDetails as Manga).chapters} ch</span>}
                        </div>
                    </div>
                )}
            </div>
            {(collectible.genreTags || collectible.moodTags) && (
                <div className="mt-auto pt-1.5 border-t border-border/30">
                    {collectible.genreTags && collectible.genreTags.length > 0 && (
                        <div className="flex items-center gap-1 text-[9px] mb-0.5">
                            <Tag size={10} className="text-muted-foreground/70" />
                            <span className="text-muted-foreground/70 flex-shrink-0">Parody Genres:</span>
                            <span className="text-foreground/80 line-clamp-1">{collectible.genreTags.join(', ')}</span>
                        </div>
                    )}
                    {collectible.moodTags && collectible.moodTags.length > 0 && (
                        <div className="flex items-center gap-1 text-[9px]">
                            <Info size={10} className="text-muted-foreground/70" />
                            <span className="text-muted-foreground/70 flex-shrink-0">Feels Like:</span>
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
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleRoll = async () => {
    if (!isClient) return;

    setIsLoading(true);
    setPulledCollectibles(null);

    const result = await performGachaRoll();

    if ('error' in result) {
      toast({
        title: 'Gacha Roll Failed',
        description: result.error,
        variant: 'destructive',
      });
      setPulledCollectibles([]); // Set to empty array to clear previous, if any
    } else {
      setPulledCollectibles(result.collectibles);
      toast({
        title: 'Gacha Roll Success!',
        description: `You pulled ${result.collectibles.length} new collectibles!`,
        variant: 'default',
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 flex flex-col items-center">
      <div className="text-center mb-6 sm:mb-8">
        <Gift className="h-12 w-12 sm:h-16 sm:h-16 mx-auto text-primary mb-2 sm:mb-3" />
        <h1 className="text-3xl sm:text-4xl font-bold text-primary sf-text-glow">Shinra-Ani Gacha</h1>
        <p className="text-muted-foreground mt-1 sm:mt-2 text-md sm:text-lg">
          Roll for unique, parody collectibles! It's free!
        </p>
      </div>

      <Button
        onClick={handleRoll}
        disabled={isLoading || !isClient}
        size="lg"
        className="px-6 py-4 sm:px-8 sm:py-6 text-md sm:text-lg fiery-glow-hover sf-bansho-button mb-6 sm:mb-8 rounded-xl"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-5 w-5" />
        )}
        Roll for 10 Collectibles!
      </Button>

      {isLoading && (
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <Card key={`skel-${index}`} className="glass-deep aspect-[3/5] animate-pulse">
                <CardHeader className="p-0 relative h-2/3">
                    <Skeleton className="h-full w-full rounded-t-lg" />
                </CardHeader>
                <CardContent className="p-2 space-y-1">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-2 w-1/2" />
                </CardContent>
            </Card>
          ))}
        </div>
      )}

      {pulledCollectibles && pulledCollectibles.length > 0 && !isLoading && (
        <div className="w-full grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
          {pulledCollectibles.map((collectible) => (
            <GachaCard key={collectible.id} collectible={collectible} />
          ))}
        </div>
      )}

       {!pulledCollectibles && !isLoading && isClient && (
          <div className="text-center text-muted-foreground mt-8 p-6 border border-dashed border-border/50 rounded-lg glass max-w-md w-full">
            <p className="text-lg">Your next legendary (or hilariously common) pulls await!</p>
            <p className="text-sm mt-1">Click the button above to try your luck.</p>
          </div>
        )}
    </div>
  );
}
