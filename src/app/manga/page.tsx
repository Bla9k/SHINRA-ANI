
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { getMangas, Manga, MangaResponse } from '@/services/manga';
import { BookText, Layers, Library, AlertCircle, Loader2, Star, Filter, X, ListFilter, LayoutGrid, List, UsersRound } from 'lucide-react'; // Added UsersRound
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Helper function to format status (Jikan uses different strings)
const formatStatus = (status: string | null): string => {
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
};

// Jikan genres for manga
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

// Jikan demographics (source: https://docs.api.jikan.moe/#tag/genres/paths/~1genres~1manga/get - filter by 'demographics')
const demographics = [
    { id: "15", name: "Kids" },
    { id: "25", name: "Shoujo" },
    { id: "27", name: "Shounen" },
    { id: "42", name: "Seinen" },
    { id: "43", name: "Josei" }
].sort((a, b) => a.name.localeCompare(b.name));


const statuses = [
    { value: "publishing", label: "Publishing" },
    { value: "finished", label: "Finished" },
    { value: "on_hiatus", label: "On Hiatus" },
    { value: "discontinued", label: "Discontinued" },
    { value: "upcoming", label: "Upcoming" },
];

const sortOptions = [
    { value: "popularity", label: "Popularity" },
    { value: "score", label: "Rating" },
    { value: "title", label: "Title (A-Z)"},
    { value: "start_date", label: "Recently Added" },
    { value: "chapters", label: "Chapters"},
    { value: "favorites", label: "Follows" },
];

const ANY_VALUE = "any"; // Unified ANY_VALUE
const DEFAULT_SORT = "popularity";


