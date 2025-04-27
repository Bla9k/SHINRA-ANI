
'use client';

import { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';

// Define types for combined recommendations (can be Anime or Manga from Jikan)
type RecommendationItem = (Anime | Manga) & {
  id: number; // Use mal_id from Jikan
  title: string;
  type: 'anime' | 'manga';
  imageUrl?: string | null; // Use derived imageUrl
  description?: string | null; // Use synopsis
};

// Helper function to introduce a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to fetch details based on title sequentially with delays
async function fetchDetailsByTitleWithDelay(
    titles: string[],
    fetchFunction: (genre?: string | number, year?: number, minScore?: number, search?: string, status?: string, page?: number, sort?: string) => Promise<AnimeResponse | MangaResponse>,
    itemType: 'anime' | 'manga',
    delayMs = 600 // Increased delay for Jikan (was 400ms)
): Promise<RecommendationItem[]> {
    const results: RecommendationItem[] = [];
    // Ensure unique titles before fetching to avoid redundant calls
    const uniqueTitles = Array.from(new Set(titles));

    for (const title of uniqueTitles) {
        try {
            // Fetch page 1, limit handled by service, sort by relevance (default for search)
            const response = await fetchFunction(undefined, undefined, undefined, title, undefined, 1);
            let firstMatch: Anime | Manga | null = null;
            if ('animes' in response && response.animes?.length > 0) { // Add null check
                firstMatch = response.animes[0];
            } else if ('mangas' in response && response.mangas?.length > 0) { // Add null check
                firstMatch = response.mangas[0];
            }

            if (firstMatch) {
                // Ensure id is mapped correctly from mal_id
                results.push({ ...firstMatch, id: firstMatch.mal_id, type: itemType, description: firstMatch.synopsis });
            } else {
                 console.warn(`Could not fetch details for ${itemType} "${title}" from Jikan (no match found).`);
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

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoadingRecommendations(true);
      setLoadingTrending(true);
      setErrorRecommendations(null);
      setErrorTrending(null);
      setRecommendedContent([]); // Clear previous results
      setTrendingAnime([]);
      setTrendingManga([]);

      try {
        // TODO: Replace with actual user data
        const userProfile = "Loves action and fantasy anime, recently watched Attack on Titan. Enjoys ongoing manga series.";
        const currentMood = "Excited";

        // --- 1. Fetch AI Recommendation Titles ---
        let aiOutput: AIDrivenHomepageOutput | null = null;
        try {
             aiOutput = await aiDrivenHomepage({ userProfile, currentMood });
             setRecommendations(aiOutput);
        } catch (aiError: any) {
            console.error("Failed to fetch AI recommendations:", aiError);
            setErrorRecommendations(aiError.message || "Nami couldn't generate recommendations right now.");
            // Continue to fetch trending even if AI fails
        }

        // --- 2. Fetch Details for AI Recommendations (Sequentially with Delays) ---
        // Check if aiOutput and its recommendation arrays are valid before proceeding
        if (aiOutput && (aiOutput.animeRecommendations?.length > 0 || aiOutput.mangaRecommendations?.length > 0)) {
             const animeTitles = aiOutput.animeRecommendations || [];
             const mangaTitles = aiOutput.mangaRecommendations || [];

            try {
                 // Fetch details
                 const animeResults = await fetchDetailsByTitleWithDelay(animeTitles, getAnimes, 'anime');
                 await delay(500); // Optional extra delay between fetching anime and manga details
                 const mangaResults = await fetchDetailsByTitleWithDelay(mangaTitles, getMangas, 'manga');

                 // Combine results
                 const combinedResults: RecommendationItem[] = [...animeResults, ...mangaResults];

                 // --- Filter for unique items based on type and id ---
                 const uniqueResultsMap = new Map<string, RecommendationItem>();
                 combinedResults.forEach(item => {
                     // Ensure item.id is defined before creating key
                     if (item && typeof item.id !== 'undefined') {
                         const uniqueKey = `${item.type}-${item.id}`; // Use type and mal_id (mapped to id)
                         if (!uniqueResultsMap.has(uniqueKey)) {
                             uniqueResultsMap.set(uniqueKey, item);
                         }
                     } else {
                        console.warn("Skipping item with undefined id during unique filtering:", item);
                     }
                 });
                 const uniqueRecommendedContent = Array.from(uniqueResultsMap.values());

                 // Shuffle results if desired (apply to unique results)
                 uniqueRecommendedContent.sort(() => Math.random() - 0.5);

                 setRecommendedContent(uniqueRecommendedContent.slice(0, 8)); // Limit displayed AI recommendations
             } catch (detailFetchError: any) {
                  console.error("Error fetching details for AI recommendations:", detailFetchError);
                  // Set error or leave recommendedContent empty
                  setErrorRecommendations(errorRecommendations || "Failed to fetch details for some recommendations.");
                  setRecommendedContent([]);
             }


        } else if (!errorRecommendations) {
             // No recommendations from AI, or AI failed gracefully
             setRecommendedContent([]);
        }
        setLoadingRecommendations(false); // AI Recommendations part is done

        // --- 3. Fetch Trending Data (After AI details) ---
        // Add delay even if AI part failed or had no results
        await delay(800);
        try {
           // Fetch trending using Jikan services (default sort is popularity)
           // Fetch them sequentially to further reduce burst load
           const [trendingAnimeResponse, trendingMangaResponse] = await Promise.all([
                getAnimes(undefined, undefined, undefined, undefined, undefined, 1, 'popularity'),
                getMangas(undefined, undefined, undefined, undefined, undefined, 1, 'popularity')
           ]);

           // Ensure data exists before slicing
           setTrendingAnime(trendingAnimeResponse?.animes?.slice(0, 6) || []);
           setTrendingManga(trendingMangaResponse?.mangas?.slice(0, 6) || []);

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
          setErrorRecommendations(errorRecommendations || "An unexpected error occurred fetching recommendations.");
          setErrorTrending(errorTrending || "An unexpected error occurred fetching trending content.");
          setLoadingRecommendations(false);
          setLoadingTrending(false);
      }
    };

    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once on mount

  // Adapt ItemCard for Jikan data (Anime or Manga interface)
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
             priority={false} // Keep false unless critical LCP element
             unoptimized={false} // Only set true if image host is explicitly NOT optimized
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
             {/* Link using MAL ID (stored in item.id) */}
             <Button variant="link" size="sm" asChild className="text-xs p-0 h-auto">
                 {/* Ensure item.id is valid before creating Link */}
                 {typeof item.id === 'number' ? (
                    <Link href={`/${item.type}/${item.id}`}>
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
                 // Ensure unique key using type and id (mal_id)
                 <ItemCard key={`${item.type}-${item.id}`} item={item} />
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
                    ? trendingAnime.map((item) => <ItemCard key={`trending-anime-${item.mal_id}`} item={{...item, id: item.mal_id, description: item.synopsis, type: 'anime' }} />)
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
                    ? trendingManga.map((item) => <ItemCard key={`trending-manga-${item.mal_id}`} item={{...item, id: item.mal_id, description: item.synopsis, type: 'manga' }} />)
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

