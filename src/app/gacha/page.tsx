// src/app/gacha/page.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle as CardTitlePrimitive, CardDescription } from '@/components/ui/card';
import { performGachaRoll } from '@/services/collectibles';
import { SAMPLE_COLLECTIBLES, SAMPLE_PACKS, type Collectible, type CollectibleRarity, type GachaPack, NO_ART_PLACEHOLDER, GENERIC_LOADING_PLACEHOLDER, IMAGE_UNAVAILABLE_PLACEHOLDER, LEGACY_DATA_PLACEHOLDER } from '@/types/collectibles.ts';
import Image from 'next/image';
import { Loader2, Gift, Sparkles, Tag, Info, Star, CalendarDays, Film, Layers, Library, HelpCircle, Percent, Palette, Combine, XCircle, Package, ShoppingBag, Grid, List, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn, shuffleArray } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getAnimeDetails, type Anime } from '@/services/anime';
import { getMangaDetails, type Manga } from '@/services/manga';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { GACHA_ROLL_SIZE, RARITY_ORDER, RARITY_NUMERICAL_VALUE, GACHA_RARITY_RATES, PITY_DISTRIBUTION } from '@/config/gachaConfig.ts';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import anime from 'animejs';

const CardTitle = CardTitlePrimitive;

const getRarityColorClasses = (rarity: CollectibleRarity): string => {
  switch (rarity) {
    case 'Common': return 'border-gray-400/50 bg-gray-700/20 text-gray-300 neon-glow-common';
    case 'Rare': return 'border-blue-400/60 bg-blue-600/20 text-blue-300 neon-glow-rare';
    case 'Ultra Rare': return 'border-purple-400/60 bg-purple-600/20 text-purple-300 neon-glow-ultra-rare';
    case 'Legendary': return 'border-orange-400/70 bg-orange-500/20 text-orange-300 neon-glow-legendary';
    case 'Mythic': return 'border-red-500/70 bg-red-600/20 text-red-300 neon-glow-mythic';
    case 'Event': return 'border-yellow-400/70 bg-yellow-500/20 text-yellow-300 neon-glow-event';
    case 'Forbidden': return 'border-[hsl(var(--rarity-forbidden-border-hsl))] bg-[hsl(var(--rarity-forbidden-hsl))]/20 text-[hsl(var(--rarity-forbidden-foreground-hsl))] neon-glow-forbidden';
    default: return 'border-muted/50 bg-muted/20 text-muted-foreground';
  }
};

interface GachaCardProps {
  collectible: Collectible;
  onSelectForFusion?: (collectible: Collectible) => void;
  isSelectedForFusion?: boolean;
  isFusionMode?: boolean;
  onAnimationComplete?: () => void;
}