export default function MangaPage() {
  const searchParams = useSearchParams();

  const [mangaList, setMangaList] = useState<Manga[]>([]);
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

  const [selectedGenre, setSelectedGenre] = useState<string | undefined>(initialGenre);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(initialStatus);
  const [selectedSort, setSelectedSort] = useState<string>(initialSort);
  const [selectedDemographic, setSelectedDemographic] = useState<string | undefined>(initialDemographic); // Add demographic state
  const [showFilters, setShowFilters] = useState(!!initialGenre || !!initialStatus || !!searchTerm || !!initialDemographic);

  const hasActiveFilters = useMemo(() => {
    return !!selectedGenre || !!selectedStatus || !!debouncedSearchTerm || !!selectedDemographic;
  }, [selectedGenre, selectedStatus, debouncedSearchTerm, selectedDemographic]);

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
        const searchParam = debouncedSearchTerm.trim() || undefined;
        // Note: Jikan's /manga search doesn't directly support filtering by demographic ID.
        // If demographic filtering is crucial, it would require fetching all results for other filters
        // and then client-side filtering by demographic, which is not efficient for pagination.
        // For now, demographic is a display item, not a primary filter here.
        // We can add a 'demographics' parameter if Jikan supports it like 'genres' (e.g., demographics=27 for Shounen)
        // Based on Jikan docs, demographics is a field, not a filter.

        console.log(`Fetching manga page ${page} - Filters: Genre=${genreParam}, Status=${statusParam}, Sort=${selectedSort}, Search=${searchParam}`);
        const response: MangaResponse = await getMangas(
            genreParam,
            statusParam,
            searchParam,
            undefined,
            page,
            selectedSort
        );
        setMangaList(prev => (page === 1 || filtersOrSearchChanged) ? response.mangas : [...prev, ...response.mangas]);
        setHasNextPage(response.hasNextPage);
        setCurrentPage(page);
      } catch (err: any) {
        console.error("Failed to fetch manga:", err);
        setError(err.message || "Couldn't load manga list. Please try again later.");
        if (page === 1 || filtersOrSearchChanged) setMangaList([]);
        setHasNextPage(false);
      } finally {
        setLoading(false); setLoadingMore(false);
      }
  }, [selectedGenre, selectedStatus, selectedSort, debouncedSearchTerm]);

  useEffect(() => {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.set('q', debouncedSearchTerm);
      if (selectedGenre && selectedGenre !== ANY_VALUE) params.set('genre', selectedGenre);
      if (selectedStatus && selectedStatus !== ANY_VALUE) params.set('status', selectedStatus);
      if (selectedSort !== DEFAULT_SORT) params.set('sort', selectedSort);
      // if (selectedDemographic && selectedDemographic !== ANY_VALUE) params.set('demographic', selectedDemographic); // Add if becomes filterable

      if (params.toString() !== searchParams.toString()) {
          window.history.replaceState(null, '', `?${params.toString()}`);
      }
      fetchManga(1, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, selectedGenre, selectedStatus, selectedSort, selectedDemographic]);


  const loadMoreManga = () => { if (hasNextPage && !loadingMore && !loading) fetchManga(currentPage + 1, false); };

   const resetFiltersAndSearch = () => {
      setSearchTerm('');
      setSelectedGenre(undefined);
      setSelectedStatus(undefined);
      setSelectedDemographic(undefined);
      setSelectedSort(DEFAULT_SORT);
      window.history.replaceState(null, '', window.location.pathname);
  };

  const MangaCard = ({ item }: { item: Manga }) => {
      if (!item || !item.mal_id) return null;
      const linkHref = `/manga/${item.mal_id}`;

      return (
          <Link href={linkHref} passHref legacyBehavior>
              <a className="block group h-full">
                  <Card className="overflow-hidden glass-deep neon-glow-subtle-hover transition-all duration-200 group-hover:border-primary/40 flex flex-col h-full rounded-md shadow-lg">
                      <CardHeader className="p-0 relative aspect-[5/7] w-full overflow-hidden">
                          {item.imageUrl ? (
                              <Image src={item.imageUrl} alt={item.title} fill sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, 18vw" className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105" onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/300x420.png?text=No+Image'; }} data-ai-hint="manga cover" />
                          ) : ( <div className="absolute inset-0 bg-muted/70 flex items-center justify-center"><BookText className="w-12 h-12 text-muted-foreground opacity-60" /></div> )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                          <div className="absolute bottom-2 left-2 right-2"><CardTitle className="text-sm font-semibold text-primary-foreground line-clamp-2 shadow-text group-hover:text-primary transition-colors duration-200">{item.title}</CardTitle></div>
                           {item.status && <Badge variant={item.status.toLowerCase() === 'publishing' ? 'default' : 'secondary'} className="absolute top-1.5 right-1.5 text-[10px] capitalize backdrop-blur-sm bg-background/70 px-1.5 py-0.5 shadow-sm">{formatStatus(item.status)}</Badge>}
                      </CardHeader>
                      <CardContent className="p-2.5 flex flex-col flex-grow">
                          <div className="flex gap-1 mb-1.5 flex-wrap">
                              {item.genres?.slice(0, 2).map(g => <Badge key={g.mal_id} variant="outline" className="text-[10px] px-1.5 py-0.5 border-primary/30 text-primary/90">{g.name}</Badge>)}
                              {(item as any).demographics?.slice(0,1).map((d: any) => <Badge key={d.mal_id} variant="outline" className="text-[10px] px-1.5 py-0.5 border-accent/50 text-accent/90">{d.name}</Badge>)}
                          </div>
                          <div className="text-xs text-muted-foreground space-y-0.5 mt-auto pt-1.5 border-t border-border/30">
                              {item.score && <p className="flex items-center gap-1"><Star size={12} className="text-yellow-400"/> Rating: {item.score.toFixed(1)}</p>}
                              {item.chapters && <p><Layers size={12} className="inline mr-1"/> Ch: {item.chapters ?? 'N/A'}</p>}
                          </div>
                      </CardContent>
                  </Card>
              </a>
          </Link>
      );
  };

 const SkeletonCard = () => (
    <Card className="overflow-hidden glass-deep flex flex-col h-full rounded-md shadow-lg">
       <CardHeader className="p-0 relative aspect-[5/7] w-full"><Skeleton className="h-full w-full" /></CardHeader>
       <CardContent className="p-2.5 space-y-1.5"><Skeleton className="h-4 w-3/4" /><div className="flex gap-1.5"><Skeleton className="h-4 w-10 rounded-full" /><Skeleton className="h-4 w-12 rounded-full" /></div><div className="mt-auto pt-1.5 border-t border-border/30 space-y-1"><Skeleton className="h-3 w-20" /><Skeleton className="h-3 w-24" /></div></CardContent>
    </Card>
 );

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3">
           <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 text-primary"><BookText className="w-7 h-7" />Explore Manga</h1>
           <div className="flex items-center gap-2 w-full sm:w-auto">
                <Input type="search" placeholder="Search manga titles..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="h-10 glass-deep w-full sm:max-w-xs border-primary/30 focus:border-primary" aria-label="Search manga" />
               <TooltipProvider><Tooltip><TooltipTrigger asChild><Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)} className="h-10 w-10 glass-deep neon-glow-subtle-hover flex-shrink-0"><ListFilter size={18} /><span className="sr-only">Toggle Filters</span></Button></TooltipTrigger><TooltipContent><p>Toggle Filters</p></TooltipContent></Tooltip></TooltipProvider>
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
                     {/* Demographic Filter (Display Only for now unless Jikan supports direct filtering) */}
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
                 {hasActiveFilters && <Button variant="ghost" size="sm" onClick={resetFiltersAndSearch} className="text-xs text-muted-foreground hover:text-destructive mt-4"><X size={14} className="mr-1"/> Reset Filters</Button>}
            </Card>
        )}
      <section>
        {error && !loadingMore && <Alert variant="destructive" className="mb-6 glass-deep"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
           {loading && mangaList.length === 0 ? Array.from({ length: 18 }).map((_, index) => <SkeletonCard key={`skel-${index}`} />)
             : mangaList.length > 0 ? mangaList.map((item) => ( item && item.mal_id ? <MangaCard key={item.mal_id} item={item} /> : null ))
               : !error && !loading && ( <div className="col-span-full text-center py-10"><p className="text-lg text-muted-foreground">No manga found.</p><p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p></div> )}
             {loadingMore && Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={`skel-more-${index}`} />)}
         </div>
        {hasNextPage && !loading && !error && mangaList.length > 0 && (
             <div className="flex justify-center mt-8">
                  <Button onClick={loadMoreManga} disabled={loadingMore} variant="outline" className="neon-glow-hover glass-deep px-6 py-3 text-base">
                     {loadingMore ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Loading...</> : 'Load More Manga'}
                 </Button>
             </div>
          )}
          {!hasNextPage && mangaList.length > 0 && !loading && !error && (<p className="text-center text-muted-foreground mt-8 py-4">You've browsed all available manga!</p>)}
      </section>
    </div>
  );
}

