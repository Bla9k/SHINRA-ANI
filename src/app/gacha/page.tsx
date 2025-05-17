// src/app/gacha/page.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle as CardTitlePrimitive, CardDescription } from '@/components/ui/card';
import { performGachaRoll } from '@/services/collectibles';
import { SAMPLE_COLLECTIBLES, type Collectible, type CollectibleRarity, type GachaPack, SAMPLE_PACKS } from '@/types/collectibles';
import Image from 'next/image';
import { Loader2, Gift, Sparkles, Tag, Info, Star, CalendarDays, Film, Layers, Library, HelpCircle, Percent, Palette, Combine, XCircle, Package, ShoppingBag, Grid, List, Link as LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { getAnimeDetails, type Anime } from '@/services/anime';
import { getMangaDetails, type Manga } from '@/services/manga';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { GACHA_ROLL_SIZE, RARITY_ORDER, RARITY_NUMERICAL_VALUE, GACHA_RARITY_RATES } from '@/config/gachaConfig';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';

const CardTitle = CardTitlePrimitive;

const getRarityColorClasses = (rarity: CollectibleRarity) => {
  switch (rarity) {
    case 'Common': return 'border-gray-400/50 bg-gray-700/20 text-gray-300';
    case 'Rare': return 'border-blue-400/60 bg-blue-600/20 text-blue-300 neon-glow-rare';
    case 'Ultra Rare': return 'border-purple-400/60 bg-purple-600/20 text-purple-300 neon-glow-ultra-rare';
    case 'Legendary': return 'border-orange-400/70 bg-orange-500/20 text-orange-300 neon-glow-legendary';
    case 'Mythic': return 'border-red-500/70 bg-red-600/20 text-red-300 fiery-glow';
    case 'Event': return 'border-yellow-400/70 bg-yellow-500/20 text-yellow-300 neon-glow-event';
    default: return 'border-muted/50 bg-muted/20 text-muted-foreground';
  }
};

interface GachaCardProps {
  collectible: Collectible;
  onSelectForFusion?: (collectible: Collectible) => void;
  isSelectedForFusion?: boolean;
  isFusionMode?: boolean;
}

const GachaCard: React.FC<GachaCardProps> = ({ collectible, onSelectForFusion, isSelectedForFusion, isFusionMode }) => {
  const [realItemDetails, setRealItemDetails] = useState<Anime | Manga | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const GENERIC_PLACEHOLDER = 'https://placehold.co/300x450/1a1b26/e0e7ef?text=Image+Error&font=poppins';
  const NO_ART_PLACEHOLDER = 'https://placehold.co/300x400.png?text=ParodyArt&font=lora'; // For collectible.imageUrl if it's the primary

  useEffect(() => {
    let isMounted = true;
    const fetchRealDetails = async () => {
      if (!collectible.originalMalId || !collectible.originalType) {
        if (isMounted) {
          setIsLoadingDetails(false);
          // Don't set an error here if we might use collectible.imageUrl
          console.warn(`[GachaCard] Collectible ${collectible.id} missing originalMalId or originalType. Parody Art: ${collectible.imageUrl}`);
        }
        return;
      }
      if (isMounted) {
        setIsLoadingDetails(true);
        setErrorDetails(null);
        setImageError(false);
      }
      try {
        let details: Anime | Manga | null = null;
        // console.log(`[GachaCard - ${collectible.parodyTitle}] Fetching details for ${collectible.originalType} ID: ${collectible.originalMalId}`);
        if (collectible.originalType === 'anime') {
          details = await getAnimeDetails(collectible.originalMalId, undefined, true); // noDelay = true
        } else if (collectible.originalType === 'manga') {
          details = await getMangaDetails(collectible.originalMalId, undefined, true); // noDelay = true
        }
        if (isMounted) {
          setRealItemDetails(details);
          if (!details) {
            setErrorDetails(`Details not found for ${collectible.originalType} ID ${collectible.originalMalId} from source.`);
            console.warn(`[GachaCard - ${collectible.parodyTitle}] Jikan fetch returned null for ${collectible.originalType} ID: ${collectible.originalMalId}`);
          } else {
            // console.log(`[GachaCard - ${collectible.parodyTitle}] Details fetched for ${collectible.originalType} ID: ${collectible.originalMalId}`, details?.title);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error(`[GachaCard - ${collectible.parodyTitle}] Error fetching details for ${collectible.id} (Original ID: ${collectible.originalMalId}):`, err);
          setErrorDetails(`Could not load details for ${collectible.originalType} (ID: ${collectible.originalMalId}).`);
        }
      } finally {
        if (isMounted) setIsLoadingDetails(false);
      }
    };
    fetchRealDetails();
    return () => { isMounted = false; };
  }, [collectible]);

  const rarityClasses = getRarityColorClasses(collectible.rarity);

  let displayImageUrl = GENERIC_PLACEHOLDER;

  if (collectible.isEvolvedForm && collectible.imageUrl && collectible.imageUrl !== NO_ART_PLACEHOLDER) {
    displayImageUrl = collectible.imageUrl;
  } else if (realItemDetails?.imageUrl) {
    displayImageUrl = realItemDetails.imageUrl;
  } else if (collectible.imageUrl && collectible.imageUrl !== NO_ART_PLACEHOLDER) {
    displayImageUrl = collectible.imageUrl; // Use parody art if real art fails or not present
  } else if (isLoadingDetails) {
    // Keep placeholder while loading, defined by initial displayImageUrl
  }

  // console.log(`[GachaCard - ${collectible.parodyTitle}] Final display URL: ${displayImageUrl}`);

  const handleCardClick = () => {
    if (isFusionMode && onSelectForFusion) {
      onSelectForFusion(collectible);
    }
    // No navigation if not in fusion mode from this click
  };

  const cardContent = (
    <Card
      className={cn(
        "glass-deep shadow-xl border overflow-hidden h-full flex flex-col transition-all duration-300 ease-in-out group",
        rarityClasses.split(' ')[0], // Applies the border color class
        isFusionMode && "hover:ring-2 hover:ring-offset-2 hover:ring-offset-background hover:ring-primary cursor-pointer",
        isSelectedForFusion && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="p-0 relative aspect-[3/4]">
        {isLoadingDetails && !imageError && (!collectible.imageUrl || collectible.imageUrl === NO_ART_PLACEHOLDER) ? ( // Show skeleton if loading AND no immediate parody image
          <Skeleton className="absolute inset-0 bg-muted/30" />
        ) : (
          <Image
            src={imageError ? GENERIC_PLACEHOLDER : displayImageUrl}
            alt={collectible.parodyTitle}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover transition-opacity duration-500",
              isLoadingDetails && displayImageUrl === GENERIC_PLACEHOLDER ? "opacity-30" : "opacity-100", // Dim if only placeholder is available during load
              collectible.isEvolvedForm ? 'filter hue-rotate-15 saturate-150' : ''
            )}
            data-ai-hint={collectible.originalType === 'anime' ? "anime art" : "manga art"}
            onError={() => setImageError(true)}
            priority={false}
          />
        )}
        <Badge
          className={cn(
            "absolute top-1.5 right-1.5 text-[10px] px-2 py-0.5 font-semibold shadow-md backdrop-blur-sm",
            rarityClasses // Applies bg, text color, and specific glow
          )}
        >
          {collectible.rarity} {collectible.isEvolvedForm ? <Sparkles size={12} className="ml-1 text-yellow-300"/> : ''}
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
              {isLoadingDetails && (!realItemDetails && !errorDetails) && ( // Show skeleton only if no details and no error yet
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
                          Based on: <span className="text-primary hover:underline">{realItemDetails.title}</span>
                      </p>
                      <div className="flex items-center gap-x-1.5 gap-y-0.5 text-[9px] text-muted-foreground/80 flex-wrap">
                          {realItemDetails.score !== null && realItemDetails.score !== undefined && <span className="flex items-center gap-0.5"><Star size={10} className="text-yellow-400"/>{realItemDetails.score.toFixed(1)}</span>}
                          {realItemDetails.year && <span className="flex items-center gap-0.5"><CalendarDays size={10}/>{realItemDetails.year}</span>}
                          {collectible.originalType === 'anime' && (realItemDetails as Anime).episodes && <span className="flex items-center gap-0.5"><Film size={10}/>{(realItemDetails as Anime).episodes} eps</span>}
                          {collectible.originalType === 'manga' && (realItemDetails as Manga).chapters && <span className="flex items-center gap-0.5"><Layers size={10}/>{(realItemDetails as Manga).chapters} ch</span>}
                      </div>
                       {collectible.originalMalId && collectible.originalType && (
                          <Link href={`/${collectible.originalType}/${collectible.originalMalId}`} passHref legacyBehavior>
                              <a target="_blank" rel="noopener noreferrer" className="text-[9px] text-primary/70 hover:text-primary hover:underline flex items-center gap-0.5 mt-1" onClick={(e) => e.stopPropagation()}>
                                  View Original <LinkIcon size={10} />
                              </a>
                          </Link>
                       )}
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
  );
  return (
    <div className="w-full group">
      {cardContent}
    </div>
  );
};
GachaCard.displayName = 'GachaCard';


const DropRatesDisplay: React.FC = () => {
    const rarities = Object.keys(GACHA_RARITY_RATES) as CollectibleRarity[];
    return (
        <Card className="glass-deep shadow-lg border-border/50 w-full">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
                    <Percent size={20}/> Drop Rates
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-1 text-sm">
                    {rarities.filter(r => GACHA_RARITY_RATES[r] > 0).map(rarity => (
                        <li key={rarity} className="flex justify-between">
                            <span className={cn(getRarityColorClasses(rarity).split(' ')[2])}>{rarity}:</span>
                            <span>{(GACHA_RARITY_RATES[rarity] * 100).toFixed(1)}%</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
};
DropRatesDisplay.displayName = 'DropRatesDisplay';

const RarityVisualGuide: React.FC = () => {
    const rarities = Object.keys(GACHA_RARITY_RATES) as CollectibleRarity[];
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
      delay: i * 0.07,
      duration: 0.4,
      ease: "easeOut",
    },
  }),
};

interface PackCardProps {
  pack: GachaPack;
  onOpenPack: (packId: string) => void;
  isLoadingThisPack: boolean;
}

const PackCard: React.FC<PackCardProps> = ({ pack, onOpenPack, isLoadingThisPack }) => {
  const [faceCardImage, setFaceCardImage] = useState<string | null>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const GENERIC_PACK_PLACEHOLDER = 'https://placehold.co/200x300/1a1b26/e0e7ef?text=Booster+Pack&font=orbitron';

  useEffect(() => {
    let isMounted = true;
    const loadFaceCardImage = async () => {
      if (!pack.faceCardCollectibleId) {
        if (pack.packImageUrl) setFaceCardImage(pack.packImageUrl);
        else setFaceCardImage(GENERIC_PACK_PLACEHOLDER);
        if (isMounted) setIsLoadingImage(false);
        return;
      }

      if(isMounted) setIsLoadingImage(true);
      const faceCollectible = SAMPLE_COLLECTIBLES.find(c => c.id === pack.faceCardCollectibleId);
      if (faceCollectible && faceCollectible.originalMalId && faceCollectible.originalType) {
        try {
          let details: Anime | Manga | null = null;
          if (faceCollectible.originalType === 'anime') {
            details = await getAnimeDetails(faceCollectible.originalMalId, undefined, true);
          } else {
            details = await getMangaDetails(faceCollectible.originalMalId, undefined, true);
          }
          if (isMounted) {
            if (details?.imageUrl) {
              setFaceCardImage(details.imageUrl);
            } else if (faceCollectible.imageUrl && faceCollectible.imageUrl !== 'https://placehold.co/300x400.png?text=NoArt&font=lora') {
              setFaceCardImage(faceCollectible.imageUrl); // Parody art as fallback
            } else if (pack.packImageUrl) {
              setFaceCardImage(pack.packImageUrl); // Pack art as next fallback
            }
             else {
              setFaceCardImage(GENERIC_PACK_PLACEHOLDER);
            }
          }
        } catch (error) {
          console.error(`[PackCard] Error fetching face card details for ${pack.name}:`, error);
          if (isMounted) setFaceCardImage(pack.packImageUrl || GENERIC_PACK_PLACEHOLDER);
        }
      } else if (pack.packImageUrl) {
        setFaceCardImage(pack.packImageUrl);
      } else {
        setFaceCardImage(GENERIC_PACK_PLACEHOLDER);
      }
      if (isMounted) setIsLoadingImage(false);
    };

    loadFaceCardImage();
    return () => { isMounted = false; };
  }, [pack]);

  return (
    <Card className="glass-deep shadow-xl border-border/50 flex flex-col overflow-hidden hover:border-primary/50 transition-all aspect-[5/7] group">
      <CardHeader className="p-0 relative flex-grow">
        {isLoadingImage ? (
          <Skeleton className="absolute inset-0 bg-muted/30" />
        ) : (
          <Image
            src={faceCardImage || GENERIC_PACK_PLACEHOLDER}
            alt={`${pack.name} face card`}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 18vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="gacha pack art"
            onError={(e) => (e.currentTarget.src = GENERIC_PACK_PLACEHOLDER)}
          />
        )}
         <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
        <CardTitle className="absolute bottom-1.5 left-2 right-2 z-10 text-xs sm:text-sm font-bold text-primary-foreground line-clamp-2 shadow-text group-hover:text-primary transition-colors">
            {pack.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 text-center flex-shrink-0">
        <Button
          onClick={() => onOpenPack(pack.id)}
          disabled={isLoadingThisPack}
          className="w-full fiery-glow-hover text-xs py-1.5 h-auto"
          size="sm"
        >
          {isLoadingThisPack ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <ShoppingBag size={14} className="mr-1.5"/>}
          Open Pack ({GACHA_ROLL_SIZE})
        </Button>
      </CardContent>
    </Card>
  );
};
PackCard.displayName = 'PackCard';


export default function GachaPage() {
  const [pulledCollectibles, setPulledCollectibles] = useState<Collectible[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");

  const [isFusionModalOpen, setIsFusionModalOpen] = useState(false);
  const [fusionCandidates, setFusionCandidates] = useState<Collectible[]>([]);
  const [selectedForFusion, setSelectedForFusion] = useState<Collectible[]>([]);
  const [openingPackId, setOpeningPackId] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleRoll = async (packId?: string) => {
    if (!isClient) return;
    setIsLoading(true);
    if (packId) setOpeningPackId(packId); else setOpeningPackId(null); // Track which pack is opening
    setPulledCollectibles(null);
    setSelectedForFusion([]);
    
    const packBeingOpened = packId ? SAMPLE_PACKS.find(p => p.id === packId) : null;
    const packNameForToast = packBeingOpened ? packBeingOpened.name : 'General Pool';

    await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API call delay

    const result = await performGachaRoll(packId); // Pass packId to service

    setOpeningPackId(null); // Reset after roll

    if ('error' in result) {
      toast({
        title: 'Gacha Roll Failed',
        description: result.error,
        variant: 'destructive',
      });
      setPulledCollectibles([]);
    } else {
      setPulledCollectibles(result.collectibles);
      setFusionCandidates(result.collectibles); // Set candidates for fusion from this pull
      toast({
        title: `${packNameForToast} Opened!`,
        description: `You pulled ${GACHA_ROLL_SIZE} new collectibles!`,
        variant: "default",
      });
    }
    setIsLoading(false);
  };

  const handleSelectForFusion = (collectible: Collectible) => {
    setSelectedForFusion(prev => {
        const isAlreadySelected = prev.find(c => c.id === collectible.id);
        if (isAlreadySelected) {
            return prev.filter(c => c.id !== collectible.id);
        }
        if (prev.length < 2) {
            return [...prev, collectible];
        }
        toast({title:"Max Selection", description:"Select only two cards for fusion.", variant: "default"});
        return prev;
    });
  };

  const handleAttemptFusion = () => {
    if (selectedForFusion.length !== 2) {
      toast({ title: "Select Two Cards", description: "Please select exactly two cards to attempt fusion.", variant: "destructive" });
      return;
    }

    const card1 = selectedForFusion[0];
    const card2 = selectedForFusion[1];

    if (card1.rarity === 'Event' || card2.rarity === 'Event') {
        toast({ title: "Fusion Blocked", description: "Event cards cannot be used in fusion.", variant: "destructive" });
        setIsFusionModalOpen(false);
        setSelectedForFusion([]);
        return;
    }
    
    const rarity1Value = RARITY_NUMERICAL_VALUE[card1.rarity];
    const rarity2Value = RARITY_NUMERICAL_VALUE[card2.rarity];
    let outputRarityIndex: number;

    if (rarity1Value === rarity2Value) {
        outputRarityIndex = Math.min(rarity1Value + 1, RARITY_ORDER.length - 1);
    } else {
        const higherIndex = Math.max(rarity1Value, rarity2Value);
        const lowerIndex = Math.min(rarity1Value, rarity2Value);
        if (higherIndex - lowerIndex >= 2) { // e.g. Common + Ultra Rare
             outputRarityIndex = Math.min(lowerIndex + 1, RARITY_ORDER.length - 1); // Step above lower, capped
        } else { // Adjacent rarities
            outputRarityIndex = Math.min(higherIndex, RARITY_ORDER.length - 1);
        }
    }
    const outputRarityTier = RARITY_ORDER[outputRarityIndex];

    const potentialResults = SAMPLE_COLLECTIBLES.filter(c =>
        c.rarity === outputRarityTier &&
        c.id !== card1.id &&
        c.id !== card2.id &&
        c.rarity !== 'Event'
    );

    if (potentialResults.length > 0) {
        const fusedCollectible = { ...potentialResults[Math.floor(Math.random() * potentialResults.length)] };
        toast({
            title: "Fusion Success!",
            description: `Your cards fused into ${fusedCollectible.parodyTitle} (${fusedCollectible.rarity})!`,
            variant: "default",
            duration: 5000,
        });
        setPulledCollectibles(prev => {
            if (!prev) return [fusedCollectible];
            const remainingFromPull = prev.filter(p => p.id !== card1.id && p.id !== card2.id);
            const newDisplayedSet = [fusedCollectible, ...remainingFromPull];
            const cardsToShow = Math.min(GACHA_ROLL_SIZE -1, newDisplayedSet.length); // Show N-1 cards + fused
            return newDisplayedSet.slice(0, cardsToShow);
        });
    } else {
        toast({ title: "Fusion Fizzled...", description: `No suitable ${outputRarityTier} card could be formed from this combination. The cards remain.`, variant: "destructive" });
    }

    setIsFusionModalOpen(false);
    setSelectedForFusion([]);
  };


  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 flex flex-col items-center min-h-screen">
      <div className="text-center mb-6 sm:mb-8 w-full">
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
        <TabsList className="grid w-full grid-cols-2 glass-deep">
          <TabsTrigger value="general" className="data-[state=active]:fiery-glow-tab">
            <List className="mr-2"/> General Roll
          </TabsTrigger>
          <TabsTrigger value="packs" className="data-[state=active]:fiery-glow-tab">
            <Grid className="mr-2"/> Booster Packs
          </TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="mt-6">
          <div className="flex flex-col items-center gap-3 mb-4 sm:mb-6">
              <Button
                  onClick={() => handleRoll()}
                  disabled={isLoading || !isClient}
                  size="lg"
                  className="px-5 py-3 sm:px-6 sm:py-4 text-sm sm:text-md fiery-glow-hover sf-bansho-button rounded-xl relative overflow-hidden"
                  aria-label={`Roll for ${GACHA_ROLL_SIZE} collectibles from general pool`}
              >
                  {(isLoading && !openingPackId) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  General Roll ({GACHA_ROLL_SIZE} Cards)
              </Button>
          </div>
        </TabsContent>
        <TabsContent value="packs" className="mt-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-center mb-3 sm:mb-4 text-primary sf-text-glow">Featured Packs</h2>
          {SAMPLE_PACKS.length > 0 ? (
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  {SAMPLE_PACKS.map(pack => (
                      <PackCard key={pack.id} pack={pack} onOpenPack={() => handleRoll(pack.id)} isLoadingThisPack={isLoading && openingPackId === pack.id} />
                  ))}
              </div>
          ) : (
              <p className="text-center text-muted-foreground">No special packs available right now. Check back later!</p>
          )}
        </TabsContent>
      </Tabs>


      {isLoading && openingPackId && (
          <div className="w-full text-center my-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-muted-foreground">Shuffling the {SAMPLE_PACKS.find(p=>p.id === openingPackId)?.name || 'pack'}...</p>
          </div>
      )}

      {pulledCollectibles && pulledCollectibles.length > 0 && !isLoading && (
        <div className="mb-6 mt-4">
            <Button onClick={() => setIsFusionModalOpen(true)} variant="outline" className="neon-glow-hover glass">
                <Combine size={18} className="mr-2"/> Attempt Card Fusion
            </Button>
        </div>
      )}

      {isLoading && !openingPackId && ( // General roll loading skeleton
        <div className="w-full grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
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

      {pulledCollectibles && !isLoading && (
        <motion.div
          className="w-full grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4" // Consistent 4 columns for pulled cards display
          variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
          initial="hidden"
          animate="visible"
        >
          {pulledCollectibles.map((collectible, index) => (
            <motion.div key={`${collectible.id}-${index}-${Date.now()}`} variants={cardVariants} custom={index}>
                 <GachaCard collectible={collectible} />
            </motion.div>
          ))}
        </motion.div>
      )}

       {!pulledCollectibles && !isLoading && !openingPackId && isClient && activeTab === 'general' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center text-muted-foreground mt-8 p-6 border border-dashed border-border/50 rounded-lg glass max-w-md w-full"
          >
            <p className="text-lg">Your next legendary (or hilariously common) pulls await!</p>
            <p className="text-sm mt-1">Click the "General Roll" button to try your luck.</p>
          </motion.div>
        )}

        <Separator className="my-8 md:my-12" />

        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <DropRatesDisplay />
            <RarityVisualGuide />
        </div>

        <Dialog open={isFusionModalOpen} onOpenChange={setIsFusionModalOpen}>
            <DialogContent className="glass-deep sm:max-w-md md:max-w-lg lg:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Attempt Card Fusion</DialogTitle>
                    <DialogDescription>
                        Select 2 cards from your recent pull to attempt fusion. Event cards cannot be used in fusion.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[50vh] -mx-2 px-2">
                    <div className="grid grid-cols-2 gap-3 py-4">
                        {fusionCandidates.map(collectible => (
                            <GachaCard
                                key={`fusion-${collectible.id}`}
                                collectible={collectible}
                                onSelectForFusion={handleSelectForFusion}
                                isSelectedForFusion={selectedForFusion.some(c => c.id === collectible.id)}
                                isFusionMode={true}
                            />
                        ))}
                    </div>
                </ScrollArea>
                <DialogFooter className="sm:justify-between gap-2">
                    <div className="text-xs text-muted-foreground">
                        Selected: {selectedForFusion.length}/2
                    </div>
                    <div className="flex gap-2">
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                            type="button"
                            onClick={handleAttemptFusion}
                            disabled={selectedForFusion.length !== 2 || isLoading}
                            className="fiery-glow-hover"
                        >
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Fuse Cards'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  );
}
