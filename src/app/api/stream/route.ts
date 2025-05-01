
import { NextResponse } from 'next/server';
import { fetchStreamingLinks } from '@/services/fetchAnime'; // Use the centralized service
import { resolvePlayerUrl } from '@/lib/streamResolver'; // Import a new resolver utility

/**
 * Handles GET requests for streaming links using multiple scraping layers via fetchStreamingLinks.
 * Also attempts to resolve common player iframe URLs (Vidplay, MyCloud, etc.).
 *
 * Query Parameters:
 * - source: The provider name (e.g., 'AnimeSuge', 'AniWave')
 * - link: The URL to the specific episode page on the provider's site
 * - number: (Optional) The episode number for logging
 *
 * @param request The incoming request.
 * @returns A NextResponse with the final streaming data (URL and quality) or an error.
 */
export async function GET(request: Request) {
    const timestamp = new Date().toISOString();
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    const episodeLink = searchParams.get('link');
    const episodeNumber = searchParams.get('number');

    if (!source || !episodeLink) {
        console.error(`[API/stream] [${timestamp}] Bad Request: Missing source or episode link query parameter.`);
        return NextResponse.json({ message: 'Missing source or episode link query parameter' }, { status: 400 });
    }

    console.log(`[API/stream] [${timestamp}] Received request - Source: ${source}, Episode Link: ${episodeLink}, Episode Num: ${episodeNumber}`);

    try {
        // 1. Get the initial stream link/iframe URL using the centralized service
        const initialStreamLink = await fetchStreamingLinks({ source, link: episodeLink, number: episodeNumber }); // Pass necessary info

        if (!initialStreamLink) {
            console.warn(`[API/stream] [${timestamp}] Failed to fetch initial stream link from source: ${source} for link: ${episodeLink}`);
            return NextResponse.json({ message: `Could not find streaming link on ${source}.` }, { status: 404 });
        }

        console.log(`[API/stream] [${timestamp}] Initial link/iframe from ${source}: ${initialStreamLink}`);

        // 2. Attempt to resolve the link (if it's an iframe or player page)
        const resolvedData = await resolvePlayerUrl(initialStreamLink);

        if (!resolvedData || !resolvedData.url) {
            console.warn(`[API/stream] [${timestamp}] Failed to resolve the final stream URL from: ${initialStreamLink}. Returning initial link.`);
            // Fallback: Return the unresolved URL but flag it or use default quality
             // Check if the initial link itself might be playable (e.g., direct .mp4)
            if (initialStreamLink.match(/\.(mp4|mkv|webm)(\?|$)/i)) {
                return NextResponse.json({ url: initialStreamLink, quality: 'direct' });
            }
            // Otherwise, return it flagged as potentially an iframe
            return NextResponse.json({ url: initialStreamLink, quality: 'iframe/unresolved', message: 'Could not resolve final stream link.' });
        }

        console.log(`[API/stream] [${timestamp}] Resolved stream data: Quality=${resolvedData.quality || 'unknown'}, URL=${resolvedData.url}`);
        // Return the best quality URL found
        return NextResponse.json({ url: resolvedData.url, quality: resolvedData.quality || 'unknown' });

    } catch (error: any) {
        console.error(`[API/stream] [${timestamp}] Error processing stream request for ${source} - ${episodeLink}:`, error.message);
        // console.error(`[API/stream] Error Stack:`, error.stack); // Optional: Log full stack
        // Provide a generic server error message
        return NextResponse.json({ message: 'Internal server error while fetching stream.', error: error.message }, { status: 500 });
    }
}

// Remove the old GET function using specific layers
// export async function GET_OLD(...) { ... }
