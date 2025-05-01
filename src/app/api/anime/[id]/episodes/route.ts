'use server'; // Mark this module as server-only

import { NextResponse } from 'next/server';
import { getAnimeDetails } from '@/services/anime'; // Keep Jikan API for anime title
import { fetchAnime, fetchEpisodes } from '@/services/fetchAnime'; // Import centralized fetchers

/**
 * Handles GET requests to fetch episode lists for a given anime ID,
 * using the centralized fetchAnime and fetchEpisodes services with fallback logic.
 *
 * @param request The incoming request.
 * @param params The dynamic parameters from the URL, containing the anime ID (id).
 * @returns A NextResponse with the episode list or an error.
 */
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    const timestamp = new Date().toISOString();
    console.log(`[API/anime/[id]/episodes] [${timestamp}] === API Route Hit ===`);
    const { id: malId } = params;

    if (!malId || isNaN(parseInt(malId))) {
        console.error(`[API/anime/[id]/episodes] [${timestamp}] Bad Request: Invalid or missing Anime MAL ID.`);
        return NextResponse.json({ message: 'Invalid or missing Anime MAL ID' }, { status: 400 });
    }

    console.log(`[API/anime/[id]/episodes] [${timestamp}] Received request for Anime MAL ID: ${malId}`);

    let animeTitle: string | null = null;
    let searchResult: any = null; // Keep 'any' for now due to varying structures

    // --- 1. Fetch Anime Title from Jikan API --- //
    try {
        const animeDetails = await getAnimeDetails(parseInt(malId, 10));
        if (animeDetails?.title) {
            animeTitle = animeDetails.title;
            console.log(`[API/anime/[id]/episodes] [${timestamp}] Fetched anime title from Jikan: "${animeTitle}"`);
        } else {
            console.warn(`[API/anime/[id]/episodes] [${timestamp}] Could not fetch anime details/title from Jikan for MAL ID ${malId}.`);
        }
    } catch (error) {
        console.error(`[API/anime/[id]/episodes] [${timestamp}] Error fetching anime title from Jikan for MAL ID ${malId}:`, (error as Error).message);
        // Continue without title, search might still work
    }

    // --- 2. Search using fetchAnime to get the correct provider link/data ---
    const searchTerm = animeTitle || `malid:${malId}`; // Consider a fallback if Jikan fails
    console.log(`[API/anime/[id]/episodes] [${timestamp}] Searching providers for term: "${searchTerm}"`);
    try {
        const searchResponse = await fetchAnime(searchTerm); // Call the service
        if (!searchResponse || !searchResponse.source || !searchResponse.data?.link) {
             console.warn(`[API/anime/[id]/episodes] [${timestamp}] fetchAnime could not find a provider link for "${searchTerm}". Search Response:`, searchResponse);
             const message = searchResponse?.error ?? `Could not find the anime "${animeTitle || `MAL ID ${malId}`}" on supported providers.`;
             return NextResponse.json({ message: message }, { status: 404 });
        }
        searchResult = searchResponse; // Store the whole result { source, data }
        console.log(`[API/anime/[id]/episodes] [${timestamp}] fetchAnime successful. Source: ${searchResult.source}, Link found: ${!!searchResult.data.link}`);
    } catch (error: unknown) { // Catch unknown type
         const err = error as Error; // Type assertion
        console.error(`[API/anime/[id]/episodes] [${timestamp}] Error during fetchAnime search for "${searchTerm}":`, err.message);
        return NextResponse.json({ message: 'Error finding anime on providers.', error: err.message }, { status: 500 });
    }

    // --- 3. Fetch Episodes using the found provider data ---
    let episodes: any[] | null = null; // Keep 'any' for now, or define a common Episode type
    try {
        // Pass the entire searchResult (which includes source and data{title, link, id?})
        episodes = await fetchEpisodes(searchResult);
    } catch (error: unknown) { // Catch unknown type
         const err = error as Error; // Type assertion
         console.error(`[API/anime/[id]/episodes] [${timestamp}] Error calling fetchEpisodes for source ${searchResult.source}:`, err.message);
         // Error already logged in fetchEpisodes, return 500
         return NextResponse.json({ message: 'Failed to fetch episodes from provider.', error: err.message }, { status: 500 });
    }

    // --- 4. Return Response ---
    if (episodes && episodes.length > 0) {
        console.log(`[API/anime/[id]/episodes] [${timestamp}] Successfully returning ${episodes.length} episodes from source: ${searchResult.source} for MAL ID: ${malId}`);
        return NextResponse.json({ episodes: episodes, source: searchResult.source }); // Include source in response
    } else if (episodes === null) { // Explicitly check for null if fetchEpisodes failed
        console.warn(`[API/anime/[id]/episodes] [${timestamp}] fetchEpisodes returned null (failed) for source ${searchResult.source}, MAL ID: ${malId}`);
         return NextResponse.json({ message: `Failed to retrieve episode list from source: ${searchResult.source}.` }, { status: 500 }); // Return 500 if fetching failed
    } else { // episodes is an empty array
         console.warn(`[API/anime/[id]/episodes] [${timestamp}] No episodes found from source ${searchResult.source} for MAL ID: ${malId}`);
        // Return 404 if no episodes were found, even if search was successful
        return NextResponse.json({ message: `No episodes found for this anime on source: ${searchResult.source}.` }, { status: 404 });
    }
}
