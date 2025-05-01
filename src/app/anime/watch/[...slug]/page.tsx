'use client'; // Keep this for client-side fetching and rendering

import React, { useEffect, useState, useRef } from 'react';
import Hls from 'hls.js'; // Import HLS.js for .m3u8 playback
import { useSearchParams } from 'next/navigation'; // Import useSearchParams
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';

interface WatchPageProps {
  params: {
    // Slug will be [malId, episodeId]
    slug: string[];
  };
}

interface StreamSource {
  url: string; // The actual streaming URL (.m3u8, .mp4, etc.)
  quality: string; // Quality label (e.g., "1080p", "iframe")
}

interface StreamApiResponse {
  url?: string;       // The stream URL
  quality?: string;   // Quality (might be 'iframe' if unresolved)
  message?: string;   // Optional error message
}

const WatchPage: React.FC<WatchPageProps> = ({ params }) => {
  const { slug } = params;
  const searchParams = useSearchParams(); // Hook to get query parameters

  const malId = slug?.[0];
  const episodeId = slug?.[1]; // This is the unique ID generated on the details page
  const source = searchParams.get('source'); // Get source from query param
  const providerLink = searchParams.get('providerLink'); // Get provider link from query param

  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [qualityLabel, setQualityLabel] = useState<string | null>(null); // Store the quality label
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsInstanceRef = useRef<Hls | null>(null);

  useEffect(() => {
    const fetchStreamData = async () => {
      setLoading(true);
      setError(null);
      setStreamUrl(null);
      setQualityLabel(null);

      if (!malId || !episodeId || !source || !providerLink) {
        setError("Missing required information to fetch stream (Anime ID, Episode ID, Source, or Link).");
        setLoading(false);
        return;
      }

      console.log(`[WatchPage] Fetching stream for MAL ID: ${malId}, EpID: ${episodeId}, Source: ${source}, ProviderLink: ${providerLink}`);

      try {
        // Call the internal API route, passing source and providerLink as query parameters
        const apiUrl = `/api/stream?source=${encodeURIComponent(source)}&link=${encodeURIComponent(providerLink)}&number=${episodeId.split('-').pop()}`; // Add episode number if available in ID

        const response = await fetch(apiUrl);

        if (!response.ok) {
          const errorData: StreamApiResponse = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
          // Handle specific 404 from the API route
          if (response.status === 404) {
            throw new Error(errorData.message || "Streaming source not found on the provider.");
          }
          throw new Error(errorData.message || `Failed to fetch stream: ${response.statusText}`);
        }

        const data: StreamApiResponse = await response.json();

        if (!data.url) {
          throw new Error(data.message || 'No streaming URL received from API.');
        }

        setStreamUrl(data.url);
        setQualityLabel(data.quality || 'unknown'); // Store quality
        console.log(`[WatchPage] Received stream URL: ${data.url} (Quality: ${data.quality || 'unknown'})`);

      } catch (err: any) {
        console.error("[WatchPage] Failed to fetch stream data:", err);
        setError(err.message || 'Could not load the stream.');
        setStreamUrl(null);
        setQualityLabel(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStreamData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [malId, episodeId, source, providerLink]); // Depend on extracted params

  // HLS.js Integration Effect
  useEffect(() => {
    if (streamUrl && videoRef.current) {
      const videoElement = videoRef.current;

      // Cleanup previous instance if exists
      if (hlsInstanceRef.current) {
        console.log("[WatchPage] Destroying previous HLS instance.");
        hlsInstanceRef.current.destroy();
        hlsInstanceRef.current = null;
      }

       // Check if URL is likely an HLS stream
       if (streamUrl.includes('.m3u8')) {
          if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            console.log("[WatchPage] Browser supports HLS natively.");
            videoElement.src = streamUrl;
            videoElement.addEventListener('loadedmetadata', () => {
              // videoElement.play(); // Optional: autoplay
            });
          } else if (Hls.isSupported()) {
            console.log("[WatchPage] Initializing HLS.js for playback.");
            const hls = new Hls();
            hlsInstanceRef.current = hls; // Store instance
            hls.loadSource(streamUrl);
            hls.attachMedia(videoElement);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              console.log("[WatchPage] HLS manifest parsed.");
              // videoElement.play(); // Optional: autoplay
            });
            hls.on(Hls.Events.ERROR, (event, data) => {
              if (data.fatal) {
                console.error('[WatchPage] HLS Fatal Error:', data);
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    console.error('Network error during HLS loading');
                    setError('Network error loading stream. Retrying...');
                    hls.startLoad(); // Try to recover network error
                    break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    console.error('Media error during HLS loading');
                    setError('Media error loading stream. Retrying...');
                    hls.recoverMediaError(); // Try to recover media error
                    break;
                  default:
                    setError('An error occurred while loading the stream. Cannot recover.');
                    hls.destroy();
                    hlsInstanceRef.current = null; // Clear ref on unrecoverable error
                    break;
                }
              } else {
                 console.warn('[WatchPage] HLS Non-Fatal Error:', data);
              }
            });
          } else {
            console.warn("[WatchPage] HLS is not supported by this browser.");
            setError("Your browser does not support playing this type of stream.");
          }
      } else {
          // Handle non-HLS streams (e.g., MP4) directly
          console.log("[WatchPage] Playing non-HLS stream directly:", streamUrl);
          videoElement.src = streamUrl;
          videoElement.addEventListener('loadedmetadata', () => {
              // videoElement.play(); // Optional: autoplay
          });
           videoElement.onerror = () => {
                setError(`Failed to load video source: ${streamUrl}`);
           };
      }


      // Cleanup function for this effect
      return () => {
        if (hlsInstanceRef.current) {
          console.log("[WatchPage] Destroying HLS instance on cleanup.");
          hlsInstanceRef.current.destroy();
          hlsInstanceRef.current = null;
        }
        // Remove native listeners if added
        if (videoElement) {
           videoElement.removeAttribute('src'); // Clear source
           videoElement.load(); // Reset video element state
        }
      };
    }
  }, [streamUrl]); // Re-run when streamUrl changes


   // Display logic
   const renderContent = () => {
        if (loading) {
          return (
            <div className="flex justify-center items-center h-screen bg-background">
              <div className="text-center">
                 <Skeleton className="aspect-video w-full rounded-lg mb-4" />
                 <div className="flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                 </div>
                 <p className="text-muted-foreground">Loading stream...</p>
              </div>
            </div>
          );
        }

        if (error) {
          return (
            <div className="flex justify-center items-center h-screen bg-background px-4">
               <Alert variant="destructive" className="max-w-md glass">
                   <AlertCircle className="h-4 w-4" />
                   <AlertTitle>Streaming Error</AlertTitle>
                   <AlertDescription>{error}</AlertDescription>
                    {/* Optional: Add a back button */}
                    <Button variant="link" onClick={() => window.history.back()} className="mt-3 text-destructive-foreground">Go Back</Button>
               </Alert>
            </div>
          );
        }

        if (!streamUrl) {
            return (
              <div className="flex justify-center items-center h-screen bg-background">
                 <p className="text-muted-foreground">Could not find stream URL.</p>
              </div>
            );
        }

        // Success state: Render the player
        return (
             <>
               {/* <h1 className="text-2xl font-bold mb-1">Watching Episode {episodeId.split('-').pop()}</h1> */}
                <p className="text-sm text-muted-foreground mb-4">
                    Episode {episodeId.split('-').pop()} <span className="mx-1">|</span> Source: {source} {qualityLabel && `(${qualityLabel})`}
                </p>

                <div className="video-player-container bg-black rounded-lg overflow-hidden shadow-xl aspect-video">
                    <video
                        ref={videoRef}
                        controls
                        // autoPlay // Let user initiate playback
                        className="w-full h-full"
                        playsInline // Important for mobile browsers
                        preload="metadata" // Preload only metadata initially
                    >
                        Your browser does not support the video tag or HLS playback.
                    </video>
                </div>
                 {/* Add episode list or other controls here if needed */}
             </>
        );
   };


  return (
    // Added padding top to avoid overlap with TopBar (adjust value if needed)
    <div className="container mx-auto px-4 py-20 md:py-24">
        {renderContent()}
    </div>
  );
};


export default WatchPage;
