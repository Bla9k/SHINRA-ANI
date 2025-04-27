
import { config } from '@/config';

// Helper function to introduce a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- Interfaces for Consumet Responses ---

interface ConsumetEpisode {
    id: string; // Episode ID (e.g., "demon-slayer-kimetsu-no-yaiba-episode-1")
    number: number;
    title?: string | null; // Title might be missing or null
    description?: string | null;
    image?: string | null; // Thumbnail
    airDate?: string | null;
    url?: string; // Link to the episode page on the source provider
}

interface ConsumetEpisodeResponse {
    message?: string; // Optional message (e.g., "Anime not found")
    episodes?: ConsumetEpisode[];
    // Include other potential fields based on observation
    totalEpisodes?: number;
    currentPage?: number;
    hasNextPage?: boolean;
}

interface ConsumetStreamingSource {
    url: string; // The actual streaming URL (e.g., M3U8 link)
    isM3U8?: boolean; // Often true for HLS streams
    quality?: string; // e.g., "1080p", "720p", "default"
}

interface ConsumetWatchResponse {
    headers?: {
        Referer?: string;
        // Add other headers if needed
    };
    sources: ConsumetStreamingSource[];
    download?: string; // Optional download link
}


/**
 * Fetches the list of episodes for a given anime ID using the Consumet API.
 * Includes delay to mitigate rate limiting.
 *
 * @param animeMalId The MyAnimeList ID of the anime.
 * @returns A promise that resolves to an array of ConsumetEpisode objects.
 * @throws Throws an error if the fetch fails or the API returns an error.
 */
export async function getAnimeEpisodes(animeMalId: number): Promise<ConsumetEpisode[]> {
    // Use MAL ID directly with Consumet (it handles mapping internally for many providers)
    // We'll use the `/meta/anilist/info` approach for broader compatibility, assuming Consumet maps MAL ID there.
    // OR, find the AniList ID first if Consumet works better with that.
    // Let's try fetching info first to potentially get an anilist ID if needed, or just use MAL ID directly.
    // *** Update: Consumet's `/episodes` endpoint seems to accept MAL ID directly for many sources. Let's try that first. ***

    const url = `${config.consumetApiUrl}/meta/anilist/episodes/${animeMalId}`; // Using /meta/anilist/ as it's common
    const headers: HeadersInit = { 'Accept': 'application/json' };
    let response: Response | undefined;

    console.log(`[getAnimeEpisodes] Attempting fetch: ${url} (Delay: ${config.consumetApiDelayMs}ms)`);
    await delay(config.consumetApiDelayMs);

    try {
        response = await fetch(url, { method: 'GET', headers: headers });

        console.log(`[getAnimeEpisodes] Response status for ${url}: ${response.status}`);

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[getAnimeEpisodes] Consumet API response not OK: ${response.status} "${response.statusText}"`);
            console.error('[getAnimeEpisodes] Consumet Error Body:', errorBody);
            console.error('[getAnimeEpisodes] Consumet Request URL:', url);
            throw new Error(`Consumet episode fetch failed: ${response.status} ${response.statusText}. URL: ${url}`);
        }

        const jsonResponse: ConsumetEpisodeResponse = await response.json();

        if (!jsonResponse || !Array.isArray(jsonResponse.episodes)) {
            console.warn('[getAnimeEpisodes] Consumet response OK but "episodes" field is missing or not an array.', jsonResponse);
            return []; // Return empty array if episodes are not found or structure is wrong
        }

        console.log(`[getAnimeEpisodes] Successfully fetched ${jsonResponse.episodes.length} episodes for MAL ID ${animeMalId}.`);
        return jsonResponse.episodes;

    } catch (error: any) {
        console.error(`[getAnimeEpisodes] Failed to fetch episodes for MAL ID ${animeMalId} from Consumet.`);
        if(response) {
            console.error('[getAnimeEpisodes] Response Status on Catch:', response.status, response.statusText);
        }
        console.error('[getAnimeEpisodes] Fetch Error Details:', error);
        throw new Error(`Failed to fetch episode data from Consumet: ${error.message || 'Unknown fetch error'}`);
    }
}

/**
 * Fetches the streaming sources for a specific anime episode using the Consumet API.
 *
 * @param episodeId The episode ID obtained from the `getAnimeEpisodes` response.
 * @returns A promise that resolves to a ConsumetWatchResponse containing streaming sources.
 * @throws Throws an error if the fetch fails or no sources are found.
 */
export async function getAnimeStreamingLink(episodeId: string): Promise<ConsumetWatchResponse> {
    // Ensure episodeId is properly encoded
    const encodedEpisodeId = encodeURIComponent(episodeId);
    const url = `${config.consumetApiUrl}/meta/anilist/watch/${encodedEpisodeId}`;
    const headers: HeadersInit = { 'Accept': 'application/json' };
    let response: Response | undefined;

    console.log(`[getAnimeStreamingLink] Attempting fetch: ${url} (Delay: ${config.consumetApiDelayMs}ms)`);
    await delay(config.consumetApiDelayMs);

    try {
        response = await fetch(url, { method: 'GET', headers: headers });

        console.log(`[getAnimeStreamingLink] Response status for ${url}: ${response.status}`);

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[getAnimeStreamingLink] Consumet API response not OK: ${response.status} "${response.statusText}"`);
            console.error('[getAnimeStreamingLink] Consumet Error Body:', errorBody);
            console.error('[getAnimeStreamingLink] Consumet Request URL:', url);
            throw new Error(`Consumet watch fetch failed: ${response.status} ${response.statusText}. URL: ${url}`);
        }

        const jsonResponse: ConsumetWatchResponse = await response.json();

        if (!jsonResponse || !Array.isArray(jsonResponse.sources) || jsonResponse.sources.length === 0) {
            console.warn(`[getAnimeStreamingLink] Consumet response OK but "sources" field is missing, not an array, or empty for episode ${episodeId}.`, jsonResponse);
            throw new Error(`No streaming sources found for episode ${episodeId}.`);
        }

        console.log(`[getAnimeStreamingLink] Successfully fetched ${jsonResponse.sources.length} sources for episode ${episodeId}.`);
        return jsonResponse;

    } catch (error: any) {
        console.error(`[getAnimeStreamingLink] Failed to fetch streaming links for episode ${episodeId} from Consumet.`);
        if(response) {
            console.error('[getAnimeStreamingLink] Response Status on Catch:', response.status, response.statusText);
        }
        console.error('[getAnimeStreamingLink] Fetch Error Details:', error);
        throw new Error(`Failed to fetch streaming data from Consumet: ${error.message || 'Unknown fetch error'}`);
    }
}
