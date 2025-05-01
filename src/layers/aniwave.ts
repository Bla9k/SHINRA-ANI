// src/layers/aniwave.ts
import * as cheerio from 'cheerio';
import { fetchWithRetry, delay, handleCaptchaOrChallenge } from '../lib/scraperUtils'; // Use fetchWithRetry and other utils
import axios from 'axios'; // Keep axios for potential AJAX calls

const ANIWAVE_DOMAIN = 'https://aniwave.to'; // Target new domain .to

// Function to search for anime
async function fetchFromAniWave(title: string) {
  const timestamp = new Date().toISOString();
  // Use the filter endpoint which seems more reliable for searching
  const searchUrl = `${ANIWAVE_DOMAIN}/filter?keyword=${encodeURIComponent(title)}`;
  console.log(`[AniWave Layer] [${timestamp}] Searching: ${searchUrl}`);

  try {
    // Use fetchWithRetry which includes User-Agent rotation and proxy
    const html = await fetchWithRetry(searchUrl);
    const $ = cheerio.load(html);

    // Optional: Check for CAPTCHA/Challenge before proceeding
    const challengeFreeHtml = await handleCaptchaOrChallenge(html, searchUrl);
    if (!challengeFreeHtml) {
        console.warn(`[AniWave Layer] [${timestamp}] CAPTCHA/Challenge detected on ${searchUrl}, returning null.`);
        return null;
    }
    const $challengeFree = cheerio.load(challengeFreeHtml);


    // Updated selector based on common AniWave structure
    const firstResult = $challengeFree('.film_list-wrap .flw-item').first();
    const animeTitle = firstResult.find('.film-name a').text()?.trim();
    const animeLink = firstResult.find('.film-name a').attr('href');

    if (!animeTitle || !animeLink) {
         console.warn(`[AniWave Layer] [${timestamp}] No results found for "${title}" on ${searchUrl}`);
        throw new Error('AniWave no result found in DOM.');
    }

    // Ensure link is absolute
    const absoluteLink = animeLink.startsWith('/') ? `${ANIWAVE_DOMAIN}${animeLink}` : animeLink;

    console.log(`[AniWave Layer] [${timestamp}] Found: "${animeTitle}" at ${absoluteLink}`);
    return { title: animeTitle, link: absoluteLink };
  } catch (err: any) {
    const error = err as Error;
    const statusCode = (error as any).response?.status;
    const errorCode = (error as any).code;
    console.error(`[AniWave Layer] [${timestamp}] Search failed for "${title}" at ${searchUrl}. Status: ${statusCode ?? 'N/A'}, Code: ${errorCode ?? 'N/A'}, Error: ${error.message}`);
    // console.error(`[AniWave Layer] Error Stack: ${error.stack}`);
    return null; // Return null on failure
  }
}

