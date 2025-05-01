'use server'; // Mark this module as server-only

import * as cheerio from 'cheerio';
import { fetchWithRetry, delay, handleCaptchaOrChallenge } from '../lib/scraperUtils'; // Use fetchWithRetry and other utils

const ANIMESUGE_DOMAIN = 'https://animesugetv.to';

interface AnimeSugeSearchResult {
    title: string;
    link: string;
}

interface EpisodeInfo {
    id: string; // Unique episode identifier
    number: number;
    title: string;
    link: string; // Link to the episode page on the source
}

interface EpisodeData {
    number?: string | number;
    link: string;
    id?: string; // Optional episode ID if available/needed
}

// Function to search for anime
async function fetchFromAnimeSuge(title: string): Promise<AnimeSugeSearchResult | null> {
  const timestamp = new Date().toISOString();
  const searchUrl = `${ANIMESUGE_DOMAIN}/filter?keyword=${encodeURIComponent(title)}`;
  console.log(`[AnimeSuge Layer] [${timestamp}] Searching: ${searchUrl}`);

  try {
    const html = await fetchWithRetry<string>(searchUrl); // Specify string type
    const $ = cheerio.load(html);

    // Optional: Check for CAPTCHA/Challenge before proceeding
    const challengeFreeHtml = await handleCaptchaOrChallenge(html, searchUrl);
    if (!challengeFreeHtml) {
         console.warn(`[AnimeSuge Layer] [${timestamp}] CAPTCHA/Challenge detected on ${searchUrl}, attempting fallback or returning null.`);
         // Optionally attempt puppeteer fallback here or just return null
         return null; // Indicate potential blocking
    }
    const $challengeFree = cheerio.load(challengeFreeHtml); // Use challenge-free HTML if applicable

    const firstResult = $challengeFree('.flw-item').first();
    const animeTitle = firstResult.find('.film-name a').text()?.trim();
    const animeLink = firstResult.find('.film-name a').attr('href');

    if (!animeTitle || !animeLink) {
        console.warn(`[AnimeSuge Layer] [${timestamp}] No results found for "${title}" on ${searchUrl}`);
        // Don't throw error here, return null to allow fallback
        return null;
        // throw new Error('AnimeSuge no result found in DOM.');
    }

    const absoluteLink = animeLink.startsWith('/') ? `${ANIMESUGE_DOMAIN}${animeLink}` : animeLink;
    console.log(`[AnimeSuge Layer] [${timestamp}] Found: "${animeTitle}" at ${absoluteLink}`);
    return { title: animeTitle, link: absoluteLink };

  } catch (err: unknown) { // Catch unknown type
    const error = err as Error; // Type assertion
    const statusCode = (error as any).response?.status; // Get status code if available
    const errorCode = (error as any).code; // Get network error code if available

    console.error(`[AnimeSuge Layer] [${timestamp}] Search failed for "${title}" at ${searchUrl}. Status: ${statusCode ?? 'N/A'}, Code: ${errorCode ?? 'N/A'}, Error: ${error.message}`);

    if (statusCode === 403 || statusCode === 429) {
        console.warn(`[AnimeSuge Layer] Possible blocking or rate limiting (Status: ${statusCode}).`);
        // Implement more robust handling like proxy rotation trigger or longer backoff
    }

    return null; // Return null on failure
  }
}

