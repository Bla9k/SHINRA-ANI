'use server';

import { NextResponse } from 'next/server';
import type { AnimePaheCDNLink } from '@/services/animepahe'; // Import type for consistency
import { getAnimeStreamingLinkPahe } from '@/services/animepahe';

/**
 * Handles GET requests for streaming links based on an episode ID using the AnimePahe API.
 *
 * @param request The incoming request.
 * @param params The dynamic parameters from the URL, containing the episodeId.
 * @returns A NextResponse with the streaming data or an error.
 */
export async function GET(
    request: Request,
    { params }: { params: { episodeId: string } }
) {
    const { episodeId } = params;

    if (!episodeId) {
        return NextResponse.json({ message: 'Missing Episode ID' }, { status: 400 });
    }

    console.log(`[API/animepahe/watch] Fetching streaming link for Episode ID: ${episodeId}`);

    try {
        const sources: AnimePaheCDNLink[] = await getAnimeStreamingLinkPahe(episodeId);

        if (!sources || sources.length === 0) {
            console.warn(`[API/animepahe/watch] No streaming sources found for episode ID ${episodeId} on AnimePahe.`);
            return NextResponse.json({ message: 'No streaming sources found for this episode on AnimePahe.' }, { status: 404 });
        }

        console.log(`[API/animepahe/watch] Successfully fetched ${sources.length} sources for Episode ID: ${episodeId}`);
        return NextResponse.json({ sources }); // Return an object with the sources

    } catch (error: any) {
        console.error(`[API/animepahe/watch] Error fetching streaming data for ${episodeId} from AnimePahe:`, error);
        return NextResponse.json({ message: 'Internal server error while fetching streaming data.', error: error.message }, { status: 500 });
    }
}

