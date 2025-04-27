
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { getMangas, Manga } from '@/services/manga'; // Import updated manga service
import { BookText, Star, CalendarDays, Layers, Library, AlertCircle } from 'lucide-react'; // Icons
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components

// Helper function to format status
const formatStatus = (status: string | null): string => {
    if (!status) return 'N/A';
    return status
        .toLowerCase()
        .replace(/_/g, ' ') // Replace underscores with spaces
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
        .join(' ');
};

export default function MangaPage() {
  const [mangaList, setMangaList] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchManga = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch trending manga initially
        const mangas = await getMangas(undefined, undefined);
        setMangaList(mangas);
      } catch (err: any) {
        console.error("Failed to fetch manga:", err);
        setError(err.message || "Couldn't load manga list. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchManga();
  }, []);

  // Reusable Card Component for Manga with enhanced details
  const MangaCard = ({ item }: { item: Manga }) => (
     <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 hover:scale-[1.03] group flex flex-col h-full">
      <CardHeader className="p-0 relative aspect-[2/3] w-full overflow-hidden"> {/* Aspect ratio */}
         {item.imageUrl ? (
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
           {item.genre.slice(0, 3).map(g => <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>)}
         </div>
        <CardDescription className="text-xs text-muted-foreground line-clamp-3 mb-3 flex-grow">
           {item.description || 'No description available.'}
         </CardDescription>
         {/* Additional Info Row */}
         <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-border/50 pt-2 mt-auto">
            <span className="flex items-center gap-1" title={`Status: ${formatStatus(item.status)}`}>
                 <Badge
                    variant={
                        item.status === 'RELEASING' ? 'default' :
                        item.status === 'FINISHED' ? 'secondary' :
                        item.status === 'HIATUS' ? 'destructive' :
                        'outline'
                    }
                    className="text-xs px-1.5 py-0.5" // Smaller badge padding
                    >
                    {formatStatus(item.status)}
                 </Badge>
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
              {/* TODO: Update link based on manga ID or a slug */}
              <Link href={`/manga/${item.id}-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                 View Details
              </Link>
           </Button>
        </div>
      </CardContent>
     </Card>
  );

 // Placeholder Skeleton Card
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
            {/* TODO: Add Filtering/Sorting Options here */}
            {/* <Button variant="outline">Filter</Button> */}
        </div>
        {error && (
           <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Manga</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
           </Alert>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5"> {/* Responsive grid */}
           {loading
             ? Array.from({ length: 12 }).map((_, index) => <SkeletonCard key={`skel-${index}`} />)
             : mangaList.length > 0
               ? mangaList.map((item) => (
                 <MangaCard key={item.id} item={item} /> // Use manga ID as key
               ))
               : !error && (
                 <div className="col-span-full text-center py-10">
                     <p className="text-muted-foreground">No manga found matching your criteria.</p>
                  </div>
                )}
         </div>
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
// Inject styles (consider moving to globals.css for cleaner approach)
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
