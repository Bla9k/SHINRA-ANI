
'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
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
    const episodeId = params.episodeId ? decodeURIComponent(params.episodeId as string) : '';

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
            try {
                // Fetch streaming link, anime details, and episode list concurrently
                const [streamRes, detailsRes, episodesRes] = await Promise.allSettled([
                    getAnimeStreamingLink(episodeId),
                    getAnimeDetails(animeId),
                    getAnimeEpisodes(animeId)
                ]);

                // Handle Streaming Link Result
                if (streamRes.status === 'fulfilled') {
                    setStreamingData(streamRes.value);
                    // Select highest quality by default (or 'default')
                    const defaultSource =
                        streamRes.value.sources.find(s => s.quality === '1080p') ||
                        streamRes.value.sources.find(s => s.quality === 'default') ||
                        streamRes.value.sources[0]; // Fallback to first source
                    setSelectedQuality(defaultSource?.quality || null);
                } else {
                    console.error('Error fetching streaming link:', streamRes.reason);
                    setError(streamRes.reason instanceof Error ? streamRes.reason.message : 'Could not load streaming source.');
                }

                // Handle Anime Details Result
                if (detailsRes.status === 'fulfilled') {
                    setAnimeDetails(detailsRes.value);
                    if (!detailsRes.value) {
                        console.warn(`Anime details not found for ID ${animeId}`);
                        // Don't necessarily error out, maybe just show player without details
                    }
                } else {
                    console.error('Error fetching anime details:', detailsRes.reason);
                    // Don't necessarily error out, maybe just show player without details
                }

                // Handle Episodes List Result
                if (episodesRes.status === 'fulfilled') {
                    setEpisodes(episodesRes.value || []);
                    const foundEpisode = episodesRes.value?.find(ep => ep.id === episodeId);
                    setCurrentEpisode(foundEpisode || null);
                } else {
                    console.error('Error fetching episode list:', episodesRes.reason);
                     // Don't necessarily error out, maybe just show player without episode list
                }

            } catch (err: any) {
                console.error('Unexpected error fetching watch page data:', err);
                setError(err.message || 'Failed to load watch page data.');
            } finally {
                setLoading(false);
            }
        }

        fetchData();

        // Cleanup HLS instance on component unmount
        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [animeId, episodeId]);

    useEffect(() => {
        if (videoRef.current && streamingData && selectedQuality) {
            const source = streamingData.sources.find(s => s.quality === selectedQuality);
            if (source && source.url) {
                const videoElement = videoRef.current;
                if (Hls.isSupported() && (source.isM3U8 || source.url.includes('.m3u8'))) {
                    console.log("HLS is supported. Initializing HLS player...");
                    if (hlsRef.current) {
                        hlsRef.current.destroy(); // Destroy previous instance if exists
                    }
                    const hls = new Hls();
                    hls.loadSource(source.url);
                    hls.attachMedia(videoElement);
                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        console.log("HLS Manifest parsed, attempting to play.");
                        // videoElement.play().catch(e => console.error("Video play failed:", e)); // Autoplay attempt
                    });
                    hls.on(Hls.Events.ERROR, (event, data) => {
                         console.error('HLS Error:', data.type, data.details, data.fatal);
                         if (data.fatal) {
                             setError(`Video playback error (${data.type}): ${data.details}. Please try another quality or source if available.`);
                             switch(data.type) {
                                 case Hls.ErrorTypes.NETWORK_ERROR:
                                     // Suggest retrying or checking connection
                                     break;
                                case Hls.ErrorTypes.MEDIA_ERROR:
                                    hls.recoverMediaError(); // Attempt recovery
                                    break;
                                default:
                                    hls.destroy(); // Destroy on fatal error
                                    break;
                            }
                        }
                    });
                    hlsRef.current = hls;
                } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
                    // Native HLS support (Safari)
                    console.log("Native HLS support detected.");
                    videoElement.src = source.url;
                    // videoElement.play().catch(e => console.error("Video play failed:", e)); // Autoplay attempt
                } else if (videoElement.canPlayType(source.url.endsWith('.mp4') ? 'video/mp4' : 'application/octet-stream')) {
                    // Direct MP4 or other playable source
                    console.log("Direct video source detected.");
                    videoElement.src = source.url;
                    // videoElement.play().catch(e => console.error("Video play failed:", e)); // Autoplay attempt
                } else {
                    console.warn("Browser does not support HLS or the provided video format.");
                    setError("Your browser may not support this video format.");
                }
            } else {
                console.log("No valid source URL found for the selected quality.");
                setError("Could not find a valid video source for the selected quality.");
            }
        }
    }, [streamingData, selectedQuality]); // Re-run when quality changes

    // Navigation helpers
    const currentEpisodeIndex = episodes.findIndex(ep => ep.id === episodeId);
    const prevEpisode = currentEpisodeIndex > 0 ? episodes[currentEpisodeIndex - 1] : null;
    const nextEpisode = currentEpisodeIndex < episodes.length - 1 ? episodes[currentEpisodeIndex + 1] : null;

    const navigateToEpisode = (epId: string) => {
        router.push(`/watch/anime/${animeId}/${epId}`);
    };

    // Loading State
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
                 <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading stream...</p>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-screen">
                <Alert variant="destructive" className="max-w-lg glass">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error Loading Stream</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                    <Button variant="outline" onClick={() => router.back()} className="mt-4">
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
                 {/* Back Button and Title (Optional) */}
                <div className="p-2 sm:p-4 flex items-center text-white bg-black/50 flex-shrink-0">
                     <Button variant="ghost" size="icon" onClick={() => router.push(`/anime/${animeId}`)} className="mr-2 hover:bg-white/10">
                         <ArrowLeft size={20} />
                     </Button>
                     {animeDetails && <h1 className="text-lg font-semibold truncate">{animeDetails.title}</h1>}
                     {currentEpisode && <span className="ml-2 text-sm text-muted-foreground"> - Ep {currentEpisode.number}</span>}
                     {/* Quality Selector */}
                     {streamingData && streamingData.sources.length > 1 && (
                         <select
                             value={selectedQuality || ''}
                             onChange={(e) => setSelectedQuality(e.target.value)}
                             className="ml-auto bg-gray-800/70 border border-gray-700 text-white text-xs rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                         >
                             {streamingData.sources.map((source) => (
                                 <option key={source.quality || 'unknown'} value={source.quality || ''}>
                                     {source.quality || 'Default'}
                                 </option>
                             ))}
                         </select>
                     )}
                </div>

                 {/* Video Player */}
                <AspectRatio ratio={16 / 9} className="w-full bg-black flex-grow">
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
            <div className="w-full lg:w-80 xl:w-96 bg-background/90 backdrop-blur-sm glass border-l border-border/50 flex-shrink-0 flex flex-col max-h-screen lg:max-h-none">
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
                                    className="w-full justify-start text-left h-auto py-1.5 px-2 text-xs font-normal group"
                                    disabled={ep.id === episodeId}
                                >
                                    <PlayCircle size={14} className={`mr-2 flex-shrink-0 ${ep.id === episodeId ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}/>
                                    <span className="truncate flex-grow">
                                        Ep {ep.number} {ep.title ? `- ${ep.title}` : ''}
                                    </span>
                                </Button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-muted-foreground text-sm">
                             {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto"/> : 'No episodes found.'}
                         </div>
                    )}
                </ScrollArea>
                 {/* Navigation Buttons */}
                 <div className="p-2 border-t border-border/50 flex justify-between flex-shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => prevEpisode && navigateToEpisode(prevEpisode.id)}
                        disabled={!prevEpisode}
                    >
                        <ArrowLeft className="mr-1 h-4 w-4" /> Prev
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => nextEpisode && navigateToEpisode(nextEpisode.id)}
                        disabled={!nextEpisode}
                    >
                         Next <ArrowRight className="ml-1 h-4 w-4" />
                     </Button>
                 </div>
            </div>
        </div>
    );
}
