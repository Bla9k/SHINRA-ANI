
'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, ShieldCheck, Zap, Award, Edit2, BookOpen, ListVideo, Heart, Settings, Star } from 'lucide-react'; // Added Settings, Star
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Anime } from '@/services/anime'; // Import Jikan-based Anime type
import { Manga } from '@/services/manga'; // Import Jikan-based Manga type

// Dummy data - replace with actual user data and logic
const dummyUser = {
  username: 'ShinraFanatic',
  email: 'shinra@example.com',
  avatarUrl: 'https://picsum.photos/150/150?random=2',
  level: 15,
  xp: 650,
  xpToNextLevel: 1000,
  aura: 'Thunder Spirit',
  badges: ['Anime Adept', 'Manga Maniac', 'First Upload'],
  joinDate: new Date(2023, 5, 15),
  animeWatched: 120,
  mangaRead: 85,
  uploads: 3,
};

// Jikan API based types for lists
type UserListItem = (Partial<Anime> | Partial<Manga>) & {
    mal_id: number; // Use MAL ID
    title: string;
    type: 'anime' | 'manga';
    imageUrl: string | null; // Derived imageUrl
    userStatus: string; // e.g., Watching, Reading, Completed, Plan to Watch/Read, Dropped
    userProgress?: string; // e.g., S1 E5, Ch 20
    userScore?: number | null; // User's personal score (0-10)
    // Add other Jikan fields if needed (e.g., score, year, status)
    score?: number | null;
    year?: number | null;
    status?: string | null;
    episodes?: number | null;
    chapters?: number | null;
    description?: string | null; // Add description/synopsis
};

// Dummy data using Jikan structure (adapt as needed)
// Replace with actual fetched data from user's lists (e.g., Firestore)
const dummyWatchlist: UserListItem[] = [
  { mal_id: 16498, title: 'Attack on Titan', type: 'anime', userStatus: 'Watching', userProgress: 'S4 E10', userScore: 9, imageUrl: 'https://cdn.myanimelist.net/images/anime/10/47347l.jpg', year: 2013, score: 8.53 },
  { mal_id: 5114, title: 'Fullmetal Alchemist: Brotherhood', type: 'anime', userStatus: 'Completed', userScore: 10, imageUrl: 'https://cdn.myanimelist.net/images/anime/1208/94745l.jpg', year: 2009, score: 9.10 },
  { mal_id: 50265, title: 'Spy x Family', type: 'anime', userStatus: 'Plan to Watch', imageUrl: 'https://cdn.myanimelist.net/images/anime/1441/122795l.jpg', year: 2022, score: 8.56 },
];
const dummyReadlist: UserListItem[] = [
   { mal_id: 2, title: 'Berserk', type: 'manga', userStatus: 'Reading', userProgress: 'Chapter 375', userScore: 10, imageUrl: 'https://cdn.myanimelist.net/images/manga/1/157931l.jpg', status: 'Publishing', score: 9.47 },
   { mal_id: 21, title: 'One Piece', type: 'manga', userStatus: 'Reading', userProgress: 'Chapter 1100', userScore: 9, imageUrl: 'https://cdn.myanimelist.net/images/manga/2/253146l.jpg', status: 'Publishing', score: 9.22 },
   { mal_id: 74045, title: 'One Punch Man', type: 'manga', userStatus: 'Plan to Read', imageUrl: 'https://cdn.myanimelist.net/images/manga/3/269639l.jpg', status: 'Publishing', score: 8.69 },
];
const dummyFavorites: UserListItem[] = [
    { mal_id: 16498, title: 'Attack on Titan', type: 'anime', userStatus: 'Favorited', imageUrl: 'https://cdn.myanimelist.net/images/anime/10/47347l.jpg', description: 'Epic tale of humanity survival...' },
    { mal_id: 2, title: 'Berserk', type: 'manga', userStatus: 'Favorited', imageUrl: 'https://cdn.myanimelist.net/images/manga/1/157931l.jpg', description: 'Dark fantasy journey...' },
];

