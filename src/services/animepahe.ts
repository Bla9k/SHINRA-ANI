
// src/services/animepahe.ts
// This file will contain functions to interact with your internal Animepahe API routes.

// Define types based on expected AnimePahe API responses (adjust as needed)
export interface AnimepaheEpisode {
    id: string; // AnimePahe's internal episode ID (e.g., session ID)
    number: number;
    title?: string | null;
    thumbnail?: string | null;
    duration?: number | null;
    isFiller?: boolean | null; // Often not available from AnimePahe directly
    // Add other fields returned by your API route if necessary
}

export interface AnimepaheStreamingSource {
    url: string;
    quality: string; // e.g., "360p", "720p", "1080p"
    isM3U8?: boolean; // Determine if it's an HLS stream
}

export interface AnimepaheWatchResponse {
    sources: AnimepaheStreamingSource[];
    // Potentially add headers if needed by the player
    headers?: {
        Referer?: string;
    };
    // Add other relevant fields if returned by your API route
    intro?: { start: number; end: number };
}

/**
 * Fetches the episodes for a specific anime using an internal API route that
 * interfaces with the AnimePahe source.
 *
 * @param malId The MyAnimeList ID of the anime.
 * @returns A promise that resolves to an array of episode objects.
 * @throws Throws an error if the fetch fails or no episodes are found.
 */
export async function getAnimeEpisodesPahe(malId: number): Promise<AnimepaheEpisode[]> {
    const url = `/api/animepahe/episodes/${malId}`;
    const headers: HeadersInit = { 'Accept': 'application/json' };

    console.log(`[getAnimeEpisodesPahe] Attempting fetch from internal API: ${url}`);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: headers,
            // Cache moderately, episode lists don't change extremely frequently
            next: { revalidate: 3600 }
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[getAnimeEpisodesPahe] API responded with status ${response.status}: ${errorBody}`);
             if (response.status === 404) {
                console.warn(`[getAnimeEpisodesPahe] No episodes found (404) for MAL ID ${malId}`);
                return []; // Return empty array if API confirms not found
            }
             // For other errors, still return empty for now to avoid breaking UI, but log it
            console.error(`Failed to fetch episodes, API returned ${response.status}. Returning empty array.`);
            return [];
            // Or re-throw if you want the UI to explicitly handle server errors:
            // throw new Error(`Failed to fetch episodes: ${response.statusText}`);
        }

        // Assume the API returns an array directly
        const data: AnimepaheEpisode[] = await response.json();

        if (!Array.isArray(data)) {
             console.warn('[getAnimeEpisodesPahe] Internal API response OK but data is not an array.', data);
             return []; // Return empty array if data is not an array
         }

        console.log(`[getAnimeEpisodesPahe] Successfully fetched ${data.length} episodes for MAL ID ${malId}`);
        // Filter for valid episode objects just in case
        return data.filter(ep => ep && ep.id && typeof ep.number === 'number');


    } catch (error: any) {
        console.error('[getAnimeEpisodesPahe] Error fetching episodes:', error);
         // Return empty array on error
        return [];
    }
}

/**
 * Fetches the streaming sources for a specific anime episode using an internal API route that
 * interfaces with the Animepahe source.
 *
 * @param animepaheEpisodeId The episode ID obtained from the getAnimeEpisodesPahe response.
 *                           This ID should be usable by your internal /api/animepahe/watch route.
 * @returns A promise that resolves to an object containing streaming sources.
 * @throws Throws an error if the fetch fails or no sources are found.
 */
export async function getAnimeStreamingLinkPahe(animepaheEpisodeId: string): Promise<AnimepaheWatchResponse> {
    // AnimePahe IDs are usually safe, but encode just in case
    const encodedEpisodeId = encodeURIComponent(animepaheEpisodeId);
    const url = `/api/animepahe/watch/${encodedEpisodeId}`;
    const headers: HeadersInit = { 'Accept': 'application/json' };

    console.log(`[getAnimeStreamingLinkPahe] Attempting fetch from internal API: ${url}`);

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: headers,
            cache: 'no-store', // Streaming links are volatile
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[getAnimeStreamingLinkPahe] API responded with status ${response.status}: ${errorBody}`);
             if (response.status === 404) {
                 throw new Error(`Episode streaming link not found (404) for ID ${animepaheEpisodeId}.`);
             }
            throw new Error(`Failed to fetch streaming link: ${response.statusText}`);
        }

        const data: AnimepaheWatchResponse = await response.json();

        // Validate the response structure
        if (!data || !Array.isArray(data.sources) || data.sources.length === 0) {
            console.warn(`[getAnimeStreamingLinkPahe] Internal API response OK but "sources" field is missing, not an array, or empty for episode ${animepaheEpisodeId}.`, data);
            throw new Error(`No valid streaming sources returned from internal API.`);
        }

        // Enrich sources with isM3U8 flag
        data.sources = data.sources.map(source => ({
            ...source,
            isM3U8: source.url.includes('.m3u8')
        }));

        console.log(`[getAnimeStreamingLinkPahe] Successfully fetched ${data.sources.length} sources for Episode ID: ${animepaheEpisodeId}`);
        return data;

    } catch (error: any) {
        console.error('[getAnimeStreamingLinkPahe] Error fetching streaming link:', error);
        throw new Error(`Could not fetch streaming source: ${error.message}`);
    }
}
