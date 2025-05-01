// Import layer modules using ES6 syntax
import fetchFromAllAnime from '../layers/allanime.js'; // Assuming CommonJS for this one still
import { fetchFromAnimeSuge, fetchEpisodesFromAnimeSuge, fetchStreamingLinksFromAnimeSuge } from '../layers/animesuge.js';
import fetchFromAnimeDao from '../layers/animedao.js'; // Assuming CommonJS
import { fetchFromAniWave, fetchEpisodesFromAniWave, fetchStreamingLinksFromAniWave } from '../layers/aniwave.js';

// Function to search for anime across layers
async function fetchAnime(title) {
  let result;
  console.log(`[fetchAnime] Starting search for: "${title}"`);

  // --- Layer 1: AllAnime ---
  console.log('[fetchAnime] Trying AllAnime...');
  result = await fetchFromAllAnime(title); // fetchFromAllAnime expects CommonJS export
  if (result) {
    console.log(`[fetchAnime] Found on AllAnime.`);
    return { source: 'AllAnime', data: result };
  }

  // --- Layer 2: AnimeSuge ---
  console.log('[fetchAnime] Trying AnimeSuge...');
  result = await fetchFromAnimeSuge(title); // Uses ES6 import
  if (result) {
    console.log(`[fetchAnime] Found on AnimeSuge.`);
    return { source: 'AnimeSuge', data: result };
  }

  // --- Layer 3: AnimeDao ---
  console.log('[fetchAnime] Trying AnimeDao...');
  result = await fetchFromAnimeDao(title); // fetchFromAnimeDao expects CommonJS export
  if (result) {
    console.log(`[fetchAnime] Found on AnimeDao.`);
    return { source: 'AnimeDao', data: result };
  }

  // --- Layer 4: AniWave ---
  console.log('[fetchAnime] Trying AniWave...');
  result = await fetchFromAniWave(title); // Uses ES6 import
  if (result) {
    console.log(`[fetchAnime] Found on AniWave.`);
    return { source: 'AniWave', data: result };
  }

  // --- All failed ---
  console.log(`[fetchAnime] Search failed on all sources for "${title}"`);
  return { source: null, error: 'All sources failed to find the anime' };
}

// New function to fetch episodes based on the source and anime data
async function fetchEpisodes(animeData) {
  if (!animeData || !animeData.source || !animeData.data) {
    console.error('[fetchEpisodes] Invalid input: animeData object is missing source or data.');
    throw new Error('Invalid anime data provided to fetchEpisodes.');
  }

  console.log(`[fetchEpisodes] Attempting to fetch episodes from source: ${animeData.source} for anime: ${animeData.data?.title}`);

  let episodes = null;

  try {
    switch (animeData.source) {
      case 'AllAnime':
        // Assuming allanime.js uses CommonJS module.exports for fetchEpisodesFromAllAnime
        const allanimeLayer = await import('../layers/allanime.js'); // Dynamically import if needed
        const allAnimeEpisodes = await allanimeLayer.fetchEpisodesFromAllAnime(animeData.data);
        if (allAnimeEpisodes) episodes = allAnimeEpisodes;
        break;

      case 'AnimeSuge':
        const sugeEpisodes = await fetchEpisodesFromAnimeSuge(animeData.data); // Uses ES6 import
        if (sugeEpisodes) episodes = sugeEpisodes;
        break;

      case 'AnimeDao':
         // Assuming animedao.js uses CommonJS module.exports for fetchEpisodesFromAnimeDao
         const animedaoLayer = await import('../layers/animedao.js'); // Dynamically import if needed
         const daoEpisodes = await animedaoLayer.fetchEpisodesFromAnimeDao(animeData.data);
        if (daoEpisodes) episodes = daoEpisodes;
        break;

      case 'AniWave':
        const waveEpisodes = await fetchEpisodesFromAniWave(animeData.data); // Uses ES6 import
        if (waveEpisodes) episodes = waveEpisodes;
        break;

      default:
        console.error(`[fetchEpisodes] Unknown source: ${animeData.source}`);
        throw new Error(`Unsupported source for fetching episodes: ${animeData.source}`);
    }
  } catch (error) {
      console.error(`[fetchEpisodes] Error fetching episodes from ${animeData.source}:`, error.message);
      return null;
  }

  if (episodes) {
    console.log(`[fetchEpisodes] Successfully fetched ${episodes.length} episodes from ${animeData.source}`);
  } else {
    console.warn(`[fetchEpisodes] Failed to fetch episodes from ${animeData.source}`);
  }

  return episodes;
}

// New function to fetch streaming links for a specific episode
async function fetchStreamingLinks(episodeData) {
    if (!episodeData || !episodeData.source || !episodeData.link) {
        throw new Error('Invalid episode data provided to fetchStreamingLinks.');
    }

    console.log(`[fetchStreamingLinks] Attempting to fetch streaming links from source: ${episodeData.source}`);

    try {
        switch (episodeData.source) {
            case 'AllAnime':
                 const allanimeLayer = await import('../layers/allanime.js');
                 const allAnimeStream = await allanimeLayer.fetchStreamingLinksFromAllAnime(episodeData);
                return allAnimeStream;

            case 'AnimeSuge':
                const sugeStream = await fetchStreamingLinksFromAnimeSuge(episodeData); // Uses ES6 import
                return sugeStream;

            case 'AnimeDao':
                 const animedaoLayer = await import('../layers/animedao.js');
                 const daoStream = await animedaoLayer.fetchStreamingLinksFromAnimeDao(episodeData);
                 return daoStream;

             case 'AniWave':
                 const waveStream = await fetchStreamingLinksFromAniWave(episodeData); // Uses ES6 import
                 return waveStream;

            default:
                console.error(`[fetchStreamingLinks] Unknown source: ${episodeData.source}`);
                throw new Error(`Unsupported source for fetching streaming links: ${episodeData.source}`);
        }
    } catch (error) {
        console.error(`[fetchStreamingLinks] Error fetching streaming links from ${episodeData.source}:`, error.message);
        return null;
    }
}

// Export using ES6 syntax
export { fetchAnime, fetchEpisodes, fetchStreamingLinks };
