
'use client'; // Mark as client component for state and effects

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { aiDrivenHomepage, AIDrivenHomepageOutput } from '@/ai/flows/ai-driven-homepage'; // Import the Genkit flow
import { getAnimes, Anime, AnimeResponse } from '@/services/anime'; // Import anime service and response type
import { getMangas, Manga, MangaResponse } from '@/services/manga'; // Import manga service and response type
import { Sparkles, AlertCircle, Tv, BookText } from 'lucide-react'; // Import icons
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components
import { Badge } from '@/components/ui/badge'; // Import Badge component

// Define types for combined recommendations from AniList
type RecommendationItem = (Partial<Anime> & Partial<Manga>) & {
  id: number | string; // ID can be number (AniList) or string (fallback/placeholder)
  title: string;
  type: 'anime' | 'manga';
  imageUrl?: string | null;
  description?: string | null;
};

export default function Home() {
  const [recommendations, setRecommendations] = useState<AIDrivenHomepageOutput | null>(null);
  const [recommendedContent, setRecommendedContent] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // General error for AI/Recommendation fetching
  const [trendingAnime, setTrendingAnime] = useState<Anime[]>([]);
  const [trendingManga, setTrendingManga] = useState<Manga[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [errorTrending, setErrorTrending] = useState<string | null>(null); // Specific error for trending content

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      setLoadingTrending(true);
      setError(null);
      setErrorTrending(null);

      try {
        // TODO: Replace with actual user data (e.g., from context or auth)
        const userProfile = "Loves action and fantasy anime, recently watched Attack on Titan. Enjoys ongoing manga series.";
        const currentMood = "Excited";

        // Fetch AI recommendations first
        let aiOutput: AIDrivenHomepageOutput;
        try {
             aiOutput = await aiDrivenHomepage({ userProfile, currentMood });
             setRecommendations(aiOutput);

             // Fetch details for recommended titles *after* getting AI output
             const animeTitles = aiOutput.animeRecommendations || [];
             const mangaTitles = aiOutput.mangaRecommendations || [];

             // Fetch details using the services (which now have better error handling)
             // Modify the promise structure slightly to handle AnimeResponse/MangaResponse
             const animePromises = animeTitles.map(title =>
                 getAnimes(undefined, undefined, undefined, title)
                     .then(response => response.animes[0] ?? null) // Extract the first anime or null
                     .catch(err => {
                         console.warn(`Could not fetch details for anime "${title}":`, err);
                         return null;
                     })
             );
             const mangaPromises = mangaTitles.map(title =>
                 getMangas(undefined, undefined, title)
                     .then(response => response.mangas[0] ?? null) // Extract the first manga or null
                     .catch(err => {
                         console.warn(`Could not fetch details for manga "${title}":`, err);
                         return null;
                     })
             );


             const [animeResults, mangaResults] = await Promise.all([
                 Promise.all(animePromises),
                 Promise.all(mangaPromises),
             ]);


             // Combine results, handling cases where a title might not be found or errored
             const combinedResults: RecommendationItem[] = [];
             animeResults.forEach((anime, index) => {
                 if (anime) {
                    combinedResults.push({ ...anime, type: 'anime' });
                 } else {
                     // Fallback if anime not found or errored
                    combinedResults.push({ id: `anime-fallback-${index}`, title: animeTitles[index], type: 'anime' });
                 }
             });
             mangaResults.forEach((manga, index) => {
                 if (manga) {
                    combinedResults.push({ ...manga, type: 'manga' });
                 } else {
                     // Fallback if manga not found or errored
                    combinedResults.push({ id: `manga-fallback-${index}`, title: mangaTitles[index], type: 'manga' });
                 }
             });

             // Shuffle AI recommended results for variety
            combinedResults.sort(() => Math.random() - 0.5);
            setRecommendedContent(combinedResults);

        } catch (aiError: any) {
            console.error("Failed to fetch AI recommendations:", aiError);
            setError(aiError.message || "Nami couldn't generate recommendations right now.");
             // Set empty recommendations if AI fails
             setRecommendations({ animeRecommendations: [], mangaRecommendations: [], reasoning: "" });
             setRecommendedContent([]);
        } finally {
            setLoading(false); // Stop loading for recommendations part
        }

        // Fetch trending data separately
        try {
           // Fetch AnimeResponse and MangaResponse
           const [initialAnimeResponse, initialMangaResponse] = await Promise.all([
               getAnimes(), // Fetch trending anime (returns AnimeResponse)
               getMangas(), // Fetch trending manga (returns MangaResponse)
           ]);
           // Extract the arrays from the responses
           setTrendingAnime(initialAnimeResponse.animes.slice(0, 6)); // Access .animes property
           setTrendingManga(initialMangaResponse.mangas.slice(0, 6)); // Access .mangas property
        } catch (trendingError: any) {
             console.error("Failed to fetch trending data:", trendingError);
             setErrorTrending(trendingError.message || "Could not load trending content.");
        } finally {
            setLoadingTrending(false); // Stop loading for trending part
        }

      } catch (generalError: any) {
          // Catch any unexpected error during the overall process
          console.error("An unexpected error occurred during initial data fetch:", generalError);
          setError("An unexpected error occurred. Please refresh the page.");
          setErrorTrending("Could not load trending content due to an error.");
          setLoading(false);
          setLoadingTrending(false);
      }
    };

    fetchInitialData();
  }, []); // Empty dependency array ensures this runs once on mount

  const ItemCard = ({ item, type }: { item: (Anime | Manga | RecommendationItem), type: 'anime' | 'manga' }) => (
     <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 hover:scale-[1.03] group flex flex-col h-full">
      <CardHeader className="p-0 relative aspect-[2/3] w-full overflow-hidden"> {/* Aspect ratio */}
         {item.imageUrl ? (
           <Image
             src={item.imageUrl}
             alt={item.title}
             fill
             sizes="(max-width: 640px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 23vw"
             className="object-cover transition-transform duration-300 group-hover:scale-105"
             priority={false} // Lower priority for items further down
             unoptimized={false} // Let Next.js optimize images
           />
          ) : (
           <div className="absolute inset-0 bg-muted flex items-center justify-center">
              {type === 'anime' ? <Tv className="w-16 h-16 text-muted-foreground opacity-50" /> : <BookText className="w-16 h-16 text-muted-foreground opacity-50" />}
           </div>
          )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
         <div className="absolute bottom-2 left-3 right-3">
           <CardTitle className="text-md font-semibold text-primary-foreground line-clamp-2 shadow-text">
             {item.title}
           </CardTitle>
         </div>
      </CardHeader>
      <CardContent className="p-3 flex flex-col flex-grow"> {/* Use ItemCard for all */}
         {item.description && (
              <CardDescription className="text-xs text-muted-foreground line-clamp-3 mb-3 flex-grow">
                {item.description}
              </CardDescription>
          )}
           {!item.description && <div className="flex-grow mb-3"></div>} {/* Placeholder if no description */}

         <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-border/50 pt-2 mt-auto">
            <Badge variant="outline" className="capitalize">{type}</Badge>
             {/* Only show details link if item has an ID (meaning it was found in AniList) */}
             {'id' in item && typeof item.id === 'number' && (
                  <Button variant="link" size="sm" asChild className="text-xs p-0 h-auto">
                    <Link href={`/${type}/${item.id}-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                        View Details
                    </Link>
                </Button>
             )}
             {/* Show placeholder if it's a fallback recommendation without a real ID */}
             {('id' in item && typeof item.id !== 'number') && (
                 <span className="text-xs text-muted-foreground italic">Details unavailable</span>
              )}
         </div>
      </CardContent>
     </Card>
  );

 const SkeletonCard = () => (
    <Card className="overflow-hidden glass flex flex-col h-full">
       <CardHeader className="p-0 relative aspect-[2/3] w-full">
          <Skeleton className="h-full w-full" />
       </CardHeader>
       <CardContent className="p-3 space-y-2 flex flex-col flex-grow">
          <Skeleton className="h-4 w-3/4" /> {/* Title */}
           <div className="flex gap-1.5 mb-1 flex-wrap"> {/* Placeholder for badges/genres */}
              <Skeleton className="h-4 w-12 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
           </div>
          <Skeleton className="h-3 w-full" /> {/* Desc line 1 */}
          <Skeleton className="h-3 w-5/6" /> {/* Desc line 2 */}
          <div className="flex-grow" /> {/* Spacer */}
           <div className="flex justify-between items-center border-t border-border/50 pt-2 mt-auto"> {/* Footer */}
              <Skeleton className="h-4 w-14" /> {/* Type Badge */}
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
            {recommendations?.reasoning && !loading && !error && (
               <p className="text-xs md:text-sm text-muted-foreground italic text-left sm:text-right border-l-2 border-primary pl-2 sm:border-l-0 sm:pl-0">
                   "{recommendations.reasoning}"
               </p>
           )}
        </div>
        {/* Display error specific to AI recommendations */}
        {error && !loading && (
           <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Could Not Get Nami's Picks</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
           </Alert>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
           {loading
             ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={`rec-skel-${index}`} />)
             : recommendedContent.length > 0
               ? recommendedContent.map((item) => (
                 <ItemCard key={`${item.type}-${item.id || item.title}`} item={item} type={item.type} />
               ))
               : !error && <p className="col-span-full text-center text-muted-foreground py-5">Nami couldn't find any specific recommendations right now.</p>
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
           {/* Display error specific to trending content */}
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
                    ? trendingAnime.map((item) => <ItemCard key={`trending-${item.id}`} item={item} type="anime" />)
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
           {/* Display error specific to trending content (reuse same error state) */}
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
                    ? trendingManga.map((item) => <ItemCard key={`trending-${item.id}`} item={item} type="manga" />)
                    : !errorTrending && <p className="col-span-full text-center text-muted-foreground py-5">No trending manga found.</p>
                }
           </div>
       </section>

       {/* TODO: Add Community Uploads Preview */}

    </div>
  );
}


// Basic text shadow utility class (add to globals.css or keep here if specific)
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

    