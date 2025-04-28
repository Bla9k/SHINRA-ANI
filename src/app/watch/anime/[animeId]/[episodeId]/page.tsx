
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
// Use AnimePahe services
import { getAnimeEpisodesPahe, getAnimeStreamingLinkPahe, AnimepaheEpisode, AnimepaheWatchResponse } from '@/services/animepahe';
import { getAnimeDetails, Anime } from '@/services/anime'; // Still use Jikan for metadata
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, ArrowLeft, ListVideo, ArrowRight, PlayCircle, Tv } from 'lucide-react';
import Hls from 'hls.js'; // Import Hls.js for playback
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Use Select for quality

export default function WatchAnimeEpisodePage() {
    const params = useParams();
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    const animeId = params.animeId ? parseInt(params.animeId as string, 10) : NaN;
    // This is now the AnimePahe episode ID (e.g., session ID)
    const episodeId = params.episodeId ? (params.episodeId as string) : '';

    const [streamingData, setStreamingData] = useState<AnimepaheWatchResponse | null>(null);
    const [animeDetails, setAnimeDetails] = useState<Anime | null>(null);
    const [episodes, setEpisodes] = useState<AnimepaheEpisode[]>([]); // Use AnimepaheEpisode type
    const [currentEpisode, setCurrentEpisode] = useState<AnimepaheEpisode | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMetadata, setLoadingMetadata] = useState(true); // Separate loading for metadata/ep list
    const [loadingStream, setLoadingStream] = useState(true); // Separate loading for stream links
    const [error, setError] = useState<string | null>(null);
    const [selectedQuality, setSelectedQuality] = useState<string | null>(null);

    // Fetch Metadata and Episode List (Runs once per animeId)
    useEffect(() => {
         if (isNaN(animeId)) {
            setError('Invalid Anime ID.');
            setLoadingMetadata(false);
            setLoading(false); // Overall loading stops
            return;
        }

         async function fetchMetadataAndEpisodes() {
            setLoadingMetadata(true);
            setError(null); // Clear previous errors for this stage
            try {
                const [detailsRes, episodesRes] = await Promise.allSettled([
                    getAnimeDetails(animeId), // Fetch metadata from Jikan
                    getAnimeEpisodesPahe(animeId) // Fetch episode list from AnimePahe API
                ]);

                 // Handle Anime Details Result
                if (detailsRes.status === 'fulfilled') {
                    setAnimeDetails(detailsRes.value);
                    if (!detailsRes.value) {
                        console.warn(`[WatchPage] Anime details not found for ID ${animeId}`);
                        // Don't set main error yet, maybe episodes will load
                    }
                } else {
                    console.error('[WatchPage] Error fetching anime details:', detailsRes.reason);
                    // Don't set main error yet
                }

                 // Handle Episodes List Result
                if (episodesRes.status === 'fulfilled') {
                    const fetchedEpisodes = episodesRes.value || [];
                    setEpisodes(fetchedEpisodes);
                     if (fetchedEpisodes.length === 0) {
                        console.warn(`[WatchPage] No episodes found for Anime ID ${animeId} via AnimePahe.`);
                        // Set error only if details also failed or if episode list is critical
                        if (!detailsRes.value || detailsRes.status === 'rejected') {
                            setError("Could not load anime details or episode list.");
                        }
                    }
                } else {
                    console.error('[WatchPage] Error fetching episode list:', episodesRes.reason);
                    setEpisodes([]);
                     if (!detailsRes.value || detailsRes.status === 'rejected') {
                         setError("Could not load anime details or episode list.");
                     }
                }

            } catch (err) {
                console.error('[WatchPage] Unexpected error fetching metadata/episodes:', err);
                setError("Failed to load initial page data.");
                setAnimeDetails(null);
                setEpisodes([]);
            } finally {
                 setLoadingMetadata(false);
            }
         }

         fetchMetadataAndEpisodes();
    }, [animeId]);


    // Fetch Streaming Link (Runs when episodeId changes or episodes list loads)
    useEffect(() => {
        // Wait for episode list before trying to find the current episode
        if (loadingMetadata || !episodeId || episodes.length === 0) return;

         // Find the current episode details from the loaded list
        const foundEpisode = episodes.find(ep => ep.id === episodeId);
        setCurrentEpisode(foundEpisode || null);

         if (!foundEpisode) {
             console.warn(`[WatchPage] Current AnimePahe episode ID ${episodeId} not found in the list.`);
              setError(`Episode not found in the list. It might be invalid or recently removed.`);
              setLoadingStream(false);
              setLoading(false); // Update overall loading
             return;
         }


        async function fetchStreamingLink() {
            setLoadingStream(true);
            setError(null); // Clear previous stream errors
            setStreamingData(null);
            setSelectedQuality(null);
            if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
            if (videoRef.current) { videoRef.current.src = ''; }

            try {
                const data = await getAnimeStreamingLinkPahe(episodeId); // Use AnimePahe service
                 if (data && data.sources && data.sources.length > 0) {
                    setStreamingData(data);
                    // Select 1080p > 720p > first available
                    const defaultSource =
                        data.sources.find(s => s.quality === '1080p') ||
                        data.sources.find(s => s.quality === '720p') ||
                        data.sources[0];
                    setSelectedQuality(defaultSource?.quality || null);
                    console.log("[WatchPage] Stream data fetched (AnimePahe), selected quality:", defaultSource?.quality);
                } else {
                     console.error('[WatchPage] AnimePahe streaming link fetch succeeded but no sources found.');
                     setError('No streaming sources found for this episode.');
                }
            } catch (err: any) {
                 console.error('[WatchPage] Error fetching AnimePahe streaming link:', err);
                 setError(err.message || 'Could not load streaming source.');
            } finally {
                 setLoadingStream(false);
                 setLoading(false); // Update overall loading state
            }
        }

        fetchStreamingLink();

         // Cleanup HLS instance on component unmount or when episodeId changes
        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
                 console.log("[WatchPage] HLS instance destroyed on unmount/episode change.");
            }
        };

    }, [episodeId, episodes, loadingMetadata]); // Depend on episodeId and the loaded episodes list

    // Initialize HLS Player (Runs when streamingData or selectedQuality changes)
    useEffect(() => {
        if (videoRef.current && streamingData && selectedQuality) {
            const source = streamingData.sources.find(s => s.quality === selectedQuality);
            if (source && source.url) {
                const videoElement = videoRef.current;
                console.log(`[WatchPage] Setting video source (AnimePahe): Quality=${selectedQuality}, URL=${source.url}`);

                if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
                videoElement.removeAttribute('src');
                videoElement.load();

                if (Hls.isSupported() && (source.isM3U8 || source.url.includes('.m3u8'))) {
                    console.log("[WatchPage] HLS is supported. Initializing HLS player...");
                    const hls = new Hls({ /* HLS config if needed */ });
                    hls.loadSource(source.url);
                    hls.attachMedia(videoElement);
                    hls.on(Hls.Events.MANIFEST_PARSED, () => { console.log("[WatchPage] HLS Manifest parsed."); });
                    hls.on(Hls.Events.ERROR, (event, data) => {
                        console.error('[WatchPage] HLS Error:', data);
                         if (data.fatal) {
                             setError(`Video playback error (${data.type}): ${data.details}. Try another quality or refresh.`);
                             hls.destroy();
                             hlsRef.current = null;
                         }
                    });
                    hlsRef.current = hls;
                } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) { // Native HLS
                    console.log("[WatchPage] Native HLS support detected.");
                    videoElement.src = source.url;
                } else {
                    console.warn("[WatchPage] Browser may not support HLS or the provided format.");
                     // Try setting src directly for potential MP4/other formats
                     videoElement.src = source.url;
                     // If direct src fails, we rely on browser's native error handling
                }
            } else {
                console.log(`[WatchPage] No valid source URL found for selected quality "${selectedQuality}".`);
                setError("Could not find a valid video source for the selected quality.");
                if(videoRef.current) { videoRef.current.src = ''; }
            }
        }
    // Dependency array includes only what's needed to set the player source
    }, [streamingData, selectedQuality]);


    // Navigation helpers
    const currentEpisodeIndex = episodes.findIndex(ep => ep.id === episodeId);
    const prevEpisode = currentEpisodeIndex > 0 ? episodes[currentEpisodeIndex - 1] : null;
    const nextEpisode = currentEpisodeIndex < episodes.length - 1 ? episodes[currentEpisodeIndex + 1] : null;

    const navigateToEpisode = (epId: string | undefined) => {
        if (epId && epId !== episodeId) { // Prevent navigating to the same episode
            console.log(`[WatchPage] Navigating to AnimePahe episode: ${epId}`);
            setLoading(true); // Show loading indicator immediately
            setLoadingStream(true); // Specifically indicate stream loading
            router.push(`/watch/anime/${animeId}/${encodeURIComponent(epId)}`);
        }
    };

    // Combined Loading State for initial page load
     if (loadingMetadata && loadingStream && !error) { // Show full page loader only initially
        return (
            <div className="bg-black min-h-screen flex flex-col items-center justify-center text-white">
                 <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading episode...</p>
            </div>
        );
    }

    // Critical Error State (cannot load metadata/episodes OR initial stream)
    if (error && !loadingStream) { // Show error if stream failed after metadata loaded, or if metadata itself failed
        return (
            <div className="bg-black min-h-screen flex flex-col items-center justify-center text-white">
                <Alert variant="destructive" className="max-w-lg glass bg-destructive/20 text-destructive-foreground border-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Loading Episode</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                    <Button variant="outline" onClick={() => router.back()} className="mt-4 text-destructive-foreground border-destructive/50 hover:bg-destructive/30">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                    </Button>
                </Alert>
            </div>
        );
    }

     // Main Player UI
    return (
        <div className="bg-black min-h-screen flex flex-col lg:flex-row">
            {/* Main Video Player Area */}
            <div className="flex-grow flex flex-col bg-black">
                 {/* Header */}
                <div className="p-2 sm:p-4 flex items-center text-white bg-black/50 flex-shrink-0 z-10">
                     <Button variant="ghost" size="icon" onClick={() => router.push(`/anime/${animeId}`)} className="mr-2 hover:bg-white/10 text-white h-8 w-8 sm:h-9 sm:w-9">
                         <ArrowLeft size={18} />
                     </Button>
                     <div className="flex-1 truncate mr-2">
                        {loadingMetadata ? <Skeleton className="h-6 w-48 bg-gray-700" />
                         : animeDetails ? <Link href={`/anime/${animeId}`} className="text-base sm:text-lg font-semibold hover:underline truncate">{animeDetails.title}</Link>
                         : <span className="text-base sm:text-lg font-semibold">Anime Details Unavailable</span>
                        }
                         {currentEpisode ? (
                            <span className="ml-1 text-xs sm:text-sm text-muted-foreground"> - Ep {currentEpisode.number} {currentEpisode.title ? `- ${currentEpisode.title}` : ''}</span>
                          ) : !loadingMetadata && episodeId ? ( // Check !loadingMetadata before showing "loading info"
                             <span className="ml-1 text-xs sm:text-sm text-muted-foreground"> - Loading episode info...</span>
                          ) : null}
                     </div>
                     {/* Quality Selector */}
                     {streamingData && streamingData.sources.length > 0 && (
                         <Select
                            value={selectedQuality || ''}
                            onValueChange={(value) => value && setSelectedQuality(value)}
                            disabled={loadingStream || !streamingData}
                         >
                             <SelectTrigger
                                className="ml-auto bg-gray-800/70 border border-gray-700 text-white text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary appearance-none h-8 sm:h-9 w-[80px] sm:w-[100px]"
                                aria-label="Select video quality"
                             >
                                <SelectValue placeholder="Quality" />
                             </SelectTrigger>
                             <SelectContent className="glass bg-background border-border text-xs">
                                 {streamingData.sources.map((source) => (
                                     <SelectItem key={source.quality || 'unknown'} value={source.quality || ''} className="text-xs">
                                         {source.quality || 'Default'}
                                     </SelectItem>
                                 ))}
                             </SelectContent>
                         </Select>
                     )}
                </div>

                 {/* Video Player Area */}
                <AspectRatio ratio={16 / 9} className="w-full bg-black flex-grow relative">
                     {/* Loading/Error Overlay specific to video */}
                     {(loadingStream || (loading && !streamingData)) && <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}
                     {error && streamingData && <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20 p-4"><Alert variant="destructive" className="max-w-md"><AlertCircle className="h-4 w-4" /><AlertTitle>Playback Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert></div>}
                     <video
                        ref={videoRef}
                        controls
                        className="w-full h-full"
                        playsInline
                        poster={currentEpisode?.thumbnail || animeDetails?.imageUrl || ''} // Use episode thumbnail if available
                     >
                        Your browser does not support the video tag.
                    </video>
                </AspectRatio>
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-80 xl:w-96 bg-background/90 backdrop-blur-sm glass border-l border-border/50 flex-shrink-0 flex flex-col max-h-[50vh] lg:max-h-screen">
                <CardHeader className="p-3 border-b border-border/50 flex-shrink-0">
                     <CardTitle className="text-base flex items-center gap-2"><ListVideo size={18} className="text-primary"/> Episodes</CardTitle>
                </CardHeader>
                <ScrollArea className="flex-grow p-2">
                     {loadingMetadata ? (
                        <div className="p-4 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground"/></div>
                     ) : episodes.length > 0 ? (
                        <div className="space-y-1">
                            {episodes.map((ep) => (
                                <Button
                                    key={ep.id}
                                    variant={ep.id === episodeId ? "secondary" : "ghost"}
                                    onClick={() => navigateToEpisode(ep.id)}
                                    className="w-full justify-start text-left h-auto py-1.5 px-2 text-xs font-normal group disabled:opacity-100"
                                    disabled={ep.id === episodeId || loadingStream} // Disable current and during stream load
                                >
                                    <PlayCircle size={14} className={`mr-2 flex-shrink-0 ${ep.id === episodeId ? 'text-primary animate-pulse' : 'text-muted-foreground group-hover:text-foreground'}`}/>
                                    <span className="truncate flex-grow">
                                        Ep {ep.number} {ep.title ? `- ${ep.title}` : ''}
                                    </span>
                                     {ep.id === episodeId && <div className="w-1.5 h-1.5 bg-primary rounded-full ml-auto mr-1 animate-pulse"></div>}
                                </Button>
                            ))}
                        </div>
                     ) : (
                         <div className="p-4 text-center text-muted-foreground text-sm">
                            No episode list available.
                         </div>
                    )}
                </ScrollArea>
                 {/* Navigation Buttons */}
                 <div className="p-2 border-t border-border/50 flex justify-between flex-shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateToEpisode(prevEpisode?.id)}
                        disabled={!prevEpisode || loadingStream || loadingMetadata}
                        className="text-xs glass"
                    >
                        <ArrowLeft className="mr-1 h-4 w-4" /> Prev Ep
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateToEpisode(nextEpisode?.id)}
                        disabled={!nextEpisode || loadingStream || loadingMetadata}
                        className="text-xs glass"
                    >
                         Next Ep <ArrowRight className="ml-1 h-4 w-4" />
                     </Button>
                 </div>
            </div>
        </div>
    );
}
