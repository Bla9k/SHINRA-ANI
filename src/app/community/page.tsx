
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  BookText,
  MessageSquare,
  Hash,
  Mic,
  Settings,
  Plus,
  HelpCircle,
  Compass,
  Headphones,
  User as UserIcon,
  LogOut,
  Bot,
  Palette,
  Upload,
  X,
  Search,
  PlusCircle,
  Swords, // Example icon for Action
  Sparkles, // Example icon for Fantasy
  Heart, // Example icon for Romance
  Rocket, // Example icon for Sci-Fi
  Flame, // Example icon for Trending
  MessageCircle, // For comments
  Newspaper, // For announcements/features
  Info, // For how-to guides
  List, // For endpoints/features
  Github, // Example for external links if needed
  ArrowRight,
  Trophy, // For favorites section
  Tv, // For anime type
  Star // For ratings
} from 'lucide-react'; // Import icons
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast'; // Import useToast
import { getAnimes, getMangas, Anime, Manga } from '@/services'; // Import services
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

// --- Dummy Data (Revised for Jikan-like Structure) ---

const dummyFeaturedCommunities = [
    { id: 'action-hub', name: 'Action Hub', description: 'Discuss the latest fights & power levels!', icon: Swords, imageUrl: 'https://picsum.photos/seed/action/80/80' },
    { id: 'berserk-fans', name: 'Berserk Fans', description: 'Analysis, theories, and fan art for strugglers.', icon: Flame, imageUrl: 'https://picsum.photos/seed/berserk/80/80' },
    { id: 'isekai-tavern', name: 'Isekai Tavern', description: 'Share your other-world adventures!', icon: Sparkles, imageUrl: 'https://picsum.photos/seed/isekai/80/80' },
    { id: 'romance-corner', name: 'Romance Corner', description: 'All things love and relationships in anime/manga.', icon: Heart, imageUrl: 'https://picsum.photos/seed/romance/80/80' },
];

const dummyTopComments = [
    { id: 'c1', user: 'GutsBestBoy', community: 'Berserk Fans', text: "Just reread the Golden Age arc... masterpiece.", timestamp: "2h ago", communityId: 'berserk-fans' },
    { id: 'c2', user: 'ShinraFanatic', community: 'Action Hub', text: "That new mecha anime trailer looks insane!", timestamp: "5h ago", communityId: 'action-hub' },
    { id: 'c3', user: 'IsekaiDreamer', community: 'Isekai Tavern', text: "Reincarnated as a vending machine, AMA.", timestamp: "1d ago", communityId: 'isekai-tavern' },
];

const dummyAllCommunities = [
    ...dummyFeaturedCommunities,
    { id: 'sci-fi-nexus', name: 'Sci-Fi Nexus', description: 'Explore futuristic worlds and tech.', icon: Rocket, imageUrl: 'https://picsum.photos/seed/scifi/80/80' },
    { id: 'manga-creators-hq', name: 'Manga Creators HQ', description: 'Share tips, feedback, and collaborate.', icon: BookText, imageUrl: 'https://picsum.photos/seed/creators/80/80' },
    { id: 'slice-of-life-cafe', name: 'Slice of Life Cafe', description: 'Relax and discuss comfy series.', icon: UserIcon, imageUrl: 'https://picsum.photos/seed/sol/80/80' },
];

const dummyFeatures = [
    { name: 'Indie Manga Uploads', description: 'Share your original manga creations.', icon: Upload, link: '/upload' },
    { name: 'Text & Voice Chat', description: 'Real-time discussion rooms.', icon: MessageSquare, link: '#' }, // Link to relevant chat area if applicable
    { name: 'Community Creation', description: 'Start your own themed community.', icon: Users, link: '#' }, // Link to creation flow
    { name: 'Nami AI Integration', description: 'AI-powered chat and recommendations.', icon: Bot, link: '#' }, // Link to Nami info/chat
    { name: 'Profile Customization', description: 'Personalize your Shinra-Ani identity.', icon: Palette, link: '/profile' },
    { name: 'Events & Competitions', description: 'Join community challenges.', icon: Swords, link: '#' }, // Link to events page
];

