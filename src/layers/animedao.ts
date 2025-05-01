// src/layers/animedao.ts
import * as cheerio from 'cheerio';
import { fetchWithRetry, delay, handleCaptchaOrChallenge } from '../lib/scraperUtils'; // Use fetchWithRetry and other utils

const ANIMEDAO_DOMAIN = 'https://animedao.to';

// Function to search for anime
async function fetchFromAnimeDao(title: string) {
  const timestamp = new Date().toISOString();
  const searchUrl = `${ANIMEDAO_DOMAIN}/search/?q=${encodeURIComponent(title)}`;
  console.log(`[AnimeDao Layer] [${timestamp}] Searching: ${searchUrl}`);

  try {
    const html = await fetchWithRetry(searchUrl); // Use fetchWithRetry
    const $ = cheerio.load(html);

    // Optional: Check for CAPTCHA/Challenge
    const challengeFreeHtml = await handleCaptchaOrChallenge(html, searchUrl);
    if (!challengeFreeHtml) {
        console.warn(`[AnimeDao Layer] [${timestamp}] CAPTCHA/Challenge detected on ${searchUrl}, returning null.`);
        return null;
    }
    const $challengeFree = cheerio.load(challengeFreeHtml);


    const firstResult = $challengeFree('.anime_card').first();
    const animeTitle = firstResult.find('h5 a').text()?.trim();
    const animeLink = firstResult.find('h5 a').attr('href');

    if (!animeTitle || !animeLink) {
         console.warn(`[AnimeDao Layer] [${timestamp}] No results found for "${title}" on ${searchUrl}`);
         throw new Error('AnimeDao no result found in DOM.');
    }

    // Ensure link is absolute
    const absoluteLink = animeLink.startsWith('http') ? animeLink : `${ANIMEDAO_DOMAIN}${animeLink}`;

    console.log(`[AnimeDao Layer] [${timestamp}] Found: "${animeTitle}" at ${absoluteLink}`);
    return { title: animeTitle, link: absoluteLink };
  } catch (err: any) {
    const error = err as Error;
    const statusCode = (error as any).response?.status;
    const errorCode = (error as any).code;
    console.error(`[AnimeDao Layer] [${timestamp}] Search failed for "${title}" at ${searchUrl}. Status: ${statusCode ?? 'N/A'}, Code: ${errorCode ?? 'N/A'}, Error: ${error.message}`);
    // console.error(`[AnimeDao Layer] Error Stack: ${error.stack}`);
    return null; // Return null on failure
  }
}

// Function to fetch episodes from an AnimeDao anime page
async function fetchEpisodesFromAnimeDao(animeData: { title: string, link: string }) {
    const timestamp = new Date().toISOString();
    if (!animeData || !animeData.link || !animeData.title) {
        console.error(`[AnimeDao Layer] [${timestamp}] Invalid anime data provided to fetchEpisodes:`, animeData);
        throw new Error('Invalid anime data provided.');
    }

    const animePageUrl = animeData.link;
    console.log(`[AnimeDao Layer] [${timestamp}] Fetching episodes from: ${animePageUrl}`);

    try {
        const html = await fetchWithRetry(animePageUrl, { headers: { 'Referer': ANIMEDAO_DOMAIN }});
        const $ = cheerio.load(html);

        // Optional: Check for CAPTCHA/Challenge
        const challengeFreeHtml = await handleCaptchaOrChallenge(html, animePageUrl);
        if (!challengeFreeHtml) {
            console.warn(`[AnimeDao Layer] [${timestamp}] CAPTCHA/Challenge detected on episode page ${animePageUrl}, returning null.`);
            return null;
        }
        const $challengeFree = cheerio.load(challengeFreeHtml);


        const episodes = [];
        const seenEpisodeNumbers = new Set();

        // Try multiple selectors
        $challengeFree('.episode-list-item a, .ep-list a, #episode_related a').each((index, element) => {
            const episodeLinkElement = $(element);
            const episodeLink = episodeLinkElement.attr('href');
            const episodeTitleRaw = episodeLinkElement.text().trim();
            // Robust episode number extraction
            const episodeNumberMatch = episodeTitleRaw.match(/Episode (\d+)|EP (\d+)|(\d+)$/i); // Match number at end or with prefix
            let episodeNumber = NaN;
            if(episodeNumberMatch) {
                const numberStr = episodeNumberMatch[1] || episodeNumberMatch[2] || episodeNumberMatch[3];
                if(numberStr) episodeNumber = parseInt(numberStr, 10);
            }

             // Try extracting from URL as fallback
             if (isNaN(episodeNumber) && episodeLink) {
                const urlMatch = episodeLink.match(/-episode-(\d+)/i); // Common pattern
                if (urlMatch && urlMatch[1]) episodeNumber = parseInt(urlMatch[1], 10);
            }

            if (episodeLink && !isNaN(episodeNumber) && !seenEpisodeNumbers.has(episodeNumber)) {
                const fullEpisodeLink = episodeLink.startsWith('http') ? episodeLink : `${ANIMEDAO_DOMAIN}${episodeLink}`;
                const uniqueEpisodeId = `${animeData.title.replace(/[^a-zA-Z0-9]/g, '-')}-ep-${episodeNumber}`; // Sanitize title

                episodes.push({
                    id: uniqueEpisodeId,
                    number: episodeNumber,
                    title: episodeTitleRaw || `Episode ${episodeNumber}`, // Use raw text as title or default
                    link: fullEpisodeLink,
                });
                seenEpisodeNumbers.add(episodeNumber);
            } else if (isNaN(episodeNumber)) {
                 // console.warn(`[AnimeDao Layer] [${timestamp}] Could not parse episode number for element:`, episodeLinkElement.html());
            }
        });

        if (episodes.length === 0) {
            console.warn(`[AnimeDao Layer] [${timestamp}] No episodes found using selectors for "${animeData.title}" on ${animePageUrl}`);
            // console.log(`[AnimeDao Layer] HTML content for debugging: \n ${$challengeFree.html().substring(0, 2000)}...`);
        }

        episodes.sort((a, b) => a.number - b.number);
        console.log(`[AnimeDao Layer] [${timestamp}] Found ${episodes.length} episodes for "${animeData.title}"`);
        return episodes;

    } catch (err: any) {
        const error = err as Error;
        const statusCode = (error as any).response?.status;
        const errorCode = (error as any).code;
        console.error(`[AnimeDao Layer] [${timestamp}] Failed to fetch episodes for "${animeData?.title}" from ${animePageUrl}. Status: ${statusCode ?? 'N/A'}, Code: ${errorCode ?? 'N/A'}, Error: ${error.message}`);
        // console.error(`[AnimeDao Layer] Error Stack: ${error.stack}`);
        return null; // Return null on failure
    }
}

