
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { getMangas, Manga } from '@/services/manga'; // Import manga service
import { BookText } from 'lucide-react'; // Icon for Manga
import { Badge } from '@/components/ui/badge';

export default function MangaPage() {
  const [mangaList, setMangaList] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchManga = async () => {
      setLoading(true);
      setError(null);
      try {
        const mangas = await getMangas(); // Fetch all manga for now
        setMangaList(mangas);
      } catch (err) {
        console.error("Failed to fetch manga:", err);
        setError("Couldn't load manga list. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchManga();
  }, []);

  // Reusable Card Component for Manga
  const MangaCard = ({ item }: { item: Manga }) => (
     <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 hover:scale-105 group">
      <CardHeader className="p-0 relative h-48 md:h-64">
        <Image
          src={item.imageUrl || 'https://picsum.photos/400/600?grayscale'}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
         <div className="absolute bottom-2 left-2 right-2">
           <CardTitle className="text-lg font-semibold text-primary-foreground line-clamp-2">{item.title}</CardTitle>
         </div>
      </CardHeader>
      <CardContent className="p-4">
         <div className="flex gap-1 mb-2 flex-wrap">
           {item.genre.map(g => <Badge key={g} variant="secondary">{g}</Badge>)}
           <Badge variant={item.status === 'Ongoing' ? 'default' : item.status === 'Completed' ? 'secondary' : 'destructive'}>{item.status}</Badge>
         </div>
        <CardDescription className="text-sm text-muted-foreground line-clamp-3 mb-3">
           {item.description}
         </CardDescription>
        <div className="flex justify-end items-center">
           <Button variant="link" size="sm" asChild>
              <Link href={`/manga/${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                 View Details
              </Link>
           </Button>
        </div>
      </CardContent>
     </Card>
  );

 // Placeholder Skeleton Card
 const SkeletonCard = () => (
    <Card className="overflow-hidden glass">
       <CardHeader className="p-0 h-48 md:h-64">
          <Skeleton className="h-full w-full" />
       </CardHeader>
       <CardContent className="p-4 space-y-2">
          <Skeleton className="h-4 w-3/4" />
           <div className="flex gap-1 mb-2 flex-wrap">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
           </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-6 w-1/3 float-right mt-2" />
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
        {error && <p className="text-destructive text-center mb-4">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
           {loading
             ? Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={`skel-${index}`} />)
             : mangaList.length > 0
               ? mangaList.map((item) => (
                 <MangaCard key={item.title} item={item} />
               ))
               : !error && <p className="text-center text-muted-foreground col-span-full mt-8">No manga found.</p>}
         </div>
      </section>
    </div>
  );
}
