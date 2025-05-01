import axios from 'axios';
import * as cheerio from 'cheerio';

// Target the new domain
const ANIWAVE_DOMAIN = 'https://aniwave.uk';

// Function to search for anime
async function fetchFromAniWave(title) {
  try {
    // Use the new domain for search
    const searchUrl = `${ANIWAVE_DOMAIN}/filter?keyword=${encodeURIComponent(title)}`; // Use filter endpoint
    console.log(`[AniWave Layer] Searching: ${searchUrl}`);
    const response = await axios.get(searchUrl);
    const $ = cheerio.load(response.data);
    // Verify this selector on aniwave.uk
    const firstResult = $('.film_list-wrap .flw-item').first();
    const animeTitle = firstResult.find('.film-name a').text();
    const animeLink = firstResult.find('.film-name a').attr('href');

    if (!animeTitle || !animeLink) throw new Error('AniWave no result');

    // Make link absolute using the new domain
    const absoluteLink = animeLink.startsWith('/') ? `${ANIWAVE_DOMAIN}${animeLink}` : animeLink;

    console.log(`[AniWave Layer] Found: ${animeTitle} at ${absoluteLink}`);
    return { title: animeTitle, link: absoluteLink };
  } catch (err) {
    console.error('[AniWave Layer] Search failed:', err.message);
    return null;
  }
}

// Function to fetch episodes from an AniWave anime page
async function fetchEpisodesFromAniWave(animeData) {
  try {
    if (!animeData || !animeData.link) {
      throw new Error('Invalid anime data provided to fetchEpisodesFromAniWave.');
    }

    const animePageUrl = animeData.link;
    console.log(`[AniWave Layer] Fetching episodes from: ${animePageUrl}`);

    // AniWave often loads episodes dynamically via AJAX.
    // First, try to get the anime ID from the page URL if possible, needed for AJAX request.
    const animeIdMatch = animePageUrl.match(/\/watch\/[a-z0-9-]+\.(\w+)/i); // Try to extract ID like '1a2b' from URL
    const animeInternalId = animeIdMatch ? animeIdMatch[1] : null;

    if (!animeInternalId) {
      console.warn(`[AniWave Layer] Could not extract internal ID from URL ${animePageUrl}. Static scraping might fail.`);
      // Attempt static scraping anyway as a fallback
    }

    // --- AJAX Attempt (Preferred for AniWave) ---
    let episodes = [];
    if (animeInternalId) {
      const ajaxEpisodesUrl = `${ANIWAVE_DOMAIN}/ajax/episode/list/${animeInternalId}`; // Common AJAX pattern
      console.log(`[AniWave Layer] Attempting AJAX fetch: ${ajaxEpisodesUrl}`);
      try {
        const ajaxResponse = await axios.get(ajaxEpisodesUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
            'Referer': animePageUrl,
            'X-Requested-With': 'XMLHttpRequest', // Often required for AJAX
          }
        });

        if (ajaxResponse.data && ajaxResponse.data.status && ajaxResponse.data.result) {
           const $ajax = cheerio.load(ajaxResponse.data.result); // Load the HTML fragment
           // Selector within the AJAX response HTML
           $ajax('.episodes li a').each((index, element) => { // Adjust selector based on AJAX response structure
                const episodeLinkElement = $ajax(element);
                const episodeLink = episodeLinkElement.attr('href');
                 // Extract number, often from data attributes like data-num
                 const episodeNumberText = episodeLinkElement.data('num') || episodeLinkElement.find('.num').text() || episodeLinkElement.text().trim();
                 const episodeNumberMatch = String(episodeNumberText).match(/(\d+(\.\d+)?)/); // Match integers or decimals
                 let episodeNumber = NaN;
                 if (episodeNumberMatch) {
                     episodeNumber = parseFloat(episodeNumberMatch[1]);
                 }
                const episodeTitle = episodeLinkElement.attr('title') || episodeLinkElement.find('.title').text() || `Episode ${episodeNumber}`;

                if (episodeLink && !isNaN(episodeNumber)) {
                    const fullEpisodeLink = episodeLink.startsWith('/') ? `${ANIWAVE_DOMAIN}${episodeLink}` : episodeLink;
                    // Generate a unique ID
                    const uniqueEpisodeId = `${animeData.title.replace(/\s+/g, '-')}-ep-${episodeNumber}`;
                    episodes.push({
                        id: uniqueEpisodeId,
                        number: episodeNumber,
                        title: episodeTitle,
                        link: fullEpisodeLink, // Link to the AniWave episode page
                    });
                }
           });
           console.log(`[AniWave Layer] Found ${episodes.length} episodes via AJAX for ${animeData.title}`);
        } else {
            console.warn(`[AniWave Layer] AJAX request successful but invalid data format received: `, ajaxResponse.data);
        }

      } catch (ajaxError) {
         console.warn(`[AniWave Layer] AJAX episode fetch failed for ${animeData.title}:`, ajaxError.message);
         // Fallback to static scraping if AJAX fails
      }
    }

    // --- Static Scraping Fallback (If AJAX failed or no ID found) ---
    if (episodes.length === 0) {
        console.log(`[AniWave Layer] Falling back to static scraping for ${animeData.title}`);
        const response = await axios.get(animePageUrl, {
             headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36' }
        });
        const $ = cheerio.load(response.data);
        // Try static selectors again (less likely to work)
        $('.episodes-list a, #episodes-list a').each((index, element) => { // Adjust selectors
            // ... (Static scraping logic similar to the AJAX one, but using the main '$') ...
             const episodeLinkElement = $(element);
             const episodeLink = episodeLinkElement.attr('href');
             const episodeNumberText = episodeLinkElement.data('number') || episodeLinkElement.text().trim();
             const episodeNumberMatch = String(episodeNumberText).match(/(\d+(\.\d+)?)/);
             let episodeNumber = NaN;
             if (episodeNumberMatch) episodeNumber = parseFloat(episodeNumberMatch[1]);
             const episodeTitle = episodeLinkElement.attr('title') || `Episode ${episodeNumber}`;

             if (episodeLink && !isNaN(episodeNumber)) {
                 const fullEpisodeLink = episodeLink.startsWith('/') ? `${ANIWAVE_DOMAIN}${episodeLink}` : episodeLink;
                 const uniqueEpisodeId = `${animeData.title.replace(/\s+/g, '-')}-ep-${episodeNumber}`;
                  // Avoid duplicates if AJAX found some but not all
                  if (!episodes.some(ep => ep.number === episodeNumber)) {
                     episodes.push({
                         id: uniqueEpisodeId,
                         number: episodeNumber,
                         title: episodeTitle,
                         link: fullEpisodeLink,
                     });
                  }
             }
        });
        if (episodes.length > 0) {
             console.log(`[AniWave Layer] Found ${episodes.length} episodes via static scraping.`);
        } else {
             console.warn(`[AniWave Layer] Static scraping also failed to find episodes for ${animeData.title}.`);
        }
    }
    // ---

    // Sort episodes by number
    episodes.sort((a, b) => a.number - b.number);

    return episodes;

  } catch (err) {
    console.error(`[AniWave Layer] Failed to fetch episodes for ${animeData?.title}:`, err.message);
    return null;
  }
}

