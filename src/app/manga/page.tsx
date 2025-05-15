
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { getMangas, Manga, MangaResponse } from '@/services/manga';
import { BookText, Layers, Library, AlertCircle, Loader2, Star, Filter, X, ListFilter, LayoutGrid, List } from 'lucide-react';
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

// Jikan genres for manga (align with common MangaDex options)
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

const statuses = [
    { value: "publishing", label: "Publishing" },
    { value: "finished", label: "Finished" },
    { value: "on_hiatus", label: "On Hiatus" },
    { value: "discontinued", label: "Discontinued" },
    { value: "upcoming", label: "Upcoming" },
];

// Jikan sort options, mapped to approximate MangaDex functionalities
const sortOptions = [
    { value: "popularity", label: "Popularity" }, // Jikan: members
    { value: "score", label: "Rating" },       // Jikan: score
    { value: "title", label: "Title (A-Z)"},  // Jikan: title (asc)
    { value: "start_date", label: "Recently Added" }, // Jikan: start_date (desc) - proxy for latest
    { value: "chapters", label: "Chapters"},
    { value: "favorites", label: "Follows" }, // Jikan: favorites
];

const ANY_GENRE_VALUE = "any-genre";
const ANY_STATUS_VALUE = "any-status";
const DEFAULT_SORT = "popularity"; // Default sort similar to MangaDex


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

  const [selectedGenre, setSelectedGenre] = useState<string | undefined>(initialGenre);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(initialStatus);
  const [selectedSort, setSelectedSort] = useState<string>(initialSort);
  const [showFilters, setShowFilters] = useState(!!initialGenre || !!initialStatus || !!searchTerm);

  const hasActiveFilters = useMemo(() => {
    return !!selectedGenre || !!selectedStatus || !!debouncedSearchTerm;
  }, [selectedGenre, selectedStatus, debouncedSearchTerm]);

  const fetchManga = useCallback(async (page: number, filtersOrSearchChanged = false) => {
      if (page === 1 || filtersOrSearchChanged) { // Reset list if page 1 or filters/search changed
          setLoading(true);
          setMangaList([]);
      } else {
          setLoadingMore(true);
      }
      setError(null);

      try {
        const genreParam = selectedGenre === ANY_GENRE_VALUE ? undefined : selectedGenre;
        const statusParam = selectedStatus === ANY_STATUS_VALUE ? undefined : selectedStatus;
        const searchParam = debouncedSearchTerm.trim() || undefined;

        console.log(`Fetching manga page ${page} - Filters: Genre=${genreParam}, Status=${statusParam}, Sort=${selectedSort}, Search=${searchParam}`);
        const response: MangaResponse = await getMangas(
            genreParam,
            statusParam,
            searchParam,
            undefined, // minScore - not implemented in this UI iteration
            page,
            selectedSort
        );
        setMangaList(prev => (page === 1 || filtersOrSearchChanged) ? response.mangas : [...prev, ...response.mangas]);
        setHasNextPage(response.hasNextPage);
        setCurrentPage(page);
        console.log(`Fetched ${response.mangas.length} manga. Has Next Page: ${response.hasNextPage}`);
      } catch (err: any) {
        console.error("Failed to fetch manga:", err);
        setError(err.message || "Couldn't load manga list. Please try again later.");
        if (page === 1 || filtersOrSearchChanged) {
            setMangaList([]);
        }
        setHasNextPage(false);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
  }, [selectedGenre, selectedStatus, selectedSort, debouncedSearchTerm]);

  useEffect(() => {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.set('q', debouncedSearchTerm);
      if (selectedGenre && selectedGenre !== ANY_GENRE_VALUE) params.set('genre', selectedGenre);
      if (selectedStatus && selectedStatus !== ANY_STATUS_VALUE) params.set('status', selectedStatus);
      if (selectedSort !== DEFAULT_SORT) params.set('sort', selectedSort);
      
      const currentQueryString = searchParams.toString();
      const newQueryString = params.toString();

      if (newQueryString !== currentQueryString) {
          window.history.replaceState(null, '', `?${newQueryString}`);
      }
      // Fetch on initial load and when relevant dependencies change
      fetchManga(1, true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, selectedGenre, selectedStatus, selectedSort]);


  const loadMoreManga = () => {
    if (hasNextPage && !loadingMore && !loading) {
      fetchManga(currentPage + 1, false);
    }
  };

   const resetFiltersAndSearch = () => {
      setSearchTerm(''); // This will trigger debouncedSearchTerm update -> useEffect -> fetch
      setSelectedGenre(undefined);
      setSelectedStatus(undefined);
      setSelectedSort(DEFAULT_SORT);
      window.history.replaceState(null, '', window.location.pathname);
  };

  // MangaDex-inspired Manga Card
  const MangaCard = ({ item }: { item: Manga }) => {
      if (!item || !item.mal_id) return null;
      const linkHref = `/manga/${item.mal_id}`;

      return (
          <Link href={linkHref} passHref legacyBehavior>
              <a className="block group h-full">
                  <Card className="overflow-hidden glass-deep neon-glow-subtle-hover transition-all duration-200 group-hover:border-primary/40 flex flex-col h-full rounded-md shadow-lg">
                      <CardHeader className="p-0 relative aspect-[5/7] w-full overflow-hidden">
                          {item.imageUrl ? (
                              <Image
                                  src={item.imageUrl}
                                  alt={item.title}
                                  fill
                                  sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, 18vw"
                                  className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                                  onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/300x420.png?text=No+Image'; }}
                                  data-ai-hint="manga cover"
                              />
                          ) : (
                              <div className="absolute inset-0 bg-muted/70 flex items-center justify-center">
                                  <BookText className="w-12 h-12 text-muted-foreground opacity-60" />
                              </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                          <div className="absolute bottom-2 left-2 right-2">
                              <CardTitle className="text-sm font-semibold text-primary-foreground line-clamp-2 shadow-text group-hover:text-primary transition-colors duration-200">
                                  {item.title}
                              </CardTitle>
                          </div>
                           {item.status && (
                               <Badge variant={item.status === 'Publishing' ? 'default' : 'secondary'} className="absolute top-1.5 right-1.5 text-[10px] capitalize backdrop-blur-sm bg-background/70 px-1.5 py-0.5 shadow-sm">
                                   {formatStatus(item.status)}
                               </Badge>
                           )}
                      </CardHeader>
                      <CardContent className="p-2.5 flex flex-col flex-grow">
                          <div className="flex gap-1 mb-1.5 flex-wrap">
                              {item.genres?.slice(0, 2).map(g => <Badge key={g.mal_id} variant="outline" className="text-[10px] px-1.5 py-0.5 border-primary/30 text-primary/90">{g.name}</Badge>)}
                          </div>
                          {/* Additional details typical for MangaDex cards - using placeholders for now */}
                          <div className="text-xs text-muted-foreground space-y-0.5 mt-auto pt-1.5 border-t border-border/30">
                              {item.score && <p className="flex items-center gap-1"><Star size={12} className="text-yellow-400"/> Rating: {item.score.toFixed(1)}</p>}
                              {item.chapters && <p><Layers size={12} className="inline mr-1"/> Chapters: {item.chapters ?? 'N/A'}</p>}
                              {/* Could add "Last Updated" if Jikan provided that directly for manga */}
                          </div>
                      </CardContent>
                  </Card>
              </a>
          </Link>
      );
  };

 const SkeletonCard = () => (
    <Card className="overflow-hidden glass-deep flex flex-col h-full rounded-md shadow-lg">
       <CardHeader className="p-0 relative aspect-[5/7] w-full">
          <Skeleton className="h-full w-full" />
       </CardHeader>
       <CardContent className="p-2.5 space-y-1.5">
          <Skeleton className="h-4 w-3/4" />
           <div className="flex gap-1.5">
              <Skeleton className="h-4 w-10 rounded-full" />
              <Skeleton className="h-4 w-12 rounded-full" />
           </div>
          <div className="mt-auto pt-1.5 border-t border-border/30 space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
       </CardContent>
    </Card>
 );

  return (
    <div className="container mx-auto px-2 sm:px-4 py-6">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3">
           <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 text-primary">
             <BookText className="w-7 h-7" />
             Explore Manga
           </h1>
           <div className="flex items-center gap-2 w-full sm:w-auto">
                <Input
                    type="search"
                    placeholder="Search manga titles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-10 glass-deep w-full sm:max-w-xs border-primary/30 focus:border-primary"
                    aria-label="Search manga"
                />
               <TooltipProvider>
                 <Tooltip>
                   <TooltipTrigger asChild>
                     <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)} className="h-10 w-10 glass-deep neon-glow-subtle-hover flex-shrink-0">
                         <ListFilter size={18} />
                         <span className="sr-only">Toggle Filters</span>
                     </Button>
                   </TooltipTrigger>
                   <TooltipContent><p>Toggle Filters</p></TooltipContent>
                 </Tooltip>
               </TooltipProvider>
           </div>
        </div>

        {/* Filters Section - Styled like MangaDex */}
        {showFilters && (
            <Card className="mb-6 glass-deep p-4 shadow-md border-primary/20">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                       <Label htmlFor="genre-filter" className="text-xs font-medium text-muted-foreground">Genre</Label>
                        <Select value={selectedGenre ?? ANY_GENRE_VALUE} onValueChange={(value) => setSelectedGenre(value === ANY_GENRE_VALUE ? undefined : value)}>
                           <SelectTrigger id="genre-filter" className="w-full glass text-sm h-9">
                               <SelectValue placeholder="Any Genre" />
                           </SelectTrigger>
                           <SelectContent className="glass max-h-60">
                               <SelectItem value={ANY_GENRE_VALUE}>Any Genre</SelectItem>
                               {genres.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                           </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-1.5">
                       <Label htmlFor="status-filter" className="text-xs font-medium text-muted-foreground">Status</Label>
                        <Select value={selectedStatus ?? ANY_STATUS_VALUE} onValueChange={(value) => setSelectedStatus(value === ANY_STATUS_VALUE ? undefined : value)}>
                           <SelectTrigger id="status-filter" className="w-full glass text-sm h-9">
                               <SelectValue placeholder="Any Status" />
                           </SelectTrigger>
                           <SelectContent className="glass">
                               <SelectItem value={ANY_STATUS_VALUE}>Any Status</SelectItem>
                               {statuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                           </SelectContent>
                       </Select>
                    </div>
                    <div className="space-y-1.5">
                       <Label htmlFor="sort-filter" className="text-xs font-medium text-muted-foreground">Sort By</Label>
                        <Select value={selectedSort} onValueChange={setSelectedSort}>
                           <SelectTrigger id="sort-filter" className="w-full glass text-sm h-9">
                               <SelectValue placeholder="Sort By" />
                           </SelectTrigger>
                           <SelectContent className="glass">
                               {sortOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                           </SelectContent>
                       </Select>
                    </div>
                     {/* Reset Button - placed with filters */}
                    <div className="flex items-end"> {/* Aligns button to bottom of its grid cell */}
                         {hasActiveFilters && (
                             <Button variant="ghost" size="sm" onClick={resetFiltersAndSearch} className="text-xs text-muted-foreground hover:text-destructive w-full sm:w-auto h-9">
                                 <X size={14} className="mr-1"/> Reset
                             </Button>
                         )}
                    </div>
                </div>
            </Card>
        )}

      <section>
        {error && !loadingMore && (
           <Alert variant="destructive" className="mb-6 glass-deep">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Manga</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
           </Alert>
        )}
        {/* Grid layout for manga cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
           {loading && mangaList.length === 0
             ? Array.from({ length: 18 }).map((_, index) => <SkeletonCard key={`skel-${index}`} />)
             : mangaList.length > 0
               ? mangaList.map((item) => (
                 item && item.mal_id ? <MangaCard key={item.mal_id} item={item} /> : null
               ))
               : !error && !loading && (
                 <div className="col-span-full text-center py-10">
                     <p className="text-lg text-muted-foreground">No manga found matching your criteria.</p>
                     <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
                  </div>
                )}
             {loadingMore && Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={`skel-more-${index}`} />)}
         </div>

        {hasNextPage && !loading && !error && mangaList.length > 0 && (
             <div className="flex justify-center mt-8">
                  <Button
                     onClick={loadMoreManga}
                     disabled={loadingMore}
                     variant="outline"
                     className="neon-glow-hover glass-deep px-6 py-3 text-base"
                     >
                     {loadingMore ? (
                         <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                         </>
                      ) : (
                         'Load More Manga'
                     )}
                 </Button>
             </div>
          )}
          {!hasNextPage && mangaList.length > 0 && !loading && !error && (
              <p className="text-center text-muted-foreground mt-8 py-4">You've browsed all available manga!</p>
          )}
      </section>
    </div>
  );
}
    