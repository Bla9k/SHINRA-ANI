
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

// Dummy data combining anime and manga - replace with actual data
const dummyFavorites = [
    { id: 1, title: 'Attack on Titan', type: 'anime', imageUrl: 'https://m.media-amazon.com/images/M/MV5BNzc5MTczNDQtNDFjNi00ZDU5LWFkNzItOTE1NzQzMzdhNzE0XkEyXkFqcGdeQXVyNzEzNzYxMDA@._V1_.jpg', description: 'Epic tale of humanity survival...', genre: ['Action', 'Drama'], releaseYear: 2013, rating: 8.8 },
    { id: 2, title: 'Berserk', type: 'manga', imageUrl: 'https://m.media-amazon.com/images/M/MV5BNjRmY2NjZGEtOGU5Mi00NmFmLWE0ZDQtNzMxNjBkNWQ2MmNjXkEyXkFqcGdeQXVyNTAyODkwOQ@@._V1_.jpg', description: 'Dark fantasy journey...', genre: ['Action', 'Dark Fantasy'], mangaStatus: 'Ongoing' },
    { id: 3, title: 'Jujutsu Kaisen', type: 'anime', imageUrl: 'https://m.media-amazon.com/images/M/MV5BNGY4MTg3NzgtMmFkZi00NTg5LWExMmEtMWI3YzI1ODdmMWQ1XkEyXkFqcGdeQXVyMjQwMDg0Ng@@._V1_FMjpg_UX1000_.jpg', description: 'Sorcerers battle curses...', genre: ['Action', 'Supernatural'], releaseYear: 2020, rating: 8.7 },
    { id: 4, title: 'Vagabond', type: 'manga', imageUrl: 'https://m.media-amazon.com/images/M/MV5BMjE5NzA4OTE5MV5BMl5BanBnXkFtZTcwMjU4NzYwNw@@._V1_FMjpg_UX1000_.jpg', description: 'Legendary swordsman journey...', genre: ['Action', 'Adventure'], mangaStatus: 'Hiatus' },
];

type FavoriteItem = typeof dummyFavorites[0];

const FavoriteItemCard = ({ item }: { item: FavoriteItem }) => (
  <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 hover:scale-105 flex">
    <CardHeader className="p-0 relative h-32 w-24 flex-shrink-0">
      <Image
        src={item.imageUrl || 'https://picsum.photos/96/128?grayscale'} // Updated placeholder size
        alt={item.title}
        width={96} // Specify width
        height={128} // Specify height
        className="rounded-l-lg object-cover" // Use object-cover
      />
    </CardHeader>
    <CardContent className="p-3 flex-grow flex flex-col justify-between">
      <div>
        <CardTitle className="text-md font-semibold mb-1 line-clamp-1">{item.title}</CardTitle>
        <Badge variant="outline" className="capitalize mb-2">{item.type}</Badge>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {item.description}
        </p>
      </div>
      <div className="flex justify-end items-center mt-2">
         <Button variant="link" size="sm" asChild>
            <Link href={`/${item.type}/${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
             View Details
           </Link>
         </Button>
      </div>
    </CardContent>
  </Card>
);


export default function FavoritesPage() {
  // TODO: Fetch actual favorite items

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Heart className="h-7 w-7 text-primary" /> Your Favorites
      </h1>

      {dummyFavorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dummyFavorites.map((item) => (
            <FavoriteItemCard key={`${item.type}-${item.id}`} item={item} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground mt-8">
          You haven't added any favorites yet.
        </p>
      )}
    </div>
  );
}
