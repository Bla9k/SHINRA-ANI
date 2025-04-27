'use client';

import { useState, useEffect, useTransition } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import Link from 'next/link';
import { Search as SearchIcon, Loader2, Sparkles, Filter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { aiPoweredSearch, AIPoweredSearchOutput } from '@/ai/flows/ai-powered-search';
import { Anime, getAnimes } from '@/services/anime';
import { Manga, getMangas } from '@/services/manga';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/use-debounce'; // Assuming a debounce hook exists

type SearchResultItem = (Anime | Manga) & { type: 'anime' | 'manga' };

export default function SearchPage() {
  const [isPending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'anime' | 'manga'>('anime');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [genre, setGenre] = useState<string | undefined>(undefined);
  const [releaseYear, setReleaseYear] = useState<number[]>([2000]); // Default year for anime
  const [rating, setRating] = useState<number[]>([5]); // Default rating for anime
  const [status, setStatus] = useState<string | undefined>(undefined); // For manga

  const debouncedSearchTerm = useDebounce(searchTerm, 300); // Debounce input

  const handleSearch = async (currentSearchTerm: string, currentTab: 'anime' | 'manga') => {
    if (!currentSearchTerm && !genre && !releaseYear && !rating && !status) {
        setResults([]);
        setAiSuggestions([]);
        return;
    };

    setLoading(true);
    setError(null);
    setAiSuggestions([]); // Clear old suggestions

    startTransition(async () => {
        try {
        const searchInput = {
            searchTerm: currentSearchTerm,
            searchType: currentTab,
            genre: genre,
            releaseYear: currentTab === 'anime' ? releaseYear[0] : undefined,
            rating: currentTab === 'anime' ? rating[0] : undefined,
            status: currentTab === 'manga' ? status : undefined,
        };

        const output: AIPoweredSearchOutput = await aiPoweredSearch(searchInput);

        const formattedResults: SearchResultItem[] = output.results.map(r => ({
            ...r,
            type: currentTab,
        }));

        setResults(formattedResults);
        setAiSuggestions(output.suggestions);
        } catch (err) {
            console.error('Search failed:', err);
            setError(`Nami couldn't fetch results. Please try again.`);
            setResults([]); // Clear results on error
        } finally {
            setLoading(false);
        }
    });
  };

 useEffect(() => {
    // Trigger search when debounced term or filters change
    handleSearch(debouncedSearchTerm, activeTab);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [debouncedSearchTerm, activeTab, genre, releaseYear, rating, status]);


  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    // Trigger search immediately
    handleSearch(suggestion, activeTab);
  };

 const ResultCard = ({ item }: { item: SearchResultItem }) => (
    <Card className="overflow-hidden glass neon-glow-hover transition-all duration-300 hover:scale-105 flex flex-col sm:flex-row">
      <CardHeader className="p-0 relative h-40 w-full sm:w-32 flex-shrink-0">
        <Image
          src={item.imageUrl || 'https://picsum.photos/200/300?grayscale'}
          alt={item.title}
          layout="fill"
          objectFit="cover"
          className="rounded-l-lg sm:rounded-t-lg sm:rounded-l-none"
        />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-lg font-semibold mb-1 line-clamp-1">{item.title}</CardTitle>
        <div className="flex gap-1 mb-2 flex-wrap">
          {item.genre?.map((g) => <Badge key={g} variant="secondary">{g}</Badge>)}
          {item.type === 'anime' && 'releaseYear' in item && <Badge variant="outline">{item.releaseYear}</Badge>}
          {item.type === 'anime' && 'rating' in item && <Badge variant="outline">⭐ {item.rating}</Badge>}
           {item.type === 'manga' && 'status' in item && <Badge variant={item.status === 'Ongoing' ? 'default' : 'destructive'}>{item.status}</Badge>}
        </div>
        <CardDescription className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {item.description}
        </CardDescription>
        <Button variant="link" size="sm" asChild className="float-right">
          <Link href={`/${item.type}/${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
            View Details
          </Link>
        </Button>
      </CardContent>
    </Card>
  );

   const SkeletonCard = () => (
     <Card className="overflow-hidden glass flex flex-col sm:flex-row">
        <CardHeader className="p-0 h-40 w-full sm:w-32 flex-shrink-0">
           <Skeleton className="h-full w-full rounded-l-lg sm:rounded-t-lg sm:rounded-l-none" />
        </CardHeader>
        <CardContent className="p-4 flex-grow space-y-2">
           <Skeleton className="h-5 w-3/4" />
           <div className="flex gap-1 mb-2 flex-wrap">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-10" />
           </div>
           <Skeleton className="h-3 w-full" />
           <Skeleton className="h-3 w-5/6" />
           <Skeleton className="h-6 w-1/3 float-right" />
        </CardContent>
     </Card>
  );


  // Placeholder options - replace with dynamic data if available
  const genres = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Sci-Fi", "Slice of Life", "Romance"];
  const mangaStatuses = ["Ongoing", "Completed", "Hiatus"];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Interactive Search</h1>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'anime' | 'manga')} className="w-full">
        <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
           <TabsList className="glass">
             <TabsTrigger value="anime" className="data-[state=active]:neon-glow">Anime</TabsTrigger>
             <TabsTrigger value="manga" className="data-[state=active]:neon-glow">Manga</TabsTrigger>
           </TabsList>
            <div className="relative flex-grow w-full md:w-auto">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                type="search"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full glass neon-glow-focus"
                />
            </div>
        </div>

        {/* Filters Section */}
         <Card className="mb-6 glass">
             <CardHeader>
                 <CardTitle className="flex items-center gap-2"><Filter size={20} /> Filters</CardTitle>
             </CardHeader>
             <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="space-y-2">
                    <Label htmlFor="genre">Genre</Label>
                     <Select value={genre} onValueChange={setGenre}>
                        <SelectTrigger id="genre" className="w-full glass">
                             <SelectValue placeholder="Select Genre" />
                         </SelectTrigger>
                         <SelectContent className="glass">
                            <SelectItem value="">Any Genre</SelectItem>
                             {genres.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                         </SelectContent>
                    </Select>
                 </div>

                 {activeTab === 'anime' && (
                     <>
                        <div className="space-y-2">
                             <Label htmlFor="releaseYear">Min. Release Year: {releaseYear[0]}</Label>
                             <Slider
                                 id="releaseYear"
                                 min={1980}
                                 max={new Date().getFullYear()}
                                 step={1}
                                 value={releaseYear}
                                 onValueChange={setReleaseYear}
                                 className="pt-2"
                              />
                         </div>
                         <div className="space-y-2">
                             <Label htmlFor="rating">Min. Rating: {rating[0]} ★</Label>
                              <Slider
                                id="rating"
                                min={0}
                                max={10}
                                step={0.5}
                                value={rating}
                                onValueChange={setRating}
                                className="pt-2"
                              />
                          </div>
                     </>
                  )}

                 {activeTab === 'manga' && (
                     <div className="space-y-2">
                         <Label htmlFor="status">Status</Label>
                          <Select value={status} onValueChange={setStatus}>
                             <SelectTrigger id="status" className="w-full glass">
                                <SelectValue placeholder="Select Status" />
                             </SelectTrigger>
                             <SelectContent className="glass">
                                <SelectItem value="">Any Status</SelectItem>
                                 {mangaStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                             </SelectContent>
                         </Select>
                     </div>
                 )}
            </CardContent>
         </Card>


        {/* AI Suggestions */}
        {!loading && aiSuggestions.length > 0 && (
          <div className="mb-6 p-4 rounded-lg glass">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-1 text-primary">
               <Sparkles size={16} /> Nami AI Suggestions:
             </h3>
            <div className="flex flex-wrap gap-2">
              {aiSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="neon-glow-hover"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Results Section */}
        <TabsContent value={activeTab}>
          {loading ? (
             <div className="grid grid-cols-1 gap-4">
                 {Array.from({ length: 5 }).map((_, index) => <SkeletonCard key={`skel-${index}`} />)}
            </div>
          ) : error ? (
            <p className="text-center text-destructive">{error}</p>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {results.map((item) => (
                <ResultCard key={`${item.type}-${item.title}`} item={item} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground mt-8">
               {searchTerm || genre || status ? 'No results found. Try adjusting your search or filters.' : 'Start typing or select filters to search.'}
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