const dummyUpcomingFeatures = [
    { name: 'Creator Subscriptions', date: 'Soon™' },
    { name: 'Advanced Moderation Tools', date: 'Q4 2024' },
    { name: 'Live Watch Parties', date: 'TBD' },
];

const dummyIndieManga = [
  { id: 1, title: 'Galactic Gourmet', author: 'CosmoChef', imageUrl: 'https://picsum.photos/200/300?random=10', genre: ['Sci-Fi', 'Cooking'] },
  { id: 2, title: 'Urban Necromancer', author: 'GraveWalker', imageUrl: 'https://picsum.photos/200/300?random=11', genre: ['Fantasy', 'Urban'] },
  { id: 3, title: 'Mecha Gardeners', author: 'PlantBot', imageUrl: 'https://picsum.photos/200/300?random=12', genre: ['Mecha', 'Slice of Life'] },
  { id: 4, title: 'Samurai Squirrel', author: 'BushidoBlade', imageUrl: 'https://picsum.photos/200/300?random=13', genre: ['Action', 'Animals'] },
];

// Define a unified type for favorite items
type FavoriteItem = (Anime | Manga) & {
    id: number; // Use mal_id or anilist_id
    type: 'anime' | 'manga';
    imageUrl: string | null;
};

// Helper to map Anime/Manga service types to FavoriteItem
const mapToFavoriteItem = (item: Anime | Manga): FavoriteItem | null => {
    if (!item || typeof item.mal_id !== 'number') return null;
    return {
        ...item,
        id: item.mal_id,
        type: 'episodes' in item ? 'anime' : 'manga',
        imageUrl: item.images?.jpg?.large_image_url ?? item.images?.jpg?.image_url ?? null,
    };
};

// --- Reusable Components ---

// Card for showcasing a community - Updated with working links and join simulation
const CommunityCard = ({ community }: { community: any }) => {
    const { toast } = useToast();

    const handleJoin = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation
        e.stopPropagation(); // Prevent card link click
        // Simulate joining
        toast({
            title: "Joining Community...",
            description: `Successfully joined ${community.name}! (Simulation)`,
            variant: "default",
        });
        // TODO: Add actual backend logic here
    };

    return (
        <Link href={`/community/${community.id}`} className="block group">
            <Card className="glass neon-glow-hover h-full flex flex-col transition-all duration-300 hover:border-primary/50 group">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <Avatar className="h-12 w-12 border-2 border-primary/30 group-hover:border-primary transition-colors">
                        <AvatarImage src={community.imageUrl} alt={community.name} />
                        <AvatarFallback><community.icon size={20} /></AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <CardTitle className="text-base group-hover:text-primary transition-colors">{community.name}</CardTitle>
                        <CardDescription className="text-xs line-clamp-2">{community.description}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="pt-2 mt-auto flex justify-end">
                    <Button variant="link" size="sm" className="text-xs h-auto p-0 group-hover:underline text-primary z-10" onClick={handleJoin}>
                        Join Community <PlusCircle size={12} className="ml-1" />
                    </Button>
                </CardContent>
            </Card>
        </Link>
    );
};


// Card for showcasing a feature
const FeatureCard = ({ feature }: { feature: any }) => (
    <Link href={feature.link || '#'} className="block h-full">
        <Card className="glass h-full flex flex-col p-4 items-center text-center transition-transform duration-300 hover:scale-105 border border-transparent hover:border-primary/30">
            <feature.icon className="w-8 h-8 mb-2 text-primary" />
            <CardTitle className="text-sm font-semibold mb-1">{feature.name}</CardTitle>
            <CardDescription className="text-xs">{feature.description}</CardDescription>
        </Card>
    </Link>
);

