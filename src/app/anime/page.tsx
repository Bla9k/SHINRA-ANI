
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { getAnimes, Anime, AnimeResponse } from '@/services/anime'; // Import updated anime service (Jikan based)
import { Tv, Star, CalendarDays, Film, AlertCircle, Loader2, Filter, X } from 'lucide-react'; // Icons
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // For filters
import { Input } from '@/components/ui/input'; // For year filter
import { Label } from '@/components/ui/label';
import { useDebounce } from '@/hooks/use-debounce'; // For potential search input

// Placeholder options - Fetch dynamically from Jikan /genres/anime if needed for better accuracy
const genres = [
    { id: 1, name: "Action" }, { id: 2, name: "Adventure" }, { id: 4, name: "Comedy" },
    { id: 8, name: "Drama" }, { id: 10, name: "Fantasy" }, { id: 14, name: "Horror" },
    { id: 7, name: "Mystery" }, { id: 22, name: "Romance" }, { id: 24, name: "Sci-Fi" },
    { id: 36, name: "Slice of Life" }, { id: 30, name: "Sports" }, { id: 37, name: "Supernatural" },
    { id: 41, name: "Thriller" }, // Add more genres as needed
].sort((a, b) => a.name.localeCompare(b.name));

const statuses = [
    { value: "airing", label: "Airing Now" },
    { value: "complete", label: "Finished Airing" },
    { value: "upcoming", label: "Upcoming" },
];

const sortOptions = [
    { value: "popularity", label: "Popularity" }, // Maps to 'members' desc in Jikan
    { value: "score", label: "Score" }, // Maps to 'score' desc in Jikan
    { value: "rank", label: "Rank" }, // Maps to 'rank' asc in Jikan
    { value: "title", label: "Title (A-Z)"}, // Maps to 'title' asc
    { value: "start_date", label: "Start Date (Newest)"}, // Maps to 'start_date' desc
    { value: "episodes", label: "Episodes"}, // Maps to 'episodes' desc
];

const ANY_GENRE_VALUE = "any-genre";
const ANY_STATUS_VALUE = "any-status";
const DEFAULT_SORT = "popularity";