// Function to fetch streaming links from an AniWave episode page
async function fetchStreamingLinksFromAniWave(episodeData) {
    try {
        if (!episodeData || !episodeData.link) {
            throw new Error('Invalid episode data provided to fetchStreamingLinksFromAniWave.');
        }

        const episodePageUrl = episodeData.link; // Use the link from the fetched episode object
        console.log(`[AniWave Layer] Fetching streaming links from: ${episodePageUrl}`);

        const response = await axios.get(episodePageUrl, {
             headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
                'Referer': ANIWAVE_DOMAIN // Referer might be important
            }
        });
        const $ = cheerio.load(response.data);

        // --- Scraping Logic for Streaming Links ---
        // This is highly dependent on AniWave's current player implementation.
        // Often involves finding an iframe, then potentially making another request to the iframe source,
        // and possibly decoding obfuscated source URLs within scripts.
        const iframeSrc = $('#player iframe').attr('src') || $('.watch-video iframe').attr('src'); // Example selectors

        if (!iframeSrc) {
            console.warn(`[AniWave Layer] No iframe source found for streaming links on ${episodePageUrl}. Dynamic loading likely needed.`);
            // Add logic here to look for AJAX calls or script data that loads the player if needed.
            return null;
        }

        console.log(`[AniWave Layer] Found iframe source: ${iframeSrc}`);
        // This iframe source (e.g., vidplay, mycloud) will likely need to be requested and parsed separately
        // by the API route handler (/api/stream/[...]).
        // Return the iframe source URL for further processing.
        return iframeSrc;

    } catch (err) {
        console.error(`[AniWave Layer] Failed to fetch streaming links for episode ${episodeData?.number}:`, err.message);
        return null;
    }
}

export { fetchFromAniWave, fetchEpisodesFromAniWave, fetchStreamingLinksFromAniWave };