// Card for showcasing indie manga (Simplified) - Updated link
const IndieMangaCard = ({ manga }: { manga: any }) => (
    <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 hover:scale-[1.02] group h-full flex flex-col border-primary/10 hover:border-primary/30">
      <CardHeader className="p-0 relative aspect-[2/3] w-full">
        <Image
          src={manga.imageUrl || 'https://picsum.photos/200/300?grayscale'}
          alt={manga.title}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 23vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
         <div className="absolute bottom-2 left-2 right-2 z-10">
           <CardTitle className="text-sm font-semibold text-primary-foreground line-clamp-1 shadow-text group-hover:text-primary transition-colors">{manga.title}</CardTitle>
         </div>
      </CardHeader>
      <CardContent className="p-3 flex flex-col flex-grow">
        <p className="text-xs text-muted-foreground mb-1">by {manga.author}</p>
        <div className="flex gap-1 mb-2 flex-wrap">
           {manga.genre.map((g: string) => <Badge key={g} variant="secondary" className="text-[10px]">{g}</Badge>)}
        </div>
        <div className="mt-auto flex justify-end">
            {/* Update link to actual indie manga reader page */}
            <Link href={`/community/manga/${manga.id}`} passHref legacyBehavior>
                <Button variant="link" size="sm" className="text-xs p-0 h-auto group-hover:underline text-primary">
                    Read Now <ArrowRight size={12} className="ml-1"/>
                </Button>
            </Link>
        </div>
      </CardContent>
     </Card>
);

