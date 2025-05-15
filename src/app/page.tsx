
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // CardDescription removed as it's in ItemCard
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { getAnimes, getMangas, Anime, Manga } from '@/services';
import { Sparkles, AlertCircle, Tv, BookText, Star, TrendingUp, Clock, CalendarDays, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ItemCard, SkeletonItemCard, BannerCard, SkeletonBannerCard } from '@/components/shared/ItemCard';
import Footer from '@/components/layout/Footer'; // Import Footer

// Define a unified type for items displayed on the homepage
export type DisplayItem = (Anime | Manga) & {
    id: number;
    type: 'anime' | 'manga';
    imageUrl: string | null;
    description?: string | null; // Synopsis mapped here
    score?: number | null;
    year?: number | null;
    // Add other common fields if needed by cards
    episodes?: number | null;
    chapters?: number | null;
    status?: string | null;
};

// Helper to map Anime/Manga service types to DisplayItem
const mapToDisplayItem = (item: Anime | Manga): DisplayItem | null => {
    if (!item || typeof item.mal_id !== 'number') return null;
    const isAnime = 'episodes' in item;
    return {
        ...item,
        id: item.mal_id,
        type: isAnime ? 'anime' : 'manga',
        imageUrl: item.images?.jpg?.large_image_url ?? item.images?.webp?.large_image_url ?? item.images?.jpg?.image_url ?? null,
        description: item.synopsis,
        year: item.year ?? (isAnime ? (item.aired?.from ? new Date(item.aired.from).getFullYear() : null) : (item.published?.from ? new Date(item.published.from).getFullYear() : null)),
        score: item.score,
        episodes: isAnime ? item.episodes : undefined,
        chapters: !isAnime ? item.chapters : undefined,
        status: item.status,
    };
};


// --- Main Page Component ---

