
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { getAnimeDetails, Anime, getAnimeRecommendations } from '@/services/anime'; // Use Jikan-based service
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Star, Tv, CalendarDays, Clock, Film, ExternalLink, AlertCircle, Youtube, VideoOff, Sparkles, ArrowRight, MessageSquare, User, BookOpen } from 'lucide-react'; // Added BookOpen
import { Separator } from '@/components/ui/separator';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { ItemCard, SkeletonItemCard } from '@/components/shared/ItemCard'; // Use shared ItemCard
import { getMoodBasedRecommendations } from '@/ai/flows/mood-based-recommendations';
import { ListEnd } from 'lucide-react'; // Import ListEnd icon
import { useToast } from '@/hooks/use-toast'; // Import useToast

interface Episode {
  id: string; // Use episode session ID from AnimePahe
  number: number;
  title: string;
  link: string; // Keep this for compatibility if needed, but prefer id
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

// Helper to render a horizontal scrollable section - Adjusted to use unified DisplayItem
const renderHorizontalSection = (
    title: string,
    icon: React.ElementType,
    items: Anime[] | null | undefined, // Expecting Anime[] for recommendations
    isLoading: boolean,
    emptyMessage: string = "Nothing to show here right now.",
    itemComponent: React.FC<{ item: Anime }> = ItemCard, // ItemCard expects Anime/Manga directly
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
                            : !isLoading && <p className="text-center text-muted-foreground italic px-4 py-5 w-full">{emptyMessage}</p> // Add w-full here
                          }
                </div>
            </div>
        </section>
    );
};


