
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { getMangas, Manga, MangaResponse } from '@/services/manga'; // Import updated manga service (Jikan based)
import { BookText, Layers, Library, AlertCircle, Loader2, Star } from 'lucide-react'; // Added Star icon
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Helper function to format status (Jikan uses different strings)
const formatStatus = (status: string | null): string => {
    if (!status) return 'N/A';
    // You might want to map Jikan statuses ("Finished", "Publishing", "On Hiatus", etc.)
    // to more user-friendly terms if needed. For now, just return the status.
    return status;
};

export default function MangaPage() {
  const [mangaList, setMangaList] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  const fetchManga = useCallback(async (page: number, append = false) => {
      if (page === 1) {
          setLoading(true);
      } else {
          setLoadingMore(true);
      }
      setError(null);

      try {
        // Fetch manga using Jikan service
        const response: MangaResponse = await getMangas(
            undefined, // genre
            undefined, // status
            undefined, // search
            undefined, // minScore
            page       // page
            // Default sort (popularity) will be used by the service
        );
        setMangaList(prev => append ? [...prev, ...response.mangas] : response.mangas);
        setHasNextPage(response.hasNextPage);
        setCurrentPage(page);
      } catch (err: any) {
        console.error("Failed to fetch manga:", err);
        setError(err.message || "Couldn't load manga list. Please try again later.");
        if (!append) {
            setMangaList([]);
        }
      } finally {
        if (page === 1) {
            setLoading(false);
        } else {
            setLoadingMore(false);
        }
      }
  }, []);

  useEffect(() => {
    fetchManga(1);
  }, [fetchManga]);

  const loadMoreManga = () => {
    if (hasNextPage && !loadingMore) {
      fetchManga(currentPage + 1, true);
    }
  };

  // Adapt MangaCard for Jikan data structure
  const MangaCard = ({ item }: { item: Manga }) => (
     <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 hover:scale-[1.03] group flex flex-col h-full">
      <CardHeader className="p-0 relative aspect-[2/3] w-full overflow-hidden">
         {item.imageUrl ? ( // Use derived imageUrl
           <Image
             src={item.imageUrl}
             alt={item.title}
             fill
             sizes="(max-width: 640px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 23vw"
             className="object-cover transition-transform duration-300 group-hover:scale-105"
           />
         ) : (
           <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <BookText className="w-16 h-16 text-muted-foreground opacity-50" />
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
         <div className="flex gap-1.5 mb-2 flex-wrap">
           {/* Map Jikan genres */}
           {item.genres?.slice(0, 3).map(g => <Badge key={g.mal_id} variant="secondary" className="text-xs">{g.name}</Badge>)}
         </div>
        <CardDescription className="text-xs text-muted-foreground line-clamp-3 mb-3 flex-grow">
           {/* Use Jikan synopsis */}
           {item.synopsis || 'No description available.'}
         </CardDescription>
         {/* Adapt Additional Info Row for Jikan data */}
         <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-border/50 pt-2 mt-auto">
            <span className="flex items-center gap-1" title={`Status: ${formatStatus(item.status)}`}>
                 <Badge
                    variant={ // Adjust badge variants based on Jikan status strings
                        item.status === 'Publishing' ? 'default' :
                        item.status === 'Finished' ? 'secondary' :
                        item.status === 'On Hiatus' ? 'destructive' :
                        'outline'
                    }
                    className="text-xs px-1.5 py-0.5"
                    >
                    {formatStatus(item.status)}
                 </Badge>
            </span>
             <span className="flex items-center gap-1" title="Score">
                <Star size={14} className={item.score ? 'text-yellow-400' : ''}/> {item.score?.toFixed(1) ?? 'N/A'}
             </span>
            <span className="flex items-center gap-1" title="Chapters">
              <Layers size={14} /> {item.chapters ?? 'N/A'}
            </span>
           <span className="flex items-center gap-1" title="Volumes">
             <Library size={14} /> {item.volumes ?? 'N/A'}
           </span>
         </div>
        {/* View Details Button */}
        <div className="flex justify-end mt-2">
           <Button variant="link" size="sm" asChild className="text-xs p-0 h-auto">
              {/* Link using MAL ID */}
              <Link href={`/manga/${item.mal_id}`}>
                 View Details
              </Link>
           </Button>
        </div>
      </CardContent>
     </Card>
  );

 // Skeleton Card remains mostly the same structurally
 const SkeletonCard = () => (
    <Card className="overflow-hidden glass flex flex-col h-full">
       <CardHeader className="p-0 relative aspect-[2/3] w-full">
          <Skeleton className="h-full w-full" />
       </CardHeader>
       <CardContent className="p-3 space-y-2 flex flex-col flex-grow">
          <Skeleton className="h-4 w-3/4" /> {/* Title */}
           <div className="flex gap-1.5 mb-1 flex-wrap"> {/* Genres */}
              <Skeleton className="h-4 w-12 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-4 w-14 rounded-full" />
           </div>
          <Skeleton className="h-3 w-full" /> {/* Desc line 1 */}
          <Skeleton className="h-3 w-5/6" /> {/* Desc line 2 */}
          <div className="flex-grow" /> {/* Spacer */}
           <div className="flex justify-between items-center border-t border-border/50 pt-2 mt-auto"> {/* Info */}
               <Skeleton className="h-4 w-14" /> {/* Status Badge */}
               <Skeleton className="h-3 w-8" /> {/* Score */}
               <Skeleton className="h-3 w-8" /> {/* Chapters */}
               <Skeleton className="h-3 w-8" /> {/* Volumes */}
           </div>
          <div className="flex justify-end mt-1"> {/* Button */}
              <Skeleton className="h-5 w-1/4" />
          </div>
       </CardContent>
    </Card>
 );

  return (
    <div className="container mx-auto px-4 py-8">
      <section>
        <div className="flex items-center justify-between mb-6">
           <h1 className="text-3xl font-bold flex items-center gap-2">
             <BookText className="text-primary w-7 h-7" />
             Browse Manga
           </h1>
            {/* TODO: Add Filtering/Sorting Options based on Jikan API parameters */}
            {/* <Button variant="outline">Filter</Button> */}
        </div>
        {error && !loadingMore && (
           <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Manga</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
           </Alert>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
           {loading && mangaList.length === 0
             ? Array.from({ length: 12 }).map((_, index) => <SkeletonCard key={`skel-${index}`} />)
             : mangaList.length > 0
               ? mangaList.map((item) => (
                 <MangaCard key={item.mal_id} item={item} /> // Use MAL ID as key
               ))
               : !error && !loading && (
                 <div className="col-span-full text-center py-10">
                     <p className="text-muted-foreground">No manga found matching your criteria.</p>
                  </div>
                )}
             {loadingMore && Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={`skel-more-${index}`} />)}
         </div>

         {/* Load More Button */}
         {hasNextPage && !loading && !error && (
             <div className="flex justify-center mt-8">
                  <Button
                     onClick={loadMoreManga}
                     disabled={loadingMore}
                     variant="outline"
                     className="neon-glow-hover"
                     >
                     {loadingMore ? (
                         <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                         </>
                      ) : (
                         'Load More Manga'
                     )}
                 </Button>
             </div>
          )}
          {!hasNextPage && mangaList.length > 0 && !loading && !error && (
              <p className="text-center text-muted-foreground mt-8">You've reached the end!</p>
          )}

      </section>
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
