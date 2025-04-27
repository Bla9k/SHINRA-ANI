
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

      try {
        // TODO: Replace with actual user data
        const userProfile = "Loves action and fantasy anime, recently watched Attack on Titan. Enjoys ongoing manga series.";
        const currentMood = "Excited";

        // --- Fetch AI Recommendations ---
        let aiOutput: AIDrivenHomepageOutput | null = null;
        try {
             aiOutput = await aiDrivenHomepage({ userProfile, currentMood });
             setRecommendations(aiOutput);

             if (aiOutput && (aiOutput.animeRecommendations.length > 0 || aiOutput.mangaRecommendations.length > 0)) {
                 const animeTitles = aiOutput.animeRecommendations || [];
                 const mangaTitles = aiOutput.mangaRecommendations || [];

                 // Fetch details for recommended titles using Jikan services (search by title)
                 const animePromises = animeTitles.map(title =>
                     getAnimes(undefined, undefined, undefined, title) // Search anime by title
                         .then(response => response.animes[0] ?? null) // Take the first match
                         .catch(err => {
                             console.warn(`Could not fetch details for anime "${title}" from Jikan:`, err);
                             return null;
                         })
                 );
                 const mangaPromises = mangaTitles.map(title =>
                     getMangas(undefined, undefined, title) // Search manga by title
                         .then(response => response.mangas[0] ?? null) // Take the first match
                         .catch(err => {
                             console.warn(`Could not fetch details for manga "${title}" from Jikan:`, err);
                             return null;
                         })
                 );

                 const [animeResults, mangaResults] = await Promise.all([
                     Promise.all(animePromises),
                     Promise.all(mangaPromises),
                 ]);

                 // Combine valid results
                 const combinedResults: RecommendationItem[] = [];
                 animeResults.forEach((anime, index) => {
                     if (anime) {
                         // Ensure required fields are present, use the RecommendationItem type
                         combinedResults.push({ ...anime, id: anime.mal_id, type: 'anime', description: anime.synopsis });
                     } else {
                         // Could add a placeholder for titles AI recommended but couldn't fetch
                         // console.log(`AI recommended anime "${animeTitles[index]}", but details not found.`);
                     }
                 });
                  mangaResults.forEach((manga, index) => {
                     if (manga) {
                        combinedResults.push({ ...manga, id: manga.mal_id, type: 'manga', description: manga.synopsis });
                     } else {
                        // console.log(`AI recommended manga "${mangaTitles[index]}", but details not found.`);
                     }
                  });


                 // Shuffle results if desired
                 combinedResults.sort(() => Math.random() - 0.5);
                 setRecommendedContent(combinedResults.slice(0, 8)); // Limit displayed AI recommendations

             } else {
                 setRecommendedContent([]); // No recommendations from AI
             }

        } catch (aiError: any) {
            console.error("Failed to fetch AI recommendations:", aiError);
            setErrorRecommendations(aiError.message || "Nami couldn't generate recommendations right now.");
            setRecommendations({ animeRecommendations: [], mangaRecommendations: [], reasoning: "" });
            setRecommendedContent([]);
        } finally {
            setLoadingRecommendations(false);
        }

        // --- Fetch Trending Data ---
        try {
           // Fetch trending using Jikan services (default sort is popularity)
           const [trendingAnimeResponse, trendingMangaResponse] = await Promise.all([
               getAnimes(),
               getMangas(),
           ]);
           setTrendingAnime(trendingAnimeResponse.animes.slice(0, 6));
           setTrendingManga(trendingMangaResponse.mangas.slice(0, 6));
        } catch (trendingError: any) {
             console.error("Failed to fetch trending data from Jikan:", trendingError);
             setErrorTrending(trendingError.message || "Could not load trending content.");
             setTrendingAnime([]);
             setTrendingManga([]);
        } finally {
            setLoadingTrending(false);
        }

      } catch (generalError: any) {
          console.error("An unexpected error occurred during initial data fetch:", generalError);
          setErrorRecommendations("An unexpected error occurred fetching recommendations.");
          setErrorTrending("An unexpected error occurred fetching trending content.");
          setLoadingRecommendations(false);
          setLoadingTrending(false);
      }
    };

    fetchInitialData();
  }, []); // Empty dependency array

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
             priority={false}
             unoptimized={false}
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
             {/* Link using MAL ID */}
             <Button variant="link" size="sm" asChild className="text-xs p-0 h-auto">
                 <Link href={`/${item.type}/${item.id}`}>
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
                  // Use MAL ID as key
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
                    ? trendingAnime.map((item) => <ItemCard key={`trending-anime-${item.mal_id}`} item={{...item, id: item.mal_id, description: item.synopsis }} />)
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
                    ? trendingManga.map((item) => <ItemCard key={`trending-manga-${item.mal_id}`} item={{...item, id: item.mal_id, description: item.synopsis }} />)
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
