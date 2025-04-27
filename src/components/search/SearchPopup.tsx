
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
import { aiPoweredSearch, AIPoweredSearchOutput, SearchResult, AIPoweredSearchInput } from '@/ai/flows/ai-powered-search';
import { getAnimes, getMangas, AnimeResponse, MangaResponse, Anime, Manga } from '@/services'; // Import Jikan-based services & types
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

// Use Jikan genre IDs directly as values
const animeGenres = [
    { id: "1", name: "Action" }, { id: "2", name: "Adventure" }, { id: "4", name: "Comedy" },
    { id: "8", name: "Drama" }, { id: "10", name: "Fantasy" }, { id: "14", name: "Horror" },
    { id: "7", name: "Mystery" }, { id: "22", name: "Romance" }, { id: "24", name: "Sci-Fi" },
    { id: "36", name: "Slice of Life" }, { id: "30", name: "Sports" }, { id: "37", name: "Supernatural" },
    { id: "41", name: "Thriller" }, { id: "62", name: "Isekai" }, { id: "40", name: "Psychological"}
].sort((a, b) => a.name.localeCompare(b.name));

const mangaGenres = [
    ...animeGenres, // Manga shares many genres
    { id: "42", name: "Seinen" }, { id: "27", name: "Shounen" }, { id: "25", name: "Shoujo" },
].sort((a, b) => a.name.localeCompare(b.name));

const statuses = [ // Combine common anime & manga statuses - Jikan API values
    { value: "airing", label: "Airing" },
    { value: "complete", label: "Finished Airing (Anime)" }, // Anime status
    { value: "upcoming", label: "Upcoming" },
    { value: "finished", label: "Finished (Manga)" }, // Manga status
    { value: "publishing", label: "Publishing (Manga)"}, // Manga status
    { value: "on_hiatus", label: "On Hiatus" },
    { value: "discontinued", label: "Discontinued" },
];

const sortOptions = [ // Jikan API sort values
    { value: "rank", label: "Relevance / Rank" },
    { value: "popularity", label: "Popularity" },
    { value: "score", label: "Score" },
    { value: "title", label: "Title (A-Z)"}, // Requires sort=asc
    { value: "start_date", label: "Start Date (Newest)"},
    { value: "favorites", label: "Favorites" },
    { value: "episodes", label: "Episodes (Anime)" },
    { value: "chapters", label: "Chapters (Manga)" },
    { value: "volumes", label: "Volumes (Manga)" },
];

