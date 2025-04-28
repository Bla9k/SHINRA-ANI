
'use server';

import { NextResponse } from 'next/server';
import type { AnimePaheEpisode } from '@/services/animepahe'; // Import type for consistency
import { getAnimeEpisodesPahe } from '@/services/animepahe';

/**
 * Handles GET requests for anime episodes based on AnimePahe ID.
 * NOTE: The `malId` parameter in the URL now expects the ANIMEPAHE ID, not the MyAnimeList ID.
 *
 * @param request The incoming request.
 * @param params The dynamic parameters from the URL, containing the malId (which should be the AnimePahe ID).
 * @returns A NextResponse with the episode data or an error.
 */
export async function GET(
    request: Request,
    { params }: { params: { malId: string } } // Keep param name as malId for URL compatibility
) {
    const animePaheId = params.malId; // Treat the malId param as the AnimePahe ID

    if (!animePaheId) {
        return NextResponse.json({ message: 'Missing AnimePahe ID' }, { status: 400 });
    }

    // Validate if it looks like a numeric ID (basic check)
    if (!/^\d+$/.test(animePaheId)) {
         return NextResponse.json({ message: 'Invalid AnimePahe ID format' }, { status: 400 });
    }

    console.log(`[API/animepahe/episodes] Fetching episodes for AnimePahe ID: ${animePaheId}`);

    try {
        // Pass the AnimePahe ID to the service function
        const episodes: AnimePaheEpisode[] = await getAnimeEpisodesPahe(animePaheId);

        if (!episodes || episodes.length === 0) {
            console.warn(`[API/animepahe/episodes] No episodes found for AnimePahe ID ${animePaheId}.`);
            // Use 404 status code to indicate resource not found or empty
            return NextResponse.json({ message: 'No episodes found for this anime on AnimePahe.' }, { status: 404 });
        }

        console.log(`[API/animepahe/episodes] Successfully fetched ${episodes.length} episodes for AnimePahe ID: ${animePaheId}`);
        return NextResponse.json(episodes);

    } catch (error: any) {
        console.error(`[API/animepahe/episodes] Error fetching episodes for ${animePaheId} from AnimePahe:`, error);
        // Use 500 for internal server errors during processing
        return NextResponse.json({ message: 'Internal server error while fetching episodes.', error: error.message }, { status: 500 });
    }
}
