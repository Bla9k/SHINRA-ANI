
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { getMangaDetails, Manga, getMangaRecommendations } from '@/services/manga'; // Import getMangaRecommendations
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Star, BookText, Layers, Library, Clock, ExternalLink, AlertCircle, CalendarDays, BookOpen, VideoOff, Sparkles, ArrowRight, User, MessageSquare } from 'lucide-react'; // Import Sparkles, ArrowRight, User, MessageSquare
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { ItemCard, SkeletonItemCard } from '@/components/shared/ItemCard'; // Import ItemCard components
import { getMoodBasedRecommendations } from '@/ai/flows/mood-based-recommendations'; // Import Nami AI flow

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
    items: Manga[] | null | undefined,
    isLoading: boolean,
    emptyMessage: string = "Nothing to show here right now.",
    itemComponent: React.FC<{ item: Manga }> = ItemCard,
    skeletonComponent: React.FC = SkeletonItemCard
) => {
    const validItems = Array.isArray(items) ? items : [];

    return (
        <section className="mb-8">
            <div className="flex items-center justify-between mb-3 md:mb-4 px-0">
                <h3 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
                    {React.createElement(icon, { className: "text-primary w-5 h-5 md:w-6 md:h-6" })} {title}
                </h3>
                {/* Optional: Add View All Link */}
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
                            : !isLoading && <p className="text-center text-muted-foreground italic px-4 py-5">{emptyMessage}</p>}
                </div>
            </div>
        </section>
    );
};

export default function MangaDetailPage() {
  const params = useParams();
  const id = params.id ? parseInt(params.id as string, 10) : NaN;

  const [manga, setManga] = useState<Manga | null>(null);
  const [recommendations, setRecommendations] = useState<Manga[]>([]);
  const [namiRecommendations, setNamiRecommendations] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [loadingNamiRecs, setLoadingNamiRecs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [namiError, setNamiError] = useState<string | null>(null);


  useEffect(() => {
    if (isNaN(id)) {
      setError('Invalid Manga ID.');
      setLoading(false);
      setLoadingRecs(false);
      setLoadingNamiRecs(false);
      return;
    }

    async function fetchMangaData() {
       setLoading(true);
       setLoadingRecs(true);
       setLoadingNamiRecs(true);
       setError(null);
       setNamiError(null);
       setManga(null);
       setRecommendations([]);
       setNamiRecommendations([]);

      try {
        // Fetch main details
        const fetchedManga = await getMangaDetails(id);
        if (!fetchedManga) {
            setError('Manga details not found.');
            notFound();
            return;
        }
        setManga(fetchedManga);
        setLoading(false);

        // Fetch Jikan recommendations
        getMangaRecommendations(id).then(recs => {
            setRecommendations(recs);
        }).catch(err => {
            console.error("Failed to load Jikan recommendations:", err);
        }).finally(() => setLoadingRecs(false));

        // Fetch Nami AI recommendations
        const namiInput = {
            mood: "Similar to this",
            watchHistory: [fetchedManga.title],
            profileActivity: `Interested in manga like ${fetchedManga.title}, particularly genres: ${fetchedManga.genres.map(g => g.name).join(', ')}.`,
        };
        getMoodBasedRecommendations(namiInput).then(namiRecs => {
            // Filter AI results to only include Manga
            setNamiRecommendations(namiRecs.mangaRecommendations || []);
        }).catch(err => {
             console.error("Failed to load Nami recommendations:", err);
             setNamiError("Nami couldn't find recommendations right now.");
        }).finally(() => setLoadingNamiRecs(false));

      } catch (err: any) {
        console.error(`Error fetching manga details for ID ${id}:`, err);
        setError(err.message || 'Failed to load manga details.');
      } finally {
         // Ensure all loading states are false if not already set
         setLoading(false);
         setLoadingRecs(false);
         setLoadingNamiRecs(false);
      }
    }

    fetchMangaData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading && !manga) {
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
      return (
          <div className="container mx-auto px-4 py-8 text-center">
              <p className="text-muted-foreground">Manga not found.</p>
          </div>
      );
  }

  return (
     <div className="container mx-auto px-4 py-8">
        {/* Background Image Section */}
        <div className="absolute inset-x-0 top-0 h-[40vh] md:h-[60vh] -z-10 overflow-hidden">
             {manga.imageUrl && (
                 <Image
                     src={manga.imageUrl}
                     alt={`${manga.title} backdrop`}
                     fill
                     className="object-cover object-top opacity-15 blur-md scale-110" // Slightly less opacity
                     aria-hidden="true"
                     priority
                 />
             )}
            <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/80 to-background" />
        </div>

        <div className="relative mt-16 md:mt-32"> {/* Increased top margin */}
            <Card className="overflow-visible glass border-primary/20 shadow-xl backdrop-blur-xl bg-card/60 mb-12">
                <div className="flex flex-col md:flex-row gap-6 md:gap-10 p-4 md:p-8">
                    {/* Left Column: Cover Image & Actions */}
                    <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 mx-auto md:mx-0 text-center -mt-24 md:-mt-32 z-10">
                        <Card className="overflow-hidden aspect-[2/3] relative shadow-lg neon-glow border-2 border-primary/50 w-48 md:w-full mx-auto">
                           {manga.imageUrl ? (
                              <Image
                                src={manga.imageUrl}
                                alt={manga.title}
                                fill
                                sizes="(max-width: 768px) 192px, 25vw"
                                className="object-cover"
                                priority
                              />
                           ) : (
                               <div className="h-full w-full bg-muted flex items-center justify-center">
                                 <BookText className="w-16 h-16 text-muted-foreground opacity-50" />
                               </div>
                           )}
                        </Card>
                        {/* Actions Buttons */}
                        <div className="flex flex-col gap-3 mt-4">
                            <Button size="sm" className="w-full" disabled title="Manga reader coming soon!">
                                <VideoOff size={16} className="mr-2 opacity-50"/> Read (Coming Soon)
                            </Button>
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
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col">
                        <CardHeader className="p-0 mb-3">
                           <CardTitle className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary">{manga.title}</CardTitle>
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
                                   <Layers size={16} className="text-muted-foreground" /> <span className="text-foreground">{manga.chapters ?? 'N/A'} Ch</span>
                                </div>
                                <div className="flex items-center gap-1" title="Volumes">
                                   <Library size={16} className="text-muted-foreground" /> <span className="text-foreground">{manga.volumes ?? 'N/A'} Vol</span>
                                </div>
                               <div className="flex items-center gap-1" title="Status">
                                   <Clock size={16} className="text-muted-foreground" /> <span className="text-foreground">{formatStatus(manga.status)}</span>
                               </div>
                               {manga.year && (
                                  <div className="flex items-center gap-1" title="Year">
                                    <CalendarDays size={16} className="text-muted-foreground" /> <span className="text-foreground">{manga.year}</span>
                                  </div>
                               )}
                           </div>
                         </Card>

                        <Separator className="my-4 bg-border/50" />

                         {/* Synopsis */}
                        <CardContent className="p-0 flex-grow">
                            <div className="space-y-2">
                               <h3 className="text-xl font-semibold mb-2">Synopsis</h3>
                               <ScrollArea className="h-24 pr-3"> {/* Limit synopsis height */}
                                  <CardDescription className="text-base leading-relaxed prose prose-invert prose-sm max-w-none">
                                      {manga.synopsis || 'No synopsis available.'}
                                  </CardDescription>
                               </ScrollArea>
                            </div>
                        </CardContent>
                    </div>
                </div>
            </Card>

            {/* Chapters Section - Disabled */}
            <section className="mb-12">
                 <h3 className="text-2xl font-semibold mb-4">Chapters</h3>
                 <Card className="glass p-6 flex flex-col items-center justify-center text-center border-border/50">
                     <BookOpen size={40} className="mb-3 text-muted-foreground opacity-50"/>
                     <p className="font-medium text-muted-foreground">Manga Reading Coming Soon!</p>
                     <p className="text-sm text-muted-foreground">We're working hard to bring you a seamless reading experience.</p>
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
                    "", // Title already present
                    () => null, // No icon needed here
                    namiRecommendations,
                    loadingNamiRecs,
                    "Nami couldn't find any recommendations based on this manga right now.",
                    ItemCard,
                    SkeletonItemCard
                )}
            </section>

             {/* Related Manga Section (Jikan Recommendations) */}
             {renderHorizontalSection(
                "Related Manga",
                BookText,
                recommendations,
                loadingRecs,
                "No related manga found.",
                ItemCard,
                SkeletonItemCard
            )}

             {/* Optional: Add Characters section here */}

        </div>
    </div>
  );
}

