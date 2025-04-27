
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { aiDrivenHomepage, AIDrivenHomepageOutput } from '@/ai/flows/ai-driven-homepage';
import { getAnimes, Anime, AnimeResponse } from '@/services/anime'; // Import Jikan-based anime service
import { getMangas, Manga, MangaResponse } from '@/services/manga'; // Import Jikan-based manga service
import { Sparkles, AlertCircle, Tv, BookText, Star } from 'lucide-react'; // Import icons
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge'; // Make sure Badge is imported

// Define types for combined recommendations (can be Anime or Manga from Jikan)
// Ensure required fields for the card are present
type RecommendationItem = (Partial<Anime> | Partial<Manga>) & {
  mal_id: number; // Use mal_id from Jikan, ensuring it's present
  title: string; // Ensure title is present
  type: 'anime' | 'manga';
  imageUrl?: string | null; // Use derived imageUrl
  description?: string | null; // Use synopsis
  score?: number | null; // Add score
  // Add any other fields required by ItemCard
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
    // Ensure unique titles before fetching to avoid redundant calls
    const uniqueTitles = Array.from(new Set(titles.filter(t => t))); // Filter out empty/null titles

    for (const title of uniqueTitles) {
        try {
            // Fetch page 1, limit handled by service, sort by relevance (default for search)
            console.log(`Fetching ${itemType} details for: "${title}"`);
            // Use search param for title, Jikan default sort might be relevance or ID
            const response = await fetchFunction(undefined, undefined, undefined, title, undefined, 1);
            let firstMatch: Anime | Manga | null = null;

            if ('animes' in response && response.animes?.length > 0) {
                firstMatch = response.animes[0];
            } else if ('mangas' in response && response.mangas?.length > 0) {
                firstMatch = response.mangas[0];
            }

            // Additional check: Does the found item's title closely match the searched title?
            // Jikan search can sometimes return loosely related items first.
            // This is a simple check; more sophisticated matching could be added.
            if (firstMatch?.title && firstMatch.title.toLowerCase().includes(title.toLowerCase().substring(0, 5))) {
                if (firstMatch && firstMatch.mal_id && firstMatch.title) {
                    // Ensure id is mapped correctly from mal_id and core fields exist
                    results.push({
                        ...firstMatch,
                        id: firstMatch.mal_id, // Map mal_id to id for card key consistency
                        type: itemType,
                        description: firstMatch.synopsis, // Map synopsis to description
                        score: firstMatch.score ?? null,
                        imageUrl: firstMatch.imageUrl ?? null,
                    });
                } else {
                     console.warn(`Could not fetch valid details for ${itemType} "${title}" from Jikan (no match or missing critical fields). Response:`, firstMatch);
                }
            } else {
                 console.warn(`Jikan search for "${title}" returned a best match "${firstMatch?.title}" that might not be accurate. Skipping.`);
            }
        } catch (err) {
            // Log the error but don't throw, allow the loop to continue
            console.error(`Error fetching details for ${itemType} "${title}" from Jikan:`, err);
            // Optionally return a placeholder or skip this item entirely
        }
        await delay(delayMs); // Wait before the next call
    }
    return results;
}


