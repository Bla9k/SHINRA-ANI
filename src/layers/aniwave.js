const axios = require('axios');
const cheerio = require('cheerio');

// Function to search for anime
async function fetchFromAniWave(title) {
  try {
    const response = await axios.get(`https://aniwave.to/filter?keyword=${encodeURIComponent(title)}`); // Changed to use filter endpoint which might be more stable
    const $ = cheerio.load(response.data);
    const firstResult = $('.film_list-wrap .flw-item').first();
    const animeTitle = firstResult.find('.film-name a').text();
    const animeLink = firstResult.find('.film-name a').attr('href');

    if (!animeTitle || !animeLink) throw new Error('AniWave no result');

    // Ensure link is absolute
    const absoluteLink = animeLink.startsWith('http') ? animeLink : `https://aniwave.to${animeLink}`;

    return { title: animeTitle, link: absoluteLink };
  } catch (err) {
    console.error('AniWave Search failed:', err.message);
    return null;
  }
}

// New function to fetch episodes from an AniWave anime page
async function fetchEpisodesFromAniWave(animeData) {
  try {
    if (!animeData || !animeData.link) {
      throw new Error('Invalid anime data provided to fetchEpisodesFromAniWave.');
    }

    const animePageUrl = animeData.link;
    console.log(`[AniWave Layer] Fetching episodes from: ${animePageUrl}`);

    // AniWave might require specific headers or might use JavaScript to load episodes.
    // A simple axios GET might not be enough. This is a basic attempt.
    const response = await axios.get(animePageUrl, {
        headers: {
            // Add headers that might mimic a browser request if needed
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
            'Referer': 'https://aniwave.to/'
        }
    });
    const $ = cheerio.load(response.data);

    const episodes = [];

    // --- Scraping Logic for Episodes ---
    // Selector might need significant adjustment for AniWave
    // AniWave often loads episodes via AJAX, this selector might not work directly
    // Inspect the network tab in browser dev tools when loading an AniWave episode page
    $('#episodes-list a, .episodes a, .server-episode-list a').each((index, element) => { // Combine potential selectors
      const episodeLinkElement = $(element);
      const episodeLink = episodeLinkElement.attr('href');
      // Extract number, potentially from data attribute or text
      const episodeNumberText = episodeLinkElement.data('number') || episodeLinkElement.text().trim();
      const episodeNumberMatch = String(episodeNumberText).match(/(\d+(\.\d+)?)/); // Match integers or decimals
      let episodeNumber = NaN;
      if (episodeNumberMatch) {
          episodeNumber = parseFloat(episodeNumberMatch[1]);
      }

      const episodeTitle = episodeLinkElement.attr('title') || episodeLinkElement.text().trim() || `Episode ${episodeNumber}`; // Get title from attribute or text

      if (episodeLink && !isNaN(episodeNumber)) {
        const fullEpisodeLink = episodeLink.startsWith('http') ? episodeLink : `https://aniwave.to${episodeLink}`;
        episodes.push({
          number: episodeNumber,
          title: episodeTitle,
          link: fullEpisodeLink,
        });
      }
    });
    // ---

     if (episodes.length === 0) {
       // IMPORTANT: AniWave often loads episodes via a separate AJAX request.
       // You might need to find that request URL (e.g., in browser dev tools network tab)
       // and fetch it directly. The URL might look something like /ajax/episode/list/<some_id>
       console.warn(`[AniWave Layer] No episodes found using static selectors for ${animeData.title}. Site might use AJAX.`);
       // Example AJAX check (pseudo-code)
       /*
       const ajaxUrlMatch = response.data.match(/ajax\/episode\/list\/(\d+)/);
       if (ajaxUrlMatch) {
           const episodesAjaxUrl = `https://aniwave.to/ajax/episode/list/${ajaxUrlMatch[1]}`;
           console.log(`[AniWave Layer] Attempting to fetch episodes via AJAX URL: ${episodesAjaxUrl}`);
           // Fetch episodesAjaxUrl and parse the response (likely JSON or HTML fragment)
           // ... add logic here ...
       }
       */
     }

    // Sort episodes by number
    episodes.sort((a, b) => a.number - b.number);

    console.log(`[AniWave Layer] Found ${episodes.length} episodes for ${animeData.title}`);
    return episodes;

  } catch (err) {
    console.error(`[AniWave Layer] Failed to fetch episodes for ${animeData?.title}:`, err.message);
    return null;
  }
}

// New function to fetch streaming links from an AniWave episode page
async function fetchStreamingLinksFromAniWave(episodeData) {
    try {
        if (!episodeData || !episodeData.link) {
            throw new Error('Invalid episode data provided to fetchStreamingLinksFromAniWave.');
        }

        const episodePageUrl = episodeData.link;
        console.log(`[AniWave Layer] Fetching streaming links from: ${episodePageUrl}`);

        const response = await axios.get(episodePageUrl, {
             headers: {
                // Add headers that might mimic a browser request if needed
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
                'Referer': 'https://aniwave.to/'
            }
        });
        const $ = cheerio.load(response.data);

        // --- Scraping Logic for Streaming Links ---
        // AniWave is complex. It often uses a player embedded from another source.
        // Need to find the element containing the video player (often an iframe) and extract its source.
        let streamingLink = $('iframe#framevid').attr('src'); // Common iframe ID

        if (!streamingLink) {
            // Try other potential iframe selectors or video tags if needed
            streamingLink = $('.play-video iframe').attr('src');
        }

        if (!streamingLink) {
             // IMPORTANT: AniWave frequently uses external player links loaded via AJAX.
             // You often need to find the script that loads the player and potentially
             // make another request to an API or embed URL found in the script.
             console.warn(`[AniWave Layer] No streaming links found using static selectors for ${episodeData.title}. Site likely uses dynamic player loading.`);
             // Example: Look for script tags that might contain player data or AJAX calls
             // $('script').each((i, script) => { ... analyze script content ... });
             return null; // Indicate failure for this source
        }

         // If the link is relative, make it absolute (less likely for streaming links, but good practice)
        streamingLink = streamingLink.startsWith('http') ? streamingLink : `https://aniwave.to${streamingLink}`;

        console.log(`[AniWave Layer] Found potential streaming link: ${streamingLink}`);
        // Note: This found link might itself be a page that redirects or contains the real video source.
        // More complex handling might be needed.
        return streamingLink;

    } catch (err) {
        console.error(`[AniWave Layer] Failed to fetch streaming links from AniWave:`, err.message);
        return null;
    }
}

// Update module.exports to include all functions
module.exports = { fetchFromAniWave, fetchEpisodesFromAniWave, fetchStreamingLinksFromAniWave };