export default function AnimePage() {
  const searchParams = useSearchParams(); // Get search params

  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  // Initialize filter state from URL search params or defaults
  const initialGenre = searchParams.get('genre') || undefined;
  const initialYear = searchParams.get('year') || '';
  const initialStatus = searchParams.get('status') || undefined;
  const initialSort = searchParams.get('sort') || DEFAULT_SORT;


  // Filter State
  const [selectedGenre, setSelectedGenre] = useState<string | undefined>(initialGenre);
  const [selectedYear, setSelectedYear] = useState<string>(initialYear); // Use string for input
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(initialStatus);
  const [selectedSort, setSelectedSort] = useState<string>(initialSort);
  const [showFilters, setShowFilters] = useState(!!initialGenre || !!initialYear || !!initialStatus); // Show filters if any are set initially

  const debouncedYear = useDebounce(selectedYear, 500); // Debounce year input

  const hasActiveFilters = useMemo(() => {
    return !!selectedGenre || !!debouncedYear || !!selectedStatus;
  }, [selectedGenre, debouncedYear, selectedStatus]);

  const fetchAnime = useCallback(async (page: number, filtersChanged = false) => {
      if (page === 1) {
          setLoading(true);
          if(filtersChanged) setAnimeList([]); // Clear list if filters change, keep on load more
      } else {
          setLoadingMore(true);
      }
      setError(null);

      try {
          // Convert selectedYear string to number, handle invalid input
          const yearNumber = debouncedYear ? parseInt(debouncedYear, 10) : undefined;
          const validYear = yearNumber && !isNaN(yearNumber) && yearNumber > 1900 && yearNumber < 2100 ? yearNumber : undefined;

          // Map "any" value back to undefined for the API call
          const genreParam = selectedGenre === ANY_GENRE_VALUE ? undefined : selectedGenre;
          const statusParam = selectedStatus === ANY_STATUS_VALUE ? undefined : selectedStatus;

          console.log(`Fetching anime page ${page} - Filters: Genre=${genreParam}, Year=${validYear}, Status=${statusParam}, Sort=${selectedSort}`);
          const response: AnimeResponse = await getAnimes(
              genreParam,
              validYear,
              undefined, // minScore - not implemented in filter UI yet
              undefined, // search term - not implemented yet
              statusParam,
              page,
              selectedSort // Pass selected sort option
          );

          setAnimeList(prev => (page === 1 || filtersChanged) ? response.animes : [...prev, ...response.animes]);
          setHasNextPage(response.hasNextPage);
          setCurrentPage(page);
          console.log(`Fetched ${response.animes.length} anime. Has Next Page: ${response.hasNextPage}`);
      } catch (err: any) {
          console.error("Failed to fetch anime:", err);
          setError(err.message || "Couldn't load anime list. Please try again later.");
          if (page === 1 || filtersChanged) { // Only clear list on initial load/filter error
              setAnimeList([]);
          }
          setHasNextPage(false); // Stop pagination on error
      } finally {
          setLoading(false);
          setLoadingMore(false);
      }
  }, [selectedGenre, debouncedYear, selectedStatus, selectedSort]); // Include debouncedYear

  // Fetch on initial load and when filters change
  useEffect(() => {
      // Update URL when filters change (optional, but good UX)
      const params = new URLSearchParams();
      if (selectedGenre && selectedGenre !== ANY_GENRE_VALUE) params.set('genre', selectedGenre);
      if (debouncedYear) params.set('year', debouncedYear);
      if (selectedStatus && selectedStatus !== ANY_STATUS_VALUE) params.set('status', selectedStatus);
      if (selectedSort !== DEFAULT_SORT) params.set('sort', selectedSort);
      // Only push if params changed to avoid unnecessary history entries
      if (params.toString() !== searchParams.toString()) {
         window.history.replaceState(null, '', `?${params.toString()}`);
      }

      fetchAnime(1, true); // Reset page to 1 and indicate filters changed
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGenre, debouncedYear, selectedStatus, selectedSort]); // Trigger fetch when filters change


  const loadMoreAnime = () => {
      if (hasNextPage && !loadingMore && !loading) { // Prevent loading more if already loading
          console.log("Loading more anime...");
          fetchAnime(currentPage + 1, false); // Fetch next page, filters didn't change
      }
  };

  const resetFilters = () => {
      setSelectedGenre(undefined);
      setSelectedYear('');
      setSelectedStatus(undefined);
      setSelectedSort(DEFAULT_SORT); // Reset sort to default
      // Fetching will be triggered by useEffect due to state changes
      // Also clear URL params
       window.history.replaceState(null, '', window.location.pathname);
  };


  // Adapt AnimeCard for Jikan data structure
  const AnimeCard = ({ item }: { item: Anime }) => (
     <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 hover:scale-[1.03] group flex flex-col h-full">
      <CardHeader className="p-0 relative aspect-[2/3] w-full overflow-hidden">
        {item.imageUrl ? ( // Use the derived imageUrl field
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 23vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={false}
            unoptimized={false} // Set true only if host is explicitly not optimized
             onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/400/600?grayscale'; }} // Fallback
          />
        ) : (
           <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <Tv className="w-16 h-16 text-muted-foreground opacity-50" />
           </div>
         )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
         <div className="absolute bottom-2 left-3 right-3">
           <CardTitle className="text-md font-semibold text-primary-foreground line-clamp-2 shadow-text">
             {item.title}
           </CardTitle>
         </div>
      </CardHeader>
      <CardContent className="p-3 flex flex-col flex-grow">
         <div className="flex gap-1.5 mb-2 flex-wrap">
           {/* Map Jikan genres */}
           {item.genres?.slice(0, 3).map(g => <Badge key={g.mal_id} variant="secondary" className="text-xs">{g.name}</Badge>)}
         </div>
        <CardDescription className="text-xs text-muted-foreground line-clamp-3 mb-3 flex-grow">
           {/* Use Jikan synopsis */}
           {item.synopsis || 'No description available.'}
         </CardDescription>
         {/* Adapt Additional Info Row for Jikan data */}
         <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-border/50 pt-2 mt-auto">
           <span className="flex items-center gap-1">
             <CalendarDays size={14} /> {item.year || 'N/A'}
           </span>
           <span className="flex items-center gap-1">
              {/* Use Jikan score */}
              <Star size={14} className={item.score ? 'text-yellow-400' : ''}/> {item.score?.toFixed(1) ?? 'N/A'}
            </span>
           <span className="flex items-center gap-1">
             {/* Use Jikan episodes */}
             <Film size={14} /> {item.episodes || 'N/A'} Ep
           </span>
         </div>
        {/* View Details Button */}
        <div className="flex justify-end mt-2">
           <Button variant="link" size="sm" asChild className="text-xs p-0 h-auto">
              {/* Link using MAL ID */}
              <Link href={`/anime/${item.mal_id}`}>
                 View Details
              </Link>
           </Button>
        </div>
      </CardContent>
     </Card>
  );

 // Skeleton Card remains mostly the same structurally
 const SkeletonCard = () => (
    <Card className="overflow-hidden glass flex flex-col h-full">
       <CardHeader className="p-0 relative aspect-[2/3] w-full">
          <Skeleton className="h-full w-full" />
       </CardHeader>
       <CardContent className="p-3 space-y-2 flex flex-col flex-grow">
          <Skeleton className="h-4 w-3/4" /> {/* Title */}
           <div className="flex gap-1.5 mb-1 flex-wrap"> {/* Genres */}
              <Skeleton className="h-4 w-12 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-4 w-14 rounded-full" />
           </div>
          <Skeleton className="h-3 w-full" /> {/* Description line 1 */}
          <Skeleton className="h-3 w-5/6" /> {/* Description line 2 */}
           <div className="flex-grow" /> {/* Pushes bottom content down */}
           <div className="flex justify-between items-center border-t border-border/50 pt-2 mt-auto"> {/* Additional Info */}
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-12" />
           </div>
           <div className="flex justify-end mt-1"> {/* Button */}
               <Skeleton className="h-5 w-1/4" />
           </div>
       </CardContent>
    </Card>
 );

  return (
    <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
           <h1 className="text-3xl font-bold flex items-center gap-2">
             <Tv className="text-primary w-7 h-7" />
             Browse Anime
           </h1>
           <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)} className="neon-glow-hover">
               <Filter size={18} />
               <span className="sr-only">Toggle Filters</span>
           </Button>
        </div>

        {/* Filters Section */}
        {showFilters && (
            <Card className="mb-6 glass p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                     {/* Genre Filter */}
                    <div className="space-y-1.5">
                       <Label htmlFor="genre-filter">Genre</Label>
                        <Select value={selectedGenre ?? ANY_GENRE_VALUE} onValueChange={(value) => setSelectedGenre(value === ANY_GENRE_VALUE ? undefined : value)}>
                           <SelectTrigger id="genre-filter" className="w-full glass text-sm">
                                <SelectValue placeholder="Any Genre" />
                            </SelectTrigger>
                            <SelectContent className="glass max-h-60">
                                <SelectItem value={ANY_GENRE_VALUE}>Any Genre</SelectItem>
                                {genres.map(g => <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>)}
                            </SelectContent>
                       </Select>
                    </div>
                     {/* Year Filter */}
                    <div className="space-y-1.5">
                       <Label htmlFor="year-filter">Year</Label>
                       <Input
                            id="year-filter"
                            type="number"
                            placeholder="e.g., 2023"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full glass text-sm"
                            min="1900"
                            max="2100"
                        />
                    </div>
                    {/* Status Filter */}
                    <div className="space-y-1.5">
                       <Label htmlFor="status-filter">Status</Label>
                        <Select value={selectedStatus ?? ANY_STATUS_VALUE} onValueChange={(value) => setSelectedStatus(value === ANY_STATUS_VALUE ? undefined : value)}>
                           <SelectTrigger id="status-filter" className="w-full glass text-sm">
                               <SelectValue placeholder="Any Status" />
                           </SelectTrigger>
                           <SelectContent className="glass">
                               <SelectItem value={ANY_STATUS_VALUE}>Any Status</SelectItem>
                               {statuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                           </SelectContent>
                       </Select>
                    </div>
                    {/* Sort Filter */}
                    <div className="space-y-1.5">
                       <Label htmlFor="sort-filter">Sort By</Label>
                        <Select value={selectedSort} onValueChange={setSelectedSort}>
                           <SelectTrigger id="sort-filter" className="w-full glass text-sm">
                               <SelectValue placeholder="Sort By" />
                           </SelectTrigger>
                           <SelectContent className="glass">
                               {sortOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                           </SelectContent>
                       </Select>
                    </div>
                </div>
                 {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs text-muted-foreground hover:text-destructive mt-4">
                        <X size={14} className="mr-1"/> Reset Filters
                    </Button>
                 )}
            </Card>
        )}

        {/* Content Section */}
      <section>
        {error && !loadingMore && (
          <Alert variant="destructive" className="mb-6">
             <AlertCircle className="h-4 w-4" />
             <AlertTitle>Error Loading Anime</AlertTitle>
             <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
           {loading && animeList.length === 0
             ? Array.from({ length: 12 }).map((_, index) => <SkeletonCard key={`skel-${index}`} />)
             : animeList.length > 0
               ? animeList.map((item) => (
                 item && item.mal_id ? <AnimeCard key={item.mal_id} item={item} /> : null // Use MAL ID as key, check validity
               ))
               : !error && !loading && (
                 <div className="col-span-full text-center py-10">
                    <p className="text-muted-foreground">No anime found matching your criteria.</p>
                 </div>
                )}
            {loadingMore && Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={`skel-more-${index}`} />)}
         </div>

         {/* Load More Button */}
        {hasNextPage && !loading && !error && animeList.length > 0 && ( // Show only if there are items and potentially more
            <div className="flex justify-center mt-8">
                 <Button
                    onClick={loadMoreAnime}
                    disabled={loadingMore}
                    variant="outline"
                    className="neon-glow-hover"
                    >
                    {loadingMore ? (
                        <>
                         <Loader2 className="mr-2 h-4 w-4 animate-pulse" /> {/* Changed spin to pulse */}
                         Loading...
                        </>
                     ) : (
                        'Load More Anime'
                    )}
                </Button>
            </div>
         )}
         {!hasNextPage && animeList.length > 0 && !loading && !error && (
             <p className="text-center text-muted-foreground mt-8">You've reached the end!</p>
         )}

      </section>
    </div>
  );
}

// Basic text shadow utility class (add to globals.css or keep here if specific)
const styles = `
  .shadow-text {
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
  }
`;
// Inject styles
if (typeof window !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