// Function to fetch episodes from an AniWave anime page
async function fetchEpisodesFromAniWave(animeData: { title: string, link: string }) {
    const timestamp = new Date().toISOString();
    if (!animeData || !animeData.link || !animeData.title) {
      console.error(`[AniWave Layer] [${timestamp}] Invalid anime data provided to fetchEpisodesFromAniWave:`, animeData);
      throw new Error('Invalid anime data provided.');
    }

    const animePageUrl = animeData.link;
    console.log(`[AniWave Layer] [${timestamp}] Fetching episodes from: ${animePageUrl}`);

    // --- Attempt 1: AJAX Request ---
    let episodes = [];
    const animeIdMatch = animePageUrl.match(/\/watch\/[a-z0-9-]+\.(\w+)/i);
    const animeInternalId = animeIdMatch ? animeIdMatch[1] : null;

    if (animeInternalId) {
        const ajaxEpisodesUrl = `${ANIWAVE_DOMAIN}/ajax/episode/list/${animeInternalId}`;
        console.log(`[AniWave Layer] [${timestamp}] Attempting AJAX fetch: ${ajaxEpisodesUrl}`);
        try {
            // Use fetchWithRetry for the AJAX call as well
            const ajaxResponse = await fetchWithRetry(ajaxEpisodesUrl, {
                headers: {
                    'Referer': animePageUrl,
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json, text/javascript, */*; q=0.01', // Common AJAX accept header
                }
            });

             // Check response structure carefully
             if (ajaxResponse && typeof ajaxResponse === 'object' && (ajaxResponse as any).status && (ajaxResponse as any).result) {
                const htmlFragment = (ajaxResponse as any).result;
                const $ajax = cheerio.load(htmlFragment);
                const seenEpisodeNumbers = new Set();

                $ajax('.episodes li a, ul.episodes a').each((index, element) => { // Adjust selector based on AJAX response structure
                    const episodeLinkElement = $ajax(element);
                    const episodeLink = episodeLinkElement.attr('href');
                    const epNumFromData = episodeLinkElement.data('num');
                    const epTitleAttr = episodeLinkElement.attr('title');
                    const epNumFromTitle = epTitleAttr?.match(/Episode\s*(\d+)/i)?.[1];
                    const epTextNum = episodeLinkElement.find('.num').text()?.trim() || episodeLinkElement.text().trim().match(/^(\d+)/)?.[0];

                    let episodeNumberStr = epNumFromData || epNumFromTitle || epTextNum;
                    let episodeNumber = NaN;
                    if (episodeNumberStr) episodeNumber = parseInt(String(episodeNumberStr), 10);

                     // Try extracting from URL as fallback
                    if (isNaN(episodeNumber) && episodeLink) {
                        const urlMatch = episodeLink.match(/\/ep-(\d+)/i);
                        if (urlMatch && urlMatch[1]) episodeNumber = parseInt(urlMatch[1], 10);
                    }

                    const episodeTitle = epTitleAttr || episodeLinkElement.find('.title').text()?.trim() || `Episode ${episodeNumber}`;

                    if (episodeLink && !isNaN(episodeNumber) && !seenEpisodeNumbers.has(episodeNumber)) {
                        const fullEpisodeLink = episodeLink.startsWith('/') ? `${ANIWAVE_DOMAIN}${episodeLink}` : episodeLink;
                        const uniqueEpisodeId = `${animeData.title.replace(/[^a-zA-Z0-9]/g, '-')}-ep-${episodeNumber}`;

                        episodes.push({
                            id: uniqueEpisodeId,
                            number: episodeNumber,
                            title: episodeTitle,
                            link: fullEpisodeLink,
                        });
                        seenEpisodeNumbers.add(episodeNumber);
                    }
                });
                console.log(`[AniWave Layer] [${timestamp}] Found ${episodes.length} episodes via AJAX for "${animeData.title}".`);
            } else {
                console.warn(`[AniWave Layer] [${timestamp}] AJAX response format invalid or status false for ${ajaxEpisodesUrl}. Response:`, ajaxResponse);
            }
        } catch (ajaxError: any) {
             const error = ajaxError as Error;
             console.warn(`[AniWave Layer] [${timestamp}] AJAX episode fetch failed for "${animeData.title}". Error: ${error.message}. Proceeding to static scrape.`);
             // Fallthrough to static scraping
        }
    } else {
         console.warn(`[AniWave Layer] [${timestamp}] Could not extract internal ID from URL: ${animePageUrl}. Proceeding to static scrape.`);
    }


    // --- Attempt 2: Static Scraping Fallback ---
    if (episodes.length === 0) {
        console.log(`[AniWave Layer] [${timestamp}] Falling back to static scraping for "${animeData.title}" from ${animePageUrl}`);
        try {
            const html = await fetchWithRetry(animePageUrl, { headers: { 'Referer': ANIWAVE_DOMAIN }});
            const $ = cheerio.load(html);

            // Optional: Check for CAPTCHA/Challenge
             const challengeFreeHtml = await handleCaptchaOrChallenge(html, animePageUrl);
             if (!challengeFreeHtml) {
                 console.warn(`[AniWave Layer] [${timestamp}] CAPTCHA/Challenge detected on static scrape of ${animePageUrl}, returning empty.`);
                 return []; // Return empty if blocked
             }
             const $challengeFree = cheerio.load(challengeFreeHtml);

            const seenEpisodeNumbers = new Set(); // Use separate set for static scrape

            // Add more potential selectors based on observation
            $challengeFree('.episodes-list a, #episodes-list a, div.server[data-server-id="1"] ul.episodes a').each((index, element) => {
                 const episodeLinkElement = $(element);
                 const episodeLink = episodeLinkElement.attr('href');
                 const epNumFromData = episodeLinkElement.data('num');
                 const epTitleAttr = episodeLinkElement.attr('title');
                 const epNumFromTitle = epTitleAttr?.match(/Episode\s*(\d+)/i)?.[1];
                 const epTextNum = episodeLinkElement.find('.num').text()?.trim() || episodeLinkElement.text().trim().match(/^(\d+)/)?.[0];

                 let episodeNumberStr = epNumFromData || epNumFromTitle || epTextNum;
                 let episodeNumber = NaN;
                 if (episodeNumberStr) episodeNumber = parseInt(String(episodeNumberStr), 10);

                  // Try extracting from URL as fallback
                 if (isNaN(episodeNumber) && episodeLink) {
                     const urlMatch = episodeLink.match(/\/ep-(\d+)/i);
                     if (urlMatch && urlMatch[1]) episodeNumber = parseInt(urlMatch[1], 10);
                 }

                 const episodeTitle = epTitleAttr || episodeLinkElement.find('.title').text()?.trim() || `Episode ${episodeNumber}`;

                 if (episodeLink && !isNaN(episodeNumber) && !seenEpisodeNumbers.has(episodeNumber)) {
                     const fullEpisodeLink = episodeLink.startsWith('/') ? `${ANIWAVE_DOMAIN}${episodeLink}` : episodeLink;
                     const uniqueEpisodeId = `${animeData.title.replace(/[^a-zA-Z0-9]/g, '-')}-ep-${episodeNumber}`;

                     episodes.push({
                         id: uniqueEpisodeId,
                         number: episodeNumber,
                         title: episodeTitle,
                         link: fullEpisodeLink,
                     });
                     seenEpisodeNumbers.add(episodeNumber);
                 }
            });

            if (episodes.length === 0) {
                 console.warn(`[AniWave Layer] [${timestamp}] Static scraping also failed to find episodes for "${animeData.title}" on ${animePageUrl}`);
                 // console.log(`[AniWave Layer] HTML content for debugging: \n ${$challengeFree.html().substring(0, 2000)}...`);
            } else {
                 console.log(`[AniWave Layer] [${timestamp}] Found ${episodes.length} episodes via static scraping for "${animeData.title}".`);
            }
        } catch (scrapeError: any) {
            const error = scrapeError as Error;
            const statusCode = (error as any).response?.status;
            const errorCode = (error as any).code;
            console.error(`[AniWave Layer] [${timestamp}] Static scraping failed for "${animeData.title}" from ${animePageUrl}. Status: ${statusCode ?? 'N/A'}, Code: ${errorCode ?? 'N/A'}, Error: ${error.message}`);
             // Return empty array if static scraping fails after AJAX attempt
             return [];
        }
    }

    episodes.sort((a, b) => a.number - b.number);
    return episodes;
}

// Function to fetch streaming links from an AniWave episode page
async function fetchStreamingLinksFromAniWave(episodeData: { number?: string | number, link: string}) {
    const timestamp = new Date().toISOString();
    if (!episodeData || !episodeData.link) {
         console.error(`[AniWave Layer] [${timestamp}] Invalid episode data provided to fetchStreamingLinks:`, episodeData);
        throw new Error('Invalid episode data provided.');
    }

    const episodePageUrl = episodeData.link;
    console.log(`[AniWave Layer] [${timestamp}] Fetching streaming links from: ${episodePageUrl}`);

    try {
        // Use fetchWithRetry for the episode page itself
        const html = await fetchWithRetry(episodePageUrl, {
             headers: {
                'Referer': ANIWAVE_DOMAIN // Referer is often crucial
            }
        });
        const $ = cheerio.load(html);

         // Optional: Check for CAPTCHA/Challenge
         const challengeFreeHtml = await handleCaptchaOrChallenge(html, episodePageUrl);
         if (!challengeFreeHtml) {
             console.warn(`[AniWave Layer] [${timestamp}] CAPTCHA/Challenge detected on streaming page ${episodePageUrl}, returning null.`);
             return null;
         }
         const $challengeFree = cheerio.load(challengeFreeHtml);


        // --- Scraping Logic for Streaming Links ---
        // This is complex and might involve multiple steps:
        // 1. Find the active video server (e.g., Vidplay, MyCloud, Filemoon).
        // 2. Get the source URL (often an iframe src) for that server.
        // 3. Potentially fetch the iframe source URL.
        // 4. Extract the actual stream data (e.g., M3U8 link) from the iframe content or associated scripts/API calls.

        // Example: Find iframe source (adapt selectors)
        const iframeSrc = $challengeFree('#player iframe').attr('src') || $challengeFree('.watch-video iframe').attr('src') || $challengeFree('#iframe-embed').attr('src');

        if (!iframeSrc) {
            console.warn(`[AniWave Layer] [${timestamp}] No iframe source found directly on ${episodePageUrl}. Player might load dynamically.`);
            // Add more sophisticated logic here if needed (e.g., checking script tags for player data)
            // console.log(`[AniWave Layer] HTML content for debugging: \n ${$challengeFree.html().substring(0, 2000)}...`);
            return null;
        }

        // Ensure iframe source is absolute
        let absoluteIframeSrc = iframeSrc;
        if (iframeSrc.startsWith('//')) {
            absoluteIframeSrc = 'https:' + iframeSrc;
        } else if (iframeSrc.startsWith('/')) {
            absoluteIframeSrc = `${ANIWAVE_DOMAIN}${iframeSrc}`;
        }

        console.log(`[AniWave Layer] [${timestamp}] Found potential streaming iframe: ${absoluteIframeSrc}`);
        // This iframe source likely needs further resolution by the API route handler.
        // Return the iframe URL for the next step.
        return absoluteIframeSrc;

    } catch (err: any) {
         const error = err as Error;
         const statusCode = (error as any).response?.status;
         const errorCode = (error as any).code;
         console.error(`[AniWave Layer] [${timestamp}] Failed to fetch streaming links for episode ${episodeData?.number ?? 'N/A'} from ${episodePageUrl}. Status: ${statusCode ?? 'N/A'}, Code: ${errorCode ?? 'N/A'}, Error: ${error.message}`);
         // console.error(`[AniWave Layer] Error Stack: ${error.stack}`);
        return null; // Return null on failure
    }
}

export { fetchFromAniWave, fetchEpisodesFromAniWave, fetchStreamingLinksFromAniWave };

