
import { cache } from 'react';
import { config } from '@/config';
// Removed top-level import of JSDOM: import { JSDOM } from 'jsdom';
// JSDOM will be used dynamically ONLY within API routes (server-side).

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
        const errorBody = await response.text();
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
            throw new Error(errorData.message || `Failed to get streaming links: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data || !Array.isArray(data.sources)) {
            throw new Error("Invalid response format from streaming link API.");
        }

        console.log(`[getAnimeStreamingLinkPahe] Successfully fetched ${data.sources.length} sources via internal API.`);
        return data.sources as AnimePaheCDNLink[];

    } catch (error: any) {
        console.error(`[getAnimeStreamingLinkPahe] Error fetching from internal API ${apiUrl}:`, error.message);
        throw new Error(`Failed to get streaming links: ${error.message}`);
    }
});


/**
 * Fetches the AnimePahe session ID for a given anime title.
 * This function now relies on an API route to handle the searching/scraping with JSDOM.
 * @param animeTitle: string The title to search for.
 * @returns Promise<string | null> The AnimePahe ID (session) if found, otherwise null.
 */
 export const getAnimePaheSession = cache(async (animeTitle: string): Promise<{ id: string | null } | null> => {
     const apiUrl = `/api/animepahe/search/${encodeURIComponent(animeTitle)}`;
     console.log(`[getAnimePaheSession] Fetching from internal API: ${apiUrl}`);
     try {
         const response = await fetch(apiUrl, { cache: 'no-store' }); // Fetch from our API route

         if (!response.ok) {
             const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
             console.error(`[getAnimePaheSession] Internal API error ${response.status}:`, errorData.message || response.statusText);
             if (response.status === 404) {
                 console.warn(`[getAnimePaheSession] Anime title "${animeTitle}" not found via internal API.`);
                 return null; // Not found is not necessarily a hard error
             }
             throw new Error(errorData.message || `Failed to search AnimePahe ID: ${response.statusText}`);
         }

         const data = await response.json();

         if (!data || typeof data.animePaheId === 'undefined') { // API should return { animePaheId: '...' or null }
             throw new Error("Invalid response format from search API.");
         }

         if (data.animePaheId) {
             console.log(`[getAnimePaheSession] Successfully found AnimePahe ID ${data.animePaheId} for "${animeTitle}" via internal API.`);
         } else {
             console.log(`[getAnimePaheSession] AnimePahe ID not found for "${animeTitle}" via internal API.`);
         }
         return { id: data.animePaheId }; // Return the ID wrapped in an object

     } catch (error: any) {
         console.error(`[getAnimePaheSession] Error fetching from internal API ${apiUrl}:`, error.message);
         throw new Error(`Failed to search AnimePahe ID: ${error.message}`);
     }
 });
