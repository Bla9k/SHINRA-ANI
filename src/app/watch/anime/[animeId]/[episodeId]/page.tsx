
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
// Updated import to use internal API fetcher
import { getAnimeStreamingLink, ConsumetWatchResponse, ConsumetEpisode } from '@/services/consumet';
import { getAnimeDetails, Anime } from '@/services/anime'; // Fetch metadata for context
import { getAnimeEpisodes } from '@/services/consumet'; // To show episode list
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, ArrowLeft, ListVideo, ArrowRight, PlayCircle, Tv } from 'lucide-react';
import Hls from 'hls.js'; // Import Hls.js for playback
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function WatchAnimeEpisodePage() {
    const params = useParams();
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    const animeId = params.animeId ? parseInt(params.animeId as string, 10) : NaN;
    // Use the raw episodeId from params for API calls, decoding happens later if needed for display
    const episodeId = params.episodeId ? (params.episodeId as string) : '';

    const [streamingData, setStreamingData] = useState<ConsumetWatchResponse | null>(null);
    const [animeDetails, setAnimeDetails] = useState<Anime | null>(null);
    const [episodes, setEpisodes] = useState<ConsumetEpisode[]>([]);
    const [currentEpisode, setCurrentEpisode] = useState<ConsumetEpisode | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedQuality, setSelectedQuality] = useState<string | null>(null);

    useEffect(() => {
        if (isNaN(animeId) || !episodeId) {
            setError('Invalid Anime or Episode ID.');
            setLoading(false);
            return;
        }

        async function fetchData() {
            setLoading(true);
            setError(null);
            setStreamingData(null); // Clear previous stream data
            setSelectedQuality(null); // Clear previous quality selection
            if (hlsRef.current) { // Destroy previous HLS instance
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
            if(videoRef.current) { // Clear video src
                videoRef.current.src = '';
            }


            try {
                // Fetch streaming link (now via internal API), anime details, and episode list concurrently
                const [streamRes, detailsRes, episodesRes] = await Promise.allSettled([
                    getAnimeStreamingLink(episodeId), // Calls internal API
                    getAnimeDetails(animeId),
                    getAnimeEpisodes(animeId) // Calls internal API
                ]);

                // Handle Streaming Link Result
                if (streamRes.status === 'fulfilled') {
                    const data = streamRes.value;
                     if (data && data.sources && data.sources.length > 0) {
                        setStreamingData(data);
                        // Select highest quality by default (or 'default')
                        const defaultSource =
                            data.sources.find(s => s.quality === '1080p') ||
                            data.sources.find(s => s.quality === 'default') ||
                            data.sources[0]; // Fallback to first source
                        setSelectedQuality(defaultSource?.quality || null);
                        console.log("[WatchPage] Stream data fetched, selected quality:", defaultSource?.quality);
                    } else {
                         console.error('[WatchPage] Streaming link fetch succeeded but no sources found.');
                         setError('No streaming sources found for this episode.');
                    }
                } else {
                    console.error('[WatchPage] Error fetching streaming link:', streamRes.reason);
                     setError(streamRes.reason instanceof Error ? streamRes.reason.message : 'Could not load streaming source.');
                     // Critical error if stream link fails
                }

                // Handle Anime Details Result (Less critical)
                if (detailsRes.status === 'fulfilled') {
                    setAnimeDetails(detailsRes.value);
                    if (!detailsRes.value) {
                        console.warn(`[WatchPage] Anime details not found for ID ${animeId}`);
                    }
                } else {
                    console.error('[WatchPage] Error fetching anime details:', detailsRes.reason);
                }

                // Handle Episodes List Result (Less critical)
                if (episodesRes.status === 'fulfilled') {
                    const fetchedEpisodes = episodesRes.value || [];
                    setEpisodes(fetchedEpisodes);
                    const foundEpisode = fetchedEpisodes.find(ep => ep.id === episodeId);
                    setCurrentEpisode(foundEpisode || null);
                    if (!foundEpisode) {
                         console.warn(`[WatchPage] Current episode ID ${episodeId} not found in fetched list.`);
                    }
                } else {
                    console.error('[WatchPage] Error fetching episode list:', episodesRes.reason);
                     setEpisodes([]); // Ensure list is empty on error
                }

            } catch (err: any) {
                console.error('[WatchPage] Unexpected error fetching watch page data:', err);
                setError(err.message || 'Failed to load watch page data.');
            } finally {
                setLoading(false);
            }
        }

        fetchData();

        // Cleanup HLS instance on component unmount or when episodeId changes
        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
                 console.log("[WatchPage] HLS instance destroyed on unmount/episode change.");
            }
        };
    }, [animeId, episodeId]); // Re-fetch ALL data when episodeId changes

    useEffect(() => {
        if (videoRef.current && streamingData && selectedQuality) {
            const source = streamingData.sources.find(s => s.quality === selectedQuality);
            if (source && source.url) {
                const videoElement = videoRef.current;
                console.log(`[WatchPage] Setting video source: Quality=${selectedQuality}, URL=${source.url}`);

                 // Destroy previous HLS instance before setting new source
                if (hlsRef.current) {
                     hlsRef.current.destroy();
                     hlsRef.current = null;
                     console.log("[WatchPage] Previous HLS instance destroyed before loading new source.");
                }
                // Clear existing src to prevent conflicts
                videoElement.removeAttribute('src');
                videoElement.load(); // Reset video element state


                if (Hls.isSupported() && (source.isM3U8 || source.url.includes('.m3u8'))) {
                    console.log("[WatchPage] HLS is supported. Initializing HLS player...");
                    const hls = new Hls({
                        // Optional: Add HLS config options here if needed
                         // Example: fragLoadingMaxRetry: 4,
                         // Example: levelLoadingMaxRetry: 4,
                    });
                    hls.loadSource(source.url);
                    hls.attachMedia(videoElement);
                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        console.log("[WatchPage] HLS Manifest parsed.");
                        // Optional: Attempt autoplay (might be blocked by browser)
                        // videoElement.play().catch(e => console.warn("Autoplay failed:", e));
                    });
                    hls.on(Hls.Events.ERROR, (event, data) => {
                         console.error('[WatchPage] HLS Error:', data);
                         if (data.fatal) {
                            const errorType = data.type;
                            const errorDetails = data.details;
                             setError(`Video playback error (${errorType}): ${errorDetails}. Try another quality or refresh.`);
                             switch(errorType) {
                                 case Hls.ErrorTypes.NETWORK_ERROR:
                                      console.error("[WatchPage] HLS Network Error - check connection or source URL.");
                                     // Suggest retrying or checking connection
                                     // You could attempt recovery here too: hls.startLoad();
                                     break;
                                case Hls.ErrorTypes.MEDIA_ERROR:
                                    console.error("[WatchPage] HLS Media Error - attempting recovery.");
                                    hls.recoverMediaError(); // Attempt recovery
                                    break;
                                default:
                                     console.error("[WatchPage] HLS Fatal Error - destroying HLS instance.");
                                    hls.destroy(); // Destroy on fatal error
                                    hlsRef.current = null; // Clear ref
                                    break;
                            }
                        } else {
                             console.warn("[WatchPage] Non-fatal HLS error occurred:", data);
                             // Non-fatal errors might be recoverable, HLS often handles them.
                        }
                    });
                    hlsRef.current = hls;
                } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
                    // Native HLS support (Safari)
                    console.log("[WatchPage] Native HLS support detected.");
                    videoElement.src = source.url;
                } else if (videoElement.canPlayType(source.url.endsWith('.mp4') ? 'video/mp4' : 'application/octet-stream')) {
                    // Direct MP4 or other playable source
                    console.log("[WatchPage] Direct video source detected.");
                    videoElement.src = source.url;
                } else {
                    console.warn("[WatchPage] Browser does not support HLS or the provided video format.");
                    setError("Your browser may not support this video format.");
                }
            } else {
                console.log(`[WatchPage] No valid source URL found for selected quality "${selectedQuality}".`);
                setError("Could not find a valid video source for the selected quality.");
                // Clear video src if quality has no valid url
                 if(videoRef.current) {
                    videoRef.current.src = '';
                }
            }
        }
    // Only re-run when streamingData or selectedQuality changes
    // Avoid running this effect when other state like 'episodes' changes,
    // as it could unnecessarily re-initialize the player.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [streamingData, selectedQuality]);

    // Navigation helpers
    const currentEpisodeIndex = episodes.findIndex(ep => ep.id === episodeId);
    const prevEpisode = currentEpisodeIndex > 0 ? episodes[currentEpisodeIndex - 1] : null;
    const nextEpisode = currentEpisodeIndex < episodes.length - 1 ? episodes[currentEpisodeIndex + 1] : null;

    const navigateToEpisode = (epId: string | undefined) => {
        if (epId) {
            console.log(`[WatchPage] Navigating to episode: ${epId}`);
            setLoading(true); // Show loading immediately on navigation
            router.push(`/watch/anime/${animeId}/${encodeURIComponent(epId)}`);
        }
    };

    // Display loading state for the whole page initially
     if (loading && !streamingData && !error) {
        return (
            <div className="bg-black min-h-screen flex flex-col items-center justify-center text-white">
                 <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading stream & episode data...</p>
            </div>
        );
    }

    // Display critical error state (e.g., failed to get stream link)
    if (error && !streamingData) { // Show error if stream data failed to load
        return (
            <div className="bg-black min-h-screen flex flex-col items-center justify-center text-white">
                <Alert variant="destructive" className="max-w-lg glass bg-destructive/20 text-destructive-foreground border-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Loading Stream</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                    <Button variant="outline" onClick={() => router.back()} className="mt-4 text-destructive-foreground border-destructive/50 hover:bg-destructive/30">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                    </Button>
                </Alert>
            </div>
        );
    }

     // Main Player UI (Render even if episode list/details are still loading/failed, as long as stream data is available)
    return (
        <div className="bg-black min-h-screen flex flex-col lg:flex-row">
            {/* Main Video Player Area */}
            <div className="flex-grow flex flex-col bg-black">
                 {/* Header with back, title, episode, quality selector */}
                <div className="p-2 sm:p-4 flex items-center text-white bg-black/50 flex-shrink-0 z-10">
                     <Button variant="ghost" size="icon" onClick={() => router.push(`/anime/${animeId}`)} className="mr-2 hover:bg-white/10 text-white h-8 w-8 sm:h-9 sm:w-9">
                         <ArrowLeft size={18} />
                     </Button>
                     <div className="flex-1 truncate mr-2">
                        {animeDetails ? (
                            <Link href={`/anime/${animeId}`} className="text-base sm:text-lg font-semibold hover:underline truncate">{animeDetails.title}</Link>
                         ) : (
                             <Skeleton className="h-6 w-48 bg-gray-700" />
                         )}
                         {currentEpisode ? (
                            <span className="ml-1 text-xs sm:text-sm text-muted-foreground"> - Ep {currentEpisode.number} {currentEpisode.title ? `- ${currentEpisode.title}` : ''}</span>
                          ) : episodeId ? (
                             <span className="ml-1 text-xs sm:text-sm text-muted-foreground"> - Loading episode info...</span>
                          ) : null}
                     </div>
                     {/* Quality Selector */}
                     {streamingData && streamingData.sources.length > 1 && (
                         <select
                             value={selectedQuality || ''}
                             onChange={(e) => setSelectedQuality(e.target.value)}
                             className="ml-auto bg-gray-800/70 border border-gray-700 text-white text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary appearance-none h-8 sm:h-9"
                             aria-label="Select video quality"
                         >
                              {!selectedQuality && <option value="" disabled>Quality</option>}
                             {streamingData.sources.map((source) => (
                                 <option key={source.quality || 'unknown'} value={source.quality || ''}>
                                     {source.quality || 'Default'}
                                 </option>
                             ))}
                         </select>
                     )}
                </div>

                 {/* Video Player Area */}
                <AspectRatio ratio={16 / 9} className="w-full bg-black flex-grow relative">
                     {/* Display loading indicator over video area only when actively loading stream/quality */}
                     {loading && <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}
                     {/* Display error specific to video playback */}
                     {error && streamingData && <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20 p-4"><Alert variant="destructive" className="max-w-md"><AlertCircle className="h-4 w-4" /><AlertTitle>Playback Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert></div>}
                     <video
                        ref={videoRef}
                        controls
                        className="w-full h-full"
                        playsInline // Important for mobile playback
                        // poster={animeDetails?.imageUrl || currentEpisode?.image || ''} // Optional poster
                     >
                        Your browser does not support the video tag.
                    </video>
                </AspectRatio>
                 {/* Player Controls / Overlay (Can add custom controls later) */}
            </div>

            {/* Sidebar (Episode List & Info) */}
            <div className="w-full lg:w-80 xl:w-96 bg-background/90 backdrop-blur-sm glass border-l border-border/50 flex-shrink-0 flex flex-col max-h-[50vh] lg:max-h-screen">
                <CardHeader className="p-3 border-b border-border/50 flex-shrink-0">
                     <CardTitle className="text-base flex items-center gap-2"><ListVideo size={18} className="text-primary"/> Episodes</CardTitle>
                </CardHeader>
                <ScrollArea className="flex-grow p-2">
                    {episodes.length > 0 ? (
                        <div className="space-y-1">
                            {episodes.map((ep) => (
                                <Button
                                    key={ep.id}
                                    variant={ep.id === episodeId ? "secondary" : "ghost"}
                                    onClick={() => navigateToEpisode(ep.id)}
                                    className="w-full justify-start text-left h-auto py-1.5 px-2 text-xs font-normal group disabled:opacity-100" // Keep opacity high for active item
                                    disabled={ep.id === episodeId} // Disable clicking the current episode
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
                             {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto"/> : 'No episode list available.'}
                         </div>
                    )}
                </ScrollArea>
                 {/* Navigation Buttons */}
                 <div className="p-2 border-t border-border/50 flex justify-between flex-shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateToEpisode(prevEpisode?.id)}
                        disabled={!prevEpisode || loading}
                        className="text-xs"
                    >
                        <ArrowLeft className="mr-1 h-4 w-4" /> Prev Ep
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateToEpisode(nextEpisode?.id)}
                        disabled={!nextEpisode || loading}
                        className="text-xs"
                    >
                         Next Ep <ArrowRight className="ml-1 h-4 w-4" />
                     </Button>
                 </div>
            </div>
        </div>
    );
}