const GachaCard: React.FC<GachaCardProps> = React.memo(({ collectible, onSelectForFusion, isSelectedForFusion, isFusionMode, onAnimationComplete }) => {
  const [realItemDetails, setRealItemDetails] = useState<Anime | Manga | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchRealDetails = async () => {
      if (!collectible.originalMalId || !collectible.originalType) {
        if (isMounted) setIsLoadingDetails(false);
        return;
      }
      if (isMounted) {
        setIsLoadingDetails(true); setErrorDetails(null); setImageError(false);
      }
      try {
        let details: Anime | Manga | null = null;
        if (collectible.originalType === 'anime') {
          details = await getAnimeDetails(collectible.originalMalId, undefined, true);
        } else if (collectible.originalType === 'manga') {
          details = await getMangaDetails(collectible.originalMalId, undefined, true);
        }
        if (isMounted) {
          setRealItemDetails(details);
          if (!details) {
            setErrorDetails(`Could not load details for ${collectible.originalType} (ID: ${collectible.originalMalId}) from source.`);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error(`[GachaCard] Error fetching details for ${collectible.originalType} ID ${collectible.originalMalId}:`, err);
          setErrorDetails(`Error loading details for ${collectible.originalType} (ID: ${collectible.originalMalId}).`);
        }
      } finally {
        if (isMounted) setIsLoadingDetails(false);
      }
    };

    fetchRealDetails();
    return () => { isMounted = false; };
  }, [collectible]);


  const rarityClasses = getRarityColorClasses(collectible.rarity);
  const cardBaseStyle = rarityClasses.split(' ')[0];
  const cardBgStyle = rarityClasses.split(' ')[1];
  const cardTextStyle = rarityClasses.split(' ')[2];
  const cardGlowStyle = rarityClasses.split(' ')[3] || '';


  let displayImageUrl = GENERIC_LOADING_PLACEHOLDER;
  if (!isLoadingDetails) {
    if (imageError) {
        displayImageUrl = IMAGE_UNAVAILABLE_PLACEHOLDER;
    } else if (collectible.isEvolvedForm && collectible.imageUrl && collectible.imageUrl !== NO_ART_PLACEHOLDER) {
        displayImageUrl = collectible.imageUrl;
    } else if (realItemDetails?.imageUrl) {
        displayImageUrl = realItemDetails.imageUrl;
    } else if (collectible.imageUrl && collectible.imageUrl !== NO_ART_PLACEHOLDER) {
        displayImageUrl = collectible.imageUrl;
    } else if (['Forbidden', 'Mythic', 'Event'].includes(collectible.rarity)) {
        displayImageUrl = LEGACY_DATA_PLACEHOLDER;
    } else {
        displayImageUrl = IMAGE_UNAVAILABLE_PLACEHOLDER;
    }
  }
  // console.log(`[GachaCard: ${collectible.parodyTitle}] Attempting to load: ${displayImageUrl}`);


  const handleCardClick = (e: React.MouseEvent) => {
    if (isFusionMode && onSelectForFusion) {
      onSelectForFusion(collectible);
    }
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        "w-full group glass-deep shadow-xl overflow-hidden h-full flex flex-col transition-all duration-300 ease-in-out",
        cardBaseStyle,
        cardGlowStyle,
        isFusionMode && "cursor-pointer",
        isSelectedForFusion && "ring-2 ring-offset-2 ring-offset-background scale-105",
        isSelectedForFusion ? "ring-primary" : "border",
        collectible.rarity === 'Forbidden' ? "border-2" : "border"
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="p-0 relative aspect-[3/4]">
        {isLoadingDetails ? (
          <Skeleton className="absolute inset-0 bg-muted/30" />
        ) : (
          <Image
            src={displayImageUrl}
            alt={collectible.parodyTitle}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover transition-opacity duration-500",
              collectible.isEvolvedForm ? 'filter hue-rotate-15 saturate-150' : ''
            )}
            data-ai-hint={collectible.originalType === 'anime' ? "anime art" : "manga art"}
            onError={() => {
                console.warn(`[GachaCard] Image error for: ${displayImageUrl}. Falling back.`);
                setImageError(true);
            }}
            unoptimized={displayImageUrl.startsWith('https://placehold.co')}
            priority={false}
          />
        )}
        <Badge
          className={cn(
            "absolute top-1.5 right-1.5 text-[10px] px-2 py-0.5 font-semibold shadow-md backdrop-blur-sm",
            cardBaseStyle, cardBgStyle, cardTextStyle,
            cardGlowStyle
          )}
        >
          {collectible.rarity} {collectible.isEvolvedForm ? <Sparkles size={12} className="ml-1 text-yellow-300"/> : ''}
        </Badge>
        <CardTitle className="absolute bottom-1.5 left-2 right-2 z-10 text-xs sm:text-sm font-bold text-primary-foreground line-clamp-2 shadow-text group-hover:text-primary transition-colors">
          {collectible.parodyTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-3 flex-grow flex flex-col bg-card/60">
          <div className="flex-grow mb-1.5">
              <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 italic line-clamp-2 sm:line-clamp-3 group-hover:line-clamp-none transition-all duration-200">
                  "{collectible.parodyBlurb}"
              </p>
              {isLoadingDetails && !realItemDetails && !errorDetails && (
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
                    <Link href={`/${collectible.originalType}/${collectible.originalMalId}`} passHref legacyBehavior>
                        <a target="_blank" rel="noopener noreferrer" className="block hover:text-primary transition-colors" onClick={(e) => e.stopPropagation()}>
                            <p className="text-[10px] text-muted-foreground font-semibold line-clamp-1">
                                Based on: <span className="text-primary group-hover:underline">{realItemDetails.title}</span>
                            </p>
                        </a>
                    </Link>
                      <div className="flex items-center gap-x-1.5 gap-y-0.5 text-[9px] text-muted-foreground/80 flex-wrap">
                          {realItemDetails.score !== null && realItemDetails.score !== undefined && <span className="flex items-center gap-0.5"><Star size={10} className="text-yellow-400"/>{realItemDetails.score.toFixed(1)}</span>}
                          {realItemDetails.year && <span className="flex items-center gap-0.5"><CalendarDays size={10}/>{realItemDetails.year}</span>}
                          {collectible.originalType === 'anime' && (realItemDetails as Anime).episodes && <span className="flex items-center gap-0.5"><Film size={10}/>{(realItemDetails as Anime).episodes} eps</span>}
                          {collectible.originalType === 'manga' && (realItemDetails as Manga).chapters && <span className="flex items-center gap-0.5"><Layers size={10}/>{(realItemDetails as Manga).chapters} ch</span>}
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
    </div>
  );
});
GachaCard.displayName = 'GachaCard';


interface PackCardProps {
  pack: GachaPack;
  onOpenPack: (packId: string) => void;
  isLoadingThisPack: boolean;
}

