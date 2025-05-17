// src/app/gacha/page.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle as CardTitlePrimitive, CardDescription } from '@/components/ui/card';
import { performGachaRoll } from '@/services/collectibles';
import { SAMPLE_COLLECTIBLES, type Collectible, type CollectibleRarity, type GachaPack, SAMPLE_PACKS } from '@/types/collectibles.ts';
import Image from 'next/image';
import { Loader2, Gift, Sparkles, Tag, Info, Star, CalendarDays, Film, Layers, Library, HelpCircle, Percent, Palette, Combine, XCircle, Package, ShoppingBag, Grid, List } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast'; // Import useToast

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

  useEffect(() => {
    const fetchRealDetails = async () => {
      if (!collectible.originalMalId || !collectible.originalType) {
        setIsLoadingDetails(false);
        setErrorDetails('Missing original item ID or type for linking.');
        console.warn(`[GachaCard] Collectible ${collectible.id} missing originalMalId or originalType.`);
        return;
      }
      setIsLoadingDetails(true);
      setErrorDetails(null);
      try {
        let details: Anime | Manga | null = null;
        console.log(`[GachaCard] Fetching details for ${collectible.originalType} ID: ${collectible.originalMalId}`);
        if (collectible.originalType === 'anime') {
          details = await getAnimeDetails(collectible.originalMalId, undefined, true); // noDelay = true
        } else if (collectible.originalType === 'manga') {
          details = await getMangaDetails(collectible.originalMalId, undefined, true); // noDelay = true
        }
        setRealItemDetails(details);
        if (!details) {
            setErrorDetails(`Could not load details for ${collectible.originalType} (ID: ${collectible.originalMalId}) from source.`);
            console.warn(`[GachaCard] Jikan fetch returned null for ${collectible.originalType} ID: ${collectible.originalMalId}`);
        } else {
            console.log(`[GachaCard] Successfully fetched details for ${collectible.originalType} ID: ${collectible.originalMalId}`, details);
        }
      } catch (err) {
        console.error(`[GachaCard] Error fetching details for collectible ${collectible.id} (Original ID: ${collectible.originalMalId}):`, err);
        setErrorDetails(`Could not load details for ${collectible.originalType} (ID: ${collectible.originalMalId}) from source.`);
      } finally {
        setIsLoadingDetails(false);
      }
    };
    fetchRealDetails();
  }, [collectible]);

  const rarityClasses = getRarityColorClasses(collectible.rarity);

  let displayImageUrl = 'https://placehold.co/300x450/0B0C10/E0E7EF?text=Loading&font=poppins'; // Default placeholder

  if (collectible.isEvolvedForm && collectible.imageUrl && collectible.imageUrl !== 'https://placehold.co/300x400.png?text=NoArt&font=lora') {
    displayImageUrl = collectible.imageUrl;
  } else if (realItemDetails?.imageUrl) {
    displayImageUrl = realItemDetails.imageUrl;
  } else if (collectible.imageUrl && collectible.imageUrl !== 'https://placehold.co/300x400.png?text=NoArt&font=lora') {
    displayImageUrl = collectible.imageUrl; // Use parody art if real art isn't available yet or if it's the only one
  }
  
  // Log the URLs for debugging
  console.log(`[GachaCard Debug - ${collectible.parodyTitle}] Original Collectible URL: ${collectible.imageUrl}, Real Item URL: ${realItemDetails?.imageUrl}, Final Display URL: ${displayImageUrl}`);


  const handleCardClick = () => {
    if (isFusionMode && onSelectForFusion) {
      onSelectForFusion(collectible);
    }
    // Card is not a link by default anymore. Link to details is explicit.
  };

  const cardContent = (
    <Card
        className={cn(
          "glass-deep shadow-xl border overflow-hidden h-full flex flex-col transition-all duration-300 ease-in-out group",
          rarityClasses.split(' ')[0], // Base border color from rarity
          isFusionMode && "hover:ring-2 hover:ring-offset-2 hover:ring-offset-background hover:ring-primary cursor-pointer",
          isSelectedForFusion && "ring-2 ring-primary ring-offset-2 ring-offset-background"
        )}
        onClick={handleCardClick}
      >
        <CardHeader className="p-0 relative aspect-[3/4]">
          {isLoadingDetails && !displayImageUrl.startsWith('https://placehold.co/300x450/') ? (
            <Skeleton className="absolute inset-0 bg-muted/30" />
          ) : (
            <Image
              src={displayImageUrl}
              alt={collectible.parodyTitle}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn("object-cover transition-opacity duration-500", (isLoadingDetails && !displayImageUrl.startsWith('https://placehold.co/300x450/')) ? "opacity-30" : "opacity-100", collectible.isEvolvedForm ? 'filter hue-rotate-15 saturate-150' : '')}
              data-ai-hint={collectible.originalType === 'anime' ? "anime art" : "manga art"}
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/300x450/0B0C10/E0E7EF?text=Error&font=poppins'; }}
              priority={false} // Generally false for Gacha cards unless it's a single featured one
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
          <Badge
            className={cn(
              "absolute top-1.5 right-1.5 text-[10px] px-2 py-0.5 font-semibold shadow-md backdrop-blur-sm",
              rarityClasses
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
                            Original: <span className="text-primary hover:underline">{realItemDetails.title}</span>
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
                                    View Original <Info size={10} />
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

  // The card itself is not a link anymore. Linking is done via the explicit "View Original" button.
  return <div className="w-full group">{cardContent}</div>;
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
  isLoading: boolean;
}

const PackCard: React.FC<PackCardProps> = ({ pack, onOpenPack, isLoading }) => {
  const displayImageUrl = pack.packImageUrl || 'https://placehold.co/200x300.png?text=Pack&font=orbitron';

  return (
    <Card className="glass-deep shadow-lg border-border/50 flex flex-col overflow-hidden hover:border-primary/50 transition-all aspect-[2/3] group">
      <CardHeader className="p-0 relative flex-grow">
        <Image
          src={displayImageUrl}
          alt={pack.name}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 18vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          data-ai-hint="gacha pack art"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-2 left-2 right-2 p-2 z-10">
            <CardTitle className="text-sm font-bold text-primary-foreground line-clamp-2 shadow-text group-hover:text-primary transition-colors">
                {pack.name}
            </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-2 text-center flex-shrink-0">
        <Button
          onClick={() => onOpenPack(pack.id)}
          disabled={isLoading}
          className="w-full fiery-glow-hover text-xs py-1.5 h-auto"
          size="sm"
        >
          {isLoading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <ShoppingBag size={14} className="mr-1.5"/>}
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
  const [openingPackName, setOpeningPackName] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleRoll = async (packId?: string) => {
    if (!isClient) return;
    setIsLoading(true);
    setPulledCollectibles(null);
    setSelectedForFusion([]);
    const pack = packId ? SAMPLE_PACKS.find(p => p.id === packId) : null;
    const packName = pack ? pack.name : 'General Pool';
    setOpeningPackName(packName);

    await new Promise(resolve => setTimeout(resolve, 700));

    // Pity system and user coin logic are disabled for now.
    const result = await performGachaRoll(null, packId); // Pass null for userId

    setOpeningPackName(null);

    if ('error' in result) {
      toast({
        title: 'Gacha Roll Failed',
        description: result.error,
        variant: 'destructive',
      });
      setPulledCollectibles([]);
    } else {
      setPulledCollectibles(result.collectibles);
      setFusionCandidates(result.collectibles);
      toast({
        title: 'Gacha Roll Success!',
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
        if (higherIndex - lowerIndex >= 2 && lowerIndex + 1 < RARITY_ORDER.length) {
            outputRarityIndex = lowerIndex + 1;
        } else {
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
            if (!prev) return [fusedCollectible]; // Should not happen if fusion modal is open
            const remaining = prev.filter(p => p.id !== card1.id && p.id !== card2.id);
            const newPulls = [fusedCollectible, ...remaining];
            const cardsToShow = Math.min(GACHA_ROLL_SIZE, newPulls.length);
            return newPulls.slice(0, cardsToShow);
        });
    } else {
        toast({ title: "Fusion Fizzled...", description: `No suitable ${outputRarityTier} card could be formed. The cards remain.`, variant: "destructive" });
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
                  {(isLoading && !openingPackName) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  General Roll ({GACHA_ROLL_SIZE} Cards)
              </Button>
          </div>
        </TabsContent>
        <TabsContent value="packs" className="mt-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-center mb-3 sm:mb-4 text-primary sf-text-glow">Featured Packs</h2>
          {SAMPLE_PACKS.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                  {SAMPLE_PACKS.map(pack => (
                      <PackCard key={pack.id} pack={pack} onOpenPack={() => handleRoll(pack.id)} isLoading={isLoading && openingPackName === pack.name} />
                  ))}
              </div>
          ) : (
              <p className="text-center text-muted-foreground">No special packs available right now. Check back later!</p>
          )}
        </TabsContent>
      </Tabs>


      {openingPackName && isLoading && (
          <div className="w-full text-center my-6">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-muted-foreground">Shuffling the {openingPackName}...</p>
          </div>
      )}

      {pulledCollectibles && pulledCollectibles.length > 0 && !isLoading && !openingPackName && (
        <div className="mb-6">
            <Button onClick={() => setIsFusionModalOpen(true)} variant="outline" className="neon-glow-hover glass">
                <Combine size={18} className="mr-2"/> Attempt Card Fusion
            </Button>
        </div>
      )}

      {!openingPackName && isLoading && (
        <div className="w-full grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
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

      {pulledCollectibles && !isLoading && !openingPackName && (
        <motion.div
          className="w-full grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4"
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

       {!pulledCollectibles && !isLoading && !openingPackName && isClient && activeTab === 'general' && (
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
