
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tv, Star, CalendarDays, Film, AlertCircle, Loader2, Filter, X, LayoutGrid, List, Info } from 'lucide-react'; // Added Info
import { getAnimes, Anime, AnimeResponse } from '@/services/anime';
import { useDebounce } from '@/hooks/use-debounce';
import { ItemCard, SkeletonItemCard } from '@/components/shared/ItemCard';
import type { DisplayItem } from '@/app/page';
import Footer from '@/components/layout/Footer';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import AnimeDnaModal from '@/components/shared/AnimeDnaModal'; // Import DNA Modal

// Jikan genres for anime
const genres = [
    { id: "1", name: "Action" }, { id: "2", name: "Adventure" }, { id: "4", name: "Comedy" },
    { id: "8", name: "Drama" }, { id: "10", name: "Fantasy" }, { id: "14", name: "Horror" },
    { id: "7", name: "Mystery" }, { id: "22", name: "Romance" }, { id: "24", name: "Sci-Fi" },
    { id: "36", name: "Slice of Life" }, { id: "30", name: "Sports" }, { id: "37", name: "Supernatural" },
    { id: "41", name: "Thriller" }, { id: "62", name: "Isekai" }, { id: "40", name: "Psychological"}
].sort((a, b) => a.name.localeCompare(b.name));


const statuses = [
    { value: "airing", label: "Airing Now" },
    { value: "complete", label: "Finished Airing" },
    { value: "upcoming", label: "Upcoming" },
];

const sortOptions = [
    { value: "popularity", label: "Popularity" },
    { value: "score", label: "Score" },
    { value: "rank", label: "Rank" },
    { value: "title", label: "Title (A-Z)"},
    { value: "start_date", label: "Start Date (Newest)"},
    { value: "episodes", label: "Episodes"},
    { value: "favorites", label: "Favorites" },
];

const ANY_GENRE_VALUE = "any-genre";
const ANY_STATUS_VALUE = "any-status";
const DEFAULT_SORT = "popularity";

const mapAnimeToDisplayItem = (anime: Anime): DisplayItem | null => {
    if (!anime || typeof anime.mal_id !== 'number') return null;
    return {
        ...anime,
        id: anime.mal_id,
        type: 'anime',
        imageUrl: anime.images?.jpg?.large_image_url ?? anime.images?.webp?.large_image_url ?? anime.images?.jpg?.image_url ?? null,
        description: anime.synopsis,
        year: anime.year,
        score: anime.score,
        episodes: anime.episodes,
        status: anime.status,
        genres: anime.genres,
    };
};


