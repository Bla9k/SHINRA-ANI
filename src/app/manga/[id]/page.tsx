
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation'; // Use useParams
import { getMangaDetails, Manga } from '@/services/manga'; // Jikan-based service
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Star, BookText, Layers, Library, Clock, ExternalLink, AlertCircle } from 'lucide-react'; // Import icons
import { Separator } from '@/components/ui/separator';

// Helper function to format status
const formatStatus = (status: string | null): string => {
    if (!status) return 'N/A';
    // Capitalize first letter for display if needed
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
};

export default function MangaDetailPage() {
  const params = useParams(); // Get params from the URL
  const id = params.id ? parseInt(params.id as string, 10) : NaN; // Parse ID

  const [manga, setManga] = useState<Manga | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isNaN(id)) {
      setError('Invalid Manga ID.');
      setLoading(false);
      return;
    }

    async function fetchMangaData() {
      setLoading(true);
      setError(null);
      try {
        console.log(`Fetching details for Manga ID: ${id}`);
        const data = await getMangaDetails(id); // Use the manga details service
        if (data) {
          setManga(data);
        } else {
           setError(`Manga with ID ${id} not found.`);
           console.warn(`Manga with ID ${id} returned null from service.`);
           notFound(); // Trigger not found if service returns null
        }
      } catch (err: any) {
        console.error(`Error fetching manga details for ID ${id}:`, err);
        setError(err.message || 'Failed to load manga details.');
      } finally {
        setLoading(false);
      }
    }

    fetchMangaData();
  }, [id]); // Depend on id

  if (loading) {
    return <MangaDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
         <Alert variant="destructive" className="max-w-md glass">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Manga Details</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
         </Alert>
      </div>
    );
  }

   if (!manga) {
      // Fallback, should be handled by notFound()
      return (
          <div className="container mx-auto px-4 py-8 text-center">
              <p className="text-muted-foreground">Manga not found.</p>
          </div>
      );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="overflow-hidden glass border-primary/20 shadow-xl">
        <div className="relative flex flex-col md:flex-row gap-6 md:gap-8 p-4 md:p-8">
           {/* Left Column: Cover Image */}
           <div className="md:w-1/3 lg:w-1/4 flex-shrink-0 mx-auto md:mx-0 -mt-12 md:-mt-16 z-10">
             <Card className="overflow-hidden aspect-[2/3] relative shadow-lg neon-glow border-2 border-primary/50">
                {manga.imageUrl ? (
                   <Image
                     src={manga.imageUrl}
                     alt={manga.title}
                     fill
                     sizes="(max-width: 768px) 60vw, 25vw"
                     className="object-cover"
                     priority // Prioritize loading the main image
                   />
                ) : (
                   <div className="h-full w-full bg-muted flex items-center justify-center">
                     <BookText className="w-16 h-16 text-muted-foreground opacity-50" />
                   </div>
                )}
             </Card>
           </div>

           {/* Right Column: Details */}
           <div className="md:w-2/3 lg:w-3/4 flex flex-col">
             <CardHeader className="p-0 mb-4">
               <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary">{manga.title}</CardTitle>
               {/* Add Original Title if available and different */}
               {/* {manga.title_japanese && manga.title_japanese !== manga.title && (
                   <p className="text-sm text-muted-foreground">{manga.title_japanese}</p>
               )} */}
             </CardHeader>

             <CardContent className="p-0 space-y-4 flex-grow">
                 {/* Genres */}
                <div className="flex flex-wrap gap-2">
                   {manga.genres?.map(g => (
                     <Badge key={g.mal_id} variant="secondary" className="neon-glow-hover text-xs cursor-default">{g.name}</Badge>
                   ))}
                </div>

                 {/* Key Info Row */}
                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1" title="Score">
                      <Star size={16} className={manga.score ? 'text-yellow-400' : ''}/> {manga.score?.toFixed(1) ?? 'N/A'}
                    </span>
                    <span className="flex items-center gap-1" title="Chapters">
                      <Layers size={16} /> {manga.chapters ?? 'N/A'} Chapters
                    </span>
                    <span className="flex items-center gap-1" title="Volumes">
                      <Library size={16} /> {manga.volumes ?? 'N/A'} Volumes
                    </span>
                    <span className="flex items-center gap-1" title="Status">
                        <Clock size={16} /> {formatStatus(manga.status)}
                    </span>
                    {manga.year && (
                       <span className="flex items-center gap-1" title="Year">
                         <CalendarDays size={16} /> {manga.year}
                       </span>
                    )}
                </div>

                <Separator className="my-4" />

                 {/* Synopsis */}
                <div className="space-y-2">
                   <h3 className="text-lg font-semibold">Synopsis</h3>
                   <CardDescription className="text-base leading-relaxed">
                       {manga.synopsis || 'No synopsis available.'}
                   </CardDescription>
                </div>

                {/* Add Author/Artist Info if available */}
                {/* {manga.authors?.length > 0 && (
                    <div className="space-y-1 pt-2">
                        <h4 className="text-md font-semibold">Authors</h4>
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                            {manga.authors.map(a => <span key={a.mal_id} className="text-sm text-muted-foreground">{a.name} ({a.type})</span>)}
                        </div>
                    </div>
                )} */}

             </CardContent>

             {/* Footer Actions */}
             <div className="flex gap-3 pt-6 mt-auto">
                {/* <Button className="neon-glow-hover">
                    <PlusCircle size={18} className="mr-2"/> Add to Readlist
                </Button> */}
                {manga.url && (
                   <Button variant="outline" asChild className="neon-glow-hover">
                       <Link href={manga.url} target="_blank" rel="noopener noreferrer">
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
function MangaDetailSkeleton() {
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
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-16" /> {/* Year Placeholder */}
               </div>

               <Separator className="my-4" />

               {/* Synopsis */}
               <div className="space-y-2">
                 <Skeleton className="h-6 w-32 mb-2" /> {/* Synopsis Title */}
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-5/6" />
               </div>

               {/* Authors Placeholder */}
               {/* <div className="space-y-1 pt-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-40" />
               </div> */}

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

    