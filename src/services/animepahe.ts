
import { cache } from 'react';
import { config } from '@/config';
// Removed top-level import of JSDOM: import { JSDOM } from 'jsdom';
// We will import it dynamically inside server-only functions (API routes).

// --- Interfaces ---
export interface AnimePaheEpisode {
  id: string; // Episode session ID
  episode: number;
  title?: string | null;
  snapshot?: string | null; // Thumbnail URL
  duration?: string | null;
  created_at?: string | null;
  anime_id?: number; // Internal AnimePahe anime ID
}

export interface AnimePaheCDNLink {
  file: string; //Stream URL
  label: string; //Quality name
  audio: string;
  resolution: string;
  size: string;
  url: string;
}
interface AnimePaheResult {
  data: AnimePaheEpisode[],
  last_page: number
}

export interface AnimePaheSearchResult {
    id: number; // AnimePahe's internal anime ID
    title: string;
    poster: string; // URL to poster image
    type: string; // e.g., TV
    episodes: number;
    status: string; // e.g., Finished Airing
    season: string; // e.g., Spring
    year: number;
    score: number;
    session: string; // This is likely the AnimePahe ID we need for episode fetching
}

interface AnimePaheSearchResponse {
    data: AnimePaheSearchResult[]
}

// --- Helper Functions (Must only be run server-side where JSDOM is available) ---

// Extracts session value from HTML string (Used server-side)
async function extractSession(html: string): Promise<string | null> {
    // Import JSDOM dynamically for server-side use
    const { JSDOM } = await import('jsdom');
    const dom = new JSDOM(html);
    const scriptTags = dom.window.document.querySelectorAll('script');
    let session = null;
    scriptTags.forEach(script => {
        const match = script.textContent?.match(/session = "([^"]+)"/);
        if (match) {
            session = match[1];
        }
    });
    return session;
}


// --- Service Functions ---

/**
 * Fetches anime episodes from AnimePahe's API.
 * Note: This API endpoint uses the internal AnimePahe anime ID (session ID).
 * @param animePaheId: string - The internal AnimePahe ID for the anime.
 * @param page: number - The page number to fetch.
 * @returns Promise<AnimePaheEpisode[]>
 */
export const getAnimeEpisodesPahe = cache(
  async (animePaheId: string, page: number = 1): Promise<AnimePaheEpisode[]> => {
    const BASE_URL = 'https://animepahe.org/api'; // Changed back to .org for API
    const L = 30; // Episodes per page
    const SORT = 'episode_asc';
    const targetUrl = `${BASE_URL}?m=release&id=${animePaheId}&l=${L}&sort=${SORT}&page=${page}`;
    console.log(`[getAnimeEpisodesPahe] Fetching ${targetUrl}`);
    let response: Response | undefined;
    try {
      response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
          'Accept': 'application/json',
        },
         cache: 'no-store',
      });

      if (!response.ok) {
        const errorBody = await res.text();
        console.error(
          `[getAnimeEpisodesPahe] API responded with status ${response.status}: ${errorBody}`
        );
        if (response.status === 404) {
          console.warn(
            `[getAnimeEpisodesPahe] No episodes found (404) for AnimePahe ID ${animePaheId}`
          );
           // Throw a more specific error message
           throw new Error(`No episodes found for this anime on AnimePahe (ID: ${animePaheId}). It might not be available or the ID is incorrect.`);
        }
         throw new Error(
           `AnimePahe Episode API request failed: ${response.status} ${response.statusText}`
         );
      }
      const data: AnimePaheResult = await response.json();

      // Map response data
       const mappedEpisodes: AnimePaheEpisode[] = (data.data || []).map(ep => ({
         id: ep.id, // Episode Session ID
         episode: ep.episode,
         title: ep.title || `Episode ${ep.episode}`, // Use title if available
         snapshot: ep.snapshot, // Thumbnail
         duration: ep.duration,
         created_at: ep.created_at,
         anime_id: parseInt(animePaheId, 10) // Add anime_id back for reference
       })).filter(ep => ep.id != null && ep.episode != null); // Basic validation

      console.log(`[getAnimeEpisodesPahe] Fetched ${mappedEpisodes.length} episodes for AnimePahe ID ${animePaheId}`);
      return mappedEpisodes;

    } catch (error: any) {
       console.error(`[getAnimeEpisodesPahe] Failed to fetch episodes for AnimePahe ID ${animePaheId}. URL: ${targetUrl}`);
       if(response) {
            console.error('[getAnimeEpisodesPahe] Response Status:', response.status, response.statusText);
       }
       console.error('[getAnimeEpisodesPahe] Fetch Error Details:', error.message);
       // Re-throw or return empty based on desired error handling in the calling context (API route)
       throw new Error(`Failed to fetch episodes from AnimePahe: ${error.message}`);
    }
  }
);

