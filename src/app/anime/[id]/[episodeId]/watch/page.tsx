import React, { useEffect, useState } from 'react';
// No need for useRouter in app directory pages, params are passed directly

interface WatchPageProps {
  params: {
    id: string; // The anime ID
    episodeId: string; // The episode ID used for fetching the stream
  };
}

interface StreamApiResponse {
  url?: string; // The stream URL
  quality?: string; // The quality of the stream
  message?: string; // Error message
}

const WatchPage: React.FC<WatchPageProps> = ({ params }) => {
  const { id, episodeId } = params;
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStreamUrl = async () => {
      try {
        setLoading(true);
        setError(null);
        setStreamUrl(null);

        console.log(`Fetching stream for Anime ID: ${id}, Episode ID: ${episodeId} using new API route`);

        // Fetch streaming data from the new API route
        const response = await fetch(`/api/stream/${id}/${encodeURIComponent(episodeId)}`);

        if (!response.ok) {
          const errorData: StreamApiResponse = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const data: StreamApiResponse = await response.json();

        if (!data.url) {
             throw new Error(data.message || 'No streaming URL found for this episode.');
        }

        setStreamUrl(data.url);
        console.log(`Found stream URL: ${data.url} (Quality: ${data.quality || 'unknown'})`);

      } catch (err: any) {
        console.error("Failed to fetch stream URL:", err);
        setError(err.message || 'Could not load the stream.');
      } finally {
        setLoading(false);
      }
    };

    if (id && episodeId) { // Only fetch if both IDs are available
      fetchStreamUrl();
    }
  }, [id, episodeId]); // Depend on both id and episodeId

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading stream...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!streamUrl) {
      return (
        <div className="flex justify-center items-center h-screen">
          No stream URL found.
        </div>
      );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Watching Episode {episodeId}</h1>
      {/* Displaying the parent anime ID for context */}
      <p className="text-gray-500 mb-4">Anime ID: {id}</p>

      <div className="video-player-container" style={{ position: 'relative', paddingTop: '56.25%' /* 16:9 Aspect Ratio */ }}>
        {/* Using the basic video tag with the fetched streamUrl */}
        <video
          src={streamUrl}
          controls
          autoPlay // Optional: Start playing automatically
          className="absolute top-0 left-0 w-full h-full"
        >
          Your browser does not support the video tag.
        </video>
      </div>
      {/* Add any other episode details or comments section here */}
    </div>
  );
};

export default WatchPage;