const PackCard: React.FC<PackCardProps> = React.memo(({ pack, onOpenPack, isLoadingThisPack }) => {
    const [faceCardImageUrl, setFaceCardImageUrl] = useState<string | null>(null);
    const [currentLegacyImageIndex, setCurrentLegacyImageIndex] = useState(0);
    const [legacyPackImages, setLegacyPackImages] = useState<string[]>([]);
    const [isLoadingImages, setIsLoadingImages] = useState(true);
    const cardRef = useRef<HTMLDivElement>(null);

    const GENERIC_PACK_PLACEHOLDER = `https://placehold.co/200x320/1a1b26/e0e7ef?text=${encodeURIComponent(pack.name.substring(0,10))}&font=orbitron`;

    useEffect(() => {
        let isMounted = true;
        const loadFaceCardImages = async () => {
            if (!isMounted) return;
            setIsLoadingImages(true);
            setFaceCardImageUrl(null);
            setLegacyPackImages([]);

            let primaryDisplayUrl: string | null = pack.packImageUrl || null;

            if (!primaryDisplayUrl && pack.faceCardCollectibleId) {
                const faceCollectible = SAMPLE_COLLECTIBLES.find(c => c.id === pack.faceCardCollectibleId);
                if (faceCollectible) {
                    if (faceCollectible.imageUrl && faceCollectible.imageUrl !== NO_ART_PLACEHOLDER) {
                        primaryDisplayUrl = faceCollectible.imageUrl;
                    } else if (faceCollectible.originalMalId && faceCollectible.originalType) {
                        try {
                            let details: Anime | Manga | null = null;
                            if (faceCollectible.originalType === 'anime') details = await getAnimeDetails(faceCollectible.originalMalId, undefined, true);
                            else details = await getMangaDetails(faceCollectible.originalMalId, undefined, true);
                            primaryDisplayUrl = details?.imageUrl || null;
                        } catch (e) { console.error(`[PackCard] Error fetching details for face card ${faceCollectible.id}:`, e); }
                    }
                }
            }
             if (isMounted) setFaceCardImageUrl(primaryDisplayUrl || GENERIC_PACK_PLACEHOLDER);


            if (pack.isLegacyPack && pack.collectibleIds.length > 0) {
                const imageFetchPromises: Promise<string | null>[] = [];
                const idsToAnimate = shuffleArray([...pack.collectibleIds]).slice(0, 5);
                for (const collId of idsToAnimate) {
                    const collectible = SAMPLE_COLLECTIBLES.find(c => c.id === collId);
                    if (collectible) {
                         if (collectible.imageUrl && collectible.imageUrl !== NO_ART_PLACEHOLDER) {
                            imageFetchPromises.push(Promise.resolve(collectible.imageUrl));
                        } else if (collectible.originalMalId && collectible.originalType) {
                            imageFetchPromises.push(
                                (async () => {
                                    try {
                                        let details: Anime | Manga | null = null;
                                        if (collectible.originalType === 'anime') details = await getAnimeDetails(collectible.originalMalId, undefined, true);
                                        else details = await getMangaDetails(collectible.originalMalId, undefined, true);
                                        return details?.imageUrl || null;
                                    } catch { return null; }
                                })()
                            );
                        } else {
                             imageFetchPromises.push(Promise.resolve(null));
                        }
                    }
                }
                const resolvedImages = (await Promise.all(imageFetchPromises)).filter(url => url !== null) as string[];
                 if (isMounted) {
                    setLegacyPackImages(resolvedImages.length > 0 ? resolvedImages : [GENERIC_PACK_PLACEHOLDER]);
                    if (!pack.packImageUrl && resolvedImages.length > 0 && faceCardImageUrl === GENERIC_PACK_PLACEHOLDER) {
                        setFaceCardImageUrl(resolvedImages[0]);
                    }
                }
            }
            if (isMounted) setIsLoadingImages(false);
        };

        loadFaceCardImages();
        return () => { isMounted = false; };
    }, [pack, GENERIC_PACK_PLACEHOLDER, faceCardImageUrl]);

    useEffect(() => {
        let isMounted = true;
        let interval: NodeJS.Timeout | null = null;
        if (pack.isLegacyPack && legacyPackImages.length > 1 && !isLoadingImages) { // Start animation only when images are loaded
            interval = setInterval(() => {
                if (isMounted) {
                    setCurrentLegacyImageIndex(prevIndex => (prevIndex + 1) % legacyPackImages.length);
                }
            }, 2500);
        }
        return () => {
            isMounted = false;
            if (interval) clearInterval(interval);
        };
    }, [pack.isLegacyPack, legacyPackImages, isLoadingImages]);


    let displayPackImageResolved = faceCardImageUrl || GENERIC_PACK_PLACEHOLDER;
    if (pack.isLegacyPack && legacyPackImages.length > 0 && !isLoadingImages) {
        displayPackImageResolved = legacyPackImages[currentLegacyImageIndex] || GENERIC_PACK_PLACEHOLDER;
    }


  return (
    <Card ref={cardRef} className="glass-deep shadow-xl border-border/50 flex flex-col overflow-hidden hover:border-primary/50 transition-all aspect-[5/7] group">
      <CardHeader className="p-0 relative flex-grow">
        {isLoadingImages ? (
          <Skeleton className="absolute inset-0 bg-muted/30" />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={pack.isLegacyPack ? currentLegacyImageIndex : displayPackImageResolved}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <Image
                src={displayPackImageResolved}
                alt={`${pack.name} pack art`}
                fill
                sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 18vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint="gacha pack art"
                onError={(e) => {
                    (e.target as HTMLImageElement).srcset = GENERIC_PACK_PLACEHOLDER;
                    (e.target as HTMLImageElement).src = GENERIC_PACK_PLACEHOLDER;
                }}
                unoptimized={displayPackImageResolved.startsWith('https://placehold.co')}
                priority={false}
              />
            </motion.div>
          </AnimatePresence>
        )}
         <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
        <CardTitle className="absolute bottom-1.5 left-2 right-2 z-10 text-xs sm:text-sm font-bold text-primary-foreground line-clamp-2 shadow-text group-hover:text-primary transition-colors">
            {pack.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 text-center flex-shrink-0 bg-card/60">
        <Button
          onClick={() => onOpenPack(pack.id)}
          disabled={isLoadingThisPack || isLoadingImages}
          className="w-full fiery-glow-hover text-xs py-1.5 h-auto"
          size="sm"
        >
          {isLoadingThisPack ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <ShoppingBag size={14} className="mr-1.5"/>}
          Open Pack ({pack.isLegacyPack ? 1 : GACHA_ROLL_SIZE})
        </Button>
      </CardContent>
    </Card>
  );
});
PackCard.displayName = 'PackCard';


const DropRatesDisplay: React.FC = () => {
    const rarities = Object.keys(GACHA_RARITY_RATES).filter(r => r !== 'Forbidden') as CollectibleRarity[];
    return (
        <Card className="glass-deep shadow-lg border-border/50 w-full">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
                    <Percent size={20}/> Drop Rates (General Pool)
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-1 text-sm">
                    {rarities.filter(r => (GACHA_RARITY_RATES[r] ?? 0) > 0).map(rarity => (
                        <li key={rarity} className="flex justify-between">
                            <span className={cn(getRarityColorClasses(rarity).split(' ')[2])}>{rarity}:</span>
                            <span>{((GACHA_RARITY_RATES[rarity] ?? 0) * 100).toFixed(1)}%</span>
                        </li>
                    ))}
                </ul>
                 <p className="text-xs text-muted-foreground mt-2">Legacy Pack has special rates for its single card.</p>
            </CardContent>
        </Card>
    );
};
DropRatesDisplay.displayName = 'DropRatesDisplay';

const RarityVisualGuide: React.FC = () => {
    const rarities = RARITY_ORDER;
    return (
        <Card className="glass-deep shadow-lg border-border/50 w-full">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
                    <Palette size={20}/> Rarity Tiers
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {rarities.map(rarity => (
                    <div key={rarity} className="flex items-center gap-2 p-1.5 rounded-md bg-card/50 border border-border/30">
                        <div className={cn("w-5 h-5 rounded-sm", getRarityColorClasses(rarity).split(' ')[0], getRarityColorClasses(rarity).split(' ')[1])}></div>
                        <span className={cn("text-sm font-medium", getRarityColorClasses(rarity).split(' ')[2])}>{rarity}</span>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};
RarityVisualGuide.displayName = 'RarityVisualGuide';

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.075,
      duration: 0.3,
      ease: "easeOut",
    },
  }),
  legacyHidden: { opacity: 0, scale: 0.5, rotateY: -90 },
  legacyVisible: {
    opacity: 1,
    scale: 1,
    rotateY: 0,
    transition: { delay: 0.2, duration: 0.6, ease: [0.17, 0.67, 0.83, 0.67] },
  },
};


export default function GachaPage() {
  const [pulledCollectibles, setPulledCollectibles] = useState<Collectible[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("general");

  const [isFusionModalOpen, setIsFusionModalOpen] = useState(false);
  const [fusionCandidates, setFusionCandidates] = useState<Collectible[]>([]);
  const [selectedForFusion, setSelectedForFusion] = useState<Collectible[]>([]);

  const [openingPackId, setOpeningPackId] = useState<string | null>(null);
  const [openingPackName, setOpeningPackName] = useState<string>('');

  const [isLegacyOpening, setIsLegacyOpening] = useState(false);
  const [legacyRevealStep, setLegacyRevealStep] = useState<'initial' | 'packArt' | 'cardBack' | 'revealed'>('initial');
  const [showRerollButton, setShowRerollButton] = useState(false);

  const legacyPackCardRef = useRef<HTMLDivElement>(null);
  const legacyCardBackRef = useRef<HTMLDivElement>(null);
  const legacyRevealedCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLegacyAnimationComplete = useCallback(() => {
    console.log("[GachaPage] Legacy revealed card animation considered complete.");
    setTimeout(() => {
        setIsLegacyOpening(false);
        setLegacyRevealStep('initial');
        setIsLoading(false); // Ensure loading is false after legacy animation.
        // setOpeningPackId(null); // Clear openingPackId after animation and display.
        setShowRerollButton(false);
    }, 1500);
  }, []);


  const handleRoll = async (packIdToOpen?: string) => {
    if (!isClient || isLoading) return;

    setIsLoading(true);
    setOpeningPackId(packIdToOpen || null);
    setPulledCollectibles(null);
    setSelectedForFusion([]);
    setShowRerollButton(false);

    const currentPackBeingOpened = packIdToOpen ? SAMPLE_PACKS.find(p => p.id === packIdToOpen) : null;
    const currentPackNameForRoll = currentPackBeingOpened ? currentPackBeingOpened.name : 'General Pool';
    setOpeningPackName(currentPackNameForRoll);

    const isThisLegacyPack = !!currentPackBeingOpened?.isLegacyPack;
    console.log(`[GachaPage] handleRoll: packId=${packIdToOpen}, isLegacy=${isThisLegacyPack}, packName=${currentPackNameForRoll}`);

    if (isThisLegacyPack && currentPackBeingOpened) {
        setIsLegacyOpening(true);
        setLegacyRevealStep('packArt');
        await new Promise(resolve => setTimeout(resolve, 100));

        const packCardElement = document.getElementById(`pack-card-${currentPackBeingOpened.id}`);
        if (packCardElement && typeof anime === 'function') {
            anime.remove(packCardElement);
            anime({
                targets: packCardElement,
                scale: [1, 1.1, 1],
                opacity: [1, 0.7, 1],
                duration: 800,
                easing: 'easeOutExpo',
                complete: async () => {
                    const result = await performGachaRoll(packIdToOpen);
                    if ('error' in result) {
                        toast({ title: `${currentPackNameForRoll} Roll Failed`, description: result.error, variant: 'destructive' });
                        setIsLegacyOpening(false); setIsLoading(false); setOpeningPackId(null); setLegacyRevealStep('initial');
                        return;
                    }
                    setPulledCollectibles(result.collectibles);
                    setLegacyRevealStep('cardBack');
                    await new Promise(resolve => setTimeout(resolve, 100)); // Ensure state update

                    if (legacyCardBackRef.current && typeof anime === 'function') {
                        anime.remove(legacyCardBackRef.current);
                        legacyCardBackRef.current.style.opacity = '1';
                        legacyCardBackRef.current.style.transform = 'rotateY(-180deg) scale(0.8)';
                        anime({
                            targets: legacyCardBackRef.current,
                            rotateY: ['-180deg', '0deg'],
                            scale: [0.8, 1.1, 1],
                            opacity: [0.7, 1],
                            duration: 800,
                            easing: 'easeOutExpo',
                            delay: 100,
                            complete: () => {
                                setLegacyRevealStep('revealed');
                                // GachaCard's onAnimationComplete will call handleLegacyAnimationComplete
                            }
                        });
                    } else {
                         setLegacyRevealStep('revealed');
                         handleLegacyAnimationComplete(); // Directly if no card back ref
                    }
                }
            });
        } else {
            console.warn("[GachaPage] Legacy pack card element not found for animation or animejs not loaded.");
            setIsLegacyOpening(false); // Ensure this is reset if animation setup fails
            const result = await performGachaRoll(packIdToOpen); // Still perform roll
            if ('error' in result) toast({ title: `${currentPackNameForRoll} Roll Failed`, description: result.error, variant: 'destructive' });
            else setPulledCollectibles(result.collectibles);
            setIsLoading(false);
            // setOpeningPackId(null); // Clear only if not legacy or legacy failed early
        }
        return; // End of legacy pack handling
    }

    // General roll (non-legacy)
    const result = await performGachaRoll(packIdToOpen);

    if ('error' in result) {
      toast({ title: 'Gacha Roll Failed', description: result.error, variant: 'destructive' });
      setPulledCollectibles([]);
    } else {
      setPulledCollectibles(result.collectibles);
      setFusionCandidates(result.collectibles);
      setShowRerollButton(!packIdToOpen);
      toast({
        title: `${currentPackNameForRoll} Opened!`,
        description: `You pulled ${result.collectibles.length} new collectible${result.collectibles.length > 1 ? 's' : ''}!`,
        variant: "default",
      });
    }
    setIsLoading(false);
    if (!packIdToOpen) setOpeningPackId(null);
  };

  const handleReroll = async () => {
      if (isLoading) return;
      setIsLoading(true); setPulledCollectibles(null); setShowRerollButton(false);
      setOpeningPackName('General Pool'); // Reset pack name for reroll
      await new Promise(resolve => setTimeout(resolve, 300));
      await handleRoll(undefined); // Roll from general pool
  };


  const handleSelectForFusion = (collectible: Collectible) => {
    setSelectedForFusion(prev => {
        const isAlreadySelected = prev.find(c => c.id === collectible.id);
        if (isAlreadySelected) return prev.filter(c => c.id !== collectible.id);
        if (prev.length < 2) return [...prev, collectible];
        toast({title:"Max Selection", description:"Select only two cards for fusion.", variant: "default"});
        return prev;
    });
  };

  const handleAttemptFusion = () => {
    console.log("[FusionAttempt] Starting fusion. Selected:", selectedForFusion.map(c => `${c.parodyTitle} (${c.rarity})`));
    if (selectedForFusion.length !== 2) {
      toast({ title: "Select Two Cards", description: "Please select exactly two cards to attempt fusion.", variant: "destructive" });
      return;
    }

    const card1 = selectedForFusion[0];
    const card2 = selectedForFusion[1];

    if (card1.rarity === 'Event' || card2.rarity === 'Event' || card1.rarity === 'Forbidden' || card2.rarity === 'Forbidden') {
        toast({ title: "Fusion Blocked", description: "Event and Forbidden cards cannot be used in standard fusion.", variant: "destructive" });
        setIsFusionModalOpen(false); setSelectedForFusion([]);
        return;
    }

    const rarity1Value = RARITY_NUMERICAL_VALUE[card1.rarity] ?? 0;
    const rarity2Value = RARITY_NUMERICAL_VALUE[card2.rarity] ?? 0;
    let outputRarityIndex: number;

    if (rarity1Value === rarity2Value) {
        outputRarityIndex = Math.min(rarity1Value + 1, RARITY_ORDER.indexOf('Mythic'));
    } else {
        const higherIndex = Math.max(rarity1Value, rarity2Value);
        const lowerIndex = Math.min(rarity1Value, rarity2Value);
        if (higherIndex - lowerIndex >= 2) { // e.g., Common + Ultra Rare
            outputRarityIndex = Math.min(lowerIndex + 1, RARITY_ORDER.indexOf('Mythic'));
        } else { // e.g., Common + Rare, Rare + Ultra Rare
            outputRarityIndex = Math.min(higherIndex, RARITY_ORDER.indexOf('Mythic'));
        }
    }
    const outputRarityTier = RARITY_ORDER[outputRarityIndex] as CollectibleRarity; // Ensure type
    console.log(`[FusionAttempt] Determined output tier: ${outputRarityTier} (Index: ${outputRarityIndex})`);

    let potentialResults = SAMPLE_COLLECTIBLES.filter(c =>
        c.rarity === outputRarityTier &&
        c.id !== card1.id && c.id !== card2.id &&
        c.rarity !== 'Event' && c.rarity !== 'Forbidden' &&
        !c.isEvolvedForm // Standard fusion should not directly yield pre-evolved forms
    );
    console.log(`[FusionAttempt] Initial potential results for ${outputRarityTier} (excluding inputs, non-event/forbidden, non-evolved): ${potentialResults.length}`);

    if (potentialResults.length === 0) {
        console.log(`[FusionAttempt] No NEW distinct, non-evolved card of ${outputRarityTier} found. Trying fallback to ANY card of this tier (excluding event/forbidden).`);
        potentialResults = SAMPLE_COLLECTIBLES.filter(c =>
            c.rarity === outputRarityTier &&
            c.rarity !== 'Event' && c.rarity !== 'Forbidden'
            // Note: Not excluding input cards here intentionally for this fallback
        );
        console.log(`[FusionAttempt] Fallback potential results for ${outputRarityTier} (ANY card, non-event/forbidden): ${potentialResults.length}`);
    }

    if (potentialResults.length > 0) {
        let fusedCollectibleBase = potentialResults[Math.floor(Math.random() * potentialResults.length)];
        // Fusion always results in an "evolved" state if the base card can evolve or if it's a higher tier.
        // For simplicity, mark as evolved. If the chosen base can *also* evolve, that's a bonus for a future system.
        const fusedCollectible = { ...fusedCollectibleBase, isEvolvedForm: true };
        console.log(`[FusionAttempt] Success! Fused into: ${fusedCollectible.parodyTitle} (${fusedCollectible.rarity}, Evolved: ${fusedCollectible.isEvolvedForm})`);

        toast({
            title: "Fusion Success!",
            description: `Your cards fused into ${fusedCollectible.parodyTitle} (${fusedCollectible.rarity})!`,
            variant: "default", duration: 5000,
        });
        setPulledCollectibles(prev => {
            if (!prev) return [fusedCollectible];
            const remainingFromPull = prev.filter(p => p.id !== card1.id && p.id !== card2.id);
            const updatedPull = [fusedCollectible, ...remainingFromPull];
            return updatedPull.slice(0, GACHA_ROLL_SIZE);
        });
        setFusionCandidates(prev => {
            const remaining = prev.filter(p => p.id !== card1.id && p.id !== card2.id);
            return [fusedCollectible, ...remaining].slice(0, GACHA_ROLL_SIZE);
        });

    } else {
        console.log(`[FusionAttempt] Fizzled. No suitable new ${outputRarityTier} card could be formed, even with fallback.`);
        toast({ title: "Fusion Fizzled...", description: `No suitable new ${outputRarityTier} card could be formed. The cards remain.`, variant: "destructive" });
    }

    setIsFusionModalOpen(false);
    setSelectedForFusion([]);
  };

  useEffect(() => {
    if (legacyRevealStep === 'revealed' && pulledCollectibles && pulledCollectibles.length === 1 && legacyRevealedCardRef.current) {
        const cardElement = legacyRevealedCardRef.current.querySelector('.group'); // Target the main card div
        if (cardElement && typeof anime === 'function') {
            console.log("[GachaPage] Animating revealed legacy card entry.");
            anime.remove(cardElement); // Ensure no prior animations are running on this element
            anime({
                targets: cardElement,
                scale: [0.8, 1.05, 1],
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 700,
                easing: 'easeOutExpo',
                complete: handleLegacyAnimationComplete
            });
        } else {
             console.warn("[GachaPage] Could not find card element for legacy reveal animation or animejs not loaded.");
             handleLegacyAnimationComplete(); // Proceed if animation can't run
        }
    }
  }, [legacyRevealStep, pulledCollectibles, handleLegacyAnimationComplete]);


  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 flex flex-col items-center min-h-screen">
      <div className="text-center mb-6 sm:mb-8 w-full">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.2 }}
          className="inline-block p-3 bg-primary/10 rounded-full shadow-lg mb-2 sm:mb-3"
        >
          <Gift className="h-10 w-10 sm:h-12 sm:h-12 text-primary fiery-glow-icon" />
        </motion.div>
        <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-3xl sm:text-4xl font-bold text-primary sf-text-glow"
        >
            Shinra-Ani Gacha
        </motion.h1>
        <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base"
        >
          Roll for unique, parody collectibles! Free during Beta.
        </motion.p>
      </div>

      <Tabs defaultValue="general" className="w-full max-w-5xl mb-6 sm:mb-8" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 glass-deep rounded-lg">
          <TabsTrigger value="general" className={cn(theme === 'shinra-fire' ? "data-[state=active]:fiery-glow-tab" : "data-[state=active]:neon-glow-tab")}>
            <List className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5"/> General Roll
          </TabsTrigger>
          <TabsTrigger value="packs" className={cn(theme === 'shinra-fire' ? "data-[state=active]:fiery-glow-tab" : "data-[state=active]:neon-glow-tab")}>
            <Package className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5"/> Booster Packs
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="min-h-[300px]" // Ensure content area has some min height
          >
            <TabsContent value="general" className="mt-6">
              <div className="flex flex-col items-center gap-3 mb-4 sm:mb-6">
                  <Button
                      onClick={() => handleRoll(undefined)}
                      disabled={isLoading || !isClient || isLegacyOpening}
                      size="lg"
                      className="px-5 py-3 sm:px-6 sm:py-4 text-sm sm:text-md fiery-glow-hover sf-bansho-button rounded-xl relative overflow-hidden w-full max-w-xs"
                      aria-label={`Roll for ${GACHA_ROLL_SIZE} collectibles from general pool`}
                  >
                      {(isLoading && !openingPackId && !isLegacyOpening) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                      Roll ({GACHA_ROLL_SIZE} Cards)
                  </Button>
              </div>
            </TabsContent>

            <TabsContent value="packs" className="mt-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-center mb-3 sm:mb-4 text-primary sf-text-glow">Featured Packs</h2>
              {SAMPLE_PACKS.length > 0 ? (
                  <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {SAMPLE_PACKS.map(pack => (
                          <div key={pack.id} id={`pack-card-${pack.id}`} className="flex"> {/* Ensure flex for PackCard */}
                            <PackCard pack={pack} onOpenPack={() => handleRoll(pack.id)} isLoadingThisPack={isLoading && openingPackId === pack.id} />
                          </div>
                      ))}
                  </div>
              ) : (
                  <p className="text-center text-muted-foreground">No special packs available right now. Check back later!</p>
              )}
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>

      {/* Legacy Pack Animation Container */}
      {isLegacyOpening && openingPackId && legacyRevealStep !== 'revealed' && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex flex-col items-center justify-center p-4">
              {legacyRevealStep === 'packArt' && SAMPLE_PACKS.find(p => p.id === openingPackId) && (
                  <motion.div
                      key="legacy-packart-animation"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, ease: 'backOut' }}
                      className="w-full max-w-[200px] sm:max-w-[240px]"
                      // This ref is for the anime.js animation target
                      ref={legacyPackCardRef} // Keep this ref if packCardElement in handleRoll uses it by ID
                  >
                     <PackCard
                        pack={SAMPLE_PACKS.find(p => p.id === openingPackId)!}
                        onOpenPack={() => {}} // No action needed here
                        isLoadingThisPack={true} // Visually loading
                     />
                  </motion.div>
              )}
              {legacyRevealStep === 'cardBack' && (
                  <motion.div
                      key="legacy-cardback-animation"
                      ref={legacyCardBackRef}
                      className="p-4 w-48 h-64 sm:w-56 sm:h-[22rem] rounded-xl shadow-2xl flex items-center justify-center bg-gradient-to-br from-purple-700 via-red-600 to-orange-500 border-2 border-yellow-400/50"
                      style={{ perspective: '1000px', opacity: 0, transformStyle: 'preserve-3d' }}
                  >
                      <Sparkles className="w-16 h-16 text-yellow-300 opacity-70 animate-pulse" />
                  </motion.div>
              )}
              {legacyRevealStep !== 'initial' && (
                <p className="text-lg font-semibold text-primary mt-4 animate-pulse">
                  {legacyRevealStep === 'packArt' ? `Opening ${openingPackName}...` : "Revealing your LEGACY card..."}
                </p>
              )}
          </div>
      )}

      {/* Display Area for Pulled Collectibles */}
      {(!isLoading || (isLegacyOpening && legacyRevealStep === 'revealed')) && pulledCollectibles && pulledCollectibles.length > 0 && (
        <div className="w-full mt-6">
            <CardTitle className="text-xl sm:text-2xl font-semibold text-center mb-3 sm:mb-4 text-primary sf-text-glow">
                {openingPackName && openingPackName !== 'General Pool' && !isLegacyOpening ? `${openingPackName} Opened!` : (isLegacyOpening && legacyRevealStep === 'revealed' ? `${openingPackName} Revealed!` : "Your Pull!")}
            </CardTitle>
            <motion.div
                className={cn(
                  "w-full gap-2 sm:gap-3 md:gap-4",
                  isLegacyOpening && legacyRevealStep === 'revealed'
                    ? "flex justify-center" // Center the single legacy card
                    : "grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4" // Grid for general/non-legacy packs
                )}
                variants={!isLegacyOpening ? { visible: { transition: { staggerChildren: 0.075 } } } : undefined}
                initial={!isLegacyOpening ? "hidden" : undefined}
                animate="visible"
            >
            {pulledCollectibles.map((collectible, index) => (
                <motion.div
                    // Use a more robust key that includes a timestamp or unique part of the roll if possible,
                    // especially if IDs can repeat across different types of rolls.
                    key={`${collectible.id}-${index}-${openingPackId || 'general'}-${new Date().getTime()}`}
                    variants={isLegacyOpening && legacyRevealStep === 'revealed' ? cardVariants.legacyVisible : cardVariants.visible}
                    initial={isLegacyOpening && legacyRevealStep === 'revealed' ? "legacyHidden" : "hidden"}
                    animate="visible"
                    custom={index}
                    className={cn(isLegacyOpening && legacyRevealStep === 'revealed' && "w-full max-w-[200px] sm:max-w-[240px] flex")} // Flex for legacy card container to center
                    ref={isLegacyOpening && legacyRevealStep === 'revealed' && index === 0 ? legacyRevealedCardRef : null}
                >
                    <GachaCard
                        collectible={collectible}
                        onSelectForFusion={handleSelectForFusion}
                        isSelectedForFusion={selectedForFusion.some(c => c.id === collectible.id)}
                        isFusionMode={isFusionModalOpen}
                        // Pass onAnimationComplete only for the single legacy card
                        onAnimationComplete={isLegacyOpening && legacyRevealStep === 'revealed' && index === 0 ? handleLegacyAnimationComplete : undefined}
                    />
                </motion.div>
            ))}
            </motion.div>

            {/* Reroll and Fusion Buttons - Only for non-Legacy openings */}
            {showRerollButton && !isLegacyOpening && (
                <div className="mt-6 text-center">
                    <Button onClick={handleReroll} variant="outline" className="neon-glow-hover glass">
                        <RefreshCw size={16} className="mr-2"/> Reroll All (Free)
                    </Button>
                </div>
            )}
            {pulledCollectibles.length > 0 && !isLegacyOpening && ( // Show fusion only if not legacy opening and cards are present
                 <div className="mt-6 text-center">
                    <Button onClick={() => setIsFusionModalOpen(true)} variant="outline" className="neon-glow-hover glass">
                        <Combine size={18} className="mr-2"/> Attempt Card Fusion
                    </Button>
                </div>
            )}
        </div>
      )}

       {/* Fallback if no cards pulled and not loading (e.g., initial state or failed search) */}
       {(!pulledCollectibles || pulledCollectibles.length === 0) && !isLoading && !openingPackId && !isLegacyOpening && isClient && activeTab === 'general' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center text-muted-foreground mt-8 p-6 border border-dashed border-border/50 rounded-lg glass max-w-md w-full"
          >
            <p className="text-lg">Your next legendary (or hilariously common) pulls await!</p>
            <p className="text-sm mt-1">Click the "Roll" button to try your luck.</p>
          </motion.div>
        )}

        <Separator className="my-8 md:my-12 bg-border/30" />

        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <DropRatesDisplay />
            <RarityVisualGuide />
        </div>

        {/* Fusion Modal */}
        <Dialog open={isFusionModalOpen} onOpenChange={setIsFusionModalOpen}>
            <DialogContent className="glass-deep sm:max-w-md md:max-w-lg lg:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-primary sf-text-glow">Attempt Card Fusion</DialogTitle>
                    <DialogDescription>
                        Select 2 cards from your recent pull to attempt fusion. Event and Forbidden cards cannot be used in standard fusion.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[50vh] -mx-2 px-2 py-4">
                    <div className="grid grid-cols-2 gap-3">
                        {fusionCandidates.map(collectible => (
                            <div key={`fusion-${collectible.id}`} className="flex"> {/* Ensure flex for GachaCard */}
                                <GachaCard
                                    collectible={collectible}
                                    onSelectForFusion={handleSelectForFusion}
                                    isSelectedForFusion={selectedForFusion.some(c => c.id === collectible.id)}
                                    isFusionMode={true}
                                />
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <DialogFooter className="sm:justify-between gap-2 pt-4 border-t border-border/30">
                    <div className="text-xs text-muted-foreground">
                        Selected: {selectedForFusion.length}/2
                    </div>
                    <div className="flex gap-2">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" className="neon-glow-hover">Cancel</Button>
                        </DialogClose>
                        <Button
                            type="button"
                            onClick={handleAttemptFusion}
                            disabled={selectedForFusion.length !== 2 || (isLoading && isFusionModalOpen) }
                            className="fiery-glow-hover"
                        >
                            {(isLoading && isFusionModalOpen) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Fuse Cards'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
GachaPage.displayName = 'GachaPage';

// Removed the erroneous const currentPackDetails outside the component