export default function AnimeDetailPage() {
  const params = useParams();
  const malId = params.id ? parseInt(params.id as string, 10) : NaN;
  const { toast } = useToast();

  const [anime, setAnime] = useState<Anime | null>(null);
  const [animePaheId, setAnimePaheId] = useState<string | null>(null); // Store AnimePahe internal ID
  const [recommendations, setRecommendations] = useState<Anime[]>([]);
  const [namiRecommendations, setNamiRecommendations] = useState<Anime[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]); // State for episodes

  const [loading, setLoading] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [loadingNamiRecs, setLoadingNamiRecs] = useState(true);
  const [loadingEpisodes, setLoadingEpisodes] = useState(true); // Loading state for episodes

  const [error, setError] = useState<string | null>(null);
  const [namiError, setNamiError] = useState<string | null>(null);
  const [episodeError, setEpisodeError] = useState<string | null>(null); // Error state for episodes

  // Function to fetch AnimePahe ID using the title from Jikan details
  const fetchAnimePaheId = useCallback(async (title: string) => {
    try {
      console.log(`[fetchAnimePaheId] Searching AnimePahe for title: "${title}"`);
      const response = await fetch(`/api/animepahe/search/${encodeURIComponent(title)}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to search AnimePahe: ${response.statusText}`);
      }
      const data = await response.json();
      if (data && data.animePaheId) {
        console.log(`[fetchAnimePaheId] Found AnimePahe ID: ${data.animePaheId}`);
        return data.animePaheId;
      } else {
        console.warn(`[fetchAnimePaheId] AnimePahe ID not found for title: "${title}"`);
        return null;
      }
    } catch (err: any) {
      console.error('[fetchAnimePaheId] Error:', err);
      return null; // Return null on error, don't block episode loading entirely
    }
  }, []);

  // Fetch main details and recommendations
  useEffect(() => {
    if (isNaN(malId)) {
      setError('Invalid Anime ID.');
      setLoading(false);
      setLoadingRecs(false);
      setLoadingNamiRecs(false);
      setLoadingEpisodes(false); // Ensure episode loading is also false
      return;
    }

    async function fetchAllData() {
      setLoading(true);
      setLoadingRecs(true);
      setLoadingNamiRecs(true);
      setLoadingEpisodes(true); // Set episode loading true
      setError(null);
      setNamiError(null);
      setEpisodeError(null); // Reset episode error
      setAnime(null);
      setAnimePaheId(null); // Reset AnimePahe ID
      setRecommendations([]);
      setNamiRecommendations([]);
      setEpisodes([]); // Reset episodes

      try {
        // Fetch main details
        console.log(`Fetching main anime details for ID: ${malId}`);
        const fetchedAnime = await getAnimeDetails(malId);
        if (!fetchedAnime) {
          setError('Anime details not found.');
          notFound(); // Trigger 404
          return;
        }
        setAnime(fetchedAnime);
        setLoading(false); // Main details loaded
        console.log(`Successfully fetched details for: ${fetchedAnime.title}`);

        // --- Fetch AnimePahe ID Concurrently ---
        let currentAnimePaheId: string | null = null;
        if (fetchedAnime.title) {
            currentAnimePaheId = await fetchAnimePaheId(fetchedAnime.title);
            setAnimePaheId(currentAnimePaheId); // Store the found AnimePahe ID
        } else {
            console.warn("Anime title missing, cannot search AnimePahe ID.");
            setEpisodeError("Could not fetch episodes (missing title for search).");
            setLoadingEpisodes(false);
        }

        // Fetch Jikan recommendations concurrently
        console.log(`Fetching Jikan recommendations for ID: ${malId}`);
        getAnimeRecommendations(malId).then(recs => {
            console.log(`Fetched ${recs.length} Jikan recommendations.`);
            setRecommendations(recs);
        }).catch(err => {
            console.error("Failed to load Jikan recommendations:", err);
        }).finally(() => setLoadingRecs(false));


        // Fetch Nami AI recommendations concurrently
        console.log(`Fetching Nami AI recommendations based on: ${fetchedAnime.title}`);
        const namiInput = {
            mood: "Similar to this",
            watchHistory: [fetchedAnime.title], // Seed history with current title
            profileActivity: `Interested in anime like ${fetchedAnime.title}, particularly genres: ${fetchedAnime.genres.map(g => g.name).join(', ')}.`,
        };
        getMoodBasedRecommendations(namiInput).then(namiRecs => {
             console.log(`Fetched ${namiRecs.animeRecommendations?.length || 0} Nami AI recommendations.`);
             setNamiRecommendations(namiRecs.animeRecommendations || []);
        }).catch(err => {
             console.error("Failed to load Nami recommendations:", err);
             setNamiError("Nami couldn't find recommendations right now.");
        }).finally(() => setLoadingNamiRecs(false));

         // --- Fetch Episodes using AnimePahe ID if found --- //
         if (currentAnimePaheId) {
             console.log(`Fetching episodes using AnimePahe ID: ${currentAnimePaheId}`);
             fetch(`/api/animepahe/episodes/${currentAnimePaheId}`) // Use AnimePahe ID in the route
             .then(async (res) => {
                if (!res.ok) {
                   const errorData = await res.json().catch(() => ({ message: `HTTP error! status: ${res.status}` }));
                   console.error(`Episode API (AnimePahe) responded with status ${res.status}:`, errorData.message || 'Unknown API error');
                   // More specific error message based on status
                   const errorMessage = res.status === 404
                       ? `No episodes found on AnimePahe for this title (ID: ${currentAnimePaheId}).`
                       : errorData.message || `Could not load episodes (Status: ${res.status})`;
                    setEpisodeError(errorMessage);
                   return null; // Indicate failure
                }
                return res.json();
             })
             .then((data: any) => { // Expecting AnimePaheEpisode[] directly
                if (data === null) return;

                if (Array.isArray(data)) { // Check if it's an array
                   const mappedEpisodes = data.map((ep: any) => ({ // Map to our Episode interface
                       id: ep.id, // This is the episode session ID
                       number: ep.episode,
                       title: ep.title || `Episode ${ep.episode}`,
                       link: `/anime/${malId}/episode/${encodeURIComponent(ep.id)}/watch` // Use episode session ID for watch link
                   }));
                   setEpisodes(mappedEpisodes);
                   console.log(`Successfully loaded ${mappedEpisodes.length} episodes via AnimePahe API.`);
                   setEpisodeError(null); // Clear previous errors if successful
                } else {
                     const errMsg = 'Invalid episode data received from AnimePahe API.';
                     setEpisodeError(errMsg);
                     console.warn(errMsg, 'Data:', data);
                }
             })
             .catch(err => {
                console.error("Network or parsing error fetching AnimePahe episodes:", err);
                setEpisodeError(err.message || 'Could not load episodes due to a network issue.');
             })
             .finally(() => {
                setLoadingEpisodes(false);
             });
         } else if(fetchedAnime.title) {
             // Only set error if title was present but ID wasn't found
             setEpisodeError("Could not find this anime on AnimePahe to fetch episodes.");
             setLoadingEpisodes(false);
         }
        // --- End Fetch Episodes --- //

      } catch (err: any) {
        console.error(`[AnimeDetailPage] Unexpected error fetching data for MAL ID ${malId}:`, err);
        setError(err.message || 'Failed to load anime data.');
        setAnime(null);
        setRecommendations([]);
        setNamiRecommendations([]);
        setEpisodes([]); // Reset episodes on main error
      } finally {
        // Ensure all loading states are false if not already set
        setLoading(false);
        setLoadingRecs(false); // These might be redundant if their finally blocks run
        setLoadingNamiRecs(false);
         // Ensure episode loading is false if not already handled above
         setLoadingEpisodes(false);
      }
    }

    fetchAllData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [malId, fetchAnimePaheId]);


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
    // This case should ideally be covered by the error or loading states,
    // but acts as a fallback if data somehow becomes null after loading.
    return <AnimeDetailSkeleton />;
  }


  return ( // Fixed: Added closing parenthesis for return statement
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
            {/* Main Details Card */}
            <Card className="overflow-visible glass border-primary/20 shadow-xl backdrop-blur-xl bg-card/60 mb-12">
                <div className="flex flex-col md:flex-row gap-6 md:gap-10 p-4 md:p-8">
                    {/* Left Column: Cover Image & Actions */}
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
                        {/* Actions Buttons */}
                        <div className="flex flex-col gap-3 mt-4">
                           {/* Watch button is now handled in the Episodes section below */}
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
                           {/* Placeholder for Add to List/Watchlist */}
                           {/* <Button size="sm" className="w-full">Add to Watchlist</Button> */}
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col">
                        <CardHeader className="p-0 mb-3">
                           <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary">{anime.title}</CardTitle>
                        </CardHeader>

                        {/* Genres */}
                        <div className="flex flex-wrap gap-2 mb-4">
                           {anime.genres?.map(g => (
                             <Badge key={g.mal_id} variant="secondary" className="neon-glow-hover text-xs cursor-default backdrop-blur-sm bg-secondary/60">{g.name}</Badge>
                           ))}
                        </div>

                         {/* Key Info Row */}
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

                         {/* Synopsis */}
                        <CardContent className="p-0 flex-grow">
                            <div className="space-y-2">
                               <h3 className="text-xl font-semibold mb-2">Synopsis</h3>
                               <ScrollArea className="h-24 pr-3"> {/* Limit synopsis height */}
                                   <CardDescription className="text-base leading-relaxed prose prose-invert prose-sm max-w-none">
                                       {anime.synopsis || 'No synopsis available.'}
                                   </CardDescription>
                                </ScrollArea>
                            </div>

                             {/* Trailer */}
                            {anime.trailer?.embed_url && (
                               <div className="mt-6 space-y-3">
                                  <h3 className="text-xl font-semibold flex items-center gap-2"><Youtube size={22} className="text-red-600"/> Trailer</h3>
                                   <AspectRatio ratio={16 / 9} className="rounded-lg overflow-hidden border border-border/50 glass shadow-md">
                                        <iframe
                                            src={anime.trailer.embed_url.replace("autoplay=1", "autoplay=0")} // Disable autoplay by default
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

             {/* Episodes Section - Updated Error Handling */}
            <section className="mb-12">
                 <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2"><Film size={24}/> Episodes</h3>
                 <Card className="glass p-6 border-border/50">
                     {loadingEpisodes ? (
                         <div className="flex flex-col items-center justify-center text-center">
                             <Skeleton className="h-10 w-10 rounded-full mb-3" />
                             <Skeleton className="h-5 w-48 mb-2" />
                             <Skeleton className="h-4 w-64" />
                         </div>
                     ) : episodeError ? ( // Display specific error message
                         <Alert variant="destructive" className="glass">
                             <AlertCircle className="h-4 w-4" />
                             <AlertTitle>Error Loading Episodes</AlertTitle>
                             <AlertDescription>{episodeError}</AlertDescription>
                             {/* Optional: Add a retry button */}
                             {/* <Button onClick={() => { setLoadingEpisodes(true); setEpisodeError(null); /* Trigger refetch logic here */ }} variant="outline" size="sm" className="mt-3">Retry</Button> */}
                         </Alert>
                     ) : episodes.length === 0 ? (
                         <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
                              <VideoOff size={40} className="mb-3 opacity-50"/>
                             <p className="font-medium">No Episodes Available</p>
                             <p className="text-sm">Could not find streaming episodes for this anime from available sources.</p>
                         </div>
                     ) : (
                          <ScrollArea className="h-64 pr-4"> {/* Add ScrollArea for episodes */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                  {episodes.map(episode => (
                                      // Link to the watch page using AnimePahe episode ID (session ID)
                                      <Link
                                           key={episode.id} // Use the episode session ID as the key
                                           href={`/anime/${malId}/watch/${encodeURIComponent(episode.id)}`} // Pass MAL ID and Episode Session ID
                                           passHref
                                           legacyBehavior>
                                           <a> {/* Added anchor tag for legacyBehavior */}
                                              <Card className="cursor-pointer hover:border-primary transition-colors duration-200 glass border-border/50">
                                                  <CardContent className="p-4">
                                                      <p className="font-semibold text-primary">Episode {episode.number}</p>
                                                      {/* Optional: Display episode title if available */}
                                                      {episode.title && episode.title !== `Episode ${episode.number}` && (
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

             {/* Nami AI Recommendations Section */}
            <section className="mb-12">
                 <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                     <Sparkles className="text-primary"/> Nami's Picks For You
                </h3>
                 {namiError && !loadingNamiRecs && (
                     <Alert variant="destructive" className="glass">
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

            {/* Related Anime Section (Jikan Recommendations) */}
             {renderHorizontalSection(
                "Related Anime",
                Tv,
                recommendations,
                loadingRecs,
                "No related anime found.",
                ItemCard,
                SkeletonItemCard
            )}

             {/* Optional: Add Characters, Staff, Reviews sections here */}

        </div>
    </div>
  );
}

// --- Skeleton Component (Updated to include episode skeleton) ---
function AnimeDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      {/* Skeleton Background */}
      <div className="absolute inset-x-0 top-0 h-[40vh] md:h-[60vh] -z-10 overflow-hidden">
            <Skeleton className="h-full w-full opacity-15 blur-md scale-110" />
           <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/80 to-background" />
       </div>

       <div className="relative mt-16 md:mt-32">
            {/* Main Details Card Skeleton */}
            <Card className="overflow-visible glass border-primary/20 bg-card/60 mb-12">
               <div className="flex flex-col md:flex-row gap-6 md:gap-10 p-4 md:p-8">
                 {/* Left Column: Cover Image & Actions Skeleton */}
                  <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 mx-auto md:mx-0 text-center -mt-24 md:-mt-32 z-10">
                      <Card className="overflow-hidden aspect-[2/3] relative border-2 border-primary/50 w-48 md:w-full mx-auto">
                          <Skeleton className="h-full w-full" />
                      </Card>
                       <div className="flex flex-col gap-3 mt-4">
                           <Skeleton className="h-9 w-full rounded-md" />
                           <Skeleton className="h-9 w-full rounded-md" />
                           {/* <Skeleton className="h-9 w-full rounded-md" /> */}
                       </div>
                  </div>

                  {/* Right Column: Details Skeleton */}
                  <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col">
                      <CardHeader className="p-0 mb-3">
                          <Skeleton className="h-8 w-3/4 mb-2" /> {/* Title */}
                          <Skeleton className="h-4 w-1/2" /> {/* Subtitle */}
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
                            <Skeleton className="h-7 w-32 mb-2" /> {/* Synopsis Title */}
                            <div className="h-24 pr-3 space-y-2"> {/* Matching ScrollArea height */}
                               <Skeleton className="h-4 w-full" />
                               <Skeleton className="h-4 w-full" />
                               <Skeleton className="h-4 w-5/6" />
                            </div>
                          </div>
                           <div className="mt-6 space-y-3">
                               <Skeleton className="h-7 w-28 mb-2" /> {/* Trailer Title */}
                               <Skeleton className="aspect-video w-full rounded-lg glass" />
                           </div>
                      </CardContent>
                  </div>
               </div>
            </Card>
            {/* Episodes Skeleton */}
             <section className="mb-12">
                <Skeleton className="h-8 w-36 mb-4" />
                <Card className="glass p-6">
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 8 }).map((_, index) => (
                             <Card key={`ep-skel-${index}`} className="glass border-border/50"><CardContent className="p-4"><Skeleton className="h-5 w-3/4" /></CardContent></Card>
                        ))}
                     </div>
                </Card>
             </section>

            {/* Recommendations Skeleton */}
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
