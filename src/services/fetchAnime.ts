'use server'; // Mark this module as server-only

// Import layer modules using ES6 syntax
import { fetchFromAllAnime, fetchEpisodesFromAllAnime, fetchStreamingLinksFromAllAnime } from '../layers/allanime';
import { fetchFromAnimeSuge, fetchEpisodesFromAnimeSuge, fetchStreamingLinksFromAnimeSuge } from '../layers/animesuge';
import { fetchFromAnimeDao, fetchEpisodesFromAnimeDao, fetchStreamingLinksFromAnimeDao } from '../layers/animedao';
import { fetchFromAniWave, fetchEpisodesFromAniWave, fetchStreamingLinksFromAniWave } from '../layers/aniwave';

// --- Interfaces ---
interface AnimeSearchResult {
    source: string | null;
    data: any | null; // Consider defining a more specific type for returned data from layers
    error?: string;
}

interface EpisodeResult {
    id: string;
    number: number;
    title: string;
    link: string;
}

interface EpisodeData {
    link: string;
    number?: string | number;
    id?: string; // Optional episode ID if needed by the layer
}

interface AnimeData {
    title: string;
    link: string;
    id?: string; // Optional ID needed by some layers like AllAnime
}

// Function to search for anime across layers with fallback
async function fetchAnime(title: string): Promise<AnimeSearchResult> {
  const timestamp = new Date().toISOString();
  console.log(`[fetchAnime] [${timestamp}] Starting search for: "${title}"`);

  // Define layers with their search functions
  const layers = [
    // { name: 'AllAnime', func: fetchFromAllAnime }, // Temporarily disable if API is unstable
    { name: 'AnimeSuge', func: fetchFromAnimeSuge },
    { name: 'AniWave', func: fetchFromAniWave },
    { name: 'AnimeDao', func: fetchFromAnimeDao },
  ];

  for (const layer of layers) {
    console.log(`[fetchAnime] [${timestamp}] Trying ${layer.name}...`);
    try {
      const result = await layer.func(title);
      if (result) {
        console.log(`[fetchAnime] [${timestamp}] Found on ${layer.name}.`);
        // Basic validation of the result structure expected (title and link)
        if (result.title && result.link) {
            return { source: layer.name, data: result }; // Success
        } else {
             console.warn(`[fetchAnime] [${timestamp}] Layer ${layer.name} returned incomplete data:`, result);
             // Continue to the next layer if data is incomplete
        }
      } else {
         console.log(`[fetchAnime] [${timestamp}] Not found or skipped on ${layer.name}.`);
      }
    } catch (layerError: unknown) { // Catch unknown type
        const error = layerError as Error; // Type assertion
        console.error(`[fetchAnime] [${timestamp}] Error during ${layer.name} search: ${error.message}`);
        // Continue to the next layer
    }
  }

  // --- All failed ---
  console.error(`[fetchAnime] [${timestamp}] Search failed on all sources for "${title}"`);
  return { source: null, data: null, error: `Could not find "${title}" on any provider.` };
}

