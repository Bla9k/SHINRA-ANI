'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation'; // Use useParams
import { getAnimeDetails, Anime } from '@/services/anime'; // Jikan-based service
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Star, Tv, CalendarDays, Clock, Film, ExternalLink, AlertCircle, Youtube, PlayCircle, ThumbsUp } from 'lucide-react'; // Import icons
import { Separator } from '@/components/ui/separator';
import { AspectRatio } from '@/components/ui/aspect-ratio'; // For trailer

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
  const params = useParams(); // Get params from the URL
  const id = params.id ? parseInt(params.id as string, 10) : NaN; // Parse ID

  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNaN(id)) {
      setError('Invalid Anime ID.');
      setLoading(false);
      return;
    }

    async function fetchAnimeData() {
      setLoading(true);
      setError(null);
      try {
        console.log(`Fetching details for Anime ID: ${id}`);
        const data = await getAnimeDetails(id);
        if (data) {
          setAnime(data);
        } else {
           setError(`Anime with ID ${id} not found.`);
           console.warn(`Anime with ID ${id} returned null from service.`);
           // Trigger notFound() if the service explicitly returns null
           notFound();
        }
      } catch (err: any) {
        console.error(`Error fetching anime details for ID ${id}:`, err);
        setError(err.message || 'Failed to load anime details.');
      } finally {
        setLoading(false);
      }
    }

    fetchAnimeData();
  }, [id]); // Depend on id

  if (loading) {
    return <AnimeDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
         <Alert variant="destructive" className="max-w-md glass">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Anime Details</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
         </Alert>
      </div>
    );
  }

  if (!anime) {
      // This case should ideally be handled by notFound() in useEffect, but acts as a fallback
      return (
          <div className="container mx-auto px-4 py-8 text-center">
              <p className="text-muted-foreground">Anime not found.</p>
          </div>
      );
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
            <Card className="overflow-visible glass border-primary/20 shadow-xl backdrop-blur-xl bg-card/60">
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
                                priority // Prioritize loading the main image
                              />
                           ) : (
                               <div className="h-full w-full bg-muted flex items-center justify-center">
                                  <Tv className="w-16 h-16 text-muted-foreground opacity-50" />
                               </div>
                           )}
                        </Card>
                        {/* Actions Buttons */}
                        <div className="flex flex-col gap-3 mt-4">
                           {/* Add to List / Watchlist Button (Example) */}
                           {/* <Button size="sm" className="w-full neon-glow-hover">
                              <PlusCircle size={16} className="mr-2"/> Add to Watchlist
                           </Button> */}
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
                                       Watch Trailer <PlayCircle size={16} className="ml-2"/>
                                 </Link>
                              </Button>
                           )}
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col">
                        <CardHeader className="p-0 mb-3">
                           <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary">{anime.title}</CardTitle>
                           {/* Add Original Title if available and different */}
                           {/* {anime.title_japanese && anime.title_japanese !== anime.title && (
                               <p className="text-sm text-muted-foreground">{anime.title_japanese}</p>
                           )} */}
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
                               {/* Add Popularity/Members count if needed */}
                               {/* {anime.members && (
                                   <div className="flex items-center gap-1" title="Popularity">
                                       <Users size={16} className="text-muted-foreground" /> <span className="text-foreground">{anime.members.toLocaleString()} Members</span>
                                   </div>
                               )} */}
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
                                            src={anime.trailer.embed_url.replace("autoplay=1", "autoplay=0")} // Ensure autoplay is off
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
        </div>
    </div>
  );
}

// Skeleton component for loading state - Updated to match layout
function AnimeDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      {/* Skeleton Background */}
      <div className="absolute inset-x-0 top-0 h-[40vh] md:h-[50vh] -z-10 overflow-hidden">
            <Skeleton className="h-full w-full opacity-20 blur-md scale-110" />
           <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/80 to-background" />
       </div>

       <div className="relative mt-16 md:mt-24">
            <Card className="overflow-visible glass border-primary/20 bg-card/60">
               <div className="flex flex-col md:flex-row gap-6 md:gap-10 p-4 md:p-8">
                 {/* Left Column: Cover Image & Actions */}
                  <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 mx-auto md:mx-0 text-center -mt-16 md:-mt-24 z-10">
                      <Card className="overflow-hidden aspect-[2/3] relative border-2 border-primary/50 w-48 md:w-full mx-auto">
                          <Skeleton className="h-full w-full" />
                      </Card>
                       {/* Actions Buttons Skeleton */}
                       <div className="flex flex-col gap-3 mt-4">
                           <Skeleton className="h-9 w-full rounded-md" />
                           <Skeleton className="h-9 w-full rounded-md" />
                           <Skeleton className="h-9 w-full rounded-md" />
                       </div>
                  </div>

                  {/* Right Column: Details */}
                  <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col">
                      <CardHeader className="p-0 mb-3">
                          <Skeleton className="h-8 w-3/4 mb-2" /> {/* Title */}
                          <Skeleton className="h-4 w-1/2" /> {/* Subtitle */}
                      </CardHeader>

                      {/* Genres Skeleton */}
                      <div className="flex flex-wrap gap-2 mb-4">
                          <Skeleton className="h-6 w-16 rounded-full" />
                          <Skeleton className="h-6 w-20 rounded-full" />
                          <Skeleton className="h-6 w-14 rounded-full" />
                      </div>

                      {/* Key Info Skeleton */}
                       <Card className="glass p-3 mb-4 border-primary/10">
                         <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
                              <Skeleton className="h-5 w-14" />
                              <Skeleton className="h-5 w-16" />
                              <Skeleton className="h-5 w-24" />
                              <Skeleton className="h-5 w-20" />
                         </div>
                      </Card>

                      <Separator className="my-4 bg-border/50" />

                      {/* Synopsis Skeleton */}
                      <CardContent className="p-0 flex-grow">
                          <div className="space-y-2">
                            <Skeleton className="h-7 w-32 mb-2" /> {/* Synopsis Title */}
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-full" />
                          </div>

                          {/* Trailer Skeleton */}
                           <div className="mt-6 space-y-3">
                               <Skeleton className="h-7 w-28 mb-2" /> {/* Trailer Title */}
                               <Skeleton className="aspect-video w-full rounded-lg glass" />
                           </div>
                      </CardContent>
                  </div>
               </div>
            </Card>
       </div>
    </div>
  );
}