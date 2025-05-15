
'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { getAnimeDetails, Anime, getAnimeRecommendations } from '@/services/anime'; // Use Jikan for metadata
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Star, Tv, CalendarDays, Clock, Film, ExternalLink, AlertCircle, Youtube, PlayCircle, ThumbsUp, ListEnd, Loader2, Search } from 'lucide-react'; // Added Search
import { Separator } from '@/components/ui/separator';
import { AspectRatio } from '@/components/ui/aspect-ratio'; // For trailer
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ItemCard, SkeletonItemCard } from '@/components/shared/ItemCard'; // Use shared ItemCard
import { getMoodBasedRecommendations } from '@/ai/flows/mood-based-recommendations';
import { useToast } from '@/hooks/use-toast'; // Import useToast
// Import the specific episode fetchers we want to use
import { fetchFromAnimeSuge, fetchEpisodesFromAnimeSuge } from '@/layers/animesuge';
import { fetchFromAniWave, fetchEpisodesFromAniWave } from '@/layers/aniwave';
import LongPressButtonWrapper, { type AlternativeOption } from '@/components/shared/LongPressButtonWrapper.tsx';

// --- Interfaces ---
// Interface for the unified episode structure used in the component state
interface Episode {
  id: string; // Unique ID for the episode (e.g., "title-ep-1")
  number: number;
  title: string;
  link: string; // Link to the watch page (internal)
  providerLink: string; // Link to the episode page on the source provider
  source: string; // The source provider (e.g., 'AnimeSuge', 'AniWave')
}

// Alternative site options for anime
const animeWatchOptions: AlternativeOption[] = [
    { name: "Crunchyroll", urlTemplate: "https://www.crunchyroll.com/search?q={title}" },
    { name: "HiAnime", urlTemplate: "https://hianime.to/search?keyword={title}" }, // Popular Zoro alternative
    { name: "AniWave", urlTemplate: "https://aniwave.to/filter?keyword={title}" },
    { name: "AnimeSuge", urlTemplate: "https://animesuge.to/filter?keyword={title}" },
    { name: "9Anime (via Google)", urlTemplate: "https://www.google.com/search?q=site%3A9animetv.to+{title}" },
    // Add more as needed
];


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

