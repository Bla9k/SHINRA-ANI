
'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, ShieldCheck, Zap, Award, Edit2, BookOpen, ListVideo, Heart, Settings } from 'lucide-react'; // Added Settings
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Anime } from '@/services/anime'; // Import Anime type
import { Manga } from '@/services/manga'; // Import Manga type

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
  animeWatched: 120, // Count based on list
  mangaRead: 85,     // Count based on list
  uploads: 3,        // Example uploads count
};

// Dummy data for lists - Use partial types based on fetched data structure
// Replace with actual fetched data from user's lists (e.g., Firestore)
const dummyWatchlist: (Partial<Anime> & { userStatus: string, userProgress?: string })[] = [
  { id: 139, title: 'Attack on Titan', userStatus: 'Watching', userProgress: 'S4 E10', imageUrl: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-C6FPmWm59CyP.jpg', type: 'anime', releaseYear: 2013 },
  { id: 140960, title: 'Spy x Family', userStatus: 'Plan to Watch', imageUrl: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx140960-54qc69V7400M.jpg', type: 'anime', releaseYear: 2022 },
];
const dummyReadlist: (Partial<Manga> & { userStatus: string, userProgress?: string })[] = [
   { id: 30002, title: 'Berserk', userStatus: 'Reading', userProgress: 'Chapter 375', imageUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30002-sHmEe77z3CPm.jpg', type: 'manga', status: 'RELEASING' },
   { id: 31348, title: 'One Punch Man', userStatus: 'Plan to Read', imageUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx31348-dGwm4PZ2i7G3.jpg', type: 'manga', status: 'RELEASING' },
];
const dummyFavorites: (Partial<Anime> | Partial<Manga>)[] = [
    { id: 16498, title: 'Attack on Titan', type: 'anime', imageUrl: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-C6FPmWm59CyP.jpg', description: 'Epic tale of humanity survival...' },
    { id: 30002, title: 'Berserk', type: 'manga', imageUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/large/bx30002-sHmEe77z3CPm.jpg', description: 'Dark fantasy journey...' },
];

// Dummy Activity Data (Can be enhanced)
const dummyActivity = [
  { id: 1, type: 'watched', title: 'Attack on Titan S4 E10', timestamp: '2 days ago', imageUrl: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx16498-C6FPmWm59CyP.jpg' }, // Use medium for activity
  { id: 2, type: 'read', title: 'Berserk Ch. 375', timestamp: '5 days ago', imageUrl: 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx30002-sHmEe77z3CPm.jpg' },
  { id: 4, type: 'favorited', title: 'Jujutsu Kaisen', timestamp: '1 week ago', imageUrl: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx113415-bbBWj4pEFnAZ.png' },
];


type ListItem = (Partial<Anime> | Partial<Manga>) & {
    id: number; // Ensure ID is always present and is a number from AniList
    title: string;
    userStatus?: string; // User's status (Watching, Reading, Plan to, Completed, Dropped)
    userProgress?: string; // User's progress (e.g., S1 E5, Ch 20)
    imageUrl: string | null; // Ensure imageUrl exists
    type: 'anime' | 'manga';
    description?: string | null;
};


// Reusable Card Component for Lists - Enhanced UI
const ListItemCard = ({ item }: { item: ListItem }) => (
  <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 hover:scale-105 flex group">
    <div className="p-0 relative h-28 w-20 flex-shrink-0 overflow-hidden rounded-l-md"> {/* Adjusted size */}
      {item.imageUrl ? (
         <Image
           src={item.imageUrl}
           alt={item.title}
           fill
           sizes="80px" // Fixed size for small images
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
        {item.userProgress && <p className="text-xs text-muted-foreground mb-1">Progress: {item.userProgress}</p>}
        {/* Show description only if it's a favorite and no progress */}
         {item.description && !item.userProgress && <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{item.description}</p>}
         <Badge variant="outline" className="capitalize text-xs px-1.5 py-0.5 mb-2">{item.type}</Badge> {/* Smaller badge */}
      </div>
      <div className="flex justify-between items-center mt-1">
         {/* User Status Badge */}
         {item.userStatus && (
            <Badge
              variant={
                  item.userStatus.includes('Watch') || item.userStatus.includes('Read') ? 'default' :
                  item.userStatus === 'Completed' ? 'secondary' :
                  item.userStatus === 'Dropped' ? 'destructive' :
                  'outline'
              }
              className="text-xs px-1.5 py-0.5" // Small badge
             >
             {item.userStatus}
            </Badge>
         )}
         {/* Ensure button doesn't show if no status (e.g., for favorites list) */}
         {item.userStatus && (
           <Button variant="link" size="sm" asChild className="text-xs p-0 h-auto self-end">
               <Link href={`/${item.type}/${item.id}-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                  Details
               </Link>
           </Button>
          )}
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
  const [activeTab, setActiveTab] = useState('activity'); // Default to activity

  const xpPercentage = dummyUser.xpToNextLevel > 0 ? (dummyUser.xp / dummyUser.xpToNextLevel) * 100 : 0;

  const renderList = (items: ListItem[], emptyMessage: string) => (
       items.length > 0 ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4"> {/* Reduced gap */}
           {items.map((item) => (
             // Use unique key combining type and id
             <ListItemCard key={`${item.type}-${item.id}`} item={item} />
           ))}
         </div>
       ) : (
         <p className="text-center text-muted-foreground mt-8 py-6">{emptyMessage}</p>
       )
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header Card - Enhanced Styling */}
      <Card className="mb-8 glass overflow-hidden border-primary/20 shadow-lg">
        <div className="relative h-36 md:h-48 bg-gradient-to-br from-primary/80 via-purple-600/70 to-pink-600/70"> {/* Gradient direction */}
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div> {/* Slightly stronger overlay */}
          <div className="absolute bottom-[-30px] left-4 md:left-6 flex items-end gap-4 z-10"> {/* Overlap avatar */}
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-xl transition-transform hover:scale-105"> {/* Increased size, shadow */}
              <AvatarImage src={dummyUser.avatarUrl} alt={dummyUser.username} />
              <AvatarFallback className="text-2xl md:text-3xl">{dummyUser.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
             <div className="pb-8 md:pb-10"> {/* Adjust spacing due to avatar overlap */}
                <h1 className="text-xl md:text-2xl font-bold text-white" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.5)'}}>{dummyUser.username}</h1>
                 <Badge variant="secondary" className="mt-1 text-xs neon-glow bg-primary/90 border-primary/50 text-primary-foreground">
                     <Zap className="w-3 h-3 mr-1" /> {dummyUser.aura}
                 </Badge>
             </div>
          </div>
           {/* Settings and Edit Buttons */}
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
        <CardContent className="p-4 md:p-6 pt-10 md:pt-12"> {/* Adjust top padding */}
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
             <Progress value={xpPercentage} className="w-full h-1.5 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-purple-500" /> {/* Thinner bar, gradient */}
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

       {/* Tabs for different sections */}
       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
         <TabsList className="glass mb-6 grid w-full grid-cols-2 md:grid-cols-4"> {/* Responsive grid */}
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
                    <div className="space-y-3"> {/* Reduced space */}
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
                    {/* TODO: Add filter/sort options here if needed */}
                </CardHeader>
                 <CardContent>
                    {renderList(dummyWatchlist as ListItem[], "Your watchlist is empty. Add some anime!")}
                 </CardContent>
            </Card>
         </TabsContent>

         <TabsContent value="readlist">
            <Card className="glass">
                 <CardHeader>
                     <CardTitle className="text-xl">My Readlist</CardTitle>
                      {/* TODO: Add filter/sort options here if needed */}
                 </CardHeader>
                 <CardContent>
                    {renderList(dummyReadlist as ListItem[], "Your readlist is empty. Add some manga!")}
                </CardContent>
            </Card>
         </TabsContent>

         <TabsContent value="favorites">
            <Card className="glass">
                 <CardHeader>
                     <CardTitle className="text-xl">My Favorites</CardTitle>
                 </CardHeader>
                 <CardContent>
                     {renderList(dummyFavorites as ListItem[], "You haven't added any favorites yet.")}
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
