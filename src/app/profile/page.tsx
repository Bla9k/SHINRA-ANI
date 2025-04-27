
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, ShieldCheck, Zap, Award, Edit2, BookOpen, ListVideo, Heart, Settings, Star, Loader2 } from 'lucide-react'; // Added Loader2
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { getAnimeById, Anime } from '@/services/anime'; // Import Jikan-based Anime type and fetcher
import { getMangaById, Manga } from '@/services/manga'; // Import Jikan-based Manga type and fetcher
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton
import { useToast } from '@/hooks/use-toast'; // Import useToast

// --- User Profile Data Structure ---
interface UserProfile {
  username: string;
  email: string;
  avatarUrl: string | null;
  bannerUrl: string | null; // Added banner
  bio: string; // Added bio
  status: string; // Added custom status
  level: number;
  xp: number;
  xpToNextLevel: number;
  aura: string; // Example field
  badges: string[];
  joinDate: Date;
  stats: {
    animeWatched: number;
    mangaRead: number;
    uploads: number;
  };
  // Use MAL IDs for lists
  watchlistIds: { id: number, userStatus: string, userScore?: number | null, userProgress?: string }[];
  readlistIds: { id: number, userStatus: string, userScore?: number | null, userProgress?: string }[];
  favoriteIds: { id: number, type: 'anime' | 'manga' }[];
}

// Define the structure returned by fetch functions, including user data
type FetchedListItemData = (Anime | Manga) & {
    userStatus: string; // e.g., Watching, Reading, Completed, Plan to Watch/Read, Dropped
    userProgress?: string; // e.g., S1 E5, Ch 20
    userScore?: number | null; // User's personal score (0-10)
};

// --- ListItemCard (Accepts full fetched data) ---
const ListItemCard = ({ item }: { item: FetchedListItemData }) => {
    if (!item || !item.mal_id) return null;
    const linkHref = `/${item.type}/${item.mal_id}`;

    return (
        <Link href={linkHref} passHref legacyBehavior>
            <a className="block group">
                <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 group-hover:scale-105 flex h-full"> {/* Ensure full height */}
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
                            {item.userScore !== undefined && item.userScore !== null && (
                                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                    My Score: <Star size={12} className="text-yellow-400 inline-block"/> {item.userScore}/10
                                </p>
                            )}
                            {item.userProgress && item.userStatus !== 'Favorited' && (
                                <p className="text-xs text-muted-foreground mb-1">Progress: {item.userProgress}</p>
                            )}
                            {(item.userScore === undefined || item.userScore === null) && item.score && (
                                <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                                    MAL Score: <Star size={12} className="text-yellow-400 inline-block"/> {item.score.toFixed(1)}
                                </p>
                            )}
                             {/* Display synopsis only for favorites */}
                            {item.userStatus === 'Favorited' && item.synopsis && (
                                <p className="text-xs text-muted-foreground line-clamp-1 mb-1">{item.synopsis}</p>
                            )}
                            <Badge variant="outline" className="capitalize text-xs px-1.5 py-0.5 mb-2">{item.type}</Badge>
                        </div>
                        <div className="flex justify-between items-center mt-auto pt-1 border-t border-border/50">
                            <Badge
                                variant={
                                    item.userStatus === 'Watching' || item.userStatus === 'Reading' ? 'default' :
                                    item.userStatus === 'Completed' ? 'secondary' :
                                    item.userStatus === 'Dropped' ? 'destructive' :
                                    'outline'
                                }
                                className="text-xs px-1.5 py-0.5"
                            >
                                {item.userStatus}
                            </Badge>
                             <span className="text-xs text-primary font-medium group-hover:underline">View Details</span>
                        </div>
                    </CardContent>
                </Card>
            </a>
        </Link>
    );
};

