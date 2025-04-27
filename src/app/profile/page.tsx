
'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, ShieldCheck, Zap, Award, Edit2, BookOpen, ListVideo, Heart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

// Dummy data - replace with actual user data and logic
const dummyUser = {
  username: 'ShinraFanatic',
  email: 'shinra@example.com', // Potentially fetched, but might not be displayed directly
  avatarUrl: 'https://picsum.photos/150/150?random=2',
  level: 15,
  xp: 650,
  xpToNextLevel: 1000,
  aura: 'Thunder Spirit', // Example aura
  badges: ['Anime Adept', 'Manga Maniac', 'First Upload'],
  joinDate: new Date(2023, 5, 15),
  animeWatched: 120,
  mangaRead: 85,
  uploads: 3,
};

// Dummy data for lists - replace with actual fetched data
const dummyWatchlist = [
  { id: 1, title: 'Attack on Titan', status: 'Watching', progress: 'S4 E10', imageUrl: 'https://m.media-amazon.com/images/M/MV5BNzc5MTczNDQtNDFjNi00ZDU5LWFkNzItOTE1NzQzMzdhNzE0XkEyXkFqcGdeQXVyNzEzNzYxMDA@._V1_.jpg', type: 'anime' },
  { id: 3, title: 'Spy x Family', status: 'Plan to Watch', progress: 'S1 E1', imageUrl: 'https://m.media-amazon.com/images/M/MV5BMDIxMjY0YjgtYjA0MS00ZjY1LWIyZmUtNTIxMGYxMDg1NjQ5XkEyXkFqcGdeQXVyMzgxODM4NjM@._V1_.jpg', type: 'anime' },
];
const dummyReadlist = [
   { id: 1, title: 'Berserk', status: 'Reading', progress: 'Chapter 375', imageUrl: 'https://m.media-amazon.com/images/M/MV5BNjRmY2NjZGEtOGU5Mi00NmFmLWE0ZDQtNzMxNjBkNWQ2MmNjXkEyXkFqcGdeQXVyNTAyODkwOQ@@._V1_.jpg', type: 'manga' },
   { id: 3, title: 'One Punch Man', status: 'Plan to Read', progress: 'Chapter 1', imageUrl: 'https://m.media-amazon.com/images/M/MV5BZjJlNzE5ZjItZWQyYy00MmFlLTg5YjktMzJiMzk5ZjIwYTEyXkEyXkFqcGdeQXVyMzgxODM4NjM@._V1_FMjpg_UX1000_.jpg', type: 'manga' },
];
const dummyFavorites = [
    { id: 1, title: 'Attack on Titan', type: 'anime', imageUrl: 'https://m.media-amazon.com/images/M/MV5BNzc5MTczNDQtNDFjNi00ZDU5LWFkNzItOTE1NzQzMzdhNzE0XkEyXkFqcGdeQXVyNzEzNzYxMDA@._V1_.jpg', description: 'Epic tale of humanity survival...' },
    { id: 2, title: 'Berserk', type: 'manga', imageUrl: 'https://m.media-amazon.com/images/M/MV5BNjRmY2NjZGEtOGU5Mi00NmFmLWE0ZDQtNzMxNjBkNWQ2MmNjXkEyXkFqcGdeQXVyNTAyODkwOQ@@._V1_.jpg', description: 'Dark fantasy journey...' },
];
const dummyActivity = [
  { id: 1, type: 'watched', title: 'Attack on Titan S4', timestamp: '2 days ago', imageUrl: 'https://m.media-amazon.com/images/M/MV5BNzc5MTczNDQtNDFjNi00ZDU5LWFkNzItOTE1NzQzMzdhNzE0XkEyXkFqcGdeQXVyNzEzNzYxMDA@._V1_.jpg' },
  { id: 2, type: 'read', title: 'Berserk Ch. 375', timestamp: '5 days ago', imageUrl: 'https://m.media-amazon.com/images/M/MV5BNjRmY2NjZGEtOGU5Mi00NmFmLWE0ZDQtNzMxNjBkNWQ2MmNjXkEyXkFqcGdeQXVyNTAyODkwOQ@@._V1_.jpg' },
  { id: 4, type: 'favorited', title: 'Jujutsu Kaisen', timestamp: '1 week ago', imageUrl: 'https://m.media-amazon.com/images/M/MV5BNGY4MTg3NzgtMmFkZi00NTg5LWExMmEtMWI3YzI1ODdmMWQ1XkEyXkFqcGdeQXVyMjQwMDg0Ng@@._V1_FMjpg_UX1000_.jpg' },
];