/**
 * Fetches streaming links for a specific AnimePahe episode session ID.
 * This function needs JSDOM and MUST run in a Node.js server environment (API route).
 * @param animePaheId: string - The ID of the anime on AnimePahe.
 * @param episodeSessionId: string - The session ID of the specific episode.
 * @returns Promise<AnimePaheCDNLink[]>
 */
export const getAnimeStreamingLinkPahe = cache(async (animePaheId: string, episodeSessionId: string): Promise<AnimePaheCDNLink[]> => {
  const { JSDOM } = await import('jsdom'); // Import JSDOM here for server-side use
  const BASE_URL = 'https://animepahe.com/play/'; // Use .com for player pages
  const targetURL = `${BASE_URL}${animePaheId}/${episodeSessionId}`;
  let response: Response | undefined;

  console.log(`[getAnimeStreamingLinkPahe] Fetching player page: ${targetURL}`);
  try {
    response = await fetch(targetURL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
        'Referer': 'https://animepahe.org/'
      },
       cache: 'no-store',
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[getAnimeStreamingLinkPahe] Failed player page fetch ${targetURL}. Status: ${response.status}: ${errorBody}`);
      throw new Error(`Failed to fetch AnimePahe player page: ${response.status}`);
    }
    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const streamButtons = document.querySelectorAll('#resolutionMenu button[data-src]');
     const cdnLinks: AnimePaheCDNLink[] = [];

     streamButtons.forEach(button => {
        const label = button.textContent?.trim() || 'unknown';
        const url = button.getAttribute('data-src');
        const audio = button.getAttribute('data-audio') || 'jpn';
        const resolution = label.replace('p', '');
        const size = button.getAttribute('data-size') || 'N/A';

        if (url) {
             cdnLinks.push({ file: url, label, audio, resolution, size, url });
         }
     });

     // --- Attempt to extract from script as fallback ---
     if (cdnLinks.length === 0) {
         console.log("[getAnimeStreamingLinkPahe] No buttons found, trying script extraction...");
         const scripts = document.querySelectorAll('script');
         let linksData: any[] | null = null;
         scripts.forEach(script => {
             if (linksData) return; // Stop if already found
             const scriptContent = script.textContent || '';
             // Try different patterns to find the links array
             const match = scriptContent.match(/(?:const|var|let)\s+links\s*=\s*(\[.*?\]);/s) || // Basic array assignment
                           scriptContent.match(/setupPlayer\(\s*(\{[\s\S]*?\})\s*\);/); // Data inside a function call

             if (match && match[1]) {
                  let potentialJson = match[1];
                   // If matched inside setupPlayer, try to extract the 'links' key
                   if (scriptContent.includes('setupPlayer')) {
                       try {
                          // This requires careful parsing, might be brittle
                          const setupDataMatch = potentialJson.match(/'links':\s*(\[.*?\])/s);
                          if (setupDataMatch && setupDataMatch[1]) {
                             potentialJson = setupDataMatch[1];
                          } else {
                              potentialJson = '[]'; // Avoid crashing if links key not found
                          }
                       } catch (e) {
                          console.warn("[getAnimeStreamingLinkPahe] Error isolating links array from setupPlayer:", e);
                          potentialJson = '[]';
                       }
                   }

                  try {
                     // Attempt to parse the extracted string as JSON
                     // Need to be careful, it might not be perfect JSON
                     // Replace single quotes if necessary, handle trailing commas etc.
                      const correctedJsonString = potentialJson
                          .replace(/'/g, '"') // Replace single quotes
                          .replace(/,\s*\]/g, ']') // Remove trailing commas before closing bracket
                          .replace(/,\s*\}/g, '}'); // Remove trailing commas before closing brace

                     linksData = JSON.parse(correctedJsonString);
                     console.log("[getAnimeStreamingLinkPahe] Successfully parsed links data from script.");
                  } catch (e) {
                     console.error("[getAnimeStreamingLinkPahe] Failed to parse links data from script:", e);
                     console.warn("[getAnimeStreamingLinkPahe] Raw matched data:", potentialJson);
                  }
             }
         });

        if (Array.isArray(linksData)) {
            linksData.forEach((link: any) => {
                 // Map fields based on observed structure (adjust as needed)
                 // Common structures: {src: '...', resolution: '1080', ...} or {file: '...', label: '1080p', ...}
                 const sourceUrl = link.src || link.file;
                 const qualityLabel = link.label || (link.resolution ? `${link.resolution}p` : 'default');
                 const res = link.resolution || qualityLabel.replace('p', '');
                 if (sourceUrl) {
                     cdnLinks.push({
                         file: sourceUrl,
                         label: qualityLabel,
                         audio: link.audio || 'jpn',
                         resolution: res,
                         size: link.size || 'N/A',
                         url: sourceUrl
                     });
                 }
            });
             if (cdnLinks.length > 0) {
                 console.log(`[getAnimeStreamingLinkPahe] Extracted ${cdnLinks.length} stream links from script fallback.`);
             }
        }
    }


    if (cdnLinks.length === 0) {
       console.warn(`[getAnimeStreamingLinkPahe] No stream URLs extracted from player page or scripts: ${targetURL}`);
       throw new Error("Could not find any streaming links for this episode."); // Throw error if none found
    }

    console.log(`[getAnimeStreamingLinkPahe] Extracted ${cdnLinks.length} stream links for episode ${episodeSessionId}`);
    return cdnLinks;

  } catch (error: any) {
    console.error(`[getAnimeStreamingLinkPahe] Failed for Anime ${animePaheId}, Episode ${episodeSessionId}. URL: ${targetURL}`);
     if(response) {
            console.error('[getAnimeStreamingLinkPahe] Response Status:', response.status, response.statusText);
       }
    console.error('[getAnimeStreamingLinkPahe] Error Details:', error.message);
     throw new Error(`Failed to get streaming links: ${error.message}`); // Re-throw error
  }
});


/**
 * Searches AnimePahe for an anime title to find its internal ID (session ID).
 * This function uses JSDOM and MUST run in a Node.js server environment (API route).
 * @param animeTitle: string The title to search for.
 * @returns Promise<string | null> The AnimePahe ID (session) if found, otherwise null.
 */
 export const getAnimePaheIdByTitle = cache(async (animeTitle: string): Promise<string | null> => {
     const { JSDOM } = await import('jsdom');
     // Use the AnimePahe API for searching
     const SEARCH_API_URL = 'https://animepahe.org/api'; // Use .org for API
     const targetURL = `${SEARCH_API_URL}?m=search&q=${encodeURIComponent(animeTitle)}`;
     let response: Response | undefined;

     console.log(`[getAnimePaheIdByTitle] Searching AnimePahe API for: "${animeTitle}" at ${targetURL}`);
     try {
         response = await fetch(targetURL, {
             headers: {
                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
                 'Accept': 'application/json',
             },
             cache: 'no-store',
         });

         if (!response.ok) {
             const errorBody = await response.text();
             console.error(`[getAnimePaheIdByTitle] Search API failed. Status: ${response.status}: ${errorBody}`);
             return null; // Return null on failure
         }

         const searchResponse: AnimePaheSearchResponse = await response.json();

         if (!searchResponse || !searchResponse.data || searchResponse.data.length === 0) {
             console.warn(`[getAnimePaheIdByTitle] No API search results found for "${animeTitle}".`);
             // --- Fallback: Scrape search results page ---
             console.log(`[getAnimePaheIdByTitle] Falling back to scraping search page for "${animeTitle}"`);
             const SEARCH_PAGE_URL = `https://animepahe.org/search?q=${encodeURIComponent(animeTitle)}`;
             const pageResponse = await fetch(SEARCH_PAGE_URL, {
                 headers: {
                     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
                     'Accept': 'text/html',
                 },
                 cache: 'no-store',
             });
             if (!pageResponse.ok) {
                 console.error(`[getAnimePaheIdByTitle] Scraping fallback failed. Status: ${pageResponse.status}`);
                 return null;
             }
             const html = await pageResponse.text();
             const dom = new JSDOM(html);
             const document = dom.window.document;
             const firstResultLink = document.querySelector('.search-results .col-12 a');
             if (firstResultLink) {
                 const animeUrl = firstResultLink.getAttribute('href');
                 if (animeUrl) {
                     const hrefParts = animeUrl.split('/');
                     const id = hrefParts.pop() || hrefParts.pop();
                     if (id && /^\d+$/.test(id)) {
                         console.log(`[getAnimePaheIdByTitle] Found ID ${id} via scraping fallback for "${animeTitle}".`);
                         return id; // Return the session ID string
                     }
                 }
             }
             console.warn(`[getAnimePaheIdByTitle] Scraping fallback also found no results for "${animeTitle}".`);
             return null; // No results from scraping either
             // --- End Fallback ---
         }

         // Use the first result from the API
         const firstResult = searchResponse.data[0];
         const sessionId = firstResult?.session; // The 'session' field holds the ID needed for episodes

         if (!sessionId) {
              console.warn(`[getAnimePaheIdByTitle] API search result for "${animeTitle}" missing 'session' ID. Result:`, firstResult);
              return null;
         }

         console.log(`[getAnimePaheIdByTitle] Found AnimePahe session ID ${sessionId} via API for "${animeTitle}"`);
         return sessionId; // Return the session ID string

     } catch (error: any) {
         console.error(`[getAnimePaheIdByTitle] Failed search for "${animeTitle}". URL: ${targetURL}`);
          if(response) {
                console.error('[getAnimePaheIdByTitle] Response Status:', response.status, response.statusText);
           }
         console.error('[getAnimePaheIdByTitle] Fetch Error Details:', error.message);
         return null;
     }
 });
