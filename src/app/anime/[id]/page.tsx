
'use client';

import React, { useEffect, useState, useRef, type ReactElement } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { getAnimeDetails, Anime, getAnimeRecommendations } from '@/services/anime';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Star, Tv, CalendarDays, Clock, Film, ExternalLink, AlertCircle, Youtube, PlayCircle, ThumbsUp, ListEnd, Loader2, Search, Layers, Library, BookOpen, Sparkles, Users, Link2 as LinkIconLucide, Drama, ArrowRight, Compass } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ItemCard, SkeletonItemCard } from '@/components/shared/ItemCard';
import { getMoodBasedRecommendations } from '@/ai/flows/mood-based-recommendations';
import { useToast } from '@/hooks/use-toast';
// Import the specific episode fetchers we want to use
import { fetchFromAnimeSuge, fetchEpisodesFromAnimeSuge } from '@/layers/animesuge';
import { fetchFromAniWave, fetchEpisodesFromAniWave } from '@/layers/aniwave';
// Add other layers if needed
import LongHoverButtonWrapper, { type AlternativeOption as LongHoverAlternativeOption } from '@/components/shared/LongHoverButtonWrapper.tsx';
import { useIsMobile } from '@/hooks/use-mobile';
import { assignAnimeToMood, removeAnimeFromMood, getMoodsForAnime } from '@/services/moods.ts';
import { MOOD_FILTERS_ANIME, type Mood } from '@/config/moods';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';


// --- Interfaces ---
// Interface for the unified episode structure used in the component state
interface Episode {
  id: string;
  number: number;
  title: string;
  link: string; // Internal link to the watch page
  providerLink: string; // Link to the episode on the provider's site
  source: string; // Name of the provider (e.g., 'AnimeSuge', 'AniWave')
}

// Helper function to format status
const formatStatus = (status: string | null): string => {
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
};

// Helper to format score with icon
const ScoreDisplay = ({ score }: { score: number | null }) => {
    if (score === null || score === undefined) return <span className="text-sm text-muted-foreground">N/A</span>;
    const scoreColor = score >= 8 ? 'text-green-400' : score >= 6 ? 'text-yellow-400' : 'text-red-400';
    return (
        <span className={`flex items-center gap-1 font-semibold ${scoreColor}`}>
            <Star size={16} className="fill-current" /> {score.toFixed(1)}
        </span>
    );
};

// Helper to render a horizontal scrollable section
const renderHorizontalSection = (
    title: string,
    icon: React.ElementType,
    items: Anime[],
    isLoading: boolean,
    emptyMessage: string = "Nothing to show here right now.",
    itemComponent: React.FC<{ item: any }> = ItemCard,
    skeletonComponent: React.FC = SkeletonItemCard
) => {
    const validItems = Array.isArray(items) ? items : [];

    return (
        <section className="mb-8">
            <div className="flex items-center justify-between mb-3 md:mb-4 px-0">
                <h3 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
                    {React.createElement(icon, { className: "text-primary w-5 h-5 md:w-6 md:h-6" })} {title}
                </h3>
            </div>
            <div className="relative">
                <div className={cn(
                    "flex space-x-3 md:space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent",
                    "snap-x snap-mandatory"
                )}>
                    {isLoading && validItems.length === 0
                        ? Array.from({ length: 5 }).map((_, index) => React.createElement(skeletonComponent, { key: `${title}-skel-${index}` }))
                        : validItems.length > 0
                            ? validItems.map((item, index) => item && item.id ? React.createElement(itemComponent, { key: `${item.type}-${item.id}-${index}`, item: item }) : null)
                            : !isLoading && <p className="text-center text-muted-foreground italic px-4 py-5 w-full">{emptyMessage}</p>}
                </div>
            </div>
        </section>
    );
};


