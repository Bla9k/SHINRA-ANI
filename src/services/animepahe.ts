// src/services/animepahe.ts
// This file will contain functions to interact with your internal Animepahe API routes.

import { ConsumetEpisode, ConsumetWatchResponse } from './consumet'; // Keeping types for now, you might need to define new ones

/**
 * Fetches the episodes for a specific anime using an internal API route that
 * interfaces with the Animepahe source.
 *
 * NOTE: The structure of the response (ConsumetEpisode array) might need adjustments
 * depending on the actual data structure returned by your Animepahe implementation.
 *
 * @param malId The MyAnimeList ID of the anime.
 * @returns A promise that resolves to an array of episode objects.
 * @throws Throws an error if the fetch fails or no episodes are found.
 */
export async function getAnimeEpisodesPahe(malId: string): Promise<ConsumetEpisode[]> {
    // Call your new internal API route for fetching episodes from Animepahe
    const url = `/api/animepahe/episodes/${malId}`;
    const headers: HeadersInit = { 'Accept': 'application/json' };

    console.log(`[getAnimeEpisodesPahe] Attempting fetch from internal API: ${url}`);

    try {
        const response = await fetch(url, { headers });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[getAnimeEpisodesPahe] API responded with status ${response.status}: ${errorBody}`);
            throw new Error(`Failed to fetch episodes: ${response.statusText}`);
        }

        const data = await response.json();

        // TODO: Validate and map the response data to match ConsumetEpisode structure
        // or define and use a new type for Animepahe episodes.
        // For now, assuming the internal API returns data that can be treated as ConsumetEpisode[].
        return data as ConsumetEpisode[]; // Type assertion, adjust as needed

    } catch (error: any) {
        console.error('[getAnimeEpisodesPahe] Error fetching episodes:', error);
        throw new Error(`Could not fetch episodes: ${error.message}`);
    }
}

/**
 * Fetches the streaming sources for a specific anime episode using an internal API route that
 * interfaces with the Animepahe source.
 *
 * NOTE: The structure of the response (ConsumetWatchResponse) might need adjustments
 * depending on the actual data structure returned by your Animepahe implementation.
 *
 * @param episodeId The episode ID obtained from the getAnimeEpisodesPahe response.
 *                  This ID should be usable by your internal /api/animepahe/watch route.
 * @returns A promise that resolves to an object containing streaming sources.
 * @throws Throws an error if the fetch fails or no sources are found.
 */
export async function getAnimeStreamingLinkPahe(episodeId: string): Promise<ConsumetWatchResponse> {
    // Ensure episodeId is properly encoded if it contains special characters
    const encodedEpisodeId = encodeURIComponent(episodeId);
    // Call your new internal API route for fetching watch links from Animepahe
    const url = `/api/animepahe/watch/${encodedEpisodeId}`;
    const headers: HeadersInit = { 'Accept': 'application/json' };

    console.log(`[getAnimeStreamingLinkPahe] Attempting fetch from internal API: ${url}`);

    try {
        const response = await fetch(url, { headers });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[getAnimeStreamingLinkPahe] API responded with status ${response.status}: ${errorBody}`);
            throw new Error(`Failed to fetch streaming link: ${response.statusText}`);
        }

        const data = await response.json();

        // TODO: Validate and map the response data to match ConsumetWatchResponse structure
        // or define and use a new type for Animepahe streaming data.
        // For now, assuming the internal API returns data that can be treated as ConsumetWatchResponse.
        return data as ConsumetWatchResponse; // Type assertion, adjust as needed

    } catch (error: any) {
        console.error('[getAnimeStreamingLinkPahe] Error fetching streaming link:', error);
        throw new Error(`Could not fetch streaming source: ${error.message}`);
    }
}
