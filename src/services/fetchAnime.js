// Import layer modules
// Use require for CommonJS compatibility if index.js uses require
const allanime = require('../layers/allanime');
const animesuge = require('../layers/animesuge');
const animedao = require('../layers/animedao');
const aniwave = require('../layers/aniwave');

// Function to search for anime across layers
async function fetchAnime(title) {
  let result;
  console.log(`[fetchAnime] Starting search for: "${title}"`);

  // --- Layer 1: AllAnime ---
  console.log('[fetchAnime] Trying AllAnime...');
  result = await allanime.fetchFromAllAnime(title);
  if (result) {
    console.log(`[fetchAnime] Found on AllAnime.`);
    return { source: 'AllAnime', data: result };
  }

  // --- Layer 2: AnimeSuge ---
  console.log('[fetchAnime] Trying AnimeSuge...');
  result = await animesuge.fetchFromAnimeSuge(title);
  if (result) {
    console.log(`[fetchAnime] Found on AnimeSuge.`);
    return { source: 'AnimeSuge', data: result };
  }

  // --- Layer 3: AnimeDao ---
  console.log('[fetchAnime] Trying AnimeDao...');
  result = await animedao.fetchFromAnimeDao(title);
  if (result) {
    console.log(`[fetchAnime] Found on AnimeDao.`);
    return { source: 'AnimeDao', data: result };
  }

  // --- Layer 4: AniWave ---
  console.log('[fetchAnime] Trying AniWave...');
  result = await aniwave.fetchFromAniWave(title);
  if (result) {
    console.log(`[fetchAnime] Found on AniWave.`);
    return { source: 'AniWave', data: result };
  }

  // --- All failed ---
  console.log(`[fetchAnime] Search failed on all sources for "${title}"`);
  return { source: null, error: 'All sources failed to find the anime' };
}

// New function to fetch episodes based on the source and anime data
// It assumes animeData is the result from a previous fetchAnime call
async function fetchEpisodes(animeData) {
  if (!animeData || !animeData.source || !animeData.data) {
    console.error('[fetchEpisodes] Invalid input: animeData object is missing source or data.');
    throw new Error('Invalid anime data provided to fetchEpisodes.');
  }

  console.log(`[fetchEpisodes] Attempting to fetch episodes from source: ${animeData.source} for anime: ${animeData.data?.title}`);

  let episodes = null;

  // We attempt to fetch based *only* on the source that was successful in the initial search
  try {
    switch (animeData.source) {
      case 'AllAnime':
        const allAnimeEpisodes = await allanime.fetchEpisodesFromAllAnime(animeData.data);
        if (allAnimeEpisodes) episodes = allAnimeEpisodes;
        break;

      case 'AnimeSuge':
        const sugeEpisodes = await animesuge.fetchEpisodesFromAnimeSuge(animeData.data);
        if (sugeEpisodes) episodes = sugeEpisodes;
        break;

      case 'AnimeDao':
        const daoEpisodes = await animedao.fetchEpisodesFromAnimeDao(animeData.data);
        if (daoEpisodes) episodes = daoEpisodes;
        break;

      case 'AniWave':
        const waveEpisodes = await aniwave.fetchEpisodesFromAniWave(animeData.data);
        if (waveEpisodes) episodes = waveEpisodes;
        break;

      default:
        console.error(`[fetchEpisodes] Unknown source: ${animeData.source}`);
        throw new Error(`Unsupported source for fetching episodes: ${animeData.source}`);
    }
  } catch (error) {
      console.error(`[fetchEpisodes] Error fetching episodes from ${animeData.source}:`, error.message);
      // Don't throw here, just return null to indicate failure for this source
      return null;
  }

  if (episodes) {
    console.log(`[fetchEpisodes] Successfully fetched ${episodes.length} episodes from ${animeData.source}`);
  } else {
    console.warn(`[fetchEpisodes] Failed to fetch episodes from ${animeData.source}`);
  }

  return episodes; // Return the fetched episodes or null if failed
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
                // Call the new function in the AllAnime layer
                const allAnimeStream = await allanime.fetchStreamingLinksFromAllAnime(episodeData);
                return allAnimeStream;

            case 'AnimeSuge':
                // Call the new function in the AnimeSuge layer
                const sugeStream = await animesuge.fetchStreamingLinksFromAnimeSuge(episodeData);
                return sugeStream;

            case 'AnimeDao':
                const daoStream = await animedao.fetchStreamingLinksFromAnimeDao(episodeData);
                return daoStream;
            // add other cases here

            default:
                console.error(`[fetchStreamingLinks] Unknown source: ${episodeData.source}`);
                throw new Error(`Unsupported source for fetching streaming links: ${episodeData.source}`);
        }
    } catch (error) {
        console.error(`[fetchStreamingLinks] Error fetching streaming links from ${episodeData.source}:`, error.message);
        return null;
    }
}

// Export all three functions
module.exports = { fetchAnime, fetchEpisodes, fetchStreamingLinks };