export default function Home() {
    const [trendingAnime, setTrendingAnime] = useState<DisplayItem[]>([]);
    const [popularAnime, setPopularAnime] = useState<DisplayItem[]>([]);
    const [airingAnime, setAiringAnime] = useState<DisplayItem[]>([]);
    const [upcomingAnime, setUpcomingAnime] = useState<DisplayItem[]>([]);
    const [namiPicks, setNamiPicks] = useState<DisplayItem[]>([]); // For combined Nami picks

    const [trendingManga, setTrendingManga] = useState<DisplayItem[]>([]);
    const [popularManga, setPopularManga] = useState<DisplayItem[]>([]);


    const [loadingStates, setLoadingStates] = useState({
        trendingAnime: true,
        popularAnime: true,
        airingAnime: true,
        upcomingAnime: true,
        namiPicks: true,
        trendingManga: true,
        popularManga: true,
    });
    const [error, setError] = useState<string | null>(null);


    const fetchSectionData = useCallback(async (
        fetchFunction: (genre?: string | number, year?: number, minScore?: number, search?: string, status?: string, page?: number, sort?: string, limit?: number) => Promise<any>,
        setData: React.Dispatch<React.SetStateAction<DisplayItem[]>>,
        sectionKey: keyof typeof loadingStates,
        params: Parameters<typeof fetchFunction>
    ) => {
        setLoadingStates(prev => ({ ...prev, [sectionKey]: true }));
        try {
            const response = await fetchFunction(...params);
            const items = (response.animes || response.mangas || [])
                .map(mapToDisplayItem)
                .filter((item): item is DisplayItem => item !== null);
            setData(items.slice(0, 10)); // Limit to 10 items for homepage carousels
        } catch (err: any) {
            console.error(`Failed to fetch ${sectionKey}:`, err);
            setError(prevError => prevError || `Could not load ${sectionKey.replace(/([A-Z])/g, ' $1').toLowerCase()}.`);
            setData([]); // Set to empty on error
        } finally {
            setLoadingStates(prev => ({ ...prev, [sectionKey]: false }));
        }
    }, []);

    useEffect(() => {
        const fetchAllHomepageData = async () => {
            setError(null); // Reset error on new fetch attempt

            // Fetch Nami's Picks (e.g., highly rated or diverse selection)
            // For Nami's Picks, let's fetch some top-rated anime and manga separately and combine them
            setLoadingStates(prev => ({ ...prev, namiPicks: true }));
            try {
                const [namiAnimeRes, namiMangaRes] = await Promise.all([
                    getAnimes(undefined, undefined, 8.5, undefined, undefined, 1, 'score', 5), // Top 5 anime with score >= 8.5
                    getMangas(undefined, undefined, undefined, 8.5, 1, 'score', 5) // Top 5 manga with score >= 8.5
                ]);
                const namiAnimeItems = (namiAnimeRes.animes || []).map(mapToDisplayItem).filter((i): i is DisplayItem => i !== null);
                const namiMangaItems = (namiMangaRes.mangas || []).map(mapToDisplayItem).filter((i): i is DisplayItem => i !== null);
                setNamiPicks([...namiAnimeItems, ...namiMangaItems].sort(() => 0.5 - Math.random()).slice(0, 6)); // Mix and pick 6
            } catch (e) {
                console.error("Failed to fetch Nami's Picks:", e);
                setNamiPicks([]);
            } finally {
                setLoadingStates(prev => ({ ...prev, namiPicks: false }));
            }

            // Fetch other sections sequentially to respect Jikan rate limits
            await fetchSectionData(getAnimes, setTrendingAnime, 'trendingAnime', [undefined, undefined, undefined, undefined, undefined, 1, 'popularity', 10]);
            await fetchSectionData(getMangas, setTrendingManga, 'trendingManga', [undefined, undefined, undefined, undefined, 1, 'popularity', 10]);
            await fetchSectionData(getAnimes, setAiringAnime, 'airingAnime', [undefined, undefined, undefined, undefined, 'airing', 1, 'popularity', 10]);
            await fetchSectionData(getAnimes, setPopularAnime, 'popularAnime', [undefined, undefined, undefined, undefined, undefined, 1, 'score', 10]);
            await fetchSectionData(getMangas, setPopularManga, 'popularManga', [undefined, undefined, undefined, undefined, 1, 'score', 10]);
            await fetchSectionData(getAnimes, setUpcomingAnime, 'upcomingAnime', [undefined, undefined, undefined, undefined, 'upcoming', 1, 'popularity', 10]);
        };

        fetchAllHomepageData();
    }, [fetchSectionData]);


    // Helper to render a horizontally scrolling section
    const renderHorizontalSection = (
        title: string,
        icon: React.ElementType,
        items: DisplayItem[],
        isLoading: boolean,
        viewAllLink?: string,
        itemComponent: React.FC<{ item: DisplayItem }> = ItemCard,
        skeletonComponent: React.FC = SkeletonItemCard
    ) => {
        return (
            <section className="mb-10 md:mb-14">
                <div className="flex items-center justify-between mb-3 md:mb-4 px-4 md:px-6 lg:px-8">
                    <h2 className="text-xl md:text-2xl font-semibold flex items-center gap-2 text-foreground">
                        {React.createElement(icon, { className: "text-primary w-5 h-5 md:w-6 md:h-6" })} {title}
                    </h2>
                    {viewAllLink && items.length > 0 && (
                        <Button variant="link" size="sm" asChild className="text-xs md:text-sm text-primary hover:text-primary/80">
                            <Link href={viewAllLink}>View All <ArrowRight size={14} className="ml-1" /></Link>
                        </Button>
                    )}
                </div>
                 <div className="relative">
                  <div className={cn(
                      "flex space-x-3 md:space-x-4 overflow-x-auto pb-4 scrollbar-thin",
                      "pl-4 md:pl-6 lg:pl-8",
                      "snap-x snap-mandatory",
                      "pr-4 md:pr-6 lg:pr-8"
                      )}>
                    {isLoading && items.length === 0
                        ? Array.from({ length: itemComponent === BannerCard ? 3 : 6 }).map((_, index) => React.createElement(skeletonComponent, { key: `${title}-skel-${index}` }))
                        : items.length > 0
                            ? items.map((item, index) => React.createElement(itemComponent, { key: `${item.type}-${item.id}-${index}`, item: item }))
                            : !isLoading && <p className="w-full text-center text-muted-foreground italic px-4 py-5">Nothing to show here right now.</p>}
                  </div>
                </div>
            </section>
        );
    };


    return (
        <div className="py-8 md:py-10">
            {error && (
                 <div className="px-4 md:px-6 lg:px-8 mb-8">
                   <Alert variant="destructive" className="glass-deep shadow-lg">
                     <AlertCircle className="h-4 w-4" />
                     <AlertTitle>Error Loading Homepage</AlertTitle>
                     <AlertDescription>{error}</AlertDescription>
                   </Alert>
                 </div>
            )}

            {renderHorizontalSection(
                "Nami's Picks For You",
                Sparkles,
                namiPicks,
                loadingStates.namiPicks,
                undefined,
                BannerCard,
                SkeletonBannerCard
             )}
             {/* Removed Nami reasoning for now to focus on core UI stability */}

             {renderHorizontalSection( "Trending Anime", TrendingUp, trendingAnime, loadingStates.trendingAnime, "/anime?sort=popularity")}
             {renderHorizontalSection( "Trending Manga", TrendingUp, trendingManga, loadingStates.trendingManga, "/manga?sort=popularity")}
             {renderHorizontalSection( "Airing Now", Clock, airingAnime, loadingStates.airingAnime, "/anime?status=airing")}
             {renderHorizontalSection( "Popular Anime", Star, popularAnime, loadingStates.popularAnime, "/anime?sort=score")}
             {renderHorizontalSection( "Popular Manga", Star, popularManga, loadingStates.popularManga, "/manga?sort=score")}
             {renderHorizontalSection( "Upcoming Anime", CalendarDays, upcomingAnime, loadingStates.upcomingAnime, "/anime?status=upcoming")}

            <Footer />
        </div>
    );
}

// Styles for scrollbar and snap scrolling (can be moved to globals.css if preferred)
const styles = `
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: hsl(var(--primary) / 0.5) hsl(var(--background) / 0.3);
  }
  .scrollbar-thin::-webkit-scrollbar {
    height: 8px;
    width: 8px;
  }
  .scrollbar-thin::-webkit-scrollbar-track {
    background: hsl(var(--background) / 0.1);
    border-radius: 4px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background-color: hsl(var(--primary) / 0.6);
    border-radius: 4px;
    border: 2px solid transparent;
    background-clip: content-box;
  }
   .scrollbar-thin::-webkit-scrollbar-thumb:hover {
     background-color: hsl(var(--primary) / 0.8);
   }
   .snap-x { scroll-snap-type: x mandatory; }
   .snap-start { scroll-snap-align: start; }
   .snap-center { scroll-snap-align: center; }
`;

if (typeof window !== 'undefined') {
    const styleId = 'homepage-custom-styles';
    if (!document.getElementById(styleId)) {
        const styleSheet = document.createElement("style");
        styleSheet.id = styleId;
        styleSheet.type = "text/css";
        styleSheet.innerText = styles;
        document.head.appendChild(styleSheet);
    }
}