export default function AnimePage() {
  const searchParams = useSearchParams();

  const [animeList, setAnimeList] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const initialGenre = searchParams.get('genre') || undefined;
  const initialYear = searchParams.get('year') || '';
  const initialStatus = searchParams.get('status') || undefined;
  const initialSort = searchParams.get('sort') || DEFAULT_SORT;

  const [selectedGenre, setSelectedGenre] = useState<string | undefined>(initialGenre);
  const [selectedYear, setSelectedYear] = useState<string>(initialYear);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(initialStatus);
  const [selectedSort, setSelectedSort] = useState<string>(initialSort);
  const [showFilters, setShowFilters] = useState(!!initialGenre || !!initialYear || !!initialStatus || !!searchTerm);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [dnaModalAnimeId, setDnaModalAnimeId] = useState<number | null>(null);
  const [isDnaModalOpen, setIsDnaModalOpen] = useState(false);

  const debouncedYear = useDebounce(selectedYear, 500);

  const hasActiveFilters = useMemo(() => {
    return !!selectedGenre || !!debouncedYear || !!selectedStatus || !!debouncedSearchTerm;
  }, [selectedGenre, debouncedYear, selectedStatus, debouncedSearchTerm]);

  const fetchAnime = useCallback(async (page: number, filtersOrSearchChanged = false) => {
      if (page === 1 || filtersOrSearchChanged) {
          setLoading(true); setAnimeList([]);
      } else {
          setLoadingMore(true);
      }
      setError(null);

      try {
          const yearNumber = debouncedYear ? parseInt(debouncedYear, 10) : undefined;
          const validYear = yearNumber && !isNaN(yearNumber) && yearNumber > 1900 && yearNumber < 2100 ? yearNumber : undefined;
          const genreParam = selectedGenre === ANY_GENRE_VALUE ? undefined : selectedGenre;
          const statusParam = selectedStatus === ANY_STATUS_VALUE ? undefined : selectedStatus;
          const searchParam = debouncedSearchTerm.trim() || undefined;

          console.log(`[AnimePage] Fetching anime page ${page} - Filters: Genre=${genreParam}, Year=${validYear}, Status=${statusParam}, Sort=${selectedSort}, Search=${searchParam}`);
          const response: AnimeResponse = await getAnimes(
              genreParam, validYear, undefined, searchParam, statusParam, page, selectedSort
          );

          const newAnime = (response.animes || [])
                            .map(mapAnimeToDisplayItem)
                            .filter((item): item is DisplayItem => item !== null);

          setAnimeList(prev => (page === 1 || filtersOrSearchChanged) ? newAnime : [...prev, ...newAnime]);
          setHasNextPage(response.hasNextPage ?? false); // Ensure hasNextPage is boolean
          setCurrentPage(page);
      } catch (err: any) {
          console.error("[AnimePage] Failed to fetch anime:", err);
          setError(err.message || "Couldn't load anime list. Please try again later.");
          if (page === 1 || filtersOrSearchChanged) setAnimeList([]);
          setHasNextPage(false);
      } finally {
          setLoading(false); setLoadingMore(false);
      }
  }, [selectedGenre, debouncedYear, selectedStatus, selectedSort, debouncedSearchTerm]);

  useEffect(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (debouncedSearchTerm) params.set('q', debouncedSearchTerm); else params.delete('q');
      if (selectedGenre && selectedGenre !== ANY_GENRE_VALUE) params.set('genre', selectedGenre); else params.delete('genre');
      if (debouncedYear) params.set('year', debouncedYear); else params.delete('year');
      if (selectedStatus && selectedStatus !== ANY_STATUS_VALUE) params.set('status', selectedStatus); else params.delete('status');
      if (selectedSort !== DEFAULT_SORT) params.set('sort', selectedSort); else params.delete('sort');
      
      const newSearch = params.toString();
      if (newSearch !== searchParams.toString()) {
         window.history.replaceState(null, '', `?${newSearch}`);
      }
      fetchAnime(1, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, selectedGenre, debouncedYear, selectedStatus, selectedSort]);


  const loadMoreAnime = () => { if (hasNextPage && !loadingMore && !loading) fetchAnime(currentPage + 1, false); };

  const resetFiltersAndSearch = () => {
      setSearchTerm(''); setSelectedGenre(undefined); setSelectedYear(''); setSelectedStatus(undefined); setSelectedSort(DEFAULT_SORT);
      window.history.replaceState(null, '', window.location.pathname);
  };

  const handleOpenDnaModal = (animeId: number) => {
    setDnaModalAnimeId(animeId);
    setIsDnaModalOpen(true);
  };

  const handleCloseDnaModal = () => {
    setIsDnaModalOpen(false);
    setDnaModalAnimeId(null);
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3">
           <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 text-primary"><Tv className="w-7 h-7" />Browse Anime</h1>
           <div className="flex items-center gap-2 w-full sm:w-auto">
                <Input type="search" placeholder="Search anime titles..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-10 glass-deep w-full sm:max-w-xs border-primary/30 focus:border-primary neon-glow-focus" aria-label="Search anime" />
               <TooltipProvider><Tooltip><TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)} className="h-10 w-10 glass-deep neon-glow-hover flex-shrink-0 border-primary/30">
                    <Filter size={18} /><span className="sr-only">Toggle Filters</span>
                </Button></TooltipTrigger><TooltipContent><p>Toggle Filters</p></TooltipContent></Tooltip></TooltipProvider>
                <TooltipProvider><Tooltip><TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')} className="h-10 w-10 glass-deep neon-glow-hover flex-shrink-0 border-primary/30">
                    {viewMode === 'grid' ? <List size={18} /> : <LayoutGrid size={18} />} <span className="sr-only">Toggle View Mode</span>
                </Button></TooltipTrigger><TooltipContent><p>{viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}</p></TooltipContent></Tooltip></TooltipProvider>
           </div>
        </div>

        {showFilters && (
            <Card className="mb-6 glass-deep p-4 shadow-md border-primary/20">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                       <Label htmlFor="genre-filter" className="text-xs font-medium text-muted-foreground">Genre</Label>
                        <Select value={selectedGenre ?? ANY_GENRE_VALUE} onValueChange={(value) => setSelectedGenre(value === ANY_GENRE_VALUE ? undefined : value)}>
                           <SelectTrigger id="genre-filter" className="w-full glass text-sm h-9"><SelectValue placeholder="Any Genre" /></SelectTrigger>
                           <SelectContent className="glass max-h-60"><SelectItem value={ANY_GENRE_VALUE}>Any Genre</SelectItem>{genres.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent></Select>
                    </div>
                    <div className="space-y-1.5">
                       <Label htmlFor="year-filter" className="text-xs font-medium text-muted-foreground">Year</Label>
                       <Input id="year-filter" type="number" placeholder="e.g., 2023" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="w-full glass text-sm h-9" min="1900" max={new Date().getFullYear() + 5}/>
                    </div>
                    <div className="space-y-1.5">
                       <Label htmlFor="status-filter" className="text-xs font-medium text-muted-foreground">Status</Label>
                        <Select value={selectedStatus ?? ANY_STATUS_VALUE} onValueChange={(value) => setSelectedStatus(value === ANY_STATUS_VALUE ? undefined : value)}>
                           <SelectTrigger id="status-filter" className="w-full glass text-sm h-9"><SelectValue placeholder="Any Status" /></SelectTrigger>
                           <SelectContent className="glass"><SelectItem value={ANY_STATUS_VALUE}>Any Status</SelectItem>{statuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select>
                    </div>
                    <div className="space-y-1.5">
                       <Label htmlFor="sort-filter" className="text-xs font-medium text-muted-foreground">Sort By</Label>
                        <Select value={selectedSort} onValueChange={setSelectedSort}>
                           <SelectTrigger id="sort-filter" className="w-full glass text-sm h-9"><SelectValue placeholder="Sort By" /></SelectTrigger>
                           <SelectContent className="glass">{sortOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select>
                    </div>
                </div>
                 {hasActiveFilters && <Button variant="ghost" size="sm" onClick={resetFiltersAndSearch} className="text-xs text-muted-foreground hover:text-destructive mt-4 h-auto p-1"><X size={14} className="mr-1"/> Reset Filters</Button>}
            </Card>
        )}

      <section>
        {error && !loadingMore && <Alert variant="destructive" className="mb-6 glass-deep"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
        <motion.div
          layout
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className={cn(
            "gap-3 md:gap-4",
            viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" : "flex flex-col space-y-3"
        )}>
           {loading && animeList.length === 0 ? Array.from({ length: viewMode === 'grid' ? 18 : 5 }).map((_, index) => <SkeletonItemCard key={`skel-${index}`} viewMode={viewMode} />)
             : animeList.length > 0 ? animeList.map((item) => ( item && item.id ? <ItemCard key={`${item.type}-${item.id}`} item={item} viewMode={viewMode} onScanDna={item.type === 'anime' ? handleOpenDnaModal : undefined} /> : null ))
               : !error && !loading && ( <div className="col-span-full text-center py-10"><p className="text-lg text-muted-foreground">No anime found.</p><p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p></div> )}
             {loadingMore && Array.from({ length: viewMode === 'grid' ? 6 : 3 }).map((_, index) => <SkeletonItemCard key={`skel-more-${index}`} viewMode={viewMode} />)}
         </motion.div>
        {hasNextPage && !loading && !error && animeList.length > 0 && (
             <div className="flex justify-center mt-8">
                  <Button onClick={loadMoreAnime} disabled={loadingMore} variant="outline" className="neon-glow-hover glass-deep px-6 py-3 text-base">
                     {loadingMore ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</> : 'Load More Anime'}
                 </Button>
             </div>
          )}
          {!hasNextPage && animeList.length > 0 && !loading && !error && (<p className="text-center text-muted-foreground mt-8 py-4">You've browsed all available anime!</p>)}
      </section>
      <Footer />
      <AnimeDnaModal
        animeId={dnaModalAnimeId}
        isOpen={isDnaModalOpen}
        onClose={handleCloseDnaModal}
      />
    </div>
  );
}

    