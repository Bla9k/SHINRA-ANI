
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
import { Star, Tv, CalendarDays, Clock, Film, ExternalLink, AlertCircle, Youtube } from 'lucide-react'; // Import icons
import { Separator } from '@/components/ui/separator';

// Helper function to format status
const formatStatus = (status: string | null): string => {
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
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
      <Card className="overflow-hidden glass border-primary/20 shadow-xl">
         {/* Header Section with Background Image (Optional - subtle) */}
         {/* <div className="relative h-48 md:h-64 overflow-hidden">
             {anime.imageUrl && (
                 <Image
                     src={anime.imageUrl}
                     alt={`${anime.title} backdrop`}
                     fill
                     className="object-cover object-top opacity-30 blur-sm scale-110"
                 />
             )}
             <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
         </div> */}

        <div className="relative flex flex-col md:flex-row gap-6 md:gap-8 p-4 md:p-8">
           {/* Left Column: Cover Image */}
           <div className="md:w-1/3 lg:w-1/4 flex-shrink-0 mx-auto md:mx-0 -mt-12 md:-mt-16 z-10">
             <Card className="overflow-hidden aspect-[2/3] relative shadow-lg neon-glow border-2 border-primary/50">
                {anime.imageUrl ? (
                   <Image
                     src={anime.imageUrl}
                     alt={anime.title}
                     fill
                     sizes="(max-width: 768px) 60vw, 25vw"
                     className="object-cover"
                     priority // Prioritize loading the main image
                   />
                ) : (
                    <div className="h-full w-full bg-muted flex items-center justify-center">
                       <Tv className="w-16 h-16 text-muted-foreground opacity-50" />
                    </div>
                )}
             </Card>
           </div>

           {/* Right Column: Details */}
           <div className="md:w-2/3 lg:w-3/4 flex flex-col">
             <CardHeader className="p-0 mb-4">
               <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary">{anime.title}</CardTitle>
                {/* Add Original Title if available and different */}
                {/* {anime.title_japanese && anime.title_japanese !== anime.title && (
                    <p className="text-sm text-muted-foreground">{anime.title_japanese}</p>
                )} */}
             </CardHeader>

             <CardContent className="p-0 space-y-4 flex-grow">
                 {/* Genres */}
                <div className="flex flex-wrap gap-2">
                   {anime.genres?.map(g => (
                     <Badge key={g.mal_id} variant="secondary" className="neon-glow-hover text-xs cursor-default">{g.name}</Badge>
                   ))}
                </div>

                 {/* Key Info Row */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                   <span className="flex items-center gap-1" title="Score">
                      <Star size={16} className={anime.score ? 'text-yellow-400' : ''}/> {anime.score?.toFixed(1) ?? 'N/A'}
                   </span>
                   <span className="flex items-center gap-1" title="Year">
                     <CalendarDays size={16} /> {anime.year || 'N/A'}
                   </span>
                   <span className="flex items-center gap-1" title="Episodes">
                     <Film size={16} /> {anime.episodes || 'N/A'} Episodes
                   </span>
                    <span className="flex items-center gap-1" title="Status">
                        <Clock size={16} /> {formatStatus(anime.status)}
                    </span>
                </div>

                <Separator className="my-4" />

                 {/* Synopsis */}
                <div className="space-y-2">
                   <h3 className="text-lg font-semibold">Synopsis</h3>
                   <CardDescription className="text-base leading-relaxed">
                       {anime.synopsis || 'No synopsis available.'}
                   </CardDescription>
                </div>

                 {/* Trailer (Optional) */}
                {anime.trailer?.embed_url && (
                   <div className="space-y-2 pt-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2"><Youtube size={20} className="text-red-600"/> Trailer</h3>
                      <div className="aspect-video rounded-lg overflow-hidden border border-border glass shadow-md">
                         <iframe
                            src={anime.trailer.embed_url.replace("autoplay=1", "autoplay=0")} // Prevent autoplay
                            title={`${anime.title} Trailer`}
                            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                            loading="lazy" // Lazy load the iframe
                         ></iframe>
                      </div>
                   </div>
                )}
             </CardContent>

             {/* Footer Actions */}
             <div className="flex gap-3 pt-6 mt-auto">
                {/* <Button className="neon-glow-hover">
                    <PlusCircle size={18} className="mr-2"/> Add to Watchlist
                </Button> */}
                {anime.url && (
                   <Button variant="outline" asChild className="neon-glow-hover">
                       <Link href={anime.url} target="_blank" rel="noopener noreferrer">
                           View on MyAnimeList <ExternalLink size={16} className="ml-2" />
                       </Link>
                   </Button>
                )}
             </div>
           </div>
        </div>
      </Card>
    </div>
  );
}

// Skeleton component for loading state - Updated to match layout
function AnimeDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <Card className="overflow-hidden glass border-primary/20">
         <div className="relative flex flex-col md:flex-row gap-6 md:gap-8 p-4 md:p-8">
           {/* Left Column: Cover Image */}
           <div className="md:w-1/3 lg:w-1/4 flex-shrink-0 mx-auto md:mx-0 -mt-12 md:-mt-16 z-10">
             <Card className="overflow-hidden aspect-[2/3] relative border-2 border-primary/50">
               <Skeleton className="h-full w-full" />
             </Card>
           </div>

           {/* Right Column: Details */}
           <div className="md:w-2/3 lg:w-3/4 flex flex-col">
             <CardHeader className="p-0 mb-4">
               <Skeleton className="h-8 w-3/4 mb-2" /> {/* Title */}
               <Skeleton className="h-4 w-1/2" /> {/* Subtitle */}
             </CardHeader>

             <CardContent className="p-0 space-y-4 flex-grow">
               {/* Genres */}
               <div className="flex flex-wrap gap-2">
                 <Skeleton className="h-6 w-16 rounded-full" />
                 <Skeleton className="h-6 w-20 rounded-full" />
                 <Skeleton className="h-6 w-14 rounded-full" />
               </div>
               {/* Key Info */}
               <div className="flex flex-wrap gap-x-4 gap-y-2">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-24" />
               </div>

               <Separator className="my-4" />

               {/* Synopsis */}
               <div className="space-y-2">
                 <Skeleton className="h-6 w-32 mb-2" /> {/* Synopsis Title */}
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-5/6" />
               </div>

                {/* Trailer Placeholder */}
               <div className="space-y-2 pt-4">
                   <Skeleton className="h-6 w-28 mb-2" /> {/* Trailer Title */}
                   <Skeleton className="aspect-video w-full rounded-lg glass" />
               </div>
             </CardContent>

             {/* Footer Actions */}
              <div className="flex gap-3 pt-6 mt-auto">
                 <Skeleton className="h-10 w-36 rounded-md" />
                 <Skeleton className="h-10 w-40 rounded-md" />
              </div>
           </div>
         </div>
      </Card>
    </div>
  );
}

    