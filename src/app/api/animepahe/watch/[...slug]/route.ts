
'use server';

import { NextResponse } from 'next/server';
import type { AnimePaheCDNLink } from '@/services/animepahe'; // Import type for consistency
import { getAnimeStreamingLinkPahe } from '@/services/animepahe';

/**
 * Handles GET requests for streaming links based on an AnimePahe ID and Episode Session ID using a catch-all route.
 * URL Structure: /api/animepahe/watch/[animeId]/[episodeSessionId]
 *
 * @param request The incoming request.
 * @param params The dynamic parameters from the URL, captured in the `slug` array.
 *               Expected structure: slug = [animeId, episodeSessionId]
 * @returns A NextResponse with the streaming data or an error.
 */
export async function GET(
    request: Request,
    { params }: { params: { slug: string[] } } // Use catch-all slug
) {
    const { slug } = params;

    // Validate if slug has exactly two parts
    if (!slug || slug.length !== 2) {
        return NextResponse.json({ message: 'Invalid URL structure. Expected /watch/[animeId]/[episodeSessionId]' }, { status: 400 });
    }

    const [animeId, encodedEpisodeSessionId] = slug;
    const episodeSessionId = decodeURIComponent(encodedEpisodeSessionId); // Decode the session ID

    // Basic validation
     if (!animeId || !/^\d+$/.test(animeId)) {
         return NextResponse.json({ message: 'Invalid AnimePahe ID format' }, { status: 400 });
     }
     // Episode Session ID might not be purely numeric, check if it's empty
     if (!episodeSessionId || !episodeSessionId.trim()) {
         return NextResponse.json({ message: 'Missing or invalid Episode Session ID' }, { status: 400 });
     }

    console.log(`[API/animepahe/watch] Processing request for Anime ID: ${animeId}, Episode Session ID: ${episodeSessionId}`);

    try {
        // Pass both IDs to the service function
        const sources: AnimePaheCDNLink[] = await getAnimeStreamingLinkPahe(animeId, episodeSessionId);

        if (!sources || sources.length === 0) {
            console.warn(`[API/animepahe/watch] No streaming sources found for Anime ${animeId}, Episode ${episodeSessionId} on AnimePahe.`);
            return NextResponse.json({ message: 'No streaming sources found for this episode on AnimePahe.' }, { status: 404 });
        }

        console.log(`[API/animepahe/watch] Successfully fetched ${sources.length} sources for Anime ${animeId}, Episode ${episodeSessionId}`);
        return NextResponse.json({ sources }); // Return an object with the sources

    } catch (error: any) {
        console.error(`[API/animepahe/watch] Error fetching streaming data for Anime ${animeId}, Episode ${episodeSessionId} from AnimePahe:`, error);
        // Check if the error message indicates "Episode not found"
        if (error.message && error.message.toLowerCase().includes("episode not found")) {
             return NextResponse.json({ message: 'Episode link invalid or expired on AnimePahe.' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Internal server error while fetching streaming data.', error: error.message }, { status: 500 });
    }
}