// Dummy Activity Data (Can be enhanced using Jikan data)
const dummyActivity = [
  { id: 1, type: 'watched', title: 'Attack on Titan S4 E10', timestamp: '2 days ago', imageUrl: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg' }, // Smaller image for activity
  { id: 2, type: 'read', title: 'Berserk Ch. 375', timestamp: '5 days ago', imageUrl: 'https://cdn.myanimelist.net/images/manga/1/157931.jpg' },
  { id: 4, type: 'favorited', title: 'Jujutsu Kaisen', timestamp: '1 week ago', imageUrl: 'https://cdn.myanimelist.net/images/anime/1171/109222.jpg' },
];


// Reusable Card Component for Lists - Adapted for Jikan/UserListItem
const ListItemCard = ({ item }: { item: UserListItem }) => (
  <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 hover:scale-105 flex group">
    <div className="p-0 relative h-28 w-20 flex-shrink-0 overflow-hidden rounded-l-md">
      {item.imageUrl ? (
         <Image
           src={item.imageUrl}
           alt={item.title}
           fill
           sizes="80px"
           className="object-cover transition-transform duration-300 group-hover:scale-105"
         />
       ) : (
          <div className="h-full w-full bg-muted flex items-center justify-center">
            {item.type === 'anime' ? <ListVideo className="w-8 h-8 text-muted-foreground" /> : <BookOpen className="w-8 h-8 text-muted-foreground" />}
          </div>
       )}
    </div>
    <CardContent className="p-3 flex-grow flex flex-col justify-between">
      <div>
        <CardTitle className="text-sm font-semibold mb-1 line-clamp-1 group-hover:text-primary transition-colors">
           {item.title}
        </CardTitle>
         {/* Show User Score if available */}
         {item.userScore !== undefined && item.userScore !== null && (
             <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                My Score: <Star size={12} className="text-yellow-400 inline-block"/> {item.userScore}/10
             </p>
         )}
        {item.userProgress && item.userStatus !== 'Favorited' && (
             <p className="text-xs text-muted-foreground mb-1">Progress: {item.userProgress}</p>
        )}
        {/* Show MAL score if no user score */}
         {(item.userScore === undefined || item.userScore === null) && item.score && (
            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                MAL Score: <Star size={12} className="text-yellow-400 inline-block"/> {item.score.toFixed(1)}
            </p>
         )}
         {/* Show synopsis only if it's a favorite and no progress */}
         {item.userStatus === 'Favorited' && item.description && (
              <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{item.description}</p>
         )}
         <Badge variant="outline" className="capitalize text-xs px-1.5 py-0.5 mb-2">{item.type}</Badge>
      </div>
      <div className="flex justify-between items-center mt-1">
         {/* User Status Badge */}
         <Badge
            variant={ // Adjust variants based on status strings
                item.userStatus === 'Watching' || item.userStatus === 'Reading' ? 'default' :
                item.userStatus === 'Completed' ? 'secondary' :
                item.userStatus === 'Dropped' ? 'destructive' :
                'outline'
            }
            className="text-xs px-1.5 py-0.5"
            >
             {item.userStatus}
          </Badge>
          {/* Link to details page using MAL ID */}
           <Button variant="link" size="sm" asChild className="text-xs p-0 h-auto self-end">
               <Link href={`/${item.type}/${item.mal_id}`}>
                  Details
               </Link>
           </Button>
      </div>
    </CardContent>
  </Card>
);


// Activity Item Component - Slightly enhanced
const ActivityItem = ({ item }: { item: typeof dummyActivity[0] }) => (
    <Card className="glass flex items-center p-2 gap-3 hover:bg-accent/10 transition-colors">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.title} width={36} height={54} className="rounded object-cover flex-shrink-0" />
        ) : (
          <div className="w-[36px] h-[54px] bg-muted rounded flex items-center justify-center flex-shrink-0">
            <User size={16} className="text-muted-foreground"/>
          </div>
        )}
        <div className="flex-grow overflow-hidden">
            <p className="text-sm font-medium line-clamp-1">
                {item.type === 'watched' ? 'Watched ' : item.type === 'read' ? 'Read ' : item.type === 'uploaded' ? 'Uploaded ' : 'Favorited '}
                 <strong className="text-foreground">{item.title}</strong>
            </p>
            <p className="text-xs text-muted-foreground">{item.timestamp}</p>
        </div>
    </Card>
);

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('activity');

  const xpPercentage = dummyUser.xpToNextLevel > 0 ? (dummyUser.xp / dummyUser.xpToNextLevel) * 100 : 0;

  const renderList = (items: UserListItem[], emptyMessage: string) => (
       items.length > 0 ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
           {items.map((item) => (
             <ListItemCard key={`${item.type}-${item.mal_id}`} item={item} /> // Use MAL ID as key
           ))}
         </div>
       ) : (
         <p className="text-center text-muted-foreground mt-8 py-6">{emptyMessage}</p>
       )
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header Card */}
      <Card className="mb-8 glass overflow-hidden border-primary/20 shadow-lg">
        <div className="relative h-36 md:h-48 bg-gradient-to-br from-primary/80 via-purple-600/70 to-pink-600/70">
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
          <div className="absolute bottom-[-30px] left-4 md:left-6 flex items-end gap-4 z-10">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-xl transition-transform hover:scale-105">
              <AvatarImage src={dummyUser.avatarUrl} alt={dummyUser.username} />
              <AvatarFallback className="text-2xl md:text-3xl">{dummyUser.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
             <div className="pb-8 md:pb-10">
                <h1 className="text-xl md:text-2xl font-bold text-white" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.5)'}}>{dummyUser.username}</h1>
                 <Badge variant="secondary" className="mt-1 text-xs neon-glow bg-primary/90 border-primary/50 text-primary-foreground">
                     <Zap className="w-3 h-3 mr-1" /> {dummyUser.aura}
                 </Badge>
             </div>
          </div>
           <div className="absolute top-3 right-3 flex gap-2">
               <Button size="icon" variant="outline" className="glass w-8 h-8" asChild>
                   <Link href="/settings">
                      <Settings className="h-4 w-4"/>
                      <span className="sr-only">Settings</span>
                   </Link>
               </Button>
               <Button size="icon" variant="outline" className="glass w-8 h-8">
                  <Edit2 className="h-4 w-4"/>
                  <span className="sr-only">Edit Profile</span>
              </Button>
           </div>
        </div>
        <CardContent className="p-4 md:p-6 pt-10 md:pt-12">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-center">
             <div className="glass p-2 rounded-md">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Level</p>
                <p className="text-lg font-semibold text-primary">{dummyUser.level}</p>
             </div>
             <div className="glass p-2 rounded-md">
                 <p className="text-xs text-muted-foreground uppercase tracking-wider">Anime</p>
                 <p className="text-lg font-semibold">{dummyUser.animeWatched}</p>
             </div>
             <div className="glass p-2 rounded-md">
                 <p className="text-xs text-muted-foreground uppercase tracking-wider">Manga</p>
                 <p className="text-lg font-semibold">{dummyUser.mangaRead}</p>
             </div>
             <div className="glass p-2 rounded-md">
                 <p className="text-xs text-muted-foreground uppercase tracking-wider">Uploads</p>
                 <p className="text-lg font-semibold">{dummyUser.uploads}</p>
             </div>
          </div>
          {/* XP Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
               <span>Level {dummyUser.level} XP</span>
               <span>{dummyUser.xp} / {dummyUser.xpToNextLevel}</span>
            </div>
             <Progress value={xpPercentage} className="w-full h-1.5 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-purple-500" />
          </div>
           {/* Badges */}
           <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium mr-2 text-muted-foreground">Badges:</p>
                {dummyUser.badges.map(badge => (
                    <Badge key={badge} variant="default" className="neon-glow text-xs">
                        <Award className="w-3 h-3 mr-1"/> {badge}
                    </Badge>
                ))}
                 {dummyUser.badges.length === 0 && <span className="text-xs text-muted-foreground italic">No badges earned yet.</span>}
            </div>
        </CardContent>
      </Card>

       {/* Tabs */}
       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
         <TabsList className="glass mb-6 grid w-full grid-cols-2 md:grid-cols-4">
           <TabsTrigger value="activity" className="data-[state=active]:neon-glow">Activity</TabsTrigger>
           <TabsTrigger value="watchlist" className="data-[state=active]:neon-glow flex items-center gap-1"><ListVideo size={16}/> Watchlist</TabsTrigger>
           <TabsTrigger value="readlist" className="data-[state=active]:neon-glow flex items-center gap-1"><BookOpen size={16}/> Readlist</TabsTrigger>
           <TabsTrigger value="favorites" className="data-[state=active]:neon-glow flex items-center gap-1"><Heart size={16}/> Favorites</TabsTrigger>
         </TabsList>

         {/* Tab Content */}
         <TabsContent value="activity">
            <Card className="glass">
                <CardHeader>
                    <CardTitle className="text-xl">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {dummyActivity.map(item => <ActivityItem key={item.id} item={item} />)}
                        {dummyActivity.length === 0 && (
                            <p className="text-center text-muted-foreground mt-8 py-6">No recent activity.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
         </TabsContent>

         <TabsContent value="watchlist">
            <Card className="glass">
                <CardHeader>
                    <CardTitle className="text-xl">My Watchlist</CardTitle>
                </CardHeader>
                 <CardContent>
                    {renderList(dummyWatchlist, "Your watchlist is empty. Add some anime!")}
                 </CardContent>
            </Card>
         </TabsContent>

         <TabsContent value="readlist">
            <Card className="glass">
                 <CardHeader>
                     <CardTitle className="text-xl">My Readlist</CardTitle>
                 </CardHeader>
                 <CardContent>
                    {renderList(dummyReadlist, "Your readlist is empty. Add some manga!")}
                </CardContent>
            </Card>
         </TabsContent>

         <TabsContent value="favorites">
            <Card className="glass">
                 <CardHeader>
                     <CardTitle className="text-xl">My Favorites</CardTitle>
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
