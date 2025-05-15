
// src/app/community/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    BookText,
    Compass,
    MessageCircle as MessageCircleIcon,
    PlusCircle,
    Swords,
    Flame,
    Sparkles,
    Heart,
    Rocket,
    List,
    Info,
    User as UserIcon,
    Upload,
    ArrowRight,
    Trophy,
    Loader2,
    AlertCircle,
    Tv,
    Star,
    Settings,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { getMangas, Manga } from '@/services/manga'; 
import { getAnimes, Anime } from '@/services/anime'; 
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getCommunities, createCommunity, Community } from '@/services/community';
import CreateCommunityModal from '@/components/community/CreateCommunityModal';
import { useAuth } from '@/hooks/useAuth';
import Footer from '@/components/layout/Footer'; 
import { ItemCard, SkeletonItemCard, BannerCard, SkeletonBannerCard } from '@/components/shared/ItemCard';


// --- Interfaces ---
type FavoriteItem = (Anime | Manga) & {
    id: number; 
    mal_id: number;
    type: 'anime' | 'manga';
    imageUrl: string | null;
    title: string; 
    score?: number | null;
    year?: number | null;
    status?: string | null; 
    episodes?: number | null; 
    chapters?: number | null; 
    volumes?: number | null; 
    synopsis?: string | null; 
    genres?: { name: string; mal_id: number }[];
};


const dummyFeatures: Feature[] = [
    { name: 'Indie Manga Uploads', description: 'Share your original manga creations.', icon: Upload, link: '/upload' },
    { name: 'Text & Voice Chat', description: 'Real-time discussion rooms.', icon: MessageCircleIcon, link: '#community-directory' },
    { name: 'Community Creation', description: 'Start your own themed community.', icon: Users, link: '#' }, 
    { name: 'Nami AI Integration', description: 'AI-powered chat and recommendations.', icon: Sparkles, link: '#' }, 
    { name: 'Profile Customization', description: 'Personalize your Shinra-Ani identity.', icon: UserIcon, link: '/profile' },
    { name: 'Events & Competitions', description: 'Join community challenges.', icon: Swords, link: '#' }, 
];

const dummyUpcomingFeatures: UpcomingFeature[] = [
    { name: 'Creator Subscriptions', date: 'Soon™' },
    { name: 'Advanced Moderation Tools', date: 'Q4 2024' },
    { name: 'Live Watch Parties', date: 'TBD' },
];

interface IndieManga {
    id: number;
    title: string;
    author: string;
    imageUrl: string;
    genre: string[];
}

const dummyIndieManga: IndieManga[] = [
    { id: 1, title: 'Galactic Gourmet', author: 'CosmoChef', imageUrl: 'https://placehold.co/200x300.png?text=Indie1', genre: ['Sci-Fi', 'Cooking'] },
    { id: 2, title: 'Urban Necromancer', author: 'GraveWalker', imageUrl: 'https://placehold.co/200x300.png?text=Indie2', genre: ['Fantasy', 'Urban'] },
    { id: 3, title: 'Mecha Gardeners', author: 'PlantBot', imageUrl: 'https://placehold.co/200x300.png?text=Indie3', genre: ['Mecha', 'Slice of Life'] },
    { id: 4, title: 'Samurai Squirrel', author: 'BushidoBlade', imageUrl: 'https://placehold.co/200x300.png?text=Indie4', genre: ['Action', 'Animals'] },
    { id: 5, title: 'Pixel Paladins', author: 'RetroKnight', imageUrl: 'https://placehold.co/200x300.png?text=Indie5', genre: ['Fantasy', 'Gaming'] },
    { id: 6, title: 'Neon Noir', author: 'CyberSleuth', imageUrl: 'https://placehold.co/200x300.png?text=Indie6', genre: ['Sci-Fi', 'Mystery'] },
];

interface Comment {
    id: string;
    user: string;
    community: string;
    text: string;
    timestamp: string;
    communityId: string;
}

const dummyTopComments: Comment[] = [
    { id: 'c1', user: 'GutsBestBoy', community: 'Berserk Fans', text: "Just reread the Golden Age arc... masterpiece.", timestamp: "2h ago", communityId: 'berserk-fans' },
    { id: 'c2', user: 'ShinraFanatic', community: 'Action Hub', text: "That new mecha anime trailer looks insane!", timestamp: "5h ago", communityId: 'action-hub' },
    { id: 'c3', user: 'IsekaiDreamer', community: 'Isekai Tavern', text: "Reincarnated as a vending machine, AMA.", timestamp: "1d ago", communityId: 'isekai-tavern' },
];

