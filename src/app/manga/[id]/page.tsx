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
import { Star, BookText, Layers, Library, Clock, ExternalLink, AlertCircle, CalendarDays, PlayCircle } from 'lucide-react'; // Import icons
import { Separator } from '@/components/ui/separator';
import { AspectRatio } from '@/components/ui/aspect-ratio'; // For potential future use (e.g., related media trailer)


// Helper function to format status
const formatStatus = (status: string | null): string => {
    if (!status) return 'N/A';
    // Capitalize first letter for display if needed
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
};

// Helper to format score with icon (copied from anime page)
const ScoreDisplay = ({ score }: { score: number | null }) => {
    if (score === null || score === undefined) return <span className="text-sm text-muted-foreground">N/A</span>;
    const scoreColor = score >= 8 ? 'text-green-400' : score >= 6 ? 'text-yellow-400' : 'text-red-400';
    return (
        <span className={`flex items-center gap-1 font-semibold ${scoreColor}`}>
            <Star size={16} className="fill-current" /> {score.toFixed(1)}
        </span>
    );
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
        {/* Background Image Section - Subtle */}
        <div className="absolute inset-x-0 top-0 h-[40vh] md:h-[50vh] -z-10 overflow-hidden">
             {manga.imageUrl && (
                 <Image
                     src={manga.imageUrl}
                     alt={`${manga.title} backdrop`}
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
                           {manga.imageUrl ? (
                              <Image
                                src={manga.imageUrl}
                                alt={manga.title}
                                fill
                                sizes="(max-width: 768px) 192px, 25vw"
                                className="object-cover"
                                priority // Prioritize loading the main image
                              />
                           ) : (
                               <div className="h-full w-full bg-muted flex items-center justify-center">
                                 <BookText className="w-16 h-16 text-muted-foreground opacity-50" />
                               </div>
                           )}
                        </Card>
                        {/* Actions Buttons */}
                        <div className="flex flex-col gap-3 mt-4">
                           {/* Add to List / Readlist Button (Example) */}
                           {/* <Button size="sm" className="w-full neon-glow-hover">
                              <PlusCircle size={16} className="mr-2"/> Add to Readlist
                           </Button> */}
                           {manga.url && (
                              <Button variant="outline" size="sm" asChild className="w-full neon-glow-hover">
                                  <Link href={manga.url} target="_blank" rel="noopener noreferrer">
                                      View on MyAnimeList <ExternalLink size={14} className="ml-2" />
                                  </Link>
                              </Button>
                           )}
                            {/* Optional: Add a "Read Now" button if linking to an external reader */}
                            {/* <Button variant="secondary" size="sm" asChild className="w-full neon-glow-hover">
                                <Link href={"#"} target="_blank" rel="noopener noreferrer">
                                    Read Now <BookOpen size={16} className="ml-2"/>
                                </Link>
                            </Button> */}
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col">
                        <CardHeader className="p-0 mb-3">
                           <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary">{manga.title}</CardTitle>
                           {/* Add Original Title if available and different */}
                           {/* {manga.title_japanese && manga.title_japanese !== manga.title && (
                               <p className="text-sm text-muted-foreground">{manga.title_japanese}</p>
                           )} */}
                        </CardHeader>

                        {/* Genres */}
                        <div className="flex flex-wrap gap-2 mb-4">
                           {manga.genres?.map(g => (
                             <Badge key={g.mal_id} variant="secondary" className="neon-glow-hover text-xs cursor-default backdrop-blur-sm bg-secondary/60">{g.name}</Badge>
                           ))}
                        </div>

                         {/* Key Info Row */}
                         <Card className="glass p-3 mb-4 border-primary/10">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                                <div className="flex items-center gap-2" title="Score">
                                   <ScoreDisplay score={manga.score} />
                                </div>
                                <div className="flex items-center gap-1" title="Chapters">
                                   <Layers size={16} className="text-muted-foreground" /> <span className="text-foreground">{manga.chapters ?? 'N/A'} Chapters</span>
                                </div>
                                <div className="flex items-center gap-1" title="Volumes">
                                   <Library size={16} className="text-muted-foreground" /> <span className="text-foreground">{manga.volumes ?? 'N/A'} Volumes</span>
                                </div>
                               <div className="flex items-center gap-1" title="Status">
                                   <Clock size={16} className="text-muted-foreground" /> <span className="text-foreground">{formatStatus(manga.status)}</span>
                               </div>
                               {manga.year && (
                                  <div className="flex items-center gap-1" title="Year">
                                    <CalendarDays size={16} className="text-muted-foreground" /> <span className="text-foreground">{manga.year}</span>
                                  </div>
                               )}
                               {/* Add Popularity/Members count if needed */}
                                {/* {manga.members && (
                                   <div className="flex items-center gap-1" title="Popularity">
                                       <Users size={16} className="text-muted-foreground" /> <span className="text-foreground">{manga.members.toLocaleString()} Members</span>
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
                                   {manga.synopsis || 'No synopsis available.'}
                               </CardDescription>
                            </div>

                            {/* Add Author/Artist Info if available from Jikan data */}
                            {/* {manga.authors?.length > 0 && (
                                <div className="mt-6 space-y-2">
                                    <h3 className="text-xl font-semibold">Authors</h3>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                                        {manga.authors.map(a => (
                                            <span key={a.mal_id} className="text-sm text-muted-foreground">
                                                <Link href={a.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary hover:underline">
                                                    {a.name}
                                                </Link> ({a.type})
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )} */}
                        </CardContent>
                    </div>
                </div>
            </Card>
        </div>
    </div>
  );
}

// Skeleton component for loading state - Updated to match layout
function MangaDetailSkeleton() {
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
                              <Skeleton className="h-5 w-20" />
                              <Skeleton className="h-5 w-20" />
                              <Skeleton className="h-5 w-24" />
                              <Skeleton className="h-5 w-16" /> {/* Year Placeholder */}
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

                          {/* Authors Placeholder */}
                          {/* <div className="mt-6 space-y-2">
                             <Skeleton className="h-6 w-24" />
                             <Skeleton className="h-4 w-40" />
                          </div> */}
                      </CardContent>
                  </div>
               </div>
            </Card>
       </div>
    </div>
  );
}