
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams, useRouter } from 'next/navigation';
import { getAnimeDetails, Anime } from '@/services/anime'; // Jikan-based service for metadata
// Removed AnimePahe imports as streaming is disabled for now
// import { getAnimeEpisodesPahe, getAnimePaheSession, AnimePaheEpisode } from '@/services/animepahe';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Star, Tv, CalendarDays, Clock, Film, ExternalLink, AlertCircle, Youtube, PlayCircle, Library, ListVideo, BookOpen, Info, Loader2, VideoOff } from 'lucide-react'; // Added VideoOff icon
import { Separator } from '@/components/ui/separator';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

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

// Removed episode related constants
// const EPISODE_UNAVAILABLE_MESSAGE = "Episode fetching is currently unavailable for this source.";
// const ANIME_NOT_FOUND_PROVIDER = "Could not find this anime on the streaming provider.";
// const ERROR_CONTACTING_PROVIDER = "Error contacting the streaming provider to find this anime.";
// const FAILED_LOAD_EPISODES = "Failed to load episode list.";

export default function AnimeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const malId = params.id ? parseInt(params.id as string, 10) : NaN;

  const [anime, setAnime] = useState<Anime | null>(null);
  // Removed AnimePahe state
  // const [animePaheId, setAnimePaheId] = useState<string | null>(null);
  // const [episodes, setEpisodes] = useState<AnimePaheEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  // const [loadingEpisodes, setLoadingEpisodes] = useState(false); // Removed
  const [error, setError] = useState<string | null>(null);
  // const [episodeError, setEpisodeError] = useState<string | null>(null); // Removed

  // Removed fetchAnimePaheId and fetchEpisodes functions

  // Main data fetching effect (only fetches Jikan details now)
  useEffect(() => {
    if (isNaN(malId)) {
      setError('Invalid Anime ID.');
      setLoading(false);
      return;
    }

    async function fetchDetailsOnly() {
      setLoading(true);
      // setLoadingEpisodes(true); // Removed
      setError(null);
      // setEpisodeError(null); // Removed
      setAnime(null);
      // setAnimePaheId(null); // Removed
      // setEpisodes([]); // Removed

      try {
        // 1. Fetch metadata from Jikan
        console.log(`[AnimeDetailPage] Fetching Jikan details for MAL ID: ${malId}`);
        const fetchedAnime = await getAnimeDetails(malId);
        setAnime(fetchedAnime);

        if (!fetchedAnime || !fetchedAnime.title) {
            console.error(`[AnimeDetailPage] Jikan details not found or missing title for MAL ID ${malId}`);
            setError('Anime details not found.');
            setLoading(false);
            // setLoadingEpisodes(false); // Removed
            notFound(); // Trigger 404 if Jikan fails
            return;
        }
        console.log(`[AnimeDetailPage] Jikan details fetched: ${fetchedAnime.title}`);

        // Removed steps 2 & 3 (AnimePahe ID and episode fetching)

      } catch (err: any) {
        console.error(`[AnimeDetailPage] Unexpected error fetching data for MAL ID ${malId}:`, err);
        setError(err.message || 'Failed to load anime data.');
        setAnime(null);
        // setEpisodes([]); // Removed
        // setLoadingEpisodes(false); // Removed
      } finally {
        setLoading(false); // Overall loading stops here
        // setLoadingEpisodes(false); // Ensure loading stops
      }
    }

    fetchDetailsOnly();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [malId]); // Only re-run when MAL ID changes


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
    // Fallback if anime details are null after loading (should be caught by error or notFound)
    return <AnimeDetailSkeleton />; // Or a specific "not found" component
  }


  return (
    <div className="container mx-auto px-4 py-8">
        {/* Background Image Section - Subtle */}
        <div className="absolute inset-x-0 top-0 h-[40vh] md:h-[50vh] -z-10 overflow-hidden">
             {anime.imageUrl && (
                 <Image
                     src={anime.imageUrl}
                     alt={`${anime.title} backdrop`}
                     fill
                     className="object-cover object-top opacity-20 blur-md scale-110"
                     aria-hidden="true"
                     priority
                 />
             )}
            <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/80 to-background" />
        </div>

        <div className="relative mt-16 md:mt-24">
            {/* Main Details Card */}
            <Card className="overflow-visible glass border-primary/20 shadow-xl backdrop-blur-xl bg-card/60 mb-8">
                <div className="flex flex-col md:flex-row gap-6 md:gap-10 p-4 md:p-8">
                    {/* Left Column: Cover Image & Actions */}
                    <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 mx-auto md:mx-0 text-center -mt-16 md:-mt-24 z-10">
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
                           {/* Disabled Watch Button */}
                           <Button size="sm" className="w-full" disabled title="Streaming coming soon!">
                              <VideoOff size={16} className="mr-2 opacity-50"/> Watch (Coming Soon)
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
                               <h3 className="text-xl font-semibold">Synopsis</h3>
                               <CardDescription className="text-base leading-relaxed prose prose-invert prose-sm max-w-none">
                                   {anime.synopsis || 'No synopsis available.'}
                               </CardDescription>
                            </div>

                             {/* Trailer */}
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

            {/* Episodes Section - Placeholder */}
            <Accordion type="single" collapsible className="w-full" defaultValue='item-1'>
                <AccordionItem value="item-1" className="glass border border-primary/20 shadow-lg rounded-lg backdrop-blur-lg bg-card/60">
                    <AccordionTrigger className="px-4 py-3 text-lg font-semibold hover:no-underline">
                        <span className="flex items-center gap-2">
                            <ListVideo size={20} className="text-primary"/> Episodes
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                         {/* Placeholder content */}
                         <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                             <VideoOff size={40} className="mb-3 opacity-50"/>
                             <p className="font-medium">Anime Streaming Coming Soon!</p>
                             <p className="text-sm">We're working hard to bring you direct streaming capabilities.</p>
                         </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

        </div>
    </div>
  );
}

