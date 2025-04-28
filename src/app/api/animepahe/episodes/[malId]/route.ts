
// src/app/api/animepahe/episodes/[malId]/route.ts
// This file will handle requests for anime episodes using the Animepahe source.

import { NextResponse } from 'next/server';
import type { AnimepaheEpisode } from '@/services/animepahe'; // Use the specific type

/**
 * Handles GET requests for anime episodes based on MAL ID using Animepahe.
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

    if (!malId || isNaN(parseInt(malId))) {
        return NextResponse.json({ message: 'Invalid or missing MAL ID' }, { status: 400 });
    }

    const numericMalId = parseInt(malId);
    console.log(`[API/animepahe/episodes] Received request for MAL ID: ${numericMalId}`);

    // --- TODO: Implement REAL AnimePahe Episode Fetching Logic ---
    // This is where you would:
    // 1. Find the AnimePahe internal ID for the anime based on the MAL ID (often involves searching AnimePahe).
    // 2. Fetch the episode list page from AnimePahe using their internal ID.
    // 3. Parse the HTML (e.g., using cheerio) or use an unofficial AnimePahe API if available (like the one from the sandbox link).
    // 4. Extract episode details (AnimePahe episode ID/session, number, title if available).

    // --- Placeholder Logic ---
    // Replace this with your actual implementation.
    const fetchAnimePaheEpisodes = async (id: number): Promise<AnimepaheEpisode[]> => {
        // Example: Simulate fetching based on MAL ID
        console.warn(`[API/animepahe/episodes] Placeholder: Simulating fetch for MAL ID ${id}. Implement actual fetching logic.`);
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

        // Return dummy data matching the AnimepaheEpisode structure
        // Use MAL ID in session ID for dummy data uniqueness
        if (id === 5114) { // Example: FMA:B
            return Array.from({ length: 64 }, (_, i) => ({
                id: `session_${id}_${i + 1}`, // AnimePahe episode session ID
                number: i + 1,
                title: `Episode ${i + 1}`, // AnimePahe often doesn't have titles
                thumbnail: null, // Placeholder
                duration: 1440, // Placeholder (24 mins)
                isFiller: false,
            }));
        } else if (id === 16498) { // Example AOT
             return Array.from({ length: 25 }, (_, i) => ({
                 id: `session_${id}_${i + 1}`,
                 number: i + 1,
                 title: null,
                 thumbnail: null,
                 duration: 1440,
                 isFiller: false,
             }));
        } else if (id === 30276) { // Example: One Punch Man
            return Array.from({ length: 12 }, (_, i) => ({
                id: `session_${id}_${i + 1}`,
                number: i + 1,
                title: `Episode ${i + 1}`,
                thumbnail: null,
                duration: 1440,
                isFiller: false,
            }));
        } else if (id === 40748) { // Example: Jujutsu Kaisen
             return Array.from({ length: 24 }, (_, i) => ({
                id: `session_${id}_${i + 1}`,
                number: i + 1,
                title: `Episode ${i + 1}`,
                thumbnail: null,
                duration: 1440,
                isFiller: false,
            }));
        }
        // Default empty for other IDs in placeholder - THIS WILL CAUSE 404 in the frontend service
        console.warn(`[API/animepahe/episodes] Placeholder does not have data for MAL ID ${id}. Returning empty array.`);
        return [];
    };
    // --- End Placeholder Logic ---


    try {
        const episodes = await fetchAnimePaheEpisodes(numericMalId);

        if (!Array.isArray(episodes)) {
             console.error(`[API/animepahe/episodes] Fetch function for MAL ID ${numericMalId} did not return an array.`);
             // Ensure an array is returned even on internal error
             return NextResponse.json({ message: 'Internal error fetching episode data.' }, { status: 500 });
        }


        if (episodes.length === 0) {
             console.warn(`[API/animepahe/episodes] No episodes found for MAL ID: ${numericMalId}. Returning 404.`);
             // Explicitly return 404 if the placeholder (or real logic) finds nothing
             return NextResponse.json({ message: 'No episodes found for this anime on AnimePahe.' }, { status: 404 });
        }

        console.log(`[API/animepahe/episodes] Successfully fetched ${episodes.length} episodes for MAL ID: ${numericMalId}`);
        return NextResponse.json(episodes); // Return the array directly

    } catch (error: any) {
        console.error(`[API/animepahe/episodes] Error fetching episodes for MAL ID ${numericMalId}:`, error);
        return NextResponse.json({ message: 'Error fetching episodes from source', error: error.message }, { status: 500 });
    }
}