interface Feature {
    name: string;
    description: string;
    icon: React.ElementType;
    link?: string;
}

interface UpcomingFeature {
    name: string;
    date: string;
}

const CommunityCard = ({ community }: { community: Community }) => {
    const { toast } = useToast();
    const { user } = useAuth(); 

    const handleJoin = (e: React.MouseEvent) => {
        e.preventDefault(); 
        e.stopPropagation(); 
        if (!user) {
            toast({ title: "Login Required", description: "Please log in to join communities.", variant: "destructive" });
            return;
        }
        toast({
            title: "Joining Community...",
            description: `Successfully joined ${community.name}! (Simulation)`,
            variant: "default",
        });
    };

    const IconComponent =
        community.name.toLowerCase().includes('action') ? Swords :
            community.name.toLowerCase().includes('berserk') ? Flame :
                community.name.toLowerCase().includes('isekai') ? Sparkles :
                    community.name.toLowerCase().includes('romance') ? Heart :
                        community.name.toLowerCase().includes('sci-fi') ? Rocket :
                            community.name.toLowerCase().includes('creator') ? BookText :
                                Users; 

    return (
        <Link href={`/community/${community.id}`} className="block group h-full">
            <Card className="glass neon-glow-hover h-full flex flex-col transition-all duration-300 hover:border-primary/50 group p-3 sm:p-4 rounded-lg">
                <CardHeader className="flex flex-row items-center gap-3 p-0 mb-2 sm:mb-3">
                    <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-primary/30 group-hover:border-primary transition-colors flex-shrink-0 rounded-md">
                        {community.imageUrl ? (
                            <AvatarImage src={community.imageUrl} alt={community.name} className="rounded-md" />
                        ) : (
                            <AvatarFallback className="rounded-md bg-muted"><IconComponent size={16} className="text-muted-foreground"/></AvatarFallback>
                        )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm sm:text-base group-hover:text-primary transition-colors truncate">{community.name}</CardTitle>
                        <CardDescription className="text-xs line-clamp-2">{community.description}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-0 mt-auto flex justify-between items-center">
                    {community.memberCount != null && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users size={12} /> {community.memberCount.toLocaleString()}
                        </span>
                    )}
                    <Button variant="link" size="sm" className="text-xs h-auto p-0 group-hover:underline text-primary z-10" onClick={handleJoin}>
                        Join <PlusCircle size={12} className="ml-1" />
                    </Button>
                </CardContent>
            </Card>
        </Link>
    );
};

const FeatureCard = ({ feature }: { feature: Feature }) => (
    <Link href={feature.link || '#'} className="block h-full">
        <Card className="glass rounded-lg h-full flex flex-col p-4 items-center text-center transition-transform duration-300 hover:scale-105 border border-transparent hover:border-primary/30">
            <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 mb-2 text-primary" />
            <CardTitle className="text-xs sm:text-sm font-semibold mb-1">{feature.name}</CardTitle>
            <CardDescription className="text-[11px] sm:text-xs">{feature.description}</CardDescription>
        </Card>
    </Link>
);

const IndieMangaCard = ({ manga }: { manga: IndieManga }) => (
    <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 hover:scale-[1.02] group h-full flex flex-col border-primary/10 hover:border-primary/30 rounded-lg">
      <CardHeader className="p-0 relative aspect-[2/3] w-full">
        <Image
          src={manga.imageUrl || 'https://placehold.co/200x300.png?text=Indie'}
          alt={manga.title}
          fill
          sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 18vw" 
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          data-ai-hint="manga cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
         <div className="absolute bottom-1 left-2 right-2 z-10"> 
           <CardTitle className="text-xs sm:text-sm font-semibold text-primary-foreground line-clamp-1 shadow-text group-hover:text-primary transition-colors">{manga.title}</CardTitle>
         </div>
      </CardHeader>
      <CardContent className="p-2 sm:p-3 flex flex-col flex-grow"> 
        <p className="text-[11px] sm:text-xs text-muted-foreground mb-1">by {manga.author}</p>
        <div className="flex gap-1 mb-1 sm:mb-2 flex-wrap"> 
           {manga.genre.map((g: string) => <Badge key={g} variant="secondary" className="text-[10px] px-1 sm:px-1.5">{g}</Badge>)}
        </div>
        <div className="mt-auto flex justify-end">
            <Link href={`/manga/indie/${manga.id}`} passHref legacyBehavior>
                 <a> 
                   <Button variant="link" size="sm" className="text-xs p-0 h-auto group-hover:underline text-primary">
                       Read Now <ArrowRight size={12} className="ml-1"/>
                   </Button>
                </a>
            </Link>
        </div>
      </CardContent>
     </Card>
);

