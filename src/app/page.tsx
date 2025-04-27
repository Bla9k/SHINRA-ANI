
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { aiDrivenHomepage, AIDrivenHomepageOutput } from '@/ai/flows/ai-driven-homepage'; // Updated AI flow
import type { Anime, Manga } from '@/services'; // Import types directly from services index
import { Sparkles, AlertCircle, Tv, BookText, Star, CalendarDays, Clock, TrendingUp, Heart, Users } from 'lucide-react'; // Icons
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';

// Define a unified type for items displayed on the homepage
// It should accommodate both Anime and Manga properties from the services
type DisplayItem = (Anime | Manga) & {
    // Ensure common fields needed for the card exist
    mal_id: number;
    id: number; // Consistent ID field (mapped from mal_id)
    title: string;
    type: 'anime' | 'manga';
    imageUrl: string | null; // Derived image URL
    description?: string | null; // Synopsis mapped here
    score?: number | null;
    year?: number | null; // Anime: year, Manga: published year
    status?: string | null;
    episodes?: number | null; // Anime specific
    chapters?: number | null; // Manga specific
    volumes?: number | null; // Manga specific
    genres?: { mal_id: number; name: string }[]; // Simplified genre structure
};

// Helper to map Anime/Manga service types to DisplayItem
const mapToDisplayItem = (item: Anime | Manga): DisplayItem => ({
    ...item,
    id: item.mal_id,
    description: item.synopsis,
    imageUrl: item.images?.jpg?.large_image_url ?? item.images?.jpg?.image_url ?? null,
    // Type might already exist, but ensure it's present
    type: 'episodes' in item ? 'anime' : 'manga',
    // Use manga publish year if anime year is not present
    year: item.year ?? (item.published?.from ? new Date(item.published.from).getFullYear() : null),
});


