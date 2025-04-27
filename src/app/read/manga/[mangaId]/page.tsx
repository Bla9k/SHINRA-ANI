
'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
// TODO: Implement manga chapter fetching logic (e.g., from Consumet or other source)
// import { getMangaChapters, getChapterPages } from '@/services/mangaReader'; // Placeholder
import { getMangaDetails, Manga } from '@/services/manga'; // Fetch metadata for context
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, ArrowLeft, ArrowRight, List, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image'; // For displaying manga pages
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // For chapter selection

// Placeholder interfaces for chapter/page data
interface MangaChapter {
    id: string; // Unique chapter identifier (e.g., from API)
    number: string; // Chapter number (can be string like "10.5")
    title?: string;
}

interface MangaPage {
    index: number;
    img: string; // URL of the manga page image
}

export default function ReadMangaPage() {
    const params = useParams();
    const router = useRouter();

    const mangaId = params.mangaId ? parseInt(params.mangaId as string, 10) : NaN;

    const [mangaDetails, setMangaDetails] = useState<Manga | null>(null);
    const [chapters, setChapters] = useState<MangaChapter[]>([]); // Placeholder
    const [pages, setPages] = useState<MangaPage[]>([]); // Placeholder
    const [currentChapterId, setCurrentChapterId] = useState<string | null>(null);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch manga details and potentially chapters
    useEffect(() => {
        if (isNaN(mangaId)) {
            setError('Invalid Manga ID.');
            setLoading(false);
            return;
        }

        async function fetchData() {
            setLoading(true);
            setError(null);
            try {
                // Fetch manga details first
                const details = await getMangaDetails(mangaId);
                if (!details) {
                    notFound(); // Manga not found
                    return;
                }
                setMangaDetails(details);

                // --- Placeholder Chapter/Page Logic ---
                // TODO: Replace with actual API calls to fetch chapters and pages
                console.warn("Placeholder: Fetching manga chapters is not implemented.");
                // Example: const fetchedChapters = await getMangaChapters(mangaId);
                const fetchedChapters: MangaChapter[] = [
                    { id: 'chap-1', number: '1', title: 'The Beginning' },
                    { id: 'chap-2', number: '2' },
                    { id: 'chap-3', number: '3', title: 'Encounter' },
                ]; // Dummy data
                setChapters(fetchedChapters);

                if (fetchedChapters.length > 0) {
                    setCurrentChapterId(fetchedChapters[0].id); // Select first chapter by default
                } else {
                    setError("No chapters found for this manga.");
                }
                // --- End Placeholder ---

            } catch (err: any) {
                console.error('Error fetching manga reader data:', err);
                setError(err.message || 'Failed to load manga data.');
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [mangaId]);

    // Fetch pages when current chapter changes
    useEffect(() => {
        if (!currentChapterId) {
            setPages([]);
            setCurrentPageIndex(0);
            return;
        }

        async function fetchPages() {
            setLoading(true); // Indicate loading pages
            setError(null);
            console.log(`Placeholder: Fetching pages for chapter ${currentChapterId}`);
            try {
                // TODO: Replace with actual API call
                // Example: const fetchedPages = await getChapterPages(currentChapterId);
                await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
                const fetchedPages: MangaPage[] = Array.from({ length: 5 }, (_, i) => ({
                    index: i,
                    img: `https://picsum.photos/seed/${mangaId}-${currentChapterId}-${i}/800/1200?random=${i}` // Dummy pages
                }));
                setPages(fetchedPages);
                setCurrentPageIndex(0); // Reset to first page on chapter change
            } catch (err: any) {
                console.error(`Error fetching pages for chapter ${currentChapterId}:`, err);
                setError(err.message || `Failed to load pages for chapter ${chapters.find(c=>c.id === currentChapterId)?.number}.`);
                setPages([]);
            } finally {
                setLoading(false);
            }
        }

        fetchPages();
    }, [currentChapterId, mangaId, chapters]); // Add chapters to dependency


    // Navigation logic
    const currentChapterIndex = chapters.findIndex(c => c.id === currentChapterId);
    const prevChapter = currentChapterIndex > 0 ? chapters[currentChapterIndex - 1] : null;
    const nextChapter = currentChapterIndex < chapters.length - 1 ? chapters[currentChapterIndex + 1] : null;

    const handlePrevPage = () => {
        if (currentPageIndex > 0) {
            setCurrentPageIndex(prev => prev - 1);
        } else if (prevChapter) {
            setCurrentChapterId(prevChapter.id); // Go to last page of prev chapter (handled by useEffect)
        }
    };

    const handleNextPage = () => {
        if (currentPageIndex < pages.length - 1) {
            setCurrentPageIndex(prev => prev + 1);
        } else if (nextChapter) {
            setCurrentChapterId(nextChapter.id); // Go to first page of next chapter (handled by useEffect)
        }
    };

    // Loading State
    if (loading && !mangaDetails) {
        return (
            <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading reader...</p>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
                <Alert variant="destructive" className="max-w-lg glass">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Loading Manga</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                    <Button variant="outline" onClick={() => router.back()} className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                    </Button>
                </Alert>
            </div>
        );
    }

    // Main Reader UI
    return (
        <div className="bg-gray-900 min-h-screen flex flex-col text-white">
            {/* Header */}
            <header className="p-2 sm:p-3 flex items-center justify-between bg-black/70 backdrop-blur-sm sticky top-0 z-20 border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/manga/${mangaId}`)} className="mr-1 hover:bg-white/10 h-8 w-8">
                        <ArrowLeft size={20} />
                    </Button>
                    {mangaDetails && <h1 className="text-sm sm:text-base font-semibold truncate">{mangaDetails.title}</h1>}
                </div>

                {/* Chapter Selector */}
                <div className="flex items-center gap-2">
                     <Select
                         value={currentChapterId || ''}
                         onValueChange={(value) => value && setCurrentChapterId(value)}
                         disabled={chapters.length <= 1 || loading}
                     >
                        <SelectTrigger className="w-[150px] sm:w-[200px] h-8 text-xs glass bg-gray-800/70 border-gray-700 hover:bg-gray-700/70 focus:ring-primary focus:ring-1">
                            <SelectValue placeholder="Select Chapter" />
                        </SelectTrigger>
                        <SelectContent className="glass max-h-72 bg-background border-border">
                            {chapters.map(chap => (
                                <SelectItem key={chap.id} value={chap.id} className="text-xs">
                                    Ch. {chap.number} {chap.title ? `- ${chap.title}` : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                 {/* Page Navigation (Top) - optional */}
                 {/* <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" onClick={handlePrevPage} disabled={!pages.length || (currentPageIndex === 0 && !prevChapter)} className="h-8 w-8 glass bg-gray-800/70 border-gray-700 hover:bg-gray-700/70"><ArrowLeft size={16}/></Button>
                    <span className="text-xs w-16 text-center tabular-nums">{pages.length > 0 ? `${currentPageIndex + 1} / ${pages.length}` : '- / -'}</span>
                    <Button variant="outline" size="icon" onClick={handleNextPage} disabled={!pages.length || (currentPageIndex === pages.length - 1 && !nextChapter)} className="h-8 w-8 glass bg-gray-800/70 border-gray-700 hover:bg-gray-700/70"><ArrowRight size={16}/></Button>
                </div> */}
            </header>

            {/* Reader Area */}
            <main className="flex-grow flex items-center justify-center p-2 sm:p-4 overflow-y-auto relative">
                {loading && pages.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 z-10">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    </div>
                )}
                {!loading && pages.length > 0 && (
                    <div className="max-w-3xl w-full flex flex-col items-center">
                        {/* Display Current Page */}
                        <div className="relative w-full" style={{ minHeight: '60vh' }}> {/* Ensure minimum height */}
                            <Image
                                key={pages[currentPageIndex]?.img} // Key change forces reload on image change
                                src={pages[currentPageIndex]?.img || 'https://via.placeholder.com/800x1200/1a1a1a/333333?text=Loading...'}
                                alt={`Page ${currentPageIndex + 1}`}
                                width={800} // Provide base width
                                height={1200} // Provide base height corresponding to width ratio
                                style={{ width: '100%', height: 'auto', objectFit: 'contain' }} // Responsive styling
                                priority={currentPageIndex < 2} // Prioritize loading first few pages
                                unoptimized // Assume external image source might not be optimized
                            />
                        </div>

                         {/* Click Navigation Overlay */}
                         <div className="absolute inset-0 flex">
                            <div className="w-1/3 cursor-pointer" onClick={handlePrevPage} title="Previous Page"></div>
                            <div className="w-1/3"></div> {/* Center dead zone */}
                            <div className="w-1/3 cursor-pointer" onClick={handleNextPage} title="Next Page"></div>
                        </div>
                    </div>
                )}
                 {!loading && pages.length === 0 && !error && (
                     <p className="text-muted-foreground">No pages available for this chapter.</p>
                 )}
            </main>

             {/* Footer Navigation */}
            <footer className="p-2 sm:p-3 flex items-center justify-center gap-4 bg-black/70 backdrop-blur-sm sticky bottom-0 z-20 border-t border-gray-700">
                 <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={!pages.length || (currentPageIndex === 0 && !prevChapter)} className="glass bg-gray-800/70 border-gray-700 hover:bg-gray-700/70">
                     <ArrowLeft size={16} className="mr-1"/> Prev
                 </Button>
                 <span className="text-sm w-20 text-center tabular-nums">{pages.length > 0 ? `${currentPageIndex + 1} / ${pages.length}` : '- / -'}</span>
                 <Button variant="outline" size="sm" onClick={handleNextPage} disabled={!pages.length || (currentPageIndex === pages.length - 1 && !nextChapter)} className="glass bg-gray-800/70 border-gray-700 hover:bg-gray-700/70">
                     Next <ArrowRight size={16} className="ml-1"/>
                 </Button>
            </footer>
        </div>
    );
}
