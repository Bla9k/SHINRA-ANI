
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
import { Search as SearchIcon, Loader2, Sparkles, Filter, AlertCircle, X, CalendarDays, Star, Layers, Library, Film, BookText, Tv } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { aiPoweredSearch, AIPoweredSearchOutput } from '@/ai/flows/ai-powered-search'; // Keep AI flow for suggestions
import { Anime, getAnimes } from '@/services/anime'; // Import Jikan-based anime service
import { Manga, getMangas } from '@/services/manga'; // Import Jikan-based manga service
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/use-debounce';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Combine types using Jikan structure
type SearchResultItem = (Anime | Manga) & {
  id: number; // Use mal_id
  title: string;
  type: 'anime' | 'manga';
  imageUrl?: string | null;
  description?: string | null; // Use synopsis
  // Add other relevant fields from Jikan types if needed for display
  genres?: { name: string; mal_id: number }[];
  score?: number | null;
  year?: number | null;
  episodes?: number | null;
  chapters?: number | null;
  volumes?: number | null;
  status?: string | null;
};

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
  const [activeTab, setActiveTab] = useState<'anime' | 'manga'>('anime');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1); // For potential future pagination
  const [hasNextPage, setHasNextPage] = useState(true); // For potential future pagination

  // Filters State - Adapt for Jikan parameters
  const [genre, setGenre] = useState<string | undefined>(undefined); // Jikan uses genre IDs/names
  const [year, setYear] = useState<number | undefined>(undefined); // Use optional year
  const [minScore, setMinScore] = useState<number[]>([0]); // Jikan uses min_score (0-10)
  const [status, setStatus] = useState<string | undefined>(undefined); // Jikan status strings

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const hasActiveFilters = useMemo(() => {
    return !!genre || !!year || minScore[0] !== 0 || !!status;
  }, [genre, year, minScore, status]);


  const handleSearch = async (currentSearchTerm: string, currentTab: 'anime' | 'manga') => {
      if (!currentSearchTerm.trim() && !hasActiveFilters) {
          setResults([]);
          setAiSuggestions([]);
          setError(null);
          setLoading(false);
          return;
      }

      setLoading(true);
      setError(null);

      startTransition(async () => {
          try {
              let fetchedResults: SearchResultItem[] = [];

              // Map "any" values back to undefined for API call
              const genreParam = genre === ANY_GENRE_VALUE ? undefined : genre;
              const statusParam = status === ANY_STATUS_VALUE ? undefined : status;
              const minScoreParam = minScore[0] === 0 ? undefined : minScore[0];

              // 1. Fetch initial results from Jikan
              if (currentTab === 'anime') {
                  const response = await getAnimes(
                      genreParam,
                      year,
                      minScoreParam,
                      currentSearchTerm.trim() || undefined,
                      statusParam,
                      1 // Start with page 1 for new search
                  );
                  // Map Jikan Anime to SearchResultItem
                  fetchedResults = response.animes.map(a => ({ ...a, id: a.mal_id, description: a.synopsis }));
                  setHasNextPage(response.hasNextPage);
              } else {
                   const response = await getMangas(
                      genreParam,
                      statusParam,
                      currentSearchTerm.trim() || undefined,
                      minScoreParam,
                      1 // Start with page 1
                  );
                  // Map Jikan Manga to SearchResultItem
                  fetchedResults = response.mangas.map(m => ({ ...m, id: m.mal_id, description: m.synopsis }));
                  setHasNextPage(response.hasNextPage);
              }
              setResults(fetchedResults);
              setCurrentPage(1); // Reset page on new search

              // 2. Fetch AI Suggestions (still useful) - Adapt input if necessary
              try {
                  const suggestionInput = {
                      searchTerm: currentSearchTerm.trim(),
                      searchType: currentTab,
                      genre: genreParam, // Pass potentially undefined genre
                      status: currentTab === 'manga' ? statusParam : undefined, // Pass potentially undefined status
                       // Potentially pass year or score if the AI flow uses them
                       year: year,
                       minScore: minScoreParam,
                       initialResultsCount: fetchedResults.length,
                       exampleResults: fetchedResults.slice(0, 5).map(r => ({
                           title: r.title,
                           genres: r.genres?.map(g => g.name) || [], // Provide Jikan genre names
                       })),
                  };
                  const aiOutput: AIPoweredSearchOutput = await aiPoweredSearch(suggestionInput);
                  setAiSuggestions(aiOutput.suggestions || []);
              } catch (aiError: any) {
                   console.warn("Failed to get AI suggestions:", aiError);
                   setAiSuggestions([]); // Clear suggestions if AI fails
              }

          } catch (err: any) {
              console.error('Search failed:', err);
              setError(err.message || `Could not fetch results. Please try again.`);
              setResults([]);
              setAiSuggestions([]);
          } finally {
              setLoading(false);
          }
      });
  };

  // Trigger search on changes
  useEffect(() => {
      handleSearch(debouncedSearchTerm, activeTab);
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, activeTab, genre, year, minScore, status]);


  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    // The useEffect will automatically trigger the search
  };

  const resetFilters = () => {
      setGenre(undefined);
      setYear(undefined);
      setMinScore([0]);
      setStatus(undefined);
      // The useEffect will trigger a new search
  };

 // Adapt ResultCard for Jikan data structure
 const ResultCard = ({ item }: { item: SearchResultItem }) => (
    <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 hover:bg-card/60 flex flex-col sm:flex-row group">
      <CardHeader className="p-0 relative h-48 w-full sm:h-auto sm:w-32 flex-shrink-0 overflow-hidden">
        {item.imageUrl ? (
             <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, 128px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            ) : (
            <div className="h-full w-full bg-muted flex items-center justify-center">
                {item.type === 'anime' ? <Tv className="w-12 h-12 text-muted-foreground" /> : <BookText className="w-12 h-12 text-muted-foreground" />}
            </div>
         )}
         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:bg-gradient-to-r sm:from-black/40 sm:via-transparent sm:to-transparent pointer-events-none" />
      </CardHeader>
      <CardContent className="p-3 sm:p-4 flex-grow flex flex-col justify-between">
         <div>
            <CardTitle className="text-base sm:text-lg font-semibold mb-1 line-clamp-1 group-hover:text-primary transition-colors">{item.title}</CardTitle>
            <div className="flex gap-1 mb-2 flex-wrap">
             {/* Use Jikan genres */}
            {item.genres?.slice(0, 3).map((g) => <Badge key={g.mal_id} variant="secondary" className="text-xs">{g.name}</Badge>)}
            </div>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3">
            {/* Use Jikan synopsis (mapped to description) */}
            {item.description || 'No description available.'}
            </CardDescription>
         </div>
         {/* Adapt Details Footer for Jikan data */}
         <div className="flex flex-wrap justify-between items-center text-xs text-muted-foreground border-t border-border/50 pt-2 mt-auto gap-x-3 gap-y-1">
            {item.type === 'anime' && (
                <>
                <span className="flex items-center gap-1"><CalendarDays size={14} /> {item.year ?? 'N/A'}</span>
                <span className="flex items-center gap-1"><Star size={14} className={item.score ? 'text-yellow-400' : ''}/> {item.score?.toFixed(1) ?? 'N/A'}</span>
                <span className="flex items-center gap-1"><Film size={14} /> {item.episodes ?? 'N/A'} Ep</span>
                </>
            )}
            {item.type === 'manga' && (
                <>
                 <span className="flex items-center gap-1">
                     <Badge
                         variant={ // Adapt based on Jikan status strings
                            item.status === 'Publishing' ? 'default' :
                            item.status === 'Finished' ? 'secondary' :
                            item.status === 'On Hiatus' || item.status === 'Discontinued' ? 'destructive' :
                            'outline'
                         }
                         className="text-xs px-1.5 py-0.5"
                         >
                         {formatStatus(item.status)}
                      </Badge>
                 </span>
                  <span className="flex items-center gap-1"><Star size={14} className={item.score ? 'text-yellow-400' : ''}/> {item.score?.toFixed(1) ?? 'N/A'}</span>
                <span className="flex items-center gap-1"><Layers size={14} /> {item.chapters ?? 'N/A'} Ch</span>
                <span className="flex items-center gap-1"><Library size={14} /> {item.volumes ?? 'N/A'} Vol</span>
                </>
            )}
             {/* Link using MAL ID */}
             <Button variant="link" size="sm" asChild className="text-xs p-0 h-auto ml-auto">
                 <Link href={`/${item.type}/${item.id}`}>
                    View Details
                 </Link>
            </Button>
         </div>
      </CardContent>
    </Card>
  );

   // Skeleton card remains similar
   const SkeletonCard = () => (
     <Card className="overflow-hidden glass flex flex-col sm:flex-row">
        <CardHeader className="p-0 h-48 w-full sm:h-auto sm:w-32 flex-shrink-0">
           <Skeleton className="h-full w-full" />
        </CardHeader>
        <CardContent className="p-3 sm:p-4 flex-grow flex flex-col justify-between">
           <div>
                <Skeleton className="h-5 w-3/4 mb-2" /> {/* Title */}
                <div className="flex gap-1 mb-2 flex-wrap"> {/* Genres */}
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
  // Jikan might require specific IDs for filtering. Fetching these dynamically is best.
   const genres = useMemo(() => [
        { id: 1, name: "Action" }, { id: 2, name: "Adventure" }, { id: 4, name: "Comedy" },
        { id: 8, name: "Drama" }, { id: 10, name: "Fantasy" }, { id: 14, name: "Horror" },
        { id: 7, name: "Mystery" }, { id: 22, name: "Romance" }, { id: 24, name: "Sci-Fi" },
        { id: 36, name: "Slice of Life" }, { id: 30, name: "Sports" }, { id: 37, name: "Supernatural" },
        { id: 41, name: "Thriller" }, { id: 42, name: "Seinen" }, { id: 27, name: "Shounen" }, { id: 25, name: "Shoujo" },
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
      <h1 className="text-3xl font-bold mb-6">Interactive Search</h1>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'anime' | 'manga')} className="w-full">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
           <TabsList className="glass shrink-0">
             <TabsTrigger value="anime" className="data-[state=active]:neon-glow">Anime</TabsTrigger>
             <TabsTrigger value="manga" className="data-[state=active]:neon-glow">Manga</TabsTrigger>
           </TabsList>
            <div className="relative flex-grow w-full">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                    type="search"
                    placeholder={`Search ${activeTab}... (e.g., title, character)`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full glass neon-glow-focus text-base"
                    aria-label={`Search ${activeTab}`}
                />
                 {searchTerm && (
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
        </div>

        {/* Filters Section - Adapt for Jikan */}
         <Card className="mb-6 glass">
             <CardHeader className="flex flex-row items-center justify-between pb-4">
                 <div className="flex items-center gap-2">
                    <Filter size={18} />
                    <CardTitle className="text-lg">Filters</CardTitle>
                 </div>
                 {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs text-muted-foreground hover:text-destructive">
                        <X size={14} className="mr-1"/> Reset Filters
                    </Button>
                 )}
             </CardHeader>
             <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-0">
                 {/* Genre Filter (Using names, might need IDs for Jikan) */}
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


                 {/* Status Filter */}
                 <div className="space-y-1.5">
                     <Label htmlFor="status">Status</Label>
                      <Select value={status ?? ANY_STATUS_VALUE} onValueChange={(value) => setStatus(value === ANY_STATUS_VALUE ? undefined : value)}>
                         <SelectTrigger id="status" className="w-full glass text-sm">
                            <SelectValue placeholder="Any Status" />
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


        {/* AI Suggestions */}
        {isPending && searchTerm && (
             <div className="mb-6 text-center text-muted-foreground text-sm">
                <Loader2 className="inline-block animate-spin mr-2 h-4 w-4" /> Asking Nami for suggestions...
            </div>
         )}
        {!isPending && aiSuggestions.length > 0 && (
          <div className="mb-6 p-4 rounded-lg glass border border-primary/30">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-1.5 text-primary">
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

        {/* Results Section */}
        <TabsContent value={activeTab}>
          {loading && !isPending ? (
             <div className="grid grid-cols-1 gap-4">
                 {Array.from({ length: 5 }).map((_, index) => <SkeletonCard key={`skel-${index}`} />)}
            </div>
          ) : error ? (
             <Alert variant="destructive" className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Search Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
             </Alert>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {results.map((item) => (
                 // Use MAL ID as key
                <ResultCard key={`${item.type}-${item.id}`} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground mt-12 py-6">
                { (debouncedSearchTerm || hasActiveFilters)
                  ? "No results found. Try adjusting your search or filters."
                  : "Start typing or select filters to search."
                }
            </div>
          )}
          {/* TODO: Add Load More functionality for search results if needed */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