export default function Home() {
  // State for different homepage sections
  const [homepageData, setHomepageData] = useState<AIDrivenHomepageOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHomepageData = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching homepage data...");
        // TODO: Replace with actual user data (or fetch from context/auth)
        const userProfile = "Loves action and fantasy anime/manga, recently watched Attack on Titan, reads Berserk. Prefers ongoing series but open to classics.";
        const currentMood = "Adventurous";
        const recentActivity = ["Attack on Titan", "Berserk"]; // Example recent titles

        const data = await aiDrivenHomepage({ userProfile, currentMood, recentActivity });
        setHomepageData(data);
        console.log("Homepage data received:", data);

      } catch (err: any) {
        console.error("Failed to fetch homepage data:", err);
        setError(err.message || "Could not load homepage content. Please try refreshing.");
        setHomepageData(null); // Clear data on error
      } finally {
          setLoading(false);
      }
  }, []);

  useEffect(() => {
      fetchHomepageData();
  }, [fetchHomepageData]);


  // Generic Item Card for Anime/Manga
  const ItemCard = ({ item }: { item: DisplayItem }) => {
     if (!item || typeof item.mal_id !== 'number' || !item.title || !item.type) {
        console.warn("ItemCard received invalid item:", item);
        return null; // Don't render if critical info is missing
     }
     const linkHref = `/${item.type}/${item.mal_id}`;

      return (
         <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 hover:scale-[1.03] group flex flex-col h-full">
          <CardHeader className="p-0 relative aspect-[2/3] w-full overflow-hidden">
             {item.imageUrl ? (
               <Image
                 src={item.imageUrl}
                 alt={item.title}
                 fill
                 sizes="(max-width: 640px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 23vw"
                 className="object-cover transition-transform duration-300 group-hover:scale-105"
                 priority={false}
                 unoptimized={false}
                 onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.id}/400/600?grayscale`; }} // Fallback with seed
               />
              ) : (
               <div className="absolute inset-0 bg-muted flex items-center justify-center">
                  {item.type === 'anime' ? <Tv className="w-16 h-16 text-muted-foreground opacity-50" /> : <BookText className="w-16 h-16 text-muted-foreground opacity-50" />}
               </div>
              )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
             <div className="absolute bottom-2 left-3 right-3">
               <CardTitle className="text-md font-semibold text-primary-foreground line-clamp-2 shadow-text">
                  {item.title}
               </CardTitle>
             </div>
          </CardHeader>
          <CardContent className="p-3 flex flex-col flex-grow">
              {/* Genres */}
              {item.genres && item.genres.length > 0 && (
                 <div className="flex gap-1 mb-2 flex-wrap">
                    {item.genres.slice(0, 2).map(g => <Badge key={g.mal_id} variant="secondary" className="text-xs">{g.name}</Badge>)}
                 </div>
              )}
              <CardDescription className="text-xs text-muted-foreground line-clamp-3 mb-3 flex-grow">
                 {item.description || 'No description available.'}
              </CardDescription>

             {/* Footer details */}
             <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-border/50 pt-2 mt-auto">
                 <Badge variant="outline" className="capitalize">{item.type}</Badge>
                {item.score && (
                    <span className="flex items-center gap-1" title="Score">
                        <Star size={12} className="text-yellow-400" /> {item.score.toFixed(1)}
                    </span>
                )}
                 {item.year && (
                     <span className="flex items-center gap-1" title="Year">
                         <CalendarDays size={12} /> {item.year}
                     </span>
                 )}
                 <Button variant="link" size="sm" asChild className="text-xs p-0 h-auto">
                     <Link href={linkHref}>
                        View Details
                     </Link>
                 </Button>
             </div>
          </CardContent>
         </Card>
      );
 };

 // Skeleton Card
 const SkeletonCard = () => (
    <Card className="overflow-hidden glass flex flex-col h-full">
       <CardHeader className="p-0 relative aspect-[2/3] w-full">
          <Skeleton className="h-full w-full" />
       </CardHeader>
       <CardContent className="p-3 space-y-2 flex flex-col flex-grow">
          <Skeleton className="h-4 w-3/4" /> {/* Title */}
          <div className="flex gap-1 mb-1 flex-wrap"> {/* Genres */}
              <Skeleton className="h-4 w-12 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-full" /> {/* Desc line 1 */}
          <Skeleton className="h-3 w-5/6" /> {/* Desc line 2 */}
          <div className="flex-grow" /> {/* Spacer */}
           <div className="flex justify-between items-center border-t border-border/50 pt-2 mt-auto">
              <Skeleton className="h-4 w-14" /> {/* Type Badge */}
              <Skeleton className="h-3 w-8" /> {/* Score */}
              <Skeleton className="h-3 w-10" /> {/* Year */}
              <Skeleton className="h-5 w-1/4" /> {/* Button */}
           </div>
       </CardContent>
    </Card>
 );

 // Helper to render a section grid
 const renderSection = (
    title: string,
    icon: React.ElementType,
    items: (Anime | Manga)[] | undefined, // Expect raw types from service
    loadingOverride?: boolean, // Optional loading override for combined state
    viewAllLink?: string,
    emptyMessage: string = `No ${title.toLowerCase()} available right now.`
 ) => {
     const isLoading = loadingOverride ?? loading; // Use override if provided, else global loading
     const displayItems = items?.map(mapToDisplayItem).filter(Boolean) as DisplayItem[] || [];

     // Only render the section if not loading OR if there are items (even while loading more potentially)
     if (isLoading && displayItems.length === 0) {
         // Render skeletons only on initial load
         return (
             <section className="mb-12">
                 <div className="flex items-center justify-between mb-4">
                     <h2 className="text-2xl font-semibold flex items-center gap-2">
                         {React.createElement(icon, { className: "text-primary w-6 h-6" })} {title}
                     </h2>
                     {viewAllLink && <Skeleton className="h-6 w-20" /> /* Skeleton for View All */}
                 </div>
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
                     {Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={`${title}-skel-${index}`} />)}
                 </div>
             </section>
         );
     }

     // Don't render empty sections if there was an error globally (unless specific items were fetched)
     if (!isLoading && error && displayItems.length === 0) {
         return null;
     }

     // Render section if loading is finished OR if there are items already
     if (!isLoading || displayItems.length > 0) {
        return (
            <section className="mb-12">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                        {React.createElement(icon, { className: "text-primary w-6 h-6" })} {title}
                    </h2>
                    {viewAllLink && (
                        <Button variant="link" size="sm" asChild>
                            <Link href={viewAllLink}>View All</Link>
                        </Button>
                    )}
                </div>
                {displayItems.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
                        {displayItems.map((item) => (
                            item && item.mal_id ? <ItemCard key={`${item.type}-${item.mal_id}`} item={item} /> : null
                        ))}
                    </div>
                ) : (
                    <p className="col-span-full text-center text-muted-foreground py-5">{emptyMessage}</p>
                )}
            </section>
        );
    }

    return null; // Should not be reached ideally
 };


  return (
    <div className="container mx-auto px-4 py-8">
      {/* Global Error Display */}
      {error && !loading && (
           <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Homepage</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
           </Alert>
        )}

      {/* AI Personalized Recommendations Section */}
      <section className="mb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
           <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 shrink-0">
             <Sparkles className="text-primary w-6 h-6 md:w-7 md:h-7" />
             Nami's Picks For You
           </h1>
            {homepageData?.reasoning && !loading && (
               <p className="text-xs md:text-sm text-muted-foreground italic text-left sm:text-right border-l-2 border-primary pl-2 sm:border-l-0 sm:pl-0">
                   "{homepageData.reasoning}"
               </p>
           )}
        </div>
         {/* Combined Personalized Grid */}
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
            {loading && (!homepageData || (!homepageData.personalizedAnime?.length && !homepageData.personalizedManga?.length))
              ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={`rec-skel-${index}`} />)
              : (homepageData?.personalizedAnime || []).concat(homepageData?.personalizedManga || [])
                  .sort(() => 0.5 - Math.random()) // Shuffle combined list
                  .slice(0, 6) // Take top 6
                  .map(mapToDisplayItem)
                  .filter(Boolean) // Filter out potential nulls if mapping fails
                  .map((item) => (
                     item && item.mal_id ? <ItemCard key={`personalized-${item.type}-${item.mal_id}`} item={item as DisplayItem} /> : null
                  ))
            }
            {/* Empty state for personalized section specifically */}
            {!loading && !error && (!homepageData?.personalizedAnime?.length && !homepageData?.personalizedManga?.length) && (
                  <p className="col-span-full text-center text-muted-foreground py-5">Nami is still getting to know you! Browse around to get personalized picks.</p>
            )}
         </div>
      </section>


       {/* Trending Anime Section */}
       {renderSection(
            "Trending Anime",
            TrendingUp,
            homepageData?.trendingAnime,
            loading,
            "/anime?sort=popularity"
        )}

       {/* Trending Manga Section */}
        {renderSection(
            "Trending Manga",
            TrendingUp,
            homepageData?.trendingManga,
            loading,
            "/manga?sort=popularity"
        )}

       {/* Popular Anime Section */}
         {renderSection(
            "Popular Anime",
            Star,
            homepageData?.popularAnime,
            loading,
            "/anime?sort=score"
         )}

        {/* Popular Manga Section */}
         {renderSection(
            "Popular Manga",
            Star,
            homepageData?.popularManga,
            loading,
            "/manga?sort=score"
         )}

        {/* You might add other sections like 'Upcoming', 'Airing Now' by modifying the AIDrivenHomepageOutput and flow */}
         {/* Example:
         {renderSection("Airing Now Anime", Clock, homepageData?.airingAnime, loading, "/anime?status=airing")}
         */}

    </div>
  );
}


// Basic text shadow utility class
const styles = `
  .shadow-text {
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
  }
`;
// Inject styles
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