// Function to fetch episodes from an AnimeSuge anime page
async function fetchEpisodesFromAnimeSuge(animeData: { title: string, link: string }): Promise<EpisodeInfo[] | null> {
    const timestamp = new Date().toISOString();
    if (!animeData || !animeData.link || !animeData.title) {
        console.error(`[AnimeSuge Layer] [${timestamp}] Invalid anime data provided to fetchEpisodesFromAnimeSuge:`, animeData);
        return null; // Return null for invalid input
        // throw new Error('Invalid anime data provided.');
    }

    const animePageUrl = animeData.link; // Should be absolute URL
    console.log(`[AnimeSuge Layer] [${timestamp}] Fetching episodes from: ${animePageUrl}`);

    try {
        const html = await fetchWithRetry<string>(animePageUrl, { headers: { 'Referer': ANIMESUGE_DOMAIN } }); // Add Referer
        const $ = cheerio.load(html);

        // Optional: Check for CAPTCHA/Challenge
        const challengeFreeHtml = await handleCaptchaOrChallenge(html, animePageUrl);
         if (!challengeFreeHtml) {
             console.warn(`[AnimeSuge Layer] [${timestamp}] CAPTCHA/Challenge detected on episode page ${animePageUrl}, returning null.`);
             return null; // Indicate potential blocking
        }
        const $challengeFree = cheerio.load(challengeFreeHtml); // Use challenge-free HTML if applicable


        const episodes: EpisodeInfo[] = [];
        const seenEpisodeNumbers = new Set<number>();

        // Try multiple selectors for robustness
        $challengeFree('.episodes-list .nav-link, .ss-list a').each((index, element) => {
            const episodeLinkElement = $(element);
            const episodeLink = episodeLinkElement.attr('href');

            // Extract number robustly
            const epNumFromData = episodeLinkElement.data('number') || episodeLinkElement.data('episode-num');
            const epTitleAttr = episodeLinkElement.attr('title');
            const epNumFromTitle = epTitleAttr?.match(/Episode\s*(\d+)/i)?.[1];
            const epTextNum = episodeLinkElement.find('.ep-num').text()?.trim().match(/^(\d+)/)?.[0]; // More specific selector

            let episodeNumberStr = epNumFromData || epNumFromTitle || epTextNum;
            let episodeNumber = NaN;
            if (episodeNumberStr) {
                episodeNumber = parseInt(String(episodeNumberStr), 10);
            }

            // Sometimes number is in the URL path
            if (isNaN(episodeNumber) && episodeLink) {
                const urlMatch = episodeLink.match(/-ep-(\d+)/i);
                if (urlMatch && urlMatch[1]) {
                    episodeNumber = parseInt(urlMatch[1], 10);
                }
            }

            // Use title attribute, fallback to text or default
            const episodeTitle = epTitleAttr?.trim() || episodeLinkElement.find('.ep-title').text()?.trim() || `Episode ${episodeNumber}`;

            if (episodeLink && !isNaN(episodeNumber) && !seenEpisodeNumbers.has(episodeNumber)) {
                const fullEpisodeLink = episodeLink.startsWith('/') ? `${ANIMESUGE_DOMAIN}${episodeLink}` : episodeLink;
                const uniqueEpisodeId = `${animeData.title.replace(/[^a-zA-Z0-9]/g, '-')}-ep-${episodeNumber}`; // Sanitize title for ID

                episodes.push({
                    id: uniqueEpisodeId,
                    number: episodeNumber,
                    title: episodeTitle,
                    link: fullEpisodeLink, // Link to the AnimeSuge episode page
                });
                seenEpisodeNumbers.add(episodeNumber);
            } else if (isNaN(episodeNumber)) {
                 // console.warn(`[AnimeSuge Layer] [${timestamp}] Could not parse episode number for element:`, episodeLinkElement.html());
            }
        });

        if (episodes.length === 0) {
            console.warn(`[AnimeSuge Layer] [${timestamp}] No episodes found using selectors for "${animeData.title}" on ${animePageUrl}`);
            // Optional: Log the HTML content for debugging selectors
            // console.log(`[AnimeSuge Layer] HTML content for debugging: \n ${$challengeFree.html().substring(0, 2000)}...`);
        }

        episodes.sort((a, b) => a.number - b.number);
        console.log(`[AnimeSuge Layer] [${timestamp}] Found ${episodes.length} episodes for "${animeData.title}"`);
        return episodes;

    } catch (err: unknown) { // Catch unknown type
        const error = err as Error; // Type assertion
        const statusCode = (error as any).response?.status;
        const errorCode = (error as any).code;
        console.error(`[AnimeSuge Layer] [${timestamp}] Failed to fetch episodes for "${animeData?.title}" from ${animePageUrl}. Status: ${statusCode ?? 'N/A'}, Code: ${errorCode ?? 'N/A'}, Error: ${error.message}`);
        // console.error(`[AnimeSuge Layer] Error Stack: ${error.stack}`);
        return null; // Return null on failure
    }
}

