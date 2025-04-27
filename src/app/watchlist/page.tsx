
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ListVideo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

// Dummy data - replace with actual data fetching
const dummyAnime = [
  { id: 1, title: 'Attack on Titan', status: 'Watching', progress: 'S4 E10', imageUrl: 'https://m.media-amazon.com/images/M/MV5BNzc5MTczNDQtNDFjNi00ZDU5LWFkNzItOTE1NzQzMzdhNzE0XkEyXkFqcGdeQXVyNzEzNzYxMDA@._V1_.jpg', type: 'anime', description: 'Description for AoT...', genre: ['Action'], releaseYear: 2013, rating: 8.8 },
  { id: 2, title: 'Jujutsu Kaisen', status: 'Completed', progress: 'S1 E24', imageUrl: 'https://m.media-amazon.com/images/M/MV5BNGY4MTg3NzgtMmFkZi00NTg5LWExMmEtMWI3YzI1ODdmMWQ1XkEyXkFqcGdeQXVyMjQwMDg0Ng@@._V1_FMjpg_UX1000_.jpg', type: 'anime', description: 'Description for JJK...', genre: ['Action', 'Supernatural'], releaseYear: 2020, rating: 8.7 },
  { id: 3, title: 'Spy x Family', status: 'Plan to Watch', progress: 'S1 E1', imageUrl: 'https://m.media-amazon.com/images/M/MV5BMDIxMjY0YjgtYjA0MS00ZjY1LWIyZmUtNTIxMGYxMDg1NjQ5XkEyXkFqcGdeQXVyMzgxODM4NjM@._V1_.jpg', type: 'anime', description: 'Description for Spy x Family...', genre: ['Comedy', 'Action'], releaseYear: 2022, rating: 8.6 },
];

type WatchlistItem = typeof dummyAnime[0];

const WatchlistItemCard = ({ item }: { item: WatchlistItem }) => (
  <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 hover:scale-105 flex">
    <CardHeader className="p-0 relative h-32 w-24 flex-shrink-0">
      <Image
        src={item.imageUrl || 'https://picsum.photos/200/300?grayscale'}
        alt={item.title}
        layout="fill"
        objectFit="cover"
        className="rounded-l-lg"
      />
    </CardHeader>
    <CardContent className="p-3 flex-grow flex flex-col justify-between">
      <div>
        <CardTitle className="text-md font-semibold mb-1 line-clamp-1">{item.title}</CardTitle>
        <p className="text-xs text-muted-foreground mb-2">Progress: {item.progress}</p>
      </div>
      <div className="flex justify-between items-center mt-2">
        <Badge variant={item.status === 'Watching' ? 'default' : item.status === 'Completed' ? 'secondary' : 'outline'}>
          {item.status}
        </Badge>
        <Button variant="link" size="sm" asChild>
           <Link href={`/anime/${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
             Details
           </Link>
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default function WatchlistPage() {
  const [activeTab, setActiveTab] = useState('watching');

  const filteredItems = dummyAnime.filter(item => {
    if (activeTab === 'watching') return item.status === 'Watching';
    if (activeTab === 'completed') return item.status === 'Completed';
    if (activeTab === 'planning') return item.status === 'Plan to Watch';
    return true; // 'all' tab
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <ListVideo className="h-7 w-7" /> Your Watchlist
      </h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
        <TabsList className="glass">
          <TabsTrigger value="all" className="data-[state=active]:neon-glow">All</TabsTrigger>
          <TabsTrigger value="watching" className="data-[state=active]:neon-glow">Watching</TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:neon-glow">Completed</TabsTrigger>
          <TabsTrigger value="planning" className="data-[state=active]:neon-glow">Plan to Watch</TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <WatchlistItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground mt-8">
          Your '{activeTab}' list is empty. Add some anime!
        </p>
      )}
    </div>
  );
}
