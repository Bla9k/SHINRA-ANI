
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // Added useRouter
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { BookText, Layers, Library, AlertCircle, Loader2, Star, Filter, X, LayoutGrid, List, Info, Palette } from 'lucide-react';
import { getMangas, Manga, MangaResponse, mapJikanDataToManga } from '@/services/manga';
import { useDebounce } from '@/hooks/use-debounce';
import { ItemCard, SkeletonItemCard } from '@/components/shared/ItemCard';
import type { DisplayItem } from '@/app/page';
import Footer from '@/components/layout/Footer';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
// AnimeDnaModal is specific to anime, so not imported here unless mixed content is planned

const genres = [
    { id: "1", name: "Action" }, { id: "2", name: "Adventure" }, { id: "4", name: "Comedy" },
    { id: "8", name: "Drama" }, { id: "10", name: "Fantasy" }, { id: "14", name: "Horror" },
    { id: "7", name: "Mystery" }, { id: "22", name: "Romance" }, { id: "24", name: "Sci-Fi" },
    { id: "36", name: "Slice of Life" }, { id: "30", name: "Sports" }, { id: "37", name: "Supernatural" },
    { id: "41", name: "Thriller" }, { id: "15", name: "Kids" }, { id: "42", name: "Seinen" },
    { id: "25", name: "Shoujo" }, { id: "27", name: "Shounen" }, { id: "13", name: "Historical" },
    { id: "17", name: "Martial Arts" }, { id: "18", name: "Mecha" }, { id: "62", name: "Isekai" },
    { id: "40", name: "Psychological" }, { id: "29", name: "Space" }, { id: "38", name: "Military" }
].sort((a, b) => a.name.localeCompare(b.name));

const demographics = [
    { id: "15", name: "Kids" }, { id: "25", name: "Shoujo" }, { id: "27", name: "Shounen" },
    { id: "42", name: "Seinen" }, { id: "43", name: "Josei" }
].sort((a, b) => a.name.localeCompare(b.name));

const statuses = [
    { value: "publishing", label: "Publishing" }, { value: "finished", label: "Finished" },
    { value: "on_hiatus", label: "On Hiatus" }, { value: "discontinued", label: "Discontinued" },
    { value: "upcoming", label: "Upcoming" },
];

const sortOptions = [
    { value: "popularity", label: "Popularity" }, { value: "score", label: "Rating" },
    { value: "title", label: "Title (A-Z)"}, { value: "start_date", label: "Recently Added" },
    { value: "chapters", label: "Chapters"}, { value: "volumes", label: "Volumes"},
    { value: "favorites", label: "Follows" },
];

const ANY_VALUE = "any"; // Reusing ANY_VALUE for consistency
const DEFAULT_SORT = "popularity";