// Function to fetch episodes based on the source and anime data
async function fetchEpisodes(animeData: { source: string, data: AnimeData }): Promise<EpisodeResult[] | null> {
    const timestamp = new Date().toISOString();
    if (!animeData || !animeData.source || !animeData.data || !animeData.data.link) {
        console.error(`[fetchEpisodes] [${timestamp}] Invalid input: animeData object is missing source, data, or link. Data:`, animeData);
        return null; // Return null for invalid input
        // throw new Error('Invalid anime data provided to fetchEpisodes.');
    }

    const source = animeData.source;
    const data = animeData.data; // Contains title, link etc.
    console.log(`[fetchEpisodes] [${timestamp}] Attempting to fetch episodes from source: ${source} for anime: ${data?.title}`);

    let episodes: EpisodeResult[] | null = null;

    try {
        switch (source) {
            // case 'AllAnime':
            //     // Note: fetchEpisodesFromAllAnime might need the AllAnime ID, ensure it's in animeData.data.id
            //     if (!data.id) {
            //         console.error("[fetchEpisodes] AllAnime ID missing for fetchEpisodesFromAllAnime");
            //         return null;
            //     }
            //     episodes = await fetchEpisodesFromAllAnime(data as { id: string, title: string });
            //     break;
            case 'AnimeSuge':
                episodes = await fetchEpisodesFromAnimeSuge(data);
                break;
            case 'AniWave':
                episodes = await fetchEpisodesFromAniWave(data);
                break;
             case 'AnimeDao':
                 episodes = await fetchEpisodesFromAnimeDao(data);
                 break;
            default:
                console.error(`[fetchEpisodes] [${timestamp}] Unknown source: ${source}`);
                // throw new Error(`Unsupported source for fetching episodes: ${source}`);
                return null; // Return null for unknown source
        }
    } catch (error: unknown) { // Catch unknown type
        const err = error as Error; // Type assertion
        console.error(`[fetchEpisodes] [${timestamp}] Error fetching episodes from ${source}:`, err.message);
        return null; // Return null if fetching fails
    }

    if (episodes && episodes.length > 0) {
        console.log(`[fetchEpisodes] [${timestamp}] Successfully fetched ${episodes.length} episodes from ${source}`);
    } else {
        console.warn(`[fetchEpisodes] [${timestamp}] Failed to fetch episodes or no episodes found from ${source} for "${data?.title}"`);
        // Return null if no episodes were found or fetching failed within the layer
        return null;
    }

    return episodes; // Return the array (potentially empty if the layer returned empty)
}

// Function to fetch streaming links for a specific episode
async function fetchStreamingLinks(episodeData: EpisodeData & { source: string }): Promise<string | null> {
    const timestamp = new Date().toISOString();
    // Ensure episodeData contains source and link (which is the episode page URL from the chosen provider)
    if (!episodeData || !episodeData.source || !episodeData.link) {
         console.error(`[fetchStreamingLinks] [${timestamp}] Invalid input: episodeData object is missing source or link. Data:`, episodeData);
        return null; // Return null for invalid input
        // throw new Error('Invalid episode data provided to fetchStreamingLinks.');
    }

    const source = episodeData.source;
    console.log(`[fetchStreamingLinks] [${timestamp}] Attempting to fetch streaming links from source: ${source} for episode ${episodeData.number ?? 'N/A'}`);

    let streamLink: string | null = null;

    try {
        switch (source) {
            // case 'AllAnime':
            //      if (!episodeData.id || !episodeData.number) {
            //          console.error("[fetchStreamingLinks] AllAnime ID or number missing");
            //          return null;
            //      }
            //     streamLink = await fetchStreamingLinksFromAllAnime(episodeData as EpisodeData & { id: string, number: string | number });
            //     break;
            case 'AnimeSuge':
                streamLink = await fetchStreamingLinksFromAnimeSuge(episodeData);
                break;
             case 'AniWave':
                 streamLink = await fetchStreamingLinksFromAniWave(episodeData);
                 break;
             case 'AnimeDao':
                 streamLink = await fetchStreamingLinksFromAnimeDao(episodeData);
                 break;
            default:
                console.error(`[fetchStreamingLinks] [${timestamp}] Unknown source: ${source}`);
                // throw new Error(`Unsupported source for fetching streaming links: ${source}`);
                return null; // Return null for unknown source
        }
    } catch (error: unknown) { // Catch unknown type
        const err = error as Error; // Type assertion
        console.error(`[fetchStreamingLinks] [${timestamp}] Error fetching streaming links from ${source}:`, err.message);
        return null; // Return null on failure
    }

    if (streamLink) {
         console.log(`[fetchStreamingLinks] [${timestamp}] Successfully obtained potential stream link/iframe from ${source}: ${streamLink}`);
    } else {
         console.warn(`[fetchStreamingLinks] [${timestamp}] Failed to fetch stream link/iframe from ${source} for episode ${episodeData.number ?? 'N/A'}`);
    }

    return streamLink; // This might be an iframe URL needing further resolution
}

// Export using ES6 syntax
export { fetchAnime, fetchEpisodes, fetchStreamingLinks };