// Skeleton component for loading state - Updated to match layout
function MangaDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      {/* Skeleton Background */}
       <div className="absolute inset-x-0 top-0 h-[40vh] md:h-[60vh] -z-10 overflow-hidden">
            <Skeleton className="h-full w-full opacity-15 blur-md scale-110" />
           <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/80 to-background" />
       </div>

       <div className="relative mt-16 md:mt-32">
            <Card className="overflow-visible glass border-primary/20 bg-card/60 mb-12">
               <div className="flex flex-col md:flex-row gap-6 md:gap-10 p-4 md:p-8">
                 {/* Left Column: Cover Image & Actions */}
                  <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 mx-auto md:mx-0 text-center -mt-24 md:-mt-32 z-10">
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
                              <Skeleton className="h-5 w-20" />
                              <Skeleton className="h-5 w-20" />
                              <Skeleton className="h-5 w-24" />
                              <Skeleton className="h-5 w-16" /> {/* Year Placeholder */}
                           </div>
                      </Card>

                      <Separator className="my-4 bg-border/50" />

                      {/* Synopsis Skeleton */}
                      <CardContent className="p-0 flex-grow">
                          <div className="space-y-2 mb-6">
                            <Skeleton className="h-7 w-32 mb-2" /> {/* Synopsis Title */}
                             <div className="h-24 pr-3 space-y-2"> {/* Matching ScrollArea height */}
                               <Skeleton className="h-4 w-full" />
                               <Skeleton className="h-4 w-full" />
                               <Skeleton className="h-4 w-5/6" />
                            </div>
                          </div>
                      </CardContent>
                  </div>
               </div>
            </Card>

            {/* Chapters Skeleton */}
             <section className="mb-12">
                <Skeleton className="h-8 w-36 mb-4" />
                <Card className="glass p-6">
                    <div className="flex flex-col items-center justify-center text-center">
                         <Skeleton className="h-10 w-10 rounded-full mb-3" />
                         <Skeleton className="h-5 w-48 mb-2" />
                         <Skeleton className="h-4 w-64" />
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