const mapToFavoriteItem = (item: Anime | Manga): FavoriteItem | null => {
    if (!item || typeof item.mal_id !== 'number') return null;
    const isAnime = 'episodes' in item;
    return {
        ...item,
        id: item.mal_id,
        mal_id: item.mal_id,
        type: isAnime ? 'anime' : 'manga',
        imageUrl: item.images?.jpg?.large_image_url ?? item.images?.webp?.large_image_url ?? item.images?.jpg?.image_url ?? null,
        title: item.title_english || item.title,
        description: item.synopsis,
        year: item.year ?? (isAnime ? (item.aired?.from ? new Date(item.aired.from).getFullYear() : null) : (item.published?.from ? new Date(item.published.from).getFullYear() : null)),
        score: item.score,
        episodes: isAnime ? item.episodes : undefined,
        chapters: !isAnime ? item.chapters : undefined,
        status: item.status,
        genres: item.genres,
    };
};

const renderHorizontalSection = (
    title: string,
    icon: React.ElementType,
    items: FavoriteItem[], 
    isLoading: boolean,
    viewAllLink?: string,
    itemComponent: React.FC<{ item: FavoriteItem }> = ItemCard, 
    skeletonComponent: React.FC = SkeletonItemCard 
) => {
    const validItems = Array.isArray(items) ? items : [];

    return (
        <section className="mb-6 md:mb-10"> 
            <div className="flex items-center justify-between mb-2 md:mb-3 px-4 sm:px-6">
                <h2 className="text-lg md:text-xl font-semibold flex items-center gap-1.5 sm:gap-2"> 
                    {React.createElement(icon, { className: "text-primary w-4 h-4 sm:w-5 sm:h-5" })} {title}
                </h2>
                {viewAllLink && validItems.length > 0 && (
                    <Button variant="link" size="sm" asChild className="text-xs md:text-sm">
                        <Link href={viewAllLink}>View All <ArrowRight size={14} className="ml-1" /></Link>
                    </Button>
                )}
            </div>
             <div className="relative">
              <div className={cn(
                  "flex space-x-2 sm:space-x-3 overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent", 
                  "pl-4 sm:pl-6", 
                  "snap-x snap-mandatory",
                  "pr-4 sm:pr-6" 
                  )}>
                {isLoading && validItems.length === 0
                    ? Array.from({ length: itemComponent === BannerCard ? 3 : 5 }).map((_, index) => React.createElement(skeletonComponent, { key: `${title}-skel-${index}` }))
                    : validItems.length > 0
                        ? validItems.map((item, index) => item && item.id ? React.createElement(itemComponent, { key: `${item.type}-${item.id}-${index}`, item: item }) : null)
                        : !isLoading && <p className="w-full text-center text-muted-foreground italic px-4 py-4 text-sm">Nothing to show here right now.</p>}
              </div>
            </div>
        </section>
    );
};

