'use client';

import React, { useState, useEffect, useTransition, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  VisuallyHidden,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle as CardTitlePrimitive, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Search as SearchIcon, Loader2, Sparkles, AlertCircle, X, CalendarDays, Star, Layers, Library, Film, BookText, Tv, User, Heart, Filter, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { aiPoweredSearch, AIPoweredSearchOutput, SearchResult } from '@/ai/flows/ai-powered-search';
import { getAnimes, getMangas } from '@/services'; // Import Jikan-based services
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/use-debounce';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface SearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
  isAiActive: boolean;
  initialSearchTerm?: string;
  onAiToggle: () => void;
  openWithFilters?: boolean; // New prop to control initial filter visibility
}

// Shared constants/data for filters
const ANY_VALUE = "any"; // Generic 'any' value for dropdowns
const DEFAULT_SORT = "rank"; // Default sort for search popup (Jikan rank)

const animeGenres = [
    { id: 1, name: "Action" }, { id: 2, name: "Adventure" }, { id: 4, name: "Comedy" },
    { id: 8, name: "Drama" }, { id: 10, name: "Fantasy" }, { id: 14, name: "Horror" },
    { id: 7, name: "Mystery" }, { id: 22, name: "Romance" }, { id: 24, name: "Sci-Fi" },
    { id: 36, name: "Slice of Life" }, { id: 30, name: "Sports" }, { id: 37, name: "Supernatural" },
    { id: 41, name: "Thriller" },
].sort((a, b) => a.name.localeCompare(b.name));

const mangaGenres = [
    ...animeGenres, // Manga shares many genres
    { id: 42, name: "Seinen" }, { id: 27, name: "Shounen" }, { id: 25, name: "Shoujo" },
].sort((a, b) => a.name.localeCompare(b.name));

const statuses = [ // Combine common anime & manga statuses
    { value: "airing", label: "Airing / Publishing" }, // Combined term
    { value: "complete", label: "Finished" }, // Jikan 'complete' for anime, 'finished' for manga
    { value: "upcoming", label: "Upcoming" },
    { value: "on_hiatus", label: "On Hiatus" },
    { value: "discontinued", label: "Discontinued" },
];

const sortOptions = [
    { value: "rank", label: "Relevance / Rank" }, // Jikan default + Rank
    { value: "popularity", label: "Popularity" },
    { value: "score", label: "Score" },
    { value: "title", label: "Title (A-Z)"},
    { value: "start_date", label: "Start Date (Newest)"},
    { value: "favorites", label: "Favorites" },
];

const contentTypes = [
    { value: "all", label: "Anime & Manga" },
    { value: "anime", label: "Anime Only" },
    { value: "manga", label: "Manga Only" },
];

// Helper function to format status
const formatStatus = (status: string | null): string => {
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
};

// Initial Nami suggestions
const initialAiSuggestions = [
    "Top rated romance anime",
    "Anime similar to Attack on Titan",
    "Recommend a short anime series",
    "This season's most popular anime?",
    "Manga with strong female protagonists"
];

