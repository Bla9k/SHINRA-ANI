
'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  // DialogHeader, // Might not be needed if header is custom
  // DialogTitle, // Title handled differently
  // DialogDescription, // Description handled differently
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Search as SearchIcon, Loader2, Sparkles, AlertCircle, X, CalendarDays, Star, Layers, Library, Film, BookText, Tv, User, Heart } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { aiPoweredSearch, AIPoweredSearchOutput, SearchResult } from '@/ai/flows/ai-powered-search';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/use-debounce';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface SearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to format status
const formatStatus = (status: string | null): string => {
    if (!status) return 'N/A';
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
};

// Initial Nami suggestions
const initialSuggestions = [
    "Show me top rated romance anime",
    "Find anime similar to Attack on Titan",
    "Recommend me a short anime series",
    "What are this season's most popular anime?",
    "Find manga with strong female protagonists"
];

export default function SearchPopup({ isOpen, onClose }: SearchPopupProps) {
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>(initialSuggestions); // Start with predefined suggestions
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false); // Track if a search has been performed

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Reset state when popup opens/closes
  useEffect(() => {
      if (!isOpen) {
          setSearchTerm('');
          setResults([]);
          setAiSuggestions(initialSuggestions);
          setAiAnalysis(null);
          setError(null);
          setLoading(false);
          setHasSearched(false);
      }
  }, [isOpen]);


  const handleSearch = useCallback(async (currentSearchTerm: string) => {
      if (!currentSearchTerm.trim()) {
          setResults([]);
          // Keep initial suggestions if search is cleared
          setAiSuggestions(initialSuggestions);
          setAiAnalysis(null);
          setError(null);
          setLoading(false);
          setHasSearched(false);
          return;
      }

      setLoading(true);
      setError(null);
      setAiAnalysis(null);
      setHasSearched(true); // Mark that a search has occurred

      startTransition(async () => {
          try {
              const searchInput = {
                  searchTerm: currentSearchTerm.trim(),
                  searchType: 'all' as const, // Always search 'all' types in this popup
              };

              console.log("Performing AI Search with input:", searchInput);
              const searchOutput: AIPoweredSearchOutput = await aiPoweredSearch(searchInput);

              setResults(searchOutput.results || []);
              // Update suggestions based on AI response only *after* a search
              setAiSuggestions(searchOutput.suggestions || []);
              setAiAnalysis(searchOutput.aiAnalysis || null);
              setError(null);

              console.log("Search successful, results:", searchOutput.results?.length, "suggestions:", searchOutput.suggestions?.length);

          } catch (err: any) {
              console.error('Search failed:', err);
              setError(err.message || `Nami encountered an issue searching. Please try again.`);
              setResults([]);
              // Show error in suggestions area or keep previous/initial ones? Decide UX.
              // setAiSuggestions([]);
              setAiAnalysis(`Error during search: ${err.message}`);
          } finally {
              setLoading(false);
          }
      });
  }, [startTransition]); // Dependencies for useCallback

  // Trigger search on debounced term change
  useEffect(() => {
    handleSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, handleSearch]);


  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    // The useEffect hook watching debouncedSearchTerm will trigger the search
  };


 // Result Card component (copied and adapted from previous search page)
 const ResultCard = ({ item }: { item: SearchResult }) => {
      const linkHref = `/${item.type}/${item.id}`;

     return (
        // Reduced horizontal padding, added margin-bottom
        <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 hover:bg-card/60 flex flex-col sm:flex-row group mb-3 mx-1">
         <CardHeader className="p-0 relative h-36 w-full sm:h-auto sm:w-24 flex-shrink-0 overflow-hidden"> {/* Adjusted size */}
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
              <CardTitle className="text-sm font-semibold mb-0.5 line-clamp-1 group-hover:text-primary transition-colors">
                <Link href={item.type === 'character' ? `https://myanimelist.net/character/${item.id}` : linkHref} target={item.type === 'character' ? '_blank' : '_self'} rel="noopener noreferrer" onClick={onClose}>
                    {item.title}
                 </Link>
              </CardTitle>
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
           {/* Details Footer - simplified */}
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

   // Skeleton card - simplified for popup
   const SkeletonCard = () => (
     <Card className="overflow-hidden glass flex flex-col sm:flex-row mb-3 mx-1 animate-pulse">
        <CardHeader className="p-0 h-36 w-full sm:h-auto sm:w-24 flex-shrink-0">
           <Skeleton className="h-full w-full" />
        </CardHeader>
        <CardContent className="p-2 sm:p-3 flex-grow flex flex-col justify-between">
           <div>
                <Skeleton className="h-4 w-3/4 mb-1" /> {/* Title */}
                <div className="flex gap-1 mb-1 flex-wrap"> {/* Genres/Tags */}
                    <Skeleton className="h-3 w-10 rounded-full" />
                    <Skeleton className="h-3 w-12 rounded-full" />
                </div>
                <Skeleton className="h-3 w-full mb-1" /> {/* Description */}
                <Skeleton className="h-3 w-5/6 mb-2" />
            </div>
            <div className="flex justify-start items-center border-t border-border/50 pt-1 mt-auto gap-2"> {/* Footer */}
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-10" />
            </div>
        </CardContent>
     </Card>
  );


  return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        {/* Removed DialogTrigger as it's controlled externally */}
        <DialogContent
          className="glass p-0 pt-4 sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[85vh] flex flex-col gap-0 border-primary/30 shadow-2xl" // Adjusted max-width and height, removed padding, added flex
          onInteractOutside={(e) => e.preventDefault()} // Prevent closing on outside click initially
        >
           {/* Custom Header/Search Input Area */}
          <div className="relative px-4 pb-3 border-b border-border/50">
            <SearchIcon className="absolute left-7 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none z-10" />
            <Input
              type="search"
              placeholder="Search anime, manga, characters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full glass neon-glow-focus text-base pr-16 h-12 rounded-full border-2 border-primary/40" // Rounded, taller, more padding
              aria-label="Search AniManga Stream"
            />
             {(loading || isPending) && (
                  <Loader2 className="absolute right-14 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground animate-spin"/>
             )}
             {searchTerm && !(loading || isPending) && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-14 top-1/2 transform -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                    onClick={() => setSearchTerm('')}
                    aria-label="Clear search"
                >
                    <X size={16} />
                </Button>
            )}
             {/* Nami AI toggle button */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 h-9 w-9 rounded-full text-primary hover:bg-primary/10 neon-glow-hover"
                aria-label="AI Search Assistant"
            >
                <Sparkles size={20} />
            </Button>
          </div>


          {/* Content Area: Suggestions or Results */}
          <ScrollArea className="flex-grow overflow-y-auto px-2 pt-3"> {/* Added padding top */}
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

             {/* Initial State & AI Suggestions */}
             {!loading && !error && !hasSearched && (
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
                 <div className="space-y-0"> {/* Removed space-y-3, margin added to card */}
                    {/* AI Analysis */}
                     {aiAnalysis && (
                         <Alert className="m-2 glass border-primary/30 mb-3 text-xs">
                              <Sparkles className="h-3 w-3 text-primary" />
                              <AlertTitle className="text-primary text-xs font-semibold">Nami's Analysis</AlertTitle>
                              <AlertDescription className="text-xs">
                                  {aiAnalysis}
                              </AlertDescription>
                         </Alert>
                     )}
                     {/* AI Suggestions After Search */}
                     {aiSuggestions.length > 0 && (
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
                    <p>Nami couldn't find anything matching "{searchTerm}".</p>
                     {aiSuggestions.length > 0 && (
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

          </ScrollArea>
        </DialogContent>
      </Dialog>
  );
}