export default function AnimeDetailPage() {
  const params = useParams();
  const malId = params.id ? parseInt(params.id as string, 10) : NaN;
  const { toast } = useToast();
  const episodesSectionRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const [anime, setAnime] = useState<Anime | null>(null);
  const [recommendations, setRecommendations] = useState<Anime[]>([]);
  const [namiRecommendations, setNamiRecommendations] = useState<Anime[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [activeSource, setActiveSource] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [loadingNamiRecs, setLoadingNamiRecs] = useState(true);
  const [loadingEpisodes, setLoadingEpisodes] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [namiError, setNamiError] = useState<string | null>(null);
  const [episodeError, setEpisodeError] = useState<string | null>(null);

  const [assignedMoods, setAssignedMoods] = useState<string[]>([]);
  const [isMoodsDialogOpen, setIsMoodsDialogOpen] = useState(false);
  const [loadingMoods, setLoadingMoods] = useState(false);

  useEffect(() => {
    if (isNaN(malId)) {
      setError('Invalid Anime ID.');
      setLoading(false); setLoadingRecs(false); setLoadingNamiRecs(false); setLoadingEpisodes(false); setLoadingMoods(false);
      return;
    }

    async function fetchAllData() {
      setLoading(true); setLoadingRecs(true); setLoadingNamiRecs(true); setLoadingEpisodes(true); setLoadingMoods(true);
      setError(null); setNamiError(null); setEpisodeError(null);
      setAnime(null); setRecommendations([]); setNamiRecommendations([]); setEpisodes([]); setActiveSource(null); setAssignedMoods([]);

      try {
        console.log(`Fetching main anime details for MAL ID: ${malId}`);
        const fetchedAnime = await getAnimeDetails(malId);
        if (!fetchedAnime) {
          setError('Anime details not found.'); notFound(); return;
        }
        setAnime(fetchedAnime);
        setLoading(false);
        console.log(`Successfully fetched details for: ${fetchedAnime.title}`);

        getAnimeRecommendations(malId).then(recs => setRecommendations(recs)).catch(err => console.error("Jikan Recs failed:", err)).finally(() => setLoadingRecs(false));

        const namiInput = { mood: "Similar to this", watchHistory: [fetchedAnime.title], profileActivity: `Interested in anime like ${fetchedAnime.title}, genres: ${fetchedAnime.genres.map(g => g.name).join(', ')}.` };
        getMoodBasedRecommendations(namiInput).then(namiRecs => setNamiRecommendations(namiRecs.animeRecommendations || [])).catch(err => { console.error("Nami Recs failed:", err); setNamiError("Nami couldn't find recommendations."); }).finally(() => setLoadingNamiRecs(false));
        
        getMoodsForAnime(malId).then(moods => setAssignedMoods(moods)).catch(err => console.error("Failed to fetch assigned moods:", err)).finally(() => setLoadingMoods(false));

      } catch (err: any) {
        console.error(`[AnimeDetailPage] Error fetching core data for MAL ID ${malId}:`, err);
        setError(err.message || 'Failed to load anime data.');
        setAnime(null); setRecommendations([]); setNamiRecommendations([]); setEpisodes([]); setActiveSource(null); setAssignedMoods([]);
        setLoading(false); setLoadingRecs(false); setLoadingNamiRecs(false); setLoadingEpisodes(false); setLoadingMoods(false);
      }
    }

    fetchAllData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [malId]);

   useEffect(() => {
       if (!anime || !anime.title) {
           if (!loading) setLoadingEpisodes(false);
           return;
       }

       const fetchAllEpisodes = async () => {
           setLoadingEpisodes(true);
           setEpisodeError(null);
           setEpisodes([]);
           setActiveSource(null);
           const animeTitle = anime.title;
           console.log(`[AnimeDetailPage] Attempting to fetch episodes for title: "${animeTitle}"`);

           const providers = [
                { name: 'AnimeSuge', searchFn: fetchFromAnimeSuge, fetchFn: fetchEpisodesFromAnimeSuge },
                { name: 'AniWave', searchFn: fetchFromAniWave, fetchFn: fetchEpisodesFromAniWave },
           ];

           let foundEpisodes: any[] | null = null;
           let sourceUsed: string | null = null;
           let providerErrors: { name: string, error: string }[] = [];

           for (const provider of providers) {
               console.log(`[AnimeDetailPage] Trying provider: ${provider.name} for "${animeTitle}"`);
               try {
                   const searchResult = await provider.searchFn(animeTitle);
                   if (!searchResult || !searchResult.link) {
                       providerErrors.push({ name: provider.name, error: "Anime not found on provider." });
                       continue;
                   }
                   console.log(`[AnimeDetailPage] Found link on ${provider.name}: ${searchResult.link}`);
                   const providerEpisodes = await provider.fetchFn(searchResult);

                   if (providerEpisodes && providerEpisodes.length > 0) {
                        foundEpisodes = providerEpisodes;
                        sourceUsed = provider.name;
                        console.log(`[AnimeDetailPage] Successfully fetched ${foundEpisodes.length} episodes from ${provider.name}.`);
                        break;
                   } else {
                       providerErrors.push({ name: provider.name, error: "No episodes found on provider page." });
                   }
               } catch (providerError: any) {
                   console.error(`[AnimeDetailPage] Error from provider ${provider.name}:`, providerError);
                   providerErrors.push({ name: provider.name, error: providerError.message || "Unknown error from provider" });
               }
           }

           if (foundEpisodes && sourceUsed) {
               const mappedEpisodes = foundEpisodes.map((ep): Episode | null => {
                   if (!ep || ep.number == null || !ep.link) return null;
                   const episodeId = ep.id || `${animeTitle.replace(/\s+/g, '-')}-ep-${ep.number}`;
                   return {
                       id: episodeId,
                       number: ep.number,
                       title: ep.title || `Episode ${ep.number}`,
                       link: `/anime/watch/${malId}/${episodeId}?source=${encodeURIComponent(sourceUsed)}&providerLink=${encodeURIComponent(ep.link)}`,
                       providerLink: ep.link,
                       source: sourceUsed,
                   };
               }).filter((ep): ep is Episode => ep !== null);

               setEpisodes(mappedEpisodes);
               setActiveSource(sourceUsed);
               setEpisodeError(null);
               console.log(`[AnimeDetailPage] Mapped ${mappedEpisodes.length} episodes from ${sourceUsed}.`);
           } else {
               console.error(`[AnimeDetailPage] Failed to fetch episodes from any provider for "${animeTitle}".`);
               setEpisodeError("Could not load episode information from available sources.");
               setEpisodes([]);
               setActiveSource(null);
           }
           setLoadingEpisodes(false);
       };

       fetchAllEpisodes();
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [anime]);

  const handleMoodToggle = async (moodId: string, isCurrentlyAssigned: boolean) => {
    if (!anime) return;
    setLoadingMoods(true);
    try {
      if (isCurrentlyAssigned) {
        await removeAnimeFromMood(anime.mal_id, moodId);
        setAssignedMoods(prev => prev.filter(id => id !== moodId));
        toast({ title: "Mood Untagged", description: `Removed from ${MOOD_FILTERS_ANIME.find(m=>m.id===moodId)?.name || 'mood'}.` });
      } else {
        await assignAnimeToMood(anime.mal_id, moodId);
        setAssignedMoods(prev => [...prev, moodId]);
        toast({ title: "Mood Tagged", description: `Added to ${MOOD_FILTERS_ANIME.find(m=>m.id===moodId)?.name || 'mood'}.` });
      }
    } catch (err: any) {
      toast({ title: "Error Updating Moods", description: err.message || "Could not update mood assignment.", variant: "destructive" });
    } finally {
      setLoadingMoods(false);
    }
  };


  if (loading && !anime) {
    return <AnimeDetailSkeleton />;
  }

  if (error && !loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
         <Alert variant="destructive" className="max-w-md glass">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Anime</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
         </Alert>
      </div>
    );
  }

  if (!anime) {
     return (
       <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
         <Alert variant="destructive" className="max-w-md glass">
           <AlertCircle className="h-4 w-4" />
           <AlertTitle>Loading Error</AlertTitle>
           <AlertDescription>Could not load anime details. Please try again later.</AlertDescription>
         </Alert>
       </div>
     );
   }

  const animePaheSearchUrl = `https://animepahe.ru/search?q=${encodeURIComponent(anime.title)}`;
  const animeWatchOptions: (LongHoverAlternativeOption)[] = [
    { label: "Crunchyroll", href: `https://www.crunchyroll.com/search?q=${encodeURIComponent(anime.title)}`, icon: Tv },
    { label: "HiAnime", href: `https://hianime.to/search?keyword=${encodeURIComponent(anime.title)}`, icon: Tv },
    { label: "AniWave", href: `https://aniwave.to/filter?keyword=${encodeURIComponent(anime.title)}`, icon: Tv },
    { label: "AnimeSuge", href: `https://animesuge.to/filter?keyword=${encodeURIComponent(anime.title)}`, icon: Tv },
    { label: "9Anime (Google)", href: `https://www.google.com/search?q=site%3A9animetv.to+${encodeURIComponent(anime.title)}`, icon: Search },
  ];


  return ( 
    <div className="container mx-auto px-4 py-8">
        {/* Background Image Section */}
        <div className="absolute inset-x-0 top-0 h-[40vh] md:h-[60vh] -z-10 overflow-hidden">
             {anime.imageUrl && (
                 <Image
                     src={anime.imageUrl}
                     alt={`${anime.title} backdrop`}
                     fill
                     className="object-cover object-top opacity-15 blur-md scale-110" 
                     aria-hidden="true"
                     priority
                 />
             )}
            <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/80 to-background" />
        </div>

        <div className="relative mt-16 md:mt-32"> 
            <Card className="overflow-visible glass border-primary/20 shadow-xl backdrop-blur-xl bg-card/60 mb-12">
                <div className="flex flex-col md:flex-row gap-6 md:gap-10 p-4 md:p-8">
                    <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 mx-auto md:mx-0 text-center -mt-24 md:-mt-32 z-10"> 
                        <Card className="overflow-hidden aspect-[2/3] relative shadow-lg neon-glow border-2 border-primary/50 w-48 md:w-full mx-auto"> 
                           {anime.imageUrl ? (
                              <Image
                                src={anime.imageUrl}
                                alt={anime.title}
                                fill
                                sizes="(max-width: 768px) 192px, 25vw" 
                                className="object-cover"
                                priority
                              />
                           ) : (
                               <div className="h-full w-full bg-muted flex items-center justify-center">
                                  <Tv className="w-16 h-16 text-muted-foreground opacity-50" />
                               </div>
                           )}
                        </Card>
                        <div className="flex flex-col gap-3 mt-4">
                            <Button
                                size="lg"
                                className="w-full neon-glow-hover"
                                onClick={() => episodesSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                            >
                                <PlayCircle size={18} className="mr-2"/> Watch Episodes
                            </Button>

                           {isMobile === undefined ? (
                                <Skeleton className="h-9 w-full rounded-md" />
                            ) : (
                                <LongHoverButtonWrapper
                                    onPrimaryAction={() => window.open(animePaheSearchUrl, '_blank')}
                                    alternativeOptions={animeWatchOptions}
                                    buttonLabel={`Search ${anime.title} on AnimePahe and other sites`}
                                >
                                     <Button variant="outline" size="sm" className="w-full neon-glow-hover">
                                        <span> Watch on AnimePahe </span>
                                    </Button>
                                </LongHoverButtonWrapper>
                            )}

                           {anime.url && (
                              <Button variant="outline" size="sm" asChild className="w-full neon-glow-hover">
                                  <Link href={anime.url} target="_blank" rel="noopener noreferrer">
                                      View on MyAnimeList <ExternalLink size={14} className="ml-2" />
                                  </Link>
                              </Button>
                           )}
                           {anime.trailer?.url && (
                              <Button variant="secondary" size="sm" asChild className="w-full neon-glow-hover">
                                 <Link href={anime.trailer.url} target="_blank" rel="noopener noreferrer">
                                       Watch Trailer <Youtube size={16} className="ml-2"/>
                                 </Link>
                              </Button>
                           )}
                           <Button variant="outline" size="sm" onClick={() => setIsMoodsDialogOpen(true)} className="w-full neon-glow-hover">
                                <Drama size={16} className="mr-2"/> Tag Moods
                           </Button>
                        </div>
                    </div>

                    <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col">
                        <CardHeader className="p-0 mb-3">
                           <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary">{anime.title}</CardTitle>
                        </CardHeader>
                        <div className="flex flex-wrap gap-2 mb-1">
                           {anime.genres?.map(g => (
                             <Badge key={g.mal_id} variant="secondary" className="neon-glow-hover text-xs cursor-default backdrop-blur-sm bg-secondary/60">{g.name}</Badge>
                           ))}
                        </div>
                         <div className="flex flex-wrap gap-2 mb-4">
                            {loadingMoods ? <Skeleton className="h-5 w-20 rounded-full" /> : assignedMoods.map(moodId => {
                                const mood = MOOD_FILTERS_ANIME.find(m => m.id === moodId);
                                return mood ? <Badge key={moodId} variant="outline" className="text-xs border-accent/50 bg-accent/20"><mood.icon size={12} className="mr-1"/>{mood.name}</Badge> : null;
                            })}
                        </div>
                         <Card className="glass p-3 mb-4 border-primary/10">
                           <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                              <div className="flex items-center gap-2" title="Score">
                                 <ScoreDisplay score={anime.score} />
                              </div>
                              <div className="flex items-center gap-1" title="Year">
                                 <CalendarDays size={16} className="text-muted-foreground" /> <span className="text-foreground">{anime.year || 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-1" title="Episodes">
                                <Film size={16} className="text-muted-foreground" /> <span className="text-foreground">{anime.episodes || 'N/A'} Episodes</span>
                              </div>
                               <div className="flex items-center gap-1" title="Status">
                                   <Clock size={16} className="text-muted-foreground" /> <span className="text-foreground">{formatStatus(anime.status)}</span>
                               </div>
                           </div>
                         </Card>
                        <Separator className="my-4 bg-border/50" />
                        <CardContent className="p-0 flex-grow">
                            <div className="space-y-2">
                               <h3 className="text-xl font-semibold mb-2">Synopsis</h3>
                               <ScrollArea className="h-24 pr-3">
                                   <CardDescription className="text-base leading-relaxed prose prose-invert prose-sm max-w-none">
                                       {anime.synopsis || 'No synopsis available.'}
                                   </CardDescription>
                                </ScrollArea>
                            </div>
                            {anime.trailer?.embed_url && (
                               <div className="mt-6 space-y-3">
                                  <h3 className="text-xl font-semibold flex items-center gap-2"><Youtube size={22} className="text-red-600"/> Trailer</h3>
                                   <AspectRatio ratio={16 / 9} className="rounded-lg overflow-hidden border border-border/50 glass shadow-md">
                                        <iframe
                                            src={anime.trailer.embed_url.replace("autoplay=1", "autoplay=0")} 
                                            title={`${anime.title} Trailer`}
                                            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="w-full h-full"
                                            loading="lazy" 
                                        ></iframe>
                                   </AspectRatio>
                               </div>
                            )}
                        </CardContent>
                    </div>
                </div>
            </Card>

            <div ref={episodesSectionRef} id="episodes-section">
                <section className="mb-12">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-semibold flex items-center gap-2"><Film size={24}/> Episodes</h3>
                        {activeSource && <Badge variant="outline" className="text-xs">Source: {activeSource}</Badge>}
                    </div>
                    <Card className="glass p-6 border-border/50">
                        {loadingEpisodes ? (
                            <div className="flex flex-col items-center justify-center text-center h-40">
                                <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                                <p className="text-muted-foreground">Loading episodes...</p>
                            </div>
                        ) : episodeError ? (
                            <Alert variant="destructive" className="glass">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Could Not Load Episodes</AlertTitle>
                                <AlertDescription>{episodeError}</AlertDescription>
                            </Alert>
                        ) : episodes.length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-40">
                                <ListEnd size={40} className="mb-3 opacity-50"/>
                                <p className="font-medium">No Episodes Found</p>
                                <p className="text-sm">Could not find episode information from available sources.</p>
                            </div>
                        ) : (
                            <ScrollArea className="h-64 pr-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {episodes.map(episode => (
                                        <Link
                                            key={episode.id}
                                            href={episode.link}
                                            passHref
                                            legacyBehavior>
                                            <a className="block">
                                                <Card className="cursor-pointer hover:border-primary transition-colors duration-200 glass border-border/50">
                                                    <CardContent className="p-4">
                                                        <p className="font-semibold text-primary truncate">Ep {episode.number}</p>
                                                        {episode.title && !episode.title.toLowerCase().includes(`episode ${episode.number}`) && (
                                                            <p className="text-xs text-muted-foreground truncate mt-1">{episode.title}</p>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </a>
                                        </Link>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </Card>
                </section>
            </div>

            {(loadingNamiRecs || namiRecommendations.length > 0 || namiError) && (
                 <section className="mb-12">
                    <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                        <ThumbsUp size={20} className="text-primary"/> Nami's Picks For You
                    </h3>
                    {namiError && !loadingNamiRecs && (
                         <Alert variant="destructive" className="glass mb-4">
                             <AlertCircle className="h-4 w-4" />
                             <AlertTitle>Nami Error</AlertTitle>
                             <AlertDescription>{namiError}</AlertDescription>
                         </Alert>
                    )}
                     {renderHorizontalSection(
                         "", 
                         () => null, 
                         namiRecommendations,
                         loadingNamiRecs,
                         "Nami couldn't find any recommendations based on this anime right now.",
                         ItemCard,
                         SkeletonItemCard
                     )}
                 </section>
             )}

             {(loadingRecs || recommendations.length > 0) && (
                 renderHorizontalSection(
                     "Related Anime",
                     Tv, 
                     recommendations,
                     loadingRecs,
                     "No related anime found.",
                     ItemCard,
                     SkeletonItemCard
                 )
            )}
        </div>

         <Dialog open={isMoodsDialogOpen} onOpenChange={setIsMoodsDialogOpen}>
            <DialogContent className="glass-deep sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Tag Moods for: {anime.title}</DialogTitle>
                    <DialogDescription>Select the moods that best describe this anime. This helps everyone discover content!</DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] p-1">
                    <div className="space-y-3 py-2 pr-3">
                        {MOOD_FILTERS_ANIME.map(mood => {
                            const isAssigned = assignedMoods.includes(mood.id);
                            return (
                                <div key={mood.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent/10 transition-colors">
                                    <Checkbox
                                        id={`mood-${mood.id}`}
                                        checked={isAssigned}
                                        onCheckedChange={() => handleMoodToggle(mood.id, isAssigned)}
                                        disabled={loadingMoods}
                                    />
                                    <Label htmlFor={`mood-${mood.id}`} className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                        <div className="flex items-center gap-2">
                                            <mood.icon size={18} className={cn(isAssigned ? "text-primary" : "text-muted-foreground")}/>
                                            <span>{mood.name}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">{mood.description}</p>
                                    </Label>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
                <DialogClose asChild>
                    <Button variant="outline" className="mt-4 w-full">Done</Button>
                </DialogClose>
            </DialogContent>
        </Dialog>
    </div>
  );
}

function AnimeDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="absolute inset-x-0 top-0 h-[40vh] md:h-[60vh] -z-10 overflow-hidden">
            <Skeleton className="h-full w-full opacity-10 blur-md scale-110" />
           <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/80 to-background" />
       </div>
       <div className="relative mt-16 md:mt-32">
            <Card className="overflow-visible glass border-primary/20 bg-card/60 mb-12">
               <div className="flex flex-col md:flex-row gap-6 md:gap-10 p-4 md:p-8">
                  <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 mx-auto md:mx-0 text-center -mt-24 md:-mt-32 z-10">
                      <Card className="overflow-hidden aspect-[2/3] relative border-2 border-primary/50 w-48 md:w-full mx-auto">
                          <Skeleton className="h-full w-full" />
                      </Card>
                       <div className="flex flex-col gap-3 mt-4">
                           <Skeleton className="h-10 w-full rounded-md" />
                           <Skeleton className="h-9 w-full rounded-md" />
                           <Skeleton className="h-9 w-full rounded-md" />
                           <Skeleton className="h-9 w-full rounded-md" />
                           <Skeleton className="h-9 w-full rounded-md" />
                       </div>
                  </div>
                  <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col">
                      <CardHeader className="p-0 mb-3">
                          <Skeleton className="h-8 w-3/4 mb-2" /> 
                          <Skeleton className="h-4 w-1/2" /> 
                      </CardHeader>
                      <div className="flex flex-wrap gap-2 mb-4">
                          <Skeleton className="h-6 w-16 rounded-full" />
                          <Skeleton className="h-6 w-20 rounded-full" />
                           <Skeleton className="h-6 w-16 rounded-full" />
                      </div>
                       <Card className="glass p-3 mb-4 border-primary/10">
                         <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
                              <Skeleton className="h-5 w-14" />
                              <Skeleton className="h-5 w-16" />
                              <Skeleton className="h-5 w-24" />
                              <Skeleton className="h-5 w-20" />
                         </div>
                      </Card>
                      <Separator className="my-4 bg-border/50" />
                      <CardContent className="p-0 flex-grow">
                          <div className="space-y-2 mb-6">
                            <Skeleton className="h-7 w-32 mb-2" /> 
                            <div className="h-24 pr-3 space-y-2"> 
                               <Skeleton className="h-4 w-full" />
                               <Skeleton className="h-4 w-full" />
                               <Skeleton className="h-4 w-5/6" />
                            </div>
                          </div>
                           <div className="mt-6 space-y-3">
                               <Skeleton className="h-7 w-28 mb-2" /> 
                               <Skeleton className="aspect-video w-full rounded-lg glass" /> 
                           </div>
                      </CardContent>
                  </div>
               </div>
            </Card>
             <section className="mb-12">
                 <div className="flex justify-between items-center mb-4">
                    <Skeleton className="h-8 w-36" /> 
                    <Skeleton className="h-5 w-20" /> 
                 </div>
                 <Card className="glass p-6"> 
                     <div className="flex flex-col items-center justify-center text-center h-40">
                          <Skeleton className="h-10 w-10 rounded-full mb-3" /> 
                          <Skeleton className="h-5 w-48 mb-2" /> 
                          <Skeleton className="h-4 w-64" /> 
                     </div>
                 </Card>
             </section>
            <section className="mb-12">
                <Skeleton className="h-8 w-48 mb-4" /> 
                 <div className="flex space-x-3 md:space-x-4 overflow-x-auto pb-4">
                    {Array.from({ length: 5 }).map((_, index) => <SkeletonItemCard key={`rec-skel-${index}`} />)}
                </div>
            </section>
             <section>
                <Skeleton className="h-8 w-52 mb-4" /> 
                 <div className="flex space-x-3 md:space-x-4 overflow-x-auto pb-4">
                    {Array.from({ length: 5 }).map((_, index) => <SkeletonItemCard key={`rel-skel-${index}`} />)}
                </div>
            </section>
       </div>
    </div>
  );
}

