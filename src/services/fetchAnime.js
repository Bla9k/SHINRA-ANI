
// src/services/fetchAnime.js
// Import layer modules using ES6 syntax
import { fetchFromAllAnime } from '../layers/allanime.js';
import { fetchFromAnimeSuge, fetchEpisodesFromAnimeSuge, fetchStreamingLinksFromAnimeSuge } from '../layers/animesuge.js';
import { fetchFromAnimeDao, fetchEpisodesFromAnimeDao, fetchStreamingLinksFromAnimeDao } from '../layers/animedao.js';
import { fetchFromAniWave, fetchEpisodesFromAniWave, fetchStreamingLinksFromAniWave } from '../layers/aniwave.js';

// Function to search for anime across layers with fallback
async function fetchAnime(title) {
  const timestamp = new Date().toISOString();
  console.log(`[fetchAnime] [${timestamp}] Starting search for: "${title}"`);

  const layers = [
    { name: 'AllAnime', func: fetchFromAllAnime },
    { name: 'AnimeSuge', func: fetchFromAnimeSuge },
    { name: 'AniWave', func: fetchFromAniWave },   // Prioritize AniWave over AnimeDao
    { name: 'AnimeDao', func: fetchFromAnimeDao },
  ];

  for (const layer of layers) {
    console.log(`[fetchAnime] [${timestamp}] Trying ${layer.name}...`);
    try {
      const result = await layer.func(title);
      if (result) {
        console.log(`[fetchAnime] [${timestamp}] Found on ${layer.name}.`);
        return { source: layer.name, data: result };
      } else {
         console.log(`[fetchAnime] [${timestamp}] Not found on ${layer.name}.`);
      }
    } catch (layerError) {
        const error = layerError as Error;
        console.error(`[fetchAnime] [${timestamp}] Error during ${layer.name} search: ${error.message}`);
        // Continue to the next layer
    }
  }

  // --- All failed ---
  console.error(`[fetchAnime] [${timestamp}] Search failed on all sources for "${title}"`);
  return { source: null, data: null, error: `Could not find "${title}" on any provider.` };
}

// Function to fetch episodes based on the source and anime data
async function fetchEpisodes(animeData) {
    const timestamp = new Date().toISOString();
    if (!animeData || !animeData.source || !animeData.data || !animeData.data.link) { // Added null check for data.link
        console.error(`[fetchEpisodes] [${timestamp}] Invalid input: animeData object is missing source, data, or link. Data:`, animeData);
        throw new Error('Invalid anime data provided to fetchEpisodes.');
    }

    const source = animeData.source;
    const data = animeData.data; // Contains title, link etc.
    console.log(`[fetchEpisodes] [${timestamp}] Attempting to fetch episodes from source: ${source} for anime: ${data?.title}`);

    let episodes = null;

    try {
        switch (source) {
            case 'AllAnime':
                // Note: fetchEpisodesFromAllAnime might need the AllAnime ID, ensure it's in animeData.data
                episodes = await fetchEpisodesFromAllAnime(data);
                break;
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
                throw new Error(`Unsupported source for fetching episodes: ${source}`);
        }
    } catch (error) {
        console.error(`[fetchEpisodes] [${timestamp}] Error fetching episodes from ${source}:`, (error as Error).message);
        return null; // Return null if fetching fails
    }

    if (episodes && episodes.length > 0) {
        console.log(`[fetchEpisodes] [${timestamp}] Successfully fetched ${episodes.length} episodes from ${source}`);
    } else {
        console.warn(`[fetchEpisodes] [${timestamp}] Failed to fetch episodes or no episodes found from ${source} for "${data?.title}"`);
    }

    return episodes; // Return the array (potentially empty) or null
}

// Function to fetch streaming links for a specific episode
async function fetchStreamingLinks(episodeData) {
    const timestamp = new Date().toISOString();
    // Ensure episodeData contains source and link (which is the episode page URL from the chosen provider)
    if (!episodeData || !episodeData.source || !episodeData.link || !episodeData.number) {
         console.error(`[fetchStreamingLinks] [${timestamp}] Invalid input: episodeData object is missing source, link, or number. Data:`, episodeData);
        throw new Error('Invalid episode data provided to fetchStreamingLinks.');
    }

    const source = episodeData.source;
    console.log(`[fetchStreamingLinks] [${timestamp}] Attempting to fetch streaming links from source: ${source} for episode ${episodeData.number}`);

    let streamLink = null;

    try {
        switch (source) {
            case 'AllAnime':
                streamLink = await fetchStreamingLinksFromAllAnime(episodeData);
                break;
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
                throw new Error(`Unsupported source for fetching streaming links: ${source}`);
        }
    } catch (error) {
        console.error(`[fetchStreamingLinks] [${timestamp}] Error fetching streaming links from ${source}:`, (error as Error).message);
        return null; // Return null on failure
    }

    if (streamLink) {
         console.log(`[fetchStreamingLinks] [${timestamp}] Successfully obtained potential stream link/iframe from ${source}: ${streamLink}`);
    } else {
         console.warn(`[fetchStreamingLinks] [${timestamp}] Failed to fetch stream link/iframe from ${source} for episode ${episodeData.number}`);
    }

    return streamLink; // This might be an iframe URL needing further resolution
}

// Export using ES6 syntax
export { fetchAnime, fetchEpisodes, fetchStreamingLinks };
