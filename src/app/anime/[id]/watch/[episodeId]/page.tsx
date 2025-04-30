
'use client'; // Keep this for client-side fetching and rendering

import React, { useEffect, useState } from 'react';
import Hls from 'hls.js'; // Import HLS.js for .m3u8 playback

interface WatchPageProps {
  params: {
    id: string; // The MAL ID (used mainly for context/navigation back)
    episodeId: string; // The AnimePahe Episode Session ID
  };
}

interface StreamSource {
  file: string; // Stream URL
  label: string; // Quality label (e.g., "1080p")
  // Add other fields if available from API (audio, resolution, etc.)
}

interface StreamApiResponse {
  sources?: StreamSource[]; // Expect an array of sources
  message?: string; // Error message
}

const WatchPage: React.FC<WatchPageProps> = ({ params }) => {
  const { id: malId, episodeId } = params; // Renamed id to malId for clarity
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [qualityOptions, setQualityOptions] = useState<StreamSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchStreamSources = async () => {
      try {
        setLoading(true);
        setError(null);
        setStreamUrl(null);
        setQualityOptions([]);

        if (!malId || !episodeId) {
          throw new Error("Missing Anime MAL ID or Episode Session ID.");
        }

        console.log(`Fetching stream sources for Episode Session ID: ${episodeId} (Anime MAL ID: ${malId})`);

        // Fetch streaming data from the new API route (using AnimePahe episode ID)
        // Note: We need the AnimePahe *internal* anime ID for the watch route.
        // This page currently only gets the MAL ID and Episode Session ID.
        // We need to fetch the AnimePahe Anime ID first, or adjust the API route.
        // For now, assuming the API route needs animeId and episodeSessionId:
        // /api/animepahe/watch/[animeId]/[episodeSessionId]

        // ---- TEMPORARY WORKAROUND: Need to fetch AnimePahe Anime ID first ----
        // This demonstrates the issue: the watch API needs the *AnimePahe* anime ID,
        // but this page currently only has the MAL ID.
        // A proper solution would involve fetching the AnimePahe ID on the previous page
        // or having an API route that maps MAL ID -> AnimePahe ID -> fetches sources.
        // For now, we'll *assume* an API exists that takes episodeSessionId only,
        // or we modify the existing API to deduce the animeId if possible (less likely).
        // Let's try modifying the call, assuming the API route can handle it or we adjust it later.

        // PROBLEM: The API route /api/animepahe/watch expects AnimePahe Anime ID, not MAL ID.
        // We need to get the AnimePahe Anime ID first.
        // Let's assume the API route is updated or we fetch the ID elsewhere.
        // For now, this call will likely fail unless the API route is changed.
        // A better approach: pass animePaheId along with episodeId from the details page.
        // Let's *simulate* having the AnimePahe ID for now. This needs fixing.

        // Fetch AnimePahe ID first (simulated)
        const animePaheIdResponse = await fetch(`/api/animepahe/search/${encodeURIComponent(malId)}`); // This searches by MAL ID, not title - needs fixing in API route too
        if (!animePaheIdResponse.ok) throw new Error("Failed to get AnimePahe ID");
        const animePaheIdData = await animePaheIdResponse.json();
        const animePaheAnimeId = animePaheIdData.animePaheId;

        if (!animePaheAnimeId) {
             throw new Error("Could not find the internal AnimePahe ID for this anime.");
        }
        console.log(`Found AnimePahe internal ID: ${animePaheAnimeId}`);


        // Use the CORRECT AnimePahe ID and Episode Session ID
        const response = await fetch(`/api/animepahe/watch/${animePaheAnimeId}/${encodeURIComponent(episodeId)}`);

        if (!response.ok) {
          const errorData: StreamApiResponse = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
           // More specific error for 404
           if (response.status === 404) {
                throw new Error("No streaming sources found for this episode on AnimePahe.");
            }
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data: StreamApiResponse = await response.json();

        if (!data.sources || data.sources.length === 0) {
             throw new Error(data.message || 'No streaming sources found for this episode.');
        }

        // Sort sources, potentially preferring higher quality
        const sortedSources = data.sources.sort((a, b) => {
            const qualityA = parseInt(a.label.replace('p', ''), 10) || 0;
            const qualityB = parseInt(b.label.replace('p', ''), 10) || 0;
            return qualityB - qualityA; // Sort descending by quality
        });

        setQualityOptions(sortedSources);

        // Set default stream URL (e.g., highest quality)
        const defaultSource = sortedSources[0];
        setStreamUrl(defaultSource.file); // 'file' holds the URL in AnimePahe CDN response

        console.log(`Found ${sortedSources.length} sources. Defaulting to ${defaultSource.label} (${defaultSource.file})`);

      } catch (err: any) {
        console.error("Failed to fetch stream sources:", err);
        setError(err.message || 'Could not load the stream.');
        setQualityOptions([]);
        setStreamUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStreamSources();
  }, [malId, episodeId]); // Depend on MAL ID and Episode Session ID

  // HLS.js Integration Effect
  useEffect(() => {
    if (streamUrl && videoRef.current) {
      const videoElement = videoRef.current;
      let hlsInstance: Hls | null = null;

      // Check if the browser supports HLS natively (like Safari)
      if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        console.log("Browser supports HLS natively.");
        videoElement.src = streamUrl;
        videoElement.addEventListener('loadedmetadata', () => {
          // videoElement.play(); // Optional: autoplay
        });
      } else if (Hls.isSupported()) {
        // Use HLS.js if supported and not natively handled
        console.log("Initializing HLS.js for playback.");
        hlsInstance = new Hls();
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(videoElement);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log("HLS manifest parsed.");
          // videoElement.play(); // Optional: autoplay
        });
        hlsInstance.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error('HLS Fatal Error:', data);
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.error('Network error during HLS loading');
                //setError('Network error loading stream.'); // Optionally set error state
                hlsInstance?.startLoad(); // try to recover network error
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.error('Media error during HLS loading');
                //setError('Media error loading stream.');
                hlsInstance?.recoverMediaError(); // try to recover media error
                break;
              default:
                //setError('An error occurred while loading the stream.');
                hlsInstance?.destroy(); // cannot recover
                break;
            }
          } else {
             console.warn('HLS Non-Fatal Error:', data);
          }
        });
      } else {
        console.warn("HLS is not supported by this browser.");
        setError("Your browser does not support playing this type of stream.");
      }

      // Cleanup function
      return () => {
        if (hlsInstance) {
          console.log("Destroying HLS.js instance.");
          hlsInstance.destroy();
        }
        // Remove native listeners if added
        videoElement.src = ''; // Clear source
      };
    }
  }, [streamUrl]); // Re-run when streamUrl changes


   const handleQualityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newUrl = event.target.value;
    if (newUrl) {
        console.log("Changing quality to:", newUrl);
        setStreamUrl(newUrl); // This will trigger the HLS.js effect
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
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

  return (
    <div className="container mx-auto p-4 pt-20 md:pt-24"> {/* Add padding top to avoid overlap with TopBar */}
      <h1 className="text-2xl font-bold mb-1">Watching Episode</h1> {/* Simpler title */}
      <p className="text-sm text-muted-foreground mb-4">Anime MAL ID: {malId} | Episode Session: {decodeURIComponent(episodeId)}</p>

       {/* Quality Selector */}
       {qualityOptions.length > 1 && (
           <div className="mb-4">
               <Label htmlFor="quality-select" className="mr-2">Quality:</Label>
               <Select value={streamUrl} onValueChange={handleQualityChange} id="quality-select">
                    <SelectTrigger className="w-[180px] glass">
                        <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent className="glass">
                        {qualityOptions.map((source) => (
                            <SelectItem key={source.label} value={source.file}>
                                {source.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
           </div>
       )}

      <div className="video-player-container bg-black rounded-lg overflow-hidden shadow-xl aspect-video">
         {/* Use standard video tag; HLS.js will attach */}
        <video
          ref={videoRef}
          controls
          // autoPlay // Autoplay can be annoying, let user click play
          className="w-full h-full"
        >
          Your browser does not support the video tag or HLS playback.
        </video>
      </div>
      {/* Add episode list or other controls here if needed */}
    </div>
  );
};

// Import required components (ensure these exist)
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";

export default WatchPage;
