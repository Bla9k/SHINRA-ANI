
'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  VisuallyHidden, // Import VisuallyHidden for accessibility
  DialogClose, // Import DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle as CardTitlePrimitive, CardDescription } from '@/components/ui/card'; // Use primitive for title to allow Link inside
import Image from 'next/image';
import Link from 'next/link';
import { Search as SearchIcon, Loader2, Sparkles, AlertCircle, X, CalendarDays, Star, Layers, Library, Film, BookText, Tv, User, Heart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { aiPoweredSearch, AIPoweredSearchOutput, SearchResult } from '@/ai/flows/ai-powered-search'; // Keep AI flow import
import { getAnimes, getMangas } from '@/services'; // Import standard Jikan search
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/use-debounce';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface SearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
  isAiActive: boolean; // Receive AI state from parent
  initialSearchTerm?: string; // Receive initial term
  onAiToggle: () => void; // Function to toggle AI state in parent
}

// Helper function to format status
const formatStatus = (status: string | null): string => {
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
};

// Initial Nami suggestions (only shown when AI is active)
const initialAiSuggestions = [
    "Show me top rated romance anime",
    "Find anime similar to Attack on Titan",
    "Recommend me a short anime series",
    "What are this season's most popular anime?",
    "Find manga with strong female protagonists"
];