const contentTypes = [
    { value: ANY_VALUE, label: "Anime & Manga" },
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
  const [aiSuggestions, setAiSuggestions] = useState<string[]>(isAiActive ? initialAiSuggestions : []); // Show initial suggestions only if AI is active initially
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false); // Track if a search has been attempted

  // --- Filter State ---
  const [showFilters, setShowFilters] = useState(openWithFilters);
  const [selectedType, setSelectedType] = useState<string>(ANY_VALUE);
  const [selectedGenre, setSelectedGenre] = useState<string>(ANY_VALUE);
  const [selectedStatus, setSelectedStatus] = useState<string>(ANY_VALUE);
  const [selectedSort, setSelectedSort] = useState<string>(DEFAULT_SORT);
  const [minScore, setMinScore] = useState<string>('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedMinScore = useDebounce(minScore, 500);

  const hasActiveFilters = useMemo(() => {
    return selectedType !== ANY_VALUE || selectedGenre !== ANY_VALUE || selectedStatus !== ANY_VALUE || !!debouncedMinScore;
  }, [selectedType, selectedGenre, selectedStatus, debouncedMinScore]);

  const toggleFilters = () => setShowFilters(prev => !prev);

  const resetFilters = useCallback(() => {
      console.log("[SearchPopup] Resetting filters");
      setSelectedType(ANY_VALUE);
      setSelectedGenre(ANY_VALUE);
      setSelectedStatus(ANY_VALUE);
      setMinScore('');
      // Optionally reset sort: setSelectedSort(DEFAULT_SORT);
  }, []);

  // Update state when opening/closing or when initial props change
  useEffect(() => {
    if (isOpen) {
        console.log("[SearchPopup] Opened. AI Active:", isAiActive, "Initial Term:", initialSearchTerm, "Open with filters:", openWithFilters);
        setSearchTerm(initialSearchTerm);
        setHasSearched(false); // Reset search status on open unless term exists
        setShowFilters(openWithFilters); // Set filter visibility based on prop
        setAiSuggestions(isAiActive ? initialAiSuggestions : []); // Reset AI suggestions based on mode
        setResults([]);
        setAiAnalysis(null);
        setError(null);
        setLoading(false);

        if (initialSearchTerm) {
            console.log("[SearchPopup] Triggering initial search for:", initialSearchTerm);
            handleSearch(initialSearchTerm); // Trigger search if opened with a term
        } else if (!openWithFilters) {
             resetFilters(); // Only reset filters if not explicitly opening with filters
        }

    } else {
        console.log("[SearchPopup] Closed. Resetting state.");
        // Reset everything on close.
        setSearchTerm('');
        setResults([]);
        setAiSuggestions(initialAiSuggestions);
        setAiAnalysis(null);
        setError(null);
        setLoading(false);
        setHasSearched(false);
        setShowFilters(false);
        resetFilters();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialSearchTerm, openWithFilters, isAiActive]); // Add isAiActive to reset suggestions correctly


  const handleSearch = useCallback(async (currentSearchTerm: string) => {
      const term = currentSearchTerm.trim();
      const isStandardSearch = !isAiActive;
      const isFilterSearch = isStandardSearch && hasActiveFilters && !term; // Search triggered only by filters
      console.log(`[SearchPopup] handleSearch called. Term: "${term}", AI: ${isAiActive}, Standard: ${isStandardSearch}, Filters Active: ${hasActiveFilters}, Filter-Only Search: ${isFilterSearch}`);

      // Allow search if term exists OR if it's a filter-only search in standard mode
      if (!term && !isFilterSearch) {
          console.log("[SearchPopup] Skipping search: No term and not a filter-only search.");
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
      setAiAnalysis(null); // Clear previous analysis
      setResults([]); // Clear previous results immediately
      setHasSearched(true);
      console.log("[SearchPopup] Setting loading=true, hasSearched=true");

      startTransition(async () => {
          try {
              if (isAiActive) {
                  // --- AI Search Logic ---
                  // Use the simplified AIPoweredSearchInput
                  const searchInput: AIPoweredSearchInput = { searchTerm: term || "show me something interesting" }; // Use term or default prompt
                  console.log("[SearchPopup] Performing AI Search with input:", searchInput);
                  const searchOutput = await aiPoweredSearch(searchInput);
                  console.log("[SearchPopup] AI Search Response:", searchOutput);
                  // Deduplicate AI results based on type and id - adding index for safety
                  const uniqueAiResults = Array.from(new Map((searchOutput.results || []).map((item, index) => [`${item.type}-${item.id}-${index}`, item])).values());
                  setResults(uniqueAiResults);
                  setAiSuggestions(searchOutput.suggestions || []);
                  setAiAnalysis(searchOutput.aiAnalysis || null);
                  setError(null);
                  console.log("[SearchPopup] AI Search successful. Results:", uniqueAiResults.length);
              } else {
                  // --- Standard Jikan Search Logic with Filters ---
                  console.log("[SearchPopup] Performing Standard Jikan Search. Term:", term, "Filters:", { selectedType, selectedGenre, selectedStatus, debouncedMinScore, selectedSort });

                  const scoreNum = debouncedMinScore ? parseFloat(debouncedMinScore) : undefined;
                  const validMinScore = scoreNum && !isNaN(scoreNum) && scoreNum >= 0 && scoreNum <= 10 ? scoreNum : undefined;

                  // Map 'any' values to undefined for API calls
                  const typeParam = selectedType === ANY_VALUE ? undefined : selectedType;
                  const genreParam = selectedGenre === ANY_VALUE ? undefined : selectedGenre;
                  const statusParam = selectedStatus === ANY_VALUE ? undefined : selectedStatus;
                  const sortParam = selectedSort === ANY_VALUE ? DEFAULT_SORT : selectedSort;
                  const searchTermParam = term || undefined; // Use term if provided

                  console.log("[SearchPopup] Jikan API Params - Type:", typeParam, "Genre:", genreParam, "Status:", statusParam, "MinScore:", validMinScore, "Sort:", sortParam, "SearchTerm:", searchTermParam);

                  // Prepare service call promises based on selectedType
                  const searchLimit = 15; // Limit results for standard popup search
                  let animeRes: AnimeResponse | null = null;
                  let mangaRes: MangaResponse | null = null;

                  if (!typeParam || typeParam === 'anime') {
                    animeRes = await getAnimes(
                      genreParam, undefined, validMinScore, searchTermParam, statusParam, 1, sortParam, searchLimit
                    );
                  }
                  if (!typeParam || typeParam === 'manga') {
                     mangaRes = await getMangas(
                        genreParam, statusParam, searchTermParam, validMinScore, 1, sortParam, searchLimit
                     );
                  }


                  console.log("[SearchPopup] Jikan Response - Anime:", animeRes?.animes?.length, "Manga:", mangaRes?.mangas?.length);

                  // Map results to the unified SearchResult format
                   const combinedResults: SearchResult[] = [
                       ...(animeRes?.animes || []).map(a => ({
                            id: a.mal_id, title: a.title, imageUrl: a.imageUrl, description: a.synopsis, type: 'anime' as const, genres: a.genres, year: a.year, score: a.score, episodes: a.episodes, status: a.status,
                       })),
                       ...(mangaRes?.mangas || []).map(m => ({
                           id: m.mal_id, title: m.title, imageUrl: m.imageUrl, description: m.synopsis, type: 'manga' as const, genres: m.genres, year: m.year, score: m.score, chapters: m.chapters, volumes: m.volumes, status: m.status,
                       }))
                   ].filter((item): item is SearchResult => !!item && item.id != null); // Ensure item and id are valid


                  // Simple sort primarily by score (desc), then title (asc) as fallback for standard search
                  // Jikan's `rank` sort should handle relevance better when `sortParam` is 'rank'
                   if (sortParam !== 'rank') {
                      combinedResults.sort((a, b) => {
                         const scoreDiff = (b.score ?? -1) - (a.score ?? -1);
                         if (scoreDiff !== 0) return scoreDiff;
                         return a.title.localeCompare(b.title);
                      });
                   }


                   // Deduplicate combined results - adding index for absolute uniqueness
                  const uniqueResults = Array.from(new Map(combinedResults.map((item, index) => [`${item.type}-${item.id}-${index}`, item])).values());
                  const finalResults = uniqueResults.slice(0, searchLimit * 2); // Limit total displayed results

                  console.log("[SearchPopup] Standard Search Combined Results:", finalResults.length);
                  setResults(finalResults);
                  setAiSuggestions([]); // No AI suggestions in standard mode
                  // setAiAnalysis(null); // Keep analysis null unless AI was used
                  setError(null);
                  console.log(`[SearchPopup] Standard Search successful, found ${finalResults.length} items.`);
              }

          } catch (err: any) {
              console.error(`[SearchPopup] Search failed (AI Active: ${isAiActive}):`, err);
              const mode = isAiActive ? "Nami" : "Standard search";
              setError(err.message || `${mode} encountered an issue. Please try again.`);
              setResults([]);
              setAiSuggestions([]);
              setAiAnalysis(isAiActive ? `Nami Error: ${err.message}` : null); // Show error analysis only in AI mode
          } finally {
              setLoading(false);
              console.log("[SearchPopup] Setting loading=false");
          }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAiActive, hasActiveFilters, selectedType, selectedGenre, selectedStatus, debouncedMinScore, selectedSort, startTransition]); // Include filter states

  // Trigger search on debounced term change or when filters change (only in standard mode)
  useEffect(() => {
    console.log("[SearchPopup] Debounced term or filters changed. Term:", debouncedSearchTerm, "AI:", isAiActive, "Filters:", {selectedType, selectedGenre, selectedStatus, debouncedMinScore, selectedSort});
    if (isOpen) {
        // Search if debounced term changes OR if any filter changes while open in standard mode
        handleSearch(debouncedSearchTerm);
    } else {
        console.log("[SearchPopup] Skipping search trigger because popup is closed.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, isAiActive, selectedType, selectedGenre, selectedStatus, debouncedMinScore, selectedSort, isOpen, handleSearch]); // Add handleSearch


  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    // The useEffect hook watching debouncedSearchTerm will trigger the search
  };


 // Result Card component - Memoized
 const ResultCard = React.memo(({ item }: { item: SearchResult }) => {
      if (!item || item.id == null) return null; // Check for valid item and ID
      // Use MAL URL for characters, internal links for anime/manga
      const linkHref = item.type !== 'character' ? `/${item.type}/${item.id}` : `https://myanimelist.net/character/${item.id}`;
      const target = item.type === 'character' ? '_blank' : '_self';

     return (
        // Wrap the entire card in a Link
        <Link href={linkHref} passHref legacyBehavior>
            <a
               target={target}
               rel={target === '_blank' ? "noopener noreferrer" : undefined}
               onClick={onClose}
               className="block group mb-3 mx-1 transition-smooth" // Make the anchor block level and add group + transition
            >
                <Card className="overflow-hidden glass neon-glow-hover transition-smooth group-hover:bg-card/60 flex flex-col sm:flex-row"> {/* Apply group hover to card */}
                    <CardHeader className="p-0 relative h-36 w-full sm:h-auto sm:w-24 flex-shrink-0 overflow-hidden transition-smooth">
                        {item.imageUrl ? (
                        <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            sizes="(max-width: 640px) 100vw, 96px"
                            className="object-cover transition-transform duration-300 group-hover:scale-105" // Scale image on group hover
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
                    <CardContent className="p-2 sm:p-3 flex-grow flex flex-col justify-between transition-smooth">
                        <div>
                            <CardTitlePrimitive className="text-sm font-semibold mb-0.5 line-clamp-1 group-hover:text-primary transition-colors">
                                {item.title} {/* Title is part of the link */}
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
                            {/* Add Year */}
                            {item.year && <span className="flex items-center gap-0.5" title="Year"><CalendarDays size={10} /> {item.year}</span>}
                        </div>
                    </CardContent>
                </Card>
            </a>
        </Link>
     );
 });
 ResultCard.displayName = 'ResultCard'; // Add display name for React DevTools

   // Skeleton card
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
                 <Skeleton className="h-3 w-10" />
            </div>
        </CardContent>
     </Card>
  );


  return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          className="glass p-0 sm:p-0 sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[85vh] flex flex-col gap-0 border-primary/30 shadow-2xl transition-smooth data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
           onInteractOutside={(e) => {
                // Allow interaction with filters/suggestions without closing
                if ((e.target as Element)?.closest('[data-radix-select-content]')) {
                    e.preventDefault();
                }
           }}
        >
           <VisuallyHidden><DialogTitle>Search Shinra-Ani</DialogTitle></VisuallyHidden>
            <DialogHeader className="p-4 pb-3 border-b border-border/50 flex-shrink-0">
                {/* Input and Buttons Container */}
                <div className="flex items-center gap-2 w-full">
                     {/* Search Input */}
                     <form onSubmit={(e) => { e.preventDefault(); handleSearch(searchTerm); }} className="relative flex-grow">
                       <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none z-10">
                           {isAiActive ? (
                              <Sparkles className="h-full w-full text-primary animate-pulse-subtle" /> // Use subtle pulse
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
                               "pl-10 pr-10 w-full glass text-base h-11 rounded-full border-2 transition-smooth", // Adjusted padding and height + smooth transition
                               isAiActive ? "border-primary/60 focus:border-primary neon-glow-focus" : "border-input focus:border-primary/50"
                           )}
                           aria-label="Search Shinra-Ani"
                           autoFocus
                       />
                       {/* Loader inside input area */}
                        {(loading || isPending) && (
                             <div className="absolute right-11 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground animate-pulse">
                                <Loader2 className="animate-spin"/> {/* Use Loader2 with spin */}
                             </div>
                        )}
                         {/* Hidden submit button */}
                         <button type="submit" hidden />
                    </form>

                    {/* Filter Toggle Button (Standard Mode Only) */}
                    {!isAiActive && (
                        <Button
                            variant="outline"
                            size="icon"
                            className={cn("h-10 w-10 rounded-full flex-shrink-0 glass transition-smooth neon-glow-hover", showFilters && "bg-accent text-accent-foreground")}
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
                            "h-10 w-10 rounded-full text-primary hover:bg-primary/10 flex-shrink-0 transition-smooth neon-glow-hover",
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
                            className="h-10 w-10 rounded-full text-muted-foreground hover:bg-accent/50 flex-shrink-0 transition-smooth"
                            aria-label="Close search popup"
                        >
                            <X size={22} />
                        </Button>
                    </DialogClose>
                </div>
            </DialogHeader>

             {/* Filters Panel (Standard Mode Only) - Added smooth transition */}
             {!isAiActive && (
                 <div className={cn("transition-all duration-300 ease-in-out overflow-hidden", showFilters ? "max-h-96 p-3 border-b border-border/50 bg-background/50 flex-shrink-0" : "max-h-0 p-0 border-b-0")}>
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                          {/* Content Type Filter */}
                         <div className="space-y-1">
                             <Label htmlFor="search-type-filter" className="text-muted-foreground">Type</Label>
                             <Select value={selectedType} onValueChange={setSelectedType}>
                                <SelectTrigger id="search-type-filter" className="w-full glass h-8 text-xs">
                                    <SelectValue placeholder="Any Type" />
                                </SelectTrigger>
                                <SelectContent className="glass max-h-60">
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
                                    {(selectedType === 'manga' ? mangaGenres : animeGenres).map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
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


          {/* Content Area */}
          <ScrollArea className="flex-grow overflow-y-auto px-2 pt-3">
            {/* Loading State */}
            {loading && (
              <div className="space-y-3 px-2 animate-fade-in"> {/* Apply fade-in */}
                 {Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={`skel-${index}`} />)}
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <Alert variant="destructive" className="m-2 animate-fade-in">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Search Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

             {/* Initial State & AI Suggestions */}
             {!loading && !error && !hasSearched && isAiActive && (
                 <div className="px-2 py-4 animate-fade-in">
                     <h3 className="text-sm font-semibold mb-3 text-muted-foreground px-1">Try asking Nami:</h3>
                     <div className="space-y-2">
                         {initialAiSuggestions.map((suggestion, index) => (
                             <Button
                                key={index}
                                variant="ghost"
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="w-full justify-start text-left h-auto py-2 px-3 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-smooth"
                             >
                                 {suggestion}
                             </Button>
                         ))}
                     </div>
                 </div>
             )}

            {/* Results State */}
            {!loading && !error && hasSearched && results.length > 0 && (
                 <div className="space-y-0 pb-4 animate-fade-in">
                     {/* AI Analysis */}
                     {isAiActive && aiAnalysis && (
                         <Alert className="m-2 glass border-primary/30 mb-3 text-xs transition-smooth">
                              <Sparkles className="h-3 w-3 text-primary" />
                              <AlertTitle className="text-primary text-xs font-semibold">Nami's Analysis</AlertTitle>
                              <AlertDescription className="text-xs">{aiAnalysis}</AlertDescription>
                         </Alert>
                     )}
                     {/* AI Suggestions After Search */}
                     {isAiActive && aiSuggestions.length > 0 && (
                       <div className="mb-3 px-2">
                         <h3 className="text-xs font-semibold mb-1 text-muted-foreground">Nami Suggests:</h3>
                         <div className="flex flex-wrap gap-1.5">
                           {aiSuggestions.map((suggestion, index) => (
                             <Button key={index} variant="outline" size="sm" onClick={() => handleSuggestionClick(suggestion)} className="neon-glow-hover text-[11px] h-7 px-2 py-1 glass transition-smooth">{suggestion}</Button>
                           ))}
                         </div>
                       </div>
                     )}
                     {/* Result Cards */}
                    {results.map((item, index) => (
                        item && item.id ? <ResultCard key={`${item.type}-${item.id}-${index}`} item={item} /> : null // Use unique type-id key
                    ))}
                </div>
            )}

             {/* No Results State */}
            {!loading && !error && hasSearched && results.length === 0 && (
                <div className="text-center text-muted-foreground py-10 px-4 animate-fade-in">
                    <p>No results found for "{searchTerm}"{hasActiveFilters ? " with the selected filters" : ""}.</p>
                     {isAiActive && aiSuggestions.length > 0 && ( // Suggest AI suggestions even if initial search failed
                         <div className="mt-4">
                            <p className="text-sm mb-2">Maybe try:</p>
                             <div className="flex flex-wrap gap-2 justify-center">
                                {aiSuggestions.map((suggestion, index) => ( <Button key={index} variant="outline" size="sm" onClick={() => handleSuggestionClick(suggestion)} className="neon-glow-hover text-xs h-8 glass transition-smooth">{suggestion}</Button> ))}
                            </div>
                        </div>
                     )}
                      {!isAiActive && !hasActiveFilters && (
                          <p className="text-xs mt-2">Try broadening your search or use the filters <Filter size={12} className="inline-block mx-1"/>.</p>
                      )}
                       {!isAiActive && hasActiveFilters && (
                          <Button variant="link" size="sm" onClick={resetFilters} className="mt-2">Reset Filters</Button>
                      )}
                </div>
            )}

             {/* Prompt to enter search (Standard Mode Initial State) */}
             {!loading && !error && !hasSearched && !isAiActive && (
                 <div className="text-center text-muted-foreground py-10 px-4 animate-fade-in">
                     <p>Enter a search term or use filters <Filter size={16} className="inline-block ml-1"/>.</p>
                 </div>
             )}


          </ScrollArea>
        </DialogContent>
      </Dialog>
  );
}
