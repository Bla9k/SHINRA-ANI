
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getAnimes, getMangas, Anime, Manga, mapJikanDataToAnime, mapJikanDataToManga } from '@/services';
import { Sparkles, AlertCircle, Tv, BookText, Star, TrendingUp, Clock, CalendarDays, ArrowRight, Zap, HelpCircle, RefreshCw, Heart, Palette, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from '@/lib/utils';
import { ItemCard, SkeletonItemCard, BannerCard, SkeletonBannerCard } from '@/components/shared/ItemCard';
import Footer from '@/components/layout/Footer';
import { surpriseMeRecommendation } from '@/ai/flows/surprise-me-recommendation';
import SurpriseMeModal from '@/components/shared/SurpriseMeModal';
import AnimeDnaModal from '@/components/shared/AnimeDnaModal';
import { MOOD_FILTERS_ANIME, type Mood } from '@/config/moods';
import Link from 'next/link';
import { Card } from '@/components/ui/card'; // Added Card import

// Define a unified type for items displayed on the homepage
export type DisplayItem = (Partial<Anime> & Partial<Manga>) & {
    id: number;
    mal_id: number; // Ensure mal_id is always present
    type: 'anime' | 'manga';
    title: string;
    imageUrl: string | null;
    description?: string | null; // Synopsis mapped here
    score?: number | null;
    year?: number | null;
    episodes?: number | null;
    chapters?: number | null;
    status?: string | null;
    genres?: { name: string; mal_id: number; url: string; type: string; }[];
    trailer?: { images?: { maximum_image_url?: string | null, large_image_url?: string | null } | null } | null;
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

    const [surpriseContent, setSurpriseContent] = useState<Anime | null>(null);
    const [isSurpriseModalOpen, setIsSurpriseModalOpen] = useState(false);
    const [loadingSurprise, setLoadingSurprise] = useState(false);

    const [dnaModalAnimeId, setDnaModalAnimeId] = useState<number | null>(null);
    const [isDnaModalOpen, setIsDnaModalOpen] = useState(false);

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
            // Handle potential error structure within successful Jikan response
            if (response && typeof response === 'object' && 'error' in response && response.error) {
                 console.warn(`[Home Page] Jikan API error for ${sectionKey}:`, response.error);
                 setData([]); // Set empty data on Jikan-specific error
                 setError(prevError => prevError || `Jikan API error for ${sectionKey}: ${response.message || response.error}`);
            } else {
                const items = (response.animes || response.mangas || []) // Use .animes or .mangas from the service response
                    .map(mapFunction)
                    .filter((item): item is DisplayItem => item !== null);
                setData(items.slice(0, 10));
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
        const baseParamsAnime = [undefined, undefined, undefined, undefined, undefined, 1, 'popularity', 10];
        const baseParamsManga = [undefined, undefined, undefined, undefined, 1, 'popularity', 10];
        const scoreParamsAnime = [undefined, undefined, undefined, undefined, undefined, 1, 'score', 10];
        const scoreParamsManga = [undefined, undefined, undefined, undefined, 1, 'score', 10];
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
            setError(prev => prev || "Could not load Nami's Picks.");
        } finally {
            setLoadingStates(prev => ({ ...prev, namiPicks: false }));
        }

        await fetchSectionData(getAnimes, setTrendingAnime, 'trendingAnime', mapJikanDataToAnime, baseParamsAnime);
        await fetchSectionData(getMangas, setTrendingManga, 'trendingManga', mapJikanDataToManga, baseParamsManga);
        await fetchSectionData(getAnimes, setAiringAnime, 'airingAnime', mapJikanDataToAnime, airingParams);
        await fetchSectionData(getAnimes, setPopularAnime, 'popularAnime', mapJikanDataToAnime, scoreParamsAnime);
        await fetchSectionData(getMangas, setPopularManga, 'popularManga', mapJikanDataToManga, scoreParamsManga);
        await fetchSectionData(getAnimes, setUpcomingAnime, 'upcomingAnime', mapJikanDataToAnime, upcomingParams);

    }, [fetchSectionData]);


    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handleWhatNextClick = async () => {
        setLoadingSurprise(true);
        setSurpriseContent(null);
        setError(null);
        try {
            const response = await surpriseMeRecommendation({ requestType: 'anime' });
            if (response && response.mal_id) {
                // Assuming response is already mapped Anime or Manga type
                const surpriseAnime = response as Anime; // Cast if necessary, ensure flow returns correct type
                setSurpriseContent(surpriseAnime);
                setIsSurpriseModalOpen(true);
            } else {
                setError("Nami couldn't find a surprise right now. Try again!");
            }
        } catch (err) {
            console.error("Surprise Me error:", err);
            setError("Failed to get a surprise recommendation. Please check the console.");
        }
        setLoadingSurprise(false);
    };

    const handleOpenDnaModal = (animeId: number) => {
        setDnaModalAnimeId(animeId);
        setIsDnaModalOpen(true);
    };

    const handleCloseDnaModal = () => {
        setIsDnaModalOpen(false);
        setDnaModalAnimeId(null);
    };

    const renderHorizontalSection = (
        title: string, icon: React.ElementType, items: DisplayItem[],
        isLoading: boolean, viewAllLink?: string,
        itemComponent: React.FC<{ item: DisplayItem, onScanDna?: (id: number) => void }> = ItemCard,
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
                      "pl-4 md:pl-6 lg:pl-8", "snap-x snap-mandatory", "pr-4 md:pr-6 lg:pr-8"
                      )}>
                    {isLoading && items.length === 0
                        ? Array.from({ length: itemComponent === BannerCard ? 3 : 6 }).map((_, index) => React.createElement(skeletonComponent, { key: `${title}-skel-${index}` }))
                        : items.length > 0
                            ? items.map((item, index) => ( item && item.id ? React.createElement(itemComponent, { key: `${item.type}-${item.id}-${index}`, item: item, onScanDna: item.type === 'anime' ? handleOpenDnaModal : undefined }) : null ))
                            : !isLoading && <p className="w-full text-center text-muted-foreground italic px-4 py-5">Nothing to show here right now.</p>}
                  </div>
                </div>
            </section>
        );
    };

    const MoodCard: React.FC<{ mood: Mood }> = ({ mood }) => {
      const queryParams = new URLSearchParams();
      if (mood.genreIds && mood.genreIds.length > 0) {
        queryParams.set('genre', mood.genreIds.join(','));
      }
      if (mood.keywords && mood.keywords.length > 0) {
        queryParams.set('q', mood.keywords.join(' '));
      }
      queryParams.set('mood_tag', mood.name);
       queryParams.set('mood_id', mood.id); // Add mood_id for fetching specific playlist

      return (
        <Link href={`/anime?${queryParams.toString()}`} className="block snap-start group">
          <Card className="glass-deep neon-glow-subtle-hover w-48 h-28 sm:w-56 sm:h-32 flex flex-col items-center justify-center text-center p-3 transition-all duration-300 ease-in-out group-hover:scale-105 group-hover:border-primary/50">
            <mood.icon size={32} className="mb-2 text-primary transition-colors group-hover:text-accent" />
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{mood.name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">{mood.description}</p>
          </Card>
        </Link>
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

            <section className="mb-10 md:mb-14">
              <div className="flex items-center justify-between mb-3 md:mb-4 px-4 md:px-6 lg:px-8">
                <h2 className="text-xl md:text-2xl font-semibold flex items-center gap-2 text-foreground">
                  <Palette className="text-primary w-5 h-5 md:w-6 md:h-6" /> Discover by Mood
                </h2>
              </div>
              <div className="relative">
                <div className={cn(
                    "flex space-x-3 md:space-x-4 overflow-x-auto pb-4 scrollbar-thin",
                    "pl-4 md:pl-6 lg:pl-8", "snap-x snap-mandatory", "pr-4 md:pr-6 lg:pr-8"
                )}>
                  {MOOD_FILTERS_ANIME.map(mood => <MoodCard key={mood.id} mood={mood} />)}
                </div>
              </div>
            </section>

            <div className="text-center my-8 md:my-12 px-4">
                <Button
                    size="lg"
                    variant="outline"
                    onClick={handleWhatNextClick}
                    disabled={loadingSurprise}
                    className="neon-glow-hover glass-deep text-base md:text-lg px-6 py-3 md:px-8 md:py-4 rounded-xl border-primary/50 hover:border-primary hover:bg-primary/10"
                >
                    {loadingSurprise ? <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> : <HelpCircle className="mr-2 h-5 w-5 text-primary" />}
                    What's Next? (Roulette)
                </Button>
            </div>

            {renderHorizontalSection( "Trending Anime", TrendingUp, trendingAnime, loadingStates.trendingAnime, "/anime?sort=popularity", ItemCard, SkeletonItemCard)}
            {renderHorizontalSection( "Trending Manga", TrendingUp, trendingManga, loadingStates.trendingManga, "/manga?sort=popularity", ItemCard, SkeletonItemCard)}
            {renderHorizontalSection( "Airing Now", Clock, airingAnime, loadingStates.airingAnime, "/anime?status=airing", ItemCard, SkeletonItemCard)}
            {renderHorizontalSection( "Popular Anime", Star, popularAnime, loadingStates.popularAnime, "/anime?sort=score", ItemCard, SkeletonItemCard)}
            {renderHorizontalSection( "Popular Manga", Star, popularManga, loadingStates.popularManga, "/manga?sort=score", ItemCard, SkeletonItemCard)}
            {renderHorizontalSection( "Upcoming Anime", CalendarDays, upcomingAnime, loadingStates.upcomingAnime, "/anime?status=upcoming", ItemCard, SkeletonItemCard)}

            <Footer />
            {surpriseContent && (
              <SurpriseMeModal
                anime={surpriseContent}
                isOpen={isSurpriseModalOpen}
                onClose={() => setIsSurpriseModalOpen(false)}
                onTryAnother={handleWhatNextClick}
                isLoading={loadingSurprise}
              />
            )}
            <AnimeDnaModal
                animeId={dnaModalAnimeId}
                isOpen={isDnaModalOpen}
                onClose={handleCloseDnaModal}
            />
        </div>
    );
}
