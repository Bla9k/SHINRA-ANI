const axios = require('axios');
const cheerio = require('cheerio');

// Function to search for anime
async function fetchFromAnimeDao(title) {
  try {
    const response = await axios.get(`https://animedao.to/search/?q=${encodeURIComponent(title)}`);
    const $ = cheerio.load(response.data);
    const firstResult = $('.anime_card').first();
    const animeTitle = firstResult.find('h5 a').text();
    const animeLink = firstResult.find('h5 a').attr('href');

    if (!animeTitle || !animeLink) throw new Error('AnimeDao no result');

    // Ensure link is absolute
    const absoluteLink = animeLink.startsWith('http') ? animeLink : `https://animedao.to${animeLink}`;

    return { title: animeTitle, link: absoluteLink };
  } catch (err) {
    console.error('AnimeDao Search failed:', err.message);
    return null;
  }
}

// New function to fetch episodes from an AnimeDao anime page
async function fetchEpisodesFromAnimeDao(animeData) {
  try {
    if (!animeData || !animeData.link) {
      throw new Error('Invalid anime data provided to fetchEpisodesFromAnimeDao.');
    }

    const animePageUrl = animeData.link;
    console.log(`[AnimeDao Layer] Fetching episodes from: ${animePageUrl}`);

    const response = await axios.get(animePageUrl);
    const $ = cheerio.load(response.data);

    const episodes = [];

    // --- Scraping Logic for Episodes ---
    // Selector might need adjustment for AnimeDao
    // Example: find a list container and iterate through its items
    $('.episode-list-item a, .ep-list a').each((index, element) => { // Combine potential selectors
      const episodeLinkElement = $(element);
      const episodeLink = episodeLinkElement.attr('href');
      const episodeTitleRaw = episodeLinkElement.text().trim();
      const episodeNumberMatch = episodeTitleRaw.match(/Episode (\d+)|EP (\d+)|(\d+)/i);
      let episodeNumber = NaN;
      if(episodeNumberMatch) {
          // Find the first non-null captured group
          const numberStr = episodeNumberMatch[1] || episodeNumberMatch[2] || episodeNumberMatch[3];
          if(numberStr) {
              episodeNumber = parseInt(numberStr, 10);
          }
      }

      if (episodeLink && !isNaN(episodeNumber)) {
        const fullEpisodeLink = episodeLink.startsWith('http') ? episodeLink : `https://animedao.to${episodeLink}`;
        episodes.push({
          number: episodeNumber,
          title: episodeTitleRaw || `Episode ${episodeNumber}`, // Use raw text as title or default
          link: fullEpisodeLink,
        });
      }
    });
    // ---

    if (episodes.length === 0) {
      console.warn(`[AnimeDao Layer] No episodes found using selectors for ${animeData.title}`);
    }

    // Sort episodes by number
    episodes.sort((a, b) => a.number - b.number);

    console.log(`[AnimeDao Layer] Found ${episodes.length} episodes for ${animeData.title}`);
    return episodes;

  } catch (err) {
    console.error(`[AnimeDao Layer] Failed to fetch episodes for ${animeData?.title}:`, err.message);
    return null;
  }
}

async function fetchStreamingLinksFromAnimeDao(episodeData) {
  try {
    if (!episodeData || !episodeData.link) {
      throw new Error('Invalid episode data provided to fetchStreamingLinksFromAnimeDao.');
    }

    const episodePageUrl = episodeData.link;
    console.log(`[AnimeDao Layer] Fetching streaming links from: ${episodePageUrl}`);

    const response = await axios.get(episodePageUrl);
    const $ = cheerio.load(response.data);

    // AnimeDao often has the video directly embedded or uses an iframe.
    let streamingLink = $('iframe').attr('src');

    if (!streamingLink) {
      // If no iframe, try to find a direct link
      streamingLink = $('.anime_download a').attr('href');
    }

    if (!streamingLink) {
      console.warn('[AnimeDao Layer] No streaming links found (iframe or direct link).');
      return null;
    }

    // If the link is relative, make it absolute
    streamingLink = streamingLink.startsWith('http') ? streamingLink : `https://animedao.to${streamingLink}`;

    console.log(`[AnimeDao Layer] Found streaming link: ${streamingLink}`);
    return streamingLink;

  } catch (err) {
    console.error(`[AnimeDao Layer] Failed to fetch streaming links from AnimeDao:`, err.message);
    return null;
  }
}

// Export both functions
module.exports = { fetchFromAnimeDao, fetchEpisodesFromAnimeDao, fetchStreamingLinksFromAnimeDao };