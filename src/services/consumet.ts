
import { config } from '@/config';

// Helper function to introduce a delay (if needed for internal API calls, likely not)
// const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Interfaces for Consumet Responses ---

export interface ConsumetEpisode {
    id: string; // Episode ID (e.g., "demon-slayer-kimetsu-no-yaiba-episode-1")
    number: number;
    title?: string | null; // Title might be missing or null
    description?: string | null;
    image?: string | null; // Thumbnail
    airDate?: string | null;
    url?: string; // Link to the episode page on the source provider
}

// The internal API route should return only the array
// interface ConsumetEpisodeResponse {
//     episodes?: ConsumetEpisode[];
//     // Include other potential fields based on observation
// }

export interface ConsumetStreamingSource {
    url: string; // The actual streaming URL (e.g., M3U8 link)
    isM3U8?: boolean; // Often true for HLS streams
    quality?: string; // e.g., "1080p", "720p", "default"
}

export interface ConsumetWatchResponse {
    headers?: {
        Referer?: string;
        // Add other headers if needed
    };
    sources: ConsumetStreamingSource[];
    download?: string; // Optional download link
}


/**
 * Fetches the list of episodes for a given anime ID using the internal API route.
 * Returns an empty array if fetching fails or no episodes are found.
 *
 * @param animeMalId The MyAnimeList ID of the anime.
 * @returns A promise that resolves to an array of ConsumetEpisode objects.
 */
export async function getAnimeEpisodes(animeMalId: number): Promise<ConsumetEpisode[]> {
    // Point to the internal API route
    const url = `/api/consumet/episodes/${animeMalId}`;
    const headers: HeadersInit = { 'Accept': 'application/json' };
    let response: Response | undefined;

    console.log(`[getAnimeEpisodes] Attempting fetch from internal API: ${url}`);
    // No artificial delay needed for internal API calls generally

    try {
        response = await fetch(url, {
             method: 'GET',
             headers: headers,
             // Caching can be handled by the API route or here if needed
             // next: { revalidate: 3600 }
        });

        console.log(`[getAnimeEpisodes] Response status from internal API ${url}: ${response.status}`);

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[getAnimeEpisodes] Internal API response not OK: ${response.status} "${response.statusText}"`);
            console.error('[getAnimeEpisodes] Internal API Error Body:', errorBody);
             // Log specific status codes
             if (response.status === 404) {
                console.warn(`[getAnimeEpisodes] Internal API returned 404 for episodes of MAL ID ${animeMalId}.`);
            } else {
                console.warn(`[getAnimeEpisodes] Internal API returned error ${response.status} for ${url}.`);
            }
            // Don't throw, return empty array
            return [];
        }

        // Expecting the API route to return the array directly
        const episodes: ConsumetEpisode[] = await response.json();

        if (!Array.isArray(episodes)) {
            console.warn('[getAnimeEpisodes] Internal API response OK but data is not an array.', episodes);
            return []; // Return empty array if data is not an array
        }

        console.log(`[getAnimeEpisodes] Successfully fetched ${episodes.length} episodes for MAL ID ${animeMalId} via internal API.`);
        // Filter for valid episode objects just in case
        return episodes.filter(ep => ep && ep.id && typeof ep.number === 'number');

    } catch (error: any) {
        console.error(`[getAnimeEpisodes] Failed to fetch episodes for MAL ID ${animeMalId} from internal API ${url}.`);
        if(response) {
            console.error('[getAnimeEpisodes] Response Status on Catch:', response.status, response.statusText);
        }
        console.error('[getAnimeEpisodes] Fetch Error Message:', error.message);
        // Return empty array on any fetch error
        return [];
    }
}

/**
 * Fetches the streaming sources for a specific anime episode using the internal API route.
 *
 * @param episodeId The episode ID obtained from the `getAnimeEpisodes` response.
 * @returns A promise that resolves to a ConsumetWatchResponse containing streaming sources.
 * @throws Throws an error if the fetch fails or no sources are found (re-throwing the error from the internal API).
 */
export async function getAnimeStreamingLink(episodeId: string): Promise<ConsumetWatchResponse> {
    // Ensure episodeId is properly encoded for the URL path segment
    const encodedEpisodeId = encodeURIComponent(episodeId);
    const url = `/api/consumet/watch/${encodedEpisodeId}`;
    const headers: HeadersInit = { 'Accept': 'application/json' };
    let response: Response | undefined;

    console.log(`[getAnimeStreamingLink] Attempting fetch from internal API: ${url}`);
    // No artificial delay needed

    try {
        response = await fetch(url, {
            method: 'GET',
            headers: headers,
            cache: 'no-store', // Streaming links should not be cached
        });

        console.log(`[getAnimeStreamingLink] Response status from internal API ${url}: ${response.status}`);

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[getAnimeStreamingLink] Internal API response not OK: ${response.status} "${response.statusText}"`);
            console.error('[getAnimeStreamingLink] Internal API Error Body:', errorBody);
            // Re-throw an error to be caught by the calling component (e.g., watch page)
             if (response.status === 404) {
                throw new Error(`Episode streaming link not found (Internal API 404).`);
            }
            throw new Error(`Internal API watch fetch failed: ${response.status} ${response.statusText}`);
        }

        const jsonResponse: ConsumetWatchResponse = await response.json();

        // Basic validation - API route should handle more robustly
        if (!jsonResponse || !Array.isArray(jsonResponse.sources) || jsonResponse.sources.length === 0) {
            console.warn(`[getAnimeStreamingLink] Internal API response OK but "sources" field is missing, not an array, or empty for episode ${episodeId}.`, jsonResponse);
            throw new Error(`No valid streaming sources returned from internal API for episode ${decodeURIComponent(episodeId)}.`);
        }

        console.log(`[getAnimeStreamingLink] Successfully fetched ${jsonResponse.sources.length} sources for episode ${episodeId} via internal API.`);
        return jsonResponse;

    } catch (error: any) {
        console.error(`[getAnimeStreamingLink] Failed to fetch streaming links for episode ${episodeId} from internal API ${url}.`);
        if(response) {
            console.error('[getAnimeStreamingLink] Response Status on Catch:', response.status, response.statusText);
        }
        console.error('[getAnimeStreamingLink] Fetch Error Message:', error.message);
        // Re-throw the error for the UI to handle
        throw new Error(`Failed to fetch streaming data: ${error.message || 'Unknown fetch error'}`);
    }
}