// Card for community favorites (similar to homepage ItemCard)
const FavoriteItemCard = ({ item }: { item: FavoriteItem }) => {
    if (!item) return null;
    const linkHref = `/${item.type}/${item.id}`;

    return (
        <Link href={linkHref} passHref legacyBehavior>
            <a className="block w-36 md:w-40 flex-shrink-0 h-full snap-start group">
                <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 group-hover:scale-105 h-full flex flex-col">
                    <CardHeader className="p-0 relative aspect-[2/3] w-full overflow-hidden">
                        {item.imageUrl ? (
                            <Image
                                src={item.imageUrl}
                                alt={item.title}
                                fill
                                sizes="(max-width: 768px) 40vw, 160px"
                                className="object-cover transition-transform duration-300 group-hover:scale-110"
                                priority={false}
                                onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.id}/200/300?grayscale`; }}
                            />
                        ) : (
                            <div className="absolute inset-0 bg-muted flex items-center justify-center">
                                {item.type === 'anime' ? <Tv className="w-10 h-10 text-muted-foreground opacity-50" /> : <BookText className="w-10 h-10 text-muted-foreground opacity-50" />}
                            </div>
                        )}
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                         <div className="absolute bottom-1.5 left-2 right-2 z-10">
                            <CardTitle className="text-xs font-semibold text-primary-foreground line-clamp-2 shadow-text">{item.title}</CardTitle>
                         </div>
                         <Badge variant="secondary" className="absolute top-1 right-1 text-[10px] capitalize backdrop-blur-sm bg-background/60 px-1.5 py-0.5 z-10">
                           {item.type}
                         </Badge>
                    </CardHeader>
                     <CardContent className="p-2 flex flex-col flex-grow">
                         <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-auto pt-1 border-t border-border/50">
                             {(item as Anime).score && (
                                <span className="flex items-center gap-0.5" title="Score">
                                    <Star size={10} className="text-yellow-400" /> {((item as Anime).score ?? 0).toFixed(1)}
                                </span>
                             )}
                             {(item as Anime).year && (
                                <span className="flex items-center gap-0.5" title="Year">
                                    {/* Placeholder for year/status */}
                                    {(item as Anime).year}
                                </span>
                             )}
                              <span className="text-primary text-[10px] font-medium group-hover:underline">Details</span>
                         </div>
                     </CardContent>
                </Card>
            </a>
        </Link>
    );
};

const SkeletonFavoriteCard = () => (
    <Card className="overflow-hidden glass w-36 md:w-40 flex-shrink-0 h-full flex flex-col snap-start">
        <CardHeader className="p-0 relative aspect-[2/3] w-full">
            <Skeleton className="h-full w-full" />
        </CardHeader>
        <CardContent className="p-2 space-y-1">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="flex justify-between items-center pt-1 border-t border-border/50">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-4 w-10" />
            </div>
        </CardContent>
    </Card>
);

// --- Community Page Component ---

export default function CommunityPage() {
    const [communityFavorites, setCommunityFavorites] = useState<FavoriteItem[]>([]);
    const [loadingFavorites, setLoadingFavorites] = useState(true);
    const [errorFavorites, setErrorFavorites] = useState<string | null>(null);
    const { toast } = useToast();

    // Fetch community favorites (simulate with trending/popular data for now)
    useEffect(() => {
        const fetchFavorites = async () => {
            setLoadingFavorites(true);
            setErrorFavorites(null);
            try {
                // Fetch popular anime and manga as a proxy for community favorites
                const [animeResponse, mangaResponse] = await Promise.all([
                    getAnimes(undefined, undefined, undefined, undefined, undefined, 1, 'score', 10), // Fetch top 10 scored anime
                    getMangas(undefined, undefined, undefined, undefined, 1, 'score', 10) // Fetch top 10 scored manga
                ]);

                const mappedAnime = (animeResponse.animes || []).map(mapToFavoriteItem).filter((item): item is FavoriteItem => item !== null);
                const mappedManga = (mangaResponse.mangas || []).map(mapToFavoriteItem).filter((item): item is FavoriteItem => item !== null);

                // Combine and shuffle slightly for variety (or implement real voting logic)
                const combined = [...mappedAnime, ...mappedManga].sort(() => 0.5 - Math.random());

                setCommunityFavorites(combined.slice(0, 10)); // Take top 10 mixed
            } catch (err) {
                console.error("Error fetching community favorites data:", err);
                setErrorFavorites("Could not load community favorites.");
            } finally {
                setLoadingFavorites(false);
            }
        };

        fetchFavorites();
        // Optional: Set interval to refetch favorites periodically
        // const intervalId = setInterval(fetchFavorites, 10000); // Fetch every 10 seconds
        // return () => clearInterval(intervalId); // Cleanup interval on unmount
    }, []);

     // Helper to render a horizontally scrolling section (from homepage)
    const renderHorizontalSection = (
        title: string,
        icon: React.ElementType,
        items: FavoriteItem[] | undefined,
        isLoading: boolean,
        viewAllLink?: string,
        itemComponent: React.FC<{ item: FavoriteItem }> = FavoriteItemCard, // Default to FavoriteItemCard
        skeletonComponent: React.FC = SkeletonFavoriteCard, // Default skeleton
        error: string | null = null // Add error prop
    ) => {
        const displayItems = Array.isArray(items) ? items : [];

        return (
            <section className="mb-8 md:mb-12">
                <div className="flex items-center justify-between mb-3 md:mb-4 px-4 md:px-6 lg:px-8">
                    <h2 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
                        {React.createElement(icon, { className: "text-primary w-5 h-5 md:w-6 md:h-6" })} {title}
                    </h2>
                    {viewAllLink && displayItems.length > 0 && (
                        <Button variant="link" size="sm" asChild className="text-xs md:text-sm">
                            <Link href={viewAllLink}>View All <ArrowRight size={14} className="ml-1" /></Link>
                        </Button>
                    )}
                </div>
                 <div className="relative">
                  <div className={cn(
                      "flex space-x-3 md:space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent",
                      "pl-4 md:pl-6 lg:pl-8",
                      "snap-x snap-mandatory",
                      "pr-4 md:pr-6 lg:pr-8"
                      )}>
                     {isLoading && displayItems.length === 0
                        ? Array.from({ length: 6 }).map((_, index) => React.createElement(skeletonComponent, { key: `${title}-skel-${index}` }))
                        : displayItems.length > 0
                            ? displayItems.map((item, index) => React.createElement(itemComponent, { key: `${item.type}-${item.id}-${index}`, item: item }))
                            : error
                                ? <p className="text-center text-destructive italic px-4 py-5">{error}</p>
                                : !isLoading && <p className="text-center text-muted-foreground italic px-4 py-5">Nothing to show here right now.</p>}
                  </div>
                </div>
            </section>
        );
    };

  return (
    // Use ScrollArea for the entire page content to manage scrolling
    <ScrollArea className="h-full">
        <div className="container mx-auto px-4 py-8 space-y-12 md:space-y-16">

          {/* Section 1: Hero Area */}
          <section className="text-center relative overflow-hidden rounded-lg p-8 md:p-12 glass border-primary/20 shadow-xl backdrop-blur-xl bg-card/60">
               {/* Subtle background effect */}
                <div className="absolute inset-0 -z-10 opacity-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-blue-900/30"></div>
                </div>

              <Users className="w-12 h-12 mx-auto mb-4 text-primary neon-glow" />
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Shinra-Ani Community Hub</h1>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                 Connect with fellow fans, discover indie creators, and dive into discussions.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                 {dummyFeaturedCommunities.map((community) => (
                    <Link href={`/community/${community.id}`} key={community.id} className="block group">
                        <Card className="glass p-3 text-center transition-all duration-300 hover:scale-105 hover:bg-primary/10 border border-transparent hover:border-primary/30">
                             <Avatar className="h-10 w-10 mx-auto mb-1 border-2 border-primary/50 group-hover:border-primary transition-colors">
                                <AvatarImage src={community.imageUrl} alt={community.name} />
                                <AvatarFallback><community.icon size={16} /></AvatarFallback>
                            </Avatar>
                            <p className="text-xs font-semibold truncate group-hover:text-primary transition-colors">{community.name}</p>
                        </Card>
                    </Link>
                 ))}
              </div>
              <div className="mt-6 flex justify-center gap-3">
                  <Button size="lg" className="neon-glow-hover" asChild>
                      <Link href="#community-directory">Explore Communities</Link>
                  </Button>
                   <Button size="lg" variant="outline" className="glass neon-glow-hover" asChild>
                       <Link href="/upload">
                          <Upload size={18} className="mr-2"/> Upload Manga
                       </Link>
                   </Button>
              </div>
          </section>

           {/* NEW Section: Community Favorites */}
           {renderHorizontalSection(
               "Community Favorites",
               Trophy, // New icon
               communityFavorites,
               loadingFavorites,
               undefined, // Optional link to a dedicated favorites page
               FavoriteItemCard,
               SkeletonFavoriteCard,
               errorFavorites // Pass error state
           )}

           {/* Section 2: Top Interactions */}
           <section id="top-interactions">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                 <MessageCircle className="text-primary"/> Top Discussions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 {dummyTopComments.map((comment) => (
                    <Link href={`/community/${comment.communityId}#comment-${comment.id}`} key={comment.id} className="block group">
                         <Card className="glass p-4 flex flex-col group hover:bg-accent/10 transition-colors h-full">
                           <p className="text-sm text-foreground/90 mb-2 flex-grow">"{comment.text}"</p>
                           <div className="text-xs text-muted-foreground flex justify-between items-center mt-auto pt-2 border-t border-border/50">
                               <span>by <strong className="text-primary group-hover:underline">{comment.user}</strong> in <span className="italic">{comment.community}</span></span>
                               <span>{comment.timestamp}</span>
                           </div>
                         </Card>
                    </Link>
                 ))}
              </div>
           </section>

           <Separator className="bg-border/50"/>

          {/* Section 3: Community Directory */}
           <section id="community-directory">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-2xl font-semibold flex items-center gap-2">
                    <Compass className="text-primary"/> Community Directory
                 </h2>
                  {/* Update link/action for creating a community */}
                  <Button variant="outline" size="sm" className="glass neon-glow-hover" onClick={() => toast({ title: "Coming Soon!", description: "Community creation feature is under development."})}>
                      <PlusCircle size={16} className="mr-1.5"/> Create New
                  </Button>
              </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                   {dummyAllCommunities.map((community) => (
                       <CommunityCard key={community.id} community={community} />
                   ))}
               </div>
           </section>

           <Separator className="bg-border/50"/>

          {/* Section 4: Available Features */}
           <section id="features">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                 <List className="text-primary"/> What You Can Do Here
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {dummyFeatures.map((feature) => (
                       <FeatureCard key={feature.name} feature={feature} />
                  ))}
              </div>
           </section>

           <Separator className="bg-border/50"/>

           {/* Section 5: Upcoming Features & How-to Guides */}
           <section id="guides-and-upcoming" className="grid md:grid-cols-2 gap-8">
                {/* How-to Guides - Updated links */}
                <div>
                    <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><Info className="text-primary"/> How Does It Work?</h2>
                    <div className="space-y-3">
                         {/* Profile Creation Guide */}
                         <Card className="glass p-4 transition-colors hover:bg-accent/10">
                             <CardTitle className="text-base mb-1 flex items-center gap-1.5"><UserIcon size={16} className="text-primary"/> Setting Up Your Profile</CardTitle>
                            <CardDescription className="text-xs">Learn how to customize your profile, add an avatar, banner, and set your status.</CardDescription>
                            <Link href="/profile" passHref legacyBehavior>
                                <Button variant="link" size="sm" className="text-xs h-auto p-0 mt-1 text-primary">Go to Profile <ArrowRight size={12} className="ml-1"/></Button>
                             </Link>
                        </Card>
                         {/* Community Guide */}
                         <Card className="glass p-4 transition-colors hover:bg-accent/10">
                             <CardTitle className="text-base mb-1 flex items-center gap-1.5"><Users size={16} className="text-primary"/> Creating & Joining</CardTitle>
                            <CardDescription className="text-xs">Learn how to create your own community or find and join existing ones based on your interests.</CardDescription>
                            {/* Update link when guide page exists */}
                            <Button variant="link" size="sm" className="text-xs h-auto p-0 mt-1 text-primary opacity-50 cursor-not-allowed">Read Guide (Soon) <ArrowRight size={12} className="ml-1"/></Button>
                        </Card>
                         {/* Upload Guide */}
                         <Card className="glass p-4 transition-colors hover:bg-accent/10">
                             <CardTitle className="text-base mb-1 flex items-center gap-1.5"><Upload size={16} className="text-primary"/> Uploading Manga</CardTitle>
                            <CardDescription className="text-xs">Step-by-step guide on uploading your manga chapters, cover art, and details.</CardDescription>
                            <Link href="/upload" passHref legacyBehavior>
                                <Button variant="link" size="sm" className="text-xs h-auto p-0 mt-1 text-primary">Go to Upload Page <ArrowRight size={12} className="ml-1"/></Button>
                            </Link>
                        </Card>
                         {/* Chat Guide */}
                         <Card className="glass p-4 transition-colors hover:bg-accent/10">
                             <CardTitle className="text-base mb-1 flex items-center gap-1.5"><MessageSquare size={16} className="text-primary"/> Using Chat</CardTitle>
                            <CardDescription className="text-xs">Understand text/voice channels, private messages, and chat commands.</CardDescription>
                             {/* Update link when guide page exists */}
                             <Button variant="link" size="sm" className="text-xs h-auto p-0 mt-1 text-primary opacity-50 cursor-not-allowed">Read Guide (Soon) <ArrowRight size={12} className="ml-1"/></Button>
                        </Card>
                    </div>
                </div>

                 {/* Upcoming Features */}
                <div>
                   <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2"><Rocket className="text-primary"/> Upcoming Features</h2>
                   <Card className="glass p-4">
                        <ul className="space-y-2">
                           {dummyUpcomingFeatures.map((feature) => (
                               <li key={feature.name} className="flex justify-between items-center text-sm border-b border-border/30 pb-1.5 last:border-b-0">
                                   <span className="text-foreground/90">{feature.name}</span>
                                   <Badge variant="outline" className="text-xs">{feature.date}</Badge>
                               </li>
                           ))}
                        </ul>
                   </Card>
                </div>
           </section>

           <Separator className="bg-border/50"/>

           {/* Section 6: Featured Indie Manga */}
           <section id="featured-indie">
               <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                  <BookText className="text-primary"/> Featured Indie Manga
               </h2>
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                   {dummyIndieManga.slice(0, 5).map((manga) => (
                       <IndieMangaCard key={manga.id} manga={manga} />
                   ))}
               </div>
               {/* Optional: Link to a dedicated Indie Manga browse page */}
               <div className="mt-4 text-center">
                   <Button variant="outline" className="glass neon-glow-hover" onClick={() => toast({ title: "Coming Soon!", description: "A dedicated page for browsing all Indie Manga is planned."})}>
                       Browse All Indie Manga
                   </Button>
               </div>
           </section>

        </div>

         {/* Footer-like section */}
         <footer className="text-center py-8 mt-12 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
                Shinra-Ani Community Hub - &copy; {new Date().getFullYear()}
            </p>
        </footer>
    </ScrollArea>
  );
}