export default function SearchPopup({ isOpen, onClose, isAiActive, initialSearchTerm = '', onAiToggle }: SearchPopupProps) {
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>(initialAiSuggestions);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(!!initialSearchTerm); // Track if a search has been performed

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Update internal search term if initial term changes while open
  useEffect(() => {
      if (isOpen && initialSearchTerm) {
          setSearchTerm(initialSearchTerm);
          setHasSearched(true);
          // Trigger search immediately if opened with an initial term
          handleSearch(initialSearchTerm);
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSearchTerm, isOpen]); // Trigger search only when initial term changes while open

  // Reset state when popup opens/closes
  useEffect(() => {
      if (isOpen) {
          setSearchTerm(initialSearchTerm); // Set initial term when opening
          setHasSearched(!!initialSearchTerm);
          if (!initialSearchTerm) { // Clear results only if opening fresh without term
              setResults([]);
              setAiSuggestions(initialAiSuggestions);
              setAiAnalysis(null);
              setError(null);
              setLoading(false);
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
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // Only depend on isOpen for resetting


  const handleSearch = useCallback(async (currentSearchTerm: string) => {
      const term = currentSearchTerm.trim();
      if (!term) {
          setResults([]);
          setAiSuggestions(initialAiSuggestions);
          setAiAnalysis(null);
          setError(null);
          setLoading(false);
          setHasSearched(false);
          return;
      }

      setLoading(true);
      setError(null);
      setAiAnalysis(null); // Clear previous analysis
      setHasSearched(true); // Mark that a search has occurred

      startTransition(async () => {
          try {
              let searchOutput: AIPoweredSearchOutput;
              if (isAiActive) {
                  // --- AI Search Logic ---
                  const searchInput = {
                      searchTerm: term,
                      searchType: 'all' as const,
                  };
                  console.log("Performing AI Search with input:", searchInput);
                  searchOutput = await aiPoweredSearch(searchInput);
                  setResults(searchOutput.results || []);
                  setAiSuggestions(searchOutput.suggestions || []); // Update suggestions from AI
                  setAiAnalysis(searchOutput.aiAnalysis || null);
                  console.log("AI Search successful, results:", searchOutput.results?.length, "suggestions:", searchOutput.suggestions?.length);
              } else {
                  // --- Standard Jikan Search Logic ---
                  console.log("Performing Standard Jikan Search for:", term);
                  // Fetch both anime and manga concurrently
                  const [animeRes, mangaRes] = await Promise.all([
                      getAnimes(undefined, undefined, undefined, term, undefined, 1, 'rank', 10), // Fetch top 10 anime by rank
                      getMangas(undefined, undefined, term, undefined, 1, 'rank', 10)  // Fetch top 10 manga by rank
                  ]);

                  // Map results to the unified SearchResult format
                  const combinedResults: SearchResult[] = [
                      ...(animeRes.animes || []).map(a => ({
                          id: a.mal_id,
                          title: a.title,
                          imageUrl: a.imageUrl,
                          description: a.synopsis,
                          type: 'anime' as const,
                          genres: a.genres,
                          year: a.year,
                          score: a.score,
                          episodes: a.episodes,
                          status: a.status,
                      })),
                      ...(mangaRes.mangas || []).map(m => ({
                          id: m.mal_id,
                          title: m.title,
                          imageUrl: m.imageUrl,
                          description: m.synopsis,
                          type: 'manga' as const,
                          genres: m.genres,
                          year: m.year,
                          score: m.score,
                          chapters: m.chapters,
                          volumes: m.volumes,
                          status: m.status,
                      }))
                  ].filter(item => item.id != null) // Filter out any potential nulls
                   .sort((a, b) => (a.score && b.score ? b.score - a.score : (a.score ? -1 : 1))); // Simple score sort

                  setResults(combinedResults);
                  setAiSuggestions([]); // No AI suggestions in standard mode
                  setAiAnalysis(null); // No AI analysis
                  console.log(`Standard Search successful, found ${combinedResults.length} items.`);
              }

              setError(null);

          } catch (err: any) {
              console.error(`Search failed (AI Active: ${isAiActive}):`, err);
              const mode = isAiActive ? "Nami" : "Standard search";
              setError(err.message || `${mode} encountered an issue. Please try again.`);
              setResults([]);
              setAiSuggestions([]); // Clear suggestions on error
              setAiAnalysis(`${mode} Error: ${err.message}`);
          } finally {
              setLoading(false);
          }
      });
  }, [startTransition, isAiActive]); // Dependencies for useCallback

  // Trigger search on debounced term change or AI mode change while term exists
  useEffect(() => {
    // Avoid searching if the term is empty and the popup just opened without an initial term
    // Only trigger search if debounced term changes, or if AI mode changes *while* there's a term
    if (debouncedSearchTerm && (debouncedSearchTerm !== initialSearchTerm || !isOpen)) {
        handleSearch(debouncedSearchTerm);
    } else if (isOpen && debouncedSearchTerm && isAiActive) { // Re-search if AI toggled ON with term
        handleSearch(debouncedSearchTerm);
    } else if (isOpen && debouncedSearchTerm && !isAiActive) { // Re-search if AI toggled OFF with term
        handleSearch(debouncedSearchTerm);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, isAiActive]); // Only re-run when debounced term or AI active state changes


  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    // The useEffect hook watching debouncedSearchTerm will trigger the search
  };


 // Result Card component
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
              {/* Use CardTitlePrimitive to allow Link as child */}
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
              {item.type === 'character' && item.favorites !== undefined && <span className="flex items-center gap-0.5" title="Favorites"><Heart size={10} className="text-pink-500"/> {item.favorites.toLocaleString()}</span>}
           </div>
        </CardContent>
       </Card>
     );
 };

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
            </div>
        </CardContent>
     </Card>
  );


  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="glass p-0 sm:p-0 sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[85vh] flex flex-col gap-0 border-primary/30 shadow-2xl"
          // Removed pt-6 to allow header padding to control top space
          // Allow closing on outside click
        >
           <DialogHeader className="p-4 pb-3 border-b border-border/50 flex-shrink-0"> {/* Added flex-shrink-0 */}
                {/* Using VisuallyHidden for title */}
                <VisuallyHidden>
                    <DialogTitle>Search AniManga Stream</DialogTitle>
                </VisuallyHidden>

                {/* Input and Buttons Container */}
                <div className="relative flex items-center w-full">
                    {/* Search/AI Icon */}
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 pointer-events-none z-10">
                        {isAiActive ? (
                           <Sparkles className="h-full w-full text-primary" />
                        ) : (
                           <SearchIcon className="h-full w-full text-muted-foreground" />
                        )}
                    </div>


                    {/* Search Input - Increased pr to avoid overlap */}
                    <Input
                        type="search"
                        placeholder={isAiActive ? "Ask Nami anything..." : "Search anime, manga, characters..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={cn(
                            "pl-10 pr-[5.5rem] w-full glass text-base h-11 rounded-full border-2", // Increased pr to ~88px (5.5rem)
                            isAiActive ? "border-primary/60 focus:border-primary" : "border-input focus:border-primary/50"
                        )}
                        aria-label="Search AniManga Stream"
                        autoFocus
                    />

                    {/* Buttons Container - Positioned absolutely */}
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 h-9"> {/* Set height to match input-area */}
                        {/* Loader */}
                        {(loading || isPending) && (
                             <div className="flex items-center justify-center h-full w-8 px-1"> {/* Wrapper for centering */}
                                <Loader2 className="h-5 w-5 text-muted-foreground animate-spin"/>
                             </div>
                        )}

                        {/* Nami AI Toggle Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                "h-8 w-8 rounded-full text-primary hover:bg-primary/10", // Adjusted size
                                isAiActive && "bg-primary/20 neon-glow"
                            )}
                            onClick={onAiToggle}
                            aria-pressed={isAiActive}
                            aria-label={isAiActive ? "Deactivate AI Search" : "Activate AI Search"}
                        >
                            <Sparkles size={18} />
                        </Button>

                         {/* Close Button */}
                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-muted-foreground hover:bg-accent/50" // Adjusted size
                                aria-label="Close search popup"
                            >
                                <X size={20} />
                            </Button>
                        </DialogClose>
                    </div>
                </div>
            </DialogHeader>


          {/* Content Area: Suggestions or Results */}
          <ScrollArea className="flex-grow overflow-y-auto px-2 pt-3"> {/* Added flex-grow */}
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
             {!loading && !error && !searchTerm && isAiActive && (
                 <div className="px-2 py-4">
                     <h3 className="text-sm font-semibold mb-3 text-muted-foreground px-1">AI Search Assistant - Try asking Nami:</h3>
                     <div className="space-y-2">
                         {aiSuggestions.map((suggestion, index) => (
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
                 <div className="space-y-0 pb-4"> {/* Add padding bottom */}
                    {/* AI Analysis (Only if AI is active) */}
                     {isAiActive && aiAnalysis && (
                         <Alert className="m-2 glass border-primary/30 mb-3 text-xs">
                              <Sparkles className="h-3 w-3 text-primary" />
                              <AlertTitle className="text-primary text-xs font-semibold">Nami's Analysis</AlertTitle>
                              <AlertDescription className="text-xs">
                                  {aiAnalysis}
                              </AlertDescription>
                         </Alert>
                     )}
                     {/* AI Suggestions After Search (Only if AI is active) */}
                     {isAiActive && aiSuggestions.length > 0 && (
                       <div className="mb-3 px-2">
                         <h3 className="text-xs font-semibold mb-1 text-muted-foreground">Nami Suggests:</h3>
                         <div className="flex flex-wrap gap-1.5">
                           {aiSuggestions.map((suggestion, index) => (
                             <Button
                               key={index}
                               variant="outline"
                               size="sm"
                               onClick={() => handleSuggestionClick(suggestion)}
                               className="neon-glow-hover text-[11px] h-7 px-2 py-1 glass"
                             >
                               {suggestion}
                             </Button>
                           ))}
                         </div>
                       </div>
                     )}
                     {/* Result Cards */}
                    {results.map((item) => (
                        item && item.id ? <ResultCard key={`${item.type}-${item.id}`} item={item} /> : null
                    ))}
                </div>
            )}

             {/* No Results State */}
            {!loading && !error && hasSearched && results.length === 0 && (
                <div className="text-center text-muted-foreground py-10 px-4">
                    <p>{isAiActive ? "Nami" : "Search"} couldn't find anything matching "{searchTerm}".</p>
                     {/* AI Suggestions on No Results (Only if AI is active) */}
                     {isAiActive && aiSuggestions.length > 0 && (
                         <div className="mt-4">
                            <p className="text-sm mb-2">Maybe try:</p>
                             <div className="flex flex-wrap gap-2 justify-center">
                                {aiSuggestions.map((suggestion, index) => (
                                    <Button
                                      key={index}
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleSuggestionClick(suggestion)}
                                      className="neon-glow-hover text-xs h-8 glass"
                                    >
                                      {suggestion}
                                    </Button>
                                ))}
                            </div>
                        </div>
                     )}
                </div>
            )}

             {/* Prompt to enter search if popup is open but no search */}
             {!loading && !error && !hasSearched && !searchTerm && !isAiActive && (
                 <div className="text-center text-muted-foreground py-10 px-4">
                     <p>Enter a search term above.</p>
                 </div>
             )}


          </ScrollArea>
        </DialogContent>
      </Dialog>
  );
}
