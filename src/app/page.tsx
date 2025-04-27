'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { getAnimes, getMangas, Anime, Manga, AnimeResponse, MangaResponse } from '@/services'; // Updated imports
import { Sparkles, AlertCircle, Tv, BookText, Star, TrendingUp, Clock, CalendarDays, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils'; // Import cn utility

// Define a unified type for items displayed on the homepage
type DisplayItem = (Anime | Manga) & {
    id: number; // Consistent ID field (mapped from mal_id)
    type: 'anime' | 'manga';
    imageUrl: string | null; // Derived image URL
    description?: string | null; // Synopsis mapped here
    // Add other common fields if needed
};

// Helper to map Anime/Manga service types to DisplayItem
const mapToDisplayItem = (item: Anime | Manga): DisplayItem | null => {
    if (!item || typeof item.mal_id !== 'number') return null;
    return {
        ...item,
        id: item.mal_id,
        type: 'episodes' in item ? 'anime' : 'manga',
        imageUrl: item.images?.jpg?.large_image_url ?? item.images?.jpg?.image_url ?? null,
        description: item.synopsis,
        // Ensure year is mapped if available (used in cards)
        year: item.year ?? (item.published?.from ? new Date(item.published.from).getFullYear() : null),
    };
};

// --- Components ---

// Item Card for regular sections (horizontal scroll)
const ItemCard = ({ item }: { item: DisplayItem }) => {
    if (!item) return null;
    const linkHref = `/${item.type}/${item.id}`;

    return (
        <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 hover:scale-105 group w-40 md:w-48 flex-shrink-0 h-full flex flex-col"> {/* Fixed width for horizontal scroll */}
            <CardHeader className="p-0 relative aspect-[2/3] w-full overflow-hidden">
                {item.imageUrl ? (
                    <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 40vw, 192px" // Adjusted sizes
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        priority={false} // Lower priority for non-banner images
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.id}/200/300?grayscale`; }}
                    />
                ) : (
                    <div className="absolute inset-0 bg-muted flex items-center justify-center">
                        {item.type === 'anime' ? <Tv className="w-10 h-10 text-muted-foreground opacity-50" /> : <BookText className="w-10 h-10 text-muted-foreground opacity-50" />}
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
                <div className="absolute bottom-1.5 left-2 right-2">
                    <CardTitle className="text-xs font-semibold text-primary-foreground line-clamp-2 shadow-text">{item.title}</CardTitle>
                </div>
                 <Badge variant="secondary" className="absolute top-1 right-1 text-[10px] capitalize backdrop-blur-sm bg-background/60 px-1.5 py-0.5">
                   {item.type}
                 </Badge>
            </CardHeader>
             <CardContent className="p-2 flex flex-col flex-grow"> {/* Reduced padding */}
                 <div className="flex justify-between items-center text-[10px] text-muted-foreground mt-auto pt-1 border-t border-border/50">
                     {item.score && (
                        <span className="flex items-center gap-0.5" title="Score">
                            <Star size={10} className="text-yellow-400" /> {item.score.toFixed(1)}
                        </span>
                     )}
                     {item.year && (
                        <span className="flex items-center gap-0.5" title="Year">
                            <CalendarDays size={10} /> {item.year}
                        </span>
                     )}
                     <Button variant="link" size="sm" asChild className="text-[10px] p-0 h-auto">
                         <Link href={linkHref}>Details</Link>
                     </Button>
                 </div>
             </CardContent>
        </Card>
    );
};

// Banner Card for Nami's Picks (horizontal scroll)
const BannerCard = ({ item }: { item: DisplayItem }) => {
    if (!item) return null;
    const linkHref = `/${item.type}/${item.id}`;

    return (
        <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 hover:scale-[1.02] group w-80 md:w-96 flex-shrink-0 relative aspect-video h-auto"> {/* Banner aspect ratio */}
             <div className="absolute inset-0">
                {item.imageUrl ? (
                    <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 80vw, 384px" // Adjusted sizes for banner
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        priority // Higher priority for banner images
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.id}/600/340?grayscale`; }}
                    />
                ) : (
                    <div className="absolute inset-0 bg-muted flex items-center justify-center">
                        {item.type === 'anime' ? <Tv className="w-16 h-16 text-muted-foreground opacity-50" /> : <BookText className="w-16 h-16 text-muted-foreground opacity-50" />}
                    </div>
                )}
            </div>
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent pointer-events-none"></div>

            {/* Content positioned at the bottom */}
            <CardContent className="absolute bottom-0 left-0 right-0 p-4 z-10 flex justify-between items-end">
                 <div className="space-y-1">
                    <Badge variant="secondary" className="capitalize text-xs backdrop-blur-sm bg-background/60">{item.type}</Badge>
                    <CardTitle className="text-lg font-bold text-primary-foreground line-clamp-1 shadow-text">{item.title}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground line-clamp-2 shadow-text">{item.description || 'Check it out!'}</CardDescription>
                 </div>
                 <Button variant="outline" size="sm" asChild className="glass neon-glow-hover shrink-0">
                     <Link href={linkHref}>
                         View Details <ArrowRight size={14} className="ml-1" />
                     </Link>
                 </Button>
            </CardContent>
        </Card>
    );
};

