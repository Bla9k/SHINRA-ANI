
'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import Link from 'next/link';
import { Search as SearchIcon, Loader2, Sparkles, Filter, AlertCircle, X, CalendarDays, Star, Layers, Library, Film, BookText, Tv, User, Heart } from 'lucide-react'; // Added User, Heart
import { Skeleton } from '@/components/ui/skeleton';
import { aiPoweredSearch, AIPoweredSearchOutput, SearchResult } from '@/ai/flows/ai-powered-search'; // Updated AI flow import
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/use-debounce';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Helper function to format status (Jikan uses different strings)
const formatStatus = (status: string | null): string => {
    if (!status) return 'N/A';
    // Capitalize first letter for display if needed
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
};

const ANY_GENRE_VALUE = "any-genre";
const ANY_STATUS_VALUE = "any-status";

export default function SearchPage() {
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'anime' | 'manga' | 'character'>('all'); // Default to 'all'
  const [results, setResults] = useState<SearchResult[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Pagination state (optional future implementation)
  // const [currentPage, setCurrentPage] = useState(1);
  // const [hasNextPage, setHasNextPage] = useState(true);

  // Filters State - Adapt for Jikan parameters
  const [genre, setGenre] = useState<string | undefined>(undefined); // Jikan uses genre IDs/names
  const [year, setYear] = useState<string>(''); // Use string for input field
  const [minScore, setMinScore] = useState<number[]>([0]); // Jikan uses min_score (0-10)
  const [status, setStatus] = useState<string | undefined>(undefined); // Jikan status strings

  const debouncedSearchTerm = useDebounce(searchTerm, 500); // Increased debounce
  const debouncedYear = useDebounce(year, 500);

  const hasActiveFilters = useMemo(() => {
    // Ensure year is a valid number before considering it active
    const yearNumber = debouncedYear ? parseInt(debouncedYear, 10) : NaN;
    const isYearValid = !isNaN(yearNumber) && yearNumber > 1900 && yearNumber < 2100;
    return !!genre || isYearValid || minScore[0] !== 0 || !!status;
  }, [genre, debouncedYear, minScore, status]);


  const handleSearch = async (currentSearchTerm: string) => {
      if (!currentSearchTerm.trim() && !hasActiveFilters) {
          setResults([]);
          setAiSuggestions([]);
          setAiAnalysis(null);
          setError(null);
          setLoading(false);
          return;
      }

      setLoading(true);
      setError(null);
      setAiAnalysis(null); // Clear previous analysis

      startTransition(async () => {
          try {
              const yearNumber = debouncedYear ? parseInt(debouncedYear, 10) : undefined;
              const validYear = yearNumber && !isNaN(yearNumber) && yearNumber > 1900 && yearNumber < 2100 ? yearNumber : undefined;

              const searchInput = {
                  searchTerm: currentSearchTerm.trim(),
                  searchType: activeTab, // Pass the active tab as the desired search type
                  // Pass explicit filters
                  genre: genre === ANY_GENRE_VALUE ? undefined : genre,
                  year: validYear,
                  minScore: minScore[0] === 0 ? undefined : minScore[0],
                  status: status === ANY_STATUS_VALUE ? undefined : status,
              };

              console.log("Performing AI Search with input:", searchInput);
              const searchOutput: AIPoweredSearchOutput = await aiPoweredSearch(searchInput);

              setResults(searchOutput.results || []);
              setAiSuggestions(searchOutput.suggestions || []);
              setAiAnalysis(searchOutput.aiAnalysis || null); // Set AI analysis text
              setError(null); // Clear previous errors on success

              console.log("Search successful, results:", searchOutput.results?.length, "suggestions:", searchOutput.suggestions?.length);

          } catch (err: any) {
              console.error('Search failed:', err);
              setError(err.message || `Nami encountered an issue searching. Please try again.`);
              setResults([]);
              setAiSuggestions([]);
              setAiAnalysis(`Error during search: ${err.message}`); // Show error in analysis section
          } finally {
              setLoading(false);
          }
      });
  };

  // Trigger search on debounced term or filter changes
  useEffect(() => {
      // Only search if debounced term is present or filters are active
       if (debouncedSearchTerm.trim() || hasActiveFilters) {
          handleSearch(debouncedSearchTerm);
       } else {
          // Clear results if search term and filters are cleared
          setResults([]);
          setAiSuggestions([]);
          setAiAnalysis(null);
          setError(null);
          setLoading(false);
       }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, activeTab, genre, debouncedYear, minScore, status]);


  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    // The useEffect will automatically trigger the search
  };

  const resetFilters = () => {
      setGenre(undefined);
      setYear('');
      setMinScore([0]);
      setStatus(undefined);
      // The useEffect will trigger a new search with potentially just the search term
  };

 // Result Card adapted for Anime, Manga, and Character
 const ResultCard = ({ item }: { item: SearchResult }) => {
      const linkHref = `/${item.type}/${item.id}`; // Consistent link structure

     return (
        <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 hover:bg-card/60 flex flex-col sm:flex-row group">
         <CardHeader className="p-0 relative h-48 w-full sm:h-auto sm:w-32 flex-shrink-0 overflow-hidden">
            {item.imageUrl ? (
             <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, 128px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.id}/128/192?grayscale`; }} // Fallback with consistent seed
              />
              ) : (
              <div className="h-full w-full bg-muted flex items-center justify-center">
                 {item.type === 'anime' ? <Tv className="w-12 h-12 text-muted-foreground opacity-50" /> :
                  item.type === 'manga' ? <BookText className="w-12 h-12 text-muted-foreground opacity-50" /> :
                  <User className="w-12 h-12 text-muted-foreground opacity-50" />}
              </div>
           )}
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:bg-gradient-to-r sm:from-black/40 sm:via-transparent sm:to-transparent pointer-events-none" />
           {/* Type Badge */}
           <Badge variant="secondary" className="absolute top-2 left-2 text-xs capitalize backdrop-blur-sm bg-background/60">
               {item.type}
           </Badge>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 flex-grow flex flex-col justify-between">
           <div>
              <CardTitle className="text-base sm:text-lg font-semibold mb-1 line-clamp-1 group-hover:text-primary transition-colors">{item.title}</CardTitle>
              {/* Genres for Anime/Manga */}
              {item.type !== 'character' && item.genres && item.genres.length > 0 && (
                  <div className="flex gap-1 mb-2 flex-wrap">
                      {item.genres.slice(0, 3).map((g) => <Badge key={g.mal_id} variant="secondary" className="text-xs">{g.name}</Badge>)}
                  </div>
              )}
               {/* Nicknames for Character */}
               {item.type === 'character' && item.nicknames && item.nicknames.length > 0 && (
                   <p className="text-xs text-muted-foreground mb-1 line-clamp-1">
                       Also known as: {item.nicknames.join(', ')}
                   </p>
               )}
              <CardDescription className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3">
                 {item.description || 'No description available.'}
              </CardDescription>
           </div>
           {/* Details Footer */}
           <div className="flex flex-wrap justify-between items-center text-xs text-muted-foreground border-t border-border/50 pt-2 mt-auto gap-x-3 gap-y-1">
              {/* Anime Details */}
              {item.type === 'anime' && (
                  <>
                  <span className="flex items-center gap-1" title="Year"><CalendarDays size={14} /> {item.year ?? 'N/A'}</span>
                  <span className="flex items-center gap-1" title="Score"><Star size={14} className={item.score ? 'text-yellow-400' : ''}/> {item.score?.toFixed(1) ?? 'N/A'}</span>
                  <span className="flex items-center gap-1" title="Episodes"><Film size={14} /> {item.episodes ?? 'N/A'} Ep</span>
                  <span className="flex items-center gap-1 capitalize" title="Status">{formatStatus(item.status)}</span>
                  </>
              )}
              {/* Manga Details */}
              {item.type === 'manga' && (
                  <>
                   <span className="flex items-center gap-1 capitalize" title="Status">{formatStatus(item.status)}</span>
                   <span className="flex items-center gap-1" title="Score"><Star size={14} className={item.score ? 'text-yellow-400' : ''}/> {item.score?.toFixed(1) ?? 'N/A'}</span>
                   <span className="flex items-center gap-1" title="Chapters"><Layers size={14} /> {item.chapters ?? 'N/A'} Ch</span>
                   <span className="flex items-center gap-1" title="Volumes"><Library size={14} /> {item.volumes ?? 'N/A'} Vol</span>
                  </>
              )}
              {/* Character Details */}
              {item.type === 'character' && item.favorites !== undefined && (
                   <span className="flex items-center gap-1" title="Favorites"><Heart size={14} className="text-pink-500"/> {item.favorites.toLocaleString()}</span>
              )}
               {/* Link to details page */}
               <Button variant="link" size="sm" asChild className="text-xs p-0 h-auto ml-auto self-end">
                   {/* TODO: Character details page might not exist yet, link conditionally or to MAL */}
                   <Link href={item.type === 'character' ? `https://myanimelist.net/character/${item.id}` : linkHref} target={item.type === 'character' ? '_blank' : '_self'} rel="noopener noreferrer">
                      {item.type === 'character' ? 'View on MAL' : 'View Details'}
                   </Link>
              </Button>
           </div>
        </CardContent>
       </Card>
     );
 };

   // Skeleton card remains similar
   const SkeletonCard = () => (
     <Card className="overflow-hidden glass flex flex-col sm:flex-row">
        <CardHeader className="p-0 h-48 w-full sm:h-auto sm:w-32 flex-shrink-0">
           <Skeleton className="h-full w-full" />
        </CardHeader>
        <CardContent className="p-3 sm:p-4 flex-grow flex flex-col justify-between">
           <div>
                <Skeleton className="h-5 w-3/4 mb-2" /> {/* Title */}
                <div className="flex gap-1 mb-2 flex-wrap"> {/* Genres/Tags */}
                    <Skeleton className="h-4 w-14 rounded-full" />
                    <Skeleton className="h-4 w-12 rounded-full" />
                </div>
                <Skeleton className="h-3 w-full mb-1" /> {/* Description */}
                <Skeleton className="h-3 w-5/6" />
            </div>
            <div className="flex justify-between items-center border-t border-border/50 pt-2 mt-auto"> {/* Footer */}
                <Skeleton className="h-3 w-10" />
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-5 w-1/4" /> {/* Button */}
            </div>
        </CardContent>
     </Card>
  );


  // Placeholder options - Adapt genres for Jikan if needed (e.g., use names or IDs)
   const genres = useMemo(() => [
        // Add Jikan genre IDs or fetch dynamically
        { id: "1", name: "Action" }, { id: "2", name: "Adventure" }, { id: "4", name: "Comedy" },
        { id: "8", name: "Drama" }, { id: "10", name: "Fantasy" }, { id: "14", name: "Horror" },
        { id: "7", name: "Mystery" }, { id: "22", name: "Romance" }, { id: "24", name: "Sci-Fi" },
        { id: "36", name: "Slice of Life" }, { id: "30", name: "Sports" }, { id: "37", name: "Supernatural" },
        { id: "41", name: "Thriller" }, { id: "42", name: "Seinen" }, { id: "27", name: "Shounen" }, { id: "25", name: "Shoujo" },
        { id: "13", name: "Historical" }, { id: "17", name: "Martial Arts" }, { id: "18", name: "Mecha"},
        { id: "19", name: "Music" }, { id: "29", name: "Space" }, { id: "31", name: "Super Power"}
    ].sort((a, b) => a.name.localeCompare(b.name)), []);
   const animeStatuses = useMemo(() => [
        { value: "airing", label: "Currently Airing" },
        { value: "complete", label: "Finished Airing" },
        { value: "upcoming", label: "Not Yet Aired" },
    ], []);
   const mangaStatuses = useMemo(() => [
        { value: "publishing", label: "Publishing" },
        { value: "finished", label: "Finished" },
        { value: "on_hiatus", label: "On Hiatus" },
        { value: "discontinued", label: "Discontinued" },
        { value: "upcoming", label: "Not Yet Published" },
    ], []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
         <SearchIcon className="h-7 w-7 text-primary" /> Interactive Search
      </h1>

      {/* Search Input */}
        <div className="relative mb-6">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none z-10" />
            <Input
                type="search"
                placeholder={`Ask Nami anything... (e.g., "isekai anime", "manga like berserk", "find character Naruto")`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full glass neon-glow-focus text-base pr-10" // Added padding-right for clear button
                aria-label="Search AniManga Stream"
            />
             {(loading || isPending) && (
                  <Loader2 className="absolute right-12 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin"/>
             )}
             {searchTerm && !(loading || isPending) && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
                    onClick={() => setSearchTerm('')}
                    aria-label="Clear search"
                >
                    <X size={16} />
                </Button>
            )}
        </div>

        {/* Filters Section */}
         <Card className="mb-6 glass">
             <CardHeader className="flex flex-row items-center justify-between pb-4">
                 <div className="flex items-center gap-2">
                    <Filter size={18} />
                    <CardTitle className="text-lg">Refine Search</CardTitle>
                    <CardDescription className="text-xs hidden sm:block">Apply specific filters</CardDescription>
                 </div>
                 {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs text-muted-foreground hover:text-destructive">
                        <X size={14} className="mr-1"/> Reset Filters
                    </Button>
                 )}
             </CardHeader>
             <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-0">
                  {/* Type Filter */}
                 <div className="space-y-1.5">
                     <Label htmlFor="type-filter">Type</Label>
                      <Select value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'anime' | 'manga' | 'character')}>
                         <SelectTrigger id="type-filter" className="w-full glass text-sm">
                             <SelectValue placeholder="Select Type" />
                         </SelectTrigger>
                         <SelectContent className="glass">
                             <SelectItem value="all">All</SelectItem>
                             <SelectItem value="anime">Anime</SelectItem>
                             <SelectItem value="manga">Manga</SelectItem>
                             <SelectItem value="character">Characters</SelectItem>
                         </SelectContent>
                     </Select>
                 </div>
                 {/* Genre Filter */}
                 <div className="space-y-1.5">
                    <Label htmlFor="genre">Genre</Label>
                     <Select value={genre ?? ANY_GENRE_VALUE} onValueChange={(value) => setGenre(value === ANY_GENRE_VALUE ? undefined : value)}>
                        <SelectTrigger id="genre" className="w-full glass text-sm">
                             <SelectValue placeholder="Any Genre" />
                         </SelectTrigger>
                         <SelectContent className="glass max-h-60">
                             <SelectItem value={ANY_GENRE_VALUE}>Any Genre</SelectItem>
                             {genres.map(g => <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>)}
                         </SelectContent>
                    </Select>
                 </div>

                 {/* Min Score Filter */}
                 <div className="space-y-1.5">
                     <Label htmlFor="minScore" className="text-sm">Min. Score: <span className="font-medium text-primary">{minScore[0].toFixed(1)} ★</span></Label>
                      <Slider
                        id="minScore"
                        min={0}
                        max={10}
                        step={0.5}
                        value={minScore}
                        onValueChange={setMinScore}
                        className="pt-2 [&>span]:bg-primary/20 [&>span>span]:bg-primary"
                      />
                  </div>


                 {/* Status Filter (Conditional based on type?) */}
                 <div className="space-y-1.5">
                     <Label htmlFor="status">Status</Label>
                      <Select value={status ?? ANY_STATUS_VALUE} onValueChange={(value) => setStatus(value === ANY_STATUS_VALUE ? undefined : value)} disabled={activeTab === 'character'}>
                         <SelectTrigger id="status" className="w-full glass text-sm" disabled={activeTab === 'character'}>
                            <SelectValue placeholder={activeTab === 'character' ? 'N/A for Characters' : 'Any Status'}/>
                         </SelectTrigger>
                         <SelectContent className="glass">
                            <SelectItem value={ANY_STATUS_VALUE}>Any Status</SelectItem>
                             {(activeTab === 'anime' ? animeStatuses : mangaStatuses).map(s =>
                                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                             )}
                         </SelectContent>
                     </Select>
                 </div>

            </CardContent>
         </Card>

        {/* AI Analysis & Suggestions */}
        {aiAnalysis && !loading && (
            <Alert className="mb-6 glass border-primary/30">
                 <Sparkles className="h-4 w-4 text-primary" />
                 <AlertTitle className="text-primary">Nami's Analysis</AlertTitle>
                 <AlertDescription className="text-sm">
                     {aiAnalysis}
                 </AlertDescription>
            </Alert>
        )}
        {aiSuggestions.length > 0 && !loading && (
          <div className="mb-6 p-4 rounded-lg glass border border-accent/30">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5 text-accent-foreground/80">
               <Sparkles size={16} /> Nami Suggests:
             </h3>
            <div className="flex flex-wrap gap-2">
              {aiSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="neon-glow-hover text-xs h-8"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && !loading && (
             <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Search Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
             </Alert>
          )}


        {/* Results Section */}
        <section>
          {loading ? (
             <div className="grid grid-cols-1 gap-4">
                 {Array.from({ length: 5 }).map((_, index) => <SkeletonCard key={`skel-${index}`} />)}
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {results.map((item) => (
                 // Ensure unique key using type and MAL ID
                 item && item.id ? <ResultCard key={`${item.type}-${item.id}`} item={item} /> : null
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground mt-12 py-6">
                { (debouncedSearchTerm || hasActiveFilters) && !loading
                  ? "No results found matching your query or filters."
                  : "Start typing or select filters to search for anime, manga, or characters."
                }
            </div>
          )}
          {/* TODO: Add Load More functionality if needed */}
        </section>
    </div>
  );
}
