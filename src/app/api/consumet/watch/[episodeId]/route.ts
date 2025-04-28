
import { NextResponse } from 'next/server';
import type { ConsumetWatchResponse } from '@/services/consumet'; // Import type for consistency

/**
 * @deprecated This route is deprecated. Use /api/animepahe/watch/[episodeId] instead.
 * Handles GET requests for streaming links based on an episode ID using the configured Consumet API.
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
    const consumetUrl = process.env.CONSUMET_API_URL; // Use actual environment variable now

     console.warn(`[API/consumet/watch] DEPRECATED route hit for Episode ID: ${episodeId}. Use /api/animepahe/watch instead.`);


    if (!episodeId) {
        return NextResponse.json({ message: 'Missing Episode ID' }, { status: 400 });
    }
     if (!consumetUrl) {
         console.error('[API/consumet/watch] Consumet API URL is not configured.');
         return NextResponse.json({ message: 'Consumet API URL not configured' }, { status: 500 });
    }

    // Consumet uses unencoded IDs in its path
    const decodedEpisodeId = decodeURIComponent(episodeId);
    // Construct the full external Consumet API URL
    const targetUrl = `${consumetUrl}/meta/anilist/watch/${decodedEpisodeId}`;
    const headers: HeadersInit = { 'Accept': 'application/json' };

    console.log(`[API/consumet/watch] Forwarding DEPRECATED request for Episode ID ${decodedEpisodeId} to: ${targetUrl}`);

    try {
        // Note: Streaming links can be volatile, short cache time or no cache
        const consumetResponse = await fetch(targetUrl, {
            method: 'GET',
            headers: headers,
            cache: 'no-store', // Avoid caching streaming links
        });

        console.log(`[API/consumet/watch] Consumet response status for ${decodedEpisodeId}: ${consumetResponse.status}`);

        if (!consumetResponse.ok) {
            const errorBody = await consumetResponse.text();
            console.error(`[API/consumet/watch] Consumet API responded with status ${consumetResponse.status} for ${decodedEpisodeId}: ${errorBody}`);
            const status = consumetResponse.status >= 500 ? 502 : consumetResponse.status;
             const message = status === 404 ? `Streaming link not found for episode ID ${decodedEpisodeId} on Consumet.` : `Failed to fetch streaming link from Consumet: ${consumetResponse.statusText}`;
            return NextResponse.json({ message: message, error: errorBody }, { status });
        }

        const data: ConsumetWatchResponse = await consumetResponse.json();

        // Basic validation
        if (!data || !Array.isArray(data.sources) || data.sources.length === 0) {
            console.warn(`[API/consumet/watch] Consumet response for ${decodedEpisodeId} lacks valid 'sources' array. Response:`, JSON.stringify(data));
            return NextResponse.json({ message: 'No streaming sources found from provider.' }, { status: 404 });
        }

        console.log(`[API/consumet/watch] Successfully fetched ${data.sources.length} sources for Episode ID: ${decodedEpisodeId}`);
        // Return the full Consumet response structure
        return NextResponse.json(data);

    } catch (error: any) {
        console.error(`[API/consumet/watch] Error fetching streaming data for ${decodedEpisodeId} from ${targetUrl}:`, error);
        return NextResponse.json({ message: 'Internal server error while fetching streaming data.', error: error.message }, { status: 500 });
    }
}