async function fetchStreamingLinksFromAnimeDao(episodeData: { number?: string | number, link: string}) {
    const timestamp = new Date().toISOString();
    if (!episodeData || !episodeData.link) {
        console.error(`[AnimeDao Layer] [${timestamp}] Invalid episode data provided to fetchStreamingLinks:`, episodeData);
        throw new Error('Invalid episode data provided.');
    }

    const episodePageUrl = episodeData.link;
    console.log(`[AnimeDao Layer] [${timestamp}] Fetching streaming links from: ${episodePageUrl}`);

    try {
        const html = await fetchWithRetry(episodePageUrl, { headers: { 'Referer': ANIMEDAO_DOMAIN } });
        const $ = cheerio.load(html);

        // Optional: Check for CAPTCHA/Challenge
        const challengeFreeHtml = await handleCaptchaOrChallenge(html, episodePageUrl);
        if (!challengeFreeHtml) {
            console.warn(`[AnimeDao Layer] [${timestamp}] CAPTCHA/Challenge detected on streaming page ${episodePageUrl}, returning null.`);
            return null;
        }
        const $challengeFree = cheerio.load(challengeFreeHtml);


        // Look for iframe, direct video source, or download links
        let streamingLink = $challengeFree('iframe[src]').attr('src') || // Standard iframe
                            $challengeFree('video#player source[src]').attr('src') || // Direct video source
                            $challengeFree('.anime_video_body_watch source[src]').attr('src') || // Another possible video tag
                            $challengeFree('.anime_download a[href]').attr('href'); // Download link as last resort

        if (!streamingLink) {
            console.warn(`[AnimeDao Layer] [${timestamp}] No streaming links found (iframe, video, download) on ${episodePageUrl}.`);
            // console.log(`[AnimeDao Layer] HTML content for debugging: \n ${$challengeFree.html().substring(0, 2000)}...`);
            return null;
        }

        // Ensure the link is absolute
        if (streamingLink.startsWith('//')) {
            streamingLink = 'https:' + streamingLink;
        } else if (streamingLink.startsWith('/') && !streamingLink.startsWith('//')) {
             streamingLink = `${ANIMEDAO_DOMAIN}${streamingLink}`;
        }

        console.log(`[AnimeDao Layer] [${timestamp}] Found potential streaming link/iframe: ${streamingLink}`);
        // This link might be an iframe requiring further resolution by the API route handler.
        return streamingLink;

    } catch (err: any) {
        const error = err as Error;
        const statusCode = (error as any).response?.status;
        const errorCode = (error as any).code;
        console.error(`[AnimeDao Layer] [${timestamp}] Failed to fetch streaming links for episode ${episodeData?.number ?? 'N/A'} from ${episodePageUrl}. Status: ${statusCode ?? 'N/A'}, Code: ${errorCode ?? 'N/A'}, Error: ${error.message}`);
        // console.error(`[AnimeDao Layer] Error Stack: ${error.stack}`);
        return null; // Return null on failure
    }
}

// Export both functions
export { fetchFromAnimeDao, fetchEpisodesFromAnimeDao, fetchStreamingLinksFromAnimeDao };