// --- Skeleton Component (No changes needed here) ---
function AnimeDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      {/* Skeleton Background */}
      <div className="absolute inset-x-0 top-0 h-[40vh] md:h-[50vh] -z-10 overflow-hidden">
            <Skeleton className="h-full w-full opacity-20 blur-md scale-110" />
           <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/80 to-background" />
       </div>

       <div className="relative mt-16 md:mt-24">
            {/* Main Details Card Skeleton */}
            <Card className="overflow-visible glass border-primary/20 bg-card/60 mb-8">
               <div className="flex flex-col md:flex-row gap-6 md:gap-10 p-4 md:p-8">
                 {/* Left Column: Cover Image & Actions Skeleton */}
                  <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 mx-auto md:mx-0 text-center -mt-16 md:-mt-24 z-10">
                      <Card className="overflow-hidden aspect-[2/3] relative border-2 border-primary/50 w-48 md:w-full mx-auto">
                          <Skeleton className="h-full w-full" />
                      </Card>
                       <div className="flex flex-col gap-3 mt-4">
                           <Skeleton className="h-9 w-full rounded-md" />
                           <Skeleton className="h-9 w-full rounded-md" />
                           <Skeleton className="h-9 w-full rounded-md" />
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
                          <div className="space-y-2">
                            <Skeleton className="h-7 w-32 mb-2" /> {/* Synopsis Title */}
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
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
             <Accordion type="single" collapsible className="w-full" defaultValue='item-1'>
                <AccordionItem value="item-1" className="glass border-primary/20 shadow-lg rounded-lg backdrop-blur-lg bg-card/60">
                 <AccordionTrigger className="px-4 py-3 text-lg font-semibold hover:no-underline">
                     <span className="flex items-center gap-2">
                        <ListVideo size={20} className="text-primary"/> Episodes
                     </span>
                 </AccordionTrigger>
                 <AccordionContent className="px-4 pb-4">
                      {/* Placeholder content for skeleton */}
                      <div className="flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                         <VideoOff size={40} className="mb-3 opacity-50"/>
                         <Skeleton className="h-5 w-48 mb-2" />
                         <Skeleton className="h-4 w-64" />
                     </div>
                 </AccordionContent>
                </AccordionItem>
             </Accordion>
       </div>
    </div>
  );
}
        
