
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
import { Search as SearchIcon, Loader2, Sparkles, Filter, AlertCircle, X, CalendarDays, Star, Layers, Library, Film } from 'lucide-react'; // Added icons
import { Skeleton } from '@/components/ui/skeleton';
import { aiPoweredSearch, AIPoweredSearchOutput } from '@/ai/flows/ai-powered-search';
import { Anime, getAnimes } from '@/services/anime';
import { Manga, getMangas } from '@/services/manga';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/use-debounce';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Combine types using AniList structure
type SearchResultItem = (Partial<Anime> & Partial<Manga>) & {
  id: number; // Use AniList ID
  title: string;
  type: 'anime' | 'manga';
  imageUrl?: string | null;
  description?: string | null;
  genre?: string[];
  // Anime specific
  releaseYear?: number | null;
  rating?: number | null; // 0-10 scale
  episodes?: number | null;
  // Manga specific
  status?: string | null; // AniList status enum (e.g., RELEASING)
  chapters?: number | null;
  volumes?: number | null;
};

// Helper function to format status (consistent with manga page)
const formatStatus = (status: string | null): string => {
    if (!status) return 'N/A';
    return status
        .toLowerCase()
        .replace(/_/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export default function SearchPage() {
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'anime' | 'manga'>('anime');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters State - Use nullish coalescing for defaults to avoid confusion with 0/empty string
  const [genre, setGenre] = useState<string | undefined>(undefined);
  const [releaseYear, setReleaseYear] = useState<number[]>([2000]); // Default year for anime
  const [rating, setRating] = useState<number[]>([0]); // Default rating for anime (start from 0)
  const [status, setStatus] = useState<string | undefined>(undefined); // For manga

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const hasActiveFilters = useMemo(() => {
    return !!genre || releaseYear[0] !== 2000 || rating[0] !== 0 || !!status;
  }, [genre, releaseYear, rating, status]);


  const handleSearch = async (currentSearchTerm: string, currentTab: 'anime' | 'manga') => {
      // Only trigger search if there's a search term or active filters
      if (!currentSearchTerm.trim() && !hasActiveFilters) {
          setResults([]);
          setAiSuggestions([]);
          setError(null);
          setLoading(false); // Ensure loading is false if nothing to search
          return;
      }

      setLoading(true);
      setError(null);
      // Don't clear suggestions immediately, let the flow update them
      // setAiSuggestions([]);

      startTransition(async () => {
          try {
              // Prepare input for the Genkit flow
              const searchInput = {
                  searchTerm: currentSearchTerm.trim(),
                  searchType: currentTab,
                  genre: genre || undefined, // Pass undefined if empty string
                  // Pass filters only if they are relevant to the current tab and have non-default values
                  releaseYear: currentTab === 'anime' && releaseYear[0] !== 2000 ? releaseYear[0] : undefined,
                  rating: currentTab === 'anime' && rating[0] !== 0 ? rating[0] : undefined,
                  status: currentTab === 'manga' && status ? status : undefined,
              };

              // Call the AI-powered search flow
              const output: AIPoweredSearchOutput = await aiPoweredSearch(searchInput);

              // Map the raw results from the flow (which should already be using AniList data)
              const formattedResults: SearchResultItem[] = output.results.map(r => ({
                  // Spread the result from the flow output
                  ...r,
                  // Ensure the 'type' is correctly set based on the active tab
                  type: currentTab,
                  // Ensure id is a number, handle potential inconsistencies if necessary
                  id: typeof r.id === 'number' ? r.id : parseInt(r.id as any, 10) || Date.now(), // Fallback ID if parsing fails
                  // Ensure title is always a string
                  title: r.title || 'Untitled',
                   // Map genres if they exist
                  genre: r.genre || [],
                  // Safely access potentially nullable fields
                  releaseYear: r.releaseYear ?? null,
                  rating: r.rating ?? null,
                  description: r.description ?? null,
                  imageUrl: r.imageUrl ?? null,
                  status: r.status ?? null,
                  episodes: r.episodes ?? null,
                  chapters: r.chapters ?? null,
                  volumes: r.volumes ?? null,

              }));

              setResults(formattedResults);
              setAiSuggestions(output.suggestions || []); // Ensure suggestions is an array

          } catch (err: any) {
              console.error('Search failed:', err);
              setError(err.message || `Nami couldn't fetch results. Please try again.`);
              setResults([]); // Clear results on error
              setAiSuggestions([]); // Clear suggestions on error
          } finally {
              setLoading(false);
          }
      });
  };

  useEffect(() => {
      // Trigger search when debounced term or any filter changes
      handleSearch(debouncedSearchTerm, activeTab);
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, activeTab, genre, releaseYear, rating, status]);


  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    // The useEffect will automatically trigger the search due to debouncedSearchTerm change
  };

  const resetFilters = () => {
      setGenre(undefined);
      setReleaseYear([2000]);
      setRating([0]);
      setStatus(undefined);
      // The useEffect will trigger a new search with reset filters
  };

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
            {item.genre?.slice(0, 3).map((g) => <Badge key={g} variant="secondary" className="text-xs">{g}</Badge>)}
            </div>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3">
            {item.description || 'No description available.'}
            </CardDescription>
         </div>
         {/* Details Footer */}
         <div className="flex flex-wrap justify-between items-center text-xs text-muted-foreground border-t border-border/50 pt-2 mt-auto gap-x-3 gap-y-1">
            {item.type === 'anime' && (
                <>
                <span className="flex items-center gap-1"><CalendarDays size={14} /> {item.releaseYear ?? 'N/A'}</span>
                <span className="flex items-center gap-1"><Star size={14} className={item.rating ? 'text-yellow-400' : ''}/> {item.rating?.toFixed(1) ?? 'N/A'}</span>
                <span className="flex items-center gap-1"><Film size={14} /> {item.episodes ?? 'N/A'} Ep</span>
                </>
            )}
            {item.type === 'manga' && (
                <>
                 <span className="flex items-center gap-1">
                     <Badge
                         variant={
                             item.status === 'RELEASING' ? 'default' :
                             item.status === 'FINISHED' ? 'secondary' :
                             item.status === 'HIATUS' ? 'destructive' :
                             'outline'
                         }
                         className="text-xs px-1.5 py-0.5"
                         >
                         {formatStatus(item.status)}
                      </Badge>
                 </span>
                <span className="flex items-center gap-1"><Layers size={14} /> {item.chapters ?? 'N/A'} Ch</span>
                <span className="flex items-center gap-1"><Library size={14} /> {item.volumes ?? 'N/A'} Vol</span>
                </>
            )}
             <Button variant="link" size="sm" asChild className="text-xs p-0 h-auto ml-auto">
                 <Link href={`/${item.type}/${item.id}-${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                    View Details
                 </Link>
            </Button>
         </div>
      </CardContent>
    </Card>
  );

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


  // Placeholder options - Can be fetched dynamically in the future
  const genres = useMemo(() => ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Sci-Fi", "Slice of Life", "Romance", "Horror", "Supernatural", "Mystery", "Psychological", "Thriller", "Historical", "Mecha", "Sports"].sort(), []);
  const mangaStatuses = useMemo(() => ["RELEASING", "FINISHED", "NOT_YET_RELEASED", "CANCELLED", "HIATUS"], []); // AniList statuses

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
                className="pl-10 w-full glass neon-glow-focus text-base" // Larger text
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

        {/* Filters Section */}
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
                 {/* Genre Filter */}
                 <div className="space-y-1.5">
                    <Label htmlFor="genre">Genre</Label>
                     <Select value={genre} onValueChange={setGenre}>
                        <SelectTrigger id="genre" className="w-full glass text-sm">
                             <SelectValue placeholder="Any Genre" />
                         </SelectTrigger>
                         <SelectContent className="glass max-h-60">
                            {/* Remove the item with empty string value */}
                             {/* <SelectItem value="">Any Genre</SelectItem> */}
                             {genres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                         </SelectContent>
                    </Select>
                 </div>

                 {/* Anime Specific Filters */}
                 {activeTab === 'anime' && (
                     <>
                        <div className="space-y-1.5">
                             <Label htmlFor="releaseYear" className="text-sm">Min. Year: <span className="font-medium text-primary">{releaseYear[0]}</span></Label>
                             <Slider
                                 id="releaseYear"
                                 min={1960} // Adjusted min year
                                 max={new Date().getFullYear()}
                                 step={1}
                                 value={releaseYear}
                                 onValueChange={setReleaseYear}
                                 className="pt-2 [&>span]:bg-primary/20 [&>span>span]:bg-primary"
                              />
                         </div>
                         <div className="space-y-1.5">
                             <Label htmlFor="rating" className="text-sm">Min. Rating: <span className="font-medium text-primary">{rating[0].toFixed(1)} ★</span></Label>
                              <Slider
                                id="rating"
                                min={0}
                                max={10}
                                step={0.5}
                                value={rating}
                                onValueChange={setRating}
                                className="pt-2 [&>span]:bg-primary/20 [&>span>span]:bg-primary"
                              />
                          </div>
                     </>
                  )}

                 {/* Manga Specific Filters */}
                 {activeTab === 'manga' && (
                     <div className="space-y-1.5 md:col-start-2"> {/* Align with anime filters */}
                         <Label htmlFor="status">Status</Label>
                          <Select value={status} onValueChange={setStatus}>
                             <SelectTrigger id="status" className="w-full glass text-sm">
                                <SelectValue placeholder="Any Status" />
                             </SelectTrigger>
                             <SelectContent className="glass">
                                {/* Remove the item with empty string value */}
                                 {/* <SelectItem value="">Any Status</SelectItem> */}
                                 {mangaStatuses.map(s => <SelectItem key={s} value={s}>{formatStatus(s)}</SelectItem>)}
                             </SelectContent>
                         </Select>
                     </div>
                 )}
            </CardContent>
         </Card>


        {/* AI Suggestions */}
        {isPending && searchTerm && ( // Show loader for suggestions only when pending and user is typing
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
          {loading && !isPending ? ( // Show main loading state only if not debouncing/transitioning
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
                <ResultCard key={`${item.type}-${item.id}`} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground mt-12 py-6">
                { (debouncedSearchTerm || hasActiveFilters)
                  ? "No results found. Try adjusting your search or filters."
                  : "Start typing or select filters to search for anime or manga."
                }
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