type ListItem = {
    id: number;
    title: string;
    status?: string; // Optional for favorites
    progress?: string; // Optional for favorites
    imageUrl: string;
    type: 'anime' | 'manga';
    description?: string; // Optional for lists
};


// Reusable Card Component for Lists
const ListItemCard = ({ item }: { item: ListItem }) => (
  <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 hover:scale-105 flex">
    <CardHeader className="p-0 relative h-32 w-24 flex-shrink-0">
      <Image
        src={item.imageUrl || 'https://picsum.photos/96/128?grayscale'}
        alt={item.title}
        width={96}
        height={128}
        className="rounded-l-lg object-cover"
      />
    </CardHeader>
    <CardContent className="p-3 flex-grow flex flex-col justify-between">
      <div>
        <CardTitle className="text-md font-semibold mb-1 line-clamp-1">{item.title}</CardTitle>
        {item.progress && <p className="text-xs text-muted-foreground mb-2">Progress: {item.progress}</p>}
        {item.description && !item.progress && <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{item.description}</p>}
         <Badge variant="outline" className="capitalize mb-2">{item.type}</Badge>
      </div>
      <div className="flex justify-between items-center mt-2">
        {item.status && <Badge variant={item.status.includes('Watch') || item.status.includes('Read') ? 'default' : item.status === 'Completed' ? 'secondary' : 'outline'}>
          {item.status}
        </Badge>}
         <Button variant="link" size="sm" asChild>
            <Link href={`/${item.type}/${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
             Details
           </Link>
         </Button>
      </div>
    </CardContent>
  </Card>
);


// Activity Item Component (Minor update if needed)
const ActivityItem = ({ item }: { item: typeof dummyActivity[0] }) => (
    <Card className="glass flex items-center p-3 gap-3">
        <Image src={item.imageUrl} alt={item.title} width={40} height={60} className="rounded object-cover" />
        <div className="flex-grow">
            <p className="text-sm font-medium line-clamp-1">
                {item.type === 'watched' ? 'Watched ' : item.type === 'read' ? 'Read ' : item.type === 'uploaded' ? 'Uploaded ' : 'Favorited '}
                 <strong>{item.title}</strong>
            </p>
            <p className="text-xs text-muted-foreground">{item.timestamp}</p>
        </div>
    </Card>
);

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('activity'); // Default to activity

  const xpPercentage = (dummyUser.xp / dummyUser.xpToNextLevel) * 100;

  const renderList = (items: ListItem[], emptyMessage: string) => (
       items.length > 0 ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {items.map((item) => (
             <ListItemCard key={`${item.type}-${item.id}`} item={item} />
           ))}
         </div>
       ) : (
         <p className="text-center text-muted-foreground mt-8">{emptyMessage}</p>
       )
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header Card */}
      <Card className="mb-8 glass overflow-hidden">
        <div className="relative h-32 md:h-48 bg-gradient-to-r from-primary via-purple-500 to-pink-500">
           <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute bottom-4 left-4 md:left-6 flex items-end gap-4">
            <Avatar className="h-20 w-20 md:h-28 md:w-28 border-4 border-background shadow-lg">
              <AvatarImage src={dummyUser.avatarUrl} alt={dummyUser.username} />
              <AvatarFallback>{dummyUser.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
             <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white shadow-sm">{dummyUser.username}</h1>
                 <Badge variant="secondary" className="mt-1 text-xs neon-glow bg-primary/80 border-primary text-primary-foreground">
                     <Zap className="w-3 h-3 mr-1" /> {dummyUser.aura}
                 </Badge>
             </div>
          </div>
           <Button size="icon" variant="outline" className="absolute top-4 right-4 glass">
              <Edit2 className="h-4 w-4"/>
              <span className="sr-only">Edit Profile</span>
          </Button>
        </div>
        <CardContent className="p-4 md:p-6 pt-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
             <div>
                <p className="text-xs text-muted-foreground">Level</p>
                <p className="text-lg font-semibold">{dummyUser.level}</p>
             </div>
             <div>
                 <p className="text-xs text-muted-foreground">Anime Watched</p>
                 <p className="text-lg font-semibold">{dummyUser.animeWatched}</p>
             </div>
             <div>
                 <p className="text-xs text-muted-foreground">Manga Read</p>
                 <p className="text-lg font-semibold">{dummyUser.mangaRead}</p>
             </div>
             <div>
                 <p className="text-xs text-muted-foreground">Uploads</p>
                 <p className="text-lg font-semibold">{dummyUser.uploads}</p>
             </div>
          </div>
          {/* XP Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
               <span>XP Progress</span>
               <span>{dummyUser.xp} / {dummyUser.xpToNextLevel}</span>
            </div>
             <Progress value={xpPercentage} className="w-full h-2 [&>div]:bg-primary" />
          </div>
           {/* Badges */}
           <div className="flex flex-wrap gap-2">
                <p className="text-sm font-medium mr-2">Badges:</p>
                {dummyUser.badges.map(badge => (
                    <Badge key={badge} variant="default" className="neon-glow">
                        <Award className="w-3 h-3 mr-1"/> {badge}
                    </Badge>
                ))}
            </div>
        </CardContent>
      </Card>

       {/* Tabs for different sections */}
       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
         <TabsList className="glass mb-6 grid w-full grid-cols-4"> {/* Adjusted for 4 tabs */}
           <TabsTrigger value="activity" className="data-[state=active]:neon-glow">Activity</TabsTrigger>
           <TabsTrigger value="watchlist" className="data-[state=active]:neon-glow flex items-center gap-1"><ListVideo size={16}/> Watchlist</TabsTrigger>
           <TabsTrigger value="readlist" className="data-[state=active]:neon-glow flex items-center gap-1"><BookOpen size={16}/> Readlist</TabsTrigger>
           <TabsTrigger value="favorites" className="data-[state=active]:neon-glow flex items-center gap-1"><Heart size={16}/> Favorites</TabsTrigger>
         </TabsList>

         {/* Tab Content */}
         <TabsContent value="activity">
            <Card className="glass">
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {dummyActivity.map(item => <ActivityItem key={item.id} item={item} />)}
                        {dummyActivity.length === 0 && (
                            <p className="text-center text-muted-foreground mt-8">No recent activity.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
         </TabsContent>

         <TabsContent value="watchlist">
            <Card className="glass">
                <CardHeader>
                    <CardTitle>My Watchlist</CardTitle>
                    {/* Add filter/sort options here if needed */}
                </CardHeader>
                 <CardContent>
                    {renderList(dummyWatchlist, "Your watchlist is empty. Add some anime!")}
                 </CardContent>
            </Card>
         </TabsContent>

         <TabsContent value="readlist">
            <Card className="glass">
                 <CardHeader>
                     <CardTitle>My Readlist</CardTitle>
                      {/* Add filter/sort options here if needed */}
                 </CardHeader>
                 <CardContent>
                    {renderList(dummyReadlist, "Your readlist is empty. Add some manga!")}
                </CardContent>
            </Card>
         </TabsContent>

         <TabsContent value="favorites">
            <Card className="glass">
                 <CardHeader>
                     <CardTitle>My Favorites</CardTitle>
                 </CardHeader>
                 <CardContent>
                     {renderList(dummyFavorites, "You haven't added any favorites yet.")}
                 </CardContent>
             </Card>
         </TabsContent>

       </Tabs>

    </div>
  );
}
