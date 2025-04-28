
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { getAnimeDetails, Anime } from '@/services/anime'; // Still use Jikan for metadata
import { getAnimeStreamingLinkPahe, AnimePaheCDNLink } from '@/services/animepahe'; // Use AnimePahe
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2, ArrowLeft, ListVideo, ArrowRight, PlayCircle, Tv } from 'lucide-react';
import Hls from 'hls.js'; // Import Hls.js for playback
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Link } from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Use Select for quality
import { Badge } from '@/components/ui/badge'; // Import Badge
import { cn } from '@/lib/utils';

export default function WatchAnimeEpisodePage() {
    const params = useParams();
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    const animeId = params.animeId ? parseInt(params.animeId as string, 10) : NaN;
    const episodeId = params.episodeId ? decodeURIComponent(params.episodeId as string) : '';

    const [streamingData, setStreamingData] = useState<AnimePaheCDNLink[] | null>(null);
    const [animeDetails, setAnimeDetails] = useState<Anime | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMetadata, setLoadingMetadata] = useState(true);
    const [loadingStream, setLoadingStream] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedQuality, setSelectedQuality] = useState<string | null>(null);

    // Fetch Metadata and Streaming Link
    useEffect(() => {
        if (isNaN(animeId) || !episodeId) {
            setError('Invalid Anime or Episode ID.');
            setLoading(false);
            return;
        }

        async function fetchData() {
            setLoading(true);
            setLoadingMetadata(true);
            setLoadingStream(true);
            setError(null);
            setStreamingData(null);
            setSelectedQuality(null);
            if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
            if (videoRef.current) { videoRef.current.src = ''; }

            try {
                // 1. Fetch metadata from Jikan
                const details = await getAnimeDetails(animeId);
                setAnimeDetails(details);
                 setLoadingMetadata(false); // Metadata loaded

                if (!details) {
                     console.warn(`Anime details not found for ID ${animeId}`);
                     setError("Could not load anime details.");
                     setLoading(false);
                     return;
                }


                // 2. Fetch streaming link from AnimePahe API
                console.log(`Fetching AnimePahe streaming link for episode ID: ${episodeId}`);
                const paheSources = await getAnimeStreamingLinkPahe(episodeId);
                 setStreamingData(paheSources);
                 setLoadingStream(false);

                if (paheSources && paheSources.length > 0) {
                  const defaultSource = paheSources[0];
                   setSelectedQuality(defaultSource?.label || 'default');
                   console.log("[WatchPage] Stream data fetched (AnimePahe), selected quality:", defaultSource?.label);
                } else {
                     console.warn('No streaming sources found from AnimePahe.');
                    setError('No streaming sources found for this episode.');
                }


            } catch (err: any) {
                console.error('Error fetching data:', err);
                setError(err.message || 'Failed to load data.');
            } finally {
                 setLoading(false);
            }
        }

        fetchData();

    }, [animeId, episodeId, router]);

     // Initialize HLS Player (Runs when streamingData or selectedQuality changes)
    useEffect(() => {
         if (videoRef.current && streamingData && selectedQuality) {
             // Find the source matching the selected quality (or default if not specified)
             const source = streamingData.find(s => s.label === selectedQuality) || streamingData[0];

            if (source && source.url) {
                const videoElement = videoRef.current;
                console.log(`[WatchPage] Setting video source (AnimePahe): Quality=${selectedQuality}, URL=${source.url}`);

                // Destroy previous HLS instance if exists
                if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null; }
                videoElement.removeAttribute('src'); // Clear previous source
                videoElement.load(); // Reset video element state

                // Check if isM3U8
                const isM3U8 = source.file.includes('.m3u8');

                if (Hls.isSupported() && (isM3U8 || source.file.includes('.m3u8'))) {
                    console.log("[WatchPage] HLS is supported. Initializing HLS player...");
                    const hls = new Hls({ /* HLS config if needed */ });
                    hls.loadSource(source.file); // HLS url from CDN link
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
                    videoElement.src = source.file;
                } else {
                    console.warn("[WatchPage] Browser may not support HLS or the provided format. Trying direct source.");
                     // Try setting src directly for potential MP4/other formats
                     videoElement.src = source.file;
                     // If direct src fails, we rely on browser's native error handling
                }
            } else {
                console.log(`[WatchPage] No valid source URL found for selected quality "${selectedQuality}".`);
                setError("Could not find a valid video source for the selected quality.");
                if(videoRef.current) { videoRef.current.src = ''; }
            }
         }
    }, [streamingData, selectedQuality]);

     // Find related videos (other episodes)
     const relatedEpisodes = () => {
         if (!animeDetails?.mal_id) return [];

         // TODO: replace with AnimePahe Logic, or replace/augment episodes state instead
         return [];
     }

    return (
        <div className="bg-black min-h-screen flex flex-col">
            {/* Header */}
            <header className="p-2 sm:p-4 flex items-center text-white bg-black/50 sticky top-0 z-20 border-b border-gray-700">
                 <Button variant="ghost" size="icon" onClick={() => router.push(`/anime/${animeId}`)} className="mr-2 hover:bg-white/10 text-white h-8 w-8 sm:h-9 sm:w-9">
                     <ArrowLeft size={18} />
                 </Button>
                 <div className="flex-1 truncate mr-2">
                    {loadingMetadata ? <Skeleton className="h-6 w-48 bg-gray-700" />
                     : animeDetails ? <Link href={`/anime/${animeId}`} className="text-base sm:text-lg font-semibold hover:underline truncate">{animeDetails.title}</Link>
                     : <span className="text-base sm:text-lg font-semibold">Anime Details Unavailable</span>
                    }
                     {episodeId && (
                        <span className="ml-1 text-xs sm:text-sm text-muted-foreground"> - Episode {episodeId}</span>
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
                             {streamingData.map((source, index) => (
                                 <SelectItem key={source.label || `q-${index}`} value={source.label || 'default'} className="text-xs">
                                     {source.label || 'Default'}
                                 </SelectItem>
                             ))}
                         </SelectContent>
                     </Select>
                 )}
                 {streamingData && streamingData.length === 1 && streamingData[0].label && (
                     // Show quality label if only one source exists with a quality defined
                     <Badge variant="secondary" className="ml-auto text-xs">{streamingData[0].label}</Badge>
                 )}
            </header>

            {/* Video Player Area */}
            <main className="flex-grow flex items-center justify-center p-2 sm:p-4">
               {loading && !animeDetails ? (
                  <div className="flex items-center justify-center">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  </div>
                ) : error ? (
                    <Alert variant="destructive" className="max-w-lg">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Playback Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : (
                    <AspectRatio ratio={16 / 9} className="w-full max-w-screen-xl rounded-md overflow-hidden border border-border/50">
                        <video
                           ref={videoRef}
                           controls
                           className="w-full h-full"
                           playsInline
                           poster={animeDetails?.imageUrl || ''}
                           muted // Muted attribute to attempt autoplay on more browsers
                           autoPlay // Autoplay
                        >
                           Your browser does not support the video tag.
                       </video>
                    </AspectRatio>
                )}
            </main>

            {/* Related Episodes - Example */}
           {/*
           <section className="bg-black/30 backdrop-blur-sm flex-shrink-0 p-4 border-t border-gray-700">
                <h2 className="text-white font-semibold mb-2">Related Episodes</h2>
                <div className="flex overflow-x-auto gap-3">
                   {relatedEpisodes().map(ep => (
                      <Button variant="outline" size="sm" key={ep.id}>Ep {ep.episode}</Button>
                   ))}
                </div>
            </section>
            */}
        </div>
    );
}

