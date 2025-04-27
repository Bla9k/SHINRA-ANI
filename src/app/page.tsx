
'use client';

import React, { useState, useEffect, useCallback } from 'react'; // Add React import
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { aiDrivenHomepage, AIDrivenHomepageOutput } from '@/ai/flows/ai-driven-homepage';
import { getAnimes, Anime, AnimeResponse } from '@/services/anime'; // Import Jikan-based anime service
import { getMangas, Manga, MangaResponse } from '@/services/manga'; // Import Jikan-based manga service
import { Sparkles, AlertCircle, Tv, BookText, Star, CalendarDays, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';

// Define types for combined recommendations (can be Anime or Manga from Jikan)
type RecommendationItem = (Anime | Manga) & {
  // Ensure core fields are present and map mal_id to id for consistency if needed by Card
  mal_id: number;
  id: number; // Added for key consistency
  title: string;
  type: 'anime' | 'manga';
  imageUrl: string | null; // Already derived in service
  description?: string | null; // Use synopsis
  score?: number | null; // Add score
};

// Helper function to introduce a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to fetch details based on title sequentially with delays
async function fetchDetailsByTitleWithDelay(
    titles: string[],
    fetchFunction: (genre?: string | number, year?: number, minScore?: number, search?: string, status?: string, page?: number, sort?: string) => Promise<AnimeResponse | MangaResponse>,
    itemType: 'anime' | 'manga',
    delayMs = 1500 // Maintain 1.5s delay for Jikan
): Promise<RecommendationItem[]> {
    const results: RecommendationItem[] = [];
    const uniqueTitles = Array.from(new Set(titles.filter(t => t)));

    for (const title of uniqueTitles) {
        try {
            console.log(`Fetching ${itemType} details for: "${title}"`);
            const response = await fetchFunction(undefined, undefined, undefined, title, undefined, 1);
            let firstMatch: Anime | Manga | null = null;

            if ('animes' in response && response.animes?.length > 0) {
                firstMatch = response.animes[0];
            } else if ('mangas' in response && response.mangas?.length > 0) {
                firstMatch = response.mangas[0];
            }

             // Looser check: see if the Jikan result title CONTAINS a significant part of the requested title
             const jikanTitleLower = firstMatch?.title?.toLowerCase();
             const requestedTitleLower = title.toLowerCase();
             const matchThreshold = Math.min(5, Math.floor(requestedTitleLower.length * 0.5)); // Match first 5 chars or 50%

            if (firstMatch && jikanTitleLower?.includes(requestedTitleLower.substring(0, matchThreshold))) {
                 if (firstMatch && firstMatch.mal_id && firstMatch.title) {
                    // Ensure mapping aligns with RecommendationItem
                    const mappedItem = {
                        ...firstMatch,
                        id: firstMatch.mal_id, // Ensure id exists
                        type: itemType,
                        description: firstMatch.synopsis, // Use synopsis for description
                        score: firstMatch.score ?? null,
                        imageUrl: firstMatch.imageUrl ?? null, // Use derived imageUrl
                    } as RecommendationItem; // Cast to the union type

                     // Explicitly check if necessary fields exist after mapping
                     if (mappedItem.mal_id && mappedItem.title && mappedItem.type) {
                       results.push(mappedItem);
                     } else {
                        console.warn(`Mapped item for "${title}" is missing critical fields. Skipping.`);
                     }
                } else {
                     console.warn(`Could not fetch valid details for ${itemType} "${title}" from Jikan (no match or missing critical fields). Response:`, firstMatch);
                }
            } else {
                 console.warn(`Jikan search for "${title}" returned a best match "${firstMatch?.title}" that might not be accurate. Skipping.`);
            }
        } catch (err) {
            console.error(`Error fetching details for ${itemType} "${title}" from Jikan:`, err);
        }
        await delay(delayMs);
    }
    return results;
}


export default function Home() {
  // AI Recommendations State
  const [recommendations, setRecommendations] = useState<AIDrivenHomepageOutput | null>(null);
  const [recommendedContent, setRecommendedContent] = useState<RecommendationItem[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [errorRecommendations, setErrorRecommendations] = useState<string | null>(null);

  // Trending State
  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([]);
  const [trendingManga, setTrendingManga] = useState<Manga[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [errorTrending, setErrorTrending] = useState<string | null>(null);

  // Airing Now State
  const [airingNowAnime, setAiringNowAnime] = useState<Anime[]>([]);
  const [loadingAiring, setLoadingAiring] = useState(true);
  const [errorAiring, setErrorAiring] = useState<string | null>(null);

  // Upcoming State
  const [upcomingAnime, setUpcomingAnime] = useState<Anime[]>([]);
  const [loadingUpcoming, setLoadingUpcoming] = useState(true);
  const [errorUpcoming, setErrorUpcoming] = useState<string | null>(null);


  const fetchInitialData = useCallback(async () => {
      // Reset loading states
      setLoadingRecommendations(true);
      setLoadingTrending(true);
      setLoadingAiring(true);
      setLoadingUpcoming(true);
      setErrorRecommendations(null);
      setErrorTrending(null);
      setErrorAiring(null);
      setErrorUpcoming(null);
      setRecommendedContent([]); // Clear previous AI recs

      // --- Fetch AI Recommendation Titles ---
      let aiOutput: AIDrivenHomepageOutput | null = null;
      try {
        console.log("Fetching AI recommendations...");
        // TODO: Replace with actual user data
        const userProfile = "Loves action and fantasy anime, recently watched Attack on Titan. Enjoys ongoing manga series.";
        const currentMood = "Excited";
        aiOutput = await aiDrivenHomepage({ userProfile, currentMood });
        setRecommendations(aiOutput);
        console.log("AI Recommendations received:", aiOutput);

        // --- Fetch Details for AI Recommendations ---
        if (aiOutput && (aiOutput.animeRecommendations?.length > 0 || aiOutput.mangaRecommendations?.length > 0)) {
             const animeTitles = aiOutput.animeRecommendations || [];
             const mangaTitles = aiOutput.mangaRecommendations || [];
             try {
                 console.log("Fetching details for AI recommended anime...");
                 const animeResults = await fetchDetailsByTitleWithDelay(animeTitles, getAnimes, 'anime');
                 console.log("Fetching details for AI recommended manga...");
                 const mangaResults = await fetchDetailsByTitleWithDelay(mangaTitles, getMangas, 'manga');

                 // Combine, ensure uniqueness based on type and mal_id, and shuffle
                 const combinedResults = [...animeResults, ...mangaResults];
                 const uniqueResultsMap = new Map<string, RecommendationItem>();
                 combinedResults.forEach(item => {
                     if (item && typeof item.mal_id === 'number') {
                         const uniqueKey = `${item.type}-${item.mal_id}`;
                         if (!uniqueResultsMap.has(uniqueKey)) {
                              // Add the 'id' field mapped from 'mal_id'
                             uniqueResultsMap.set(uniqueKey, { ...item, id: item.mal_id });
                         }
                     }
                 });
                 const uniqueRecommendedContent = Array.from(uniqueResultsMap.values());
                 uniqueRecommendedContent.sort(() => Math.random() - 0.5); // Shuffle
                 setRecommendedContent(uniqueRecommendedContent.slice(0, 6)); // Show max 6 AI recs
                 console.log("Combined AI recommendation details fetched:", uniqueRecommendedContent.slice(0, 6));
             } catch (detailFetchError: any) {
                  console.error("Error fetching details for AI recommendations:", detailFetchError);
                  setErrorRecommendations(prev => prev || "Failed to fetch details for some recommendations.");
             }
        } else {
             console.log("No AI recommendations provided or AI flow failed gracefully.");
        }
      } catch (aiError: any) {
        console.error("Failed to fetch AI recommendations:", aiError);
        setErrorRecommendations(aiError.message || "Nami couldn't generate recommendations right now.");
      } finally {
          setLoadingRecommendations(false); // AI part is done
      }

      // --- Fetch Other Sections (Trending, Airing, Upcoming) ---
      // Using Promise.allSettled to fetch concurrently but handle individual failures
      const results = await Promise.allSettled([
          getAnimes(undefined, undefined, undefined, undefined, undefined, 1, 'popularity'), // Trending Anime
          getMangas(undefined, undefined, undefined, undefined, 1, 'popularity'), // Trending Manga
          getAnimes(undefined, undefined, undefined, undefined, 'airing', 1, 'popularity'), // Airing Now Anime
          getAnimes(undefined, undefined, undefined, undefined, 'upcoming', 1, 'start_date') // Upcoming Anime
      ]);

      // Process Trending Anime
      if (results[0].status === 'fulfilled') {
          setTrendingAnime(results[0].value.animes.slice(0, 6));
      } else {
          console.error("Failed to fetch trending anime:", results[0].reason);
          setErrorTrending("Could not load trending anime.");
      }
      setLoadingTrending(false);

       // Process Trending Manga
      if (results[1].status === 'fulfilled') {
          setTrendingManga(results[1].value.mangas.slice(0, 6));
      } else {
          console.error("Failed to fetch trending manga:", results[1].reason);
          setErrorTrending(prev => prev ? "Could not load trending content." : "Could not load trending manga."); // Combine error message if anime also failed
      }
       // Note: setLoadingTrending(false) is already called after anime

       // Process Airing Now Anime
      if (results[2].status === 'fulfilled') {
          setAiringNowAnime(results[2].value.animes.slice(0, 6));
      } else {
          console.error("Failed to fetch airing now anime:", results[2].reason);
          setErrorAiring("Could not load currently airing anime.");
      }
      setLoadingAiring(false);

      // Process Upcoming Anime
      if (results[3].status === 'fulfilled') {
          setUpcomingAnime(results[3].value.animes.slice(0, 6));
      } else {
          console.error("Failed to fetch upcoming anime:", results[3].reason);
          setErrorUpcoming("Could not load upcoming anime.");
      }
      setLoadingUpcoming(false);

  }, []);

  useEffect(() => {
      fetchInitialData();
  }, [fetchInitialData]);


  // Generic Item Card for Anime/Manga
  const ItemCard = ({ item }: { item: RecommendationItem }) => (
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
                 <Link href={`/${item.type}/${item.mal_id}`}>
                    View Details
                 </Link>
             </Button>
         </div>
      </CardContent>
     </Card>
  );

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
    items: RecommendationItem[],
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
        {error && !loading && (
            <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error Loading Content</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
            {loading
                ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={`${title}-skel-${index}`} />)
                : items.length > 0
                    ? items.map((item) => (
                         // Ensure unique key using type and mal_id
                         item && item.mal_id ? <ItemCard key={`${item.type}-${item.mal_id}`} item={item} /> : null
                      ))
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
                 // Use mal_id for key, ensure item and id are valid
                 item && item.mal_id ? <ItemCard key={`${item.type}-${item.mal_id}`} item={item} /> : null
               ))
               : !errorRecommendations && <p className="col-span-full text-center text-muted-foreground py-5">Nami couldn't find any specific recommendations right now, or failed to fetch details.</p>
            }
         </div>
      </section>

       {/* Trending Anime Section */}
       {renderSection(
            "Trending Anime",
            Tv,
            // Map Anime to RecommendationItem structure
            trendingAnime.map(a => ({...a, id: a.mal_id, description: a.synopsis, type: 'anime'})),
            loadingTrending,
            errorTrending,
            "/anime?sort=popularity" // Link to filtered view
        )}

       {/* Trending Manga Section */}
        {renderSection(
            "Trending Manga",
            BookText,
            // Map Manga to RecommendationItem structure
            trendingManga.map(m => ({...m, id: m.mal_id, description: m.synopsis, type: 'manga'})),
            loadingTrending, // Use same loading state as anime trending for simplicity here
            errorTrending, // Use same error state
            "/manga?sort=popularity"
        )}

       {/* Airing Now Section */}
        {renderSection(
            "Airing Now",
            Clock,
            airingNowAnime.map(a => ({...a, id: a.mal_id, description: a.synopsis, type: 'anime'})),
            loadingAiring,
            errorAiring,
            "/anime?status=airing"
        )}

       {/* Upcoming Section */}
        {renderSection(
            "Upcoming Anime",
            CalendarDays,
            upcomingAnime.map(a => ({...a, id: a.mal_id, description: a.synopsis, type: 'anime'})),
            loadingUpcoming,
            errorUpcoming,
            "/anime?status=upcoming"
        )}


       {/* TODO: Add Community Uploads Preview */}

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

