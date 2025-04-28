
import { NextResponse } from 'next/server';
import { config } from '@/config'; // Import app config for Consumet URL
import type { ConsumetEpisode } from '@/services/consumet'; // Import type for consistency

/**
 * Handles GET requests for anime episodes based on MAL ID using the configured Consumet API.
 *
 * @param request The incoming request.
 * @param params The dynamic parameters from the URL, containing the malId.
 * @returns A NextResponse with the episode data or an error.
 */
export async function GET(
    request: Request,
    { params }: { params: { malId: string } }
) {
    const { malId } = params;
    const consumetUrl = config.consumetApiUrl; // Get Consumet URL from config

    if (!malId) {
        return NextResponse.json({ message: 'Missing MAL ID' }, { status: 400 });
    }
    if (!consumetUrl) {
         console.error('[API/consumet/episodes] Consumet API URL is not configured.');
         return NextResponse.json({ message: 'Consumet API URL not configured' }, { status: 500 });
    }

    const targetUrl = `${consumetUrl}/meta/anilist/episodes/${malId}`;
    const headers: HeadersInit = { 'Accept': 'application/json' };

    console.log(`[API/consumet/episodes] Forwarding request for MAL ID ${malId} to: ${targetUrl}`);

    try {
        const consumetResponse = await fetch(targetUrl, {
            method: 'GET',
            headers: headers,
            // Use a reasonable cache strategy, episodes don't update *that* frequently usually
            next: { revalidate: 3600 } // Revalidate every hour
        });

        console.log(`[API/consumet/episodes] Consumet response status for ${malId}: ${consumetResponse.status}`);

        if (!consumetResponse.ok) {
            const errorBody = await consumetResponse.text();
            console.error(`[API/consumet/episodes] Consumet API responded with status ${consumetResponse.status} for ${malId}: ${errorBody}`);
            const status = consumetResponse.status >= 500 ? 502 : consumetResponse.status; // Return 502 for upstream errors
            const message = status === 404 ? `Episodes not found for MAL ID ${malId} on Consumet.` : `Failed to fetch episodes from Consumet: ${consumetResponse.statusText}`;
            return NextResponse.json({ message: message, error: errorBody }, { status });
        }

        const data = await consumetResponse.json();

        // Basic validation of the response structure
        if (!data || !Array.isArray(data.episodes)) {
            console.warn(`[API/consumet/episodes] Consumet response for ${malId} lacks 'episodes' array. Response:`, JSON.stringify(data));
            // Even if the structure is unexpected, return what we got if it's an array
            // The frontend service layer does additional filtering.
            // If data.episodes is not an array at all, return 404.
            if (!Array.isArray(data?.episodes)) {
                 return NextResponse.json({ message: 'No valid episode data found from provider.' }, { status: 404 });
            }
        }

        console.log(`[API/consumet/episodes] Successfully fetched ${data.episodes?.length ?? 0} episodes for MAL ID: ${malId}`);
        // Directly return the Consumet response data, frontend service will filter
        return NextResponse.json(data.episodes); // Return only the episodes array

    } catch (error: any) {
        console.error(`[API/consumet/episodes] Error fetching episodes for ${malId} from ${targetUrl}:`, error);
        return NextResponse.json({ message: 'Internal server error while fetching episodes.', error: error.message }, { status: 500 });
    }
}
