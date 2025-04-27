
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { aiDrivenHomepage, AIDrivenHomepageOutput } from '@/ai/flows/ai-driven-homepage'; // Updated AI flow
import { getAnimes, Anime, AnimeResponse } from '@/services/anime'; // Jikan-based anime service
import { getMangas, Manga, MangaResponse } from '@/services/manga'; // Jikan-based manga service
import { Sparkles, AlertCircle, Tv, BookText, Star, CalendarDays, Clock, TrendingUp, Heart } from 'lucide-react'; // Added icons
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';

// Define types for combined recommendations (can be Anime or Manga from Jikan)
// Ensure this type aligns with the output of aiDrivenHomepage and Jikan services mapping
type RecommendationItem = (Anime | Manga) & {
    mal_id: number;
    id: number; // Consistent ID field (mapped from mal_id)
    title: string;
    type: 'anime' | 'manga';
    imageUrl: string | null; // Derived image URL
    description?: string | null; // Synopsis mapped here
    score?: number | null;
    year?: number | null; // For anime
    status?: string | null; // For manga
    episodes?: number | null; // For anime
    chapters?: number | null; // For manga
    volumes?: number | null; // For manga
    genres?: { mal_id: number; name: string }[]; // Simple genre structure
};


export default function Home() {
  // AI Recommendations State
  const [recommendations, setRecommendations] = useState<AIDrivenHomepageOutput | null>(null);
  const [recommendedContent, setRecommendedContent] = useState<RecommendationItem[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [errorRecommendations, setErrorRecommendations] = useState<string | null>(null);

  // Other Sections State
  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([]);
  const [trendingManga, setTrendingManga] = useState<Manga[]>([]);
  const [airingNowAnime, setAiringNowAnime] = useState<Anime[]>([]);
  const [upcomingAnime, setUpcomingAnime] = useState<Anime[]>([]);
  const [popularAnime, setPopularAnime] = useState<Anime[]>([]); // Added Popular Anime
  const [popularManga, setPopularManga] = useState<Manga[]>([]); // Added Popular Manga
  const [favoriteAnime, setFavoriteAnime] = useState<Anime[]>([]); // Added Favorite Anime

  // Combined Loading/Error State for non-AI sections
  const [loadingSections, setLoadingSections] = useState(true);
  const [errorSections, setErrorSections] = useState<string | null>(null);


  // Helper to map Jikan Anime/Manga to RecommendationItem
   const mapToRecommendationItem = (item: Anime | Manga): RecommendationItem => ({
      ...item,
      id: item.mal_id,
      description: item.synopsis,
      imageUrl: item.imageUrl ?? item.images?.jpg?.large_image_url ?? item.images?.jpg?.image_url ?? null,
      // Ensure type is correctly passed or inferred
      type: item.type || ('episodes' in item ? 'anime' : 'manga'), // Simple inference if type missing
   });


  const fetchInitialData = useCallback(async () => {
      // Reset states
      setLoadingRecommendations(true);
      setLoadingSections(true);
      setErrorRecommendations(null);
      setErrorSections(null);
      setRecommendedContent([]);
      setTrendingAnime([]);
      setTrendingManga([]);
      setAiringNowAnime([]);
      setUpcomingAnime([]);
      setPopularAnime([]);
      setPopularManga([]);
      setFavoriteAnime([]);


      // --- Fetch AI Recommendations (Structured Data) ---
      try {
        console.log("Fetching AI recommendations...");
        // TODO: Replace with actual user data
        const userProfile = "Loves action and fantasy anime, recently watched Attack on Titan. Enjoys ongoing manga series.";
        const currentMood = "Excited";
        const aiOutput = await aiDrivenHomepage({ userProfile, currentMood });
        setRecommendations(aiOutput);
        console.log("AI Recommendations received:", aiOutput);

        // Combine and shuffle AI recommendations
        const combinedAiRecs = [
            ...(aiOutput.animeRecommendations || []).map(mapToRecommendationItem),
            ...(aiOutput.mangaRecommendations || []).map(mapToRecommendationItem)
        ];
        combinedAiRecs.sort(() => Math.random() - 0.5); // Shuffle
        setRecommendedContent(combinedAiRecs.slice(0, 6)); // Show max 6 AI recs

      } catch (aiError: any) {
        console.error("Failed to fetch AI recommendations:", aiError);
        setErrorRecommendations(aiError.message || "Nami couldn't generate recommendations right now.");
      } finally {
          setLoadingRecommendations(false); // AI part is done
      }

      // --- Fetch Other Sections Concurrently ---
      try {
          console.log("Fetching other sections (Trending, Airing, Upcoming, Popular, Favorites)...");
          const results = await Promise.allSettled([
                getAnimes(undefined, undefined, undefined, undefined, undefined, 1, 'popularity', 6), // Trending Anime (Popularity)
                getMangas(undefined, undefined, undefined, undefined, 1, 'popularity', 6), // Trending Manga (Popularity)
                getAnimes(undefined, undefined, undefined, undefined, 'airing', 1, 'popularity', 6), // Airing Now Anime
                getAnimes(undefined, undefined, undefined, undefined, 'upcoming', 1, 'start_date', 6), // Upcoming Anime (Newest Start)
                getAnimes(undefined, undefined, undefined, undefined, undefined, 1, 'score', 6), // Popular Anime (Score)
                getMangas(undefined, undefined, undefined, undefined, 1, 'score', 6), // Popular Manga (Score)
                getAnimes(undefined, undefined, undefined, undefined, undefined, 1, 'favorites', 6), // Favorite Anime (by MAL Favs)
            ]);

          // Process results - check status and set state or error
          const handleResult = (index: number, setter: Function, type: string) => {
                if (results[index].status === 'fulfilled') {
                    const response = results[index].value as AnimeResponse | MangaResponse;
                    setter('animes' in response ? response.animes : response.mangas);
                } else {
                    console.error(`Failed to fetch ${type}:`, results[index].reason);
                    setErrorSections(prev => prev ? `${prev}, ${type}` : `Could not load ${type}`);
                }
            };

            handleResult(0, setTrendingAnime, 'Trending Anime');
            handleResult(1, setTrendingManga, 'Trending Manga');
            handleResult(2, setAiringNowAnime, 'Airing Now Anime');
            handleResult(3, setUpcomingAnime, 'Upcoming Anime');
            handleResult(4, setPopularAnime, 'Popular Anime');
            handleResult(5, setPopularManga, 'Popular Manga');
            handleResult(6, setFavoriteAnime, 'Favorite Anime');

          console.log("Finished fetching other sections.");

      } catch (sectionsError: any) {
           console.error("Error fetching other sections:", sectionsError);
           setErrorSections("Could not load some sections.");
      } finally {
          setLoadingSections(false);
      }

  }, []);

  useEffect(() => {
      fetchInitialData();
  }, [fetchInitialData]);


  // Generic Item Card for Anime/Manga
  const ItemCard = ({ item }: { item: RecommendationItem }) => {
      // Ensure item has necessary properties before rendering
     if (!item || typeof item.mal_id !== 'number' || !item.title || !item.type) {
        console.warn("ItemCard received invalid item:", item);
        return null; // Don't render if critical info is missing
     }

     const linkHref = `/${item.type}/${item.mal_id}`;

      return (
         <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 hover:scale-[1.03] group flex flex-col h-full">
          <CardHeader className="p-0 relative aspect-[2/3] w-full overflow-hidden"> {/* Aspect ratio */}
             {item.imageUrl ? (
               <Image
                 src={item.imageUrl}
                 alt={item.title}
                 fill
                 sizes="(max-width: 640px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 23vw"
                 className="object-cover transition-transform duration-300 group-hover:scale-105"
                 priority={false} // Lower priority for non-critical images
                 unoptimized={false} // Assume optimization unless known issue
                 onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/400/600?grayscale'; }} // Fallback
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
              <CardDescription className="text-xs text-muted-foreground line-clamp-3 mb-3 flex-grow">
                 {item.description || 'No description available.'}
              </CardDescription>

             <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-border/50 pt-2 mt-auto">
                <Badge variant="outline" className="capitalize">{item.type}</Badge>
                {item.score && (
                    <span className="flex items-center gap-1">
                        <Star size={12} className="text-yellow-400" /> {item.score.toFixed(1)}
                    </span>
                )}
                 {/* Link using mal_id from the original data */}
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

 // Skeleton Card remains the same structurally
 const SkeletonCard = () => (
    <Card className="overflow-hidden glass flex flex-col h-full">
       <CardHeader className="p-0 relative aspect-[2/3] w-full">
          <Skeleton className="h-full w-full" />
       </CardHeader>
       <CardContent className="p-3 space-y-2 flex flex-col flex-grow">
          <Skeleton className="h-4 w-3/4" /> {/* Title */}
          <Skeleton className="h-3 w-full" /> {/* Desc line 1 */}
          <Skeleton className="h-3 w-5/6" /> {/* Desc line 2 */}
          <div className="flex-grow" /> {/* Spacer */}
           <div className="flex justify-between items-center border-t border-border/50 pt-2 mt-auto">
              <Skeleton className="h-4 w-14" /> {/* Type Badge */}
              <Skeleton className="h-3 w-8" /> {/* Score */}
              <Skeleton className="h-5 w-1/4" /> {/* Button */}
           </div>
       </CardContent>
    </Card>
 );

 // Helper to render a section grid
 const renderSection = (
    title: string,
    icon: React.ElementType,
    items: (Anime | Manga)[], // Expect raw Jikan types
    loading: boolean,
    error: string | null,
    viewAllLink?: string
 ) => (
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
        {/* Specific error for this section */}
        {error && error.toLowerCase().includes(title.toLowerCase().split(' ')[0]) && !loading && (
             <Alert variant="destructive" className="mb-6">
                 <AlertCircle className="h-4 w-4" />
                 <AlertTitle>Error Loading Section</AlertTitle>
                 <AlertDescription>Could not load {title.toLowerCase()}.</AlertDescription>
             </Alert>
         )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
            {loading
                ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={`${title}-skel-${index}`} />)
                : items.length > 0
                    ? items.map((item) => {
                          const mappedItem = mapToRecommendationItem(item);
                          // Ensure unique key using type and mal_id
                          if (!mappedItem || !mappedItem.mal_id) return null; // Skip if invalid item after mapping
                          return <ItemCard key={`${mappedItem.type}-${mappedItem.mal_id}`} item={mappedItem} />;
                      })
                    : !error && <p className="col-span-full text-center text-muted-foreground py-5">No {title.toLowerCase()} found.</p>
            }
        </div>
    </section>
 );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* AI Recommendations Section */}
      <section className="mb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
           <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 shrink-0">
             <Sparkles className="text-primary w-6 h-6 md:w-7 md:h-7" />
             Nami's Picks For You
           </h1>
            {recommendations?.reasoning && !loadingRecommendations && !errorRecommendations && recommendedContent.length > 0 && (
               <p className="text-xs md:text-sm text-muted-foreground italic text-left sm:text-right border-l-2 border-primary pl-2 sm:border-l-0 sm:pl-0">
                   "{recommendations.reasoning}"
               </p>
           )}
        </div>
        {errorRecommendations && !loadingRecommendations && (
           <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Could Not Get Nami's Picks</AlertTitle>
              <AlertDescription>{errorRecommendations}</AlertDescription>
           </Alert>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
           {loadingRecommendations
             ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={`rec-skel-${index}`} />)
             : recommendedContent.length > 0
               ? recommendedContent.map((item) => (
                 // Key uses type and mal_id, validation inside ItemCard
                 item && item.mal_id ? <ItemCard key={`${item.type}-${item.mal_id}`} item={item} /> : null
               ))
               : !errorRecommendations && <p className="col-span-full text-center text-muted-foreground py-5">Nami couldn't find any specific recommendations right now.</p>
            }
         </div>
      </section>

      {/* Combined error for other sections */}
       {errorSections && !errorSections.toLowerCase().includes('all') && !loadingSections && (
         <Alert variant="destructive" className="mb-6">
             <AlertCircle className="h-4 w-4" />
             <AlertTitle>Error Loading Sections</AlertTitle>
             <AlertDescription>Failed to load: {errorSections}. Please try refreshing.</AlertDescription>
         </Alert>
        )}

       {/* Trending Anime Section */}
       {renderSection(
            "Trending Anime",
            TrendingUp, // Use TrendingUp icon
            trendingAnime,
            loadingSections,
            errorSections,
            "/anime?sort=popularity" // Link to filtered view
        )}

       {/* Trending Manga Section */}
        {renderSection(
            "Trending Manga",
            TrendingUp,
            trendingManga,
            loadingSections, // Use combined loading state
            errorSections, // Use combined error state
            "/manga?sort=popularity"
        )}

       {/* Airing Now Section */}
        {renderSection(
            "Airing Now",
            Clock,
            airingNowAnime,
            loadingSections,
            errorSections,
            "/anime?status=airing"
        )}

       {/* Upcoming Section */}
        {renderSection(
            "Upcoming Anime",
            CalendarDays,
            upcomingAnime,
            loadingSections,
            errorSections,
            "/anime?status=upcoming"
        )}

        {/* Popular Anime Section */}
         {renderSection(
            "Popular Anime",
            Star, // Use Star icon
            popularAnime,
            loadingSections,
            errorSections,
            "/anime?sort=score"
         )}

        {/* Popular Manga Section */}
         {renderSection(
            "Popular Manga",
            Star,
            popularManga,
            loadingSections,
            errorSections,
            "/manga?sort=score"
         )}

         {/* Favorite Anime Section */}
          {renderSection(
             "Most Favorited Anime", // Renamed slightly
             Heart, // Use Heart icon
             favoriteAnime,
             loadingSections,
             errorSections,
             "/anime?sort=favorites"
          )}

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
