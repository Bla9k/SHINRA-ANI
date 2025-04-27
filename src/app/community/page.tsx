
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, BookText, MessageSquare } from 'lucide-react'; // Import icons
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton'; // For loading states

// Dummy Data for Indie Manga Uploads
const dummyIndieManga = [
  { id: 1, title: 'Galactic Gourmet', author: 'CosmoChef', imageUrl: 'https://picsum.photos/200/300?random=10', genre: ['Sci-Fi', 'Cooking'], description: 'A chef explores the universe searching for exotic ingredients.' },
  { id: 2, title: 'Urban Necromancer', author: 'GraveWalker', imageUrl: 'https://picsum.photos/200/300?random=11', genre: ['Fantasy', 'Urban'], description: 'A necromancer tries to live a normal life in the big city.' },
  { id: 3, title: 'Mecha Gardeners', author: 'PlantBot', imageUrl: 'https://picsum.photos/200/300?random=12', genre: ['Mecha', 'Slice of Life'], description: 'Giant robots tending to giant gardens.' },
  { id: 4, title: 'Samurai Squirrel', author: 'BushidoBlade', imageUrl: 'https://picsum.photos/200/300?random=13', genre: ['Action', 'Animals'], description: 'A squirrel follows the path of the samurai.' },
];

type IndieManga = typeof dummyIndieManga[0];

// Component for displaying an Indie Manga Card
const IndieMangaCard = ({ manga }: { manga: IndieManga }) => (
    <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 hover:scale-105 group">
      <CardHeader className="p-0 relative h-48 md:h-60">
        <Image
          src={manga.imageUrl || 'https://picsum.photos/200/300?grayscale'}
          alt={manga.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
         <div className="absolute bottom-2 left-2 right-2">
           <CardTitle className="text-lg font-semibold text-primary-foreground line-clamp-1">{manga.title}</CardTitle>
           <p className="text-xs text-muted-foreground">by {manga.author}</p>
         </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex gap-1 mb-2 flex-wrap">
           {manga.genre.map(g => <Badge key={g} variant="secondary">{g}</Badge>)}
        </div>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2 mb-3">
           {manga.description}
         </CardDescription>
        <Button variant="link" size="sm" asChild className="float-right">
           {/* TODO: Update link to actual indie manga reader page */}
           <Link href={`/community/manga/${manga.id}`}>
              Read Now
           </Link>
        </Button>
      </CardContent>
     </Card>
);

// Placeholder Skeleton Card for loading state
 const SkeletonCard = () => (
    <Card className="overflow-hidden glass">
       <CardHeader className="p-0 h-48 md:h-60">
          <Skeleton className="h-full w-full" />
       </CardHeader>
       <CardContent className="p-4 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
           <div className="flex gap-1 mb-2 flex-wrap">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
           </div>
          <Skeleton className="h-3 w-full" />
           <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-6 w-1/3 float-right" />
       </CardContent>
    </Card>
 );

 // Placeholder for Nami AI Chat Component
 const NamiAIChat = () => (
    <Card className="glass h-[60vh] flex flex-col">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <MessageSquare className="text-primary" /> Chat with Nami AI
            </CardTitle>
            <CardDescription>Ask Nami for recommendations, anime/manga info, or just chat!</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center text-muted-foreground">
            <p>Nami AI Chat Interface - Coming Soon!</p>
            {/* TODO: Implement AI Chat interface here */}
        </CardContent>
        <div className="p-4 border-t">
            {/* Input area placeholder */}
            <input type="text" placeholder="Type your message to Nami..." className="w-full p-2 rounded bg-muted glass" disabled />
        </div>
    </Card>
 );


export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('indie');
  const [loadingIndie, setLoadingIndie] = useState(false); // Add loading state

  // TODO: Implement actual data fetching for indie manga
  // useEffect(() => {
  //   if (activeTab === 'indie') {
  //     setLoadingIndie(true);
  //     fetchIndieManga().then(data => {
  //       // setIndieManga(data);
  //       setLoadingIndie(false);
  //     });
  //   }
  // }, [activeTab]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Users className="h-7 w-7 text-primary" /> Community Hub
      </h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="glass mb-6 grid w-full grid-cols-2">
          <TabsTrigger value="indie" className="data-[state=active]:neon-glow flex items-center gap-1">
             <BookText size={16}/> Indie Manga
          </TabsTrigger>
          <TabsTrigger value="nami-ai" className="data-[state=active]:neon-glow flex items-center gap-1">
             <MessageSquare size={16}/> Nami AI Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="indie">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Discover Indie Manga</h2>
            <Button asChild variant="outline" className="neon-glow-hover">
                <Link href="/upload">
                    Upload Your Manga
                </Link>
            </Button>
          </div>
          {loadingIndie ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={`skel-${index}`} />)}
            </div>
          ) : dummyIndieManga.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {dummyIndieManga.map((manga) => (
                <IndieMangaCard key={manga.id} manga={manga} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground mt-8">
              No indie manga found yet. Be the first to upload!
            </p>
          )}
        </TabsContent>

        <TabsContent value="nami-ai">
           <NamiAIChat />
        </TabsContent>
      </Tabs>
    </div>
  );
}