export default function MangaPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [mangaList, setMangaList] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const initialGenre = searchParams.get('genre') || undefined;
  const initialStatus = searchParams.get('status') || undefined;
  const initialSort = searchParams.get('sort') || DEFAULT_SORT;
  const initialDemographic = searchParams.get('demographic') || undefined;
  const initialMoodTag = searchParams.get('mood_tag') || ''; // Added for mood tag

  const [selectedGenre, setSelectedGenre] = useState<string | undefined>(initialGenre);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(initialStatus);
  const [selectedSort, setSelectedSort] = useState<string>(initialSort);
  const [selectedDemographic, setSelectedDemographic] = useState<string | undefined>(initialDemographic);
  const [currentMoodTag, setCurrentMoodTag] = useState<string>(initialMoodTag); // State for mood tag display

  const [showFilters, setShowFilters] = useState(
      !!initialGenre || !!initialStatus || !!searchTerm || !!initialDemographic || !!initialMoodTag
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');


  const hasActiveFilters = useMemo(() => {
    return !!selectedGenre || !!selectedStatus || !!debouncedSearchTerm || !!selectedDemographic || !!currentMoodTag;
  }, [selectedGenre, selectedStatus, debouncedSearchTerm, selectedDemographic, currentMoodTag]);

  const fetchManga = useCallback(async (page: number, filtersOrSearchChanged = false) => {
      if (page === 1 || filtersOrSearchChanged) {
          setLoading(true); setMangaList([]);
      } else {
          setLoadingMore(true);
      }
      setError(null);

      try {
        const genreParam = selectedGenre === ANY_VALUE ? undefined : selectedGenre;
        const statusParam = selectedStatus === ANY_VALUE ? undefined : selectedStatus;
        // Jikan doesn't directly support demographic as a top-level filter for general manga search,
        // but we can pass it as part of the search query if the user selects one.
        let searchParam = debouncedSearchTerm.trim() || undefined;
        if (selectedDemographic && selectedDemographic !== ANY_VALUE) {
            const demographicName = demographics.find(d => d.id === selectedDemographic)?.name;
            if (demographicName) {
                searchParam = searchParam ? `${searchParam} ${demographicName}` : demographicName;
            }
        }
        
        console.log(`[MangaPage] Fetching manga page ${page} - Filters: Genre=${genreParam}, Status=${statusParam}, Sort=${selectedSort}, Search=${searchParam}`);
        const response: MangaResponse = await getMangas(
            genreParam, statusParam, searchParam, undefined, page, selectedSort
        );
        const newManga = (response.mangas || [])
                            .map(mapJikanDataToManga) // Use the correct map function
                            .filter((item): item is DisplayItem => item !== null);
        setMangaList(prev => (page === 1 || filtersOrSearchChanged) ? newManga : [...prev, ...newManga]);
        setHasNextPage(response.hasNextPage ?? false);
        setCurrentPage(page);
      } catch (err: any) {
        console.error("[MangaPage] Failed to fetch manga:", err);
        setError(err.message || "Couldn't load manga list. Please try again later.");
        if (page === 1 || filtersOrSearchChanged) setMangaList([]);
        setHasNextPage(false);
      } finally {
        setLoading(false); setLoadingMore(false);
      }
  }, [selectedGenre, selectedStatus, selectedSort, debouncedSearchTerm, selectedDemographic]);

  useEffect(() => {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.set('q', debouncedSearchTerm);
      if (selectedGenre && selectedGenre !== ANY_VALUE) params.set('genre', selectedGenre);
      if (selectedStatus && selectedStatus !== ANY_VALUE) params.set('status', selectedStatus);
      if (selectedDemographic && selectedDemographic !== ANY_VALUE) params.set('demographic', selectedDemographic);
      if (selectedSort !== DEFAULT_SORT) params.set('sort', selectedSort);
      if (currentMoodTag) params.set('mood_tag', currentMoodTag);
      
      const newSearch = params.toString();
      router.replace(`/manga?${newSearch}`, { scroll: false });

      fetchManga(1, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, selectedGenre, selectedStatus, selectedSort, selectedDemographic, currentMoodTag]); // Removed router from deps

  // Effect to update currentMoodTag if it changes in URL
  useEffect(() => {
    setCurrentMoodTag(searchParams.get('mood_tag') || '');
    setSearchTerm(searchParams.get('q') || '');
    setSelectedGenre(searchParams.get('genre') || undefined);
    setSelectedStatus(searchParams.get('status') || undefined);
    setSelectedDemographic(searchParams.get('demographic') || undefined);
    setSelectedSort(searchParams.get('sort') || DEFAULT_SORT);
  }, [searchParams]);


  const loadMoreManga = () => { if (hasNextPage && !loadingMore && !loading) fetchManga(currentPage + 1, false); };

   const resetFiltersAndSearch = () => {
      setSearchTerm(''); setSelectedGenre(undefined); setSelectedStatus(undefined); setSelectedDemographic(undefined); setSelectedSort(DEFAULT_SORT); setCurrentMoodTag('');
      router.replace('/manga', { scroll: false });
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3">
           <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 text-primary">
             <BookText className="w-7 h-7" />
             {currentMoodTag ? `Manga for Mood: ${currentMoodTag}` : 'Explore Manga'}
           </h1>
           <div className="flex items-center gap-2 w-full sm:w-auto">
                <Input type="search" placeholder="Search manga titles..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-10 glass-deep w-full sm:max-w-xs border-primary/30 focus:border-primary neon-glow-focus" aria-label="Search manga" />
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                       <Label htmlFor="genre-filter" className="text-xs font-medium text-muted-foreground">Genre</Label>
                        <Select value={selectedGenre ?? ANY_VALUE} onValueChange={(value) => setSelectedGenre(value === ANY_VALUE ? undefined : value)}>
                           <SelectTrigger id="genre-filter" className="w-full glass text-sm h-9"><SelectValue placeholder="Any Genre" /></SelectTrigger>
                           <SelectContent className="glass max-h-60"><SelectItem value={ANY_VALUE}>Any Genre</SelectItem>{genres.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent></Select>
                    </div>
                     <div className="space-y-1.5">
                         <Label htmlFor="demographic-filter" className="text-xs font-medium text-muted-foreground">Demographic</Label>
                         <Select value={selectedDemographic ?? ANY_VALUE} onValueChange={(value) => setSelectedDemographic(value === ANY_VALUE ? undefined : value)}>
                             <SelectTrigger id="demographic-filter" className="w-full glass text-sm h-9"><SelectValue placeholder="Any Demographic" /></SelectTrigger>
                             <SelectContent className="glass max-h-60"><SelectItem value={ANY_VALUE}>Any Demographic</SelectItem>{demographics.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent></Select>
                     </div>
                    <div className="space-y-1.5">
                       <Label htmlFor="status-filter" className="text-xs font-medium text-muted-foreground">Status</Label>
                        <Select value={selectedStatus ?? ANY_VALUE} onValueChange={(value) => setSelectedStatus(value === ANY_VALUE ? undefined : value)}>
                           <SelectTrigger id="status-filter" className="w-full glass text-sm h-9"><SelectValue placeholder="Any Status" /></SelectTrigger>
                           <SelectContent className="glass"><SelectItem value={ANY_VALUE}>Any Status</SelectItem>{statuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select>
                    </div>
                    <div className="space-y-1.5">
                       <Label htmlFor="sort-filter" className="text-xs font-medium text-muted-foreground">Sort By</Label>
                        <Select value={selectedSort} onValueChange={setSelectedSort}>
                           <SelectTrigger id="sort-filter" className="w-full glass text-sm h-9"><SelectValue placeholder="Sort By" /></SelectTrigger>
                           <SelectContent className="glass">{sortOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent></Select>
                    </div>
                </div>
                 {hasActiveFilters && <Button variant="ghost" size="sm" onClick={resetFiltersAndSearch} className="text-xs text-muted-foreground hover:text-destructive mt-4 h-auto p-1"><X size={14} className="mr-1"/> Reset Filters & Mood</Button>}
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
           {loading && mangaList.length === 0 ? Array.from({ length: viewMode === 'grid' ? 18 : 5 }).map((_, index) => <SkeletonItemCard key={`skel-${index}`} viewMode={viewMode} />)
             : mangaList.length > 0 ? mangaList.map((item) => ( item && item.id ? <ItemCard key={`${item.type}-${item.id}-${item.title}`} item={item} viewMode={viewMode} /> : null ))
               : !error && !loading && ( <div className="col-span-full text-center py-10"><p className="text-lg text-muted-foreground">No manga found.</p><p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p></div> )}
             {loadingMore && Array.from({ length: viewMode === 'grid' ? 6 : 3 }).map((_, index) => <SkeletonItemCard key={`skel-more-${index}`} viewMode={viewMode} />)}
         </motion.div>
        {hasNextPage && !loading && !error && mangaList.length > 0 && (
             <div className="flex justify-center mt-8">
                  <Button onClick={loadMoreManga} disabled={loadingMore} variant="outline" className="neon-glow-hover glass-deep px-6 py-3 text-base">
                     {loadingMore ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</> : 'Load More Manga'}
                 </Button>
             </div>
          )}
          {!hasNextPage && mangaList.length > 0 && !loading && !error && (<p className="text-center text-muted-foreground mt-8 py-4">You've browsed all available manga!</p>)}
      </section>
      <Footer />
    </div>
  );
}