// Function to fetch streaming links from an AnimeSuge episode page
async function fetchStreamingLinksFromAnimeSuge(episodeData: EpisodeData): Promise<string | null> {
    const timestamp = new Date().toISOString();
    if (!episodeData || !episodeData.link) {
        console.error(`[AnimeSuge Layer] [${timestamp}] Invalid episode data provided to fetchStreamingLinks:`, episodeData);
        return null; // Return null for invalid input
        // throw new Error('Invalid episode data provided.');
    }

    const episodePageUrl = episodeData.link; // Use the link from the fetched episode object
    console.log(`[AnimeSuge Layer] [${timestamp}] Fetching streaming links from: ${episodePageUrl}`);

    try {
        const html = await fetchWithRetry<string>(episodePageUrl, { headers: { 'Referer': ANIMESUGE_DOMAIN } });
        const $ = cheerio.load(html);

        // Optional: Check for CAPTCHA/Challenge
        const challengeFreeHtml = await handleCaptchaOrChallenge(html, episodePageUrl);
        if (!challengeFreeHtml) {
             console.warn(`[AnimeSuge Layer] [${timestamp}] CAPTCHA/Challenge detected on streaming page ${episodePageUrl}, returning null.`);
             return null; // Indicate potential blocking
        }
        const $challengeFree = cheerio.load(challengeFreeHtml);


        // Prioritize iframe source, often points to the actual player/sources
        let iframeSrc = $challengeFree('.play-video iframe').attr('src') || $challengeFree('#player iframe').attr('src') || $challengeFree('#frame').attr('src');

        if (!iframeSrc) {
             // Fallback: Look for video source directly within <video> tag or script data
             const videoSrc = $challengeFree('video#player source[src]').attr('src') || $challengeFree('video source[src]').attr('src');
             if(videoSrc) {
                 console.log(`[AnimeSuge Layer] [${timestamp}] Found direct video source: ${videoSrc}`);
                 return videoSrc; // Return direct source if found
             }

            // Fallback: Look for potential stream data embedded in script tags
            let streamDataUrl: string | null = null;
            $challengeFree('script').each((i, el) => {
                const scriptContent = $(el).html();
                if (scriptContent && scriptContent.includes('sources:')) {
                    // Basic regex to extract a URL from a 'sources' array (VERY fragile)
                    const match = scriptContent.match(/sources:\s*\[[^\]]*\{[^}]*file:\s*["']([^"']+)["']/);
                    if (match && match[1]) {
                        streamDataUrl = match[1];
                        console.log(`[AnimeSuge Layer] [${timestamp}] Found potential stream URL in script: ${streamDataUrl}`);
                        return false; // Stop searching
                    }
                }
                 // Check for playlist pattern too
                if (scriptContent && scriptContent.includes('playlist:')) {
                     const playlistMatch = scriptContent.match(/file:\s*["']([^"']+\.m3u8[^"']*)["']/);
                     if (playlistMatch && playlistMatch[1]) {
                         streamDataUrl = playlistMatch[1];
                         console.log(`[AnimeSuge Layer] [${timestamp}] Found potential playlist URL in script: ${streamDataUrl}`);
                         return false; // Stop searching
                     }
                }
            });
            if (streamDataUrl) return streamDataUrl;

            console.warn(`[AnimeSuge Layer] [${timestamp}] No iframe, video source, or script stream data found on ${episodePageUrl}`);
            // console.log(`[AnimeSuge Layer] HTML content for debugging: \n ${$challengeFree.html().substring(0, 2000)}...`);
            return null;
        }

        // Ensure iframe source is absolute
        if (iframeSrc.startsWith('//')) {
            iframeSrc = 'https:' + iframeSrc;
        } else if (iframeSrc.startsWith('/')) {
            iframeSrc = `${ANIMESUGE_DOMAIN}${iframeSrc}`;
        }

        console.log(`[AnimeSuge Layer] [${timestamp}] Found potential streaming link/iframe: ${iframeSrc}`);
        // This iframe source might need further processing (e.g., if it points to vidstream/mycloud)
        // The API route handler should attempt to resolve this further.
        return iframeSrc;

    } catch (err: unknown) { // Catch unknown type
        const error = err as Error; // Type assertion
        const statusCode = (error as any).response?.status;
        const errorCode = (error as any).code;
        console.error(`[AnimeSuge Layer] [${timestamp}] Failed to fetch streaming links for episode ${episodeData?.number ?? 'N/A'} from ${episodePageUrl}. Status: ${statusCode ?? 'N/A'}, Code: ${errorCode ?? 'N/A'}, Error: ${error.message}`);
        // console.error(`[AnimeSuge Layer] Error Stack: ${error.stack}`);
        return null; // Return null on failure
    }
}

export { fetchFromAnimeSuge, fetchEpisodesFromAnimeSuge, fetchStreamingLinksFromAnimeSuge };