export default function Home() {
  const [recommendations, setRecommendations] = useState<AIDrivenHomepageOutput | null>(null);
  const [recommendedContent, setRecommendedContent] = useState<RecommendationItem[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [errorRecommendations, setErrorRecommendations] = useState<string | null>(null);
  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([]);
  const [trendingManga, setTrendingManga] = useState<Manga[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [errorTrending, setErrorTrending] = useState<string | null>(null);

  const fetchInitialData = useCallback(async () => {
      setLoadingRecommendations(true);
      setLoadingTrending(true);
      setErrorRecommendations(null);
      setErrorTrending(null);
      setRecommendedContent([]);
      setTrendingAnime([]);
      setTrendingManga([]);

      let aiOutput: AIDrivenHomepageOutput | null = null;
      let combinedRecommendedResults: RecommendationItem[] = [];

      try {
        // TODO: Replace with actual user data
        const userProfile = "Loves action and fantasy anime, recently watched Attack on Titan. Enjoys ongoing manga series.";
        const currentMood = "Excited";

        // --- 1. Fetch AI Recommendation Titles ---
        try {
             console.log("Fetching AI recommendations...");
             aiOutput = await aiDrivenHomepage({ userProfile, currentMood });
             setRecommendations(aiOutput);
             console.log("AI Recommendations received:", aiOutput);
        } catch (aiError: any) {
            console.error("Failed to fetch AI recommendations:", aiError);
            setErrorRecommendations(aiError.message || "Nami couldn't generate recommendations right now.");
            // Continue to fetch trending even if AI fails
        }

        // --- 2. Fetch Details for AI Recommendations (Sequentially with Delays) ---
        if (aiOutput && (aiOutput.animeRecommendations?.length > 0 || aiOutput.mangaRecommendations?.length > 0)) {
             const animeTitles = aiOutput.animeRecommendations || [];
             const mangaTitles = aiOutput.mangaRecommendations || [];

            try {
                 console.log("Fetching details for AI recommended anime...");
                 const animeResults = await fetchDetailsByTitleWithDelay(animeTitles, getAnimes, 'anime');


                 console.log("Fetching details for AI recommended manga...");
                 // No extra delay needed here as fetchDetailsByTitleWithDelay has internal delays
                 const mangaResults = await fetchDetailsByTitleWithDelay(mangaTitles, getMangas, 'manga');


                 // Combine results
                 combinedRecommendedResults = [...animeResults, ...mangaResults];
                 console.log("Combined AI recommendation details fetched:", combinedRecommendedResults);

             } catch (detailFetchError: any) {
                  console.error("Error fetching details for AI recommendations:", detailFetchError);
                  // Set error but keep any partial results
                  setErrorRecommendations(prev => prev || "Failed to fetch details for some recommendations.");
             }
        } else if (!errorRecommendations) {
             console.log("No AI recommendations provided or AI flow failed gracefully.");
        }

         // --- Filter for unique items based on type and id, and update state ---
             const uniqueResultsMap = new Map<string, RecommendationItem>();
             combinedRecommendedResults.forEach(item => {
                 // Ensure item.id is defined before creating key
                 if (item && typeof item.mal_id === 'number') { // Use mal_id for keying
                     const uniqueKey = `${item.type}-${item.mal_id}`;
                     if (!uniqueResultsMap.has(uniqueKey)) {
                         // Map mal_id to id for ItemCard consistency if needed by card component
                         uniqueResultsMap.set(uniqueKey, { ...item, id: item.mal_id });
                     }
                 } else {
                    console.warn("Skipping item with undefined mal_id during unique filtering:", item);
                 }
             });
             const uniqueRecommendedContent = Array.from(uniqueResultsMap.values());

             // Shuffle results if desired (apply to unique results)
             uniqueRecommendedContent.sort(() => Math.random() - 0.5);

             setRecommendedContent(uniqueRecommendedContent.slice(0, 8)); // Limit displayed AI recommendations
             setLoadingRecommendations(false); // AI Recommendations part is done
             console.log("Final unique recommended content set:", uniqueRecommendedContent.slice(0, 8));


        // --- 3. Fetch Trending Data (After AI details processing) ---
        console.log("Fetching trending data...");
        // No extra delay needed here as the services have internal delays
        try {
           // Fetch trending using Jikan services (popularity sort)
           // Fetch them sequentially to further reduce burst load
           const trendingAnimeResponse = await getAnimes(undefined, undefined, undefined, undefined, undefined, 1, 'popularity');
            if (trendingAnimeResponse?.animes) {
                setTrendingAnime(trendingAnimeResponse.animes.slice(0, 6));
                console.log("Trending anime fetched:", trendingAnimeResponse.animes.slice(0, 6));
           } else {
               setTrendingAnime([]); // Set empty if no data
               console.warn("No trending anime data received from Jikan.");
           }

           const trendingMangaResponse = await getMangas(undefined, undefined, undefined, undefined, 1, 'popularity');
            if (trendingMangaResponse?.mangas) {
               setTrendingManga(trendingMangaResponse.mangas.slice(0, 6));
               console.log("Trending manga fetched:", trendingMangaResponse.mangas.slice(0, 6));
           } else {
                setTrendingManga([]); // Set empty if no data
                console.warn("No trending manga data received from Jikan.");
           }

        } catch (trendingError: any) {
             console.error("Failed to fetch trending data from Jikan:", trendingError);
                 setErrorTrending(trendingError.message || "Could not load trending content.");
                 setTrendingAnime([]);
                 setTrendingManga([]);
        } finally {
             setLoadingTrending(false);
        }

      } catch (generalError: any) {
          // Catch any unexpected errors during the process
          console.error("An unexpected error occurred during initial data fetch:", generalError);
               setErrorRecommendations(prev => prev || "An unexpected error occurred fetching recommendations.");
               setErrorTrending(prev => prev || "An unexpected error occurred fetching trending content.");
               setLoadingRecommendations(false);
               setLoadingTrending(false);
      }
  }, []); // Add dependencies if needed, but likely should run once on mount

  useEffect(() => {
      fetchInitialData();
  }, [fetchInitialData]); // Run fetchInitialData when the component mounts


  // Adapt ItemCard for Jikan data (Anime or Manga interface)
  // Use RecommendationItem which ensures mal_id and title exist
  const ItemCard = ({ item }: { item: RecommendationItem }) => (
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
             onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/400/600?grayscale'; }} // Fallback image on error
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
          {/* Use synopsis (mapped to description) */}
          <CardDescription className="text-xs text-muted-foreground line-clamp-3 mb-3 flex-grow">
             {item.description || 'No description available.'}
          </CardDescription>

         <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-border/50 pt-2 mt-auto">
            {/* Display type badge and score */}
             <Badge variant="outline" className="capitalize">{item.type}</Badge>
             <span className="flex items-center gap-1">
                 <Star size={12} className={item.score ? 'text-yellow-400' : ''}/> {item.score?.toFixed(1) ?? 'N/A'}
             </span>
             {/* Link using MAL ID (stored in item.mal_id) */}
             <Button variant="link" size="sm" asChild className="text-xs p-0 h-auto">
                 {/* Ensure item.mal_id is valid before creating Link */}
                 {typeof item.mal_id === 'number' ? (
                    <Link href={`/${item.type}/${item.mal_id}`}>
                        View Details
                    </Link>
                 ) : (
                    <span className="text-muted-foreground">Details Unavailable</span>
                 )}
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
           <div className="flex gap-1.5 mb-1 flex-wrap">
              <Skeleton className="h-4 w-12 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
           </div>
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


  return (
    <div className="container mx-auto px-4 py-8">
      {/* AI Recommendations Section */}
      <section className="mb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
           <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 shrink-0">
             <Sparkles className="text-primary w-6 h-6 md:w-7 md:h-7" />
             Nami's Picks For You
           </h1>
            {recommendations?.reasoning && !loadingRecommendations && !errorRecommendations && (
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
                 // Ensure unique key using type and mal_id
                 // Check if item and item.mal_id are valid before rendering
                 item && item.mal_id ? <ItemCard key={`${item.type}-${item.mal_id}`} item={item} /> : null
               ))
               : !errorRecommendations && <p className="col-span-full text-center text-muted-foreground py-5">Nami couldn't find any specific recommendations right now, or failed to fetch details.</p>
            }
         </div>
      </section>

       {/* Trending Anime Section */}
       <section className="mb-12">
           <div className="flex items-center justify-between mb-4">
             <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Tv className="text-primary w-6 h-6"/> Trending Anime
             </h2>
             <Button variant="link" size="sm" asChild>
                 <Link href="/anime">View All</Link>
             </Button>
           </div>
           {errorTrending && !loadingTrending && (
               <Alert variant="destructive" className="mb-6">
                 <AlertCircle className="h-4 w-4" />
                 <AlertTitle>Error Loading Trending Content</AlertTitle>
                 <AlertDescription>{errorTrending}</AlertDescription>
              </Alert>
            )}
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
               {loadingTrending
                 ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={`trending-anime-skel-${index}`} />)
                 : trendingAnime.length > 0
                    // Map Anime to RecommendationItem structure for the card
                    ? trendingAnime.map((item) => item && item.mal_id ? <ItemCard key={`trending-anime-${item.mal_id}`} item={{...item, id: item.mal_id, description: item.synopsis, type: 'anime' }} /> : null)
                    : !errorTrending && <p className="col-span-full text-center text-muted-foreground py-5">No trending anime found.</p>
               }
           </div>
       </section>

       {/* Trending Manga Section */}
       <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <BookText className="text-primary w-6 h-6"/> Trending Manga
                </h2>
                 <Button variant="link" size="sm" asChild>
                    <Link href="/manga">View All</Link>
                </Button>
            </div>
           {errorTrending && !loadingTrending && (
               <Alert variant="destructive" className="mb-6">
                 <AlertCircle className="h-4 w-4" />
                 <AlertTitle>Error Loading Trending Content</AlertTitle>
                 <AlertDescription>{errorTrending}</AlertDescription>
              </Alert>
            )}
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
               {loadingTrending
                 ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={`trending-manga-skel-${index}`} />)
                 : trendingManga.length > 0
                    // Map Manga to RecommendationItem structure for the card
                    ? trendingManga.map((item) => item && item.mal_id ? <ItemCard key={`trending-manga-${item.mal_id}`} item={{...item, id: item.mal_id, description: item.synopsis, type: 'manga' }} /> : null)
                    : !errorTrending && <p className="col-span-full text-center text-muted-foreground py-5">No trending manga found.</p>
                }
           </div>
       </section>

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
