const axios = require('axios');
const cheerio = require('cheerio');

// Function to search for anime
async function fetchFromAnimeSuge(title) {
  try {
    const response = await axios.get(`https://animesuge.to/filter?keyword=${encodeURIComponent(title)}`);
    const $ = cheerio.load(response.data);
    const firstResult = $('.flw-item').first();
    const animeTitle = firstResult.find('.film-name a').text();
    const animeLink = firstResult.find('.film-name a').attr('href');

    if (!animeTitle || !animeLink) throw new Error('AnimeSuge no result');

    // The link obtained from search is relative, make it absolute
    const absoluteLink = `https://animesuge.to${animeLink}`;

    return { title: animeTitle, link: absoluteLink };
  } catch (err) {
    console.error('AnimeSuge Search failed:', err.message);
    return null;
  }
}

// New function to fetch episodes from an AnimeSuge anime page
async function fetchEpisodesFromAnimeSuge(animeData) {
  try {
    if (!animeData || !animeData.link) {
      throw new Error('Invalid anime data provided to fetchEpisodesFromAnimeSuge.');
    }

    const animePageUrl = animeData.link; // This should be the absolute URL from fetchFromAnimeSuge
    console.log(`[AnimeSuge Layer] Fetching episodes from: ${animePageUrl}`);

    const response = await axios.get(animePageUrl);
    const $ = cheerio.load(response.data);

    const episodes = []; // Initialize as an empty array

    // --- Scraping Logic for Episodes ---
    // This is a common pattern, may need adjustment based on actual AnimeSuge structure
    // Update the selector based on inspecting an AnimeSuge episode list page
    $('.episodes_list .nav-item a').each((index, element) => {
        const episodeLinkElement = $(element);
        const episodeLink = episodeLinkElement.attr('href');
        const episodeNumberText = episodeLinkElement.attr('title')?.replace('Episode ', '').trim(); // Often found in title attribute
        const episodeTitle = episodeLinkElement.find('.film-name').text().trim(); // Might be inside the link

        let episodeNumber = NaN;
        if (episodeNumberText) {
            episodeNumber = parseInt(episodeNumberText, 10);
        }

        // Fallback if number not in title
        if (isNaN(episodeNumber)) {
            const fallbackText = episodeLinkElement.text().trim();
            const numberMatch = fallbackText.match(/\d+/);
            if (numberMatch) {
                episodeNumber = parseInt(numberMatch[0], 10);
            }
        }

        if (episodeLink && !isNaN(episodeNumber)) {
            const fullEpisodeLink = episodeLink.startsWith('/') ? `https://animesuge.to${episodeLink}` : episodeLink;
            episodes.push({
                number: episodeNumber,
                title: episodeTitle || `Episode ${episodeNumber}`, // Use a default title if none found
                link: fullEpisodeLink, // Link to the episode page
            });
        }
    });
    // ---

    if (episodes.length === 0) {
        console.warn(`[AnimeSuge Layer] No episodes found using selector '.episodes_list .nav-item a' for ${animeData.title}`);
        // You might want to try other selectors here as a fallback
    }

    // Sort episodes by number to ensure correct order
    episodes.sort((a, b) => a.number - b.number);

    console.log(`[AnimeSuge Layer] Found ${episodes.length} episodes for ${animeData.title}`);
    return episodes;

  } catch (err) {
    console.error(`[AnimeSuge Layer] Failed to fetch episodes for ${animeData?.title}:`, err.message);
    return null; // Indicate failure for this source
  }
}

// New function to fetch streaming links from an AnimeSuge episode page
async function fetchStreamingLinksFromAnimeSuge(episodeData) {
    try {
        if (!episodeData || !episodeData.link) {
            throw new Error('Invalid episode data provided to fetchStreamingLinksFromAnimeSuge.');
        }

        const episodePageUrl = episodeData.link;
        console.log(`[AnimeSuge Layer] Fetching streaming links from: ${episodePageUrl}`);

        const response = await axios.get(episodePageUrl);
        const $ = cheerio.load(response.data);

        // --- Scraping Logic for Streaming Links ---
        // This is where the actual scraping happens.
        // AnimeSuge uses an iframe, the logic needs to extract the URL from the iframe
        const iframeSrc = $('.play-video iframe').attr('src');

        if (!iframeSrc) {
            console.warn('[AnimeSuge Layer] No iframe source found for streaming links.');
            return null;
        }

        // AnimeSuge injects ads into the iframe URL, need to bypass it
        // the real source is likely in the 'src' attribute of the iframe

        console.log(`[AnimeSuge Layer] Found iframe source: ${iframeSrc}`);

        return iframeSrc; // Return the URL, caller needs to handle it further

    } catch (err) {
        console.error(`[AnimeSuge Layer] Failed to fetch streaming links for ${episodeData?.title}:`, err.message);
        return null;
    }
}

// Update module.exports to include the new function
module.exports = { fetchFromAnimeSuge, fetchEpisodesFromAnimeSuge, fetchStreamingLinksFromAnimeSuge };