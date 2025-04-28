
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
// Use Weebapi services (currently placeholder)
import { getAnimeEpisodesWeebapi, getAnimeStreamingLinkWeebapi, WeebapiEpisode, WeebapiWatchResponse } from '@/services/weebapi';
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
import { Badge } from '@/components/ui/badge'; // Import Badge
import { cn } from '@/lib/utils';

export default function WatchAnimeEpisodePage() {
    const params = useParams();
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    const animeId = params.animeId ? parseInt(params.animeId as string, 10) : NaN;
    // This is now the weebapi episode ID (e.g., 'ep-1')
    const episodeId = params.episodeId ? decodeURIComponent(params.episodeId as string) : '';

    const [streamingData, setStreamingData] = useState<WeebapiWatchResponse | null>(null);
    const [animeDetails, setAnimeDetails] = useState<Anime | null>(null);
    const [episodes, setEpisodes] = useState<WeebapiEpisode[]>([]); // Use WeebapiEpisode type
    const [currentEpisode, setCurrentEpisode] = useState<WeebapiEpisode | null>(null);
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
                 // Fetch metadata from Jikan first
                const details = await getAnimeDetails(animeId);
                setAnimeDetails(details);

                if (!details) {
                     console.warn(`[WatchPage] Anime details not found for ID ${animeId}`);
                     setError("Could not load anime details.");
                     setLoadingMetadata(false);
                     setLoading(false);
                     notFound(); // If details fail, we can't proceed
                     return;
                }

                 // Fetch episode list from weebapi using the title
                if (details.title) {
                     try {
                         const fetchedEpisodes = await getAnimeEpisodesWeebapi(details.title);
                         setEpisodes(fetchedEpisodes);
                         if (fetchedEpisodes.length === 0) {
                              console.warn(`[WatchPage] No episodes found for Anime ID ${animeId} via Weebapi.`);
                              setError("No episode data available for this anime currently."); // Set error if list is empty
                         }
                     } catch (epError: any) {
                         console.error(`[WatchPage] Error fetching Weebapi episodes: ${epError.message}`);
                         setError("Could not load episode list.");
                         setEpisodes([]);
                     }
                 } else {
                      console.warn(`[WatchPage] Cannot fetch Weebapi episodes for Anime ID ${animeId}: Title is missing.`);
                      setError("Cannot load episode list: Anime title is missing.");
                      setEpisodes([]);
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
        // Wait for episode list (or at least metadata) before proceeding
        if (loadingMetadata || !episodeId || episodes.length === 0) {
            // Don't fetch if metadata/episodes are loading or if there are no episodes
            // If episodes are empty, error state should be set by the previous effect
            if (!loadingMetadata && episodes.length === 0) {
                setLoadingStream(false); // Ensure stream loading stops if no episodes
                setLoading(false);
            }
            return;
        };

        // Find the current episode details from the loaded list
        const foundEpisode = episodes.find(ep => ep.id === episodeId);
        setCurrentEpisode(foundEpisode || { id: episodeId, episode_num: episodeId.replace('ep-','') }); // Use fallback if not in list

        const playerUrlOrId = foundEpisode?.player_url || episodeId; // Use player_url if available, else the ID itself

        async function fetchStreamingLink() {
            setLoadingStream(true);
            setError(null); // Clear previous stream errors
            setStreamingData(null);
            setSelectedQuality(null);
            if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
            if (videoRef.current) { videoRef.current.src = ''; }

            try {
                console.log(`[WatchPage] Fetching streaming link for identifier: ${playerUrlOrId}`);
                const data = await getAnimeStreamingLinkWeebapi(playerUrlOrId);

                 if (data && data.sources && data.sources.length > 0) {
                    setStreamingData(data);
                    // Select best available quality (or just the first one)
                    const defaultSource = data.sources[0];
                    setSelectedQuality(defaultSource?.quality || 'default');
                    console.log("[WatchPage] Stream data fetched (Weebapi), selected quality:", defaultSource?.quality);
                } else {
                     console.error('[WatchPage] Weebapi streaming link fetch succeeded but no sources found.');
                     // Check if this is due to placeholder implementation
                     if (data && data.sources.length === 0) {
                        setError('Streaming source fetching is currently unavailable.');
                     } else {
                         setError('No streaming sources found for this episode.');
                     }
                }
            } catch (err: any) {
                 console.error('[WatchPage] Error fetching Weebapi streaming link:', err);
                 // Check if error message indicates library unavailable
                 if (err.message.includes('Library unavailable')) {
                     setError('Streaming source fetching is currently unavailable.');
                 } else {
                     setError(err.message || 'Could not load streaming source.');
                 }
            } finally {
                 setLoadingStream(false);
                 setLoading(loadingMetadata); // Only set overall loading to false if metadata is also done
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

    }, [episodeId, episodes, loadingMetadata]); // Re-run when episodeId or the list of episodes changes


    // Initialize HLS Player (Runs when streamingData or selectedQuality changes)
    useEffect(() => {
        if (videoRef.current && streamingData && selectedQuality) {
            // Find the source matching the selected quality (or default if not specified)
            const source = streamingData.sources.find(s => s.quality === selectedQuality) || streamingData.sources[0];

            if (source && source.url) {
                const videoElement = videoRef.current;
                console.log(`[WatchPage] Setting video source (Weebapi): Quality=${selectedQuality}, URL=${source.url}`);

                // Destroy previous HLS instance if exists
                if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
                videoElement.removeAttribute('src'); // Clear previous source
                videoElement.load(); // Reset video element state

                if (Hls.isSupported() && (source.isM3U8 || source.url.includes('.m3u8'))) {
                    console.log("[WatchPage] HLS is supported. Initializing HLS player...");
                    const hls = new Hls({ /* HLS config if needed */ });
                    hls.loadSource(source.url);
                    hls.attachMedia(videoElement);
                    hls.on(Hls.Events.MANIFEST_PARSED, () => { console.log("[WatchPage] HLS Manifest parsed."); });
                    hls.on(Hls.Events.ERROR, (event, data) => {
                        console.error('[WatchPage] HLS Error:', data);
                         if (data.fatal) {
                             setError(`Video playback error (${data.type}): ${data.details}. Try refreshing or check connection.`);
                             hls.destroy();
                             hlsRef.current = null;
                         }
                    });
                    hlsRef.current = hls;
                } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) { // Native HLS (Safari)
                    console.log("[WatchPage] Native HLS support detected.");
                    videoElement.src = source.url;
                } else {
                    console.warn("[WatchPage] Browser may not support HLS or the provided format. Trying direct source.");
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
            console.log(`[WatchPage] Navigating to Weebapi episode: ${epId}`);
            setLoading(true); // Show loading indicator immediately
            setLoadingStream(true); // Specifically indicate stream loading
            router.push(`/watch/anime/${animeId}/${encodeURIComponent(epId)}`);
        }
    };

    // Combined Loading State for initial page load
     if (loadingMetadata && !animeDetails && !error) { // Show full page loader only initially before metadata
        return (
            <div className="bg-black min-h-screen flex flex-col items-center justify-center text-white">
                 <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading episode...</p>
            </div>
        );
    }

    // Critical Error State (cannot load metadata/episodes OR initial stream)
    if (error && !loadingStream && !loadingMetadata) { // Show error if stream failed after metadata loaded, or if metadata itself failed
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
                            <span className="ml-1 text-xs sm:text-sm text-muted-foreground"> - Ep {currentEpisode.episode_num} {currentEpisode.title ? `- ${currentEpisode.title}` : ''}</span>
                          ) : !loadingMetadata && episodeId ? ( // Check !loadingMetadata before showing "loading info"
                             <span className="ml-1 text-xs sm:text-sm text-muted-foreground"> - Loading episode info...</span>
                          ) : null}
                     </div>
                     {/* Quality Selector */}
                     {streamingData && streamingData.sources.length > 1 && ( // Only show selector if multiple qualities
                         <Select
                            value={selectedQuality || 'default'}
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
                                 {streamingData.sources.map((source, index) => (
                                     <SelectItem key={source.quality || `q-${index}`} value={source.quality || 'default'} className="text-xs">
                                         {source.quality || 'Default'}
                                     </SelectItem>
                                 ))}
                             </SelectContent>
                         </Select>
                     )}
                     {streamingData && streamingData.sources.length === 1 && streamingData.sources[0].quality && (
                         // Show quality label if only one source exists with a quality defined
                         <Badge variant="secondary" className="ml-auto text-xs">{streamingData.sources[0].quality}</Badge>
                     )}
                </div>

                 {/* Video Player Area */}
                <AspectRatio ratio={16 / 9} className="w-full bg-black flex-grow relative">
                     {/* Loading/Error Overlay specific to video */}
                     {loadingStream && <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}
                     {error && !loadingStream && <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20 p-4"><Alert variant="destructive" className="max-w-md"><AlertCircle className="h-4 w-4" /><AlertTitle>Playback Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert></div>}
                     <video
                        ref={videoRef}
                        controls
                        className="w-full h-full"
                        playsInline
                        poster={animeDetails?.imageUrl || ''} // Use main anime cover as poster
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
                     {loadingMetadata && episodes.length === 0 ? ( // Show loading skeleton only if metadata is loading AND episodes are empty
                        <div className="space-y-1 p-2">
                           {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-8 w-full bg-muted/50 rounded" />)}
                        </div>
                     ) : episodes.length > 0 ? (
                        <div className="space-y-1">
                            {episodes.map((ep) => (
                                <Button
                                    key={ep.id} // Use the generated ID
                                    variant={ep.id === episodeId ? "secondary" : "ghost"}
                                    onClick={() => navigateToEpisode(ep.id)}
                                    className="w-full justify-start text-left h-auto py-1.5 px-2 text-xs font-normal group disabled:opacity-50" // Reduced opacity on disabled
                                    disabled={ep.id === episodeId || loadingStream} // Disable current and during stream load
                                >
                                    <PlayCircle size={14} className={cn("mr-2 flex-shrink-0 transition-colors", ep.id === episodeId ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')}/>
                                    <span className="truncate flex-grow">
                                        Ep {ep.episode_num} {ep.title ? `- ${ep.title}` : ''}
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
