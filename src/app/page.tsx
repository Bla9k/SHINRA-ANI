
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getAnimes, getMangas, Anime, Manga, mapJikanDataToAnime, mapJikanDataToManga } from '@/services';
import { Sparkles, AlertCircle, Tv, BookText, Star, TrendingUp, Clock, CalendarDays, ArrowRight, Zap, HelpCircle, RefreshCw, Heart, Palette, Info, Gift, Smile, XCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from '@/lib/utils';
import { ItemCard, SkeletonItemCard, BannerCard, SkeletonBannerCard } from '@/components/shared/ItemCard';
import Footer from '@/components/layout/Footer';
import { surpriseMeRecommendation, SurpriseMeRecommendationOutput } from '@/ai/flows/surprise-me-recommendation';
import SurpriseMeModal from '@/components/shared/SurpriseMeModal';
import FocusModeOverlay from '@/components/shared/FocusModeOverlay';
import { AnimatePresence, motion } from 'framer-motion';
import { MOOD_FILTERS_ANIME, type Mood } from '@/config/moods';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';

// Define a unified type for items displayed on the homepage
export type DisplayItem = (Partial<Anime> & Partial<Manga>) & {
    id: number;
    mal_id: number;
    type: 'anime' | 'manga';
    title: string;
    imageUrl: string | null;
    description?: string | null;
    score?: number | null;
    year?: number | null;
    episodes?: number | null;
    chapters?: number | null;
    status?: string | null;
    genres?: { name: string; mal_id: number; url: string; type: string; }[];
    trailer?: { images?: { maximum_image_url?: string | null, large_image_url?: string | null } | null } | null;
    synopsis?: string | null;
};


// --- Main Page Component ---
export default function Home() {
    const [trendingAnime, setTrendingAnime] = useState<DisplayItem[]>([]);
    const [popularAnime, setPopularAnime] = useState<DisplayItem[]>([]);
    const [airingAnime, setAiringAnime] = useState<DisplayItem[]>([]);
    const [upcomingAnime, setUpcomingAnime] = useState<DisplayItem[]>([]);
    const [namiPicks, setNamiPicks] = useState<DisplayItem[]>([]);
    const [trendingManga, setTrendingManga] = useState<DisplayItem[]>([]);
    const [popularManga, setPopularManga] = useState<DisplayItem[]>([]);

    const [surpriseContent, setSurpriseContent] = useState<SurpriseMeRecommendationOutput | null>(null);
    const [isSurpriseModalOpen, setIsSurpriseModalOpen] = useState(false);
    const [loadingSurprise, setLoadingSurprise] = useState(false);

    const [focusedItem, setFocusedItem] = useState<DisplayItem | null>(null);
    const [isFocusModeActive, setIsFocusModeActive] = useState(false);

    const [isMoodDialogOpen, setIsMoodDialogOpen] = useState(false); // State for mood dialog

    const [loadingStates, setLoadingStates] = useState({
        trendingAnime: true, popularAnime: true, airingAnime: true,
        upcomingAnime: true, namiPicks: true, trendingManga: true, popularManga: true,
    });
    const [error, setError] = useState<string | null>(null);

    const fetchSectionData = useCallback(async (
        fetchFunction: (...args: any[]) => Promise<any>,
        setData: React.Dispatch<React.SetStateAction<DisplayItem[]>>,
        sectionKey: keyof typeof loadingStates,
        mapFunction: (item: any) => DisplayItem | null,
        params: any[] = []
    ) => {
        setLoadingStates(prev => ({ ...prev, [sectionKey]: true }));
        try {
            const response = await fetchFunction(...params);
            if (response && typeof response === 'object' && (response.status && response.status >= 400 || response.error)) {
                 console.warn(`[Home Page] Jikan API error for ${sectionKey}: Status ${response.status}, Message: ${response.message || response.error}`);
                 setData([]);
            } else if (response && 'data' in response && response.data === null && response.status === 200) {
                 console.warn(`[Home Page] Jikan API returned null data for ${sectionKey}. Response:`, response);
                 setData([]);
            } else if (response && response.data && Array.isArray(response.data)) { // Jikan v4 direct data array
                const items = response.data
                    .map(mapFunction)
                    .filter((item): item is DisplayItem => item !== null && item.id != null && item.title != null);
                setData(items.slice(0, 10));
            } else if (response && (response.animes || response.mangas) && Array.isArray(response.animes || response.mangas)) { // For our service structure
                const itemsArray = response.animes || response.mangas;
                const items = itemsArray
                    .map(mapFunction)
                    .filter((item): item is DisplayItem => item !== null && item.id != null && item.title != null);
                setData(items.slice(0, 10));
            } else {
                console.warn(`[Home Page] Expected an array for ${sectionKey}, but got:`, response);
                setData([]);
            }
        } catch (err: any) {
            console.error(`[Home Page] Failed to fetch ${sectionKey}:`, err);
            setError(prevError => prevError || `Could not load ${sectionKey.replace(/([A-Z])/g, ' $1').toLowerCase()}.`);
            setData([]);
        } finally {
            setLoadingStates(prev => ({ ...prev, [sectionKey]: false }));
        }
    }, []);


    const fetchInitialData = useCallback(async () => {
        setError(null);
        const popularParams = [undefined, undefined, undefined, undefined, undefined, 1, 'popularity', 10];
        const scoreParams = [undefined, undefined, undefined, undefined, undefined, 1, 'score', 10];
        const airingParams = [undefined, undefined, undefined, undefined, 'airing', 1, 'popularity', 10];
        const upcomingParams = [undefined, undefined, undefined, undefined, 'upcoming', 1, 'popularity', 10];

        setLoadingStates(prev => ({ ...prev, namiPicks: true }));
        try {
            const [namiAnimeRes, namiMangaRes] = await Promise.all([
                getAnimes(undefined, undefined, 8.5, undefined, undefined, 1, 'score', 5),
                getMangas(undefined, undefined, undefined, 8.5, 1, 'score', 5)
            ]);
            const namiAnimeItems = (namiAnimeRes.animes || []).map(mapJikanDataToAnime).filter((i): i is DisplayItem => i !== null);
            const namiMangaItems = (namiMangaRes.mangas || []).map(mapJikanDataToManga).filter((i): i is DisplayItem => i !== null);
            const combinedNamiPicks = [...namiAnimeItems, ...namiMangaItems].sort(() => 0.5 - Math.random());
            setNamiPicks(combinedNamiPicks.slice(0, 6));
        } catch (e) {
            console.error("[Home Page] Failed to fetch Nami's Picks:", e);
            setNamiPicks([]);
        } finally {
            setLoadingStates(prev => ({ ...prev, namiPicks: false }));
        }

        await fetchSectionData(getAnimes, setTrendingAnime, 'trendingAnime', mapJikanDataToAnime, popularParams);
        await fetchSectionData(getMangas, setTrendingManga, 'trendingManga', mapJikanDataToManga, popularParams);
        await fetchSectionData(getAnimes, setAiringAnime, 'airingAnime', mapJikanDataToAnime, airingParams);
        await fetchSectionData(getAnimes, setPopularAnime, 'popularAnime', mapJikanDataToAnime, scoreParams);
        await fetchSectionData(getMangas, setPopularManga, 'popularManga', mapJikanDataToManga, scoreParams);
        await fetchSectionData(getAnimes, setUpcomingAnime, 'upcomingAnime', mapJikanDataToAnime, upcomingParams);

    }, [fetchSectionData]);


    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handleWhatNextClick = async () => {
        setLoadingSurprise(true);
        setSurpriseContent(null);
        try {
            const response = await surpriseMeRecommendation({ requestType: 'anime', genres: [] });
            if (response && response.mal_id) {
                setSurpriseContent(response);
                setIsSurpriseModalOpen(true);
            } else {
                 console.error("Surprise Me error: No item returned or mal_id missing", response);
                 setSurpriseContent(null);
                 setIsSurpriseModalOpen(true);
            }
        } catch (err) {
            console.error("Surprise Me error:", err);
            setSurpriseContent(null);
            setIsSurpriseModalOpen(true);
        }
        setLoadingSurprise(false);
    };

    const handleEngageFocusMode = useCallback((item: DisplayItem) => {
        setFocusedItem(item);
        setIsFocusModeActive(true);
    }, []);

    const handleExitFocusMode = useCallback(() => {
        setIsFocusModeActive(false);
        setTimeout(() => setFocusedItem(null), 300);
    }, []);


    const renderHorizontalSection = (
        title: string,
        icon: React.ElementType,
        items: DisplayItem[],
        isLoading: boolean,
        viewAllLink?: string,
        itemComponent: React.FC<{ item: DisplayItem, onEngageFocusMode?: (item: DisplayItem) => void }> = ItemCard,
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
                            ? items.map((item, index) => (
                                item && item.id ? React.createElement(itemComponent, {
                                    key: `${item.type}-${item.id}-${index}`,
                                    item: item,
                                    onEngageFocusMode: handleEngageFocusMode
                                }) : null
                              ))
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

            {renderHorizontalSection("Nami's Picks For You", Sparkles, namiPicks, loadingStates.namiPicks, undefined, BannerCard, SkeletonBannerCard)}

            <div className="text-center my-8 md:my-12 px-4 flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
                <Button
                    size="lg"
                    variant="outline"
                    onClick={handleWhatNextClick}
                    disabled={loadingSurprise}
                    className="neon-glow-hover glass-deep text-sm sm:text-base px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl border-primary/50 hover:border-primary hover:bg-primary/10 w-full sm:w-auto"
                >
                    {loadingSurprise ? <RefreshCw size={16} className="mr-2 h-4 w-4 animate-spin" /> : <HelpCircle size={16} className="mr-2 h-4 w-4 text-primary" />}
                    What's Next? (Roulette)
                </Button>
                <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setIsMoodDialogOpen(true)}
                    className="neon-glow-hover glass-deep text-sm sm:text-base px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl border-primary/50 hover:border-primary hover:bg-primary/10 w-full sm:w-auto"
                >
                    <Palette size={16} className="mr-2 h-4 w-4 text-primary" /> Discover by Mood
                </Button>
                 <Link href="/gacha" passHref legacyBehavior>
                    <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="fiery-glow-hover glass-deep text-sm sm:text-base px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl border-accent/50 hover:border-accent hover:bg-accent/10 text-accent w-full sm:w-auto"
                    >
                       <a><Gift className="mr-2 h-4 w-4" /> Gacha Game</a>
                    </Button>
                </Link>
            </div>

            {renderHorizontalSection( "Trending Anime", TrendingUp, trendingAnime, loadingStates.trendingAnime, "/anime?sort=popularity")}
            {renderHorizontalSection( "Trending Manga", TrendingUp, trendingManga, loadingStates.trendingManga, "/manga?sort=popularity")}
            {renderHorizontalSection( "Airing Now", Clock, airingAnime, loadingStates.airingAnime, "/anime?status=airing")}
            {renderHorizontalSection( "Popular Anime", Star, popularAnime, loadingStates.popularAnime, "/anime?sort=score")}
            {renderHorizontalSection( "Popular Manga", Star, popularManga, loadingStates.popularManga, "/manga?sort=score")}
            {renderHorizontalSection( "Upcoming Anime", CalendarDays, upcomingAnime, loadingStates.upcomingAnime, "/anime?status=upcoming")}

            <Footer />

            {/* Mood Selection Dialog */}
            <Dialog open={isMoodDialogOpen} onOpenChange={setIsMoodDialogOpen}>
              <DialogContent className="glass-deep sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-0 shadow-2xl border-primary/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 overflow-hidden max-h-[80vh] flex flex-col">
                <DialogHeader className="p-4 sm:p-6 border-b border-border/50 sticky top-0 bg-card/80 backdrop-blur-sm z-10">
                  <DialogTitle className="text-xl sm:text-2xl text-primary text-center">Discover Your Next Vibe</DialogTitle>
                  <DialogClose className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                    <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="sr-only">Close</span>
                  </DialogClose>
                </DialogHeader>
                <ScrollArea className="flex-1 min-h-0">
                  <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                      {MOOD_FILTERS_ANIME.map(mood => {
                        const queryParams = new URLSearchParams();
                        if (mood.genreIds && mood.genreIds.length > 0) {
                          queryParams.set('genre', mood.genreIds.join(','));
                        }
                        if (mood.keywords && mood.keywords.length > 0) {
                          queryParams.set('q', mood.keywords.join(' '));
                        }
                        queryParams.set('mood_tag', mood.name);
                        queryParams.set('mood_id', mood.id);

                        return (
                          <Link
                            key={mood.id}
                            href={`/anime?${queryParams.toString()}`}
                            passHref
                            legacyBehavior
                          >
                            <a
                              className="block group p-3 sm:p-4 rounded-lg text-center transition-all duration-300 ease-in-out glass hover:bg-primary/10 hover:border-primary/50 border border-transparent transform hover:-translate-y-1"
                              onClick={() => setIsMoodDialogOpen(false)}
                            >
                              <mood.icon size={32} className="mx-auto mb-2 text-primary transition-colors group-hover:text-accent" />
                              <span className="text-xs sm:text-sm font-medium text-foreground group-hover:text-primary transition-colors">{mood.name}</span>
                              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 line-clamp-2">{mood.description}</p>
                            </a>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>

            <SurpriseMeModal
                item={surpriseContent}
                isOpen={isSurpriseModalOpen}
                onClose={() => setIsSurpriseModalOpen(false)}
                onTryAnother={handleWhatNextClick}
                isLoading={loadingSurprise}
            />
             <AnimatePresence>
                {isFocusModeActive && focusedItem && (
                    <FocusModeOverlay
                        item={focusedItem}
                        isOpen={isFocusModeActive}
                        onClose={handleExitFocusMode}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
