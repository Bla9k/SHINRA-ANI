
import { cache } from 'react';
import { config } from '@/config';
// No direct import of JSDOM here - moved to API route

// --- Interfaces ---
export interface AnimePaheEpisode {
  id: string; // Episode session ID
  episode: number;
  title?: string | null;
  snapshot?: string | null; // Thumbnail URL
  duration?: string | null;
  created_at?: string | null;
  anime_id?: number; // Internal AnimePahe anime ID (from the URL/search)
}

export interface AnimePaheCDNLink {
  file: string; // Stream URL (often .m3u8)
  label: string; // Quality name (e.g., "1080p")
  audio: string; // Audio language (e.g., "jpn")
  // Add other potential fields if the API provides them
}

interface AnimePaheEpisodeApiResponse {
  data: AnimePaheEpisode[], // Array of raw episode data from API
  last_page: number
}

// --- Service Functions (Intended for Server-Side / API Route Use) ---

/**
 * Fetches anime episodes from AnimePahe's API.
 * This function should ideally be called from a server-side context (API route or Server Component action).
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
         cache: 'no-store', // Avoid caching episode lists which might update
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "Failed to read error body");
        console.error(`[getAnimeEpisodesPahe] API responded with status ${response.status}: ${errorBody}`);
         if (response.status === 404) {
             console.warn(`[getAnimeEpisodesPahe] No episodes found (404) for AnimePahe ID ${animePaheId}`);
             // Throw a more specific error message for the frontend to catch
             throw new Error(`No episodes found for this anime on AnimePahe (ID: ${animePaheId}). It might not be available or the ID is incorrect.`);
         }
         // Throw a general error for other non-OK responses
         throw new Error(`AnimePahe Episode API request failed: ${response.status} ${response.statusText}`);
      }
      const data: AnimePaheEpisodeApiResponse = await response.json();

      // Check if data itself indicates no episodes even with 200 OK (unlikely but possible)
      if (!data || !data.data || data.data.length === 0) {
          console.warn(`[getAnimeEpisodesPahe] Response OK but no episode data found for AnimePahe ID ${animePaheId}`);
          // Adjust error message to be more informative
          throw new Error(`No episode data returned by AnimePahe for ID ${animePaheId}, even though the request was successful.`);
      }

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
       // Re-throw the original error or a new one to be handled by the caller
       throw new Error(`Failed to fetch episodes from AnimePahe: ${error.message}`);
    }
  }
);

/**
 * Fetches streaming links for a specific AnimePahe episode session ID.
 * This function now relies on an API route to handle the scraping with JSDOM.
 * @param animePaheId: string - The ID of the anime on AnimePahe.
 * @param episodeSessionId: string - The session ID of the specific episode.
 * @returns Promise<AnimePaheCDNLink[]>
 */
export const getAnimeStreamingLinkPahe = cache(async (animePaheId: string, episodeSessionId: string): Promise<AnimePaheCDNLink[]> => {
    const apiUrl = `/api/animepahe/watch/${animePaheId}/${encodeURIComponent(episodeSessionId)}`;
    console.log(`[getAnimeStreamingLinkPahe] Fetching from internal API: ${apiUrl}`);
    try {
        const response = await fetch(apiUrl, { cache: 'no-store' }); // Fetch from our API route

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
            console.error(`[getAnimeStreamingLinkPahe] Internal API error ${response.status}:`, errorData.message || response.statusText);
            // Check for specific 404 from the API route
            if (response.status === 404 && errorData.message && errorData.message.includes('No streaming sources found')) {
                throw new Error(errorData.message); // Propagate the specific "not found" message
            }
            throw new Error(errorData.message || `Failed to get streaming links: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data || !Array.isArray(data.sources)) {
            throw new Error("Invalid response format from streaming link API.");
        }

        // Validate structure of sources
        const validSources = data.sources.filter((s: any): s is AnimePaheCDNLink =>
            s && typeof s.file === 'string' && typeof s.label === 'string' && typeof s.audio === 'string'
        );

        if (validSources.length === 0 && data.sources.length > 0) {
             console.warn("[getAnimeStreamingLinkPahe] API returned sources but they have invalid format:", data.sources);
             throw new Error("Received invalid source data from streaming link API.");
        } else if (validSources.length === 0) {
             console.warn("[getAnimeStreamingLinkPahe] API returned no valid sources.");
             throw new Error("No valid streaming sources found for this episode.");
        }


        console.log(`[getAnimeStreamingLinkPahe] Successfully fetched ${validSources.length} sources via internal API.`);
        return validSources;

    } catch (error: any) {
        console.error(`[getAnimeStreamingLinkPahe] Error fetching from internal API ${apiUrl}:`, error.message);
        throw new Error(`Failed to get streaming links: ${error.message}`);
    }
});


/**
 * Fetches the AnimePahe ID for a given MAL ID or title.
 * This function now relies on an API route to handle the searching/scraping.
 * @param identifier: string | number - The MAL ID or title to search for.
 * @returns Promise<string | null> The AnimePahe ID (session or internal ID) if found, otherwise null. Returns null if the API call fails unexpectedly.
 */
 export const getAnimePaheId = cache(async (identifier: string | number): Promise<string | null> => {
     const apiUrl = `/api/animepahe/search/${encodeURIComponent(identifier.toString())}`; // Pass MAL ID or title
     console.log(`[getAnimePaheId] Fetching from internal API: ${apiUrl}`);
     let response: Response | undefined;
     try {
         response = await fetch(apiUrl, { cache: 'no-store' }); // Fetch from our API route

         if (!response.ok) {
             const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
             console.error(`[getAnimePaheId] Internal API error ${response.status}:`, errorData.message || response.statusText);
             if (response.status === 404) {
                 console.warn(`[getAnimePaheId] Identifier "${identifier}" not found via internal API.`);
                 return null; // Return null if specifically not found by the API route
             }
             // For other errors (like 502 Bad Gateway from scraping), re-throw
             throw new Error(errorData.message || `Failed to search AnimePahe ID: ${response.statusText}`);
         }

         const data = await response.json();

         // API route should return { animePaheId: '...' or null }
         if (!data || typeof data.animePaheId === 'undefined') {
             console.error("[getAnimePaheId] Invalid response format from search API:", data);
             throw new Error("Invalid response format from search API.");
         }

         if (data.animePaheId) {
             console.log(`[getAnimePaheId] Successfully found AnimePahe ID ${data.animePaheId} for "${identifier}" via internal API.`);
         } else {
             console.log(`[getAnimePaheId] AnimePahe ID not found for "${identifier}" via internal API (API returned null).`);
         }
         return data.animePaheId; // Return the ID (string) or null

     } catch (error: any) {
         console.error(`[getAnimePaheId] Error fetching from internal API ${apiUrl}:`, error.message);
          // Return null to indicate the operation failed, distinguish from "not found"
         return null;
     }
 });