// Helper to render a horizontal scrollable section - Adjusted to use unified DisplayItem
const renderHorizontalSection = (
    title: string,
    icon: React.ElementType,
    items: Anime[], // Assuming Manga type exists if used
    isLoading: boolean,
    emptyMessage: string = "Nothing to show here right now.",
    itemComponent: React.FC<{ item: any }> = ItemCard, // Use 'any' for now
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
  const episodesSectionRef = useRef<HTMLDivElement>(null); // Ref for scrolling


  const [anime, setAnime] = useState<Anime | null>(null);
  const [recommendations, setRecommendations] = useState<Anime[]>([]);
  const [namiRecommendations, setNamiRecommendations] = useState<Anime[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]); // State for unified episodes
  const [activeSource, setActiveSource] = useState<string | null>(null); // Track which source provided episodes

  const [loading, setLoading] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [loadingNamiRecs, setLoadingNamiRecs] = useState(true);
  const [loadingEpisodes, setLoadingEpisodes] = useState(true); // Loading state for episodes

  const [error, setError] = useState<string | null>(null);
  const [namiError, setNamiError] = useState<string | null>(null);
  const [episodeError, setEpisodeError] = useState<string | null>(null); // Error state for episodes

  // --- Fetch Main Details, Recommendations ---
  useEffect(() => {
    if (isNaN(malId)) {
      setError('Invalid Anime ID.');
      setLoading(false); setLoadingRecs(false); setLoadingNamiRecs(false); setLoadingEpisodes(false);
      return;
    }

    async function fetchCoreData() {
      setLoading(true); setLoadingRecs(true); setLoadingNamiRecs(true); setLoadingEpisodes(true);
      setError(null); setNamiError(null); setEpisodeError(null);
      setAnime(null); setRecommendations([]); setNamiRecommendations([]); setEpisodes([]); setActiveSource(null);

      try {
        // Fetch main details from Jikan
        console.log(`Fetching main anime details for MAL ID: ${malId}`);
        const fetchedAnime = await getAnimeDetails(malId);
        if (!fetchedAnime) {
          setError('Anime details not found.'); notFound(); return;
        }
        setAnime(fetchedAnime);
        setLoading(false);
        console.log(`Successfully fetched details for: ${fetchedAnime.title}`);

        // Fetch Jikan recommendations concurrently
        getAnimeRecommendations(malId).then(recs => setRecommendations(recs)).catch(err => console.error("Jikan Recs failed:", err)).finally(() => setLoadingRecs(false));

        // Fetch Nami AI recommendations concurrently
        const namiInput = { mood: "Similar to this", watchHistory: [fetchedAnime.title], profileActivity: `Interested in anime like ${fetchedAnime.title}, genres: ${fetchedAnime.genres.map(g => g.name).join(', ')}.` };
        getMoodBasedRecommendations(namiInput).then(namiRecs => setNamiRecommendations(namiRecs.animeRecommendations || [])).catch(err => { console.error("Nami Recs failed:", err); setNamiError("Nami couldn't find recommendations."); }).finally(() => setLoadingNamiRecs(false));

      } catch (err: any) {
        console.error(`[AnimeDetailPage] Error fetching core data for MAL ID ${malId}:`, err);
        setError(err.message || 'Failed to load anime data.');
        setAnime(null); setRecommendations([]); setNamiRecommendations([]); setEpisodes([]); setActiveSource(null);
        setLoading(false); setLoadingRecs(false); setLoadingNamiRecs(false); setLoadingEpisodes(false);
      }
    }

    fetchCoreData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [malId]);

   // --- Fetch Episodes Effect (Depends on `anime` state) ---
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
                   providerErrors.push({ name: provider.name, error: providerError.message });
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
               console.error(`[AnimeDetailPage] Failed to fetch episodes from ANY provider for "${animeTitle}". Errors:`, providerErrors);
               setEpisodeError("Could not load episode information from available sources.");
               setEpisodes([]);
               setActiveSource(null);
           }
           setLoadingEpisodes(false);
       };

       fetchAllEpisodes();
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [anime]);


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

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="absolute inset-x-0 top-0 h-[40vh] md:h-[60vh] -z-10 overflow-hidden">
             {anime.imageUrl && (
                 <Image
                     src={anime.imageUrl}
                     alt={`${anime.title} backdrop`}
                     fill
                     className="object-cover object-top opacity-10 blur-md scale-110"
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
                            <LongPressButtonWrapper
                                onPrimaryAction={() => episodesSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                alternativeOptions={animeWatchOptions}
                                itemTitle={anime.title}
                            >
                                <Button size="lg" className="w-full neon-glow-hover">
                                    <PlayCircle size={18} className="mr-2"/> Watch Episodes
                                </Button>
                            </LongPressButtonWrapper>
                            <Button variant="outline" size="sm" asChild className="w-full neon-glow-hover">
                                <Link href={animePaheSearchUrl} target="_blank" rel="noopener noreferrer">
                                    <Search size={14} className="mr-2" /> Watch on AnimePahe
                                </Link>
                            </Button>
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
                        </div>
                    </div>

                    <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col">
                        <CardHeader className="p-0 mb-3">
                           <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary">{anime.title}</CardTitle>
                        </CardHeader>
                        <div className="flex flex-wrap gap-2 mb-4">
                           {anime.genres?.map(g => (
                             <Badge key={g.mal_id} variant="secondary" className="neon-glow-hover text-xs cursor-default backdrop-blur-sm bg-secondary/60">{g.name}</Badge>
                           ))}
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

            <div ref={episodesSectionRef}> {/* Add ref here */}
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
                           <Skeleton className="h-10 w-full rounded-md" /> {/* Watch Episodes Button */}
                           <Skeleton className="h-9 w-full rounded-md" /> {/* AnimePahe Button */}
                           <Skeleton className="h-9 w-full rounded-md" /> {/* MAL Button */}
                           <Skeleton className="h-9 w-full rounded-md" /> {/* Trailer Button */}
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