export default function CommunityPage() {
    const [communityFavorites, setCommunityFavorites] = useState<FavoriteItem[]>([]);
    const [loadingFavorites, setLoadingFavorites] = useState(true);
    const [errorFavorites, setErrorFavorites] = useState<string | null>(null);
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loadingCommunities, setLoadingCommunities] = useState(true);
    const [errorCommunities, setErrorCommunities] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { user, userProfile } = useAuth(); 

    const { toast } = useToast();

    const fetchFavorites = useCallback(async () => {
        setLoadingFavorites(true);
        setErrorFavorites(null);
        try {
            const [animeResponse, mangaResponse] = await Promise.all([
                getAnimes(undefined, undefined, undefined, undefined, undefined, 1, 'popularity', 10),
                getMangas(undefined, undefined, undefined, undefined, 1, 'popularity', 10)
            ]);

             const mappedAnime = (animeResponse.animes || []).map(mapToFavoriteItem).filter((item): item is FavoriteItem => item !== null);
             const mappedManga = (mangaResponse.mangas || []).map(mapToFavoriteItem).filter((item): item is FavoriteItem => item !== null);

            const combined = [...mappedAnime, ...mappedManga].sort(() => 0.5 - Math.random());
            setCommunityFavorites(combined.slice(0, 10)); 

        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "An unknown error occurred";
            console.error("Error fetching community favorites data:", err);
            setErrorFavorites(`Could not load community favorites: ${errorMsg}`);
            toast({
                title: "Error Loading Favorites",
                description: errorMsg,
                variant: "destructive",
            });
        } finally {
            setLoadingFavorites(false);
        }
    }, [toast]); 


    const fetchAllCommunities = useCallback(async () => {
        setLoadingCommunities(true);
        setErrorCommunities(null);
        try {
            const fetchedCommunities = await getCommunities();
            setCommunities(fetchedCommunities);
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : "An unknown error occurred";
            console.error("Error fetching communities:", err);
            setErrorCommunities(`Could not load communities: ${errorMsg}`);
            toast({
                title: "Error Loading Communities",
                description: errorMsg,
                variant: "destructive",
            });
        } finally {
            setLoadingCommunities(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchFavorites(); 
        fetchAllCommunities(); 
    }, [fetchFavorites, fetchAllCommunities]);

    const handleCommunityCreated = (newCommunity: Community) => {
        setCommunities(prev => [...prev, newCommunity].sort((a,b) => {
            const timeA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : new Date(a.createdAt as any).getTime();
            const timeB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : new Date(b.createdAt as any).getTime();
            return timeB - timeA;
        }));
        setIsCreateModalOpen(false); 
    };

    const guides = {
         profile: { title: "Setting Up Your Profile", description: "Learn how to customize your profile, add an avatar, banner, and set your status.", link: "/profile" },
         community: { title: "Creating & Joining", description: "Learn how to create your own community or find and join existing ones based on your interests.", link: "#" }, 
         upload: { title: "Uploading Manga", description: "Step-by-step guide on uploading your manga chapters, cover art, and details.", link: "/upload" },
    };

    // Determine if create community button should be enabled
    const canCreateCommunity = userProfile && 
        (userProfile.subscriptionTier === 'ignition' || 
         userProfile.subscriptionTier === 'hellfire' || 
         userProfile.subscriptionTier === 'burstdrive');


    return (
        <>
            <ScrollArea className="h-full">
                <div className="container mx-auto px-0 sm:px-4 py-6 sm:py-8 space-y-8 md:space-y-12">

                    <section className="text-center relative overflow-hidden rounded-lg p-8 md:p-12 glass border-primary/20 shadow-xl backdrop-blur-xl bg-card/60 mx-2 sm:mx-0">
                        <div className="absolute inset-0 -z-10 opacity-10">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-accent/30"></div> {/* Use new accent */}
                        </div>

                        <Users className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-accent neon-glow fiery-glow-icon" /> 
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-primary">Shinra-Ani Community Hub</h1> 
                        <p className="text-sm sm:text-base md:text-lg text-muted-foreground mb-4 sm:mb-6 max-w-xl md:max-w-2xl mx-auto"> 
                            Connect with fellow fans, discover indie creators, and dive into discussions.
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 max-w-xs sm:max-w-3xl mx-auto">
                            {loadingCommunities
                                ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={`feat-skel-${i}`} className="h-24 sm:h-28 glass rounded-lg" />)
                                : communities.slice(0, 4).map((community) => (
                                    <Link href={`/community/${community.id}`} key={community.id} className="block group">
                                        <Card className="glass p-2 sm:p-3 text-center transition-all duration-300 hover:scale-105 hover:bg-accent/10 border border-transparent hover:border-accent/30 rounded-lg"> 
                                            <Avatar className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-1 border-2 border-accent/50 group-hover:border-accent transition-colors rounded-md"> 
                                                {community.imageUrl ? (
                                                    <AvatarImage src={community.imageUrl} alt={community.name} className="rounded-md"/>
                                                ) : (
                                                    <AvatarFallback className="rounded-md bg-muted"><Users size={14} className="text-muted-foreground"/></AvatarFallback>
                                                )}
                                            </Avatar>
                                            <p className="text-[10px] sm:text-xs font-semibold truncate group-hover:text-accent transition-colors">{community.name}</p>
                                        </Card>
                                    </Link>
                                ))}
                        </div>
                        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center gap-2 sm:gap-3">
                            <Button size="lg" className="bg-accent text-accent-foreground fiery-glow-hover" asChild>
                                <Link href="#community-directory">Explore Communities</Link>
                            </Button>
                            <Button size="lg" variant="outline" className="glass neon-glow-hover" asChild>
                                <Link href="/upload">
                                    <Upload size={18} className="mr-1 sm:mr-2" /> Upload Manga
                                </Link>
                            </Button>
                        </div>
                    </section>

                     {renderHorizontalSection(
                         "Community Favorites",
                         Trophy,
                         communityFavorites,
                         loadingFavorites,
                         undefined, 
                         ItemCard, 
                         SkeletonItemCard
                     )}
                     {errorFavorites && (
                         <Alert variant="destructive" className="mx-4 sm:mx-6">
                             <AlertCircle className="h-4 w-4" />
                             <AlertTitle>Error Loading Favorites</AlertTitle>
                             <AlertDescription>{errorFavorites}</AlertDescription>
                         </Alert>
                     )}

                    <section id="top-interactions" className="px-4 sm:px-6">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                            <MessageCircleIcon className="text-primary w-4 h-4 sm:w-5 sm:h-5" /> Top Discussions
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                            {dummyTopComments.map((comment) => (
                                <Link href={`/community/${comment.communityId}?comment=${comment.id}`} key={comment.id} className="block group">
                                    <Card className="glass p-3 sm:p-4 flex flex-col group hover:bg-accent/10 transition-colors h-full rounded-lg"> 
                                        <p className="text-xs sm:text-sm text-foreground/90 mb-2 flex-grow">"{comment.text}"</p>
                                        <div className="text-[10px] sm:text-xs text-muted-foreground flex justify-between items-center mt-auto pt-2 border-t border-border/50">
                                            <span>by <strong className="text-primary group-hover:underline">{comment.user}</strong> in <span className="italic">{comment.community}</span></span>
                                            <span>{comment.timestamp}</span>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                            {dummyTopComments.length === 0 && !loadingCommunities && (
                                <p className="col-span-full text-center text-muted-foreground italic py-4">No recent discussions to show.</p>
                            )}
                        </div>
                    </section>

                    <Separator className="bg-border/50 mx-4 sm:mx-6" />

                    <section id="community-directory" className="px-4 sm:px-6">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold flex items-center gap-1.5 sm:gap-2">
                                <Compass className="text-primary w-4 h-4 sm:w-5 sm:h-5" /> Community Directory
                            </h2>
                            <Button
                                variant="outline"
                                size="sm"
                                className="glass fiery-glow-hover" // Changed to fiery glow
                                onClick={() => {
                                    if (!user) {
                                        toast({ title: "Login Required", description: "Please log in to create a community.", variant: "destructive" });
                                        return;
                                    }
                                    if (!canCreateCommunity) {
                                        toast({ title: "Tier Restriction", description: "Upgrade to Ignition Tier or higher to create communities.", variant: "destructive" });
                                        return;
                                    }
                                    setIsCreateModalOpen(true);
                                }}
                                disabled={!user || !canCreateCommunity && !!userProfile} // Disable if not logged in, or logged in but not sufficient tier (and profile loaded)
                                title={!user ? "Login to create" : !canCreateCommunity && !!userProfile ? "Upgrade to Ignition Tier or higher" : "Create a new community"}
                            >
                                <PlusCircle size={16} className="mr-1 sm:mr-1.5" /> Create
                            </Button>
                        </div>
                        {loadingCommunities && (
                            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={`com-skel-${i}`} className="h-40 glass rounded-lg" />)}
                            </div>
                        )}
                        {errorCommunities && !loadingCommunities && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error Loading Communities</AlertTitle>
                                <AlertDescription>{errorCommunities}</AlertDescription>
                            </Alert>
                        )}
                        {!loadingCommunities && !errorCommunities && communities.length > 0 && (
                            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"> {/* Added xs breakpoint */}
                                {communities.map((community) => (
                                    <CommunityCard key={community.id} community={community} />
                                ))}
                            </div>
                        )}
                        {!loadingCommunities && !errorCommunities && communities.length === 0 && (
                            <p className="col-span-full text-center text-muted-foreground italic py-8">No communities found. Why not create one?</p>
                        )}
                    </section>

                    <Separator className="bg-border/50 mx-4 sm:mx-6" />

                    <section id="features" className="px-4 sm:px-6">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                            <List className="text-primary w-4 h-4 sm:w-5 sm:h-5" /> What You Can Do Here
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 sm:gap-4"> {/* Changed md:grid-cols-4 to md:grid-cols-3 */}
                            {dummyFeatures.map((feature) => (
                                <FeatureCard key={feature.name} feature={feature} />
                            ))}
                        </div>
                    </section>

                    <Separator className="bg-border/50 mx-4 sm:px-6" />

                    <section id="guides-and-upcoming" className="grid md:grid-cols-2 gap-6 sm:gap-8 px-4 sm:px-6">
                        <div>
                            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2"><Info className="text-primary w-4 h-4 sm:w-5 sm:h-5" /> How Does It Work?</h2>
                            <div className="space-y-3">
                                <Card className="glass p-3 sm:p-4 transition-colors hover:bg-accent/10 rounded-lg"> 
                                    <CardTitle className="text-sm sm:text-base mb-1 flex items-center gap-1 sm:gap-1.5"><UserIcon size={16} className="text-primary" /> {guides.profile.title}</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">{guides.profile.description}</CardDescription>
                                    <Link href={guides.profile.link} passHref >
                                         <Button variant="link" size="sm" className="text-xs h-auto p-0 mt-1 text-primary">Go to Profile <ArrowRight size={12} className="ml-1" /></Button>
                                    </Link>
                                </Card>
                                <Card className="glass p-3 sm:p-4 transition-colors hover:bg-accent/10 rounded-lg"> 
                                    <CardTitle className="text-sm sm:text-base mb-1 flex items-center gap-1 sm:gap-1.5"><Users size={16} className="text-primary" /> {guides.community.title}</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">{guides.community.description}</CardDescription>
                                     <Button variant="link" size="sm" className="text-xs h-auto p-0 mt-1 text-primary opacity-50 cursor-not-allowed">Read Guide (Soon) <ArrowRight size={12} className="ml-1" /></Button>
                                </Card>
                                <Card className="glass p-3 sm:p-4 transition-colors hover:bg-accent/10 rounded-lg"> 
                                    <CardTitle className="text-sm sm:text-base mb-1 flex items-center gap-1 sm:gap-1.5"><Upload size={16} className="text-primary" /> {guides.upload.title}</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm">{guides.upload.description}</CardDescription>
                                    <Link href={guides.upload.link} passHref >
                                        <Button variant="link" size="sm" className="text-xs h-auto p-0 mt-1 text-primary">Go to Upload Page <ArrowRight size={12} className="ml-1" /></Button>
                                    </Link>
                                </Card>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2"><Rocket className="text-primary w-4 h-4 sm:w-5 sm:h-5" /> Upcoming Features</h2>
                            <Card className="glass p-3 sm:p-4 rounded-lg"> 
                                <ul className="space-y-2">
                                    {dummyUpcomingFeatures.map((feature) => (
                                        <li key={feature.name} className="flex justify-between items-center text-xs sm:text-sm border-b border-border/30 pb-1.5 last:border-b-0">
                                            <span className="text-foreground/90">{feature.name}</span>
                                            <Badge variant="outline" className="text-[10px] sm:text-xs">{feature.date}</Badge>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        </div>
                    </section>

                    <Separator className="bg-border/50 mx-4 sm:mx-6" />

                    <section id="featured-indie" className="px-4 sm:px-6">
                        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                            <BookText className="text-primary w-4 h-4 sm:w-5 sm:h-5" /> Featured Indie Manga
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                            {dummyIndieManga.slice(0, 5).map((manga) => (
                                <IndieMangaCard key={manga.id} manga={manga} />
                            ))}
                            {dummyIndieManga.length === 0 && (
                                <p className="col-span-full text-center text-muted-foreground italic py-8">No indie manga featured yet.</p>
                            )}
                        </div>
                        <div className="mt-4 text-center">
                            <Button variant="outline" size="sm" className="glass neon-glow-hover sm:size-auto" onClick={() => toast({ title: "Coming Soon!", description: "A dedicated page for browsing all Indie Manga is planned."})}> {/* Adjusted size for sm */}
                                Browse All Indie Manga
                            </Button>
                        </div>
                    </section>
                </div>
                <Footer />
            </ScrollArea>

            <CreateCommunityModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCommunityCreated}
            />
        </>
    );
}

    