
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { getAnimeDetails, Anime } from '@/services/anime'; // Jikan-based service for metadata
import { getAnimeEpisodes, ConsumetEpisode } from '@/services/consumet'; // Consumet service for episodes
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Star, Tv, CalendarDays, Clock, Film, ExternalLink, AlertCircle, Youtube, PlayCircle, Library, ListVideo, BookOpen, Info, Loader2 } from 'lucide-react'; // Added icons
import { Separator } from '@/components/ui/separator';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ScrollArea } from '@/components/ui/scroll-area'; // For episode list
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'; // For episodes section

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


export default function AnimeDetailPage() {
  const params = useParams();
  const id = params.id ? parseInt(params.id as string, 10) : NaN;

  const [anime, setAnime] = useState<Anime | null>(null);
  const [episodes, setEpisodes] = useState<ConsumetEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [episodeError, setEpisodeError] = useState<string | null>(null);

  useEffect(() => {
    if (isNaN(id)) {
      setError('Invalid Anime ID.');
      setLoading(false);
      return;
    }

    async function fetchAllData() {
      setLoading(true);
      setLoadingEpisodes(true); // Start loading episodes too
      setError(null);
      setEpisodeError(null);

      try {
        // Fetch metadata (Jikan) and episodes (Consumet) concurrently
        const [detailsData, episodesData] = await Promise.allSettled([
          getAnimeDetails(id),
          getAnimeEpisodes(id) // Fetch episodes using MAL ID
        ]);

        // Handle Metadata Result
        if (detailsData.status === 'fulfilled' && detailsData.value) {
          setAnime(detailsData.value);
        } else {
          const reason = detailsData.status === 'rejected' ? detailsData.reason : 'Anime not found';
          console.error(`Error fetching anime details for ID ${id}:`, reason);
          setError(reason instanceof Error ? reason.message : String(reason));
           // If metadata fails critically (e.g., not found), trigger notFound
           if (detailsData.status === 'rejected' || !detailsData.value) {
               notFound();
           }
        }

        // Handle Episodes Result
        if (episodesData.status === 'fulfilled') {
          setEpisodes(episodesData.value || []);
          if (!episodesData.value || episodesData.value.length === 0) {
             console.warn(`No episodes found for Anime ID ${id} via Consumet.`);
             setEpisodeError("No streaming episodes found for this anime."); // Inform user
          }
        } else {
          console.error(`Error fetching anime episodes for ID ${id}:`, episodesData.reason);
          setEpisodeError(episodesData.reason instanceof Error ? episodesData.reason.message : String(episodesData.reason));
        }

      } catch (err: any) {
        // Catch any unexpected errors during Promise.allSettled or setup
        console.error(`Unexpected error fetching data for Anime ID ${id}:`, err);
        setError(err.message || 'Failed to load anime data.');
      } finally {
        setLoading(false);
        setLoadingEpisodes(false);
      }
    }

    fetchAllData();
  }, [id]);

  if (loading && !anime) { // Show skeleton only if main details are loading
    return <AnimeDetailSkeleton />;
  }

  if (error && !anime) { // Show main error only if anime details failed critically
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

  // If anime details loaded but episodes failed, show the details page with an episode error message.
  if (!anime) {
    // This path might be reached if details are null but no error was thrown (should be rare)
    return <AnimeDetailSkeleton />; // Fallback to skeleton or a generic not found message
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

        <div className="relative mt-16 md:mt-24"> {/* Adjust margin based on header height */}
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
                           <Button size="sm" className="w-full neon-glow-hover" asChild>
                              <Link href={`/watch/anime/${anime.id}`}> {/* Link to potential watch page */}
                                  <PlayCircle size={16} className="mr-2"/> Watch Now
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

            {/* Episodes Section */}
            <Accordion type="single" collapsible className="w-full" defaultValue='item-1'>
                <AccordionItem value="item-1" className="glass border border-primary/20 shadow-lg rounded-lg backdrop-blur-lg bg-card/60">
                    <AccordionTrigger className="px-4 py-3 text-lg font-semibold hover:no-underline">
                        <span className="flex items-center gap-2">
                            <ListVideo size={20} className="text-primary"/> Episodes ({loadingEpisodes ? '...' : episodes.length})
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                        {loadingEpisodes && (
                             <div className="flex justify-center items-center p-6">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                <span className="ml-2 text-muted-foreground">Loading episodes...</span>
                            </div>
                         )}
                        {episodeError && !loadingEpisodes && (
                           <Alert variant="destructive" className="my-4">
                               <Info className="h-4 w-4" />
                               <AlertTitle>Could Not Load Episodes</AlertTitle>
                               <AlertDescription>{episodeError}</AlertDescription>
                           </Alert>
                         )}
                        {!loadingEpisodes && !episodeError && episodes.length > 0 && (
                            <ScrollArea className="h-[400px] pr-3"> {/* Adjust height as needed */}
                                <div className="space-y-2">
                                    {episodes.map((ep) => (
                                        <Link key={ep.id} href={`/watch/anime/${anime.id}/${ep.id}`} passHref legacyBehavior>
                                            <a className="block group">
                                                <Card className="p-3 glass transition-colors duration-200 border border-transparent group-hover:border-primary/50 group-hover:bg-accent/10">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="text-sm font-medium truncate group-hover:text-primary">
                                                           Ep {ep.number} {ep.title ? `- ${ep.title}` : ''}
                                                        </span>
                                                        <PlayCircle size={18} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0"/>
                                                    </div>
                                                    {ep.airDate && <p className="text-xs text-muted-foreground mt-0.5">Aired: {new Date(ep.airDate).toLocaleDateString()}</p>}
                                                </Card>
                                            </a>
                                        </Link>
                                    ))}
                                </div>
                            </ScrollArea>
                         )}
                        {!loadingEpisodes && !episodeError && episodes.length === 0 && (
                             <p className="text-center text-muted-foreground py-6">No episode information available for this anime.</p>
                         )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>


        </div>
    </div>
  );
}

// --- Skeleton Component ---
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
             <Card className="glass border-primary/20 shadow-lg rounded-lg backdrop-blur-lg bg-card/60">
                 <AccordionTrigger className="px-4 py-3 text-lg font-semibold hover:no-underline">
                     <span className="flex items-center gap-2">
                        <ListVideo size={20} className="text-primary"/> Episodes (...)
                     </span>
                 </AccordionTrigger>
                 <AccordionContent className="px-4 pb-4">
                     <div className="flex justify-center items-center p-6">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                         <span className="ml-2 text-muted-foreground">Loading episodes...</span>
                    </div>
                 </AccordionContent>
             </Card>
       </div>
    </div>
  );
}

// Helper component for AccordionTrigger - Needs to be properly integrated
const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      {/* <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" /> */}
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { cn } from "@/lib/utils"
import React from 'react' // Ensure React is imported if not already