// Skeleton Card for regular sections
const SkeletonItemCard = () => (
    <Card className="overflow-hidden glass w-40 md:w-48 flex-shrink-0 h-full flex flex-col">
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

// Skeleton Card for Banner section
const SkeletonBannerCard = () => (
    <Card className="overflow-hidden glass w-80 md:w-96 flex-shrink-0 relative aspect-video h-auto">
         <Skeleton className="absolute inset-0" />
         <CardContent className="absolute bottom-0 left-0 right-0 p-4 z-10 flex justify-between items-end">
             <div className="space-y-1 flex-grow mr-4">
                 <Skeleton className="h-4 w-16 mb-1" />
                 <Skeleton className="h-6 w-3/4 mb-1" />
                 <Skeleton className="h-3 w-full" />
                 <Skeleton className="h-3 w-5/6" />
             </div>
             <Skeleton className="h-8 w-24 shrink-0" />
         </CardContent>
    </Card>
);


// --- Main Page Component ---

export default function Home() {
    const [trendingAnime, setTrendingAnime] = useState<Anime[]>([]);
    const [trendingManga, setTrendingManga] = useState<Manga[]>([]);
    const [popularAnime, setPopularAnime] = useState<Anime[]>([]);
    const [popularManga, setPopularManga] = useState<Manga[]>([]);
    const [airingAnime, setAiringAnime] = useState<Anime[]>([]);
    const [upcomingAnime, setUpcomingAnime] = useState<Anime[]>([]);
    const [namiPicks, setNamiPicks] = useState<DisplayItem[]>([]); // Unified type for picks

    const [loading, setLoading] = useState({
        trending: true,
        popular: true,
        airing: true,
        upcoming: true,
        nami: true,
    });
    const [error, setError] = useState<string | null>(null);


    // Fetch initial data
    const fetchInitialData = useCallback(async () => {
        setLoading(prev => ({ ...prev, trending: true, popular: true, airing: true, upcoming: true, nami: true }));
        setError(null);

        try {
            // Fetch standard sections concurrently
            const results = await Promise.allSettled([
                getAnimes(undefined, undefined, undefined, undefined, undefined, 1, 'popularity', 10), // Trending Anime (limit 10 for scroll)
                getMangas(undefined, undefined, undefined, undefined, 1, 'popularity', 10), // Trending Manga (limit 10)
                getAnimes(undefined, undefined, undefined, undefined, undefined, 1, 'score', 10),      // Popular Anime (limit 10)
                getMangas(undefined, undefined, undefined, undefined, 1, 'score', 10),      // Popular Manga (limit 10)
                getAnimes(undefined, undefined, undefined, undefined, 'airing', 1, 'popularity', 10), // Airing Anime (limit 10)
                getAnimes(undefined, undefined, undefined, undefined, 'upcoming', 1, 'popularity', 10), // Upcoming Anime (limit 10)
                 // Placeholder for Nami's Picks - Replace with AI call if implemented
                 // aiDrivenHomepage({ userProfile: "...", currentMood: "...", recentActivity: [] })
                 Promise.resolve({ // Mock Nami's picks - Fetch actual ones when AI flow is ready
                    personalizedAnime: (await getAnimes(undefined, undefined, 7, undefined, undefined, 1, 'score', 3)).animes,
                    personalizedManga: (await getMangas(undefined, undefined, undefined, 7, 1, 'score', 3)).mangas,
                    reasoning: "Based on general high scores and variety." // Mock reasoning
                 })
            ]);

            // Process results
            if (results[0].status === 'fulfilled') {
                setTrendingAnime(results[0].value.animes);
                setLoading(prev => ({ ...prev, trending: false }));
            } else console.error("Failed fetching trending anime:", results[0].reason);

            if (results[1].status === 'fulfilled') {
                setTrendingManga(results[1].value.mangas);
            } else console.error("Failed fetching trending manga:", results[1].reason);

            if (results[2].status === 'fulfilled') {
                setPopularAnime(results[2].value.animes);
                 setLoading(prev => ({ ...prev, popular: false }));
            } else console.error("Failed fetching popular anime:", results[2].reason);

            if (results[3].status === 'fulfilled') {
                setPopularManga(results[3].value.mangas);
            } else console.error("Failed fetching popular manga:", results[3].reason);

            if (results[4].status === 'fulfilled') {
                 setAiringAnime(results[4].value.animes);
                 setLoading(prev => ({ ...prev, airing: false }));
            } else console.error("Failed fetching airing anime:", results[4].reason);

             if (results[5].status === 'fulfilled') {
                 setUpcomingAnime(results[5].value.animes);
                 setLoading(prev => ({ ...prev, upcoming: false }));
             } else console.error("Failed fetching upcoming anime:", results[5].reason);

              // Process Nami's Picks (Mocked for now)
              if (results[6].status === 'fulfilled') {
                const namiData = results[6].value as any; // Type assertion for mock
                const picks = [
                    ...(namiData.personalizedAnime || []),
                    ...(namiData.personalizedManga || [])
                ]
                .map(mapToDisplayItem)
                .filter((item): item is DisplayItem => item !== null)
                .sort(() => 0.5 - Math.random()) // Shuffle
                .slice(0, 5); // Take top 5 for banner scroll
                setNamiPicks(picks);
                setLoading(prev => ({ ...prev, nami: false }));
                console.log("Nami's Picks Reasoning:", namiData.reasoning);
            } else {
                console.error("Failed fetching Nami's picks:", results[6].reason);
                setLoading(prev => ({ ...prev, nami: false })); // Still stop loading
            }


            // Check if any fetch failed to set a general error message
            if (results.some(r => r.status === 'rejected')) {
                 setError("Some sections could not be loaded. Please try refreshing.");
            }

        } catch (err: any) {
            console.error("Failed to fetch homepage data:", err);
            setError("Could not load homepage content. Please try refreshing.");
            // Reset loading states on global error
            setLoading({ trending: false, popular: false, airing: false, upcoming: false, nami: false });
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    // Helper to render a horizontally scrolling section
    const renderHorizontalSection = (
        title: string,
        icon: React.ElementType,
        items: (Anime | Manga)[],
        isLoading: boolean,
        viewAllLink?: string,
        itemComponent: React.FC<{ item: DisplayItem }> = ItemCard, // Default to ItemCard
        skeletonComponent: React.FC = SkeletonItemCard // Default skeleton
    ) => {
        const displayItems = items.map(mapToDisplayItem).filter((item): item is DisplayItem => item !== null);

        return (
            <section className="mb-8 md:mb-12">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                    <h2 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
                        {React.createElement(icon, { className: "text-primary w-5 h-5 md:w-6 md:h-6" })} {title}
                    </h2>
                    {viewAllLink && (
                        <Button variant="link" size="sm" asChild className="text-xs md:text-sm">
                            <Link href={viewAllLink}>View All <ArrowRight size={14} className="ml-1" /></Link>
                        </Button>
                    )}
                </div>
                <div className="relative">
                  {/* Scrollable Container */}
                  <div className={cn(
                      "flex space-x-3 md:space-x-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent",
                      "snap-x snap-mandatory" // Add snap scrolling
                      )}>
                    {isLoading && displayItems.length === 0
                        ? Array.from({ length: 5 }).map((_, index) => React.createElement(skeletonComponent, { key: `${title}-skel-${index}` }))
                        : displayItems.length > 0
                            ? displayItems.map((item) => React.createElement(itemComponent, { key: `${item.type}-${item.id}`, item: item }))
                            : !isLoading && <p className="text-center text-muted-foreground italic px-4">Nothing to show here right now.</p>}
                  </div>
                   {/* Optional: Add fade overlays if desired */}
                   <div className="absolute top-0 bottom-4 left-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
                   <div className="absolute top-0 bottom-4 right-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
                </div>
            </section>
        );
    };


    return (
        <div className="container mx-auto px-0 md:px-4 py-6 md:py-8"> {/* Adjusted padding */}
            {/* Global Error Display */}
            {error && (
                <Alert variant="destructive" className="mb-6 mx-4 md:mx-0">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Loading Homepage</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Nami's Picks Banner Section */}
             {renderHorizontalSection(
                "Nami's Picks For You",
                Sparkles,
                namiPicks, // Pass the already processed picks
                loading.nami,
                undefined, // No "View All" for personalized picks (usually)
                BannerCard, // Use BannerCard component
                SkeletonBannerCard // Use Banner Skeleton
             )}

             {/* Trending Anime Section */}
             {renderHorizontalSection(
                 "Trending Anime",
                 TrendingUp,
                 trendingAnime,
                 loading.trending,
                 "/anime?sort=popularity",
                 ItemCard,
                 SkeletonItemCard
             )}

             {/* Trending Manga Section */}
             {renderHorizontalSection(
                 "Trending Manga",
                 TrendingUp,
                 trendingManga,
                 loading.trending, // Share trending loading state for now
                 "/manga?sort=popularity",
                 ItemCard,
                 SkeletonItemCard
             )}

             {/* Airing Now Anime Section */}
             {renderHorizontalSection(
                "Airing Now",
                Clock,
                airingAnime,
                loading.airing,
                "/anime?status=airing",
                ItemCard,
                SkeletonItemCard
            )}

             {/* Popular Anime Section */}
             {renderHorizontalSection(
                 "Popular Anime",
                 Star,
                 popularAnime,
                 loading.popular,
                 "/anime?sort=score",
                 ItemCard,
                 SkeletonItemCard
             )}

            {/* Popular Manga Section */}
             {renderHorizontalSection(
                 "Popular Manga",
                 Star,
                 popularManga,
                 loading.popular, // Share popular loading state
                 "/manga?sort=score",
                 ItemCard,
                 SkeletonItemCard
             )}

             {/* Upcoming Anime Section */}
             {renderHorizontalSection(
                 "Upcoming Anime",
                 CalendarDays,
                 upcomingAnime,
                 loading.upcoming,
                 "/anime?status=upcoming",
                 ItemCard,
                 SkeletonItemCard
             )}

        </div>
    );
}

// Basic text shadow utility class
const styles = `
  .shadow-text {
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
  }
  /* Custom Scrollbar */
  .scrollbar-thin {
    scrollbar-width: thin; /* For Firefox */
    scrollbar-color: hsl(var(--primary) / 0.5) transparent; /* For Firefox */
  }
  .scrollbar-thin::-webkit-scrollbar {
    height: 6px; /* Height of horizontal scrollbar */
    width: 6px; /* Width of vertical scrollbar */
  }
  .scrollbar-thin::-webkit-scrollbar-track {
    background: transparent; /* Optional: style the track */
     border-radius: 3px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: hsl(var(--primary) / 0.5); /* Thumb color */
    border-radius: 3px;
    border: 1px solid transparent; /* Optional: creates padding around thumb */
     background-clip: content-box;
  }
   .scrollbar-thin::-webkit-scrollbar-thumb:hover {
     background-color: hsl(var(--primary) / 0.7); /* Thumb color on hover */
   }
`;
// Inject styles
if (typeof window !== 'undefined') {
    const styleId = 'custom-scrollbar-styles';
    if (!document.getElementById(styleId)) {
        const styleSheet = document.createElement("style");
        styleSheet.id = styleId;
        styleSheet.type = "text/css";
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);
    }
}