// --- Skeleton for ListItemCard ---
const ListItemSkeletonCard = () => (
     <Card className="overflow-hidden glass flex h-28 animate-pulse"> {/* Fixed height */}
        <div className="p-0 relative h-28 w-20 flex-shrink-0">
            <Skeleton className="h-full w-full" />
        </div>
        <CardContent className="p-3 flex-grow flex flex-col justify-between">
            <div>
                <Skeleton className="h-4 w-3/4 mb-1" />
                <Skeleton className="h-3 w-1/2 mb-1" />
                <Skeleton className="h-3 w-1/3 mb-2" />
                 <Skeleton className="h-4 w-10 mb-2" />
            </div>
            <div className="flex justify-between items-center mt-auto pt-1 border-t border-border/50">
                 <Skeleton className="h-4 w-16" />
                 <Skeleton className="h-3 w-12" />
            </div>
        </CardContent>
    </Card>
);


// --- Component to Fetch and Render Individual List Item ---
interface UserListItemFetcherProps {
  id: number;
  type: 'anime' | 'manga';
  userStatus: string;
  userScore?: number | null;
  userProgress?: string;
}

const UserListItemFetcher: React.FC<UserListItemFetcherProps> = ({ id, type, userStatus, userScore, userProgress }) => {
  const [itemData, setItemData] = useState<FetchedListItemData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        let data: Anime | Manga | null = null;
        if (type === 'anime') {
          data = await getAnimeById(id);
        } else {
          data = await getMangaById(id);
        }

        if (isMounted) {
          if (data) {
            setItemData({
              ...data,
              userStatus,
              userScore,
              userProgress,
            });
          } else {
             setError(`Could not load ${type} details.`);
             console.warn(`Failed to fetch details for ${type} ID ${id}`);
             // Optionally show a toast error for individual item failures
             // toast({ title: "Loading Error", description: `Failed to load details for ${type} ID ${id}`, variant: "destructive" });
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error(`Error fetching ${type} ID ${id}:`, err);
           setError(`Error loading ${type}.`);
            // toast({ title: "Loading Error", description: `Error loading ${type} ID ${id}`, variant: "destructive" });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [id, type, userStatus, userScore, userProgress, toast]);

  if (loading) {
    return <ListItemSkeletonCard />;
  }

  if (error || !itemData) {
    // Optionally render a small error indicator card or nothing
     return (
        <Card className="overflow-hidden glass flex h-28 border-destructive/50">
             <div className="p-0 relative h-28 w-20 flex-shrink-0 bg-muted/50 flex items-center justify-center">
                 {type === 'anime' ? <ListVideo className="w-8 h-8 text-destructive" /> : <BookOpen className="w-8 h-8 text-destructive" />}
             </div>
             <CardContent className="p-3 flex-grow flex flex-col justify-center items-center">
                 <p className="text-xs text-destructive text-center">{error || `Could not load ${type}`}</p>
                 <p className="text-[10px] text-muted-foreground">ID: {id}</p>
             </CardContent>
        </Card>
    );
  }

  return <ListItemCard item={itemData} />;
};

// --- Main Profile Page Component ---
export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('activity');
  const { toast } = useToast();

  // Simulate fetching user profile data
  const fetchUserProfile = useCallback(async () => {
    setLoadingProfile(true);
    setProfileError(null);
    console.log("Fetching user profile...");
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // TODO: Replace with actual API call (e.g., from Firebase Firestore)
      const fetchedProfile: UserProfile = {
        username: 'ShinraFanatic',
        email: 'shinra@example.com', // Usually not displayed publicly
        avatarUrl: 'https://picsum.photos/seed/avatar1/150/150',
        bannerUrl: 'https://picsum.photos/seed/banner1/1000/300', // Example banner
        bio: 'Just a guy who loves intense action and deep stories. Currently struggling through Berserk.',
        status: 'Watching Jujutsu Kaisen S2',
        level: 15,
        xp: 650,
        xpToNextLevel: 1000,
        aura: 'Thunder Spirit',
        badges: ['Anime Adept', 'Manga Maniac', 'First Upload', 'Community Pioneer'],
        joinDate: new Date(2023, 5, 15),
        stats: { animeWatched: 120, mangaRead: 85, uploads: 3 },
        // Example lists (use MAL IDs)
        watchlistIds: [
          { id: 16498, userStatus: 'Watching', userProgress: 'S4 E10', userScore: 9 },
          { id: 5114, userStatus: 'Completed', userScore: 10 },
          { id: 50265, userStatus: 'Plan to Watch' },
          { id: 11061, userStatus: 'Dropped', userScore: 4 }, // Example: Hunter x Hunter
        ],
        readlistIds: [
          { id: 2, userStatus: 'Reading', userProgress: 'Ch 375', userScore: 10 },
          { id: 21, userStatus: 'Reading', userProgress: 'Ch 1100', userScore: 9 },
          { id: 74045, userStatus: 'Plan to Read' },
          { id: 1, userStatus: 'On-Hold', userProgress: 'Vol 5' }, // Example: Monster
        ],
        favoriteIds: [
          { id: 16498, type: 'anime' }, // AOT
          { id: 2, type: 'manga' }, // Berserk
          { id: 4181, type: 'anime' }, // Clannad: After Story
        ],
      };

      setUserProfile(fetchedProfile);
       console.log("Profile data fetched:", fetchedProfile);

    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      setProfileError("Could not load profile information. Please try again later.");
       toast({ title: "Error", description: "Failed to load profile.", variant: "destructive" });
    } finally {
      setLoadingProfile(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);


  // Render Lists Function
  const renderList = (
    items: UserListItemFetcherProps[],
    emptyMessage: string
  ) => {
    if (!items || items.length === 0) {
      return <p className="text-center text-muted-foreground mt-8 py-6">{emptyMessage}</p>;
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {items.map((item) => (
           // Key must be unique across all lists if they render simultaneously, hence type-id
          <UserListItemFetcher
             key={`${item.type}-${item.id}`}
             id={item.id}
             type={item.type}
             userStatus={item.userStatus}
             userScore={item.userScore}
             userProgress={item.userProgress}
           />
        ))}
      </div>
    );
  };


  if (loadingProfile) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <Card className="mb-8 glass overflow-hidden border-primary/20 shadow-lg">
           <Skeleton className="h-36 md:h-48 w-full"/>
            <CardContent className="p-4 md:p-6 pt-10 md:pt-12">
                 {/* Placeholder for Avatar/Name section */}
                 <div className="flex items-end gap-4 mb-6" style={{ marginTop: '-60px' }}>
                     <Skeleton className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-background" />
                     <div className="pb-8 md:pb-10 space-y-2">
                         <Skeleton className="h-7 w-48" />
                         <Skeleton className="h-5 w-32" />
                     </div>
                 </div>
                 {/* Stats Skeleton */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-center">
                    {Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-16 glass" />)}
                </div>
                {/* XP Skeleton */}
                <div className="mb-4">
                    <div className="flex justify-between mb-1"> <Skeleton className="h-3 w-16" /> <Skeleton className="h-3 w-20" /> </div>
                    <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
                {/* Badges Skeleton */}
                <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                     <Skeleton className="h-5 w-16 rounded-full" />
                </div>
            </CardContent>
        </Card>
         {/* Tabs Skeleton */}
         <Skeleton className="h-10 w-full glass mb-6"/>
         <Card className="glass">
             <CardHeader><Skeleton className="h-6 w-40" /></CardHeader>
             <CardContent>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                     {Array.from({length: 3}).map((_, i) => <ListItemSkeletonCard key={i}/>)}
                 </div>
             </CardContent>
         </Card>
      </div>
    );
  }

  if (profileError || !userProfile) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-destructive">{profileError || "User profile not found."}</p>
         <Button onClick={fetchUserProfile} variant="outline" className="mt-4">Retry</Button>
      </div>
    );
  }

  // Calculate XP Percentage safely
  const xpPercentage = userProfile.xpToNextLevel > 0 ? (userProfile.xp / userProfile.xpToNextLevel) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header Card */}
      <Card className="mb-8 glass overflow-hidden border-primary/20 shadow-xl">
        {/* Banner Image */}
        <div className="relative h-36 md:h-48 bg-gradient-to-br from-primary/80 via-purple-600/70 to-pink-600/70">
          {userProfile.bannerUrl ? (
             <Image src={userProfile.bannerUrl} alt={`${userProfile.username}'s banner`} layout="fill" objectFit="cover" className="opacity-70"/>
          ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-purple-600/70 to-pink-600/70"></div>
          )}
           <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div> {/* Overlay */}

           {/* Avatar & Name - Positioned lower */}
          <div className="absolute bottom-[-50px] left-4 md:left-6 flex items-end gap-4 z-10">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-xl transition-transform hover:scale-105">
               {userProfile.avatarUrl ? (
                  <AvatarImage src={userProfile.avatarUrl} alt={userProfile.username} />
               ) : (
                    <AvatarFallback className="text-2xl md:text-3xl">{userProfile.username.slice(0, 2).toUpperCase()}</AvatarFallback>
               )}
            </Avatar>
             <div className="pb-2 md:pb-3"> {/* Adjusted padding */}
                <h1 className="text-xl md:text-2xl font-bold text-white" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.6)'}}>{userProfile.username}</h1>
                 <p className="text-xs md:text-sm text-gray-300" style={{textShadow: '1px 1px 2px rgba(0,0,0,0.5)'}}>{userProfile.status || 'No status set'}</p> {/* Display status */}
             </div>
          </div>
           {/* Action Buttons */}
           <div className="absolute top-3 right-3 flex gap-2 z-10">
               <Link href="/settings" passHref legacyBehavior>
                    <Button size="icon" variant="outline" className="glass w-8 h-8 backdrop-blur-md bg-black/30 border-white/30 hover:bg-black/50">
                       <Settings className="h-4 w-4 text-white"/>
                       <span className="sr-only">Settings</span>
                   </Button>
               </Link>
               <Button size="icon" variant="outline" className="glass w-8 h-8 backdrop-blur-md bg-black/30 border-white/30 hover:bg-black/50">
                  <Edit2 className="h-4 w-4 text-white"/>
                  <span className="sr-only">Edit Profile</span>
              </Button>
           </div>
        </div>
         {/* Content below banner, starting after avatar */}
        <CardContent className="p-4 md:p-6 pt-16 md:pt-20"> {/* Increased top padding */}
           {/* Bio */}
            {userProfile.bio && (
                 <p className="text-sm text-muted-foreground mb-4 border-l-2 border-primary pl-3 italic">{userProfile.bio}</p>
            )}

           {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-6 text-center">
             <div className="glass p-2 rounded-md border border-border/50">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Level</p>
                <p className="text-lg font-semibold text-primary">{userProfile.level}</p>
             </div>
             <div className="glass p-2 rounded-md border border-border/50">
                 <p className="text-xs text-muted-foreground uppercase tracking-wider">Anime</p>
                 <p className="text-lg font-semibold">{userProfile.stats.animeWatched}</p>
             </div>
             <div className="glass p-2 rounded-md border border-border/50">
                 <p className="text-xs text-muted-foreground uppercase tracking-wider">Manga</p>
                 <p className="text-lg font-semibold">{userProfile.stats.mangaRead}</p>
             </div>
             <div className="glass p-2 rounded-md border border-border/50">
                 <p className="text-xs text-muted-foreground uppercase tracking-wider">Uploads</p>
                 <p className="text-lg font-semibold">{userProfile.stats.uploads}</p>
             </div>
          </div>

          {/* XP Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
               <span>Level {userProfile.level} XP</span>
               <span>{userProfile.xp} / {userProfile.xpToNextLevel}</span>
            </div>
             <Progress value={xpPercentage} className="w-full h-1.5 [&>div]:bg-gradient-to-r [&>div]:from-primary [&>div]:to-purple-500" />
          </div>

           {/* Badges */}
           <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium mr-2 text-muted-foreground">Badges:</p>
                {userProfile.badges.map(badge => (
                    <Badge key={badge} variant="default" className="neon-glow-hover text-xs backdrop-blur-sm bg-primary/80 border border-primary/50 shadow-sm">
                        <Award className="w-3 h-3 mr-1"/> {badge}
                    </Badge>
                ))}
                 {userProfile.badges.length === 0 && <span className="text-xs text-muted-foreground italic">No badges earned yet.</span>}
            </div>
        </CardContent>
      </Card>

       {/* Tabs for Lists */}
       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
         <TabsList className="glass mb-6 grid w-full grid-cols-2 md:grid-cols-4">
           <TabsTrigger value="activity" className="data-[state=active]:neon-glow">Activity</TabsTrigger>
           <TabsTrigger value="watchlist" className="data-[state=active]:neon-glow flex items-center gap-1"><ListVideo size={16}/> Watchlist</TabsTrigger>
           <TabsTrigger value="readlist" className="data-[state=active]:neon-glow flex items-center gap-1"><BookOpen size={16}/> Readlist</TabsTrigger>
           <TabsTrigger value="favorites" className="data-[state=active]:neon-glow flex items-center gap-1"><Heart size={16}/> Favorites</TabsTrigger>
         </TabsList>

         {/* Tab Content */}
          <TabsContent value="activity">
             {/* TODO: Implement Activity Feed Component */}
            <Card className="glass">
                <CardHeader>
                    <CardTitle className="text-xl">Recent Activity</CardTitle>
                     <CardDescription>Your latest interactions and updates.</CardDescription>
                </CardHeader>
                <CardContent>
                     <p className="text-center text-muted-foreground mt-8 py-6">Activity feed coming soon!</p>
                    {/* Placeholder for activity items */}
                    {/* <div className="space-y-3">
                        {dummyActivity.map(item => <ActivityItem key={item.id} item={item} />)}
                        {dummyActivity.length === 0 && ( <p className="text-center text-muted-foreground mt-8 py-6">No recent activity.</p> )}
                    </div> */}
                </CardContent>
            </Card>
         </TabsContent>

         <TabsContent value="watchlist">
            <Card className="glass">
                <CardHeader>
                    <CardTitle className="text-xl">My Watchlist ({userProfile.watchlistIds.length})</CardTitle>
                    <CardDescription>Anime you're watching, completed, or plan to watch.</CardDescription>
                </CardHeader>
                 <CardContent>
                    {renderList(
                        userProfile.watchlistIds.map(item => ({ ...item, type: 'anime' })), // Add type
                        "Your watchlist is empty. Add some anime!"
                     )}
                 </CardContent>
            </Card>
         </TabsContent>

         <TabsContent value="readlist">
            <Card className="glass">
                 <CardHeader>
                     <CardTitle className="text-xl">My Readlist ({userProfile.readlistIds.length})</CardTitle>
                     <CardDescription>Manga you're reading, completed, or plan to read.</CardDescription>
                 </CardHeader>
                 <CardContent>
                     {renderList(
                         userProfile.readlistIds.map(item => ({ ...item, type: 'manga' })), // Add type
                         "Your readlist is empty. Add some manga!"
                      )}
                </CardContent>
            </Card>
         </TabsContent>

         <TabsContent value="favorites">
            <Card className="glass">
                 <CardHeader>
                     <CardTitle className="text-xl">My Favorites ({userProfile.favoriteIds.length})</CardTitle>
                      <CardDescription>Your most cherished anime and manga.</CardDescription>
                 </CardHeader>
                 <CardContent>
                      {renderList(
                          userProfile.favoriteIds.map(item => ({ ...item, userStatus: 'Favorited' })), // Add userStatus for card display
                          "You haven't added any favorites yet."
                       )}
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

    