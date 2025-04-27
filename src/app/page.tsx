'use client'; // Mark as client component for state and effects

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { aiDrivenHomepage, AIDrivenHomepageOutput } from '@/ai/flows/ai-driven-homepage'; // Import the Genkit flow
import { getAnimes, Anime } from '@/services/anime'; // Import anime service
import { getMangas, Manga } from '@/services/manga'; // Import manga service
import { Sparkles } from 'lucide-react';

// Define types for combined recommendations
type RecommendationItem = (Anime | Manga) & { type: 'anime' | 'manga' };

export default function Home() {
  const [recommendations, setRecommendations] = useState<AIDrivenHomepageOutput | null>(null);
  const [recommendedContent, setRecommendedContent] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual user data
        const userProfile = "Loves action and fantasy anime, recently watched Attack on Titan. Enjoys ongoing manga series.";
        const currentMood = "Excited";

        const aiOutput = await aiDrivenHomepage({ userProfile, currentMood });
        setRecommendations(aiOutput);

        // Fetch details for recommended titles
        const animePromises = aiOutput.animeRecommendations.map(title =>
          getAnimes().then(animes => animes.find(a => a.title === title))
        );
        const mangaPromises = aiOutput.mangaRecommendations.map(title =>
          getMangas().then(mangas => mangas.find(m => m.title === title))
        );

        const [animeResults, mangaResults] = await Promise.all([
          Promise.all(animePromises),
          Promise.all(mangaPromises),
        ]);

        const combinedResults: RecommendationItem[] = [
          ...(animeResults.filter(a => a) as Anime[]).map(a => ({ ...a, type: 'anime' })),
          ...(mangaResults.filter(m => m) as Manga[]).map(m => ({ ...m, type: 'manga' })),
        ];

        // Shuffle results for variety
        combinedResults.sort(() => Math.random() - 0.5);

        setRecommendedContent(combinedResults);

      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
        setError("Couldn't load recommendations. Please try again later.");
        // Fallback: Load generic popular items
        try {
          const [animes, mangas] = await Promise.all([getAnimes(), getMangas()]);
          const fallbackContent: RecommendationItem[] = [
            ...animes.slice(0, 3).map(a => ({ ...a, type: 'anime' })),
            ...mangas.slice(0, 3).map(m => ({ ...m, type: 'manga' })),
          ].sort(() => Math.random() - 0.5);
           setRecommendedContent(fallbackContent);
        } catch (fallbackErr) {
           console.error("Failed to fetch fallback content:", fallbackErr);
           setError("Failed to load any content.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const RecommendationCard = ({ item }: { item: RecommendationItem }) => (
     <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 hover:scale-105">
      <CardHeader className="p-0 relative h-48 md:h-64">
        <Image
          src={item.imageUrl || 'https://picsum.photos/400/600?grayscale'} // Use placeholder if no image
          alt={item.title}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
         <div className="absolute bottom-2 left-2 right-2">
           <CardTitle className="text-lg font-semibold text-primary-foreground line-clamp-2">{item.title}</CardTitle>
         </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardDescription className="text-sm text-muted-foreground line-clamp-3 mb-3">
           {item.description}
         </CardDescription>
        <div className="flex justify-between items-center">
           <span className="text-xs font-medium uppercase text-primary">
             {item.type}
           </span>
           <Button variant="link" size="sm" asChild>
              <Link href={`/${item.type}/${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                 View Details
              </Link>
           </Button>
        </div>
      </CardContent>
     </Card>
  );

 const SkeletonCard = () => (
    <Card className="overflow-hidden glass">
       <CardHeader className="p-0 h-48 md:h-64">
          <Skeleton className="h-full w-full" />
       </CardHeader>
       <CardContent className="p-4 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <div className="flex justify-between items-center pt-2">
             <Skeleton className="h-3 w-1/4" />
             <Skeleton className="h-6 w-1/3" />
          </div>
       </CardContent>
    </Card>
 );


  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <div className="flex items-center justify-between mb-4">
           <h1 className="text-3xl font-bold flex items-center gap-2">
             <Sparkles className="text-primary w-7 h-7" />
             For You
           </h1>
            {recommendations?.reasoning && !loading && !error && (
               <p className="text-sm text-muted-foreground italic hidden md:block">
                   Nami AI: "{recommendations.reasoning}"
               </p>
           )}
        </div>
        {error && <p className="text-destructive text-center">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
           {loading
             ? Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={index} />)
             : recommendedContent.map((item) => (
                 <RecommendationCard key={`${item.type}-${item.title}`} item={item} />
               ))}
         </div>
      </section>

       {/* TODO: Add more sections like "Trending Anime", "Popular Manga", "Community Uploads" */}
       {/* Example Section */}
       <section className="mb-12">
           <h2 className="text-2xl font-semibold mb-4">Trending Anime</h2>
            {/* Placeholder for trending anime */}
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
               {Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={`trending-${index}`} />)}
           </div>
       </section>

    </div>
  );
}
