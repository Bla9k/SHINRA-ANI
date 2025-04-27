
'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, ShieldCheck, Zap, Award, Edit2 } from 'lucide-react';
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

const dummyActivity = [
  { id: 1, type: 'watched', title: 'Attack on Titan S4', timestamp: '2 days ago', imageUrl: 'https://m.media-amazon.com/images/M/MV5BNzc5MTczNDQtNDFjNi00ZDU5LWFkNzItOTE1NzQzMzdhNzE0XkEyXkFqcGdeQXVyNzEzNzYxMDA@._V1_.jpg' },
  { id: 2, type: 'read', title: 'Berserk Ch. 375', timestamp: '5 days ago', imageUrl: 'https://m.media-amazon.com/images/M/MV5BNjRmY2NjZGEtOGU5Mi00NmFmLWE0ZDQtNzMxNjBkNWQ2MmNjXkEyXkFqcGdeQXVyNTAyODkwOQ@@._V1_.jpg' },
  { id: 3, type: 'uploaded', title: 'My First Manga', timestamp: '1 week ago', imageUrl: 'https://picsum.photos/200/300?random=3' },
   { id: 4, type: 'favorited', title: 'Jujutsu Kaisen', timestamp: '1 week ago', imageUrl: 'https://m.media-amazon.com/images/M/MV5BNGY4MTg3NzgtMmFkZi00NTg5LWExMmEtMWI3YzI1ODdmMWQ1XkEyXkFqcGdeQXVyMjQwMDg0Ng@@._V1_FMjpg_UX1000_.jpg' },
];

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
  const [activeTab, setActiveTab] = useState('activity');

  const xpPercentage = (dummyUser.xp / dummyUser.xpToNextLevel) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8 glass overflow-hidden">
        <div className="relative h-32 md:h-48 bg-gradient-to-r from-primary via-purple-500 to-pink-500">
           {/* Optional Banner Image */}
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
          <div className="mb-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
               <span>XP Progress</span>
               <span>{dummyUser.xp} / {dummyUser.xpToNextLevel}</span>
            </div>
             <Progress value={xpPercentage} className="w-full h-2 [&>div]:bg-primary" />
          </div>
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

       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
         <TabsList className="glass mb-6">
           <TabsTrigger value="activity" className="data-[state=active]:neon-glow">Recent Activity</TabsTrigger>
           <TabsTrigger value="uploads" className="data-[state=active]:neon-glow">My Uploads</TabsTrigger>
           {/* Add more tabs as needed, e.g., Friends, Groups */}
         </TabsList>

         <TabsContent value="activity">
           <div className="space-y-4">
             {dummyActivity.map(item => <ActivityItem key={item.id} item={item} />)}
             {dummyActivity.length === 0 && (
                <p className="text-center text-muted-foreground mt-8">No recent activity.</p>
             )}
           </div>
         </TabsContent>

         <TabsContent value="uploads">
             {/* TODO: Implement Uploads display */}
           <p className="text-center text-muted-foreground mt-8">
              You haven't uploaded any manga yet.
               <Link href="/upload" className="text-primary underline ml-1">Upload now!</Link>
            </p>
         </TabsContent>
       </Tabs>

    </div>
  );
}