export default function SearchPopup({ isOpen, onClose, isAiActive, initialSearchTerm = '', onAiToggle, openWithFilters = false }: SearchPopupProps) {
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>(initialAiSuggestions);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(!!initialSearchTerm);

  // --- Filter State ---
  const [showFilters, setShowFilters] = useState(openWithFilters);
  const [selectedType, setSelectedType] = useState<string>(ANY_VALUE); // 'all', 'anime', 'manga'
  const [selectedGenre, setSelectedGenre] = useState<string>(ANY_VALUE);
  const [selectedStatus, setSelectedStatus] = useState<string>(ANY_VALUE);
  const [selectedSort, setSelectedSort] = useState<string>(DEFAULT_SORT);
  const [minScore, setMinScore] = useState<string>(''); // Use string for input, parse later
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedMinScore = useDebounce(minScore, 500);

  const hasActiveFilters = useMemo(() => {
    return selectedType !== ANY_VALUE || selectedGenre !== ANY_VALUE || selectedStatus !== ANY_VALUE || !!debouncedMinScore;
  }, [selectedType, selectedGenre, selectedStatus, debouncedMinScore]);

  // Toggle filter visibility
  const toggleFilters = () => setShowFilters(prev => !prev);

  // Reset filters function
  const resetFilters = () => {
    setSelectedType(ANY_VALUE);
    setSelectedGenre(ANY_VALUE);
    setSelectedStatus(ANY_VALUE);
    setMinScore('');
    // setSelectedSort(DEFAULT_SORT); // Optionally reset sort too
    // Re-run search with cleared filters if a term exists
    if (debouncedSearchTerm) {
      handleSearch(debouncedSearchTerm);
    }
  };

  // Update initial filter state when opening with `openWithFilters`
  useEffect(() => {
    if (isOpen && openWithFilters) {
      setShowFilters(true);
    }
  }, [isOpen, openWithFilters]);

  // Update internal search term if initial term changes while open
  useEffect(() => {
      if (isOpen && initialSearchTerm) {
          setSearchTerm(initialSearchTerm);
          setHasSearched(true);
          handleSearch(initialSearchTerm); // Trigger search immediately
      }
      // Ensure filters are shown if `openWithFilters` is true when opening
      if (isOpen && openWithFilters) {
         setShowFilters(true);
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSearchTerm, isOpen, openWithFilters]); // Depend on openWithFilters too

  // Reset state when popup opens/closes
  useEffect(() => {
      if (isOpen) {
          setSearchTerm(initialSearchTerm);
          setHasSearched(!!initialSearchTerm);
           setShowFilters(openWithFilters); // Set filter visibility based on prop
          if (!initialSearchTerm) {
              setResults([]);
              setAiSuggestions(initialAiSuggestions);
              setAiAnalysis(null);
              setError(null);
              setLoading(false);
              resetFilters(); // Reset filters when opening fresh
          }
      } else {
          // Reset everything on close.
          setSearchTerm('');
          setResults([]);
          setAiSuggestions(initialAiSuggestions);
          setAiAnalysis(null);
          setError(null);
          setLoading(false);
          setHasSearched(false);
          setShowFilters(false); // Hide filters on close
          resetFilters(); // Reset filters on close
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);


  const handleSearch = useCallback(async (currentSearchTerm: string) => {
      const term = currentSearchTerm.trim();
      if (!term && !hasActiveFilters) { // Don't search if term is empty AND no filters are active
          setResults([]);
          setAiSuggestions(isAiActive ? initialAiSuggestions : []);
          setAiAnalysis(null);
          setError(null);
          setLoading(false);
          setHasSearched(false);
          return;
      }

      setLoading(true);
      setError(null);
      setAiAnalysis(null);
      setHasSearched(true);

      startTransition(async () => {
          try {
              let searchOutput: AIPoweredSearchOutput;
              if (isAiActive) {
                  // --- AI Search Logic ---
                  const searchInput = { searchTerm: term || "anything", searchType: 'all' as const }; // Use term or default prompt
                  console.log("Performing AI Search with input:", searchInput);
                  searchOutput = await aiPoweredSearch(searchInput);
                  setResults(searchOutput.results || []);
                  setAiSuggestions(searchOutput.suggestions || []);
                  setAiAnalysis(searchOutput.aiAnalysis || null);
                  console.log("AI Search successful");
              } else {
                  // --- Standard Jikan Search Logic with Filters ---
                  console.log("Performing Standard Jikan Search for:", term, "Filters:", { selectedType, selectedGenre, selectedStatus, debouncedMinScore, selectedSort });

                   // Convert minScore string to number, handle invalid input
                  const scoreNum = debouncedMinScore ? parseFloat(debouncedMinScore) : undefined;
                  const validMinScore = scoreNum && !isNaN(scoreNum) && scoreNum >= 0 && scoreNum <= 10 ? scoreNum : undefined;

                  // Prepare service call promises based on selectedType
                  const animePromise = (selectedType === 'all' || selectedType === 'anime')
                    ? getAnimes(
                          selectedGenre === ANY_VALUE ? undefined : selectedGenre,
                          undefined, // Year filter not implemented in this popup
                          validMinScore,
                          term || undefined, // Pass term if present
                          selectedStatus === ANY_VALUE ? undefined : selectedStatus,
                          1, // Always fetch page 1 for popup results
                          selectedSort,
                          12 // Limit results for popup view
                      )
                    : Promise.resolve({ animes: [], hasNextPage: false }); // Empty promise if not searching anime

                  const mangaPromise = (selectedType === 'all' || selectedType === 'manga')
                    ? getMangas(
                          selectedGenre === ANY_VALUE ? undefined : selectedGenre,
                          selectedStatus === ANY_VALUE ? undefined : selectedStatus,
                          term || undefined, // Pass term if present
                          validMinScore,
                          1, // Always fetch page 1
                          selectedSort,
                          12 // Limit results
                      )
                    : Promise.resolve({ mangas: [], hasNextPage: false }); // Empty promise if not searching manga

                  const [animeRes, mangaRes] = await Promise.all([animePromise, mangaPromise]);

                  // Map results to the unified SearchResult format
                  const combinedResults: SearchResult[] = [
                      ...(animeRes.animes || []).map(a => ({
                          id: a.mal_id, title: a.title, imageUrl: a.imageUrl, description: a.synopsis, type: 'anime' as const, genres: a.genres, year: a.year, score: a.score, episodes: a.episodes, status: a.status,
                      })),
                      ...(mangaRes.mangas || []).map(m => ({
                          id: m.mal_id, title: m.title, imageUrl: m.imageUrl, description: m.synopsis, type: 'manga' as const, genres: m.genres, year: m.year, score: m.score, chapters: m.chapters, volumes: m.volumes, status: m.status,
                      }))
                  ].filter(item => item.id != null)
                   .sort((a, b) => { // Prioritize exact title matches, then score/rank
                       const titleA = a.title.toLowerCase();
                       const titleB = b.title.toLowerCase();
                       const termLower = term?.toLowerCase() || '';
                       if (termLower) {
                           if (titleA === termLower && titleB !== termLower) return -1;
                           if (titleB === termLower && titleA !== termLower) return 1;
                       }
                       return (b.score ?? -1) - (a.score ?? -1); // Fallback sort by score
                   });

                  setResults(combinedResults);
                  setAiSuggestions([]); // No AI suggestions
                  setAiAnalysis(null); // No AI analysis
                  console.log(`Standard Search successful, found ${combinedResults.length} items.`);
              }
              setError(null);
          } catch (err: any) {
              console.error(`Search failed (AI Active: ${isAiActive}):`, err);
              const mode = isAiActive ? "Nami" : "Standard search";
              setError(err.message || `${mode} encountered an issue. Please try again.`);
              setResults([]);
              setAiSuggestions([]);
              setAiAnalysis(`${mode} Error: ${err.message}`);
          } finally {
              setLoading(false);
          }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTransition, isAiActive, selectedType, selectedGenre, selectedStatus, debouncedMinScore, selectedSort]); // Include filter states

  // Trigger search on debounced term/filter changes or AI mode change
  useEffect(() => {
    if (isOpen) { // Only search when the popup is open
       // Search if debounced term OR any filter changes
        handleSearch(debouncedSearchTerm);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, isAiActive, selectedType, selectedGenre, selectedStatus, debouncedMinScore, selectedSort, isOpen]);


  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    // The useEffect hook watching debouncedSearchTerm will trigger the search
  };


 // Result Card component (Remains the same)
 const ResultCard = ({ item }: { item: SearchResult }) => {
      const linkHref = item.type !== 'character' ? `/${item.type}/${item.id}` : `https://myanimelist.net/character/${item.id}`;
      const target = item.type === 'character' ? '_blank' : '_self';

     return (
        <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 hover:bg-card/60 flex flex-col sm:flex-row group mb-3 mx-1">
         <CardHeader className="p-0 relative h-36 w-full sm:h-auto sm:w-24 flex-shrink-0 overflow-hidden">
            {item.imageUrl ? (
             <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                sizes="(max-width: 640px) 100vw, 96px"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.id}/96/144?grayscale`; }}
              />
              ) : (
              <div className="h-full w-full bg-muted flex items-center justify-center">
                 {item.type === 'anime' ? <Tv className="w-10 h-10 text-muted-foreground opacity-50" /> :
                  item.type === 'manga' ? <BookText className="w-10 h-10 text-muted-foreground opacity-50" /> :
                  <User className="w-10 h-10 text-muted-foreground opacity-50" />}
              </div>
           )}
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:bg-gradient-to-r sm:from-black/40 sm:via-transparent sm:to-transparent pointer-events-none" />
           <Badge variant="secondary" className="absolute top-1 left-1 text-[10px] capitalize backdrop-blur-sm bg-background/60 px-1 py-0.5">
               {item.type}
           </Badge>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 flex-grow flex flex-col justify-between">
           <div>
              <CardTitlePrimitive className="text-sm font-semibold mb-0.5 line-clamp-1 group-hover:text-primary transition-colors">
                 <Link href={linkHref} target={target} rel="noopener noreferrer" onClick={onClose}>
                    {item.title}
                 </Link>
              </CardTitlePrimitive>
              {item.type !== 'character' && item.genres && item.genres.length > 0 && (
                  <div className="flex gap-1 mb-1 flex-wrap">
                      {item.genres.slice(0, 2).map((g) => <Badge key={g.mal_id} variant="secondary" className="text-[10px] px-1 py-0">{g.name}</Badge>)}
                  </div>
              )}
               {item.type === 'character' && item.nicknames && item.nicknames.length > 0 && (
                   <p className="text-[11px] text-muted-foreground mb-1 line-clamp-1">
                       AKA: {item.nicknames.join(', ')}
                   </p>
               )}
              <CardDescription className="text-xs text-muted-foreground line-clamp-2 mb-2">
                 {item.description || 'No description available.'}
              </CardDescription>
           </div>
           <div className="flex flex-wrap justify-start items-center text-[10px] text-muted-foreground border-t border-border/50 pt-1 mt-auto gap-x-2 gap-y-0.5">
              {item.type === 'anime' && item.score && <span className="flex items-center gap-0.5" title="Score"><Star size={10} className="text-yellow-400"/> {item.score.toFixed(1)}</span>}
              {item.type === 'anime' && item.episodes && <span className="flex items-center gap-0.5" title="Episodes"><Film size={10} /> {item.episodes} Ep</span>}
              {item.type === 'manga' && item.score && <span className="flex items-center gap-0.5" title="Score"><Star size={10} className="text-yellow-400"/> {item.score.toFixed(1)}</span>}
              {item.type === 'manga' && item.chapters && <span className="flex items-center gap-0.5" title="Chapters"><Layers size={10} /> {item.chapters} Ch</span>}
               {item.type === 'manga' && item.volumes && <span className="flex items-center gap-0.5" title="Volumes"><Library size={10} /> {item.volumes} Vol</span>}
              {item.type === 'character' && item.favorites !== undefined && <span className="flex items-center gap-0.5" title="Favorites"><Heart size={10} className="text-pink-500"/> {item.favorites.toLocaleString()}</span>}
           </div>
        </CardContent>
       </Card>
     );
 };

   // Skeleton card (Remains the same)
   const SkeletonCard = () => (
     <Card className="overflow-hidden glass flex flex-col sm:flex-row mb-3 mx-1 animate-pulse">
        <CardHeader className="p-0 h-36 w-full sm:h-auto sm:w-24 flex-shrink-0">
           <Skeleton className="h-full w-full" />
        </CardHeader>
        <CardContent className="p-2 sm:p-3 flex-grow flex flex-col justify-between">
           <div>
                <Skeleton className="h-4 w-3/4 mb-1" />
                <div className="flex gap-1 mb-1 flex-wrap">
                    <Skeleton className="h-3 w-10 rounded-full" />
                    <Skeleton className="h-3 w-12 rounded-full" />
                </div>
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-5/6 mb-2" />
            </div>
            <div className="flex justify-start items-center border-t border-border/50 pt-1 mt-auto gap-2">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-10" />
            </div>
        </CardContent>
     </Card>
  );


  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="glass p-0 sm:p-0 sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[85vh] flex flex-col gap-0 border-primary/30 shadow-2xl"
        >
           <VisuallyHidden><DialogTitle>Search AniManga Stream</DialogTitle></VisuallyHidden>
            <DialogHeader className="p-4 pb-3 border-b border-border/50 flex-shrink-0">
                {/* Input and Buttons Container */}
                <div className="flex items-center gap-2 w-full">
                    {/* Search Input */}
                    <div className="relative flex-grow">
                       <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none z-10">
                           {isAiActive ? (
                              <Sparkles className="h-full w-full text-primary" />
                           ) : (
                              <SearchIcon className="h-full w-full text-muted-foreground" />
                           )}
                       </div>
                       <Input
                           type="search"
                           placeholder={isAiActive ? "Ask Nami anything..." : "Search anime, manga..."}
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           className={cn(
                               "pl-10 pr-4 w-full glass text-base h-11 rounded-full border-2",
                               isAiActive ? "border-primary/60 focus:border-primary" : "border-input focus:border-primary/50"
                           )}
                           aria-label="Search AniManga Stream"
                           autoFocus
                       />
                       {/* Loader inside input area */}
                        {(loading || isPending) && (
                             <div className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin">
                                <Loader2 />
                             </div>
                        )}
                    </div>

                    {/* Filter Toggle Button (only in Standard Mode) */}
                    {!isAiActive && (
                        <Button
                            variant="outline"
                            size="icon"
                            className={cn("h-10 w-10 rounded-full flex-shrink-0 glass", showFilters && "bg-accent text-accent-foreground")}
                            onClick={toggleFilters}
                            aria-pressed={showFilters}
                            aria-label="Toggle Advanced Filters"
                        >
                           <Filter size={18} />
                        </Button>
                    )}

                    {/* Nami AI Toggle Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "h-10 w-10 rounded-full text-primary hover:bg-primary/10 flex-shrink-0",
                            isAiActive && "bg-primary/20 neon-glow"
                        )}
                        onClick={onAiToggle}
                        aria-pressed={isAiActive}
                        aria-label={isAiActive ? "Deactivate AI Search" : "Activate AI Search"}
                    >
                        <Sparkles size={20} />
                    </Button>

                     {/* Close Button */}
                    <DialogClose asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-full text-muted-foreground hover:bg-accent/50 flex-shrink-0"
                            aria-label="Close search popup"
                        >
                            <X size={22} />
                        </Button>
                    </DialogClose>
                </div>
            </DialogHeader>

             {/* Filters Panel (conditional rendering) */}
            {!isAiActive && showFilters && (
                 <div className="p-3 border-b border-border/50 bg-background/50 flex-shrink-0">
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                          {/* Content Type Filter */}
                         <div className="space-y-1">
                             <Label htmlFor="search-type-filter" className="text-muted-foreground">Type</Label>
                             <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger id="search-type-filter" className="w-full glass h-8 text-xs">
                                    <SelectValue placeholder="Any Type" />
                                </SelectTrigger>
                                <SelectContent className="glass max-h-60">
                                    <SelectItem value={ANY_VALUE}>Any Type</SelectItem>
                                    {contentTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                                </SelectContent>
                             </Select>
                         </div>
                         {/* Genre Filter */}
                         <div className="space-y-1">
                            <Label htmlFor="search-genre-filter" className="text-muted-foreground">Genre</Label>
                            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                                <SelectTrigger id="search-genre-filter" className="w-full glass h-8 text-xs">
                                    <SelectValue placeholder="Any Genre" />
                                </SelectTrigger>
                                <SelectContent className="glass max-h-60">
                                    <SelectItem value={ANY_VALUE}>Any Genre</SelectItem>
                                    {(selectedType === 'manga' ? mangaGenres : animeGenres).map(g => <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                         </div>
                          {/* Status Filter */}
                         <div className="space-y-1">
                            <Label htmlFor="search-status-filter" className="text-muted-foreground">Status</Label>
                             <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger id="search-status-filter" className="w-full glass h-8 text-xs">
                                   <SelectValue placeholder="Any Status" />
                                </SelectTrigger>
                                <SelectContent className="glass">
                                   <SelectItem value={ANY_VALUE}>Any Status</SelectItem>
                                   {statuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                </SelectContent>
                             </Select>
                         </div>
                         {/* Min Score Filter */}
                         <div className="space-y-1">
                             <Label htmlFor="search-minscore-filter" className="text-muted-foreground">Min Score</Label>
                             <Input
                                id="search-minscore-filter"
                                type="number"
                                placeholder="e.g., 7.5"
                                value={minScore}
                                onChange={(e) => setMinScore(e.target.value)}
                                className="w-full glass h-8 text-xs"
                                min="0" max="10" step="0.1"
                             />
                         </div>
                         {/* Sort Filter */}
                         <div className="space-y-1">
                            <Label htmlFor="search-sort-filter" className="text-muted-foreground">Sort By</Label>
                             <Select value={selectedSort} onValueChange={setSelectedSort}>
                                <SelectTrigger id="search-sort-filter" className="w-full glass h-8 text-xs">
                                    <SelectValue placeholder="Sort By" />
                                </SelectTrigger>
                                <SelectContent className="glass">
                                    {sortOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                </SelectContent>
                             </Select>
                         </div>
                     </div>
                     {hasActiveFilters && (
                         <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs text-muted-foreground hover:text-destructive mt-2 h-auto p-1">
                             <X size={12} className="mr-1"/> Reset Filters
                         </Button>
                      )}
                 </div>
             )}


          {/* Content Area: Suggestions or Results */}
          <ScrollArea className="flex-grow overflow-y-auto px-2 pt-3">
            {/* Loading State */}
            {loading && (
              <div className="space-y-3 px-2">
                 {Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={`skel-${index}`} />)}
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <Alert variant="destructive" className="m-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Search Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

             {/* Initial State & AI Suggestions (Only if AI is active and no search term) */}
             {!loading && !error && !searchTerm && isAiActive && !hasSearched && (
                 <div className="px-2 py-4">
                     <h3 className="text-sm font-semibold mb-3 text-muted-foreground px-1">Try asking Nami:</h3>
                     <div className="space-y-2">
                         {initialAiSuggestions.map((suggestion, index) => (
                             <Button
                                key={index}
                                variant="ghost"
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full justify-start text-left h-auto py-2 px-3 text-muted-foreground hover:text-primary hover:bg-primary/10"
                             >
                                 {suggestion}
                             </Button>
                         ))}
                     </div>
                 </div>
             )}

            {/* Results State */}
            {!loading && !error && hasSearched && results.length > 0 && (
                 <div className="space-y-0 pb-4">
                    {/* AI Analysis (Only if AI is active) */}
                     {isAiActive && aiAnalysis && (
                         <Alert className="m-2 glass border-primary/30 mb-3 text-xs">
                              <Sparkles className="h-3 w-3 text-primary" />
                              <AlertTitle className="text-primary text-xs font-semibold">Nami's Analysis</AlertTitle>
                              <AlertDescription className="text-xs">{aiAnalysis}</AlertDescription>
                         </Alert>
                     )}
                     {/* AI Suggestions After Search (Only if AI is active) */}
                     {isAiActive && aiSuggestions.length > 0 && (
                       <div className="mb-3 px-2">
                         <h3 className="text-xs font-semibold mb-1 text-muted-foreground">Nami Suggests:</h3>
                         <div className="flex flex-wrap gap-1.5">
                           {aiSuggestions.map((suggestion, index) => (
                             <Button key={index} variant="outline" size="sm" onClick={() => handleSuggestionClick(suggestion)} className="neon-glow-hover text-[11px] h-7 px-2 py-1 glass">{suggestion}</Button>
                           ))}
                         </div>
                       </div>
                     )}
                     {/* Result Cards */}
                    {results.map((item) => (
                        item && item.id ? <ResultCard key={`${item.type}-${item.id}-${Date.now()}`} item={item} /> : null // Added timestamp to key temporarily
                    ))}
                </div>
            )}

             {/* No Results State */}
            {!loading && !error && hasSearched && results.length === 0 && (
                <div className="text-center text-muted-foreground py-10 px-4">
                    <p>No results found for "{searchTerm}"{hasActiveFilters ? " with the selected filters" : ""}.</p>
                     {isAiActive && aiSuggestions.length > 0 && (
                         <div className="mt-4">
                            <p className="text-sm mb-2">Maybe try:</p>
                             <div className="flex flex-wrap gap-2 justify-center">
                                {aiSuggestions.map((suggestion, index) => ( <Button key={index} variant="outline" size="sm" onClick={() => handleSuggestionClick(suggestion)} className="neon-glow-hover text-xs h-8 glass">{suggestion}</Button> ))}
                            </div>
                        </div>
                     )}
                </div>
            )}

             {/* Prompt to enter search if popup is open but no search has been made */}
             {!loading && !error && !hasSearched && !isAiActive && (
                 <div className="text-center text-muted-foreground py-10 px-4">
                     <p>Enter a search term or use filters.</p>
                 </div>
             )}


          </ScrollArea>
        </DialogContent>
      </Dialog>
  );
}
