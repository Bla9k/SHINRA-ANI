'use server';

import { NextResponse } from 'next/server';
import type { AnimePaheEpisode } from '@/services/animepahe'; // Import type for consistency
import { getAnimeEpisodesPahe } from '@/services/animepahe';

/**
 * Handles GET requests for anime episodes based on AnimePahe ID.
 *
 * @param request The incoming request.
 * @param params The dynamic parameters from the URL, containing the malId (AnimePahe ID).
 * @returns A NextResponse with the episode data or an error.
 */
export async function GET(
    request: Request,
    { params }: { params: { malId: string } }
) {
    const { malId } = params;

    if (!malId) {
        return NextResponse.json({ message: 'Missing AnimePahe ID' }, { status: 400 });
    }


    console.log(`[API/animepahe/episodes] Fetching episodes for AnimePahe ID: ${malId}`);

    try {
        const episodes: AnimePaheEpisode[] = await getAnimeEpisodesPahe(malId);

        if (!episodes || episodes.length === 0) {
            console.warn(`[API/animepahe/episodes] No episodes found for AnimePahe ID ${malId}.`);
            return NextResponse.json({ message: 'No episodes found for this anime on AnimePahe.' }, { status: 404 });
        }

        console.log(`[API/animepahe/episodes] Successfully fetched ${episodes.length} episodes for AnimePahe ID: ${malId}`);
        return NextResponse.json(episodes);

    } catch (error: any) {
        console.error(`[API/animepahe/episodes] Error fetching episodes for ${malId} from AnimePahe:`, error);
        return NextResponse.json({ message: 'Internal server error while fetching episodes.', error: error.message }, { status: 500 });
    }
}

