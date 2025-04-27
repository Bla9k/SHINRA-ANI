
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

// Dummy data - replace with actual data fetching
const dummyManga = [
   { id: 1, title: 'Berserk', status: 'Reading', progress: 'Chapter 375', imageUrl: 'https://m.media-amazon.com/images/M/MV5BNjRmY2NjZGEtOGU5Mi00NmFmLWE0ZDQtNzMxNjBkNWQ2MmNjXkEyXkFqcGdeQXVyNTAyODkwOQ@@._V1_.jpg', type: 'manga', description: 'Description for Berserk...', genre: ['Action', 'Dark Fantasy'], mangaStatus: 'Ongoing' },
   { id: 2, title: 'Vagabond', status: 'Completed', progress: 'Chapter 327', imageUrl: 'https://m.media-amazon.com/images/M/MV5BMjE5NzA4OTE5MV5BMl5BanBnXkFtZTcwMjU4NzYwNw@@._V1_FMjpg_UX1000_.jpg', type: 'manga', description: 'Description for Vagabond...', genre: ['Action', 'Adventure'], mangaStatus: 'Hiatus' }, // Example with Hiatus
   { id: 3, title: 'One Punch Man', status: 'Plan to Read', progress: 'Chapter 1', imageUrl: 'https://m.media-amazon.com/images/M/MV5BZjJlNzE5ZjItZWQyYy00MmFlLTg5YjktMzJiMzk5ZjIwYTEyXkEyXkFqcGdeQXVyMzgxODM4NjM@._V1_FMjpg_UX1000_.jpg', type: 'manga', description: 'Description for OPM...', genre: ['Action', 'Comedy'], mangaStatus: 'Ongoing' },
];

type ReadlistItem = typeof dummyManga[0];

const ReadlistItemCard = ({ item }: { item: ReadlistItem }) => (
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
        <Badge variant={item.status === 'Reading' ? 'default' : item.status === 'Completed' ? 'secondary' : 'outline'}>
          {item.status}
        </Badge>
         <Button variant="link" size="sm" asChild>
            <Link href={`/manga/${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
             Details
           </Link>
         </Button>
      </div>
    </CardContent>
  </Card>
);

export default function ReadlistPage() {
  const [activeTab, setActiveTab] = useState('reading');

  const filteredItems = dummyManga.filter(item => {
    if (activeTab === 'reading') return item.status === 'Reading';
    if (activeTab === 'completed') return item.status === 'Completed';
    if (activeTab === 'planning') return item.status === 'Plan to Read';
    return true; // 'all' tab
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <BookOpen className="h-7 w-7" /> Your Readlist
      </h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
        <TabsList className="glass">
          <TabsTrigger value="all" className="data-[state=active]:neon-glow">All</TabsTrigger>
          <TabsTrigger value="reading" className="data-[state=active]:neon-glow">Reading</TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:neon-glow">Completed</TabsTrigger>
          <TabsTrigger value="planning" className="data-[state=active]:neon-glow">Plan to Read</TabsTrigger>
        </TabsList>
      </Tabs>

       {filteredItems.length > 0 ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {filteredItems.map((item) => (
             <ReadlistItemCard key={item.id} item={item} />
           ))}
         </div>
       ) : (
         <p className="text-center text-muted-foreground mt-8">
           Your '{activeTab}' list is empty. Add some manga!
         </p>
       )}
    </div>
  );
}
