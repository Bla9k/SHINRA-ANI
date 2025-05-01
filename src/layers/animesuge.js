import axios from 'axios';
import * as cheerio from 'cheerio';

// Target the new domain
const ANIMESUGE_DOMAIN = 'https://animesugetv.to';

// Function to search for anime
async function fetchFromAnimeSuge(title) {
  try {
    // Use the new domain for search
    const searchUrl = `${ANIMESUGE_DOMAIN}/filter?keyword=${encodeURIComponent(title)}`;
    console.log(`[AnimeSuge Layer] Searching: ${searchUrl}`);
    const response = await axios.get(searchUrl);
    const $ = cheerio.load(response.data);
    const firstResult = $('.flw-item').first(); // Keep selector, often stable
    const animeTitle = firstResult.find('.film-name a').text();
    const animeLink = firstResult.find('.film-name a').attr('href');

    if (!animeTitle || !animeLink) throw new Error('AnimeSuge no result');

    // Make link absolute using the new domain
    const absoluteLink = animeLink.startsWith('/') ? `${ANIMESUGE_DOMAIN}${animeLink}` : animeLink;

    console.log(`[AnimeSuge Layer] Found: ${animeTitle} at ${absoluteLink}`);
    return { title: animeTitle, link: absoluteLink };
  } catch (err) {
    console.error('[AnimeSuge Layer] Search failed:', err.message);
    return null;
  }
}

// Function to fetch episodes from an AnimeSuge anime page
async function fetchEpisodesFromAnimeSuge(animeData) {
  try {
    if (!animeData || !animeData.link) {
      throw new Error('Invalid anime data provided to fetchEpisodesFromAnimeSuge.');
    }

    const animePageUrl = animeData.link; // This should be the absolute URL
    console.log(`[AnimeSuge Layer] Fetching episodes from: ${animePageUrl}`);

    const response = await axios.get(animePageUrl);
    const $ = cheerio.load(response.data);

    const episodes = [];

    // --- Scraping Logic for Episodes ---
    // Keep the selector, but verify it on the new domain animesugetv.to
    // Common selector: '.episodes_list .nav-item a' or similar
    $('.episodes-list .nav-link').each((index, element) => { // Example selector, adjust if needed
        const episodeLinkElement = $(element);
        const episodeLink = episodeLinkElement.attr('href');
        // Try to extract episode number from data attribute or text/title
        const epNumFromData = episodeLinkElement.data('number') || episodeLinkElement.data('episode-num');
        const epNumFromTitle = episodeLinkElement.attr('title')?.match(/Episode\s*(\d+)/i)?.[1];
        const epNumFromText = episodeLinkElement.text().trim().match(/(\d+)/)?.[0];

        let episodeNumber = NaN;
        if (epNumFromData) episodeNumber = parseInt(String(epNumFromData), 10);
        else if (epNumFromTitle) episodeNumber = parseInt(epNumFromTitle, 10);
        else if (epNumFromText) episodeNumber = parseInt(epNumFromText, 10);

        const episodeTitle = episodeLinkElement.attr('title') || `Episode ${episodeNumber}`; // Use title attribute or default

        if (episodeLink && !isNaN(episodeNumber)) {
            // Ensure link is absolute using the new domain
            const fullEpisodeLink = episodeLink.startsWith('/') ? `${ANIMESUGE_DOMAIN}${episodeLink}` : episodeLink;
            // Generate a unique ID (e.g., combining anime title and episode number)
            // This ID will be used in the watch URL later
            const uniqueEpisodeId = `${animeData.title.replace(/\s+/g, '-')}-ep-${episodeNumber}`;
            episodes.push({
                id: uniqueEpisodeId, // Unique ID for the episode
                number: episodeNumber,
                title: episodeTitle,
                link: fullEpisodeLink, // Link to the AnimeSuge episode page
            });
        }
    });
    // ---

    if (episodes.length === 0) {
        console.warn(`[AnimeSuge Layer] No episodes found using selectors for ${animeData.title} on ${ANIMESUGE_DOMAIN}`);
    }

    // Sort episodes by number
    episodes.sort((a, b) => a.number - b.number);

    console.log(`[AnimeSuge Layer] Found ${episodes.length} episodes for ${animeData.title}`);
    return episodes;

  } catch (err) {
    console.error(`[AnimeSuge Layer] Failed to fetch episodes for ${animeData?.title}:`, err.message);
    return null;
  }
}

// Function to fetch streaming links from an AnimeSuge episode page
async function fetchStreamingLinksFromAnimeSuge(episodeData) {
    try {
        if (!episodeData || !episodeData.link) {
            throw new Error('Invalid episode data provided to fetchStreamingLinksFromAnimeSuge.');
        }

        const episodePageUrl = episodeData.link; // Use the link from the fetched episode object
        console.log(`[AnimeSuge Layer] Fetching streaming links from: ${episodePageUrl}`);

        const response = await axios.get(episodePageUrl);
        const $ = cheerio.load(response.data);

        // --- Scraping Logic for Streaming Links ---
        // Often in an iframe or a specific player element
        // Verify this selector on animesugetv.to
        const iframeSrc = $('.play-video iframe').attr('src') || $('#player iframe').attr('src');

        if (!iframeSrc) {
            console.warn(`[AnimeSuge Layer] No iframe source found for streaming links on ${episodePageUrl}`);
            // Maybe try finding AJAX URLs or other player scripts as fallback
            return null;
        }

        console.log(`[AnimeSuge Layer] Found iframe source: ${iframeSrc}`);
        // This iframe source might need further processing (e.g., if it points to another player like vidstream)
        // For now, return the direct iframe source. The API route handler might need to resolve this.
        return iframeSrc;

    } catch (err) {
        console.error(`[AnimeSuge Layer] Failed to fetch streaming links for episode ${episodeData?.number}:`, err.message);
        return null;
    }
}

// Update module exports if using CommonJS, or use ES6 exports if project setup allows
export { fetchFromAnimeSuge, fetchEpisodesFromAnimeSuge, fetchStreamingLinksFromAnimeSuge };
