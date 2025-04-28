
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { getAnimeDetails, Anime } from '@/services/anime'; // Still use Jikan for metadata
import { getAnimeStreamingLinkPahe, AnimePaheCDNLink } from '@/services/animepahe'; // Use AnimePahe service
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, ArrowLeft, ListVideo, ArrowRight, PlayCircle, Tv } from 'lucide-react';
import Hls from 'hls.js'; // Import Hls.js for playback
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
// Removed Link import from next/link as it wasn't used directly
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Use Select for quality
import { Badge } from '@/components/ui/badge'; // Import Badge
import { cn } from '@/lib/utils';

export default function WatchAnimeEpisodePage() {
    const params = useParams();
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    // Extract both AnimePahe ID and Episode Session ID from params
    const animePaheId = params.animeId ? params.animeId as string : ''; // Assuming param name is 'animeId' for AnimePahe ID
    const episodeSessionId = params.episodeId ? decodeURIComponent(params.episodeId as string) : ''; // Param name 'episodeId' for session ID

    const [streamingData, setStreamingData] = useState<AnimePaheCDNLink[] | null>(null);
    const [animeDetails, setAnimeDetails] = useState<Anime | null>(null); // Store Jikan details if needed for context
    const [loading, setLoading] = useState(true);
    const [loadingStream, setLoadingStream] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedQuality, setSelectedQuality] = useState<string | null>(null);

    // Fetch Streaming Link using AnimePahe ID and Episode Session ID
    useEffect(() => {
        if (!animePaheId || !episodeSessionId) {
            setError('Invalid Anime or Episode ID.');
            setLoading(false);
            return;
        }

        // Basic validation for animePaheId format (optional)
        if (!/^\d+$/.test(animePaheId)) {
           setError('Invalid Anime ID format.');
           setLoading(false);
           return;
        }

        async function fetchData() {
            setLoading(true);
            setLoadingStream(true);
            setError(null);
            setStreamingData(null);
            setSelectedQuality(null);
            if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
            if (videoRef.current) { videoRef.current.src = ''; }

            try {
                // Optionally fetch Jikan details if needed for display (e.g., title)
                // If not needed, you can remove this part.
                // const details = await getAnimeDetails(parseInt(animePaheId, 10)); // Assuming animePaheId corresponds to a MAL ID - This might be incorrect! Jikan needs MAL ID.
                // setAnimeDetails(details);
                 // If title is needed, pass it or fetch it separately if the ID mapping is complex.

                // Fetch streaming link from AnimePahe API using both IDs
                console.log(`Fetching AnimePahe streaming link for Anime ID: ${animePaheId}, Episode Session ID: ${episodeSessionId}`);
                const paheSources = await getAnimeStreamingLinkPahe(animePaheId, episodeSessionId);
                setStreamingData(paheSources);
                setLoadingStream(false);

                if (paheSources && paheSources.length > 0) {
                    // Automatically select the highest quality available by default
                    const sortedSources = [...paheSources].sort((a, b) => {
                        const qualityA = parseInt(a.label?.replace('p', ''), 10) || 0;
                        const qualityB = parseInt(b.label?.replace('p', ''), 10) || 0;
                        return qualityB - qualityA; // Sort descending by quality
                    });
                    const defaultSource = sortedSources[0];
                    setSelectedQuality(defaultSource?.label || 'default');
                    console.log("[WatchPage] Stream data fetched (AnimePahe), selected quality:", defaultSource?.label);
                } else {
                    console.warn('No streaming sources found from AnimePahe.');
                    setError('No streaming sources found for this episode.');
                }

            } catch (err: any) {
                console.error('Error fetching streaming data:', err);
                setError(err.message || 'Failed to load streaming data.');
            } finally {
                 setLoading(false); // Overall loading stops
                 setLoadingStream(false); // Explicitly stop stream loading indicator
            }
        }

        fetchData();

    }, [animePaheId, episodeSessionId, router]); // Dependencies

     // Initialize HLS Player (Runs when streamingData or selectedQuality changes)
    useEffect(() => {
         if (videoRef.current && streamingData && selectedQuality) {
             // Find the source matching the selected quality (or default if not specified)
             const source = streamingData.find(s => s.label === selectedQuality) || streamingData[0];

            if (source && source.file) { // Use the 'file' property which holds the stream URL
                const videoElement = videoRef.current;
                console.log(`[WatchPage] Setting video source (AnimePahe): Quality=${selectedQuality}, URL=${source.file}`);

                // Destroy previous HLS instance if exists
                if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
                videoElement.removeAttribute('src'); // Clear previous source
                videoElement.load(); // Reset video element state

                // Check if HLS is supported and URL looks like HLS
                // AnimePahe URLs from getAnimeStreamingLinkPahe are typically direct stream URLs
                const isM3U8 = source.file.includes('.m3u8');

                if (Hls.isSupported() && isM3U8) {
                    console.log("[WatchPage] HLS is supported. Initializing HLS player...");
                    const hls = new Hls({
                       // Configuration options can go here if needed
                       // e.g., enableWorker: true, lowLatencyMode: true
                       // Refer to hls.js documentation for options
                    });
                    hls.loadSource(source.file); // Load the M3U8 source
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
                } else if (videoElement.canPlayType('application/vnd.apple.mpegurl') && isM3U8) { // Native HLS (Safari)
                    console.log("[WatchPage] Native HLS support detected.");
                    videoElement.src = source.file;
                } else { // Assume it's a direct video file (MP4, etc.) or browser handles unsupported HLS
                     console.log("[WatchPage] HLS not supported or not M3U8. Attempting direct source.");
                     videoElement.src = source.file; // Set src directly
                      videoElement.onerror = (e) => {
                         console.error('[WatchPage] Video Element Error:', e);
                         setError("Failed to load video. The format might not be supported by your browser or the link is invalid.");
                      }
                }
            } else {
                console.log(`[WatchPage] No valid source URL found for selected quality "${selectedQuality}".`);
                setError("Could not find a valid video source for the selected quality.");
                if(videoRef.current) { videoRef.current.src = ''; }
            }
         }
    }, [streamingData, selectedQuality]); // Rerun when stream data or selected quality changes


    // Cleanup HLS instance on unmount
    useEffect(() => {
        return () => {
            if (hlsRef.current) {
                console.log("[WatchPage] Destroying HLS instance on unmount.");
                hlsRef.current.destroy();
            }
        };
    }, []);


    // Find related videos (other episodes) - Requires fetching episode list again if not passed
    // This functionality might be better placed on the Anime Detail page.
    const relatedEpisodes = () => {
         return []; // Placeholder
    }

    return (
        <div className="bg-black min-h-screen flex flex-col">
            {/* Header */}
            <header className="p-2 sm:p-4 flex items-center text-white bg-black/50 sticky top-0 z-20 border-b border-gray-700">
                  {/* Use onClick to go back, as animePaheId might not be MAL ID */}
                  <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2 hover:bg-white/10 text-white h-8 w-8 sm:h-9 sm:w-9">
                     <ArrowLeft size={18} />
                 </Button>
                 <div className="flex-1 truncate mr-2">
                     {/* Display generic title or fetch separately */}
                     <span className="text-base sm:text-lg font-semibold truncate">Watching Anime</span>
                     {episodeSessionId && (
                        <span className="ml-1 text-xs sm:text-sm text-muted-foreground"> - Episode {episodeSessionId}</span> // Display Session ID for now
                      )}
                 </div>

                 {/* Quality Selector */}
                 {streamingData && streamingData.length > 1 && ( // Only show selector if multiple qualities
                     <Select
                        value={selectedQuality || 'default'}
                        onValueChange={(value) => value && setSelectedQuality(value)}
                        disabled={loadingStream || !streamingData}
                     >
                         <SelectTrigger className="ml-auto bg-gray-800/70 border border-gray-700 text-white text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary appearance-none h-8 sm:h-9 w-[80px] sm:w-[100px]" aria-label="Select video quality">
                             <SelectValue placeholder="Quality" />
                         </SelectTrigger>
                         <SelectContent className="glass bg-background border-border text-xs">
                             {/* Ensure stable sorting of quality options */}
                             {[...(streamingData || [])]
                                .sort((a, b) => {
                                    const qualityA = parseInt(a.label?.replace('p', ''), 10) || 0;
                                    const qualityB = parseInt(b.label?.replace('p', ''), 10) || 0;
                                    return qualityB - qualityA; // Sort descending
                                })
                                .map((source, index) => (
                                    <SelectItem key={source.label || `q-${index}`} value={source.label || 'default'} className="text-xs">
                                        {source.label || 'Default'}
                                    </SelectItem>
                             ))}
                         </SelectContent>
                     </Select>
                 )}
                 {streamingData && streamingData.length === 1 && streamingData[0].label && (
                     <Badge variant="secondary" className="ml-auto text-xs">{streamingData[0].label}</Badge>
                 )}
            </header>

            {/* Video Player Area */}
            <main className="flex-grow flex items-center justify-center p-2 sm:p-4">
               {loading ? ( // Combined loading state
                  <div className="flex flex-col items-center justify-center text-center">
                      <Loader2 className="h-10 w-10 animate-spin text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">Loading stream...</p>
                  </div>
                ) : error ? (
                    <Alert variant="destructive" className="max-w-lg glass border-destructive/50 text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Playback Error</AlertTitle>
                        <AlertDescription className="text-destructive-foreground/80">{error}</AlertDescription>
                        <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mt-3 border-destructive/50 text-destructive-foreground hover:bg-destructive/10">
                             Try Reloading
                        </Button>
                    </Alert>
                ) : (
                    <AspectRatio ratio={16 / 9} className="w-full max-w-screen-xl rounded-md overflow-hidden border border-border/50 bg-black">
                        <video
                           ref={videoRef}
                           controls
                           className="w-full h-full outline-none" // Remove default outline
                           playsInline
                           poster={animeDetails?.imageUrl || ''} // Use fetched metadata poster if available
                           // Consider removing autoplay or making it conditional
                           // autoPlay
                        >
                           Your browser does not support the video tag or the video format.
                       </video>
                    </AspectRatio>
                )}
            </main>

            {/* Optional: Add placeholder for episode navigation if needed later */}
            {/*
            <footer className="p-2 sm:p-4 border-t border-gray-700 text-center">
                 <p className="text-xs text-muted-foreground">Episode Navigation Placeholder</p>
            </footer>
            */}
        </div>
    );
}
