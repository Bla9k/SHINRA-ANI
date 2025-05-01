
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
    let searchResult: any = null;

    // --- 1. Fetch Anime Title from Jikan API --- //
    try {
        const animeDetails = await getAnimeDetails(parseInt(malId, 10));
        if (animeDetails?.title) {
            animeTitle = animeDetails.title;
            console.log(`[API/anime/[id]/episodes] [${timestamp}] Fetched anime title from Jikan: "${animeTitle}"`);
        } else {
            console.warn(`[API/anime/[id]/episodes] [${timestamp}] Could not fetch anime details/title from Jikan for MAL ID ${malId}.`);
             // Optionally, attempt search directly without title if Jikan fails
             // return NextResponse.json({ message: 'Could not find anime details to initiate episode search.' }, { status: 404 });
        }
    } catch (error) {
        console.error(`[API/anime/[id]/episodes] [${timestamp}] Error fetching anime title from Jikan for MAL ID ${malId}:`, (error as Error).message);
        // Continue without title, search might still work
    }

    // --- 2. Search using fetchAnime to get the correct provider link/data ---
    // Use title if available, otherwise maybe try searching by MAL ID if provider supports it (unlikely)
    const searchTerm = animeTitle || `malid:${malId}`; // Use title or fallback (providers likely don't support malid search well)
    console.log(`[API/anime/[id]/episodes] [${timestamp}] Searching providers for term: "${searchTerm}"`);
    try {
        searchResult = await fetchAnime(searchTerm);
        if (!searchResult?.source || !searchResult?.data?.link) {
            console.warn(`[API/anime/[id]/episodes] [${timestamp}] fetchAnime could not find a provider link for "${searchTerm}".`);
            return NextResponse.json({ message: `Could not find the anime "${animeTitle || `MAL ID ${malId}`}" on supported providers.` }, { status: 404 });
        }
        console.log(`[API/anime/[id]/episodes] [${timestamp}] fetchAnime successful. Source: ${searchResult.source}, Link found: ${!!searchResult.data.link}`);
    } catch (error) {
        console.error(`[API/anime/[id]/episodes] [${timestamp}] Error during fetchAnime search for "${searchTerm}":`, (error as Error).message);
        return NextResponse.json({ message: 'Error finding anime on providers.', error: (error as Error).message }, { status: 500 });
    }

    // --- 3. Fetch Episodes using the found provider data ---
    let episodes: any[] | null = null;
    try {
        // Pass the entire searchResult (which includes source and data{title, link})
        episodes = await fetchEpisodes(searchResult);
    } catch (error) {
         console.error(`[API/anime/[id]/episodes] [${timestamp}] Error calling fetchEpisodes for source ${searchResult.source}:`, (error as Error).message);
         // Error already logged in fetchEpisodes, return 500
         return NextResponse.json({ message: 'Failed to fetch episodes from provider.', error: (error as Error).message }, { status: 500 });
    }

    // --- 4. Return Response ---
    if (episodes && episodes.length > 0) {
        console.log(`[API/anime/[id]/episodes] [${timestamp}] Successfully returning ${episodes.length} episodes from source: ${searchResult.source} for MAL ID: ${malId}`);
        return NextResponse.json({ episodes: episodes, source: searchResult.source }); // Include source in response
    } else {
        console.warn(`[API/anime/[id]/episodes] [${timestamp}] Failed to fetch episodes or no episodes found from source ${searchResult.source} for MAL ID: ${malId}`);
        return NextResponse.json({ message: `Could not retrieve episode list for this anime from source: ${searchResult.source}.` }, { status: 404 });
    }
}
