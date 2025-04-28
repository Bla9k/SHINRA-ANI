const axios = require('axios');

// Function to search for anime
async function fetchFromAllAnime(title) {
  try {
    const response = await axios.get(`https://api.allanime.day/api?query=${encodeURIComponent(title)}`);
    if (response.data && response.data.results.length > 0) {
      return response.data.results[0];
    }
    throw new Error('AllAnime no result');
  } catch (err) {
    console.error('AllAnime Search failed:', err.message);
    return null;
  }
}

// Function to fetch episodes from AllAnime, assuming an anime ID is available
async function fetchEpisodesFromAllAnime(animeData) {
    try {
        if (!animeData || !animeData.id) {
            throw new Error('Invalid anime data or missing ID provided to fetchEpisodesFromAllAnime.');
        }

        const animeId = animeData.id; // Assuming the search result includes an 'id'
        const episodesApiUrl = `https://api.allanime.day/api/anime/${animeId}/episodes`; // Example endpoint

        console.log(`[AllAnime Layer] Fetching episodes from: ${episodesApiUrl}`);

        const response = await axios.get(episodesApiUrl);

        if (!response.data || !Array.isArray(response.data.episodes)) {
            console.warn('[AllAnime Layer] Invalid episode list format');
            return null; // Assume failure if the format is wrong
        }

        // Assuming a structure like { episodes: [{episode_number: 1, title: '...', stream_url: '...'}] }
        const episodes = response.data.episodes.map(ep => ({
            number: ep.episode_number, // adjust this key based on the API
            title: ep.title || `Episode ${ep.episode_number}`, // Use title if available, else default
            link: ep.stream_url // Link to episode page or direct stream
        }));

        console.log(`[AllAnime Layer] Found ${episodes.length} episodes for anime ID ${animeId}`);
        return episodes;

    } catch (err) {
        console.error('[AllAnime Layer] Failed to fetch episodes:', err.message);
        return null;
    }
}

// Function to fetch streaming links from AllAnime, assuming an episode ID is available
async function fetchStreamingLinksFromAllAnime(episodeData) {
    try {
        if (!episodeData || !episodeData.link) {
            throw new Error('Invalid episode data or missing stream URL provided to fetchStreamingLinksFromAllAnime.');
        }

        const streamUrl = episodeData.link; // Assuming the episode object from fetchEpisodes includes a direct stream URL
        console.log(`[AllAnime Layer] Using direct stream URL: ${streamUrl}`);

        // In this case, we are assuming that episodeData.link is the direct URL for the stream
        // No further scraping or API calls are needed

        return streamUrl; // return

    } catch (err) {
        console.error('[AllAnime Layer] Failed to return streaming link:', err.message);
        return null;
    }
}

module.exports = { fetchFromAllAnime, fetchEpisodesFromAllAnime, fetchStreamingLinksFromAllAnime };